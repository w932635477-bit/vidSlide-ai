/**
 * TimelineEvent系统 - 基于ASR时间戳的事件驱动Timeline
 *
 * 核心思想：
 * 1. 将关键词时间戳转换为Timeline事件
 * 2. 每个事件可包含多层内容（背景、PIP、卡片）
 * 3. 由TimelineConstraintSolver统一管理时间分配
 * 4. 支持层级优先级和冲突检测
 *
 * 解决的问题：
 * ✅ 统一管理关键词时间戳
 * ✅ 统一管理多层画中画结构
 * ✅ 基于实际语音时间而非固定规则
 * ✅ 自动处理时间冲突和优先级
 */

/**
 * Timeline事件（基于关键词时间戳）
 */
export class TimelineEvent {
  constructor(config) {
    this.id = config.id || `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 关键词信息
    this.keyword = {
      text: config.keyword.text,           // 关键词文本
      english: config.keyword.english,     // 英文翻译
      category: config.keyword.category,   // 分类
      weight: config.keyword.weight        // 权重
    };

    // 时间戳（来自ASR或本地提取器）
    this.timestamp = {
      exact: config.timestamp.exact,       // 精确时间点（秒）
      start: config.timestamp.start,       // 建议开始时间
      end: config.timestamp.end,           // 建议结束时间
      charIndex: config.timestamp.charIndex, // 字符位置
      context: config.timestamp.context    // 上下文
    };

    // 多层内容定义
    this.layers = config.layers || [];

    // 元数据
    this.metadata = {
      importance: config.importance || 'medium',
      sceneType: config.sceneType || 'auto'  // 'card-only', 'multi-layer', 'auto'
    };
  }

  /**
   * 添加层
   */
  addLayer(layerConfig) {
    this.layers.push({
      type: layerConfig.type,           // 'background', 'pip', 'card'
      zIndex: layerConfig.zIndex,       // Z轴顺序
      content: layerConfig.content,     // 内容
      enabled: layerConfig.enabled !== false,
      constraints: layerConfig.constraints || {}
    });
  }
}

/**
 * 多层Timeline管理器
 */
export class MultiLayerTimelineManager {
  constructor(options = {}) {
    this.logger = options.logger || console;
    this.events = [];

    // 层级配置（Z轴顺序）
    this.layerConfig = {
      background: {
        zIndex: 0,
        trackId: 'track_material',
        description: '背景素材层（全屏）'
      },
      pip: {
        zIndex: 1,
        trackId: 'track_pip',
        description: '画中画层（小窗口原视频）'
      },
      card: {
        zIndex: 2,
        trackId: 'track_cards',
        description: '卡片层（文字卡片）'
      }
    };
  }

  /**
   * 从关键词列表创建事件
   * @param {Array} keywords - 带时间戳的关键词列表
   * @param {Object} options - 选项
   */
  createEventsFromKeywords(keywords, options = {}) {
    this.logger.info('🎬 从关键词创建Timeline事件');
    this.logger.info(`  关键词数量: ${keywords.length}个`);

    const events = [];

    for (const kw of keywords) {
      const event = new TimelineEvent({
        keyword: {
          text: kw.text,
          english: kw.english,
          category: kw.category,
          weight: kw.weight
        },
        timestamp: {
          exact: kw.timestamp,
          start: kw.startTime,
          end: kw.endTime,
          charIndex: kw.charIndex,
          context: kw.context
        },
        importance: this.determineImportance(kw)
      });

      // 根据关键词权重和分类决定场景类型
      const sceneType = this.determineSceneType(kw);
      event.metadata.sceneType = sceneType;

      // 为不同场景类型添加不同的层
      if (sceneType === 'multi-layer') {
        // 多层场景：背景 + PIP + 卡片
        event.addLayer({
          type: 'background',
          zIndex: 0,
          content: {
            keyword: kw.text,
            text: kw.text,
            english: kw.english
          },
          constraints: {
            duration: 4.0  // 背景素材持续4秒
          }
        });

        event.addLayer({
          type: 'pip',
          zIndex: 1,
          content: {
            position: 'top-right',  // 右上角
            width: 0.3,             // 占屏幕30%宽度
            height: 0.4,            // 占屏幕40%高度
            borderRadius: 20
          },
          constraints: {
            duration: 4.0
          }
        });

        event.addLayer({
          type: 'card',
          zIndex: 2,
          content: {
            keyword: kw.text.substring(0, 5),  // 卡片最多5字
            text: kw.text.substring(0, 5),
            fullText: kw.text,
            english: kw.english,
            priority: 'high'
          },
          constraints: {
            duration: 3.0  // 卡片持续3秒
          }
        });

      } else {
        // 纯卡片场景
        event.addLayer({
          type: 'card',
          zIndex: 2,
          content: {
            keyword: kw.text.substring(0, 5),
            text: kw.text.substring(0, 5),
            fullText: kw.text,
            english: kw.english,
            priority: 'medium'
          },
          constraints: {
            duration: 3.0
          }
        });
      }

      events.push(event);
    }

    this.events = events;
    this.logger.info(`  ✅ 创建了 ${events.length} 个事件`);

    // 统计场景类型分布
    const multiLayerCount = events.filter(e => e.metadata.sceneType === 'multi-layer').length;
    const cardOnlyCount = events.filter(e => e.metadata.sceneType === 'card-only').length;
    this.logger.info(`    - 多层场景: ${multiLayerCount}个`);
    this.logger.info(`    - 纯卡片场景: ${cardOnlyCount}个`);

    return events;
  }

  /**
   * 确定场景类型
   * 规则：权重高的关键词 -> 多层场景
   *
   * 修复：降低权重阈值，确保至少有1-2个多层场景被生成
   */
  determineSceneType(keyword) {
    // 权重阈值（TF-IDF权重通常在0-50之间）
    // 修复前: 35 - 太高，导致没有多层场景
    // 修复后: 12 - 确保前1-2个关键词能生成多层场景
    const HIGH_WEIGHT_THRESHOLD = 12;

    if (keyword.weight >= HIGH_WEIGHT_THRESHOLD) {
      return 'multi-layer';
    }

    // 特定分类优先使用多层（扩展分类列表）
    const multiLayerCategories = ['platform', 'method', 'person', 'tech', 'concept'];
    if (multiLayerCategories.includes(keyword.category)) {
      return 'multi-layer';
    }

    return 'card-only';
  }

  /**
   * 确定重要性
   */
  determineImportance(keyword) {
    if (keyword.weight >= 40) return 'high';
    if (keyword.weight >= 30) return 'medium';
    return 'low';
  }

  /**
   * 将事件转换为SequenceDefinition（兼容现有系统）
   */
  convertEventsToSequences() {
    const sequences = [];

    for (const event of this.events) {
      for (const layer of event.layers) {
        if (!layer.enabled) continue;

        sequences.push({
          id: `${event.id}_${layer.type}`,
          type: layer.type,
          content: layer.content,
          insertionPoint: event.timestamp.exact,
          minDuration: layer.constraints.duration || 3,
          maxDuration: (layer.constraints.duration || 3) + 1,
          preferredDuration: layer.constraints.duration || 3,
          priority: event.metadata.importance,
          importance: event.metadata.importance,
          category: event.keyword.category,
          keywords: [event.keyword.text],

          // 关联原始事件
          _eventId: event.id,
          _layer: layer.type,
          _timestamp: event.timestamp
        });
      }
    }

    this.logger.info(`  转换为 ${sequences.length} 个序列`);
    return sequences;
  }

  /**
   * 生成场景列表（给SceneDesigner使用）
   */
  generateScenes(videoDuration) {
    const scenes = [];
    let currentTime = 0;

    // 按时间戳排序事件
    const sortedEvents = [...this.events].sort((a, b) =>
      a.timestamp.exact - b.timestamp.exact
    );

    // ⭐ 处理时间冲突：合并接近的关键词为组合卡片场景
    const mergedEvents = [];
    let i = 0;

    while (i < sortedEvents.length) {
      const current = sortedEvents[i];
      const next = sortedEvents[i + 1];

      // 如果下一个事件存在，且时间非常接近（重叠或间隔<2秒）
      if (next && (current.timestamp.end > next.timestamp.start ||
                   next.timestamp.start - current.timestamp.start < 2)) {

        const overlap = current.timestamp.end - next.timestamp.start;
        this.logger.info(`  🎭 关键词"${current.keyword.text}"和"${next.keyword.text}"时间接近，合并为组合卡片场景`);

        // 创建组合事件
        const combinedEvent = {
          id: `combined_${current.id}_${next.id}`,
          type: 'combined',
          keywords: [current.keyword, next.keyword],
          timestamp: {
            start: current.timestamp.start,
            end: Math.max(current.timestamp.end, next.timestamp.end),
            exact: current.timestamp.exact
          },
          layers: [
            // 背景层（如果是多层场景）
            ...(current.metadata.sceneType === 'multi-layer' ? [{
              type: 'background',
              zIndex: 0,
              content: {
                keyword: current.keyword.text,
                text: current.keyword.text,
                english: current.keyword.english
              },
              enabled: true,
              constraints: { duration: 4 }
            }] : []),
            // PIP层（如果是多层场景）
            ...(current.metadata.sceneType === 'multi-layer' ? [{
              type: 'pip',
              zIndex: 1,
              content: {
                position: 'top-right',
                width: 0.3,
                height: 0.4,
                borderRadius: 20
              },
              enabled: true,
              constraints: { duration: 4 }
            }] : []),
            // 第一张卡片（先进入）
            {
              type: 'card',
              zIndex: 2,
              content: {
                keyword: current.keyword.text.substring(0, 5),
                text: current.keyword.text.substring(0, 5),
                fullText: current.keyword.text,
                english: current.keyword.english,
                priority: 'high',
                animationDelay: 0  // 立即进入
              },
              enabled: true,
              constraints: { duration: 3 }
            },
            // 第二张卡片（延迟进入）
            {
              type: 'card',
              zIndex: 3,
              content: {
                keyword: next.keyword.text.substring(0, 5),
                text: next.keyword.text.substring(0, 5),
                fullText: next.keyword.text,
                english: next.keyword.english,
                priority: 'high',
                animationDelay: 0.5,  // 延迟0.5秒进入
                position: 'bottom'  // 第二张卡片在下方
              },
              enabled: true,
              constraints: { duration: 3 }
            }
          ],
          metadata: {
            importance: 'high',
            sceneType: current.metadata.sceneType,
            isCombined: true
          }
        };

        mergedEvents.push(combinedEvent);
        i += 2;  // 跳过下一个事件
      } else {
        // 单独的事件
        mergedEvents.push(current);
        i++;
      }
    }

    this.logger.info(`  合并后事件数: ${mergedEvents.length}个（原${sortedEvents.length}个）`);

    // 生成场景
    for (let i = 0; i < mergedEvents.length; i++) {
      const event = mergedEvents[i];

      // 1. 添加原视频片段
      if (event.timestamp.start > currentTime) {
        scenes.push({
          id: `scene_original_${i}`,
          type: 'original',
          startTime: currentTime,
          endTime: event.timestamp.start,
          duration: event.timestamp.start - currentTime
        });
        currentTime = event.timestamp.start;
      }

      // 2. 添加关键词场景
      if (event.type === 'combined') {
        // 组合卡片场景
        scenes.push({
          id: `scene_combined_${i}`,
          type: 'multi-layer-composition',
          startTime: event.timestamp.start,
          endTime: event.timestamp.end,
          duration: event.timestamp.end - event.timestamp.start,
          keywordObj: {
            text: event.keywords.map(k => k.text).join('+'),
            english: event.keywords.map(k => k.english).join('+'),
            category: event.keywords[0].category
          },
          layers: event.layers,
          metadata: {
            eventId: event.id,
            importance: event.metadata.importance,
            isCombined: true,
            keywords: event.keywords
          }
        });
      } else {
        // 单独场景
        const sceneType = event.metadata.sceneType === 'multi-layer'
          ? 'multi-layer-composition'
          : 'video-with-card';

        scenes.push({
          id: `scene_${event.keyword.text}_${i}`,
          type: sceneType,
          startTime: event.timestamp.start,
          endTime: event.timestamp.end,
          duration: event.timestamp.end - event.timestamp.start,
          keywordObj: {
            text: event.keyword.text,
            english: event.keyword.english,
            category: event.keyword.category
          },
          layers: event.layers,
          metadata: {
            eventId: event.id,
            importance: event.metadata.importance,
            weight: event.keyword.weight
          }
        });
      }

      currentTime = event.timestamp.end;
    }

    // 3. 添加最后的原视频片段
    if (currentTime < videoDuration) {
      scenes.push({
        id: `scene_original_final`,
        type: 'original',
        startTime: currentTime,
        endTime: videoDuration,
        duration: videoDuration - currentTime
      });
    }

    this.logger.info(`  生成了 ${scenes.length} 个场景`);

    // 统计
    const stats = {
      total: scenes.length,
      original: scenes.filter(s => s.type === 'original').length,
      cardOnly: scenes.filter(s => s.type === 'video-with-card').length,
      multiLayer: scenes.filter(s => s.type === 'multi-layer-composition').length,
      combined: scenes.filter(s => s.metadata?.isCombined).length
    };

    this.logger.info(`    - 原视频: ${stats.original}个`);
    this.logger.info(`    - 卡片场景: ${stats.cardOnly}个`);
    this.logger.info(`    - 多层场景: ${stats.multiLayer}个`);
    if (stats.combined > 0) {
      this.logger.info(`    - 组合卡片: ${stats.combined}个 ⭐`);
    }

    return scenes;
  }

  /**
   * 检测时间冲突
   */
  detectConflicts() {
    const conflicts = [];

    for (let i = 0; i < this.events.length; i++) {
      for (let j = i + 1; j < this.events.length; j++) {
        const event1 = this.events[i];
        const event2 = this.events[j];

        // 检查时间重叠
        const overlap = this.checkTimeOverlap(
          event1.timestamp.start,
          event1.timestamp.end,
          event2.timestamp.start,
          event2.timestamp.end
        );

        if (overlap > 0) {
          conflicts.push({
            event1: event1.id,
            event2: event2.id,
            overlap: overlap,
            resolution: 'adjust'  // 可以自动调整或手动处理
          });
        }
      }
    }

    if (conflicts.length > 0) {
      this.logger.warn(`  ⚠️  检测到 ${conflicts.length} 个时间冲突`);
    }

    return conflicts;
  }

  /**
   * 检查时间重叠
   */
  checkTimeOverlap(start1, end1, start2, end2) {
    const overlapStart = Math.max(start1, start2);
    const overlapEnd = Math.min(end1, end2);
    return Math.max(0, overlapEnd - overlapStart);
  }

  /**
   * 导出完整的Timeline配置
   */
  exportTimelineConfig() {
    return {
      version: '2.0',
      events: this.events,
      layers: this.layerConfig,
      statistics: {
        totalEvents: this.events.length,
        totalLayers: this.events.reduce((sum, e) => sum + e.layers.length, 0),
        sceneTypes: {
          multiLayer: this.events.filter(e => e.metadata.sceneType === 'multi-layer').length,
          cardOnly: this.events.filter(e => e.metadata.sceneType === 'card-only').length
        }
      }
    };
  }
}

export default MultiLayerTimelineManager;
