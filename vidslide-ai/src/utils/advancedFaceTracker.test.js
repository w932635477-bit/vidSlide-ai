/**
 * AdvancedFaceTracker 单元测试
 * 测试高级人脸跟踪器的功能和性能
 *
 * @author VidSlide AI Team
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  AdvancedFaceTracker,
  createAdvancedFaceTracker,
  checkFaceTrackingSupport
} from './advancedFaceTracker.js'

// Mock MediaPipe FaceMesh
global.FaceMesh = vi.fn().mockImplementation(() => ({
  setOptions: vi.fn(),
  onResults: vi.fn(),
  send: vi.fn(),
  close: vi.fn()
}))

// Mock WebAssembly
global.WebAssembly = {}

// Mock performance API
global.performance = {
  now: vi.fn(() => Date.now()),
  memory: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
    jsHeapSizeLimit: 5000000
  }
}

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn(callback => setTimeout(callback, 16))
global.cancelAnimationFrame = vi.fn()

// Mock HTMLCanvasElement for WebGL check
const mockGetContext = vi.fn()
global.HTMLCanvasElement.prototype.getContext = mockGetContext

describe('AdvancedFaceTracker', () => {
  let tracker

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetContext.mockReturnValue({}) // Mock WebGL support
    tracker = new AdvancedFaceTracker()
  })

  afterEach(() => {
    if (tracker) {
      tracker.dispose()
    }
  })

  describe('构造函数', () => {
    it('应该正确初始化AdvancedFaceTracker实例', () => {
      expect(tracker).toBeInstanceOf(AdvancedFaceTracker)
      expect(tracker.isInitialized).toBe(false)
      expect(tracker.isTracking).toBe(false)
      expect(tracker.faceMesh).toBeNull()
    })

    it('应该接受配置选项', () => {
      const options = { maxNumFaces: 2, smoothFactor: 0.5 }
      const customTracker = new AdvancedFaceTracker(options)

      expect(customTracker.options.maxNumFaces).toBe(2)
      expect(customTracker.options.smoothFactor).toBe(0.5)
    })
  })

  describe('兼容性检查', () => {
    it('应该正确检查人脸跟踪支持', () => {
      const support = checkFaceTrackingSupport()

      expect(support).toHaveProperty('webAssembly')
      expect(support).toHaveProperty('webGL')
      expect(support).toHaveProperty('mediaPipe')
      expect(support).toHaveProperty('performance')
      expect(support).toHaveProperty('overall')
    })

    it('应该在WebAssembly不支持时返回false', () => {
      const originalWebAssembly = global.WebAssembly
      delete global.WebAssembly

      const support = checkFaceTrackingSupport()
      expect(support.webAssembly).toBe(false)
      expect(support.overall).toBe(false)

      global.WebAssembly = originalWebAssembly
    })

    it('应该在WebGL不支持时返回false', () => {
      mockGetContext.mockReturnValue(null)

      const support = checkFaceTrackingSupport()
      expect(support.webGL).toBe(false)
    })
  })

  describe('初始化', () => {
    it('应该成功初始化', async () => {
      const result = await tracker.initialize()

      expect(result).toBe(true)
      expect(tracker.isInitialized).toBe(true)
      expect(tracker.faceMesh).toBeInstanceOf(global.FaceMesh)
    })

    it('应该在WebAssembly不支持时抛出错误', async () => {
      const originalWebAssembly = global.WebAssembly
      delete global.WebAssembly

      await expect(tracker.initialize()).rejects.toThrow('WebAssembly not supported')

      global.WebAssembly = originalWebAssembly
    })

    it('应该在WebGL不支持时抛出错误', async () => {
      mockGetContext.mockReturnValue(null)

      await expect(tracker.initialize()).rejects.toThrow('WebGL not supported')
    })

    it('应该防止重复初始化', async () => {
      await tracker.initialize()
      const result = await tracker.initialize()

      expect(result).toBe(true)
      expect(global.FaceMesh).toHaveBeenCalledTimes(1)
    })
  })

  describe('结果处理', () => {
    beforeEach(async () => {
      await tracker.initialize()
    })

    it('应该处理人脸检测结果', () => {
      const mockResults = {
        multiFaceLandmarks: [
          [
            { x: 0.5, y: 0.5, z: 0 },
            { x: 0.4, y: 0.4, z: 0 }
            // ... 更多关键点
          ]
        ],
        multiFaceGeometry: [
          {
            poseTransformMatrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0.8]
          }
        ]
      }

      tracker.handleResults(mockResults)

      expect(tracker.trackingState.faceDetected).toBe(true)
      expect(tracker.trackingState.faceCount).toBe(1)
      expect(tracker.trackingState.dominantFace).toBe(0)
    })

    it('应该处理无人脸的情况', () => {
      tracker.trackingState.faceDetected = true

      const mockResults = {
        multiFaceLandmarks: [],
        multiFaceGeometry: []
      }

      tracker.handleResults(mockResults)

      expect(tracker.trackingState.faceDetected).toBe(false)
      expect(tracker.trackingState.faceCount).toBe(0)
    })

    it('应该计算人脸边界框', () => {
      const landmarks = [
        { x: 0.2, y: 0.2, z: 0 },
        { x: 0.8, y: 0.8, z: 0 }
      ]

      const bounds = tracker.calculateFaceBounds(landmarks)

      expect(bounds.minX).toBe(0.2)
      expect(bounds.minY).toBe(0.2)
      expect(bounds.maxX).toBe(0.8)
      expect(bounds.maxY).toBe(0.8)
      expect(bounds.centerX).toBe(0.5)
      expect(bounds.centerY).toBe(0.5)
    })
  })

  describe('跟踪控制', () => {
    let mockVideoElement

    beforeEach(async () => {
      await tracker.initialize()
      mockVideoElement = { videoWidth: 640, videoHeight: 480 }
    })

    it('应该开始跟踪', async () => {
      await tracker.startTracking(mockVideoElement)

      expect(tracker.isTracking).toBe(true)
      expect(global.requestAnimationFrame).toHaveBeenCalled()
    })

    it('应该在未初始化时拒绝开始跟踪', async () => {
      const uninitializedTracker = new AdvancedFaceTracker()

      await expect(uninitializedTracker.startTracking(mockVideoElement)).rejects.toThrow(
        '人脸跟踪器未初始化'
      )
    })

    it('应该停止跟踪', async () => {
      await tracker.startTracking(mockVideoElement)
      tracker.stopTracking()

      expect(tracker.isTracking).toBe(false)
      expect(global.cancelAnimationFrame).toHaveBeenCalled()
    })
  })

  describe('位置跟踪', () => {
    beforeEach(async () => {
      await tracker.initialize()
    })

    it('应该更新平滑位置', () => {
      const landmarks = [
        { x: 0.1, y: 0.1, z: 0 }, // 关键点0
        { x: 0.2, y: 0.2, z: 0 }, // 关键点1
        { x: 0.3, y: 0.3, z: 0 }, // 关键点2
        { x: 0.4, y: 0.4, z: 0 }, // 关键点3
        { x: 0.5, y: 0.5, z: 0 }, // 关键点4
        { x: 0.6, y: 0.6, z: 0 } // 关键点5 (鼻子尖)
      ]

      tracker.updateSmoothedPosition(landmarks)

      expect(tracker.trackingState.smoothedPosition.x).toBe(0.6)
      expect(tracker.trackingState.smoothedPosition.y).toBe(0.6)
    })

    it('应该返回人脸位置', () => {
      tracker.trackingState.faceDetected = true
      tracker.trackingState.smoothedPosition = { x: 0.5, y: 0.5 }
      tracker.trackingState.faceBounds = { minX: 0.2, minY: 0.2, maxX: 0.8, maxY: 0.8 }
      tracker.trackingState.confidence = 0.9

      const position = tracker.getFacePosition()

      expect(position).toEqual({
        x: 0.5,
        y: 0.5,
        bounds: tracker.trackingState.faceBounds,
        confidence: 0.9
      })
    })

    it('应该在无人脸时返回null', () => {
      tracker.trackingState.faceDetected = false

      const position = tracker.getFacePosition()

      expect(position).toBeNull()
    })
  })

  describe('事件系统', () => {
    beforeEach(async () => {
      await tracker.initialize()
    })

    it('应该添加和移除事件监听器', () => {
      const callback = vi.fn()

      tracker.addEventListener('faceDetected', callback)
      expect(tracker.eventListeners.faceDetected).toContain(callback)

      tracker.removeEventListener('faceDetected', callback)
      expect(tracker.eventListeners.faceDetected).not.toContain(callback)
    })

    it('应该触发事件', () => {
      const callback = vi.fn()
      tracker.addEventListener('faceDetected', callback)

      tracker.emit('faceDetected', { test: 'data' })

      expect(callback).toHaveBeenCalledWith({ test: 'data' })
    })

    it('应该处理事件回调错误', () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Callback error')
      })
      const normalCallback = vi.fn()

      tracker.addEventListener('faceDetected', errorCallback)
      tracker.addEventListener('faceDetected', normalCallback)

      // 不应该抛出错误
      expect(() => {
        tracker.emit('faceDetected', {})
      }).not.toThrow()

      expect(normalCallback).toHaveBeenCalled()
    })
  })

  describe('性能监控', () => {
    beforeEach(async () => {
      await tracker.initialize()
    })

    it('应该计算FPS', () => {
      // 模拟两帧，间隔16ms (约60fps)
      tracker.performance.lastFrameTime = 1000
      tracker.handleResults({ multiFaceLandmarks: [] })

      // 手动设置时间差
      global.performance.now.mockReturnValue(1016)

      tracker.handleResults({ multiFaceLandmarks: [] })

      expect(Math.round(tracker.performance.fps)).toBe(60)
    })

    it('应该返回性能统计', () => {
      tracker.performance.fps = 30
      tracker.performance.averageProcessingTime = 33
      tracker.performance.frameCount = 100

      const stats = tracker.getPerformanceStats()

      expect(stats.fps).toBe(30)
      expect(stats.averageProcessingTime).toBe(33)
      expect(stats.frameCount).toBe(100)
    })
  })

  describe('资源管理', () => {
    it('应该正确清理资源', async () => {
      await tracker.initialize()
      await tracker.startTracking({})

      tracker.dispose()

      expect(tracker.isInitialized).toBe(false)
      expect(tracker.isTracking).toBe(false)
      expect(tracker.faceMesh).toBeNull()
    })

    it('应该检查可用性', async () => {
      expect(tracker.isAvailable()).toBe(false)

      await tracker.initialize()
      expect(tracker.isAvailable()).toBe(true)
    })
  })

  describe('工厂函数', () => {
    it('应该创建跟踪器实例', () => {
      const tracker = createAdvancedFaceTracker({ maxNumFaces: 2 })

      expect(tracker).toBeInstanceOf(AdvancedFaceTracker)
      expect(tracker.options.maxNumFaces).toBe(2)
    })
  })

  describe('多脸处理', () => {
    beforeEach(async () => {
      await tracker.initialize()
    })

    it('应该选择主要人脸', () => {
      const multiFaceLandmarks = [
        // 小人脸
        [
          { x: 0.1, y: 0.1, z: 0 },
          { x: 0.2, y: 0.2, z: 0 }
        ],
        // 大人脸
        [
          { x: 0.3, y: 0.3, z: 0 },
          { x: 0.8, y: 0.8, z: 0 }
        ]
      ]

      const dominantIndex = tracker.selectDominantFace(multiFaceLandmarks)

      expect(dominantIndex).toBe(1) // 应该选择面积更大的人脸
    })
  })

  describe('置信度计算', () => {
    it('应该计算置信度', () => {
      const faceGeometry = {
        poseTransformMatrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0.9]
      }

      const confidence = tracker.calculateConfidence(faceGeometry)

      expect(confidence).toBe(0.9)
    })

    it('应该在没有几何信息时返回默认值', () => {
      const confidence = tracker.calculateConfidence(null)

      expect(confidence).toBe(0.5)
    })
  })
})
