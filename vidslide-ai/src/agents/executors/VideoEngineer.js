import { BaseAgent } from '../../core/BaseAgent.js';
import RemotionRenderServiceCLI from '../../services/RemotionRenderServiceCLI.js';
import MaterialSearchService from '../../services/MaterialSearchService.js';
import { getLocalBackgroundService } from '../../services/LocalBackgroundService.js';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

// ⭐ 导入知识库和场景决策引擎
import { VideoProductionKnowledge, SceneDecisionEngine } from '../../knowledge/VideoProductionKnowledge.js';

/**
 * VideoEngineer - 视频工程师（v3.0 - 知识库驱动版本）
 *
 * 继承BaseAgent，获得以下最佳实践支持：
 * - 契约验证（输入/输出）
 * - 熔断器保护
 * - 分布式追踪
 * - 断点续传
 *
 * ⭐ v3.0 新增：知识库驱动
 * - 使用知识库选择Remotion模板
 * - 基于知识库构建视觉Props
 * - 支持场景过渡效果
 *
 * 职责：
 * 1. 合成最终视频（基于Timeline的layerManifest）
 * 2. 视频压缩和优化
 * 3. 支持 Remotion 渲染方案
 *
 * 注意：人脸提取由LayerOrchestrator.generateGlobalResources()完成
 */
class VideoEngineer extends BaseAgent {
  constructor(options = {}) {
    super({
      name: 'VideoEngineer',
      enableTracing: options.enableTracing !== false,
      enableCircuitBreaker: options.enableCircuitBreaker !== false,
      enableCheckpoint: options.enableCheckpoint !== false,
      validateContracts: options.validateContracts !== false,
      ...options
    });

    this.remotionService = new RemotionRenderServiceCLI();
    this.outputDir = options.outputDir || path.join(process.cwd(), 'output', 'videos');

    // ⭐ 初始化素材搜索服务和本地背景服务
    // 使用 console 作为 logger，因为 MaterialSearchService 需要标准的 logger 接口
    this.materialSearchService = new MaterialSearchService({ logger: console });
    this.localBackgroundService = getLocalBackgroundService();

    // ⭐ 知识库和场景决策引擎
    this.knowledge = VideoProductionKnowledge;
    this.sceneEngine = new SceneDecisionEngine(this.knowledge);

    this.log('info', '✅ VideoEngineer 已加载视频制作知识库');
    this.log('info', `   本地背景图: ${this.localBackgroundService.getBackgroundCount()}张`);

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
   * 核心执行逻辑（实现BaseAgent.run）
   *
   * ⭐ v4.0 修复：使用一次性渲染，不切割视频
   * - 原视频作为底层一直播放
   * - 在特定时间点叠加卡片、素材等效果
   * - 一次性渲染整个视频，避免切割和拼接导致的卡顿
   *
   * @param {Object} input - 输入参数
   * @param {Object} input.timeline - Timeline对象
   * @param {string} input.videoPath - 原视频路径
   * @param {Object} input.styleConfig - 风格配置对象（可选）
   * @param {Object} resumeData - 恢复数据（如果有）
   * @returns {Promise<Object>} 包含finalVideo和performance
   */
  async run(input, resumeData = null) {
    const { timeline, videoPath, styleConfig } = input;

    // 如果有恢复数据，跳过已完成的步骤
    let finalVideo = resumeData?.finalVideo;

    if (!timeline || !timeline.clips) {
      throw new Error('缺少Timeline对象或clips数组');
    }

    const startTime = Date.now();

    this.log('info', '🎬 开始合成视频（一次性渲染，不切割）');
    this.log('info', `  → Timeline版本: ${timeline.version || '未知'}`);
    this.log('info', `  → 总Clip数: ${timeline.clips.length}`);
    this.log('info', `  → 视频时长: ${timeline.duration?.toFixed(1) || '未知'}秒`);

    if (styleConfig) {
      this.log('info', '  → 使用模板风格配置');
    }

    // ⭐ 使用一次性渲染方式
    if (!finalVideo) {
      // 步骤1: 转换Timeline为完整视频场景
      this.log('info', '  → 步骤1: 准备完整视频场景...');
      const fullVideoScene = await this.convertTimelineToFullVideoScene(timeline, videoPath, styleConfig);

      // 步骤2: 一次性渲染完整视频
      this.log('info', '  → 步骤2: 一次性渲染完整视频...');
      finalVideo = await this.remotionService.renderFullVideo(fullVideoScene);

      this.log('info', `  ✅ 渲染完成`);

      // 保存检查点
      await this.saveCheckpoint('render_completed', { finalVideo });
    } else {
      this.log('info', '  → 从检查点恢复渲染结果');
    }

    const duration = Date.now() - startTime;
    const fileSize = fs.existsSync(finalVideo) ? fs.statSync(finalVideo).size : 0;

    this.log('info', `  ✅ 最终视频: ${finalVideo}`);
    this.log('info', `    - 耗时: ${(duration / 1000).toFixed(2)}秒`);
    this.log('info', `    - 文件大小: ${(fileSize / 1024 / 1024).toFixed(2)}MB`);

    // 返回符合契约的输出
    return {
      finalVideo: finalVideo,
      performance: {
        duration: duration,
        fileSize: fileSize
      }
    };
  }

  /**
   * 合成视频（兼容旧接口）
   * @param {Object} input - 输入参数
   * @returns {Promise<Object>} 包含finalVideo和performance
   */
  async composeVideo(input) {
    return this.execute(input);
  }

  /**
   * ⭐ 转换 Timeline 为完整视频场景（v4.0 - 正确的叠加逻辑）
   *
   * 核心理念：
   * - 原视频作为底层一直播放（全屏，提供音频）
   * - 在特定时间点叠加卡片效果
   * - 一次性渲染完整视频，不切割不拼接
   *
   * @param {Object} timeline - Timeline对象
   * @param {string} videoPath - 原视频路径（底层全屏播放）
   * @param {Object} styleConfig - 风格配置对象（可选）
   * @returns {Promise<Object>} 单个Remotion场景（FullVideo模板）
   */
  async convertTimelineToFullVideoScene(timeline, videoPath, styleConfig = null) {
    const scenes = [];

    // ⭐ 计算视频时长：优先使用timeline.duration，否则从clips中计算
    let videoDuration = timeline.duration;
    if (!videoDuration || isNaN(videoDuration)) {
      videoDuration = Math.max(...timeline.clips.map(c => c.endTime || 0));
      this.log('info', `  → 从clips计算视频时长: ${videoDuration.toFixed(1)}秒`);
    }

    this.log('info', `  → 视频时长: ${videoDuration.toFixed(1)}秒`);
    this.log('info', `  → 原视频将作为底层全屏播放`);

    // 遍历所有clips，为每个需要叠加效果的场景准备数据
    for (const clip of timeline.clips) {
      // ⭐⭐⭐ 关键修复：传递场景类型到 Remotion
      // 原视频场景也需要传递，让 FullVideoTemplate 知道不需要叠加效果
      if (clip.type === 'original') {
        scenes.push({
          type: 'original',  // ⭐ 传递场景类型
          startTime: clip.startTime,
          endTime: clip.endTime
        });
        this.log('info', `    - 原视频场景: ${clip.startTime?.toFixed(1)}s-${clip.endTime?.toFixed(1)}s`);
        continue;
      }

      // ⭐⭐⭐ 修复：从多个来源提取关键词
      // 1. 优先使用 keywordObj
      // 2. 其次使用 keyword 字段
      // 3. 最后从 layerManifest 中的 card 层提取
      let keyword = clip.keywordObj?.text || clip.keyword;
      let english = clip.keywordObj?.english || clip.english || null;

      // 如果没有关键词，尝试从 layerManifest 中提取
      if (!keyword && clip.layerManifest) {
        const cardLayer = Object.values(clip.layerManifest).find(l => l.type === 'card' && l.enabled);
        if (cardLayer?.metadata?.keyword) {
          keyword = cardLayer.metadata.keyword;
          this.log('info', `      → 从layerManifest提取关键词: ${keyword}`);
        }
      }

      // 如果还是没有关键词，使用 clip.id 或 description 作为备用
      if (!keyword) {
        keyword = clip.description || clip.id || '未知';
        this.log('warn', `      ⚠️ 使用备用关键词: ${keyword}`);
      }

      // ⭐⭐⭐ 构建叠加效果场景对象（包含完整的类型信息）
      const scene = {
        type: clip.type,  // ⭐ 关键：传递场景类型 (video-with-card / multi-layer-composition)
        startTime: clip.startTime,
        endTime: clip.endTime,
        keyword: keyword,
        cardText: keyword,
        cardSubtitle: english,  // ⭐ 新增：英文字幕
        english: english,       // ⭐ 新增：英文（兼容）
        // ⭐ 新增：支持多卡片（用于CardGroup场景）
        cards: clip.cards || [{ text: keyword, subtitle: english, english: english }],
        cardConfig: {
          position: 'bottom',  // 卡片默认在底部
          style: 'bright'
        }
      };

      // 从layerManifest提取额外配置（如果有）
      const layers = clip.layerManifest || {};
      this.log('info', `      🔍 调试: 共${Object.keys(layers).length}个层`);

      for (const [layerId, layer] of Object.entries(layers)) {
        this.log('info', `      🔍 调试: ${layerId} - enabled=${layer.enabled}, type=${layer.type}, path=${layer.path ? '有' : '无'}`);

        if (!layer.enabled) {
          this.log('info', `      ⏭️  跳过: ${layerId} (未启用)`);
          continue;
        }

        if (layer.type === 'card' && layer.config) {
          scene.cardConfig = {
            ...scene.cardConfig,
            ...layer.config
          };
        }

        // ⭐⭐⭐ 阶段2：支持素材轮播
        if (layer.type === 'material-carousel' && layer.materials && layer.materials.length > 0) {
          scene.materialCarousel = layer.materials;
          this.log('info', `      → 素材轮播: ${layer.materials.length}个素材`);
        }
        // ⭐⭐⭐ 关键修复：传递素材图片路径（用于 multi-layer-composition 场景）
        else if (layer.type === 'material' && layer.path) {
          scene.materialImage = layer.path;
          this.log('info', `      → 素材图片: ${layer.path}`);
        }

        // ⭐⭐⭐ 关键修复：传递PIP视频路径（用于画中画效果）
        if (layer.type === 'pip' && layer.path) {
          scene.pipVideo = layer.path;
          scene.pipConfig = layer.config || {};
          this.log('info', `      → PIP视频: ${layer.path}`);
        } else if (layer.type === 'pip') {
          this.log('warn', `      ⚠️ PIP层没有path: ${layerId}`);
        }
      }

      // ⭐ 如果是多层场景但没有素材图片或素材轮播，尝试搜索素材
      if (clip.type === 'multi-layer-composition' && !scene.materialImage && !scene.materialCarousel) {
        try {
          const searchResult = await this.materialSearchService.searchMaterial(keyword);
          if (searchResult && searchResult.path) {
            scene.materialImage = searchResult.path;
            this.log('info', `      → 搜索到素材: ${searchResult.path}`);
          }
        } catch (error) {
          this.log('warn', `      ⚠️ 素材搜索失败: ${error.message}`);
        }
      }

      scenes.push(scene);
      this.log('info', `    - ${clip.type}: ${clip.startTime?.toFixed(1)}s-${clip.endTime?.toFixed(1)}s (${keyword})`);
    }

    // 构建完整视频场景
    const fullVideoScene = {
      id: 'full_video',
      template: 'FullVideo',
      duration: videoDuration,
      props: {
        videoPath: videoPath,           // 原视频（底层全屏播放，提供音频）
        scenes: scenes,                  // 叠加效果（卡片等）
        stylePreset: styleConfig?.preset || 'douyin_modern'
      },
      knowledgeSceneType: 'FULL_VIDEO'
    };

    this.log('info', `  → 生成完整视频场景: ${videoDuration?.toFixed(1)}秒, ${scenes.length}个叠加效果`);

    return fullVideoScene;
  }

  /**
   * ⭐ 转换 Timeline 为 Remotion 场景（v3.0 - 知识库驱动）
   * @param {Object} timeline - Timeline对象
   * @param {string} videoPath - 原视频路径
   * @param {Object} styleConfig - 风格配置对象（可选）
   * @returns {Array} Remotion场景数组
   */
  convertTimelineToRemotionScenes(timeline, videoPath, styleConfig = null) {
    const scenes = [];

    // ⭐ 设置视频时长到场景决策引擎
    if (timeline.duration) {
      this.sceneEngine.setVideoDuration(timeline.duration);
      this.log('info', `  → 视频时长: ${timeline.duration}秒 (${this.sceneEngine.videoCategory?.label || '未知'})`);
    }

    for (let i = 0; i < timeline.clips.length; i++) {
      const clip = timeline.clips[i];
      const template = this.selectRemotionTemplate(clip);
      const props = this.buildRemotionProps(clip, videoPath, styleConfig);

      // ⭐ 添加过渡效果（基于知识库）
      if (i > 0 && clip.transition) {
        props.transition = clip.transition;
        this.log('debug', `    → 过渡效果: ${clip.transition.type} (${clip.transition.duration}s)`);
      } else if (i > 0) {
        // 如果没有预设过渡，使用知识库推荐
        const prevClip = timeline.clips[i - 1];
        const prevType = this.mapClipTypeToKnowledge(prevClip.type);
        const currType = this.mapClipTypeToKnowledge(clip.type);
        const transition = this.sceneEngine.recommendTransition(prevType, currType);
        props.transition = transition;
        this.log('debug', `    → 过渡效果(推荐): ${transition.type} (${transition.duration}s)`);
      }

      scenes.push({
        id: clip.id,
        template,
        props,
        duration: clip.duration || (clip.endTime - clip.startTime) || 3,
        // ⭐ 添加知识库场景类型标记
        knowledgeSceneType: this.mapClipTypeToKnowledge(clip.type)
      });

      this.log('info', `    - ${clip.id}: ${template} (${(clip.duration || 3).toFixed(1)}s)`);
    }

    return scenes;
  }

  /**
   * ⭐ 将clip类型映射到知识库场景类型
   * @param {string} clipType - clip类型
   * @returns {string} 知识库场景类型
   */
  mapClipTypeToKnowledge(clipType) {
    const mapping = {
      'original': 'ORIGINAL_VIDEO',
      'video-with-card': 'VIDEO_WITH_CARDS',
      'multi-layer-composition': 'MULTI_LAYER'
    };
    return mapping[clipType] || 'ORIGINAL_VIDEO';
  }

  /**
   * ⭐ 选择 Remotion 模板（v3.0 - 知识库驱动）
   * @param {Object} clip - Clip对象
   * @returns {string} 模板名称
   */
  selectRemotionTemplate(clip) {
    // ⭐ 知识库场景类型到内部类型的映射
    const internalToKnowledge = {
      'original': 'ORIGINAL_VIDEO',
      'video-with-card': 'VIDEO_WITH_CARDS',
      'multi-layer-composition': 'MULTI_LAYER',
      'card-group': 'CARD_GROUP'  // ⭐ 新增：多卡片组合
    };

    // ⭐ 新增：检测多卡片组合场景
    if (clip.type === 'card-group' || clip.cardGroupConfig) {
      this.log('debug', `    → 模板选择: CardGroup (多卡片组合场景)`);
      return 'CardGroup';
    }

    // 1. 如果clip有知识库场景类型，直接使用
    if (clip.knowledgeSceneType) {
      const sceneConfig = this.knowledge.sceneTypes[clip.knowledgeSceneType];
      if (sceneConfig) {
        this.log('debug', `    → 模板选择: ${sceneConfig.remotionTemplate} (知识库场景类型: ${clip.knowledgeSceneType})`);
        return sceneConfig.remotionTemplate;
      }
    }

    // 2. 根据clip.type映射到知识库场景类型
    const knowledgeType = internalToKnowledge[clip.type];
    if (knowledgeType) {
      const sceneConfig = this.knowledge.sceneTypes[knowledgeType];
      if (sceneConfig) {
        this.log('debug', `    → 模板选择: ${sceneConfig.remotionTemplate} (映射自clip.type: ${clip.type})`);
        return sceneConfig.remotionTemplate;
      }
    }

    // 3. 检查 layerManifest 进行智能推断
    const layers = clip.layerManifest || {};
    const enabledLayers = Object.values(layers).filter(l => l.enabled);

    // 有PIP层 → 使用PIP模板
    const hasPip = enabledLayers.some(l => l.type === 'pip');
    if (hasPip) {
      const pipConfig = this.knowledge.sceneTypes.PIP;
      this.log('debug', `    → 模板选择: ${pipConfig.remotionTemplate} (检测到PIP层)`);
      return pipConfig.remotionTemplate;
    }

    // 只有卡片层 → VideoWithCards
    if (enabledLayers.length === 1 && enabledLayers[0].type === 'card') {
      const cardConfig = this.knowledge.sceneTypes.VIDEO_WITH_CARDS;
      this.log('debug', `    → 模板选择: ${cardConfig.remotionTemplate} (单卡片层)`);
      return cardConfig.remotionTemplate;
    }

    // 有多个层 → MultiLayer
    if (enabledLayers.length > 1) {
      const multiConfig = this.knowledge.sceneTypes.MULTI_LAYER;
      this.log('debug', `    → 模板选择: ${multiConfig.remotionTemplate} (${enabledLayers.length}个层)`);
      return multiConfig.remotionTemplate;
    }

    // 默认使用原始视频模板
    const defaultConfig = this.knowledge.sceneTypes.ORIGINAL_VIDEO;
    this.log('debug', `    → 模板选择: ${defaultConfig.remotionTemplate} (默认)`);
    return defaultConfig.remotionTemplate;
  }

  /**
   * ⭐ 构建 Remotion Props（v3.0 - 知识库驱动）
   * @param {Object} clip - Clip对象
   * @param {string} videoPath - 原视频路径
   * @param {Object} styleConfig - 风格配置对象（可选）
   * @returns {Object} Props对象
   */
  buildRemotionProps(clip, videoPath, styleConfig = null) {
    const template = this.selectRemotionTemplate(clip);
    const props = { videoPath };

    // ⭐ 添加风格配置到 props
    if (styleConfig) {
      props.styleConfig = styleConfig;
    }

    // ⭐ 从知识库获取视觉规范
    const visualElements = this.knowledge.visualElements;
    const colorSystem = this.knowledge.colorSystem;
    const animationSystem = this.knowledge.animationSystem;

    // ⭐ 构建知识库驱动的视觉配置
    props.knowledgeVisuals = {
      typography: visualElements.typography,
      cards: visualElements.cards,
      colors: colorSystem,
      animation: animationSystem
    };

    if (template === 'OriginalVideo') {
      props.startTime = clip.startTime;
      props.duration = clip.endTime - clip.startTime;
    }
    else if (template === 'VideoWithCards') {
      props.keywords = this.extractKeywords(clip);
      props.startTime = clip.startTime;
      props.duration = clip.endTime - clip.startTime;

      // ⭐ 从知识库获取卡片配置
      const cardConfig = this.knowledge.sceneTypes.VIDEO_WITH_CARDS;
      props.maxCards = cardConfig.maxCards;
      props.cardStyles = cardConfig.cardStyles;
    }
    else if (template === 'MultiLayer') {
      const layers = clip.layerManifest || {};

      props.startTime = clip.startTime;
      props.duration = clip.endTime - clip.startTime;

      // ⭐ 从知识库获取多层配置
      const multiLayerConfig = this.knowledge.sceneTypes.MULTI_LAYER;
      props.layerOrder = multiLayerConfig.layers;

      // 提取各层路径
      for (const layer of Object.values(layers)) {
        if (!layer.enabled || layer.status !== 'completed') continue;

        // ⭐⭐⭐ 阶段2：支持素材轮播
        if (layer.type === 'material-carousel') {
          props.materialCarousel = layer.materials;
        }
        else if (layer.type === 'material') {
          props.materialImage = layer.path;
        }
        else if (layer.type === 'card') {
          props.cardText = layer.config?.keyword || clip.keyword;
          if (layer.config) {
            props.cardConfig = {
              ...layer.config,
              // ⭐ 合并知识库的卡片样式
              ...visualElements.cards.default
            };
          }
        }
        else if (layer.type === 'pip') {
          props.pipVideo = layer.path;
          // ⭐ 从知识库获取PIP配置
          const pipConfig = this.knowledge.sceneTypes.PIP;
          props.pipConfig = {
            ...layer.config,
            positions: pipConfig.positions,
            scales: pipConfig.scales
          };
        }
        else if (layer.type === 'background') {
          props.backgroundColor = layer.config?.color || colorSystem.primary.dark;
        }
      }
    }
    // ⭐ 处理PIP模板（OriginalVideoV2）
    else if (template === 'OriginalVideoV2') {
      props.startTime = clip.startTime;
      props.duration = clip.endTime - clip.startTime;

      const pipConfig = this.knowledge.sceneTypes.PIP;
      props.pipPositions = pipConfig.positions;
      props.pipScales = pipConfig.scales;
    }
    // ⭐ 新增：处理CardGroup模板（多卡片组合）
    else if (template === 'CardGroup') {
      props.duration = clip.endTime - clip.startTime;

      // 从cardGroupConfig获取卡片配置
      if (clip.cardGroupConfig) {
        props.cards = clip.cardGroupConfig.cards || [];
        props.layout = clip.cardGroupConfig.layout || 'vertical';
        props.position = clip.cardGroupConfig.position || 'center';
      } else {
        // 从关键词数组构建卡片
        props.cards = this.extractKeywords(clip).map(kw => ({ text: kw }));
        props.layout = this.selectCardGroupLayout(props.cards.length);
        props.position = 'center';
      }

      // 背景图
      const layers = clip.layerManifest || {};
      const bgLayer = layers.layer1_background;
      if (bgLayer && bgLayer.path) {
        props.backgroundImage = bgLayer.path;
      }

      // PIP视频（可选）
      const pipLayer = layers.layer5_pip;
      if (pipLayer && pipLayer.path) {
        props.videoPath = pipLayer.path;
        props.pipConfig = {
          position: 'bottom-right',
          width: '30%',
          height: '22%',
          ...pipLayer.config
        };
      }

      this.log('debug', `    → CardGroup配置: ${props.cards.length}个卡片, 布局=${props.layout}`);
    }

    // ⭐ 添加过渡效果配置（如果clip有transition属性）
    if (clip.transition) {
      props.transition = clip.transition;
    }

    return props;
  }

  /**
   * ⭐ 从 Clip 提取关键词
   * @param {Object} clip - Clip对象
   * @returns {Array<string>} 关键词数组
   */
  extractKeywords(clip) {
    const keywords = [];
    const layers = clip.layerManifest || {};

    for (const layer of Object.values(layers)) {
      if (layer.type === 'card' && layer.enabled && layer.config?.keyword) {
        keywords.push(layer.config.keyword);
      }
    }

    // 如果没有从 layer 提取到，使用 clip.keyword
    if (keywords.length === 0 && clip.keyword) {
      keywords.push(clip.keyword);
    }

    return keywords.slice(0, 2);  // 最多2个
  }

  /**
   * ⭐ 根据卡片数量选择最佳布局
   * @param {number} cardCount - 卡片数量
   * @returns {string} 布局类型
   */
  selectCardGroupLayout(cardCount) {
    if (cardCount <= 2) {
      return 'horizontal';  // 2个及以下用水平布局
    } else if (cardCount <= 4) {
      return 'vertical';    // 3-4个用垂直布局
    } else {
      return 'stacked';     // 5个及以上用堆叠布局
    }
  }

  /**
   * ⭐ 将Timeline转换为RenderData（新方法）
   * @deprecated 已废弃 - 仅用于传统渲染方案
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
        duration: clip.duration || (clip.endTime - clip.startTime),
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
          this.log('warn', `  ⚠️  跳过未完成的层: ${clip.id}.${layerId} (状态: ${layerSpec.status})`);
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

        renderData.push(layerData);
      }
    }

    this.log('info', `  → 转换完成: ${scenes.length}个场景, ${renderData.length}个渲染层`);

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
        this.log('debug', `  → 场景 ${scene.id} 有 ${scene.layers.length} 个层`);

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
        this.log('debug', `  → 场景 ${scene.id} 使用降级方案`);

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
      this.log('info', '  → 压缩视频中...');

      const cmd = `ffmpeg -i "${videoPath}" -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k "${outputPath}" -y`;

      execSync(cmd, { stdio: 'pipe' });

      if (!fs.existsSync(outputPath)) {
        throw new Error('视频压缩失败');
      }

      // 删除原始文件
      fs.unlinkSync(videoPath);

      return outputPath;

    } catch (error) {
      this.log('error', '视频压缩失败', { error: error.message });
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
      this.log('error', '获取视频信息失败', { error: error.message });
      return null;
    }
  }
}

export default VideoEngineer;
