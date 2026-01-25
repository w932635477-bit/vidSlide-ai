/**
 * 使用千帆SDK查询可用模型列表
 */

import dotenv from 'dotenv';
import { ChatCompletion, Image2Text, setEnvVariable } from '@baiducloud/qianfan';

dotenv.config();

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('千帆可用模型测试');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

async function testModels() {
  const accessKey = process.env.QIANFAN_ACCESS_KEY;
  const secretKey = process.env.QIANFAN_SECRET_KEY;

  if (!accessKey || !secretKey) {
    console.error('❌ 千帆V2密钥未配置');
    process.exit(1);
  }

  console.log('✅ Access Key已配置:', accessKey.substring(0, 8) + '...\n');

  // 设置环境变量
  setEnvVariable('QIANFAN_ACCESS_KEY', accessKey);
  setEnvVariable('QIANFAN_SECRET_KEY', secretKey);

  // 测试不同的模型
  const modelsToTest = [
    { name: 'ERNIE-4.0-8K', type: '视觉模型', desc: '文心一言4.0 (支持视觉)' },
    { name: 'ERNIE-3.5-8K', type: '文本模型', desc: '文心一言3.5' },
    { name: 'ERNIE-Speed-128K', type: '文本模型', desc: '文心一言极速版' },
    { name: 'qwen2-vl-7b-instruct', type: '视觉模型', desc: '通义千问视觉版' },
    { name: 'deepseek-vl2', type: '视觉模型', desc: 'DeepSeek视觉版' },
  ];

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('测试各模型可用性');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const availableModels = [];
  const unavailableModels = [];

  for (const modelInfo of modelsToTest) {
    try {
      console.log(`正在测试: ${modelInfo.name} (${modelInfo.desc})...`);

      const client = new ChatCompletion();
      const response = await client.chat({
        messages: [
          {
            role: 'user',
            content: '你好'
          }
        ],
        model: modelInfo.name
      });

      console.log(`  ✅ 可用 - ${modelInfo.type}\n`);
      availableModels.push(modelInfo);

    } catch (error) {
      const errorMsg = error.message || JSON.stringify(error);

      // 判断错误类型
      if (errorMsg.includes('336005') || errorMsg.includes('API name not exist')) {
        console.log(`  ❌ 未开通 - ${modelInfo.type}\n`);
        unavailableModels.push({ ...modelInfo, reason: '未开通' });
      } else if (errorMsg.includes('336004') || errorMsg.includes('quota')) {
        console.log(`  ⚠️ 配额不足 - ${modelInfo.type}\n`);
        availableModels.push({ ...modelInfo, note: '配额不足' });
      } else {
        console.log(`  ❓ 其他错误: ${errorMsg.substring(0, 100)}\n`);
        unavailableModels.push({ ...modelInfo, reason: '其他错误' });
      }
    }
  }

  // 总结
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('测试总结');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (availableModels.length > 0) {
    console.log('✅ 可用模型:\n');
    availableModels.forEach(model => {
      const note = model.note ? ` (${model.note})` : '';
      console.log(`  - ${model.name} - ${model.desc}${note}`);
    });
    console.log('');
  }

  if (unavailableModels.length > 0) {
    console.log('❌ 未开通或不可用的模型:\n');
    unavailableModels.forEach(model => {
      console.log(`  - ${model.name} - ${model.desc} (${model.reason})`);
    });
    console.log('');
  }

  // 检查是否有视觉模型
  const hasVisionModel = availableModels.some(m => m.type === '视觉模型');

  if (hasVisionModel) {
    console.log('🎉 您已开通视觉模型，可以使用MLLM视觉验证功能！\n');
    console.log('下一步:');
    console.log('  运行 USE_MOCK_VALIDATION=false node test_e2e_real_video.js');
    console.log('  使用MLLM模式进行端到端测试\n');
  } else {
    console.log('⚠️ 您还没有开通支持视觉功能的模型\n');
    console.log('推荐开通: ERNIE-4.0-8K 或 qwen2-vl-7b-instruct');
    console.log('访问千帆控制台开通: https://console.bce.baidu.com/qianfan/\n');
    console.log('暂时可以使用Mock模式进行测试:');
    console.log('  USE_MOCK_VALIDATION=true node test_e2e_real_video.js\n');
  }
}

testModels().catch(error => {
  console.error('\n❌ 测试过程中发生错误:', error.message);
  process.exit(1);
});
