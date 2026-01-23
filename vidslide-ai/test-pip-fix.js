/**
 * 测试修复后的画中画效果
 *
 * 正确的画中画效果：
 * - 背景：AI生成的卡片内容（全屏）
 * - 画中画：从原视频提取的人脸视频（中央或右上角）
 */

import ServerVideoCompositionService from './src/services/ServerVideoCompositionService.js';
import FaceVideoExtractorServiceV2 from './src/services/FaceVideoExtractorServiceV2.js';
import BackgroundImageService from './src/services/BackgroundImageService.js';
import path from 'path';
import fs from 'fs';

async function testPIPFix() {
  console.log('🧪 测试修复后的画中画效果\n');

  const compositionService = new ServerVideoCompositionService();
  const faceExtractor = new FaceVideoExtractorServiceV2();
  const backgroundService = new BackgroundImageService();

  // 测试视频路径（需要替换为实际视频）
  const testVideoPath = process.argv[2] || './test-video.mp4';

  if (!fs.existsSync(testVideoPath)) {
    console.error('❌ 测试视频不存在:', testVideoPath);
    console.log('💡 用法: node test-pip-fix.js <视频路径>');
    process.exit(1);
  }

  console.log('📹 测试视频:', testVideoPath);
  console.log('');

  try {
    // 步骤 1: 提取人脸视频（画中画）
    console.log('1️⃣ 提取人脸视频（画中画）...');
    const faceVideo = await faceExtractor.extractVerticalFaceVideo(
      testVideoPath,
      null, // 使用中心裁剪
      'douyin'
    );
    console.log('✅ 人脸视频提取成功:', faceVideo);
    console.log('');

    // 步骤 2: 使用真实的科技背景图
    console.log('2️⃣ 使用科技背景图...');
    const testCardPath = await backgroundService.cropToVertical();
    console.log('✅ 科技背景图裁剪完成:', testCardPath);
    console.log('');

    // 步骤 3: 从卡片创建视频
    console.log('3️⃣ 从背景图创建视频...');
    const cardVideo = await compositionService.createVideoFromImage(testCardPath, 10);
    console.log('✅ 背景视频创建成功:', cardVideo);
    console.log('');

    // 步骤 4: 测试底部位置的画中画（理想效果）
    console.log('4️⃣ 测试底部位置的画中画（理想效果 + 圆角）...');
    const videoBottomPIP = await compositionService.overlayFaceVideoPIP(
      cardVideo,
      faceVideo,
      'douyin',
      'bottom'  // 底部位置，符合抖音习惯
    );
    console.log('✅ 底部画中画视频:', videoBottomPIP);
    console.log('');

    // 步骤 5: 添加音频
    console.log('5️⃣ 添加原视频音频...');
    const finalVideoBottomPIP = await compositionService.addAudioFromVideo(
      videoBottomPIP,
      testVideoPath
    );
    console.log('✅ 音频添加完成');
    console.log('');

    // 步骤 6: 压缩视频
    console.log('6️⃣ 压缩视频...');
    const compressedBottomPIP = await compositionService.compressVideo(
      finalVideoBottomPIP,
      'douyin'
    );
    console.log('✅ 视频压缩完成');
    console.log('');

    // 测试结果
    console.log('🎉 测试完成！\n');
    console.log('📊 测试结果:');
    console.log('  - 最终视频:', compressedBottomPIP);
    console.log('');
    console.log('✅ 画中画效果优化：');
    console.log('  - 背景：科技背景图（真实图片，1080x1920）');
    console.log('  - 画中画：人脸视频（360x640，更大更清晰）');
    console.log('  - 位置：底部中央（符合抖音习惯）');
    console.log('  - 样式：圆角 (20px) + 白色边框 (4px)');
    console.log('');

    // 清理临时文件
    if (fs.existsSync(testCardPath)) {
      fs.unlinkSync(testCardPath);
    }

  } catch (error) {
    console.error('❌ 测试失败:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// 运行测试
testPIPFix().catch(error => {
  console.error('❌ 测试失败:', error);
  process.exit(1);
});
