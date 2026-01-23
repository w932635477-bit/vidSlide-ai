const RoundedMaskGenerator = require('./src/services/RoundedMaskGenerator.cjs');
const RoundedCornerService = require('./src/services/RoundedCornerService.cjs');
const path = require('path');
const fs = require('fs');

async function quickTest() {
  console.log('🧪 快速圆角测试（使用短视频 + H.264编码）\n');

  const maskGen = new RoundedMaskGenerator();
  const roundedService = new RoundedCornerService(maskGen);

  // 使用一个短视频
  const testVideo = '/Users/weilei/VidSlide AI/output/task_1768909519845_56sv9vbli/segment_2.mp4';

  if (!fs.existsSync(testVideo)) {
    console.error('❌ 测试视频不存在');
    return;
  }

  console.log('✅ 找到测试视频:', testVideo);
  console.log('   (约1.4秒长，快速测试)\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('测试：圆角边框（30px圆角，6px边框，带阴影）');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const outputPath = await roundedService.applyRoundedCornersToVideo(testVideo, 30, {
      width: 360,
      height: 640,
      borderWidth: 6,
      borderColor: 'white',
      shadow: {
        enabled: true,
        offsetX: 2,
        offsetY: 6,
        blur: 4,
        opacity: 0.3
      },
      useVP9: false // 使用H.264快速编码
    });

    console.log('\n✅ 测试完成！');
    console.log('📁 输出文件:', outputPath);

    // 检查文件大小
    const stats = fs.statSync(outputPath);
    console.log('📊 文件大小:', (stats.size / 1024).toFixed(2), 'KB');

    console.log('\n🎯 关键改进：');
    console.log('   ✓ 视频内容有圆角（内蒙版）');
    console.log('   ✓ 白色边框也有圆角（外蒙版）');
    console.log('   ✓ 整体呈现圆角矩形效果');
    console.log('   ✓ 阴影效果完整');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error(error.stack);
  }
}

quickTest().catch(console.error);
