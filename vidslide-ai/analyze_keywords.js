/**
 * 深度分析关键词问题
 * 显示关键词在文案中的具体位置和出现次数
 */

import dotenv from 'dotenv';
dotenv.config();

import ContentAnalyst from './src/agents/executors/ContentAnalyst.js';
import chalk from 'chalk';

async function analyzeKeywords() {
  const videoPath = '/Users/weilei/Desktop/测试视频2.mp4';

  console.log('\n' + '='.repeat(80));
  console.log('🔍 关键词深度分析');
  console.log('='.repeat(80));

  const analyst = new ContentAnalyst();

  try {
    // 1. 语音识别
    const task_1_1 = await analyst.speechToText({ videoPath });
    const transcript = task_1_1.transcript;

    // 2. 内容分析
    const analysis = await analyst.analyzeWithWenxin({ task_1_1: task_1_1 });
    const keywords = analysis.understanding?.keywords || [];

    console.log('\n📄 完整文案:');
    console.log('-'.repeat(80));
    console.log(transcript);
    console.log('-'.repeat(80));
    console.log(`总字数: ${transcript.length}字\n`);

    console.log('🔑 提取的关键词（共' + keywords.length + '个）:\n');

    // 分析每个关键词
    keywords.forEach((kw, index) => {
      console.log(`${index + 1}. 【${kw.text}】(${kw.english})`);
      console.log(`   分类: ${kw.category}`);

      // 查找关键词在文案中的所有出现位置
      const occurrences = [];
      let startIndex = 0;

      while (true) {
        const position = transcript.indexOf(kw.text, startIndex);
        if (position === -1) break;

        // 获取上下文
        const contextStart = Math.max(0, position - 20);
        const contextEnd = Math.min(transcript.length, position + kw.text.length + 20);
        const before = transcript.slice(contextStart, position);
        const keyword = transcript.slice(position, position + kw.text.length);
        const after = transcript.slice(position + kw.text.length, contextEnd);

        occurrences.push({
          position: position,
          charIndex: position,
          context: before + chalk.yellow.bold(keyword) + after
        });

        startIndex = position + kw.text.length;
      }

      if (occurrences.length > 0) {
        console.log(`   ✅ 在文案中找到 ${chalk.green.bold(occurrences.length)} 次:`);
        occurrences.forEach((occ, i) => {
          console.log(`      ${i + 1}) 位置${occ.charIndex}: ...${occ.context}...`);
        });
      } else {
        console.log(`   ❌ ${chalk.red.bold('未在文案中找到完全匹配！')}`);

        // 检查部分匹配
        const partialMatches = [];
        const keywordChars = kw.text.split('');
        for (let i = 0; i < transcript.length; i++) {
          for (let len = 1; len <= keywordChars.length; len++) {
            const substring = kw.text.substring(0, len);
            if (transcript.includes(substring)) {
              if (!partialMatches.includes(substring)) {
                partialMatches.push(substring);
              }
            }
          }
        }

        if (partialMatches.length > 0) {
          const longest = partialMatches.sort((a, b) => b.length - a.length)[0];
          console.log(`      部分匹配: "${longest}"`);
        }
      }

      console.log('');
    });

    // 统计问题
    console.log('📊 问题分析:');
    console.log('-'.repeat(80));

    let totalOccurrences = 0;
    let keywordsNotFound = 0;
    let keywordsFoundMultipleTimes = 0;

    keywords.forEach(kw => {
      const count = (transcript.match(new RegExp(kw.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
      totalOccurrences += count;

      if (count === 0) {
        keywordsNotFound++;
      } else if (count > 1) {
        keywordsFoundMultipleTimes++;
      }
    });

    console.log(`1. 关键词总数: ${keywords.length}个`);
    console.log(`2. 关键词总出现次数: ${totalOccurrences}次`);
    console.log(`3. 未在文案中找到的关键词: ${chalk.red.bold(keywordsNotFound)}个`);
    console.log(`4. 在文案中多次出现的关键词: ${chalk.yellow.bold(keywordsFoundMultipleTimes)}个`);
    console.log(`5. 平均每个关键词出现: ${(totalOccurrences / keywords.length).toFixed(2)}次`);

    if (keywordsNotFound > 0) {
      console.log(`\n${chalk.red.bold('⚠️  问题1')}: 有关键词在文案中找不到完全匹配！`);
      console.log('   可能原因: 提取的关键词是概括性词语，不是原文中的精确词汇');
    }

    if (keywordsFoundMultipleTimes > 0) {
      console.log(`\n${chalk.yellow.bold('⚠️  问题2')}: 有关键词在文案中多次出现！`);
      console.log('   可能影响: 场景设计器分配关键词时会重复使用同一个关键词');
    }

    console.log('\n💡 建议:');
    console.log('   1. 关键词应该直接从原文中提取，而非概括总结');
    console.log('   2. 需要记录关键词在文案中的首次出现位置（时间戳）');
    console.log('   3. 避免提取在文案中不存在的概括性词语');
    console.log('   4. 对于多次出现的关键词，只使用首次出现的位置');

    console.log('\n' + '='.repeat(80));

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

analyzeKeywords();
