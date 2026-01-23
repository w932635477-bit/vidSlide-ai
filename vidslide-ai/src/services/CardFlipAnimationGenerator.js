/**
 * CardFlipAnimationGenerator - 卡片翻转动画生成器
 *
 * 功能：
 * 1. 使用Canvas生成3D翻转帧序列
 * 2. 使用FFmpeg合成为视频
 * 3. 支持自定义翻转时长和帧率
 */

import { createCanvas, loadImage } from 'canvas';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CardFlipAnimationGenerator {
  constructor() {
    this.name = 'CardFlipAnimationGenerator';
    this.cacheDir = path.join(__dirname, '../../../cache/flip-animations');

    // 确保缓存目录存在
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }

    console.log('✅ CardFlipAnimationGenerator 初始化完成');
  }

  /**
   * 生成完整的翻转视频
   * @param {string} frontImagePath - 正面图片路径（问号卡片）
   * @param {string} backImagePath - 背面图片路径（概念卡片）
   * @param {number} duration - 翻转时长（秒）
   * @param {number} fps - 帧率
   * @returns {Promise<string>} 翻转视频路径
   */
  async generateFlipVideo(frontImagePath, backImagePath, duration = 1.0, fps = 30) {
    console.log('🎬 生成卡片翻转视频...');
    console.log(`  - 正面图片: ${frontImagePath}`);
    console.log(`  - 背面图片: ${backImagePath}`);
    console.log(`  - 翻转时长: ${duration}秒`);
    console.log(`  - 帧率: ${fps}fps`);

    try {
      // 步骤1: 生成帧序列
      const frames = await this.generateFlipFrames(
        frontImagePath,
        backImagePath,
        duration,
        fps
      );

      // 步骤2: 合成视频
      const videoPath = await this.composeVideo(frames, fps);

      // 步骤3: 清理临时帧
      this.cleanupFrames(frames);

      console.log(`✅ 翻转视频生成完成: ${videoPath}`);
      return videoPath;

    } catch (error) {
      console.error('❌ 翻转视频生成失败:', error);
      throw error;
    }
  }

  /**
   * 生成翻转帧序列
   * @param {string} frontImagePath - 正面图片路径
   * @param {string} backImagePath - 背面图片路径
   * @param {number} duration - 翻转时长（秒）
   * @param {number} fps - 帧率
   * @returns {Promise<Array<string>>} 帧文件路径数组
   */
  async generateFlipFrames(frontImagePath, backImagePath, duration, fps) {
    console.log('  📐 生成翻转帧序列...');

    const totalFrames = Math.floor(duration * fps);
    const frameDir = path.join(this.cacheDir, `frames_${Date.now()}`);
    fs.mkdirSync(frameDir, { recursive: true });

    // 加载图片
    const frontImage = await loadImage(frontImagePath);
    const backImage = await loadImage(backImagePath);

    const width = 400;
    const height = 300;
    const frames = [];

    // 生成每一帧
    for (let i = 0; i < totalFrames; i++) {
      const progress = i / totalFrames;
      const angle = this.calculateFlipAngle(progress);

      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      // 绘制背景（透明）
      ctx.fillStyle = 'rgba(0, 0, 0, 0)';
      ctx.fillRect(0, 0, width, height);

      // 3D翻转效果
      const side = this.determineSide(angle);
      const scale = this.calculateScale(angle);

      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.scale(scale, 1);
      ctx.translate(-width / 2, -height / 2);

      if (side === 'front') {
        ctx.drawImage(frontImage, 0, 0, width, height);
      } else {
        // 背面需要水平翻转
        ctx.save();
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(backImage, 0, 0, width, height);
        ctx.restore();
      }

      ctx.restore();

      // 保存帧
      const framePath = path.join(frameDir, `frame_${String(i).padStart(4, '0')}.png`);
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(framePath, buffer);
      frames.push(framePath);
    }

    console.log(`  ✅ 生成了 ${totalFrames} 帧`);
    return frames;
  }

  /**
   * 计算翻转角度
   * @param {number} progress - 进度 (0-1)
   * @returns {number} 角度 (0-180)
   */
  calculateFlipAngle(progress) {
    return progress * 180;
  }

  /**
   * 计算缩放比例
   * @param {number} angle - 角度 (0-180)
   * @returns {number} 缩放比例
   */
  calculateScale(angle) {
    const radians = (angle * Math.PI) / 180;
    return Math.abs(Math.cos(radians));
  }

  /**
   * 判断显示哪一面
   * @param {number} angle - 角度 (0-180)
   * @returns {string} 'front' 或 'back'
   */
  determineSide(angle) {
    return angle < 90 ? 'front' : 'back';
  }

  /**
   * 将帧序列合成为视频
   * @param {Array<string>} frames - 帧文件路径数组
   * @param {number} fps - 帧率
   * @returns {Promise<string>} 视频路径
   */
  async composeVideo(frames, fps) {
    console.log('  🎬 合成翻转视频...');

    const frameDir = path.dirname(frames[0]);
    const outputPath = path.join(this.cacheDir, `flip_${Date.now()}.mp4`);

    // 使用FFmpeg将帧序列合成为视频
    const cmd = `ffmpeg -framerate ${fps} -i "${frameDir}/frame_%04d.png" -c:v libx264 -pix_fmt yuv420p -preset fast "${outputPath}" -y`;

    await execAsync(cmd);

    console.log(`  ✅ 视频合成完成: ${outputPath}`);
    return outputPath;
  }

  /**
   * 清理临时帧文件
   * @param {Array<string>} frames - 帧文件路径数组
   */
  cleanupFrames(frames) {
    if (frames.length === 0) return;

    const frameDir = path.dirname(frames[0]);

    try {
      fs.rmSync(frameDir, { recursive: true });
      console.log('  🧹 临时帧文件已清理');
    } catch (error) {
      console.warn('  ⚠️ 清理临时文件失败:', error.message);
    }
  }
}

export default CardFlipAnimationGenerator;
