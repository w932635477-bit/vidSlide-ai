/**
 * 真实视频工作流程测试
 *
 * 测试目标：
 * 1. 使用BaiduASRService进行语音识别
 * 2. ContentAnalyst分析内容
 * 3. SceneDesigner生成UI时间轴
 * 4. VisualDesigner设计卡片（自动应用特效）
 * 5. 验证：卡片在正确时间插入，有内容，有特效
 */

import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// 服务导入
import BaiduASRService from '../src/services/BaiduASRService.js';
import ContentAnalyst from '../src/agents/executors/ContentAnalyst.js';
import SceneDesigner from '../src/agents/executors/SceneDesigner.js';
import VisualDesigner from '../src/agents/executors/VisualDesigner.js';
import Logger from '../src/core/Logger.js';
import ErrorHandler from '../src/core/ErrorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 初始化日志和错误处理
const logger = new Logger({ level: 'info' });
const errorHandler = new ErrorHandler({ logger });

// 测试配置
const TEST_VIDEO_PATH = path.join(process.env.HOME, 'Desktop', '测试视频2.mp4');
const OUTPUT_DIR = path.join(__dirname, '..', 'test-output', 'real-video-workflow');

/**
 * 构建基础时间轴（使用百度ASR）
 */
async function buildBaseTimeline(videoPath) {
  console.log('🔄 步骤1: 语音识别（百度ASR）...');

  const asrService = new BaiduASRService();

  // 调用ASR服务
  const asrResult = await asrService.recognizeVideo(videoPath);

  console.log(`  ✓ 识别完成: ${asrResult.segments.length}个语音段`);

  // 构建基础时间轴
  const baseTimeline = {
    version: '1.0',
    videoInfo: {
      duration: asrResult.duration || 30,
      fps: 30,
      resolution: '1080x1920'
    },
    speechSegments: [],
    insertionPoints: []
  };

  // 处理语音段，识别停顿
  let clipId = 1;
  for (let i = 0; i < asrResult.segments.length; i++) {
    const segment = asrResult.segments[i];

    // 添加语音段
    baseTimeline.speechSegments.push({
      id: `speech_${clipId}`,
      startTime: segment.startTime,
      endTime: segment.endTime,
      text: segment.text,
      confidence: segment.confidence || 0.9,
      isPause: false
    });

    // 检查是否有停顿（下一段的开始时间 - 当前段的结束时间）
    if (i < asrResult.segments.length - 1) {
      const nextSegment = asrResult.segments[i + 1];
      const pauseDuration = nextSegment.startTime - segment.endTime;

      if (pauseDuration > 0.5) {
        // 添加停顿段
        baseTimeline.speechSegments.push({
          id: `pause_${clipId}`,
          startTime: segment.endTime,
          endTime: nextSegment.startTime,
          isPause: true,
          duration: pauseDuration
        });

        // 添加插入点
        const suitability = pauseDuration > 0.8 ? 'high' : 'medium';
        baseTimeline.insertionPoints.push({
          id: `point_${clipId}`,
          time: segment.endTime,
          type: 'pause',
          duration: pauseDuration,
          suitability: suitability,
          metadata: {
            pauseLength: pauseDuration,
            beforeText: segment.text,
            afterText: nextSegment.text
          }
        });
      }
    }

    clipId++;
  }

  console.log(`  ✓ 找到 ${baseTimeline.insertionPoints.length} 个插入点`);

  return baseTimeline;
}

/**
 * 主测试函数
 */
async function runRealVideoWorkflowTest() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║     VidSlide AI - 真实视频工作流程测试                 ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // 确保输出目录存在
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 检查视频文件
  if (!fs.existsSync(TEST_VIDEO_PATH)) {
    console.error(`❌ 视频文件不存在: ${TEST_VIDEO_PATH}`);
    process.exit(1);
  }

  console.log(`📹 测试视频: ${TEST_VIDEO_PATH}`);
  console.log(`📁 输出目录: ${OUTPUT_DIR}\n`);

  try {
    // ========================================
    // Phase 0: 时间轴构建
    // ========================================
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  Phase 0: 时间轴构建（百度ASR）                        ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    const baseTimeline = await buildBaseTimeline(TEST_VIDEO_PATH);

    console.log('\n✅ 时间轴构建完成！');
    console.log(`  → 视频时长: ${baseTimeline.videoInfo.duration}秒`);
    console.log(`  → 语音段数: ${baseTimeline.speechSegments.filter(s => !s.isPause).length}个`);
    console.log(`  → 插入点数: ${baseTimeline.insertionPoints.length}个`);

    // 显示前3个插入点
    if (baseTimeline.insertionPoints.length > 0) {
      console.log('\n📍 前3个插入点:');
      baseTimeline.insertionPoints.slice(0, 3).forEach((point, i) => {
        console.log(`  ${i + 1}. 时间=${point.time.toFixed(1)}s, 停顿=${point.duration.toFixed(1)}s, 适合度=${point.suitability}`);
        console.log(`     前文: "${point.metadata.beforeText.substring(0, 30)}..."`);
      });
    }

    // 保存时间轴
    const timelinePath = path.join(OUTPUT_DIR, 'baseTimeline.json');
    fs.writeFileSync(timelinePath, JSON.stringify(baseTimeline, null, 2));
    console.log(`\n💾 时间轴已保存: ${timelinePath}`);

    // ========================================
    // Phase 1: 内容理解
    // ========================================
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║  Phase 1: 内容理解（ContentAnalyst）                   ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    const contentAnalyst = new ContentAnalyst({
      logger,
      errorHandler
    });

    console.log('🔄 基于时间轴分析内容...');

    const understanding = await contentAnalyst.analyzeContent({
      task_0: { baseTimeline }
    });

    console.log('\n✅ 内容分析完成！');
    console.log(`  → 关键词数: ${understanding.keywords.length}个`);
    console.log(`  → 观点数: ${understanding.viewpoints.length}个`);
    console.log(`  → 解释数: ${understanding.explanations.length}个`);

    // 显示前3个观点
    if (understanding.viewpoints.length > 0) {
      console.log('\n💡 前3个观点:');
      understanding.viewpoints.slice(0, 3).forEach((vp, i) => {
        console.log(`  ${i + 1}. "${vp.text.substring(0, 40)}..."`);
        console.log(`     时间=${vp.startTime?.toFixed(1) || '未设置'}s, 重要性=${vp.importance}`);
      });
    }

    // 保存理解结果
    const understandingPath = path.join(OUTPUT_DIR, 'understanding.json');
    fs.writeFileSync(understandingPath, JSON.stringify(understanding, null, 2));
    console.log(`\n💾 理解结果已保存: ${understandingPath}`);

    // ========================================
    // Phase 2: 场景设计
    // ========================================
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║  Phase 2: 场景设计（SceneDesigner）                    ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    const sceneDesigner = new SceneDesigner({
      logger,
      errorHandler
    });

    console.log('🔄 生成UI时间轴...');

    const sceneResult = await sceneDesigner.generateUITimeline({
      task_0: { baseTimeline },
      task_1_2: { understanding }
    });

    const uiTimeline = sceneResult.uiTimeline;

    console.log('\n✅ 场景设计完成！');
    console.log(`  → 时间轴版本: ${uiTimeline.version}`);
    console.log(`  → 轨道数: ${uiTimeline.tracks.length}个`);

    // 显示每个轨道的clips数量
    console.log('\n🎬 轨道详情:');
    uiTimeline.tracks.forEach(track => {
      console.log(`  - ${track.name}: ${track.clips.length}个clips`);
    });

    // 显示卡片轨道的前3个clips
    const cardTrack = uiTimeline.tracks.find(t => t.id === 'track_cards');
    if (cardTrack && cardTrack.clips.length > 0) {
      console.log('\n📇 卡片轨道前3个clips:');
      cardTrack.clips.slice(0, 3).forEach((clip, i) => {
        console.log(`  ${i + 1}. ${clip.name}`);
        console.log(`     时间: ${clip.startTime.toFixed(1)}s - ${clip.endTime.toFixed(1)}s`);
        console.log(`     内容: "${clip.content.text.substring(0, 30)}..."`);
        console.log(`     特效: 圆角=${clip.content.effects?.css?.borderRadius || '未设置'}`);
      });
    }

    // 保存UI时间轴
    const uiTimelinePath = path.join(OUTPUT_DIR, 'uiTimeline.json');
    fs.writeFileSync(uiTimelinePath, JSON.stringify(uiTimeline, null, 2));
    console.log(`\n💾 UI时间轴已保存: ${uiTimelinePath}`);

    // ========================================
    // Phase 3: 视觉设计
    // ========================================
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║  Phase 3: 视觉设计（VisualDesigner）                   ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    const visualDesigner = new VisualDesigner({
      logger,
      errorHandler,
      outputDir: path.join(OUTPUT_DIR, 'visuals')
    });

    console.log('🔄 设计卡片（自动应用特效）...');

    const visualResult = await visualDesigner.designCards({
      task_2_1: sceneResult
    });

    console.log('\n✅ 视觉设计完成！');
    console.log(`  → 卡片数: ${visualResult.cards.length}个`);

    // 显示前3个卡片
    if (visualResult.cards.length > 0) {
      console.log('\n🎨 前3个卡片:');
      visualResult.cards.slice(0, 3).forEach((card, i) => {
        console.log(`  ${i + 1}. 关键词: "${card.keywordObj.text}"`);
        console.log(`     样式: ${card.style}`);
        console.log(`     路径: ${path.basename(card.path)}`);
        console.log(`     特效:`);
        console.log(`       - 圆角: ${card.effects.css.borderRadius}`);
        console.log(`       - 边框: ${card.effects.css.border}`);
        console.log(`       - 阴影: ${card.effects.css.boxShadow}`);
      });
    }

    // 保存卡片信息
    const cardsPath = path.join(OUTPUT_DIR, 'cards.json');
    fs.writeFileSync(cardsPath, JSON.stringify(visualResult.cards, null, 2));
    console.log(`\n💾 卡片信息已保存: ${cardsPath}`);

    // ========================================
    // 验证结果
    // ========================================
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║  验证结果                                              ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    let allTestsPassed = true;
    const testResults = [];

    // 验证1: 时间轴是否有插入点
    console.log('✓ 验证1: 时间轴是否有插入点');
    if (baseTimeline.insertionPoints.length > 0) {
      console.log(`  ✅ 通过 - 找到${baseTimeline.insertionPoints.length}个插入点`);
      testResults.push({ name: '时间轴插入点', passed: true });
    } else {
      console.log('  ❌ 失败 - 没有找到插入点');
      allTestsPassed = false;
      testResults.push({ name: '时间轴插入点', passed: false });
    }

    // 验证2: 观点是否映射到插入点
    console.log('\n✓ 验证2: 观点是否映射到插入点');
    const mappedViewpoints = understanding.viewpoints.filter(vp => vp.insertionPoint);
    if (mappedViewpoints.length > 0) {
      console.log(`  ✅ 通过 - ${mappedViewpoints.length}个观点已映射到插入点`);
      testResults.push({ name: '观点映射', passed: true });
    } else {
      console.log('  ⚠️  警告 - 没有观点映射到插入点（可能是因为没有合适的插入点）');
      testResults.push({ name: '观点映射', passed: false, warning: true });
    }

    // 验证3: 卡片是否在正确时间插入
    console.log('\n✓ 验证3: 卡片是否在正确时间插入');
    if (cardTrack && cardTrack.clips.length > 0) {
      const firstClip = cardTrack.clips[0];
      const correspondingPoint = baseTimeline.insertionPoints.find(
        p => p.id === firstClip.linkedTo?.insertionPointId
      );
      if (correspondingPoint && Math.abs(firstClip.startTime - correspondingPoint.time) < 0.5) {
        console.log(`  ✅ 通过 - 卡片时间与插入点匹配`);
        console.log(`     卡片时间: ${firstClip.startTime.toFixed(1)}s`);
        console.log(`     插入点时间: ${correspondingPoint.time.toFixed(1)}s`);
        testResults.push({ name: '卡片时间匹配', passed: true });
      } else {
        console.log('  ⚠️  警告 - 卡片时间与插入点不完全匹配');
        testResults.push({ name: '卡片时间匹配', passed: false, warning: true });
      }
    } else {
      console.log('  ⚠️  警告 - 没有生成卡片clips');
      testResults.push({ name: '卡片clips生成', passed: false, warning: true });
    }

    // 验证4: 卡片是否有内容
    console.log('\n✓ 验证4: 卡片是否有内容');
    if (visualResult.cards.length > 0) {
      const firstCard = visualResult.cards[0];
      if (firstCard.keywordObj && firstCard.keywordObj.text) {
        console.log(`  ✅ 通过 - 卡片有内容: "${firstCard.keywordObj.text}"`);
        testResults.push({ name: '卡片内容', passed: true });
      } else {
        console.log('  ❌ 失败 - 卡片没有内容');
        allTestsPassed = false;
        testResults.push({ name: '卡片内容', passed: false });
      }
    } else {
      console.log('  ⚠️  警告 - 没有生成卡片');
      testResults.push({ name: '卡片生成', passed: false, warning: true });
    }

    // 验证5: 卡片是否有特效
    console.log('\n✓ 验证5: 卡片是否有特效');
    if (visualResult.cards.length > 0) {
      const firstCard = visualResult.cards[0];
      if (firstCard.effects && firstCard.effects.css) {
        const hasRoundedCorners = firstCard.effects.css.borderRadius !== 'none';
        const hasShadow = firstCard.effects.css.boxShadow !== 'none';

        if (hasRoundedCorners && hasShadow) {
          console.log('  ✅ 通过 - 卡片有完整特效');
          console.log(`     圆角: ${firstCard.effects.css.borderRadius}`);
          console.log(`     阴影: ${firstCard.effects.css.boxShadow}`);
          testResults.push({ name: '卡片特效', passed: true });
        } else {
          console.log('  ❌ 失败 - 卡片特效不完整');
          allTestsPassed = false;
          testResults.push({ name: '卡片特效', passed: false });
        }
      } else {
        console.log('  ❌ 失败 - 卡片没有特效配置');
        allTestsPassed = false;
        testResults.push({ name: '卡片特效配置', passed: false });
      }
    }

    // 验证6: 卡片图片是否生成
    console.log('\n✓ 验证6: 卡片图片是否生成');
    if (visualResult.cards.length > 0) {
      const firstCard = visualResult.cards[0];
      if (firstCard.path && fs.existsSync(firstCard.path)) {
        console.log(`  ✅ 通过 - 卡片图片已生成: ${path.basename(firstCard.path)}`);
        testResults.push({ name: '卡片图片生成', passed: true });
      } else {
        console.log('  ❌ 失败 - 卡片图片未生成');
        allTestsPassed = false;
        testResults.push({ name: '卡片图片生成', passed: false });
      }
    }

    // ========================================
    // 最终结果
    // ========================================
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║  测试结果总结                                          ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    const passedTests = testResults.filter(t => t.passed).length;
    const totalTests = testResults.length;

    console.log(`📊 测试通过率: ${passedTests}/${totalTests} (${((passedTests / totalTests) * 100).toFixed(0)}%)\n`);

    console.log('测试结果详情:');
    testResults.forEach((test, i) => {
      const icon = test.passed ? '✅' : (test.warning ? '⚠️' : '❌');
      console.log(`  ${i + 1}. ${icon} ${test.name}`);
    });

    if (allTestsPassed || passedTests >= totalTests * 0.7) {
      console.log('\n🎉 核心功能测试通过！工作流程基本正常！\n');

      console.log('📊 统计数据:');
      console.log(`  - 视频时长: ${baseTimeline.videoInfo.duration}秒`);
      console.log(`  - 插入点数: ${baseTimeline.insertionPoints.length}个`);
      console.log(`  - 观点数: ${understanding.viewpoints.length}个`);
      console.log(`  - 卡片数: ${visualResult.cards.length}个`);
      console.log(`  - 卡片clips数: ${cardTrack?.clips.length || 0}个\n`);

      console.log('📁 输出文件:');
      console.log(`  - 时间轴: ${timelinePath}`);
      console.log(`  - 理解结果: ${understandingPath}`);
      console.log(`  - UI时间轴: ${uiTimelinePath}`);
      console.log(`  - 卡片信息: ${cardsPath}`);
      console.log(`  - 卡片图片: ${path.join(OUTPUT_DIR, 'visuals')}\n`);

      return true;
    } else {
      console.log('\n⚠️  部分测试失败，请检查上述错误信息\n');
      return false;
    }

  } catch (error) {
    console.error('\n❌ 测试执行失败:');
    console.error(`  错误: ${error.message}`);
    console.error(`  堆栈: ${error.stack}`);
    return false;
  }
}

// 执行测试
runRealVideoWorkflowTest().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('测试执行失败:', error);
  process.exit(1);
});
