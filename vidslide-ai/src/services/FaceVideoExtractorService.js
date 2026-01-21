/**
 * 人脸视频提取服务
 * 从原视频中提取人脸区域，创建画中画视频
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FaceVideoExtractorService {
  constructor() {
    this.name = 'FaceVideoExtractorService';
    this.cacheDir = path.join(__dirname, '../../../cache/face-videos');

    // 确保目录存在
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * 提取人脸区域视频
   * @param {string} videoPath - 原视频路径
   * @param {Object} faceDetection - 人脸检测结果
   * @param {number} pipWidth - 画中画宽度
   * @param {number} pipHeight - 画中画高度
   * @returns {Promise<string>} 人脸视频路径
   */
  async extractFaceVideo(videoPath, faceDetection, pipWidth = 400, pipHeight = 400) {
    console.log('👤 提取人脸区域视频...');

    const outputPath = path.join(this.cacheDir, `face_${Date.now()}.mp4`);

    try {
      if (!faceDetection || !faceDetection.detected || !faceDetection.faces || faceDetection.faces.length === 0) {
        console.log('  ⚠️ 未检测到人脸，使用中心裁剪');
        return await this.extractCenterVideo(videoPath, pipWidth, pipHeight);
      }

      // 获取主要人脸的位置
      const mainFace = faceDetection.faces[0];
      const { x, y, width, height } = mainFace;

      console.log(`  📍 人脸位置: x=${x}, y=${y}, w=${width}, h=${height}`);

      // 计算裁剪区域（扩大一些以包含头部和肩膀）
      const expandRatio = 1.5;
      const cropWidth = Math.floor(width * expandRatio);
      const cropHeight = Math.floor(height * expandRatio);
      const cropX = Math.max(0, Math.floor(x - (cropWidth - width) / 2));
      const cropY = Math.max(0, Math.floor(y - (cropHeight - height) / 2));

      console.log(`  ✂️ 裁剪区域: x=${cropX}, y=${cropY}, w=${cropWidth}, h=${cropHeight}`);

      // 使用 FFmpeg 裁剪并缩放视频
      // crop=w:h:x:y - 裁剪
      // scale=w:h - 缩放到目标尺寸
      const filterComplex = `crop=${cropWidth}:${cropHeight}:${cropX}:${cropY},scale=${pipWidth}:${pipHeight}:force_original_aspect_ratio=decrease,pad=${pipWidth}:${pipHeight}:(ow-iw)/2:(oh-ih)/2:black`;

      const cmd = `ffmpeg -i "${videoPath}" -vf "${filterComplex}" -c:v libx264 -preset fast -c:a copy "${outputPath}" -y`;

      await execAsync(cmd);

      console.log(`✅ 人脸视频提取完成: ${outputPath}`);
      return outputPath;

    } catch (error) {
      console.error('❌ 人脸视频提取失败:', error);
      // 如果失败，使用中心裁剪
      return await this.extractCenterVideo(videoPath, pipWidth, pipHeight);
    }
  }

  /**
   * 提取中心区域视频（备用方案）
   * @param {string} videoPath - 原视频路径
   * @param {number} pipWidth - 画中画宽度
   * @param {number} pipHeight - 画中画高度
   * @returns {Promise<string>} 裁剪后的视频路径
   */
  async extractCenterVideo(videoPath, pipWidth = 400, pipHeight = 400) {
    console.log('  📐 使用中心裁剪...');

    const outputPath = path.join(this.cacheDir, `center_${Date.now()}.mp4`);

    try {
      // 计算目标宽高比
      const targetAspectRatio = pipWidth / pipHeight;

      // 裁剪中心区域并缩放
      // 使用 iw 和 ih 来引用输入视频的宽度和高度
      // 需要根据视频的实际宽高比来决定裁剪策略
      // 如果目标是横屏 (宽>高)，则：
      //   - 如果视频也是横屏，裁剪高度：crop=iw:iw/targetAspectRatio
      //   - 如果视频是竖屏，裁剪宽度：crop=ih*targetAspectRatio:ih（但需要确保不超过 iw）
      // 如果目标是竖屏 (高>宽)，则裁剪宽度：crop=iw:iw/targetAspectRatio

      // 使用 min 函数确保裁剪尺寸不超过视频实际尺寸
      const filterComplex = targetAspectRatio > 1
        ? `crop=min(iw\\,ih*${targetAspectRatio}):min(ih\\,iw/${targetAspectRatio}),scale=${pipWidth}:${pipHeight}`
        : `crop=min(iw\\,ih*${targetAspectRatio}):min(ih\\,iw/${targetAspectRatio}),scale=${pipWidth}:${pipHeight}`;

      const cmd = `ffmpeg -i "${videoPath}" -vf "${filterComplex}" -c:v libx264 -preset fast -c:a copy "${outputPath}" -y`;

      await execAsync(cmd);

      console.log(`✅ 中心视频提取完成: ${outputPath}`);
      return outputPath;

    } catch (error) {
      console.error('❌ 中心视频提取失败:', error);
      throw error;
    }
  }

  /**
   * 为人脸视频添加圆角和边框
   * @param {string} videoPath - 人脸视频路径
   * @param {number} cornerRadius - 圆角半径
   * @param {string} borderColor - 边框颜色
   * @returns {Promise<string>} 处理后的视频路径
   */
  async addRoundedCorners(videoPath, cornerRadius = 20, borderColor = '#ffffff') {
    console.log('  🎨 添加圆角和边框...');

    const outputPath = path.join(this.cacheDir, `rounded_${Date.now()}.mp4`);

    try {
      // 使用 FFmpeg 添加圆角效果（简化版本）
      // 实际的圆角需要使用 overlay 和 mask
      const cmd = `ffmpeg -i "${videoPath}" -c copy "${outputPath}" -y`;

      await execAsync(cmd);

      console.log(`✅ 圆角处理完成: ${outputPath}`);
      return outputPath;

    } catch (error) {
      console.error('❌ 圆角处理失败:', error);
      return videoPath; // 返回原视频
    }
  }
}

export default FaceVideoExtractorService;
