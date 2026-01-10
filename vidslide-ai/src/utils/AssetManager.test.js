/**
 * AssetManager 单元测试
 * 测试本地素材管理核心功能
 *
 * @author VidSlide AI Team
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getAssetManager } from './AssetManager.js'

// Mock IndexedDB
const indexedDBMock = {
  open: vi.fn(),
  deleteDatabase: vi.fn()
}
global.indexedDB = indexedDBMock

// Mock fetch
global.fetch = vi.fn()

// Mock console methods
const _consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
const _consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
const _consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

describe('AssetManager', () => {
  let assetManager

  beforeEach(async () => {
    vi.clearAllMocks()
    assetManager = getAssetManager()
    // 初始化AssetManager
    await assetManager.initialize()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('初始化', () => {
    it('应该正确初始化AssetManager实例', () => {
      expect(assetManager).toBeDefined()
      expect(typeof assetManager.initialize).toBe('function')
      expect(typeof assetManager.addAsset).toBe('function')
      expect(typeof assetManager.getAsset).toBe('function')
    })

    it('应该初始化IndexedDB连接', async () => {
      expect(indexedDB.open).toHaveBeenCalledWith('VidSlideAssets', 1)
    })
  })

  describe('素材管理', () => {
    const mockAsset = {
      id: 'test-asset-1',
      name: 'Test Asset',
      url: 'https://example.com/test.jpg',
      type: 'image',
      category: 'background',
      fileSize: 1024000,
      width: 1920,
      height: 1080
    }

    it('应该能够添加素材', async () => {
      const result = await assetManager.addAsset(mockAsset)

      expect(result.success).toBe(true)
      expect(result.asset).toEqual(mockAsset)
    })

    it('应该能够获取素材', async () => {
      // 先添加素材
      await assetManager.addAsset(mockAsset)

      const result = await assetManager.getAsset(mockAsset.id)

      expect(result.success).toBe(true)
      expect(result.asset).toEqual(mockAsset)
    })

    it('应该能够删除素材', async () => {
      // 先添加素材
      await assetManager.addAsset(mockAsset)

      const result = await assetManager.deleteAsset(mockAsset.id)

      expect(result.success).toBe(true)
    })

    it('应该能够搜索素材', async () => {
      // 添加多个素材
      const assets = [
        { ...mockAsset, id: 'asset1', name: 'Background Image' },
        { ...mockAsset, id: 'asset2', name: 'Logo Design' },
        { ...mockAsset, id: 'asset3', name: 'Music Track' }
      ]

      for (const asset of assets) {
        await assetManager.addAsset(asset)
      }

      const result = await assetManager.searchAssets('background')

      expect(result.success).toBe(true)
      expect(result.assets.length).toBeGreaterThan(0)
      expect(result.assets[0].name.toLowerCase()).toContain('background')
    })
  })

  describe('缓存管理', () => {
    it('应该能够获取缓存统计信息', async () => {
      const stats = await assetManager.getCacheStats()

      expect(stats).toHaveProperty('totalAssets')
      expect(stats).toHaveProperty('totalSize')
      expect(stats).toHaveProperty('cacheHitRate')
    })

    it('应该能够清理过期缓存', async () => {
      const result = await assetManager.cleanupExpiredCache()

      expect(result.success).toBe(true)
      expect(typeof result.removedCount).toBe('number')
    })

    it('应该限制缓存大小', async () => {
      // 添加大量素材测试缓存限制
      const promises = []
      for (let i = 0; i < 100; i++) {
        const asset = {
          id: `asset-${i}`,
          name: `Asset ${i}`,
          url: `https://example.com/asset-${i}.jpg`,
          type: 'image',
          fileSize: 1024 * 1024 // 1MB each
        }
        promises.push(assetManager.addAsset(asset))
      }

      await Promise.all(promises)

      const stats = await assetManager.getCacheStats()
      expect(stats.totalSize).toBeLessThan(500 * 1024 * 1024) // Less than 500MB
    })
  })

  describe('错误处理', () => {
    it('应该处理无效素材ID', async () => {
      const result = await assetManager.getAsset('invalid-id')

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('应该处理网络错误', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'))

      const mockAsset = {
        id: 'network-asset',
        name: 'Network Asset',
        url: 'https://example.com/network.jpg',
        type: 'image'
      }

      const result = await assetManager.addAsset(mockAsset)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Network error')
    })

    it('应该处理IndexedDB错误', async () => {
      indexedDB.open.mockImplementationOnce(() => {
        throw new Error('IndexedDB error')
      })

      const result = await assetManager.addAsset({ id: 'test', name: 'Test' })

      expect(result.success).toBe(false)
      expect(result.error).toContain('IndexedDB error')
    })
  })

  describe('性能监控', () => {
    it('应该监控操作性能', async () => {
      const startTime = performance.now()

      await assetManager.addAsset({
        id: 'perf-test',
        name: 'Performance Test',
        url: 'https://example.com/test.jpg',
        type: 'image'
      })

      const endTime = performance.now()
      const duration = endTime - startTime

      // 添加操作应该在合理时间内完成
      expect(duration).toBeLessThan(1000) // Less than 1 second
    })

    it('应该提供性能统计', () => {
      const stats = assetManager.getPerformanceStats()

      expect(stats).toHaveProperty('averageOperationTime')
      expect(stats).toHaveProperty('cacheHitRate')
      expect(stats).toHaveProperty('errorRate')
    })
  })
})
