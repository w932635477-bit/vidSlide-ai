#!/usr/bin/env node

/**
 * 测试百度ASR API连接
 */

import dotenv from 'dotenv';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载.env文件
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('🔍 测试百度ASR API连接');
console.log('='.repeat(50));
console.log('');

// 显示配置
console.log('📋 当前配置:');
console.log(`   APP_ID: ${process.env.BAIDU_ASR_APP_ID}`);
console.log(`   API_KEY: ${process.env.BAIDU_ASR_API_KEY?.substring(0, 8)}...`);
console.log(`   SECRET_KEY: ${process.env.BAIDU_ASR_SECRET_KEY?.substring(0, 8)}...`);
console.log('');

// 测试获取Access Token
async function testGetAccessToken() {
  console.log('🔑 测试获取Access Token...');

  const tokenUrl = 'https://aip.baidubce.com/oauth/2.0/token';

  try {
    const response = await axios.get(tokenUrl, {
      params: {
        grant_type: 'client_credentials',
        client_id: process.env.BAIDU_ASR_API_KEY,
        client_secret: process.env.BAIDU_ASR_SECRET_KEY
      }
    });

    console.log('✅ Access Token获取成功！');
    console.log(`   Token: ${response.data.access_token?.substring(0, 20)}...`);
    console.log(`   过期时间: ${response.data.expires_in}秒`);
    console.log('');

    return response.data.access_token;

  } catch (error) {
    console.log('❌ Access Token获取失败！');
    console.log(`   错误: ${error.message}`);

    if (error.response) {
      console.log(`   状态码: ${error.response.status}`);
      console.log(`   响应数据:`, JSON.stringify(error.response.data, null, 2));
    }

    console.log('');
    throw error;
  }
}

// 运行测试
(async () => {
  try {
    await testGetAccessToken();

    console.log('='.repeat(50));
    console.log('✅ 百度ASR API连接测试通过！');
    console.log('');

  } catch (error) {
    console.log('='.repeat(50));
    console.log('❌ 百度ASR API连接测试失败！');
    console.log('');
    console.log('💡 可能的原因:');
    console.log('   1. API Key或Secret Key不正确');
    console.log('   2. 百度ASR服务未开通');
    console.log('   3. 网络连接问题');
    console.log('');

    process.exit(1);
  }
})();
