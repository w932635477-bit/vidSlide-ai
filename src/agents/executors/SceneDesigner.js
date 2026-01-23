/**
 * SceneDesigner - 场景设计师
 *
 * 职责：
 * 1. 根据理解文档拆解场景
 * 2. 插入原视频过渡（占比25%+）
 * 3. 生成时间轴方案
 * 4. 验证时间轴连续性
 */
class SceneDesigner {
  constructor(options = {}) {
    this.name = 'SceneDesigner';
    this.logger = options.logger || console;
    this.errorHandler = options.errorHandler;
  }

  /**
   * 场景拆解
   * @param {Object} input - 输入参数
   * @param {Object} input.task_1_2 - 内容分析结果
   * @param {number} input.videoDuration - 视频时长（秒）
   * @returns {Promise<Object>} 包含scenes和stats
   */
  async decomposeScenes(input) {
    const { task_1_2, videoDuration } = input;
    const understanding = task_1_2.understanding;

    this.logger.info('🎬 SceneDesigner: 开始场景拆解');
    this.logger.info(`  → 视频时长: ${videoDuration}秒`);

    const scenes = [];
    let currentTime = 0;

    // 规则1: 开场必须是原视频（2秒）
    scenes.push({
      id: 'scene_0',
      type: 'original',
      startTime: 0,
      endTime: 2,
      purpose: '开场',
      priority: 'critical'
    });
    currentTime = 2;

    // 规则2: 合并观点和解释，按时间排序
    const contents = this.mergeAndSort(
      understanding.viewpoints,
      understanding.explanations
    );

    this.logger.info(`  → 识别到 ${contents.length} 个内容片段`);

    let lastSceneType = 'original';
    let consecutiveComplexScenes = 0;

    for (let i = 0; i < contents.length; i++) {
      const content = contents[i];

      // 规则3: 连续2个复杂场景后，强制插入过渡
      if (consecutiveComplexScenes >= 2) {
        scenes.push({
          id: `scene_${scenes.length}`,
          type: 'original',
          startTime: currentTime,
          endTime: currentTime + 1.5,
          purpose: '强制过渡（避免视觉疲劳）',
          priority: 'high'
        });
        currentTime += 1.5;
        lastSceneType = 'original';
        consecutiveComplexScenes = 0;
      }

      // 规则4: 如果上一个不是原视频，插入短过渡
      if (lastSceneType !== 'original' && consecutiveComplexScenes < 2) {
        scenes.push({
          id: `scene_${scenes.length}`,
          type: 'original',
          startTime: currentTime,
          endTime: currentTime + 1,
          purpose: '常规过渡',
          priority: 'medium'
        });
        currentTime += 1;
        lastSceneType = 'original';
      }

      // 规则5: 根据内容类型选择场景
      if (content.type === 'viewpoint') {
        const duration = this.calculateOptimalDuration(content.text);
        scenes.push({
          id: `scene_${scenes.length}`,
          type: 'video-with-card',
          startTime: currentTime,
          endTime: currentTime + duration,
          cardText: content.text,
          cardStyle: content.importance === 'high' ? 'blue' : 'yellow',
          purpose: '观点表述',
          priority: content.importance
        });
        currentTime += duration;
        lastSceneType = 'video-with-card';
        consecutiveComplexScenes++;

      } else if (content.type === 'explanation') {
        const duration = this.calculateOptimalDuration(content.text, 'explanation');
        scenes.push({
          id: `scene_${scenes.length}`,
          type: 'multi-layer-composition',
          startTime: currentTime,
          endTime: currentTime + duration,
          keyword: content.keyword,
          needMaterial: true,
          needHighlight: true,
          purpose: '观点解释',
          priority: 'high'
        });
        currentTime += duration;
        lastSceneType = 'multi-layer-composition';
        consecutiveComplexScenes++;
      }

      // 规则6: 每3个内容后，插入较长过渡
      if ((i + 1) % 3 === 0 && i < contents.length - 1) {
        scenes.push({
          id: `scene_${scenes.length}`,
          type: 'original',
          startTime: currentTime,
          endTime: currentTime + 2.5,
          purpose: '段落过渡',
          priority: 'high'
        });
        currentTime += 2.5;
        lastSceneType = 'original';
        consecutiveComplexScenes = 0;
      }
    }

    // 规则7: 结尾必须是原视频
    const endDuration = Math.min(3, videoDuration - currentTime);
    if (endDuration > 0) {
      scenes.push({
        id: `scene_${scenes.length}`,
        type: 'original',
        startTime: currentTime,
        endTime: currentTime + endDuration,
        purpose: '结尾',
        priority: 'critical'
      });
    }

    // 验证时间轴
    const validation = this.validateTimeline(scenes, videoDuration);

    if (!validation.passed) {
      this.logger.warn('  ⚠️ 时间轴验证失败，调整中', { issues: validation.issues });
      return await this.adjustTimeline(scenes, validation.issues, videoDuration);
    }

    // 计算统计信息
    const stats = this.calculateStats(scenes);

    this.logger.info(`  ✅ 场景拆解完成:`);
    this.logger.info(`    - 总场景数: ${scenes.length}`);
    this.logger.info(`    - 原视频占比: ${stats.originalRatio}%`);
    this.logger.info(`    - 卡片场景: ${stats.cardScenes}个`);
    this.logger.info(`    - 多层场景: ${stats.multiLayerScenes}个`);

    // 验证原视频占比
    if (stats.originalRatio < 25) {
      this.logger.warn('  ⚠️ 原视频占比不足25%，增加过渡');
      return await this.addMoreTransitions(scenes, videoDuration);
    }

    return {
      scenes: scenes,
      stats: stats
    };
  }

  /**
   * 合并并排序观点和解释
   * @param {Array} viewpoints - 观点列表
   * @param {Array} explanations - 解释列表
   * @returns {Array} 合并后的内容列表
   */
  mergeAndSort(viewpoints, explanations) {
    const contents = [];

    // 添加观点
    for (const vp of viewpoints) {
      contents.push({
        type: 'viewpoint',
        text: vp.text,
        importance: vp.importance,
        timestamp: vp.timestamp,
        startTime: vp.timestamp.start
      });
    }

    // 添加解释
    for (const exp of explanations) {
      contents.push({
        type: 'explanation',
        text: exp.text,
        keyword: exp.keyword,
        timestamp: exp.timestamp,
        startTime: exp.timestamp.start
      });
    }

    // 按时间排序
    contents.sort((a, b) => a.startTime - b.startTime);

    return contents;
  }

  /**
   * 计算最优时长
   * @param {string} text - 文本内容
   * @param {string} type - 类型（viewpoint/explanation）
   * @returns {number} 时长（秒）
   */
  calculateOptimalDuration(text, type = 'viewpoint') {
    const baseTime = type === 'viewpoint' ? 3 : 5;
    const textLength = text.length;

    // 根据文字长度调整时长
    if (textLength <= 10) {
      return baseTime;
    } else if (textLength <= 20) {
      return baseTime + 1;
    } else {
      return baseTime + 2;
    }
  }

  /**
   * 验证时间轴
   * @param {Array} scenes - 场景列表
   * @param {number} videoDuration - 视频时长
   * @returns {Object} 验证结果
   */
  validateTimeline(scenes, videoDuration) {
    const issues = [];

    // 检查场景连续性
    for (let i = 0; i < scenes.length - 1; i++) {
      const current = scenes[i];
      const next = scenes[i + 1];

      if (current.endTime !== next.startTime) {
        issues.push(`场景${i}和${i + 1}之间有时间间隙`);
      }
    }

    // 检查总时长
    const totalDuration = scenes[scenes.length - 1].endTime;
    if (totalDuration > videoDuration) {
      issues.push(`总时长${totalDuration}秒超过视频时长${videoDuration}秒`);
    }

    // 检查开场和结尾
    if (scenes[0].type !== 'original') {
      issues.push('开场必须是原视频');
    }
    if (scenes[scenes.length - 1].type !== 'original') {
      issues.push('结尾必须是原视频');
    }

    return {
      passed: issues.length === 0,
      issues: issues
    };
  }

  /**
   * 调整时间轴
   * @param {Array} scenes - 场景列表
   * @param {Array} issues - 问题列表
   * @param {number} videoDuration - 视频时长
   * @returns {Promise<Object>} 调整后的结果
   */
  async adjustTimeline(scenes, issues, videoDuration) {
    this.logger.info('  → 调整时间轴...');

    // 如果总时长超过视频时长，按比例缩短
    const totalDuration = scenes[scenes.length - 1].endTime;
    if (totalDuration > videoDuration) {
      const ratio = videoDuration / totalDuration;
      for (const scene of scenes) {
        scene.startTime = scene.startTime * ratio;
        scene.endTime = scene.endTime * ratio;
      }
    }

    // 修复时间间隙
    for (let i = 1; i < scenes.length; i++) {
      scenes[i].startTime = scenes[i - 1].endTime;
      const duration = scenes[i].endTime - scenes[i].startTime;
      scenes[i].endTime = scenes[i].startTime + duration;
    }

    // 重新计算统计信息
    const stats = this.calculateStats(scenes);

    return {
      scenes: scenes,
      stats: stats
    };
  }

  /**
   * 增加更多过渡
   * @param {Array} scenes - 场景列表
   * @param {number} videoDuration - 视频时长
   * @returns {Promise<Object>} 调整后的结果
   */
  async addMoreTransitions(scenes, videoDuration) {
    this.logger.info('  → 增加过渡场景...');

    const newScenes = [];
    let currentTime = 0;

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];

      // 添加当前场景
      scene.startTime = currentTime;
      const duration = scene.endTime - scene.startTime;
      scene.endTime = currentTime + duration;
      newScenes.push(scene);
      currentTime = scene.endTime;

      // 在非原视频场景后添加过渡
      if (scene.type !== 'original' && i < scenes.length - 1) {
        newScenes.push({
          id: `scene_${newScenes.length}`,
          type: 'original',
          startTime: currentTime,
          endTime: currentTime + 1,
          purpose: '补充过渡',
          priority: 'medium'
        });
        currentTime += 1;
      }
    }

    // 重新计算统计信息
    const stats = this.calculateStats(newScenes);

    return {
      scenes: newScenes,
      stats: stats
    };
  }

  /**
   * 计算统计信息
   * @param {Array} scenes - 场景列表
   * @returns {Object} 统计信息
   */
  calculateStats(scenes) {
    const totalDuration = scenes[scenes.length - 1].endTime;
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
      totalDuration: totalDuration,
      originalDuration: originalDuration,
      originalRatio: (originalDuration / totalDuration * 100).toFixed(2),
      cardScenes: cardScenes,
      multiLayerScenes: multiLayerScenes
    };
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
      ready: true
    };
  }
}

export default SceneDesigner;
