/**
 * 使用Bearer Token查询可用模型列表
 */

import dotenv from 'dotenv';
import axios from 'axios';
import { BCEIAMClient } from './src/utils/BCEIAMClient.js';

dotenv.config();

async function listModelsWithBearer() {
  const accessKey = process.env.QIANFAN_ACCESS_KEY;
  const secretKey = process.env.QIANFAN_SECRET_KEY;

  try {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('使用Bearer Token查询可用模型');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 获取Bearer Token
    const iamClient = new BCEIAMClient(accessKey, secretKey);
    const bearerToken = await iamClient.getBearerToken(1800);

    console.log('✅ Bearer Token获取成功\n');

    // 查询模型列表
    const response = await axios.get('https://qianfan.baidubce.com/v2/models', {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('可用模型列表:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (response.data && response.data.data) {
      const models = response.data.data;
      console.log(`共找到 ${models.length} 个模型\n`);

      // 筛选视觉模型
      const visionModels = models.filter(m =>
        m.id && (
          m.id.includes('vision') ||
          m.id.includes('vl') ||
          m.id.includes('ERNIE') ||
          m.id.includes('qwen') ||
          m.id.includes('deepseek')
        )
      );

      console.log('视觉相关模型:');
      visionModels.forEach(model => {
        console.log(`  - ${model.id}`);
        if (model.description) {
          console.log(`    ${model.description}`);
        }
      });

      console.log('\n所有模型:');
      models.forEach(model => {
        console.log(`  - ${model.id}`);
      });

    } else {
      console.log('响应数据:', JSON.stringify(response.data, null, 2));
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ 查询失败:', error.message);

    if (error.response) {
      console.error('\n详细错误信息:');
      console.error('  状态码:', error.response.status);
      console.error('  错误内容:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

listModelsWithBearer();
