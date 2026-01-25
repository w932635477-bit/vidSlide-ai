import { createCanvas, registerFont, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * ProfessionalCardGenerator - 专业卡片生成器
 *
 * 生成符合抖音风格的精美文字卡片
 * 使用真实的背景图片而非渐变
 */
class ProfessionalCardGenerator {
  constructor() {
    this.outputDir = path.join(__dirname, '../../cache/cards');
    this.backgroundDir = path.join(__dirname, '../../assets/card-backgrounds');
    this.ensureOutputDir();

    // 卡片配置
    this.cardWidth = 640;  // 卡片宽度
    this.cardHeight = 360; // 卡片高度
    this.padding = 40;     // 内边距

    // 加载背景图片列表
    this.backgroundImages = this.loadBackgroundImages();
    this.currentBackgroundIndex = 0;

    // 预设样式（现在主要用于文字颜色）
    this.styles = {
      blue: {
        textColor: '#FFFFFF',
        shadowColor: 'rgba(0, 0, 0, 0.5)',
        overlayColor: 'rgba(0, 0, 0, 0.3)'  // 半透明遮罩
      },
      yellow: {
        textColor: '#FFFFFF',
        shadowColor: 'rgba(0, 0, 0, 0.5)',
        overlayColor: 'rgba(0, 0, 0, 0.3)'
      },
      purple: {
        textColor: '#FFFFFF',
        shadowColor: 'rgba(0, 0, 0, 0.5)',
        overlayColor: 'rgba(0, 0, 0, 0.3)'
      },
      green: {
        textColor: '#FFFFFF',
        shadowColor: 'rgba(0, 0, 0, 0.5)',
        overlayColor: 'rgba(0, 0, 0, 0.3)'
      },
      pink: {
        textColor: '#FFFFFF',
        shadowColor: 'rgba(0, 0, 0, 0.5)',
        overlayColor: 'rgba(0, 0, 0, 0.3)'
      },
      bright: {
        textColor: '#FFFFFF',
        shadowColor: 'rgba(0, 0, 0, 0.5)',
        overlayColor: 'rgba(0, 0, 0, 0.3)'
      }
    };
  }

  /**
   * 加载背景图片列表
   */
  loadBackgroundImages() {
    try {
      if (!fs.existsSync(this.backgroundDir)) {
        console.warn('背景图片目录不存在，将使用渐变背景');
        return [];
      }

      const files = fs.readdirSync(this.backgroundDir)
        .filter(file => /\.(jpg|jpeg|png)$/i.test(file))
        .map(file => path.join(this.backgroundDir, file));

      console.log(`✅ 加载了 ${files.length} 张背景图片`);
      return files;
    } catch (error) {
      console.error('加载背景图片失败:', error);
      return [];
    }
  }

  /**
   * 获取下一张背景图片（循环使用）
   */
  getNextBackground() {
    if (this.backgroundImages.length === 0) {
      return null;
    }

    const bgPath = this.backgroundImages[this.currentBackgroundIndex];
    this.currentBackgroundIndex = (this.currentBackgroundIndex + 1) % this.backgroundImages.length;
    return bgPath;
  }

  /**
   * 确保输出目录存在
   */
  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * 生成专业卡片
   * @param {string|Object} text - 卡片文字（字符串或关键词对象）
   * @param {Object} options - 配置选项
   * @returns {Promise<string>} 卡片图片路径
   */
  async generateCard(text, options = {}) {
    const {
      style = 'blue',
      width = 600,  // 增大宽度
      height = 300, // 增大高度
      fontSize = 72,  // 增大主标题字体
      fontWeight = 'bold',
      shadowBlur = 20
    } = options;

    // 处理关键词对象或字符串
    let mainText, subText;
    if (typeof text === 'object' && text.text) {
      mainText = text.text;
      subText = text.english;
    } else {
      mainText = text;
      subText = null;
    }

    // 创建画布
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 获取样式配置
    const styleConfig = this.styles[style] || this.styles.blue;

    // 1. 绘制背景（使用真实图片或渐变）
    const bgImagePath = this.getNextBackground();

    if (bgImagePath) {
      // 使用真实背景图片
      try {
        const { loadImage } = await import('canvas');
        const bgImage = await loadImage(bgImagePath);

        // 绘制背景图片（裁剪并缩放以填充整个画布）
        const scale = Math.max(width / bgImage.width, height / bgImage.height);
        const scaledWidth = bgImage.width * scale;
        const scaledHeight = bgImage.height * scale;
        const x = (width - scaledWidth) / 2;
        const y = (height - scaledHeight) / 2;

        ctx.drawImage(bgImage, x, y, scaledWidth, scaledHeight);

        // 添加半透明遮罩以提高文字可读性
        ctx.fillStyle = styleConfig.overlayColor || 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, width, height);

      } catch (error) {
        console.error('加载背景图片失败，使用渐变背景:', error);
        // 降级到渐变背景
        this.drawGradientBackground(ctx, width, height, styleConfig);
      }
    } else {
      // 使用渐变背景（降级方案）
      this.drawGradientBackground(ctx, width, height, styleConfig);
    }

    // 2. 绘制文字阴影
    ctx.shadowColor = styleConfig.shadowColor;
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // 3. 绘制中文主标题
    ctx.fillStyle = styleConfig.textColor;
    ctx.font = `${fontWeight} ${fontSize}px "PingFang SC", "Microsoft YaHei", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (subText) {
      // 有英文副标题：主标题在上，副标题在下
      const mainY = height / 2 - 30;
      ctx.fillText(mainText, width / 2, mainY);

      // 4. 绘制英文副标题
      ctx.font = `normal ${fontSize * 0.45}px Arial, sans-serif`;
      ctx.fillStyle = styleConfig.textColor;
      const subY = height / 2 + 40;
      ctx.fillText(subText, width / 2, subY);

    } else {
      // 没有副标题：主标题居中
      const lines = this.wrapText(ctx, mainText, width - this.padding * 2);
      const lineHeight = fontSize * 1.4;
      const totalHeight = lines.length * lineHeight;
      const startY = (height - totalHeight) / 2 + lineHeight / 2;

      lines.forEach((line, index) => {
        const y = startY + index * lineHeight;
        ctx.fillText(line, width / 2, y);
      });
    }

    // 重置阴影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // 5. 绘制双边框美化卡片
    // 外层边框 - 深色粗边框
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, width - 8, height - 8);

    // 内层边框 - 亮色细边框
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    // 6. 保存图片
    const filename = `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.png`;
    const filepath = path.join(this.outputDir, filename);

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filepath, buffer);

    return filepath;
  }

  /**
   * 绘制渐变背景（降级方案）
   */
  drawGradientBackground(ctx, width, height, styleConfig) {
    const gradient = ctx.createLinearGradient(0, 0, width, height);

    // 如果有渐变配置则使用，否则使用默认蓝色
    if (styleConfig.gradient) {
      gradient.addColorStop(0, styleConfig.gradient[0]);
      gradient.addColorStop(1, styleConfig.gradient[1]);
    } else {
      gradient.addColorStop(0, '#4A90E2');
      gradient.addColorStop(1, '#357ABD');
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  /**
   * 文字自动换行
   */
  wrapText(ctx, text, maxWidth) {
    const words = text.split('');
    const lines = [];
    let currentLine = '';

    for (const char of words) {
      const testLine = currentLine + char;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    return lines;
  }

  /**
   * 添加装饰元素
   */
  addDecoration(ctx, width, height, styleConfig) {
    // 左上角装饰
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.arc(0, 0, 60, 0, Math.PI * 2);
    ctx.fill();

    // 右下角装饰
    ctx.beginPath();
    ctx.arc(width, height, 80, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * 批量生成卡片
   */
  async generateCards(texts, options = {}) {
    const cards = [];
    const styles = ['blue', 'yellow', 'purple', 'green', 'pink'];

    for (let i = 0; i < texts.length; i++) {
      const style = styles[i % styles.length];
      const cardPath = await this.generateCard(texts[i], {
        ...options,
        style
      });

      cards.push({
        text: texts[i],
        path: cardPath,
        style
      });
    }

    return cards;
  }
}

export default ProfessionalCardGenerator;
