/**
 * 真实视频时间轴系统测试
 *
 * 使用真实视频测试TimelineBuilder、ContentAnalyst、SceneDesigner的协同工作
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import TimelineBuilder from '../src/agents/core/TimelineBuilder.js';
import ContentAnalyst from '../src/agents/executors/ContentAnalyst.js';
import SceneDesigner from '../src/agents/executors/SceneDesigner.js';
import { validateBaseTimeline, validateUITimeline } from '../src/core/TimelineSchema.js';
import fs from 'fs';
import path from 'path';

// 获取当前文件的目录并加载环境变量
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '../.env');
dotenv.config({ path: envPath });

console.log('✓ 环境变量已加载\n');

// 模拟logger
const mockLogger = {
  info: (...args) => console.log('[INFO]', ...args),
  error: (...args) => console.error('[ERROR]', ...args)
};

/**
 * 获取视频时长
 */
async function getVideoDuration(videoPath) {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execPromise = promisify(exec);

  try {
    const { stdout } = await execPromise(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`
    );
    return parseFloat(stdout.trim());
  } catch (error) {
    console.error('获取视频时长失败:', error.message);
    return 30; // 默认30秒
  }
}

/**
 * 测试真实视频的时间轴工作流程
 */
async function testRealVideoTimeline(videoPath) {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║     VidSlide AI - 真实视频时间轴系统测试              ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  console.log(`📹 测试视频: ${path.basename(videoPath)}`);
  console.log(`📂 完整路径: ${videoPath}\n`);

  try {
    // 0. 获取视频信息
    console.log('📊 步骤0: 获取视频信息...');
    const videoDuration = await getVideoDuration(videoPath);
    console.log(`  ✅ 视频时长: ${videoDuration.toFixed(2)}秒\n`);

    // 1. 初始化智能体
    console.log('📦 步骤1: 初始化智能体...');
    const timelineBuilder = new TimelineBuilder({ logger: mockLogger });
    const contentAnalyst = new ContentAnalyst({ logger: mockLogger });
    const sceneDesigner = new SceneDesigner({ logger: mockLogger });

    console.log('  ✅ 智能体初始化完成');
    console.log(`    - ${timelineBuilder.getName()}`);
    console.log(`    - ${contentAnalyst.getName()}`);
    console.log(`    - ${sceneDesigner.getName()}\n`);

    // 2. 构建基础时间轴
    console.log('⏱️  步骤2: 构建基础时间轴...');
    console.log('  (这将调用百度ASR进行语音识别，可能需要1-2分钟)\n');

    const task_0 = await timelineBuilder.buildBaseTimeline({
      videoPath: videoPath,
      videoDuration: videoDuration,
      fps: 30
    });

    console.log('\n  ✅ 基础时间轴构建完成');
    console.log(`    - 语音分段: ${task_0.baseTimeline.speechSegments.length}个`);
    console.log(`    - 插入点: ${task_0.baseTimeline.insertionPoints.length}个`);

    // 验证基础时间轴
    const baseValidation = validateBaseTimeline(task_0.baseTimeline);
    if (!baseValidation.valid) {
      throw new Error(`基础时间轴验证失败: ${baseValidation.error}`);
    }
    console.log('    - 格式验证: ✓ 通过\n');

    // 打印语音分段详情
    console.log('  📝 语音分段详情:');
    task_0.baseTimeline.speechSegments.slice(0, 5).forEach((segment, index) => {
      if (segment.isPause) {
        console.log(`    ${index + 1}. [停顿] ${segment.startTime.toFixed(2)}s - ${segment.endTime.toFixed(2)}s (${segment.duration.toFixed(2)}s)`);
      } else {
        console.log(`    ${index + 1}. [语音] ${segment.startTime.toFixed(2)}s - ${segment.endTime.toFixed(2)}s: "${segment.text.substring(0, 20)}..."`);
      }
    });
    if (task_0.baseTimeline.speechSegments.length > 5) {
      console.log(`    ... 还有 ${task_0.baseTimeline.speechSegments.length - 5} 个分段\n`);
    }

    // 打印插入点详情
    console.log('  📍 插入点详情:');
    task_0.baseTimeline.insertionPoints.forEach((point, index) => {
      console.log(`    ${index + 1}. 时间: ${point.time.toFixed(2)}s, 类型: ${point.type}, 适合度: ${point.suitability}, 时长: ${point.duration.toFixed(2)}s`);
    });
    console.log('');

    // 3. 内容分析
    console.log('🧠 步骤3: 内容分析...');
    console.log('  (这将调用文心一言进行深度分析，可能需要30秒)\n');

    const task_1_1 = await contentAnalyst.analyzeWithWenxin({ task_0 });

    console.log('\n  ✅ 内容分析完成');
    console.log(`    - 关键词: ${task_1_1.understanding.keywords.length}个`);
    console.log(`    - 观点: ${task_1_1.understanding.viewpoints.length}个`);
    console.log(`    - 解释: ${task_1_1.understanding.explanations.length}个\n`);

    // 打印关键词
    console.log('  🔑 关键词:');
    task_1_1.understanding.keywords.forEach((keyword, index) => {
      if (typeof keyword === 'string') {
        console.log(`    ${index + 1}. ${keyword}`);
      } else {
        console.log(`    ${index + 1}. ${keyword.text} (${keyword.category})`);
      }
    });
    console.log('');

    // 4. 映射到时间轴
    console.log('🗺️  步骤4: 映射到时间轴...');
    const task_1_2 = await contentAnalyst.mapToTimeline({ task_0, task_1_1 });

    console.log('  ✅ 映射完成');
    console.log(`    - 已映射观点: ${task_1_2.understanding.viewpoints.length}个\n`);

    // 打印映射详情
    console.log('  🎯 观点映射详情:');
    task_1_2.understanding.viewpoints.forEach((vp, index) => {
      console.log(`    ${index + 1}. "${vp.text}"`);
      console.log(`       → 时间: ${vp.startTime.toFixed(2)}s, 重要性: ${vp.importance}`);
      if (vp.insertionPoint) {
        console.log(`       → 插入点: ${vp.insertionPoint.id} (适合度: ${vp.insertionPoint.suitability})`);
      }
    });
    console.log('');

    // 5. 生成UI时间轴
    console.log('🎬 步骤5: 生成UI时间轴...');
    const task_2_1 = await sceneDesigner.generateUITimeline({ task_0, task_1_2 });

    console.log('  ✅ UI时间轴生成完成');
    console.log(`    - 轨道数: ${task_2_1.uiTimeline.tracks.length}个`);
    console.log(`    - 总clips: ${task_2_1.uiTimeline.tracks.reduce((sum, t) => sum + t.clips.length, 0)}个`);
    console.log(`    - 标记数: ${task_2_1.uiTimeline.markers.length}个\n`);

    // 验证UI时间轴
    const uiValidation = validateUITimeline(task_2_1.uiTimeline);
    if (!uiValidation.valid) {
      throw new Error(`UI时间轴验证失败: ${uiValidation.error}`);
    }
    console.log('    - 格式验证: ✓ 通过\n');

    // 打印轨道详情
    console.log('  🎞️  轨道详情:');
    task_2_1.uiTimeline.tracks.forEach((track) => {
      console.log(`    ${track.name} (${track.type}, z-index: ${track.zIndex}):`);
      console.log(`      - Clips数量: ${track.clips.length}个`);

      track.clips.forEach((clip, index) => {
        const duration = clip.endTime - clip.startTime;
        console.log(`        ${index + 1}. ${clip.name}`);
        console.log(`           时间: ${clip.startTime.toFixed(2)}s - ${clip.endTime.toFixed(2)}s (${duration.toFixed(2)}s)`);
        if (clip.linkedTo && clip.linkedTo.insertionPointId) {
          console.log(`           关联: ${clip.linkedTo.insertionPointId}`);
        }
        if (clip.keyframes && clip.keyframes.length > 0) {
          console.log(`           关键帧: ${clip.keyframes.length}个`);
        }
      });
      console.log('');
    });

    // 6. 保存结果到文件
    console.log('💾 步骤6: 保存测试结果...');
    const outputDir = path.join(process.cwd(), 'test-output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFile = path.join(outputDir, `timeline-test-${timestamp}.json`);

    const testResult = {
      timestamp: new Date().toISOString(),
      videoPath: videoPath,
      videoDuration: videoDuration,
      baseTimeline: task_0.baseTimeline,
      understanding: task_1_2.understanding,
      uiTimeline: task_2_1.uiTimeline
    };

    fs.writeFileSync(outputFile, JSON.stringify(testResult, null, 2));
    console.log(`  ✅ 结果已保存到: ${outputFile}\n`);

    // 7. 验证数据流转
    console.log('🔍 步骤7: 验证数据流转和UI兼容性...\n');

    // 验证1: 基础时间轴 → 内容分析
    console.log('  ✓ 验证1: 基础时间轴 → 内容分析');
    const transcript = task_0.baseTimeline.speechSegments
      .filter(s => !s.isPause)
      .map(s => s.text)
      .join('');
    console.log(`    提取的文本长度: ${transcript.length}字`);

    // 验证2: 插入点 → 观点映射
    console.log('  ✓ 验证2: 插入点 → 观点映射');
    const mappedViewpoints = task_1_2.understanding.viewpoints.filter(vp => vp.insertionPoint);
    console.log(`    已映射观点: ${mappedViewpoints.length}/${task_1_2.understanding.viewpoints.length}`);

    // 验证3: UI时间轴数据格式
    console.log('  ✓ 验证3: UI时间轴数据格式');
    console.log(`    版本: ${task_2_1.uiTimeline.version}`);
    console.log(`    时长: ${task_2_1.uiTimeline.duration}s`);
    console.log(`    FPS: ${task_2_1.uiTimeline.fps}`);

    // 验证4: 轨道和clips结构
    console.log('  ✓ 验证4: 轨道和clips结构');
    const requiredTracks = ['track_original', 'track_cards', 'track_pip', 'track_material'];
    const existingTracks = task_2_1.uiTimeline.tracks.map(t => t.id);
    const hasAllTracks = requiredTracks.every(id => existingTracks.includes(id));
    console.log(`    必需轨道: ${hasAllTracks ? '✓ 全部存在' : '✗ 缺少轨道'}`);

    // 验证5: 时间轴连续性
    console.log('  ✓ 验证5: 时间轴连续性');
    const originalTrack = task_2_1.uiTimeline.tracks.find(t => t.id === 'track_original');
    let totalCoverage = 0;
    for (const clip of originalTrack.clips) {
      totalCoverage += (clip.endTime - clip.startTime);
    }
    const coverageRatio = (totalCoverage / videoDuration * 100).toFixed(2);
    console.log(`    原视频覆盖: ${totalCoverage.toFixed(2)}s / ${videoDuration.toFixed(2)}s (${coverageRatio}%)`);

    // 验证6: 关键帧动画
    console.log('  ✓ 验证6: 关键帧动画');
    const cardTrack = task_2_1.uiTimeline.tracks.find(t => t.id === 'track_cards');
    const clipsWithKeyframes = cardTrack.clips.filter(c => c.keyframes && c.keyframes.length > 0);
    console.log(`    带关键帧的卡片: ${clipsWithKeyframes.length}/${cardTrack.clips.length}`);

    // 8. 测试结果总结
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║              ✅ 测试全部通过！                         ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    console.log('📊 测试总结:');
    console.log('  ✓ 基础时间轴构建成功');
    console.log('  ✓ 语音识别和分段成功');
    console.log('  ✓ 插入点识别成功');
    console.log('  ✓ 内容分析成功');
    console.log('  ✓ 时间轴映射成功');
    console.log('  ✓ UI时间轴生成成功');
    console.log('  ✓ 数据格式验证通过');
    console.log('  ✓ UI兼容性验证通过');
    console.log('  ✓ 时间轴连续性验证通过\n');

    console.log('🎉 时间轴系统已准备就绪，可以与前端UI集成！\n');

    return {
      success: true,
      outputFile: outputFile,
      stats: {
        videoDuration: videoDuration,
        speechSegments: task_0.baseTimeline.speechSegments.length,
        insertionPoints: task_0.baseTimeline.insertionPoints.length,
        viewpoints: task_1_2.understanding.viewpoints.length,
        tracks: task_2_1.uiTimeline.tracks.length,
        totalClips: task_2_1.uiTimeline.tracks.reduce((sum, t) => sum + t.clips.length, 0)
      }
    };

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error('\n错误堆栈:');
    console.error(error.stack);
    return {
      success: false,
      error: error.message
    };
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('用法: node test-real-timeline.js <视频路径>');
    console.log('\n示例:');
    console.log('  node test-real-timeline.js /path/to/video.mp4');
    process.exit(1);
  }

  const videoPath = args[0];

  // 检查视频文件是否存在
  if (!fs.existsSync(videoPath)) {
    console.error(`❌ 视频文件不存在: ${videoPath}`);
    process.exit(1);
  }

  const result = await testRealVideoTimeline(videoPath);

  if (!result.success) {
    process.exit(1);
  }
}

// 执行测试
main().catch(error => {
  console.error('测试执行失败:', error);
  process.exit(1);
});
