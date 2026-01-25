/**
 * 简化测试：MaterialSearchService基础功能
 * 可以在没有API KEY的情况下测试降级方案
 */

import dotenv from 'dotenv';
dotenv.config();

import MaterialSearchService from './src/services/MaterialSearchService.js';
import path from 'path';
import fs from 'fs';

async function testMaterialSearchBasic() {
  console.log('🧪 测试MaterialSearchService基础功能\n');

  const materialSearch = new MaterialSearchService({
    logger: console,
    unsplashKey: process.env.UNSPLASH_ACCESS_KEY,
    pexelsKey: process.env.PEXELS_API_KEY
  });

  console.log('========================================');
  console.log('测试1: 服务初始化');
  console.log('========================================\n');

  console.log('✅ 服务初始化成功');
  console.log(`  - Unsplash Key: ${process.env.UNSPLASH_ACCESS_KEY ? '已配置 ✅' : '未配置 ⚠️'}`);
  console.log(`  - Pexels Key: ${process.env.PEXELS_API_KEY ? '已配置 ✅' : '未配置 ⚠️'}`);

  const stats = materialSearch.getCacheStats();
  console.log(`  - 缓存目录: ${materialSearch.cacheDir}`);
  console.log(`  - 已缓存素材: ${stats.count}个`);

  console.log('\n========================================');
  console.log('测试2: 缓存机制');
  console.log('========================================\n');

  // 检查缓存目录是否存在
  if (fs.existsSync(materialSearch.cacheDir)) {
    console.log('✅ 缓存目录已创建');

    const indexPath = path.join(materialSearch.cacheDir, 'index.json');
    if (fs.existsSync(indexPath)) {
      console.log('✅ 缓存索引文件存在');

      const indexContent = fs.readFileSync(indexPath, 'utf-8');
      const index = JSON.parse(indexContent);
      console.log(`  - 索引条目: ${Object.keys(index).length}个`);

      if (Object.keys(index).length > 0) {
        console.log('  - 已缓存的关键词:');
        Object.keys(index).forEach((keyword, i) => {
          console.log(`    ${i + 1}. ${keyword}`);
        });
      }
    } else {
      console.log('⚠️  缓存索引文件不存在（首次运行正常）');
    }
  } else {
    console.log('❌ 缓存目录不存在');
  }

  console.log('\n========================================');
  console.log('测试3: 关键词翻译');
  console.log('========================================\n');

  const testKeywords = ['抖音', '流量', '获客', '推送'];

  for (const keyword of testKeywords) {
    const translated = await materialSearch.translateKeyword(keyword);
    console.log(`  "${keyword}" → "${translated}"`);
  }

  console.log('\n========================================');
  console.log('测试4: 降级方案（默认素材）');
  console.log('========================================\n');

  const defaultMaterial = materialSearch.getDefaultMaterial();
  if (defaultMaterial) {
    console.log(`✅ 默认素材: ${defaultMaterial}`);
    if (fs.existsSync(defaultMaterial)) {
      console.log('  ✅ 默认素材文件存在');
    } else {
      console.log('  ⚠️  默认素材文件不存在');
    }
  } else {
    console.log('⚠️  未配置默认素材');
  }

  // 如果配置了API KEY，测试实际搜索
  if (process.env.UNSPLASH_ACCESS_KEY || process.env.PEXELS_API_KEY) {
    console.log('\n========================================');
    console.log('测试5: 实际搜索（API调用）');
    console.log('========================================\n');

    const testKeyword = '抖音';
    console.log(`测试关键词: "${testKeyword}"`);

    try {
      const startTime = Date.now();
      const materialPath = await materialSearch.searchMaterial(testKeyword);
      const duration = Date.now() - startTime;

      console.log(`✅ 搜索成功: ${materialPath}`);
      console.log(`⏱️  耗时: ${duration}ms`);

      if (fs.existsSync(materialPath)) {
        const stats = fs.statSync(materialPath);
        console.log(`📦 文件大小: ${(stats.size / 1024).toFixed(2)}KB`);
      }

      // 再次搜索，测试缓存
      console.log(`\n重复搜索: "${testKeyword}"`);
      const startTime2 = Date.now();
      const materialPath2 = await materialSearch.searchMaterial(testKeyword);
      const duration2 = Date.now() - startTime2;

      console.log(`✅ 缓存命中: ${duration2}ms (应该<10ms)`);

    } catch (error) {
      console.error(`❌ 搜索失败: ${error.message}`);
      console.log('\n💡 可能的原因:');
      console.log('  1. API KEY未配置或无效');
      console.log('  2. 网络连接问题');
      console.log('  3. API免费额度已用完');
      console.log('\n请检查.env文件中的API配置');
    }
  } else {
    console.log('\n========================================');
    console.log('⚠️  跳过实际搜索测试');
    console.log('========================================\n');
    console.log('原因: 未配置API KEY');
    console.log('\n如何配置:');
    console.log('  1. 阅读 API_REGISTRATION_GUIDE.md');
    console.log('  2. 注册Unsplash或Pexels账号');
    console.log('  3. 获取API KEY');
    console.log('  4. 添加到 .env 文件:');
    console.log('     UNSPLASH_ACCESS_KEY=your_key_here');
    console.log('     PEXELS_API_KEY=your_key_here');
  }

  console.log('\n========================================');
  console.log('✅ 测试完成');
  console.log('========================================\n');

  const finalStats = materialSearch.getCacheStats();
  console.log('📊 最终统计:');
  console.log(`  - 缓存素材: ${finalStats.count}个`);
  console.log(`  - 总大小: ${finalStats.totalSizeMB}MB`);

  if (finalStats.count > 0) {
    console.log('  - 缓存列表:');
    finalStats.keywords.forEach((kw, i) => {
      console.log(`    ${i + 1}. ${kw}`);
    });
  }
}

testMaterialSearchBasic();
