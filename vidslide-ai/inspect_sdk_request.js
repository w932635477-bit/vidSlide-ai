/**
 * 拦截SDK请求以查看Authorization header
 */

import dotenv from 'dotenv';
import { ChatCompletion, setEnvVariable } from '@baiducloud/qianfan';
import http from 'http';
import https from 'https';

dotenv.config();

// 拦截HTTP/HTTPS请求
const originalRequest = https.request;
https.request = function(...args) {
  const req = originalRequest.apply(this, args);

  const originalWrite = req.write;
  const originalEnd = req.end;

  req.write = function(chunk, encoding, callback) {
    console.log('\n📤 请求体:', chunk?.toString());
    return originalWrite.call(this, chunk, encoding, callback);
  };

  req.end = function(chunk, encoding, callback) {
    console.log('\n📋 请求头:');
    console.log(JSON.stringify(req.getHeaders(), null, 2));
    return originalEnd.call(this, chunk, encoding, callback);
  };

  return req;
};

async function inspectSDKRequest() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('拦截千帆SDK请求');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const accessKey = process.env.QIANFAN_ACCESS_KEY;
  const secretKey = process.env.QIANFAN_SECRET_KEY;

  setEnvVariable('QIANFAN_ACCESS_KEY', accessKey);
  setEnvVariable('QIANFAN_SECRET_KEY', secretKey);

  const client = new ChatCompletion();

  console.log('正在发送测试请求...\n');

  try {
    const response = await client.chat({
      messages: [
        {
          role: 'user',
          content: '你好'
        }
      ],
      model: 'ERNIE-4.0-8K'
    });

    console.log('\n✅ 响应成功');
    console.log('结果:', response.result);

  } catch (error) {
    console.error('\n❌ 请求失败:', error.message);
  }
}

inspectSDKRequest();
