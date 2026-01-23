#!/usr/bin/env node
/**
 * 测试新功能是否正常工作
 * 验证竖版画中画和翻转动画集成
 */

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:3002';

console.log('🧪 测试新功能集成');
console.log('='.repeat(60));

async function testNewFeatures() {
  const testVideoPath = path.join(__dirname, '../test-videos/sample.mp4');

  if (!fs.existsSync(testVideoPath)) {
    console.log('❌ 测试视频不存在:', testVideoPath);
    return;
  }

  try {
    console.log('\n📤 上传测试视频...');
    const form = new FormData();
    form.append('video', fs.createReadStream(testVideoPath));
    form.append('platform', 'douyin');

    const response = await axios.post(`${BASE_URL}/api/auto-generate`, form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    const taskId = response.data.taskId;
    console.log('✅ 任务已创建:', taskId);

    // 监控任务进度
    console.log('\n📊 监控任务进度...');
    let completed = false;
    let attempts = 0;

    while (!completed && attempts < 60) {
      await new Promise(resolve => setTimeout(resolve, 5000));

      const statusResponse = await axios.get(`${BASE_URL}/api/auto-generate/${taskId}/status`);
      const status = statusResponse.data;

      console.log(`  [${status.progress}%] ${status.message}`);

      if (status.status === 'completed') {
        console.log('\n✅ 任务完成!');
        console.log('  视频URL:', status.videoUrl);
        console.log('  模板:', status.template);

        // 检查生成的视频
        const videoPath = status.videoPath;
        if (fs.existsSync(videoPath)) {
          const stats = fs.statSync(videoPath);
          console.log('  文件大小:', (stats.size / 1024).toFixed(2), 'KB');

          // 使用ffprobe检查视频信息
          const { exec } = await import('child_process');
          const { promisify } = await import('util');
          const execAsync = promisify(exec);

          try {
            const { stdout } = await execAsync(`ffprobe -v quiet -print_format json -show_format -show_streams "${videoPath}"`);
            const info = JSON.parse(stdout);
            const videoStream = info.streams.find(s => s.codec_type === 'video');

            console.log('\n📹 视频信息:');
            console.log('  分辨率:', `${videoStream.width}x${videoStream.height}`);
            console.log('  编码:', videoStream.codec_name);
            console.log('  帧率:', videoStream.r_frame_rate);
            console.log('  时长:', info.format.duration, '秒');

            // 验证是否为竖版
            if (videoStream.width === 1080 && videoStream.height === 1920) {
              console.log('\n✅ 竖版格式正确 (9:16)');
            } else {
              console.log('\n⚠️  视频格式:', `${videoStream.width}x${videoStream.height}`);
            }
          } catch (error) {
            console.log('  (无法获取详细视频信息)');
          }
        }

        completed = true;
      } else if (status.status === 'failed') {
        console.log('\n❌ 任务失败:', status.error);
        return;
      }

      attempts++;
    }

    if (!completed) {
      console.log('\n⚠️  任务超时');
    }

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应:', error.response.data);
    }
  }
}

// 运行测试
testNewFeatures().catch(error => {
  console.error('测试过程出错:', error.message);
  process.exit(1);
});
