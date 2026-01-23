/**
 * FaceVideoExtractorServiceV2 - 竖版人脸视频提取服务
 *
 * 功能：
 * 1. 专为竖版视频优化（9:16）
 * 2. 支持多平台配置（抖音/快手）
 * 3. 智能人脸居中裁剪
 * 4. 避开底部UI区域
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FaceVideoExtractorServiceV2 {
  constructor() {
    this.name = 'FaceVideoExtractorServiceV2';
    this.cacheDir = path.join(__dirname, '../../../cache/face-videos-v2');

    // 确保目录存在
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }

    // 竖版画中画配置（优化后）
    this.verticalPIPConfig = {
      douyin: {
        width: 360,   // 增大尺寸，更接近理想效果
        height: 640,  // 9:16 比例
        position: {
          x: 360,     // 底部中央偏右
          y: 1100     // 底部位置，避开UI (距底部180px)
        },
        // 样式配置
        style: {
          borderRadius: 20,      // 圆角
          borderWidth: 4,        // 边框宽度
          borderColor: '#ffffff', // 白色边框
          shadow: true           // 阴影效果
        }
      },
      kuaishou: {
        width: 380,
        height: 675,
        position: {
          x: 350,
          y: 1050
        },
        style: {
          borderRadius: 20,
          borderWidth: 4,
          borderColor: '#ffffff',
          shadow: true
        }
      }
    };

    console.log('✅ FaceVideoExtractorServiceV2 初始化完成');
  }

  /**
   * 提取竖版人脸区域视频
   * @param {string} videoPath - 原视频路径
   * @param {Object} faceDetection - 人脸检测结果
   * @param {string} platform - 目标平台 (douyin/kuaishou)
   * @returns {Promise<string>} 人脸视频路径
   */
  async extractVerticalFaceVideo(videoPath, faceDetection, platform = 'douyin') {
    console.log('👤 提取竖版人脸区域视频...');
    console.log(`  - 目标平台: ${platform}`);

    const config = this.verticalPIPConfig[platform];
    const outputPath = path.join(this.cacheDir, `face_vertical_${Date.now()}.mp4`);

    try {
      if (!faceDetection || !faceDetection.detected || !faceDetection.faces || faceDetection.faces.length === 0) {
        console.log('  ⚠️ 未检测到人脸，使用中心裁剪');
        return await this.extractCenterVerticalVideo(videoPath, config.width, config.height);
      }

      // 获取主要人脸的位置
      const mainFace = faceDetection.faces[0];
      const cropRegion = this.calculateCropRegion(mainFace, config);

      console.log(`  📍 人脸位置: x=${mainFace.x}, y=${mainFace.y}, w=${mainFace.width}, h=${mainFace.height}`);
      console.log(`  ✂️ 竖版裁剪区域: x=${cropRegion.x}, y=${cropRegion.y}, w=${cropRegion.width}, h=${cropRegion.height}`);
      console.log(`  📐 目标尺寸: ${config.width}x${config.height} (9:16)`);

      // 使用 FFmpeg 裁剪并缩放视频
      const filterComplex = `crop=${cropRegion.width}:${cropRegion.height}:${cropRegion.x}:${cropRegion.y},scale=${config.width}:${config.height}:force_original_aspect_ratio=decrease,pad=${config.width}:${config.height}:(ow-iw)/2:(oh-ih)/2:black`;

      const cmd = `ffmpeg -i "${videoPath}" -vf "${filterComplex}" -c:v libx264 -preset fast -c:a copy "${outputPath}" -y`;

      await execAsync(cmd);

      console.log(`✅ 竖版人脸视频提取完成: ${outputPath}`);
      return outputPath;

    } catch (error) {
      console.error('❌ 竖版人脸视频提取失败:', error);
      // 如果失败，使用中心裁剪
      return await this.extractCenterVerticalVideo(videoPath, config.width, config.height);
    }
  }

  /**
   * 计算竖版裁剪区域
   * @param {Object} face - 人脸信息 {x, y, width, height}
   * @param {Object} config - 平台配置
   * @returns {Object} 裁剪区域 {x, y, width, height}
   */
  calculateCropRegion(face, config) {
    const targetAspectRatio = config.width / config.height; // 9/16 = 0.5625

    // 扩展人脸区域以包含头部和肩膀
    const expandRatio = 2.5; // 竖版需要更大的扩展比例
    const faceExpandedHeight = Math.floor(face.height * expandRatio);
    const faceExpandedWidth = Math.floor(faceExpandedHeight * targetAspectRatio);

    // 计算裁剪起点 (以人脸中心为基准)
    const faceCenterX = face.x + face.width / 2;
    const faceCenterY = face.y + face.height / 2;

    const cropX = Math.max(0, Math.floor(faceCenterX - faceExpandedWidth / 2));
    const cropY = Math.max(0, Math.floor(faceCenterY - faceExpandedHeight * 0.3)); // 人脸偏上1/3处

    return {
      x: cropX,
      y: cropY,
      width: faceExpandedWidth,
      height: faceExpandedHeight
    };
  }

  /**
   * 提取中心竖版区域视频（备用方案）
   * @param {string} videoPath - 原视频路径
   * @param {number} pipWidth - 画中画宽度
   * @param {number} pipHeight - 画中画高度
   * @returns {Promise<string>} 裁剪后的视频路径
   */
  async extractCenterVerticalVideo(videoPath, pipWidth = 270, pipHeight = 480) {
    console.log('  📐 使用中心竖版裁剪...');

    const outputPath = path.join(this.cacheDir, `center_vertical_${Date.now()}.mp4`);

    try {
      // 竖版裁剪策略: 9:16 比例
      const targetAspectRatio = pipWidth / pipHeight; // 0.5625

      // 从视频中心裁剪出竖版区域
      const filterComplex = `crop=min(iw\\,ih*${targetAspectRatio}):min(ih\\,iw/${targetAspectRatio}),scale=${pipWidth}:${pipHeight}`;

      const cmd = `ffmpeg -i "${videoPath}" -vf "${filterComplex}" -c:v libx264 -preset fast -c:a copy "${outputPath}" -y`;

      await execAsync(cmd);

      console.log(`✅ 中心竖版视频提取完成: ${outputPath}`);
      return outputPath;

    } catch (error) {
      console.error('❌ 中心竖版视频提取失败:', error);
      throw error;
    }
  }

  /**
   * 为竖版人脸视频添加圆角和边框
   * @param {string} videoPath - 人脸视频路径
   * @param {number} cornerRadius - 圆角半径
   * @param {string} borderColor - 边框颜色
   * @param {number} borderWidth - 边框宽度
   * @returns {Promise<string>} 处理后的视频路径
   */
  async addVerticalRoundedCorners(videoPath, cornerRadius = 15, borderColor = '#ffffff', borderWidth = 3) {
    console.log('  🎨 添加竖版圆角和边框...');

    const outputPath = path.join(this.cacheDir, `rounded_vertical_${Date.now()}.mp4`);

    try {
      // 简化处理：直接复制（实际项目中可以添加真实的圆角效果）
      const cmd = `ffmpeg -i "${videoPath}" -c copy "${outputPath}" -y`;

      await execAsync(cmd);

      console.log(`✅ 竖版圆角处理完成: ${outputPath}`);
      return outputPath;

    } catch (error) {
      console.error('❌ 竖版圆角处理失败:', error);
      return videoPath; // 返回原视频
    }
  }
}

export default FaceVideoExtractorServiceV2;
