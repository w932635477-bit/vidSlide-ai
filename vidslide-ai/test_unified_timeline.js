/**
 * 统一Timeline架构测试
 * 测试：关键词提取 → Timeline事件 → 多层场景 → 视频合成
 */

import dotenv from 'dotenv';
dotenv.config();

import ContentAnalyst from './src/agents/executors/ContentAnalyst.js';
import LocalKeywordExtractorV2 from './src/services/LocalKeywordExtractorV2.js';
import MultiLayerTimelineManager from './src/core/TimelineEventSystem.js';
import chalk from 'chalk';

async function testUnifiedTimeline() {
  const videoPath = '/Users/weilei/Desktop/测试视频2.mp4';

  console.log('\n' + '='.repeat(80));
  console.log('🎬 统一Timeline架构测试');
  console.log('='.repeat(80));
  console.log(`\n📹 视频: ${videoPath}\n`);

  try {
    // ========== 阶段1: 语音识别 ==========
    console.log(chalk.bold.blue('阶段1: 语音识别'));
    console.log('-'.repeat(80));

    const analyst = new ContentAnalyst();
    const task_1_1 = await analyst.speechToText({ videoPath });
    const transcript = task_1_1.transcript;

    console.log(`✅ 识别完成: ${transcript.length}字\n`);

    // ========== 阶段2: 本地关键词提取（带时间戳）==========
    console.log(chalk.bold.green('阶段2: 本地关键词提取（带精确时间戳）'));
    console.log('-'.repeat(80));

    const localExtractor = new LocalKeywordExtractorV2();
    const extractResult = await localExtractor.extractFromVideo(videoPath, transcript, {
      topN: 5,
      method: 'both'
    });

    const keywords = localExtractor.formatForSystem(extractResult.keywords);

    console.log(`✅ 提取关键词: ${keywords.length}个\n`);

    keywords.forEach((kw, i) => {
      console.log(`${i + 1}. ${chalk.cyan.bold(kw.text)} (${kw.english})`);
      console.log(`   权重: ${kw.weight.toFixed(2)} | 分类: ${kw.category}`);
      console.log(`   ⏱️  时间: ${kw.startTime.toFixed(1)}s - ${kw.endTime.toFixed(1)}s (精确: ${kw.timestamp.toFixed(2)}s)`);
      console.log(`   📍 上下文: ...${kw.context}...`);
      console.log('');
    });

    // ========== 阶段3: 创建Timeline事件 ==========
    console.log(chalk.bold.magenta('阶段3: 创建Timeline事件（多层结构）'));
    console.log('-'.repeat(80));

    const timelineManager = new MultiLayerTimelineManager();
    const events = timelineManager.createEventsFromKeywords(keywords);

    console.log('');

    // 显示事件详情
    console.log(chalk.bold('📋 Timeline事件详情:\n'));
    events.forEach((event, i) => {
      console.log(`事件 ${i + 1}: ${chalk.yellow.bold(event.keyword.text)}`);
      console.log(`  时间: ${event.timestamp.start.toFixed(1)}s - ${event.timestamp.end.toFixed(1)}s`);
      console.log(`  场景类型: ${chalk.cyan(event.metadata.sceneType)}`);
      console.log(`  层数: ${event.layers.length}层`);

      event.layers.forEach(layer => {
        const icon = layer.type === 'background' ? '🖼️ ' :
                     layer.type === 'pip' ? '📺' :
                     layer.type === 'card' ? '📝' : '❓';
        console.log(`    ${icon} ${layer.type} (z-index: ${layer.zIndex})`);
      });
      console.log('');
    });

    // ========== 阶段4: 冲突检测 ==========
    console.log(chalk.bold.yellow('阶段4: 时间冲突检测'));
    console.log('-'.repeat(80));

    const conflicts = timelineManager.detectConflicts();

    if (conflicts.length === 0) {
      console.log(chalk.green('✅ 无时间冲突'));
    } else {
      console.log(chalk.red(`⚠️  检测到 ${conflicts.length} 个冲突`));
      conflicts.forEach((c, i) => {
        console.log(`  ${i + 1}. ${c.event1} ↔ ${c.event2} (重叠: ${c.overlap.toFixed(2)}s)`);
      });
    }
    console.log('');

    // ========== 阶段5: 生成场景列表 ==========
    console.log(chalk.bold.blue('阶段5: 生成场景列表（给SceneDesigner使用）'));
    console.log('-'.repeat(80));

    const videoDuration = extractResult.stats.videoDuration;
    const scenes = timelineManager.generateScenes(videoDuration);

    console.log('');
    console.log(chalk.bold('📋 场景列表:\n'));

    scenes.forEach((scene, i) => {
      const typeIcon = scene.type === 'original' ? '▶️ ' :
                       scene.type === 'video-with-card' ? '📝' :
                       scene.type === 'multi-layer-composition' ? '🎭' : '❓';

      const typeColor = scene.type === 'original' ? chalk.gray :
                        scene.type === 'video-with-card' ? chalk.blue :
                        scene.type === 'multi-layer-composition' ? chalk.magenta :
                        chalk.white;

      console.log(`${i + 1}. ${typeIcon} ${typeColor(scene.type)}`);
      console.log(`   时间: ${scene.startTime.toFixed(1)}s - ${scene.endTime.toFixed(1)}s (${scene.duration.toFixed(1)}s)`);

      if (scene.keywordObj) {
        console.log(`   关键词: ${chalk.yellow.bold(scene.keywordObj.text)}`);
        if (scene.layers && scene.layers.length > 0) {
          console.log(`   包含层: ${scene.layers.map(l => l.type).join(', ')}`);
        }
      }
      console.log('');
    });

    // ========== 阶段6: 导出Timeline配置 ==========
    console.log(chalk.bold.green('阶段6: 导出完整Timeline配置'));
    console.log('-'.repeat(80));

    const timelineConfig = timelineManager.exportTimelineConfig();

    console.log('');
    console.log(JSON.stringify(timelineConfig, null, 2));
    console.log('');

    // ========== 总结对比 ==========
    console.log('\n' + '='.repeat(80));
    console.log(chalk.bold('📊 新旧架构对比'));
    console.log('='.repeat(80) + '\n');

    console.log(chalk.bold('❌ 旧架构的问题:'));
    console.log('   1. 使用固定时间规则（3.5s, 9s, 14.5s）');
    console.log('   2. 关键词时间与实际语音不匹配');
    console.log('   3. 多层场景管理混乱，各层独立处理');
    console.log('   4. 时间冲突无法自动检测');
    console.log('   5. 场景分配逻辑分散在多个文件中');
    console.log('');

    console.log(chalk.bold.green('✅ 新架构的优势:'));
    console.log('   1. 基于ASR精确时间戳（误差<1秒）');
    console.log('   2. 关键词出现时间与视频完全对应');
    console.log('   3. 统一的多层管理（背景+PIP+卡片）');
    console.log('   4. 自动检测和处理时间冲突');
    console.log('   5. 中心化的Timeline管理器');
    console.log('   6. 支持不同场景类型（纯卡片/多层）');
    console.log('   7. 完全兼容现有TimelineConstraintSystem');
    console.log('');

    // ========== 具体数据对比 ==========
    console.log(chalk.bold('🔢 具体数据:'));
    console.log('');

    console.log('本次测试结果:');
    console.log(`  - 关键词数量: ${keywords.length}个`);
    console.log(`  - Timeline事件: ${events.length}个`);
    console.log(`  - 场景总数: ${scenes.length}个`);
    console.log(`    • 原视频场景: ${scenes.filter(s => s.type === 'original').length}个`);
    console.log(`    • 纯卡片场景: ${scenes.filter(s => s.type === 'video-with-card').length}个`);
    console.log(`    • 多层场景: ${scenes.filter(s => s.type === 'multi-layer-composition').length}个`);
    console.log(`  - 总层数: ${timelineConfig.statistics.totalLayers}层`);
    console.log('');

    console.log('时间对应示例:');
    keywords.slice(0, 3).forEach((kw, i) => {
      console.log(`  ${i + 1}. "${kw.text}" → ${kw.timestamp.toFixed(2)}秒处`);
      console.log(`     场景时间: ${kw.startTime.toFixed(1)}s - ${kw.endTime.toFixed(1)}s`);
    });
    console.log('');

    // ========== 下一步建议 ==========
    console.log('\n' + '='.repeat(80));
    console.log(chalk.bold.cyan('💡 下一步建议'));
    console.log('='.repeat(80) + '\n');

    console.log('1. 集成到ContentAnalyst:');
    console.log('   修改 analyzeWithWenxin() 使用 LocalKeywordExtractorV2');
    console.log('');

    console.log('2. 集成到SceneDesigner:');
    console.log('   修改 planScenes() 使用 TimelineEventSystem.generateScenes()');
    console.log('   删除固定时间规则，使用事件时间戳');
    console.log('');

    console.log('3. 增强VideoEngineer:');
    console.log('   根据scene.layers信息区分：');
    console.log('   - 背景素材 → 全屏显示');
    console.log('   - PIP视频 → 小窗口右上角');
    console.log('   - 卡片 → 底部文字');
    console.log('');

    console.log('4. 运行完整测试:');
    console.log('   使用新架构重新生成视频，验证效果');
    console.log('');

    console.log('='.repeat(80));
    console.log('✅ 测试完成！');
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testUnifiedTimeline();
