/**
 * 调试脚本：生成并保存Timeline用于分析
 */

import dotenv from 'dotenv';
dotenv.config();

import ProjectManager from './src/agents/coordinator/ProjectManager.js';
import fs from 'fs';
import path from 'path';

async function debugTimeline() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 Timeline调试模式 - 生成并保存Timeline');
  console.log('='.repeat(80));

  const videoPath = '/Users/weilei/Desktop/测试3.MP4';

  if (!fs.existsSync(videoPath)) {
    console.error(`\n❌ 错误: 找不到测试视频: ${videoPath}`);
    process.exit(1);
  }

  console.log(`\n📹 测试视频: ${videoPath}`);

  // 创建一个自定义Logger来拦截Timeline数据
  let capturedTimeline = null;

  const customLogger = {
    level: 'info',
    info: (...args) => console.log(...args),
    warn: (...args) => console.warn(...args),
    error: (...args) => console.error(...args),
    logTask: (name, data) => {
      console.log(`  📌 任务: ${name}`, data ? JSON.stringify(data, null, 2) : '');
    },
    logPlan: (plan) => {
      console.log('📋 执行计划:', JSON.stringify(plan, null, 2));
    },
    startPhase: (name) => {
      console.log(`\n${'═'.repeat(60)}`);
      console.log(`🚀 Phase: ${name}`);
      console.log('═'.repeat(60));
    },
    endPhase: (status, result) => {
      console.log(`\n✅ Phase完成: ${status}`);
    },
    generateReport: () => {
      return {
        summary: 'Debug mode report',
        timestamp: new Date().toISOString()
      };
    }
  };

  console.log(`\n🔧 初始化ProjectManager...`);
  const projectManager = new ProjectManager({ logger: customLogger });

  const startTime = Date.now();

  try {
    console.log('\n' + '='.repeat(80));
    console.log('🚀 开始执行（调试模式）');
    console.log('='.repeat(80));

    // 执行到Phase 3 (LayerOrchestration)，捕获Timeline
    const result = await projectManager.execute(videoPath, {
      allowRework: false
    });

    const duration = Date.now() - startTime;

    console.log('\n' + '='.repeat(80));
    console.log('✅ 执行完成');
    console.log('='.repeat(80));
    console.log(`耗时: ${(duration / 1000).toFixed(2)} 秒`);

    // 尝试从result中提取Timeline
    // Timeline应该在Phase 3的结果中
    if (result && result.task_3_1 && result.task_3_1.timeline) {
      capturedTimeline = result.task_3_1.timeline;
      console.log('\n✅ 成功捕获Timeline（来自task_3_1）');
    } else if (result && result.task_2_1 && result.task_2_1.scenes) {
      // 如果task_3_1没有timeline，尝试从task_2_1构建
      capturedTimeline = {
        version: '2.0',
        duration: result.task_2_1.duration || 0,
        clips: result.task_2_1.scenes || []
      };
      console.log('\n⚠️  从task_2_1重建Timeline');
    }

    if (capturedTimeline) {
      // 保存Timeline到文件
      const timelineOutputPath = path.join(process.cwd(), 'vidslide-ai', 'timeline_debug.json');
      fs.writeFileSync(timelineOutputPath, JSON.stringify(capturedTimeline, null, 2));
      console.log(`\n💾 Timeline已保存到: ${timelineOutputPath}`);
      console.log(`   版本: ${capturedTimeline.version}`);
      console.log(`   时长: ${capturedTimeline.duration?.toFixed(2)}秒`);
      console.log(`   Clip数量: ${capturedTimeline.clips?.length || 0}`);

      // 简要统计
      const stats = {
        totalClips: capturedTimeline.clips?.length || 0,
        multiLayerClips: 0,
        cardClips: 0,
        originalClips: 0,
        totalLayers: 0
      };

      if (capturedTimeline.clips) {
        capturedTimeline.clips.forEach(clip => {
          if (clip.type === 'multi-layer-composition') stats.multiLayerClips++;
          else if (clip.type === 'video-with-card') stats.cardClips++;
          else if (clip.type === 'original') stats.originalClips++;

          if (clip.layerManifest) {
            stats.totalLayers += Object.keys(clip.layerManifest).length;
          }
        });
      }

      console.log(`\n📊 Timeline统计:`);
      console.log(`   总Clip数: ${stats.totalClips}`);
      console.log(`   原视频片段: ${stats.originalClips}`);
      console.log(`   多层组合: ${stats.multiLayerClips}`);
      console.log(`   视频+卡片: ${stats.cardClips}`);
      console.log(`   总层数: ${stats.totalLayers}`);

      console.log(`\n🔍 下一步：运行可视化工具`);
      console.log(`   node vidslide-ai/visualize_timeline.js vidslide-ai/timeline_debug.json`);

    } else {
      console.error('\n❌ 错误: 无法捕获Timeline数据');
      console.log('\n调试信息:');
      console.log('result keys:', Object.keys(result || {}));
      if (result && result.task_3_1) {
        console.log('task_3_1 keys:', Object.keys(result.task_3_1));
      }
      if (result && result.task_2_1) {
        console.log('task_2_1 keys:', Object.keys(result.task_2_1));
      }
    }

    return result;

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

console.log('');
debugTimeline().catch(error => {
  console.error('\n💥 未捕获的错误:', error);
  process.exit(1);
});
