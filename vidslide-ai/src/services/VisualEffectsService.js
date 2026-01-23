import sharp from 'sharp';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

/**
 * VisualEffectsService - 视觉特效服务
 *
 * 职责：
 * 1. 为卡片添加圆角、边框、阴影
 * 2. 为画中画添加圆角、边框
 * 3. 统一管理所有视觉特效
 *
 * 基于业界最佳实践：
 * - 使用 Sharp 生成高质量蒙版
 * - 使用 FFmpeg 应用特效
 * - 参考：https://github.com/lovell/sharp
 */
class VisualEffectsService {
  constructor(options = {}) {
    this.cacheDir = options.cacheDir || path.join(process.cwd(), 'cache/effects');
    this.logger = options.logger || console;

    // 确保缓存目录存在
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }

    // 默认特效配置
    this.defaultEffects = {
      card: {
        borderRadius: 20,
        borderWidth: 0,
        borderColor: '#ffffff',
        shadow: {
          enabled: true,
          offsetX: 0,
          offsetY: 4,
          blur: 12,
          color: 'rgba(0, 0, 0, 0.3)'
        }
      },
      pip: {
        borderRadius: 200,  // 圆形
        borderWidth: 4,
        borderColor: '#ffffff',
        shadow: {
          enabled: true,
          offsetX: 0,
          offsetY: 4,
          blur: 16,
          color: 'rgba(0, 0, 0, 0.4)'
        }
      }
    };

    this.logger.info('✅ VisualEffectsService 初始化完成');
  }

  /**
   * 获取卡片特效配置
   * @param {string} style - 卡片样式 (blue | yellow | highlight)
   * @returns {Object} 特效配置
   */
  getCardEffects(style = 'blue') {
    const baseEffects = { ...this.defaultEffects.card };

    // 根据样式调整特效
    switch (style) {
      case 'blue':
        baseEffects.borderRadius = 20;
        baseEffects.shadow.color = 'rgba(0, 100, 255, 0.3)';
        break;
      case 'yellow':
        baseEffects.borderRadius = 20;
        baseEffects.shadow.color = 'rgba(255, 200, 0, 0.3)';
        break;
      case 'highlight':
        baseEffects.borderRadius = 15;
        baseEffects.borderWidth = 2;
        baseEffects.borderColor = '#ffff00';
        baseEffects.shadow.blur = 16;
        break;
      default:
        break;
    }

    return baseEffects;
  }

  /**
   * 获取画中画特效配置
   * @param {string} shape - 形状 (circle | rounded-square)
   * @returns {Object} 特效配置
   */
  getPIPEffects(shape = 'circle') {
    const baseEffects = { ...this.defaultEffects.pip };

    switch (shape) {
      case 'circle':
        // 圆形：borderRadius = width/2
        baseEffects.borderRadius = 200;  // 假设400x400，则半径200
        baseEffects.borderWidth = 4;
        break;
      case 'rounded-square':
        // 圆角矩形
        baseEffects.borderRadius = 30;
        baseEffects.borderWidth = 4;
        break;
      default:
        break;
    }

    return baseEffects;
  }

  /**
   * 生成圆角蒙版（使用Sharp + SVG）
   * 基于最佳实践：https://sharp.pixelplumbing.com/api-composite
   *
   * @param {Object} options - 配置选项
   * @returns {Promise<string>} 蒙版文件路径
   */
  async generateRoundedMask(options) {
    const {
      width,
      height,
      borderRadius,
      borderWidth = 0,
      borderColor = '#ffffff'
    } = options;

    // 生成缓存key
    const cacheKey = `mask_${width}x${height}_r${borderRadius}_b${borderWidth}`;
    const maskPath = path.join(this.cacheDir, `${cacheKey}.png`);

    // 检查缓存
    if (fs.existsSync(maskPath)) {
      this.logger.info(`   📦 使用缓存的蒙版: ${cacheKey}`);
      return maskPath;
    }

    this.logger.info(`   🎨 生成圆角蒙版: ${width}x${height}, 圆角=${borderRadius}px`);

    try {
      if (borderWidth > 0) {
        // 带边框的圆角蒙版
        await this.generateMaskWithBorder(width, height, borderRadius, borderWidth, borderColor, maskPath);
      } else {
        // 纯圆角蒙版
        await this.generatePureMask(width, height, borderRadius, maskPath);
      }

      this.logger.info(`   ✅ 蒙版生成成功: ${maskPath}`);
      return maskPath;

    } catch (error) {
      this.logger.error(`   ❌ 蒙版生成失败:`, error.message);
      throw error;
    }
  }

  /**
   * 生成纯圆角蒙版（无边框）
   */
  async generatePureMask(width, height, radius, outputPath) {
    const svg = `
      <svg width="${width}" height="${height}">
        <rect x="0" y="0" width="${width}" height="${height}"
              rx="${radius}" ry="${radius}"
              fill="white" />
      </svg>
    `;

    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);
  }

  /**
   * 生成带边框的圆角蒙版
   * 使用双层SVG：内层填充 + 外层边框
   */
  async generateMaskWithBorder(width, height, radius, borderWidth, borderColor, outputPath) {
    const totalW = width + borderWidth * 2;
    const totalH = height + borderWidth * 2;
    const halfBorder = borderWidth / 2;

    const svg = `
      <svg width="${totalW}" height="${totalH}">
        <!-- 背景（透明） -->
        <rect x="0" y="0" width="${totalW}" height="${totalH}" fill="none" />

        <!-- 内容区域（白色填充） -->
        <rect x="${borderWidth}" y="${borderWidth}"
              width="${width}" height="${height}"
              rx="${radius}" ry="${radius}"
              fill="white" />

        <!-- 边框（描边） -->
        <rect x="${halfBorder}" y="${halfBorder}"
              width="${width + borderWidth}" height="${height + borderWidth}"
              rx="${radius + halfBorder}" ry="${radius + halfBorder}"
              fill="none"
              stroke="${borderColor}"
              stroke-width="${borderWidth}" />
      </svg>
    `;

    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);
  }

  /**
   * 生成阴影图层
   * 使用模糊的圆角矩形作为阴影
   *
   * @param {Object} options - 配置选项
   * @returns {Promise<string>} 阴影图层路径
   */
  async generateShadowLayer(options) {
    const {
      width,
      height,
      borderRadius,
      offsetX = 0,
      offsetY = 4,
      blur = 12,
      color = 'rgba(0, 0, 0, 0.3)'
    } = options;

    const cacheKey = `shadow_${width}x${height}_r${borderRadius}_b${blur}`;
    const shadowPath = path.join(this.cacheDir, `${cacheKey}.png`);

    // 检查缓存
    if (fs.existsSync(shadowPath)) {
      this.logger.info(`   📦 使用缓存的阴影: ${cacheKey}`);
      return shadowPath;
    }

    this.logger.info(`   🎨 生成阴影图层: ${width}x${height}, 模糊=${blur}px`);

    try {
      // 解析颜色
      const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      const opacity = rgbaMatch ? parseFloat(rgbaMatch[4] || 1) : 0.3;

      // 创建阴影SVG
      const shadowW = width + blur * 2;
      const shadowH = height + blur * 2;

      const svg = `
        <svg width="${shadowW}" height="${shadowH}">
          <defs>
            <filter id="blur">
              <feGaussianBlur in="SourceGraphic" stdDeviation="${blur / 2}" />
            </filter>
          </defs>
          <rect x="${blur + offsetX}" y="${blur + offsetY}"
                width="${width}" height="${height}"
                rx="${borderRadius}" ry="${borderRadius}"
                fill="black"
                opacity="${opacity}"
                filter="url(#blur)" />
        </svg>
      `;

      await sharp(Buffer.from(svg))
        .png()
        .toFile(shadowPath);

      this.logger.info(`   ✅ 阴影生成成功: ${shadowPath}`);
      return shadowPath;

    } catch (error) {
      this.logger.error(`   ❌ 阴影生成失败:`, error.message);
      throw error;
    }
  }

  /**
   * 应用完整特效到图片（卡片）
   *
   * @param {string} imagePath - 输入图片路径
   * @param {Object} effects - 特效配置
   * @returns {Promise<string>} 输出图片路径
   */
  async applyEffectsToImage(imagePath, effects) {
    const {
      borderRadius = 20,
      borderWidth = 0,
      borderColor = '#ffffff',
      shadow = { enabled: false }
    } = effects;

    this.logger.info(`\n🎨 应用特效到图片: ${path.basename(imagePath)}`);

    try {
      // 1. 获取图片尺寸
      const metadata = await sharp(imagePath).metadata();
      const { width, height } = metadata;

      this.logger.info(`   尺寸: ${width}x${height}`);
      this.logger.info(`   圆角: ${borderRadius}px`);
      if (borderWidth > 0) {
        this.logger.info(`   边框: ${borderWidth}px, 颜色: ${borderColor}`);
      }
      if (shadow.enabled) {
        this.logger.info(`   阴影: 偏移(${shadow.offsetX}, ${shadow.offsetY}), 模糊=${shadow.blur}px`);
      }

      // 2. 生成圆角蒙版
      const maskPath = await this.generateRoundedMask({
        width,
        height,
        borderRadius,
        borderWidth,
        borderColor
      });

      // 3. 应用蒙版到图片
      const outputPath = imagePath.replace(/(\.[^.]+)$/, '_with_effects$1');

      let pipeline = sharp(imagePath);

      // 应用圆角蒙版
      const mask = await sharp(maskPath).toBuffer();
      pipeline = pipeline.composite([{
        input: mask,
        blend: 'dest-in'
      }]);

      // 如果需要阴影，先生成阴影层
      if (shadow.enabled) {
        const shadowPath = await this.generateShadowLayer({
          width,
          height,
          borderRadius,
          ...shadow
        });

        // 将阴影和图片合成
        const shadowBuffer = await sharp(shadowPath).toBuffer();
        const imageWithMask = await pipeline.toBuffer();

        pipeline = sharp({
          create: {
            width: width + shadow.blur * 2,
            height: height + shadow.blur * 2,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          }
        }).composite([
          { input: shadowBuffer, top: 0, left: 0 },
          { input: imageWithMask, top: shadow.blur, left: shadow.blur }
        ]);
      }

      await pipeline.png().toFile(outputPath);

      this.logger.info(`   ✅ 特效应用成功: ${outputPath}`);
      return outputPath;

    } catch (error) {
      this.logger.error(`   ❌ 特效应用失败:`, error.message);
      throw error;
    }
  }

  /**
   * 应用完整特效到视频（画中画）
   *
   * @param {string} videoPath - 输入视频路径
   * @param {Object} effects - 特效配置
   * @returns {Promise<string>} 输出视频路径
   */
  async applyEffectsToVideo(videoPath, effects) {
    const {
      width = 400,
      height = 400,
      borderRadius = 200,
      borderWidth = 4,
      borderColor = '#ffffff',
      shadow = { enabled: true }
    } = effects;

    this.logger.info(`\n🎨 应用特效到视频: ${path.basename(videoPath)}`);
    this.logger.info(`   尺寸: ${width}x${height}`);
    this.logger.info(`   圆角: ${borderRadius}px`);
    this.logger.info(`   边框: ${borderWidth}px, 颜色: ${borderColor}`);

    try {
      // 1. 生成圆角蒙版
      const maskPath = await this.generateRoundedMask({
        width,
        height,
        borderRadius,
        borderWidth,
        borderColor
      });

      // 2. 使用FFmpeg应用蒙版
      const outputPath = videoPath.replace(/(\.[^.]+)$/, '_with_effects$1');

      // FFmpeg命令：缩放 + 应用蒙版
      const ffmpegCmd = `ffmpeg -i "${videoPath}" -i "${maskPath}" \
        -filter_complex "\
          [0:v]scale=${width}:${height}:force_original_aspect_ratio=decrease,\
          pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2[scaled];\
          [scaled][1:v]alphamerge[rounded]" \
        -map "[rounded]" -c:v libx264 -pix_fmt yuva420p "${outputPath}" -y`;

      await execAsync(ffmpegCmd);

      this.logger.info(`   ✅ 特效应用成功: ${outputPath}`);
      return outputPath;

    } catch (error) {
      this.logger.error(`   ❌ 特效应用失败:`, error.message);
      throw error;
    }
  }

  /**
   * 为卡片生成完整的特效配置
   * 这个方法会被VisualDesigner调用
   *
   * @param {Object} cardConfig - 卡片配置
   * @returns {Object} 包含特效的完整配置
   */
  generateCardEffectsConfig(cardConfig) {
    const { style = 'blue', size } = cardConfig;
    const effects = this.getCardEffects(style);

    return {
      ...cardConfig,
      effects: {
        borderRadius: effects.borderRadius,
        borderWidth: effects.borderWidth,
        borderColor: effects.borderColor,
        shadow: effects.shadow,
        // CSS样式（用于前端渲染）
        css: {
          borderRadius: `${effects.borderRadius}px`,
          border: effects.borderWidth > 0 ? `${effects.borderWidth}px solid ${effects.borderColor}` : 'none',
          boxShadow: effects.shadow.enabled
            ? `${effects.shadow.offsetX}px ${effects.shadow.offsetY}px ${effects.shadow.blur}px ${effects.shadow.color}`
            : 'none'
        }
      }
    };
  }

  /**
   * 为画中画生成完整的特效配置
   * 这个方法会被VisualDesigner调用
   *
   * @param {Object} pipConfig - 画中画配置
   * @returns {Object} 包含特效的完整配置
   */
  generatePIPEffectsConfig(pipConfig) {
    const { shape = 'circle', size } = pipConfig;
    const effects = this.getPIPEffects(shape);

    // 如果是圆形，borderRadius应该是宽度的一半
    if (shape === 'circle' && size) {
      effects.borderRadius = size.width / 2;
    }

    return {
      ...pipConfig,
      effects: {
        borderRadius: effects.borderRadius,
        borderWidth: effects.borderWidth,
        borderColor: effects.borderColor,
        shadow: effects.shadow,
        // CSS样式（用于前端渲染）
        css: {
          borderRadius: shape === 'circle' ? '50%' : `${effects.borderRadius}px`,
          border: `${effects.borderWidth}px solid ${effects.borderColor}`,
          boxShadow: effects.shadow.enabled
            ? `${effects.shadow.offsetX}px ${effects.shadow.offsetY}px ${effects.shadow.blur}px ${effects.shadow.color}`
            : 'none'
        }
      }
    };
  }

  /**
   * 批量生成卡片特效
   * @param {Array} cards - 卡片数组
   * @returns {Promise<Array>} 带特效的卡片数组
   */
  async batchGenerateCardEffects(cards) {
    this.logger.info(`\n🎨 批量生成卡片特效: ${cards.length}个`);

    const results = [];

    for (const card of cards) {
      const cardWithEffects = this.generateCardEffectsConfig(card);
      results.push(cardWithEffects);
    }

    this.logger.info(`   ✅ 批量生成完成: ${results.length}个`);
    return results;
  }

  /**
   * 批量生成画中画特效
   * @param {Array} pips - 画中画数组
   * @returns {Promise<Array>} 带特效的画中画数组
   */
  async batchGeneratePIPEffects(pips) {
    this.logger.info(`\n🎨 批量生成画中画特效: ${pips.length}个`);

    const results = [];

    for (const pip of pips) {
      const pipWithEffects = this.generatePIPEffectsConfig(pip);
      results.push(pipWithEffects);
    }

    this.logger.info(`   ✅ 批量生成完成: ${results.length}个`);
    return results;
  }

  /**
   * 获取特效预设
   * @returns {Object} 特效预设
   */
  getEffectsPresets() {
    return {
      card: {
        blue: this.getCardEffects('blue'),
        yellow: this.getCardEffects('yellow'),
        highlight: this.getCardEffects('highlight')
      },
      pip: {
        circle: this.getPIPEffects('circle'),
        roundedSquare: this.getPIPEffects('rounded-square')
      }
    };
  }
}

export default VisualEffectsService;
