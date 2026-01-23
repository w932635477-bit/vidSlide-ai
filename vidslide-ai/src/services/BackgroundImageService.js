/**
 * 背景图片服务
 *
 * 功能：
 * 1. 管理科技背景图片库
 * 2. 随机选择背景图片
 * 3. 裁剪背景图片为抖音竖版尺寸（1080x1920）
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BackgroundImageService {
  constructor() {
    this.name = 'BackgroundImageService';
    this.backgroundsDir = path.join(__dirname, '../../assets/backgrounds');
    this.cacheDir = path.join(__dirname, '../../../cache/backgrounds');

    // 确保目录存在
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }

    // 加载背景图片列表
    this.loadBackgrounds();

    console.log(`✅ BackgroundImageService 初始化完成，共 ${this.backgrounds.length} 张背景图`);
  }

  /**
   * 加载背景图片列表
   */
  loadBackgrounds() {
    this.backgrounds = [];

    if (!fs.existsSync(this.backgroundsDir)) {
      console.warn('⚠️ 背景图片目录不存在:', this.backgroundsDir);
      return;
    }

    const files = fs.readdirSync(this.backgroundsDir);
    this.backgrounds = files
      .filter(file => /\.(jpg|jpeg|png)$/i.test(file))
      .map(file => path.join(this.backgroundsDir, file));

    console.log(`📁 加载了 ${this.backgrounds.length} 张背景图片`);
  }

  /**
   * 随机选择一张背景图片
   * @returns {string} 背景图片路径
   */
  getRandomBackground() {
    if (this.backgrounds.length === 0) {
      throw new Error('没有可用的背景图片');
    }

    const randomIndex = Math.floor(Math.random() * this.backgrounds.length);
    return this.backgrounds[randomIndex];
  }

  /**
   * 裁剪背景图片为抖音竖版尺寸
   * @param {string} imagePath - 原始图片路径（可选，不传则随机选择）
   * @param {number} width - 目标宽度（默认1080）
   * @param {number} height - 目标高度（默认1920）
   * @returns {Promise<string>} 裁剪后的图片路径
   */
  async cropToVertical(imagePath = null, width = 1080, height = 1920) {
    // 如果没有指定图片，随机选择一张
    if (!imagePath) {
      imagePath = this.getRandomBackground();
    }

    console.log(`🖼️ 裁剪背景图片: ${path.basename(imagePath)}`);

    const outputPath = path.join(this.cacheDir, `bg_${Date.now()}.jpg`);

    try {
      // 使用 FFmpeg 裁剪图片为竖版尺寸
      // 策略：先缩放到目标高度，然后居中裁剪到目标宽度
      const targetRatio = width / height; // 0.5625 (9:16)

      // 使用 scale 和 crop 滤镜
      // 1. 先缩放到合适的尺寸（保持宽高比）
      // 2. 然后居中裁剪
      const filterComplex = `scale='if(gt(a,${targetRatio}),${height}*a,${width})':'if(gt(a,${targetRatio}),${height},${width}/a)',crop=${width}:${height}`;

      const cmd = `ffmpeg -i "${imagePath}" -vf "${filterComplex}" -q:v 2 "${outputPath}" -y`;

      await execAsync(cmd);

      console.log(`✅ 背景图片裁剪完成: ${outputPath}`);
      return outputPath;

    } catch (error) {
      console.error('❌ 背景图片裁剪失败:', error);
      throw error;
    }
  }

  /**
   * 批量裁剪所有背景图片
   * @returns {Promise<Array>} 裁剪后的图片路径列表
   */
  async cropAllBackgrounds() {
    console.log('🎨 批量裁剪所有背景图片...');

    const croppedImages = [];

    for (let i = 0; i < this.backgrounds.length; i++) {
      const bg = this.backgrounds[i];
      console.log(`  处理 ${i + 1}/${this.backgrounds.length}: ${path.basename(bg)}`);

      try {
        const croppedPath = await this.cropToVertical(bg);
        croppedImages.push(croppedPath);
      } catch (error) {
        console.error(`  ❌ 裁剪失败: ${path.basename(bg)}`);
      }
    }

    console.log(`✅ 批量裁剪完成，成功 ${croppedImages.length}/${this.backgrounds.length} 张`);
    return croppedImages;
  }

  /**
   * 清理缓存的背景图片
   */
  clearCache() {
    if (fs.existsSync(this.cacheDir)) {
      const files = fs.readdirSync(this.cacheDir);
      files.forEach(file => {
        const filePath = path.join(this.cacheDir, file);
        fs.unlinkSync(filePath);
      });
      console.log(`🗑️ 清理了 ${files.length} 个缓存文件`);
    }
  }
}

export default BackgroundImageService;
