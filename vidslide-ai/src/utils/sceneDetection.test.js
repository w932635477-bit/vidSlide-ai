/**
 * sceneDetection.js 单元测试
 * VidSlide AI - 场景检测算法测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SceneDetection, FaceRecognitionValidator } from './sceneDetection.js'

describe('SceneDetection', () => {
  let sceneDetector
  let mockCanvas
  let mockContext

  beforeEach(() => {
    // 创建模拟的Canvas和Context
    mockCanvas = {
      width: 640,
      height: 360,
      getContext: vi.fn()
    }

    mockContext = {
      drawImage: vi.fn(),
      getImageData: vi.fn(),
      createImageData: vi.fn()
    }

    mockCanvas.getContext.mockReturnValue(mockContext)

    // Mock document.createElement
    vi.spyOn(document, 'createElement').mockReturnValue(mockCanvas)

    sceneDetector = new SceneDetection()
  })

  describe('初始化', () => {
    it('应该正确初始化Canvas环境', () => {
      sceneDetector.initialize(640, 360)

      expect(document.createElement).toHaveBeenCalledWith('canvas')
      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d', { willReadFrequently: true })
      expect(sceneDetector.canvas).toBe(mockCanvas)
      expect(sceneDetector.context).toBe(mockContext)
    })
  })

  describe('图像差异检测', () => {
    it('应该正确计算图像差异', () => {
      // 创建测试帧数据
      const frame1 = {
        width: 2,
        height: 2,
        data: new Uint8ClampedArray([
          255,
          0,
          0,
          255, // 红色像素
          0,
          255,
          0,
          255, // 绿色像素
          0,
          0,
          255,
          255, // 蓝色像素
          255,
          255,
          255,
          255 // 白色像素
        ])
      }

      const frame2 = {
        width: 2,
        height: 2,
        data: new Uint8ClampedArray([
          0,
          255,
          255,
          255, // 青色像素
          255,
          0,
          255,
          255, // 品红像素
          255,
          255,
          0,
          255, // 黄色像素
          0,
          0,
          0,
          255 // 黑色像素
        ])
      }

      sceneDetector.previousFrame = frame1
      const diff = sceneDetector.detectImageDifference(frame2, frame1)

      expect(typeof diff).toBe('number')
      expect(diff).toBeGreaterThan(0)
      expect(diff).toBeLessThanOrEqual(1)
    })

    it('应该在没有前一帧时返回0', () => {
      const frame = {
        width: 2,
        height: 2,
        data: new Uint8ClampedArray([
          255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 255, 255, 255, 255
        ])
      }

      const diff = sceneDetector.detectImageDifference(frame, null)
      expect(diff).toBe(0)
    })
  })

  describe('运动检测', () => {
    it('应该检测到帧间运动', () => {
      // 创建足够大的帧数据来测试运动检测 (至少16x16以支持blockSize=16)
      const size = 32
      const frame1 = {
        width: size,
        height: size,
        data: new Uint8ClampedArray(size * size * 4).fill(0) // 黑色填充
      }

      const frame2 = {
        width: size,
        height: size,
        data: new Uint8ClampedArray(size * size * 4).fill(255) // 白色填充
      }

      const motion = sceneDetector.detectMotion(frame2, frame1)
      console.log('检测到的运动值:', motion)
      expect(motion).toBeGreaterThan(0)
    })

    it('应该在没有前一帧时返回0', () => {
      const frame = {
        width: 16,
        height: 16,
        data: new Uint8ClampedArray(16 * 16 * 4).fill(128)
      }

      const motion = sceneDetector.detectMotion(frame, null)
      expect(motion).toBe(0)
    })
  })

  describe('镜头切换检测', () => {
    it('应该检测到硬剪辑', () => {
      const frame1 = {
        width: 2,
        height: 2,
        data: new Uint8ClampedArray([
          255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255
        ])
      }

      const frame2 = {
        width: 2,
        height: 2,
        data: new Uint8ClampedArray([
          0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255
        ])
      }

      const cutResult = sceneDetector.detectCut(frame2, frame1)
      expect(cutResult.isCut).toBe(true)
      expect(cutResult.confidence).toBeGreaterThan(0)
    })

    it('应该正确识别非剪辑点', () => {
      const frame1 = {
        width: 2,
        height: 2,
        data: new Uint8ClampedArray([
          128, 128, 128, 255, 128, 128, 128, 255, 128, 128, 128, 255, 128, 128, 128, 255
        ])
      }

      const frame2 = {
        width: 2,
        height: 2,
        data: new Uint8ClampedArray([
          130, 130, 130, 255, 130, 130, 130, 255, 130, 130, 130, 255, 130, 130, 130, 255
        ])
      }

      const cutResult = sceneDetector.detectCut(frame2, frame1)
      expect(cutResult.isCut).toBe(false)
      expect(cutResult.confidence).toBeLessThan(0.5)
    })
  })

  describe('综合场景检测', () => {
    it('应该综合所有算法进行场景检测', () => {
      const frame1 = {
        width: 16,
        height: 16,
        data: new Uint8ClampedArray(16 * 16 * 4).fill(0)
      }

      const frame2 = {
        width: 16,
        height: 16,
        data: new Uint8ClampedArray(16 * 16 * 4).fill(255)
      }

      const result = sceneDetector.detectSceneChange(frame2, frame1, null, 10.5)

      expect(result).toHaveProperty('timestamp', 10.5)
      expect(result).toHaveProperty('isSceneChange')
      expect(result).toHaveProperty('changeType')
      expect(result).toHaveProperty('confidence')
      expect(result).toHaveProperty('metrics')
      expect(result.isSceneChange).toBe(true)
    })
  })

  describe('资源清理', () => {
    it('应该正确清理资源', () => {
      sceneDetector.initialize()
      sceneDetector.dispose()

      expect(sceneDetector.canvas).toBeNull()
      expect(sceneDetector.context).toBeNull()
      expect(sceneDetector.previousFrame).toBeNull()
      expect(sceneDetector.frameBuffer).toEqual([])
    })
  })
})

describe('FaceRecognitionValidator', () => {
  let validator

  beforeEach(() => {
    validator = new FaceRecognitionValidator()

    // Mock navigator APIs
    Object.defineProperty(navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      configurable: true
    })
  })

  describe('Web API支持检查', () => {
    it('应该检查WebGL支持', () => {
      const hasWebGL = validator.checkWebGLSupport()
      expect(typeof hasWebGL).toBe('boolean')
    })

    it('应该生成兼容性报告', () => {
      const report = validator.getCompatibilityReport()

      expect(report).toHaveProperty('timestamp')
      expect(report).toHaveProperty('userAgent')
      expect(report).toHaveProperty('capabilities')
      expect(report).toHaveProperty('recommendations')
      expect(Array.isArray(report.recommendations)).toBe(true)
    })
  })

  describe('人脸识别功能验证', () => {
    it('应该验证人脸识别功能', async () => {
      // Mock the script loading to avoid DOM manipulation
      const originalCheckFaceMesh = validator.checkFaceMeshAvailability
      validator.checkFaceMeshAvailability = vi.fn().mockResolvedValue(true)

      const result = await validator.validateFaceRecognition()

      expect(result).toHaveProperty('isAvailable')
      expect(result).toHaveProperty('capabilities')
      expect(result).toHaveProperty('details')
      expect(typeof result.isAvailable).toBe('boolean')

      // Restore original method
      validator.checkFaceMeshAvailability = originalCheckFaceMesh
    })

    it('应该处理脚本加载失败', async () => {
      // Mock the script loading to avoid DOM manipulation
      const originalCheckFaceMesh = validator.checkFaceMeshAvailability
      validator.checkFaceMeshAvailability = vi.fn().mockResolvedValue(false)

      const result = await validator.validateFaceRecognition()

      // Should still return a result object even if validation fails
      expect(result).toHaveProperty('isAvailable')
      expect(result).toHaveProperty('capabilities')
      expect(typeof result.isAvailable).toBe('boolean')

      // Restore original method
      validator.checkFaceMeshAvailability = originalCheckFaceMesh
    })
  })
})
