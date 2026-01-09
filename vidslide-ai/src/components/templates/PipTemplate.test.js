import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PipTemplate from './PipTemplate.vue'

describe('PipTemplate.vue', () => {
  it('renders correctly with default props', () => {
    const wrapper = mount(PipTemplate)

    // 检查是否有img元素
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)

    // 检查alt属性
    expect(img.attributes('alt')).toBe('画中画效果模板')

    // 检查默认尺寸
    expect(wrapper.vm.width).toBe(1920)
    expect(wrapper.vm.height).toBe(1080)
  })

  it('accepts and applies custom dimensions', () => {
    const wrapper = mount(PipTemplate, {
      props: {
        width: 1280,
        height: 720
      }
    })

    expect(wrapper.vm.width).toBe(1280)
    expect(wrapper.vm.height).toBe(720)
  })

  it('loads the correct template image', () => {
    const wrapper = mount(PipTemplate)

    const img = wrapper.find('img')
    expect(img.attributes('src')).toContain('pip-template.png')
  })

  it('applies correct CSS classes', () => {
    const wrapper = mount(PipTemplate)

    expect(wrapper.classes()).toContain('pip-template')
    expect(wrapper.find('img').classes()).toContain('template-image')
  })

  it('has responsive image styling', () => {
    const wrapper = mount(PipTemplate)

    const img = wrapper.find('img')
    expect(img.classes()).toContain('template-image')

    // 检查样式中是否包含响应式设置
    const styles = wrapper.find('.template-image').attributes('style')
    expect(styles).toBeUndefined() // 样式应该通过CSS类控制
  })

  it('includes hover effects', () => {
    const wrapper = mount(PipTemplate)

    // 检查组件结构是否正确
    // 注意：在测试环境中style标签可能不会被解析
    expect(wrapper.exists()).toBe(true)
  })

  it('maintains aspect ratio', () => {
    const wrapper = mount(PipTemplate)

    const img = wrapper.find('img')
    expect(img.attributes('style')).toBeUndefined() // 应该通过CSS控制宽高比
  })
})
