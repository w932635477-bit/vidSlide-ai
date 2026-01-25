/**
 * API密钥测试脚本
 *
 * 用途：验证文心一言API密钥是否有效，以及是否有视觉模型访问权限
 */

import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('文心一言API密钥测试');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

async function testAPIKey() {
  // 1. 检查密钥是否配置
  console.log('步骤1: 检查密钥配置');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const apiKey = process.env.WENXIN_API_KEY;
  const secretKey = process.env.WENXIN_SECRET_KEY;

  if (!apiKey || !secretKey) {
    console.error('❌ API密钥未配置');
    console.log('\n请在.env文件中配置:');
    console.log('  WENXIN_API_KEY=your_api_key');
    console.log('  WENXIN_SECRET_KEY=your_secret_key');
    process.exit(1);
  }

  console.log('✅ API Key已配置:', apiKey.substring(0, 8) + '...');
  console.log('✅ Secret Key已配置:', secretKey.substring(0, 8) + '...\n');

  // 2. 测试获取Access Token
  console.log('步骤2: 测试获取Access Token');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const tokenUrl = 'https://aip.baidubce.com/oauth/2.0/token';
    const response = await axios.get(tokenUrl, {
      params: {
        grant_type: 'client_credentials',
        client_id: apiKey,
        client_secret: secretKey
      }
    });

    if (response.data.error) {
      console.error('❌ 获取Access Token失败:', response.data.error_description);
      console.log('\n可能的原因:');
      console.log('  1. API Key或Secret Key错误');
      console.log('  2. 网络连接问题');
      console.log('  3. 账号权限问题');
      process.exit(1);
    }

    const accessToken = response.data.access_token;
    const expiresIn = response.data.expires_in;

    console.log('✅ Access Token获取成功');
    console.log(`   Token前8位: ${accessToken.substring(0, 8)}...`);
    console.log(`   有效期: ${expiresIn}秒 (${(expiresIn / 86400).toFixed(0)}天)\n`);

    // 3. 测试文本聊天API
    console.log('步骤3: 测试文本聊天API');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const chatUrl = 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions';

    const chatResponse = await axios.post(
      `${chatUrl}?access_token=${accessToken}`,
      {
        messages: [
          {
            role: 'user',
            content: '你好，请回复"测试成功"三个字'
          }
        ]
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (chatResponse.data.error_code) {
      console.error('❌ 文本聊天API调用失败:', chatResponse.data.error_msg);
      process.exit(1);
    }

    console.log('✅ 文本聊天API调用成功');
    console.log(`   AI回复: ${chatResponse.data.result}\n`);

    // 4. 测试视觉模型API（可选，如果失败不影响整体判断）
    console.log('步骤4: 测试视觉模型API（ERNIE-4.0-Turbo-128K）');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
      const visionUrl = 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/ernie-4.0-turbo-128k';

      const visionResponse = await axios.post(
        `${visionUrl}?access_token=${accessToken}`,
        {
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: '你好，请回复"视觉模型测试成功"'
                }
              ]
            }
          ]
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        }
      );

      if (visionResponse.data.error_code) {
        console.warn('⚠️ 视觉模型API调用失败:', visionResponse.data.error_msg);
        console.log('\n可能的原因:');
        console.log('  1. 账号未开通ERNIE-4.0-Turbo-128K模型权限');
        console.log('  2. 模型配额不足');
        console.log('  3. 需要在千帆控制台申请开通\n');
        console.log('解决方案:');
        console.log('  访问: https://console.bce.baidu.com/qianfan/ais/console/applicationConsole/application');
        console.log('  开通 ERNIE-4.0-Turbo-128K 模型访问权限\n');
      } else {
        console.log('✅ 视觉模型API调用成功');
        console.log(`   AI回复: ${visionResponse.data.result}\n`);
      }

    } catch (error) {
      if (error.response?.data?.error_code === 336007) {
        console.warn('⚠️ 视觉模型未开通或无权限');
        console.log('\n需要开通ERNIE-4.0-Turbo-128K模型:');
        console.log('  1. 访问千帆控制台: https://console.bce.baidu.com/qianfan/');
        console.log('  2. 选择"应用接入" → "服务管理"');
        console.log('  3. 开通"ERNIE-4.0-Turbo-128K"模型\n');
      } else {
        console.warn('⚠️ 视觉模型测试失败:', error.message);
      }
    }

    // 总结
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('测试总结');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✅ API密钥有效');
    console.log('✅ 文本聊天功能正常');
    console.log('');
    console.log('下一步:');
    console.log('  1. 如果视觉模型测试失败，请开通ERNIE-4.0-Turbo-128K权限');
    console.log('  2. 运行 node test_mllm_vision_api.js 测试完整功能');
    console.log('  3. 或继续使用Mock模式 (USE_MOCK_VALIDATION=true)\n');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);

    if (error.response) {
      console.error('\n详细错误信息:');
      console.error('  状态码:', error.response.status);
      console.error('  错误内容:', error.response.data);
    }

    console.log('\n故障排查:');
    console.log('  1. 检查API密钥是否正确（无多余空格）');
    console.log('  2. 确认网络连接正常');
    console.log('  3. 验证账号是否已激活\n');

    process.exit(1);
  }
}

testAPIKey();
