/**
 * BackgroundRemoval 单元测试
 * 测试背景移除功能的各项功能
 *
 * @author VidSlide AI Team
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  BackgroundRemoval,
  getBackgroundRemoval,
  removeImageBackground,
  batchRemoveBackgrounds,
  getBackgroundRemovalSuggestions
} from './backgroundRemoval.js'

// Mock TensorFlow.js
global.tf = {
  loadGraphModel: vi.fn(() =>
    Promise.resolve({
      predict: vi.fn(() => ({
        squeeze: vi.fn(() => ({
          slice: vi.fn(() => ({
            expandDims: vi.fn(() => ({
              greater: vi.fn(() => ({
                dataSync: vi.fn(() => new Float32Array(400 * 300).fill(0.8))
              }))
            }))
          }))
        }))
      }))
    })
  ),
  browser: {
    fromPixels: vi.fn(() => ({
      resizeBilinear: vi.fn(() => ({
        div: vi.fn(() => ({
          expandDims: vi.fn(() => ({}))
        }))
      }))
    }))
  },
  image: {
    resizeBilinear: vi.fn(() => ({
      greater: vi.fn(() => ({
        dataSync: vi.fn(() => new Float32Array(400 * 300).fill(0.8))
      }))
    }))
  },
  tidy: vi.fn(fn => fn())
}

// Mock HTML Canvas API
global.HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  getImageData: vi.fn(() => ({
    data: new Uint8ClampedArray(400 * 300 * 4),
    width: 400,
    height: 300
  })),
  putImageData: vi.fn(),
  drawImage: vi.fn()
}))

// Mock console methods
const _consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
const _consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
const _consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

describe('BackgroundRemoval', () => {
  let backgroundRemoval

  beforeEach(() => {
    vi.clearAllMocks()
    backgroundRemoval = new BackgroundRemoval()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('构造函数', () => {
    it('应该正确初始化BackgroundRemoval实例', () => {
      expect(backgroundRemoval).toBeInstanceOf(BackgroundRemoval)
      expect(backgroundRemoval.config).toBeDefined()
      expect(backgroundRemoval.isInitialized).toBe(false)
    })

    it('应该包含完整的配置对象', () => {
      expect(backgroundRemoval.config).toHaveProperty('model')
      expect(backgroundRemoval.config).toHaveProperty('segmentation')
      expect(backgroundRemoval.config).toHaveProperty('postProcessing')
      expect(backgroundRemoval.config).toHaveProperty('performance')
    })
  })

  describe('initialize方法', () => {
    it('应该成功初始化TensorFlow和DeepLab模型', async () => {
      await backgroundRemoval.initialize()

      expect(backgroundRemoval.isInitialized).toBe(true)
      expect(_consoleLogSpy).toHaveBeenCalledWith('BackgroundRemoval initialized with DeepLab v3')
    })

    it('应该避免重复初始化', async () => {
      backgroundRemoval.isInitialized = true

      await backgroundRemoval.initialize()

      expect(_consoleLogSpy).not.toHaveBeenCalled()
    })
  })

  describe('removeBackground方法', () => {
    beforeEach(async () => {
      await backgroundRemoval.initialize()
    })

    it('应该成功执行背景移除', async () => {
      const mockImage = document.createElement('img')
      mockImage.width = 400
      mockImage.height = 300

      const result = await backgroundRemoval.removeBackground(mockImage)

      expect(result.success).toBe(true)
      expect(result).toHaveProperty('resultImage')
      expect(result).toHaveProperty('processingTime')
      expect(result).toHaveProperty('confidence')
      expect(result).toHaveProperty('maskData')
    })

    it('应该处理背景移除失败', async () => {
      // Mock preprocessImage失败
      backgroundRemoval.preprocessImage = vi.fn().mockImplementation(() => {
        throw new Error('Image processing failed')
      })

      const mockImage = document.createElement('img')

      const result = await backgroundRemoval.removeBackground(mockImage)

      expect(result.success).toBe(false)
      expect(result).toHaveProperty('error')
      expect(_consoleErrorSpy).toHaveBeenCalledWith('Background removal failed:', expect.any(Error))
    })
  })

  describe('preprocessImage方法', () => {
    it('应该将HTMLImageElement转换为处理格式', () => {
      const mockImage = document.createElement('img')
      mockImage.width = 800
      mockImage.height = 600

      const result = backgroundRemoval.preprocessImage(mockImage, 400)

      expect(result).toHaveProperty('canvas')
      expect(result).toHaveProperty('ctx')
      expect(result).toHaveProperty('imageData')
      expect(result).toHaveProperty('width')
      expect(result).toHaveProperty('height')
      expect(result.width).toBeLessThanOrEqual(400)
    })

    it('应该将HTMLCanvasElement转换为处理格式', () => {
      const mockCanvas = document.createElement('canvas')
      mockCanvas.width = 400
      mockCanvas.height = 300

      const result = backgroundRemoval.preprocessImage(mockCanvas, 400)

      expect(result).toHaveProperty('canvas')
      expect(result.canvas).toBe(mockCanvas)
    })

    it('应该正确缩放图像', () => {
      const mockImage = document.createElement('img')
      mockImage.width = 800
      mockImage.height = 600

      backgroundRemoval.preprocessImage(mockImage, 400)

      // 验证缩放后的尺寸 (800x600 -> 400x300)
      expect(global.HTMLCanvasElement.prototype.getContext).toHaveBeenCalled()
    })
  })

  describe('performSegmentation方法', () => {
    it('应该执行语义分割推理', async () => {
      const mockProcessedImage = {
        imageData: { data: new Uint8ClampedArray(400 * 300 * 4), width: 400, height: 300 },
        width: 400,
        height: 300
      }

      const result = await backgroundRemoval.performSegmentation(
        mockProcessedImage,
        backgroundRemoval.config
      )

      expect(result).toHaveProperty('maskData')
      expect(result).toHaveProperty('confidence')
      expect(result).toHaveProperty('width')
      expect(result).toHaveProperty('height')
      expect(result.maskData).toBeInstanceOf(Float32Array)
    })

    it('应该正确计算分割置信度', async () => {
      const mockProcessedImage = {
        imageData: { data: new Uint8ClampedArray(100 * 100 * 4), width: 100, height: 100 },
        width: 100,
        height: 100
      }

      const result = await backgroundRemoval.performSegmentation(
        mockProcessedImage,
        backgroundRemoval.config
      )

      expect(typeof result.confidence).toBe('number')
      expect(result.confidence).toBeGreaterThanOrEqual(0)
      expect(result.confidence).toBeLessThanOrEqual(1)
    })
  })

  describe('postProcess方法', () => {
    it('应该生成背景移除结果', async () => {
      const mockSegmentationResult = {
        maskData: new Float32Array(400 * 300).fill(0.8),
        confidence: 0.8,
        width: 400,
        height: 300
      }

      const mockProcessedImage = {
        imageData: {
          data: new Uint8ClampedArray(400 * 300 * 4).fill(128),
          width: 400,
          height: 300
        },
        width: 400,
        height: 300,
        ctx: { putImageData: vi.fn() }
      }

      const result = await backgroundRemoval.postProcess(
        mockSegmentationResult,
        mockProcessedImage,
        backgroundRemoval.config
      )

      expect(result).toBeInstanceOf(HTMLCanvasElement)
      expect(result.width).toBe(400)
      expect(result.height).toBe(300)
    })

    it('应该应用边缘羽化', async () => {
      const mockSegmentationResult = {
        maskData: new Float32Array(100).fill(0.8),
        confidence: 0.8,
        width: 10,
        height: 10
      }

      const mockProcessedImage = {
        imageData: { data: new Uint8ClampedArray(400), width: 10, height: 10 },
        width: 10,
        height: 10,
        ctx: { putImageData: vi.fn() }
      }

      await backgroundRemoval.postProcess(
        mockSegmentationResult,
        mockProcessedImage,
        backgroundRemoval.config
      )

      expect(mockProcessedImage.ctx.putImageData).toHaveBeenCalled()
    })
  })

  describe('applyFeathering方法', () => {
    it('应该应用边缘羽化效果', () => {
      const maskData = new Float32Array(100).fill(1)
      const result = backgroundRemoval.applyFeathering(maskData, 5, 5, 10, 10, 2)

      expect(typeof result).toBe('number')
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThanOrEqual(1)
    })

    it('应该处理边界情况', () => {
      const maskData = new Float32Array(100).fill(1)
      const result = backgroundRemoval.applyFeathering(maskData, 0, 0, 10, 10, 2)

      expect(typeof result).toBe('number')
    })

    it('应该在featherAmount为0时返回原始值', () => {
      const maskData = new Float32Array(100).fill(0.8)
      const result = backgroundRemoval.applyFeathering(maskData, 5, 5, 10, 10, 0)

      expect(result).toBe(0.8)
    })
  })

  describe('batchRemoveBackground方法', () => {
    it('应该批量处理背景移除', async () => {
      await backgroundRemoval.initialize()

      const mockImages = [document.createElement('img'), document.createElement('img')]

      const results = await backgroundRemoval.batchRemoveBackground(mockImages)

      expect(results).toHaveLength(2)
      expect(results[0]).toHaveProperty('success')
      expect(results[1]).toHaveProperty('success')
    })

    it('应该处理批量处理中的错误', async () => {
      await backgroundRemoval.initialize()

      // Mock removeBackground方法失败
      backgroundRemoval.removeBackground = vi.fn().mockRejectedValue(new Error('Removal failed'))

      const mockImages = [document.createElement('img')]

      const results = await backgroundRemoval.batchRemoveBackground(mockImages)

      expect(results[0].success).toBe(false)
      expect(results[0]).toHaveProperty('error')
    })
  })

  describe('getRemovalSuggestions方法', () => {
    it('应该返回背景移除建议', async () => {
      await backgroundRemoval.initialize()

      const mockImage = document.createElement('img')
      mockImage.width = 400
      mockImage.height = 300

      const suggestions = await backgroundRemoval.getRemovalSuggestions(mockImage)

      expect(suggestions).toHaveProperty('hasPerson')
      expect(suggestions).toHaveProperty('confidence')
      expect(suggestions).toHaveProperty('estimatedProcessingTime')
      expect(suggestions).toHaveProperty('recommendedSettings')
    })

    it('应该处理建议获取失败', async () => {
      await backgroundRemoval.initialize()

      // Mock preprocessImage失败
      backgroundRemoval.preprocessImage = vi.fn().mockImplementation(() => {
        throw new Error('Processing failed')
      })

      const mockImage = document.createElement('img')

      const suggestions = await backgroundRemoval.getRemovalSuggestions(mockImage)

      expect(suggestions.hasPerson).toBe(false)
      expect(suggestions.confidence).toBe(0)
      expect(suggestions).toHaveProperty('error')
    })
  })

  describe('getRecommendedSettings方法', () => {
    it('应该根据置信度返回推荐设置', () => {
      const highConfidence = backgroundRemoval.getRecommendedSettings(0.9)
      const mediumConfidence = backgroundRemoval.getRecommendedSettings(0.7)
      const lowConfidence = backgroundRemoval.getRecommendedSettings(0.3)

      expect(highConfidence.quality).toBe('high')
      expect(mediumConfidence.quality).toBe('medium')
      expect(lowConfidence.quality).toBe('low')
    })
  })

  describe('dispose方法', () => {
    it('应该正确清理资源', () => {
      backgroundRemoval.isInitialized = true
      backgroundRemoval.dispose()

      expect(backgroundRemoval.isInitialized).toBe(false)
    })
  })
})

describe('全局函数', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getBackgroundRemoval函数', () => {
    it('应该返回BackgroundRemoval实例', () => {
      const instance = getBackgroundRemoval()

      expect(instance).toBeInstanceOf(BackgroundRemoval)
    })

    it('应该返回单例实例', () => {
      const instance1 = getBackgroundRemoval()
      const instance2 = getBackgroundRemoval()

      expect(instance1).toBe(instance2)
    })
  })

  describe('removeImageBackground函数', () => {
    it('应该执行背景移除', async () => {
      const mockImage = document.createElement('img')

      const result = await removeImageBackground(mockImage)

      expect(result).toHaveProperty('success')
    })
  })

  describe('batchRemoveBackgrounds函数', () => {
    it('应该批量移除背景', async () => {
      const mockImages = [document.createElement('img'), document.createElement('img')]

      const results = await batchRemoveBackgrounds(mockImages)

      expect(Array.isArray(results)).toBe(true)
      expect(results).toHaveLength(2)
    })
  })

  describe('getBackgroundRemovalSuggestions函数', () => {
    it('应该获取移除建议', async () => {
      const mockImage = document.createElement('img')

      const suggestions = await getBackgroundRemovalSuggestions(mockImage)

      expect(suggestions).toHaveProperty('hasPerson')
    })
  })
})

describe('TensorFlow加载', () => {
  beforeEach(() => {
    // Reset TensorFlow状态
    delete global.tf
    // 清除模块级变量
    vi.resetModules()
  })

  it('应该正确加载TensorFlow.js', async () => {
    // Mock script加载
    const mockScript = {
      onload: null,
      onerror: null,
      src: ''
    }

    vi.spyOn(document, 'createElement').mockReturnValue(mockScript)
    vi.spyOn(document.head, 'appendChild').mockImplementation(() => {
      // 模拟TensorFlow加载完成
      setTimeout(() => {
        global.tf = { loadGraphModel: vi.fn(() => Promise.resolve({})) }
        if (mockScript.onload) {
          mockScript.onload()
        }
      }, 10)
    })

    // 重新导入以重置状态
    const { loadTensorFlow } = await import('./backgroundRemoval.js')
    await loadTensorFlow()

    expect(global.tf).toBeDefined()
  })

  it('应该处理TensorFlow加载失败', async () => {
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

    const { loadTensorFlow } = await import('./backgroundRemoval.js')

    await expect(loadTensorFlow()).rejects.toThrow('TensorFlow.js加载失败')
  })
})
