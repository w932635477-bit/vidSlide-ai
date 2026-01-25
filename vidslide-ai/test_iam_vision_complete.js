/**
 * 测试BCE IAM Bearer Token获取和视觉API调用
 */

import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import { BCEIAMClient } from './src/utils/BCEIAMClient.js';

dotenv.config();

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('测试BCE IAM认证和视觉API');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

async function testIAMVisionAPI() {
  const accessKey = process.env.QIANFAN_ACCESS_KEY;
  const secretKey = process.env.QIANFAN_SECRET_KEY;
  const imagePath = '/Users/weilei/VidSlide AI/vidslide-ai/test_vision_image.jpg';

  if (!accessKey || !secretKey) {
    console.error('❌ 千帆密钥未配置');
    process.exit(1);
  }

  if (!fs.existsSync(imagePath)) {
    console.error('❌ 测试图片不存在');
    process.exit(1);
  }

  console.log('✅ Access Key已配置');
  console.log('✅ 测试图片存在\n');

  try {
    // Step 1: 获取Bearer Token
    console.log('步骤1: 获取BCE Bearer Token...\n');
    const iamClient = new BCEIAMClient(accessKey, secretKey);
    const bearerToken = await iamClient.getBearerToken(1800);

    console.log('✅ Bearer Token获取成功');
    console.log('Token格式:', bearerToken.substring(0, 30) + '...\n');

    // Step 2: 读取并编码图片
    console.log('步骤2: 准备图片数据...\n');
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const imageUrl = `data:image/jpeg;base64,${base64Image}`;

    console.log('✅ 图片已编码为base64\n');

    // Step 3: 调用视觉API
    console.log('步骤3: 调用千帆视觉API...\n');

    const requestBody = {
      model: 'ernie-4.5-turbo-vl',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: imageUrl
              }
            },
            {
              type: 'text',
              text: '请简要描述这张图片的内容（20字以内）'
            }
          ]
        }
      ]
    };

    const response = await axios.post(
      'https://qianfan.baidubce.com/v2/chat/completions',
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    console.log('✅ API调用成功！\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('AI回复:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (response.data.choices && response.data.choices[0]) {
      console.log(response.data.choices[0].message.content);
    } else if (response.data.result) {
      console.log(response.data.result);
    } else {
      console.log(JSON.stringify(response.data, null, 2));
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎉 千帆MLLM视觉API集成成功！');
    console.log('✅ BCE IAM认证正常工作');
    console.log('✅ 视觉理解功能可用\n');

    return true;

  } catch (error) {
    console.error('❌ 测试失败:', error.message);

    if (error.response) {
      console.error('\n详细错误信息:');
      console.error('  状态码:', error.response.status);
      console.error('  错误内容:', JSON.stringify(error.response.data, null, 2));
    }

    process.exit(1);
  }
}

testIAMVisionAPI();
