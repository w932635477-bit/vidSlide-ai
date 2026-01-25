/**
 * ImprovedRetryHandler - 改进的重试处理器
 *
 * 功能：
 * 1. 支持多种重试策略（指数退避、线性、固定）
 * 2. 添加Jitter（随机抖动）避免惊群效应
 * 3. 限制最大延迟时间
 * 4. 详细的日志记录
 */
class ImprovedRetryHandler {
  constructor(options = {}) {
    this.logger = options.logger || console;
    this.baseDelay = options.baseDelay || 1000; // 基础延迟1秒
    this.maxDelay = options.maxDelay || 30000; // 最大延迟30秒
    this.jitterFactor = options.jitterFactor || 0.1; // Jitter因子10%
  }

  /**
   * 执行带指数退避的重试
   * @param {Function} fn - 要执行的函数
   * @param {Object} options - 配置选项
   * @param {number} options.maxRetries - 最大重试次数
   * @param {string} options.strategy - 重试策略 (exponential|linear|constant)
   * @param {Object} options.context - 上下文信息（用于日志）
   * @returns {Promise<any>} 函数执行结果
   */
  async retryWithBackoff(fn, options = {}) {
    const maxRetries = options.maxRetries || 3;
    const strategy = options.strategy || 'exponential';
    const context = options.context || {};

    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 1) {
          this.logger.info(`  🔄 重试 ${attempt}/${maxRetries} ${context.task ? `[${context.task}]` : ''}...`);
        }

        const result = await fn();

        if (attempt > 1) {
          this.logger.info(`  ✅ 重试成功（第${attempt}次尝试）`);
        }

        return result;

      } catch (error) {
        lastError = error;

        if (attempt === 1) {
          this.logger.warn(`  ⚠️ 任务失败 ${context.task ? `[${context.task}]` : ''}: ${error.message}`);
        } else {
          this.logger.warn(`  ❌ 重试 ${attempt}/${maxRetries} 失败: ${error.message}`);
        }

        if (attempt < maxRetries) {
          const delay = this.calculateDelay(attempt, strategy);
          this.logger.info(`  → 等待 ${delay}ms 后重试...`);
          await this.sleep(delay);
        }
      }
    }

    // 所有重试都失败
    this.logger.error(`  ❌ 重试${maxRetries}次后仍然失败`);
    throw lastError;
  }

  /**
   * 计算延迟时间
   * @param {number} attempt - 当前尝试次数
   * @param {string} strategy - 重试策略
   * @returns {number} 延迟时间（毫秒）
   */
  calculateDelay(attempt, strategy) {
    let delay;

    switch (strategy) {
      case 'exponential':
        // 指数退避: 1s, 2s, 4s, 8s, 16s...
        delay = this.baseDelay * Math.pow(2, attempt - 1);
        break;

      case 'linear':
        // 线性增长: 1s, 2s, 3s, 4s, 5s...
        delay = this.baseDelay * attempt;
        break;

      case 'constant':
      default:
        // 固定延迟: 1s, 1s, 1s...
        delay = this.baseDelay;
        break;
    }

    // 限制最大延迟
    delay = Math.min(delay, this.maxDelay);

    // 添加Jitter（随机抖动）
    // 目的：避免多个请求同时重试导致的惊群效应
    const jitter = delay * this.jitterFactor * (Math.random() - 0.5) * 2;
    delay = Math.max(0, delay + jitter);

    return Math.round(delay);
  }

  /**
   * 睡眠函数
   * @param {number} ms - 毫秒数
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取重试策略说明
   * @param {string} strategy - 策略名称
   * @returns {string} 策略说明
   */
  getStrategyDescription(strategy) {
    const descriptions = {
      exponential: '指数退避 (1s → 2s → 4s → 8s...)',
      linear: '线性增长 (1s → 2s → 3s → 4s...)',
      constant: '固定延迟 (1s → 1s → 1s...)'
    };

    return descriptions[strategy] || descriptions.constant;
  }
}

export default ImprovedRetryHandler;
