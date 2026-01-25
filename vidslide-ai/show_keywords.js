/**
 * 显示关键词提取结果
 * 展示完整文案并标黄关键词
 */

import dotenv from 'dotenv';
dotenv.config();

import ContentAnalyst from './src/agents/executors/ContentAnalyst.js';
import chalk from 'chalk';

async function showKeywords() {
  const videoPath = '/Users/weilei/Desktop/测试视频2.mp4';

  console.log('\n' + '='.repeat(80));
  console.log('📝 关键词提取结果展示');
  console.log('='.repeat(80));
  console.log(`\n视频: ${videoPath}\n`);

  // 创建ContentAnalyst实例
  const analyst = new ContentAnalyst();

  try {
    // 1. 语音识别
    console.log('🎤 正在进行语音识别...\n');
    const task_1_1 = await analyst.speechToText({ videoPath });

    console.log('📄 完整文案（共' + task_1_1.transcript.length + '字）:');
    console.log('-'.repeat(80));
    console.log(task_1_1.transcript);
    console.log('-'.repeat(80));

    // 2. 内容分析（提取关键词）
    console.log('\n🧠 正在提取关键词...\n');
    const analysis = await analyst.analyzeWithWenxin({
      task_1_1: task_1_1
    });

    // 3. 显示关键词信息
    console.log('🔑 提取的关键词:');
    console.log('-'.repeat(80));
    if (analysis.understanding?.keywords) {
      analysis.understanding.keywords.forEach((kw, index) => {
        console.log(`${index + 1}. ${chalk.yellow.bold(kw.text)} (${kw.english})`);
        console.log(`   分类: ${kw.category}`);
        if (kw.explanation) {
          console.log(`   解释: ${kw.explanation}`);
        }
      });
    }
    console.log('-'.repeat(80));

    // 4. 显示标注后的文案（关键词标黄）
    console.log('\n📝 标注后的文案（关键词已标黄）:');
    console.log('-'.repeat(80));
    let highlightedText = task_1_1.transcript;

    if (analysis.understanding?.keywords) {
      // 按长度降序排序，避免短关键词覆盖长关键词
      const sortedKeywords = [...analysis.understanding.keywords]
        .sort((a, b) => b.text.length - a.text.length);

      sortedKeywords.forEach(kw => {
        const regex = new RegExp(kw.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        highlightedText = highlightedText.replace(
          regex,
          chalk.yellow.bold(kw.text)
        );
      });
    }

    console.log(highlightedText);
    console.log('-'.repeat(80));

    // 5. 统计信息
    console.log('\n📊 统计信息:');
    console.log(`  文案总字数: ${task_1_1.transcript.length}字`);
    console.log(`  关键词数量: ${analysis.understanding?.keywords?.length || 0}个`);
    console.log(`  观点数量: ${analysis.understanding?.viewpoints?.length || 0}个`);
    console.log(`  解释数量: ${analysis.understanding?.explanations?.length || 0}个`);

    // 6. 观点和解释
    if (analysis.understanding?.viewpoints && analysis.understanding.viewpoints.length > 0) {
      console.log('\n💡 核心观点:');
      analysis.understanding.viewpoints.forEach((vp, i) => {
        console.log(`  ${i + 1}. ${vp}`);
      });
    }

    if (analysis.understanding?.explanations && analysis.understanding.explanations.length > 0) {
      console.log('\n📖 解释说明:');
      analysis.understanding.explanations.forEach((exp, i) => {
        console.log(`  ${i + 1}. ${exp}`);
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ 完成');
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

showKeywords();
