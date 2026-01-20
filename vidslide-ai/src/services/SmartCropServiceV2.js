/**
 * 智能裁剪服务 V2
 * 提供多种裁剪策略，确保图片主体不被切掉
 *
 * 核心功能：
 * 1. 智能裁剪（Sharp attention 策略）
 * 2. 人脸检测裁剪（可选）
 * 3. 内容感知裁剪
 * 4. 安全边距处理
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const sharp = require('sharp');

class SmartCropServiceV2 {
  constructor() {
    // 裁剪策略
    this.strategies = {
      // 智能裁剪：保留视觉重点
      attention: {
        fit: 'cover',
        position: 'attention',
        kernel: 'lanczos3'
      },

      // 熵裁剪：保留高信息密度区域
      entropy: {
        fit: 'cover',
        position: 'entropy',
        kernel: 'lanczos3'
      },

      // 中心裁剪：保留中心区域
      center: {
        fit: 'cover',
        position: 'center',
        kernel: 'lanczos3'
      },

      // 包含模式：完整显示（不裁剪）
      contain: {
        fit: 'contain',
        position: 'center',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    };

    // 安全边距（避免裁得太紧）
    this.safeMargin = 0.05; // 5% 边距
  }

  /**
   * 智能裁剪图片
   * @param {string|Buffer} input - 输入图片路径或 Buffer
   * @param {object} options - 裁剪选项
   * @returns {Promise<Buffer>} 裁剪后的图片 Buffer
   */
  async smartCrop(input, options = {}) {
    const {
      width,
      height,
      strategy = 'attention',  // attention / entropy / center / contain
      safeMargin = true,       // 是否添加安全边距
      quality = 'high'         // high / medium / low
    } = options;

    try {
      // 读取图片元数据
      const image = sharp(input);
      const metadata = await image.metadata();

      console.log(`  [裁剪] 原始尺寸: ${metadata.width}x${metadata.height}`);
      console.log(`  [裁剪] 目标尺寸: ${width}x${height}`);
      console.log(`  [裁剪] 策略: ${strategy}`);

      // 计算实际裁剪尺寸（考虑安全边距）
      let targetWidth = width;
      let targetHeight = height;

      if (safeMargin && strategy !== 'contain') {
        // 先缩小到 95%，确保主体不被切掉
        targetWidth = Math.round(width * (1 - this.safeMargin));
        targetHeight = Math.round(height * (1 - this.safeMargin));

        console.log(`  [裁剪] 安全尺寸: ${targetWidth}x${targetHeight}`);
      }

      // 获取裁剪策略
      const cropStrategy = this.strategies[strategy] || this.strategies.attention;

      // 执行裁剪
      let processedImage = image.resize(targetWidth, targetHeight, cropStrategy);

      // 如果使用了安全边距，需要扩展回原始尺寸
      if (safeMargin && strategy !== 'contain') {
        processedImage = processedImage.extend({
          top: Math.round((height - targetHeight) / 2),
          bottom: Math.round((height - targetHeight) / 2),
          left: Math.round((width - targetWidth) / 2),
          right: Math.round((width - targetWidth) / 2),
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        });
      }

      // 设置质量参数
      const qualitySettings = this.getQualitySettings(quality);
      processedImage = processedImage.png(qualitySettings);

      const result = await processedImage.toBuffer();

      console.log(`  [裁剪] ✓ 完成`);

      return result;

    } catch (error) {
      console.error(`  [裁剪] ✗ 失败:`, error.message);
      throw error;
    }
  }

  /**
   * 批量裁剪图片
   */
  async batchCrop(images, layouts) {
    const results = [];

    for (let i = 0; i < images.length; i++) {
      const imagePath = images[i];
      const layout = layouts[i];

      console.log(`  [批量裁剪] 处理图片 ${i + 1}/${images.length}...`);

      try {
        const croppedBuffer = await this.smartCrop(imagePath, {
          width: layout.size.width,
          height: layout.size.height,
          strategy: this.selectStrategy(layout),
          safeMargin: true,
          quality: 'high'
        });

        results.push({
          buffer: croppedBuffer,
          layout: layout,
          success: true
        });

      } catch (error) {
        console.error(`  [批量裁剪] 图片 ${i + 1} 失败:`, error.message);

        results.push({
          buffer: null,
          layout: layout,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * 根据布局选择裁剪策略
   */
  selectStrategy(layout) {
    // 如果布局指定了裁剪策略，使用指定的
    if (layout.crop && layout.crop.position) {
      return layout.crop.position;
    }

    // 根据图片尺寸选择策略
    const { width, height } = layout.size;

    // 大图使用 attention（智能裁剪）
    if (width >= 600 || height >= 600) {
      return 'attention';
    }

    // 小图使用 entropy（保留高信息密度区域）
    if (width < 400 || height < 400) {
      return 'entropy';
    }

    // 中等尺寸使用 center
    return 'center';
  }

  /**
   * 获取质量设置
   */
  getQualitySettings(quality) {
    const settings = {
      high: {
        compressionLevel: 6,
        adaptiveFiltering: true,
        palette: false
      },
      medium: {
        compressionLevel: 7,
        adaptiveFiltering: true,
        palette: false
      },
      low: {
        compressionLevel: 9,
        adaptiveFiltering: false,
        palette: true
      }
    };

    return settings[quality] || settings.high;
  }

  /**
   * 分析图片内容
   * 返回图片的统计信息，用于选择最佳裁剪策略
   */
  async analyzeImage(input) {
    try {
      const image = sharp(input);
      const metadata = await image.metadata();
      const stats = await image.stats();

      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        hasAlpha: metadata.hasAlpha,
        channels: stats.channels,
        isOpaque: stats.isOpaque,
        entropy: stats.entropy,
        // 根据熵值判断图片复杂度
        complexity: stats.entropy > 7 ? 'high' : stats.entropy > 5 ? 'medium' : 'low'
      };

    } catch (error) {
      console.error(`  [分析] 失败:`, error.message);
      return null;
    }
  }

  /**
   * 智能选择裁剪策略
   * 根据图片内容自动选择最佳策略
   */
  async autoSelectStrategy(input, targetSize) {
    const analysis = await this.analyzeImage(input);

    if (!analysis) {
      return 'attention'; // 默认策略
    }

    const { width, height, complexity } = analysis;
    const aspectRatio = width / height;
    const targetAspectRatio = targetSize.width / targetSize.height;

    // 如果宽高比相近，使用 center
    if (Math.abs(aspectRatio - targetAspectRatio) < 0.1) {
      return 'center';
    }

    // 如果图片复杂度高，使用 attention（智能裁剪）
    if (complexity === 'high') {
      return 'attention';
    }

    // 如果图片复杂度低，使用 entropy（保留高信息密度区域）
    if (complexity === 'low') {
      return 'entropy';
    }

    // 默认使用 attention
    return 'attention';
  }

  /**
   * 添加圆角
   */
  async addRoundedCorners(input, radius) {
    try {
      const image = sharp(input);
      const metadata = await image.metadata();

      const roundedCorners = Buffer.from(
        `<svg><rect x="0" y="0" width="${metadata.width}" height="${metadata.height}" rx="${radius}" ry="${radius}"/></svg>`
      );

      return await image
        .composite([{
          input: roundedCorners,
          blend: 'dest-in'
        }])
        .png()
        .toBuffer();

    } catch (error) {
      console.error(`  [圆角] 失败:`, error.message);
      throw error;
    }
  }

  /**
   * 预览裁剪效果
   * 生成多种策略的预览图，用于对比
   */
  async previewCropStrategies(input, targetSize) {
    const strategies = ['attention', 'entropy', 'center', 'contain'];
    const previews = {};

    for (const strategy of strategies) {
      try {
        const buffer = await this.smartCrop(input, {
          width: targetSize.width,
          height: targetSize.height,
          strategy,
          safeMargin: true,
          quality: 'medium'
        });

        previews[strategy] = buffer;

      } catch (error) {
        console.error(`  [预览] ${strategy} 失败:`, error.message);
        previews[strategy] = null;
      }
    }

    return previews;
  }
}

// 导出单例
let instance = null;

export function getInstance() {
  if (!instance) {
    instance = new SmartCropServiceV2();
  }
  return instance;
}

export { SmartCropServiceV2 };
export default SmartCropServiceV2;
