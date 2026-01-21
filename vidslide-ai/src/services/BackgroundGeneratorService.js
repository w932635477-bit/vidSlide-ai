/**
 * 背景生成服务
 * 生成深色科技风格的背景图片
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BackgroundGeneratorService {
  constructor() {
    this.name = 'BackgroundGeneratorService';
    this.cacheDir = path.join(__dirname, '../../../cache/backgrounds');

    // 确保目录存在
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * 生成深色科技背景
   * @param {number} width - 宽度
   * @param {number} height - 高度
   * @param {string} style - 风格 (gradient, tech, dark)
   * @returns {Promise<string>} 背景图片路径
   */
  async generateBackground(width = 1080, height = 1920, style = 'tech') {
    console.log(`🎨 生成深色科技背景: ${width}x${height}, 风格: ${style}`);

    const outputPath = path.join(this.cacheDir, `bg_${style}_${Date.now()}.png`);

    try {
      // 使用 FFmpeg 生成深色渐变背景
      let filterComplex = '';

      switch (style) {
        case 'gradient':
          // 深蓝到黑色渐变
          filterComplex = `color=c=#0a0e27:s=${width}x${height}:d=1[base];` +
            `[base]drawbox=x=0:y=0:w=${width}:h=${height}:color=#1a1f3a@0.5:t=fill[bg]`;
          break;

        case 'tech':
          // 深色科技风格（带网格）
          filterComplex = `color=c=#0d1117:s=${width}x${height}:d=1[base];` +
            `[base]drawbox=x=0:y=0:w=${width}:h=${height/3}:color=#161b22@0.8:t=fill[top];` +
            `[top]drawbox=x=0:y=${height*2/3}:w=${width}:h=${height/3}:color=#0d1117@0.9:t=fill[bg]`;
          break;

        case 'dark':
        default:
          // 纯深色背景
          filterComplex = `color=c=#0a0a0a:s=${width}x${height}:d=1[bg]`;
          break;
      }

      const cmd = `ffmpeg -f lavfi -i "${filterComplex}" -frames:v 1 "${outputPath}" -y`;

      await execAsync(cmd);

      console.log(`✅ 背景生成完成: ${outputPath}`);
      return outputPath;

    } catch (error) {
      console.error('❌ 背景生成失败:', error);
      throw error;
    }
  }

  /**
   * 生成带渐变的深色背景
   * @param {number} width - 宽度
   * @param {number} height - 高度
   * @param {string} color1 - 起始颜色
   * @param {string} color2 - 结束颜色
   * @returns {Promise<string>} 背景图片路径
   */
  async generateGradientBackground(width = 1080, height = 1920, color1 = '#0a0e27', color2 = '#1a1f3a') {
    console.log(`🎨 生成渐变背景: ${width}x${height}`);

    const outputPath = path.join(this.cacheDir, `bg_gradient_${Date.now()}.png`);

    try {
      // 创建一个简单的渐变背景
      // 由于 FFmpeg 的限制，我们使用多个 drawbox 来模拟渐变
      const steps = 10;
      let filterComplex = `color=c=${color1}:s=${width}x${height}:d=1[base]`;

      // 添加渐变层
      for (let i = 0; i < steps; i++) {
        const y = Math.floor((height / steps) * i);
        const h = Math.ceil(height / steps);
        const alpha = 0.1 + (i / steps) * 0.5;
        filterComplex += `;[base]drawbox=x=0:y=${y}:w=${width}:h=${h}:color=${color2}@${alpha}:t=fill[base]`;
      }

      const cmd = `ffmpeg -f lavfi -i "${filterComplex}" -frames:v 1 "${outputPath}" -y`;

      await execAsync(cmd);

      console.log(`✅ 渐变背景生成完成: ${outputPath}`);
      return outputPath;

    } catch (error) {
      console.error('❌ 渐变背景生成失败:', error);
      // 如果失败，返回纯色背景
      return await this.generateBackground(width, height, 'dark');
    }
  }
}

export default BackgroundGeneratorService;
