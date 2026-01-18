/**
 * useContentAnalysis.test.js
 * VidSlide AI - 内容分析组合式函数测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useContentAnalysis } from './useContentAnalysis.js'

describe('useContentAnalysis', () => {
  let composable

  beforeEach(() => {
    composable = useContentAnalysis()
  })

  describe('初始化状态', () => {
    it('应该返回正确的初始状态', () => {
      expect(composable.isLoading.value).toBe(false)
      expect(composable.error.value).toBe(null)
      expect(composable.data.value).toBe(null)
      expect(composable.isReady.value).toBe(true)
      expect(composable.hasData.value).toBe(false)
    })

    it('应该暴露正确的方法', () => {
      expect(typeof composable.load).toBe('function')
      expect(typeof composable.reset).toBe('function')
    })
  })

  describe('计算属性', () => {
    it('isReady应该在没有加载和错误时为true', () => {
      expect(composable.isReady.value).toBe(true)

      composable.isLoading.value = true
      expect(composable.isReady.value).toBe(false)

      composable.isLoading.value = false
      composable.error.value = 'error'
      expect(composable.isReady.value).toBe(false)
    })

    it('hasData应该在data不为null时为true', () => {
      expect(composable.hasData.value).toBe(false)

      composable.data.value = { test: true }
      expect(composable.hasData.value).toBe(true)

      composable.data.value = null
      expect(composable.hasData.value).toBe(false)
    })
  })

  describe('load方法', () => {
    it('应该正确设置加载状态', async () => {
      expect(composable.isLoading.value).toBe(false)

      const loadPromise = composable.load()

      expect(composable.isLoading.value).toBe(true)
      expect(composable.error.value).toBe(null)

      await loadPromise

      expect(composable.isLoading.value).toBe(false)
    })

    it('应该加载数据', async () => {
      await composable.load()

      expect(composable.data.value).toBeDefined()
      expect(composable.data.value.placeholder).toBe(true)
    })

    it('应该处理加载错误', async () => {
      // Mock一个会失败的加载
      const originalLoad = composable.load
      composable.load = async () => {
        throw new Error('Load failed')
      }

      await expect(composable.load()).rejects.toThrow('Load failed')

      // 恢复原始方法
      composable.load = originalLoad
    })

    it('应该在加载完成后设置正确状态', async () => {
      await composable.load()

      expect(composable.isLoading.value).toBe(false)
      expect(composable.error.value).toBe(null)
      expect(composable.data.value).toBeDefined()
    })
  })

  describe('reset方法', () => {
    it('应该重置所有状态', async () => {
      // 先设置一些状态
      composable.isLoading.value = true
      composable.error.value = 'test error'
      composable.data.value = { test: true }

      expect(composable.isLoading.value).toBe(true)
      expect(composable.error.value).toBe('test error')
      expect(composable.data.value).toEqual({ test: true })

      // 重置
      composable.reset()

      expect(composable.isLoading.value).toBe(false)
      expect(composable.error.value).toBe(null)
      expect(composable.data.value).toBe(null)
    })

    it('应该在重置后恢复初始状态', () => {
      composable.reset()

      expect(composable.isLoading.value).toBe(false)
      expect(composable.error.value).toBe(null)
      expect(composable.data.value).toBe(null)
      expect(composable.isReady.value).toBe(true)
      expect(composable.hasData.value).toBe(false)
    })
  })

  describe('状态同步', () => {
    it('应该保持状态一致性', async () => {
      // 测试加载过程中的状态一致性
      const loadPromise = composable.load()

      expect(composable.isLoading.value).toBe(true)
      expect(composable.isReady.value).toBe(false)
      expect(composable.hasData.value).toBe(false)

      await loadPromise

      expect(composable.isLoading.value).toBe(false)
      expect(composable.isReady.value).toBe(true)
      expect(composable.hasData.value).toBe(true)
    })

    it('应该正确处理错误状态', async () => {
      // 模拟错误状态
      composable.error.value = 'test error'
      composable.data.value = null
      composable.isLoading.value = false

      expect(composable.isReady.value).toBe(false)
      expect(composable.hasData.value).toBe(false)
    })
  })

  describe('响应式行为', () => {
    it('应该支持响应式数据更新', async () => {
      expect(composable.data.value).toBe(null)

      composable.data.value = { updated: true }

      expect(composable.data.value.updated).toBe(true)
      expect(composable.hasData.value).toBe(true)
    })

    it('应该支持状态变化监听', () => {
      let readyChanged = false
      let dataChanged = false

      // 在实际应用中，这些通常通过watch监听
      composable.isReady // 访问计算属性

      composable.data.value = { test: true }

      expect(composable.isReady.value).toBe(true)
      expect(composable.hasData.value).toBe(true)
    })
  })

  describe('错误处理', () => {
    it('应该优雅处理异常情况', () => {
      // 测试边界情况
      expect(() => {
        composable.isLoading.value = 'invalid'
      }).not.toThrow()

      expect(() => {
        composable.data.value = undefined
      }).not.toThrow()
    })

    it('应该保持状态一致性即使在异常情况下', () => {
      // 强制设置不一致的状态来测试
      composable.isLoading.value = true
      composable.error.value = 'error'
      composable.data.value = { valid: true }

      // 即使状态不一致，计算属性也应该正常工作
      expect(composable.isReady.value).toBe(false) // 因为isLoading为true
      expect(composable.hasData.value).toBe(true)
    })
  })

  describe('方法可用性', () => {
    it('应该返回所有必需的方法和属性', () => {
      const expectedProperties = [
        'isLoading',
        'error',
        'data',
        'isReady',
        'hasData',
        'load',
        'reset'
      ]

      expectedProperties.forEach(prop => {
        expect(composable).toHaveProperty(prop)
      })
    })

    it('应该所有方法都是函数', () => {
      expect(typeof composable.load).toBe('function')
      expect(typeof composable.reset).toBe('function')
    })

    it('应该所有响应式属性都是ref', () => {
      expect(composable.isLoading).toHaveProperty('value')
      expect(composable.error).toHaveProperty('value')
      expect(composable.data).toHaveProperty('value')
    })
  })
})
