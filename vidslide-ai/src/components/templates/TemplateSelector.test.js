import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TemplateSelector from './TemplateSelector.vue'

describe('TemplateSelector.vue', () => {
  it('renders correctly with all templates', () => {
    const wrapper = mount(TemplateSelector)

    // 检查标题是否正确渲染
    expect(wrapper.text()).toContain('选择PPT模板')

    // 检查是否有5个模板选项
    const templateItems = wrapper.findAll('.template-item')
    expect(templateItems.length).toBe(5)

    // 检查模板名称是否正确
    expect(wrapper.text()).toContain('画中画效果')
    expect(wrapper.text()).toContain('信息卡片')
    expect(wrapper.text()).toContain('关键词高亮')
    expect(wrapper.text()).toContain('文档展示')
    expect(wrapper.text()).toContain('标题文本')
  })

  it('allows template selection', async () => {
    try {
      const wrapper = mount(TemplateSelector)

      // 模拟点击第一个模板
      const firstTemplate = wrapper.findAll('.template-item')[0]
      await firstTemplate.trigger('click')

      // 检查是否有选中状态
      expect(wrapper.vm.selectedTemplate).toBe('pip')

      // 检查确认按钮是否出现
      expect(wrapper.text()).toContain('已选择')
      expect(wrapper.text()).toContain('确认使用')
    } catch (error) {
      console.error('Template selection test failed:', error)
      throw error
    }
  })

  it('emits template-selected event when template is clicked', async () => {
    try {
      const wrapper = mount(TemplateSelector)

      const firstTemplate = wrapper.findAll('.template-item')[0]
      await firstTemplate.trigger('click')

      expect(wrapper.emitted('template-selected')).toBeTruthy()
      expect(wrapper.emitted('template-selected')[0]).toEqual(['pip'])
    } catch (error) {
      console.error('Template selected event test failed:', error)
      throw error
    }
  })

  it('emits template-confirmed event when confirm button is clicked', async () => {
    try {
      const wrapper = mount(TemplateSelector)

      // 选择模板
      const firstTemplate = wrapper.findAll('.template-item')[0]
      await firstTemplate.trigger('click')

      // 点击确认按钮
      const confirmButton = wrapper.find('.confirm-btn')
      await confirmButton.trigger('click')

      expect(wrapper.emitted('template-confirmed')).toBeTruthy()
      expect(wrapper.emitted('template-confirmed')[0]).toEqual(['pip'])
    } catch (error) {
      console.error('Template confirmed event test failed:', error)
      throw error
    }
  })

  it('shows correct template name when selected', async () => {
    try {
      const wrapper = mount(TemplateSelector)

      // 选择关键词模板
      const keywordTemplate = wrapper.findAll('.template-item')[2] // 索引2是关键词模板
      await keywordTemplate.trigger('click')

      expect(wrapper.vm.selectedTemplate).toBe('keyword')
      expect(wrapper.vm.getSelectedTemplateName()).toBe('关键词高亮')
    } catch (error) {
      console.error('Template name display test failed:', error)
      throw error
    }
  })

  it('renders template previews correctly', () => {
    const wrapper = mount(TemplateSelector)

    // 检查是否有模板预览组件
    const previews = wrapper.findAll('.template-preview')
    expect(previews.length).toBe(5)

    // 检查每个预览是否包含正确的组件
    previews.forEach(preview => {
      expect(preview.exists()).toBe(true)
    })
  })

  it('applies correct CSS classes for selection state', async () => {
    try {
      const wrapper = mount(TemplateSelector)

      // 默认没有选中状态
      let activeItems = wrapper.findAll('.template-item.active')
      expect(activeItems.length).toBe(0)

      // 选择后应该有一个激活的项目
      const firstTemplate = wrapper.findAll('.template-item')[0]
      await firstTemplate.trigger('click')

      activeItems = wrapper.findAll('.template-item.active')
      expect(activeItems.length).toBe(1)
    } catch (error) {
      console.error('CSS classes test failed:', error)
      throw error
    }
  })
})
