/**
 * 高级文字渲染服务
 * 提供专业级的文字渲染和特效
 *
 * 核心功能：
 * 1. 多种文字特效（发光、阴影、描边、渐变）
 * 2. 自动换行和文字适配
 * 3. 多语言支持
 * 4. 高质量 SVG 渲染
 */

class AdvancedTextRenderer {
  constructor() {
    // 字体配置
    this.fonts = {
      chinese: 'PingFang SC, Microsoft YaHei, SimHei, sans-serif',
      english: 'Arial, Helvetica, Roboto, sans-serif',
      number: 'DIN, Futura, Arial, sans-serif'
    };

    // 文字特效预设
    this.effectPresets = {
      // 标题特效：发光 + 阴影
      title: {
        glow: {
          enabled: true,
          blur: 12,
          color: '#667eea',
          opacity: 0.6
        },
        shadow: {
          enabled: true,
          offsetX: 0,
          offsetY: 4,
          blur: 16,
          color: 'rgba(0,0,0,0.5)'
        },
        stroke: {
          enabled: false
        }
      },

      // 副标题特效：轻微阴影
      subtitle: {
        glow: {
          enabled: false
        },
        shadow: {
          enabled: true,
          offsetX: 0,
          offsetY: 2,
          blur: 8,
          color: 'rgba(0,0,0,0.3)'
        },
        stroke: {
          enabled: false
        }
      },

      // 关键词特效：无特效（背景已有）
      keyword: {
        glow: {
          enabled: false
        },
        shadow: {
          enabled: false
        },
        stroke: {
          enabled: false
        }
      },

      // 强调特效：发光 + 描边
      emphasis: {
        glow: {
          enabled: true,
          blur: 16,
          color: '#FFD700',
          opacity: 0.8
        },
        shadow: {
          enabled: true,
          offsetX: 0,
          offsetY: 4,
          blur: 12,
          color: 'rgba(0,0,0,0.4)'
        },
        stroke: {
          enabled: true,
          width: 2,
          color: '#000000',
          opacity: 0.3
        }
      }
    };
  }

  /**
   * 渲染标题
   */
  renderTitle(config) {
    const {
      text,
      x,
      y,
      fontSize = 64,
      fontWeight = 'bold',
      color = '#FFFFFF',
      align = 'middle',
      maxWidth = 900,
      effect = 'title',
      canvasWidth = 1080,
      canvasHeight = 1920
    } = config;

    const effectConfig = this.effectPresets[effect] || this.effectPresets.title;

    // 处理文字换行
    const lines = this.wrapText(text, maxWidth, fontSize);

    // 生成 SVG
    let svg = `<svg width="${canvasWidth}" height="${canvasHeight}" xmlns="http://www.w3.org/2000/svg">`;

    // 添加滤镜定义
    svg += '<defs>';

    // 发光滤镜
    if (effectConfig.glow.enabled) {
      svg += `
        <filter id="glow-${effect}">
          <feGaussianBlur stdDeviation="${effectConfig.glow.blur}" result="coloredBlur"/>
          <feFlood flood-color="${effectConfig.glow.color}" flood-opacity="${effectConfig.glow.opacity}"/>
          <feComposite in2="coloredBlur" operator="in" result="glow"/>
          <feMerge>
            <feMergeNode in="glow"/>
            <feMergeNode in="glow"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      `;
    }

    // 阴影滤镜
    if (effectConfig.shadow.enabled) {
      svg += `
        <filter id="shadow-${effect}">
          <feDropShadow
            dx="${effectConfig.shadow.offsetX}"
            dy="${effectConfig.shadow.offsetY}"
            stdDeviation="${effectConfig.shadow.blur / 2}"
            flood-color="${effectConfig.shadow.color}"
          />
        </filter>
      `;
    }

    svg += '</defs>';

    // 渲染文字
    const lineHeight = fontSize * 1.2;
    const startY = y - ((lines.length - 1) * lineHeight) / 2;

    lines.forEach((line, index) => {
      const currentY = startY + index * lineHeight;

      // 描边（如果启用）
      if (effectConfig.stroke.enabled) {
        svg += `
          <text
            x="${x}"
            y="${currentY}"
            font-family="${this.fonts.chinese}"
            font-size="${fontSize}"
            font-weight="${fontWeight}"
            fill="none"
            stroke="${effectConfig.stroke.color}"
            stroke-width="${effectConfig.stroke.width}"
            stroke-opacity="${effectConfig.stroke.opacity}"
            text-anchor="${align}"
          >${this.escapeXml(line)}</text>
        `;
      }

      // 主文字
      let filters = [];
      if (effectConfig.shadow.enabled) filters.push(`url(#shadow-${effect})`);
      if (effectConfig.glow.enabled) filters.push(`url(#glow-${effect})`);

      svg += `
        <text
          x="${x}"
          y="${currentY}"
          font-family="${this.fonts.chinese}"
          font-size="${fontSize}"
          font-weight="${fontWeight}"
          fill="${color}"
          text-anchor="${align}"
          ${filters.length > 0 ? `filter="${filters.join(' ')}"` : ''}
        >${this.escapeXml(line)}</text>
      `;
    });

    svg += '</svg>';

    return Buffer.from(svg);
  }

  /**
   * 渲染关键词标签
   */
  renderKeywordTags(config) {
    const {
      keywords,
      startX = 100,
      y = 1680,
      spacing = 20,
      fontSize = 24,
      fontWeight = '600',
      textColor = '#FFFFFF',
      backgroundColor = '#667eea',
      backgroundOpacity = 0.95,
      padding = 20,
      borderRadius = 24,
      height = 48,
      maxCount = 3,
      canvasWidth = 1080,
      canvasHeight = 1920
    } = config;

    const displayKeywords = keywords.slice(0, maxCount);

    let svg = `<svg width="${canvasWidth}" height="${canvasHeight}" xmlns="http://www.w3.org/2000/svg">`;

    let currentX = startX;

    displayKeywords.forEach(keyword => {
      // 计算标签宽度
      const charWidth = fontSize * 0.6;
      const tagWidth = keyword.length * charWidth + padding * 2;

      // 标签背景
      svg += `
        <rect
          x="${currentX}"
          y="${y}"
          width="${tagWidth}"
          height="${height}"
          rx="${borderRadius}"
          fill="${backgroundColor}"
          opacity="${backgroundOpacity}"
        />
      `;

      // 标签文字
      svg += `
        <text
          x="${currentX + tagWidth / 2}"
          y="${y + height / 2 + fontSize / 3}"
          font-family="${this.fonts.chinese}"
          font-size="${fontSize}"
          font-weight="${fontWeight}"
          fill="${textColor}"
          text-anchor="middle"
        >${this.escapeXml(keyword)}</text>
      `;

      currentX += tagWidth + spacing;
    });

    svg += '</svg>';

    return Buffer.from(svg);
  }

  /**
   * 渲染渐变文字
   */
  renderGradientText(config) {
    const {
      text,
      x,
      y,
      fontSize = 64,
      fontWeight = 'bold',
      gradientColors = ['#667eea', '#764ba2'],
      align = 'middle',
      canvasWidth = 1080,
      canvasHeight = 1920
    } = config;

    let svg = `<svg width="${canvasWidth}" height="${canvasHeight}" xmlns="http://www.w3.org/2000/svg">`;

    // 定义渐变
    svg += `
      <defs>
        <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${gradientColors[0]}" />
          <stop offset="100%" stop-color="${gradientColors[1]}" />
        </linearGradient>
      </defs>
    `;

    // 渲染文字
    svg += `
      <text
        x="${x}"
        y="${y}"
        font-family="${this.fonts.chinese}"
        font-size="${fontSize}"
        font-weight="${fontWeight}"
        fill="url(#textGradient)"
        text-anchor="${align}"
      >${this.escapeXml(text)}</text>
    `;

    svg += '</svg>';

    return Buffer.from(svg);
  }

  /**
   * 渲染数字（带特殊样式）
   */
  renderNumber(config) {
    const {
      number,
      x,
      y,
      fontSize = 72,
      fontWeight = 'bold',
      color = '#FFD700',
      unit = '',
      unitFontSize = 36,
      align = 'middle',
      effect = 'emphasis',
      canvasWidth = 1080,
      canvasHeight = 1920
    } = config;

    const effectConfig = this.effectPresets[effect] || this.effectPresets.emphasis;

    let svg = `<svg width="${canvasWidth}" height="${canvasHeight}" xmlns="http://www.w3.org/2000/svg">`;

    // 添加滤镜
    svg += '<defs>';

    if (effectConfig.glow.enabled) {
      svg += `
        <filter id="number-glow">
          <feGaussianBlur stdDeviation="${effectConfig.glow.blur}" result="coloredBlur"/>
          <feFlood flood-color="${effectConfig.glow.color}" flood-opacity="${effectConfig.glow.opacity}"/>
          <feComposite in2="coloredBlur" operator="in" result="glow"/>
          <feMerge>
            <feMergeNode in="glow"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      `;
    }

    svg += '</defs>';

    // 渲染数字
    svg += `
      <text
        x="${x}"
        y="${y}"
        font-family="${this.fonts.number}"
        font-size="${fontSize}"
        font-weight="${fontWeight}"
        fill="${color}"
        text-anchor="${align}"
        ${effectConfig.glow.enabled ? 'filter="url(#number-glow)"' : ''}
      >${number}</text>
    `;

    // 渲染单位（如果有）
    if (unit) {
      svg += `
        <text
          x="${x + fontSize * 0.6}"
          y="${y}"
          font-family="${this.fonts.chinese}"
          font-size="${unitFontSize}"
          font-weight="normal"
          fill="${color}"
          opacity="0.8"
        >${this.escapeXml(unit)}</text>
      `;
    }

    svg += '</svg>';

    return Buffer.from(svg);
  }

  /**
   * 文字换行
   * 根据最大宽度自动换行
   */
  wrapText(text, maxWidth, fontSize) {
    // 简单的换行逻辑：根据字符数估算
    const charWidth = fontSize * 0.6; // 中文字符宽度约为字体大小的0.6倍
    const maxCharsPerLine = Math.floor(maxWidth / charWidth);

    if (text.length <= maxCharsPerLine) {
      return [text];
    }

    const lines = [];
    let currentLine = '';

    for (let i = 0; i < text.length; i++) {
      currentLine += text[i];

      if (currentLine.length >= maxCharsPerLine || i === text.length - 1) {
        lines.push(currentLine);
        currentLine = '';
      }
    }

    return lines;
  }

  /**
   * 计算文字宽度
   */
  measureText(text, fontSize) {
    // 简单估算：中文字符宽度约为字体大小的0.6倍
    const charWidth = fontSize * 0.6;
    return text.length * charWidth;
  }

  /**
   * 自动调整字体大小
   * 确保文字不超出最大宽度
   */
  autoFitFontSize(text, maxWidth, initialFontSize) {
    let fontSize = initialFontSize;
    let textWidth = this.measureText(text, fontSize);

    while (textWidth > maxWidth && fontSize > 20) {
      fontSize -= 2;
      textWidth = this.measureText(text, fontSize);
    }

    return fontSize;
  }

  /**
   * 转义 XML
   */
  escapeXml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * 创建文字遮罩
   * 用于实现特殊效果
   */
  createTextMask(config) {
    const {
      text,
      x,
      y,
      fontSize,
      fontWeight,
      align,
      canvasWidth,
      canvasHeight
    } = config;

    let svg = `<svg width="${canvasWidth}" height="${canvasHeight}" xmlns="http://www.w3.org/2000/svg">`;

    svg += `
      <text
        x="${x}"
        y="${y}"
        font-family="${this.fonts.chinese}"
        font-size="${fontSize}"
        font-weight="${fontWeight}"
        fill="white"
        text-anchor="${align}"
      >${this.escapeXml(text)}</text>
    `;

    svg += '</svg>';

    return Buffer.from(svg);
  }

  /**
   * 获取文字边界框
   */
  getTextBounds(text, fontSize, x, y, align = 'middle') {
    const width = this.measureText(text, fontSize);
    const height = fontSize * 1.2;

    let left, right;

    if (align === 'middle') {
      left = x - width / 2;
      right = x + width / 2;
    } else if (align === 'start') {
      left = x;
      right = x + width;
    } else {
      left = x - width;
      right = x;
    }

    return {
      left,
      right,
      top: y - height / 2,
      bottom: y + height / 2,
      width,
      height
    };
  }
}

// 导出单例
let instance = null;

export function getInstance() {
  if (!instance) {
    instance = new AdvancedTextRenderer();
  }
  return instance;
}

export { AdvancedTextRenderer };
export default AdvancedTextRenderer;
