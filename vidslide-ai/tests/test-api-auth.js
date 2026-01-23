/**
 * 测试百度ASR和千帆API
 */

import 'dotenv/config';
import BaiduASRService from '../src/services/BaiduASRService.js';
import QianfanService from '../src/services/QianfanService.js';

async function testAPIs() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  测试百度ASR和千帆API                                  ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // 测试1: 百度ASR
  console.log('1️⃣ 测试百度ASR API...');
  try {
    const asrService = new BaiduASRService();
    const token = await asrService.getAccessToken();
    console.log('   ✅ 百度ASR认证成功');
    console.log(`   Token: ${token.substring(0, 20)}...`);
  } catch (error) {
    console.log('   ❌ 百度ASR认证失败');
    console.log(`   错误: ${error.message}`);
  }

  console.log('');

  // 测试2: 千帆API
  console.log('2️⃣ 测试千帆API...');
  try {
    const qianfanService = new QianfanService();
    const testText = 'AI技术正在改变世界';
    const result = await qianfanService.analyzeContent(testText);
    console.log('   ✅ 千帆API调用成功');
    console.log(`   关键词数: ${result.keywords?.length || 0}`);
    console.log(`   观点数: ${result.viewpoints?.length || 0}`);
  } catch (error) {
    console.log('   ❌ 千帆API调用失败');
    console.log(`   错误: ${error.message}`);
  }

  console.log('\n测试完成！');
}

testAPIs().catch(error => {
  console.error('测试失败:', error);
  process.exit(1);
});
