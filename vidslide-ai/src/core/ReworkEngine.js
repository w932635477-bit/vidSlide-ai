import ViolationClassifier from './ViolationClassifier.js';

/**
 * ReworkEngine - 智能返工引擎
 *
 * 功能：
 * 1. 分析违规项并分类
 * 2. 确定需要返工的阶段
 * 3. 保留成功的阶段结果
 * 4. 生成改进提示
 * 5. 重新执行失败的阶段
 */
class ReworkEngine {
  constructor(options = {}) {
    this.logger = options.logger || console;
    this.maxReworkCycles = options.maxReworkCycles || 3;
    this.reworkHistory = [];
  }

  /**
   * 执行智能返工
   * @param {Array<string>} violations - 违规项列表（字符串）
   * @param {Object} plan - 执行计划
   * @param {Object} currentResults - 当前结果
   * @param {Object} agents - Agent实例映射
   * @returns {Promise<Object>} 返工结果
   */
  async execute(violations, plan, currentResults, agents) {
    this.logger.info('🔄 ReworkEngine: 开始智能返工');
    this.logger.info(`  违规项数量: ${violations.length}个`);

    // 1. 分类违规项
    const classifiedViolations = ViolationClassifier.classifyAll(violations);

    // 2. 分组按严重性排序
    const groupedBySeverity = ViolationClassifier.groupBySeverity(classifiedViolations);

    this.logger.info(`  违规分布:`);
    this.logger.info(`    - CRITICAL: ${groupedBySeverity.CRITICAL.length}个`);
    this.logger.info(`    - HIGH: ${groupedBySeverity.HIGH.length}个`);
    this.logger.info(`    - MEDIUM: ${groupedBySeverity.MEDIUM.length}个`);
    this.logger.info(`    - LOW: ${groupedBySeverity.LOW.length}个`);

    // 3. 确定需要返工的阶段
    const phasesToRework = ViolationClassifier.getPhasesToRework(classifiedViolations);

    this.logger.info(`  需要返工的阶段: ${Array.from(phasesToRework).sort().join(', ')}`);

    // 4. 保留成功的阶段结果
    const preservedResults = this.preserveSuccessfulPhases(
      currentResults,
      phasesToRework,
      plan
    );

    this.logger.info(`  保留成功阶段: ${Object.keys(preservedResults).length}个任务`);

    // 5. 为每个阶段生成改进提示
    const improvementHints = this.generateImprovementHints(classifiedViolations);

    // 6. 按顺序重新执行阶段
    const reworkResults = await this.executePhases(
      phasesToRework,
      plan,
      preservedResults,
      improvementHints,
      agents
    );

    // 7. 记录返工历史
    this.reworkHistory.push({
      timestamp: Date.now(),
      violations: classifiedViolations,
      phasesReworked: Array.from(phasesToRework),
      success: reworkResults.success
    });

    return reworkResults;
  }

  /**
   * 保留成功的阶段结果
   * @param {Object} currentResults - 当前所有任务结果
   * @param {Set<string>} phasesToRework - 需要返工的阶段集合
   * @param {Object} plan - 执行计划
   * @returns {Object} 保留的任务结果
   */
  preserveSuccessfulPhases(currentResults, phasesToRework, plan) {
    const preserved = {};

    // 遍历所有任务
    for (let phase = 1; phase <= 5; phase++) {
      const phaseKey = `phase${phase}`;

      if (!phasesToRework.has(phaseKey)) {
        // 保留此阶段的所有任务结果
        const phaseTasks = plan[phaseKey]?.tasks || [];
        phaseTasks.forEach(task => {
          if (currentResults[task.id]) {
            preserved[task.id] = currentResults[task.id];
          }
        });
      }
    }

    return preserved;
  }

  /**
   * 生成改进提示
   * @param {Array<Object>} violations - 结构化违规对象列表
   * @returns {Object} 改进提示映射
   */
  generateImprovementHints(violations) {
    const hints = {};

    violations.forEach(v => {
      const category = v.category;

      if (!hints[category]) {
        hints[category] = [];
      }

      // 根据违规类型生成具体提示
      if (category === 'VISUAL_CONTENT') {
        hints[category].push({
          issue: '卡片内容错误',
          fix: '使用 scene.keywordObj?.text 而非 scene.keyword',
          example: 'const keyword = scene.keywordObj?.text || "默认值";',
          sceneId: v.sceneId
        });
      }
      else if (category === 'VISUAL_POSITION') {
        hints[category].push({
          issue: '卡片位置错误',
          fix: '计算位置时考虑抖音安全区域（底部400px）',
          example: 'y = videoHeight - cardHeight - DOUYIN_SPECS.safeArea.bottom - 20;',
          sceneId: v.sceneId
        });
      }
      else if (category === 'VISUAL_STYLE') {
        hints[category].push({
          issue: '样式不符合规范',
          fix: '参考理想效果视频的样式参数',
          example: 'cardText.substring(0, 5) // 限制5字',
          sceneId: v.sceneId
        });
      }
      else if (category === 'SCENE_DESIGN') {
        hints[category].push({
          issue: '场景设计问题',
          fix: '确保原视频占比≥25%，时间轴连续',
          example: 'originalRatio = totalOriginalTime / totalTime * 100',
          sceneId: v.sceneId
        });
      }
      else if (category === 'CONTENT_ANALYSIS') {
        hints[category].push({
          issue: '内容理解问题',
          fix: '确保关键词数量3-5个，观点简洁',
          example: 'keywords.length >= 3 && keywords.length <= 5',
          sceneId: v.sceneId
        });
      }
    });

    return hints;
  }

  /**
   * 重新执行阶段
   * @param {Set<string>} phasesToRework - 需要返工的阶段集合
   * @param {Object} plan - 执行计划
   * @param {Object} preservedResults - 保留的成功结果
   * @param {Object} hints - 改进提示
   * @param {Object} agents - Agent实例
   * @returns {Promise<Object>} 执行结果
   */
  async executePhases(phasesToRework, plan, preservedResults, hints, agents) {
    const results = { ...preservedResults };

    // 按阶段顺序执行
    const sortedPhases = Array.from(phasesToRework).sort();

    for (const phaseKey of sortedPhases) {
      this.logger.info(`\n  → 重新执行 ${phaseKey}...`);

      const phase = plan[phaseKey];
      if (!phase) {
        this.logger.warn(`    ⚠️ 未找到阶段配置: ${phaseKey}`);
        continue;
      }

      // 执行此阶段的所有任务
      for (const task of phase.tasks) {
        try {
          // 获取Agent
          const agent = task.agent === 'qualityDirector'
            ? agents.qualityDirector
            : agents.agents[task.agent];

          if (!agent) {
            throw new Error(`未找到智能体: ${task.agent}`);
          }

          // 准备输入（包含改进提示）
          const input = this.prepareTaskInput(task, results, plan, hints);

          // 执行任务
          this.logger.info(`    执行任务: ${task.name}...`);
          const result = await agent[task.method](input);
          results[task.id] = result;

          this.logger.info(`    ✅ ${task.name} 完成`);

        } catch (error) {
          this.logger.error(`    ❌ ${task.name} 失败: ${error.message}`);

          if (task.critical) {
            return {
              success: false,
              error: `返工阶段${phaseKey}失败`,
              phase: phaseKey,
              task: task.name,
              details: error.message
            };
          }
        }
      }
    }

    this.logger.info(`\n✅ 返工执行完成`);

    // ⭐ 修复Bug #3 & Bug #6: 添加qualityChecks和finalVideo字段
    const qualityChecks = {};
    for (const [taskId, result] of Object.entries(results)) {
      if (taskId.includes('quality') || taskId.includes('check') ||
          taskId.startsWith('task_1_3') || taskId.startsWith('task_2_2') ||
          taskId.startsWith('task_4_') || taskId.startsWith('task_5_2')) {
        qualityChecks[taskId] = result;
      }
    }

    // task_5_1返回的是对象 {finalVideo: string, performance: {}}
    return {
      success: true,
      results: results,
      qualityChecks: qualityChecks,
      finalVideo: results.task_5_1?.finalVideo || results.task_5_1 || null,  // ⭐ 添加finalVideo字段
      performance: results.task_5_1?.performance,
      phasesReworked: sortedPhases
    };
  }

  /**
   * 准备任务输入
   * @param {Object} task - 任务配置
   * @param {Object} previousResults - 之前的任务结果
   * @param {Object} plan - 执行计划
   * @param {Object} hints - 改进提示
   * @returns {Object} 任务输入
   */
  prepareTaskInput(task, previousResults, plan, hints) {
    const input = { ...task.input };

    // 添加依赖任务的结果
    if (task.dependsOn) {
      for (const depTaskId of task.dependsOn) {
        input[depTaskId] = previousResults[depTaskId];
      }
    }

    // 添加改进提示
    input._improvementHints = hints;

    // 特殊处理finalCheck
    if (task.method === 'finalCheck') {
      // ⭐ Bug #5 & Bug #6修复：添加finalVideo和performance字段
      // task_5_1返回的是对象 {finalVideo: string, performance: {}}
      input.finalVideo = previousResults.task_5_1?.finalVideo || previousResults.task_5_1;
      input.performance = previousResults.task_5_1?.performance || previousResults.task_5_1_performance || {
        fileSize: 0,
        duration: 0
      };

      input.context = {
        contentAnalysis: previousResults.task_1_2?.understanding,
        sceneDesign: previousResults.task_2_1,
        materials: previousResults.task_3_1,
        visuals: {
          cards: previousResults.task_3_2?.cards,
          backgrounds: previousResults.task_3_3?.backgrounds,
          pips: previousResults.task_3_4?.pips
        },
        videoPath: plan.videoPath
      };
    }

    return input;
  }

  /**
   * 获取返工历史统计
   * @returns {Object} 统计信息
   */
  getStats() {
    if (this.reworkHistory.length === 0) {
      return {
        totalReworks: 0,
        successRate: 0,
        commonViolations: {},
        recentHistory: []
      };
    }

    return {
      totalReworks: this.reworkHistory.length,
      successRate: this.reworkHistory.filter(r => r.success).length /
                   this.reworkHistory.length,
      commonViolations: this.getCommonViolations(),
      recentHistory: this.reworkHistory.slice(-10)
    };
  }

  /**
   * 获取常见违规项
   * @returns {Object} 违规类别计数
   */
  getCommonViolations() {
    const counts = {};

    this.reworkHistory.forEach(record => {
      record.violations.forEach(v => {
        const category = v.category;
        counts[category] = (counts[category] || 0) + 1;
      });
    });

    return counts;
  }
}

export default ReworkEngine;
