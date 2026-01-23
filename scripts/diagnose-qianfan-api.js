/**
 * 千帆平台API密钥诊断脚本
 * 帮助确定正确的API调用方式
 */

console.log('\n' + '='.repeat(60));
console.log('🔍 千帆平台API密钥诊断');
console.log('='.repeat(60));

// 从环境变量或配置文件获取API密钥
const apiKey = process.env.QIANFAN_ACCESS_KEY || 'YOUR_API_KEY_HERE';
const secretKey = process.env.QIANFAN_SECRET_KEY || 'YOUR_SECRET_KEY_HERE';

console.log('\n提供的密钥信息:');
console.log('  API Key:', apiKey);
console.log('  Secret Key:', secretKey.substring(0, 10) + '...');

console.log('\n正在测试不同的认证方式...\n');

// 方式1: 标准百度AI平台认证
async function testMethod1() {
  console.log('方式1: 标准百度AI平台 OAuth 2.0');
  try {
    const url = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`;
    const response = await fetch(url, { method: 'POST' });
    const data = await response.json();

    if (data.access_token) {
      console.log('  ✅ 成功！');
      console.log('  Access Token:', data.access_token.substring(0, 20) + '...');
      return { success: true, token: data.access_token };
    } else {
      console.log('  ❌ 失败:', data.error_description || data.error);
      return { success: false, error: data };
    }
  } catch (error) {
    console.log('  ❌ 错误:', error.message);
    return { success: false, error: error.message };
  }
}

// 方式2: 千帆平台直接认证
async function testMethod2() {
  console.log('\n方式2: 千帆平台直接API调用');
  try {
    // 千帆平台可能支持直接使用API Key
    const url = 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/ernie-3.5-8k';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: '你好' }]
      })
    });

    const data = await response.json();
    console.log('  响应:', JSON.stringify(data, null, 2));

    if (data.result) {
      console.log('  ✅ 成功！');
      return { success: true };
    } else {
      console.log('  ❌ 失败');
      return { success: false, error: data };
    }
  } catch (error) {
    console.log('  ❌ 错误:', error.message);
    return { success: false, error: error.message };
  }
}

// 运行测试
async function runDiagnostics() {
  const result1 = await testMethod1();

  if (!result1.success) {
    await testMethod2();
  }

  console.log('\n' + '='.repeat(60));
  console.log('💡 诊断建议');
  console.log('='.repeat(60));

  console.log('\n如果所有方式都失败，请检查:');
  console.log('  1. 在千帆控制台中，点击应用名称进入详情页');
  console.log('  2. 查找"API Key"和"Secret Key"标签');
  console.log('  3. 确认复制的是"API Key"而不是"Access Key"');
  console.log('  4. 确认应用已开通ERNIE-3.5-8K服务');
  console.log('\n控制台地址:');
  console.log('  https://console.bce.baidu.com/qianfan/ais/console/applicationConsole/application');

  console.log('\n' + '='.repeat(60));
}

runDiagnostics();
