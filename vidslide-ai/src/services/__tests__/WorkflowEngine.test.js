/**
 * WorkflowEngine 单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { WorkflowEngine } from '../WorkflowEngine.js'

describe('WorkflowEngine', () => {
  let engine

  beforeEach(() => {
    engine = new WorkflowEngine()
  })

  describe('步骤注册', () => {
    it('应该能够注册步骤', () => {
      engine.registerStep({
        id: 'test-step',
        name: '测试步骤',
        execute: async input => input,
        validate: () => true
      })

      const steps = engine.getAllSteps()
      expect(steps).toHaveLength(1)
      expect(steps[0].id).toBe('test-step')
      expect(steps[0].name).toBe('测试步骤')
      expect(steps[0].status).toBe('pending')
    })

    it('应该能够注册多个步骤', () => {
      engine.registerStep({
        id: 'step-1',
        name: '步骤1',
        execute: async input => input
      })

      engine.registerStep({
        id: 'step-2',
        name: '步骤2',
        execute: async input => input
      })

      expect(engine.getAllSteps()).toHaveLength(2)
    })
  })

  describe('工作流执行', () => {
    it('应该能够执行简单的工作流', async () => {
      engine.registerStep({
        id: 'step-1',
        name: '步骤1',
        execute: async input => {
          return { ...input, step1: 'completed' }
        }
      })

      const result = await engine.executeWorkflow({ initial: true })

      expect(result.initial).toBe(true)
      expect(result.step1).toBe('completed')
    })

    it('应该按顺序执行多个步骤', async () => {
      const executionOrder = []

      engine.registerStep({
        id: 'step-1',
        name: '步骤1',
        execute: async input => {
          executionOrder.push('step-1')
          return { ...input, step1: true }
        }
      })

      engine.registerStep({
        id: 'step-2',
        name: '步骤2',
        execute: async input => {
          executionOrder.push('step-2')
          return { ...input, step2: true }
        }
      })

      engine.registerStep({
        id: 'step-3',
        name: '步骤3',
        execute: async input => {
          executionOrder.push('step-3')
          return { ...input, step3: true }
        }
      })

      const result = await engine.executeWorkflow({})

      expect(executionOrder).toEqual(['step-1', 'step-2', 'step-3'])
      expect(result.step1).toBe(true)
      expect(result.step2).toBe(true)
      expect(result.step3).toBe(true)
    })

    it('应该传递数据到下一个步骤', async () => {
      engine.registerStep({
        id: 'step-1',
        name: '步骤1',
        execute: async input => {
          return { ...input, value: 10 }
        }
      })

      engine.registerStep({
        id: 'step-2',
        name: '步骤2',
        execute: async input => {
          return { ...input, value: input.value * 2 }
        }
      })

      const result = await engine.executeWorkflow({})

      expect(result.value).toBe(20)
    })
  })

  describe('错误处理', () => {
    it('应该捕获步骤执行错误', async () => {
      engine.registerStep({
        id: 'failing-step',
        name: '失败步骤',
        execute: async () => {
          throw new Error('步骤执行失败')
        }
      })

      await expect(engine.executeWorkflow({})).rejects.toThrow('步骤执行失败')

      const steps = engine.getAllSteps()
      expect(steps[0].status).toBe('error')
      expect(steps[0].error).toBeDefined()
      expect(steps[0].error.message).toBe('步骤执行失败')
    })

    it('应该自动重试失败的步骤', async () => {
      let attemptCount = 0

      engine.registerStep({
        id: 'retry-step',
        name: '重试步骤',
        execute: async input => {
          attemptCount++
          if (attemptCount < 3) {
            throw new Error('暂时失败')
          }
          return { ...input, success: true }
        }
      })

      const result = await engine.executeWorkflow({})

      expect(attemptCount).toBe(3)
      expect(result.success).toBe(true)
    })

    it('应该在达到最大重试次数后停止', async () => {
      let attemptCount = 0

      engine.registerStep({
        id: 'always-fail',
        name: '总是失败',
        execute: async () => {
          attemptCount++
          throw new Error('总是失败')
        }
      })

      await expect(engine.executeWorkflow({})).rejects.toThrow()

      // 1次初始尝试 + 3次重试 = 4次
      expect(attemptCount).toBe(4)
    })
  })

  describe('数据验证', () => {
    it('应该验证步骤输出', async () => {
      engine.registerStep({
        id: 'validated-step',
        name: '验证步骤',
        execute: async input => {
          return { ...input, result: 'success' }
        },
        validate: output => {
          return output.result === 'success'
        }
      })

      const result = await engine.executeWorkflow({})
      expect(result.result).toBe('success')
    })

    it('应该在验证失败时抛出错误', async () => {
      engine.registerStep({
        id: 'invalid-step',
        name: '无效步骤',
        execute: async input => {
          return { ...input, result: 'failure' }
        },
        validate: output => {
          return output.result === 'success'
        }
      })

      await expect(engine.executeWorkflow({})).rejects.toThrow('输出验证失败')
    })
  })

  describe('事件系统', () => {
    it('应该触发 workflow:start 事件', async () => {
      const handler = vi.fn()
      engine.on('workflow:start', handler)

      engine.registerStep({
        id: 'test',
        name: '测试',
        execute: async input => input
      })

      await engine.executeWorkflow({})

      expect(handler).toHaveBeenCalledWith({ totalSteps: 1 })
    })

    it('应该触发 step:start 事件', async () => {
      const handler = vi.fn()
      engine.on('step:start', handler)

      engine.registerStep({
        id: 'test',
        name: '测试步骤',
        execute: async input => input
      })

      await engine.executeWorkflow({})

      expect(handler).toHaveBeenCalledWith({
        stepIndex: 0,
        stepName: '测试步骤',
        totalSteps: 1
      })
    })

    it('应该触发 step:complete 事件', async () => {
      const handler = vi.fn()
      engine.on('step:complete', handler)

      engine.registerStep({
        id: 'test',
        name: '测试步骤',
        execute: async input => ({ ...input, result: 'done' })
      })

      await engine.executeWorkflow({})

      expect(handler).toHaveBeenCalled()
      expect(handler.mock.calls[0][0].output.result).toBe('done')
    })

    it('应该触发 workflow:complete 事件', async () => {
      const handler = vi.fn()
      engine.on('workflow:complete', handler)

      engine.registerStep({
        id: 'test',
        name: '测试',
        execute: async input => input
      })

      await engine.executeWorkflow({ test: true })

      expect(handler).toHaveBeenCalled()
      expect(handler.mock.calls[0][0].result.test).toBe(true)
    })

    it('应该触发 log 事件', async () => {
      const handler = vi.fn()
      engine.on('log', handler)

      engine.registerStep({
        id: 'test',
        name: '测试',
        execute: async input => input
      })

      await engine.executeWorkflow({})

      expect(handler).toHaveBeenCalled()
      expect(handler.mock.calls[0][0]).toHaveProperty('level')
      expect(handler.mock.calls[0][0]).toHaveProperty('message')
    })
  })

  describe('控制功能', () => {
    it('应该能够暂停和恢复', async () => {
      let step2Executed = false

      engine.registerStep({
        id: 'step-1',
        name: '步骤1',
        execute: async input => {
          engine.pause()
          return input
        }
      })

      engine.registerStep({
        id: 'step-2',
        name: '步骤2',
        execute: async input => {
          step2Executed = true
          return input
        }
      })

      const promise = engine.executeWorkflow({})

      // 等待一下让步骤1执行
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(engine.isPaused).toBe(true)
      expect(step2Executed).toBe(false)

      engine.resume()

      await promise

      expect(step2Executed).toBe(true)
    })

    it('应该能够取消执行', async () => {
      engine.registerStep({
        id: 'step-1',
        name: '步骤1',
        execute: async input => {
          engine.cancel()
          return input
        }
      })

      engine.registerStep({
        id: 'step-2',
        name: '步骤2',
        execute: async input => input
      })

      await expect(engine.executeWorkflow({})).rejects.toThrow('工作流已被取消')
    })
  })

  describe('日志记录', () => {
    it('应该记录步骤日志', async () => {
      engine.registerStep({
        id: 'test',
        name: '测试',
        execute: async (input, log) => {
          log('测试日志消息')
          return input
        }
      })

      await engine.executeWorkflow({})

      const logs = engine.getAllLogs()
      const testLog = logs.find(log => log.message === '测试日志消息')

      expect(testLog).toBeDefined()
      expect(testLog.level).toBe('info')
    })

    it('应该能够清空日志', async () => {
      engine.registerStep({
        id: 'test',
        name: '测试',
        execute: async input => input
      })

      await engine.executeWorkflow({})

      expect(engine.getAllLogs().length).toBeGreaterThan(0)

      engine.clearLogs()

      expect(engine.getAllLogs()).toHaveLength(0)
    })
  })

  describe('统计信息', () => {
    it('应该提供正确的统计信息', async () => {
      engine.registerStep({
        id: 'step-1',
        name: '步骤1',
        execute: async input => input
      })

      engine.registerStep({
        id: 'step-2',
        name: '步骤2',
        execute: async input => input
      })

      await engine.executeWorkflow({})

      const stats = engine.getStatistics()

      expect(stats.totalSteps).toBe(2)
      expect(stats.completedSteps).toBe(2)
      expect(stats.failedSteps).toBe(0)
      expect(stats.successRate).toBe(100)
    })
  })

  describe('重置功能', () => {
    it('应该能够重置引擎状态', async () => {
      engine.registerStep({
        id: 'test',
        name: '测试',
        execute: async input => input
      })

      await engine.executeWorkflow({})

      expect(engine.getAllLogs().length).toBeGreaterThan(0)
      expect(engine.getAllSteps()[0].status).toBe('success')

      engine.reset()

      expect(engine.getAllLogs()).toHaveLength(0)
      expect(engine.getAllSteps()[0].status).toBe('pending')
    })
  })
})
