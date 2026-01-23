#!/usr/bin/env node

/**
 * API密钥验证脚本
 *
 * 检查所有必需的API密钥是否已配置
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载.env文件
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('🔑 API密钥配置检查');
console.log('='.repeat(50));
console.log('');

const requiredKeys = [
  {
    name: '豆包API',
    keys: ['DOUBAO_API_KEY'],
    optional: false
  },
  {
    name: '文心一言API',
    keys: ['WENXIN_API_KEY', 'WENXIN_SECRET_KEY'],
    optional: false
  },
  {
    name: '百度ASR API',
    keys: ['BAIDU_ASR_API_KEY', 'BAIDU_ASR_SECRET_KEY'],
    optional: false
  }
];

let allConfigured = true;
let configuredCount = 0;
let totalCount = 0;

for (const service of requiredKeys) {
  console.log(`📌 ${service.name}:`);

  let serviceConfigured = true;

  for (const key of service.keys) {
    totalCount++;
    const value = process.env[key];
    const isConfigured = value && value !== 'your_api_key' && value !== 'your_app_id' && value !== 'your_secret_key';

    if (isConfigured) {
      configuredCount++;
      // 只显示前8个字符
      const maskedValue = value.substring(0, 8) + '...';
      console.log(`   ✅ ${key}: ${maskedValue}`);
    } else {
      console.log(`   ❌ ${key}: 未配置`);
      serviceConfigured = false;

      if (!service.optional) {
        allConfigured = false;
      }
    }
  }

  if (serviceConfigured) {
    console.log(`   状态: ✅ 已配置`);
  } else {
    console.log(`   状态: ${service.optional ? '⚠️  可选' : '❌ 需要配置'}`);
  }

  console.log('');
}

console.log('='.repeat(50));
console.log(`配置进度: ${configuredCount}/${totalCount} (${((configuredCount/totalCount)*100).toFixed(1)}%)`);
console.log('');

if (allConfigured) {
  console.log('✅ 所有必需的API密钥已配置！');
  console.log('');
  console.log('可以运行完整流程:');
  console.log('   node examples/cli.js "/Users/weilei/Desktop/测试视频2.MP4"');
  process.exit(0);
} else {
  console.log('⚠️  部分API密钥未配置');
  console.log('');
  console.log('请在 .env 文件中配置缺失的密钥');
  process.exit(1);
}
