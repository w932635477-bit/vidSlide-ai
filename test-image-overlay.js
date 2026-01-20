/**
 * 测试图片叠加功能
 */

import ServerVideoCompositionService from './vidslide-ai/src/services/ServerVideoCompositionService.js';
import fs from 'fs';
import path from 'path';

async function testImageOverlay() {
  console.log('🧪 测试图片叠加功能\n');

  const compositionService = new ServerVideoCompositionService();

  // 1. 检查测试视频
  const testVideo = '/Users/weilei/VidSlide AI/output/merged_1768909526500.mp4';
  if (!fs.existsSync(testVideo)) {
    console.error('❌ 测试视频不存在:', testVideo);
    return;
  }
  console.log('✅ 测试视频存在:', testVideo);

  // 2. 查找可用的测试图片
  console.log('\n📝 查找测试图片...');
  const compositionUnitsDir = path.join(process.cwd(), 'cache', 'composition-units');

  if (!fs.existsSync(compositionUnitsDir)) {
    console.error('❌ 组合单元目录不存在:', compositionUnitsDir);
    return;
  }

  const availableImages = fs.readdirSync(compositionUnitsDir)
    .filter(f => f.endsWith('.png') || f.endsWith('.jpg'))
    .map(f => path.join(compositionUnitsDir, f));

  if (availableImages.length === 0) {
    console.error('❌ 没有可用的测试图片');
    return;
  }

  console.log(`✅ 找到 ${availableImages.length} 张可用图片`);
  console.log('  - 使用图片:', availableImages[0]);

  // 3. 测试图片叠加
  console.log('\n🎬 开始测试图片叠加...');

  const images = [
    {
      path: availableImages[0],
      position: { x: 100, y: 500 },
      width: 280,
      height: 280,
      startTime: 0,
      endTime: 5
    },
    {
      path: availableImages[Math.min(1, availableImages.length - 1)],
      position: { x: 700, y: 500 },
      width: 280,
      height: 280,
      startTime: 5,
      endTime: 10
    }
  ];

  try {
    const result = await compositionService.overlayImages(testVideo, images);
    console.log('\n✅ 图片叠加测试成功!');
    console.log('  - 输出视频:', result);

    // 检查输出文件
    if (fs.existsSync(result)) {
      const stats = fs.statSync(result);
      console.log('  - 文件大小:', (stats.size / 1024 / 1024).toFixed(2), 'MB');
    }

  } catch (error) {
    console.error('\n❌ 图片叠加测试失败:', error);
  }

  console.log('\n✅ 测试完成!');
}

// 运行测试
testImageOverlay().catch(console.error);
