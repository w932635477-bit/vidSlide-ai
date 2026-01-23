#!/usr/bin/env node
/**
 * 创建全尺寸圆形遮罩（1080x1920）
 * 只在画中画区域绘制圆形镂空的黑色遮罩
 */

import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WIDTH = 1080;
const HEIGHT = 1920;
const pipSize = 600;
const pipCenterX = WIDTH / 2;
const pipCenterY = 1250;
const pipRadius = pipSize / 2;

const canvas = createCanvas(WIDTH, HEIGHT);
const ctx = canvas.getContext('2d');

// 1. 清空画布（透明背景）
ctx.clearRect(0, 0, WIDTH, HEIGHT);

// 2. 只在画中画区域绘制黑色正方形
const pipX = pipCenterX - pipSize / 2;
const pipY = pipCenterY - pipSize / 2;

ctx.fillStyle = '#000000';
ctx.fillRect(pipX, pipY, pipSize, pipSize);

// 3. 使用合成模式创建圆形透明区域
ctx.globalCompositeOperation = 'destination-out';
ctx.beginPath();
ctx.arc(pipCenterX, pipCenterY, pipRadius, 0, Math.PI * 2);
ctx.fill();

// 保存为PNG
const maskPath = path.join(__dirname, '../cache/fullsize-circle-mask.png');
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(maskPath, buffer);

console.log(`✅ 全尺寸圆形遮罩已创建: ${maskPath}`);
console.log(`   尺寸: ${WIDTH}x${HEIGHT}`);
console.log(`   画中画位置: (${pipX}, ${pipY})`);
console.log(`   圆形中心: (${pipCenterX}, ${pipCenterY})`);
console.log(`   圆形半径: ${pipRadius}`);
console.log(`   效果: 只在画中画区域有圆形镂空的黑色遮罩`);
