/**
 * 测试百度ASR API配置
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import axios from 'axios';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量
const envPath = join(__dirname, '../.env');
console.log('加载环境变量文件:', envPath);
dotenv.config({ path: envPath });

console.log('\n╔════════════════════════════════════════╗');
console.log('║   百度ASR API配置测试                  ║');
console.log('╚════════════════════════════════════════╝\n');

// 1. 检查环境变量
console.log('📋 步骤1: 检查环境变量...');
const appId = process.env.BAIDU_ASR_APP_ID;
const apiKey = process.env.BAIDU_ASR_API_KEY;
const secretKey = process.env.BAIDU_ASR_SECRET_KEY;

console.log(`  APP_ID: ${appId ? '✓ 已设置' : '✗ 未设置'}`);
console.log(`  API_KEY: ${apiKey ? '✓ 已设置 (' + apiKey.substring(0, 10) + '...)' : '✗ 未设置'}`);
console.log(`  SECRET_KEY: ${secretKey ? '✓ 已设置 (' + secretKey.substring(0, 10) + '...)' : '✗ 未设置'}`);

if (!appId || !apiKey || !secretKey) {
  console.error('\n❌ 环境变量未正确设置！');
  process.exit(1);
}

// 2. 测试获取Access Token
console.log('\n🔑 步骤2: 测试获取Access Token...');

async function testAccessToken() {
  try {
    const tokenUrl = 'https://aip.baidubce.com/oauth/2.0/token';

    console.log('  请求URL:', tokenUrl);
    console.log('  参数:');
    console.log('    grant_type: client_credentials');
    console.log(`    client_id: ${apiKey.substring(0, 10)}...`);
    console.log(`    client_secret: ${secretKey.substring(0, 10)}...`);

    const response = await axios.get(tokenUrl, {
      params: {
        grant_type: 'client_credentials',
        client_id: apiKey,
        client_secret: secretKey
      },
      timeout: 10000
    });

    if (response.data.access_token) {
      console.log('\n  ✅ Access Token获取成功！');
      console.log(`  Token: ${response.data.access_token.substring(0, 20)}...`);
      console.log(`  过期时间: ${response.data.expires_in}秒`);
      return true;
    } else {
      console.error('\n  ❌ 响应中没有access_token');
      console.error('  响应数据:', JSON.stringify(response.data, null, 2));
      return false;
    }

  } catch (error) {
    console.error('\n  ❌ 获取Access Token失败！');
    console.error('  错误信息:', error.message);

    if (error.response) {
      console.error('  HTTP状态码:', error.response.status);
      console.error('  响应数据:', JSON.stringify(error.response.data, null, 2));

      // 分析错误原因
      if (error.response.status === 400) {
        console.error('\n  💡 可能的原因:');
        console.error('    1. API Key 或 Secret Key 不正确');
        console.error('    2. 密钥格式错误（包含多余的空格或换行）');
        console.error('    3. 密钥已过期或被禁用');
      } else if (error.response.status === 401) {
        console.error('\n  💡 可能的原因:');
        console.error('    1. API Key 不正确');
        console.error('    2. 未授权访问');
      }
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n  💡 可能的原因:');
      console.error('    1. 网络连接问题');
      console.error('    2. 防火墙阻止了请求');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('\n  💡 可能的原因:');
      console.error('    1. 网络超时');
      console.error('    2. 百度服务器响应慢');
    }

    return false;
  }
}

// 3. 运行测试
testAccessToken().then(success => {
  if (success) {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║        ✅ 测试通过！                   ║');
    console.log('╚════════════════════════════════════════╝\n');
    console.log('百度ASR API配置正确，可以正常使用。\n');
  } else {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║        ❌ 测试失败！                   ║');
    console.log('╚════════════════════════════════════════╝\n');
    console.log('请检查以下内容：');
    console.log('1. 确认.env文件中的API密钥是否正确');
    console.log('2. 登录百度AI开放平台检查应用状态');
    console.log('3. 确认API密钥没有多余的空格或换行');
    console.log('4. 检查网络连接是否正常\n');
    console.log('百度AI开放平台: https://console.bce.baidu.com/ai/\n');
    process.exit(1);
  }
}).catch(error => {
  console.error('测试执行失败:', error);
  process.exit(1);
});
