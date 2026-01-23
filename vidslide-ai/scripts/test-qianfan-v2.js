#!/usr/bin/env node

/**
 * 测试千帆V2 API连接（IAM认证）
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import QianfanService from '../src/services/QianfanService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载.env文件
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('🔍 测试千帆V2 API连接（IAM认证）');
console.log('='.repeat(50));
console.log('');

// 显示配置
console.log('📋 当前配置:');
console.log(`   Access Key: ${process.env.QIANFAN_ACCESS_KEY?.substring(0, 8)}...`);
console.log(`   Secret Key: ${process.env.QIANFAN_SECRET_KEY?.substring(0, 8)}...`);
console.log(`   App ID: ${process.env.QIANFAN_APP_ID}`);
console.log('');

// 测试千帆API
async function testQianfanAPI() {
  console.log('🧠 测试千帆API调用...');

  const qianfan = new QianfanService();

  try {
    const response = await qianfan.chat('你好，请简单介绍一下你自己。');

    console.log('✅ 千帆API调用成功！');
    console.log(`   响应: ${response.substring(0, 100)}...`);
    console.log('');

    return response;

  } catch (error) {
    console.log('❌ 千帆API调用失败！');
    console.log(`   错误: ${error.message}`);
    console.log('');
    throw error;
  }
}

// 测试内容分析
async function testContentAnalysis() {
  console.log('📊 测试内容分析...');

  const qianfan = new QianfanService();

  const testTranscript = `
大家好，今天我要给大家介绍一下人工智能的发展历程。
人工智能从1956年诞生以来，经历了多次起伏。
目前，深度学习技术的突破让AI进入了新的发展阶段。
特别是大语言模型的出现，让AI能够更好地理解和生成自然语言。
  `;

  try {
    const result = await qianfan.analyzeContent(testTranscript);

    console.log('✅ 内容分析成功！');
    console.log('   分析结果:');
    console.log(`   - 关键词: ${result.keywords.join(', ')}`);
    console.log(`   - 观点数: ${result.viewpoints.length}个`);
    console.log(`   - 意图: ${result.intent}`);
    console.log(`   - 语气: ${result.tone}`);
    console.log('');

    return result;

  } catch (error) {
    console.log('❌ 内容分析失败！');
    console.log(`   错误: ${error.message}`);
    console.log('');
    throw error;
  }
}

// 运行测试
(async () => {
  try {
    await testQianfanAPI();
    await testContentAnalysis();

    console.log('='.repeat(50));
    console.log('✅ 千帆V2 API连接测试通过！');
    console.log('');

  } catch (error) {
    console.log('='.repeat(50));
    console.log('❌ 千帆V2 API连接测试失败！');
    console.log('');
    console.log('💡 可能的原因:');
    console.log('   1. Access Key或Secret Key不正确');
    console.log('   2. App ID不正确');
    console.log('   3. IAM签名生成错误');
    console.log('   4. 网络连接问题');
    console.log('');

    process.exit(1);
  }
})();
