/**
 * VideoExporter 单元测试
 * 测试视频导出功能，包括MediaRecorder集成和水印应用
 *
 * @author VidSlide AI Team
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { VideoExporter } from './videoExporter.js'

// Mock MediaRecorder
global.MediaRecorder = vi.fn().mockImplementation(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  state: 'inactive',
  stream: null
}))

// Mock MediaStream
global.MediaStream = vi.fn().mockImplementation(() => ({
  getTracks: vi.fn(() => []),
  addTrack: vi.fn(),
  removeTrack: vi.fn()
}))

// Mock HTMLCanvasElement
global.HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  fillText: vi.fn(),
  measureText: vi.fn(() => ({ width: 50 })),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  scale: vi.fn(),
  setTransform: vi.fn()
}))

// Mock Blob
global.Blob = vi.fn().mockImplementation((chunks, options) => ({
  size: chunks ? chunks.reduce((acc, chunk) => acc + chunk.length, 0) : 0,
  type: options?.type || '',
  arrayBuffer: vi.fn(),
  text: vi.fn(),
  slice: vi.fn()
}))

// Mock URL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = vi.fn()

describe('VideoExporter', () => {
  let exporter
  let mockCanvas

  beforeEach(() => {
    // 重置所有mock
    vi.clearAllMocks()

    // 创建mock canvas
    mockCanvas = {
      width: 1920,
      height: 1080,
      getContext: vi.fn(() => ({
        fillRect: vi.fn(),
        fillText: vi.fn(),
        measureText: vi.fn(() => ({ width: 50 })),
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
        rotate: vi.fn(),
        scale: vi.fn(),
        setTransform: vi.fn()
      })),
      toDataURL: vi.fn(() => 'data:image/png;base64,mock')
    }

    exporter = new VideoExporter()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('构造函数', () => {
    it('应该正确初始化VideoExporter实例', () => {
      expect(exporter).toBeInstanceOf(VideoExporter)
      expect(exporter.mediaRecorder).toBeNull()
      expect(exporter.recordedChunks).toEqual([])
    })
  })

  describe('startRecording方法', () => {
    it('应该成功开始录制', async () => {
      const options = {
        canvas: mockCanvas,
        frameRate: 30,
        bitrate: 5000000
      }

      await expect(exporter.startRecording(options)).resolves.toBeUndefined()

      expect(global.MediaRecorder).toHaveBeenCalled()
      expect(exporter.mediaRecorder).toBeInstanceOf(global.MediaRecorder)
    })

    it('应该处理录制选项', async () => {
      const options = {
        canvas: mockCanvas,
        frameRate: 60,
        bitrate: 10000000,
        format: 'video/webm;codecs=vp9'
      }

      await exporter.startRecording(options)

      const mediaRecorderOptions = global.MediaRecorder.mock.calls[0][1]
      expect(mediaRecorderOptions.mimeType).toBe(options.format)
    })

    it('应该处理不支持的格式', async () => {
      // Mock不支持的格式
      global.MediaRecorder.isTypeSupported = vi.fn(() => false)

      const options = {
        canvas: mockCanvas,
        format: 'video/mp4'
      }

      await expect(exporter.startRecording(options)).resolves.toBeUndefined()
      // 应该降级到支持的格式
    })

    it('应该处理录制错误', async () => {
      const mockError = new Error('录制失败')
      global.MediaRecorder.mockImplementation(() => {
        throw mockError
      })

      const options = { canvas: mockCanvas }

      await expect(exporter.startRecording(options)).rejects.toThrow('录制失败')
    })
  })

  describe('stopRecording方法', () => {
    beforeEach(async () => {
      const options = { canvas: mockCanvas }
      await exporter.startRecording(options)
    })

    it('应该停止录制并返回blob', async () => {
      const mockBlob = new global.Blob(['mock-data'], { type: 'video/webm' })
      exporter.recordedChunks = ['mock-data']

      // Mock MediaRecorder的ondataavailable
      const dataAvailableHandler = exporter.mediaRecorder.addEventListener.mock.calls.find(
        call => call[0] === 'dataavailable'
      )[1]

      dataAvailableHandler({ data: new global.Blob(['chunk1']) })
      dataAvailableHandler({ data: new global.Blob(['chunk2']) })

      const result = await exporter.stopRecording()

      expect(result).toBeInstanceOf(global.Blob)
      expect(result.type).toBe('video/webm')
    })

    it('应该处理停止录制时的错误', async () => {
      exporter.mediaRecorder.stop = vi.fn(() => {
        throw new Error('停止录制失败')
      })

      await expect(exporter.stopRecording()).rejects.toThrow('停止录制失败')
    })
  })

  describe('pauseRecording和resumeRecording方法', () => {
    beforeEach(async () => {
      const options = { canvas: mockCanvas }
      await exporter.startRecording(options)
    })

    it('应该暂停录制', () => {
      exporter.pauseRecording()
      expect(exporter.mediaRecorder.pause).toHaveBeenCalled()
    })

    it('应该恢复录制', () => {
      exporter.resumeRecording()
      expect(exporter.mediaRecorder.resume).toHaveBeenCalled()
    })

    it('应该处理未开始录制时的操作', () => {
      const newExporter = new VideoExporter()

      expect(() => newExporter.pauseRecording()).not.toThrow()
      expect(() => newExporter.resumeRecording()).not.toThrow()
    })
  })

  describe('getSupportedFormats方法', () => {
    it('应该返回支持的格式列表', () => {
      const formats = exporter.getSupportedFormats()

      expect(Array.isArray(formats)).toBe(true)
      expect(formats.length).toBeGreaterThan(0)
      expect(formats[0]).toHaveProperty('mimeType')
      expect(formats[0]).toHaveProperty('description')
    })
  })

  describe('isRecording方法', () => {
    it('应该返回录制状态', async () => {
      expect(exporter.isRecording()).toBe(false)

      const options = { canvas: mockCanvas }
      await exporter.startRecording(options)

      expect(exporter.isRecording()).toBe(true)

      await exporter.stopRecording()
      expect(exporter.isRecording()).toBe(false)
    })
  })

  describe('水印集成', () => {
    it('应该支持水印应用', async () => {
      const options = {
        canvas: mockCanvas,
        watermark: {
          text: 'VidSlide AI',
          position: 'bottom-right',
          opacity: 0.8
        }
      }

      await exporter.startRecording(options)

      // 验证水印相关的初始化
      expect(exporter.watermarkOptions).toEqual(options.watermark)
    })

    it('应该处理水印配置错误', async () => {
      const options = {
        canvas: mockCanvas,
        watermark: null // 无效的水印配置
      }

      await expect(exporter.startRecording(options)).resolves.toBeUndefined()
      expect(exporter.watermarkOptions).toBeNull()
    })
  })

  describe('事件处理', () => {
    it('应该处理录制开始事件', async () => {
      const onStart = vi.fn()
      const options = {
        canvas: mockCanvas,
        onRecordingStart: onStart
      }

      await exporter.startRecording(options)

      // 触发start事件
      const startHandler = exporter.mediaRecorder.addEventListener.mock.calls.find(
        call => call[0] === 'start'
      )[1]

      startHandler()
      expect(onStart).toHaveBeenCalled()
    })

    it('应该处理录制停止事件', async () => {
      const onStop = vi.fn()
      const options = {
        canvas: mockCanvas,
        onRecordingStop: onStop
      }

      await exporter.startRecording(options)

      // 触发stop事件
      const stopHandler = exporter.mediaRecorder.addEventListener.mock.calls.find(
        call => call[0] === 'stop'
      )[1]

      stopHandler()
      expect(onStop).toHaveBeenCalled()
    })

    it('应该处理录制错误事件', async () => {
      const onError = vi.fn()
      const options = {
        canvas: mockCanvas,
        onRecordingError: onError
      }

      await exporter.startRecording(options)

      // 触发error事件
      const errorHandler = exporter.mediaRecorder.addEventListener.mock.calls.find(
        call => call[0] === 'error'
      )[1]

      const mockError = new Error('录制错误')
      errorHandler({ error: mockError })
      expect(onError).toHaveBeenCalledWith(mockError)
    })
  })

  describe('资源清理', () => {
    it('应该正确清理资源', async () => {
      const options = { canvas: mockCanvas }
      await exporter.startRecording(options)

      exporter.cleanup()

      expect(exporter.mediaRecorder).toBeNull()
      expect(exporter.recordedChunks).toEqual([])
      expect(exporter.watermarkOptions).toBeNull()
    })
  })
})
