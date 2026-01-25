import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.BAIDU_ASR_API_KEY;
const secretKey = process.env.BAIDU_ASR_SECRET_KEY;

console.log('测试使用现有的百度ASR密钥访问文心一言...\n');
console.log('API Key:', apiKey.substring(0, 8) + '...');
console.log('Secret Key:', secretKey.substring(0, 8) + '...\n');

async function testKey() {
  try {
    // 获取Access Token
    const tokenUrl = 'https://aip.baidubce.com/oauth/2.0/token';
    const response = await axios.get(tokenUrl, {
      params: {
        grant_type: 'client_credentials',
        client_id: apiKey,
        client_secret: secretKey
      }
    });

    if (response.data.error) {
      console.error('❌ 获取Token失败:', response.data.error_description);
      return;
    }

    const accessToken = response.data.access_token;
    console.log('✅ Access Token获取成功\n');

    // 测试文心一言API
    const chatUrl = 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions';
    
    try {
      const chatResponse = await axios.post(
        `${chatUrl}?access_token=${accessToken}`,
        {
          messages: [{ role: 'user', content: '你好' }]
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        }
      );

      if (chatResponse.data.error_code) {
        console.log('⚠️ 文心一言API访问受限:', chatResponse.data.error_msg);
        console.log('\n说明: 百度ASR的API Key无法访问文心一言服务');
        console.log('需要单独申请文心一言的API Key\n');
      } else {
        console.log('✅ 文心一言API可用！');
        console.log('回复:', chatResponse.data.result);
        console.log('\n可以直接使用现有的百度API Key！\n');
      }
    } catch (error) {
      if (error.response?.data?.error_code) {
        console.log('⚠️ 文心一言API权限问题');
        console.log('错误码:', error.response.data.error_code);
        console.log('错误信息:', error.response.data.error_msg);
        console.log('\n需要单独开通文心一言服务\n');
      } else {
        console.error('❌ 请求失败:', error.message);
      }
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testKey();
