/**
 * 查询千帆可用模型列表
 */

import dotenv from 'dotenv';
import axios from 'axios';
import crypto from 'crypto';

dotenv.config();

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('千帆可用模型列表查询');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

async function getModels() {
  const accessKey = process.env.QIANFAN_ACCESS_KEY;
  const secretKey = process.env.QIANFAN_SECRET_KEY;

  if (!accessKey || !secretKey) {
    console.error('❌ 千帆V2密钥未配置');
    process.exit(1);
  }

  console.log('✅ Access Key已配置:', accessKey.substring(0, 8) + '...\n');

  try {
    // 生成IAM签名
    const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
    const method = 'GET';
    const path = '/v2/models';
    const host = 'qianfan.baidubce.com';

    // 简化方案：直接使用Bearer Token格式
    // 千帆V2 API支持直接使用 "bce-v3/ACCESS_KEY/..." 格式
    const authString = `bce-v3/${accessKey}/${timestamp}/1800`;

    console.log('正在查询可用模型列表...\n');

    const response = await axios.get('https://qianfan.baidubce.com/v2/models', {
      headers: {
        'Authorization': `Bearer ${authString}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.data) {
      const models = response.data.data;
      console.log(`✅ 查询成功！共找到 ${models.length} 个可用模型\n`);

      // 按类型分组模型
      const visionModels = [];
      const textModels = [];
      const otherModels = [];

      // 视觉模型关键词
      const visionKeywords = ['vl', 'vision', 'image', 'visual', 'multimodal', 'cogvlm', 'qwen2-vl', 'internvl', 'deepseek-vl'];

      for (const model of models) {
        const modelId = model.id.toLowerCase();

        if (visionKeywords.some(keyword => modelId.includes(keyword))) {
          visionModels.push(model.id);
        } else if (modelId.includes('ernie') || modelId.includes('llama') || modelId.includes('qwen')) {
          textModels.push(model.id);
        } else {
          otherModels.push(model.id);
        }
      }

      // 显示视觉模型
      if (visionModels.length > 0) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✨ 支持视觉功能的模型 (可用于图片对比)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        visionModels.forEach((model, index) => {
          console.log(`${index + 1}. ${model}`);
        });
        console.log('');
      } else {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('⚠️ 未找到支持视觉功能的模型');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('建议开通以下视觉模型:');
        console.log('  - ERNIE-4.0-8K (推荐)');
        console.log('  - qwen2-vl-7b-instruct');
        console.log('  - deepseek-vl2\n');
      }

      // 显示文本模型
      if (textModels.length > 0) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📝 文本模型');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        textModels.slice(0, 10).forEach((model, index) => {
          console.log(`${index + 1}. ${model}`);
        });
        if (textModels.length > 10) {
          console.log(`... 还有 ${textModels.length - 10} 个文本模型\n`);
        } else {
          console.log('');
        }
      }

      // 显示其他模型
      if (otherModels.length > 0) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔧 其他模型');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        otherModels.slice(0, 5).forEach((model, index) => {
          console.log(`${index + 1}. ${model}`);
        });
        if (otherModels.length > 5) {
          console.log(`... 还有 ${otherModels.length - 5} 个其他模型\n`);
        } else {
          console.log('');
        }
      }

      // 总结
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('总结');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log(`✅ 文本模型: ${textModels.length} 个`);
      console.log(`✅ 视觉模型: ${visionModels.length} 个`);
      console.log(`✅ 其他模型: ${otherModels.length} 个`);
      console.log(`✅ 总计: ${models.length} 个\n`);

      if (visionModels.length === 0) {
        console.log('⚠️ 您还没有开通支持视觉功能的模型');
        console.log('请访问千帆控制台开通: https://console.bce.baidu.com/qianfan/\n');
      } else {
        console.log('🎉 您已开通视觉模型，可以使用MLLM视觉验证功能！\n');
      }

    } else {
      console.error('❌ 响应格式不正确:', response.data);
    }

  } catch (error) {
    console.error('❌ 查询失败:', error.message);

    if (error.response) {
      console.error('\n详细错误信息:');
      console.error('  状态码:', error.response.status);
      console.error('  错误内容:', JSON.stringify(error.response.data, null, 2));
    }

    console.log('\n故障排查:');
    console.log('  1. 检查API密钥是否正确');
    console.log('  2. 确认网络连接正常');
    console.log('  3. 验证账号权限\n');

    process.exit(1);
  }
}

getModels();
