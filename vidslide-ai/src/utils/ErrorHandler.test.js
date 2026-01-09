/**
 * ErrorHandler.test.js
 * VidSlide AI - 错误处理系统单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ErrorHandler, ERROR_TYPES, ERROR_SEVERITY, getErrorHandler } from './ErrorHandler.js'

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    warning: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn()
  },
  ElMessageBox: vi.fn().mockResolvedValue()
}))

describe('ErrorHandler', () => {
  let errorHandler

  beforeEach(() => {
    errorHandler = new ErrorHandler()
    vi.clearAllMocks()
  })

  describe('错误分析', () => {
    it('应该正确识别网络错误', () => {
      const error = new Error('Failed to fetch')
      const result = errorHandler.analyzeError(error)

      expect(result.type).toBe(ERROR_TYPES.NETWORK)
      expect(result.severity).toBe(ERROR_SEVERITY.HIGH)
      expect(result.userMessage).toBe('网络连接出现问题')
      expect(result.solutions).toContain('检查网络连接是否正常')
    })

    it('应该正确识别权限错误', () => {
      const error = new Error('Permission denied')
      const result = errorHandler.analyzeError(error)

      expect(result.type).toBe(ERROR_TYPES.PERMISSION)
      expect(result.severity).toBe(ERROR_SEVERITY.HIGH)
      expect(result.userMessage).toBe('权限不足，无法完成操作')
    })

    it('应该正确识别验证错误', () => {
      const error = new Error('Validation failed')
      const result = errorHandler.analyzeError(error)

      expect(result.type).toBe(ERROR_TYPES.VALIDATION)
      expect(result.severity).toBe(ERROR_SEVERITY.LOW)
      expect(result.userMessage).toBe('输入信息不符合要求')
    })
  })

  describe('重试机制', () => {
    it('应该在操作成功时直接返回结果', async () => {
      const operation = vi.fn().mockResolvedValue('success')
      const result = await errorHandler.retryOperation(operation)

      expect(result).toBe('success')
      expect(operation).toHaveBeenCalledTimes(1)
    })

    it('应该在网络错误时自动重试', async () => {
      const operation = vi
        .fn()
        .mockRejectedValueOnce(new Error('network error'))
        .mockResolvedValueOnce('success')

      const result = await errorHandler.retryOperation(operation, { maxRetries: 1 })

      expect(result).toBe('success')
      expect(operation).toHaveBeenCalledTimes(2)
    })

    it('应该在达到最大重试次数后抛出错误', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('network timeout'))

      await expect(errorHandler.retryOperation(operation, { maxRetries: 2 })).rejects.toThrow(
        'network timeout'
      )

      expect(operation).toHaveBeenCalledTimes(3) // 初始尝试 + 2次重试
    })
  })

  describe('智能恢复建议', () => {
    it('应该为网络错误生成恢复建议', () => {
      const errorInfo = { type: ERROR_TYPES.NETWORK }
      const suggestions = errorHandler.generateRecoverySuggestions(errorInfo)

      expect(suggestions).toHaveLength(3)
      expect(suggestions[0].action).toBe('check-connection')
      expect(suggestions[1].action).toBe('retry')
      expect(suggestions[2].action).toBe('offline-mode')
    })

    it('应该为权限错误生成恢复建议', () => {
      const errorInfo = { type: ERROR_TYPES.PERMISSION }
      const suggestions = errorHandler.generateRecoverySuggestions(errorInfo)

      expect(suggestions).toHaveLength(2)
      expect(suggestions[0].action).toBe('request-permission')
      expect(suggestions[1].action).toBe('check-settings')
    })

    it('应该为资源错误生成恢复建议', () => {
      const errorInfo = { type: ERROR_TYPES.RESOURCE }
      const suggestions = errorHandler.generateRecoverySuggestions(errorInfo)

      expect(suggestions).toHaveLength(2)
      expect(suggestions[0].action).toBe('clear-cache')
      expect(suggestions[1].action).toBe('reduce-quality')
    })
  })

  describe('自动修复功能', () => {
    it('应该能够执行网络连接检查', async () => {
      // Mock fetch
      global.fetch = vi.fn().mockResolvedValue({ ok: true })

      const result = await errorHandler.checkNetworkConnection()
      expect(result).toBe(true)
    })

    it('应该能够清理浏览器缓存', async () => {
      // Mock caches API
      global.caches = {
        keys: vi.fn().mockResolvedValue(['cache1', 'cache2']),
        delete: vi.fn().mockResolvedValue(true)
      }

      const result = await errorHandler.clearBrowserCache()
      expect(result).toBe(true)
      expect(global.caches.delete).toHaveBeenCalledTimes(2)
    })
  })

  describe('单例模式', () => {
    it('应该返回相同的实例', () => {
      const handler1 = getErrorHandler()
      const handler2 = getErrorHandler()

      expect(handler1).toBe(handler2)
    })
  })

  describe('错误历史记录', () => {
    it('应该记录错误到历史', () => {
      const error = new Error('Test error')
      errorHandler.logError(error, 'test-context', ERROR_SEVERITY.MEDIUM)

      const history = errorHandler.getErrorHistory()
      expect(history.length).toBe(1)
      expect(history[0].error.message).toBe('Test error')
      expect(history[0].context).toBe('test-context')
    })

    it('应该限制历史记录数量', () => {
      // 添加超过最大数量的错误
      for (let i = 0; i < 60; i++) {
        const error = new Error(`Error ${i}`)
        errorHandler.logError(error, `context-${i}`, ERROR_SEVERITY.LOW)
      }

      const history = errorHandler.getErrorHistory(100)
      expect(history.length).toBeLessThanOrEqual(50) // maxHistorySize
    })
  })

  describe('重试机制', () => {
    it('应该在失败后重试', async () => {
      let attempts = 0
      const operation = vi.fn().mockImplementation(() => {
        attempts++
        if (attempts < 3) {
          throw new Error('Temporary failure')
        }
        return 'success'
      })

      const result = await errorHandler.withRetry(operation, { maxRetries: 3 })

      expect(result).toBe('success')
      expect(attempts).toBe(3)
      expect(operation).toHaveBeenCalledTimes(3)
    })

    it('应该在达到最大重试次数后抛出错误', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Persistent failure'))

      await expect(errorHandler.withRetry(operation, { maxRetries: 2 })).rejects.toThrow(
        'Persistent failure'
      )

      expect(operation).toHaveBeenCalledTimes(3) // 初始 + 2次重试
    })
  })
})
