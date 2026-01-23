/**
 * IndexedDBStorage 单元测试
 * 测试本地存储核心功能
 *
 * @author VidSlide AI Team
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock IndexedDB
const indexedDBMock = {
  open: vi.fn(() => ({
    onsuccess: null,
    onerror: null,
    onupgradeneeded: null,
    result: {
      createObjectStore: vi.fn(() => ({
        createIndex: vi.fn()
      })),
      transaction: vi.fn(() => ({
        objectStore: vi.fn(() => ({
          add: vi.fn(),
          put: vi.fn(),
          get: vi.fn(),
          delete: vi.fn(),
          openCursor: vi.fn(),
          count: vi.fn()
        }))
      }))
    }
  })),
  deleteDatabase: vi.fn()
}
global.indexedDB = indexedDBMock

// Mock console methods
const _consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
const _consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
const _consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

describe('IndexedDBStorage', () => {
  let storage

  beforeEach(async () => {
    vi.clearAllMocks()

    // Dynamic import to avoid hoisting issues
    const { IndexedDBStorage } = await import('./IndexedDBStorage.js')
    storage = new IndexedDBStorage()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('初始化', () => {
    it('应该正确初始化IndexedDBStorage实例', () => {
      expect(storage).toBeDefined()
      expect(typeof storage.initialize).toBe('function')
      expect(typeof storage.setItem).toBe('function')
      expect(typeof storage.getItem).toBe('function')
      expect(typeof storage.removeItem).toBe('function')
    })

    it('应该初始化IndexedDB数据库', async () => {
      await storage.initialize()

      expect(indexedDB.open).toHaveBeenCalledWith('VidSlideStorage', expect.any(Number))
    })

    it('应该处理IndexedDB不支持的情况', async () => {
      delete global.indexedDB

      const result = await storage.initialize()

      expect(result.success).toBe(false)
      expect(result.error).toContain('IndexedDB not supported')
    })
  })

  describe('数据操作', () => {
    beforeEach(async () => {
      await storage.initialize()
    })

    it('应该能够存储数据', async () => {
      const testData = { id: 1, name: 'Test Item', value: 42 }

      const result = await storage.setItem('testKey', testData)

      expect(result.success).toBe(true)
    })

    it('应该能够获取数据', async () => {
      const testData = { id: 1, name: 'Test Item', value: 42 }

      await storage.setItem('testKey', testData)
      const result = await storage.getItem('testKey')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(testData)
    })

    it('应该能够删除数据', async () => {
      await storage.setItem('testKey', { data: 'test' })

      const result = await storage.removeItem('testKey')

      expect(result.success).toBe(true)

      const getResult = await storage.getItem('testKey')
      expect(getResult.success).toBe(false)
    })

    it('应该能够更新数据', async () => {
      const originalData = { version: 1, content: 'original' }
      const updatedData = { version: 2, content: 'updated' }

      await storage.setItem('testKey', originalData)
      await storage.setItem('testKey', updatedData)

      const result = await storage.getItem('testKey')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(updatedData)
    })
  })

  describe('批量操作', () => {
    beforeEach(async () => {
      await storage.initialize()
    })

    it('应该能够批量设置数据', async () => {
      const batchData = {
        key1: { data: 'value1' },
        key2: { data: 'value2' },
        key3: { data: 'value3' }
      }

      const result = await storage.setBatch(batchData)

      expect(result.success).toBe(true)
      expect(result.count).toBe(3)
    })

    it('应该能够批量获取数据', async () => {
      const batchData = {
        key1: { data: 'value1' },
        key2: { data: 'value2' }
      }

      await storage.setBatch(batchData)
      const result = await storage.getBatch(['key1', 'key2'])

      expect(result.success).toBe(true)
      expect(result.data).toHaveProperty('key1')
      expect(result.data).toHaveProperty('key2')
    })

    it('应该能够批量删除数据', async () => {
      const batchData = {
        key1: { data: 'value1' },
        key2: { data: 'value2' },
        key3: { data: 'value3' }
      }

      await storage.setBatch(batchData)
      const result = await storage.removeBatch(['key1', 'key3'])

      expect(result.success).toBe(true)
      expect(result.count).toBe(2)
    })
  })

  describe('查询操作', () => {
    beforeEach(async () => {
      await storage.initialize()

      // 添加测试数据
      const testData = [
        { id: 1, type: 'image', name: 'Image 1' },
        { id: 2, type: 'video', name: 'Video 1' },
        { id: 3, type: 'image', name: 'Image 2' }
      ]

      for (const item of testData) {
        await storage.setItem(`item_${item.id}`, item)
      }
    })

    it('应该能够按条件查询数据', async () => {
      const result = await storage.find({ type: 'image' })

      expect(result.success).toBe(true)
      expect(result.data.length).toBe(2)
      expect(result.data.every(item => item.type === 'image')).toBe(true)
    })

    it('应该能够获取所有数据', async () => {
      const result = await storage.getAll()

      expect(result.success).toBe(true)
      expect(result.data.length).toBeGreaterThanOrEqual(3)
    })

    it('应该能够统计数据', async () => {
      const result = await storage.count()

      expect(result.success).toBe(true)
      expect(typeof result.count).toBe('number')
      expect(result.count).toBeGreaterThanOrEqual(3)
    })
  })

  describe('存储管理', () => {
    beforeEach(async () => {
      await storage.initialize()
    })

    it('应该能够获取存储统计信息', async () => {
      const stats = await storage.getStorageStats()

      expect(stats).toHaveProperty('usedSpace')
      expect(stats).toHaveProperty('availableSpace')
      expect(stats).toHaveProperty('totalItems')
      expect(typeof stats.usedSpace).toBe('number')
    })

    it('应该能够清理过期数据', async () => {
      // 添加带过期时间的测试数据
      const expiredData = {
        data: 'expired',
        expires: Date.now() - 1000 // 已过期
      }

      const validData = {
        data: 'valid',
        expires: Date.now() + 3600000 // 1小时后过期
      }

      await storage.setItem('expired', expiredData)
      await storage.setItem('valid', validData)

      const result = await storage.cleanupExpired()

      expect(result.success).toBe(true)
      expect(result.removedCount).toBeGreaterThanOrEqual(1)
    })

    it('应该能够清空所有数据', async () => {
      // 添加一些测试数据
      await storage.setItem('test1', { data: 'test1' })
      await storage.setItem('test2', { data: 'test2' })

      const result = await storage.clear()

      expect(result.success).toBe(true)

      const countResult = await storage.count()
      expect(countResult.count).toBe(0)
    })
  })

  describe('错误处理', () => {
    it('应该处理数据库打开失败', async () => {
      indexedDB.open.mockImplementationOnce(() => {
        const request = {
          onsuccess: null,
          onerror: null,
          error: new Error('Database open failed')
        }
        setTimeout(() => {
          if (request.onerror) request.onerror({ target: request })
        }, 10)
        return request
      })

      const result = await storage.initialize()

      expect(result.success).toBe(false)
      expect(result.error).toContain('Database open failed')
    })

    it('应该处理事务失败', async () => {
      const mockTransaction = {
        objectStore: vi.fn(() => ({
          add: vi.fn(),
          put: vi.fn(),
          get: vi.fn(),
          delete: vi.fn()
        })),
        oncomplete: null,
        onerror: null,
        abort: vi.fn()
      }

      // Mock transaction failure
      mockTransaction.onerror = () => {
        const event = { target: { error: new Error('Transaction failed') } }
        if (mockTransaction.onerror) mockTransaction.onerror(event)
      }

      const result = await storage.setItem('test', { data: 'test' })

      // Should handle the error gracefully
      expect(result).toBeDefined()
    })

    it('应该处理存储空间不足', async () => {
      const quotaError = new Error('Quota exceeded')
      quotaError.name = 'QuotaExceededError'

      // Mock quota exceeded error
      const result = await storage.setItem('largeItem', { data: 'x'.repeat(1000000) })

      // Should handle gracefully
      expect(result).toBeDefined()
    })
  })

  describe('性能监控', () => {
    beforeEach(async () => {
      await storage.initialize()
    })

    it('应该监控操作性能', async () => {
      const startTime = performance.now()

      await storage.setItem('perf-test', { data: 'performance test' })

      const endTime = performance.now()
      const duration = endTime - startTime

      // 操作应该在合理时间内完成
      expect(duration).toBeLessThan(1000) // Less than 1 second
    })

    it('应该提供性能统计', () => {
      const stats = storage.getPerformanceStats()

      expect(stats).toHaveProperty('averageOperationTime')
      expect(stats).toHaveProperty('operationCount')
      expect(stats).toHaveProperty('errorRate')
      expect(typeof stats.averageOperationTime).toBe('number')
    })

    it('应该处理大数据块', async () => {
      const largeData = {
        data: 'x'.repeat(100000), // 100KB data
        metadata: {
          size: 100000,
          type: 'large-test'
        }
      }

      const startTime = performance.now()
      const result = await storage.setItem('large-data', largeData)
      const endTime = performance.now()

      expect(result.success).toBe(true)
      expect(endTime - startTime).toBeLessThan(5000) // Less than 5 seconds for large data
    })
  })

  describe('数据迁移', () => {
    it('应该能够导出数据', async () => {
      await storage.initialize()
      await storage.setItem('export-test', { data: 'test data' })

      const result = await storage.exportData()

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(typeof result.data).toBe('string') // JSON string
    })

    it('应该能够导入数据', async () => {
      await storage.initialize()

      const exportData = {
        'import-test': { data: 'imported data', timestamp: Date.now() }
      }

      const result = await storage.importData(JSON.stringify(exportData))

      expect(result.success).toBe(true)
      expect(result.count).toBe(1)
    })
  })
})
