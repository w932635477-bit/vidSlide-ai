const path = require('path');
const fs = require('fs');

/**
 * 画中画效果完整测试
 * 使用桌面上的测试视频2.mp4
 */

async function testPIPEffect() {
  console.log('🎬 开始画中画效果测试\n');

  // 动态导入 ServerVideoCompositionService
  const { default: ServerVideoCompositionService } = await import('./src/services/ServerVideoCompositionService.js');

  const service = new ServerVideoCompositionService();

  // 测试视频路径
  const testVideoPath = path.join(process.env.HOME, 'Desktop', '测试视频2.mp4');

  if (!fs.existsSync(testVideoPath)) {
    console.error('❌ 未找到测试视频:', testVideoPath);
    return;
  }

  console.log(`✅ 找到测试视频: ${testVideoPath}`);

  // 获取视频信息
  const stats = fs.statSync(testVideoPath);
  console.log(`📊 视频大小: ${(stats.size / 1024 / 1024).toFixed(2)} MB\n`);

  // 测试：画中画效果（抖音风格，底部位置）
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('测试：画中画效果（抖音风格，底部位置）');
  console.log('配置：');
  console.log('  - 圆角半径: 20px');
  console.log('  - 边框宽度: 4px');
  console.log('  - 边框颜色: 白色');
  console.log('  - 阴影效果: 启用');
  console.log('  - 位置: 底部居中');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // 由于我们需要两个视频（背景和人脸），这里我们先测试圆角效果
    // 然后手动创建一个简单的画中画合成

    const RoundedCornerService = require('./src/services/RoundedCornerService.cjs');
    const roundedService = new RoundedCornerService();

    console.log('步骤1: 对测试视频应用圆角效果...');
    const roundedVideoPath = await roundedService.applyRoundedCornersToVideo(
      testVideoPath,
      20,
      {
        width: 360,
        height: 640,
        borderWidth: 4,
        borderColor: 'white',
        shadow: {
          enabled: true,
          offsetX: 2,
          offsetY: 6,
          blur: 4,
          opacity: 0.3
        },
        useVP9: true
      }
    );

    console.log(`\n✅ 圆角视频生成成功: ${roundedVideoPath}\n`);

    // 步骤2: 创建一个简单的背景（纯色或使用同一视频的缩放版本）
    console.log('步骤2: 创建画中画合成效果...');

    const outputPath = path.join(__dirname, 'output', `pip_demo_${Date.now()}.mp4`);

    // 使用FFmpeg创建画中画效果：
    // - 背景：原视频缩放到1080x1920
    // - 前景：圆角视频叠加在底部
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    const cmd = `ffmpeg -i "${testVideoPath}" -i "${roundedVideoPath}" \
      -filter_complex "\
        [0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,gblur=sigma=20[bg]; \
        [bg][1:v]overlay=(W-w)/2:H-h-40:format=auto[final]" \
      -map "[final]" -map 0:a? -c:v libx264 -preset fast -crf 23 -c:a copy \
      -t 10 \
      "${outputPath}" -y`;

    console.log('正在合成画中画视频（取前10秒）...\n');

    await execAsync(cmd);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 画中画效果测试成功！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n生成的文件:`);
    console.log(`  1. 圆角视频: ${roundedVideoPath}`);
    console.log(`  2. 画中画视频: ${outputPath}\n`);

    // 显示统计信息
    const stats = roundedService.getStats();
    console.log(`📊 服务统计信息:`);
    console.log(`  - 蒙版缓存: ${stats.maskCache.fileCount} 个文件 (${stats.maskCache.totalSizeMB} MB)`);
    console.log(`  - 输出目录: ${stats.outputDir}\n`);

    // 自动打开视频
    console.log('正在打开画中画视频...\n');
    exec(`open "${outputPath}"`);

  } catch (error) {
    console.error(`\n❌ 测试失败: ${error.message}`);
    console.error(error.stack);
  }
}

// 运行测试
testPIPEffect().catch(error => {
  console.error('❌ 测试失败:', error);
  process.exit(1);
});
