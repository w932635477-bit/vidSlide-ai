#!/usr/bin/env node

/**
 * 测试视频生成器
 *
 * 用于生成简单的测试视频，用于验证多智能体系统
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TestVideoGenerator {
  constructor() {
    this.outputDir = path.join(__dirname, '../test-videos');
    this.ensureOutputDir();
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * 生成简单的测试视频
   * @param {Object} options - 选项
   * @returns {string} 视频路径
   */
  generateSimpleVideo(options = {}) {
    const {
      duration = 30,
      width = 1920,
      height = 1080,
      fps = 30,
      text = '测试视频',
      filename = 'test-video.mp4'
    } = options;

    const outputPath = path.join(this.outputDir, filename);

    console.log('🎬 生成测试视频...');
    console.log(`  - 时长: ${duration}秒`);
    console.log(`  - 分辨率: ${width}x${height}`);
    console.log(`  - 帧率: ${fps}fps`);

    try {
      // 使用FFmpeg生成测试视频
      // 1. 生成彩色背景
      // 2. 添加文字
      // 3. 添加音频（静音）
      const cmd = `ffmpeg -f lavfi -i color=c=blue:s=${width}x${height}:d=${duration} \
        -vf "drawtext=text='${text}':fontsize=60:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2" \
        -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 \
        -c:v libx264 -c:a aac -shortest -y "${outputPath}"`;

      execSync(cmd, { stdio: 'pipe' });

      console.log(`✅ 测试视频已生成: ${outputPath}`);
      return outputPath;

    } catch (error) {
      console.error('❌ 生成测试视频失败:', error.message);
      throw error;
    }
  }

  /**
   * 生成带语音的测试视频
   * @param {Object} options - 选项
   * @returns {string} 视频路径
   */
  generateVideoWithSpeech(options = {}) {
    const {
      duration = 60,
      text = 'AI人工智能正在改变世界。机器学习和深度学习是AI的核心技术。',
      filename = 'test-video-with-speech.mp4'
    } = options;

    const outputPath = path.join(this.outputDir, filename);

    console.log('🎬 生成带语音的测试视频...');
    console.log(`  - 时长: ${duration}秒`);
    console.log(`  - 文本: ${text}`);

    try {
      // 注意：这里生成的是静音视频
      // 实际的语音需要使用TTS服务
      const cmd = `ffmpeg -f lavfi -i color=c=green:s=1920x1080:d=${duration} \
        -vf "drawtext=text='${text}':fontsize=40:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2" \
        -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 \
        -c:v libx264 -c:a aac -shortest -y "${outputPath}"`;

      execSync(cmd, { stdio: 'pipe' });

      console.log(`✅ 测试视频已生成: ${outputPath}`);
      console.log(`⚠️  注意: 这是静音视频，实际语音需要TTS服务`);
      return outputPath;

    } catch (error) {
      console.error('❌ 生成测试视频失败:', error.message);
      throw error;
    }
  }

  /**
   * 生成多个测试视频
   */
  generateTestSuite() {
    console.log('📦 生成测试视频套件...\n');

    const videos = [];

    // 1. 短视频（10秒）
    console.log('1️⃣  生成短视频（10秒）');
    videos.push(this.generateSimpleVideo({
      duration: 10,
      text: '短视频测试',
      filename: 'test-short-10s.mp4'
    }));
    console.log('');

    // 2. 中等视频（30秒）
    console.log('2️⃣  生成中等视频（30秒）');
    videos.push(this.generateSimpleVideo({
      duration: 30,
      text: '中等视频测试',
      filename: 'test-medium-30s.mp4'
    }));
    console.log('');

    // 3. 长视频（60秒）
    console.log('3️⃣  生成长视频（60秒）');
    videos.push(this.generateSimpleVideo({
      duration: 60,
      text: '长视频测试',
      filename: 'test-long-60s.mp4'
    }));
    console.log('');

    // 4. 带文本的视频
    console.log('4️⃣  生成带文本的视频');
    videos.push(this.generateVideoWithSpeech({
      duration: 45,
      text: 'AI改变世界 机器学习 深度学习',
      filename: 'test-with-text.mp4'
    }));
    console.log('');

    console.log('✅ 测试视频套件生成完成！');
    console.log(`📁 输出目录: ${this.outputDir}`);
    console.log(`📊 生成视频数: ${videos.length}个\n`);

    // 显示视频列表
    console.log('生成的视频:');
    videos.forEach((video, index) => {
      const stats = fs.statSync(video);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
      console.log(`  ${index + 1}. ${path.basename(video)} (${sizeMB}MB)`);
    });

    return videos;
  }

  /**
   * 清理测试视频
   */
  cleanup() {
    console.log('🧹 清理测试视频...');

    if (fs.existsSync(this.outputDir)) {
      const files = fs.readdirSync(this.outputDir);

      for (const file of files) {
        const filePath = path.join(this.outputDir, file);
        fs.unlinkSync(filePath);
        console.log(`  ✓ 删除: ${file}`);
      }

      console.log('✅ 清理完成');
    }
  }
}

// 命令行使用
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new TestVideoGenerator();

  const command = process.argv[2] || 'suite';

  switch (command) {
    case 'simple':
      generator.generateSimpleVideo();
      break;

    case 'speech':
      generator.generateVideoWithSpeech();
      break;

    case 'suite':
      generator.generateTestSuite();
      break;

    case 'cleanup':
      generator.cleanup();
      break;

    default:
      console.log('使用方法:');
      console.log('  node test-video-generator.js simple   - 生成简单测试视频');
      console.log('  node test-video-generator.js speech   - 生成带文本的视频');
      console.log('  node test-video-generator.js suite    - 生成完整测试套件');
      console.log('  node test-video-generator.js cleanup  - 清理测试视频');
  }
}

export default TestVideoGenerator;
