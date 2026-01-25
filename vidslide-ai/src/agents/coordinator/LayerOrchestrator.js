/**
 * LayerOrchestrator - 层协调器
 *
 * 职责：
 * 1. 遍历Timeline的每个clip
 * 2. 检查layerManifest中哪些层需要生成
 * 3. 调用对应的智能体生成素材
 * 4. 填充path字段，更新status
 * 5. 验证所有层都已完成
 * 6. 输出UI可视化所需的状态数据
 *
 * 核心优势：
 * - Timeline as Single Source of Truth
 * - LayerManifest Pattern
 * - Status Tracking
 * - UI Visualization Support
 */

import BackgroundGeneratorService from '../../services/BackgroundGeneratorService.js';
import MaterialSearchService from '../../services/MaterialSearchService.js';
import ProfessionalCardGenerator from '../../services/ProfessionalCardGenerator.js';
import FaceVideoExtractorServiceV2 from '../../services/FaceVideoExtractorServiceV2.js';

class LayerOrchestrator {
  constructor(options = {}) {
    this.name = 'LayerOrchestrator';
    this.logger = options.logger || console;
    this.errorHandler = options.errorHandler;

    // 初始化所有生成器
    this.backgroundGenerator = new BackgroundGeneratorService();

    this.materialSearch = new MaterialSearchService({
      logger: this.logger,
      unsplashKey: process.env.UNSPLASH_ACCESS_KEY,
      pexelsKey: process.env.PEXELS_API_KEY
    });

    this.cardGenerator = new ProfessionalCardGenerator();
    this.faceExtractor = new FaceVideoExtractorServiceV2();

    // 全局资源（所有场景共享）
    this.globalPipVideo = null;
  }

  /**
   * 协调所有层的生成
   * @param {Object} input - 输入参数
   * @param {Object} input.timeline - Timeline对象（来自SceneDesigner）
   * @param {String} input.videoPath - 原视频路径
   * @returns {Object} 填充完整的Timeline + UI状态数据
   */
  async orchestrateLayers(input) {
    const { timeline, videoPath } = input;

    this.logger.info('🎨 LayerOrchestrator: 开始生成所有层');
    this.logger.info(`  视频路径: ${videoPath}`);
    this.logger.info(`  Clip数量: ${timeline.clips?.length || 0}`);

    const clips = timeline.clips || [];

    if (clips.length === 0) {
      this.logger.warn('  ⚠️  Timeline中没有clips，跳过层生成');
      return { timeline, uiState: this.generateUIState(timeline) };
    }

    try {
      // 步骤1: 生成全局资源（人脸PIP）
      await this.generateGlobalResources(videoPath);

      // 步骤2: 遍历每个clip，生成其所需的层
      for (let i = 0; i < clips.length; i++) {
        const clip = clips[i];

        if (!clip.layerManifest || Object.keys(clip.layerManifest).length === 0) {
          this.logger.info(`\n📦 Clip ${i + 1}/${clips.length}: ${clip.id} (无层)`);
          continue;
        }

        this.logger.info(`\n📦 Clip ${i + 1}/${clips.length}: ${clip.keyword || clip.id}`);
        this.logger.info(`  类型: ${clip.type}`);
        this.logger.info(`  时间: ${clip.startTime}s - ${clip.endTime}s`);

        // 生成每一层
        await this.generateLayersForClip(clip);
      }

      // 步骤3: 验证所有层都已完成
      const validation = this.validateTimeline(timeline);

      if (!validation.valid) {
        this.logger.error('❌ Timeline验证失败:');
        validation.errors.forEach(err => {
          this.logger.error(`  - ${err.clipId}.${err.layerId}: ${err.status} (${err.agent})`);
          if (err.error) {
            this.logger.error(`    错误: ${err.error}`);
          }
        });
        throw new Error(`有 ${validation.errors.length} 个层未完成`);
      }

      this.logger.info('\n✅ LayerOrchestrator: 所有层生成完成');

      // 步骤4: 生成UI可视化状态
      const uiState = this.generateUIState(timeline);

      // 步骤5: 打印状态报告（便于调试）
      this.printTimelineStatus(timeline);

      return {
        timeline: timeline,
        uiState: uiState,  // ⭐ UI可视化数据
        statistics: {
          totalClips: clips.length,
          totalLayers: this.countTotalLayers(timeline),
          completedLayers: this.countCompletedLayers(timeline),
          failedLayers: this.countFailedLayers(timeline)
        }
      };

    } catch (error) {
      this.logger.error('❌ LayerOrchestrator失败:', error.message);
      throw error;
    }
  }

  /**
   * 生成全局资源（人脸PIP）
   */
  async generateGlobalResources(videoPath) {
    this.logger.info('\n👤 生成全局资源: 人脸PIP视频');

    try {
      this.globalPipVideo = await this.faceExtractor.extractVerticalFaceVideo(
        videoPath,
        null,
        'douyin'
      );
      this.logger.info(`  ✅ 人脸PIP: ${this.globalPipVideo}`);
    } catch (error) {
      this.logger.warn(`  ⚠️  人脸提取失败: ${error.message}`);
      this.logger.warn(`  将使用中心裁剪作为后备方案`);
      this.globalPipVideo = null;
    }
  }

  /**
   * 为单个clip生成所有层
   */
  async generateLayersForClip(clip) {
    const manifest = clip.layerManifest;

    // 按zIndex排序（从底层到顶层）
    const sortedLayers = Object.entries(manifest).sort((a, b) => {
      return (a[1].zIndex || 0) - (b[1].zIndex || 0);
    });

    for (const [layerId, layerSpec] of sortedLayers) {
      // 跳过未启用的层
      if (!layerSpec.enabled) {
        this.logger.info(`  ⏭️  ${layerId} 未启用，跳过`);
        continue;
      }

      // 跳过已完成或ready的层
      if (layerSpec.status === 'completed' || layerSpec.status === 'ready') {
        this.logger.info(`  ✅ ${layerId} 已${layerSpec.status === 'ready' ? '就绪' : '完成'}`);
        continue;
      }

      // 标记为进行中
      layerSpec.status = 'in_progress';

      this.logger.info(`  🔄 生成 ${layerId} (${layerSpec.agent})...`);

      try {
        // 根据agent类型调用对应的生成器
        const result = await this.generateLayer(clip, layerId, layerSpec);

        // 更新manifest
        layerSpec.path = result.path;
        layerSpec.status = result.status || 'completed';
        layerSpec.metadata = result.metadata || {};

        this.logger.info(`    ✅ ${layerId} 完成: ${result.path || '(渲染时应用)'}`);

      } catch (error) {
        layerSpec.status = 'failed';
        layerSpec.error = error.message;

        this.logger.error(`    ❌ ${layerId} 失败: ${error.message}`);

        // 如果是关键层失败，则抛出错误
        if (layerSpec.critical) {
          throw error;
        }
      }
    }
  }

  /**
   * 生成单个层
   */
  async generateLayer(clip, layerId, layerSpec) {
    const { type, config } = layerSpec;

    switch (type) {
      case 'background':
        return await this.generateBackgroundLayer(config);

      case 'material':
        return await this.generateMaterialLayer(clip, config);

      case 'card':
        return await this.generateCardLayer(clip, config);

      case 'pip':
        return await this.generatePipLayer(config);

      case 'mask':
        // 遮罩层不需要预生成，返回ready状态
        return {
          path: null,
          status: 'ready',
          metadata: { note: '渲染时应用' }
        };

      default:
        throw new Error(`未知的层类型: ${type}`);
    }
  }

  /**
   * 生成背景层
   */
  async generateBackgroundLayer(config) {
    const { style = 'dark', width = 1080, height = 1920 } = config;

    const backgroundPath = await this.backgroundGenerator.generateBackground(
      width,
      height,
      style
    );

    return {
      path: backgroundPath,
      metadata: {
        style: style,
        dimensions: `${width}x${height}`
      }
    };
  }

  /**
   * 生成素材层
   */
  async generateMaterialLayer(clip, config) {
    const keyword = clip.keywordObj?.text || clip.keyword;

    if (!keyword) {
      throw new Error('缺少关键词，无法搜索素材');
    }

    const materialPath = await this.materialSearch.searchMaterial(keyword);

    return {
      path: materialPath,
      metadata: {
        keyword: keyword,
        source: 'MaterialSearchService'
      }
    };
  }

  /**
   * 生成卡片层
   */
  async generateCardLayer(clip, config) {
    const keyword = clip.keywordObj || { text: clip.keyword };

    const cardPath = await this.cardGenerator.generateCard(keyword, {
      style: config.style || 'bright',
      width: config.width || 600,
      height: config.height || 300,
      animation: config.animation
    });

    return {
      path: cardPath,
      metadata: {
        keyword: keyword.text,
        style: config.style || 'bright',
        dimensions: `${config.width || 600}x${config.height || 300}`
      }
    };
  }

  /**
   * 生成PIP层
   */
  async generatePipLayer(config) {
    // 使用全局PIP视频
    if (!this.globalPipVideo) {
      throw new Error('全局PIP视频未生成');
    }

    return {
      path: this.globalPipVideo,
      metadata: {
        position: config.position || 'bottom',
        dimensions: `${config.width || 360}x${config.height || 640}`,
        source: 'global'
      }
    };
  }

  /**
   * 验证Timeline完整性
   */
  validateTimeline(timeline) {
    const errors = [];

    for (const clip of timeline.clips || []) {
      if (!clip.layerManifest) continue;

      for (const [layerId, layerSpec] of Object.entries(clip.layerManifest)) {
        if (!layerSpec.enabled) continue;

        if (layerSpec.status !== 'completed' && layerSpec.status !== 'ready') {
          errors.push({
            clipId: clip.id,
            layerId: layerId,
            agent: layerSpec.agent,
            status: layerSpec.status,
            error: layerSpec.error
          });
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * ⭐ 生成UI可视化状态（用于前端时间轴显示）
   */
  generateUIState(timeline) {
    const uiState = {
      version: '1.0',
      duration: timeline.duration || 0,
      tracks: [
        { id: 'track_background', name: '背景层', zIndex: 0, color: '#2c3e50' },
        { id: 'track_material', name: '素材层', zIndex: 1, color: '#3498db' },
        { id: 'track_mask', name: '遮罩层', zIndex: 2, color: '#95a5a6' },
        { id: 'track_card', name: '卡片层', zIndex: 3, color: '#e74c3c' },
        { id: 'track_pip', name: 'PIP层', zIndex: 4, color: '#f39c12' }
      ],
      clips: []
    };

    for (const clip of timeline.clips || []) {
      const uiClip = {
        id: clip.id,
        type: clip.type,
        startTime: clip.startTime,
        endTime: clip.endTime,
        keyword: clip.keyword,
        layers: []
      };

      if (clip.layerManifest) {
        for (const [layerId, layerSpec] of Object.entries(clip.layerManifest)) {
          uiClip.layers.push({
            id: layerId,
            type: layerSpec.type,
            zIndex: layerSpec.zIndex,
            enabled: layerSpec.enabled,
            status: layerSpec.status,
            path: layerSpec.path,
            trackId: this.getTrackIdForLayerType(layerSpec.type),
            config: layerSpec.config,
            agent: layerSpec.agent,
            error: layerSpec.error
          });
        }
      }

      uiState.clips.push(uiClip);
    }

    return uiState;
  }

  /**
   * 根据层类型获取轨道ID
   */
  getTrackIdForLayerType(type) {
    const mapping = {
      'background': 'track_background',
      'material': 'track_material',
      'mask': 'track_mask',
      'card': 'track_card',
      'pip': 'track_pip'
    };
    return mapping[type] || 'track_unknown';
  }

  /**
   * 统计总层数
   */
  countTotalLayers(timeline) {
    let count = 0;
    for (const clip of timeline.clips || []) {
      if (clip.layerManifest) {
        count += Object.keys(clip.layerManifest).length;
      }
    }
    return count;
  }

  /**
   * 统计已完成的层数
   */
  countCompletedLayers(timeline) {
    let count = 0;
    for (const clip of timeline.clips || []) {
      if (clip.layerManifest) {
        for (const layerSpec of Object.values(clip.layerManifest)) {
          if (layerSpec.status === 'completed' || layerSpec.status === 'ready') {
            count++;
          }
        }
      }
    }
    return count;
  }

  /**
   * 统计失败的层数
   */
  countFailedLayers(timeline) {
    let count = 0;
    for (const clip of timeline.clips || []) {
      if (clip.layerManifest) {
        for (const layerSpec of Object.values(clip.layerManifest)) {
          if (layerSpec.status === 'failed') {
            count++;
          }
        }
      }
    }
    return count;
  }

  /**
   * 打印Timeline状态（调试用）
   */
  printTimelineStatus(timeline) {
    console.log('\n' + '='.repeat(80));
    console.log('📋 Timeline Status Report');
    console.log('='.repeat(80));

    const clips = timeline.clips || [];

    if (clips.length === 0) {
      console.log('\n  (无clips)');
      console.log('='.repeat(80));
      return;
    }

    clips.forEach((clip, i) => {
      console.log(`\n  Clip ${i + 1}: ${clip.keyword || clip.id} (${clip.startTime}s - ${clip.endTime}s)`);
      console.log(`  Type: ${clip.type}`);

      if (!clip.layerManifest || Object.keys(clip.layerManifest).length === 0) {
        console.log(`  Layers: 无 (原视频片段)`);
        return;
      }

      console.log(`  Layers:`);

      // 按zIndex排序显示
      const sortedLayers = Object.entries(clip.layerManifest).sort((a, b) => {
        return (a[1].zIndex || 0) - (b[1].zIndex || 0);
      });

      sortedLayers.forEach(([layerId, layer]) => {
        const statusIcon = {
          'pending': '⏳',
          'in_progress': '🔄',
          'completed': '✅',
          'ready': '✅',
          'failed': '❌'
        }[layer.status] || '❓';

        const statusText = layer.status === 'ready' ? '就绪' : layer.status;

        console.log(`    ${statusIcon} ${layerId} (${layer.agent}) - ${statusText}`);

        if (layer.status === 'completed' && layer.path) {
          console.log(`       Path: ${layer.path}`);
        }

        if (layer.status === 'ready') {
          console.log(`       Note: 渲染时应用`);
        }

        if (layer.status === 'failed' && layer.error) {
          console.log(`       Error: ${layer.error}`);
        }
      });
    });

    console.log('\n' + '='.repeat(80));

    // 统计信息
    const total = this.countTotalLayers(timeline);
    const completed = this.countCompletedLayers(timeline);
    const failed = this.countFailedLayers(timeline);

    console.log(`\n📊 统计:`);
    console.log(`  总层数: ${total}`);
    console.log(`  已完成: ${completed}`);
    console.log(`  失败: ${failed}`);
    console.log('='.repeat(80));
  }
}

export default LayerOrchestrator;
