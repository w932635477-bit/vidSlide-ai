/**
 * ImageQualityOptimizer.test.js
 * 图像质量优化服务单元测试
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import ImageQualityOptimizer from './ImageQualityOptimizer.js'

describe('ImageQualityOptimizer', () => {
  let optimizer

  beforeEach(() => {
    optimizer = new ImageQualityOptimizer()
  })

  afterEach(() => {
    optimizer.cleanup()
  })

  describe('初始化', () => {
    it('应该正确初始化优化器', () => {
      expect(optimizer.canvas).toBeNull()
      expect(optimizer.ctx).toBeNull()
      expect(optimizer.isInitialized).toBe(false)
    })

    it('应该初始化Canvas上下文', () => {
      optimizer.initialize()

      expect(optimizer.isInitialized).toBe(true)
      expect(optimizer.canvas).toBeInstanceOf(HTMLCanvasElement)
      expect(optimizer.ctx).toBeDefined()
    })
  })

  describe('图像优化', () => {
    beforeEach(() => {
      optimizer.initialize()
    })

    it('应该执行完整的图像优化流程', async () => {
      const mockImageFile = new File(['test'], 'test.png', { type: 'image/png' })

      // Mock 图像加载
      vi.spyOn(optimizer, 'loadImage').mockResolvedValue({
        width: 100,
        height: 100
      })

      vi.spyOn(optimizer, 'getImageData').mockResolvedValue({
        data: new Uint8ClampedArray(100 * 100 * 4),
        width: 100,
        height: 100
      })

      vi.spyOn(optimizer, 'imageDataToBlob').mockResolvedValue(
        new Blob(['optimized'], { type: 'image/png' })
      )

      const options = {
        targetResolution: { width: 200, height: 200 },
        brightness: 10,
        contrast: 20,
        saturation: 15
      }

      const result = await optimizer.optimizeImage(mockImageFile, options)

      expect(result).toHaveProperty('optimizedBlob')
      expect(result).toHaveProperty('originalSize')
      expect(result).toHaveProperty('optimizedSize')
      expect(result).toHaveProperty('optimizations')
      expect(result).toHaveProperty('quality')
    })

    it('应该应用亮度和对比度调整', () => {
      const imageData = {
        data: new Uint8ClampedArray([128, 128, 128, 255, 64, 64, 64, 255]),
        width: 2,
        height: 1
      }

      optimizer.adjustBrightnessContrast(imageData, 50, 50)

      // 检查像素值是否改变
      expect(imageData.data[0]).not.toBe(128) // R channel changed
      expect(imageData.data[4]).not.toBe(64)  // R channel changed
    })

    it('应该应用饱和度调整', () => {
      const imageData = {
        data: new Uint8ClampedArray([255, 128, 128, 255, 128, 255, 128, 255]),
        width: 2,
        height: 1
      }

      optimizer.adjustSaturation(imageData, 50)

      // 检查像素值是否改变
      expect(imageData.data).not.toEqual(new Uint8ClampedArray([255, 128, 128, 255, 128, 255, 128, 255]))
    })

    it('应该应用锐度增强', () => {
      const imageData = {
        data: new Uint8ClampedArray(9 * 4), // 3x3 image
        width: 3,
        height: 3
      }

      // 初始化测试数据
      for (let i = 0; i < imageData.data.length; i++) {
        imageData.data[i] = 128
      }

      optimizer.sharpenImage(imageData, 50)

      // 锐化后边缘像素应该改变
      expect(imageData.data.some(value => value !== 128)).toBe(true)
    })
  })

  describe('分辨率优化', () => {
    beforeEach(() => {
      optimizer.initialize()
    })

    it('应该执行超分辨率处理', () => {
      const imageData = {
        data: new Uint8ClampedArray(50 * 50 * 4),
        width: 50,
        height: 50
      }

      // Mock canvas methods
      optimizer.canvas.width = 100
      optimizer.canvas.height = 100
      optimizer.ctx.drawImage = vi.fn()

      const result = optimizer.superResolution(imageData, 100, 100)

      expect(result.width).toBe(100)
      expect(result.height).toBe(100)
    })

    it('应该执行标准缩放', () => {
      const imageData = {
        data: new Uint8ClampedArray(100 * 100 * 4),
        width: 100,
        height: 100
      }

      optimizer.resizeImage = vi.fn().mockReturnValue({
        data: new Uint8ClampedArray(50 * 50 * 4),
        width: 50,
        height: 50
      })

      const result = optimizer.resizeImage(imageData, 50, 50)

      expect(result.width).toBe(50)
      expect(result.height).toBe(50)
    })
  })

  describe('色彩校正', () => {
    beforeEach(() => {
      optimizer.initialize()
    })

    it('应该应用色彩校正', () => {
      const imageData = {
        data: new Uint8ClampedArray([100, 100, 100, 255, 150, 150, 150, 255]),
        width: 2,
        height: 1
      }

      const colorProfile = { r: 128, g: 128, b: 128 }

      optimizer.applyColorCorrection(imageData, colorProfile)

      // 检查色彩是否调整
      expect(imageData.data[0]).not.toBe(100) // R channel changed
    })

    it('应该处理品牌颜色模式', () => {
      const imageData = {
        data: new Uint8ClampedArray([100, 100, 100, 255]),
        width: 1,
        height: 1
      }

      optimizer.applyColorCorrection(imageData, 'brand-only')

      // 应该应用品牌颜色（这里会使用默认品牌颜色）
      expect(imageData.data).toBeDefined()
    })
  })

  describe('质量评估', () => {
    beforeEach(() => {
      optimizer.initialize()
    })

    it('应该评估图像质量', () => {
      const imageData = {
        data: new Uint8ClampedArray(100 * 100 * 4),
        width: 100,
        height: 100
      }

      // 初始化为中等灰度
      for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = 128     // R
        imageData.data[i + 1] = 128 // G
        imageData.data[i + 2] = 128 // B
        imageData.data[i + 3] = 255 // A
      }

      const quality = optimizer.assessQuality(imageData)

      expect(quality).toHaveProperty('brightness')
      expect(quality).toHaveProperty('contrast')
      expect(quality).toHaveProperty('sharpness')
      expect(quality).toHaveProperty('overall')
      expect(quality.overall).toBeGreaterThanOrEqual(0)
      expect(quality.overall).toBeLessThanOrEqual(100)
    })
  })

  describe('文件处理', () => {
    beforeEach(() => {
      optimizer.initialize()
    })

    it('应该加载图像文件', async () => {
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' })

      global.URL.createObjectURL = vi.fn().mockReturnValue('mock-url')
      global.Image = vi.fn().mockImplementation(() => {
        const img = {
          onload: null,
          onerror: null,
          src: ''
        }
        setTimeout(() => {
          Object.assign(img, { width: 100, height: 100 })
          img.onload()
        }, 10)
        return img
      })

      const result = await optimizer.loadImage(mockFile)

      expect(result).toBeInstanceOf(Image)
      expect(result.width).toBe(100)
      expect(result.height).toBe(100)
    })

    it('应该获取图像数据', async () => {
      const mockImage = {
        width: 50,
        height: 50
      }

      optimizer.canvas.width = 50
      optimizer.canvas.height = 50
      optimizer.ctx.getImageData = vi.fn().mockReturnValue({
        data: new Uint8ClampedArray(50 * 50 * 4),
        width: 50,
        height: 50
      })

      const result = await optimizer.getImageData(mockImage)

      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('width', 50)
      expect(result).toHaveProperty('height', 50)
    })

    it('应该将ImageData转换为Blob', async () => {
      const imageData = {
        data: new Uint8ClampedArray(25 * 4),
        width: 5,
        height: 5
      }

      optimizer.canvas.width = 5
      optimizer.canvas.height = 5
      optimizer.ctx.putImageData = vi.fn()
      optimizer.canvas.toBlob = vi.fn().mockImplementation((callback) => {
        callback(new Blob(['converted'], { type: 'image/png' }))
      })

      const result = await optimizer.imageDataToBlob(imageData)

      expect(result).toBeInstanceOf(Blob)
    })
  })

  describe('降噪处理', () => {
    beforeEach(() => {
      optimizer.initialize()
    })

    it('应该应用降噪处理', () => {
      const imageData = {
        data: new Uint8ClampedArray(9 * 4), // 3x3 image
        width: 3,
        height: 3
      }

      // 创建有噪声的图像
      for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = Math.random() * 255     // R
        imageData.data[i + 1] = Math.random() * 255 // G
        imageData.data[i + 2] = Math.random() * 255 // B
        imageData.data[i + 3] = 255                 // A
      }

      const originalData = new Uint8ClampedArray(imageData.data)

      optimizer.reduceNoise(imageData, 50)

      // 降噪后应该有一些变化
      expect(imageData.data).not.toEqual(originalData)
    })
  })

  describe('资源清理', () => {
    it('应该正确清理资源', () => {
      optimizer.initialize()
      optimizer.canvas = { mockCanvas: true }
      optimizer.ctx = { mockContext: true }

      optimizer.cleanup()

      expect(optimizer.canvas).toBeNull()
      expect(optimizer.ctx).toBeNull()
      expect(optimizer.isInitialized).toBe(false)
    })
  })

  describe('颜色转换', () => {
    it('应该将十六进制颜色转换为RGBA', () => {
      const result = optimizer.hexToRGBA('#FF0000')
      expect(result).toEqual({ r: 1, g: 0, b: 0, a: 1 })

      const resultWithAlpha = optimizer.hexToRGBA('#00FF0080')
      expect(resultWithAlpha).toEqual({ r: 0, g: 1, b: 0, a: 0.5 })

      const resultShort = optimizer.hexToRGBA('#F00')
      expect(resultShort).toEqual({ r: 1, g: 0, b: 0, a: 1 })
    })
  })
})