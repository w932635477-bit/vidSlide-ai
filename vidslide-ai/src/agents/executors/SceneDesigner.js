/**
 * SceneDesigner - 场景设计师（v2.0 - 基于TimelineEvent）
 *
 * 职责：
 * 1. 基于关键词时间戳生成场景
 * 2. 使用TimelineEvent系统管理多层内容
 * 3. 原视频占比控制（≥25%）
 *
 * 新架构：
 * - 使用TimelineEvent替代固定时间规则
 * - 关键词时间戳驱动场景分配
 * - 统一管理多层画中画结构
 */

import {
  SequenceDefinition,
  TimelineConstraintSolver,
  PlaylistGenerator
} from '../../core/TimelineConstraintSystem.js';

import MultiLayerTimelineManager from '../../core/TimelineEventSystem.js';

class SceneDesigner {
  constructor(options = {}) {
    this.name = 'SceneDesigner';
    this.logger = options.logger || console;
    this.errorHandler = options.errorHandler;

    // ⭐ 新增：TimelineEvent管理器
    this.timelineManager = new MultiLayerTimelineManager({
      logger: this.logger
    });

    // 初始化约束系统
    this.constraintSolver = new TimelineConstraintSolver({
      minCardDuration: 3,
      maxCardDuration: 8,
      minSpacing: 0.5,
      groupingThreshold: 10,
      transitionOverlap: 0.5
    });

    this.playlistGenerator = new PlaylistGenerator();

    // 场景拆解规则（保留用于兼容）
    this.rules = {
      minOriginalRatio: 25,  // 原视频最少占比25%
      transitionDuration: 1.5,  // 过渡场景时长1.5秒
      cardDuration: 3.0,  // 卡片场景时长3秒
      multiLayerDuration: 4.0,  // 多层场景时长4秒
      openingDuration: 2.0,  // 开场时长2秒
      endingDuration: 2.0  // 结尾时长2秒
    };
  }

  /**
   * 场景拆解
   * @param {Object} input - 输入参数
   * @param {Object} input.task_1_2 - 内容分析结果
   * @param {number} input.videoDuration - 视频时长
   * @returns {Promise<Object>} 包含scenes和stats
   */
  async decomposeScenes(input) {
    const { task_1_2, videoDuration } = input;
    const understanding = task_1_2.understanding;

    this.logger.info('🎬 SceneDesigner: 开始场景拆解');
    this.logger.info(`  视频时长: ${videoDuration.toFixed(2)}秒`);

    try {
      // 1. 规划场景
      const scenes = this.planScenes(understanding, videoDuration);

      // 2. 验证规则
      this.validateScenes(scenes, videoDuration);

      // 3. 计算统计信息
      const stats = this.calculateStats(scenes, videoDuration);

      this.logger.info('  ✅ 场景拆解完成');
      this.logger.info(`    - 总场景数: ${scenes.length}个`);
      this.logger.info(`    - 原视频占比: ${stats.originalRatio}%`);
      this.logger.info(`    - 卡片场景: ${stats.cardScenes}个`);
      this.logger.info(`    - 多层场景: ${stats.multiLayerScenes}个`);

      // 4. 生成UI时间轴（简化版）
      const uiTimeline = this.createSimpleUITimeline(scenes, understanding, videoDuration);

      return {
        scenes: scenes,
        stats: stats,
        uiTimeline: uiTimeline
      };

    } catch (error) {
      this.logger.error('❌ 场景拆解失败', { error: error.message });
      throw error;
    }
  }

  /**
   * 规划场景（v2.0 - 基于TimelineEvent）
   * @param {Object} understanding - 内容理解结果（包含带时间戳的关键词）
   * @param {number} videoDuration - 视频时长
   * @returns {Array} 场景列表
   */
  planScenes(understanding, videoDuration) {
    this.logger.info('🎬 SceneDesigner: 场景规划（基于关键词时间戳）');

    // ⭐ 新架构：使用TimelineEvent系统
    const keywords = understanding.keywords || [];

    if (keywords.length === 0) {
      this.logger.warn('  ⚠️  没有关键词，使用降级方案');
      return this.planScenesLegacy(understanding, videoDuration);
    }

    // 1. 创建Timeline事件并生成场景列表
    this.timelineManager.createEventsFromKeywords(keywords);
    const scenes = this.timelineManager.generateScenes(videoDuration);

    // 2. ⭐ 为每个场景初始化LayerManifest（LayerOrchestrator需要）
    for (const scene of scenes) {
      scene.layerManifest = this.initializeLayerManifest(scene);
    }

    // 3. 统计信息
    const stats = {
      total: scenes.length,
      original: scenes.filter(s => s.type === 'original').length,
      cardOnly: scenes.filter(s => s.type === 'video-with-card').length,
      multiLayer: scenes.filter(s => s.type === 'multi-layer-composition').length
    };

    this.logger.info(`  ✅ 场景规划完成`);
    this.logger.info(`    - 总场景数: ${stats.total}个`);
    this.logger.info(`    - 原视频: ${stats.original}个`);
    this.logger.info(`    - 卡片场景: ${stats.cardOnly}个`);
    this.logger.info(`    - 多层场景: ${stats.multiLayer}个`);

    // 4. 验证原视频占比
    const originalDuration = scenes
      .filter(s => s.type === 'original')
      .reduce((sum, s) => sum + s.duration, 0);
    const originalRatio = (originalDuration / videoDuration) * 100;

    this.logger.info(`    - 原视频占比: ${originalRatio.toFixed(1)}%`);

    if (originalRatio < this.rules.minOriginalRatio) {
      this.logger.warn(`    ⚠️  原视频占比低于${this.rules.minOriginalRatio}%`);
    }

    return scenes;
  }

  /**
   * ⭐ 初始化LayerManifest（为LayerOrchestrator准备）
   * @param {Object} scene - 场景对象
   * @returns {Object} LayerManifest对象
   */
  initializeLayerManifest(scene) {
    const manifest = {};

    if (scene.type === 'original') {
      // 原视频场景：无层
      return {};
    }

    if (scene.type === 'video-with-card') {
      // 卡片场景：只有卡片层
      manifest.layer4_card = {
        type: 'card',
        enabled: true,
        agent: 'ProfessionalCardGenerator',
        status: 'pending',
        path: null,
        zIndex: 3,
        config: {
          style: 'bright',
          width: 600,
          height: 300,
          position: 'bottom',
          animation: {
            enabled: true,
            type: 'slideInFromBottom',
            duration: 0.5,
            delay: 0.2
          }
        }
      };
    }

    if (scene.type === 'multi-layer-composition') {
      // 多层场景：完整5层结构

      // Layer 1: 背景层
      manifest.layer1_background = {
        type: 'background',
        enabled: true,
        agent: 'BackgroundGeneratorService',
        status: 'pending',
        path: null,
        zIndex: 0,
        config: {
          style: 'dark',
          width: 1080,
          height: 1920
        }
      };

      // Layer 2: 素材层
      manifest.layer2_material = {
        type: 'material',
        enabled: true,
        agent: 'MaterialSearchService',
        status: 'pending',
        path: null,
        zIndex: 1,
        config: {
          opacity: 0.7
        }
      };

      // Layer 3: 遮罩层（磨砂玻璃效果）
      manifest.layer3_mask = {
        type: 'mask',
        enabled: true,
        agent: 'ServerVideoCompositionService',
        status: 'pending',
        path: null,
        zIndex: 2,
        config: {
          blurStrength: 3,
          opacity: 0.15,
          color: 'white'
        }
      };

      // Layer 4: 卡片层
      manifest.layer4_card = {
        type: 'card',
        enabled: true,
        agent: 'ProfessionalCardGenerator',
        status: 'pending',
        path: null,
        zIndex: 3,
        config: {
          style: 'bright',
          width: 600,
          height: 300,
          position: 'top',
          animation: {
            enabled: true,
            type: 'slideInFromBottom',
            duration: 0.5,
            delay: 0.2
          }
        }
      };

      // Layer 5: PIP层
      manifest.layer5_pip = {
        type: 'pip',
        enabled: true,
        agent: 'FaceVideoExtractorServiceV2',
        status: 'pending',
        path: null,
        zIndex: 4,
        config: {
          position: 'bottom',
          width: 360,
          height: 640
        }
      };
    }

    return manifest;
  }

  /**
   * 降级方案：使用旧的固定规则（当没有关键词时）
   */
  planScenesLegacy(understanding, videoDuration) {
    const scenes = [];
    let currentTime = 0;
    let sceneId = 1;

    // 1. 开场（原视频）
    scenes.push({
      id: `scene_${sceneId++}`,
      type: 'original',
      startTime: currentTime,
      endTime: currentTime + this.rules.openingDuration,
      description: '开场',
      needMaterial: false
    });
    currentTime += this.rules.openingDuration;

    // 2. 观点场景
    const viewpoints = understanding.viewpoints || [];
    const keywords = understanding.keywords || [];

    for (let i = 0; i < viewpoints.length; i++) {
      const vp = viewpoints[i];

      // 从关键词中找到最相关的关键词对象
      const relatedKeyword = this.findRelatedKeyword(vp.text, keywords);

      // 2.1 过渡（原视频）
      scenes.push({
        id: `scene_${sceneId++}`,
        type: 'original',
        startTime: currentTime,
        endTime: currentTime + this.rules.transitionDuration,
        description: `过渡到观点${i + 1}`,
        needMaterial: false
      });
      currentTime += this.rules.transitionDuration;

      // 2.2 观点卡片
      if (vp.importance === 'high') {
        // 高重要性：多层场景
        scenes.push({
          id: `scene_${sceneId++}`,
          type: 'multi-layer-composition',
          startTime: currentTime,
          endTime: currentTime + this.rules.multiLayerDuration,
          description: `观点${i + 1}（重点）`,
          keywordObj: relatedKeyword,  // 使用关键词对象
          needMaterial: true,
          importance: 'high'
        });
        currentTime += this.rules.multiLayerDuration;

      } else {
        // 中低重要性：卡片场景
        scenes.push({
          id: `scene_${sceneId++}`,
          type: 'video-with-card',
          startTime: currentTime,
          endTime: currentTime + this.rules.cardDuration,
          description: `观点${i + 1}`,
          keywordObj: relatedKeyword,  // 使用关键词对象
          needMaterial: false,
          importance: vp.importance
        });
        currentTime += this.rules.cardDuration;
      }
    }

    // 3. 解释场景
    const explanations = understanding.explanations || [];
    for (let i = 0; i < Math.min(explanations.length, 2); i++) {
      const exp = explanations[i];

      // 从关键词中找到匹配的关键词对象
      const relatedKeyword = this.findRelatedKeyword(exp.keyword, keywords);

      // 3.1 过渡（原视频）
      scenes.push({
        id: `scene_${sceneId++}`,
        type: 'original',
        startTime: currentTime,
        endTime: currentTime + this.rules.transitionDuration,
        description: `过渡到解释${i + 1}`,
        needMaterial: false
      });
      currentTime += this.rules.transitionDuration;

      // 3.2 解释场景（多层）
      scenes.push({
        id: `scene_${sceneId++}`,
        type: 'multi-layer-composition',
        startTime: currentTime,
        endTime: currentTime + this.rules.multiLayerDuration,
        description: `解释：${exp.keyword}`,
        keywordObj: relatedKeyword,  // 使用关键词对象
        explanationText: exp.explanation,  // 保留解释文本用于多层场景
        needMaterial: true,
        importance: 'high'
      });
      currentTime += this.rules.multiLayerDuration;
    }

    // 4. 结尾（原视频）
    scenes.push({
      id: `scene_${sceneId++}`,
      type: 'original',
      startTime: currentTime,
      endTime: currentTime + this.rules.endingDuration,
      description: '结尾',
      needMaterial: false
    });
    currentTime += this.rules.endingDuration;

    // 5. 调整时间轴以适应视频时长
    return this.adjustTimeline(scenes, videoDuration);
  }

  /**
   * 调整时间轴
   * @param {Array} scenes - 场景列表
   * @param {number} videoDuration - 视频时长
   * @returns {Array} 调整后的场景列表
   */
  adjustTimeline(scenes, videoDuration) {
    const totalPlannedDuration = scenes[scenes.length - 1].endTime;

    if (totalPlannedDuration > videoDuration) {
      // 超出视频时长，按比例缩短
      const ratio = videoDuration / totalPlannedDuration;

      for (const scene of scenes) {
        scene.startTime *= ratio;
        scene.endTime *= ratio;
      }

    } else if (totalPlannedDuration < videoDuration) {
      // 未用完视频时长，延长结尾
      const lastScene = scenes[scenes.length - 1];
      lastScene.endTime = videoDuration;
    }

    return scenes;
  }

  /**
   * 从关键词列表中找到与文本最相关的关键词
   * @param {string} text - 文本（观点或解释）
   * @param {Array} keywords - 关键词对象数组
   * @returns {Object} 关键词对象
   */
  findRelatedKeyword(text, keywords) {
    if (!keywords || keywords.length === 0) {
      // 如果没有关键词，返回默认对象
      return {
        text: text.substring(0, 6),
        english: 'Keyword',
        category: 'concept'
      };
    }

    // 查找文本中包含的关键词
    for (const keyword of keywords) {
      if (text.includes(keyword.text)) {
        return keyword;
      }
    }

    // 如果没有找到匹配的，返回第一个关键词
    return keywords[0];
  }

  /**
   * 验证场景
   * @param {Array} scenes - 场景列表
   * @param {number} videoDuration - 视频时长
   */
  validateScenes(scenes, videoDuration) {
    // 1. 检查时间轴连续性
    for (let i = 0; i < scenes.length - 1; i++) {
      const current = scenes[i];
      const next = scenes[i + 1];

      if (Math.abs(current.endTime - next.startTime) > 0.01) {
        throw new Error(`场景${i}和${i + 1}之间有时间间隙`);
      }
    }

    // 2. 检查总时长
    const totalDuration = scenes[scenes.length - 1].endTime;
    if (Math.abs(totalDuration - videoDuration) > 0.1) {
      throw new Error(`总时长不匹配: ${totalDuration} vs ${videoDuration}`);
    }

    // 3. 检查原视频占比
    const stats = this.calculateStats(scenes, videoDuration);
    if (stats.originalRatio < this.rules.minOriginalRatio) {
      throw new Error(`原视频占比不足: ${stats.originalRatio}% < ${this.rules.minOriginalRatio}%`);
    }

    // 4. 检查开场和结尾
    if (scenes[0].type !== 'original') {
      throw new Error('开场必须是原视频');
    }
    if (scenes[scenes.length - 1].type !== 'original') {
      throw new Error('结尾必须是原视频');
    }
  }

  /**
   * 计算统计信息
   * @param {Array} scenes - 场景列表
   * @param {number} videoDuration - 视频时长
   * @returns {Object} 统计信息
   */
  calculateStats(scenes, videoDuration) {
    let originalDuration = 0;
    let cardScenes = 0;
    let multiLayerScenes = 0;

    for (const scene of scenes) {
      const duration = scene.endTime - scene.startTime;

      if (scene.type === 'original') {
        originalDuration += duration;
      } else if (scene.type === 'video-with-card') {
        cardScenes++;
      } else if (scene.type === 'multi-layer-composition') {
        multiLayerScenes++;
      }
    }

    return {
      totalScenes: scenes.length,
      originalScenes: scenes.filter(s => s.type === 'original').length,
      cardScenes: cardScenes,
      multiLayerScenes: multiLayerScenes,
      originalDuration: originalDuration.toFixed(2),
      originalRatio: ((originalDuration / videoDuration) * 100).toFixed(2),
      avgSceneDuration: (videoDuration / scenes.length).toFixed(2)
    };
  }

  /**
   * 创建简单的UI时间轴（从scenes生成）
   * @param {Array} scenes - 场景列表
   * @param {Object} understanding - 内容理解结果
   * @param {number} videoDuration - 视频时长
   * @returns {Object} UI时间轴
   */
  createSimpleUITimeline(scenes, understanding, videoDuration) {
    // 创建4个轨道
    const tracks = [
      { id: 'track_original', name: '原视频轨道', clips: [] },
      { id: 'track_cards', name: '卡片轨道', clips: [] },
      { id: 'track_pip', name: '画中画轨道', clips: [] },
      { id: 'track_material', name: '素材轨道', clips: [] }
    ];

    // 从scenes中提取clips
    scenes.forEach((scene, index) => {
      if (scene.type === 'video-with-card') {
        // 卡片场景：添加到卡片轨道
        // 确保使用关键词对象中的text（最多5个字）
        const keywordText = scene.keywordObj?.text || '关键词';
        const keywordEnglish = scene.keywordObj?.english || 'Keyword';

        // 只取前5个字作为卡片文字
        const cardText = keywordText.substring(0, 5);

        tracks[1].clips.push({
          id: `card_${index}`,
          type: 'card',
          startTime: scene.startTime,
          endTime: scene.endTime,
          content: {
            keyword: cardText,           // 只显示关键词（最多5字）
            english: keywordEnglish,     // 英文翻译
            text: cardText,              // 卡片主文字
            fullText: keywordText,       // 保留完整关键词用于日志
            priority: 'medium'
          },
          metadata: {
            importance: 'medium',
            sceneId: scene.id
          },
          groupSize: 1,
          groupIndex: 0
        });
      } else if (scene.type === 'multi-layer-composition') {
        // ⭐ Bug #7修复：多层场景需要同时添加卡片和素材
        const keywordText = scene.keywordObj?.text || '素材';
        const keywordEnglish = scene.keywordObj?.english || 'Material';
        const cardText = keywordText.substring(0, 5); // 卡片最多5字

        // 1. 添加卡片到卡片轨道（用于VisualDesigner生成）
        tracks[1].clips.push({
          id: `card_multi_${index}`,
          type: 'card',
          startTime: scene.startTime,
          endTime: scene.endTime,
          content: {
            keyword: cardText,           // 卡片显示文字（最多5字）
            english: keywordEnglish,     // 英文翻译
            text: cardText,
            fullText: keywordText,       // 完整关键词
            priority: 'high'             // 多层场景优先级高
          },
          metadata: {
            importance: 'high',
            sceneId: scene.id,
            isMultiLayer: true           // 标记为多层场景
          },
          groupSize: 1,
          groupIndex: 0
        });

        // 2. 添加素材到素材轨道
        tracks[3].clips.push({
          id: `material_${index}`,
          type: 'material',
          startTime: scene.startTime,
          endTime: scene.endTime,
          content: {
            keyword: keywordText,
            text: keywordText,
            english: keywordEnglish
          },
          metadata: {
            sceneId: scene.id
          }
        });
      }
    });

    return {
      version: '1.0',
      duration: videoDuration,
      fps: 30,
      tracks: tracks,
      markers: []
    };
  }

  /**
   * 生成UI时间轴（新方法，基于约束系统）
   * @param {Object} input - 输入参数
   * @param {Object} input.task_0 - TimelineBuilder的输出
   * @param {Object} input.task_1_2 - ContentAnalyst的输出（已映射）
   * @returns {Promise<Object>} UI时间轴
   */
  async generateUITimeline(input) {
    const { task_0, task_1_2 } = input;
    const baseTimeline = task_0.baseTimeline;
    const understanding = task_1_2.understanding;

    this.logger.info('🎬 SceneDesigner: 生成UI时间轴（基于约束系统）');
    this.logger.info(`  视频时长: ${baseTimeline.videoInfo.duration}秒`);
    this.logger.info(`  插入点: ${baseTimeline.insertionPoints.length}个`);

    try {
      // 步骤1: 收集所有序列（声明式）
      const sequences = this.collectSequences(understanding);
      this.logger.info(`  收集到 ${sequences.length} 个序列`);

      // 步骤2: 使用约束求解器计算最优布局
      const { layouts, groups, statistics } = this.constraintSolver.solve(sequences);
      this.logger.info(`  约束求解完成:`);
      this.logger.info(`    - 分组数: ${groups.length}个`);
      this.logger.info(`    - 布局数: ${layouts.length}个`);
      this.logger.info(`    - 独立序列: ${statistics.singleCount}个`);
      this.logger.info(`    - 组合序列: ${statistics.groupedCount}个`);
      this.logger.info(`    - 平均时长: ${statistics.avgDuration}秒`);

      // 步骤3: 生成playlist（MLT风格）
      const uiTimeline = this.playlistGenerator.generate(layouts, baseTimeline);

      this.logger.info('  ✅ UI时间轴生成完成');
      this.logger.info(`    - 轨道数: ${uiTimeline.tracks.length}个`);
      this.logger.info(`    - 总clips: ${uiTimeline.tracks.reduce((sum, t) => sum + t.clips.length, 0)}个`);

      return { uiTimeline };

    } catch (error) {
      this.logger.error('❌ UI时间轴生成失败', { error: error.message });
      throw error;
    }
  }

  /**
   * 收集所有序列（声明式定义，使用关键词）
   * @param {Object} understanding - 内容理解结果
   * @returns {Array<SequenceDefinition>} 序列列表
   */
  collectSequences(understanding) {
    const sequences = [];

    // 优先使用keywordResults（包含精炼的关键词）
    if (understanding.keywordResults && understanding.keywordResults.length > 0) {
      this.logger.info('  使用关键词结果生成序列');

      // 按组ID分组
      const groups = new Map();
      for (const result of understanding.keywordResults) {
        if (!groups.has(result.groupId)) {
          groups.set(result.groupId, []);
        }
        groups.get(result.groupId).push(result);
      }

      // 为每组生成卡片序列
      for (const [groupId, groupResults] of groups) {
        // 按groupIndex排序
        groupResults.sort((a, b) => a.groupIndex - b.groupIndex);

        // 为每个关键词创建序列
        for (let i = 0; i < groupResults.length; i++) {
          const result = groupResults[i];
          const isFirst = i === 0;
          const isLast = i === groupResults.length - 1;

          sequences.push(
            new SequenceDefinition({
              type: result.type === 'viewpoint' && result.importance === 'high'
                ? 'pip'
                : 'card',
              content: {
                text: result.keyword,         // 单个关键词
                keyword: result.keyword,      // 精炼的关键词（2-4字）
                english: result.english,      // 英文翻译
                fullText: result.fullText,    // 完整文本（备用）
                insertionPoint: result.insertionPoint
              },
              insertionPoint: result.insertionPoint.time,
              minDuration: 4,      // TikTok 2026: 最少4秒
              maxDuration: 10,     // 最多10秒
              preferredDuration: 6, // 优先6秒
              canGroup: true,
              priority: result.importance,
              importance: result.importance,
              category: result.type,
              keywords: [result.keyword],
              // 卡片序列元数据
              groupId: groupId,
              groupIndex: i,
              groupSize: groupResults.length,
              isFirstInGroup: isFirst,
              isLastInGroup: isLast
            })
          );
        }

        this.logger.info(`  → 卡片序列组: ${groupResults.map(r => r.keyword).join(' → ')} (${groupResults.length}张)`);
      }
    } else {
      // 降级：使用原始viewpoints和explanations
      this.logger.info('  使用原始观点和解释生成序列（降级）');

      // 1. 收集观点序列
      for (const viewpoint of understanding.viewpoints || []) {
        if (viewpoint.insertionPoint) {
          sequences.push(
            new SequenceDefinition({
              type: viewpoint.importance === 'high' ? 'pip' : 'card',
              content: {
                text: viewpoint.text,
                insertionPoint: viewpoint.insertionPoint
              },
              insertionPoint: viewpoint.insertionPoint.time,
              minDuration: 4,
              maxDuration: 10,
              preferredDuration: 6,
              canGroup: true,
              priority: viewpoint.importance,
              importance: viewpoint.importance,
              category: 'viewpoint',
              keywords: [viewpoint.text]
            })
          );
        }
      }

      // 2. 收集解释序列
      for (const explanation of understanding.explanations || []) {
        if (explanation.insertionPoint) {
          sequences.push(
            new SequenceDefinition({
              type: 'card',
              content: {
                text: explanation.explanation,
                keyword: explanation.keyword,
                insertionPoint: explanation.insertionPoint
              },
              insertionPoint: explanation.insertionPoint.time,
              minDuration: 4,
              maxDuration: 10,
              preferredDuration: 6,
              canGroup: true,
              priority: 'medium',
              importance: 'medium',
              category: 'explanation',
              keywords: [explanation.keyword, ...explanation.relatedKeywords]
            })
          );
        }
      }
    }

    // 按插入点时间排序
    sequences.sort((a, b) => a.constraints.insertionPoint - b.constraints.insertionPoint);

    return sequences;
  }

  /**
   * 创建轨道
   * @param {string} id - 轨道ID
   * @param {string} name - 轨道名称
   * @param {string} type - 轨道类型
   * @param {number} zIndex - z-index
   * @returns {Object} 轨道对象
   */
  createTrack(id, name, type, zIndex) {
    return {
      id: id,
      name: name,
      type: type,
      visible: true,
      locked: false,
      zIndex: zIndex,
      clips: []
    };
  }

  /**
   * 添加卡片clip（包含完整的特效配置）
   * @param {Array} tracks - 轨道数组
   * @param {Object} viewpoint - 观点对象
   * @param {number} clipId - clip ID
   */
  addCardClip(tracks, viewpoint, clipId) {
    const cardTrack = tracks.find(t => t.id === 'track_cards');
    const point = viewpoint.insertionPoint;

    cardTrack.clips.push({
      id: `clip_card_${clipId}`,
      name: `卡片: ${viewpoint.text.substring(0, 10)}...`,
      type: 'card',
      startTime: point.time,
      endTime: point.time + point.duration,
      linkedTo: {
        speechSegmentId: null,
        insertionPointId: point.id
      },
      content: {
        text: viewpoint.text,
        style: 'blue',
        position: { x: 100, y: 800 },
        size: { width: 800, height: 200 },
        // 视觉特效配置（由VisualDesigner自动生成）
        effects: {
          borderRadius: 20,
          borderWidth: 0,
          borderColor: '#ffffff',
          shadow: {
            enabled: true,
            offsetX: 0,
            offsetY: 4,
            blur: 12,
            color: 'rgba(0, 0, 0, 0.3)'
          },
          // CSS样式（用于前端TimelineEditor渲染）
          css: {
            borderRadius: '20px',
            border: 'none',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)'
          }
        }
      },
      keyframes: this.generateCardKeyframes(point.time, point.duration)
    });
  }

  /**
   * 添加多层组合clips
   * @param {Array} tracks - 轨道数组
   * @param {Object} viewpoint - 观点对象
   * @param {number} clipId - clip ID
   */
  addMultiLayerClips(tracks, viewpoint, clipId) {
    const point = viewpoint.insertionPoint;
    const duration = Math.max(point.duration, 4.0);  // 至少4秒

    // 添加素材clip
    const materialTrack = tracks.find(t => t.id === 'track_material');
    materialTrack.clips.push({
      id: `clip_material_${clipId}`,
      name: `素材: ${viewpoint.text.substring(0, 10)}...`,
      type: 'material',
      startTime: point.time,
      endTime: point.time + duration,
      linkedTo: {
        speechSegmentId: null,
        insertionPointId: point.id
      },
      content: {
        keyword: viewpoint.text,
        materialPath: '',  // 将由MaterialExpert生成
        backgroundPath: '',
        maskPath: ''
      },
      keyframes: []
    });

    // 添加画中画clip（包含完整的特效配置）
    const pipTrack = tracks.find(t => t.id === 'track_pip');
    pipTrack.clips.push({
      id: `clip_pip_${clipId}`,
      name: `画中画: ${viewpoint.text.substring(0, 10)}...`,
      type: 'pip',
      startTime: point.time,
      endTime: point.time + duration,
      linkedTo: {
        speechSegmentId: null,
        insertionPointId: point.id
      },
      content: {
        source: 'face_pip.mp4',
        position: { x: 340, y: 100 },
        size: { width: 400, height: 400 },
        // 视觉特效配置（由VisualDesigner自动生成）
        effects: {
          borderRadius: 200,  // 圆形
          borderWidth: 4,
          borderColor: '#ffffff',
          shadow: {
            enabled: true,
            offsetX: 0,
            offsetY: 4,
            blur: 16,
            color: 'rgba(0, 0, 0, 0.4)'
          },
          // CSS样式（用于前端TimelineEditor渲染）
          css: {
            borderRadius: '50%',  // 圆形
            border: '4px solid #ffffff',
            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.4)'
          }
        }
      },
      keyframes: []
    });
  }

  /**
   * 填充原视频片段
   * @param {Array} tracks - 轨道数组
   * @param {Object} baseTimeline - 基础时间轴
   */
  fillOriginalVideoClips(tracks, baseTimeline) {
    const originalTrack = tracks.find(t => t.id === 'track_original');
    const duration = baseTimeline.videoInfo.duration;

    // 获取所有已占用的时间段
    const occupiedRanges = [];
    for (const track of tracks) {
      for (const clip of track.clips) {
        occupiedRanges.push({ start: clip.startTime, end: clip.endTime });
      }
    }

    // 排序
    occupiedRanges.sort((a, b) => a.start - b.start);

    // 填充空白时间段
    let currentTime = 0;
    let clipId = 1;

    for (const range of occupiedRanges) {
      if (currentTime < range.start) {
        // 添加原视频片段
        originalTrack.clips.push({
          id: `clip_original_${clipId++}`,
          name: `原视频 ${currentTime.toFixed(1)}s-${range.start.toFixed(1)}s`,
          type: 'original',
          startTime: currentTime,
          endTime: range.start,
          linkedTo: {
            speechSegmentId: null,
            insertionPointId: null
          },
          source: {
            type: 'original_video',
            path: 'input.mp4',
            trimStart: currentTime,
            trimEnd: range.start
          },
          keyframes: []
        });
      }
      currentTime = range.end;
    }

    // 添加最后一段
    if (currentTime < duration) {
      originalTrack.clips.push({
        id: `clip_original_${clipId++}`,
        name: `原视频 ${currentTime.toFixed(1)}s-${duration.toFixed(1)}s`,
        type: 'original',
        startTime: currentTime,
        endTime: duration,
        linkedTo: {
          speechSegmentId: null,
          insertionPointId: null
        },
        source: {
          type: 'original_video',
          path: 'input.mp4',
          trimStart: currentTime,
          trimEnd: duration
        },
        keyframes: []
      });
    }
  }

  /**
   * 生成卡片关键帧（淡入淡出动画）
   * @param {number} startTime - 开始时间
   * @param {number} duration - 持续时间
   * @returns {Array} 关键帧数组
   */
  generateCardKeyframes(startTime, duration) {
    const fadeInDuration = 0.3;
    const fadeOutDuration = 0.3;

    return [
      {
        time: startTime,
        property: 'opacity',
        value: 0,
        easing: 'ease-in'
      },
      {
        time: startTime + fadeInDuration,
        property: 'opacity',
        value: 1,
        easing: 'ease-out'
      },
      {
        time: startTime + duration - fadeOutDuration,
        property: 'opacity',
        value: 1
      },
      {
        time: startTime + duration,
        property: 'opacity',
        value: 0
      }
    ];
  }

  /**
   * 创建标记
   * @param {Array} insertionPoints - 插入点数组
   * @returns {Array} 标记数组
   */
  createMarkers(insertionPoints) {
    return insertionPoints.map((point, index) => ({
      id: `marker_${index + 1}`,
      time: point.time,
      label: `插入点 ${index + 1}`,
      color: point.suitability === 'high' ? '#00ff00' : '#ffff00',
      type: 'insertion_point'
    }));
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
      rules: this.rules
    };
  }
}

export default SceneDesigner;
