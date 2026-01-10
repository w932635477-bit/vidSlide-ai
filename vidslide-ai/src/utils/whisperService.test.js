/**
 * WhisperService 单元测试
 * 测试语音识别服务功能
 *
 * @author VidSlide AI Team
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock WebAssembly
global.WebAssembly = {
  instantiate: vi.fn(() =>
    Promise.resolve({
      instance: {
        exports: {
          init: vi.fn(() => 0),
          load_model: vi.fn(() => 0),
          free_model: vi.fn(() => 0),
          full_default: vi.fn(() => 0),
          free_result: vi.fn(() => 0),
          malloc: vi.fn(() => 1024),
          free: vi.fn(),
          memory: new WebAssembly.Memory({ initial: 256, maximum: 256 })
        }
      }
    })
  ),
  Memory: vi.fn()
}

// Mock fetch for model loading
global.fetch = vi.fn()

// Mock AudioContext and related APIs
global.AudioContext = vi.fn(() => ({
  createBuffer: vi.fn(() => ({
    getChannelData: vi.fn(() => new Float32Array(44100)),
    sampleRate: 44100,
    length: 44100,
    duration: 1,
    numberOfChannels: 1
  })),
  decodeAudioData: vi.fn((arrayBuffer, successCallback) => {
    successCallback({
      getChannelData: vi.fn(() => new Float32Array(44100)),
      sampleRate: 44100,
      length: 44100,
      duration: 1,
      numberOfChannels: 1
    })
  })
}))

global.webkitAudioContext = global.AudioContext

// Mock console methods
const _consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
const _consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
const _consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

describe('WhisperService', () => {
  let whisperService

  beforeEach(async () => {
    vi.clearAllMocks()

    // Dynamic import to avoid hoisting issues
    const { WhisperService } = await import('./whisperService.js')
    whisperService = new WhisperService()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('初始化', () => {
    it('应该正确初始化WhisperService实例', () => {
      expect(whisperService).toBeDefined()
      expect(typeof whisperService.initialize).toBe('function')
      expect(typeof whisperService.transcribe).toBe('function')
      expect(typeof whisperService.loadModel).toBe('function')
    })

    it('应该有默认配置', () => {
      expect(whisperService.config).toBeDefined()
      expect(whisperService.config).toHaveProperty('model')
      expect(whisperService.config).toHaveProperty('language')
      expect(whisperService.config).toHaveProperty('threads')
    })
  })

  describe('WebAssembly初始化', () => {
    it('应该能够初始化WebAssembly模块', async () => {
      const result = await whisperService.initialize()

      expect(result.success).toBe(true)
      expect(whisperService.wasmInstance).toBeDefined()
    })

    it('应该处理WebAssembly不支持的情况', async () => {
      delete global.WebAssembly

      const result = await whisperService.initialize()

      expect(result.success).toBe(false)
      expect(result.error).toContain('WebAssembly not supported')
    })

    it('应该处理WebAssembly实例化失败', async () => {
      global.WebAssembly.instantiate.mockRejectedValueOnce(new Error('WASM instantiation failed'))

      const result = await whisperService.initialize()

      expect(result.success).toBe(false)
      expect(result.error).toContain('WASM instantiation failed')
    })
  })

  describe('模型加载', () => {
    beforeEach(async () => {
      await whisperService.initialize()
    })

    it('应该能够加载Whisper模型', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024 * 1024)) // 1MB mock model
      })

      const result = await whisperService.loadModel('base')

      expect(result.success).toBe(true)
      expect(whisperService.modelLoaded).toBe(true)
    })

    it('应该处理模型下载失败', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await whisperService.loadModel('base')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Network error')
    })

    it('应该验证模型文件完整性', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(100)) // Too small
      })

      const result = await whisperService.loadModel('base')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid model file')
    })

    it('应该支持不同的模型大小', async () => {
      const models = ['tiny', 'base', 'small', 'medium', 'large']

      for (const model of models) {
        global.fetch.mockResolvedValueOnce({
          ok: true,
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024 * 1024))
        })

        const result = await whisperService.loadModel(model)

        expect(result.success).toBe(true)
        expect(whisperService.currentModel).toBe(model)
      }
    })
  })

  describe('音频处理', () => {
    beforeEach(async () => {
      await whisperService.initialize()
      await whisperService.loadModel('base')
    })

    it('应该能够处理音频文件', async () => {
      const audioBuffer = new ArrayBuffer(44100 * 2) // 1 second of 16-bit audio
      const result = await whisperService.processAudio(audioBuffer)

      expect(result.success).toBe(true)
      expect(result.audioData).toBeDefined()
      expect(result.sampleRate).toBe(16000) // Whisper expects 16kHz
    })

    it('应该转换音频采样率', async () => {
      const audioBuffer = new ArrayBuffer(44100 * 4) // 44.1kHz audio

      const result = await whisperService.processAudio(audioBuffer)

      expect(result.success).toBe(true)
      expect(result.sampleRate).toBe(16000)
    })

    it('应该处理立体声音频', async () => {
      // Mock stereo audio context
      global.AudioContext.mockImplementation(() => ({
        decodeAudioData: vi.fn((arrayBuffer, successCallback) => {
          successCallback({
            getChannelData: vi.fn(channel => {
              return channel === 0 ? new Float32Array(44100) : new Float32Array(44100)
            }),
            sampleRate: 44100,
            length: 44100,
            duration: 1,
            numberOfChannels: 2
          })
        })
      }))

      const audioBuffer = new ArrayBuffer(44100 * 4)
      const result = await whisperService.processAudio(audioBuffer)

      expect(result.success).toBe(true)
      expect(result.channels).toBe(1) // Should be converted to mono
    })

    it('应该处理音频解码错误', async () => {
      global.AudioContext.mockImplementation(() => ({
        decodeAudioData: vi.fn((arrayBuffer, successCallback, errorCallback) => {
          errorCallback(new Error('Audio decoding failed'))
        })
      }))

      const audioBuffer = new ArrayBuffer(1000)
      const result = await whisperService.processAudio(audioBuffer)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Audio decoding failed')
    })
  })

  describe('语音转文字', () => {
    beforeEach(async () => {
      await whisperService.initialize()
      await whisperService.loadModel('base')
    })

    it('应该能够进行语音转文字', async () => {
      const audioBuffer = new ArrayBuffer(16000 * 2) // 1 second of 16-bit 16kHz audio

      const result = await whisperService.transcribe(audioBuffer)

      expect(result.success).toBe(true)
      expect(result.text).toBeDefined()
      expect(typeof result.text).toBe('string')
      expect(result.confidence).toBeGreaterThanOrEqual(0)
      expect(result.confidence).toBeLessThanOrEqual(1)
    })

    it('应该支持多语言识别', async () => {
      const languages = ['en', 'zh', 'ja', 'ko', 'fr', 'de', 'es']

      for (const language of languages) {
        whisperService.setLanguage(language)
        expect(whisperService.config.language).toBe(language)

        const audioBuffer = new ArrayBuffer(16000 * 2)
        const result = await whisperService.transcribe(audioBuffer, { language })

        expect(result.success).toBe(true)
        expect(result.language).toBe(language)
      }
    })

    it('应该处理长音频文件', async () => {
      const longAudioBuffer = new ArrayBuffer(16000 * 60 * 2) // 1 minute of audio

      const result = await whisperService.transcribe(longAudioBuffer)

      expect(result.success).toBe(true)
      expect(result.text).toBeDefined()
    })

    it('应该支持时间戳', async () => {
      const audioBuffer = new ArrayBuffer(16000 * 10 * 2) // 10 seconds

      const result = await whisperService.transcribe(audioBuffer, { timestamps: true })

      expect(result.success).toBe(true)
      expect(result.segments).toBeDefined()
      expect(Array.isArray(result.segments)).toBe(true)

      if (result.segments.length > 0) {
        expect(result.segments[0]).toHaveProperty('start')
        expect(result.segments[0]).toHaveProperty('end')
        expect(result.segments[0]).toHaveProperty('text')
      }
    })

    it('应该处理模型未加载的情况', async () => {
      whisperService.modelLoaded = false

      const audioBuffer = new ArrayBuffer(16000 * 2)
      const result = await whisperService.transcribe(audioBuffer)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Model not loaded')
    })
  })

  describe('配置管理', () => {
    it('应该允许设置语言', () => {
      whisperService.setLanguage('zh')
      expect(whisperService.config.language).toBe('zh')

      whisperService.setLanguage('en')
      expect(whisperService.config.language).toBe('en')
    })

    it('应该允许设置线程数', () => {
      whisperService.setThreads(4)
      expect(whisperService.config.threads).toBe(4)

      whisperService.setThreads(1)
      expect(whisperService.config.threads).toBe(1)
    })

    it('应该验证配置参数', () => {
      expect(() => whisperService.setThreads(0)).toThrow()
      expect(() => whisperService.setThreads(17)).toThrow() // Too many threads
      expect(() => whisperService.setLanguage('invalid')).toThrow()
    })

    it('应该支持高级配置', () => {
      const advancedConfig = {
        beam_size: 5,
        patience: 2.0,
        length_penalty: 1.0,
        repetition_penalty: 1.1,
        no_repeat_ngram_size: 0,
        temperature: [0.0, 0.2, 0.4, 0.6, 0.8, 1.0],
        compression_ratio_threshold: 2.4,
        logprob_threshold: -1.0,
        no_speech_threshold: 0.6
      }

      whisperService.setAdvancedConfig(advancedConfig)

      expect(whisperService.config.advanced).toEqual(advancedConfig)
    })
  })

  describe('性能监控', () => {
    beforeEach(async () => {
      await whisperService.initialize()
      await whisperService.loadModel('base')
    })

    it('应该监控转录性能', async () => {
      const audioBuffer = new ArrayBuffer(16000 * 5 * 2) // 5 seconds

      const startTime = performance.now()
      await whisperService.transcribe(audioBuffer)
      const endTime = performance.now()

      const duration = endTime - startTime
      expect(duration).toBeLessThan(10000) // Should complete within 10 seconds
    })

    it('应该提供性能统计', () => {
      const stats = whisperService.getPerformanceStats()

      expect(stats).toHaveProperty('totalTranscriptions')
      expect(stats).toHaveProperty('averageProcessingTime')
      expect(stats).toHaveProperty('totalAudioDuration')
      expect(stats).toHaveProperty('wordsPerMinute')
    })

    it('应该监控内存使用', async () => {
      const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0

      const audioBuffer = new ArrayBuffer(16000 * 10 * 2)
      await whisperService.transcribe(audioBuffer)

      const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0

      expect(finalMemory).toBeGreaterThanOrEqual(initialMemory)
    })
  })

  describe('错误处理', () => {
    it('应该处理无效音频数据', async () => {
      const invalidAudioBuffer = new ArrayBuffer(100) // Too small

      const result = await whisperService.processAudio(invalidAudioBuffer)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid audio data')
    })

    it('应该处理WASM执行错误', async () => {
      // Mock WASM function to throw error
      whisperService.wasmInstance.exports.full_default = vi.fn(() => {
        throw new Error('WASM execution failed')
      })

      const audioBuffer = new ArrayBuffer(16000 * 2)
      const result = await whisperService.transcribe(audioBuffer)

      expect(result.success).toBe(false)
      expect(result.error).toContain('WASM execution failed')
    })

    it('应该处理内存分配失败', async () => {
      whisperService.wasmInstance.exports.malloc = vi.fn(() => 0) // Failed allocation

      const audioBuffer = new ArrayBuffer(16000 * 2)
      const result = await whisperService.transcribe(audioBuffer)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Memory allocation failed')
    })

    it('应该提供用户友好的错误消息', async () => {
      // Simulate various error conditions
      const errorCases = [
        { error: 'WebAssembly not supported', expectedMessage: '浏览器不支持WebAssembly' },
        { error: 'Model download failed', expectedMessage: '模型下载失败' },
        { error: 'Audio decoding failed', expectedMessage: '音频解码失败' },
        { error: 'Transcription failed', expectedMessage: '语音转文字失败' }
      ]

      for (const { error, expectedMessage } of errorCases) {
        const userMessage = whisperService.getUserFriendlyErrorMessage(error)
        expect(userMessage).toContain(expectedMessage)
      }
    })
  })

  describe('资源管理', () => {
    it('应该能够释放模型资源', async () => {
      await whisperService.initialize()
      await whisperService.loadModel('base')

      expect(whisperService.modelLoaded).toBe(true)

      whisperService.unloadModel()

      expect(whisperService.modelLoaded).toBe(false)
      expect(whisperService.currentModel).toBeNull()
    })

    it('应该处理重复卸载', () => {
      whisperService.unloadModel() // Should not throw
      whisperService.unloadModel() // Should not throw

      expect(whisperService.modelLoaded).toBe(false)
    })

    it('应该在组件销毁时清理资源', () => {
      whisperService.dispose()

      expect(whisperService.wasmInstance).toBeNull()
      expect(whisperService.modelLoaded).toBe(false)
    })
  })

  describe('降级处理', () => {
    it('应该检测功能可用性', () => {
      const capabilities = whisperService.getCapabilities()

      expect(capabilities).toHaveProperty('webAssembly')
      expect(capabilities).toHaveProperty('audioProcessing')
      expect(capabilities).toHaveProperty('modelLoading')
      expect(capabilities).toHaveProperty('transcription')
    })

    it('应该在功能不可用时提供降级方案', () => {
      // Simulate WebAssembly not available
      delete global.WebAssembly

      const capabilities = whisperService.getCapabilities()

      expect(capabilities.webAssembly).toBe(false)
      expect(capabilities.fallbackAvailable).toBe(true)
      expect(capabilities.fallbackMethod).toBeDefined()
    })

    it('应该提供功能状态监控', () => {
      const status = whisperService.getStatus()

      expect(status).toHaveProperty('initialized')
      expect(status).toHaveProperty('modelLoaded')
      expect(status).toHaveProperty('currentModel')
      expect(status).toHaveProperty('memoryUsage')
      expect(status).toHaveProperty('performance')
    })
  })

  describe('集成测试', () => {
    it('应该完整模拟语音转文字流程', async () => {
      // Initialize service
      const initResult = await whisperService.initialize()
      expect(initResult.success).toBe(true)

      // Load model
      global.fetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024 * 1024))
      })

      const loadResult = await whisperService.loadModel('base')
      expect(loadResult.success).toBe(true)

      // Process audio
      const audioBuffer = new ArrayBuffer(16000 * 5 * 2) // 5 seconds
      const transcribeResult = await whisperService.transcribe(audioBuffer)

      expect(transcribeResult.success).toBe(true)
      expect(transcribeResult.text).toBeDefined()
      expect(transcribeResult.confidence).toBeDefined()

      // Check performance stats
      const stats = whisperService.getPerformanceStats()
      expect(stats.totalTranscriptions).toBeGreaterThan(0)
    })

    it('应该处理并发转录请求', async () => {
      await whisperService.initialize()

      global.fetch.mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024 * 1024))
      })

      await whisperService.loadModel('base')

      const audioBuffers = [
        new ArrayBuffer(16000 * 2),
        new ArrayBuffer(16000 * 3),
        new ArrayBuffer(16000 * 4)
      ]

      const promises = audioBuffers.map(buffer => whisperService.transcribe(buffer))
      const results = await Promise.all(promises)

      results.forEach(result => {
        expect(result.success).toBe(true)
        expect(result.text).toBeDefined()
      })
    })
  })
})
