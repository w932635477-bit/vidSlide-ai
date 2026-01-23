const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * 圆角蒙版生成器
 * 使用Sharp生成圆角蒙版PNG图片，用于视频和图片的圆角处理
 */
class RoundedMaskGenerator {
  constructor() {
    // 缓存目录
    this.cacheDir = path.join(__dirname, '../../cache/masks');

    // 确保缓存目录存在
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
      console.log(`✅ 创建蒙版缓存目录: ${this.cacheDir}`);
    }

    // 内存缓存
    this.memoryCache = new Map();

    // 记录上次生成的圆角半径（用于生成外圆角）
    this.lastRadius = 0;

    console.log('✅ RoundedMaskGenerator 初始化完成');
  }

  /**
   * 生成缓存键
   */
  getCacheKey(width, height, radius, options = {}) {
    const { antiAlias = true, shadow = null } = options;
    let key = `${width}x${height}_r${radius}`;

    if (!antiAlias) {
      key += '_noaa';
    }

    if (shadow) {
      key += `_s${shadow.offsetX}_${shadow.offsetY}_${shadow.blur}_${shadow.opacity}`;
    }

    return key;
  }

  /**
   * 从缓存获取蒙版
   */
  async getCachedMask(key) {
    // 检查内存缓存
    if (this.memoryCache.has(key)) {
      console.log(`    📦 从内存缓存获取蒙版: ${key}`);
      return this.memoryCache.get(key);
    }

    // 检查文件缓存
    const cachePath = path.join(this.cacheDir, `${key}.png`);
    if (fs.existsSync(cachePath)) {
      console.log(`    📦 从文件缓存获取蒙版: ${key}`);
      this.memoryCache.set(key, cachePath);
      return cachePath;
    }

    return null;
  }

  /**
   * 保存蒙版到缓存
   */
  async saveMaskToCache(key, buffer) {
    const cachePath = path.join(this.cacheDir, `${key}.png`);
    await fs.promises.writeFile(cachePath, buffer);
    this.memoryCache.set(key, cachePath);
    console.log(`    💾 蒙版已缓存: ${key}`);
    return cachePath;
  }

  /**
   * 生成基础圆角蒙版
   * @param {number} width - 宽度
   * @param {number} height - 高度
   * @param {number} radius - 圆角半径
   * @param {Object} options - 选项
   * @returns {Promise<string>} 蒙版文件路径
   */
  async generateMask(width, height, radius, options = {}) {
    const { antiAlias = true } = options;

    // 记录圆角半径
    this.lastRadius = radius;

    // 检查缓存
    const cacheKey = this.getCacheKey(width, height, radius, { antiAlias });
    const cached = await this.getCachedMask(cacheKey);
    if (cached) {
      return cached;
    }

    console.log(`    🎨 生成圆角蒙版: ${width}x${height}, 圆角=${radius}px`);

    try {
      // 创建SVG圆角矩形（白色=不透明，黑色=透明）
      const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="${width}" height="${height}"
                rx="${radius}" ry="${radius}"
                fill="white"
                ${antiAlias ? 'shape-rendering="geometricPrecision"' : ''}/>
        </svg>
      `;

      // 使用Sharp生成PNG蒙版
      const buffer = await sharp(Buffer.from(svg))
        .png({ compressionLevel: 9 })
        .toBuffer();

      // 保存到缓存
      const maskPath = await this.saveMaskToCache(cacheKey, buffer);

      console.log(`    ✅ 圆角蒙版生成成功: ${maskPath}`);
      return maskPath;

    } catch (error) {
      console.error('    ❌ 圆角蒙版生成失败:', error);
      throw error;
    }
  }

  /**
   * 生成带阴影的圆角蒙版
   * @param {number} width - 宽度
   * @param {number} height - 高度
   * @param {number} radius - 圆角半径
   * @param {Object} shadowConfig - 阴影配置
   * @returns {Promise<string>} 蒙版文件路径
   */
  async generateMaskWithShadow(width, height, radius, shadowConfig) {
    const {
      offsetX = 2,
      offsetY = 6,
      blur = 4,
      opacity = 0.3
    } = shadowConfig;

    // 检查缓存
    const cacheKey = this.getCacheKey(width, height, radius, {
      shadow: { offsetX, offsetY, blur, opacity }
    });
    const cached = await this.getCachedMask(cacheKey);
    if (cached) {
      return cached;
    }

    console.log(`    🎨 生成带阴影的圆角蒙版: ${width}x${height}, 圆角=${radius}px, 阴影=${blur}px`);

    try {
      // 计算扩展尺寸（包含阴影空间）
      const extendedWidth = width + blur * 4;
      const extendedHeight = height + blur * 4;
      const offsetFromEdge = blur * 2;

      // 创建带阴影的SVG
      const svg = `
        <svg width="${extendedWidth}" height="${extendedHeight}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="${blur}"/>
              <feOffset dx="${offsetX}" dy="${offsetY}" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="${opacity}"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <rect x="${offsetFromEdge}" y="${offsetFromEdge}"
                width="${width}" height="${height}"
                rx="${radius}" ry="${radius}"
                fill="white"
                filter="url(#shadow)"
                shape-rendering="geometricPrecision"/>
        </svg>
      `;

      // 使用Sharp生成PNG蒙版
      const buffer = await sharp(Buffer.from(svg))
        .png({ compressionLevel: 9 })
        .toBuffer();

      // 保存到缓存
      const maskPath = await this.saveMaskToCache(cacheKey, buffer);

      console.log(`    ✅ 带阴影的圆角蒙版生成成功: ${maskPath}`);
      return maskPath;

    } catch (error) {
      console.error('    ❌ 带阴影的圆角蒙版生成失败:', error);
      throw error;
    }
  }

  /**
   * 生成带边框的圆角蒙版
   * @param {number} width - 宽度
   * @param {number} height - 高度
   * @param {number} radius - 圆角半径
   * @param {number} borderWidth - 边框宽度
   * @param {string} borderColor - 边框颜色
   * @returns {Promise<string>} 蒙版文件路径
   */
  async generateMaskWithBorder(width, height, radius, borderWidth, borderColor = '#ffffff') {
    const cacheKey = `${width}x${height}_r${radius}_b${borderWidth}_${borderColor.replace('#', '')}`;
    const cached = await this.getCachedMask(cacheKey);
    if (cached) {
      return cached;
    }

    console.log(`    🎨 生成带边框的圆角蒙版: ${width}x${height}, 圆角=${radius}px, 边框=${borderWidth}px`);

    try {
      // 计算总尺寸（包含边框）
      const totalWidth = width + borderWidth * 2;
      const totalHeight = height + borderWidth * 2;

      // 创建带边框的SVG
      const svg = `
        <svg width="${totalWidth}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg">
          <!-- 边框背景 -->
          <rect x="0" y="0" width="${totalWidth}" height="${totalHeight}"
                rx="${radius + borderWidth}" ry="${radius + borderWidth}"
                fill="${borderColor}"/>
          <!-- 内部圆角矩形 -->
          <rect x="${borderWidth}" y="${borderWidth}"
                width="${width}" height="${height}"
                rx="${radius}" ry="${radius}"
                fill="white"
                shape-rendering="geometricPrecision"/>
        </svg>
      `;

      // 使用Sharp生成PNG蒙版
      const buffer = await sharp(Buffer.from(svg))
        .png({ compressionLevel: 9 })
        .toBuffer();

      // 保存到缓存
      const maskPath = await this.saveMaskToCache(cacheKey, buffer);

      console.log(`    ✅ 带边框的圆角蒙版生成成功: ${maskPath}`);
      return maskPath;

    } catch (error) {
      console.error('    ❌ 带边框的圆角蒙版生成失败:', error);
      throw error;
    }
  }

  /**
   * 清理缓存
   * @param {boolean} memoryOnly - 是否只清理内存缓存
   */
  async clearCache(memoryOnly = false) {
    console.log('🧹 清理蒙版缓存...');

    // 清理内存缓存
    this.memoryCache.clear();
    console.log('  ✅ 内存缓存已清理');

    if (!memoryOnly) {
      // 清理文件缓存
      try {
        const files = fs.readdirSync(this.cacheDir);
        for (const file of files) {
          if (file.endsWith('.png')) {
            fs.unlinkSync(path.join(this.cacheDir, file));
          }
        }
        console.log(`  ✅ 文件缓存已清理 (${files.length} 个文件)`);
      } catch (error) {
        console.error('  ❌ 文件缓存清理失败:', error);
      }
    }
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats() {
    const memoryCount = this.memoryCache.size;
    let fileCount = 0;
    let totalSize = 0;

    try {
      const files = fs.readdirSync(this.cacheDir);
      fileCount = files.filter(f => f.endsWith('.png')).length;

      files.forEach(file => {
        if (file.endsWith('.png')) {
          const filePath = path.join(this.cacheDir, file);
          const stats = fs.statSync(filePath);
          totalSize += stats.size;
        }
      });
    } catch (error) {
      console.error('获取缓存统计失败:', error);
    }

    return {
      memoryCount,
      fileCount,
      totalSize,
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(2)
    };
  }
}

module.exports = RoundedMaskGenerator;
