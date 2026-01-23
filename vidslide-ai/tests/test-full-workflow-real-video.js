/**
 * 完整工作流程测试 - 使用真实视频
 *
 * 测试目标：
 * 1. Phase 0: TimelineBuilder - 构建精确时间轴
 * 2. Phase 1: ContentAnalyst - 内容分析和映射
 * 3. Phase 2: SceneDesigner - 生成UI时间轴
 * 4. Phase 3: VisualDesigner - 设计卡片（自动应用特效）
 * 5. 验证：卡片在正确时间插入，有内容，有特效
 */

import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// 智能体导入
import TimelineBuilder from '../src/agents/executors/TimelineBuilder.js';
import ContentAnalyst from '../src/agents/executors/ContentAnalyst.js';
import SceneDesigner from '../src/agents/executors/SceneDesigner.js';
import VisualDesigner from '../src/agents/executors/VisualDesigner.js';

// 服务导入
import Logger from '../src/core/Logger.js';
import ErrorHandler from '../src/core/ErrorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 初始化日志和错误处理
const logger = new Logger({ level: 'info' });
const errorHandler = new ErrorHandler({ logger });

// 测试配置
const TEST_VIDEO_PATH = path.join(process.env.HOME, 'Desktop', '测试视频2.mp4');
const OUTPUT_DIR = path.join(__dirname, '..', 'test-output', 'full-workflow');

/**
 * 主测试函数
 */
async function runFullWorkflowTest() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║     VidSlide AI - 完整工作流程测试（真实视频）         ║');
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
    // Phase 0: 时间轴构建（0-10%）
    // ========================================
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  Phase 0: 时间轴构建（TimelineBuilder）                ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    const timelineBuilder = new TimelineBuilder({
      logger,
      errorHandler,
      outputDir: path.join(OUTPUT_DIR, 'timeline')
    });

    console.log('🔄 步骤1: 语音识别（带精确时间戳）...');
    const baseTimeline = await timelineBuilder.buildTimeline({
      videoPath: TEST_VIDEO_PATH
    });

    console.log('\n✅ 时间轴构建完成！');
    console.log(`  → 视频时长: ${baseTimeline.videoInfo.duration}秒`);
    console.log(`  → 语音段数: ${baseTimeline.speechSegments.length}个`);
    console.log(`  → 插入点数: ${baseTimeline.insertionPoints.length}个`);

    // 显示前3个插入点
    console.log('\n📍 前3个插入点:');
    baseTimeline.insertionPoints.slice(0, 3).forEach((point, i) => {
      console.log(`  ${i + 1}. 时间=${point.time}s, 停顿=${point.duration}s, 适合度=${point.suitability}`);
      console.log(`     前文: "${point.metadata.beforeText.substring(0, 30)}..."`);
    });

    // 保存时间轴
    const timelinePath = path.join(OUTPUT_DIR, 'baseTimeline.json');
    fs.writeFileSync(timelinePath, JSON.stringify(baseTimeline, null, 2));
    console.log(`\n💾 时间轴已保存: ${timelinePath}`);

    // ========================================
    // Phase 1: 内容理解（10-20%）
    // ========================================
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║  Phase 1: 内容理解（ContentAnalyst）                   ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    const contentAnalyst = new ContentAnalyst({
      logger,
      errorHandler
    });

    console.log('🔄 步骤1: 基于时间轴提取文本...');
    console.log('🔄 步骤2: 文心一言深度分析...');
    console.log('🔄 步骤3: 映射到时间轴插入点...');

    const understanding = await contentAnalyst.analyzeContent({
      task_0: { baseTimeline }
    });

    console.log('\n✅ 内容分析完成！');
    console.log(`  → 关键词数: ${understanding.keywords.length}个`);
    console.log(`  → 观点数: ${understanding.viewpoints.length}个`);
    console.log(`  → 解释数: ${understanding.explanations.length}个`);

    // 显示前3个观点
    console.log('\n💡 前3个观点:');
    understanding.viewpoints.slice(0, 3).forEach((vp, i) => {
      console.log(`  ${i + 1}. "${vp.text.substring(0, 40)}..."`);
      console.log(`     时间=${vp.startTime}s, 重要性=${vp.importance}`);
    });

    // 保存理解结果
    const understandingPath = path.join(OUTPUT_DIR, 'understanding.json');
    fs.writeFileSync(understandingPath, JSON.stringify(understanding, null, 2));
    console.log(`\n💾 理解结果已保存: ${understandingPath}`);

    // ========================================
    // Phase 2: 场景设计（20-30%）
    // ========================================
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║  Phase 2: 场景设计（SceneDesigner）                    ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    const sceneDesigner = new SceneDesigner({
      logger,
      errorHandler
    });

    console.log('🔄 步骤1: 生成UI时间轴（4个轨道）...');
    console.log('🔄 步骤2: 为每个观点创建clips...');

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
        console.log(`     时间: ${clip.startTime}s - ${clip.endTime}s`);
        console.log(`     内容: "${clip.content.text.substring(0, 30)}..."`);
        console.log(`     特效: 圆角=${clip.content.effects?.css?.borderRadius || '未设置'}`);
      });
    }

    // 保存UI时间轴
    const uiTimelinePath = path.join(OUTPUT_DIR, 'uiTimeline.json');
    fs.writeFileSync(uiTimelinePath, JSON.stringify(uiTimeline, null, 2));
    console.log(`\n💾 UI时间轴已保存: ${uiTimelinePath}`);

    // ========================================
    // Phase 3: 视觉设计（30-60%）
    // ========================================
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║  Phase 3: 视觉设计（VisualDesigner）                   ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    const visualDesigner = new VisualDesigner({
      logger,
      errorHandler,
      outputDir: path.join(OUTPUT_DIR, 'visuals')
    });

    console.log('🔄 步骤1: 设计卡片（自动应用特效）...');

    const visualResult = await visualDesigner.designCards({
      task_2_1: sceneResult
    });

    console.log('\n✅ 视觉设计完成！');
    console.log(`  → 卡片数: ${visualResult.cards.length}个`);

    // 显示前3个卡片
    console.log('\n🎨 前3个卡片:');
    visualResult.cards.slice(0, 3).forEach((card, i) => {
      console.log(`  ${i + 1}. 关键词: "${card.keywordObj.text}"`);
      console.log(`     样式: ${card.style}`);
      console.log(`     路径: ${card.path}`);
      console.log(`     特效:`);
      console.log(`       - 圆角: ${card.effects.css.borderRadius}`);
      console.log(`       - 边框: ${card.effects.css.border}`);
      console.log(`       - 阴影: ${card.effects.css.boxShadow}`);
    });

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

    // 验证1: 时间轴是否有插入点
    console.log('✓ 验证1: 时间轴是否有插入点');
    if (baseTimeline.insertionPoints.length > 0) {
      console.log(`  ✅ 通过 - 找到${baseTimeline.insertionPoints.length}个插入点`);
    } else {
      console.log('  ❌ 失败 - 没有找到插入点');
      allTestsPassed = false;
    }

    // 验证2: 观点是否映射到插入点
    console.log('\n✓ 验证2: 观点是否映射到插入点');
    const mappedViewpoints = understanding.viewpoints.filter(vp => vp.insertionPoint);
    if (mappedViewpoints.length > 0) {
      console.log(`  ✅ 通过 - ${mappedViewpoints.length}个观点已映射到插入点`);
    } else {
      console.log('  ❌ 失败 - 没有观点映射到插入点');
      allTestsPassed = false;
    }

    // 验证3: 卡片是否在正确时间插入
    console.log('\n✓ 验证3: 卡片是否在正确时间插入');
    if (cardTrack && cardTrack.clips.length > 0) {
      const firstClip = cardTrack.clips[0];
      const correspondingPoint = baseTimeline.insertionPoints.find(
        p => p.id === firstClip.linkedTo.insertionPointId
      );
      if (correspondingPoint && Math.abs(firstClip.startTime - correspondingPoint.time) < 0.5) {
        console.log(`  ✅ 通过 - 卡片时间与插入点匹配`);
        console.log(`     卡片时间: ${firstClip.startTime}s`);
        console.log(`     插入点时间: ${correspondingPoint.time}s`);
      } else {
        console.log('  ❌ 失败 - 卡片时间与插入点不匹配');
        allTestsPassed = false;
      }
    } else {
      console.log('  ❌ 失败 - 没有生成卡片clips');
      allTestsPassed = false;
    }

    // 验证4: 卡片是否有内容
    console.log('\n✓ 验证4: 卡片是否有内容');
    if (visualResult.cards.length > 0) {
      const firstCard = visualResult.cards[0];
      if (firstCard.keywordObj && firstCard.keywordObj.text) {
        console.log(`  ✅ 通过 - 卡片有内容: "${firstCard.keywordObj.text}"`);
      } else {
        console.log('  ❌ 失败 - 卡片没有内容');
        allTestsPassed = false;
      }
    } else {
      console.log('  ❌ 失败 - 没有生成卡片');
      allTestsPassed = false;
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
        } else {
          console.log('  ❌ 失败 - 卡片特效不完整');
          allTestsPassed = false;
        }
      } else {
        console.log('  ❌ 失败 - 卡片没有特效配置');
        allTestsPassed = false;
      }
    }

    // 验证6: 卡片图片是否生成
    console.log('\n✓ 验证6: 卡片图片是否生成');
    if (visualResult.cards.length > 0) {
      const firstCard = visualResult.cards[0];
      if (firstCard.path && fs.existsSync(firstCard.path)) {
        console.log(`  ✅ 通过 - 卡片图片已生成: ${path.basename(firstCard.path)}`);
      } else {
        console.log('  ❌ 失败 - 卡片图片未生成');
        allTestsPassed = false;
      }
    }

    // ========================================
    // 最终结果
    // ========================================
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║  测试结果总结                                          ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    if (allTestsPassed) {
      console.log('🎉 所有测试通过！工作流程运行正常！\n');
      console.log('✅ 验证通过的项目:');
      console.log('  1. ✅ 时间轴构建成功（精确时间戳）');
      console.log('  2. ✅ 观点映射到插入点');
      console.log('  3. ✅ 卡片在正确时间插入');
      console.log('  4. ✅ 卡片有内容');
      console.log('  5. ✅ 卡片有特效（圆角、阴影）');
      console.log('  6. ✅ 卡片图片已生成\n');

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
      console.log('⚠️  部分测试失败，请检查上述错误信息\n');
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
runFullWorkflowTest().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('测试执行失败:', error);
  process.exit(1);
});
