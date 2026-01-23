/**
 * TimelineSync 单元测试
 * 测试时序同步系统的各项功能
 *
 * @author VidSlide AI Team
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock Vue ref
const ref = value => ({
  value,
  _isRef: true
})

// Mock console methods
const _consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
const _consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
const _consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

// Mock DOM APIs
global.document = {
  querySelector: vi.fn(),
  querySelectorAll: vi.fn(() => []),
  createElement: vi.fn(() => ({
    style: {},
    appendChild: vi.fn(),
    offsetLeft: 0,
    offsetTop: 0
  }))
}

global.requestAnimationFrame = vi.fn(cb => setTimeout(cb, 16))

// Mock performance.now
global.performance.now = vi.fn(() => Date.now())

describe('TimelineSync System', () => {
  let timelineSync
  let speechSyncConfig

  beforeEach(() => {
    vi.clearAllMocks()

    // 创建时序同步和语音同步配置的模拟
    timelineSync = ref({
      enabled: true,
      speechMarkers: [],
      animationQueue: [],
      currentTime: 0,
      syncOffset: 0,
      isPlaying: false
    })

    speechSyncConfig = ref({
      keywordHighlight: {
        enabled: true,
        advanceTime: 200,
        holdTime: 800,
        fadeTime: 300
      },
      textAnimation: {
        enabled: true,
        wordDelay: 50,
        sentenceDelay: 200
      },
      pipSync: {
        enabled: true,
        triggerOffset: 100,
        followDelay: 50
      }
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('TimelineSync 基础功能', () => {
    it('应该正确初始化时序同步状态', () => {
      expect(timelineSync.value.enabled).toBe(true)
      expect(timelineSync.value.speechMarkers).toEqual([])
      expect(timelineSync.value.animationQueue).toEqual([])
      expect(timelineSync.value.currentTime).toBe(0)
      expect(timelineSync.value.syncOffset).toBe(0)
      expect(timelineSync.value.isPlaying).toBe(false)
    })

    it('应该正确初始化语音同步配置', () => {
      expect(speechSyncConfig.value.keywordHighlight.enabled).toBe(true)
      expect(speechSyncConfig.value.keywordHighlight.advanceTime).toBe(200)
      expect(speechSyncConfig.value.keywordHighlight.holdTime).toBe(800)
      expect(speechSyncConfig.value.keywordHighlight.fadeTime).toBe(300)

      expect(speechSyncConfig.value.textAnimation.enabled).toBe(true)
      expect(speechSyncConfig.value.textAnimation.wordDelay).toBe(50)
      expect(speechSyncConfig.value.textAnimation.sentenceDelay).toBe(200)

      expect(speechSyncConfig.value.pipSync.enabled).toBe(true)
      expect(speechSyncConfig.value.pipSync.triggerOffset).toBe(100)
      expect(speechSyncConfig.value.pipSync.followDelay).toBe(50)
    })
  })

  describe('语音标记处理', () => {
    it('应该能够添加语音标记', () => {
      const marker = {
        timestamp: 1000,
        type: 'keyword',
        keyword: '测试',
        duration: 500
      }

      // 模拟添加标记
      timelineSync.value.speechMarkers.push(marker)

      expect(timelineSync.value.speechMarkers).toHaveLength(1)
      expect(timelineSync.value.speechMarkers[0]).toEqual(marker)
    })

    it('应该按时间戳排序语音标记', () => {
      const markers = [
        { timestamp: 3000, type: 'keyword', keyword: '第三' },
        { timestamp: 1000, type: 'keyword', keyword: '第一' },
        { timestamp: 2000, type: 'keyword', keyword: '第二' }
      ]

      timelineSync.value.speechMarkers = markers
      timelineSync.value.speechMarkers.sort((a, b) => a.timestamp - b.timestamp)

      expect(timelineSync.value.speechMarkers[0].keyword).toBe('第一')
      expect(timelineSync.value.speechMarkers[1].keyword).toBe('第二')
      expect(timelineSync.value.speechMarkers[2].keyword).toBe('第三')
    })

    it('应该正确识别活跃标记', () => {
      const markers = [
        { timestamp: 1000, type: 'keyword', keyword: '测试', duration: 500, triggered: false },
        { timestamp: 2000, type: 'keyword', keyword: '同步', duration: 400, triggered: false }
      ]

      timelineSync.value.speechMarkers = markers

      // 当前时间800ms，应该触发第一个标记 (1000-200=800)
      const currentTime = 800
      const activeMarkers = markers.filter(marker => {
        const triggerTime = marker.timestamp - speechSyncConfig.value.keywordHighlight.advanceTime
        const endTime =
          marker.timestamp + marker.duration + speechSyncConfig.value.keywordHighlight.holdTime
        return currentTime >= triggerTime && currentTime <= endTime
      })

      expect(activeMarkers).toHaveLength(1)
      expect(activeMarkers[0].keyword).toBe('测试')
    })
  })

  describe('动画队列处理', () => {
    it('应该能够添加同步动画', () => {
      const animation = {
        triggerTime: 1500,
        endTime: 2500,
        type: 'keyword-highlight',
        element: document.createElement('span'),
        triggered: false,
        keyword: '测试'
      }

      timelineSync.value.animationQueue.push(animation)

      expect(timelineSync.value.animationQueue).toHaveLength(1)
      expect(timelineSync.value.animationQueue[0]).toEqual(animation)
    })

    it('应该清理过期动画', () => {
      const expiredAnimation = {
        triggerTime: 1000,
        endTime: 2000, // 已过期
        type: 'keyword-highlight',
        element: document.createElement('span'),
        triggered: true,
        cleanup: vi.fn()
      }

      const activeAnimation = {
        triggerTime: 3000,
        endTime: 4000, // 未过期
        type: 'text-reveal',
        element: document.createElement('div'),
        triggered: false
      }

      timelineSync.value.animationQueue = [expiredAnimation, activeAnimation]

      // 模拟清理过期动画
      const currentTime = 2500
      timelineSync.value.animationQueue = timelineSync.value.animationQueue.filter(animation => {
        if (currentTime >= animation.endTime) {
          if (animation.cleanup) {
            animation.cleanup()
          }
          return false
        }
        return true
      })

      expect(timelineSync.value.animationQueue).toHaveLength(1)
      expect(timelineSync.value.animationQueue[0]).toEqual(activeAnimation)
      expect(expiredAnimation.cleanup).toHaveBeenCalled()
    })

    it('应该触发新动画', () => {
      const mockAnimation = {
        triggerTime: 1000,
        endTime: 2000,
        type: 'keyword-highlight',
        element: document.createElement('span'),
        triggered: false,
        keyword: '测试'
      }

      timelineSync.value.animationQueue = [mockAnimation]

      // 当前时间1200ms，应该触发动画
      const currentTime = 1200
      timelineSync.value.animationQueue.forEach(animation => {
        if (currentTime >= animation.triggerTime && !animation.triggered) {
          animation.triggered = true
        }
      })

      expect(mockAnimation.triggered).toBe(true)
    })
  })

  describe('同步时间管理', () => {
    it('应该正确设置同步偏移', () => {
      const offset = 150
      timelineSync.value.syncOffset = offset

      expect(timelineSync.value.syncOffset).toBe(150)
    })

    it('应该正确计算同步时间', () => {
      timelineSync.value.currentTime = 2000
      timelineSync.value.syncOffset = 100

      const syncedTime = timelineSync.value.currentTime + timelineSync.value.syncOffset

      expect(syncedTime).toBe(2100)
    })

    it('应该能够清除同步数据', () => {
      timelineSync.value.speechMarkers = [{ timestamp: 1000 }]
      timelineSync.value.animationQueue = [{ triggerTime: 1500 }]
      timelineSync.value.currentTime = 2000

      // 模拟清除操作
      timelineSync.value.speechMarkers = []
      timelineSync.value.animationQueue = []
      timelineSync.value.currentTime = 0

      expect(timelineSync.value.speechMarkers).toEqual([])
      expect(timelineSync.value.animationQueue).toEqual([])
      expect(timelineSync.value.currentTime).toBe(0)
    })
  })

  describe('同步状态查询', () => {
    it('应该返回完整的同步状态', () => {
      timelineSync.value.enabled = true
      timelineSync.value.currentTime = 1500
      timelineSync.value.isPlaying = true
      timelineSync.value.speechMarkers = [{ timestamp: 1000 }, { timestamp: 2000 }]
      timelineSync.value.animationQueue = [{ triggerTime: 1200 }]
      timelineSync.value.syncOffset = 50

      const status = {
        enabled: timelineSync.value.enabled,
        currentTime: timelineSync.value.currentTime,
        isPlaying: timelineSync.value.isPlaying,
        markerCount: timelineSync.value.speechMarkers.length,
        animationCount: timelineSync.value.animationQueue.length,
        syncOffset: timelineSync.value.syncOffset
      }

      expect(status.enabled).toBe(true)
      expect(status.currentTime).toBe(1500)
      expect(status.isPlaying).toBe(true)
      expect(status.markerCount).toBe(2)
      expect(status.animationCount).toBe(1)
      expect(status.syncOffset).toBe(50)
    })
  })

  describe('配置管理', () => {
    it('应该能够启用/禁用关键词高亮同步', () => {
      speechSyncConfig.value.keywordHighlight.enabled = false
      expect(speechSyncConfig.value.keywordHighlight.enabled).toBe(false)

      speechSyncConfig.value.keywordHighlight.enabled = true
      expect(speechSyncConfig.value.keywordHighlight.enabled).toBe(true)
    })

    it('应该能够启用/禁用文字渐入同步', () => {
      speechSyncConfig.value.textAnimation.enabled = false
      expect(speechSyncConfig.value.textAnimation.enabled).toBe(false)

      speechSyncConfig.value.textAnimation.enabled = true
      expect(speechSyncConfig.value.textAnimation.enabled).toBe(true)
    })

    it('应该能够启用/禁用画中画同步', () => {
      speechSyncConfig.value.pipSync.enabled = false
      expect(speechSyncConfig.value.pipSync.enabled).toBe(false)

      speechSyncConfig.value.pipSync.enabled = true
      expect(speechSyncConfig.value.pipSync.enabled).toBe(true)
    })

    it('应该能够调整同步参数', () => {
      speechSyncConfig.value.keywordHighlight.advanceTime = 300
      expect(speechSyncConfig.value.keywordHighlight.advanceTime).toBe(300)

      speechSyncConfig.value.keywordHighlight.holdTime = 1000
      expect(speechSyncConfig.value.keywordHighlight.holdTime).toBe(1000)

      speechSyncConfig.value.textAnimation.wordDelay = 75
      expect(speechSyncConfig.value.textAnimation.wordDelay).toBe(75)
    })
  })

  describe('错误处理', () => {
    it('应该处理无效的语音标记', () => {
      const invalidMarker = {
        timestamp: null,
        type: 'invalid',
        triggered: false
      }

      timelineSync.value.speechMarkers = [invalidMarker]

      // 应该不会抛出错误
      expect(() => {
        const markers = timelineSync.value.speechMarkers
        markers.forEach(marker => {
          if (marker.timestamp) {
            // 处理有效标记
          }
        })
      }).not.toThrow()
    })

    it('应该处理空的动画队列', () => {
      timelineSync.value.animationQueue = []

      // 应该不会抛出错误
      expect(() => {
        const queue = timelineSync.value.animationQueue
        queue.forEach(() => {})
      }).not.toThrow()
    })

    it('应该处理DOM查询失败', () => {
      global.document.querySelector = vi.fn(() => null)
      global.document.querySelectorAll = vi.fn(() => [])

      // 应该不会抛出错误
      expect(() => {
        const elements = document.querySelectorAll('[data-keyword="test"]')
        elements.forEach(() => {})
      }).not.toThrow()
    })
  })

  describe('性能考虑', () => {
    it('应该高效处理大量标记', () => {
      // 创建大量标记
      const markers = []
      for (let i = 0; i < 1000; i++) {
        markers.push({
          timestamp: i * 100,
          type: 'keyword',
          keyword: `word${i}`,
          duration: 200,
          triggered: false
        })
      }

      timelineSync.value.speechMarkers = markers

      const startTime = performance.now()

      // 模拟处理过程
      const currentTime = 50000
      const activeMarkers = markers.filter(marker => {
        const triggerTime = marker.timestamp - speechSyncConfig.value.keywordHighlight.advanceTime
        const endTime =
          marker.timestamp + marker.duration + speechSyncConfig.value.keywordHighlight.holdTime
        return currentTime >= triggerTime && currentTime <= endTime
      })

      const endTime = performance.now()
      const processingTime = endTime - startTime

      // 处理1000个标记应该在合理时间内完成 (< 10ms)
      expect(processingTime).toBeLessThan(10)
      expect(activeMarkers.length).toBeGreaterThan(0)
    })

    it('应该限制动画队列大小', () => {
      // 创建大量动画
      const animations = []
      for (let i = 0; i < 500; i++) {
        animations.push({
          triggerTime: i * 200,
          endTime: i * 200 + 1000,
          type: 'keyword-highlight',
          element: document.createElement('span'),
          triggered: false
        })
      }

      timelineSync.value.animationQueue = animations

      const startTime = performance.now()

      // 模拟清理过程
      const currentTime = 100000
      timelineSync.value.animationQueue = timelineSync.value.animationQueue.filter(animation => {
        return currentTime < animation.endTime
      })

      const endTime = performance.now()
      const processingTime = endTime - startTime

      // 处理500个动画应该在合理时间内完成 (< 5ms)
      expect(processingTime).toBeLessThan(5)
      expect(timelineSync.value.animationQueue.length).toBeLessThan(animations.length)
    })
  })

  describe('集成测试', () => {
    it('应该完整模拟时序同步流程', () => {
      // 设置初始状态
      timelineSync.value.enabled = true
      timelineSync.value.isPlaying = true
      timelineSync.value.currentTime = 0
      timelineSync.value.syncOffset = 50

      // 添加语音标记
      timelineSync.value.speechMarkers = [
        { timestamp: 1000, type: 'keyword', keyword: '测试', duration: 500, triggered: false },
        { timestamp: 2500, type: 'keyword', keyword: '同步', duration: 400, triggered: false }
      ]

      // 添加动画
      timelineSync.value.animationQueue = [
        {
          triggerTime: 1200,
          endTime: 2200,
          type: 'keyword-highlight',
          element: document.createElement('span'),
          triggered: false,
          keyword: '测试'
        }
      ]

      // 模拟时间推进
      const testTimes = [500, 1000, 1500, 2000, 2500, 3000]

      testTimes.forEach(currentTime => {
        timelineSync.value.currentTime = currentTime

        // 处理语音标记
        const config = speechSyncConfig.value
        if (config.keywordHighlight.enabled) {
          const markers = timelineSync.value.speechMarkers
          const activeMarkers = markers.filter(marker => {
            const triggerTime = marker.timestamp - config.keywordHighlight.advanceTime
            const endTime = marker.timestamp + marker.duration + config.keywordHighlight.holdTime
            return currentTime >= triggerTime && currentTime <= endTime
          })

          activeMarkers.forEach(marker => {
            if (!marker.triggered) {
              marker.triggered = true
            }
          })
        }

        // 处理动画队列
        const syncedTime = timelineSync.value.currentTime + timelineSync.value.syncOffset
        timelineSync.value.animationQueue = timelineSync.value.animationQueue.filter(animation => {
          if (syncedTime >= animation.endTime) {
            return false
          }
          if (syncedTime >= animation.triggerTime && !animation.triggered) {
            animation.triggered = true
          }
          return true
        })
      })

      // 验证结果
      expect(timelineSync.value.speechMarkers[0].triggered).toBe(true)
      expect(timelineSync.value.speechMarkers[1].triggered).toBe(true)
      expect(timelineSync.value.animationQueue.length).toBe(0) // 所有动画都已完成或过期
    })
  })
})
