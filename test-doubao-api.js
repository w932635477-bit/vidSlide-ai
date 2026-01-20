/**
 * 豆包API连接测试脚本
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// 读取 .env 文件
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env = {};

  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      env[key] = value;
    }
  });

  return env;
}

const env = loadEnv();

async function testDoubaoAPI() {
  console.log('🧪 开始测试豆包API连接...\n');

  const apiKey = env.DOUBAO_API_KEY;
  const endpoint = env.DOUBAO_API_ENDPOINT;
  const model = env.DOUBAO_MODEL;

  console.log('📋 配置信息:');
  console.log(`  - API Key: ${apiKey ? apiKey.substring(0, 10) + '...' : '未配置'}`);
  console.log(`  - Endpoint: ${endpoint || '未配置'}`);
  console.log(`  - Model: ${model || '未配置'}\n`);

  if (!apiKey) {
    console.error('❌ 错误: DOUBAO_API_KEY 未配置');
    process.exit(1);
  }

  try {
    console.log('🚀 发送测试请求...');

    const url = new URL(endpoint);
    const postData = JSON.stringify({
      model: model,
      prompt: '科技感，蓝紫色调，简洁现代，纯色背景，居中构图',
      n: 1,
      size: '1920x1920',
      quality: 'standard',
      style: 'vivid'
    });

    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const response = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            resolve({ statusCode: res.statusCode, data: jsonData });
          } catch (e) {
            resolve({ statusCode: res.statusCode, data: data });
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('请求超时'));
      });

      req.write(postData);
      req.end();
    });

    if (response.statusCode === 200) {
      console.log('✅ API连接成功！\n');
      console.log('📊 响应数据:');
      console.log(JSON.stringify(response.data, null, 2));

      if (response.data && response.data.data && response.data.data[0]) {
        console.log('\n🎨 生成的图片URL:');
        console.log(response.data.data[0].url);
      }

      console.log('\n✅ 测试通过！豆包API配置正确。');
      return true;
    } else {
      console.error(`\n❌ API返回错误状态码: ${response.statusCode}`);
      console.error('响应内容:', JSON.stringify(response.data, null, 2));
      return false;
    }

  } catch (error) {
    console.error('\n❌ API调用失败:');
    console.error(`  - 错误: ${error.message}`);

    console.log('\n💡 建议:');
    console.log('  1. 检查API密钥是否正确');
    console.log('  2. 检查API端点URL是否正确');
    console.log('  3. 检查网络连接');
    console.log('  4. 查看豆包API文档确认请求格式');

    return false;
  }
}

// 运行测试
testDoubaoAPI()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ 测试脚本执行失败:', error);
    process.exit(1);
  });
