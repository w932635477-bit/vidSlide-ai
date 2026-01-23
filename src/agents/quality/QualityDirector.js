/**
 * QualityDirector - 质量总监
 *
 * 职责：
 * 1. 制定质量标准
 * 2. 多维度检查
 * 3. 决定是否通过
 * 4. 生成改进建议
 */
class QualityDirector {
  constructor(options = {}) {
    this.name = 'QualityDirector';
    this.logger = options.logger || console;
    this.errorHandler = options.errorHandler;

    // 质量标准
    this.standards = {
      contentUnderstanding: {
        minKeywords: 3,
        maxKeywords: 5,
        minViewpoints: 1,
        maxViewpointLength: 15,
        requiredFields: ['keywords', 'viewpoints', 'explanations', 'intent']
      },
      sceneDesign: {
        minOriginalRatio: 25,  // 原视频占比至少25%
        maxTotalDuration: null,  // 不超过视频时长
        requiredSceneTypes: ['original'],
        continuity: true  // 时间轴必须连续
      },
      materialAccuracy: {
        minScore: 70,  // 素材准确性至少70分
        requiredSource: ['doubao', 'default']
      },
      visualQuality: {
        requiredCardStyles: ['blue', 'yellow', 'bright'],
        minCardCount: 1
      },
      videoQuality: {
        minDuration: 10,  // 至少10秒
        maxFileSize: 100 * 1024 * 1024,  // 最大100MB
        requiredFormat: 'mp4'
      }
    };
  }

  /**
   * 检查内容理解
   * @param {Object} result - 内容分析结果
   * @returns {Promise<Object>} 检查结果
   */
  async checkUnderstanding(result) {
    this.logger.info('🔍 QualityDirector: 检查内容理解');

    const violations = [];
    const warnings = [];
    const suggestions = [];
    let score = 100;

    const understanding = result.understanding;
    const standards = this.standards.contentUnderstanding;

    // 检查必需字段
    for (const field of standards.requiredFields) {
      if (!understanding[field]) {
        violations.push(`缺少必需字段: ${field}`);
        score -= 25;
      }
    }

    // 检查关键词数量
    if (understanding.keywords) {
      if (understanding.keywords.length < standards.minKeywords) {
        violations.push(`关键词数量不足（${understanding.keywords.length}个，需要至少${standards.minKeywords}个）`);
        score -= 20;
      } else if (understanding.keywords.length > standards.maxKeywords) {
        warnings.push(`关键词数量过多（${understanding.keywords.length}个，建议不超过${standards.maxKeywords}个）`);
        score -= 5;
      }
    }

    // 检查观点数量
    if (understanding.viewpoints) {
      if (understanding.viewpoints.length < standards.minViewpoints) {
        violations.push(`观点数量不足（${understanding.viewpoints.length}个，需要至少${standards.minViewpoints}个）`);
        score -= 20;
      }

      // 检查观点长度
      for (let i = 0; i < understanding.viewpoints.length; i++) {
        const vp = understanding.viewpoints[i];
        if (vp.text && vp.text.length > standards.maxViewpointLength) {
          warnings.push(`观点[${i}]文字过长（${vp.text.length}字，建议不超过${standards.maxViewpointLength}字）`);
          score -= 3;
        }
      }
    }

    // 生成建议
    if (score < 95) {
      suggestions.push('优化关键词提取，确保准确性');
      suggestions.push('调整观点识别，确保简洁明了');
    }

    const passed = score >= 95;

    this.logger.info(`  ${passed ? '✅' : '❌'} 内容理解检查: ${score}分`);
    if (violations.length > 0) {
      this.logger.warn(`    违规项: ${violations.length}个`);
    }

    return {
      passed: passed,
      score: score,
      violations: violations,
      warnings: warnings,
      suggestions: suggestions
    };
  }

  /**
   * 检查场景设计
   * @param {Object} result - 场景设计结果
   * @returns {Promise<Object>} 检查结果
   */
  async checkSceneDesign(result) {
    this.logger.info('🔍 QualityDirector: 检查场景设计');

    const violations = [];
    const warnings = [];
    const suggestions = [];
    let score = 100;

    const scenes = result.scenes;
    const stats = result.stats;
    const standards = this.standards.sceneDesign;

    // 检查原视频占比
    const originalRatio = parseFloat(stats.originalRatio);
    if (originalRatio < standards.minOriginalRatio) {
      violations.push(`原视频占比不足（${originalRatio}%，需要至少${standards.minOriginalRatio}%）`);
      score -= 30;
    }

    // 检查时间轴连续性
    if (standards.continuity) {
      for (let i = 0; i < scenes.length - 1; i++) {
        const current = scenes[i];
        const next = scenes[i + 1];

        if (Math.abs(current.endTime - next.startTime) > 0.01) {
          violations.push(`场景${i}和${i + 1}之间有时间间隙`);
          score -= 10;
        }
      }
    }

    // 检查开场和结尾
    if (scenes[0].type !== 'original') {
      violations.push('开场必须是原视频');
      score -= 15;
    }
    if (scenes[scenes.length - 1].type !== 'original') {
      violations.push('结尾必须是原视频');
      score -= 15;
    }

    // 检查场景多样性
    if (stats.cardScenes === 0 && stats.multiLayerScenes === 0) {
      warnings.push('缺少卡片或多层场景，视频可能过于单调');
      score -= 10;
    }

    // 生成建议
    if (originalRatio < 30) {
      suggestions.push('增加原视频过渡场景，提高观看舒适度');
    }
    if (stats.multiLayerScenes > stats.cardScenes * 2) {
      suggestions.push('减少多层场景，避免视觉疲劳');
    }

    const passed = score >= 95;

    this.logger.info(`  ${passed ? '✅' : '❌'} 场景设计检查: ${score}分`);
    if (violations.length > 0) {
      this.logger.warn(`    违规项: ${violations.length}个`);
    }

    return {
      passed: passed,
      score: score,
      violations: violations,
      warnings: warnings,
      suggestions: suggestions
    };
  }

  /**
   * 检查素材准确性
   * @param {Object} result - 素材生成结果
   * @returns {Promise<Object>} 检查结果
   */
  async checkMaterialAccuracy(result) {
    this.logger.info('🔍 QualityDirector: 检查素材准确性');

    const violations = [];
    const warnings = [];
    const suggestions = [];
    let score = 100;

    const materials = result.materials;
    const standards = this.standards.materialAccuracy;

    let totalScore = 0;
    let validMaterials = 0;

    for (const item of materials) {
      const material = item.material;

      // 检查素材来源
      if (!standards.requiredSource.includes(material.source)) {
        warnings.push(`素材[${item.keyword}]来源异常: ${material.source}`);
        score -= 5;
      }

      // 检查素材文件
      if (!material.path) {
        violations.push(`素材[${item.keyword}]缺少文件路径`);
        score -= 20;
      }

      // 累计分数（假设每个素材都有验证分数）
      if (material.validationScore !== undefined) {
        totalScore += material.validationScore;
        validMaterials++;
      }
    }

    // 计算平均准确性
    const avgAccuracy = validMaterials > 0 ? totalScore / validMaterials : 0;

    if (avgAccuracy < standards.minScore) {
      violations.push(`素材平均准确性不足（${avgAccuracy.toFixed(2)}分，需要至少${standards.minScore}分）`);
      score -= 30;
    }

    // 生成建议
    if (avgAccuracy < 80) {
      suggestions.push('优化素材生成提示词，提高准确性');
      suggestions.push('增加素材验证步骤');
    }

    const passed = score >= 90;

    this.logger.info(`  ${passed ? '✅' : '❌'} 素材准确性检查: ${score}分`);
    this.logger.info(`    平均准确性: ${avgAccuracy.toFixed(2)}分`);

    return {
      passed: passed,
      score: score,
      avgAccuracy: avgAccuracy,
      violations: violations,
      warnings: warnings,
      suggestions: suggestions
    };
  }

  /**
   * 检查视觉质量
   * @param {Object} result - 视觉设计结果
   * @returns {Promise<Object>} 检查结果
   */
  async checkVisualQuality(result) {
    this.logger.info('🔍 QualityDirector: 检查视觉质量');

    const violations = [];
    const warnings = [];
    const suggestions = [];
    let score = 100;

    const cards = result.cards || [];
    const backgrounds = result.backgrounds || [];
    const standards = this.standards.visualQuality;

    // 检查卡片数量
    if (cards.length < standards.minCardCount) {
      violations.push(`卡片数量不足（${cards.length}个，需要至少${standards.minCardCount}个）`);
      score -= 20;
    }

    // 检查卡片样式多样性
    const usedStyles = new Set(cards.map(c => c.style));
    if (usedStyles.size < 2 && cards.length > 3) {
      warnings.push('卡片样式单一，建议增加多样性');
      score -= 10;
    }

    // 检查背景
    if (backgrounds.length === 0) {
      warnings.push('缺少背景，多层场景可能效果不佳');
      score -= 5;
    }

    // 生成建议
    if (usedStyles.size < 2) {
      suggestions.push('使用多种卡片样式，提高视觉吸引力');
    }

    const passed = score >= 90;

    this.logger.info(`  ${passed ? '✅' : '❌'} 视觉质量检查: ${score}分`);

    return {
      passed: passed,
      score: score,
      violations: violations,
      warnings: warnings,
      suggestions: suggestions
    };
  }

  /**
   * 最终检查
   * @param {Object} result - 视频合成结果
   * @returns {Promise<Object>} 检查结果
   */
  async finalCheck(result) {
    this.logger.info('🔍 QualityDirector: 最终检查');

    const violations = [];
    const warnings = [];
    const suggestions = [];
    let score = 100;

    const finalVideo = result.finalVideo;
    const performance = result.performance;
    const standards = this.standards.videoQuality;

    // 检查视频文件
    if (!finalVideo) {
      violations.push('缺少最终视频文件');
      score -= 50;
      return {
        passed: false,
        score: score,
        violations: violations,
        warnings: warnings,
        suggestions: suggestions
      };
    }

    // 检查文件格式
    if (!finalVideo.endsWith('.mp4')) {
      warnings.push('视频格式不是MP4');
      score -= 5;
    }

    // 检查文件大小
    if (performance.fileSize > standards.maxFileSize) {
      warnings.push(`文件过大（${(performance.fileSize / 1024 / 1024).toFixed(2)}MB，建议不超过${standards.maxFileSize / 1024 / 1024}MB）`);
      score -= 10;
    }

    // 检查处理时间
    if (performance.duration > 120000) {  // 2分钟
      warnings.push(`处理时间过长（${(performance.duration / 1000).toFixed(2)}秒）`);
      score -= 5;
    }

    // 生成建议
    if (performance.fileSize > standards.maxFileSize) {
      suggestions.push('增加视频压缩，减小文件大小');
    }
    if (performance.duration > 120000) {
      suggestions.push('优化处理流程，提高处理速度');
    }

    const passed = score >= 90;

    this.logger.info(`  ${passed ? '✅' : '❌'} 最终检查: ${score}分`);

    return {
      passed: passed,
      score: score,
      violations: violations,
      warnings: warnings,
      suggestions: suggestions
    };
  }

  /**
   * 最终验收
   * @param {Object} result - 完整结果
   * @returns {Promise<Object>} 验收结果
   */
  async finalReview(result) {
    this.logger.info('🎯 QualityDirector: 最终验收');

    const allViolations = [];
    const allWarnings = [];
    const allSuggestions = [];
    let totalScore = 0;
    let checkCount = 0;

    // 汇总所有检查结果
    if (result.qualityChecks) {
      for (const [checkName, checkResult] of Object.entries(result.qualityChecks)) {
        if (checkResult.violations) {
          allViolations.push(...checkResult.violations);
        }
        if (checkResult.warnings) {
          allWarnings.push(...checkResult.warnings);
        }
        if (checkResult.suggestions) {
          allSuggestions.push(...checkResult.suggestions);
        }
        if (checkResult.score !== undefined) {
          totalScore += checkResult.score;
          checkCount++;
        }
      }
    }

    const avgScore = checkCount > 0 ? totalScore / checkCount : 0;
    const passed = allViolations.length === 0 && avgScore >= 90;

    this.logger.info(`  ${passed ? '✅' : '❌'} 最终验收: ${avgScore.toFixed(2)}分`);
    this.logger.info(`    违规项: ${allViolations.length}个`);
    this.logger.info(`    警告项: ${allWarnings.length}个`);
    this.logger.info(`    建议项: ${allSuggestions.length}个`);

    return {
      passed: passed,
      score: avgScore,
      violations: allViolations,
      warnings: allWarnings,
      suggestions: allSuggestions
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
      ready: true,
      standards: this.standards
    };
  }
}

export default QualityDirector;
