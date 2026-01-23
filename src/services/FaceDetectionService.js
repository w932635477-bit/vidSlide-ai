/**
 * 人脸检测服务
 *
 * 功能:
 * - 调用 Python 脚本检测视频中的人脸
 * - 根据人脸位置计算 PIP 安全位置
 * - 缓存检测结果
 *
 * @author VidSlide AI Team
 * @version 1.0.0
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FaceDetectionService {
  constructor() {
    this.pythonScript = path.join(
      __dirname,
      '../../scripts/face_detector.py'
    );
    this.cache = new Map(); // 缓存检测结果
    console.log('✅ FaceDetectionService 初始化完成');
    console.log('  - Python 脚本路径:', this.pythonScript);
  }

  /**
   * 检测视频中的人脸
   * @param {string} videoPath - 视频文件路径
   * @param {number} sampleFrames - 采样帧数
   * @returns {Promise<Object>} 人脸检测结果
   */
  async detectFaces(videoPath, sampleFrames = 5) {
    // 检查缓存
    const cacheKey = `${videoPath}-${sampleFrames}`;
    if (this.cache.has(cacheKey)) {
      console.log('  📦 使用缓存的人脸检测结果');
      return this.cache.get(cacheKey);
    }

    console.log('🔍 开始人脸检测');
    console.log('  - 视频路径:', videoPath);
    console.log('  - 采样帧数:', sampleFrames);

    return new Promise((resolve, reject) => {
      const python = spawn('python3', [
        this.pythonScript,
        videoPath,
        sampleFrames.toString()
      ]);

      let output = '';
      let errorOutput = '';

      python.stdout.on('data', (data) => {
        output += data.toString();
      });

      python.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      python.on('close', (code) => {
        if (code !== 0) {
          console.error('❌ 人脸检测失败:', errorOutput);
          reject(new Error(`人脸检测失败: ${errorOutput}`));
          return;
        }

        try {
          const result = JSON.parse(output);

          if (result.error) {
            console.error('❌ 人脸检测错误:', result.error);
            reject(new Error(result.error));
            return;
          }

          if (result.detected) {
            console.log('✅ 检测到人脸:');
            console.log('  - 位置:', `(${result.face.x}, ${result.face.y})`);
            console.log('  - 大小:', `${result.face.width}x${result.face.height}`);
            console.log('  - 采样帧数:', result.sampledFrames);
          } else {
            console.log('⚠️ 未检测到人脸');
          }

          // 缓存结果
          this.cache.set(cacheKey, result);

          resolve(result);
        } catch (error) {
          console.error('❌ 解析人脸检测结果失败:', error);
          console.error('  - 原始输出:', output);
          reject(error);
        }
      });
    });
  }

  /**
   * 根据人脸位置计算 PIP 安全位置
   * @param {Object} faceResult - 人脸检测结果
   * @param {number} pipWidth - PIP 宽度
   * @param {number} pipHeight - PIP 高度
   * @param {number} videoWidth - 视频宽度（默认 1080）
   * @param {number} videoHeight - 视频高度（默认 1920）
   * @returns {Object} PIP 位置 {x, y, label}
   */
  calculateSafePIPPosition(faceResult, pipWidth, pipHeight, videoWidth = 1080, videoHeight = 1920) {
    console.log('📍 计算 PIP 安全位置');
    console.log('  - PIP 尺寸:', `${pipWidth}x${pipHeight}`);
    console.log('  - 视频尺寸:', `${videoWidth}x${videoHeight}`);

    // 如果没有检测到人脸，返回默认位置（中央偏上）
    if (!faceResult.detected) {
      console.log('  ⚠️ 无人脸，使用默认位置: center-default');
      return {
        x: (videoWidth - pipWidth) / 2,
        y: 500,
        label: 'center-default'
      };
    }

    const face = faceResult.face;
    const faceX = face.x;
    const faceY = face.y;
    const faceWidth = face.width;
    const faceHeight = face.height;

    console.log('  - 人脸位置:', `(${faceX}, ${faceY})`);
    console.log('  - 人脸大小:', `${faceWidth}x${faceHeight}`);

    // 定义候选位置（优先级从高到低）
    // 注意：避免底部区域 (y > 1600)，防止被抖音UI遮挡
    const candidatePositions = [
      { x: (videoWidth - pipWidth) / 2, y: 500, label: 'center-top' },
      { x: 80, y: 300, label: 'left-top' },
      { x: videoWidth - pipWidth - 80, y: 300, label: 'right-top' },
      { x: (videoWidth - pipWidth) / 2, y: 900, label: 'center-middle' },
      { x: 80, y: 600, label: 'left-middle' },
      { x: videoWidth - pipWidth - 80, y: 600, label: 'right-middle' },
    ];

    // 计算人脸区域（扩展 30% 作为安全边距）
    const safeMargin = 1.3;
    const faceArea = {
      x: faceX - (faceWidth * (safeMargin - 1)) / 2,
      y: faceY - (faceHeight * (safeMargin - 1)) / 2,
      width: faceWidth * safeMargin,
      height: faceHeight * safeMargin
    };

    console.log('  - 人脸安全区域:', `(${Math.round(faceArea.x)}, ${Math.round(faceArea.y)}) ${Math.round(faceArea.width)}x${Math.round(faceArea.height)}`);

    // 检查每个候选位置是否与人脸重叠
    for (const pos of candidatePositions) {
      const pipArea = {
        x: pos.x,
        y: pos.y,
        width: pipWidth,
        height: pipHeight
      };

      if (!this.checkOverlap(pipArea, faceArea)) {
        console.log(`  ✅ 选择安全位置: ${pos.label} (${Math.round(pos.x)}, ${Math.round(pos.y)})`);
        return pos;
      } else {
        console.log(`  ❌ 位置 ${pos.label} 与人脸重叠`);
      }
    }

    // 如果所有位置都重叠，选择重叠最小的位置
    console.log('  ⚠️ 所有位置都与人脸重叠，选择默认位置');
    return candidatePositions[0];
  }

  /**
   * 检查两个矩形是否重叠
   */
  checkOverlap(rect1, rect2) {
    return !(
      rect1.x + rect1.width < rect2.x ||
      rect2.x + rect2.width < rect1.x ||
      rect1.y + rect1.height < rect2.y ||
      rect2.y + rect2.height < rect1.y
    );
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.cache.clear();
    console.log('🧹 人脸检测缓存已清除');
  }
}

// 导出单例
let instance = null;

export function getInstance() {
  if (!instance) {
    instance = new FaceDetectionService();
  }
  return instance;
}

export default FaceDetectionService;
