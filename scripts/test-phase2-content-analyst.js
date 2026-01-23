/**
 * 阶段2测试脚本：测试ContentAnalyst（内容理解智能体）
 *
 * 测试目标：
 * 1. 测试百度ASR语音识别
 * 2. 测试文心一言内容分析
 * 3. 验证理解文档质量
 */

import ContentAnalyst from '../src/agents/executors/ContentAnalyst.js';
import Logger from '../src/core/Logger.js';
import ErrorHandler from '../src/core/ErrorHandler.js';
import fs from 'fs';
import path from 'path';

console.log('\n' + '='.repeat(60));
console.log('🧠 阶段2: 测试ContentAnalyst（内容理解智能体）');
console.log('='.repeat(60));

const TEST_CONFIG = {
  videoPath: './real-test-output/test-video.mp4',
  outputDir: './real-test-output/phase1'
};

// 创建智能体实例
const logger = new Logger({ level: 'debug' });
const errorHandler = new ErrorHandler({ logger });
const analyst = new ContentAnalyst({ logger, errorHandler });

async function runTest() {
  try {
    console.log('\n📹 测试视频:', TEST_CONFIG.videoPath);
    console.log('📁 输出目录:', TEST_CONFIG.outputDir);

    // 步骤1: 测试语音识别
    console.log('\n' + '-'.repeat(60));
    console.log('步骤1: 测试语音识别（百度ASR）');
    console.log('-'.repeat(60));

    console.log('\n⏳ 开始语音识别（这可能需要30-60秒）...');
    console.log('  → 正在提取音频...');
    console.log('  → 正在调用百度ASR...');

    const startTime = Date.now();
    const speechResult = await analyst.speechToText({ videoPath: TEST_CONFIG.videoPath });
    const speechDuration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`\n✅ 语音识别完成！耗时: ${speechDuration}秒`);
    console.log(`  - 识别字数: ${speechResult.wordCount} 字符`);
    console.log(`  - 音频文件: ${speechResult.audioPath}`);

    // 步骤2: 测试文心一言分析
    console.log('\n' + '-'.repeat(60));
    console.log('步骤2: 测试文心一言分析');
    console.log('-'.repeat(60));

    console.log('\n⏳ 开始文心一言分析（这可能需要30-60秒）...');
    console.log('  → 正在调用文心一言API...');

    const analysisStart = Date.now();
    const analysisResult = await analyst.analyzeWithWenxin({ task_1_1: speechResult });
    const analysisDuration = ((Date.now() - analysisStart) / 1000).toFixed(2);

    console.log(`\n✅ 文心一言分析完成！耗时: ${analysisDuration}秒`);

    // 合并结果
    const understanding = {
      transcript: analysisResult.transcript,
      ...analysisResult.understanding
    };

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`\n✅ 分析完成！总耗时: ${duration}秒`);

    // 步骤3: 验证理解文档
    console.log('\n' + '-'.repeat(60));
    console.log('步骤3: 验证理解文档');
    console.log('-'.repeat(60));

    console.log('\n📊 理解文档内容:');
    console.log('  - 文案长度:', understanding.transcript?.length || 0, '字符');
    console.log('  - 关键词数量:', understanding.keywords?.length || 0);
    console.log('  - 观点数量:', understanding.viewpoints?.length || 0);
    console.log('  - 解释数量:', understanding.explanations?.length || 0);

    if (understanding.keywords && understanding.keywords.length > 0) {
      console.log('\n🔑 提取的关键词:');
      understanding.keywords.forEach((kw, i) => {
        console.log(`  ${i + 1}. ${kw}`);
      });
    }

    if (understanding.viewpoints && understanding.viewpoints.length > 0) {
      console.log('\n💡 识别的观点:');
      understanding.viewpoints.forEach((vp, i) => {
        console.log(`  ${i + 1}. ${vp.text}`);
        console.log(`     类型: ${vp.type}, 时间: ${vp.time?.start || 0}s - ${vp.time?.end || 0}s`);
      });
    }

    if (understanding.explanations && understanding.explanations.length > 0) {
      console.log('\n📝 识别的解释:');
      understanding.explanations.forEach((exp, i) => {
        console.log(`  ${i + 1}. ${exp.text}`);
        console.log(`     关键词: ${exp.keyword}, 时间: ${exp.time?.start || 0}s - ${exp.time?.end || 0}s`);
      });
    }

    // 步骤4: 质量评估
    console.log('\n' + '-'.repeat(60));
    console.log('步骤4: 质量评估');
    console.log('-'.repeat(60));

    const quality = evaluateQuality(understanding);

    console.log('\n📈 质量评分:');
    console.log(`  - 文案完整性: ${quality.transcriptCompleteness}/10`);
    console.log(`  - 关键词准确性: ${quality.keywordAccuracy}/10`);
    console.log(`  - 观点识别: ${quality.viewpointIdentification}/10`);
    console.log(`  - 解释识别: ${quality.explanationIdentification}/10`);
    console.log(`  - 总体评分: ${quality.overallScore}/10`);

    if (quality.issues.length > 0) {
      console.log('\n⚠️  发现的问题:');
      quality.issues.forEach((issue, i) => {
        console.log(`  ${i + 1}. ${issue}`);
      });
    }

    if (quality.suggestions.length > 0) {
      console.log('\n💡 改进建议:');
      quality.suggestions.forEach((suggestion, i) => {
        console.log(`  ${i + 1}. ${suggestion}`);
      });
    }

    // 步骤5: 保存结果
    console.log('\n' + '-'.repeat(60));
    console.log('步骤5: 保存结果');
    console.log('-'.repeat(60));

    // 保存理解文档
    const understandingPath = path.join(TEST_CONFIG.outputDir, 'understanding.json');
    fs.writeFileSync(understandingPath, JSON.stringify(understanding, null, 2));
    console.log('\n✅ 理解文档已保存:', understandingPath);

    // 保存质量报告
    const qualityPath = path.join(TEST_CONFIG.outputDir, 'quality-report.json');
    fs.writeFileSync(qualityPath, JSON.stringify(quality, null, 2));
    console.log('✅ 质量报告已保存:', qualityPath);

    // 保存文案文本
    if (understanding.transcript) {
      const transcriptPath = path.join(TEST_CONFIG.outputDir, 'transcript.txt');
      fs.writeFileSync(transcriptPath, understanding.transcript);
      console.log('✅ 文案文本已保存:', transcriptPath);
    }

    // 步骤6: 生成测试报告
    console.log('\n' + '-'.repeat(60));
    console.log('步骤6: 生成测试报告');
    console.log('-'.repeat(60));

    const report = generateReport(understanding, quality, duration);
    const reportPath = path.join(TEST_CONFIG.outputDir, 'STAGE2_REPORT.md');
    fs.writeFileSync(reportPath, report);
    console.log('\n✅ 测试报告已保存:', reportPath);

    // 最终结果
    console.log('\n' + '='.repeat(60));
    if (quality.overallScore >= 7) {
      console.log('✅ 阶段2测试通过！ContentAnalyst表现良好');
      console.log(`   总体评分: ${quality.overallScore}/10`);
      console.log('\n📌 下一步: 开始阶段3 - 测试SceneDesigner');
    } else {
      console.log('⚠️  阶段2测试完成，但存在问题');
      console.log(`   总体评分: ${quality.overallScore}/10`);
      console.log('\n📌 建议: 先修复ContentAnalyst的问题再继续');
    }
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error('\n错误详情:');
    console.error(error.stack);

    // 保存错误信息
    const errorPath = path.join(TEST_CONFIG.outputDir, 'error.json');
    fs.writeFileSync(
      errorPath,
      JSON.stringify(
        {
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        },
        null,
        2
      )
    );

    console.log('\n❌ 错误信息已保存:', errorPath);
    process.exit(1);
  }
}

/**
 * 评估理解文档质量
 */
function evaluateQuality(understanding) {
  const quality = {
    transcriptCompleteness: 0,
    keywordAccuracy: 0,
    viewpointIdentification: 0,
    explanationIdentification: 0,
    overallScore: 0,
    issues: [],
    suggestions: []
  };

  // 1. 文案完整性
  if (!understanding.transcript || understanding.transcript.length === 0) {
    quality.transcriptCompleteness = 0;
    quality.issues.push('文案为空，语音识别可能失败');
  } else if (understanding.transcript.length < 50) {
    quality.transcriptCompleteness = 5;
    quality.issues.push('文案过短，可能识别不完整');
  } else if (understanding.transcript.length < 200) {
    quality.transcriptCompleteness = 7;
    quality.suggestions.push('文案较短，建议检查是否完整');
  } else {
    quality.transcriptCompleteness = 10;
  }

  // 2. 关键词准确性
  if (!understanding.keywords || understanding.keywords.length === 0) {
    quality.keywordAccuracy = 0;
    quality.issues.push('未提取到关键词');
  } else if (understanding.keywords.length < 2) {
    quality.keywordAccuracy = 5;
    quality.issues.push('关键词数量过少');
  } else if (understanding.keywords.length < 5) {
    quality.keywordAccuracy = 7;
    quality.suggestions.push('关键词数量偏少，建议增加');
  } else {
    quality.keywordAccuracy = 10;
  }

  // 3. 观点识别
  if (!understanding.viewpoints || understanding.viewpoints.length === 0) {
    quality.viewpointIdentification = 5;
    quality.suggestions.push('未识别到观点，可能影响卡片生成');
  } else if (understanding.viewpoints.length < 2) {
    quality.viewpointIdentification = 7;
    quality.suggestions.push('观点数量较少');
  } else {
    quality.viewpointIdentification = 10;
  }

  // 4. 解释识别
  if (!understanding.explanations || understanding.explanations.length === 0) {
    quality.explanationIdentification = 5;
    quality.suggestions.push('未识别到解释内容');
  } else if (understanding.explanations.length < 2) {
    quality.explanationIdentification = 7;
    quality.suggestions.push('解释内容较少');
  } else {
    quality.explanationIdentification = 10;
  }

  // 计算总体评分
  quality.overallScore = Math.round(
    (quality.transcriptCompleteness +
      quality.keywordAccuracy +
      quality.viewpointIdentification +
      quality.explanationIdentification) /
      4
  );

  return quality;
}

/**
 * 生成测试报告
 */
function generateReport(understanding, quality, duration) {
  return `# 阶段2测试报告：ContentAnalyst（内容理解智能体）

## ✅ 测试完成时间
${new Date().toISOString()}

## ⏱️ 测试耗时
${duration}秒

## 📊 测试结果

### 2.1 语音识别结果

**文案长度**: ${understanding.transcript?.length || 0} 字符

**文案内容**:
\`\`\`
${understanding.transcript || '（无）'}
\`\`\`

**状态**: ${understanding.transcript && understanding.transcript.length > 0 ? '✅ 成功' : '❌ 失败'}

### 2.2 文心一言分析结果

**关键词** (${understanding.keywords?.length || 0}个):
${understanding.keywords?.map((kw, i) => `${i + 1}. ${kw}`).join('\n') || '（无）'}

**观点** (${understanding.viewpoints?.length || 0}个):
${
  understanding.viewpoints
    ?.map(
      (vp, i) =>
        `${i + 1}. ${vp.text}\n   - 类型: ${vp.type}\n   - 时间: ${vp.time?.start || 0}s - ${vp.time?.end || 0}s`
    )
    .join('\n') || '（无）'
}

**解释** (${understanding.explanations?.length || 0}个):
${
  understanding.explanations
    ?.map(
      (exp, i) =>
        `${i + 1}. ${exp.text}\n   - 关键词: ${exp.keyword}\n   - 时间: ${exp.time?.start || 0}s - ${exp.time?.end || 0}s`
    )
    .join('\n') || '（无）'
}

**状态**: ${understanding.keywords && understanding.keywords.length > 0 ? '✅ 成功' : '❌ 失败'}

### 2.3 质量评估

**评分详情**:
- 文案完整性: ${quality.transcriptCompleteness}/10
- 关键词准确性: ${quality.keywordAccuracy}/10
- 观点识别: ${quality.viewpointIdentification}/10
- 解释识别: ${quality.explanationIdentification}/10

**总体评分**: ${quality.overallScore}/10

**状态**: ${quality.overallScore >= 7 ? '✅ 通过' : '⚠️ 需要改进'}

${
  quality.issues.length > 0
    ? `
### ⚠️ 发现的问题

${quality.issues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}
`
    : ''
}

${
  quality.suggestions.length > 0
    ? `
### 💡 改进建议

${quality.suggestions.map((suggestion, i) => `${i + 1}. ${suggestion}`).join('\n')}
`
    : ''
}

## 📝 总结

**智能体表现评分**: ${quality.overallScore}/10

${
  quality.overallScore >= 7
    ? `
**结论**: ✅ ContentAnalyst表现良好，可以继续下一阶段测试

**下一步**: 开始阶段3 - 测试SceneDesigner（场景设计智能体）
`
    : `
**结论**: ⚠️ ContentAnalyst存在问题，建议先修复再继续

**建议行动**:
1. 检查百度ASR API配置
2. 检查文心一言API配置
3. 检查视频音频质量
4. 调整分析参数
`
}

---

**记录时间**: ${new Date().toISOString()}
**测试人员**: Claude Code
`;
}

// 运行测试
runTest();
