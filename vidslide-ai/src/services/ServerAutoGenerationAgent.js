/**
 * 服务器端一键自动生成代理
 *
 * 这是 MasterAutoGenerationAgent 的 Node.js 版本
 * 专门用于服务器端处理，支持完整的功能（豆包生图、FFmpeg等）
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import ServerVideoAnalysisService from './ServerVideoAnalysisService.js';
import ServerVideoCompositionService from './ServerVideoCompositionService.js';
import DoubaoImageService from './DoubaoImageService.js';
import SmartCropServiceV2 from './SmartCropServiceV2.js';
import FaceDetectionService from './FaceDetectionService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ServerAutoGenerationAgent {
  constructor() {
    this.name = 'ServerAutoGenerationAgent';
    this.videoAnalysisService = new ServerVideoAnalysisService();
    this.videoCompositionService = new ServerVideoCompositionService();
    this.doubaoImageService = new DoubaoImageService();
    this.smartCropService = new SmartCropServiceV2();
    this.faceDetectionService = new FaceDetectionService();
    console.log('✅ ServerAutoGenerationAgent 初始化完成');
  }

  /**
   * 完整的一键自动生成流程
   * @param {string} videoPath - 视频文件路径
   * @param {string} platform - 目标平台
   * @param {Function} onProgress - 进度回调
   * @returns {Promise<Object>} 生成结果
   */
  async autoGenerate(videoPath, platform = 'douyin', onProgress = null) {
    console.log('🚀 开始服务器端一键自动生成');
    console.log(`  - 视频路径: ${videoPath}`);
    console.log(`  - 目标平台: ${platform}`);

    try {
      // 步骤 1: 分析视频
      if (onProgress) onProgress(10, '分析视频中...');
      const analysis = await this.analyzeVideo(videoPath);

      // 步骤 2: 推荐模板
      if (onProgress) onProgress(30, '推荐模板中...');
      const template = await this.recommendTemplate(analysis);

      // 步骤 3: 组合内容
      if (onProgress) onProgress(50, '组合内容中...');
      const composition = await this.composeContent(analysis, template);

      // 步骤 4: 生成图片
      if (onProgress) onProgress(70, '生成图片中...');
      const images = await this.generateImages(composition);

      // 步骤 5: 合成视频
      if (onProgress) onProgress(85, '合成视频中...');
      const video = await this.composeVideo(videoPath, composition, images);

      // 步骤 6: 压缩视频
      if (onProgress) onProgress(95, '压缩视频中...');
      const finalVideo = await this.compressVideo(video, platform);

      // 完成
      if (onProgress) onProgress(100, '处理完成!');

      return {
        success: true,
        videoPath: finalVideo,
        template,
        composition,
        images
      };

    } catch (error) {
      console.error('❌ 服务器端一键自动生成失败:', error);
      throw error;
    }
  }

  /**
   * 分析视频
   */
  async analyzeVideo(videoPath) {
    console.log('📊 分析视频...');

    // 使用视频分析服务
    const analysis = await this.videoAnalysisService.analyzeVideo(videoPath, {
      extractKeyframes: true,
      detectScenes: true,
      speechRecognition: false, // 暂时禁用，需要百度API
      keywordExtraction: false   // 暂时禁用，需要百度API
    });

    // 添加人脸检测
    try {
      console.log('  🔍 检测人脸...');
      const faceResult = await this.faceDetectionService.detectFaces(videoPath, 5);
      analysis.faceDetection = faceResult;
      console.log('  ✅ 人脸检测完成');
    } catch (error) {
      console.error('  ⚠️ 人脸检测失败:', error.message);
      analysis.faceDetection = { detected: false };
    }

    // 如果没有关键词，使用默认关键词
    if (analysis.keywords.length === 0) {
      analysis.keywords = ['视频', '内容', '精彩', '推荐'];
    }

    return analysis;
  }

  /**
   * 推荐模板
   */
  async recommendTemplate(analysis) {
    console.log('🎯 推荐模板...');

    // TODO: 实现模板推荐逻辑

    // 临时返回默认模板
    return {
      id: 'modern-business',
      name: 'Modern Business',
      category: 'business',
      description: '现代商务风格'
    };
  }

  /**
   * 组合内容
   */
  async composeContent(analysis, template) {
    console.log('🎨 组合内容...');

    // TODO: 实现内容组合逻辑
    // - 生成场景列表
    // - 分配关键词
    // - 生成微场景

    // 临时返回模拟数据
    return {
      scenes: analysis.scenes,
      keywords: analysis.keywords,
      template,
      faceDetection: analysis.faceDetection // 保存人脸检测结果
    };
  }

  /**
   * 下载图片到本地
   * @param {string} url - 图片 URL
   * @returns {Promise<string>} 本地文件路径
   */
  async downloadImage(url) {
    return new Promise((resolve, reject) => {
      const fileName = `doubao_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
      const outputDir = path.join(__dirname, '../../../cache/doubao-images');

      // 确保目录存在
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const filePath = path.join(outputDir, fileName);
      const file = fs.createWriteStream(filePath);

      https.get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(filePath);
        });
      }).on('error', (err) => {
        fs.unlink(filePath, () => {});
        reject(err);
      });
    });
  }

  /**
   * 生成图片（豆包生图）
   */
  async generateImages(composition) {
    console.log('🖼️ 生成图片...');

    try {
      // 初始化豆包服务
      await this.doubaoImageService.initialize();

      const images = [];
      const keywords = composition.keywords || [];
      const scenes = composition.scenes || [];
      const faceDetection = composition.faceDetection || { detected: false };

      // 计算智能位置（使用人脸检测结果）
      const pipWidth = 280;
      const pipHeight = 280;
      const safePosition = this.faceDetectionService.calculateSafePIPPosition(
        faceDetection,
        pipWidth,
        pipHeight,
        1080, // 视频宽度
        1920  // 视频高度
      );

      console.log(`  📍 使用智能位置: ${safePosition.label} (${safePosition.x}, ${safePosition.y})`);

      // 为每个场景生成图片
      for (let i = 0; i < Math.min(scenes.length, keywords.length); i++) {
        const keyword = keywords[i];
        const scene = scenes[i];

        console.log(`  - 生成图片 ${i + 1}/${scenes.length}: ${keyword}`);

        try {
          // 调用豆包生图
          const imageUrl = await this.doubaoImageService.generateImage(keyword, {
            scene: scene,
            style: composition.template?.category || 'business'
          });

          if (imageUrl) {
            // 下载图片到本地
            console.log(`    - 下载图片...`);
            const imagePath = await this.downloadImage(imageUrl);
            console.log(`    - 图片已下载: ${imagePath}`);

            // 智能裁剪
            console.log(`    - 智能裁剪...`);
            const croppedBuffer = await this.smartCropService.smartCrop(imagePath, {
              width: 1080,
              height: 1920,
              strategy: 'attention'
            });

            // 保存裁剪后的图片
            const croppedPath = imagePath.replace('.jpg', '_cropped.jpg');
            fs.writeFileSync(croppedPath, croppedBuffer);
            console.log(`    - 裁剪完成: ${croppedPath}`);

            images.push({
              path: croppedPath || imagePath,
              keyword,
              position: safePosition, // 使用智能位置
              width: pipWidth,
              height: pipHeight,
              startTime: scene.startTime || 0,
              endTime: scene.endTime || 10
            });

            console.log(`    ✅ 图片 ${i + 1} 生成成功`);
          } else {
            console.log(`    ⚠️ 图片 ${i + 1} 生成失败，跳过`);
          }

        } catch (error) {
          console.error(`    ❌ 图片 ${i + 1} 生成失败:`, error.message);
        }
      }

      console.log(`✅ 图片生成完成，共 ${images.length} 张`);
      return images;

    } catch (error) {
      console.error('❌ 图片生成失败:', error);
      // 返回空数组，继续流程
      return [];
    }
  }

  /**
   * 合成视频
   */
  async composeVideo(videoPath, composition, images) {
    console.log('🎬 合成视频...');

    // 使用视频合成服务
    const finalVideo = await this.videoCompositionService.composeVideo(
      videoPath,
      composition.scenes,
      images,
      'douyin'
    );

    return finalVideo;
  }

  /**
   * 压缩视频
   */
  async compressVideo(videoPath) {
    console.log('🗜️ 压缩视频...');

    // 视频合成服务已经包含压缩步骤
    // 这里直接返回
    return videoPath;
  }
}

export default ServerAutoGenerationAgent;
