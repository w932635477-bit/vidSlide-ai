const RoundedCornerService = require('./src/services/RoundedCornerService.cjs');
const fs = require('fs');

async function simpleTest() {
  console.log('🧪 简化圆角边框测试（无阴影）\n');

  const service = new RoundedCornerService();

  const testVideo = '/Users/weilei/VidSlide AI/output/task_1768909519845_56sv9vbli/segment_2.mp4';

  if (!fs.existsSync(testVideo)) {
    console.error('❌ 测试视频不存在');
    return;
  }

  console.log('✅ 找到测试视频:', testVideo, '\n');

  try {
    const outputPath = await service.applyRoundedCornersToVideo(testVideo, 20, {
      width: 360,
      height: 640,
      borderWidth: 2,
      borderColor: 'white',
      shadow: { enabled: false },  // 不加阴影，加快处理速度
      useVP9: false
    });

    console.log('\n✅ 测试完成！');
    console.log('📁 输出文件:', outputPath);

    const stats = fs.statSync(outputPath);
    console.log('📊 文件大小:', (stats.size / 1024).toFixed(2), 'KB');

    // 自动打开查看
    const { exec } = require('child_process');
    exec(`open "${outputPath}"`);

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
  }
}

simpleTest().catch(console.error);
