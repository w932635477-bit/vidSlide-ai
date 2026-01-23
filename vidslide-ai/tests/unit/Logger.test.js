import { describe, it, expect, beforeEach } from 'vitest';
import Logger from '../../src/core/Logger.js';
import fs from 'fs';
import path from 'path';

describe('Logger', () => {
  let logger;
  const testLogFile = path.join(process.cwd(), 'test-logs.json');

  beforeEach(() => {
    // 清理之前的日志文件
    if (fs.existsSync(testLogFile)) {
      fs.unlinkSync(testLogFile);
    }

    logger = new Logger({
      logLevel: 'debug',
      logFile: testLogFile
    });
  });

  describe('基础日志功能', () => {
    it('应该能记录info日志', () => {
      logger.info('测试信息');
      expect(logger.logs.length).toBe(1);
      expect(logger.logs[0].level).toBe('info');
      expect(logger.logs[0].message).toBe('测试信息');
    });

    it('应该能记录warn日志', () => {
      logger.warn('测试警告');
      expect(logger.logs.length).toBe(1);
      expect(logger.logs[0].level).toBe('warn');
    });

    it('应该能记录error日志', () => {
      logger.error('测试错误');
      expect(logger.logs.length).toBe(1);
      expect(logger.logs[0].level).toBe('error');
    });

    it('应该能记录debug日志', () => {
      logger.debug('测试调试');
      expect(logger.logs.length).toBe(1);
      expect(logger.logs[0].level).toBe('debug');
    });

    it('应该能记录附加数据', () => {
      logger.info('测试', { key: 'value' });
      expect(logger.logs[0].data).toEqual({ key: 'value' });
    });
  });

  describe('阶段管理', () => {
    it('应该能开始阶段', () => {
      logger.startPhase('测试阶段');
      expect(logger.phases.length).toBe(1);
      expect(logger.phases[0].name).toBe('测试阶段');
      expect(logger.phases[0].status).toBe('running');
      expect(logger.currentPhase).toBe('测试阶段');
    });

    it('应该能结束阶段', () => {
      logger.startPhase('测试阶段');
      logger.endPhase('success', { result: 'ok' });

      expect(logger.phases[0].status).toBe('success');
      expect(logger.phases[0].result).toEqual({ result: 'ok' });
      expect(logger.phases[0].duration).toBeGreaterThanOrEqual(0);
      expect(logger.currentPhase).toBeNull();
    });

    it('应该能记录任务', () => {
      logger.startPhase('测试阶段');
      logger.logTask('测试任务', { taskId: '123' });

      expect(logger.phases[0].tasks.length).toBe(1);
      expect(logger.phases[0].tasks[0].name).toBe('测试任务');
    });
  });

  describe('报告生成', () => {
    it('应该能生成报告', () => {
      logger.info('测试1');
      logger.warn('测试2');
      logger.startPhase('阶段1');
      logger.endPhase('success');

      const report = logger.generateReport();

      expect(report.summary).toBeDefined();
      expect(report.summary.totalLogs).toBe(4); // info + warn + startPhase + endPhase
      expect(report.summary.totalPhases).toBe(1);
      expect(report.phases.length).toBe(1);
      expect(report.performance).toBeDefined();
    });

    it('应该能计算性能指标', () => {
      logger.startPhase('阶段1');
      logger.endPhase('success');
      logger.startPhase('阶段2');
      logger.endPhase('success');

      const report = logger.generateReport();
      const perf = report.performance;

      expect(perf.totalDuration).toBeGreaterThanOrEqual(0);
      expect(perf.avgPhaseTime).toBeGreaterThanOrEqual(0);
      expect(perf.successRate).toBe(100);
      expect(perf.errorCount).toBe(0);
    });
  });

  describe('文件输出', () => {
    it('应该能写入日志文件', () => {
      logger.info('测试日志');

      // 等待文件写入
      setTimeout(() => {
        expect(fs.existsSync(testLogFile)).toBe(true);

        const content = fs.readFileSync(testLogFile, 'utf-8');
        const lines = content.trim().split('\n');
        expect(lines.length).toBeGreaterThan(0);

        const log = JSON.parse(lines[0]);
        expect(log.message).toBe('测试日志');
      }, 100);
    });

    it('应该能导出日志', () => {
      logger.info('测试1');
      logger.info('测试2');

      const exportPath = path.join(process.cwd(), 'test-export.json');
      logger.exportLogs(exportPath);

      expect(fs.existsSync(exportPath)).toBe(true);

      const content = JSON.parse(fs.readFileSync(exportPath, 'utf-8'));
      expect(content.logs.length).toBeGreaterThan(0);

      // 清理
      fs.unlinkSync(exportPath);
    });
  });
});
