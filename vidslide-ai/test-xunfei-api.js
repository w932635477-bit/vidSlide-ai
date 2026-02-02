import crypto from 'crypto';
import axios from 'axios';
import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

const appId = process.env.XUNFEI_APP_ID;
const apiKey = process.env.XUNFEI_API_KEY;
const apiSecret = process.env.XUNFEI_SECRET_KEY;

console.log('🔍 讯飞API连接测试');
console.log('='.repeat(50));
console.log(`AppID: ${appId?.substring(0, 8)}...`);
console.log(`API Key: ${apiKey?.substring(0, 8)}...`);
console.log(`API Secret: ${apiSecret?.substring(0, 8)}...`);
console.log('='.repeat(50));

// 生成RFC1123格式的日期
function generateRFC1123Date() {
  return new Date().toUTCString();
}

// 生成Digest
function generateDigest() {
  const sha256 = crypto.createHash('sha256').update('').digest();
  return 'SHA-256=' + sha256.toString('base64');
}

// 生成签名
function generateSignature(host, date, requestLine, digest) {
  const signatureOrigin = `host: ${host}\ndate: ${date}\n${requestLine}\ndigest: ${digest}`;
  const hmac = crypto.createHmac('sha256', apiSecret);
  hmac.update(signatureOrigin);
  const signatureSha = hmac.digest();
  return signatureSha.toString('base64');
}

// 生成Authorization
function generateAuthorization(host, date, requestLine, digest) {
  const signature = generateSignature(host, date, requestLine, digest);
  return `api_key="${apiKey}", algorithm="hmac-sha256", headers="host date request-line digest", signature="${signature}"`;
}

// 测试1: 检查HTTPS连接
async function testHttpsConnection() {
  console.log('\n📡 测试1: HTTPS连接测试');
  console.log('-'.repeat(50));

  const uploadHost = 'upload-ost-api.xfyun.cn';
  const uploadUrl = `https://${uploadHost}/file/upload`;

  try {
    const date = generateRFC1123Date();
    const digest = generateDigest();
    const requestLine = 'POST /file/upload HTTP/1.1';
    const authorization = generateAuthorization(uploadHost, date, requestLine, digest);

    console.log('请求配置:');
    console.log(`  URL: ${uploadUrl}`);
    console.log(`  Date: ${date}`);
    console.log(`  Digest: ${digest.substring(0, 20)}...`);
    console.log(`  Authorization: ${authorization.substring(0, 50)}...`);

    // 尝试不同的axios配置
    const configs = [
      {
        name: '配置A: 默认axios',
        config: {
          headers: {
            'date': date,
            'digest': digest,
            'authorization': authorization,
            'content-type': 'multipart/form-data'
          },
          timeout: 10000
        }
      },
      {
        name: '配置B: 带httpsAgent',
        config: {
          headers: {
            'date': date,
            'digest': digest,
            'authorization': authorization,
            'content-type': 'multipart/form-data'
          },
          httpsAgent: new https.Agent({
            rejectUnauthorized: false
          }),
          timeout: 10000
        }
      },
      {
        name: '配置C: 带httpsAgent + 显式协议',
        config: {
          headers: {
            'date': date,
            'digest': digest,
            'authorization': authorization,
            'content-type': 'multipart/form-data'
          },
          httpsAgent: new https.Agent({
            rejectUnauthorized: false,
            keepAlive: true
          }),
          protocol: 'https:',
          timeout: 10000
        }
      }
    ];

    for (const { name, config } of configs) {
      console.log(`\n尝试 ${name}:`);
      try {
        // 发送一个空的POST请求（会失败，但能看到协议是否正确）
        const response = await axios.post(uploadUrl, {}, config);
        console.log(`  ✅ 响应状态: ${response.status}`);
        console.log(`  响应数据:`, response.data);
      } catch (error) {
        if (error.response) {
          console.log(`  ⚠️ HTTP错误: ${error.response.status}`);
          console.log(`  错误数据:`, error.response.data);

          // 检查是否是协议错误
          if (error.response.status === 400 &&
              error.response.data &&
              typeof error.response.data === 'string' &&
              error.response.data.includes('plain HTTP request was sent to HTTPS port')) {
            console.log(`  ❌ 协议错误: 发送了HTTP请求到HTTPS端口`);
          } else {
            console.log(`  ✅ 协议正确（非400协议错误）`);
          }
        } else {
          console.log(`  ❌ 网络错误: ${error.message}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 测试2: 检查API端点可达性
async function testEndpointReachability() {
  console.log('\n\n🌐 测试2: API端点可达性');
  console.log('-'.repeat(50));

  const endpoints = [
    'https://upload-ost-api.xfyun.cn/file/upload',
    'https://ost-api.xfyun.cn/v2/ost/pro_create',
    'https://ost-api.xfyun.cn/v2/ost/query'
  ];

  for (const endpoint of endpoints) {
    console.log(`\n检查: ${endpoint}`);
    try {
      const response = await axios.get(endpoint, {
        timeout: 5000,
        validateStatus: () => true // 接受所有状态码
      });
      console.log(`  ✅ 可达 (状态: ${response.status})`);
    } catch (error) {
      if (error.code === 'ENOTFOUND') {
        console.log(`  ❌ DNS解析失败`);
      } else if (error.code === 'ETIMEDOUT') {
        console.log(`  ❌ 连接超时`);
      } else {
        console.log(`  ⚠️ 错误: ${error.message}`);
      }
    }
  }
}

// 运行所有测试
async function runAllTests() {
  try {
    await testHttpsConnection();
    await testEndpointReachability();

    console.log('\n\n' + '='.repeat(50));
    console.log('✅ 测试完成');
    console.log('='.repeat(50));
  } catch (error) {
    console.error('\n❌ 测试过程出错:', error);
  }
}

runAllTests();
