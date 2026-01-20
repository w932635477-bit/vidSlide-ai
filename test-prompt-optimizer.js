/**
 * PromptOptimizer 和 KeywordClassifier 测试脚本
 */

import { getInstance as getClassifier } from './vidslide-ai/src/services/KeywordClassifier.js';
import { getInstance as getOptimizer } from './vidslide-ai/src/services/PromptOptimizer.js';

async function testServices() {
  console.log('🧪 开始测试 KeywordClassifier 和 PromptOptimizer...\n');

  const classifier = getClassifier();
  const optimizer = getOptimizer();

  try {
    // 测试1: KeywordClassifier - 单个分类
    console.log('📝 测试1: KeywordClassifier - 单个分类');
    const testKeywords = ['人工智能', '创新', '营销', '数据分析', '产品'];
    testKeywords.forEach(keyword => {
      const category = classifier.classify(keyword);
      console.log(`  ${keyword} -> ${category}`);
    });
    console.log('✅ 单个分类测试通过\n');

    // 测试2: KeywordClassifier - 批量分类
    console.log('📝 测试2: KeywordClassifier - 批量分类');
    const batchResults = classifier.classifyBatch(testKeywords);
    console.log(JSON.stringify(batchResults, null, 2));
    console.log('✅ 批量分类测试通过\n');

    // 测试3: PromptOptimizer - 基础场景
    console.log('📝 测试3: PromptOptimizer - 基础场景');
    const basicPrompt = optimizer.optimize('人工智能', { sceneType: 'basic' });
    console.log(`  原始: 人工智能`);
    console.log(`  优化: ${basicPrompt}`);
    console.log('✅ 基础场景测试通过\n');

    // 测试4: PromptOptimizer - 强调场景
    console.log('📝 测试4: PromptOptimizer - 强调场景');
    const emphasisPrompt = optimizer.optimize('创新科技', { sceneType: 'emphasis' });
    console.log(`  原始: 创新科技`);
    console.log(`  优化: ${emphasisPrompt}`);
    console.log('✅ 强调场景测试通过\n');

    // 测试5: PromptOptimizer - 图表场景
    console.log('📝 测试5: PromptOptimizer - 图表场景');
    const chartPrompt = optimizer.optimize('数据增长', { sceneType: 'chart' });
    console.log(`  原始: 数据增长`);
    console.log(`  优化: ${chartPrompt}`);
    console.log('✅ 图表场景测试通过\n');

    // 测试6: PromptOptimizer - 批量优化
    console.log('📝 测试6: PromptOptimizer - 批量优化');
    const requests = [
      { keyword: '大数据', context: { sceneType: 'basic' } },
      { keyword: '突破创新', context: { sceneType: 'emphasis' } },
      { keyword: '市场占比', context: { sceneType: 'chart' } }
    ];
    const prompts = optimizer.optimizeBatch(requests);
    prompts.forEach((prompt, index) => {
      console.log(`  ${requests[index].keyword} (${requests[index].context.sceneType}):`);
      console.log(`    ${prompt}`);
    });
    console.log('✅ 批量优化测试通过\n');

    // 测试7: PromptOptimizer - 预览功能
    console.log('📝 测试7: PromptOptimizer - 预览功能');
    const preview = optimizer.preview('云计算', 'basic');
    console.log(JSON.stringify(preview, null, 2));
    console.log('✅ 预览功能测试通过\n');

    // 测试8: 集成测试 - 完整流程
    console.log('📝 测试8: 集成测试 - 完整流程');
    const keyword = '区块链技术';
    const category = classifier.classify(keyword);
    const prompt = optimizer.optimize(keyword, { sceneType: 'basic' });
    console.log(`  关键词: ${keyword}`);
    console.log(`  分类: ${category}`);
    console.log(`  优化后: ${prompt}`);
    console.log('✅ 集成测试通过\n');

    console.log('✅ 所有测试通过！');
    return true;

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error(error.stack);
    return false;
  }
}

// 运行测试
testServices()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ 测试脚本执行失败:', error);
    process.exit(1);
  });
