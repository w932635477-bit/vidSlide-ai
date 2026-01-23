import winston from 'winston';
import path from 'path';
import fs from 'fs';

/**
 * Logger - 日志记录器
 *
 * 职责：
 * 1. 使用Winston进行日志管理
 * 2. 支持多级别日志（info、warn、error、debug）
 * 3. 文件输出和控制台输出
 * 4. 结构化日志（JSON格式）
 * 5. 生成执行报告和时间轴
 */
class Logger {
  constructor(options = {}) {
    this.logsDir = options.logsDir || path.join(process.cwd(), 'logs', 'agents');
    this.sessionId = options.sessionId || this.generateSessionId();
    this.events = [];
    this.phases = [];
    this.currentPhase = null;

    // 确保日志目录存在
    this.ensureLogsDir();

    // 创建Winston logger
    this.logger = winston.createLogger({
      level: options.level || 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: {
        sessionId: this.sessionId
      },
      transports: [
        // 错误日志文件
        new winston.transports.File({
          filename: path.join(this.logsDir, 'error.log'),
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5
        }),
        // 组合日志文件
        new winston.transports.File({
          filename: path.join(this.logsDir, 'combined.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 5
        }),
        // 会话日志文件
        new winston.transports.File({
          filename: path.join(this.logsDir, `session-${this.sessionId}.log`),
          maxsize: 5242880, // 5MB
          maxFiles: 1
        })
      ]
    });

    // 如果不是生产环境，添加控制台输出
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }));
    }
  }

  /**
   * 确保日志目录存在
   */
  ensureLogsDir() {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  /**
   * 生成会话ID
   * @returns {string}
   */
  generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 记录信息日志
   * @param {string} message - 日志消息
   * @param {Object} metadata - 元数据
   */
  info(message, metadata = {}) {
    this.logger.info(message, metadata);
    this.recordEvent('info', message, metadata);
  }

  /**
   * 记录警告日志
   * @param {string} message - 日志消息
   * @param {Object} metadata - 元数据
   */
  warn(message, metadata = {}) {
    this.logger.warn(message, metadata);
    this.recordEvent('warn', message, metadata);
  }

  /**
   * 记录错误日志
   * @param {string} message - 日志消息
   * @param {Object} metadata - 元数据
   */
  error(message, metadata = {}) {
    this.logger.error(message, metadata);
    this.recordEvent('error', message, metadata);
  }

  /**
   * 记录调试日志
   * @param {string} message - 日志消息
   * @param {Object} metadata - 元数据
   */
  debug(message, metadata = {}) {
    this.logger.debug(message, metadata);
    this.recordEvent('debug', message, metadata);
  }

  /**
   * 记录事件
   * @param {string} level - 日志级别
   * @param {string} message - 消息
   * @param {Object} metadata - 元数据
   */
  recordEvent(level, message, metadata) {
    this.events.push({
      level,
      message,
      metadata,
      timestamp: Date.now(),
      phase: this.currentPhase
    });
  }

  /**
   * 开始阶段
   * @param {string} phaseName - 阶段名称
   * @param {Object} metadata - 元数据
   */
  startPhase(phaseName, metadata = {}) {
    this.currentPhase = {
      name: phaseName,
      startTime: Date.now(),
      metadata: metadata,
      tasks: []
    };

    this.info(`Phase started: ${phaseName}`, metadata);
  }

  /**
   * 结束阶段
   * @param {string} status - 状态（success/failed）
   * @param {Object} result - 结果
   */
  endPhase(status = 'success', result = {}) {
    if (!this.currentPhase) {
      this.warn('No active phase to end');
      return;
    }

    this.currentPhase.endTime = Date.now();
    this.currentPhase.duration = this.currentPhase.endTime - this.currentPhase.startTime;
    this.currentPhase.status = status;
    this.currentPhase.result = result;

    this.phases.push(this.currentPhase);
    this.info(`Phase ended: ${this.currentPhase.name}`, {
      duration: this.currentPhase.duration,
      status: status
    });

    this.currentPhase = null;
  }

  /**
   * 记录任务
   * @param {string} taskName - 任务名称
   * @param {Object} metadata - 元数据
   */
  logTask(taskName, metadata = {}) {
    if (this.currentPhase) {
      this.currentPhase.tasks.push({
        name: taskName,
        timestamp: Date.now(),
        metadata: metadata
      });
    }

    this.info(`Task: ${taskName}`, metadata);
  }

  /**
   * 记录执行计划
   * @param {Object} plan - 执行计划
   */
  logPlan(plan) {
    this.info('Execution plan created', {
      planId: plan.id,
      phases: Object.keys(plan).filter(k => k.startsWith('phase')).length,
      videoPath: plan.videoPath
    });

    // 保存计划到文件
    const planPath = path.join(this.logsDir, `plan-${this.sessionId}.json`);
    fs.writeFileSync(planPath, JSON.stringify(plan, null, 2), 'utf-8');
  }

  /**
   * 生成报告
   * @returns {Object}
   */
  generateReport() {
    const totalDuration = this.phases.reduce((sum, phase) => sum + (phase.duration || 0), 0);
    const successfulPhases = this.phases.filter(p => p.status === 'success').length;
    const failedPhases = this.phases.filter(p => p.status === 'failed').length;

    const report = {
      sessionId: this.sessionId,
      startTime: this.phases[0]?.startTime || Date.now(),
      endTime: this.phases[this.phases.length - 1]?.endTime || Date.now(),
      totalDuration: totalDuration,
      phases: this.phases.map(phase => ({
        name: phase.name,
        duration: phase.duration,
        status: phase.status,
        taskCount: phase.tasks.length
      })),
      summary: {
        totalPhases: this.phases.length,
        successfulPhases: successfulPhases,
        failedPhases: failedPhases,
        successRate: this.phases.length > 0
          ? (successfulPhases / this.phases.length * 100).toFixed(2) + '%'
          : '0%'
      },
      events: {
        total: this.events.length,
        info: this.events.filter(e => e.level === 'info').length,
        warn: this.events.filter(e => e.level === 'warn').length,
        error: this.events.filter(e => e.level === 'error').length
      }
    };

    // 保存报告到文件
    const reportPath = path.join(this.logsDir, `report-${this.sessionId}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');

    return report;
  }

  /**
   * 生成时间轴
   * @returns {Array}
   */
  generateTimeline() {
    const timeline = [];

    for (const phase of this.phases) {
      timeline.push({
        type: 'phase',
        name: phase.name,
        startTime: phase.startTime,
        endTime: phase.endTime,
        duration: phase.duration,
        status: phase.status
      });

      for (const task of phase.tasks) {
        timeline.push({
          type: 'task',
          name: task.name,
          timestamp: task.timestamp,
          phase: phase.name
        });
      }
    }

    // 按时间排序
    timeline.sort((a, b) => {
      const timeA = a.startTime || a.timestamp;
      const timeB = b.startTime || b.timestamp;
      return timeA - timeB;
    });

    return timeline;
  }

  /**
   * 获取会话日志
   * @returns {Array}
   */
  getSessionLogs() {
    return this.events;
  }

  /**
   * 获取阶段信息
   * @returns {Array}
   */
  getPhases() {
    return this.phases;
  }

  /**
   * 清理旧日志
   * @param {number} daysToKeep - 保留天数
   */
  cleanOldLogs(daysToKeep = 7) {
    const files = fs.readdirSync(this.logsDir);
    const now = Date.now();
    const maxAge = daysToKeep * 24 * 60 * 60 * 1000;

    for (const file of files) {
      const filePath = path.join(this.logsDir, file);
      const stats = fs.statSync(filePath);

      if (now - stats.mtimeMs > maxAge) {
        fs.unlinkSync(filePath);
        console.log(`Deleted old log file: ${file}`);
      }
    }
  }

  /**
   * 导出日志
   * @param {string} format - 格式（json/text）
   * @returns {string}
   */
  exportLogs(format = 'json') {
    if (format === 'json') {
      return JSON.stringify({
        sessionId: this.sessionId,
        phases: this.phases,
        events: this.events
      }, null, 2);
    } else {
      // 文本格式
      let text = `Session: ${this.sessionId}\n\n`;

      for (const phase of this.phases) {
        text += `Phase: ${phase.name}\n`;
        text += `  Duration: ${phase.duration}ms\n`;
        text += `  Status: ${phase.status}\n`;
        text += `  Tasks: ${phase.tasks.length}\n\n`;
      }

      return text;
    }
  }

  /**
   * 关闭logger
   */
  close() {
    this.logger.close();
  }
}

export default Logger;
