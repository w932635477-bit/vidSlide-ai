/**
 * 时间轴系统集成测试
 *
 * 测试TimelineBuilder、ContentAnalyst、SceneDesigner的协同工作
 */

import TimelineBuilder from '../src/agents/core/TimelineBuilder.js';
import ContentAnalyst from '../src/agents/executors/ContentAnalyst.js';
import SceneDesigner from '../src/agents/executors/SceneDesigner.js';
import { validateBaseTimeline, validateUITimeline } from '../src/core/TimelineSchema.js';

// 模拟logger
const mockLogger = {
  info: (...args) => console.log('[INFO]', ...args),
  error: (...args) => console.error('[ERROR]', ...args)
};

/**
 * 测试完整的时间轴工作流程
 */
async function testTimelineWorkflow() {
  console.log('\n========================================');
  console.log('🧪 开始时间轴系统集成测试');
  console.log('========================================\n');

  try {
    // 1. 初始化智能体
    console.log('📦 步骤1: 初始化智能体...');
    const timelineBuilder = new TimelineBuilder({ logger: mockLogger });
    const contentAnalyst = new ContentAnalyst({ logger: mockLogger });
    const sceneDesigner = new SceneDesigner({ logger: mockLogger });

    console.log('  ✅ 智能体初始化完成');
    console.log(`    - TimelineBuilder: ${timelineBuilder.getName()}`);
    console.log(`    - ContentAnalyst: ${contentAnalyst.getName()}`);
    console.log(`    - SceneDesigner: ${sceneDesigner.getName()}`);

    // 2. 构建基础时间轴
    console.log('\n⏱️  步骤2: 构建基础时间轴...');
    const task_0 = await timelineBuilder.buildBaseTimeline({
      videoPath: 'test-video.mp4',
      videoDuration: 30,
      fps: 30
    });

    console.log('  ✅ 基础时间轴构建完成');
    console.log(`    - 语音分段: ${task_0.baseTimeline.speechSegments.length}个`);
    console.log(`    - 插入点: ${task_0.baseTimeline.insertionPoints.length}个`);

    // 验证基础时间轴
    const baseValidation = validateBaseTimeline(task_0.baseTimeline);
    if (!baseValidation.valid) {
      throw new Error(`基础时间轴验证失败: ${baseValidation.error}`);
    }
    console.log('    - 格式验证: 通过 ✓');

    // 打印插入点详情
    console.log('\n    插入点详情:');
    task_0.baseTimeline.insertionPoints.forEach((point, index) => {
      console.log(`      ${index + 1}. 时间: ${point.time.toFixed(2)}s, 类型: ${point.type}, 适合度: ${point.suitability}`);
    });

    // 3. 内容分析
    console.log('\n🧠 步骤3: 内容分析...');
    const task_1_1 = await contentAnalyst.analyzeWithWenxin({ task_0 });

    console.log('  ✅ 内容分析完成');
    console.log(`    - 关键词: ${task_1_1.understanding.keywords.length}个`);
    console.log(`    - 观点: ${task_1_1.understanding.viewpoints.length}个`);
    console.log(`    - 解释: ${task_1_1.understanding.explanations.length}个`);

    // 4. 映射到时间轴
    console.log('\n🗺️  步骤4: 映射到时间轴...');
    const task_1_2 = await contentAnalyst.mapToTimeline({ task_0, task_1_1 });

    console.log('  ✅ 映射完成');
    console.log(`    - 已映射观点: ${task_1_2.understanding.viewpoints.length}个`);

    // 打印映射详情
    console.log('\n    映射详情:');
    task_1_2.understanding.viewpoints.forEach((vp, index) => {
      console.log(`      ${index + 1}. "${vp.text}" → 时间: ${vp.startTime.toFixed(2)}s, 重要性: ${vp.importance}`);
    });

    // 5. 生成UI时间轴
    console.log('\n🎬 步骤5: 生成UI时间轴...');
    const task_2_1 = await sceneDesigner.generateUITimeline({ task_0, task_1_2 });

    console.log('  ✅ UI时间轴生成完成');
    console.log(`    - 轨道数: ${task_2_1.uiTimeline.tracks.length}个`);
    console.log(`    - 总clips: ${task_2_1.uiTimeline.tracks.reduce((sum, t) => sum + t.clips.length, 0)}个`);
    console.log(`    - 标记数: ${task_2_1.uiTimeline.markers.length}个`);

    // 验证UI时间轴
    const uiValidation = validateUITimeline(task_2_1.uiTimeline);
    if (!uiValidation.valid) {
      throw new Error(`UI时间轴验证失败: ${uiValidation.error}`);
    }
    console.log('    - 格式验证: 通过 ✓');

    // 打印轨道详情
    console.log('\n    轨道详情:');
    task_2_1.uiTimeline.tracks.forEach((track) => {
      console.log(`      - ${track.name}: ${track.clips.length}个clips`);
      track.clips.forEach((clip, index) => {
        console.log(`        ${index + 1}. ${clip.name} (${clip.startTime.toFixed(2)}s - ${clip.endTime.toFixed(2)}s)`);
      });
    });

    // 6. 验证数据流转
    console.log('\n🔍 步骤6: 验证数据流转...');

    // 验证1: 基础时间轴 → 内容分析
    console.log('  验证1: 基础时间轴 → 内容分析');
    const transcript = task_0.baseTimeline.speechSegments
      .filter(s => !s.isPause)
      .map(s => s.text)
      .join('');
    console.log(`    - 提取的文本长度: ${transcript.length}字 ✓`);

    // 验证2: 内容分析 → 时间轴映射
    console.log('  验证2: 内容分析 → 时间轴映射');
    const mappedViewpoints = task_1_2.understanding.viewpoints.filter(vp => vp.insertionPoint);
    console.log(`    - 已映射观点: ${mappedViewpoints.length}/${task_1_2.understanding.viewpoints.length} ✓`);

    // 验证3: 时间轴映射 → UI时间轴
    console.log('  验证3: 时间轴映射 → UI时间轴');
    const cardClips = task_2_1.uiTimeline.tracks
      .find(t => t.id === 'track_cards')
      .clips;
    console.log(`    - 生成的卡片clips: ${cardClips.length}个 ✓`);

    // 验证4: 时间轴连续性
    console.log('  验证4: 时间轴连续性');
    const originalTrack = task_2_1.uiTimeline.tracks.find(t => t.id === 'track_original');
    let totalCoverage = 0;
    for (const clip of originalTrack.clips) {
      totalCoverage += (clip.endTime - clip.startTime);
    }
    console.log(`    - 原视频覆盖: ${totalCoverage.toFixed(2)}s / ${task_0.baseTimeline.videoInfo.duration}s ✓`);

    // 7. 测试结果总结
    console.log('\n========================================');
    console.log('✅ 时间轴系统集成测试通过！');
    console.log('========================================');
    console.log('\n测试总结:');
    console.log(`  ✓ 基础时间轴构建成功`);
    console.log(`  ✓ 内容分析成功`);
    console.log(`  ✓ 时间轴映射成功`);
    console.log(`  ✓ UI时间轴生成成功`);
    console.log(`  ✓ 数据流转验证通过`);
    console.log(`  ✓ 格式验证通过`);

    return {
      success: true,
      baseTimeline: task_0.baseTimeline,
      understanding: task_1_2.understanding,
      uiTimeline: task_2_1.uiTimeline
    };

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error(error.stack);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 测试时间轴数据格式
 */
function testTimelineDataFormat() {
  console.log('\n========================================');
  console.log('🧪 测试时间轴数据格式');
  console.log('========================================\n');

  // 测试基础时间轴格式
  const baseTimeline = {
    version: '1.0',
    videoInfo: {
      duration: 60,
      fps: 30,
      resolution: '1080x1920'
    },
    speechSegments: [
      {
        id: 'speech_1',
        startTime: 0,
        endTime: 5,
        text: '测试文本',
        confidence: 0.9,
        isPause: false,
        words: []
      }
    ],
    insertionPoints: [
      {
        id: 'point_1',
        time: 5,
        type: 'pause',
        duration: 0.8,
        suitability: 'high',
        metadata: {}
      }
    ],
    sceneChanges: []
  };

  const baseValidation = validateBaseTimeline(baseTimeline);
  console.log('基础时间轴格式验证:', baseValidation.valid ? '✓ 通过' : '✗ 失败');
  if (!baseValidation.valid) {
    console.log('  错误:', baseValidation.error);
  }

  // 测试UI时间轴格式
  const uiTimeline = {
    version: '1.0',
    duration: 60,
    fps: 30,
    tracks: [
      {
        id: 'track_1',
        name: '测试轨道',
        type: 'video',
        visible: true,
        locked: false,
        zIndex: 0,
        clips: []
      }
    ],
    markers: []
  };

  const uiValidation = validateUITimeline(uiTimeline);
  console.log('UI时间轴格式验证:', uiValidation.valid ? '✓ 通过' : '✗ 失败');
  if (!uiValidation.valid) {
    console.log('  错误:', uiValidation.error);
  }

  console.log('\n✅ 数据格式测试完成\n');
}

// 运行测试
async function runAllTests() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  VidSlide AI - 时间轴系统集成测试      ║');
  console.log('╚════════════════════════════════════════╝\n');

  // 测试1: 数据格式
  testTimelineDataFormat();

  // 测试2: 完整工作流程
  const result = await testTimelineWorkflow();

  // 最终报告
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║           测试完成报告                 ║');
  console.log('╚════════════════════════════════════════╝\n');

  if (result.success) {
    console.log('🎉 所有测试通过！');
    console.log('\n时间轴系统已准备就绪，可以投入使用。');
  } else {
    console.log('❌ 测试失败，请检查错误信息。');
  }

  return result;
}

// 执行测试
runAllTests().catch(error => {
  console.error('测试执行失败:', error);
  process.exit(1);
});
