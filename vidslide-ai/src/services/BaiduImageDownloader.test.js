/**
 * BaiduImageDownloader.test.js
 * VidSlide AI - 百度图片下载器测试
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import BaiduImageDownloader from './BaiduImageDownloader.js'
import BaiduImageService from './BaiduImageService.js'

// Mock BaiduImageService
vi.mock('./BaiduImageService.js', () => ({
  default: vi.fn().mockImplementation(() => ({
    searchImages: vi.fn(),
    getImageMetadata: vi.fn()
  }))
}))

// Mock fetch for downloads
global.fetch = vi.fn()

describe('BaiduImageDownloader', () => {
  let downloader
  let mockBaiduService

  beforeEach(() => {
    vi.clearAllMocks()

    // Create mock service instance
    mockBaiduService = {
      searchImages: vi.fn(),
      getImageMetadata: vi.fn()
    }

    // Mock the constructor
    BaiduImageService.mockImplementation(() => mockBaiduService)

    downloader = new BaiduImageDownloader()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('初始化', () => {
    it('应该正确初始化下载器', () => {
      expect(downloader).toBeDefined()
      expect(downloader.baiduService).toBeDefined()
      expect(downloader.config).toBeDefined()
      expect(downloader.stats).toBeDefined()
    })

    it('应该有正确的默认配置', () => {
      expect(downloader.config.maxConcurrentDownloads).toBe(3)
      expect(downloader.config.downloadTimeout).toBe(30000)
      expect(downloader.config.minImageSize).toBe(100000)
      expect(downloader.config.maxImageSize).toBe(10000000)
      expect(downloader.config.requiredFormats).toEqual(['jpg', 'jpeg', 'png'])
      expect(downloader.config.qualityThreshold).toBe(70)
    })

    it('应该初始化统计数据', () => {
      expect(downloader.stats.totalKeywords).toBe(0)
      expect(downloader.stats.downloadedImages).toBe(0)
      expect(downloader.stats.failedDownloads).toBe(0)
      expect(downloader.stats.startTime).toBeDefined()
    })
  })

  describe('批量下载', () => {
    it('应该处理关键词批量下载', async () => {
      const keywords = ['nature', 'landscape']
      const mockResults = [
        { images: [{ url: 'image1.jpg', title: 'Nature 1' }] },
        { images: [{ url: 'image2.jpg', title: 'Landscape 1' }] }
      ]

      mockBaiduService.searchImages.mockImplementation((keyword) => {
        const index = keywords.indexOf(keyword)
        return Promise.resolve(mockResults[index] || { images: [] })
      })

      global.fetch.mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(new Blob(['fake image data'], { type: 'image/jpeg' }))
      })

      const result = await downloader.downloadKeywordBatch(keywords, { imagesPerKeyword: 1 })

      expect(result).toBeDefined()
      expect(mockBaiduService.searchImages).toHaveBeenCalledTimes(2)
    })

    it('应该限制并发下载数量', async () => {
      const keywords = ['test1', 'test2', 'test3', 'test4', 'test5']

      mockBaiduService.searchImages.mockResolvedValue({
        images: [{ url: 'test.jpg', title: 'Test' }]
      })

      global.fetch.mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(new Blob(['data'], { type: 'image/jpeg' }))
      })

      // Mock Promise.allSettled to control concurrency
      const originalPromiseAllSettled = Promise.allSettled
      Promise.allSettled = vi.fn().mockImplementation((promises) => {
        expect(promises.length).toBeLessThanOrEqual(downloader.config.maxConcurrentDownloads)
        return originalPromiseAllSettled(promises)
      })

      await downloader.downloadKeywordBatch(keywords, { imagesPerKeyword: 1 })

      Promise.allSettled = originalPromiseAllSettled
    })

    it('应该处理下载失败的情况', async () => {
      const keywords = ['failing']
      const mockResults = { images: [{ url: 'fail.jpg', title: 'Fail' }] }

      mockBaiduService.searchImages.mockResolvedValue(mockResults)
      global.fetch.mockRejectedValue(new Error('Download failed'))

      const result = await downloader.downloadKeywordBatch(keywords, { imagesPerKeyword: 1 })

      expect(result).toBeDefined()
      expect(downloader.stats.failedDownloads).toBeGreaterThan(0)
    })
  })

  describe('单张图片下载', () => {
    it('应该成功下载图片', async () => {
      const imageUrl = 'https://example.com/image.jpg'
      const mockBlob = new Blob(['fake image data'], { type: 'image/jpeg' })

      global.fetch.mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(mockBlob)
      })

      const result = await downloader.downloadImage(imageUrl)

      expect(result.success).toBe(true)
      expect(result.blob).toBe(mockBlob)
      expect(result.size).toBe(mockBlob.size)
    })

    it('应该处理下载失败', async () => {
      const imageUrl = 'https://example.com/fail.jpg'

      global.fetch.mockResolvedValue({
        ok: false,
        status: 404
      })

      const result = await downloader.downloadImage(imageUrl)

      expect(result.success).toBe(false)
      expect(result.error).toContain('HTTP 404')
    })

    it('应该验证图片格式', async () => {
      const invalidUrl = 'https://example.com/image.gif'
      const mockBlob = new Blob(['data'], { type: 'image/gif' })

      global.fetch.mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(mockBlob)
      })

      const result = await downloader.downloadImage(invalidUrl)

      expect(result.success).toBe(false)
      expect(result.error).toContain('不支持的格式')
    })

    it('应该验证图片大小', async () => {
      const imageUrl = 'https://example.com/small.jpg'
      const smallBlob = new Blob(['x'], { type: 'image/jpeg' }) // Very small blob

      global.fetch.mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(smallBlob)
      })

      const result = await downloader.downloadImage(imageUrl)

      expect(result.success).toBe(false)
      expect(result.error).toContain('图片过小')
    })
  })

  describe('质量验证', () => {
    it('应该通过质量验证的图片', () => {
      const validImage = {
        size: 500000, // 500KB
        format: 'jpg',
        dimensions: { width: 1920, height: 1080 }
      }

      const result = downloader.validateImage(validImage)
      expect(result.valid).toBe(true)
    })

    it('应该拒绝质量不合格的图片', () => {
      const invalidImage = {
        size: 50000, // 50KB, too small
        format: 'jpg',
        dimensions: { width: 100, height: 100 } // Too small dimensions
      }

      const result = downloader.validateImage(invalidImage)
      expect(result.valid).toBe(false)
    })

    it('应该检查文件格式', () => {
      const formats = ['jpg', 'jpeg', 'png', 'gif', 'bmp']

      expect(downloader.isValidFormat('jpg')).toBe(true)
      expect(downloader.isValidFormat('jpeg')).toBe(true)
      expect(downloader.isValidFormat('png')).toBe(true)
      expect(downloader.isValidFormat('gif')).toBe(false) // Not in requiredFormats
      expect(downloader.isValidFormat('bmp')).toBe(false)
    })
  })

  describe('统计信息', () => {
    it('应该正确更新统计信息', () => {
      const initialDownloaded = downloader.stats.downloadedImages

      downloader.stats.downloadedImages += 5
      downloader.stats.failedDownloads += 2
      downloader.stats.totalSize += 1000000

      expect(downloader.stats.downloadedImages).toBe(initialDownloaded + 5)
      expect(downloader.stats.failedDownloads).toBe(2)
      expect(downloader.stats.totalSize).toBe(1000000)
    })

    it('应该生成下载报告', () => {
      downloader.stats.totalKeywords = 10
      downloader.stats.downloadedImages = 45
      downloader.stats.failedDownloads = 5
      downloader.stats.totalSize = 50000000

      const report = downloader.generateReport()

      expect(report).toBeDefined()
      expect(report.totalKeywords).toBe(10)
      expect(report.totalImages).toBe(45)
      expect(report.successRate).toBeDefined()
      expect(report.averageSize).toBeDefined()
    })
  })
})