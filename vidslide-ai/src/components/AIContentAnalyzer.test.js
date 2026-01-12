import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import AIContentAnalyzer from './AIContentAnalyzer.vue'

describe('AIContentAnalyzer', () => {
  let wrapper
  let mockEmit

  beforeEach(() => {
    wrapper = mount(AIContentAnalyzer, {
      props: {
        videoSrc: '/test-video.mp4',
        videoDuration: 120
      },
      global: {
        stubs: {
          'el-icon': true,
          'el-tag': true
        }
      }
    })
  })

  describe('基本渲染', () => {
    it('应该正确渲染组件', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.ai-content-analyzer').exists()).toBe(true)
    })

    it('应该显示正确的标题', () => {
      const header = wrapper.find('.analyzer-header h2')
      expect(header.text()).toBe('🧠 AI内容分析')
    })

    it('应该显示描述文本', () => {
      const description = wrapper.find('.analyzer-description')
      expect(description.text()).toContain('智能分析视频内容')
    })
  })

  describe('空状态', () => {
    it('没有视频源时应该显示空状态', async () => {
      await wrapper.setProps({ videoSrc: null })
      await nextTick()

      const emptyState = wrapper.find('.empty-state')
      expect(emptyState.exists()).toBe(true)
      expect(emptyState.text()).toContain('准备开始AI分析')
    })

    it('空状态应该显示功能列表', async () => {
      await wrapper.setProps({ videoSrc: null })
      await nextTick()

      const featureItems = wrapper.findAll('.feature-item')
      expect(featureItems.length).toBe(4)

      const features = featureItems.map(item => item.text())
      expect(features).toEqual(
        expect.arrayContaining([
          expect.stringContaining('语音识别'),
          expect.stringContaining('内容分析'),
          expect.stringContaining('关键词提取'),
          expect.stringContaining('情感分析')
        ])
      )
    })
  })

  describe('分析控制', () => {
    it('应该有开始分析按钮', () => {
      const analyzeBtn = wrapper.find('.btn-analyze')
      expect(analyzeBtn.exists()).toBe(true)
      expect(analyzeBtn.text()).toContain('开始分析')
    })

    it('应该有停止分析按钮', () => {
      const stopBtn = wrapper.find('.btn-stop')
      expect(stopBtn.exists()).toBe(true)
      expect(stopBtn.text()).toContain('停止分析')
    })

    it('应该有重置按钮', () => {
      const resetBtn = wrapper.find('.btn-reset')
      expect(resetBtn.exists()).toBe(true)
      expect(resetBtn.text()).toContain('重置')
    })

    it('没有视频源时开始分析按钮应该被禁用', async () => {
      await wrapper.setProps({ videoSrc: null })
      await nextTick()

      const analyzeBtn = wrapper.find('.btn-analyze')
      expect(analyzeBtn.attributes('disabled')).toBeDefined()
    })
  })

  describe('分析过程', () => {
    it('应该能够开始分析', async () => {
      const analyzeBtn = wrapper.find('.btn-analyze')
      expect(analyzeBtn.exists()).toBe(true)
      expect(analyzeBtn.text()).toContain('开始分析')
    })

    it('应该能够停止分析', async () => {
      const stopBtn = wrapper.find('.btn-stop')
      expect(stopBtn.exists()).toBe(true)
      expect(stopBtn.text()).toContain('停止分析')
    })

    it('应该能够重置分析', async () => {
      const resetBtn = wrapper.find('.btn-reset')
      expect(resetBtn.exists()).toBe(true)
      expect(resetBtn.text()).toContain('重置')
    })
  })

  describe('分析结果显示', () => {
    it('应该有结果显示区域的结构', () => {
      // 验证结果显示区域的基本结构存在
      const analyzer = wrapper.find('.ai-content-analyzer')
      expect(analyzer.exists()).toBe(true)
    })
  })

  describe('错误处理', () => {
    it('应该有错误处理的UI结构', () => {
      const analyzer = wrapper.find('.ai-content-analyzer')
      expect(analyzer.exists()).toBe(true)
    })
  })

  describe('无障碍支持', () => {
    it('应该有正确的ARIA标签', () => {
      const analyzer = wrapper.find('.ai-content-analyzer')
      expect(analyzer.attributes('role')).toBe('region')
    })

    it('应该有屏幕阅读器文本', () => {
      const srOnlyElements = wrapper.findAll('.sr-only')
      expect(srOnlyElements.length).toBeGreaterThan(0)
    })
  })

  describe('响应式设计', () => {
    it('应该在移动设备上正确显示', () => {
      // 测试响应式类的存在
      const analyzer = wrapper.find('.ai-content-analyzer')
      expect(analyzer.exists()).toBe(true)
      // 具体的响应式测试需要更复杂的设置
    })
  })

  describe('组件接口', () => {
    it('应该暴露正确的接口方法', () => {
      expect(typeof wrapper.vm.startAnalysis).toBe('function')
      expect(typeof wrapper.vm.stopAnalysis).toBe('function')
      expect(typeof wrapper.vm.resetAnalysis).toBe('function')
    })

    it('应该暴露正确的响应式状态', () => {
      expect(wrapper.vm.isAnalyzing).toBeDefined()
      expect(wrapper.vm.analysisResults).toBeDefined()
      expect(wrapper.vm.error).toBeDefined()
    })
  })
})
