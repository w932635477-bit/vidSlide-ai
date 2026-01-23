#!/usr/bin/env node
/**
 * 创建圆形遮罩叠加层（带透明背景和圆形镂空）
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

// 1. 填充黑色背景
ctx.fillStyle = '#000000';
ctx.fillRect(0, 0, size, size);

// 2. 使用合成模式创建圆形镂空
ctx.globalCompositeOperation = 'destination-out';
ctx.beginPath();
ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
ctx.fill();

// 保存为PNG
const maskPath = path.join(__dirname, '../cache/circle-cutout-mask.png');
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(maskPath, buffer);

console.log(`✅ 圆形镂空遮罩已创建: ${maskPath}`);
