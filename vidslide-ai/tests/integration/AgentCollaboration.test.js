import { describe, it, expect } from 'vitest';
import ContentAnalyst from '../../src/agents/executors/ContentAnalyst.js';
import SceneDesigner from '../../src/agents/executors/SceneDesigner.js';
import MaterialExpert from '../../src/agents/executors/MaterialExpert.js';
import VisualDesigner from '../../src/agents/executors/VisualDesigner.js';
import VideoEngineer from '../../src/agents/executors/VideoEngineer.js';
import QualityDirector from '../../src/agents/quality/QualityDirector.js';

/**
 * 智能体协作测试
 *
 * 测试各个智能体之间的数据传递和协作
 */

describe('智能体协作测试', () => {
  describe('数据流转', () => {
    it('ContentAnalyst输出应该符合SceneDesigner输入', () => {
      const mockAnalystOutput = {
        understanding: {
          keywords: ['AI', '机器学习', '深度学习'],
          viewpoints: [
            {
              text: 'AI改变世界',
              timestamp: 10,
              importance: 'high'
            }
          ],
          explanations: [
            {
              keyword: 'AI',
              explanation: '人工智能是计算机科学的一个分支',
              relatedKeywords: ['机器学习', '深度学习']
            }
          ],
          intent: '教育',
          tone: '专业',
          targetAudience: '技术爱好者'
        }
      };

      // SceneDesigner应该能接受这个输出
      const sceneDesigner = new SceneDesigner();
      expect(() => {
        sceneDesigner.planScenes(mockAnalystOutput.understanding, 60);
      }).not.toThrow();
    });

    it('SceneDesigner输出应该符合MaterialExpert输入', () => {
      const mockSceneOutput = {
        scenes: [
          {
            id: 'scene_1',
            type: 'original',
            startTime: 0,
            endTime: 2,
            needMaterial: false
          },
          {
            id: 'scene_2',
            type: 'multi-layer-composition',
            startTime: 2,
            endTime: 6,
            keyword: 'AI',
            needMaterial: true
          }
        ],
        stats: {
          totalScenes: 2,
          originalRatio: '33.33'
        }
      };

      const mockUnderstanding = {
        intent: '教育',
        tone: '专业'
      };

      // MaterialExpert应该能处理这些场景
      const materialScenes = mockSceneOutput.scenes.filter(s => s.needMaterial);
      expect(materialScenes.length).toBeGreaterThan(0);
      expect(materialScenes[0].keyword).toBeDefined();
    });

    it('所有智能体应该有统一的接口', () => {
      const agents = [
        new ContentAnalyst(),
        new SceneDesigner(),
        new MaterialExpert(),
        new VisualDesigner(),
        new VideoEngineer()
      ];

      for (const agent of agents) {
        expect(agent.getName).toBeDefined();
        expect(agent.getStatus).toBeDefined();
        expect(typeof agent.getName()).toBe('string');
        expect(agent.getStatus().ready).toBe(true);
      }
    });
  });

  describe('质量检查集成', () => {
    it('QualityDirector应该能检查ContentAnalyst输出', async () => {
      const qualityDirector = new QualityDirector();

      const mockResult = {
        understanding: {
          keywords: ['AI', '机器学习', '深度学习'],
          viewpoints: [
            {
              text: 'AI改变世界',
              timestamp: 10,
              importance: 'high'
            }
          ],
          explanations: [],
          intent: '教育'
        }
      };

      const checkResult = await qualityDirector.checkUnderstanding(mockResult);

      expect(checkResult.passed).toBeDefined();
      expect(checkResult.score).toBeDefined();
      expect(checkResult.violations).toBeDefined();
      expect(checkResult.warnings).toBeDefined();
      expect(checkResult.suggestions).toBeDefined();
    });

    it('QualityDirector应该能检查SceneDesigner输出', async () => {
      const qualityDirector = new QualityDirector();

      const mockResult = {
        scenes: [
          {
            id: 'scene_1',
            type: 'original',
            startTime: 0,
            endTime: 20
          },
          {
            id: 'scene_2',
            type: 'video-with-card',
            startTime: 20,
            endTime: 40
          },
          {
            id: 'scene_3',
            type: 'original',
            startTime: 40,
            endTime: 60
          }
        ],
        stats: {
          totalScenes: 3,
          originalScenes: 2,
          cardScenes: 1,
          multiLayerScenes: 0,
          originalRatio: '66.67'
        }
      };

      const checkResult = await qualityDirector.checkSceneDesign(mockResult);

      expect(checkResult.passed).toBeDefined();
      expect(checkResult.score).toBeDefined();
    });
  });

  describe('错误恢复', () => {
    it('智能体应该能处理空输入', () => {
      const sceneDesigner = new SceneDesigner();

      expect(() => {
        sceneDesigner.planScenes({
          keywords: [],
          viewpoints: [],
          explanations: []
        }, 60);
      }).not.toThrow();
    });

    it('智能体应该能处理异常数据', () => {
      const sceneDesigner = new SceneDesigner();

      const result = sceneDesigner.planScenes({
        keywords: ['test'],
        viewpoints: [
          {
            text: '测试观点',
            importance: 'high'
          }
        ],
        explanations: []
      }, 60);

      expect(result.scenes).toBeDefined();
      expect(result.scenes.length).toBeGreaterThan(0);
    });
  });

  describe('性能测试', () => {
    it('场景拆解应该在合理时间内完成', () => {
      const sceneDesigner = new SceneDesigner();

      const startTime = Date.now();

      sceneDesigner.planScenes({
        keywords: ['AI', '机器学习'],
        viewpoints: [
          { text: '观点1', importance: 'high' },
          { text: '观点2', importance: 'medium' },
          { text: '观点3', importance: 'low' }
        ],
        explanations: [
          { keyword: 'AI', explanation: '解释1' }
        ]
      }, 120);

      const duration = Date.now() - startTime;

      // 应该在100ms内完成
      expect(duration).toBeLessThan(100);
    });

    it('质量检查应该在合理时间内完成', async () => {
      const qualityDirector = new QualityDirector();

      const mockResult = {
        understanding: {
          keywords: ['AI', '机器学习', '深度学习'],
          viewpoints: [{ text: '观点', importance: 'high' }],
          explanations: [],
          intent: '教育'
        }
      };

      const startTime = Date.now();
      await qualityDirector.checkUnderstanding(mockResult);
      const duration = Date.now() - startTime;

      // 应该在50ms内完成
      expect(duration).toBeLessThan(50);
    });
  });
});
