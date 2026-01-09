/**
 * InfoCardTemplate.vue 单元测试
 * VidSlide AI - 模板系统测试
 *
 * 测试信息卡片模板组件的功能、样式和属性处理
 * 确保模板在各种配置下都能正确渲染
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import InfoCardTemplate from './InfoCardTemplate.vue'

/**
 * InfoCardTemplate.vue 组件测试套件
 * 验证信息卡片模板的渲染、样式和响应式属性
 */
describe('InfoCardTemplate.vue', () => {
  /**
   * 测试组件基本渲染功能
   * 验证组件挂载和基础CSS类应用
   */
  it('renders correctly', () => {
    const wrapper = mount(InfoCardTemplate)

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.classes()).toContain('info-card-template')
  })

  /**
   * 测试模板图片显示
   * 验证图片的alt属性和src路径配置是否正确
   */
  it('displays the correct image', () => {
    const wrapper = mount(InfoCardTemplate)

    const img = wrapper.find('img')
    expect(img.attributes('alt')).toBe('信息卡片模板')
    expect(img.attributes('src')).toContain('info-card-template.png')
  })

  /**
   * 测试自定义尺寸属性
   * 验证组件能正确接收和处理width/height属性
   */
  it('accepts custom dimensions', () => {
    const wrapper = mount(InfoCardTemplate, {
      props: {
        width: 800,
        height: 600
      }
    })

    expect(wrapper.vm.width).toBe(800)
    expect(wrapper.vm.height).toBe(600)
  })

  /**
   * 测试样式类结构
   * 验证组件内部的CSS类是否正确应用
   */
  it('has proper styling classes', () => {
    const wrapper = mount(InfoCardTemplate)

    expect(wrapper.find('.template-image').exists()).toBe(true)
  })
})
