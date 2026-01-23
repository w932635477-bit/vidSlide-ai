const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const execAsync = promisify(exec);

/**
 * 简化的圆角服务 - 基于业界最佳实践
 * 使用 Sharp 生成蒙版（替代 ImageMagick）
 * 参考：
 * - https://www.gariany.com/2020/08/ffmpeg-step-by-step-retro-video-filter/
 * - https://stackoverflow.com/questions/718314/rounding-corners-of-pictures-with-imagemagick
 */
class SimpleRoundedCornerService {
  constructor() {
    this.cacheDir = path.join(__dirname, '../../cache/masks');
    this.outputDir = path.join(__dirname, '../../output');

    // 确保目录存在
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    console.log('✅ SimpleRoundedCornerService 初始化完成');
  }

  /**
   * 使用 Sharp 生成圆角蒙版（带边框）
   * 关键：使用 SVG stroke 属性创建只有边框的圆角矩形
   * 参考: https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorials/SVG_from_scratch/Fills_and_strokes
   */
  async generateRoundedMaskWithBorder(width, height, radius, borderWidth, borderColor = 'white') {
    const cacheKey = `${width}x${height}_r${radius}_b${borderWidth}`;
    const maskPath = path.join(this.cacheDir, `${cacheKey}.png`);

    // 检查缓存
    if (fs.existsSync(maskPath)) {
      console.log(`   📦 使用缓存的蒙版: ${cacheKey}`);
      return maskPath;
    }

    console.log(`   🎨 生成圆角边框蒙版: ${width}x${height}, 圆角=${radius}px, 边框=${borderWidth}px`);

    // 计算包含边框的总尺寸
    const totalW = width + borderWidth * 2;
    const totalH = height + borderWidth * 2;

    try {
      // 使用 SVG stroke 创建只有边框的圆角矩形
      // stroke 会向内外各延伸 borderWidth/2，所以矩形位置需要调整
      const halfBorder = borderWidth / 2;
      const svg = `
        <svg width="${totalW}" height="${totalH}">
          <!-- 只有边框的圆角矩形 -->
          <rect x="${halfBorder}" y="${halfBorder}"
                width="${width + borderWidth}" height="${height + borderWidth}"
                rx="${radius}" ry="${radius}"
                fill="none"
                stroke="${borderColor}"
                stroke-width="${borderWidth}" />
        </svg>
      `;

      await sharp(Buffer.from(svg))
        .png()
        .toFile(maskPath);

      console.log(`   ✅ 蒙版生成成功: ${maskPath}`);
      return maskPath;
    } catch (error) {
      console.error(`   ❌ Sharp 生成蒙版失败:`, error.message);
      throw error;
    }
  }

  /**
   * 应用圆角和边框到视频
   * 使用简单高效的方法：
   * 1. 缩放视频到目标尺寸
   * 2. 生成圆角边框蒙版
   * 3. 将视频叠加到蒙版上
   */
  async applyRoundedCorners(videoPath, options = {}) {
    const {
      width = 360,
      height = 640,
      radius = 20,
      borderWidth = 2,
      borderColor = 'white',
      outputFormat = 'mp4'
    } = options;

    console.log(`\n🎨 应用圆角边框到视频`);
    console.log(`   视频: ${path.basename(videoPath)}`);
    console.log(`   尺寸: ${width}x${height}`);
    console.log(`   圆角: ${radius}px`);
    console.log(`   边框: ${borderWidth}px (${borderColor})`);

    // 生成蒙版
    const maskPath = await this.generateRoundedMaskWithBorder(
      width, height, radius, borderWidth, borderColor
    );

    // 输出文件路径
    const timestamp = Date.now();
    const outputPath = path.join(this.outputDir, `rounded_${timestamp}.${outputFormat}`);

    // 计算总尺寸
    const totalW = width + borderWidth * 2;
    const totalH = height + borderWidth * 2;

    // 构建 FFmpeg 命令 - 使用简单高效的方法
    // 参考: https://www.gariany.com/2020/08/ffmpeg-step-by-step-retro-video-filter/
    const filterComplex = [
      // 1. 缩放视频到目标尺寸
      `[0:v]scale=${width}:${height}[scaled]`,

      // 2. 将缩放后的视频放在边框蒙版的中心
      `[1:v][scaled]overlay=${borderWidth}:${borderWidth}[final]`
    ].join('; ');

    const ffmpegCmd = `ffmpeg -i "${videoPath}" -i "${maskPath}" ` +
                     `-filter_complex "${filterComplex}" ` +
                     `-map "[final]" ` +
                     `-c:v libx264 -pix_fmt yuv420p -preset fast ` +
                     `"${outputPath}" -y`;

    console.log(`   🎬 开始处理视频...`);

    try {
      await execAsync(ffmpegCmd);

      // 检查输出文件
      const stats = fs.statSync(outputPath);
      if (stats.size === 0) {
        throw new Error('输出文件为空');
      }

      console.log(`   ✅ 处理完成！`);
      console.log(`   📁 输出: ${outputPath}`);
      console.log(`   📊 大小: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

      return outputPath;
    } catch (error) {
      console.error(`   ❌ FFmpeg 处理失败:`, error.message);
      throw error;
    }
  }

  /**
   * 添加阴影效果（可选）
   */
  async applyRoundedCornersWithShadow(videoPath, options = {}) {
    const {
      width = 360,
      height = 640,
      radius = 20,
      borderWidth = 2,
      borderColor = 'white',
      shadowOffsetX = 4,
      shadowOffsetY = 4,
      shadowBlur = 8,
      outputFormat = 'mp4'
    } = options;

    console.log(`\n🎨 应用圆角边框和阴影到视频`);

    // 生成蒙版
    const maskPath = await this.generateRoundedMaskWithBorder(
      width, height, radius, borderWidth, borderColor
    );

    const timestamp = Date.now();
    const outputPath = path.join(this.outputDir, `rounded_shadow_${timestamp}.${outputFormat}`);

    const totalW = width + borderWidth * 2;
    const totalH = height + borderWidth * 2;

    // 计算包含阴影的画布尺寸
    const canvasW = totalW + shadowOffsetX + shadowBlur * 2;
    const canvasH = totalH + shadowOffsetY + shadowBlur * 2;

    // 使用 ImageMagick 给蒙版添加阴影
    const shadowMaskPath = path.join(this.cacheDir, `shadow_${Date.now()}.png`);
    const shadowCmd = `convert "${maskPath}" ` +
                     `\\( +clone -background black -shadow 80x${shadowBlur}+${shadowOffsetX}+${shadowOffsetY} \\) ` +
                     `+swap -background none -layers merge +repage ` +
                     `"${shadowMaskPath}"`;

    try {
      console.log(`   🎨 生成阴影效果...`);
      await execAsync(shadowCmd);

      // 应用到视频
      const filterComplex = [
        `[0:v]scale=${width}:${height}[scaled]`,
        `[1:v][scaled]overlay=${borderWidth}:${borderWidth}[final]`
      ].join('; ');

      const ffmpegCmd = `ffmpeg -i "${videoPath}" -i "${shadowMaskPath}" ` +
                       `-filter_complex "${filterComplex}" ` +
                       `-map "[final]" ` +
                       `-c:v libx264 -pix_fmt yuv420p -preset fast ` +
                       `"${outputPath}" -y`;

      console.log(`   🎬 开始处理视频...`);
      await execAsync(ffmpegCmd);

      // 清理临时文件
      fs.unlinkSync(shadowMaskPath);

      const stats = fs.statSync(outputPath);
      console.log(`   ✅ 处理完成！`);
      console.log(`   📁 输出: ${outputPath}`);
      console.log(`   📊 大小: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

      return outputPath;
    } catch (error) {
      console.error(`   ❌ 处理失败:`, error.message);
      // 清理临时文件
      if (fs.existsSync(shadowMaskPath)) {
        fs.unlinkSync(shadowMaskPath);
      }
      throw error;
    }
  }
}

module.exports = SimpleRoundedCornerService;
