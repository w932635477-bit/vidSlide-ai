/**
 * VidSlide AI - 工作流引擎
 *
 * 功能：
 * - 步骤编排和执行
 * - 进度跟踪
 * - 错误捕获和重试
 * - 数据验证
 * - 日志记录
 */

export class WorkflowEngine {
  constructor() {
    this.steps = []
    this.currentStepIndex = 0
    this.isPaused = false
    this.isCancelled = false
    this.maxRetries = 3
    this.retryDelay = 2000 // 2秒
    this.logs = []
    this.eventHandlers = {}
  }

  /**
   * 注册步骤
   * @param {Object} step - 步骤定义
   */
  registerStep(step) {
    this.steps.push({
      id: step.id,
      name: step.name,
      execute: step.execute,
      validate: step.validate,
      onProgress: step.onProgress,
      status: 'pending',
      retryCount: 0,
      input: null,
      output: null,
      logs: [],
      error: null,
      startTime: null,
      endTime: null,
      duration: null
    })
  }

  /**
   * 执行工作流
   * @param {Object} initialData - 初始数据
   * @returns {Promise<Object>} - 最终结果
   */
  async executeWorkflow(initialData) {
    this.currentStepIndex = 0
    this.isCancelled = false
    let data = initialData

    this.emit('workflow:start', { totalSteps: this.steps.length })

    try {
      for (let i = 0; i < this.steps.length; i++) {
        // 检查是否取消
        if (this.isCancelled) {
          throw new Error('工作流已被取消')
        }

        // 检查是否暂停
        if (this.isPaused) {
          await this.waitForResume()
        }

        const step = this.steps[i]
        this.currentStepIndex = i

        this.emit('step:start', {
          stepIndex: i,
          stepName: step.name,
          totalSteps: this.steps.length
        })

        try {
          // 执行步骤
          data = await this.executeStep(step, data)

          this.emit('step:complete', {
            stepIndex: i,
            stepName: step.name,
            output: data
          })
        } catch (error) {
          // 错误处理
          const shouldRetry = await this.handleError(step, error)

          if (shouldRetry) {
            i-- // 重试当前步骤
            continue
          } else {
            this.emit('step:error', {
              stepIndex: i,
              stepName: step.name,
              error: error.message
            })
            throw error // 终止流程
          }
        }
      }

      this.emit('workflow:complete', { result: data })
      return data
    } catch (error) {
      this.emit('workflow:error', { error: error.message })
      throw error
    }
  }

  /**
   * 执行单个步骤
   * @param {Object} step - 步骤对象
   * @param {Object} inputData - 输入数据
   * @returns {Promise<Object>} - 输出数据
   */
  async executeStep(step, inputData) {
    step.status = 'running'
    step.input = inputData
    step.startTime = Date.now()

    this.addLog(step, 'info', `开始执行: ${step.name}`)

    try {
      // 执行步骤逻辑
      const output = await step.execute(inputData, (message, data) => {
        this.addLog(step, 'info', message, data)

        // 触发进度事件
        if (step.onProgress) {
          step.onProgress(message, data)
        }
      })

      // 验证输出
      if (step.validate && !step.validate(output)) {
        throw new Error('输出验证失败')
      }

      step.output = output
      step.status = 'success'
      step.endTime = Date.now()
      step.duration = step.endTime - step.startTime

      this.addLog(step, 'success', `完成: ${step.name}`, {
        duration: `${(step.duration / 1000).toFixed(1)}s`
      })

      return output
    } catch (error) {
      step.status = 'error'
      step.error = {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }

      this.addLog(step, 'error', `错误: ${error.message}`)
      throw error
    }
  }

  /**
   * 错误处理
   * @param {Object} step - 步骤对象
   * @param {Error} error - 错误对象
   * @returns {Promise<boolean>} - 是否应该重试
   */
  async handleError(step, error) {
    this.addLog(step, 'error', `步骤失败: ${error.message}`)

    // 检查是否可以重试
    if (step.retryCount < this.maxRetries) {
      step.retryCount++
      step.status = 'retrying'

      this.addLog(step, 'warning', `准备重试 (${step.retryCount}/${this.maxRetries})`)

      this.emit('step:retry', {
        stepName: step.name,
        retryCount: step.retryCount,
        maxRetries: this.maxRetries
      })

      // 等待后重试
      await this.delay(this.retryDelay)
      return true
    }

    // 达到最大重试次数
    this.addLog(step, 'error', `已达到最大重试次数，步骤失败`)
    return false
  }

  /**
   * 添加日志
   * @param {Object} step - 步骤对象
   * @param {string} level - 日志级别
   * @param {string} message - 日志消息
   * @param {Object} data - 附加数据
   */
  addLog(step, level, message, data = null) {
    const log = {
      time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
      timestamp: Date.now(),
      level,
      message,
      data,
      stepId: step.id,
      stepName: step.name
    }

    step.logs.push(log)
    this.logs.push(log)

    // 触发日志事件
    this.emit('log', log)
  }

  /**
   * 事件发射器
   * @param {string} event - 事件名称
   * @param {Object} data - 事件数据
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
   * @param {string} event - 事件名称
   * @param {Function} handler - 处理函数
   */
  on(event, handler) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = []
    }
    this.eventHandlers[event].push(handler)
  }

  /**
   * 移除事件监听器
   * @param {string} event - 事件名称
   * @param {Function} handler - 处理函数
   */
  off(event, handler) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event] = this.eventHandlers[event].filter(h => h !== handler)
    }
  }

  /**
   * 暂停工作流
   */
  pause() {
    this.isPaused = true
    this.emit('workflow:pause', {})
  }

  /**
   * 恢复工作流
   */
  resume() {
    this.isPaused = false
    this.emit('workflow:resume', {})
  }

  /**
   * 取消工作流
   */
  cancel() {
    this.isCancelled = true
    this.emit('workflow:cancel', {})
  }

  /**
   * 等待恢复
   * @returns {Promise<void>}
   */
  async waitForResume() {
    return new Promise(resolve => {
      const checkInterval = setInterval(() => {
        if (!this.isPaused) {
          clearInterval(checkInterval)
          resolve()
        }
      }, 100)
    })
  }

  /**
   * 延迟
   * @param {number} ms - 毫秒数
   * @returns {Promise<void>}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 获取当前步骤
   * @returns {Object|null}
   */
  getCurrentStep() {
    return this.steps[this.currentStepIndex] || null
  }

  /**
   * 获取所有步骤
   * @returns {Array}
   */
  getAllSteps() {
    return this.steps
  }

  /**
   * 获取所有日志
   * @returns {Array}
   */
  getAllLogs() {
    return this.logs
  }

  /**
   * 获取步骤日志
   * @param {string} stepId - 步骤ID
   * @returns {Array}
   */
  getStepLogs(stepId) {
    return this.logs.filter(log => log.stepId === stepId)
  }

  /**
   * 清空日志
   */
  clearLogs() {
    this.logs = []
    this.steps.forEach(step => {
      step.logs = []
    })
  }

  /**
   * 重置引擎
   */
  reset() {
    this.currentStepIndex = 0
    this.isPaused = false
    this.isCancelled = false
    this.clearLogs()

    this.steps.forEach(step => {
      step.status = 'pending'
      step.retryCount = 0
      step.input = null
      step.output = null
      step.error = null
      step.startTime = null
      step.endTime = null
      step.duration = null
    })
  }

  /**
   * 获取工作流统计信息
   * @returns {Object}
   */
  getStatistics() {
    const completedSteps = this.steps.filter(s => s.status === 'success').length
    const failedSteps = this.steps.filter(s => s.status === 'error').length
    const totalDuration = this.steps.reduce((sum, s) => sum + (s.duration || 0), 0)

    return {
      totalSteps: this.steps.length,
      completedSteps,
      failedSteps,
      pendingSteps: this.steps.length - completedSteps - failedSteps,
      totalDuration,
      averageDuration: totalDuration / Math.max(completedSteps, 1),
      successRate: (completedSteps / this.steps.length) * 100
    }
  }
}

export default WorkflowEngine
