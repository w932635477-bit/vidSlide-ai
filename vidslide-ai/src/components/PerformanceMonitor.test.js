/**
 * PerformanceMonitor.vue 单元测试
 * VidSlide AI - 紧急补齐阶段
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import PerformanceMonitor from './PerformanceMonitor.vue'

describe('PerformanceMonitor.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(PerformanceMonitor, {
      props: {
        autoStart: false,
        updateInterval: 1000
      },
      global: {
        stubs: ['el-icon', 'el-tag', 'el-button']
      }
    })
  })

  describe('初始化', () => {
    it('应该正确渲染组件', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.performance-monitor').exists()).toBe(true)
    })

    it('应该有正确的初始状态', () => {
      expect(wrapper.vm.minimized).toBe(false)
      expect(wrapper.vm.currentFps).toBe(60)
      expect(wrapper.vm.memoryUsage).toBe(0)
    })
  })

  describe('基本功能', () => {
    it('应该计算平均FPS', () => {
      const monitor = wrapper.vm
      monitor.fpsHistory = [60, 50, 55, 58, 62]

      expect(monitor.averageFps).toBe(57)
    })

    it('应该格式化内存显示', () => {
      const monitor = wrapper.vm

      expect(monitor.formatMemory(1024)).toBe('0.0 MB')
      expect(monitor.formatMemory(1024 * 1024)).toBe('1.0 MB')
      expect(monitor.formatMemory(50 * 1024 * 1024)).toBe('50.0 MB')
    })

    it('应该能够清除统计数据', () => {
      const monitor = wrapper.vm
      monitor.fpsHistory = [60, 50, 55]
      monitor.memoryHistory = [40 * 1024 * 1024, 45 * 1024 * 1024]

      try {
        monitor.clearStats()

        expect(monitor.fpsHistory).toEqual([])
        expect(monitor.memoryHistory).toEqual([])
        expect(monitor.maxMemoryUsage).toBe(0)
      } catch (error) {
        // 处理可能的错误
        console.error('清除统计数据时出错:', error)
        throw error
      }
    })
  })

  describe('UI交互', () => {
    it('应该能够切换最小化状态', async () => {
      const header = wrapper.find('.monitor-header')
      await header.trigger('click')

      expect(wrapper.vm.minimized).toBe(true)
    })
  })

  describe('辅助方法', () => {
    it('应该正确判断FPS状态', () => {
      const monitor = wrapper.vm

      // 直接测试函数逻辑
      monitor.currentFps = 60
      expect(monitor.getFpsStatus()).toBe('good')

      monitor.currentFps = 40
      expect(monitor.getFpsStatus()).toBe('warning')

      monitor.currentFps = 20
      expect(monitor.getFpsStatus()).toBe('danger')
    })

    it('应该正确判断内存状态', () => {
      const monitor = wrapper.vm

      // 直接测试函数逻辑
      monitor.memoryUsage = 20 * 1024 * 1024 // 20MB
      expect(monitor.getMemoryStatus()).toBe('good')

      monitor.memoryUsage = 50 * 1024 * 1024 // 50MB
      expect(monitor.getMemoryStatus()).toBe('warning')

      monitor.memoryUsage = 90 * 1024 * 1024 // 90MB
      expect(monitor.getMemoryStatus()).toBe('danger')
    })
  })
})
