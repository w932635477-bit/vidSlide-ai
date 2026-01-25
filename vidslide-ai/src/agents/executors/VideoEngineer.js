import ServerVideoCompositionService from '../../services/ServerVideoCompositionService.js';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

/**
 * VideoEngineer - 视频工程师
 *
 * 职责：
 * 1. 合成最终视频（基于Timeline的layerManifest）
 * 2. 视频压缩和优化
 *
 * 注意：人脸提取由LayerOrchestrator.generateGlobalResources()完成
 */
class VideoEngineer {
  constructor(options = {}) {
    this.name = 'VideoEngineer';
    this.compositionService = new ServerVideoCompositionService();
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
   * 合成视频（新架构 - 基于Timeline）
   * @param {Object} input - 输入参数
   * @param {Object} input.timeline - Timeline对象（包含clips和layerManifest）
   * @param {string} input.videoPath - 原视频路径
   * @returns {Promise<Object>} 包含finalVideo和performance
   */
  async composeVideo(input) {
    const { timeline, videoPath } = input;

    this.logger.info('🎬 VideoEngineer: 开始合成视频（基于Timeline）');

    if (!timeline || !timeline.clips) {
      throw new Error('缺少Timeline对象或clips数组');
    }

    const startTime = Date.now();
    const clips = timeline.clips;

    this.logger.info(`  → Timeline版本: ${timeline.version || '未知'}`);
    this.logger.info(`  → 总Clip数: ${clips.length}`);

    try {
      // ⭐ 新方法：从Timeline的layerManifest转换为renderData
      const { scenes, renderData } = this.convertTimelineToRenderData(timeline);

      this.logger.info(`  → 生成了 ${scenes.length} 个场景`);
      this.logger.info(`  → 渲染层数据:`);

      // 统计各层类型
      const layerStats = {
        background: renderData.filter(l => l.layerType === 'background' && l.zIndex === 0).length,
        material: renderData.filter(l => l.layerType === 'background' && l.zIndex === 1).length,
        mask: renderData.filter(l => l.layerType === 'mask').length,
        card: renderData.filter(l => l.layerType === 'card').length,
        pip: renderData.filter(l => l.layerType === 'pip').length
      };

      this.logger.info(`    - Layer 1 (背景): ${layerStats.background}个`);
      this.logger.info(`    - Layer 2 (素材): ${layerStats.material}个`);
      this.logger.info(`    - Layer 3 (遮罩): ${layerStats.mask}个`);
      this.logger.info(`    - Layer 4 (卡片): ${layerStats.card}个`);
      this.logger.info(`    - Layer 5 (PIP): ${layerStats.pip}个`);

      // 调用视频合成服务
      this.logger.info('  → 调用多层视频合成服务...');
      const composedVideo = await this.compositionService.composeVideoWithLayers(
        videoPath,
        scenes,
        renderData,
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
   * ⭐ 将Timeline转换为RenderData（新方法）
   * @param {Object} timeline - Timeline对象
   * @returns {Object} {scenes, renderData}
   */
  convertTimelineToRenderData(timeline) {
    const scenes = [];
    const renderData = [];

    for (const clip of timeline.clips) {
      // 1. 创建scene对象
      scenes.push({
        id: clip.id,
        type: clip.type,
        startTime: clip.startTime,
        endTime: clip.endTime,
        keyword: clip.keywordObj?.text || clip.keyword
      });

      // 2. 如果是原视频clip，跳过layer处理
      if (clip.type === 'original' || !clip.layerManifest) {
        continue;
      }

      // 3. 从layerManifest提取renderData
      for (const [layerId, layerSpec] of Object.entries(clip.layerManifest)) {
        // 只处理已启用且已完成的层
        if (!layerSpec.enabled) {
          continue;
        }

        if (layerSpec.status !== 'completed' && layerSpec.status !== 'ready') {
          this.logger.warn(`  ⚠️  跳过未完成的层: ${clip.id}.${layerId} (状态: ${layerSpec.status})`);
          continue;
        }

        // 转换为renderData格式
        const layerData = {
          layerType: layerSpec.type,
          path: layerSpec.path,
          sceneId: clip.id,
          startTime: clip.startTime,
          endTime: clip.endTime,
          zIndex: layerSpec.zIndex,
          content: layerSpec.config || {}
        };

        // 特殊处理：素材层使用'background'类型但zIndex=1
        if (layerSpec.type === 'material') {
          layerData.layerType = 'background';
        }

        renderData.push(layerData);
      }
    }

    this.logger.info(`  → 转换完成: ${scenes.length}个场景, ${renderData.length}个渲染层`);

    return { scenes, renderData };
  }

  /**
   * 从场景的layers准备渲染数据（新方法）
   * @param {Array} scenes - 场景列表
   * @param {Array} materials - 素材列表
   * @param {Array} cards - 卡片列表
   * @param {Array} backgrounds - 背景列表
   * @param {string} faceVideo - 人脸视频路径
   * @returns {Array} 渲染数据列表
   */
  prepareLayersFromScenes(scenes, materials, cards, backgrounds, faceVideo) {
    const renderData = [];

    for (const scene of scenes) {
      // 如果场景有layers定义（来自TimelineEvent系统）
      if (scene.layers && Array.isArray(scene.layers)) {
        this.logger.info(`  → 场景 ${scene.id} 有 ${scene.layers.length} 个层`);

        for (const layer of scene.layers) {
          if (!layer.enabled) continue;

          let itemPath = null;

          // 根据层类型查找对应的素材路径
          if (layer.type === 'background') {
            // 查找背景素材
            const bg = backgrounds.find(b =>
              b.sceneId === scene.id || this.isTimeOverlap(b, scene)
            );
            itemPath = bg?.path;
          } else if (layer.type === 'pip') {
            // 使用人脸视频
            itemPath = faceVideo;
          } else if (layer.type === 'card') {
            // 查找卡片
            const card = cards.find(c =>
              c.sceneId === scene.id || this.isTimeOverlap(c, scene)
            );
            // 对于组合卡片，需要匹配关键词
            if (!card && scene.metadata?.isCombined && scene.metadata?.keywords) {
              // 尝试匹配关键词
              const keywordText = layer.content.keyword || layer.content.text;
              const combinedCard = cards.find(c =>
                c.keywordObj && c.keywordObj.text === keywordText
              );
              itemPath = combinedCard?.path;
            } else {
              itemPath = card?.path;
            }
          }

          if (itemPath) {
            renderData.push({
              layerType: layer.type,
              path: itemPath,
              sceneId: scene.id,
              startTime: scene.startTime,
              endTime: scene.endTime,
              zIndex: layer.zIndex,
              content: layer.content,
              sceneType: scene.type,
              isCombined: scene.metadata?.isCombined || false
            });
          }
        }
      } else {
        // 降级方案：使用旧的匹配逻辑
        this.logger.info(`  → 场景 ${scene.id} 使用降级方案`);

        // 根据场景类型添加对应的层
        if (scene.type === 'multi-layer-composition') {
          // 背景层
          const bg = backgrounds.find(b =>
            b.sceneId === scene.id || this.isTimeOverlap(b, scene)
          );
          if (bg) {
            renderData.push({
              layerType: 'background',
              path: bg.path,
              sceneId: scene.id,
              startTime: scene.startTime,
              endTime: scene.endTime,
              zIndex: 0
            });
          }

          // PIP层
          if (faceVideo) {
            renderData.push({
              layerType: 'pip',
              path: faceVideo,
              sceneId: scene.id,
              startTime: scene.startTime,
              endTime: scene.endTime,
              zIndex: 1
            });
          }
        }

        // 卡片层
        if (scene.type === 'multi-layer-composition' || scene.type === 'video-with-card') {
          const card = cards.find(c =>
            c.sceneId === scene.id || this.isTimeOverlap(c, scene)
          );
          if (card) {
            renderData.push({
              layerType: 'card',
              path: card.path,
              sceneId: scene.id,
              startTime: scene.startTime,
              endTime: scene.endTime,
              zIndex: 2
            });
          }
        }
      }
    }

    return renderData;
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

      // 添加素材（基于时间范围匹配）
      if (scene.needMaterial) {
        const material = materials.find(m =>
          m.sceneId === scene.id ||
          this.isTimeOverlap(m, scene)
        );
        if (material) {
          preparedScene.materialPath = material.material.path;
        }
      }

      // 添加卡片（基于时间范围匹配）
      if (scene.type === 'video-with-card' || scene.type === 'multi-layer-composition') {
        const card = cards.find(c =>
          c.sceneId === scene.id ||
          this.isTimeOverlap(c, scene)
        );
        if (card) {
          preparedScene.cardConfig = card;
        }
      }

      // 添加背景
      if (scene.type === 'multi-layer-composition') {
        const background = backgrounds.find(b =>
          b.sceneId === scene.id ||
          this.isTimeOverlap(b, scene)
        );
        if (background) {
          preparedScene.backgroundConfig = background;
        }
      }

      return preparedScene;
    });
  }

  /**
   * 检查时间范围是否重叠
   * @param {Object} item - 包含startTime和endTime的对象
   * @param {Object} scene - 场景对象
   * @returns {boolean} 是否重叠
   */
  isTimeOverlap(item, scene) {
    if (!item.startTime || !item.endTime || !scene.startTime || !scene.endTime) {
      return false;
    }
    // 检查时间范围是否有重叠
    return !(item.endTime <= scene.startTime || item.startTime >= scene.endTime);
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
        compositionService: !!this.compositionService
      },
      outputDir: this.outputDir
    };
  }
}

export default VideoEngineer;
