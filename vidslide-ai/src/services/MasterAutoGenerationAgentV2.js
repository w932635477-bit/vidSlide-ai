/**
 * VidSlide AI - 主自动化生成引擎（增强版）
 *
 * 功能：一键完成从视频到PPT+视频的全自动化流程
 *
 * 新架构：
 * - 集成 WorkflowOrchestrator 智能编排
 * - 集成 WorkflowEngine 工作流引擎
 * - 完整的错误处理和重试机制
 * - 详细的日志记录和监控
 * - 智能降级策略
 *
 * 工作流程：
 * 1. 视频分析: 语音识别、关键帧提取、场景检测、内容分析
 * 2. 智能推荐: 自动选择最佳模板
 * 3. 素材匹配: 自动搜索和选择匹配素材
 * 4. 内容组合: 自动填充模板、生成场景序列
 * 5. 渲染合成: 渲染场景、生成预览
 */

import { VideoProcessingService } from './VideoProcessingService.js'
import { getBaiduNLPService } from './BaiduNLPService.js'
import { WorkflowOrchestrator } from './WorkflowOrchestrator.js'
import TemplateArchitecture from '../utils/TemplateArchitecture.js'

/**
 * 主自动化生成引擎类（增强版）
 */
export class MasterAutoGenerationAgent {
  constructor() {
    // 依赖的服务
    this.videoService = new VideoProcessingService()
    this.nlpService = getBaiduNLPService()

    // 工作流编排器
    this.orchestrator = new WorkflowOrchestrator()

    // 状态
    this.isProcessing = false
    this.currentStep = ''
    this.progress = 0
    this.result = null

    // 事件处理器
    this.eventHandlers = {}

    // 初始化工作流引擎事件监听
    this.setupEngineListeners()
  }

  /**
   * 设置引擎事件监听
   */
  setupEngineListeners() {
    const engine = this.orchestrator.getEngine()

    // 工作流开始
    engine.on('workflow:start', data => {
      this.emit('workflow:start', data)
    })

    // 工作流完成
    engine.on('workflow:complete', data => {
      this.emit('workflow:complete', data)
    })

    // 工作流错误
    engine.on('workflow:error', data => {
      this.emit('workflow:error', data)
    })

    // 步骤开始
    engine.on('step:start', data => {
      this.currentStep = data.stepName
      this.emit('step:start', data)
    })

    // 步骤完成
    engine.on('step:complete', data => {
      this.emit('step:complete', data)
    })

    // 步骤错误
    engine.on('step:error', data => {
      this.emit('step:error', data)
    })

    // 步骤重试
    engine.on('step:retry', data => {
      this.emit('step:retry', data)
    })

    // 日志
    engine.on('log', log => {
      this.emit('log', log)
    })

    // 暂停
    engine.on('workflow:pause', () => {
      this.emit('workflow:pause', {})
    })

    // 恢复
    engine.on('workflow:resume', () => {
      this.emit('workflow:resume', {})
    })

    // 取消
    engine.on('workflow:cancel', () => {
      this.emit('workflow:cancel', {})
    })
  }

  /**
   * 一键自动生成（新版本）
   * @param {File} videoFile - 视频文件
   * @param {Function} onProgress - 进度回调 {step: string, progress: number}
   * @returns {Promise<GenerationResult>}
   */
  async autoGenerate(videoFile, onProgress) {
    this.isProcessing = true
    this.progress = 0

    try {
      console.log('🚀 开始一键自动生成（增强版）...')

      // 使用 WorkflowOrchestrator 执行工作流
      const result = await this.orchestrator.executeWorkflow(videoFile, {
        onProgress: data => {
          // 计算总体进度
          const engine = this.orchestrator.getEngine()
          const steps = engine.getAllSteps()
          const completedSteps = steps.filter(s => s.status === 'success').length
          const totalSteps = steps.length

          this.progress = Math.round((completedSteps / totalSteps) * 100)

          if (onProgress) {
            onProgress({
              step: this.currentStep,
              progress: this.progress,
              completedSteps,
              totalSteps
            })
          }
        }
      })

      console.log('✅ 自动生成完成（增强版）:', result)

      this.isProcessing = false
      this.result = result

      return result
    } catch (error) {
      console.error('❌ 自动生成失败:', error)
      this.isProcessing = false
      throw new Error(`自动生成失败: ${error.message}`)
    }
  }

  /**
   * 暂停工作流
   */
  pause() {
    const engine = this.orchestrator.getEngine()
    engine.pause()
  }

  /**
   * 恢复工作流
   */
  resume() {
    const engine = this.orchestrator.getEngine()
    engine.resume()
  }

  /**
   * 取消工作流
   */
  cancel() {
    const engine = this.orchestrator.getEngine()
    engine.cancel()
    this.isProcessing = false
    console.log('🛑 自动生成已取消')
  }

  /**
   * 获取所有步骤
   */
  getAllSteps() {
    const engine = this.orchestrator.getEngine()
    return engine.getAllSteps()
  }

  /**
   * 获取当前步骤
   */
  getCurrentStep() {
    const engine = this.orchestrator.getEngine()
    return engine.getCurrentStep()
  }

  /**
   * 获取所有日志
   */
  getAllLogs() {
    const engine = this.orchestrator.getEngine()
    return engine.getAllLogs()
  }

  /**
   * 获取统计信息
   */
  getStatistics() {
    const engine = this.orchestrator.getEngine()
    return engine.getStatistics()
  }

  /**
   * 清空日志
   */
  clearLogs() {
    const engine = this.orchestrator.getEngine()
    engine.clearLogs()
  }

  /**
   * 重置引擎
   */
  reset() {
    const engine = this.orchestrator.getEngine()
    engine.reset()
    this.isProcessing = false
    this.currentStep = ''
    this.progress = 0
    this.result = null
  }

  /**
   * 事件发射器
   */
  emit(event, data) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach(handler => {
        try {
          handler(data)
        } catch (error) {
          console.error(`事件处理器错误 [${event}]:`, error)
        }
      })
    }
  }

  /**
   * 注册事件监听器
   */
  on(event, handler) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = []
    }
    this.eventHandlers[event].push(handler)
  }

  /**
   * 移除事件监听器
   */
  off(event, handler) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event] = this.eventHandlers[event].filter(h => h !== handler)
    }
  }

  // ========== 以下是兼容旧版本的方法 ==========

  /**
   * 更新进度（兼容旧版本）
   */
  updateProgress(step, progress, callback) {
    this.currentStep = step
    this.progress = Math.round(progress)

    if (callback) {
      callback({
        step: this.currentStep,
        progress: this.progress
      })
    }
  }
}

// 导出单例
let instance = null

export function getMasterAutoGenerationAgent() {
  if (!instance) {
    instance = new MasterAutoGenerationAgent()
  }
  return instance
}

export default MasterAutoGenerationAgent
