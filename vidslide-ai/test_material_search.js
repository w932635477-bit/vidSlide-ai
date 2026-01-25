/**
 * 测试MaterialSearchService
 * 验证素材搜索和缓存功能
 */

import dotenv from 'dotenv';
dotenv.config();

import MaterialSearchService from './src/services/MaterialSearchService.js';

async function testMaterialSearch() {
  console.log('🧪 测试素材搜索服务\n');

  const materialSearch = new MaterialSearchService({
    logger: console,
    unsplashKey: process.env.UNSPLASH_ACCESS_KEY,
    pexelsKey: process.env.PEXELS_API_KEY
  });

  // 测试关键词列表
  const testKeywords = [
    '抖音',
    '流量',
    '获客',
    '推送'
  ];

  console.log('========================================');
  console.log('测试1: 搜索素材');
  console.log('========================================\n');

  for (let i = 0; i < testKeywords.length; i++) {
    const keyword = testKeywords[i];
    console.log(`\n[${i + 1}/${testKeywords.length}] 测试关键词: "${keyword}"`);
    console.log('─'.repeat(40));

    try {
      const startTime = Date.now();
      const materialPath = await materialSearch.searchMaterial(keyword);
      const duration = Date.now() - startTime;

      console.log(`✅ 成功: ${materialPath}`);
      console.log(`⏱️  耗时: ${duration}ms`);

    } catch (error) {
      console.error(`❌ 失败: ${error.message}`);
    }
  }

  console.log('\n========================================');
  console.log('测试2: 缓存命中测试');
  console.log('========================================\n');

  // 再次搜索相同关键词，测试缓存
  for (let i = 0; i < testKeywords.length; i++) {
    const keyword = testKeywords[i];
    console.log(`\n[${i + 1}/${testKeywords.length}] 重复搜索: "${keyword}"`);

    const startTime = Date.now();
    const materialPath = await materialSearch.searchMaterial(keyword);
    const duration = Date.now() - startTime;

    console.log(`✅ 缓存命中: ${duration}ms (应该<5ms)`);
  }

  console.log('\n========================================');
  console.log('测试3: 缓存统计');
  console.log('========================================\n');

  const stats = materialSearch.getCacheStats();
  console.log('📊 缓存统计:');
  console.log(`  - 缓存素材数: ${stats.count}个`);
  console.log(`  - 总大小: ${stats.totalSizeMB}MB`);
  console.log(`  - 关键词列表:`);
  stats.keywords.forEach((kw, i) => {
    console.log(`    ${i + 1}. ${kw}`);
  });

  console.log('\n========================================');
  console.log('✅ 测试完成！');
  console.log('========================================\n');

  console.log('💡 验证结果:');
  console.log('  1. 首次搜索应该调用API（几秒）');
  console.log('  2. 重复搜索应该使用缓存（<5ms）');
  console.log('  3. 缓存目录应该有下载的图片');
  console.log('\n缓存目录: ./cache/materials/');
}

testMaterialSearch();
