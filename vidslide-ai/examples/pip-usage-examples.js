/**
 * 画中画效果使用示例
 *
 * 演示如何使用修复后的画中画功能
 */

import ServerVideoCompositionService from './src/services/ServerVideoCompositionService.js';
import path from 'path';

async function example1_BasicPIP() {
  console.log('📝 示例 1: 基础画中画效果\n');

  const compositionService = new ServerVideoCompositionService();

  // 准备数据
  const videoPath = './test-video.mp4';
  const scenes = [
    { id: 1, startTime: 0, endTime: 10, type: 'video-with-card' }
  ];
  const images = [
    {
      path: './card-image.png',
      startTime: 0,
      endTime: 10,
      fullscreen: true  // 关键：设置为全屏
    }
  ];

  // 合成视频（自动包含人脸画中画）
  const finalVideo = await compositionService.composeWithFullscreenImages(
    videoPath,
    scenes,
    images,
    'douyin'
  );

  console.log('✅ 视频生成完成:', finalVideo);
  console.log('   - 背景: AI卡片（全屏）');
  console.log('   - 画中画: 人脸视频（中央位置）');
}

async function example2_CustomPosition() {
  console.log('\n📝 示例 2: 自定义画中画位置\n');

  const compositionService = new ServerVideoCompositionService();

  // 步骤 1: 提取人脸视频
  const faceVideo = await compositionService.faceExtractorV2.extractVerticalFaceVideo(
    './test-video.mp4',
    null,
    'douyin'
  );

  // 步骤 2: 创建卡片视频
  const cardVideo = await compositionService.createVideoFromImage(
    './card-image.png',
    10
  );

  // 步骤 3: 叠加人脸视频（右上角位置）
  const videoWithPIP = await compositionService.overlayFaceVideoPIP(
    cardVideo,
    faceVideo,
    'douyin',
    'topRight'  // 使用右上角位置
  );

  // 步骤 4: 添加音频
  const videoWithAudio = await compositionService.addAudioFromVideo(
    videoWithPIP,
    './test-video.mp4'
  );

  // 步骤 5: 压缩
  const finalVideo = await compositionService.compressVideo(
    videoWithAudio,
    'douyin'
  );

  console.log('✅ 视频生成完成:', finalVideo);
  console.log('   - 背景: AI卡片（全屏）');
  console.log('   - 画中画: 人脸视频（右上角位置）');
}

async function example3_MultipleCards() {
  console.log('\n📝 示例 3: 多张卡片 + 画中画\n');

  const compositionService = new ServerVideoCompositionService();

  const videoPath = './test-video.mp4';
  const scenes = [
    { id: 1, startTime: 0, endTime: 5, type: 'video-with-card' },
    { id: 2, startTime: 5, endTime: 10, type: 'video-with-card' }
  ];
  const images = [
    {
      path: './card-1.png',
      startTime: 0,
      endTime: 5,
      fullscreen: true
    },
    {
      path: './card-2.png',
      startTime: 5,
      endTime: 10,
      fullscreen: true
    }
  ];

  // 合成视频（自动处理多张卡片和人脸画中画）
  const finalVideo = await compositionService.composeWithFullscreenImages(
    videoPath,
    scenes,
    images,
    'douyin'
  );

  console.log('✅ 视频生成完成:', finalVideo);
  console.log('   - 背景: 2张AI卡片（依次显示）');
  console.log('   - 画中画: 人脸视频（贯穿全程）');
}

async function example4_WithVideoEngineer() {
  console.log('\n📝 示例 4: 使用 VideoEngineer 智能体\n');

  const VideoEngineer = (await import('./src/agents/executors/VideoEngineer.js')).default;

  const videoEngineer = new VideoEngineer();

  // 准备输入数据
  const input = {
    videoPath: './test-video.mp4',
    task_2_1: {
      scenes: [
        { id: 1, startTime: 0, endTime: 10, type: 'video-with-card' }
      ]
    },
    task_3_1: {
      materials: [
        {
          sceneId: 1,
          keyword: '测试',
          material: { path: './card-image.png' }
        }
      ]
    },
    task_3_2: { cards: [] },
    task_3_3: { backgrounds: [] },
    task_3_4: { faceVideo: null }
  };

  // 合成视频
  const result = await videoEngineer.composeVideo(input);

  console.log('✅ 视频生成完成:', result.finalVideo);
  console.log('   - 耗时:', (result.performance.duration / 1000).toFixed(2), '秒');
  console.log('   - 文件大小:', (result.performance.fileSize / 1024 / 1024).toFixed(2), 'MB');
}

// 运行示例
async function runExamples() {
  console.log('🎬 画中画效果使用示例\n');
  console.log('=' .repeat(50));

  try {
    // 取消注释以运行不同的示例
    // await example1_BasicPIP();
    // await example2_CustomPosition();
    // await example3_MultipleCards();
    // await example4_WithVideoEngineer();

    console.log('\n💡 提示: 取消注释上面的示例代码来运行不同的示例');

  } catch (error) {
    console.error('❌ 示例运行失败:', error);
  }
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  runExamples();
}

export {
  example1_BasicPIP,
  example2_CustomPosition,
  example3_MultipleCards,
  example4_WithVideoEngineer
};
