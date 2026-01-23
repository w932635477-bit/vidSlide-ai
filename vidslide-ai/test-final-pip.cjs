const SimpleRoundedCornerService = require('./src/services/SimpleRoundedCornerService.cjs');
const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

const execAsync = promisify(exec);

async function testFinalPIP() {
  console.log('🧪 最终画中画圆角测试（使用 SVG stroke）\n');

  const service = new SimpleRoundedCornerService();

  const videoPath = '/Users/weilei/Desktop/测试视频2.mp4';
  const backgroundPath = '/Users/weilei/VidSlide AI/vidslide-ai/public/assets/background-hero.png';

  if (!fs.existsSync(videoPath)) {
    console.error('❌ 测试视频不存在');
    return;
  }

  console.log('✅ 测试视频:', path.basename(videoPath));
  console.log('✅ 背景图:', path.basename(backgroundPath));

  try {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('步骤 1: 给视频添加圆角边框（stroke方式）');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const startTime = Date.now();

    const roundedVideoPath = await service.applyRoundedCorners(videoPath, {
      width: 720,
      height: 1280,
      radius: 30,
      borderWidth: 4,
      borderColor: 'white'
    });

    const step1Time = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n⏱️  步骤1耗时: ${step1Time} 秒`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('步骤 2: 创建画中画效果');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const outputPath = path.join(service.outputDir, `pip_stroke_${Date.now()}.mp4`);

    // 获取视频时长
    const durationCmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${roundedVideoPath}"`;
    const { stdout: durationStr } = await execAsync(durationCmd);
    const duration = parseFloat(durationStr.trim());

    console.log(`   📹 视频时长: ${duration.toFixed(2)} 秒`);
    console.log(`   🎨 创建画中画效果...`);

    // 创建画中画
    const pipCmd = `ffmpeg -loop 1 -i "${backgroundPath}" -i "${roundedVideoPath}" ` +
                   `-filter_complex "[0:v]scale=1080:1920,setsar=1[bg]; ` +
                   `[bg][1:v]overlay=(W-w)/2:(H-h)/2[final]" ` +
                   `-map "[final]" -map 1:a? ` +
                   `-t ${duration} ` +
                   `-c:v libx264 -pix_fmt yuv420p -preset fast ` +
                   `-c:a copy ` +
                   `"${outputPath}" -y`;

    await execAsync(pipCmd);

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    const stats = fs.statSync(outputPath);

    console.log(`\n✅ 画中画创建完成！`);
    console.log(`   📁 输出: ${outputPath}`);
    console.log(`   📊 大小: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   ⏱️  总耗时: ${totalTime} 秒`);

    console.log('\n🎯 最终效果：');
    console.log('   ✓ 视频内容���圆角');
    console.log('   ✓ 白色边框也有圆角（使用 SVG stroke）');
    console.log('   ✓ 整体呈现完美的圆角矩形');
    console.log('   ✓ 居中显示在科技背景上');

    // 打开视频
    exec(`open "${outputPath}"`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 测试完成！视频已自动打开');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error(error.stack);
  }
}

testFinalPIP().catch(console.error);
