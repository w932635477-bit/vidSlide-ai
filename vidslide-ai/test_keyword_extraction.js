import KeywordExtractionService from './src/services/KeywordExtractionService.js';

/**
 * 测试用例：验证Jieba分词的准确率
 */
const testCases = [
  {
    text: "在巨量ad投放平台上，如何通过精准的用户画像来提高广告转化率？",
    expected: ["巨量ad", "投放平台", "用户画像", "广告", "转化率"]
  },
  {
    text: "抖音短视频的推荐算法基于用户的兴趣标签和行为数据",
    expected: ["抖音", "短视频", "推荐算法", "用户", "兴趣"]
  },
  {
    text: "流量池饱和后，需要寻找新的增量用户来源",
    expected: ["流量池", "饱和", "增量用户", "用户", "来源"]
  },
  {
    text: "小红书的种草机制和私域流量运营策略",
    expected: ["小红书", "种草", "机制", "私域流量", "运营"]
  },
  {
    text: "千川投放系统中的人群包定向功能如何使用？",
    expected: ["千川", "投放系统", "人群包", "定向", "功能"]
  },
  {
    text: "直播带货的GMV转化漏斗分析",
    expected: ["直播带货", "GMV", "转化", "漏斗", "分析"]
  },
  {
    text: "视频号的冷启动阶段需要关注曝光量和完播率",
    expected: ["视频号", "冷启动", "曝光量", "完播率"]
  },
  {
    text: "ROI提升需要优化投放策略和素材创意",
    expected: ["ROI", "提升", "投放策略", "素材", "创意"]
  }
];

/**
 * 计算准确率
 */
function calculateAccuracy(extracted, expected) {
  const extractedSet = new Set(extracted);
  const expectedSet = new Set(expected);

  // 计算命中数
  let hits = 0;
  for (const word of extractedSet) {
    if (expectedSet.has(word) || Array.from(expectedSet).some(exp => exp.includes(word) || word.includes(exp))) {
      hits++;
    }
  }

  // 准确率 = 命中数 / 提取数
  const precision = extracted.length > 0 ? hits / extracted.length : 0;

  // 召回率 = 命中数 / 期望数
  const recall = expected.length > 0 ? hits / expected.length : 0;

  // F1分数
  const f1 = precision + recall > 0 ? 2 * (precision * recall) / (precision + recall) : 0;

  return {
    precision: (precision * 100).toFixed(1),
    recall: (recall * 100).toFixed(1),
    f1: (f1 * 100).toFixed(1),
    hits
  };
}

/**
 * 运行测试
 */
async function runTests() {
  console.log('\n🧪 关键词提取准确率测试\n');
  console.log('=' .repeat(80));

  const keywordService = new KeywordExtractionService();

  let totalPrecision = 0;
  let totalRecall = 0;
  let totalF1 = 0;

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];

    console.log(`\n测试 ${i + 1}: ${testCase.text}`);
    console.log('-'.repeat(80));

    // 提取关键词
    const results = keywordService.extractKeywords(testCase.text, {
      count: 5,
      maxLength: 4,
      minLength: 2
    });

    const extracted = results.map(r => r.keyword);

    // 计算准确率
    const accuracy = calculateAccuracy(extracted, testCase.expected);

    console.log(`期望: ${testCase.expected.join(', ')}`);
    console.log(`提取: ${extracted.join(', ')}`);
    console.log(`方法: ${results.map(r => r.method).join(', ')}`);
    console.log(`得分: ${results.map(r => r.score.toFixed(2)).join(', ')}`);
    console.log(`准确率: ${accuracy.precision}% | 召回率: ${accuracy.recall}% | F1: ${accuracy.f1}%`);

    totalPrecision += parseFloat(accuracy.precision);
    totalRecall += parseFloat(accuracy.recall);
    totalF1 += parseFloat(accuracy.f1);
  }

  console.log('\n' + '='.repeat(80));
  console.log('📊 总体结果:');
  console.log(`平均准确率: ${(totalPrecision / testCases.length).toFixed(1)}%`);
  console.log(`平均召回率: ${(totalRecall / testCases.length).toFixed(1)}%`);
  console.log(`平均F1分数: ${(totalF1 / testCases.length).toFixed(1)}%`);
  console.log('='.repeat(80));

  // 性能测试
  console.log('\n⚡ 性能测试:');
  const startTime = Date.now();
  for (let i = 0; i < 100; i++) {
    keywordService.extractKeywords(testCases[0].text, { count: 3 });
  }
  const endTime = Date.now();
  const avgTime = (endTime - startTime) / 100;
  console.log(`平均处理时间: ${avgTime.toFixed(2)}ms/次`);
  console.log(`吞吐量: ${(1000 / avgTime).toFixed(0)}次/秒`);

  console.log('\n✅ 测试完成！\n');
}

// 运行测试
runTests().catch(console.error);
