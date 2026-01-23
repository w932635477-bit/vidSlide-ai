const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const RoundedMaskGenerator = require('./RoundedMaskGenerator.cjs');

const execAsync = promisify(exec);

/**
 * 统一的圆角处理服务
 * 支持图片、视频、Canvas的圆角处理
 */
class RoundedCornerService {
  constructor() {
    // 初始化蒙版生成器
    this.maskGenerator = new RoundedMaskGenerator();

    // 输出目录
    this.outputDir = path.join(__dirname, '../../output');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // 临时目录
    this.tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }

    console.log('✅ RoundedCornerService 初始化完成');
  }

  /**
   * 应用圆角到视频（主方法）
   * @param {string} videoPath - 视频路径
   * @param {number} radius - 圆角半径
   * @param {Object} options - 选项
   * @returns {Promise<string>} 处理后的视频路径
   */
  async applyRoundedCornersToVideo(videoPath, radius, options = {}) {
    const {
      width,
      height,
      borderWidth = 4,
      borderColor = 'white',
      shadow = { enabled: false },
      outputPath = null,
      useVP9 = true  // 默认使用VP9编码器
    } = options;

    console.log(`\n🎨 应用圆角到视频: ${path.basename(videoPath)}`);
    console.log(`   尺寸: ${width}x${height}, 圆角: ${radius}px, 边框: ${borderWidth}px`);
    console.log(`   阴影: ${shadow.enabled ? '启用' : '禁用'}, 编码器: ${useVP9 ? 'VP9' : 'H.264'}`);

    const finalOutputPath = outputPath || path.join(
      this.outputDir,
      `rounded_${Date.now()}.${useVP9 ? 'webm' : 'mp4'}`
    );

    try {
      // 生成圆角蒙版
      const maskPath = await this.maskGenerator.generateMask(width, height, radius);

      // 构建filter_complex
      let filterComplex;

      if (shadow.enabled) {
        // 带阴影的filter_complex
        filterComplex = await this._buildShadowFilterComplex(
          width, height, radius, borderWidth, borderColor, shadow
        );
      } else {
        // 无阴影的简单版本
        filterComplex = await this._buildSimpleFilterComplex(
          width, height, borderWidth, borderColor
        );
      }

      // 构建FFmpeg命令
      const cmd = this._buildFFmpegCommand(
        videoPath,
        maskPath,
        filterComplex,
        finalOutputPath,
        useVP9
      );

      console.log(`   🎬 开始处理视频...`);
      await execAsync(cmd);

      console.log(`   ✅ 视频圆角处理完成: ${finalOutputPath}`);
      return finalOutputPath;

    } catch (error) {
      console.error('   ❌ 视频圆角处理失败:', error);

      // 尝试降级方案
      if (useVP9) {
        console.log('   ⚠️ 尝试使用H.264降级方案...');
        return await this.applyRoundedCornersToVideo(videoPath, radius, {
          ...options,
          useVP9: false,
          shadow: { enabled: false }  // H.264不支持阴影
        });
      }

      throw error;
    }
  }

  /**
   * 构建简单的filter_complex（无阴影）
   */
  async _buildSimpleFilterComplex(width, height, borderWidth, borderColor) {
    const totalWidth = width + borderWidth * 2;
    const totalHeight = height + borderWidth * 2;

    // 如果有边框，需要生成包含边框的大圆角蒙版
    if (borderWidth > 0) {
      // 生成包含边框的大圆角蒙版（外圆角）
      const outerRadius = this.maskGenerator.lastRadius + borderWidth;
      const outerMaskPath = await this.maskGenerator.generateMask(totalWidth, totalHeight, outerRadius);

      return `
        [0:v]scale=${width}:${height}[scaled];
        [scaled][1:v]alphamerge[content_rounded];
        movie=${outerMaskPath}:loop=0,scale=${totalWidth}:${totalHeight},format=rgba[outer_mask];
        [outer_mask]alphaextract[border_alpha];
        color=c=${borderColor}:s=${totalWidth}x${totalHeight}:d=1[border_color];
        [border_color][border_alpha]alphamerge[border_rounded];
        [border_rounded][content_rounded]overlay=${borderWidth}:${borderWidth}[final]
      `.replace(/\s+/g, ' ').trim();
    } else {
      // 无边框，直接应用圆角
      return `
        [0:v]scale=${width}:${height}[scaled];
        [scaled][1:v]alphamerge[final]
      `.replace(/\s+/g, ' ').trim();
    }
  }

  /**
   * 构建带阴影的filter_complex
   */
  async _buildShadowFilterComplex(width, height, radius, borderWidth, borderColor, shadow) {
    const shadowOffsetX = shadow.offsetX || 2;
    const shadowOffsetY = shadow.offsetY || 6;
    const shadowBlur = shadow.blur || 4;
    const shadowOpacity = shadow.opacity || 0.3;

    // 计算包含边框的尺寸
    const contentWithBorderW = width + borderWidth * 2;
    const contentWithBorderH = height + borderWidth * 2;

    // 计算总尺寸（包含边框和阴影空间）
    const totalW = contentWithBorderW + shadowBlur * 4;
    const totalH = contentWithBorderH + shadowBlur * 4;

    // 生成包含边框的大圆角蒙版（外圆角）
    const outerRadius = radius + borderWidth;
    const outerMaskPath = await this.maskGenerator.generateMask(contentWithBorderW, contentWithBorderH, outerRadius);

    // 内容在总画布中的偏移量（考虑阴影空间）
    const contentOffsetX = shadowBlur * 2;
    const contentOffsetY = shadowBlur * 2;

    // 视频内容在边框中的偏移量
    const videoInBorderX = borderWidth;
    const videoInBorderY = borderWidth;

    // 阴影偏移量
    const shadowX = contentOffsetX + shadowOffsetX;
    const shadowY = contentOffsetY + shadowOffsetY;

    return `
      [0:v]scale=${width}:${height}[scaled];
      [scaled][1:v]alphamerge[video_rounded];
      movie=${outerMaskPath}:loop=0,scale=${contentWithBorderW}:${contentWithBorderH},format=rgba[outer_mask];
      [outer_mask]alphaextract[border_alpha];
      color=c=${borderColor}:s=${contentWithBorderW}x${contentWithBorderH}:d=1[border_color];
      [border_color][border_alpha]alphamerge[border_rounded];
      [border_rounded][video_rounded]overlay=${videoInBorderX}:${videoInBorderY}[content_with_border];
      [content_with_border]split[main][shadow_src];
      [shadow_src]geq=r=0:g=0:b=0:a='alpha(X,Y)*${shadowOpacity}'[shadow_black];
      [shadow_black]boxblur=${shadowBlur}:1[shadow_blur];
      color=c=black@0:s=${totalW}x${totalH}:d=1,format=rgba[canvas];
      [canvas][shadow_blur]overlay=${shadowX}:${shadowY}[with_shadow];
      [with_shadow][main]overlay=${contentOffsetX}:${contentOffsetY}[final]
    `.replace(/\s+/g, ' ').trim();
  }

  /**
   * 构建FFmpeg命令
   */
  _buildFFmpegCommand(videoPath, maskPath, filterComplex, outputPath, useVP9) {
    let codecParams;

    if (useVP9) {
      // VP9编码器参数（支持alpha通道）
      codecParams = `-c:v libvpx-vp9 -pix_fmt yuva420p -b:v 2M -speed 1 -threads 4`;
    } else {
      // H.264编码器参数（不支持alpha，但速度快）
      codecParams = `-c:v libx264 -pix_fmt yuv420p -preset fast`;
    }

    return `ffmpeg -i "${videoPath}" -i "${maskPath}" -filter_complex "${filterComplex}" -map "[final]" ${codecParams} "${outputPath}" -y`;
  }

  /**
   * 应用圆角到图片
   * @param {string} imagePath - 图片路径
   * @param {number} radius - 圆角半径
   * @param {Object} options - 选项
   * @returns {Promise<string>} 处理后的图片路径
   */
  async applyRoundedCornersToImage(imagePath, radius, options = {}) {
    const {
      width,
      height,
      borderWidth = 0,
      borderColor = '#ffffff',
      outputPath = null
    } = options;

    console.log(`\n🎨 应用圆角到图片: ${path.basename(imagePath)}`);

    const finalOutputPath = outputPath || path.join(
      this.outputDir,
      `rounded_${Date.now()}.png`
    );

    try {
      // 读取图片
      let image = sharp(imagePath);

      // 调整尺寸（如果指定）
      if (width && height) {
        image = image.resize(width, height, {
          fit: 'cover',
          position: 'center'
        });
      }

      // 获取图片信息
      const metadata = await image.metadata();
      const imgWidth = width || metadata.width;
      const imgHeight = height || metadata.height;

      // 生成圆角蒙版
      const maskPath = await this.maskGenerator.generateMask(imgWidth, imgHeight, radius);
      const maskBuffer = await fs.promises.readFile(maskPath);

      // 应用蒙版
      let result = await image
        .composite([{
          input: maskBuffer,
          blend: 'dest-in'
        }])
        .toBuffer();

      // 添加边框（如果需要）
      if (borderWidth > 0) {
        const totalWidth = imgWidth + borderWidth * 2;
        const totalHeight = imgHeight + borderWidth * 2;

        result = await sharp({
          create: {
            width: totalWidth,
            height: totalHeight,
            channels: 4,
            background: borderColor
          }
        })
          .composite([{
            input: result,
            top: borderWidth,
            left: borderWidth
          }])
          .png()
          .toBuffer();
      }

      // 保存结果
      await fs.promises.writeFile(finalOutputPath, result);

      console.log(`   ✅ 图片圆角处理完成: ${finalOutputPath}`);
      return finalOutputPath;

    } catch (error) {
      console.error('   ❌ 图片圆角处理失败:', error);
      throw error;
    }
  }

  /**
   * Canvas圆角绘制（用于Canvas 2D渲染）
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} width - 宽度
   * @param {number} height - 高度
   * @param {number} radius - 圆角半径
   * @param {Object} options - 选项
   */
  drawRoundedRect(ctx, x, y, width, height, radius, options = {}) {
    const {
      fillStyle = null,
      strokeStyle = null,
      lineWidth = 1,
      clip = false
    } = options;

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

    if (clip) {
      ctx.clip();
    }

    if (fillStyle) {
      ctx.fillStyle = fillStyle;
      ctx.fill();
    }

    if (strokeStyle) {
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
  }

  /**
   * 批量处理视频
   * @param {Array<string>} videoPaths - 视频路径数组
   * @param {number} radius - 圆角半径
   * @param {Object} options - 选项
   * @returns {Promise<Array<string>>} 处理后的视频路径数组
   */
  async batchProcessVideos(videoPaths, radius, options = {}) {
    console.log(`\n📦 批量处理 ${videoPaths.length} 个视频...`);

    const results = [];

    for (let i = 0; i < videoPaths.length; i++) {
      const videoPath = videoPaths[i];
      console.log(`\n[${i + 1}/${videoPaths.length}] 处理: ${path.basename(videoPath)}`);

      try {
        const result = await this.applyRoundedCornersToVideo(videoPath, radius, options);
        results.push(result);
      } catch (error) {
        console.error(`   ❌ 处理失败: ${error.message}`);
        results.push(null);
      }
    }

    const successCount = results.filter(r => r !== null).length;
    console.log(`\n✅ 批量处理完成: ${successCount}/${videoPaths.length} 成功`);

    return results;
  }

  /**
   * 检测FFmpeg是否支持VP9
   */
  async checkVP9Support() {
    try {
      const { stdout } = await execAsync('ffmpeg -codecs 2>&1 | grep vp9');
      return stdout.includes('libvpx-vp9');
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取服务统计信息
   */
  getStats() {
    const maskStats = this.maskGenerator.getCacheStats();

    return {
      maskCache: maskStats,
      outputDir: this.outputDir,
      tempDir: this.tempDir
    };
  }

  /**
   * 清理临时文件
   */
  async cleanup() {
    console.log('🧹 清理临时文件...');

    try {
      // 清理临时目录
      const tempFiles = fs.readdirSync(this.tempDir);
      for (const file of tempFiles) {
        fs.unlinkSync(path.join(this.tempDir, file));
      }
      console.log(`  ✅ 临时文件已清理 (${tempFiles.length} 个文件)`);

      // 清理蒙版缓存（仅内存）
      await this.maskGenerator.clearCache(true);

    } catch (error) {
      console.error('  ❌ 清理失败:', error);
    }
  }
}

module.exports = RoundedCornerService;
