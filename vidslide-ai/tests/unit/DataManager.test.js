import { describe, it, expect, beforeEach } from 'vitest';
import DataManager from '../../src/core/DataManager.js';

describe('DataManager', () => {
  let dataManager;

  beforeEach(() => {
    dataManager = new DataManager();
  });

  describe('基础操作', () => {
    it('应该能存储数据', () => {
      dataManager.set('key1', 'value1');
      expect(dataManager.get('key1')).toBe('value1');
    });

    it('应该能存储不同类型的数据', () => {
      dataManager.set('string', 'hello');
      dataManager.set('number', 123);
      dataManager.set('object', { a: 1 });
      dataManager.set('array', [1, 2, 3]);

      expect(dataManager.get('string')).toBe('hello');
      expect(dataManager.get('number')).toBe(123);
      expect(dataManager.get('object')).toEqual({ a: 1 });
      expect(dataManager.get('array')).toEqual([1, 2, 3]);
    });

    it('应该能检查键是否存在', () => {
      dataManager.set('key1', 'value1');

      expect(dataManager.has('key1')).toBe(true);
      expect(dataManager.has('key2')).toBe(false);
    });

    it('应该能删除数据', () => {
      dataManager.set('key1', 'value1');
      dataManager.delete('key1');

      expect(dataManager.has('key1')).toBe(false);
      expect(dataManager.get('key1')).toBeUndefined();
    });

    it('应该能清空所有数据', () => {
      dataManager.set('key1', 'value1');
      dataManager.set('key2', 'value2');
      dataManager.clear();

      expect(dataManager.keys().length).toBe(0);
    });
  });

  describe('元数据管理', () => {
    it('应该能存储元数据', () => {
      dataManager.set('key1', 'value1', { source: 'test' });

      const meta = dataManager.getMetadata('key1');
      expect(meta.source).toBe('test');
      expect(meta.timestamp).toBeDefined();
      expect(meta.type).toBe('string');
    });

    it('应该自动记录时间戳', () => {
      const before = Date.now();
      dataManager.set('key1', 'value1');
      const after = Date.now();

      const meta = dataManager.getMetadata('key1');
      expect(meta.timestamp).toBeGreaterThanOrEqual(before);
      expect(meta.timestamp).toBeLessThanOrEqual(after);
    });

    it('应该自动记录数据类型', () => {
      dataManager.set('string', 'hello');
      dataManager.set('number', 123);
      dataManager.set('object', {});

      expect(dataManager.getMetadata('string').type).toBe('string');
      expect(dataManager.getMetadata('number').type).toBe('number');
      expect(dataManager.getMetadata('object').type).toBe('object');
    });
  });

  describe('导入导出', () => {
    it('应该能导出所有数据', () => {
      dataManager.set('key1', 'value1', { source: 'test1' });
      dataManager.set('key2', 'value2', { source: 'test2' });

      const exported = dataManager.export();

      expect(exported.key1.value).toBe('value1');
      expect(exported.key1.metadata.source).toBe('test1');
      expect(exported.key2.value).toBe('value2');
      expect(exported.key2.metadata.source).toBe('test2');
    });

    it('应该能导入数据', () => {
      const data = {
        key1: {
          value: 'value1',
          metadata: { source: 'test1', timestamp: Date.now(), type: 'string' }
        },
        key2: {
          value: 'value2',
          metadata: { source: 'test2', timestamp: Date.now(), type: 'string' }
        }
      };

      dataManager.import(data);

      expect(dataManager.get('key1')).toBe('value1');
      expect(dataManager.get('key2')).toBe('value2');
      expect(dataManager.getMetadata('key1').source).toBe('test1');
    });

    it('应该能导出后再导入', () => {
      dataManager.set('key1', 'value1');
      dataManager.set('key2', { a: 1, b: 2 });

      const exported = dataManager.export();

      const newManager = new DataManager();
      newManager.import(exported);

      expect(newManager.get('key1')).toBe('value1');
      expect(newManager.get('key2')).toEqual({ a: 1, b: 2 });
    });
  });

  describe('键管理', () => {
    it('应该能获取所有键', () => {
      dataManager.set('key1', 'value1');
      dataManager.set('key2', 'value2');
      dataManager.set('key3', 'value3');

      const keys = dataManager.keys();
      expect(keys.length).toBe(3);
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
    });

    it('删除键后应该从键列表中移除', () => {
      dataManager.set('key1', 'value1');
      dataManager.set('key2', 'value2');
      dataManager.delete('key1');

      const keys = dataManager.keys();
      expect(keys.length).toBe(1);
      expect(keys).not.toContain('key1');
      expect(keys).toContain('key2');
    });
  });
});
