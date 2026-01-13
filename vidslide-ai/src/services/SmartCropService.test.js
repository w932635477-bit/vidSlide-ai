/**
 * SmartCropService.test.js
 * 智能裁剪服务单元测试
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import SmartCropService from './SmartCropService.js'

describe('SmartCropService', () => {
  let service

  beforeEach(() => {
    service = new SmartCropService()
  })

  afterEach(() => {
    service.cleanup()
  })

  describe('初始化', () => {
    it('应该正确初始化服务', () => {
      expect(service.opencv).toBeNull()
      expect(service.isInitialized).toBe(false)
    })

    it('应该异步初始化OpenCV', async () => {
      // Mock OpenCV加载
      global.cv = {
        Mat: vi.fn(),
        matFromArray: vi.fn(),
        imshow: vi.fn(),
        waitKey: vi.fn()
      }

      await service.initialize()

      expect(service.isInitialized).toBe(true)
      expect(service.opencv).toBeDefined()
    })
  })

  describe('智能裁剪功能', () => {
    beforeEach(async () => {
      // Mock OpenCV
      global.cv = {
        Mat: vi.fn().mockImplementation(() => ({
          delete: vi.fn(),
          rows: 100,
          cols: 100
        })),
        matFromArray: vi.fn(),
        imshow: vi.fn(),
        waitKey: vi.fn(),
        COLOR_RGBA2GRAY: 1,
        cvtColor: vi.fn(),
        GaussianBlur: vi.fn(),
        Canny: vi.fn(),
        RETR_EXTERNAL: 1,
        CHAIN_APPROX_SIMPLE: 1,
        findContours: vi.fn(),
        contourArea: vi.fn().mockReturnValue(1000),
        boundingRect: vi.fn().mockReturnValue({ x: 10, y: 10, width: 80, height: 60 }),
        MatVector: vi.fn().mockImplementation(() => ({
          size: vi.fn().mockReturnValue(1),
          get: vi.fn().mockReturnValue({ x: 10, y: 10, width: 80, height: 60 })
        })),
        meanStdDev: vi.fn().mockImplementation((laplacian, mean, stddev) => {
          // Mock mean and stddev values
        }),
        Size: vi.fn()
      }

      await service.initialize()
    })

    it('应该执行智能裁剪', async () => {
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' })

      // Mock createObjectURL and Image
      global.URL.createObjectURL = vi.fn().mockReturnValue('mock-url')
      global.Image = vi.fn().mockImplementation(() => ({
        onload: null,
        onerror: null,
        src: ''
      }))

      // Mock canvas
      global.document.createElement = vi.fn().mockImplementation((tag) => {
        if (tag === 'canvas') {
          return {
            getContext: vi.fn().mockReturnValue({
              drawImage: vi.fn(),
              getImageData: vi.fn().mockReturnValue({
                data: new Uint8ClampedArray(100 * 100 * 4),
                width: 100,
                height: 100
              })
            }),
            toBlob: vi.fn().mockImplementation((callback) => {
              callback(new Blob(['cropped'], { type: 'image/png' }))
            })
          }
        }
      })

      const result = await service.smartCrop(mockFile)

      expect(result).toHaveProperty('croppedBlob')
      expect(result).toHaveProperty('cropRect')
      expect(result).toHaveProperty('originalSize')
      expect(result).toHaveProperty('confidence')
    })

    it('应该检测显著性区域', () => {
      const mockSrc = {
        rows: 100,
        cols: 100,
        delete: vi.fn()
      }

      const result = service.detectSaliency(mockSrc)

      expect(result).toHaveProperty('x')
      expect(result).toHaveProperty('y')
      expect(result).toHaveProperty('width')
      expect(result).toHaveProperty('height')
    })

    it('应该计算裁剪矩形', () => {
      const subjectRect = { x: 20, y: 20, width: 60, height: 40 }
      const imageWidth = 100
      const imageHeight = 100
      const padding = 10

      const result = service.calculateCropRect(subjectRect, imageWidth, imageHeight, padding)

      expect(result.x).toBe(10) // 20 - 10
      expect(result.y).toBe(10) // 20 - 10
      expect(result.width).toBe(80) // 60 + 20
      expect(result.height).toBe(60) // 40 + 20
    })

    it('应该计算置信度', () => {
      const subjectRect = { x: 20, y: 20, width: 60, height: 40 }
      const cropRect = { x: 10, y: 10, width: 80, height: 60 }
      const src = { rows: 100, cols: 100 }

      const confidence = service.calculateConfidence(subjectRect, cropRect, src)

      expect(confidence).toBeGreaterThanOrEqual(0)
      expect(confidence).toBeLessThanOrEqual(1)
    })
  })

  describe('文件处理', () => {
    it('应该将文件转换为Image元素', async () => {
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' })

      global.URL.createObjectURL = vi.fn().mockReturnValue('mock-url')
      global.Image = vi.fn().mockImplementation(() => ({
        onload: null,
        onerror: null,
        src: ''
      }))

      // Mock image load
      const mockImage = global.Image.mock.results[0].value
      setTimeout(() => {
        mockImage.onload()
      }, 10)

      const result = await service.fileToImage(mockFile)

      expect(result).toBeInstanceOf(Image)
      expect(result.src).toBe('mock-url')
    })

    it('应该将OpenCV Mat转换为Blob', async () => {
      const mockMat = {
        rows: 100,
        cols: 100
      }

      global.document.createElement = vi.fn().mockImplementation((tag) => {
        if (tag === 'canvas') {
          return {
            getContext: vi.fn().mockReturnValue({
              drawImage: vi.fn(),
              getImageData: vi.fn().mockReturnValue({
                data: new Uint8ClampedArray(100 * 100 * 4),
                width: 100,
                height: 100
              })
            }),
            toBlob: vi.fn().mockImplementation((callback) => {
              callback(new Blob(['mat'], { type: 'image/png' }))
            })
          }
        }
      })

      const result = await service.matToBlob(mockMat)

      expect(result).toBeInstanceOf(Blob)
    })
  })

  describe('错误处理', () => {
    it('应该在OpenCV未初始化时抛出错误', async () => {
      service.isInitialized = false

      const mockFile = new File(['test'], 'test.png', { type: 'image/png' })

      await expect(service.smartCrop(mockFile))
        .rejects.toThrow('智能裁剪服务初始化失败')
    })

    it('应该处理图像加载失败', async () => {
      await service.initialize()

      const mockFile = new File(['test'], 'test.png', { type: 'image/png' })

      global.URL.createObjectURL = vi.fn().mockReturnValue('mock-url')
      global.Image = vi.fn().mockImplementation(() => {
        const img = {
          onload: null,
          onerror: null,
          src: ''
        }
        // 模拟加载失败
        setTimeout(() => {
          if (img.onerror) img.onerror()
        }, 10)
        return img
      })

      await expect(service.smartCrop(mockFile))
        .rejects.toThrow('智能裁剪处理失败')
    })
  })

  describe('文本检测', () => {
    beforeEach(async () => {
      // Setup OpenCV mocks for text detection
      global.cv = {
        Mat: vi.fn().mockImplementation(() => ({
          delete: vi.fn()
        })),
        matFromArray: vi.fn(),
        COLOR_RGBA2GRAY: 1,
        cvtColor: vi.fn(),
        GaussianBlur: vi.fn().mockImplementation((src, dst, size) => {
          // Mock blur operation
        }),
        Canny: vi.fn(),
        RETR_EXTERNAL: 1,
        CHAIN_APPROX_SIMPLE: 1,
        findContours: vi.fn(),
        contourArea: vi.fn().mockReturnValue(500), // Mock contour area
        boundingRect: vi.fn().mockReturnValue({ x: 10, y: 10, width: 80, height: 20 }),
        MatVector: vi.fn().mockImplementation(() => ({
          size: vi.fn().mockReturnValue(1),
          get: vi.fn().mockReturnValue({ x: 10, y: 10, width: 80, height: 20 })
        })),
        Size: vi.fn()
      }

      await service.initialize()
    })

    it('应该检测文本区域', () => {
      const mockSrc = {
        rows: 100,
        cols: 100,
        delete: vi.fn()
      }

      const result = service.detectText(mockSrc)

      // Text detection is simplified in test, may return null
      expect(result).toBeDefined()
    })
  })

  describe('资源清理', () => {
    it('应该正确清理资源', () => {
      service.isInitialized = true
      service.opencv = { someProperty: 'test' }

      service.cleanup()

      expect(service.isInitialized).toBe(false)
      expect(service.opencv).toBeNull()
    })
  })
})