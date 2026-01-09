/**
 * KeywordTemplate.vue 单元测试
 * VidSlide AI - 模板系统测试
 *
 * 测试关键词高亮模板组件的渲染和属性处理
 * 确保模板能正确展示关键词并支持尺寸调整
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import KeywordTemplate from './KeywordTemplate.vue'

/**
 * KeywordTemplate.vue 组件测试套件
 * 验证关键词高亮模板的基本功能和可配置性
 */
describe('KeywordTemplate.vue', () => {
  /**
   * 测试组件基本渲染
   * 验证组件挂载和CSS类应用是否正常
   */
  it('renders correctly', () => {
    const wrapper = mount(KeywordTemplate)

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.classes()).toContain('keyword-template')
  })

  /**
   * 测试模板图片展示
   * 验证关键词模板图片的alt文本和src路径
   */
  it('displays the correct image', () => {
    const wrapper = mount(KeywordTemplate)

    const img = wrapper.find('img')
    expect(img.attributes('alt')).toBe('关键词高亮模板')
    expect(img.attributes('src')).toContain('keyword-template.png')
  })

  /**
   * 测试尺寸自定义功能
   * 验证组件能接收并应用自定义的width和height属性
   */
  it('accepts custom dimensions', () => {
    const wrapper = mount(KeywordTemplate, {
      props: {
        width: 1000,
        height: 800
      }
    })

    expect(wrapper.vm.width).toBe(1000)
    expect(wrapper.vm.height).toBe(800)
  })
})
