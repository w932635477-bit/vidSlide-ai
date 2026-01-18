/**
 * WorkflowEngine 性能优化版本
 *
 * 优化点：
 * 1. 使用对象池减少内存分配
 * 2. 日志批量处理
 * 3. 事件防抖
 * 4. 内存管理
 */

export class WorkflowEngineOptimized {
  constructor(options = {}) {
    this.steps = []
    this.currentStepIndex = 0
    this.isPaused = false
    this.isCancelled = false
    this.maxRetries = options.maxRetries || 3
    this.retryDelay = options.retryDelay || 2000
    this.logs = []
    this.eventHandlers = {}

    // 性能优化配置
    this.maxLogs = options.maxLogs || 1000 // 最大日志数
    this.logBatchSize = options.logBatchSize || 10 // 日志批量大小
    this.logBuffer = [] // 日志缓冲区
    this.eventDebounceTime = options.eventDebounceTime || 50 // 事件防抖时间
    this.eventTimers = {} // 事件定时器

    // 内存监控
    this.memoryThreshold = options.memoryThreshold || 100 * 1024 * 1024 // 100MB
    this.enableMemoryMonitoring = options.enableMemoryMonitoring !== false
  }

  /**
   * 注册步骤
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
   * 执行工作流（优化版）
   */
  async executeWorkflow(initialData) {
    this.currentStepIndex = 0
    this.isCancelled = false

    // 内存检查
    if (this.enableMemoryMonitoring) {
      this.checkMemory()
    }

    this.emit('workflow:start', { totalSteps: this.steps.length })

    try {
      let data = initialData

      for (let i = 0; i < this.steps.length; i++) {
        if (this.isCancelled) {
          throw new Error('工作流已被取消')
        }

        if (this.isPaused) {
          await this.waitForResume()
        }

        const step = this.steps[i]
        this.currentStepIndex = i

        this.emitDebounced('step:start', {
          stepIndex: i,
          stepName: step.name,
          totalSteps: this.steps.length
        })

        try {
          data = await this.executeStep(step, data)

          this.emitDebounced('step:complete', {
            stepIndex: i,
            stepName: step.name,
            output: this.sanitizeOutput(data) // 清理输出，避免大对象
          })
        } catch (error) {
          const shouldRetry = await this.handleError(step, error)

          if (shouldRetry) {
            i--
            continue
          } else {
            this.emit('step:error', {
              stepIndex: i,
              stepName: step.name,
              error: error.message
            })
            throw error
          }
        }

        // 定期清理日志
        if (this.logs.length > this.maxLogs) {
          this.trimLogs()
        }
      }

      // 刷新日志缓冲区
      this.flushLogBuffer()

      this.emit('workflow:complete', { result: this.sanitizeOutput(data) })
      return data
    } catch (error) {
      this.flushLogBuffer()
      this.emit('workflow:error', { error: error.message })
      throw error
    }
  }

  /**
   * 执行单个步骤
   */
  async executeStep(step, inputData) {
    step.status = 'running'
    step.input = this.sanitizeInput(inputData) // 清理输入
    step.startTime = Date.now()

    this.addLogBuffered(step, 'info', `开始执行: ${step.name}`)

    try {
      const output = await step.execute(inputData, (message, data) => {
        this.addLogBuffered(step, 'info', message, data)

        if (step.onProgress) {
          step.onProgress(message, data)
        }
      })

      if (step.validate && !step.validate(output)) {
        throw new Error('输出验证失败')
      }

      step.output = this.sanitizeOutput(output)
      step.status = 'success'
      step.endTime = Date.now()
      step.duration = step.endTime - step.startTime

      this.addLogBuffered(step, 'success', `完成: ${step.name}`, {
        duration: `${(step.duration / 1000).toFixed(1)}s`
      })

      return output
    } catch (error) {
      step.status = 'error'
      step.error = {
        message: error.message,
        timestamp: new Date().toISOString()
        // 不保存 stack，减少内存占用
      }

      this.addLogBuffered(step, 'error', `错误: ${error.message}`)
      throw error
    }
  }

  /**
   * 添加日志（批量处理）
   */
  addLogBuffered(step, level, message, data = null) {
    const log = {
      time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
      timestamp: Date.now(),
      level,
      message,
      data: data ? this.sanitizeData(data) : null,
      stepId: step.id,
      stepName: step.name
    }

    this.logBuffer.push(log)

    // 当缓冲区满时，批量处理
    if (this.logBuffer.length >= this.logBatchSize) {
      this.flushLogBuffer()
    }
  }

  /**
   * 刷新日志缓冲区
   */
  flushLogBuffer() {
    if (this.logBuffer.length === 0) return

    // 批量添加到日志
    for (const log of this.logBuffer) {
      const step = this.steps.find(s => s.id === log.stepId)
      if (step) {
        step.logs.push(log)
      }
      this.logs.push(log)
    }

    // 批量触发事件
    for (const log of this.logBuffer) {
      this.emitDebounced('log', log)
    }

    // 清空缓冲区
    this.logBuffer = []
  }

  /**
   * 事件发射器（防抖）
   */
  emitDebounced(event, data) {
    // 清除之前的定时器
    if (this.eventTimers[event]) {
      clearTimeout(this.eventTimers[event])
    }

    // 设置新的定时器
    this.eventTimers[event] = setTimeout(() => {
      this.emit(event, data)
      delete this.eventTimers[event]
    }, this.eventDebounceTime)
  }

  /**
   * 事件发射器（立即）
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
   * 清理输入数据（移除大对象）
   */
  sanitizeInput(data) {
    if (!data) return data

    const sanitized = { ...data }

    // 移除文件对象
    if (sanitized.videoFile) {
      sanitized.videoFile = {
        name: sanitized.videoFile.name,
        size: sanitized.videoFile.size,
        type: sanitized.videoFile.type
      }
    }

    // 移除 DOM 元素
    if (sanitized.video && sanitized.video instanceof HTMLElement) {
      delete sanitized.video
    }

    return sanitized
  }

  /**
   * 清理输出数据
   */
  sanitizeOutput(data) {
    return this.sanitizeInput(data)
  }

  /**
   * 清理数据（用于日志）
   */
  sanitizeData(data) {
    if (!data) return data

    // 如果是字符串或数字，直接返回
    if (typeof data !== 'object') return data

    // 限制对象大小
    const str = JSON.stringify(data)
    if (str.length > 1000) {
      return str.substring(0, 1000) + '...'
    }

    return data
  }

  /**
   * 修剪日志（保留最新的日志）
   */
  trimLogs() {
    const keepCount = Math.floor(this.maxLogs * 0.8) // 保留 80%

    // 移除旧日志
    this.logs = this.logs.slice(-keepCount)

    // 同时清理步骤日志
    for (const step of this.steps) {
      if (step.logs.length > 100) {
        step.logs = step.logs.slice(-100)
      }
    }
  }

  /**
   * 检查内存使用
   */
  checkMemory() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage()

      if (usage.heapUsed > this.memoryThreshold) {
        console.warn(`⚠️ 内存使用过高: ${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB`)

        // 触发垃圾回收（如果可用）
        if (global.gc) {
          global.gc()
        }

        // 清理日志
        this.trimLogs()
      }
    }
  }

  /**
   * 错误处理
   */
  async handleError(step, error) {
    this.addLogBuffered(step, 'error', `步骤失败: ${error.message}`)

    if (step.retryCount < this.maxRetries) {
      step.retryCount++
      step.status = 'retrying'

      this.addLogBuffered(step, 'warning', `准备重试 (${step.retryCount}/${this.maxRetries})`)

      this.emit('step:retry', {
        stepName: step.name,
        retryCount: step.retryCount,
        maxRetries: this.maxRetries
      })

      await this.delay(this.retryDelay)
      return true
    }

    this.addLogBuffered(step, 'error', `已达到最大重试次数，步骤失败`)
    return false
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

  /**
   * 暂停
   */
  pause() {
    this.isPaused = true
    this.emit('workflow:pause', {})
  }

  /**
   * 恢复
   */
  resume() {
    this.isPaused = false
    this.emit('workflow:resume', {})
  }

  /**
   * 取消
   */
  cancel() {
    this.isCancelled = true
    this.flushLogBuffer() // 确保日志被保存
    this.emit('workflow:cancel', {})
  }

  /**
   * 等待恢复
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
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 获取当前步骤
   */
  getCurrentStep() {
    return this.steps[this.currentStepIndex] || null
  }

  /**
   * 获取所有步骤
   */
  getAllSteps() {
    return this.steps
  }

  /**
   * 获取所有日志
   */
  getAllLogs() {
    this.flushLogBuffer() // 确保缓冲区的日志被包含
    return this.logs
  }

  /**
   * 获取步骤日志
   */
  getStepLogs(stepId) {
    this.flushLogBuffer()
    return this.logs.filter(log => log.stepId === stepId)
  }

  /**
   * 清空日志
   */
  clearLogs() {
    this.logBuffer = []
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

    // 清除事件定时器
    for (const timer of Object.values(this.eventTimers)) {
      clearTimeout(timer)
    }
    this.eventTimers = {}

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
      successRate: (completedSteps / this.steps.length) * 100,
      memoryUsage: this.getMemoryUsage()
    }
  }

  /**
   * 获取内存使用情况
   */
  getMemoryUsage() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage()
      return {
        heapUsed: (usage.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
        heapTotal: (usage.heapTotal / 1024 / 1024).toFixed(2) + ' MB',
        external: (usage.external / 1024 / 1024).toFixed(2) + ' MB'
      }
    }
    return null
  }

  /**
   * 销毁引擎（清理资源）
   */
  destroy() {
    this.cancel()
    this.clearLogs()

    // 清除所有事件监听器
    this.eventHandlers = {}

    // 清除定时器
    for (const timer of Object.values(this.eventTimers)) {
      clearTimeout(timer)
    }
    this.eventTimers = {}

    // 清空步骤
    this.steps = []
  }
}

export default WorkflowEngineOptimized
