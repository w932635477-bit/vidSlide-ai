/**
 * 调试场景生成 - 查看实际的场景时间
 */

import dotenv from 'dotenv';
dotenv.config();

import ContentAnalyst from './src/agents/executors/ContentAnalyst.js';
import LocalKeywordExtractorV2 from './src/services/LocalKeywordExtractorV2.js';
import MultiLayerTimelineManager from './src/core/TimelineEventSystem.js';

async function debugScenes() {
  const videoPath = '/Users/weilei/Desktop/测试视频2.mp4';

  const analyst = new ContentAnalyst();
  const localExtractor = new LocalKeywordExtractorV2();
  const timelineManager = new MultiLayerTimelineManager();

  // 1. 语音识别
  const task_1_1 = await analyst.speechToText({ videoPath });

  // 2. 关键词提取
  const extractResult = await localExtractor.extractFromVideo(videoPath, task_1_1.transcript, {
    topN: 5,
    method: 'both'
  });
  const keywords = localExtractor.formatForSystem(extractResult.keywords);

  // 3. 生成场景
  timelineManager.createEventsFromKeywords(keywords);
  const scenes = timelineManager.generateScenes(extractResult.stats.videoDuration);

  // 4. 打印场景详情
  console.log('\n场景列表:');
  console.log('='.repeat(80));
  scenes.forEach((scene, i) => {
    console.log(`场景${i + 1}: ${scene.type}`);
    console.log(`  开始: ${scene.startTime.toFixed(6)}s`);
    console.log(`  结束: ${scene.endTime.toFixed(6)}s`);
    console.log(`  时长: ${scene.duration.toFixed(6)}s`);

    if (i < scenes.length - 1) {
      const next = scenes[i + 1];
      const gap = next.startTime - scene.endTime;
      console.log(`  → 与下一场景间隙: ${gap.toFixed(6)}s ${gap > 0.01 ? '❌ 有间隙!' : '✅'}`);
    }
    console.log('');
  });

  console.log('='.repeat(80));
  console.log(`总时长: ${scenes[scenes.length - 1].endTime.toFixed(6)}s`);
  console.log(`视频时长: ${extractResult.stats.videoDuration.toFixed(6)}s`);
}

debugScenes();
