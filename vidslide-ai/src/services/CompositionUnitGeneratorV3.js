/**
 * 组合单元生成器 V3
 * 基于最佳实践的专业级视频帧生成
 *
 * 改进点：
 * 1. 使用 SmartLayoutServiceV2 的固定布局
 * 2. 优化文字大小和位置
 * 3. 改进图片裁剪策略
 * 4. 增强视觉特效
 * 5. 完整的错误处理
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const sharp = require('sharp');

import fs from 'fs';
import path from 'path';
import { getInstance as getLayoutService } from './SmartLayoutServiceV2.js';

class CompositionUnitGeneratorV3 {
  constructor() {
    this.layoutService = getLayoutService();
    this.cacheDir = './cache/composition-units';
    this.ensureCacheDir();

    this.videoSize = {
      width: 1080,
      height: 1920
    };
  }

  ensureCacheDir() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * 生成完整组合单元
   */
  async generateCompositionUnit(config) {
    const {
      mainTitle = '',
      subTitle = '',
      keywords = [],
      images = [],
      decorativeText = '',
      stylePreset = 'tech',
      layoutStyle = 'auto'
    } = config;

    console.log(`\n[CompositionV3] 开始生成组合单元`);
    console.log(`  标题: ${mainTitle}`);
    console.log(`  图片数量: ${images.length}`);
    console.log(`  风格: ${stylePreset}`);

    try {
      // 1. 生成背景
      console.log('\n  步骤 1/6: 生成背景...');
      const bgConfig = this.layoutService.getBackgroundConfig(stylePreset);
      const bgSvg = this.createBackgroundSVG(bgConfig);
      let currentBuffer = await sharp(Buffer.from(bgSvg)).png().toBuffer();

      // 2. 添加装饰元素
      console.log('  步骤 2/6: 添加装饰元素...');
      currentBuffer = await this.addDecorations(currentBuffer);

      // 3. 叠加图片
      if (images.length > 0) {
        console.log(`  步骤 3/6: 叠加 ${images.length} 张图片...`);
        const layouts = this.layoutService.generateLayouts(images.length, {
          layoutStyle,
          avoidPIP: true
        });

        // 验证布局
        const validation = this.layoutService.validateLayout(layouts);
        if (!validation.valid) {
          console.warn('  ⚠️  布局验证失败:', validation.issues);
        } else {
          console.log('  ✓ 布局验证通过');
        }

        currentBuffer = await this.overlayImages(currentBuffer, images, layouts);
      }

      // 4. 添加标题
      if (mainTitle) {
        console.log('  步骤 4/6: 添加标题...');
        currentBuffer = await this.addTitle(currentBuffer, mainTitle, subTitle);
      }

      // 5. 添加关键词
      if (keywords.length > 0) {
        console.log('  步骤 5/6: 添加关键词...');
        currentBuffer = await this.addKeywords(currentBuffer, keywords);
      }

      // 6. 添加 PIP 占位框
      console.log('  步骤 6/6: 添加 PIP 占位框...');
      currentBuffer = await this.addPIPFrame(currentBuffer);

      // 保存最终图片
      const outputPath = path.join(
        this.cacheDir,
        `unit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.png`
      );

      await sharp(currentBuffer).toFile(outputPath);

      console.log(`\n[CompositionV3] ✓ 组合单元生成成功`);
      console.log(`  输出路径: ${outputPath}`);

      return outputPath;

    } catch (error) {
      console.error(`\n[CompositionV3] ✗ 生成失败:`, error);
      throw error;
    }
  }

  /**
   * 创建背景 SVG
   */
  createBackgroundSVG(bgConfig) {
    const { width, height } = this.videoSize;
    const { stops } = bgConfig;

    const stopElements = stops.map(stop =>
      `<stop offset="${stop.offset}%" stop-color="${stop.color}" />`
    ).join('\n');

    return `
      <svg width="${width}" height="${height}">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
            ${stopElements}
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#bg)" />
      </svg>
    `;
  }

  /**
   * 添加装饰元素
   */
  async addDecorations(baseBuffer) {
    const { width, height } = this.videoSize;
    const decorConfig = this.layoutService.getDecorationConfig();

    const decorSVG = `
      <svg width="${width}" height="${height}">
        <!-- 顶部装饰线 -->
        <line
          x1="${decorConfig.lines.top.x1}"
          y1="${decorConfig.lines.top.y1}"
          x2="${decorConfig.lines.top.x2}"
          y2="${decorConfig.lines.top.y2}"
          stroke="${decorConfig.lines.top.stroke}"
          stroke-width="${decorConfig.lines.top.strokeWidth}"
          opacity="${decorConfig.lines.top.opacity}"
        />

        <!-- 底部装饰线 -->
        <line
          x1="${decorConfig.lines.bottom.x1}"
          y1="${decorConfig.lines.bottom.y1}"
          x2="${decorConfig.lines.bottom.x2}"
          y2="${decorConfig.lines.bottom.y2}"
          stroke="${decorConfig.lines.bottom.stroke}"
          stroke-width="${decorConfig.lines.bottom.strokeWidth}"
          opacity="${decorConfig.lines.bottom.opacity}"
        />

        <!-- 角落装饰 -->
        <polyline
          points="${decorConfig.corners.topLeft.points}"
          fill="none"
          stroke="${decorConfig.corners.topLeft.stroke}"
          stroke-width="${decorConfig.corners.topLeft.strokeWidth}"
          opacity="${decorConfig.corners.topLeft.opacity}"
        />
      </svg>
    `;

    return await sharp(baseBuffer)
      .composite([{
        input: Buffer.from(decorSVG),
        top: 0,
        left: 0
      }])
      .png()
      .toBuffer();
  }

  /**
   * 叠加图片（改进版）
   */
  async overlayImages(baseBuffer, images, layouts) {
    const composites = [];

    for (let i = 0; i < images.length; i++) {
      const imagePath = images[i];
      const layout = layouts[i];

      console.log(`    处理图片 ${i + 1}/${images.length}...`);

      try {
        // 读取原始图片
        const imageBuffer = await fs.promises.readFile(imagePath);
        const metadata = await sharp(imageBuffer).metadata();

        console.log(`      原始尺寸: ${metadata.width}x${metadata.height}`);

        // 智能裁剪和缩放
        let processedImage = sharp(imageBuffer);

        // 使用 Sharp 的智能裁剪策略
        const { fit, position, kernel } = layout.crop;

        processedImage = processedImage.resize(
          layout.size.width,
          layout.size.height,
          {
            fit: fit || 'cover',
            position: position || 'attention',  // 智能裁剪
            kernel: kernel || 'lanczos3',       // 高质量缩放
            withoutEnlargement: false
          }
        );

        // 添加圆角（如果需要）
        if (layout.style.borderRadius > 0) {
          const roundedCorners = Buffer.from(
            `<svg><rect x="0" y="0" width="${layout.size.width}" height="${layout.size.height}" rx="${layout.style.borderRadius}" ry="${layout.style.borderRadius}"/></svg>`
          );
          processedImage = processedImage.composite([{
            input: roundedCorners,
            blend: 'dest-in'
          }]);
        }

        const finalImageBuffer = await processedImage.png().toBuffer();

        // 计算位置（中心点转左上角）
        const x = Math.round(layout.position.x - layout.size.width / 2);
        const y = Math.round(layout.position.y - layout.size.height / 2);

        console.log(`      目标尺寸: ${layout.size.width}x${layout.size.height}`);
        console.log(`      位置: (${x}, ${y})`);

        // 添加阴影（如果需要）
        if (layout.style.shadow) {
          const shadowSVG = this.createShadowSVG(
            x + layout.style.shadow.offsetX,
            y + layout.style.shadow.offsetY,
            layout.size.width,
            layout.size.height,
            layout.style.borderRadius,
            layout.style.shadow
          );

          composites.push({
            input: Buffer.from(shadowSVG),
            top: 0,
            left: 0
          });
        }

        // 添加图片
        composites.push({
          input: finalImageBuffer,
          top: y,
          left: x
        });

        // 添加边框（如果需要）
        if (layout.style.borderWidth > 0) {
          const borderSVG = this.createBorderSVG(
            x,
            y,
            layout.size.width,
            layout.size.height,
            layout.style.borderRadius,
            layout.style.borderWidth,
            layout.style.borderColor
          );

          composites.push({
            input: Buffer.from(borderSVG),
            top: 0,
            left: 0
          });
        }

      } catch (error) {
        console.error(`      ✗ 处理图片失败:`, error.message);
        // 继续处理其他图片
      }
    }

    if (composites.length === 0) {
      return baseBuffer;
    }

    return await sharp(baseBuffer)
      .composite(composites)
      .png()
      .toBuffer();
  }

  /**
   * 创建阴影 SVG
   */
  createShadowSVG(x, y, width, height, borderRadius, shadow) {
    const { blur, color } = shadow;
    const { width: videoWidth, height: videoHeight } = this.videoSize;

    return `
      <svg width="${videoWidth}" height="${videoHeight}">
        <defs>
          <filter id="shadow">
            <feGaussianBlur in="SourceAlpha" stdDeviation="${blur / 2}"/>
            <feOffset dx="0" dy="${blur / 4}" result="offsetblur"/>
            <feFlood flood-color="${color}"/>
            <feComposite in2="offsetblur" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <rect
          x="${x}"
          y="${y}"
          width="${width}"
          height="${height}"
          rx="${borderRadius}"
          fill="${color}"
          filter="url(#shadow)"
        />
      </svg>
    `;
  }

  /**
   * 创建边框 SVG
   */
  createBorderSVG(x, y, width, height, borderRadius, borderWidth, borderColor) {
    const { width: videoWidth, height: videoHeight } = this.videoSize;

    return `
      <svg width="${videoWidth}" height="${videoHeight}">
        <rect
          x="${x}"
          y="${y}"
          width="${width}"
          height="${height}"
          rx="${borderRadius}"
          fill="none"
          stroke="${borderColor}"
          stroke-width="${borderWidth}"
          opacity="0.9"
        />
      </svg>
    `;
  }

  /**
   * 添加标题（改进版）
   */
  async addTitle(baseBuffer, mainTitle, subTitle = '') {
    const { width, height } = this.videoSize;
    const titleConfig = this.layoutService.getTitleConfig();
    const composites = [];

    // 主标题
    const mainConfig = titleConfig.main;
    const titleSVG = `
      <svg width="${width}" height="${height}">
        <defs>
          <filter id="title-glow">
            <feGaussianBlur stdDeviation="${mainConfig.glow.blur}" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="title-shadow">
            <feDropShadow
              dx="${mainConfig.shadow.offsetX}"
              dy="${mainConfig.shadow.offsetY}"
              stdDeviation="${mainConfig.shadow.blur / 2}"
              flood-color="${mainConfig.shadow.color}"
            />
          </filter>
        </defs>
        <text
          x="${mainConfig.x}"
          y="${mainConfig.y}"
          font-family="Arial, PingFang SC, Microsoft YaHei, sans-serif"
          font-size="${mainConfig.fontSize}"
          font-weight="${mainConfig.fontWeight}"
          fill="${mainConfig.color}"
          text-anchor="${mainConfig.align}"
          filter="url(#title-shadow)"
        >${this.escapeXml(mainTitle)}</text>
      </svg>
    `;

    composites.push({
      input: Buffer.from(titleSVG),
      top: 0,
      left: 0
    });

    console.log(`    主标题: "${mainTitle}" (${mainConfig.fontSize}px)`);

    // 副标题（如果有）
    if (subTitle) {
      const subConfig = titleConfig.sub;
      const subTitleSVG = `
        <svg width="${width}" height="${height}">
          <text
            x="${subConfig.x}"
            y="${subConfig.y}"
            font-family="Arial, PingFang SC, Microsoft YaHei, sans-serif"
            font-size="${subConfig.fontSize}"
            font-weight="${subConfig.fontWeight}"
            fill="${subConfig.color}"
            text-anchor="${subConfig.align}"
          >${this.escapeXml(subTitle)}</text>
        </svg>
      `;

      composites.push({
        input: Buffer.from(subTitleSVG),
        top: 0,
        left: 0
      });

      console.log(`    副标题: "${subTitle}" (${subConfig.fontSize}px)`);
    }

    return await sharp(baseBuffer)
      .composite(composites)
      .png()
      .toBuffer();
  }

  /**
   * 添加关键词（改进版）
   */
  async addKeywords(baseBuffer, keywords) {
    const { width, height } = this.videoSize;
    const keywordConfig = this.layoutService.getKeywordConfig();
    const composites = [];

    const { y, startX, spacing } = keywordConfig.position;
    const { height: tagHeight, padding, borderRadius, backgroundColor, opacity } = keywordConfig.style;
    const { fontSize, fontWeight, color } = keywordConfig.text;

    let currentX = startX;
    const displayKeywords = keywords.slice(0, keywordConfig.maxCount);

    for (const keyword of displayKeywords) {
      // 计算标签宽度（根据文字长度）
      const charWidth = fontSize * 0.6;  // 中文字符宽度约为字体大小的0.6倍
      const tagWidth = keyword.length * charWidth + padding * 2;

      const tagSVG = `
        <svg width="${width}" height="${height}">
          <!-- 标签背景 -->
          <rect
            x="${currentX}"
            y="${y}"
            width="${tagWidth}"
            height="${tagHeight}"
            rx="${borderRadius}"
            fill="${backgroundColor}"
            opacity="${opacity}"
          />
          <!-- 标签文字 -->
          <text
            x="${currentX + tagWidth / 2}"
            y="${y + tagHeight / 2 + fontSize / 3}"
            font-family="Arial, PingFang SC, Microsoft YaHei, sans-serif"
            font-size="${fontSize}"
            font-weight="${fontWeight}"
            fill="${color}"
            text-anchor="middle"
          >${this.escapeXml(keyword)}</text>
        </svg>
      `;

      composites.push({
        input: Buffer.from(tagSVG),
        top: 0,
        left: 0
      });

      console.log(`    关键词: "${keyword}" (宽度: ${Math.round(tagWidth)}px)`);

      currentX += tagWidth + spacing;
    }

    if (composites.length === 0) {
      return baseBuffer;
    }

    return await sharp(baseBuffer)
      .composite(composites)
      .png()
      .toBuffer();
  }

  /**
   * 添加 PIP 占位框
   */
  async addPIPFrame(baseBuffer) {
    const { width: videoWidth, height: videoHeight } = this.videoSize;
    const pip = this.layoutService.pipArea;

    const pipSVG = `
      <svg width="${videoWidth}" height="${videoHeight}">
        <rect
          x="${pip.x}"
          y="${pip.y}"
          width="${pip.width}"
          height="${pip.height}"
          rx="${pip.borderRadius}"
          fill="none"
          stroke="${pip.borderColor}"
          stroke-width="${pip.borderWidth}"
          opacity="0.8"
        />
        <text
          x="${pip.x + pip.width / 2}"
          y="${pip.y + pip.height / 2}"
          font-family="Arial"
          font-size="20"
          fill="${pip.borderColor}"
          text-anchor="middle"
          opacity="0.5"
        >PIP</text>
      </svg>
    `;

    return await sharp(baseBuffer)
      .composite([{
        input: Buffer.from(pipSVG),
        top: 0,
        left: 0
      }])
      .png()
      .toBuffer();
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
}

// 导出单例
let instance = null;

export function getInstance() {
  if (!instance) {
    instance = new CompositionUnitGeneratorV3();
  }
  return instance;
}

export { CompositionUnitGeneratorV3 };
export default CompositionUnitGeneratorV3;
