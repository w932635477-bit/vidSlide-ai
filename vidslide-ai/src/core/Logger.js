import fs from 'fs';
import path from 'path';

/**
 * Logger - 日志记录器
 *
 * 职责：
 * 1. 记录执行日志
 * 2. 生成执行报告
 * 3. 性能监控
 */
class Logger {
  constructor(options = {}) {
    this.logLevel = options.logLevel || 'info';
    this.logFile = options.logFile || null;
    this.logs = [];
    this.startTime = Date.now();
    this.phases = [];
    this.currentPhase = null;
  }

  /**
   * 记录信息
   * @param {string} message - 消息
   * @param {Object} data - 附加数据
   */
  info(message, data = {}) {
    this.log('info', message, data);
  }

  /**
   * 记录警告
   * @param {string} message - 消息
   * @param {Object} data - 附加数据
   */
  warn(message, data = {}) {
    this.log('warn', message, data);
  }

  /**
   * 记录错误
   * @param {string} message - 消息
   * @param {Object} data - 附加数据
   */
  error(message, data = {}) {
    this.log('error', message, data);
  }

  /**
   * 记录调试信息
   * @param {string} message - 消息
   * @param {Object} data - 附加数据
   */
  debug(message, data = {}) {
    if (this.logLevel === 'debug') {
      this.log('debug', message, data);
    }
  }

  /**
   * 内部日志方法
   * @param {string} level - 日志级别
   * @param {string} message - 消息
   * @param {Object} data - 附加数据
   */
  log(level, message, data = {}) {
    const logEntry = {
      level: level,
      message: message,
      data: data,
      timestamp: Date.now(),
      phase: this.currentPhase
    };

    this.logs.push(logEntry);

    // 控制台输出
    const prefix = this.getPrefix(level);
    console.log(`${prefix} ${message}`);

    if (Object.keys(data).length > 0) {
      console.log('  ', data);
    }

    // 文件输出
    if (this.logFile) {
      this.writeToFile(logEntry);
    }
  }

  /**
   * 获取日志前缀
   * @param {string} level - 日志级别
   * @returns {string}
   */
  getPrefix(level) {
    const prefixes = {
      info: '[INFO]',
      warn: '[WARN]',
      error: '[ERROR]',
      debug: '[DEBUG]'
    };
    return prefixes[level] || '[LOG]';
  }

  /**
   * 写入文件
   * @param {Object} logEntry - 日志条目
   */
  writeToFile(logEntry) {
    try {
      const line = JSON.stringify(logEntry) + '\n';
      fs.appendFileSync(this.logFile, line);
    } catch (error) {
      console.error('写入日志文件失败:', error.message);
    }
  }

  /**
   * 开始阶段
   * @param {string} phaseName - 阶段名称
   */
  startPhase(phaseName) {
    this.currentPhase = phaseName;
    const phase = {
      name: phaseName,
      startTime: Date.now(),
      endTime: null,
      status: 'running',
      tasks: []
    };
    this.phases.push(phase);
    this.info(`📍 开始阶段: ${phaseName}`);
  }

  /**
   * 结束阶段
   * @param {string} status - 状态
   * @param {Object} result - 结果
   */
  endPhase(status, result = {}) {
    const phase = this.phases[this.phases.length - 1];
    if (phase) {
      phase.endTime = Date.now();
      phase.status = status;
      phase.result = result;
      phase.duration = phase.endTime - phase.startTime;

      this.info(`✅ 阶段完成: ${phase.name} (${(phase.duration / 1000).toFixed(2)}秒)`);
    }
    this.currentPhase = null;
  }

  /**
   * 记录任务
   * @param {string} taskName - 任务名称
   * @param {Object} data - 任务数据
   */
  logTask(taskName, data = {}) {
    const phase = this.phases[this.phases.length - 1];
    if (phase) {
      phase.tasks.push({
        name: taskName,
        timestamp: Date.now(),
        data: data
      });
    }
    this.info(`  → 执行任务: ${taskName}`);
  }

  /**
   * 记录计划
   * @param {Object} plan - 执行计划
   */
  logPlan(plan) {
    this.info('📋 执行计划:');
    this.info(`  - 计划ID: ${plan.id}`);
    this.info(`  - 视频时长: ${plan.videoDuration.toFixed(2)}秒`);

    for (let i = 1; i <= 5; i++) {
      const phase = plan[`phase${i}`];
      if (phase) {
        this.info(`  - 阶段${i}: ${phase.name} (${phase.tasks.length}个任务)`);
      }
    }
  }

  /**
   * 生成报告
   * @returns {Object}
   */
  generateReport() {
    const totalDuration = Date.now() - this.startTime;

    return {
      summary: {
        totalDuration: totalDuration,
        totalPhases: this.phases.length,
        totalLogs: this.logs.length,
        startTime: this.startTime,
        endTime: Date.now()
      },
      phases: this.phases.map(phase => ({
        name: phase.name,
        duration: phase.duration,
        status: phase.status,
        taskCount: phase.tasks.length
      })),
      logs: this.logs,
      performance: this.calculatePerformance()
    };
  }

  /**
   * 计算性能指标
   * @returns {Object}
   */
  calculatePerformance() {
    const totalDuration = Date.now() - this.startTime;
    const errorCount = this.logs.filter(log => log.level === 'error').length;
    const warnCount = this.logs.filter(log => log.level === 'warn').length;

    return {
      totalDuration: totalDuration,
      avgPhaseTime: this.phases.length > 0
        ? this.phases.reduce((sum, p) => sum + (p.duration || 0), 0) / this.phases.length
        : 0,
      errorCount: errorCount,
      warnCount: warnCount,
      successRate: this.phases.length > 0
        ? (this.phases.filter(p => p.status === 'success').length / this.phases.length) * 100
        : 0
    };
  }

  /**
   * 导出日志
   * @param {string} filepath - 文件路径
   */
  exportLogs(filepath) {
    const report = this.generateReport();
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    this.info(`日志已导出到: ${filepath}`);
  }
}

export default Logger;
