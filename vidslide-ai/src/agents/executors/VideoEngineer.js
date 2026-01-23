import ServerVideoCompositionService from '../../services/ServerVideoCompositionService.js';
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
    this.faceExtractor = new FaceVideoExtractorServiceV2();
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
      // 使用 FaceVideoExtractorServiceV2 提取竖版人脸视频
      this.logger.info('  → 提取竖版人脸视频（画中画）...');

      const faceVideo = await this.faceExtractor.extractVerticalFaceVideo(
        videoPath,
        null, // 暂时不传人脸检测结果，使用中心裁剪
        'douyin'
      );

      this.logger.info('  ✅ 人脸视频提取成功');

      return {
        faceVideo: faceVideo,
        facePosition: null // V2版本不需要返回位置
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
      // 准备场景数据
      const preparedScenes = this.prepareScenes(scenes, materials, cards, backgrounds);

      // 提取图片列表（用于视频合成）
      const images = materials.map(m => ({
        path: m.material.path,
        keyword: m.keyword,
        fullscreen: false
      }));

      // 添加卡片到images列表
      preparedScenes.forEach(scene => {
        if (scene.cardConfig && scene.cardConfig.path) {
          images.push({
            path: scene.cardConfig.path,
            startTime: scene.startTime,
            endTime: scene.endTime,
            fullscreen: false
          });
        }
      });

      this.logger.info(`  → 图片数量: ${images.length} (包含 ${cards.length} 个卡片)`);

      // 调用视频合成服务
      this.logger.info('  → 调用视频合成服务...');
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
          preparedScene.cardConfig = card;
        }
      }

      // 添加背景
      if (scene.type === 'multi-layer-composition') {
        const background = backgrounds.find(b => b.sceneId === scene.id);
        if (background) {
          preparedScene.backgroundConfig = background;
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
        faceExtractor: !!this.faceExtractor
      },
      outputDir: this.outputDir
    };
  }
}

export default VideoEngineer;
