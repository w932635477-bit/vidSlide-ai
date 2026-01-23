import ContentAnalyst from '../executors/ContentAnalyst.js';
import SceneDesigner from '../executors/SceneDesigner.js';
import MaterialExpert from '../executors/MaterialExpert.js';
import VisualDesigner from '../executors/VisualDesigner.js';
import VideoEngineer from '../executors/VideoEngineer.js';
import QualityDirector from '../quality/QualityDirector.js';
import DataManager from '../../core/DataManager.js';
import Logger from '../../core/Logger.js';
import ErrorHandler from '../../core/ErrorHandler.js';
import CacheManager from '../../core/CacheManager.js';
import { execSync } from 'child_process';

/**
 * ProjectManager - 项目经理（总协调器）
 *
 * 职责：
 * 1. 制定5阶段执行计划
 * 2. 分配任务给各个智能体
 * 3. 监控执行进度
 * 4. 处理异常和重试
 * 5. 协调智能体之间的工作
 */
class ProjectManager {
  constructor(options = {}) {
    this.name = 'ProjectManager';

    // 初始化支持服务
    this.dataManager = new DataManager(options.dataManager);
    this.logger = new Logger(options.logger);
    this.errorHandler = new ErrorHandler({ logger: this.logger });
    this.cacheManager = new CacheManager(options.cacheManager);

    // 初始化所有智能体
    this.agents = {
      contentAnalyst: new ContentAnalyst({
        logger: this.logger,
        errorHandler: this.errorHandler
      }),
      sceneDesigner: new SceneDesigner({
        logger: this.logger,
        errorHandler: this.errorHandler
      }),
      materialExpert: new MaterialExpert({
        logger: this.logger,
        errorHandler: this.errorHandler,
        cacheManager: this.cacheManager
      }),
      visualDesigner: new VisualDesigner({
        logger: this.logger,
        errorHandler: this.errorHandler
      }),
      videoEngineer: new VideoEngineer({
        logger: this.logger,
        errorHandler: this.errorHandler
      })
    };

    // 质量总监
    this.qualityDirector = new QualityDirector({
      logger: this.logger,
      errorHandler: this.errorHandler
    });
  }

  /**
   * 主执行流程
   * @param {string} videoPath - 视频路径
   * @param {Object} options - 选项
   * @returns {Promise<Object>} 执行结果
   */
  async execute(videoPath, options = {}) {
    this.logger.info('🎯 ProjectManager: 开始执行');
    this.logger.info(`  视频路径: ${videoPath}`);

    try {
      // 步骤1: 制定执行计划
      const plan = await this.createExecutionPlan(videoPath, options);
      this.logger.logPlan(plan);

      // 步骤2: 执行计划
      const result = await this.executePlan(plan);

      // 步骤3: 最终验收
      const finalCheck = await this.qualityDirector.finalReview(result);

      if (finalCheck.passed) {
        this.logger.info('✅ ProjectManager: 任务完成');

        // 生成报告
        const report = this.logger.generateReport();

        return {
          success: true,
          videoPath: result.finalVideo,
          report: report,
          qualityScore: finalCheck.score
        };

      } else {
        this.logger.warn('⚠️ ProjectManager: 质量不合格');
        this.logger.warn(`  违规项: ${finalCheck.violations.length}个`);

        // 如果允许返工，启动返工流程
        if (options.allowRework) {
          this.logger.info('  → 启动返工流程...');
          return await this.handleRework(finalCheck.violations, plan);
        }

        return {
          success: false,
          error: '质量检查未通过',
          violations: finalCheck.violations,
          warnings: finalCheck.warnings,
          suggestions: finalCheck.suggestions
        };
      }

    } catch (error) {
      this.logger.error('❌ ProjectManager: 执行失败', { error: error.message });
      return await this.handleCriticalFailure(error);
    }
  }

  /**
   * 制定执行计划
   * @param {string} videoPath - 视频路径
   * @param {Object} options - 选项
   * @returns {Promise<Object>} 执行计划
   */
  async createExecutionPlan(videoPath, options = {}) {
    this.logger.info('📋 ProjectManager: 制定执行计划');

    // 获取视频时长
    const videoDuration = await this.getVideoDuration(videoPath);

    const plan = {
      id: `plan_${Date.now()}`,
      videoPath: videoPath,
      videoDuration: videoDuration,
      options: options,

      // 阶段1: 内容理解（串行）
      phase1: {
        name: 'ContentUnderstanding',
        type: 'sequential',
        tasks: [
          {
            id: 'task_1_1',
            name: '语音识别',
            agent: 'contentAnalyst',
            method: 'speechToText',
            input: { videoPath },
            critical: true,
            retryLimit: 3,
            timeout: 30000
          },
          {
            id: 'task_1_2',
            name: '文心一言分析',
            agent: 'contentAnalyst',
            method: 'analyzeWithWenxin',
            dependsOn: ['task_1_1'],
            critical: true,
            retryLimit: 3,
            timeout: 20000
          },
          {
            id: 'task_1_3',
            name: '质量检查',
            agent: 'qualityDirector',
            method: 'checkUnderstanding',
            dependsOn: ['task_1_2'],
            critical: true,
            retryLimit: 1
          }
        ]
      },

      // 阶段2: 场景设计（串行）
      phase2: {
        name: 'SceneDesign',
        type: 'sequential',
        tasks: [
          {
            id: 'task_2_1',
            name: '场景拆解',
            agent: 'sceneDesigner',
            method: 'decomposeScenes',
            dependsOn: ['task_1_2'],
            input: { videoDuration },
            critical: true,
            retryLimit: 2
          },
          {
            id: 'task_2_2',
            name: '质量检查',
            agent: 'qualityDirector',
            method: 'checkSceneDesign',
            dependsOn: ['task_2_1'],
            critical: true
          }
        ]
      },

      // 阶段3: 素材生成（并行）
      phase3: {
        name: 'AssetGeneration',
        type: 'parallel',
        tasks: [
          {
            id: 'task_3_1',
            name: '生成内容素材',
            agent: 'materialExpert',
            method: 'generateMaterials',
            dependsOn: ['task_2_1', 'task_1_2'],
            critical: true,
            retryLimit: 3
          },
          {
            id: 'task_3_2',
            name: '设计卡片',
            agent: 'visualDesigner',
            method: 'designCards',
            dependsOn: ['task_2_1'],
            critical: true,
            retryLimit: 2
          },
          {
            id: 'task_3_3',
            name: '生成背景遮罩',
            agent: 'visualDesigner',
            method: 'generateBackgrounds',
            dependsOn: ['task_2_1'],
            critical: false
          },
          {
            id: 'task_3_4',
            name: '提取人脸',
            agent: 'videoEngineer',
            method: 'extractFace',
            input: { videoPath },
            critical: false
          }
        ]
      },

      // 阶段4: 质量检查（串行）
      phase4: {
        name: 'QualityCheck',
        type: 'sequential',
        tasks: [
          {
            id: 'task_4_1',
            name: '素材准确性检查',
            agent: 'qualityDirector',
            method: 'checkMaterialAccuracy',
            dependsOn: ['task_3_1'],
            critical: true
          },
          {
            id: 'task_4_2',
            name: '视觉质量检查',
            agent: 'qualityDirector',
            method: 'checkVisualQuality',
            dependsOn: ['task_3_2', 'task_3_3'],
            critical: true
          }
        ]
      },

      // 阶段5: 视频合成（串行）
      phase5: {
        name: 'VideoComposition',
        type: 'sequential',
        tasks: [
          {
            id: 'task_5_1',
            name: '合成视频',
            agent: 'videoEngineer',
            method: 'composeVideo',
            dependsOn: ['task_2_1', 'task_3_1', 'task_3_2', 'task_3_3', 'task_3_4'],
            input: { videoPath },
            critical: true,
            timeout: 90000
          },
          {
            id: 'task_5_2',
            name: '最终质量检查',
            agent: 'qualityDirector',
            method: 'finalCheck',
            dependsOn: ['task_5_1'],
            critical: true
          }
        ]
      }
    };

    this.logger.info('  ✅ 执行计划制定完成');
    this.logger.info(`    - 5个阶段`);
    this.logger.info(`    - ${this.countTasks(plan)}个任务`);

    return plan;
  }

  /**
   * 执行计划
   * @param {Object} plan - 执行计划
   * @returns {Promise<Object>} 执行结果
   */
  async executePlan(plan) {
    this.logger.info('🚀 ProjectManager: 开始执行计划');

    const results = {};
    const qualityChecks = {};

    // 执行5个阶段
    for (let i = 1; i <= 5; i++) {
      const phase = plan[`phase${i}`];
      this.logger.startPhase(phase.name);

      try {
        const phaseResults = await this.executePhase(phase, results, plan);

        // 合并结果
        Object.assign(results, phaseResults);

        // 保存质量检查结果
        for (const [taskId, result] of Object.entries(phaseResults)) {
          if (taskId.includes('quality') || taskId.includes('check') || taskId.startsWith('task_1_3') || taskId.startsWith('task_2_2') || taskId.startsWith('task_4_') || taskId.startsWith('task_5_2')) {
            qualityChecks[taskId] = result;
          }
        }

        this.logger.endPhase('success', phaseResults);

      } catch (error) {
        this.logger.endPhase('failed', { error: error.message });
        throw error;
      }
    }

    // 添加质量检查结果
    results.qualityChecks = qualityChecks;

    return results;
  }

  /**
   * 执行单个阶段
   * @param {Object} phase - 阶段对象
   * @param {Object} previousResults - 之前的结果
   * @param {Object} plan - 完整计划
   * @returns {Promise<Object>} 阶段结果
   */
  async executePhase(phase, previousResults, plan) {
    const results = {};

    if (phase.type === 'sequential') {
      // 串行执行
      for (const task of phase.tasks) {
        // 合并之前的结果和当前阶段已完成的结果
        const allResults = { ...previousResults, ...results };
        const result = await this.executeTask(task, allResults, plan);
        results[task.id] = result;
      }

    } else if (phase.type === 'parallel') {
      // 并行执行
      const promises = phase.tasks.map(task =>
        this.executeTask(task, previousResults, plan)
          .then(result => ({ taskId: task.id, result }))
          .catch(error => ({ taskId: task.id, error }))
      );

      const taskResults = await Promise.all(promises);

      for (const item of taskResults) {
        if (item.error) {
          // 检查是否是关键任务
          const task = phase.tasks.find(t => t.id === item.taskId);
          if (task && task.critical) {
            throw item.error;
          } else {
            this.logger.warn(`非关键任务失败: ${item.taskId}`, { error: item.error.message });
            results[item.taskId] = null;
          }
        } else {
          results[item.taskId] = item.result;
        }
      }
    }

    return results;
  }

  /**
   * 执行单个任务
   * @param {Object} task - 任务对象
   * @param {Object} previousResults - 之前的结果
   * @param {Object} plan - 完整计划
   * @returns {Promise<any>} 任务结果
   */
  async executeTask(task, previousResults, plan) {
    this.logger.logTask(task.name, { taskId: task.id, agent: task.agent });

    // 准备输入
    const input = this.prepareTaskInput(task, previousResults, plan);

    // 获取智能体
    const agent = task.agent === 'qualityDirector'
      ? this.qualityDirector
      : this.agents[task.agent];

    if (!agent) {
      throw new Error(`未找到智能体: ${task.agent}`);
    }

    // 执行任务（带重试）
    const execute = async () => {
      return await agent[task.method](input);
    };

    try {
      if (task.retryLimit && task.retryLimit > 0) {
        return await this.errorHandler.retry(execute, {
          maxRetries: task.retryLimit,
          context: { task: task.name, agent: task.agent }
        });
      } else {
        return await execute();
      }

    } catch (error) {
      if (task.critical) {
        throw error;
      } else {
        this.logger.warn(`  ⚠️ 非关键任务失败: ${task.name}`, { error: error.message });
        return null;
      }
    }
  }

  /**
   * 准备任务输入
   * @param {Object} task - 任务对象
   * @param {Object} previousResults - 之前的结果
   * @param {Object} plan - 完整计划
   * @returns {Object} 输入对象
   */
  prepareTaskInput(task, previousResults, plan) {
    const input = { ...task.input };

    // 添加依赖任务的结果
    if (task.dependsOn) {
      for (const depTaskId of task.dependsOn) {
        input[depTaskId] = previousResults[depTaskId];
      }
    }

    return input;
  }

  /**
   * 处理返工
   * @param {Array} violations - 违规项列表
   * @param {Object} plan - 原计划
   * @returns {Promise<Object>} 返工结果
   */
  async handleRework(violations, plan) {
    this.logger.info('🔄 ProjectManager: 处理返工');
    this.logger.info(`  违规项: ${violations.length}个`);

    // TODO: 实现智能返工逻辑
    // 根据违规项类型，重新执行相关阶段

    return {
      success: false,
      error: '返工功能尚未实现',
      violations: violations
    };
  }

  /**
   * 处理严重失败
   * @param {Error} error - 错误对象
   * @returns {Promise<Object>} 失败结果
   */
  async handleCriticalFailure(error) {
    this.logger.error('💥 ProjectManager: 严重失败');

    const errorReport = this.errorHandler.generateErrorReport(error, {
      agent: 'ProjectManager'
    });

    return {
      success: false,
      error: error.message,
      errorReport: errorReport
    };
  }

  /**
   * 获取视频时长
   * @param {string} videoPath - 视频路径
   * @returns {Promise<number>} 时长（秒）
   */
  async getVideoDuration(videoPath) {
    try {
      const cmd = `ffprobe -v quiet -print_format json -show_format "${videoPath}"`;
      const output = execSync(cmd, { encoding: 'utf-8' });
      const info = JSON.parse(output);
      return parseFloat(info.format.duration);
    } catch (error) {
      this.logger.warn('无法获取视频时长，使用默认值60秒');
      return 60;
    }
  }

  /**
   * 统计任务数量
   * @param {Object} plan - 执行计划
   * @returns {number} 任务总数
   */
  countTasks(plan) {
    let count = 0;
    for (let i = 1; i <= 5; i++) {
      const phase = plan[`phase${i}`];
      if (phase && phase.tasks) {
        count += phase.tasks.length;
      }
    }
    return count;
  }

  /**
   * 获取状态
   * @returns {Object} 状态信息
   */
  getStatus() {
    return {
      name: this.name,
      ready: true,
      agents: Object.keys(this.agents).map(key => ({
        name: key,
        status: this.agents[key].getStatus()
      })),
      qualityDirector: this.qualityDirector.getStatus()
    };
  }
}

export default ProjectManager;
