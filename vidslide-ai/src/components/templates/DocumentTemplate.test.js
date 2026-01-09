/**
 * DocumentTemplate.vue 单元测试
 * VidSlide AI - 模板系统测试
 *
 * 测试文档展示模板组件的功能和属性
 * 确保模板正确渲染和响应属性变化
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DocumentTemplate from './DocumentTemplate.vue'

/**
 * DocumentTemplate.vue 组件测试套件
 * 验证文档展示模板的基本功能和可访问性
 */
describe('DocumentTemplate.vue', () => {
  /**
   * 测试组件基本渲染功能
   * 确保组件能正确挂载并应用正确的CSS类
   */
  it('renders correctly', () => {
    const wrapper = mount(DocumentTemplate)

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.classes()).toContain('document-template')
  })

  /**
   * 测试图片显示功能
   * 验证模板图片的alt属性和src路径是否正确
   */
  it('displays the correct image', () => {
    const wrapper = mount(DocumentTemplate)

    const img = wrapper.find('img')
    expect(img.attributes('alt')).toBe('文档展示模板')
    expect(img.attributes('src')).toContain('document-template.png')
  })

  /**
   * 测试自定义尺寸功能
   * 验证组件能接受并正确处理width和height属性
   */
  it('accepts custom dimensions', () => {
    const wrapper = mount(DocumentTemplate, {
      props: {
        width: 1200,
        height: 900
      }
    })

    expect(wrapper.vm.width).toBe(1200)
    expect(wrapper.vm.height).toBe(900)
  })
})
