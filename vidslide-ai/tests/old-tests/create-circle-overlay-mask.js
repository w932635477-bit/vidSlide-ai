#!/usr/bin/env node
/**
 * 创建圆形遮罩叠加层
 * 透明背景，只在圆形外绘制黑色
 */

import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const size = 600;

const canvas = createCanvas(size, size);
const ctx = canvas.getContext('2d');

// 1. 清空画布（透明背景）
ctx.clearRect(0, 0, size, size);

// 2. 绘制黑色正方形
ctx.fillStyle = '#000000';
ctx.fillRect(0, 0, size, size);

// 3. 使用合成模式创建圆形透明区域
ctx.globalCompositeOperation = 'destination-out';
ctx.beginPath();
ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
ctx.fill();

// 保存为PNG
const maskPath = path.join(__dirname, '../cache/circle-overlay-mask.png');
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(maskPath, buffer);

console.log(`✅ 圆形遮罩叠加层已创建: ${maskPath}`);
console.log(`   尺寸: ${size}x${size}`);
console.log(`   效果: 圆形外黑色，圆形内透明`);
console.log(`   背景: 透明（四角不会显示黑色）`);
