/**
 * TitleTemplate.vue 单元测试
 * VidSlide AI - 模板系统测试
 *
 * 测试标题文本模板组件的渲染功能和尺寸调整
 * 确保标题模板能正确展示并支持自定义尺寸
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TitleTemplate from './TitleTemplate.vue'

/**
 * TitleTemplate.vue 组件测试套件
 * 验证标题模板的渲染效果和属性配置功能
 */
describe('TitleTemplate.vue', () => {
  /**
   * 测试组件基础渲染
   * 验证标题模板组件能正确挂载并应用样式类
   */
  it('renders correctly', () => {
    const wrapper = mount(TitleTemplate)

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.classes()).toContain('title-template')
  })

  /**
   * 测试模板图片展示
   * 验证标题模板图片的alt属性和src路径是否正确配置
   */
  it('displays the correct image', () => {
    const wrapper = mount(TitleTemplate)

    const img = wrapper.find('img')
    expect(img.attributes('alt')).toBe('标题文本模板')
    expect(img.attributes('src')).toContain('title-template.png')
  })

  /**
   * 测试尺寸自定义功能
   * 验证组件能接收并正确应用width和height属性
   */
  it('accepts custom dimensions', () => {
    const wrapper = mount(TitleTemplate, {
      props: {
        width: 1400,
        height: 1000
      }
    })

    expect(wrapper.vm.width).toBe(1400)
    expect(wrapper.vm.height).toBe(1000)
  })
})
