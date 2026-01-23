import ServerVideoCompositionService from '../../services/ServerVideoCompositionService.js';
import FaceDetectionService from '../../services/FaceDetectionService.js';
import FaceVideoExtractorServiceV2 from '../../services/FaceVideoExtractorServiceV2.js';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

/**
 * VideoEngineer - 视频工程师
 *
 * 职责：
 * 1. 提取人脸视频
 * 2. 合成最终视频
 * 3. 视频压缩和优化
 */
class VideoEngineer {
  constructor(options = {}) {
    this.name = 'VideoEngineer';
    this.compositionService = new ServerVideoCompositionService();
    this.faceDetectionService = new FaceDetectionService();
    this.faceExtractorService = new FaceVideoExtractorServiceV2();
    this.logger = options.logger || console;
    this.errorHandler = options.errorHandler;
    this.outputDir = options.outputDir || path.join(process.cwd(), 'output', 'videos');

    // 确保输出目录存在
    this.ensureOutputDir();
  }

  /**
   * 确保输出目录存在
   */
  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * 提取人脸
   * @param {Object} input - 输入参数
   * @param {string} input.videoPath - 视频路径
   * @returns {Promise<Object>} 包含faceVideo和facePosition
   */
  async extractFace(input) {
    const { videoPath } = input;

    this.logger.info('👤 VideoEngineer: 开始提取人脸');

    try {
      // 1. 检测人脸位置
      this.logger.info('  → 检测人脸位置...');
      const faceResult = await this.faceDetectionService.detectFaces(videoPath);

      if (!faceResult || !faceResult.faces || faceResult.faces.length === 0) {
        this.logger.warn('  ⚠️ 未检测到人脸，跳过人脸提取');
        return {
          faceVideo: null,
          facePosition: null
        };
      }

      this.logger.info(`  ✓ 检测到 ${faceResult.faces.length} 个人脸`);

      // 2. 计算PIP安全位置
      const pipPosition = this.faceDetectionService.calculateSafePIPPosition(
        faceResult,
        400,  // PIP宽度
        400   // PIP高度
      );

      this.logger.info(`  ✓ PIP位置: ${pipPosition.position}`);

      // 3. 提取人脸视频
      this.logger.info('  → 提取人脸视频...');
      const faceVideoPath = await this.faceExtractorService.extractFaceVideo(
        videoPath,
        faceResult.faces[0]
      );

      this.logger.info('  ✅ 人脸提取完成');

      return {
        faceVideo: faceVideoPath,
        facePosition: pipPosition
      };

    } catch (error) {
      this.logger.error('❌ 人脸提取失败', { error: error.message });
      return {
        faceVideo: null,
        facePosition: null
      };
    }
  }

  /**
   * 合成视频
   * @param {Object} input - 输入参数
   * @returns {Promise<Object>} 包含finalVideo和performance
   */
  async composeVideo(input) {
    const {
      videoPath,
      task_2_1,  // 场景设计
      task_3_1,  // 素材
      task_3_2,  // 卡片
      task_3_3,  // 背景
      task_3_4   // 人脸
    } = input;

    this.logger.info('🎬 VideoEngineer: 开始合成视频');

    const startTime = Date.now();
    const scenes = task_2_1.scenes;
    const materials = task_3_1?.materials || [];
    const cards = task_3_2?.cards || [];
    const backgrounds = task_3_3?.backgrounds || [];
    const faceVideo = task_3_4?.faceVideo;

    this.logger.info(`  → 总场景数: ${scenes.length}`);

    try {
      // 准备场景数据和图片列表
      const preparedScenes = this.prepareScenes(scenes, materials, cards, backgrounds);

      // 准备图片列表（从卡片中提取）
      const images = cards.map(card => ({
        path: card.path,
        sceneId: card.sceneId,
        fullscreen: false
      }));

      // 调用视频合成服务
      this.logger.info('  → 调用视频合成服务...');
      this.logger.info(`    - 场景数: ${preparedScenes.length}`);
      this.logger.info(`    - 图片数: ${images.length}`);

      const composedVideo = await this.compositionService.composeVideo(
        videoPath,
        preparedScenes,
        images,
        'douyin'
      );

      // 压缩视频
      this.logger.info('  → 压缩视频...');
      const finalVideo = await this.compressVideo(composedVideo);

      const duration = Date.now() - startTime;
      const fileSize = fs.statSync(finalVideo).size;

      this.logger.info('  ✅ 视频合成完成');
      this.logger.info(`    - 耗时: ${(duration / 1000).toFixed(2)}秒`);
      this.logger.info(`    - 文件大小: ${(fileSize / 1024 / 1024).toFixed(2)}MB`);

      return {
        finalVideo: finalVideo,
        performance: {
          duration: duration,
          fileSize: fileSize
        }
      };

    } catch (error) {
      this.logger.error('❌ 视频合成失败', { error: error.message });
      throw error;
    }
  }

  /**
   * 准备场景数据
   * @param {Array} scenes - 场景列表
   * @param {Array} materials - 素材列表
   * @param {Array} cards - 卡片列表
   * @param {Array} backgrounds - 背景列表
   * @returns {Array} 准备好的场景数据
   */
  prepareScenes(scenes, materials, cards, backgrounds) {
    return scenes.map(scene => {
      const preparedScene = { ...scene };

      // 添加素材
      if (scene.needMaterial) {
        const material = materials.find(m => m.sceneId === scene.id);
        if (material) {
          preparedScene.materialPath = material.material.path;
        }
      }

      // 添加卡片
      if (scene.type === 'video-with-card' || scene.type === 'multi-layer-composition') {
        const card = cards.find(c => c.sceneId === scene.id);
        if (card) {
          preparedScene.cardPath = card.path;
          preparedScene.cardAnimation = card.animation;
        }
      }

      // 添加背景
      if (scene.type === 'multi-layer-composition') {
        const background = backgrounds.find(b => b.sceneId === scene.id);
        if (background) {
          preparedScene.backgroundPath = background.path;
        }
      }

      return preparedScene;
    });
  }

  /**
   * 压缩视频
   * @param {string} videoPath - 视频路径
   * @returns {Promise<string>} 压缩后的视频路径
   */
  async compressVideo(videoPath) {
    const outputPath = videoPath.replace('.mp4', '_compressed.mp4');

    try {
      this.logger.info('  → 压缩视频中...');

      const cmd = `ffmpeg -i "${videoPath}" -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k "${outputPath}" -y`;

      execSync(cmd, { stdio: 'pipe' });

      if (!fs.existsSync(outputPath)) {
        throw new Error('视频压缩失败');
      }

      // 删除原始文件
      fs.unlinkSync(videoPath);

      return outputPath;

    } catch (error) {
      this.logger.error('视频压缩失败', { error: error.message });
      // 如果压缩失败，返回原始文件
      return videoPath;
    }
  }

  /**
   * 构建FFmpeg命令
   * @param {Object} scene - 场景对象
   * @returns {string} FFmpeg命令
   */
  buildFFmpegCommand(scene) {
    const commands = [];

    switch (scene.type) {
      case 'original':
        // 原视频场景：直接裁剪
        commands.push(`-ss ${scene.startTime} -t ${scene.endTime - scene.startTime}`);
        break;

      case 'video-with-card':
        // 卡片场景：原视频+卡片叠加
        commands.push(`-ss ${scene.startTime} -t ${scene.endTime - scene.startTime}`);
        if (scene.cardPath) {
          commands.push(`-i "${scene.cardPath}"`);
          commands.push('-filter_complex "[0:v][1:v]overlay=x=(W-w)/2:y=H-h-100"');
        }
        break;

      case 'multi-layer-composition':
        // 多层场景：5层合成
        commands.push(`-ss ${scene.startTime} -t ${scene.endTime - scene.startTime}`);
        // 背景层
        if (scene.backgroundPath) {
          commands.push(`-i "${scene.backgroundPath}"`);
        }
        // 素材层
        if (scene.materialPath) {
          commands.push(`-i "${scene.materialPath}"`);
        }
        // 卡片层
        if (scene.cardPath) {
          commands.push(`-i "${scene.cardPath}"`);
        }
        // 复杂的filter_complex命令
        commands.push('-filter_complex "[1:v][2:v]overlay[tmp];[tmp][3:v]overlay"');
        break;
    }

    return commands.join(' ');
  }

  /**
   * 获取视频信息
   * @param {string} videoPath - 视频路径
   * @returns {Promise<Object>} 视频信息
   */
  async getVideoInfo(videoPath) {
    try {
      const cmd = `ffprobe -v quiet -print_format json -show_format -show_streams "${videoPath}"`;
      const output = execSync(cmd, { encoding: 'utf-8' });
      const info = JSON.parse(output);

      const videoStream = info.streams.find(s => s.codec_type === 'video');

      return {
        duration: parseFloat(info.format.duration),
        width: videoStream.width,
        height: videoStream.height,
        fps: eval(videoStream.r_frame_rate),
        bitrate: parseInt(info.format.bit_rate)
      };

    } catch (error) {
      this.logger.error('获取视频信息失败', { error: error.message });
      return null;
    }
  }

  /**
   * 获取智能体名称
   * @returns {string}
   */
  getName() {
    return this.name;
  }

  /**
   * 获取智能体状态
   * @returns {Object}
   */
  getStatus() {
    return {
      name: this.name,
      ready: true,
      services: {
        compositionService: !!this.compositionService,
        faceDetectionService: !!this.faceDetectionService,
        faceExtractorService: !!this.faceExtractorService
      },
      outputDir: this.outputDir
    };
  }
}

export default VideoEngineer;
