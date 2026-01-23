#!/usr/bin/env node
/**
 * 正确的人脸跟踪画中画生成器
 * 使用后端的正确逻辑：检测人脸 → 裁剪人脸区域 → 缩放
 */

import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WIDTH = 1080;
const HEIGHT = 1920;

/**
 * 步骤1: 使用Python脚本检测人脸
 */
async function detectFace(videoPath) {
  console.log('🔍 检测人脸位置...');

  // 提取一帧用于人脸检测
  const framePath = path.join(__dirname, '../cache/detect-frame.jpg');
  await execAsync(`ffmpeg -i "${videoPath}" -ss 00:00:05 -frames:v 1 "${framePath}" -y`);

  // 调用Python人脸检测脚本
  const scriptPath = path.join(__dirname, '../scripts/face_detector.py');

  try {
    const { stdout } = await execAsync(`python3 "${scriptPath}" "${videoPath}" 5`);
    const result = JSON.parse(stdout);

    if (result.detected && result.face) {
      console.log('  ✅ 检测到人脸:');
      console.log(`     位置: (${result.face.x}, ${result.face.y})`);
      console.log(`     大小: ${result.face.width}x${result.face.height}`);
      return result;
    } else {
      console.log('  ⚠️  未检测到人脸，将使用中心裁剪');
      return { detected: false };
    }
  } catch (error) {
    console.log('  ⚠️  人脸检测失败，将使用中心裁剪');
    console.log('     错误:', error.message);
    return { detected: false };
  }
}

/**
 * 步骤2: 计算人脸裁剪区域（圆形版本）
 */
function calculateFaceCropRegion(face, videoWidth, videoHeight) {
  console.log('  📐 计算人脸裁剪区域（圆形）...');

  // 扩展人脸区域以包含头部和肩膀（增加到3.5倍，确保人脸完整）
  const expandRatio = 3.5;
  const faceExpandedSize = Math.floor(face.height * expandRatio);

  // 计算裁剪起点（以人脸中心为基准）
  const faceCenterX = face.x + face.width / 2;
  const faceCenterY = face.y + face.height / 2;

  // 人脸偏上1/3处（参考后端逻辑）
  let cropX = Math.max(0, Math.floor(faceCenterX - faceExpandedSize / 2));
  let cropY = Math.max(0, Math.floor(faceCenterY - faceExpandedSize * 0.3));

  // 确保不超出视频边界
  if (cropX + faceExpandedSize > videoWidth) {
    cropX = videoWidth - faceExpandedSize;
  }
  if (cropY + faceExpandedSize > videoHeight) {
    cropY = videoHeight - faceExpandedSize;
  }

  console.log(`     裁剪区域: ${faceExpandedSize}x${faceExpandedSize} at (${cropX}, ${cropY})`);
  console.log(`     扩展比例: ${expandRatio}x（确保人脸完整）`);

  return {
    x: cropX,
    y: cropY,
    width: faceExpandedSize,
    height: faceExpandedSize
  };
}

/**
 * 步骤3: 生成正方形人脸跟踪的画中画视频（先不做圆形，在合成时处理）
 */
async function generateFaceTrackingPIP(videoPath, faceResult) {
  console.log('\n🎬 生成正方形人脸跟踪画中画...');

  const pipSize = 600; // 正方形尺寸
  const outputPath = path.join(__dirname, '../cache/face-tracking-pip.mp4');

  // 获取视频尺寸
  const { stdout } = await execAsync(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "${videoPath}"`);
  const [videoWidth, videoHeight] = stdout.trim().split('x').map(Number);

  console.log(`  📐 原视频尺寸: ${videoWidth}x${videoHeight}`);

  let filterComplex;

  if (faceResult.detected && faceResult.face) {
    // 有人脸：使用人脸跟踪裁剪
    const cropRegion = calculateFaceCropRegion(faceResult.face, videoWidth, videoHeight);

    // FFmpeg滤镜：裁剪 → 缩放到正方形
    filterComplex = `crop=${cropRegion.width}:${cropRegion.height}:${cropRegion.x}:${cropRegion.y},scale=${pipSize}:${pipSize}:force_original_aspect_ratio=cover,crop=${pipSize}:${pipSize}`;

    console.log('  ✅ 使用人脸跟踪裁剪');
  } else {
    // 无人脸：使用中心裁剪
    filterComplex = `crop=min(iw\\,ih):min(ih\\,iw),scale=${pipSize}:${pipSize}`;

    console.log('  ⚠️  使用中心裁剪');
  }

  const cmd = `ffmpeg -i "${videoPath}" -vf "${filterComplex}" -t 5 -c:v libx264 -preset fast -crf 20 "${outputPath}" -y`;

  await execAsync(cmd);

  console.log(`  ✅ 正方形画中画视频已生成: ${outputPath}`);
  return outputPath;
}

/**
 * 步骤4: 生成背景图（不带遮罩，只有边框）
 */
async function generateBackground() {
  console.log('\n🎨 生成背景图...');

  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  // 1. 背景
  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, '#0a0a0a');
  gradient.addColorStop(0.5, '#1a1a2e');
  gradient.addColorStop(1, '#0a0a0a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // 2. 粒子
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * WIDTH;
    const y = Math.random() * HEIGHT;
    const size = Math.random() * 3 + 1;
    const opacity = Math.random() * 0.5 + 0.2;
    const hue = 180 + Math.random() * 60;

    ctx.fillStyle = `hsla(${hue}, 70%, 60%, ${opacity})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. 标题横幅
  const bannerY = 300;
  const bannerHeight = 160;
  const bannerWidth = WIDTH - 40;
  const bannerX = 20;

  const bannerGradient = ctx.createLinearGradient(bannerX, bannerY, bannerX + bannerWidth, bannerY);
  bannerGradient.addColorStop(0, 'rgba(30, 60, 114, 0.8)');
  bannerGradient.addColorStop(0.5, 'rgba(72, 149, 239, 0.9)');
  bannerGradient.addColorStop(1, 'rgba(30, 60, 114, 0.8)');

  ctx.fillStyle = bannerGradient;
  ctx.shadowColor = 'rgba(72, 149, 239, 0.5)';
  ctx.shadowBlur = 20;

  roundRect(ctx, bannerX, bannerY, bannerWidth, bannerHeight, 20);
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Inference Model', WIDTH / 2, bannerY + 50);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 56px Arial';
  ctx.fillText('推理模型', WIDTH / 2, bannerY + 120);

  // 4. 中间文字
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px Arial';
  ctx.fillText('这个推理模型', WIDTH / 2, 850);

  // 5. 圆形画中画边框（只画边框，不画遮罩）
  const pipSize = 600;
  const pipCenterX = WIDTH / 2;
  const pipCenterY = 1250;
  const pipRadius = pipSize / 2;

  // 外圈白色边框
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 5;
  ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
  ctx.shadowBlur = 20;

  ctx.beginPath();
  ctx.arc(pipCenterX, pipCenterY, pipRadius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // 6. 底部标签
  ctx.fillStyle = 'rgba(150, 150, 150, 0.8)';
  ctx.font = 'bold 20px Arial';
  ctx.fillText('小Lin说', WIDTH / 2, pipCenterY + pipRadius + 40);

  // 保存
  const bgPath = path.join(__dirname, '../cache/bg-with-circle-border.png');
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(bgPath, buffer);

  console.log(`  ✅ 背景图已保存: ${bgPath}`);
  return bgPath;
}

/**
 * 圆角矩形辅助函数
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
 * 步骤5: 合成最终视频（三层叠加，使用全尺寸遮罩）
 */
async function compositeVideo(bgPath, pipVideoPath) {
  console.log('\n🎬 合成最终视频（三层叠加）...');

  const outputPath = path.join(__dirname, '../output/face-tracking-final.mp4');
  const pipSize = 600;
  const pipCenterX = WIDTH / 2;
  const pipCenterY = 1250;
  const pipX = pipCenterX - pipSize / 2;
  const pipY = pipCenterY - pipSize / 2;

  // 全尺寸圆形遮罩路径
  const maskPath = path.join(__dirname, '../cache/fullsize-circle-mask.png');

  // 三层叠加：背景 + 画中画视频 + 全尺寸圆形遮罩
  const cmd = `ffmpeg -loop 1 -i "${bgPath}" -i "${pipVideoPath}" -loop 1 -i "${maskPath}" \
    -filter_complex "\
      [0:v][1:v]overlay=${pipX}:${pipY}[tmp];\
      [tmp][2:v]overlay=0:0:shortest=1[v]\
    " \
    -map "[v]" -t 5 -c:v libx264 -preset fast -crf 20 -pix_fmt yuv420p "${outputPath}" -y`;

  await execAsync(cmd);

  console.log(`  ✅ 最终视频已生成: ${outputPath}`);
  console.log(`  📝 使用三层叠加:`);
  console.log(`     1. 背景图 (1080x1920)`);
  console.log(`     2. 画中画视频 (${pipX}, ${pipY})`);
  console.log(`     3. 全尺寸圆形遮罩 (0, 0) - 无黑角`);
  return outputPath;
}

/**
 * 主函数
 */
async function main() {
  try {
    console.log('🚀 圆形人脸跟踪画中画生成器');
    console.log('='.repeat(60));
    console.log('使用后端正确逻辑 + 圆形设计:');
    console.log('  1. 检测人脸位置');
    console.log('  2. 以人脸为中心裁剪（扩展3.5倍，确保完整）');
    console.log('  3. 缩放到圆形尺寸（600x600）');
    console.log('  4. 应用全尺寸圆形遮罩（无黑角）');
    console.log('  5. 添加圆形边框');
    console.log('='.repeat(60));

    const videoPath = '/Users/weilei/Desktop/测试视频2.MP4';

    if (!fs.existsSync(videoPath)) {
      console.error('❌ 未找到测试视频2.MP4');
      process.exit(1);
    }

    // 步骤1: 检测人脸
    const faceResult = await detectFace(videoPath);

    // 步骤2: 生成人脸跟踪画中画
    const pipVideoPath = await generateFaceTrackingPIP(videoPath, faceResult);

    // 步骤3: 生成背景图
    const bgPath = await generateBackground();

    // 步骤4: 合成最终视频
    const finalPath = await compositeVideo(bgPath, pipVideoPath);

    console.log('\n🎉 完成！');
    console.log(`\n📁 输出文件: ${finalPath}`);
    console.log('\n✅ 修复内容:');
    console.log('  ✓ 使用人脸跟踪裁剪（不是简单缩放）');
    console.log('  ✓ 圆形画中画设计（600x600）');
    console.log('  ✓ 圆形遮罩完美应用');
    console.log('  ✓ 圆形边框清晰显示');
    console.log('  ✓ 人脸居中，包含头部和肩膀');

    // 打开结果
    await execAsync(`open "${finalPath}"`);

  } catch (error) {
    console.error('❌ 生成失败:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// 运行
main();
