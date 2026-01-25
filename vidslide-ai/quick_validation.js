/**
 * 快速验证脚本：测试多层场景是否生成
 */

import dotenv from 'dotenv';
dotenv.config();

import ProjectManager from './src/agents/coordinator/ProjectManager.js';
import fs from 'fs';

async function quickValidation() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 快速验证：多层场景生成测试');
  console.log('='.repeat(80));

  const videoPath = '/Users/weilei/Desktop/测试3.MP4';

  if (!fs.existsSync(videoPath)) {
    console.error(`\n❌ 错误: 找不到测试视频: ${videoPath}`);
    process.exit(1);
  }

  console.log(`\n📹 测试视频: ${videoPath}`);
  console.log(`\n🔧 初始化ProjectManager...`);

  const projectManager = new ProjectManager({
    logger: { level: 'info' }
  });

  const startTime = Date.now();

  try {
    console.log('\n🚀 开始执行工作流（Phase 1-3）...');
    console.log('  目标: 验证多层场景生成');

    const result = await projectManager.execute(videoPath, {
      allowRework: false
    });

    const duration = Date.now() - startTime;

    console.log('\n' + '='.repeat(80));
    console.log('✅ 执行完成');
    console.log('='.repeat(80));
    console.log(`耗时: ${(duration / 1000).toFixed(2)} 秒`);

    // 检查Timeline
    if (result.task_3_1 && result.task_3_1.timeline) {
      const timeline = result.task_3_1.timeline;

      console.log(`\n📊 Timeline统计:`);
      console.log(`  版本: ${timeline.version}`);
      console.log(`  时长: ${timeline.duration?.toFixed(2)}秒`);
      console.log(`  Clip数量: ${timeline.clips?.length || 0}`);

      // 统计场景类型
      const stats = {
        total: timeline.clips?.length || 0,
        original: 0,
        multiLayer: 0,
        cardOnly: 0,
        totalLayers: 0,
        completedLayers: 0
      };

      if (timeline.clips) {
        timeline.clips.forEach(clip => {
          if (clip.type === 'original') {
            stats.original++;
          } else if (clip.type === 'multi-layer-composition') {
            stats.multiLayer++;
            console.log(`\n⭐ 找到多层场景: ${clip.id}`);
            console.log(`   时间: ${clip.startTime.toFixed(2)}s - ${clip.endTime.toFixed(2)}s`);
            console.log(`   关键词: ${clip.keywordObj?.text || clip.keyword || 'N/A'}`);

            if (clip.layerManifest) {
              const layers = Object.entries(clip.layerManifest);
              console.log(`   层数: ${layers.length}`);
              layers.forEach(([layerId, layer]) => {
                const status = layer.status === 'completed' || layer.status === 'ready' ? '✅' : '❌';
                console.log(`     ${status} ${layerId}: ${layer.status} (${layer.agent})`);
                if (layer.path) {
                  console.log(`        → ${layer.path}`);
                }
              });
            }
          } else if (clip.type === 'video-with-card') {
            stats.cardOnly++;
          }

          // 统计层
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

      console.log(`\n📋 场景类型统计:`);
      console.log(`  总场景数: ${stats.total}`);
      console.log(`  原视频片段: ${stats.original}`);
      console.log(`  多层组合: ${stats.multiLayer} ${stats.multiLayer > 0 ? '✅' : '❌ 失败！'}`);
      console.log(`  视频+卡片: ${stats.cardOnly}`);
      console.log(`\n📋 层生成统计:`);
      console.log(`  总层数: ${stats.totalLayers}`);
      console.log(`  已完成: ${stats.completedLayers} (${stats.totalLayers > 0 ? ((stats.completedLayers / stats.totalLayers) * 100).toFixed(1) : 0}%)`);

      // 验证结果
      console.log(`\n${'='.repeat(80)}`);
      if (stats.multiLayer > 0) {
        console.log(`✅ 验证通过：成功生成 ${stats.multiLayer} 个多层场景！`);
        console.log(`   修复生效：TimelineEventSystem权重阈值已降低到12`);

        if (stats.completedLayers === stats.totalLayers) {
          console.log(`✅ 所有层都已成功生成`);
        } else {
          console.log(`⚠️  部分层未完成: ${stats.totalLayers - stats.completedLayers}个`);
        }
      } else {
        console.log(`❌ 验证失败：没有生成多层场景`);
        console.log(`   需要进一步调试TimelineEventSystem.determineSceneType()`);
      }
      console.log('='.repeat(80));

      // 保存Timeline用于可视化分析
      const timelineOutputPath = '/Users/weilei/VidSlide AI/vidslide-ai/timeline_debug.json';
      fs.writeFileSync(timelineOutputPath, JSON.stringify(timeline, null, 2));
      console.log(`\n💾 Timeline已保存到: ${timelineOutputPath}`);
      console.log(`   运行可视化工具: node vidslide-ai/visualize_timeline.js vidslide-ai/timeline_debug.json`);

      // 如果有视频输出，显示路径
      if (result.videoPath && fs.existsSync(result.videoPath)) {
        const videoStats = fs.statSync(result.videoPath);
        console.log(`\n📹 输出视频:`);
        console.log(`  路径: ${result.videoPath}`);
        console.log(`  大小: ${(videoStats.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`\n  播放命令: open "${result.videoPath}"`);
      }

      return {
        success: stats.multiLayer > 0,
        stats: stats,
        timeline: timeline
      };

    } else {
      console.error('\n❌ 错误: 无法提取Timeline数据');
      console.log('result keys:', Object.keys(result || {}));
      if (result && result.task_3_1) {
        console.log('task_3_1 keys:', Object.keys(result.task_3_1));
      }
      return { success: false };
    }

  } catch (error) {
    const duration = Date.now() - startTime;

    console.error('\n' + '='.repeat(80));
    console.error('❌ 执行失败');
    console.error('='.repeat(80));
    console.error(`\n错误信息: ${error.message}`);
    console.error(`耗时: ${(duration / 1000).toFixed(2)} 秒`);
    console.error('\n堆栈跟踪:');
    console.error(error.stack);

    return { success: false, error: error.message };
  }
}

quickValidation()
  .then(result => {
    if (result.success) {
      console.log('\n✅ 快速验证通过！');
      process.exit(0);
    } else {
      console.log('\n❌ 快速验证失败');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n💥 未捕获的错误:', error);
    process.exit(1);
  });
