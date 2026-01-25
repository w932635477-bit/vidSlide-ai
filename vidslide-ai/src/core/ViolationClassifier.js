/**
 * ViolationClassifier - 违规项分类器
 *
 * 功能：
 * 1. 将字符串violations转换为结构化对象
 * 2. 识别违规类型和严重程度
 * 3. 确定需要返工的阶段
 * 4. 支持级联处理
 */
class ViolationClassifier {
  static CATEGORIES = {
    CONTENT_ANALYSIS: {
      keywords: ['关键词', '观点', '解释', '内容理解'],
      phases: ['phase1'],
      cascading: true,
      severity: 'HIGH',
      maxRetries: 2
    },
    SCENE_DESIGN: {
      keywords: ['原视频占比', '时间轴', '场景连续'],
      phases: ['phase2'],
      cascading: true,
      severity: 'HIGH',
      maxRetries: 2
    },
    VISUAL_CONTENT: {
      keywords: ['卡片内容错误', '关键词', '文字识别'],
      phases: ['phase3', 'phase5'],
      cascading: false,
      severity: 'CRITICAL',
      maxRetries: 3
    },
    VISUAL_POSITION: {
      keywords: ['卡片位置', 'y坐标', '安全区域'],
      phases: ['phase5'],
      cascading: false,
      severity: 'MEDIUM',
      maxRetries: 1
    },
    VISUAL_STYLE: {
      keywords: ['卡片尺寸', '样式', '边框', '颜色'],
      phases: ['phase5'],
      cascading: false,
      severity: 'LOW',
      maxRetries: 2
    }
  };

  /**
   * 分类违规项
   * @param {string} violation - 违规描述
   * @returns {Object} 结构化违规对象
   */
  static classify(violation) {
    for (const [category, config] of Object.entries(this.CATEGORIES)) {
      for (const keyword of config.keywords) {
        if (violation.includes(keyword)) {
          return {
            category: category,
            originalMessage: violation,
            phases: config.phases,
            cascading: config.cascading,
            severity: config.severity,
            maxRetries: config.maxRetries,
            sceneId: this.extractSceneId(violation),
            timestamp: Date.now()
          };
        }
      }
    }

    // 未知类别
    return {
      category: 'UNKNOWN',
      originalMessage: violation,
      phases: [],
      cascading: false,
      severity: 'LOW',
      maxRetries: 0,
      timestamp: Date.now()
    };
  }

  /**
   * 提取场景ID
   * @param {string} violation - 违规描述
   * @returns {string|null} 场景ID
   */
  static extractSceneId(violation) {
    const match = violation.match(/场景(\w+)/);
    return match ? match[1] : null;
  }

  /**
   * 批量分类
   * @param {Array<string>} violations - 违规项列表
   * @returns {Array<Object>} 结构化违规对象列表
   */
  static classifyAll(violations) {
    return violations.map(v => this.classify(v));
  }

  /**
   * 按严重性分组
   * @param {Array<Object>} violations - 结构化违规对象列表
   * @returns {Object} 按严重性分组的违规项
   */
  static groupBySeverity(violations) {
    const groups = {
      CRITICAL: [],
      HIGH: [],
      MEDIUM: [],
      LOW: [],
      UNKNOWN: []
    };

    violations.forEach(v => {
      groups[v.severity].push(v);
    });

    return groups;
  }

  /**
   * 获取需要返工的阶段
   * @param {Array<Object>} violations - 结构化违规对象列表
   * @returns {Set<string>} 阶段集合
   */
  static getPhasesToRework(violations) {
    const phases = new Set();

    violations.forEach(v => {
      // 添加直接受影响的阶段
      v.phases.forEach(phase => phases.add(phase));

      // 如果需要级联，添加后续所有阶段
      if (v.cascading) {
        const phaseNum = parseInt(v.phases[0].replace('phase', ''));
        for (let i = phaseNum + 1; i <= 5; i++) {
          phases.add(`phase${i}`);
        }
      }
    });

    return phases;
  }
}

export default ViolationClassifier;
