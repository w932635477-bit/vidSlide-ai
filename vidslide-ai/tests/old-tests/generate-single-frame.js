#!/usr/bin/env node
/**
 * 单帧效果生成器
 * 基于理想效果图，生成一帧完整的视频画面
 */

import { createCanvas, loadImage, registerFont } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 画布尺寸（竖版抖音）
const WIDTH = 1080;
const HEIGHT = 1920;

/**
 * 生成单帧效果
 */
async function generateFrame() {
  console.log('🎨 开始生成单帧效果...');

  // 创建画布
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  // 1. 绘制背景
  console.log('  1️⃣ 绘制背景...');
  drawBackground(ctx);

  // 2. 绘制粒子效果
  console.log('  2️⃣ 绘制粒子效果...');
  drawParticles(ctx);

  // 3. 绘制顶部标题横幅
  console.log('  3️⃣ 绘制标题横幅...');
  drawTitleBanner(ctx);

  // 4. 绘制中间文字
  console.log('  4️⃣ 绘制中间文字...');
  drawMiddleText(ctx);

  // 5. 绘制画中画占位框
  console.log('  5️⃣ 绘制画中画框...');
  drawPIPFrame(ctx);

  // 保存图片
  const outputPath = path.join(__dirname, '../output/single-frame.png');
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ 单帧图片已保存: ${outputPath}`);

  return outputPath;
}

/**
 * 绘制背景
 */
function drawBackground(ctx) {
  // 深色渐变背景
  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, '#0a0a0a');
  gradient.addColorStop(0.5, '#1a1a2e');
  gradient.addColorStop(1, '#0a0a0a');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

/**
 * 绘制粒子效果
 */
function drawParticles(ctx) {
  // 随机生成蓝色粒子
  const particleCount = 100;

  for (let i = 0; i < particleCount; i++) {
    const x = Math.random() * WIDTH;
    const y = Math.random() * HEIGHT;
    const size = Math.random() * 3 + 1;
    const opacity = Math.random() * 0.5 + 0.2;

    // 蓝色系粒子
    const hue = 180 + Math.random() * 60; // 180-240度（蓝色到青色）
    ctx.fillStyle = `hsla(${hue}, 70%, 60%, ${opacity})`;

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * 绘制标题横幅
 */
function drawTitleBanner(ctx) {
  const bannerY = 300;
  const bannerHeight = 160;
  const bannerWidth = WIDTH - 40;
  const bannerX = 20;

  // 绘制蓝色流光背景
  const gradient = ctx.createLinearGradient(bannerX, bannerY, bannerX + bannerWidth, bannerY);
  gradient.addColorStop(0, 'rgba(30, 60, 114, 0.8)');
  gradient.addColorStop(0.5, 'rgba(72, 149, 239, 0.9)');
  gradient.addColorStop(1, 'rgba(30, 60, 114, 0.8)');

  ctx.fillStyle = gradient;
  ctx.shadowColor = 'rgba(72, 149, 239, 0.5)';
  ctx.shadowBlur = 20;

  // 绘制圆角矩形
  roundRect(ctx, bannerX, bannerY, bannerWidth, bannerHeight, 20);
  ctx.fill();

  // 重置阴影
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // 绘制英文标题
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Inference Model', WIDTH / 2, bannerY + 50);

  // 绘制中文标题
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 56px Arial';
  ctx.fillText('推理模型', WIDTH / 2, bannerY + 120);
}

/**
 * 绘制中间文字
 */
function drawMiddleText(ctx) {
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('这个推理模型', WIDTH / 2, 850);
}

/**
 * 绘制画中画框
 */
function drawPIPFrame(ctx) {
  const pipWidth = 500;
  const pipHeight = 650;
  const pipX = (WIDTH - pipWidth) / 2;
  const pipY = 950;
  const cornerRadius = 30;

  // 绘制白色边框
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
  ctx.shadowBlur = 15;

  roundRect(ctx, pipX, pipY, pipWidth, pipHeight, cornerRadius);
  ctx.stroke();

  // 重置阴影
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // 绘制占位文字
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.font = '32px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('[人物视频区域]', WIDTH / 2, pipY + pipHeight / 2);

  // 绘制底部标签
  const labelY = pipY + pipHeight + 40;
  ctx.fillStyle = 'rgba(100, 100, 100, 0.8)';
  ctx.font = 'bold 24px Arial';
  ctx.fillText('小Lin说', WIDTH / 2, labelY);
}

/**
 * 绘制圆角矩形
 */
function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * 将单帧图片和视频合成
 */
async function compositeWithVideo(framePath, videoPath) {
  console.log('\n🎬 开始合成视频...');

  const outputPath = path.join(__dirname, '../output/frame-with-video.mp4');

  // 提取视频的一帧作为画中画
  const pipX = (1080 - 500) / 2;
  const pipY = 950;
  const pipWidth = 500;
  const pipHeight = 650;

  // FFmpeg命令：将视频裁剪并叠加到单帧图片上
  const cmd = `ffmpeg -loop 1 -i "${framePath}" -i "${videoPath}" \
    -filter_complex "\
      [1:v]scale=500:650,setpts=PTS-STARTPTS[pip];\
      [0:v][pip]overlay=${pipX}:${pipY}:shortest=1\
    " \
    -t 5 -c:v libx264 -preset fast -crf 20 -pix_fmt yuv420p "${outputPath}" -y`;

  console.log('  执行FFmpeg合成...');
  await execAsync(cmd);

  console.log(`✅ 视频已生成: ${outputPath}`);
  return outputPath;
}

// 主函数
async function main() {
  try {
    console.log('🚀 单帧效果生成器');
    console.log('='.repeat(60));

    // 生成单帧图片
    const framePath = await generateFrame();

    // 检查是否有测试视频
    const testVideoPath = '/Users/weilei/Desktop/测试视频2.MP4';
    if (fs.existsSync(testVideoPath)) {
      console.log('\n📹 发现测试视频，开始合成...');
      await compositeWithVideo(framePath, testVideoPath);
    } else {
      console.log('\n⚠️  未找到测试视频2.MP4');
      console.log('   单帧图片已生成，可以手动合成');
    }

    console.log('\n🎉 完成！');

  } catch (error) {
    console.error('❌ 生成失败:', error);
    process.exit(1);
  }
}

// 运行
main();
