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

    // ⭐ 加载高质量深色科技背景图片
    this.backgroundsDir = path.join(__dirname, '../../assets/backgrounds');
    this.backgroundImages = [];
    this.currentIndex = 0;

    // 加载背景图片列表
    if (fs.existsSync(this.backgroundsDir)) {
      const files = fs.readdirSync(this.backgroundsDir);
      this.backgroundImages = files
        .filter(f => f.endsWith('.jpg') || f.endsWith('.png'))
        .map(f => path.join(this.backgroundsDir, f));

      console.log(`✅ 加载了 ${this.backgroundImages.length} 张背景图片`);
    } else {
      console.warn(`⚠️  背景图片目录不存在: ${this.backgroundsDir}`);
    }
  }

  /**
   * 生成深色科技背景（使用预下载的高质量图片）
   * @param {number} width - 宽度
   * @param {number} height - 高度
   * @param {string} style - 风格 (保留参数以兼容现有调用)
   * @returns {Promise<string>} 背景图片路径
   */
  async generateBackground(width = 1080, height = 1920, style = 'dark') {
    console.log(`🎨 使用高质量科技背景: ${width}x${height}, 风格: ${style}`);

    // ⭐ 优先使用预下载的高质量背景图片
    if (this.backgroundImages.length > 0) {
      // 循环使用背景图片
      const selectedBg = this.backgroundImages[this.currentIndex];
      this.currentIndex = (this.currentIndex + 1) % this.backgroundImages.length;

      console.log(`  → 选择背景 ${this.currentIndex}/${this.backgroundImages.length}: ${path.basename(selectedBg)}`);

      // 使用FFmpeg调整图片尺寸到1080x1920（抖音规格）
      const outputPath = path.join(this.cacheDir, `bg_${style}_${Date.now()}.png`);

      try {
        const cmd = `ffmpeg -i "${selectedBg}" -vf "scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height}" -frames:v 1 "${outputPath}" -y`;
        await execAsync(cmd);

        console.log(`✅ 背景生成完成: ${outputPath}`);
        return outputPath;

      } catch (error) {
        console.error(`❌ 背景图片处理失败: ${error.message}`);
        // 降级：直接返回原图
        console.log(`  → 降级：直接使用原图`);
        return selectedBg;
      }
    }

    // 降级方案：使用FFmpeg生成纯色背景
    console.warn(`⚠️  未找到预下载的背景图片，使用FFmpeg生成`);
    const outputPath = path.join(this.cacheDir, `bg_${style}_${Date.now()}.png`);

    try {
      // 使用 FFmpeg 生成深色渐变背景
      let filterComplex = '';

      switch (style) {
        case 'gradient':
          // 深蓝到黑色渐变
          filterComplex = `color=c=#0a0e27:s=${width}x${height}:d=1,drawbox=x=0:y=0:w=${width}:h=${height}:color=#1a1f3a@0.5:t=fill`;
          break;

        case 'tech':
          // 深色科技风格（带网格）
          filterComplex = `color=c=#0d1117:s=${width}x${height}:d=1,drawbox=x=0:y=0:w=${width}:h=${height/3}:color=#161b22@0.8:t=fill,drawbox=x=0:y=${height*2/3}:w=${width}:h=${height/3}:color=#0d1117@0.9:t=fill`;
          break;

        case 'dark':
        default:
          // 纯深色背景
          filterComplex = `color=c=#0a0a0a:s=${width}x${height}:d=1`;
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
      // 创建一个简单的纯色背景（避免FFmpeg滤镜链的复杂性）
      // 渐变效果留给前端或使用ImageMagick等更适合的工具
      const cmd = `ffmpeg -f lavfi -i "color=c=${color1}:s=${width}x${height}:d=1" -frames:v 1 "${outputPath}" -y`;

      await execAsync(cmd);

      console.log(`✅ 背景生成完成: ${outputPath}`);
      return outputPath;

    } catch (error) {
      console.error('❌ 背景生成失败:', error);
      // 如果失败，返回纯色背景
      return await this.generateBackground(width, height, 'dark');
    }
  }
}

export default BackgroundGeneratorService;
