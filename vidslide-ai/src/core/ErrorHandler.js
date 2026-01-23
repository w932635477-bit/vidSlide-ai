/**
 * ErrorHandler - 错误处理器
 *
 * 职责：
 * 1. 统一错误处理
 * 2. 错误重试机制
 * 3. 错误日志记录
 */
class ErrorHandler {
  constructor(options = {}) {
    this.logger = options.logger || console;
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.errors = [];
  }

  /**
   * 处理错误
   * @param {Error} error - 错误对象
   * @param {Object} context - 上下文信息
   * @returns {Object} 错误信息
   */
  handle(error, context = {}) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      context: context,
      timestamp: Date.now()
    };

    this.errors.push(errorInfo);
    this.logger.error(`错误: ${error.message}`, context);

    return errorInfo;
  }

  /**
   * 重试执行
   * @param {Function} fn - 要执行的函数
   * @param {Object} options - 选项
   * @returns {Promise<any>} 执行结果
   */
  async retry(fn, options = {}) {
    const maxRetries = options.maxRetries || this.maxRetries;
    const retryDelay = options.retryDelay || this.retryDelay;
    const context = options.context || {};

    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.info(`  尝试 ${attempt}/${maxRetries}...`);
        const result = await fn();
        if (attempt > 1) {
          this.logger.info(`  ✓ 重试成功`);
        }
        return result;

      } catch (error) {
        lastError = error;
        this.logger.warn(`  ✗ 尝试 ${attempt} 失败: ${error.message}`);

        if (attempt < maxRetries) {
          this.logger.info(`  → 等待 ${retryDelay}ms 后重试...`);
          await this.sleep(retryDelay);
        }
      }
    }

    // 所有重试都失败
    this.handle(lastError, { ...context, attempts: maxRetries });
    throw lastError;
  }

  /**
   * 睡眠
   * @param {number} ms - 毫秒数
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取错误统计
   * @returns {Object}
   */
  getStats() {
    return {
      totalErrors: this.errors.length,
      recentErrors: this.errors.slice(-10),
      errorTypes: this.groupErrorsByType()
    };
  }

  /**
   * 按类型分组错误
   * @returns {Object}
   */
  groupErrorsByType() {
    const groups = {};
    for (const error of this.errors) {
      const type = error.message.split(':')[0] || 'Unknown';
      groups[type] = (groups[type] || 0) + 1;
    }
    return groups;
  }

  /**
   * 生成错误报告
   * @param {Error} error - 错误对象
   * @param {Object} context - 上下文
   * @returns {Object}
   */
  generateErrorReport(error, context = {}) {
    return {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      context: context,
      timestamp: Date.now(),
      stats: this.getStats()
    };
  }

  /**
   * 清空错误记录
   */
  clear() {
    this.errors = [];
  }
}

export default ErrorHandler;
