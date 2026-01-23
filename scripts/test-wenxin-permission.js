/**
 * 文心一言API权限测试脚本
 * 用于验证API密钥是否有权限访问文心一言服务
 */

import { WENXIN_CONFIG } from '../src/config/api-keys.js';

console.log('\n' + '='.repeat(60));
console.log('🔑 文心一言API权限测试');
console.log('='.repeat(60));

async function testWenxinAPI() {
  try {
    // 1. 获取Access Token
    console.log('\n步骤1: 获取Access Token...');
    const tokenUrl = `${WENXIN_CONFIG.baseUrl}/oauth/2.0/token?grant_type=client_credentials&client_id=${WENXIN_CONFIG.apiKey}&client_secret=${WENXIN_CONFIG.secretKey}`;

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!tokenResponse.ok) {
      throw new Error(`获取Token失败: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(`Token错误: ${tokenData.error_description || tokenData.error}`);
    }

    console.log('✅ Access Token获取成功');
    console.log(`   Token: ${tokenData.access_token.substring(0, 20)}...`);
    console.log(`   有效期: ${tokenData.expires_in}秒 (约${Math.floor(tokenData.expires_in / 86400)}天)`);

    // 2. 测试API调用
    console.log('\n步骤2: 测试文心一言API调用...');
    const apiUrl = `${WENXIN_CONFIG.baseUrl}/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/${WENXIN_CONFIG.model}?access_token=${tokenData.access_token}`;

    const testMessage = {
      messages: [
        {
          role: 'user',
          content: '你好，请用一句话介绍你自己。'
        }
      ]
    };

    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testMessage)
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      throw new Error(`API调用失败 [${apiResponse.status}]: ${errorText}`);
    }

    const apiData = await apiResponse.json();

    if (apiData.error_code) {
      throw new Error(`API错误 [${apiData.error_code}]: ${apiData.error_msg}`);
    }

    console.log('✅ API调用成功');
    console.log(`   模型: ${WENXIN_CONFIG.model}`);
    console.log(`   响应: ${apiData.result}`);

    // 3. 测试JSON输出
    console.log('\n步骤3: 测试JSON格式输出...');
    const jsonTestMessage = {
      messages: [
        {
          role: 'user',
          content: '请以JSON格式输出：{"keywords": ["测试", "成功"], "status": "ok"}'
        }
      ]
    };

    const jsonResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jsonTestMessage)
    });

    const jsonData = await jsonResponse.json();

    if (jsonData.error_code) {
      throw new Error(`JSON测试失败 [${jsonData.error_code}]: ${jsonData.error_msg}`);
    }

    console.log('✅ JSON格式输出测试成功');
    console.log(`   响应: ${jsonData.result}`);

    // 最终结果
    console.log('\n' + '='.repeat(60));
    console.log('✅ 所有测试通过！文心一言API权限正常');
    console.log('='.repeat(60));
    console.log('\n📌 下一步: 运行完整测试');
    console.log('   命令: node scripts/test-phase2-content-analyst.js');
    console.log('='.repeat(60));

    return true;

  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.log('❌ 测试失败');
    console.log('='.repeat(60));
    console.error('\n错误信息:', error.message);

    console.log('\n💡 可能的原因:');
    console.log('   1. API密钥未开通文心一言服务权限');
    console.log('   2. API密钥配置错误');
    console.log('   3. 账号未实名认证');
    console.log('   4. 免费额度已用完');

    console.log('\n🔧 解决方案:');
    console.log('   1. 访问: https://console.bce.baidu.com/qianfan/ais/console/applicationConsole/application');
    console.log('   2. 创建新应用或检查现有应用权限');
    console.log('   3. 确保开通了ERNIE Bot服务');
    console.log('   4. 更新 src/config/api-keys.js 中的密钥');

    return false;
  }
}

// 运行测试
testWenxinAPI();
