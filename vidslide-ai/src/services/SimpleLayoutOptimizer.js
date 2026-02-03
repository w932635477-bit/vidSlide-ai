/**
 * SimpleLayoutOptimizer - 简单布局优化器
 *
 * 使用状态转移矩阵替代简单的交替逻辑，打破机械化布局
 *
 * 核心功能：
 * 1. 状态转移概率矩阵 - 根据当前场景类型选择下一个场景类型
 * 2. 简化版内容密度计算 - 基于关键词数量和长度
 * 3. 动态时长调整 - 根据内容密度调整场景时长
 * 4. 约束验证 - 确保同类型场景不超过2次连续
 *
 * @version 1.0.0
 * @date 2026-02-03
 */

export class SimpleLayoutOptimizer {
  constructor(options = {}) {
    this.log = options.log || console.log;

    // ⭐ 状态转移概率矩阵（核心）v2.2 - 恢复优化配置
    // 减少场景连续，增加多层效果，提升视觉冲击力
    this.transitionMatrix = {
      'original': {
        'original': 0.01,           // 恢复到0.01（减少连续）
        'card-group': 0.45,         // 保持0.45
        'video-with-card': 0.24,    // 恢复到0.24
        'multi-layer-composition': 0.30  // 恢复到0.30（增加多层效果）
      },
      'card-group': {
        'original': 0.10,           // 恢复到0.10
        'card-group': 0.10,         // 恢复到0.10（减少卡片连续）
        'video-with-card': 0.30,    // 保持0.30
        'multi-layer-composition': 0.50  // 恢复到0.50（增加多层效果）
      },
      'video-with-card': {
        'original': 0.10,           // 恢复到0.10
        'card-group': 0.40,         // 保持0.40
        'video-with-card': 0.05,    // 恢复到0.05（减少连续）
        'multi-layer-composition': 0.45  // 恢复到0.45（增加多层效果）
      },
      'multi-layer-composition': {
        'original': 0.10,           // 恢复到0.10
        'card-group': 0.45,         // 恢复到0.45
        'video-with-card': 0.25,    // 保持0.25
        'multi-layer-composition': 0.20  // 保持0.20
      }
    };

    // ⭐ 场景类型的基础时长配置（秒）v2.2 - 恢复优化配置
    this.baseDurations = {
      'original': 2,                // 恢复到2秒（快节奏）
      'card-group': 4,              // 恢复到4秒
      'video-with-card': 3,         // 恢复到3秒
      'multi-layer-composition': 5  // 保持5秒
    };

    // ⭐ 时长调整范围 v2.2 - 恢复优化配置
    this.durationRanges = {
      'original': { min: 1.5, max: 3 },         // 恢复到1.5-3秒
      'card-group': { min: 3, max: 5 },         // 恢复到3-5秒
      'video-with-card': { min: 2, max: 4 },    // 恢复到2-4秒
      'multi-layer-composition': { min: 4, max: 6 }  // 保持4-6秒
    };
  }

  /**
   * 简化版内容密度计算
   *
   * 基于关键词数量和长度计算信息密度
   *
   * @param {Array} keywords - 关键词列表
   * @param {number} startTime - 起始时间（秒）
   * @param {number} windowSize - 时间窗口大小（秒）
   * @returns {Object} 密度信息 { density, complexity, score }
   */
  calculateSimpleDensity(keywords, startTime, windowSize = 5) {
    // 获取时间窗口内的关键词
    const keywordsInWindow = keywords.filter(kw =>
      kw.startTime >= startTime && kw.startTime < startTime + windowSize
    );

    if (keywordsInWindow.length === 0) {
      return { density: 0, complexity: 0, score: 0 };
    }

    // 计算密度（关键词数量 / 时长）
    const density = keywordsInWindow.length / windowSize;

    // 计算复杂度（基于关键词平均长度）
    const totalLength = keywordsInWindow.reduce((sum, kw) => {
      const text = kw.text || kw.keyword || '';
      return sum + text.length;
    }, 0);
    const avgLength = totalLength / keywordsInWindow.length;

    // 归一化复杂度（假设平均长度10为标准）
    const complexity = Math.min(avgLength / 10, 2);

    // 综合得分
    const score = density * complexity;

    return {
      density: density,
      complexity: complexity,
      score: score
    };
  }

  /**
   * 选择下一个场景类型
   *
   * 基于状态转移矩阵、约束条件和内容密度
   *
   * @param {string} currentType - 当前场景类型
   * @param {Object} consecutiveCount - 连续计数 { 'original': 1, ... }
   * @param {Object} density - 内容密度信息
   * @param {Array} allKeywords - 所有关键词（用于全局统计）
   * @returns {string} 下一个场景类型
   */
  selectNextType(currentType, consecutiveCount, density, allKeywords = []) {
    // 1. 获取基础概率
    let probabilities = { ...this.transitionMatrix[currentType] };

    // 2. 应用约束：同类型不超过2次连续
    if (consecutiveCount[currentType] >= 2) {
      probabilities[currentType] = 0;
      this.log('debug', `  → 约束：${currentType} 已连续${consecutiveCount[currentType]}次，禁止继续`);
    }

    // 3. 基于内容密度调整概率
    if (density && density.score > 0) {
      if (density.score > 0.7) {
        // 高密度内容 → 增加多层场景概率（需要更多视觉辅助）
        probabilities['multi-layer-composition'] *= 1.5;
        this.log('debug', `  → 密度调整：高密度(${density.score.toFixed(2)})，增加多层概率`);
      } else if (density.score < 0.3) {
        // 低密度内容 → 增加原视频概率（保持简洁）
        probabilities['original'] *= 1.3;
        this.log('debug', `  → 密度调整：低密度(${density.score.toFixed(2)})，增加原视频概率`);
      }
    }

    // 4. 重新归一化概率
    const sum = Object.values(probabilities).reduce((a, b) => a + b, 0);
    if (sum === 0) {
      // 如果所有概率都为0（不应该发生），使用均匀分布
      this.log('warn', '  ⚠️ 所有概率为0，使用均匀分布');
      const types = Object.keys(probabilities);
      types.forEach(type => {
        probabilities[type] = 1 / types.length;
      });
    } else {
      for (const type in probabilities) {
        probabilities[type] /= sum;
      }
    }

    // 5. 加权随机选择
    const selectedType = this.weightedRandom(probabilities);

    // 6. 记录决策
    this.log('debug', `  → 选择：${currentType} → ${selectedType} (密度: ${density?.score.toFixed(2) || 'N/A'})`);

    return selectedType;
  }

  /**
   * 加权随机选择
   *
   * @param {Object} probabilities - 概率分布 { 'type1': 0.3, 'type2': 0.7 }
   * @returns {string} 选中的类型
   */
  weightedRandom(probabilities) {
    const rand = Math.random();
    let cumulative = 0;

    for (const [type, prob] of Object.entries(probabilities)) {
      cumulative += prob;
      if (rand < cumulative) {
        return type;
      }
    }

    // 降级：返回第一个类型
    return Object.keys(probabilities)[0];
  }

  /**
   * 计算动态场景时长
   *
   * 根据内容密度动态调整场景时长
   *
   * @param {string} sceneType - 场景类型
   * @param {Object} density - 内容密度信息
   * @returns {number} 场景时长（秒）
   */
  calculateDynamicDuration(sceneType, density) {
    // 基础时长
    let duration = this.baseDurations[sceneType] || 5;

    // 根据内容密度调整
    if (density && density.score > 0) {
      if (density.score > 0.7) {
        // 高密度内容需要更多时间
        duration *= 1.3;
      } else if (density.score < 0.3) {
        // 低密度内容缩短时间
        duration *= 0.7;
      }
    }

    // 应用时长范围限制
    const range = this.durationRanges[sceneType];
    if (range) {
      duration = Math.max(range.min, Math.min(duration, range.max));
    }

    return Math.round(duration * 10) / 10; // 保留1位小数
  }

  /**
   * 生成优化的场景序列
   *
   * 主入口方法
   *
   * @param {Array} scenes - 原始场景列表
   * @param {number} videoDuration - 视频总时长（秒）
   * @param {Object} options - 选项
   * @returns {Array} 优化后的场景列表
   */
  generateOptimizedSequence(scenes, videoDuration, options = {}) {
    const { rules = {} } = options;

    this.log('info', '🎯 开始布局优化（状态转移矩阵）');

    // 初始化统计
    let currentType = 'original'; // 开场必须是原视频
    const consecutiveCount = {
      'original': 1,
      'card-group': 0,
      'video-with-card': 0,
      'multi-layer-composition': 0
    };

    const typeStats = {
      'original': 0,
      'card-group': 0,
      'video-with-card': 0,
      'multi-layer-composition': 0
    };

    // 优化每个场景
    const optimizedScenes = scenes.map((scene, index) => {
      // 开场和结尾强制使用原视频
      const openingDuration = Math.min(3, videoDuration * 0.03);
      const endingDuration = Math.min(3, videoDuration * 0.03);

      if (scene.startTime < openingDuration) {
        scene.type = 'original';
        scene.description = '开场原视频';
        currentType = 'original';
        consecutiveCount['original']++;
        typeStats['original']++;
        return scene;
      }

      if (scene.endTime > videoDuration - endingDuration) {
        scene.type = 'original';
        scene.description = '结尾原视频';
        currentType = 'original';
        consecutiveCount['original']++;
        typeStats['original']++;
        return scene;
      }

      // 计算内容密度
      const density = this.calculateSimpleDensity(
        scenes,
        scene.startTime,
        5
      );

      // 选择下一个场景类型
      const nextType = this.selectNextType(
        currentType,
        consecutiveCount,
        density,
        scenes
      );

      // 更新场景
      scene.type = nextType;
      // ✅ 修复：将密度信息存储到metadata，不影响卡片文字显示
      if (!scene.metadata) scene.metadata = {};
      scene.metadata.density = density.score;
      scene.metadata.densityLabel = density.score > 0.7 ? '高密度' : (density.score < 0.3 ? '低密度' : '中密度');

      // 保持原有的description（如果有的话），不添加密度信息
      if (!scene.description || scene.description.includes('密度')) {
        scene.description = `${nextType}场景`;
      }

      // 动态调整时长（可选）
      if (options.enableDynamicDuration) {
        const newDuration = this.calculateDynamicDuration(nextType, density);
        scene.endTime = scene.startTime + newDuration;
        scene.duration = newDuration;
      }

      // 更新状态
      currentType = nextType;
      consecutiveCount[nextType]++;
      typeStats[nextType]++;

      // 重置其他类型的连续计数
      for (const type in consecutiveCount) {
        if (type !== nextType) {
          consecutiveCount[type] = 0;
        }
      }

      return scene;
    });

    // 输出统计
    const total = optimizedScenes.length;
    this.log('info', '✅ 布局优化完成');
    this.log('info', `  场景分布:`);
    this.log('info', `    - 原视频: ${typeStats['original']}个 (${(typeStats['original']/total*100).toFixed(1)}%)`);
    this.log('info', `    - 卡片组: ${typeStats['card-group']}个 (${(typeStats['card-group']/total*100).toFixed(1)}%)`);
    this.log('info', `    - 单卡片: ${typeStats['video-with-card']}个 (${(typeStats['video-with-card']/total*100).toFixed(1)}%)`);
    this.log('info', `    - 多层场景: ${typeStats['multi-layer-composition']}个 (${(typeStats['multi-layer-composition']/total*100).toFixed(1)}%)`);

    return optimizedScenes;
  }

  /**
   * 验证场景序列的合理性
   *
   * @param {Array} scenes - 场景列表
   * @returns {Object} 验证结果 { valid, issues }
   */
  validateSequence(scenes) {
    const issues = [];

    // 检查1：同类型连续不超过3次
    let consecutiveCount = 1;
    let prevType = scenes[0]?.type;

    for (let i = 1; i < scenes.length; i++) {
      if (scenes[i].type === prevType) {
        consecutiveCount++;
        if (consecutiveCount > 3) {
          issues.push(`场景${i}: ${prevType} 连续出现${consecutiveCount}次（超过限制3次）`);
        }
      } else {
        consecutiveCount = 1;
        prevType = scenes[i].type;
      }
    }

    // 检查2：场景类型分布合理性
    const typeCount = {};
    scenes.forEach(scene => {
      typeCount[scene.type] = (typeCount[scene.type] || 0) + 1;
    });

    const total = scenes.length;
    for (const [type, count] of Object.entries(typeCount)) {
      const ratio = count / total;
      if (type === 'original' && ratio > 0.3) {
        issues.push(`原视频占比过高: ${(ratio*100).toFixed(1)}% (建议<30%)`);
      }
    }

    return {
      valid: issues.length === 0,
      issues: issues
    };
  }
}

export default SimpleLayoutOptimizer;
