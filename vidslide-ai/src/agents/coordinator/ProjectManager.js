import ContentAnalyst from '../executors/ContentAnalyst.js';
import SceneDesigner from '../executors/SceneDesigner.js';
import VideoEngineer from '../executors/VideoEngineer.js';
import QualityDirector from '../quality/QualityDirector.js';
import LayerOrchestrator from './LayerOrchestrator.js';
import DataManager from '../../core/DataManager.js';
import Logger from '../../core/Logger.js';
import ErrorHandler from '../../core/ErrorHandler.js';
import CacheManager from '../../core/CacheManager.js';
import ReworkEngine from '../../core/ReworkEngine.js';
import ImprovedRetryHandler from '../../core/ImprovedRetryHandler.js';
import ErrorMemory from '../../core/ErrorMemory.js';
import ViolationClassifier from '../../core/ViolationClassifier.js';
import RemotionRenderServiceCLI from '../../services/RemotionRenderServiceCLI.js';
import TemplateStyleAnalyzer from '../../services/TemplateStyleAnalyzer.js';
import { globalCheckpointManager } from '../../core/CheckpointManager.js';
import { globalTracer } from '../../core/AgentTracer.js';
import { execSync } from 'child_process';

// ⭐ 新增：导入规则驱动架构组件
import { WorkflowStateMachine, WorkflowState, TransitionResult } from '../../core/WorkflowStateMachine.js';
import { globalRuleEngine } from '../../core/RuleEngine.js';
import { Gates } from '../../core/ValidationGate.js';

/**
 * ProjectManager - 项目经理（总协调器）v3.0 - 规则驱动版本
 *
 * 最佳实践优化：
 * - 集成CheckpointManager实现断点续传
 * - 集成AgentTracer实现分布式追踪
 * - ⭐ 集成WorkflowStateMachine实现规则驱动工作流
 * - ⭐ 集成RuleEngine实现自动验证和修复
 *
 * 职责：
 * 1. 制定5阶段执行计划
 * 2. 分配任务给各个智能体
 * 3. 监控执行进度
 * 4. 处理异常和重试
 * 5. 协调智能体之间的工作
 * 6. 支持断点续传
 * 7. ⭐ 规则驱动的状态转换和验证
 */
class ProjectManager {
  constructor(options = {}) {
    this.name = 'ProjectManager';

    // 初始化支持服务
    this.dataManager = new DataManager(options.dataManager);
    this.logger = new Logger(options.logger);
    this.errorHandler = new ErrorHandler({ logger: this.logger });
    this.cacheManager = new CacheManager(options.cacheManager);

    // ⭐ 新增：检查点管理器（断点续传）
    this.checkpointManager = globalCheckpointManager;

    // ⭐ 新增：分布式追踪器
    this.tracer = globalTracer;

    // ⭐⭐⭐ 新增：规则驱动架构组件
    this.ruleEngine = globalRuleEngine;
    this.stateMachine = new WorkflowStateMachine({ ruleEngine: this.ruleEngine });

    // 验证门实例
    this.gates = {
      content: Gates.content(),
      scenes: Gates.scenes(),
      layers: Gates.layers(),
      output: Gates.output()
    };

    // 监听状态变化，用于UI更新
    this.stateMachine.addListener('stateChange', (event) => {
      this.logger.info(`📊 状态转换: ${event.fromState} → ${event.toState}`);
      // 触发外部监听器（如果有）
      if (this.onStateChange) {
        this.onStateChange(event);
      }
    });

    // ⭐ 新增：初始化错误处理系统
    this.reworkEngine = new ReworkEngine({
      logger: this.logger,
      maxReworkCycles: options.maxReworkCycles || 3
    });

    this.retryHandler = new ImprovedRetryHandler({
      logger: this.logger,
      baseDelay: 1000,
      maxDelay: 30000,
      jitterFactor: 0.1
    });

    this.errorMemory = new ErrorMemory({
      logger: this.logger
    });

    // 初始化所有智能体（清理后：4个核心智能体）
    this.agents = {
      contentAnalyst: new ContentAnalyst({
        logger: this.logger,
        errorHandler: this.errorHandler
      }),
      sceneDesigner: new SceneDesigner({
        logger: this.logger,
        errorHandler: this.errorHandler
      }),
      layerOrchestrator: new LayerOrchestrator({
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

    // ⭐ 新增：初始化Remotion渲染服务
    this.remotionService = new RemotionRenderServiceCLI({ logger: this.logger });
    this.useRemotion = process.env.USE_REMOTION === 'true';

    // ⭐ 新增：初始化模板风格分析服务
    this.templateStyleAnalyzer = new TemplateStyleAnalyzer({
      logger: this.logger
    });

    this.logger.info(`✅ ProjectManager初始化完成（Remotion: ${this.useRemotion ? '启用' : '禁用'}, 断点续传: 启用, 规则引擎: 启用）`);
    this.logger.info(`   - 硬性规则: ${this.ruleEngine.hardRules.size}条`);
    this.logger.info(`   - 软性规则: ${this.ruleEngine.softRules.size}条`);
    this.logger.info(`   - 验证门: ${Object.keys(this.gates).length}个`);
  }

  /**
   * ⭐⭐⭐ 新增：基于状态机的执行流程（规则驱动版本）
   *
   * 工作流状态：
   * INIT → ANALYZING → ANALYSIS_VALIDATED → DESIGNING → DESIGN_VALIDATED
   *      → GENERATING → GENERATION_VALIDATED → RENDERING → COMPLETED
   *
   * @param {string} videoPath - 视频路径
   * @param {Object} options - 选项
   * @param {Function} options.onStateChange - 状态变化回调（用于UI更新）
   * @returns {Promise<Object>} 执行结果
   */
  async executeWithStateMachine(videoPath, options = {}) {
    const taskId = `project_sm_${Date.now()}`;

    // 重置状态机
    this.stateMachine.reset();

    // 设置状态变化回调
    if (options.onStateChange) {
      this.onStateChange = options.onStateChange;
    }

    this.logger.info('🎯 ProjectManager: 开始规则驱动执行');
    this.logger.info(`  任务ID: ${taskId}`);
    this.logger.info(`  视频路径: ${videoPath}`);
    this.logger.info(`  当前状态: ${this.stateMachine.getState()}`);

    const trace = this.tracer.startTrace(`ProjectManager.executeWithStateMachine`);
    const rootSpan = trace.getRootSpan();
    rootSpan.setAttributes({
      'project.taskId': taskId,
      'project.videoPath': videoPath,
      'project.mode': 'state_machine'
    });

    try {
      // 获取视频时长
      const videoDuration = await this.getVideoDuration(videoPath);

      // ========== 阶段1: 内容分析 ==========
      this.logger.info('\n📊 阶段1: 内容分析');

      // 转换到 ANALYZING 状态
      let result = await this.stateMachine.transition(WorkflowState.ANALYZING, {
        videoPath
      });
      if (!result.success) {
        throw new Error(`状态转换失败: ${result.error}`);
      }

      // 执行内容分析
      const contentResult = await this.agents.contentAnalyst.run({ videoPath });
      const keywords = contentResult?.keywords || [];
      const transcript = contentResult?.transcript || '';

      // 转换到 ANALYSIS_VALIDATED 状态（触发Gate1验证）
      result = await this.stateMachine.transition(WorkflowState.ANALYSIS_VALIDATED, {
        keywords,
        transcript,
        videoDuration
      });
      if (!result.success) {
        throw new Error(`内容验证失败: ${result.error}`);
      }
      this.logger.info(`  ✅ Gate1通过: ${keywords.length}个关键词`);

      // ========== 阶段2: 场景设计 ==========
      this.logger.info('\n📊 阶段2: 场景设计');

      // 转换到 DESIGNING 状态
      result = await this.stateMachine.transition(WorkflowState.DESIGNING, {});
      if (!result.success) {
        throw new Error(`状态转换失败: ${result.error}`);
      }

      // 执行场景设计
      const sceneResult = await this.agents.sceneDesigner.run({
        keywords,
        videoMetadata: { duration: videoDuration, path: videoPath, transcript }
      });
      const scenes = sceneResult?.scenes || [];

      // 转换到 DESIGN_VALIDATED 状态（触发Gate2验证 - 核心规则验证）
      result = await this.stateMachine.transition(WorkflowState.DESIGN_VALIDATED, {
        scenes,
        videoDuration
      });

      if (!result.success) {
        // 检查是否有自动修复
        if (result.result === TransitionResult.FIXED) {
          this.logger.info(`  ⚠️ Gate2自动修复了场景设计`);
        } else {
          throw new Error(`场景验证失败: ${result.error}\n违规: ${JSON.stringify(result.violations)}`);
        }
      }
      this.logger.info(`  ✅ Gate2通过: ${scenes.length}个场景`);

      // ========== 阶段3: 层生成 ==========
      this.logger.info('\n📊 阶段3: 层生成');

      // 转换到 GENERATING 状态
      result = await this.stateMachine.transition(WorkflowState.GENERATING, {});
      if (!result.success) {
        throw new Error(`状态转换失败: ${result.error}`);
      }

      // 执行层协调
      const timeline = {
        version: '3.0',
        duration: videoDuration,
        clips: scenes
      };
      const layerResult = await this.agents.layerOrchestrator.run({
        timeline,
        videoPath
      });

      // 转换到 GENERATION_VALIDATED 状态（触发Gate3验证）
      result = await this.stateMachine.transition(WorkflowState.GENERATION_VALIDATED, {
        timeline: layerResult?.timeline || timeline
      });
      if (!result.success) {
        throw new Error(`层验证失败: ${result.error}`);
      }
      this.logger.info(`  ✅ Gate3通过: 层生成完成`);

      // ========== 阶段4: 视频渲染 ==========
      this.logger.info('\n📊 阶段4: 视频渲染');

      // 转换到 RENDERING 状态
      result = await this.stateMachine.transition(WorkflowState.RENDERING, {});
      if (!result.success) {
        throw new Error(`状态转换失败: ${result.error}`);
      }

      // 执行视频合成
      const composeResult = await this.agents.videoEngineer.run({
        timeline: layerResult?.timeline || timeline,
        videoPath
      });
      const outputPath = composeResult?.finalVideo || composeResult;

      // 转换到 COMPLETED 状态（触发Gate4验证）
      result = await this.stateMachine.transition(WorkflowState.COMPLETED, {
        outputPath,
        videoDuration,
        expectedDuration: videoDuration
      });
      if (!result.success) {
        throw new Error(`输出验证失败: ${result.error}`);
      }
      this.logger.info(`  ✅ Gate4通过: 视频生成完成`);

      // ========== 完成 ==========
      this.tracer.endTrace(trace.traceId);

      this.logger.info('\n✅ 规则驱动工作流执行完成');
      this.logger.info(`  最终状态: ${this.stateMachine.getState()}`);
      this.logger.info(`  状态转换历史: ${this.stateMachine.getHistory().length}次`);

      return {
        success: true,
        taskId,
        videoPath: outputPath,
        timeline: layerResult?.timeline || timeline,
        stateMachineHistory: this.stateMachine.getHistory(),
        ruleValidations: {
          hardRulesChecked: this.ruleEngine.getStats().hardRulesCount,
          softRulesChecked: this.ruleEngine.getStats().softRulesCount
        }
      };

    } catch (error) {
      this.logger.error(`❌ 规则驱动工作流失败: ${error.message}`);

      // 记录失败状态
      rootSpan.recordError(error);
      this.tracer.endTrace(trace.traceId);

      return {
        success: false,
        taskId,
        error: error.message,
        currentState: this.stateMachine.getState(),
        stateMachineHistory: this.stateMachine.getHistory()
      };
    }
  }

  /**
   * 主执行流程（支持断点续传）
   * @param {string} videoPath - 视频路径
   * @param {Object} options - 选项
   * @param {string} options.resumeTaskId - 恢复任务ID（可选）
   * @returns {Promise<Object>} 执行结果
   */
  async execute(videoPath, options = {}) {
    // 生成任务ID
    const taskId = options.resumeTaskId || `project_${Date.now()}`;

    // ⭐⭐⭐ 重置所有Agent的熔断器，确保新任务不受之前失败的影响
    this.resetAllAgents();

    // 开始追踪
    const trace = this.tracer.startTrace(`ProjectManager.execute`);
    const rootSpan = trace.getRootSpan();
    rootSpan.setAttributes({
      'project.taskId': taskId,
      'project.videoPath': videoPath,
      'project.resume': !!options.resumeTaskId
    });

    this.logger.info('🎯 ProjectManager: 开始执行');
    this.logger.info(`  任务ID: ${taskId}`);
    this.logger.info(`  视频路径: ${videoPath}`);

    try {
      // ⭐ 检查是否有可恢复的检查点
      let resumeData = null;
      if (options.resumeTaskId) {
        const recovery = await this.checkpointManager.recoverTask(taskId);
        if (recovery) {
          resumeData = recovery.data;
          this.logger.info(`  ✅ 从检查点恢复: ${recovery.resumeStep}`);
          rootSpan.addEvent('checkpoint_recovered', { step: recovery.resumeStep });
        }
      }

      // ⭐ 步骤0: 分析模板视频风格（如果提供了模板）
      let styleConfig = resumeData?.styleConfig || null;
      if (!styleConfig && options.templateVideoPath) {
        this.logger.info('🎨 分析模板视频风格...');
        try {
          styleConfig = await this.templateStyleAnalyzer.analyzeTemplateStyle(options.templateVideoPath);
          this.logger.info('  ✅ 模板风格分析完成');

          // 保存检查点
          this.checkpointManager.createCheckpoint(taskId, 'style_analyzed', { styleConfig });
        } catch (error) {
          this.logger.warn('  ⚠️  模板风格分析失败，使用默认风格', { error: error.message });
        }
      }

      // 步骤1: 制定执行计划
      const plan = resumeData?.plan || await this.createExecutionPlan(videoPath, { ...options, styleConfig });
      this.logger.logPlan(plan);

      // 保存检查点
      if (!resumeData?.plan) {
        this.checkpointManager.createCheckpoint(taskId, 'plan_created', { plan, styleConfig });
      }

      // 步骤2: 执行计划（支持从检查点恢复）
      const result = await this.executePlanWithCheckpoint(plan, taskId, resumeData);

      // 步骤3: 最终验收
      const finalCheck = await this.qualityDirector.finalReview(result);

      // 保存最终检查点
      this.checkpointManager.createCheckpoint(taskId, 'completed', {
        plan,
        result,
        finalCheck,
        styleConfig
      });

      // 结束追踪
      this.tracer.endTrace(trace.traceId);

      if (finalCheck.passed) {
        this.logger.info('✅ ProjectManager: 任务完成');

        // 生成报告
        const report = this.logger.generateReport();

        return {
          success: true,
          taskId: taskId,
          videoPath: result.finalVideo,
          timeline: result.timeline,
          report: report,
          qualityScore: finalCheck.score
        };

      } else {
        this.logger.warn('⚠️ ProjectManager: 质量不合格');
        this.logger.warn(`  违规项: ${finalCheck.violations.length}个`);

        // ⭐ 过滤出需要返工的违规项（只处理CRITICAL和HIGH级别）
        const criticalViolations = finalCheck.violations.filter(v =>
          v.severity === 'CRITICAL' || v.severity === 'HIGH'
        );
        const lowViolations = finalCheck.violations.filter(v =>
          v.severity === 'LOW' || v.severity === 'MEDIUM'
        );

        if (lowViolations.length > 0) {
          this.logger.info(`  ℹ️ 低级别违规项: ${lowViolations.length}个（不触发返工）`);
          lowViolations.forEach(v => {
            this.logger.info(`    - ${v.message || v.violation} (${v.severity})`);
          });
        }

        // ⭐ 只有CRITICAL和HIGH级别的违规才触发返工
        if (criticalViolations.length > 0 && options.allowRework !== false) {
          this.logger.info(`  → 启动智能返工流程（${criticalViolations.length}个关键违规）...`);
          // ⭐ 修复：传递 allResults 而不是整个 result 对象
          // ReworkEngine.preserveSuccessfulPhases 期望的是 { task_1_2: {...}, task_2_1: {...} } 格式
          return await this.handleRework(criticalViolations, plan, result.allResults || result);
        }

        // ⭐ 如果只有LOW/MEDIUM级别违规，视为成功但带警告
        if (criticalViolations.length === 0) {
          this.logger.info('✅ ProjectManager: 执行成功（有低级别警告）');

          // 生成报告
          const report = this.logger.generateReport();

          return {
            success: true,
            taskId: taskId,
            videoPath: result.finalVideo,
            timeline: result.timeline,
            report: report,
            qualityScore: finalCheck.score,
            warnings: finalCheck.violations, // 将低级别违规作为警告返回
            suggestions: finalCheck.suggestions
          };
        }

        return {
          success: false,
          taskId: taskId,
          error: '质量检查未通过',
          violations: finalCheck.violations,
          warnings: finalCheck.warnings,
          suggestions: finalCheck.suggestions
        };
      }

    } catch (error) {
      this.logger.error('❌ ProjectManager: 执行失败', { error: error.message });

      // 保存失败检查点
      this.checkpointManager.createCheckpoint(taskId, 'failed', {
        error: error.message,
        videoPath
      });

      // 结束追踪
      rootSpan.recordError(error);
      this.tracer.endTrace(trace.traceId);

      return await this.handleCriticalFailure(error);
    }
  }

  /**
   * 执行计划（支持检查点恢复）
   * @param {Object} plan - 执行计划
   * @param {string} taskId - 任务ID
   * @param {Object} resumeData - 恢复数据
   * @returns {Promise<Object>} 执行结果
   */
  async executePlanWithCheckpoint(plan, taskId, resumeData = null) {
    this.logger.info('🚀 ProjectManager: 开始执行计划');

    const results = resumeData?.results || {};
    const qualityChecks = resumeData?.qualityChecks || {};
    const startPhase = resumeData?.currentPhase || 1;

    // 执行5个阶段
    for (let i = startPhase; i <= 5; i++) {
      const phase = plan[`phase${i}`];
      this.logger.startPhase(phase.name);

      try {
        const phaseResults = await this.executePhase(phase, results, plan);

        // 合并结果
        Object.assign(results, phaseResults);

        // 保存质量检查结果
        for (const [taskIdKey, result] of Object.entries(phaseResults)) {
          if (taskIdKey.includes('quality') || taskIdKey.includes('check') ||
              taskIdKey.startsWith('task_1_3') || taskIdKey.startsWith('task_2_2') ||
              taskIdKey.startsWith('task_4_') || taskIdKey.startsWith('task_5_2')) {
            qualityChecks[taskIdKey] = result;
          }
        }

        // ⭐ 保存阶段检查点
        this.checkpointManager.createCheckpoint(taskId, `phase_${i}_completed`, {
          plan,
          results,
          qualityChecks,
          currentPhase: i + 1
        });

        this.logger.endPhase('success', phaseResults);

      } catch (error) {
        this.logger.endPhase('failed', { error: error.message });

        // ⭐ 保存失败检查点
        this.checkpointManager.createCheckpoint(taskId, `phase_${i}_failed`, {
          plan,
          results,
          qualityChecks,
          currentPhase: i,
          error: error.message
        });

        throw error;
      }
    }

    // 返回最终结果
    return {
      finalVideo: results.task_5_1?.finalVideo,
      timeline: results.task_3_1?.timeline,
      qualityChecks: qualityChecks,
      allResults: results
    };
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
      styleConfig: options.styleConfig || null,  // ⭐ 添加风格配置

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
            name: '本地关键词提取',
            agent: 'contentAnalyst',
            method: 'analyzeWithWenxin',
            input: { videoPath },  // ⭐ 添加videoPath参数
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

      // 阶段3: 层协调与素材生成（串行）⭐ 新架构
      phase3: {
        name: 'LayerOrchestration',
        type: 'sequential',
        tasks: [
          {
            id: 'task_3_1',
            name: '层协调与生成',
            agent: 'layerOrchestrator',
            method: 'orchestrateLayers',
            dependsOn: ['task_2_1'],
            input: { videoPath },
            critical: true,
            retryLimit: 3,
            timeout: 120000,
            description: '协调所有层的生成，填充Timeline的layerManifest'
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
            name: 'Timeline完整性检查',
            agent: 'qualityDirector',
            method: 'checkTimelineCompleteness',
            dependsOn: ['task_3_1'],
            critical: true,
            description: '验证所有层都已生成'
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
            dependsOn: ['task_3_1', 'task_4_1'],
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

    // ⭐ 修复Bug #1 & Bug #6: 添加finalVideo字段（task_5_1是视频合成任务的输出）
    // task_5_1返回的是对象 {finalVideo: string, performance: {}}
    if (results.task_5_1) {
      results.finalVideo = results.task_5_1?.finalVideo || results.task_5_1;
      results.performance = results.task_5_1?.performance;
    }

    // ⭐ 提取Timeline数据（从task_3_1 LayerOrchestrator）
    if (results.task_3_1 && results.task_3_1.timeline) {
      results.timeline = results.task_3_1.timeline;
    }

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

    // ⭐ 特殊处理：如果是视频合成任务且启用了Remotion，使用Remotion方案
    if (task.id === 'task_5_1' && this.useRemotion) {
      this.logger.info('  🎨 使用Remotion方案进行视频合成');

      try {
        // 获取内容分析结果
        const contentAnalysis = previousResults.task_1_2;

        // 使用Remotion生成视频
        const finalVideo = await this.generateWithRemotion(contentAnalysis, plan.videoPath);

        return {
          finalVideo,
          performance: {
            fileSize: 0,
            duration: 0
          }
        };
      } catch (error) {
        this.logger.error('⚠️ Remotion渲染失败，回退到传统方案', error);
        // 继续使用传统方案
      }
    }

    // 准备输入
    const input = this.prepareTaskInput(task, previousResults, plan);

    // 获取智能体
    const agent = task.agent === 'qualityDirector'
      ? this.qualityDirector
      : this.agents[task.agent];

    if (!agent) {
      throw new Error(`未找到智能体: ${task.agent}`);
    }

    // ⭐⭐⭐ 关键修复：在每次任务执行前重置该Agent的熔断器
    // 防止同一请求中的重试导致熔断器累积失败次数
    if (agent && typeof agent.reset === 'function') {
      agent.reset();
      this.logger.debug(`  🔄 已重置 ${task.agent} 的熔断器`);
    }

    // 执行任务（带重试）
    const execute = async () => {
      return await agent[task.method](input);
    };

    try {
      if (task.retryLimit && task.retryLimit > 0) {
        // ⭐ 使用改进的重试处理器（支持指数退避）
        return await this.retryHandler.retryWithBackoff(execute, {
          maxRetries: task.retryLimit,
          strategy: 'exponential', // 指数退避策略
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

    // ⭐ 添加风格配置到所有任务（如果存在）
    if (plan.styleConfig) {
      input.styleConfig = plan.styleConfig;
    }

    // 添加依赖任务的结果
    if (task.dependsOn) {
      for (const depTaskId of task.dependsOn) {
        input[depTaskId] = previousResults[depTaskId];
      }
    }

    // ⭐ 特殊处理：为SceneDesigner准备输入（契约要求keywords和videoMetadata）
    if (task.method === 'decomposeScenes') {
      // 从ContentAnalyst的结果中获取keywords
      const contentAnalysisResult = previousResults.task_1_2;

      input.keywords = contentAnalysisResult?.keywords || [];
      input.videoMetadata = {
        duration: plan.videoDuration,
        path: plan.videoPath,
        // 从ContentAnalyst获取更多元数据
        transcript: contentAnalysisResult?.transcript || '',
        understanding: contentAnalysisResult?.understanding || {}
      };
    }

    // ⭐ 特殊处理：为LayerOrchestrator准备timeline
    if (task.method === 'orchestrateLayers') {
      // LayerOrchestrator需要timeline对象（包含clips数组和layerManifest）
      const sceneDesignResult = previousResults.task_2_1;

      input.timeline = {
        version: '2.0',
        duration: plan.videoDuration,
        clips: sceneDesignResult?.scenes || []
      };

      input.videoPath = plan.videoPath;
    }

    // ⭐ 特殊处理：为finalCheck添加完整上下文
    if (task.method === 'finalCheck') {
      // ⭐ Bug #5 & Bug #6修复：添加finalVideo和performance字段
      // task_5_1返回的是对象 {finalVideo: string, performance: {}}
      input.finalVideo = previousResults.task_5_1?.finalVideo || previousResults.task_5_1;
      input.performance = previousResults.task_5_1?.performance || previousResults.task_5_1_performance || {
        fileSize: 0,
        duration: 0
      };

      input.context = {
        // 内容分析结果
        contentAnalysis: previousResults.task_1_2?.understanding,
        // 场景设计结果
        sceneDesign: previousResults.task_2_1,
        // LayerOrchestrator结果（新架构）
        layerOrchestration: previousResults.task_3_1,
        // 原视频路径
        videoPath: plan.videoPath
      };
    }

    // ⭐ 特殊处理：为VideoEngineer的composeVideo准备Timeline
    if (task.method === 'composeVideo') {
      // 从LayerOrchestrator获取填充完整的Timeline
      const orchestrationResult = previousResults.task_3_1;

      input.timeline = orchestrationResult?.timeline;
      input.uiState = orchestrationResult?.uiState;
      input.videoPath = plan.videoPath;
    }

    return input;
  }

  /**
   * 处理返工（带重试循环）
   * @param {Array<string>} violations - 违规项列表
   * @param {Object} plan - 原计划
   * @param {Object} currentResults - 当前结果
   * @returns {Promise<Object>} 返工结果
   */
  async handleRework(violations, plan, currentResults = {}) {
    this.logger.info('🔄 ProjectManager: 启动智能返工系统');
    this.logger.info(`  违规项: ${violations.length}个`);

    const maxCycles = this.reworkEngine.maxReworkCycles;

    // 返工循环
    for (let cycle = 1; cycle <= maxCycles; cycle++) {
      this.logger.info(`\n🔄 返工周期 ${cycle}/${maxCycles}`);

      // 记录错误到内存（标记为未修复）
      violations.forEach(v => {
        const classified = ViolationClassifier.classify(v);
        this.errorMemory.recordError(classified, classified.category, false);
      });

      // 执行返工
      const reworkResult = await this.reworkEngine.execute(
        violations,
        plan,
        currentResults,
        {
          qualityDirector: this.qualityDirector,
          agents: this.agents
        }
      );

      if (!reworkResult.success) {
        // 返工执行失败
        this.logger.error(`  ❌ 返工执行失败: ${reworkResult.error}`);
        return {
          success: false,
          error: reworkResult.error,
          phase: reworkResult.phase,
          details: reworkResult.details,
          violations: violations
        };
      }

      // 再次进行最终检查
      this.logger.info(`\n🔍 重新进行质量检查...`);

      // ⭐ 修复Bug #3: 直接传入reworkResult（已包含qualityChecks和finalVideo）
      const recheckResult = await this.qualityDirector.finalReview(reworkResult);

      if (recheckResult.passed) {
        this.logger.info(`\n✅ 返工成功！（第${cycle}次尝试）`);

        // 记录成功修正
        violations.forEach(v => {
          const classified = ViolationClassifier.classify(v);
          this.errorMemory.recordError(classified, classified.category, true);
        });

        // 更新AGENTS.md
        try {
          this.errorMemory.updateAgentsDoc('vidslide-ai/AGENTS.md');
        } catch (error) {
          this.logger.warn(`  ⚠️ 更新AGENTS.md失败: ${error.message}`);
        }

        return {
          success: true,
          videoPath: reworkResult.results.task_5_1?.finalVideo || reworkResult.results.task_5_1,
          reworkCycles: cycle,
          qualityScore: recheckResult.score,
          phasesReworked: reworkResult.phasesReworked
        };
      }

      // 更新violations为新的违规项
      violations = recheckResult.violations;
      currentResults = reworkResult.results;

      this.logger.warn(`  ⚠️ 第${cycle}次返工后仍有${violations.length}个违规项`);
    }

    // 达到最大返工次数
    this.logger.error(`\n❌ 返工失败（已达${maxCycles}次上限）`);

    return {
      success: false,
      error: `返工${maxCycles}次后仍未通过质量检查`,
      violations: violations,
      suggestions: ['请人工检查代码逻辑', '查看ERROR_MEMORY.json了解历史错误']
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
   * ⭐ 重置所有Agent的状态和熔断器
   * 在每次新任务开始时调用，确保不受之前失败的影响
   */
  resetAllAgents() {
    this.logger.info('🔄 重置所有Agent状态和熔断器...');

    // 重置所有核心Agent
    for (const [name, agent] of Object.entries(this.agents)) {
      if (agent && typeof agent.reset === 'function') {
        agent.reset();
        this.logger.debug(`  ✅ ${name} 已重置`);
      }
    }

    // 重置QualityDirector
    if (this.qualityDirector && typeof this.qualityDirector.reset === 'function') {
      this.qualityDirector.reset();
      this.logger.debug(`  ✅ qualityDirector 已重置`);
    }

    this.logger.info('  ✅ 所有Agent已重置');
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
        status: typeof this.agents[key].getStatus === 'function'
          ? this.agents[key].getStatus()
          : { ready: true }
      })),
      qualityDirector: typeof this.qualityDirector.getStatus === 'function'
        ? this.qualityDirector.getStatus()
        : { ready: true },
      // ⭐ 新增：状态机和规则引擎状态
      stateMachine: this.stateMachine.getStats(),
      ruleEngine: this.ruleEngine.getStats(),
      gates: Object.keys(this.gates)
    };
  }

  /**
   * ⭐ 使用Remotion方案生成视频
   * @param {Object} analysis - 内容分析结果
   * @param {string} videoPath - 原视频路径
   * @returns {Promise<string>} 最终视频路径
   */
  async generateWithRemotion(analysis, videoPath) {
    this.logger.info('  🎨 使用Remotion渲染...');

    try {
      // 1. 转换为Remotion场景数据
      const scenes = this.convertToRemotionScenes(analysis, videoPath);
      this.logger.info(`  - 生成 ${scenes.length} 个场景`);

      // 2. 渲染场景
      const renderedVideos = await this.remotionService.renderScenes(scenes);
      this.logger.info(`  - 渲染完成 ${renderedVideos.length} 个片段`);

      // 3. 合并片段
      const finalVideo = await this.remotionService.mergeVideos(renderedVideos);
      this.logger.info(`  ✅ 最终视频: ${finalVideo}`);

      return finalVideo;
    } catch (error) {
      this.logger.error('⚠️ Remotion渲染失败，回退到传统方案', error);
      // 自动回退到传统方案
      return await this.generateWithOldMethod(analysis, videoPath);
    }
  }

  /**
   * ⭐ 转换为Remotion场景数据
   * @param {Object} analysis - 内容分析结果
   * @param {string} videoPath - 原视频路径
   * @returns {Array} Remotion场景数组
   */
  convertToRemotionScenes(analysis, videoPath) {
    const scenes = [];

    // 如果analysis有segments属性
    if (analysis.segments && Array.isArray(analysis.segments)) {
      for (const segment of analysis.segments) {
        if (segment.type === 'original') {
          scenes.push({
            id: segment.id || `scene_${scenes.length}`,
            template: 'OriginalVideo',
            props: {
              videoPath,
              startTime: segment.startTime || 0,
              duration: (segment.endTime || segment.duration || 3) - (segment.startTime || 0)
            }
          });
        } else if (segment.type === 'withCards') {
          scenes.push({
            id: segment.id || `scene_${scenes.length}`,
            template: 'VideoWithCards',
            props: {
              videoPath,
              startTime: segment.startTime || 0,
              duration: (segment.endTime || segment.duration || 3) - (segment.startTime || 0),
              keywords: segment.keywords || []
            }
          });
        } else if (segment.type === 'multiLayer') {
          scenes.push({
            id: segment.id || `scene_${scenes.length}`,
            template: 'MultiLayer',
            props: {
              videoPath,
              startTime: segment.startTime || 0,
              duration: (segment.endTime || segment.duration || 3) - (segment.startTime || 0),
              materialImage: segment.materialImage,
              cardText: segment.keywords?.[0],
              pipVideo: segment.pipVideo
            }
          });
        }
      }
    } else {
      // 如果没有segments，创建一个默认场景
      this.logger.warn('  ⚠️ 分析结果中没有segments，创建默认场景');
      scenes.push({
        id: 'default_scene',
        template: 'OriginalVideo',
        props: {
          videoPath,
          startTime: 0,
          duration: 10
        }
      });
    }

    return scenes;
  }

  /**
   * ⭐ 使用传统方案生成视频（保持不变）
   * @param {Object} analysis - 内容分析结果
   * @param {string} videoPath - 原视频路径
   * @returns {Promise<string>} 最终视频路径
   */
  async generateWithOldMethod(analysis, videoPath) {
    this.logger.info('  📌 使用传统方案');
    // 现有逻辑保持不变
    const scenes = await this.agents.sceneDesigner.design(analysis);
    const renderData = await this.agents.videoEngineer.prepare(scenes);
    const finalVideo = await this.agents.layerOrchestrator.compose(
      videoPath,
      scenes,
      renderData
    );
    return finalVideo;
  }
}

export default ProjectManager;
