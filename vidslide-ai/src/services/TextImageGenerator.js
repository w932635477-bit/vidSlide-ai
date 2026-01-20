/**
 * 文字图片生成服务
 * 使用 Sharp 生成带样式的文字图片，用于 FFmpeg 叠加
 *
 * 解决 FFmpeg drawtext 滤镜缺失的问题
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

class TextImageGenerator {
  constructor() {
    this.cacheDir = './cache/text-images';
    this.ensureCacheDir();
  }

  /**
   * 确保缓存目录存在
   */
  ensureCacheDir() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * 生成文字图片
   * @param {string} text - 文字内容
   * @param {object} options - 样式选项
   * @returns {Promise<string>} 图片路径
   */
  async generateTextImage(text, options = {}) {
    const {
      fontSize = 72,
      fontColor = '#ffffff',
      fontWeight = 'bold',
      backgroundColor = 'transparent',
      padding = 40,
      glowColor = null,
      glowIntensity = 0.6,
      shadowColor = '#000000',
      shadowBlur = 10,
      maxWidth = 1000
    } = options;

    try {
      console.log(`[TextImageGenerator] 生成文字图片: ${text}`);

      // 1. 创建 SVG 文字
      const svg = this.createTextSVG(text, {
        fontSize,
        fontColor,
        fontWeight,
        glowColor,
        glowIntensity,
        shadowColor,
        shadowBlur,
        maxWidth,
        padding
      });

      // 2. 使用 Sharp 渲染 SVG
      const outputPath = path.join(
        this.cacheDir,
        `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.png`
      );

      await sharp(Buffer.from(svg))
        .png()
        .toFile(outputPath);

      console.log(`[TextImageGenerator] 文字图片生成成功: ${outputPath}`);
      return outputPath;

    } catch (error) {
      console.error(`[TextImageGenerator] 文字图片生成失败:`, error);
      throw error;
    }
  }

  /**
   * 创建文字 SVG
   */
  createTextSVG(text, options) {
    const {
      fontSize,
      fontColor,
      fontWeight,
      glowColor,
      glowIntensity,
      shadowColor,
      shadowBlur,
      maxWidth,
      padding
    } = options;

    // 计算文字宽度（粗略估算）
    const charWidth = fontSize * 0.6;
    const textWidth = Math.min(text.length * charWidth, maxWidth);
    const textHeight = fontSize * 1.5;

    const width = textWidth + padding * 2;
    const height = textHeight + padding * 2;

    // 构建滤镜
    let filters = '';
    let filterId = '';

    if (glowColor && glowIntensity > 0) {
      filterId = 'glow';
      filters += `
        <filter id="${filterId}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="${shadowBlur}" />
          <feFlood flood-color="${glowColor}" flood-opacity="${glowIntensity}" />
          <feComposite in2="SourceAlpha" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      `;
    } else if (shadowColor) {
      filterId = 'shadow';
      filters += `
        <filter id="${filterId}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="${shadowBlur}" />
          <feOffset dx="2" dy="2" result="offsetblur" />
          <feFlood flood-color="${shadowColor}" />
          <feComposite in2="offsetblur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      `;
    }

    // 构建 SVG
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          ${filters}
        </defs>
        <text
          x="${width / 2}"
          y="${height / 2 + fontSize / 3}"
          font-family="Arial, sans-serif"
          font-size="${fontSize}"
          font-weight="${fontWeight}"
          fill="${fontColor}"
          text-anchor="middle"
          ${filterId ? `filter="url(#${filterId})"` : ''}
        >${this.escapeXml(text)}</text>
      </svg>
    `;

    return svg;
  }

  /**
   * 转义 XML 特殊字符
   */
  escapeXml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * 批量生成文字图片
   */
  async generateBatch(texts, options = {}) {
    const results = [];

    for (const text of texts) {
      const imagePath = await this.generateTextImage(text, options);
      results.push({ text, imagePath });
    }

    return results;
  }

  /**
   * 清理缓存
   */
  clearCache() {
    if (fs.existsSync(this.cacheDir)) {
      const files = fs.readdirSync(this.cacheDir);
      files.forEach(file => {
        fs.unlinkSync(path.join(this.cacheDir, file));
      });
      console.log(`[TextImageGenerator] 缓存已清理`);
    }
  }
}

// 导出单例
let instance = null;

export function getInstance() {
  if (!instance) {
    instance = new TextImageGenerator();
  }
  return instance;
}

export { TextImageGenerator };
export default TextImageGenerator;
