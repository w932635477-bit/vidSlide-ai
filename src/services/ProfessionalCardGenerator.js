import { createCanvas, registerFont } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * ProfessionalCardGenerator - 专业卡片生成器
 *
 * 生成符合抖音风格的精美文字卡片
 */
class ProfessionalCardGenerator {
  constructor() {
    this.outputDir = path.join(__dirname, '../../cache/cards');
    this.ensureOutputDir();

    // 卡片配置
    this.cardWidth = 640;  // 卡片宽度
    this.cardHeight = 360; // 卡片高度
    this.padding = 40;     // 内边距

    // 预设样式
    this.styles = {
      blue: {
        gradient: ['#4A90E2', '#357ABD'],
        textColor: '#FFFFFF',
        shadowColor: 'rgba(0, 0, 0, 0.3)'
      },
      yellow: {
        gradient: ['#FFD93D', '#F6C90E'],
        textColor: '#2C3E50',
        shadowColor: 'rgba(0, 0, 0, 0.2)'
      },
      purple: {
        gradient: ['#A78BFA', '#7C3AED'],
        textColor: '#FFFFFF',
        shadowColor: 'rgba(0, 0, 0, 0.3)'
      },
      green: {
        gradient: ['#34D399', '#10B981'],
        textColor: '#FFFFFF',
        shadowColor: 'rgba(0, 0, 0, 0.3)'
      },
      pink: {
        gradient: ['#F472B6', '#EC4899'],
        textColor: '#FFFFFF',
        shadowColor: 'rgba(0, 0, 0, 0.3)'
      }
    };
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
   * @param {string} text - 卡片文字
   * @param {Object} options - 配置选项
   * @returns {Promise<string>} 卡片图片路径
   */
  async generateCard(text, options = {}) {
    const {
      style = 'blue',
      width = this.cardWidth,
      height = this.cardHeight,
      fontSize = 48,
      fontWeight = 'bold',
      cornerRadius = 20,
      shadowBlur = 20
    } = options;

    // 创建画布
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 获取样式配置
    const styleConfig = this.styles[style] || this.styles.blue;

    // 1. 绘制阴影
    ctx.shadowColor = styleConfig.shadowColor;
    ctx.shadowBlur = shadowBlur;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 10;

    // 2. 绘制圆角矩形背景（渐变）
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, styleConfig.gradient[0]);
    gradient.addColorStop(1, styleConfig.gradient[1]);

    ctx.fillStyle = gradient;
    this.roundRect(ctx, 0, 0, width, height, cornerRadius);
    ctx.fill();

    // 重置阴影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // 3. 绘制文字
    ctx.fillStyle = styleConfig.textColor;
    ctx.font = `${fontWeight} ${fontSize}px "PingFang SC", "Microsoft YaHei", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 自动换行
    const lines = this.wrapText(ctx, text, width - this.padding * 2);
    const lineHeight = fontSize * 1.4;
    const totalHeight = lines.length * lineHeight;
    const startY = (height - totalHeight) / 2 + lineHeight / 2;

    // 绘制每一行
    lines.forEach((line, index) => {
      const y = startY + index * lineHeight;
      ctx.fillText(line, width / 2, y);
    });

    // 4. 添加装饰元素（可选）
    if (options.addDecoration) {
      this.addDecoration(ctx, width, height, styleConfig);
    }

    // 5. 保存图片
    const filename = `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.png`;
    const filepath = path.join(this.outputDir, filename);

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filepath, buffer);

    return filepath;
  }

  /**
   * 绘制圆角矩形
   */
  roundRect(ctx, x, y, width, height, radius) {
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
