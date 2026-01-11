/** * DispatcherStatus.test.js * VidSlide AI 智能调度器状态显示组件测试 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import DispatcherStatus from './DispatcherStatus.vue'

// Mock 智能调度器
vi.mock('../services/IntelligentDispatcher.js', () => ({
  default: {
    initialize: vi.fn().mockResolvedValue(),
    dispatch: vi.fn(),
    getPerformanceStats: vi.fn(),
    getOptimizationSuggestions: vi.fn()
  }
}))

describe('DispatcherStatus.vue', () => {
  let wrapper
  let mockIntelligentDispatcher

  beforeEach(async () => {
    // 创建测试应用
    const app = createApp({})
    app.use(ElementPlus)

    // 获取mock实例
    mockIntelligentDispatcher = await import('../services/IntelligentDispatcher.js')
    mockIntelligentDispatcher.default.getPerformanceStats.mockReturnValue({
      totalTime: { count: 10, avg: 0.5 },
      cacheSize: 5,
      cacheHitRate: 0.8,
      platformUsage: { baidu: 3, unsplash: 2 }
    })

    mockIntelligentDispatcher.default.getOptimizationSuggestions.mockReturnValue([
      '缓存命中率偏低，建议优化缓存策略'
    ])

    // 挂载组件
    wrapper = mount(DispatcherStatus, {
      global: {
        plugins: [ElementPlus]
      },
      props: {
        searchQuery: '',
        isSearching: false,
        currentStrategy: 'balanced'
      }
    })

    await wrapper.vm.$nextTick()
  })

  describe('组件初始化', () => {
    it('应该正确渲染组件', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.classes()).toContain('dispatcher-status')
    })

    it('应该调用调度器初始化', () => {
      expect(mockIntelligentDispatcher.default.initialize).toHaveBeenCalled()
    })
  })

  describe('状态显示', () => {
    it('初始状态下不显示决策信息', () => {
      const statusIndicator = wrapper.find('.status-indicator')
      expect(statusIndicator.exists()).toBe(false)
    })

    it('有决策结果时显示状态信息', async () => {
      // Mock决策结果
      mockIntelligentDispatcher.default.dispatch.mockResolvedValueOnce({
        strategy: { name: 'single_platform' },
        platforms: [{ name: 'baidu', score: 0.85 }],
        confidence: 1.0,
        translation: { original: '春节', translated: 'Spring Festival' }
      })

      // 更新搜索查询
      await wrapper.setProps({ searchQuery: '春节' })
      await wrapper.vm.$nextTick()

      // 检查状态显示
      const statusIndicator = wrapper.find('.status-indicator')
      expect(statusIndicator.exists()).toBe(true)

      const confidenceScore = wrapper.find('.confidence-score')
      expect(confidenceScore.text()).toContain('100.0%')

      const platformTags = wrapper.findAll('.platform-tag')
      expect(platformTags.length).toBe(1)
      expect(platformTags[0].text()).toContain('百度图片')
    })

    it('显示翻译状态', async () => {
      mockIntelligentDispatcher.default.dispatch.mockResolvedValueOnce({
        strategy: { name: 'single_platform' },
        platforms: [{ name: 'baidu', score: 0.85 }],
        confidence: 0.9,
        translation: { original: '春节', translated: 'Spring Festival' }
      })

      await wrapper.setProps({ searchQuery: '春节' })
      await wrapper.vm.$nextTick()

      const translationText = wrapper.find('.translation-text')
      expect(translationText.exists()).toBe(true)
      expect(translationText.text()).toContain('Spring Festival')
    })
  })

  describe('策略切换', () => {
    it('应该提供策略选择下拉菜单', () => {
      const dropdown = wrapper.findComponent({ name: 'ElDropdown' })
      expect(dropdown.exists()).toBe(true)
    })

    it('点击策略选项应该触发变更事件', async () => {
      const dropdown = wrapper.findComponent({ name: 'ElDropdown' })

      // 模拟点击策略选项
      await dropdown.vm.$emit('command', 'speed')

      // 检查是否触发了事件
      expect(wrapper.emitted('strategy-changed')).toBeTruthy()
      expect(wrapper.emitted('strategy-changed')[0]).toEqual(['speed'])
    })

    it('策略变更后应该重新计算决策', async () => {
      mockIntelligentDispatcher.default.dispatch.mockResolvedValue({
        strategy: { name: 'single_platform' },
        platforms: [{ name: 'baidu', score: 0.85 }],
        confidence: 0.9
      })

      await wrapper.setProps({ searchQuery: '春节' })
      await wrapper.vm.$nextTick()

      // 清空之前的调用
      mockIntelligentDispatcher.default.dispatch.mockClear()

      // 触发策略变更
      const dropdown = wrapper.findComponent({ name: 'ElDropdown' })
      await dropdown.vm.$emit('command', 'quality')

      // 应该重新调用dispatch
      expect(mockIntelligentDispatcher.default.dispatch).toHaveBeenCalledWith('春节', {
        userPreferences: { strategy: 'quality' }
      })
    })
  })

  describe('性能监控', () => {
    it('应该提供性能监控按钮', () => {
      const performanceBtn = wrapper.find('.control-button')
      expect(performanceBtn.exists()).toBe(true)
      expect(performanceBtn.text()).toContain('性能')
    })

    it('点击性能按钮应该打开弹窗', async () => {
      const performanceBtn = wrapper.find('.control-button')
      await performanceBtn.trigger('click')

      const dialog = wrapper.findComponent({ name: 'ElDialog' })
      expect(dialog.props('modelValue')).toBe(true)
    })

    it('性能弹窗应该显示统计数据', async () => {
      const performanceBtn = wrapper.find('.control-button')
      await performanceBtn.trigger('click')
      await wrapper.vm.$nextTick()

      const statsItems = wrapper.findAll('.stat-item')
      expect(statsItems.length).toBeGreaterThan(0)

      // 检查是否显示了缓存大小
      const cacheSizeStat = statsItems.find(item =>
        item.find('.stat-label').text().includes('缓存大小')
      )
      expect(cacheSizeStat).toBeTruthy()
      expect(cacheSizeStat.find('.stat-value').text()).toBe('5')
    })

    it('显示平台使用统计', async () => {
      const performanceBtn = wrapper.find('.control-button')
      await performanceBtn.trigger('click')
      await wrapper.vm.$nextTick()

      const platformStats = wrapper.findAll('.platform-stat')
      expect(platformStats.length).toBe(2) // baidu 和 unsplash

      // 检查平台名称是否正确显示
      const platformNames = platformStats.map(stat => stat.find('.platform-name').text())
      expect(platformNames).toContain('百度图片')
      expect(platformNames).toContain('Unsplash')
    })

    it('显示优化建议', async () => {
      const performanceBtn = wrapper.find('.control-button')
      await performanceBtn.trigger('click')
      await wrapper.vm.$nextTick()

      const suggestions = wrapper.findAll('.suggestion-alert')
      expect(suggestions.length).toBe(1)
      expect(suggestions[0].text()).toContain('缓存命中率偏低')
    })
  })

  describe('平台显示名称', () => {
    it('应该正确显示中文平台名称', () => {
      const component = wrapper.vm

      expect(component.getPlatformDisplayName('baidu')).toBe('百度图片')
      expect(component.getPlatformDisplayName('unsplash')).toBe('Unsplash')
      expect(component.getPlatformDisplayName('pexels')).toBe('Pexels')
      expect(component.getPlatformDisplayName('pixabay')).toBe('Pixabay')
      expect(component.getPlatformDisplayName('unknown')).toBe('unknown')
    })
  })

  describe('决策类型判断', () => {
    it('应该根据置信度返回正确的类型', () => {
      const component = wrapper.vm

      expect(component.getDecisionType({ confidence: 0.9 })).toBe('success')
      expect(component.getDecisionType({ confidence: 0.7 })).toBe('warning')
      expect(component.getDecisionType({ confidence: 0.5 })).toBe('info')
    })

    it('应该根据置信度返回正确的图标', () => {
      const component = wrapper.vm

      expect(component.getDecisionIcon({ confidence: 0.9 })).toBeDefined()
      expect(component.getDecisionIcon({ confidence: 0.6 })).toBeDefined()
      expect(component.getDecisionIcon({ confidence: 0.4 })).toBeDefined()
    })
  })

  describe('平台标签类型', () => {
    it('应该根据分数返回正确的标签类型', () => {
      const component = wrapper.vm

      expect(component.getPlatformType({ score: 0.9 })).toBe('success')
      expect(component.getPlatformType({ score: 0.7 })).toBe('warning')
      expect(component.getPlatformType({ score: 0.5 })).toBe('info')
    })
  })

  describe('错误处理', () => {
    it('调度器调用失败时应该优雅处理', async () => {
      mockIntelligentDispatcher.default.dispatch.mockRejectedValueOnce(new Error('调度器错误'))

      await wrapper.setProps({ searchQuery: '测试关键词' })
      await wrapper.vm.$nextTick()

      // 应该不显示决策状态
      const statusIndicator = wrapper.find('.status-indicator')
      expect(statusIndicator.exists()).toBe(false)
    })

    it('性能统计获取失败时应该显示默认值', async () => {
      mockIntelligentDispatcher.default.getPerformanceStats.mockReturnValueOnce({})

      const performanceBtn = wrapper.find('.control-button')
      await performanceBtn.trigger('click')
      await wrapper.vm.$nextTick()

      const statsItems = wrapper.findAll('.stat-item')
      expect(statsItems.length).toBeGreaterThan(0)

      // 检查默认值显示
      const totalCount = statsItems.find(item =>
        item.find('.stat-label').text().includes('总决策数')
      )
      expect(totalCount.find('.stat-value').text()).toBe('0')
    })
  })
})
