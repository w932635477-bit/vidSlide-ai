/**
 * 背景生成服务
 * 从预设的科技背景图片中循环选择
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BackgroundGeneratorService {
  constructor() {
    this.name = 'BackgroundGeneratorService';
    // 使用项目根目录的绝对路径
    const projectRoot = path.resolve(__dirname, '../../..');
    this.backgroundsDir = path.join(projectRoot, 'assets/backgrounds');
    this.currentIndex = 0;

    // 加载所有背景图片
    this.loadBackgrounds();
  }

  /**
   * 加载所有背景图片
   */
  loadBackgrounds() {
    try {
      if (!fs.existsSync(this.backgroundsDir)) {
        console.warn('⚠️ 背景图片目录不存在:', this.backgroundsDir);
        this.backgrounds = [];
        return;
      }

      const files = fs.readdirSync(this.backgroundsDir);
      this.backgrounds = files
        .filter(file => /\.(jpg|jpeg|png)$/i.test(file))
        .map(file => path.join(this.backgroundsDir, file));

      console.log(`✅ 加载了 ${this.backgrounds.length} 张背景图片`);
    } catch (error) {
      console.error('❌ 加载背景图片失败:', error);
      this.backgrounds = [];
    }
  }

  /**
   * 获取下一张背景图片（循环）
   * @returns {string} 背景图片路径
   */
  getNextBackground() {
    if (this.backgrounds.length === 0) {
      throw new Error('没有可用的背景图片');
    }

    const background = this.backgrounds[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.backgrounds.length;

    console.log(`🎨 选择背景图片 [${this.currentIndex}/${this.backgrounds.length}]: ${path.basename(background)}`);
    return background;
  }

  /**
   * 生成背景（实际上是选择一张背景图片）
   * @param {Object} options - 选项
   * @returns {Promise<string>} 背景图片路径
   */
  async generateBackground(options = {}) {
    const { width = 1080, height = 1920, style = 'tech' } = options;

    console.log(`🎨 选择科技背景: ${width}x${height}, 风格: ${style}`);

    try {
      const backgroundPath = this.getNextBackground();
      console.log(`✅ 背景选择完成: ${backgroundPath}`);
      return backgroundPath;
    } catch (error) {
      console.error('❌ 背景选择失败:', error);
      throw error;
    }
  }

  /**
   * 生成带渐变的深色背景（兼容旧接口）
   * @returns {Promise<string>} 背景图片路径
   */
  async generateGradientBackground() {
    return await this.generateBackground({ style: 'gradient' });
  }
}

export default BackgroundGeneratorService;
