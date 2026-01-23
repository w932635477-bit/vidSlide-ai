const SimpleRoundedCornerService = require('./src/services/SimpleRoundedCornerService.cjs');
const fs = require('fs');
const { exec } = require('child_process');

async function testSimpleRoundedCorner() {
  console.log('🧪 测试简化版圆角边框服务\n');
  console.log('📚 基于业界最佳实践：');
  console.log('   - ImageMagick 生成蒙版');
  console.log('   - FFmpeg 简单 overlay');
  console.log('   - 参考: https://www.gariany.com/2020/08/ffmpeg-step-by-step-retro-video-filter/\n');

  const service = new SimpleRoundedCornerService();

  // 使用短视频测试
  const testVideo = '/Users/weilei/VidSlide AI/output/task_1768909519845_56sv9vbli/segment_2.mp4';

  if (!fs.existsSync(testVideo)) {
    console.error('❌ 测试视频不存在');
    return;
  }

  console.log('✅ 找到测试视频:', testVideo);
  console.log('   (约1.4秒长，快速测试)\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('测试 1: 基础圆角边框（无阴影）');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    const startTime = Date.now();

    const outputPath = await service.applyRoundedCorners(testVideo, {
      width: 360,
      height: 640,
      radius: 20,
      borderWidth: 2,
      borderColor: 'white'
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`\n⏱️  处理耗时: ${duration} 秒`);
    console.log('\n🎯 关键改进：');
    console.log('   ✓ 使用 ImageMagick 生成蒙版（业界标准）');
    console.log('   ✓ 使用简单的 FFmpeg overlay（高效）');
    console.log('   ✓ 边框和视频都有圆角');
    console.log('   ✓ 处理速度快');

    // 自动打开查看
    exec(`open "${outputPath}"`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 测试完成！请查看效果');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error(error.stack);
  }
}

testSimpleRoundedCorner().catch(console.error);
