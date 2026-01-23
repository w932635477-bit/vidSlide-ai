#!/usr/bin/env node
/**
 * 创建圆形遮罩PNG
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

// 创建透明背景
ctx.clearRect(0, 0, size, size);

// 绘制白色圆形
ctx.fillStyle = '#ffffff';
ctx.beginPath();
ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
ctx.fill();

// 保存为PNG
const maskPath = path.join(__dirname, '../cache/circle-mask.png');
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(maskPath, buffer);

console.log(`✅ 圆形遮罩已创建: ${maskPath}`);
