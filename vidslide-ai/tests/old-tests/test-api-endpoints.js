#!/usr/bin/env node
/**
 * VidSlide AI - API端点测试脚本
 * 测试所有可用的API端点
 */

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:3002';

console.log('🧪 VidSlide AI - API端点测试');
console.log('='.repeat(60));

async function testHealthEndpoint() {
  console.log('\n📍 测试 GET /health');
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('  ✅ 状态:', response.data.status);
    console.log('  ✅ 消息:', response.data.message);
    return true;
  } catch (error) {
    console.error('  ❌ 失败:', error.message);
    return false;
  }
}

async function testAutoGenerateEndpoint() {
  console.log('\n📍 测试 POST /api/auto-generate');

  // 检查是否有测试视频
  const testVideoPath = path.join(__dirname, '../test-videos/sample.mp4');

  if (!fs.existsSync(testVideoPath)) {
    console.log('  ⚠️  跳过: 没有找到测试视频');
    console.log('     路径:', testVideoPath);
    console.log('     提示: 请提供一个测试视频文件以进行完整测试');
    return false;
  }

  try {
    const form = new FormData();
    form.append('video', fs.createReadStream(testVideoPath));
    form.append('platform', 'douyin');

    console.log('  📤 上传测试视频...');
    const response = await axios.post(`${BASE_URL}/api/auto-generate`, form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    console.log('  ✅ 任务已创建');
    console.log('     任务ID:', response.data.taskId);
    console.log('     状态URL:', response.data.statusUrl);

    // 轮询任务状态
    const taskId = response.data.taskId;
    console.log('\n  📊 监控任务进度...');

    let completed = false;
    let attempts = 0;
    const maxAttempts = 60; // 最多等待5分钟

    while (!completed && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // 等待5秒

      const statusResponse = await axios.get(`${BASE_URL}/api/auto-generate/${taskId}/status`);
      const status = statusResponse.data;

      console.log(`     [${status.progress}%] ${status.message}`);

      if (status.status === 'completed') {
        console.log('  ✅ 任务完成!');
        console.log('     视频URL:', status.videoUrl);
        console.log('     模板:', status.template);
        completed = true;
      } else if (status.status === 'failed') {
        console.log('  ❌ 任务失败:', status.error);
        return false;
      }

      attempts++;
    }

    if (!completed) {
      console.log('  ⚠️  任务超时');
      return false;
    }

    return true;
  } catch (error) {
    console.error('  ❌ 失败:', error.message);
    if (error.response) {
      console.error('     响应:', error.response.data);
    }
    return false;
  }
}

async function runTests() {
  console.log('\n🚀 开始测试...\n');

  const results = {
    health: false,
    autoGenerate: false
  };

  // 测试health端点
  results.health = await testHealthEndpoint();

  // 测试auto-generate端点
  results.autoGenerate = await testAutoGenerateEndpoint();

  // 总结
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试总结:');
  console.log('  - Health端点:', results.health ? '✅ 通过' : '❌ 失败');
  console.log('  - Auto-generate端点:', results.autoGenerate ? '✅ 通过' : '⚠️  跳过（无测试视频）');

  if (results.health) {
    console.log('\n✅ 服务器运行正常!');
    if (!results.autoGenerate) {
      console.log('\n💡 提示: 要测试完整的视频生成流程，请提供测试视频:');
      console.log('   mkdir -p ../test-videos');
      console.log('   cp /path/to/your/video.mp4 ../test-videos/sample.mp4');
    }
  } else {
    console.log('\n❌ 服务器测试失败');
    process.exit(1);
  }
}

// 运行测试
runTests().catch(error => {
  console.error('\n❌ 测试过程出错:', error.message);
  process.exit(1);
});
