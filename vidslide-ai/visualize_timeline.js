/**
 * Timeline可视化工具
 * 生成清晰的时间轴，显示每个时间点插入的画面
 */

import fs from 'fs';
import path from 'path';

// ANSI颜色代码
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m'
};

/**
 * 格式化时间（秒 -> 分:秒）
 */
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

/**
 * 生成时间轴的ASCII图表
 */
function generateTimelineChart(clips, totalDuration) {
  console.log('\n' + '='.repeat(100));
  console.log(colors.bright + colors.cyan + '📊 时间轴可视化图表' + colors.reset);
  console.log('='.repeat(100));

  const chartWidth = 80;
  const timeline = new Array(chartWidth).fill(' ');

  // 为每个clip在时间轴上标记
  clips.forEach((clip, index) => {
    const startPos = Math.floor((clip.startTime / totalDuration) * chartWidth);
    const endPos = Math.floor((clip.endTime / totalDuration) * chartWidth);

    // 确定颜色
    let color;
    if (clip.type === 'original') {
      color = colors.blue;
    } else if (clip.type === 'multi-layer-composition') {
      color = colors.magenta;
    } else if (clip.type === 'video-with-card') {
      color = colors.yellow;
    } else {
      color = colors.green;
    }

    // 填充时间轴
    for (let i = startPos; i < endPos && i < chartWidth; i++) {
      timeline[i] = color + '█' + colors.reset;
    }
  });

  // 打印时间轴
  console.log('\n时间轴: 0s ' + timeline.join('') + ` ${totalDuration.toFixed(1)}s`);

  // 打印图例
  console.log('\n图例:');
  console.log(`  ${colors.blue}█${colors.reset} 原视频片段 (original)`);
  console.log(`  ${colors.magenta}█${colors.reset} 多层组合 (multi-layer-composition) - 5层渲染`);
  console.log(`  ${colors.yellow}█${colors.reset} 视频+卡片 (video-with-card) - 原视频+卡片层`);
  console.log(`  ${colors.green}█${colors.reset} 其他类型`);
  console.log('='.repeat(100));
}

/**
 * 显示详细的Clip信息
 */
function displayClipDetails(clip, index) {
  const duration = (clip.endTime - clip.startTime).toFixed(2);

  console.log(`\n${colors.bright}${colors.cyan}━━━ Clip ${index + 1}/${clip.totalClips || '?'} ━━━${colors.reset}`);
  console.log(`ID: ${colors.yellow}${clip.id}${colors.reset}`);
  console.log(`类型: ${colors.magenta}${clip.type}${colors.reset}`);
  console.log(`时间: ${colors.green}${formatTime(clip.startTime)}${colors.reset} → ${colors.green}${formatTime(clip.endTime)}${colors.reset} (${duration}秒)`);

  if (clip.keyword) {
    console.log(`关键词: ${colors.cyan}${clip.keyword}${colors.reset}`);
  }

  // 显示LayerManifest
  if (clip.layerManifest) {
    console.log(`\n${colors.bright}📋 LayerManifest (层清单):${colors.reset}`);

    const layers = Object.entries(clip.layerManifest).sort((a, b) => {
      const zIndexA = a[1].config?.zIndex || 0;
      const zIndexB = b[1].config?.zIndex || 0;
      return zIndexA - zIndexB;
    });

    layers.forEach(([layerName, layer]) => {
      const zIndex = layer.config?.zIndex || 0;
      const status = layer.status || 'pending';

      let statusIcon = '⏳';
      let statusColor = colors.yellow;
      if (status === 'completed') {
        statusIcon = '✅';
        statusColor = colors.green;
      } else if (status === 'failed') {
        statusIcon = '❌';
        statusColor = colors.red;
      }

      console.log(`  ${statusColor}${statusIcon} Layer ${zIndex}${colors.reset} - ${colors.cyan}${layerName}${colors.reset}`);
      console.log(`      Agent: ${layer.agent || 'N/A'}`);
      console.log(`      Status: ${statusColor}${status}${colors.reset}`);

      if (layer.path) {
        const fileName = path.basename(layer.path);
        const fileExists = fs.existsSync(layer.path);
        console.log(`      Path: ${fileExists ? colors.green : colors.red}${fileName}${colors.reset} ${fileExists ? '' : '(文件不存在!)'}`);
      } else {
        console.log(`      Path: ${colors.red}未生成${colors.reset}`);
      }

      if (layer.config) {
        const configStr = JSON.stringify(layer.config, null, 2)
          .split('\n')
          .map((line, i) => i === 0 ? line : '      ' + line)
          .join('\n');
        console.log(`      Config: ${configStr}`);
      }
    });
  } else {
    console.log(`\n${colors.red}⚠️  LayerManifest不存在!${colors.reset}`);
  }

  console.log(`${colors.cyan}${'─'.repeat(80)}${colors.reset}`);
}

/**
 * 分析问题
 */
function analyzeProblems(clips) {
  console.log('\n' + '='.repeat(100));
  console.log(colors.bright + colors.red + '🔍 问题分析' + colors.reset);
  console.log('='.repeat(100));

  const problems = [];

  clips.forEach((clip, index) => {
    // 检查1: LayerManifest是否存在
    if (!clip.layerManifest) {
      problems.push({
        clip: index + 1,
        severity: 'critical',
        issue: 'LayerManifest不存在',
        description: `Clip ${index + 1} (${clip.id}) 没有layerManifest`
      });
    } else {
      // 检查2: 是否有层
      const layers = Object.keys(clip.layerManifest);
      if (layers.length === 0) {
        problems.push({
          clip: index + 1,
          severity: 'critical',
          issue: 'LayerManifest为空',
          description: `Clip ${index + 1} (${clip.id}) 的layerManifest没有任何层`
        });
      }

      // 检查3: 层文件是否存在
      Object.entries(clip.layerManifest).forEach(([layerName, layer]) => {
        if (layer.status === 'completed' && layer.path) {
          if (!fs.existsSync(layer.path)) {
            problems.push({
              clip: index + 1,
              severity: 'critical',
              issue: '层文件不存在',
              description: `Clip ${index + 1} - ${layerName}: 文件路径${layer.path}不存在`
            });
          }
        } else if (layer.status === 'failed') {
          problems.push({
            clip: index + 1,
            severity: 'high',
            issue: '层生成失败',
            description: `Clip ${index + 1} - ${layerName}: 状态为failed`
          });
        } else if (layer.status === 'pending') {
          problems.push({
            clip: index + 1,
            severity: 'medium',
            issue: '层未生成',
            description: `Clip ${index + 1} - ${layerName}: 状态仍为pending`
          });
        }
      });
    }

    // 检查4: 多层组合场景是否有所有必需的层
    if (clip.type === 'multi-layer-composition' && clip.layerManifest) {
      const requiredLayers = ['background', 'material', 'mask', 'card', 'pip'];
      const actualLayers = Object.keys(clip.layerManifest);

      requiredLayers.forEach(required => {
        if (!actualLayers.includes(required)) {
          problems.push({
            clip: index + 1,
            severity: 'high',
            issue: '缺少必需的层',
            description: `Clip ${index + 1} (多层组合) 缺少${required}层`
          });
        }
      });
    }
  });

  // 显示问题
  if (problems.length === 0) {
    console.log(`\n${colors.green}✅ 未发现问题！所有层都已正确生成。${colors.reset}`);
  } else {
    console.log(`\n${colors.red}发现 ${problems.length} 个问题:${colors.reset}\n`);

    const criticalProblems = problems.filter(p => p.severity === 'critical');
    const highProblems = problems.filter(p => p.severity === 'high');
    const mediumProblems = problems.filter(p => p.severity === 'medium');

    if (criticalProblems.length > 0) {
      console.log(`${colors.bgRed}${colors.white} 严重问题 (${criticalProblems.length}) ${colors.reset}`);
      criticalProblems.forEach((p, i) => {
        console.log(`  ${i + 1}. [Clip ${p.clip}] ${p.issue}: ${p.description}`);
      });
      console.log('');
    }

    if (highProblems.length > 0) {
      console.log(`${colors.bgYellow}${colors.white} 高优先级问题 (${highProblems.length}) ${colors.reset}`);
      highProblems.forEach((p, i) => {
        console.log(`  ${i + 1}. [Clip ${p.clip}] ${p.issue}: ${p.description}`);
      });
      console.log('');
    }

    if (mediumProblems.length > 0) {
      console.log(`${colors.yellow}中等问题 (${mediumProblems.length})${colors.reset}`);
      mediumProblems.forEach((p, i) => {
        console.log(`  ${i + 1}. [Clip ${p.clip}] ${p.issue}: ${p.description}`);
      });
      console.log('');
    }
  }

  console.log('='.repeat(100));

  return problems;
}

/**
 * 生成修复建议
 */
function generateFixSuggestions(problems) {
  if (problems.length === 0) return;

  console.log('\n' + '='.repeat(100));
  console.log(colors.bright + colors.green + '💡 修复建议' + colors.reset);
  console.log('='.repeat(100));

  const suggestions = new Set();

  problems.forEach(p => {
    if (p.issue === 'LayerManifest不存在') {
      suggestions.add('SceneDesigner未正确初始化layerManifest - 检查decomposeScenes方法');
    } else if (p.issue === 'LayerManifest为空') {
      suggestions.add('SceneDesigner初始化了layerManifest但未添加层定义 - 检查initializeLayerManifest方法');
    } else if (p.issue === '层文件不存在') {
      suggestions.add('LayerOrchestrator生成了层但文件被删除或移动 - 检查文件路径和缓存清理逻辑');
    } else if (p.issue === '层生成失败') {
      suggestions.add('LayerOrchestrator生成层时出错 - 检查orchestrateLayers方法和底层服务');
    } else if (p.issue === '层未生成') {
      suggestions.add('LayerOrchestrator未执行或未完成 - 检查Phase 3是否正常执行');
    } else if (p.issue === '缺少必需的层') {
      suggestions.add('多层组合场景的层定义不完整 - 检查SceneDesigner.initializeLayerManifest中的多层场景逻辑');
    }
  });

  Array.from(suggestions).forEach((suggestion, i) => {
    console.log(`${colors.yellow}${i + 1}.${colors.reset} ${suggestion}`);
  });

  console.log('\n' + colors.bright + '推荐的调试步骤:' + colors.reset);
  console.log(`1. 运行 ${colors.cyan}node vidslide-ai/debug_timeline.js${colors.reset} 检查Timeline生成是否正确`);
  console.log(`2. 检查 ${colors.cyan}SceneDesigner.decomposeScenes()${colors.reset} 是否正确创建了所有场景`);
  console.log(`3. 检查 ${colors.cyan}LayerOrchestrator.orchestrateLayers()${colors.reset} 是否成功生成了所有层`);
  console.log(`4. 检查 ${colors.cyan}VideoEngineer.composeVideo()${colors.reset} 是否正确读取了layerManifest`);
  console.log(`5. 查看日志文件中的错误信息`);

  console.log('='.repeat(100));
}

/**
 * 主函数
 */
async function visualizeTimeline(timelineFilePath) {
  console.log('\n' + colors.bright + colors.cyan + '🔍 VidSlide AI - Timeline可视化分析工具' + colors.reset);
  console.log('='.repeat(100));

  if (!fs.existsSync(timelineFilePath)) {
    console.error(`${colors.red}❌ 错误: Timeline文件不存在: ${timelineFilePath}${colors.reset}`);
    console.log(`\n请先运行端到端测试生成Timeline，或指定正确的Timeline文件路径。`);
    process.exit(1);
  }

  // 读取Timeline
  console.log(`\n📂 读取Timeline文件: ${timelineFilePath}`);
  const timelineData = JSON.parse(fs.readFileSync(timelineFilePath, 'utf-8'));

  console.log(`${colors.green}✅ Timeline加载成功${colors.reset}`);
  console.log(`   版本: ${timelineData.version || 'N/A'}`);
  console.log(`   总时长: ${timelineData.duration?.toFixed(2) || 'N/A'}秒`);
  console.log(`   Clip数量: ${timelineData.clips?.length || 0}`);

  if (!timelineData.clips || timelineData.clips.length === 0) {
    console.error(`\n${colors.red}❌ 错误: Timeline中没有clips!${colors.reset}`);
    process.exit(1);
  }

  // 生成时间轴图表
  generateTimelineChart(timelineData.clips, timelineData.duration);

  // 显示每个Clip的详细信息
  console.log('\n' + '='.repeat(100));
  console.log(colors.bright + colors.cyan + '📋 Clip详细信息' + colors.reset);
  console.log('='.repeat(100));

  timelineData.clips.forEach((clip, index) => {
    displayClipDetails(clip, index);
  });

  // 分析问题
  const problems = analyzeProblems(timelineData.clips);

  // 生成修复建议
  generateFixSuggestions(problems);

  // 统计信息
  console.log('\n' + '='.repeat(100));
  console.log(colors.bright + colors.cyan + '📊 统计信息' + colors.reset);
  console.log('='.repeat(100));

  const stats = {
    totalClips: timelineData.clips.length,
    originalClips: 0,
    multiLayerClips: 0,
    cardClips: 0,
    otherClips: 0,
    totalLayers: 0,
    completedLayers: 0,
    failedLayers: 0,
    pendingLayers: 0
  };

  timelineData.clips.forEach(clip => {
    if (clip.type === 'original') stats.originalClips++;
    else if (clip.type === 'multi-layer-composition') stats.multiLayerClips++;
    else if (clip.type === 'video-with-card') stats.cardClips++;
    else stats.otherClips++;

    if (clip.layerManifest) {
      Object.values(clip.layerManifest).forEach(layer => {
        stats.totalLayers++;
        if (layer.status === 'completed') stats.completedLayers++;
        else if (layer.status === 'failed') stats.failedLayers++;
        else if (layer.status === 'pending') stats.pendingLayers++;
      });
    }
  });

  console.log(`\nClip类型分布:`);
  console.log(`  原视频片段: ${colors.blue}${stats.originalClips}${colors.reset}`);
  console.log(`  多层组合: ${colors.magenta}${stats.multiLayerClips}${colors.reset}`);
  console.log(`  视频+卡片: ${colors.yellow}${stats.cardClips}${colors.reset}`);
  console.log(`  其他: ${colors.green}${stats.otherClips}${colors.reset}`);

  console.log(`\n层生成状态:`);
  console.log(`  总层数: ${stats.totalLayers}`);
  console.log(`  已完成: ${colors.green}${stats.completedLayers}${colors.reset} (${((stats.completedLayers / stats.totalLayers) * 100).toFixed(1)}%)`);
  console.log(`  失败: ${colors.red}${stats.failedLayers}${colors.reset}`);
  console.log(`  待处理: ${colors.yellow}${stats.pendingLayers}${colors.reset}`);

  console.log('='.repeat(100));

  return {
    timeline: timelineData,
    problems: problems,
    stats: stats
  };
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  const timelineFile = process.argv[2] || '/Users/weilei/VidSlide AI/vidslide-ai/timeline_output.json';

  visualizeTimeline(timelineFile)
    .then(result => {
      if (result.problems.length > 0) {
        console.log(`\n${colors.red}⚠️  发现问题，需要修复${colors.reset}`);
        process.exit(1);
      } else {
        console.log(`\n${colors.green}✅ Timeline验证通过！${colors.reset}`);
        process.exit(0);
      }
    })
    .catch(error => {
      console.error(`\n${colors.red}❌ 分析失败:${colors.reset}`, error);
      process.exit(1);
    });
}

export default visualizeTimeline;
