/**
 * ErrorHandler - 错误处理器（Node.js版本）
 *
 * 职责：
 * 1. 错误分类（critical、recoverable、warning）
 * 2. 重试机制
 * 3. 错误恢复策略
 * 4. 错误报告生成
 */

// 错误类型枚举
export const ERROR_TYPES = {
  NETWORK: 'network',
  API: 'api',
  VALIDATION: 'validation',
  RESOURCE: 'resource',
  SYSTEM: 'system',
  TIMEOUT: 'timeout',
  AGENT: 'agent'
};

// 错误严重程度
export const ERROR_SEVERITY = {
  LOW: 'low',           // 不影响核心功能
  MEDIUM: 'medium',     // 影响部分功能
  HIGH: 'high',         // 影响核心功能
  CRITICAL: 'critical'  // 系统无法继续运行
};

class ErrorHandler {
  constructor(options = {}) {
    this.logger = options.logger || console;
    this.errorHistory = [];
    this.maxHistorySize = options.maxHistorySize || 100;
    this.retryStrategies = new Map();

    // 初始化默认重试策略
    this.initializeRetryStrategies();
  }

  /**
   * 初始化重试策略
   */
  initializeRetryStrategies() {
    // 网络错误：重试3次，指数退避
    this.retryStrategies.set(ERROR_TYPES.NETWORK, {
      maxRetries: 3,
      baseDelay: 1000,
      backoffMultiplier: 2,
      shouldRetry: (error) => true
    });

    // API错误：重试2次
    this.retryStrategies.set(ERROR_TYPES.API, {
      maxRetries: 2,
      baseDelay: 2000,
      backoffMultiplier: 2,
      shouldRetry: (error) => {
        // 只重试5xx错误
        return error.statusCode >= 500;
      }
    });

    // 超时错误：重试3次
    this.retryStrategies.set(ERROR_TYPES.TIMEOUT, {
      maxRetries: 3,
      baseDelay: 3000,
      backoffMultiplier: 1.5,
      shouldRetry: (error) => true
    });

    // 智能体错误：重试1次
    this.retryStrategies.set(ERROR_TYPES.AGENT, {
      maxRetries: 1,
      baseDelay: 1000,
      backoffMultiplier: 1,
      shouldRetry: (error) => {
        // 只重试可恢复的错误
        return error.recoverable === true;
      }
    });
  }

  /**
   * 处理错误
   * @param {Error} error - 错误对象
   * @param {Object} context - 上下文信息
   * @returns {Promise<Object>} 错误信息对象
   */
  async handleError(error, context = {}) {
    // 分析错误
    const errorInfo = this.analyzeError(error, context);

    // 记录错误
    this.logError(errorInfo);

    // 生成恢复建议
    errorInfo.recoverySuggestions = this.generateRecoverySuggestions(errorInfo);

    return errorInfo;
  }

  /**
   * 分析错误
   * @param {Error} error - 错误对象
   * @param {Object} context - 上下文信息
   * @returns {Object} 错误信息
   */
  analyzeError(error, context = {}) {
    const errorMessage = error.message || '未知错误';
    let type = ERROR_TYPES.SYSTEM;
    let severity = ERROR_SEVERITY.MEDIUM;
    let recoverable = false;

    // 网络相关错误
    if (
      errorMessage.includes('fetch') ||
      errorMessage.includes('network') ||
      errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('ETIMEDOUT')
    ) {
      type = ERROR_TYPES.NETWORK;
      severity = ERROR_SEVERITY.HIGH;
      recoverable = true;
    }

    // API相关错误
    else if (
      errorMessage.includes('API') ||
      errorMessage.includes('status code') ||
      error.statusCode
    ) {
      type = ERROR_TYPES.API;
      severity = error.statusCode >= 500 ? ERROR_SEVERITY.HIGH : ERROR_SEVERITY.MEDIUM;
      recoverable = error.statusCode >= 500;
    }

    // 超时错误
    else if (
      errorMessage.includes('timeout') ||
      errorMessage.includes('超时')
    ) {
      type = ERROR_TYPES.TIMEOUT;
      severity = ERROR_SEVERITY.HIGH;
      recoverable = true;
    }

    // 验证错误
    else if (
      errorMessage.includes('validation') ||
      errorMessage.includes('验证') ||
      errorMessage.includes('invalid')
    ) {
      type = ERROR_TYPES.VALIDATION;
      severity = ERROR_SEVERITY.LOW;
      recoverable = false;
    }

    // 资源错误
    else if (
      errorMessage.includes('memory') ||
      errorMessage.includes('storage') ||
      errorMessage.includes('ENOSPC')
    ) {
      type = ERROR_TYPES.RESOURCE;
      severity = ERROR_SEVERITY.CRITICAL;
      recoverable = false;
    }

    // 智能体错误
    else if (
      errorMessage.includes('agent') ||
      errorMessage.includes('智能体') ||
      context.agent
    ) {
      type = ERROR_TYPES.AGENT;
      severity = ERROR_SEVERITY.HIGH;
      recoverable = error.recoverable !== false;
    }

    return {
      type,
      severity,
      recoverable,
      originalError: error,
      message: errorMessage,
      stack: error.stack,
      context: context,
      timestamp: Date.now(),
      statusCode: error.statusCode,
      agent: context.agent,
      phase: context.phase,
      task: context.task
    };
  }

  /**
   * 生成恢复建议
   * @param {Object} errorInfo - 错误信息
   * @returns {Array} 恢复建议列表
   */
  generateRecoverySuggestions(errorInfo) {
    const suggestions = [];

    switch (errorInfo.type) {
      case ERROR_TYPES.NETWORK:
        suggestions.push(
          '检查网络连接是否正常',
          '检查API服务是否可用',
          '尝试使用代理或VPN',
          '增加超时时间'
        );
        break;

      case ERROR_TYPES.API:
        if (errorInfo.statusCode >= 500) {
          suggestions.push(
            'API服务暂时不可用，稍后重试',
            '检查API服务状态',
            '联系API服务提供商'
          );
        } else if (errorInfo.statusCode === 429) {
          suggestions.push(
            'API调用频率过高，降低调用频率',
            '增加请求间隔',
            '使用API密钥池'
          );
        } else if (errorInfo.statusCode >= 400) {
          suggestions.push(
            '检查API请求参数是否正确',
            '检查API密钥是否有效',
            '查看API文档'
          );
        }
        break;

      case ERROR_TYPES.TIMEOUT:
        suggestions.push(
          '增加超时时间',
          '优化请求参数',
          '分批处理数据',
          '检查网络速度'
        );
        break;

      case ERROR_TYPES.VALIDATION:
        suggestions.push(
          '检查输入数据格式',
          '查看验证规则',
          '修正输入数据'
        );
        break;

      case ERROR_TYPES.RESOURCE:
        suggestions.push(
          '清理临时文件',
          '增加系统资源',
          '优化资源使用',
          '分批处理数据'
        );
        break;

      case ERROR_TYPES.AGENT:
        suggestions.push(
          '检查智能体配置',
          '查看智能体日志',
          '重启智能体',
          '使用降级策略'
        );
        break;

      default:
        suggestions.push(
          '查看详细错误日志',
          '重启应用',
          '联系技术支持'
        );
    }

    return suggestions;
  }

  /**
   * 重试操作
   * @param {Function} operation - 要执行的操作
   * @param {Object} options - 重试选项
   * @returns {Promise<any>}
   */
  async retry(operation, options = {}) {
    const {
      maxRetries = 3,
      baseDelay = 1000,
      backoffMultiplier = 2,
      shouldRetry = () => true,
      onRetry = null,
      context = {}
    } = options;

    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        // 分析错误
        const errorInfo = await this.handleError(error, context);

        // 检查是否应该重试
        if (attempt >= maxRetries || !shouldRetry(errorInfo)) {
          throw error;
        }

        // 计算延迟时间
        const delay = baseDelay * Math.pow(backoffMultiplier, attempt);

        // 记录重试
        this.logger.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`, {
          error: error.message,
          context: context
        });

        // 执行重试回调
        if (onRetry) {
          await onRetry(attempt + 1, maxRetries, errorInfo, delay);
        }

        // 等待后重试
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * 使用错误类型的默认重试策略
   * @param {Function} operation - 要执行的操作
   * @param {string} errorType - 错误类型
   * @param {Object} context - 上下文
   * @returns {Promise<any>}
   */
  async retryWithStrategy(operation, errorType, context = {}) {
    const strategy = this.retryStrategies.get(errorType);

    if (!strategy) {
      // 没有策略，直接执行
      return await operation();
    }

    return await this.retry(operation, {
      maxRetries: strategy.maxRetries,
      baseDelay: strategy.baseDelay,
      backoffMultiplier: strategy.backoffMultiplier,
      shouldRetry: (errorInfo) => strategy.shouldRetry(errorInfo.originalError),
      context: context
    });
  }

  /**
   * 生成错误报告
   * @param {Error} error - 错误对象
   * @param {Object} context - 上下文
   * @returns {Object} 错误报告
   */
  generateErrorReport(error, context = {}) {
    const errorInfo = this.analyzeError(error, context);

    return {
      summary: {
        type: errorInfo.type,
        severity: errorInfo.severity,
        recoverable: errorInfo.recoverable,
        message: errorInfo.message
      },
      details: {
        stack: errorInfo.stack,
        context: errorInfo.context,
        timestamp: new Date(errorInfo.timestamp).toISOString()
      },
      recovery: {
        suggestions: errorInfo.recoverySuggestions || this.generateRecoverySuggestions(errorInfo),
        retryStrategy: this.retryStrategies.get(errorInfo.type)
      },
      history: this.getRecentErrors(5)
    };
  }

  /**
   * 记录错误
   * @param {Object} errorInfo - 错误信息
   */
  logError(errorInfo) {
    // 添加到历史记录
    this.errorHistory.unshift(errorInfo);

    // 限制历史记录大小
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(0, this.maxHistorySize);
    }

    // 根据严重程度记录日志
    const logData = {
      type: errorInfo.type,
      severity: errorInfo.severity,
      message: errorInfo.message,
      context: errorInfo.context
    };

    switch (errorInfo.severity) {
      case ERROR_SEVERITY.CRITICAL:
        this.logger.error('CRITICAL ERROR:', logData);
        break;
      case ERROR_SEVERITY.HIGH:
        this.logger.error('HIGH SEVERITY ERROR:', logData);
        break;
      case ERROR_SEVERITY.MEDIUM:
        this.logger.warn('MEDIUM SEVERITY ERROR:', logData);
        break;
      case ERROR_SEVERITY.LOW:
        this.logger.info('LOW SEVERITY ERROR:', logData);
        break;
    }
  }

  /**
   * 获取最近的错误
   * @param {number} limit - 数量限制
   * @returns {Array}
   */
  getRecentErrors(limit = 10) {
    return this.errorHistory.slice(0, limit);
  }

  /**
   * 获取错误统计
   * @returns {Object}
   */
  getErrorStats() {
    const stats = {
      total: this.errorHistory.length,
      byType: {},
      bySeverity: {},
      recoverable: 0,
      nonRecoverable: 0
    };

    for (const error of this.errorHistory) {
      // 按类型统计
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;

      // 按严重程度统计
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;

      // 可恢复性统计
      if (error.recoverable) {
        stats.recoverable++;
      } else {
        stats.nonRecoverable++;
      }
    }

    return stats;
  }

  /**
   * 清空错误历史
   */
  clearHistory() {
    this.errorHistory = [];
  }

  /**
   * 休眠
   * @param {number} ms - 毫秒数
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default ErrorHandler;
