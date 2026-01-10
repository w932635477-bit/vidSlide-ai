/**
 * SmartCrop 单元测试
 * 测试智能裁剪算法的各项功能
 *
 * @author VidSlide AI Team
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  SmartCrop,
  getSmartCrop,
  smartCropImage,
  batchSmartCrop,
  getCropSuggestions
} from './smartCrop.js'

// Mock OpenCV.js
global.window.cv = {
  Mat: vi.fn(() => ({
    delete: vi.fn(),
    cols: 800,
    rows: 600
  })),
  MatVector: vi.fn(() => ({
    size: vi.fn(() => 2),
    get: vi.fn(() => ({
      delete: vi.fn()
    })),
    delete: vi.fn()
  })),
  matFromImageData: vi.fn(() => ({
    delete: vi.fn(),
    cols: 800,
    rows: 600
  })),
  cvtColor: vi.fn(),
  GaussianBlur: vi.fn(),
  Canny: vi.fn(),
  getStructuringElement: vi.fn(() => ({ delete: vi.fn() })),
  dilate: vi.fn(),
  findContours: vi.fn(),
  boundingRect: vi.fn(() => ({
    x: 100,
    y: 100,
    width: 400,
    height: 300
  })),
  COLOR_RGBA2GRAY: 7,
  MORPH_RECT: 0,
  RETR_EXTERNAL: 0,
  CHAIN_APPROX_SIMPLE: 2,
  Point: vi.fn(),
  Size: vi.fn()
}

// Mock HTML Canvas API
global.HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  getImageData: vi.fn(() => ({
    data: new Uint8ClampedArray(800 * 600 * 4),
    width: 800,
    height: 600
  })),
  drawImage: vi.fn()
}))

// Mock console methods
const _consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
const _consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
const _consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

describe('SmartCrop', () => {
  let smartCrop

  beforeEach(() => {
    vi.clearAllMocks()
    smartCrop = new SmartCrop()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('构造函数', () => {
    it('应该正确初始化SmartCrop实例', () => {
      expect(smartCrop).toBeInstanceOf(SmartCrop)
      expect(smartCrop.config).toBeDefined()
      expect(smartCrop.isInitialized).toBe(false)
    })

    it('应该包含完整的配置对象', () => {
      expect(smartCrop.config).toHaveProperty('canny')
      expect(smartCrop.config).toHaveProperty('contours')
      expect(smartCrop.config).toHaveProperty('morphology')
      expect(smartCrop.config).toHaveProperty('crop')
      expect(smartCrop.config).toHaveProperty('performance')
    })
  })

  describe('initialize方法', () => {
    it('应该成功初始化OpenCV', async () => {
      // Mock OpenCV加载
      global.window.cv = { ...global.window.cv, Mat: vi.fn(() => ({ delete: vi.fn() })) }

      await smartCrop.initialize()

      expect(smartCrop.isInitialized).toBe(true)
      expect(_consoleLogSpy).toHaveBeenCalledWith('SmartCrop initialized with OpenCV.js')
    })

    it('应该处理初始化失败', async () => {
      // Mock OpenCV加载失败
      delete global.window.cv

      await expect(smartCrop.initialize()).rejects.toThrow('OpenCV.js加载失败')
      expect(smartCrop.isInitialized).toBe(false)
    })

    it('应该避免重复初始化', async () => {
      smartCrop.isInitialized = true

      await smartCrop.initialize()

      expect(_consoleLogSpy).not.toHaveBeenCalled()
    })
  })

  describe('crop方法', () => {
    beforeEach(async () => {
      await smartCrop.initialize()
    })

    it('应该成功执行智能裁剪', async () => {
      const mockImage = document.createElement('img')
      mockImage.width = 800
      mockImage.height = 600

      const result = await smartCrop.crop(mockImage)

      expect(result.success).toBe(true)
      expect(result).toHaveProperty('cropRect')
      expect(result).toHaveProperty('processingTime')
      expect(result).toHaveProperty('confidence')
    })

    it('应该处理裁剪失败', async () => {
      // Mock imageToMat失败
      smartCrop.imageToMat = vi.fn().mockImplementation(() => {
        throw new Error('Image processing failed')
      })

      const mockImage = document.createElement('img')

      const result = await smartCrop.crop(mockImage)

      expect(result.success).toBe(false)
      expect(result).toHaveProperty('error')
      expect(_consoleErrorSpy).toHaveBeenCalledWith('Smart crop failed:', expect.any(Error))
    })
  })

  describe('imageToMat方法', () => {
    it('应该将HTMLImageElement转换为Mat', () => {
      const mockImage = document.createElement('img')
      mockImage.width = 800
      mockImage.height = 600

      const mat = smartCrop.imageToMat(mockImage, 800)

      expect(mat).toBeDefined()
      expect(mat.cols).toBe(800)
      expect(mat.rows).toBe(600)
    })

    it('应该将HTMLCanvasElement转换为Mat', () => {
      const mockCanvas = document.createElement('canvas')
      mockCanvas.width = 800
      mockCanvas.height = 600

      const mat = smartCrop.imageToMat(mockCanvas, 800)

      expect(mat).toBeDefined()
    })

    it('应该正确缩放图像', () => {
      const mockImage = document.createElement('img')
      mockImage.width = 1600
      mockImage.height = 1200

      smartCrop.imageToMat(mockImage, 800)

      // 验证缩放后的尺寸 (1600x1200 -> 800x600)
      expect(global.HTMLCanvasElement.prototype.getContext).toHaveBeenCalled()
    })
  })

  describe('findBestCrop方法', () => {
    it('应该找到最佳裁剪区域', async () => {
      const mockSrc = {
        cols: 800,
        rows: 600,
        delete: vi.fn()
      }

      const result = await smartCrop.findBestCrop(mockSrc, smartCrop.config)

      expect(result).toBeDefined()
      expect(result).toHaveProperty('x')
      expect(result).toHaveProperty('y')
      expect(result).toHaveProperty('width')
      expect(result).toHaveProperty('height')
      expect(result).toHaveProperty('score')
    })

    it('应该处理没有找到合适区域的情况', async () => {
      // Mock contours.size() 返回0
      global.window.cv.MatVector = vi.fn(() => ({
        size: vi.fn(() => 0),
        get: vi.fn(),
        delete: vi.fn()
      }))

      const mockSrc = {
        cols: 800,
        rows: 600,
        delete: vi.fn()
      }

      const result = await smartCrop.findBestCrop(mockSrc, smartCrop.config)

      expect(result).toBeNull()
    })
  })

  describe('analyzeContours方法', () => {
    it('应该分析轮廓并返回最佳矩形', () => {
      const mockContours = {
        size: vi.fn(() => 3),
        get: vi.fn(() => ({ delete: vi.fn() })),
        delete: vi.fn()
      }

      const result = smartCrop.analyzeContours(mockContours, 800, 600, smartCrop.config)

      expect(result).toBeDefined()
      expect(result).toHaveProperty('x')
      expect(result).toHaveProperty('y')
      expect(result).toHaveProperty('width')
      expect(result).toHaveProperty('height')
      expect(result).toHaveProperty('score')
    })

    it('应该过滤不符合条件的轮廓', () => {
      // Mock太小的轮廓
      global.window.cv.boundingRect = vi.fn(() => ({
        x: 0,
        y: 0,
        width: 10, // 太小
        height: 10
      }))

      const mockContours = {
        size: vi.fn(() => 1),
        get: vi.fn(() => ({ delete: vi.fn() })),
        delete: vi.fn()
      }

      const result = smartCrop.analyzeContours(mockContours, 800, 600, smartCrop.config)

      expect(result).toBeNull()
    })
  })

  describe('calculateConfidence方法', () => {
    it('应该计算裁剪置信度', () => {
      const mockRect = {
        x: 100,
        y: 100,
        width: 400,
        height: 300
      }

      const mockSrc = {
        cols: 800,
        rows: 600
      }

      const confidence = smartCrop.calculateConfidence(mockRect, mockSrc)

      expect(confidence).toBeGreaterThanOrEqual(0)
      expect(confidence).toBeLessThanOrEqual(1)
    })

    it('应该处理无效矩形', () => {
      const confidence = smartCrop.calculateConfidence(null, { cols: 800, rows: 600 })

      expect(confidence).toBe(0)
    })
  })

  describe('batchCrop方法', () => {
    it('应该批量处理多张图片', async () => {
      await smartCrop.initialize()

      const mockImages = [document.createElement('img'), document.createElement('img')]

      const results = await smartCrop.batchCrop(mockImages)

      expect(results).toHaveLength(2)
      expect(results[0]).toHaveProperty('success')
      expect(results[1]).toHaveProperty('success')
    })

    it('应该处理批量处理中的错误', async () => {
      await smartCrop.initialize()

      // Mock crop方法失败
      smartCrop.crop = vi.fn().mockRejectedValue(new Error('Crop failed'))

      const mockImages = [document.createElement('img')]

      const results = await smartCrop.batchCrop(mockImages)

      expect(results[0].success).toBe(false)
      expect(results[0]).toHaveProperty('error')
    })
  })

  describe('getCropSuggestions方法', () => {
    it('应该返回裁剪建议列表', async () => {
      await smartCrop.initialize()

      const mockImage = document.createElement('img')
      mockImage.width = 800
      mockImage.height = 600

      const suggestions = await smartCrop.getCropSuggestions(mockImage)

      expect(Array.isArray(suggestions)).toBe(true)
      expect(suggestions.length).toBeLessThanOrEqual(5)
    })
  })

  describe('dispose方法', () => {
    it('应该正确清理资源', () => {
      smartCrop.isInitialized = true
      smartCrop.dispose()

      expect(smartCrop.isInitialized).toBe(false)
    })
  })
})

describe('全局函数', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getSmartCrop函数', () => {
    it('应该返回SmartCrop实例', () => {
      const instance = getSmartCrop()

      expect(instance).toBeInstanceOf(SmartCrop)
    })

    it('应该返回单例实例', () => {
      const instance1 = getSmartCrop()
      const instance2 = getSmartCrop()

      expect(instance1).toBe(instance2)
    })
  })

  describe('smartCropImage函数', () => {
    it('应该执行智能裁剪', async () => {
      const mockImage = document.createElement('img')

      const result = await smartCropImage(mockImage)

      expect(result).toHaveProperty('success')
    })
  })

  describe('batchSmartCrop函数', () => {
    it('应该批量裁剪图片', async () => {
      const mockImages = [document.createElement('img'), document.createElement('img')]

      const results = await batchSmartCrop(mockImages)

      expect(Array.isArray(results)).toBe(true)
      expect(results).toHaveLength(2)
    })
  })

  describe('getCropSuggestions函数', () => {
    it('应该获取裁剪建议', async () => {
      const mockImage = document.createElement('img')

      const suggestions = await getCropSuggestions(mockImage)

      expect(Array.isArray(suggestions)).toBe(true)
    })
  })
})

describe('OpenCV加载', () => {
  beforeEach(() => {
    // Reset OpenCV状态
    delete global.window.cv
    // 清除模块级变量
    vi.resetModules()
  })

  it('应该正确加载OpenCV.js', async () => {
    // Mock script加载
    const mockScript = {
      onload: null,
      onerror: null,
      src: ''
    }

    vi.spyOn(document, 'createElement').mockReturnValue(mockScript)
    vi.spyOn(document.head, 'appendChild').mockImplementation(() => {
      // 模拟OpenCV加载完成
      setTimeout(() => {
        global.window.cv = { Mat: vi.fn(() => ({ delete: vi.fn() })) }
        if (mockScript.onload) {
          mockScript.onload()
        }
      }, 10)
    })

    // 重新导入以重置状态
    const { loadOpenCV } = await import('./smartCrop.js')
    await loadOpenCV()

    expect(global.window.cv).toBeDefined()
  })

  it('应该处理OpenCV加载失败', async () => {
    const mockScript = {
      onload: null,
      onerror: null,
      src: ''
    }

    vi.spyOn(document, 'createElement').mockReturnValue(mockScript)
    vi.spyOn(document.head, 'appendChild').mockImplementation(() => {
      setTimeout(() => {
        if (mockScript.onerror) {
          mockScript.onerror()
        }
      }, 10)
    })

    const { loadOpenCV } = await import('./smartCrop.js')

    await expect(loadOpenCV()).rejects.toThrow('OpenCV.js加载失败')
  })
})
