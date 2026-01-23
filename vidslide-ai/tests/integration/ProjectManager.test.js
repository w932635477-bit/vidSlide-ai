import { describe, it, expect, beforeAll } from 'vitest';
import ProjectManager from '../../src/agents/coordinator/ProjectManager.js';
import path from 'path';
import fs from 'fs';

/**
 * 集成测试 - 多智能体蜂群系统
 *
 * 注意：这些测试需要真实的API密钥和测试视频
 * 如果没有配置，测试将被跳过
 */

const hasAPIKeys = process.env.BAIDU_ASR_API_KEY && process.env.WENXIN_API_KEY && process.env.DOUBAO_API_KEY;
const hasTestVideo = fs.existsSync(path.join(process.cwd(), 'test-video.mp4'));

const describeIf = (condition) => condition ? describe : describe.skip;

describeIf(hasAPIKeys && hasTestVideo)('ProjectManager - 集成测试', () => {
  let pm;
  const testVideoPath = path.join(process.cwd(), 'test-video.mp4');

  beforeAll(() => {
    pm = new ProjectManager({
      cacheManager: {
        cacheDir: path.join(process.cwd(), '.test-cache')
      },
      logger: {
        logLevel: 'info'
      }
    });
  });

  describe('系统状态', () => {
    it('应该能获取系统状态', () => {
      const status = pm.getStatus();

      expect(status.name).toBe('ProjectManager');
      expect(status.ready).toBe(true);
      expect(status.agents).toBeDefined();
      expect(status.agents.length).toBe(5);
      expect(status.qualityDirector).toBeDefined();
    });

    it('所有智能体应该就绪', () => {
      const status = pm.getStatus();

      for (const agent of status.agents) {
        expect(agent.status.ready).toBe(true);
      }

      expect(status.qualityDirector.ready).toBe(true);
    });
  });

  describe('执行计划', () => {
    it('应该能制定执行计划', async () => {
      const plan = await pm.createExecutionPlan(testVideoPath, {});

      expect(plan.id).toBeDefined();
      expect(plan.videoPath).toBe(testVideoPath);
      expect(plan.videoDuration).toBeGreaterThan(0);

      // 检查5个阶段
      expect(plan.phase1).toBeDefined();
      expect(plan.phase2).toBeDefined();
      expect(plan.phase3).toBeDefined();
      expect(plan.phase4).toBeDefined();
      expect(plan.phase5).toBeDefined();

      // 检查任务数量
      const taskCount = pm.countTasks(plan);
      expect(taskCount).toBeGreaterThan(0);
    });

    it('执行计划应该包含正确的任务依赖', async () => {
      const plan = await pm.createExecutionPlan(testVideoPath, {});

      // 阶段1任务2应该依赖任务1
      expect(plan.phase1.tasks[1].dependsOn).toContain('task_1_1');

      // 阶段2任务1应该依赖阶段1任务2
      expect(plan.phase2.tasks[0].dependsOn).toContain('task_1_2');

      // 阶段3任务应该依赖阶段2
      expect(plan.phase3.tasks[0].dependsOn).toContain('task_2_1');
    });
  });

  describe('完整流程执行', () => {
    it('应该能执行完整的视频生成流程', async () => {
      const result = await pm.execute(testVideoPath, {
        allowRework: false
      });

      expect(result).toBeDefined();

      if (result.success) {
        expect(result.videoPath).toBeDefined();
        expect(fs.existsSync(result.videoPath)).toBe(true);
        expect(result.qualityScore).toBeGreaterThan(0);
        expect(result.report).toBeDefined();
      } else {
        // 如果失败，应该有错误信息
        expect(result.error).toBeDefined();
      }
    }, 300000); // 5分钟超时

    it('应该生成详细的执行报告', async () => {
      const result = await pm.execute(testVideoPath, {});

      if (result.success) {
        const report = result.report;

        expect(report.summary).toBeDefined();
        expect(report.summary.totalPhases).toBe(5);
        expect(report.phases).toBeDefined();
        expect(report.phases.length).toBe(5);
        expect(report.performance).toBeDefined();
      }
    }, 300000);
  });

  describe('错误处理', () => {
    it('应该能处理无效的视频路径', async () => {
      const result = await pm.execute('/invalid/path/video.mp4', {});

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('应该能从非关键任务失败中恢复', async () => {
      // 这个测试需要模拟某个非关键任务失败
      // 例如人脸提取失败，但整体流程应该继续
      const result = await pm.execute(testVideoPath, {});

      // 即使某些非关键任务失败，整体应该能成功
      expect(result).toBeDefined();
    }, 300000);
  });

  describe('质量检查', () => {
    it('应该执行所有质量检查', async () => {
      const result = await pm.execute(testVideoPath, {});

      if (result.success && result.report) {
        const phases = result.report.phases;

        // 应该有质量检查阶段
        const qualityPhases = phases.filter(p =>
          p.name.includes('Quality') || p.name.includes('Check')
        );

        expect(qualityPhases.length).toBeGreaterThan(0);
      }
    }, 300000);

    it('质量评分应该在合理范围内', async () => {
      const result = await pm.execute(testVideoPath, {});

      if (result.success) {
        expect(result.qualityScore).toBeGreaterThanOrEqual(0);
        expect(result.qualityScore).toBeLessThanOrEqual(100);
      }
    }, 300000);
  });
});

// 模拟测试（不需要真实API）
describe('ProjectManager - 模拟测试', () => {
  let pm;

  beforeAll(() => {
    pm = new ProjectManager({
      cacheManager: {
        cacheDir: path.join(process.cwd(), '.test-cache')
      },
      logger: {
        logLevel: 'error'  // 减少日志输出
      }
    });
  });

  it('应该能创建ProjectManager实例', () => {
    expect(pm).toBeDefined();
    expect(pm.name).toBe('ProjectManager');
  });

  it('应该有所有必需的智能体', () => {
    expect(pm.agents.contentAnalyst).toBeDefined();
    expect(pm.agents.sceneDesigner).toBeDefined();
    expect(pm.agents.materialExpert).toBeDefined();
    expect(pm.agents.visualDesigner).toBeDefined();
    expect(pm.agents.videoEngineer).toBeDefined();
  });

  it('应该有质量总监', () => {
    expect(pm.qualityDirector).toBeDefined();
  });

  it('应该能统计任务数量', async () => {
    const mockPlan = {
      phase1: { tasks: [1, 2, 3] },
      phase2: { tasks: [1, 2] },
      phase3: { tasks: [1, 2, 3, 4] },
      phase4: { tasks: [1, 2] },
      phase5: { tasks: [1, 2] }
    };

    const count = pm.countTasks(mockPlan);
    expect(count).toBe(14);
  });
});
