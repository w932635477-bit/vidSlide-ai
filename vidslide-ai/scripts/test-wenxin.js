#!/usr/bin/env node

/**
 * 测试文心一言API连接
 */

import dotenv from 'dotenv';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载.env文件
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('🔍 测试文心一言API连接');
console.log('='.repeat(50));
console.log('');

// 显示配置
console.log('📋 当前配置:');
console.log(`   API_KEY: ${process.env.WENXIN_API_KEY?.substring(0, 8)}...`);
console.log(`   SECRET_KEY: ${process.env.WENXIN_SECRET_KEY?.substring(0, 8)}...`);
console.log('');

// 测试获取Access Token
async function testGetAccessToken() {
  console.log('🔑 测试获取Access Token...');

  const tokenUrl = 'https://aip.baidubce.com/oauth/2.0/token';

  try {
    const response = await axios.get(tokenUrl, {
      params: {
        grant_type: 'client_credentials',
        client_id: process.env.WENXIN_API_KEY,
        client_secret: process.env.WENXIN_SECRET_KEY
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

// 测试文心一言API调用
async function testWenxinAPI(accessToken) {
  console.log('🧠 测试文心一言API调用...');

  const apiUrl = `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions?access_token=${accessToken}`;

  try {
    const response = await axios.post(apiUrl, {
      messages: [
        {
          role: 'user',
          content: '你好，请简单介绍一下你自己。'
        }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ 文心一言API调用成功！');
    console.log(`   响应: ${response.data.result?.substring(0, 100)}...`);
    console.log('');

    return response.data;

  } catch (error) {
    console.log('❌ 文心一言API调用失败！');
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
    const accessToken = await testGetAccessToken();
    await testWenxinAPI(accessToken);

    console.log('='.repeat(50));
    console.log('✅ 文心一言API连接测试通过！');
    console.log('');

  } catch (error) {
    console.log('='.repeat(50));
    console.log('❌ 文心一言API连接测试失败！');
    console.log('');
    console.log('💡 可能的原因:');
    console.log('   1. API Key或Secret Key不正确');
    console.log('   2. 文心一言服务未开通');
    console.log('   3. API URL不正确');
    console.log('   4. 网络连接问题');
    console.log('');

    process.exit(1);
  }
})();
