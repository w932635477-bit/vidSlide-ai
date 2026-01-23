import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import CacheManager from '../../src/core/CacheManager.js';
import fs from 'fs';
import path from 'path';

describe('CacheManager', () => {
  let cacheManager;
  const testCacheDir = path.join(process.cwd(), '.test-cache');

  beforeEach(() => {
    // 清理测试缓存目录
    if (fs.existsSync(testCacheDir)) {
      const files = fs.readdirSync(testCacheDir);
      for (const file of files) {
        fs.unlinkSync(path.join(testCacheDir, file));
      }
      fs.rmdirSync(testCacheDir);
    }

    cacheManager = new CacheManager({
      cacheDir: testCacheDir,
      maxAge: 1000,  // 1秒过期（用于测试）
      maxSize: 1024 * 1024  // 1MB
    });
  });

  afterEach(() => {
    // 清理测试缓存目录
    if (fs.existsSync(testCacheDir)) {
      const files = fs.readdirSync(testCacheDir);
      for (const file of files) {
        fs.unlinkSync(path.join(testCacheDir, file));
      }
      fs.rmdirSync(testCacheDir);
    }
  });

  describe('缓存键生成', () => {
    it('应该能生成缓存键', () => {
      const key = cacheManager.generateKey('test prompt');
      expect(key).toBeDefined();
      expect(typeof key).toBe('string');
      expect(key.length).toBe(32);  // MD5长度
    });

    it('相同输入应该生成相同的键', () => {
      const key1 = cacheManager.generateKey('test');
      const key2 = cacheManager.generateKey('test');
      expect(key1).toBe(key2);
    });

    it('不同输入应该生成不同的键', () => {
      const key1 = cacheManager.generateKey('test1');
      const key2 = cacheManager.generateKey('test2');
      expect(key1).not.toBe(key2);
    });

    it('应该考虑选项参数', () => {
      const key1 = cacheManager.generateKey('test', { width: 100 });
      const key2 = cacheManager.generateKey('test', { width: 200 });
      expect(key1).not.toBe(key2);
    });
  });

  describe('缓存操作', () => {
    it('应该能设置缓存', () => {
      const key = 'test-key';
      const value = { data: 'test' };

      cacheManager.set(key, value);

      const cached = cacheManager.get(key);
      expect(cached).toEqual(value);
    });

    it('应该能获取不存在的缓存', () => {
      const cached = cacheManager.get('non-existent');
      expect(cached).toBeNull();
    });

    it('应该能删除缓存', () => {
      const key = 'test-key';
      cacheManager.set(key, 'value');
      cacheManager.delete(key);

      const cached = cacheManager.get(key);
      expect(cached).toBeNull();
    });

    it('应该能清空所有缓存', () => {
      cacheManager.set('key1', 'value1');
      cacheManager.set('key2', 'value2');
      cacheManager.clear();

      expect(cacheManager.get('key1')).toBeNull();
      expect(cacheManager.get('key2')).toBeNull();
    });
  });

  describe('缓存过期', () => {
    it('应该在过期后返回null', async () => {
      const key = 'test-key';
      cacheManager.set(key, 'value');

      // 等待缓存过期
      await new Promise(resolve => setTimeout(resolve, 1100));

      const cached = cacheManager.get(key);
      expect(cached).toBeNull();
    });

    it('应该在过期前返回值', async () => {
      const key = 'test-key';
      cacheManager.set(key, 'value');

      // 在过期前获取
      await new Promise(resolve => setTimeout(resolve, 500));

      const cached = cacheManager.get(key);
      expect(cached).toBe('value');
    });
  });

  describe('缓存统计', () => {
    it('应该能获取缓存统计', () => {
      cacheManager.set('key1', 'value1');
      cacheManager.set('key2', 'value2');

      const stats = cacheManager.getStats();

      expect(stats.count).toBe(2);
      expect(stats.size).toBeGreaterThan(0);
      expect(stats.sizeInMB).toBeDefined();
    });

    it('空缓存应该返回零统计', () => {
      const stats = cacheManager.getStats();

      expect(stats.count).toBe(0);
      expect(stats.size).toBe(0);
    });
  });

  describe('缓存清理', () => {
    it('应该能清理过期缓存', async () => {
      cacheManager.set('key1', 'value1');
      cacheManager.set('key2', 'value2');

      // 等待缓存过期
      await new Promise(resolve => setTimeout(resolve, 1100));

      cacheManager.cleanup();

      const stats = cacheManager.getStats();
      expect(stats.count).toBe(0);
    });

    it('应该保留未过期的缓存', async () => {
      cacheManager.set('key1', 'value1');

      // 等待一半时间
      await new Promise(resolve => setTimeout(resolve, 500));

      cacheManager.cleanup();

      const stats = cacheManager.getStats();
      expect(stats.count).toBe(1);
    });
  });

  describe('文件持久化', () => {
    it('应该将缓存写入文件', () => {
      const key = 'test-key';
      cacheManager.set(key, 'value');

      const cachePath = path.join(testCacheDir, `${key}.json`);
      expect(fs.existsSync(cachePath)).toBe(true);
    });

    it('应该能从文件读取缓存', () => {
      const key = 'test-key';
      const value = { data: 'test', nested: { a: 1 } };

      cacheManager.set(key, value);

      // 创建新的CacheManager实例
      const newManager = new CacheManager({ cacheDir: testCacheDir });
      const cached = newManager.get(key);

      expect(cached).toEqual(value);
    });
  });
});
