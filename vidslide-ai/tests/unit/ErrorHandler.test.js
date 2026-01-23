import { describe, it, expect, beforeEach, vi } from 'vitest';
import ErrorHandler from '../../src/core/ErrorHandler.js';

describe('ErrorHandler', () => {
  let errorHandler;
  let mockLogger;

  beforeEach(() => {
    mockLogger = {
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn()
    };

    errorHandler = new ErrorHandler({
      logger: mockLogger,
      maxRetries: 3,
      retryDelay: 100
    });
  });

  describe('错误处理', () => {
    it('应该能处理错误', () => {
      const error = new Error('测试错误');
      const context = { task: 'test' };

      const errorInfo = errorHandler.handle(error, context);

      expect(errorInfo.message).toBe('测试错误');
      expect(errorInfo.context).toEqual(context);
      expect(errorInfo.timestamp).toBeDefined();
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('应该能记录错误历史', () => {
      errorHandler.handle(new Error('错误1'));
      errorHandler.handle(new Error('错误2'));
      errorHandler.handle(new Error('错误3'));

      expect(errorHandler.errors.length).toBe(3);
    });

    it('应该能生成错误报告', () => {
      const error = new Error('测试错误');
      const context = { task: 'test', agent: 'TestAgent' };

      const report = errorHandler.generateErrorReport(error, context);

      expect(report.error.message).toBe('测试错误');
      expect(report.context).toEqual(context);
      expect(report.timestamp).toBeDefined();
      expect(report.stats).toBeDefined();
    });
  });

  describe('重试机制', () => {
    it('应该在成功时不重试', async () => {
      let attempts = 0;
      const fn = vi.fn(async () => {
        attempts++;
        return 'success';
      });

      const result = await errorHandler.retry(fn);

      expect(result).toBe('success');
      expect(attempts).toBe(1);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('应该在失败时重试', async () => {
      let attempts = 0;
      const fn = vi.fn(async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('失败');
        }
        return 'success';
      });

      const result = await errorHandler.retry(fn, { maxRetries: 3 });

      expect(result).toBe('success');
      expect(attempts).toBe(3);
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('应该在所有重试失败后抛出错误', async () => {
      const fn = vi.fn(async () => {
        throw new Error('持续失败');
      });

      await expect(
        errorHandler.retry(fn, { maxRetries: 3 })
      ).rejects.toThrow('持续失败');

      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('应该使用自定义重试次数', async () => {
      const fn = vi.fn(async () => {
        throw new Error('失败');
      });

      await expect(
        errorHandler.retry(fn, { maxRetries: 5 })
      ).rejects.toThrow();

      expect(fn).toHaveBeenCalledTimes(5);
    });

    it('应该在重试之间等待', async () => {
      const fn = vi.fn(async () => {
        throw new Error('失败');
      });

      const startTime = Date.now();

      await expect(
        errorHandler.retry(fn, { maxRetries: 2, retryDelay: 100 })
      ).rejects.toThrow();

      const duration = Date.now() - startTime;

      // 应该至少等待了100ms（1次重试延迟）
      expect(duration).toBeGreaterThanOrEqual(100);
    });
  });

  describe('错误统计', () => {
    it('应该能获取错误统计', () => {
      errorHandler.handle(new Error('错误1'));
      errorHandler.handle(new Error('错误2'));

      const stats = errorHandler.getStats();

      expect(stats.totalErrors).toBe(2);
      expect(stats.recentErrors.length).toBe(2);
    });

    it('应该能按类型分组错误', () => {
      errorHandler.handle(new Error('TypeError: xxx'));
      errorHandler.handle(new Error('TypeError: yyy'));
      errorHandler.handle(new Error('NetworkError: zzz'));

      const stats = errorHandler.getStats();
      const groups = stats.errorTypes;

      expect(groups['TypeError']).toBe(2);
      expect(groups['NetworkError']).toBe(1);
    });

    it('应该只返回最近10个错误', () => {
      for (let i = 0; i < 20; i++) {
        errorHandler.handle(new Error(`错误${i}`));
      }

      const stats = errorHandler.getStats();
      expect(stats.recentErrors.length).toBe(10);
    });

    it('应该能清空错误记录', () => {
      errorHandler.handle(new Error('错误1'));
      errorHandler.handle(new Error('错误2'));
      errorHandler.clear();

      expect(errorHandler.errors.length).toBe(0);
    });
  });
});
