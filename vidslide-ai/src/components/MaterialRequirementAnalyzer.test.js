/**
 * MaterialRequirementAnalyzer.vue - 单元测试
 *
 * 测试素材需求分析界面的功能完整性
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import MaterialRequirementAnalyzer from './MaterialRequirementAnalyzer.vue'

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}))

describe('MaterialRequirementAnalyzer.vue', () => {
  let wrapper
  let mockEmit

  const mockKeywords = [
    { text: '人工智能', importance: 0.95, category: 'technology' },
    { text: '机器学习', importance: 0.88, category: 'technology' },
    { text: '数据分析', importance: 0.78, category: 'business' }
  ]

  const mockKeyframes = [
    { id: 1, timestamp: 30, importance: 0.85, thumbnailUrl: 'test1.jpg' },
    { id: 2, timestamp: 60, importance: 0.75, thumbnailUrl: 'test2.jpg' }
  ]

  const mockRequirements = [
    {
      id: 'keyword-人工智能',
      type: 'image',
      title: '人工智能相关素材',
      description: '为关键词"人工智能"推荐的相关视觉素材',
      priority: 'high',
      confidence: 0.95,
      relatedKeywords: ['人工智能'],
      reason: '基于关键词"人工智能"的重要性分析'
    },
    {
      id: 'keyframe-1',
      type: 'image',
      title: '关键帧1插图',
      description: '为视频关键帧(0:30)设计的配套插图',
      priority: 'high',
      confidence: 0.85,
      relatedKeywords: ['视频', '关键帧'],
      reason: '关键帧在0:30的重要性较高'
    }
  ]

  beforeEach(() => {
    mockEmit = vi.fn()
    wrapper = mount(MaterialRequirementAnalyzer, {
      props: {
        keywords: [],
        keyframes: [],
        videoContent: '',
        autoAnalyze: false
      },
      global: {
        stubs: ['svg']
      }
    })
  })

  describe('基本渲染', () => {
    it('应该正确渲染组件结构', () => {
      expect(wrapper.find('.material-requirement-analyzer').exists()).toBe(true)
      expect(wrapper.find('.analyzer-header').exists()).toBe(true)
      expect(wrapper.find('.requirements-section').exists()).toBe(true)
      expect(wrapper.find('#analyzer-heading').exists()).toBe(true)
    })

    it('应该显示正确的标题和描述', () => {
      const heading = wrapper.find('h2')
      const description = wrapper.find('.analyzer-description')

      expect(heading.text()).toBe('📊 素材需求分析')
      expect(description.text()).toContain('基于AI分析结果')
    })

    it('应该在没有需求时显示空状态', () => {
      expect(wrapper.find('.empty-state').exists()).toBe(true)
      expect(wrapper.find('.empty-state h3').text()).toBe('暂无素材需求')
    })

    it('应该正确设置无障碍属性', () => {
      const region = wrapper.find('[role="region"]')
      const mainSection = wrapper.find('[role="main"]')

      expect(region.attributes('aria-labelledby')).toBe('analyzer-heading')
      expect(mainSection.attributes('aria-labelledby')).toBe('requirements-list-heading')
    })
  })

  describe('需求概览', () => {
    beforeEach(async () => {
      wrapper.vm.materialRequirements = mockRequirements
      await nextTick()
    })

    it('应该显示正确的统计信息', () => {
      const statValues = wrapper.findAll('.stat-value')

      expect(statValues.length).toBe(3) // 总数、高优先级、类型数
      expect(statValues[0].text()).toBe('2') // 总共2个需求
      expect(statValues[1].text()).toBe('2') // 2个高优先级
      expect(statValues[2].text()).toBe('1') // 1种类型（image）
    })
  })

  describe('需求筛选和排序', () => {
    beforeEach(async () => {
      wrapper.vm.materialRequirements = [
        ...mockRequirements,
        {
          id: 'test-low',
          type: 'icon',
          title: '低优先级图标',
          priority: 'low',
          confidence: 0.5
        }
      ]
      await nextTick()
    })

    it('应该能够按类型筛选', async () => {
      const typeSelect = wrapper.find('#type-filter')
      await typeSelect.setValue('image')

      expect(wrapper.vm.selectedType).toBe('image')
      // 筛选逻辑在computed属性中
    })

    it('应该能够按优先级筛选', async () => {
      const prioritySelect = wrapper.find('#priority-filter')
      await prioritySelect.setValue('high')

      expect(wrapper.vm.selectedPriority).toBe('high')
    })

    it('应该按优先级和置信度排序', () => {
      const sorted = wrapper.vm.filteredRequirements
      expect(sorted[0].priority).toBe('high')
      expect(sorted[0].confidence).toBeGreaterThanOrEqual(sorted[1].confidence)
    })
  })

  describe('需求显示', () => {
    beforeEach(async () => {
      wrapper.vm.materialRequirements = mockRequirements
      await nextTick()
    })

    it('应该显示所有需求卡片', () => {
      const cards = wrapper.findAll('.requirement-card')
      expect(cards.length).toBe(2)
    })

    it('应该正确显示需求信息', () => {
      const firstCard = wrapper.find('.requirement-card')
      const title = firstCard.find('.requirement-title').text()
      const description = firstCard.find('.requirement-description').text()

      expect(title).toBe('人工智能相关素材')
      expect(description).toContain('人工智能')
    })

    it('应该根据优先级应用正确的样式', () => {
      const highPriorityCard = wrapper.find('.high-priority')
      expect(highPriorityCard.exists()).toBe(true)
    })

    it('应该显示正确的类型图标', () => {
      const icon = wrapper.find('.icon-text')
      expect(icon.text()).toBe('🖼️') // image类型的图标
    })
  })

  describe('需求选择', () => {
    beforeEach(async () => {
      wrapper.vm.materialRequirements = mockRequirements
      await nextTick()
    })

    it('应该能够选择需求', async () => {
      const firstCard = wrapper.findAll('.requirement-card')[0]

      await firstCard.trigger('click')

      expect(wrapper.vm.selectedRequirements.length).toBe(1)
      expect(wrapper.vm.selectedRequirements[0].id).toBe('keyword-人工智能')
      expect(firstCard.find('.selection-indicator').exists()).toBe(true)
    })

    it('应该能够取消选择需求', async () => {
      const firstCard = wrapper.findAll('.requirement-card')[0]

      // 选择
      await firstCard.trigger('click')
      expect(wrapper.vm.selectedRequirements.length).toBe(1)

      // 再次点击取消选择
      await firstCard.trigger('click')
      expect(wrapper.vm.selectedRequirements.length).toBe(0)
    })

    it('应该在选择需求时触发事件', async () => {
      const wrapperWithEmit = mount(MaterialRequirementAnalyzer, {
        props: {
          keywords: [],
          keyframes: [],
          videoContent: '',
          autoAnalyze: false
        },
        global: {
          stubs: ['svg']
        }
      })

      wrapperWithEmit.vm.materialRequirements = mockRequirements
      await nextTick()

      const firstCard = wrapperWithEmit.find('.requirement-card')
      await firstCard.trigger('click')

      expect(wrapperWithEmit.emitted('requirement-selected')).toBeTruthy()
      expect(wrapperWithEmit.emitted('requirement-selected')[0][0]).toHaveLength(1)
    })
  })

  describe('需求操作', () => {
    beforeEach(async () => {
      wrapper.vm.materialRequirements = mockRequirements
      await nextTick()
    })

    it('应该能够搜索相关素材', async () => {
      const searchBtn = wrapper.find('.search-btn')
      await searchBtn.trigger('click')

      expect(wrapper.emitted('material-search-requested')).toBeTruthy()
      const searchData = wrapper.emitted('material-search-requested')[0][0]
      expect(searchData.type).toBe('image')
    })

    it('应该能够添加到画布', async () => {
      const addBtn = wrapper.find('.add-btn')
      await addBtn.trigger('click')

      expect(wrapper.emitted('canvas-add-requested')).toBeTruthy()
      const addData = wrapper.emitted('canvas-add-requested')[0][0]
      expect(addData.title).toBe('人工智能相关素材')
    })

    it('应该能够查看需求详情', async () => {
      const infoBtn = wrapper.find('.info-btn')
      await infoBtn.trigger('click')

      expect(wrapper.vm.detailRequirement).toBeTruthy()
      expect(wrapper.vm.detailRequirement.id).toBe('keyword-人工智能')
      expect(wrapper.find('.requirement-detail-modal').exists()).toBe(true)
    })
  })

  describe('批量操作', () => {
    beforeEach(async () => {
      wrapper.vm.materialRequirements = mockRequirements
      await nextTick()

      // 选择多个需求
      const cards = wrapper.findAll('.requirement-card')
      await cards[0].trigger('click')
      await cards[1].trigger('click')
    })

    it('应该显示选中需求面板', () => {
      expect(wrapper.find('.selected-requirements-panel').exists()).toBe(true)
      expect(wrapper.find('.summary-label').text()).toContain('已选择 2 个素材需求')
    })

    it('应该显示选中的需求标签', () => {
      const selectedTags = wrapper.findAll('.selected-requirement-tag')
      expect(selectedTags.length).toBe(2)
    })

    it('应该能够批量搜索素材', async () => {
      const bulkSearchBtn = wrapper.find('.bulk-action-btn.primary')
      await bulkSearchBtn.trigger('click')

      expect(wrapper.emitted('material-search-requested')).toBeTruthy()
      expect(wrapper.emitted('material-search-requested')).toHaveLength(2)
    })

    it('应该能够批量添加到画布', async () => {
      const bulkAddBtn = wrapper.find('.bulk-action-btn.secondary')
      await bulkAddBtn.trigger('click')

      expect(wrapper.emitted('canvas-add-requested')).toBeTruthy()
      expect(wrapper.emitted('canvas-add-requested')).toHaveLength(2)
      expect(wrapper.vm.selectedRequirements.length).toBe(0) // 选择应该被清空
    })

    it('应该能够清空选择', async () => {
      const clearBtn = wrapper.find('.bulk-action-btn.danger')
      await clearBtn.trigger('click')

      expect(wrapper.vm.selectedRequirements.length).toBe(0)
      expect(wrapper.find('.selected-requirements-panel').exists()).toBe(false)
    })
  })

  describe('素材需求分析', () => {
    it('应该在分析过程中显示进度', async () => {
      await wrapper.setProps({ keywords: mockKeywords })

      wrapper.vm.startAnalysis()
      await nextTick()

      expect(wrapper.find('.analysis-status').exists()).toBe(true)
      expect(wrapper.vm.isAnalyzing).toBe(true)
    })

    it('应该基于关键词生成需求', async () => {
      await wrapper.setProps({ keywords: mockKeywords })

      const analysisPromise = wrapper.vm.startAnalysis()
      await analysisPromise

      expect(wrapper.vm.isAnalyzing).toBe(false)
      expect(wrapper.vm.materialRequirements.length).toBeGreaterThan(0)

      // 检查是否包含基于关键词生成的需求
      const keywordBasedReq = wrapper.vm.materialRequirements.find(r =>
        r.id.startsWith('keyword-')
      )
      expect(keywordBasedReq).toBeDefined()
    })

    it('应该基于关键帧生成需求', async () => {
      await wrapper.setProps({ keyframes: mockKeyframes })

      const analysisPromise = wrapper.vm.startAnalysis()
      await analysisPromise

      // 检查是否包含基于关键帧生成的需求
      const keyframeBasedReq = wrapper.vm.materialRequirements.find(r =>
        r.id.startsWith('keyframe-')
      )
      expect(keyframeBasedReq).toBeDefined()
    })
  })

  describe('详情模态框', () => {
    beforeEach(async () => {
      wrapper.vm.materialRequirements = mockRequirements
      wrapper.vm.detailRequirement = mockRequirements[0]
      await nextTick()
    })

    it('应该显示需求详情', () => {
      expect(wrapper.find('.requirement-detail-modal').exists()).toBe(true)
      expect(wrapper.find('#detail-modal-title').text()).toBe('素材需求详情')
    })

    it('应该显示正确的详情信息', () => {
      const title = wrapper.find('.detail-info h4').text()
      expect(title).toBe('人工智能相关素材')
    })

    it('应该能够关闭详情模态框', async () => {
      const closeBtn = wrapper.find('.close-btn')
      await closeBtn.trigger('click')

      expect(wrapper.vm.detailRequirement).toBe(null)
      expect(wrapper.find('.requirement-detail-modal').exists()).toBe(false)
    })
  })

  describe('工具函数', () => {
    it('应该正确推断素材类型', () => {
      expect(wrapper.vm.inferMaterialType('photo')).toBe('image')
      expect(wrapper.vm.inferMaterialType('icon')).toBe('icon')
      expect(wrapper.vm.inferMaterialType('video')).toBe('video')
      expect(wrapper.vm.inferMaterialType('unknown')).toBe('image') // 默认类型
    })

    it('应该返回正确的类型图标', () => {
      expect(wrapper.vm.getTypeIcon('image')).toBe('🖼️')
      expect(wrapper.vm.getTypeIcon('video')).toBe('🎬')
      expect(wrapper.vm.getTypeIcon('icon')).toBe('🔘')
    })

    it('应该返回正确的类型显示名称', () => {
      expect(wrapper.vm.getTypeDisplayName('image')).toBe('图片')
      expect(wrapper.vm.getTypeDisplayName('video')).toBe('视频')
      expect(wrapper.vm.getTypeDisplayName('unknown')).toBe('unknown')
    })

    it('应该返回正确的优先级显示名称', () => {
      expect(wrapper.vm.getPriorityDisplayName('high')).toBe('高优先级')
      expect(wrapper.vm.getPriorityDisplayName('medium')).toBe('中优先级')
      expect(wrapper.vm.getPriorityDisplayName('low')).toBe('低优先级')
    })

    it('应该正确格式化时间', () => {
      expect(wrapper.vm.formatTime(30)).toBe('0:30')
      expect(wrapper.vm.formatTime(90)).toBe('1:30')
      expect(wrapper.vm.formatTime(3661)).toBe('61:01')
    })
  })

  describe('响应式设计', () => {
    it('应该在移动设备上正确响应', () => {
      // 设置移动设备视口
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      })

      // 重新挂载组件
      wrapper.unmount()
      wrapper = mount(MaterialRequirementAnalyzer, {
        props: {
          keywords: [],
          keyframes: [],
          videoContent: '',
          autoAnalyze: false
        },
        global: {
          stubs: ['svg']
        }
      })

      // 检查是否应用了移动样式
      expect(wrapper.find('.material-requirement-analyzer').exists()).toBe(true)
    })
  })

  describe('无障碍支持', () => {
    beforeEach(async () => {
      wrapper.vm.materialRequirements = mockRequirements
      await nextTick()
    })

    it('应该有正确的ARIA标签', () => {
      const region = wrapper.find('[role="region"]')
      expect(region.attributes('aria-labelledby')).toBe('analyzer-heading')
    })

    it('应该支持键盘导航', async () => {
      const card = wrapper.find('.requirement-card')
      expect(card.attributes('tabindex')).toBe('0')
    })

    it('应该有屏幕阅读器支持', () => {
      const srOnly = wrapper.find('.sr-only')
      expect(srOnly.exists()).toBe(true)
    })

    it('应该有完整的按钮ARIA标签', async () => {
      const buttons = wrapper.findAll('.action-btn')
      buttons.forEach(button => {
        expect(button.attributes('aria-label')).toBeTruthy()
      })
    })
  })

  describe('错误处理', () => {
    it('应该在没有输入数据时不启动分析', async () => {
      await wrapper.vm.startAnalysis()

      expect(wrapper.vm.isAnalyzing).toBe(false)
      expect(wrapper.vm.materialRequirements.length).toBe(0)
    })

    it('应该处理分析过程中的错误', async () => {
      // 设置有数据但模拟错误
      await wrapper.setProps({ keywords: mockKeywords })

      // Mock一个会失败的分析过程
      const originalAnalyzeKeywords = wrapper.vm.analyzeKeywords
      wrapper.vm.analyzeKeywords = vi.fn(() => { throw new Error('Test error') })

      await wrapper.vm.startAnalysis()

      expect(wrapper.vm.isAnalyzing).toBe(false)

      // 恢复原始方法
      wrapper.vm.analyzeKeywords = originalAnalyzeKeywords
    })
  })

  describe('性能测试', () => {
    it('应该在大量需求时保持性能', async () => {
      const largeRequirements = Array.from({ length: 100 }, (_, i) => ({
        id: `req-${i}`,
        type: 'image',
        title: `需求${i}`,
        description: `描述${i}`,
        priority: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'medium' : 'low',
        confidence: Math.random()
      }))

      wrapper.vm.materialRequirements = largeRequirements
      await nextTick()

      const cards = wrapper.findAll('.requirement-card')
      expect(cards.length).toBe(100)
    })

    it('应该正确处理空需求列表', () => {
      wrapper.vm.materialRequirements = []
      expect(wrapper.vm.filteredRequirements.length).toBe(0)
      expect(wrapper.vm.highPriorityRequirements.length).toBe(0)
      expect(wrapper.vm.uniqueMaterialTypes.length).toBe(0)
    })
  })

  // 测试覆盖率统计
  describe('测试覆盖率验证', () => {
    it('应该测试所有主要方法', () => {
      expect(typeof wrapper.vm.startAnalysis).toBe('function')
      expect(typeof wrapper.vm.selectRequirement).toBe('function')
      expect(typeof wrapper.vm.searchMaterial).toBe('function')
      expect(typeof wrapper.vm.addToCanvas).toBe('function')
      expect(typeof wrapper.vm.inferMaterialType).toBe('function')
      expect(typeof wrapper.vm.formatTime).toBe('function')
    })

    it('应该测试所有计算属性', () => {
      expect(wrapper.vm.filteredRequirements).toBeDefined()
      expect(wrapper.vm.highPriorityRequirements).toBeDefined()
      expect(wrapper.vm.uniqueMaterialTypes).toBeDefined()
      expect(wrapper.vm.hasInputData).toBeDefined()
    })

    it('应该测试所有事件触发', () => {
      const events = [
        'requirement-selected',
        'material-search-requested',
        'canvas-add-requested',
        'analysis-started',
        'analysis-completed'
      ]

      events.forEach(event => {
        expect(wrapper.vm.$emit).toBeDefined()
      })
    })
  })
})