const SimpleRoundedCornerService = require('./src/services/SimpleRoundedCornerService.cjs');
const fs = require('fs');
const { exec } = require('child_process');

async function testStrokeBorder() {
  console.log('🧪 测试圆角边框（使用 SVG stroke）\n');
  console.log('📚 基于 SVG 最佳实践：');
  console.log('   - fill="none" 内部透明');
  console.log('   - stroke="white" 边框颜色');
  console.log('   - 参考: https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorials/SVG_from_scratch/Fills_and_strokes\n');

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
  console.log('测试：圆角边框（stroke方式）');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    const startTime = Date.now();

    const outputPath = await service.applyRoundedCorners(testVideo, {
      width: 360,
      height: 640,
      radius: 20,
      borderWidth: 3,
      borderColor: 'white'
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`\n⏱️  处理耗时: ${duration} 秒`);
    console.log('\n🎯 关键改进：');
    console.log('   ✓ 使用 SVG stroke 创建边框');
    console.log('   ✓ 边框本身也有圆角');
    console.log('   ✓ 视频内容有圆角');
    console.log('   ✓ 整体呈现完美的圆角矩形');

    // 先打开蒙版查看
    const maskPath = service.cacheDir + '/360x640_r20_b3.png';
    if (fs.existsSync(maskPath)) {
      console.log('\n📸 打开蒙版查看边框效果...');
      exec(`open "${maskPath}"`);
    }

    // 然后打开视频
    setTimeout(() => {
      console.log('📹 打开视频查看最终效果...');
      exec(`open "${outputPath}"`);
    }, 1000);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 测试完成！请查看效果');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error(error.stack);
  }
}

testStrokeBorder().catch(console.error);
