/**
 * 从ProjectManager执行结果中提取Timeline并进行可视化
 */

import dotenv from 'dotenv';
dotenv.config();

import ProjectManager from './src/agents/coordinator/ProjectManager.js';
import visualizeTimeline from './visualize_timeline.js';
import fs from 'fs';
import path from 'path';

async function extractAndVisualizeTimeline() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 Timeline提取与可视化 - 快速调试模式');
  console.log('='.repeat(80));

  const videoPath = '/Users/weilei/Desktop/测试3.MP4';

  if (!fs.existsSync(videoPath)) {
    console.error(`\n❌ 错误: 找不到测试视频: ${videoPath}`);
    process.exit(1);
  }

  const videoStats = fs.statSync(videoPath);
  console.log(`\n📹 测试视频: ${videoPath}`);
  console.log(`  大小: ${(videoStats.size / 1024 / 1024).toFixed(2)} MB`);

  // 创建ProjectManager
  const projectManager = new ProjectManager({
    logger: { level: 'warn' }  // 降低日志级别以减少输出
  });

  console.log(`\n🔧 ProjectManager已初始化`);
  console.log(`  智能体: 4个核心智能体`);

  const startTime = Date.now();
  let capturedTimeline = null;

  try {
    console.log('\n🚀 开始执行工作流（Phase 1-3）...');
    console.log('  目标: 提取Timeline数据');

    const result = await projectManager.execute(videoPath, {
      allowRework: false
    });

    const duration = Date.now() - startTime;

    if (!result.success) {
      console.error('\n❌ 执行失败');
      console.error(`  错误: ${result.error || 'Unknown error'}`);
      process.exit(1);
    }

    console.log(`\n✅ 执行完成 (${(duration / 1000).toFixed(2)}秒)`);

    // 提取Timeline from task_3_1 (LayerOrchestrator result)
    if (result.task_3_1 && result.task_3_1.timeline) {
      capturedTimeline = result.task_3_1.timeline;
      console.log('\n✅ 成功提取Timeline（来自LayerOrchestrator）');
    } else {
      console.error('\n❌ 无法从task_3_1提取Timeline');
      console.log('\n调试信息:');
      console.log('  result keys:', Object.keys(result));
      if (result.task_3_1) {
        console.log('  task_3_1 keys:', Object.keys(result.task_3_1));
      }
      process.exit(1);
    }

    // 保存Timeline
    const timelineOutputPath = path.join(process.cwd(), 'vidslide-ai', 'timeline_debug.json');
    fs.writeFileSync(timelineOutputPath, JSON.stringify(capturedTimeline, null, 2));

    console.log(`\n💾 Timeline已保存`);
    console.log(`  路径: ${timelineOutputPath}`);
    console.log(`  版本: ${capturedTimeline.version}`);
    console.log(`  时长: ${capturedTimeline.duration?.toFixed(2)}秒`);
    console.log(`  Clip数量: ${capturedTimeline.clips?.length || 0}`);

    // 简要统计
    const stats = {
      totalClips: capturedTimeline.clips?.length || 0,
      multiLayerClips: 0,
      cardClips: 0,
      originalClips: 0,
      totalLayers: 0,
      completedLayers: 0
    };

    if (capturedTimeline.clips) {
      capturedTimeline.clips.forEach(clip => {
        if (clip.type === 'multi-layer-composition') stats.multiLayerClips++;
        else if (clip.type === 'video-with-card') stats.cardClips++;
        else if (clip.type === 'original') stats.originalClips++;

        if (clip.layerManifest) {
          Object.values(clip.layerManifest).forEach(layer => {
            stats.totalLayers++;
            if (layer.status === 'completed' || layer.status === 'ready') {
              stats.completedLayers++;
            }
          });
        }
      });
    }

    console.log(`\n📊 Timeline统计:`);
    console.log(`  总Clip数: ${stats.totalClips}`);
    console.log(`  - 原视频片段: ${stats.originalClips}`);
    console.log(`  - 多层组合: ${stats.multiLayerClips}`);
    console.log(`  - 视频+卡片: ${stats.cardClips}`);
    console.log(`  总层数: ${stats.totalLayers}`);
    console.log(`  已完成: ${stats.completedLayers} (${((stats.completedLayers / stats.totalLayers) * 100).toFixed(1)}%)`);

    // 立即运行可视化分析
    console.log('\n' + '='.repeat(80));
    console.log('📊 开始可视化分析...');
    console.log('='.repeat(80));

    const analysisResult = await visualizeTimeline(timelineOutputPath);

    // 显示问题摘要
    if (analysisResult.problems.length > 0) {
      console.log(`\n⚠️  发现 ${analysisResult.problems.length} 个问题`);
      const criticalProblems = analysisResult.problems.filter(p => p.severity === 'critical');
      if (criticalProblems.length > 0) {
        console.log(`   - 严重问题: ${criticalProblems.length}个`);
      }
    } else {
      console.log(`\n✅ Timeline验证通过，所有层都正确生成`);
    }

    // 检查生成的视频
    if (result.videoPath && fs.existsSync(result.videoPath)) {
      const videoStats = fs.statSync(result.videoPath);
      console.log(`\n📹 输出视频:`);
      console.log(`  路径: ${result.videoPath}`);
      console.log(`  大小: ${(videoStats.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`\n  播放命令: open "${result.videoPath}"`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Timeline提取与分析完成');
    console.log('='.repeat(80));

    return {
      timeline: capturedTimeline,
      analysis: analysisResult,
      videoPath: result.videoPath
    };

  } catch (error) {
    const duration = Date.now() - startTime;

    console.error('\n' + '='.repeat(80));
    console.error('❌ 执行失败');
    console.error('='.repeat(80));
    console.error(`\n错误信息: ${error.message}`);
    console.error(`耗时: ${(duration / 1000).toFixed(2)} 秒`);
    console.error('\n堆栈跟踪:');
    console.error(error.stack);

    process.exit(1);
  }
}

extractAndVisualizeTimeline().catch(error => {
  console.error('\n💥 未捕获的错误:', error);
  process.exit(1);
});
