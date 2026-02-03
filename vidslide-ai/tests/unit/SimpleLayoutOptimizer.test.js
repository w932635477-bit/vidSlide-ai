/**
 * SimpleLayoutOptimizer 单元测试
 *
 * 测试状态转移矩阵优化器的核心功能
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SimpleLayoutOptimizer } from '../../src/services/SimpleLayoutOptimizer.js';

describe('SimpleLayoutOptimizer', () => {
  let optimizer;
  let mockLog;

  beforeEach(() => {
    mockLog = () => {}; // 静默日志
    optimizer = new SimpleLayoutOptimizer({ log: mockLog });
  });

  describe('calculateSimpleDensity', () => {
    it('应该正确计算内容密度', () => {
      const keywords = [
        { text: '人工智能', startTime: 0, endTime: 2 },
        { text: '机器学习', startTime: 1, endTime: 3 },
        { text: '深度学习', startTime: 2, endTime: 4 }
      ];

      const density = optimizer.calculateSimpleDensity(keywords, 0, 5);

      expect(density.density).toBeGreaterThan(0);
      expect(density.complexity).toBeGreaterThan(0);
      expect(density.score).toBeGreaterThan(0);
    });

    it('应该处理空关键词列表', () => {
      const keywords = [];
      const density = optimizer.calculateSimpleDensity(keywords, 0, 5);

      expect(density.density).toBe(0);
      expect(density.complexity).toBe(0);
      expect(density.score).toBe(0);
    });

    it('应该处理窗口外的关键词', () => {
      const keywords = [
        { text: '测试', startTime: 10, endTime: 12 }
      ];

      const density = optimizer.calculateSimpleDensity(keywords, 0, 5);

      expect(density.density).toBe(0);
    });
  });

  describe('selectNextType', () => {
    it('应该根据概率选择下一个场景类型', () => {
      const consecutiveCount = {
        'original': 0,
        'card-group': 0,
        'video-with-card': 0,
        'multi-layer-composition': 0
      };

      const density = { density: 0.5, complexity: 1, score: 0.5 };

      const nextType = optimizer.selectNextType('original', consecutiveCount, density);

      expect(['original', 'card-group', 'video-with-card', 'multi-layer-composition']).toContain(nextType);
    });

    it('应该避免同类型连续超过2次', () => {
      const consecutiveCount = {
        'original': 2,
        'card-group': 0,
        'video-with-card': 0,
        'multi-layer-composition': 0
      };

      const density = { density: 0.5, complexity: 1, score: 0.5 };

      const nextType = optimizer.selectNextType('original', consecutiveCount, density);

      expect(nextType).not.toBe('original');
    });

    it('应该根据高密度增加多层场景概率', () => {
      const consecutiveCount = {
        'original': 0,
        'card-group': 0,
        'video-with-card': 0,
        'multi-layer-composition': 0
      };

      const highDensity = { density: 1.5, complexity: 1.5, score: 0.9 };

      // 运行多次，统计结果
      const results = {};
      for (let i = 0; i < 100; i++) {
        const nextType = optimizer.selectNextType('original', consecutiveCount, highDensity);
        results[nextType] = (results[nextType] || 0) + 1;
      }

      // 高密度应该增加多层场景的概率
      // 注意：这是概率测试，可能偶尔失败
      expect(results['multi-layer-composition']).toBeGreaterThan(20);
    });
  });

  describe('weightedRandom', () => {
    it('应该根据权重选择', () => {
      const probabilities = {
        'type1': 0.8,
        'type2': 0.2
      };

      // 运行多次，统计结果
      const results = {};
      for (let i = 0; i < 1000; i++) {
        const selected = optimizer.weightedRandom(probabilities);
        results[selected] = (results[selected] || 0) + 1;
      }

      // type1应该被选中更多次（约800次）
      expect(results['type1']).toBeGreaterThan(700);
      expect(results['type1']).toBeLessThan(900);
    });

    it('应该处理均匀分布', () => {
      const probabilities = {
        'type1': 0.5,
        'type2': 0.5
      };

      const results = {};
      for (let i = 0; i < 1000; i++) {
        const selected = optimizer.weightedRandom(probabilities);
        results[selected] = (results[selected] || 0) + 1;
      }

      // 应该接近50/50分布
      expect(results['type1']).toBeGreaterThan(400);
      expect(results['type1']).toBeLessThan(600);
    });
  });

  describe('calculateDynamicDuration', () => {
    it('应该返回基础时长', () => {
      const density = { density: 0.5, complexity: 1, score: 0.5 };
      const duration = optimizer.calculateDynamicDuration('card-group', density);

      expect(duration).toBeGreaterThanOrEqual(4);
      expect(duration).toBeLessThanOrEqual(8);
    });

    it('应该根据高密度增加时长', () => {
      const highDensity = { density: 1.5, complexity: 1.5, score: 0.9 };
      const duration = optimizer.calculateDynamicDuration('card-group', highDensity);

      expect(duration).toBeGreaterThan(6);
    });

    it('应该根据低密度减少时长', () => {
      const lowDensity = { density: 0.1, complexity: 0.5, score: 0.2 };
      const duration = optimizer.calculateDynamicDuration('card-group', lowDensity);

      expect(duration).toBeLessThan(6);
    });

    it('应该遵守时长范围限制', () => {
      const veryHighDensity = { density: 10, complexity: 10, score: 10 };
      const duration = optimizer.calculateDynamicDuration('card-group', veryHighDensity);

      expect(duration).toBeLessThanOrEqual(8); // max
    });
  });

  describe('generateOptimizedSequence', () => {
    it('应该生成优化的场景序列', () => {
      const scenes = [
        { id: 1, startTime: 0, endTime: 3, keyword: '开场' },
        { id: 2, startTime: 3, endTime: 6, keyword: '关键词1' },
        { id: 3, startTime: 6, endTime: 9, keyword: '关键词2' },
        { id: 4, startTime: 9, endTime: 12, keyword: '关键词3' },
        { id: 5, startTime: 12, endTime: 15, keyword: '结尾' }
      ];

      const optimized = optimizer.generateOptimizedSequence(scenes, 15);

      expect(optimized).toHaveLength(5);
      expect(optimized[0].type).toBe('original'); // 开场
      expect(optimized[4].type).toBe('original'); // 结尾
    });

    it('应该避免同类型连续超过3次', () => {
      const scenes = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        startTime: i * 2,
        endTime: (i + 1) * 2,
        keyword: `关键词${i}`
      }));

      const optimized = optimizer.generateOptimizedSequence(scenes, 40);

      // 检查连续性
      let consecutiveCount = 1;
      let prevType = optimized[0].type;

      for (let i = 1; i < optimized.length; i++) {
        if (optimized[i].type === prevType) {
          consecutiveCount++;
          expect(consecutiveCount).toBeLessThanOrEqual(3);
        } else {
          consecutiveCount = 1;
          prevType = optimized[i].type;
        }
      }
    });

    it('应该生成多样化的场景类型', () => {
      const scenes = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        startTime: i * 3,
        endTime: (i + 1) * 3,
        keyword: `关键词${i}`
      }));

      const optimized = optimizer.generateOptimizedSequence(scenes, 30);

      // 统计场景类型
      const typeCount = {};
      optimized.forEach(scene => {
        typeCount[scene.type] = (typeCount[scene.type] || 0) + 1;
      });

      // 应该至少有3种不同的场景类型
      expect(Object.keys(typeCount).length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('validateSequence', () => {
    it('应该验证合理的场景序列', () => {
      const scenes = [
        { type: 'original' },
        { type: 'card-group' },
        { type: 'multi-layer-composition' },
        { type: 'video-with-card' },
        { type: 'card-group' },
        { type: 'multi-layer-composition' },
        { type: 'video-with-card' },
        { type: 'card-group' },
        { type: 'multi-layer-composition' },
        { type: 'original' }
      ];

      const validation = optimizer.validateSequence(scenes);

      expect(validation.valid).toBe(true);
      expect(validation.issues).toHaveLength(0);
    });

    it('应该检测同类型连续超过3次', () => {
      const scenes = [
        { type: 'card-group' },
        { type: 'card-group' },
        { type: 'card-group' },
        { type: 'card-group' },
        { type: 'original' }
      ];

      const validation = optimizer.validateSequence(scenes);

      expect(validation.valid).toBe(false);
      expect(validation.issues.length).toBeGreaterThan(0);
    });

    it('应该检测原视频占比过高', () => {
      const scenes = Array.from({ length: 10 }, () => ({ type: 'original' }));

      const validation = optimizer.validateSequence(scenes);

      expect(validation.valid).toBe(false);
      expect(validation.issues.some(issue => issue.includes('原视频占比过高'))).toBe(true);
    });
  });

  describe('边界情况', () => {
    it('应该处理单个场景', () => {
      const scenes = [
        { id: 1, startTime: 0, endTime: 5, keyword: '唯一场景' }
      ];

      const optimized = optimizer.generateOptimizedSequence(scenes, 5);

      expect(optimized).toHaveLength(1);
      expect(optimized[0].type).toBe('original');
    });

    it('应该处理空场景列表', () => {
      const scenes = [];

      const optimized = optimizer.generateOptimizedSequence(scenes, 10);

      expect(optimized).toHaveLength(0);
    });

    it('应该处理非常短的视频', () => {
      const scenes = [
        { id: 1, startTime: 0, endTime: 2, keyword: '短视频' }
      ];

      const optimized = optimizer.generateOptimizedSequence(scenes, 2);

      expect(optimized).toHaveLength(1);
    });
  });
});
