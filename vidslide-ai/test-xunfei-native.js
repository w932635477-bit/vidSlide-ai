import crypto from 'crypto';
import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

const appId = process.env.XUNFEI_APP_ID;
const apiKey = process.env.XUNFEI_API_KEY;
const apiSecret = process.env.XUNFEI_SECRET_KEY;

console.log('🔍 讯飞API原生HTTPS测试');
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

// 使用原生https模块测试
function testWithNativeHttps() {
  return new Promise((resolve, reject) => {
    const uploadHost = 'upload-ost-api.xfyun.cn';
    const date = generateRFC1123Date();
    const digest = generateDigest();
    const requestLine = 'POST /file/upload HTTP/1.1';
    const authorization = generateAuthorization(uploadHost, date, requestLine, digest);

    console.log('\n📡 使用原生HTTPS模块测试');
    console.log('-'.repeat(50));
    console.log(`Host: ${uploadHost}`);
    console.log(`Date: ${date}`);

    const options = {
      hostname: uploadHost,
      port: 443,
      path: '/file/upload',
      method: 'POST',
      headers: {
        'date': date,
        'digest': digest,
        'authorization': authorization,
        'content-type': 'multipart/form-data',
        'content-length': 0
      },
      rejectUnauthorized: false
    };

    console.log('\n请求选项:');
    console.log(JSON.stringify(options, null, 2));

    const req = https.request(options, (res) => {
      console.log(`\n✅ 响应状态: ${res.statusCode}`);
      console.log(`响应头:`, res.headers);

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`\n响应体:`, data);

        if (res.statusCode === 400 && data.includes('plain HTTP request was sent to HTTPS port')) {
          console.log('\n❌ 协议错误: 即使使用原生HTTPS模块也出现协议错误');
          console.log('这表明问题可能在于:');
          console.log('  1. 讯飞API服务器配置问题');
          console.log('  2. 请求头格式问题');
          console.log('  3. 认证签名问题');
        } else {
          console.log('\n✅ 协议正确（非400协议错误）');
        }

        resolve();
      });
    });

    req.on('error', (error) => {
      console.error(`\n❌ 请求错误: ${error.message}`);
      reject(error);
    });

    req.end();
  });
}

// 运行测试
testWithNativeHttps()
  .then(() => {
    console.log('\n' + '='.repeat(50));
    console.log('✅ 测试完成');
    console.log('='.repeat(50));
  })
  .catch((error) => {
    console.error('\n❌ 测试失败:', error);
  });
