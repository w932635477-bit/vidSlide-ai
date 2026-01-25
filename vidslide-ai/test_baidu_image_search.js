/**
 * 测试百度图片搜索功能（acjson API - 关键词搜索）
 */

import dotenv from 'dotenv';
dotenv.config();

import MaterialSearchService from './src/services/MaterialSearchService.js';

async function testBaiduImageSearch() {
  console.log('🧪 测试百度图片搜索（acjson API）\n');

  const materialSearch = new MaterialSearchService({
    logger: console,
    unsplashKey: process.env.UNSPLASH_ACCESS_KEY,
    pexelsKey: process.env.PEXELS_API_KEY
  });

  console.log('========================================');
  console.log('测试1: API配置检查');
  console.log('========================================\n');

  console.log('✅ API配置:');
  console.log(`  - 百度图片搜索: 无需配置 ✅ (acjson API)`);
  console.log(`  - Unsplash Key: ${process.env.UNSPLASH_ACCESS_KEY ? '已配置 ✅' : '未配置 ⚠️'}`);
  console.log(`  - Pexels Key: ${process.env.PEXELS_API_KEY ? '已配置 ✅' : '未配置 ⚠️'}`);

  console.log('\n========================================');
  console.log('测试2: 中文关键词搜索（百度图片优先）');
  console.log('========================================\n');

  const chineseKeywords = ['网红', '主播', '带货', '流量池'];

  for (let i = 0; i < chineseKeywords.length; i++) {
    const keyword = chineseKeywords[i];
    console.log(`\n[${i + 1}/${chineseKeywords.length}] 测试关键词: "${keyword}"`);
    console.log('─'.repeat(50));

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
  console.log('测试3: 缓存验证');
  console.log('========================================\n');

  const stats = materialSearch.getCacheStats();
  console.log('📊 缓存统计:');
  console.log(`  - 缓存素材数: ${stats.count}个`);
  console.log(`  - 总大小: ${stats.totalSizeMB}MB`);
  console.log('  - 关键词列表:');
  stats.keywords.forEach((kw, i) => {
    console.log(`    ${i + 1}. ${kw}`);
  });

  console.log('\n========================================');
  console.log('✅ 测试完成！');
  console.log('========================================\n');

  console.log('💡 搜索优先级:');
  console.log('  1. 百度图片（中文原生支持，免费无限制）⭐⭐⭐');
  console.log('  2. Unsplash（高质量，艺术性强）⭐⭐');
  console.log('  3. Pexels（商业素材，额度更高）⭐');

  console.log('\n🎉 优势:');
  console.log('  - 百度图片无需API Key');
  console.log('  - 完全免费，无额度限制');
  console.log('  - 中文关键词匹配度最高');
  console.log('  - 响应速度最快 (~800ms)');
}

testBaiduImageSearch();
