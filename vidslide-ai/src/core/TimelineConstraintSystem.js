/**
 * TimelineConstraintSystem - 基于约束的时间轴系统
 *
 * 灵感来源：
 * - MLT Framework的Producer-Consumer-Filter架构
 * - Remotion的声明式Sequence组合
 * - CSP（约束满足问题）用于视频摘要
 *
 * 核心思想：
 * 1. 声明式定义序列（不硬编码时间和规则）
 * 2. 自动分析序列关系（时间、内容、优先级）
 * 3. 约束求解器计算最优布局
 * 4. 生成MLT风格的playlist
 */

import Logger from './Logger.js';

/**
 * 序列定义（类似Remotion的Sequence）
 */
export class SequenceDefinition {
  constructor(config) {
    this.id = config.id || `seq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.type = config.type;           // 'card', 'pip', 'material', 'explanation'
    this.content = config.content;     // 内容对象

    // 约束配置（TikTok 2026标准：4-10秒）
    this.constraints = {
      // 硬约束（必须满足）
      insertionPoint: config.insertionPoint,
      minDuration: config.minDuration || 4,       // TikTok 2026: 最少4秒
      maxDuration: config.maxDuration || 10,      // TikTok 2026: 最多10秒
      noOverlap: config.noOverlap !== false,

      // 软约束（优先满足）
      preferredDuration: config.preferredDuration || 6,  // TikTok 2026: 优先6秒
      canGroup: config.canGroup !== false,
      priority: config.priority || 'medium',

      // 关系约束
      relatedTo: config.relatedTo || [],
      mustFollow: config.mustFollow || null,
      mustPrecede: config.mustPrecede || null
    };

    // 元数据
    this.metadata = {
      importance: config.importance || 'medium',
      category: config.category || 'general',
      keywords: config.keywords || []
    };
  }
}

/**
 * 约束求解器（类似CSP）
 */
export class TimelineConstraintSolver {
  constructor(options = {}) {
    this.logger = new Logger('TimelineConstraintSolver');

    // 全局约束（TikTok 2026标准）
    this.globalConstraints = {
      minCardDuration: options.minCardDuration || 4,       // TikTok 2026: 最少4秒
      maxCardDuration: options.maxCardDuration || 10,      // TikTok 2026: 最多10秒
      minSpacing: options.minSpacing || 0.5,
      groupingThreshold: options.groupingThreshold || 10,  // 10秒内算邻近
      transitionOverlap: options.transitionOverlap || 0.5  // 过渡重叠0.5秒
    };
  }

  /**
   * 求解最优布局
   * @param {Array<SequenceDefinition>} sequences - 序列列表
   * @returns {Object} 布局结果
   */
  solve(sequences) {
    this.logger.info('🧮 开始约束求解');
    this.logger.info(`  序列数量: ${sequences.length}个`);

    // 步骤1: 分析序列关系
    const groups = this.analyzeSequenceRelationships(sequences);
    this.logger.info(`  分组结果: ${groups.length}个组`);

    // 步骤2: 为每个组求解最优布局
    const layouts = [];
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      this.logger.info(`  处理组${i + 1}: ${group.length}个序列`);

      const groupLayout = this.solveGroupLayout(group);
      layouts.push(...groupLayout);
    }

    this.logger.info(`  ✅ 求解完成，生成${layouts.length}个布局`);

    return {
      layouts,
      groups,
      statistics: this.calculateStatistics(layouts)
    };
  }

  /**
   * 分析序列关系（自动分组 + 识别卡片序列组）
   */
  analyzeSequenceRelationships(sequences) {
    if (sequences.length === 0) return [];

    // 首先识别卡片序列组（有groupId的序列）
    const cardSequenceGroups = new Map();
    const standaloneSequences = [];

    for (const seq of sequences) {
      if (seq.groupId) {
        // 有groupId，属于卡片序列组
        if (!cardSequenceGroups.has(seq.groupId)) {
          cardSequenceGroups.set(seq.groupId, []);
        }
        cardSequenceGroups.get(seq.groupId).push(seq);
      } else {
        // 无groupId，独立序列
        standaloneSequences.push(seq);
      }
    }

    // 排序卡片序列组（按groupIndex）
    for (const [groupId, group] of cardSequenceGroups) {
      group.sort((a, b) => a.groupIndex - b.groupIndex);
    }

    // 合并：卡片序列组 + 独立序列分组
    const groups = [];

    // 1. 添加卡片序列组
    for (const [groupId, group] of cardSequenceGroups) {
      groups.push(group);
    }

    // 2. 对独立序列进行传统分组
    if (standaloneSequences.length > 0) {
      let currentGroup = [standaloneSequences[0]];

      for (let i = 1; i < standaloneSequences.length; i++) {
        const prev = standaloneSequences[i - 1];
        const curr = standaloneSequences[i];

        // 计算关系得分
        const score = this.calculateRelationshipScore(prev, curr);

        // 判断是否应该分组
        if (score > 0.5 && prev.constraints.canGroup && curr.constraints.canGroup) {
          currentGroup.push(curr);
        } else {
          groups.push(currentGroup);
          currentGroup = [curr];
        }
      }

      groups.push(currentGroup);
    }

    return groups;
  }

  /**
   * 计算两个序列的关系得分（0-1）
   */
  calculateRelationshipScore(seq1, seq2) {
    let score = 0;

    // 1. 时间邻近性（权重0.4）
    const timeGap = seq2.constraints.insertionPoint - seq1.constraints.insertionPoint;
    const timeScore = Math.max(0, 1 - timeGap / this.globalConstraints.groupingThreshold);
    score += timeScore * 0.4;

    // 2. 类型相似性（权重0.3）
    if (seq1.type === seq2.type) {
      score += 0.3;
    }

    // 3. 优先级相似性（权重0.2）
    if (seq1.constraints.priority === seq2.constraints.priority) {
      score += 0.2;
    }

    // 4. 内容相关性（权重0.1）
    const contentScore = this.calculateContentSimilarity(seq1, seq2);
    score += contentScore * 0.1;

    return score;
  }

  /**
   * 计算内容相似性
   */
  calculateContentSimilarity(seq1, seq2) {
    const keywords1 = new Set(seq1.metadata.keywords);
    const keywords2 = new Set(seq2.metadata.keywords);

    if (keywords1.size === 0 && keywords2.size === 0) return 0;

    const intersection = new Set([...keywords1].filter(x => keywords2.has(x)));
    const union = new Set([...keywords1, ...keywords2]);

    return intersection.size / union.size;
  }

  /**
   * 求解组布局
   */
  solveGroupLayout(group) {
    if (group.length === 1) {
      // 独立序列
      return [this.layoutSingleSequence(group[0])];
    } else {
      // 组合序列
      return this.layoutGroupedSequences(group);
    }
  }

  /**
   * 布局单个序列
   */
  layoutSingleSequence(sequence) {
    const insertionPoint = sequence.constraints.insertionPoint;
    const duration = this.calculateOptimalDuration(sequence, 'single');

    return {
      id: sequence.id,
      type: sequence.type,
      content: sequence.content,
      startTime: insertionPoint,
      endTime: insertionPoint + duration,
      duration: duration,
      animation: {
        in: 'fadeIn',
        out: 'fadeOut'
      },
      groupId: null,
      isGrouped: false
    };
  }

  /**
   * 布局组合序列
   */
  layoutGroupedSequences(group) {
    const layouts = [];
    const groupId = `group_${group[0].constraints.insertionPoint}`;
    const firstInsertionPoint = group[0].constraints.insertionPoint;
    let currentTime = firstInsertionPoint;

    for (let i = 0; i < group.length; i++) {
      const sequence = group[i];
      const isFirst = i === 0;
      const isLast = i === group.length - 1;

      // 计算持续时间
      const duration = this.calculateOptimalDuration(sequence, isLast ? 'last' : 'middle');

      layouts.push({
        id: sequence.id,
        type: sequence.type,
        content: sequence.content,
        startTime: currentTime,
        endTime: currentTime + duration,
        duration: duration,
        animation: {
          in: isFirst ? 'fadeIn' : 'slideInUp',
          out: isLast ? 'fadeOut' : 'none'
        },
        groupId: groupId,
        isGrouped: true,
        groupPosition: i,
        groupSize: group.length
      });

      // 下一个序列的开始时间（有过渡重叠）
      currentTime += duration - this.globalConstraints.transitionOverlap;
    }

    return layouts;
  }

  /**
   * 计算最优持续时间
   */
  calculateOptimalDuration(sequence, position) {
    const constraints = sequence.constraints;

    if (position === 'single') {
      // 独立序列：使用优先时长，但不超过最大值
      return Math.min(
        constraints.preferredDuration,
        constraints.maxDuration
      );
    } else if (position === 'last') {
      // 组合序列的最后一个：稍长一些
      return Math.min(
        constraints.preferredDuration + 1,
        constraints.maxDuration
      );
    } else {
      // 组合序列的中间：较短（TikTok 2026: 最少4秒）
      return Math.max(
        4,
        Math.min(constraints.preferredDuration, constraints.maxDuration)
      );
    }
  }

  /**
   * 计算统计信息
   */
  calculateStatistics(layouts) {
    const totalDuration = layouts.reduce((sum, l) => sum + l.duration, 0);
    const groupedCount = layouts.filter(l => l.isGrouped).length;
    const singleCount = layouts.filter(l => !l.isGrouped).length;

    return {
      totalLayouts: layouts.length,
      totalDuration: totalDuration.toFixed(2),
      groupedCount,
      singleCount,
      avgDuration: (totalDuration / layouts.length).toFixed(2)
    };
  }
}

/**
 * Playlist生成器（类似MLT）
 */
export class PlaylistGenerator {
  constructor() {
    this.logger = new Logger('PlaylistGenerator');
  }

  /**
   * 从布局生成playlist
   * @param {Array} layouts - 布局列表
   * @param {Object} baseTimeline - 基础时间轴
   * @returns {Object} UI时间轴
   */
  generate(layouts, baseTimeline) {
    this.logger.info('📋 生成Playlist');

    // 初始化轨道
    const tracks = [
      this.createTrack('track_original', '原视频轨道', 'video', 0),
      this.createTrack('track_cards', '卡片轨道', 'overlay', 10),
      this.createTrack('track_pip', '画中画轨道', 'overlay', 20),
      this.createTrack('track_material', '素材轨道', 'background', 5)
    ];

    // 按类型分配到不同轨道
    for (const layout of layouts) {
      const clip = this.createClip(layout);

      switch (layout.type) {
        case 'card':
        case 'explanation':
          tracks.find(t => t.id === 'track_cards').clips.push(clip);
          break;
        case 'pip':
          tracks.find(t => t.id === 'track_pip').clips.push(clip);
          break;
        case 'material':
          tracks.find(t => t.id === 'track_material').clips.push(clip);
          break;
      }
    }

    // 填充原视频片段
    this.fillOriginalVideoClips(tracks, baseTimeline, layouts);

    // 创建markers
    const markers = this.createMarkers(baseTimeline.insertionPoints);

    const uiTimeline = {
      version: '1.0',
      duration: baseTimeline.videoInfo.duration,
      fps: baseTimeline.videoInfo.fps,
      tracks: tracks,
      markers: markers
    };

    this.logger.info(`  ✅ Playlist生成完成`);
    this.logger.info(`    - 轨道数: ${tracks.length}个`);
    this.logger.info(`    - 总clips: ${tracks.reduce((sum, t) => sum + t.clips.length, 0)}个`);

    return uiTimeline;
  }

  createTrack(id, name, type, zIndex) {
    return {
      id,
      name,
      type,
      visible: true,
      locked: false,
      zIndex,
      clips: []
    };
  }

  createClip(layout) {
    return {
      id: `clip_${layout.type}_${layout.id}`,
      name: `${layout.type}: ${layout.content.text?.substring(0, 10) || 'Unknown'}...`,
      type: layout.type,
      startTime: layout.startTime,
      endTime: layout.endTime,
      linkedTo: {
        speechSegmentId: null,
        insertionPointId: layout.content.insertionPoint?.id || null
      },
      content: {
        ...layout.content,
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
          css: {
            borderRadius: '20px',
            border: 'none',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)'
          }
        }
      },
      keyframes: this.generateKeyframes(layout),
      metadata: {
        groupId: layout.groupId,
        isGrouped: layout.isGrouped,
        groupPosition: layout.groupPosition,
        groupSize: layout.groupSize
      }
    };
  }

  generateKeyframes(layout) {
    const keyframes = [];
    const { startTime, endTime, animation } = layout;
    const duration = endTime - startTime;

    // 入场动画
    if (animation.in === 'fadeIn') {
      keyframes.push(
        { time: startTime, property: 'opacity', value: 0, easing: 'ease-in' },
        { time: startTime + 0.3, property: 'opacity', value: 1, easing: 'ease-out' }
      );
    } else if (animation.in === 'slideInUp') {
      keyframes.push(
        { time: startTime, property: 'opacity', value: 0, easing: 'ease-in' },
        { time: startTime, property: 'translateY', value: 50, easing: 'ease-in' },
        { time: startTime + 0.5, property: 'opacity', value: 1, easing: 'ease-out' },
        { time: startTime + 0.5, property: 'translateY', value: 0, easing: 'ease-out' }
      );
    }

    // 出场动画
    if (animation.out === 'fadeOut') {
      keyframes.push(
        { time: endTime - 0.3, property: 'opacity', value: 1 },
        { time: endTime, property: 'opacity', value: 0, easing: 'ease-out' }
      );
    }

    return keyframes;
  }

  fillOriginalVideoClips(tracks, baseTimeline, layouts) {
    const originalTrack = tracks.find(t => t.id === 'track_original');
    const videoDuration = baseTimeline.videoInfo.duration;

    // 收集所有占用的时间段
    const occupiedRanges = layouts.map(l => ({ start: l.startTime, end: l.endTime }));
    occupiedRanges.sort((a, b) => a.start - b.start);

    // 填充原视频片段
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
          linkedTo: { speechSegmentId: null, insertionPointId: null },
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
    if (currentTime < videoDuration) {
      originalTrack.clips.push({
        id: `clip_original_${clipId++}`,
        name: `原视频 ${currentTime.toFixed(1)}s-${videoDuration.toFixed(1)}s`,
        type: 'original',
        startTime: currentTime,
        endTime: videoDuration,
        linkedTo: { speechSegmentId: null, insertionPointId: null },
        source: {
          type: 'original_video',
          path: 'input.mp4',
          trimStart: currentTime,
          trimEnd: videoDuration
        },
        keyframes: []
      });
    }
  }

  createMarkers(insertionPoints) {
    return insertionPoints.map((point, index) => ({
      id: `marker_${index + 1}`,
      time: point.time,
      label: `插入点 ${index + 1}`,
      color: '#00ff00',
      type: 'insertion_point'
    }));
  }
}
