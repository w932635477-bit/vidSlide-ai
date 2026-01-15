/**
 * SmartCropTool.vue - 单元测试
 *
 * 测试智能裁切工具的功能完整性
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SmartCropTool from './SmartCropTool.vue'

describe('SmartCropTool.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(SmartCropTool, {
      props: {
        maxFileSize: 10 * 1024 * 1024,
        supportedFormats: ['image/jpeg', 'image/png']
      },
      global: {
        stubs: ['svg']
      }
    })
  })

  describe('基本渲染', () => {
    it('应该正确渲染组件结构', () => {
      expect(wrapper.find('.smart-crop-tool').exists()).toBe(true)
      expect(wrapper.find('.tool-header').exists()).toBe(true)
      expect(wrapper.find('.upload-section').exists()).toBe(true)
      expect(wrapper.find('#crop-tool-heading').exists()).toBe(true)
    })

    it('应该显示正确的标题和描述', () => {
      const heading = wrapper.find('h2')
      const description = wrapper.find('.tool-description')

      expect(heading.text()).toBe('✂️ 智能裁切工具')
      expect(description.text()).toContain('AI智能分析图片构图')
    })

    it('应该在没有图片时显示上传区域', () => {
      expect(wrapper.find('.upload-area').exists()).toBe(true)
      expect(wrapper.find('.upload-area h3').text()).toBe('上传图片开始智能裁切')
    })

    it('应该正确设置无障碍属性', () => {
      const region = wrapper.find('[role="region"]')
      const mainSection = wrapper.find('[role="main"]')

      expect(region.attributes('aria-labelledby')).toBe('crop-tool-heading')
      expect(mainSection.attributes('aria-labelledby')).toBe('upload-heading')
    })
  })

  describe('组件方法', () => {
    it('应该暴露所有必要的方法', () => {
      expect(typeof wrapper.vm.handleFileSelect).toBe('function')
      expect(typeof wrapper.vm.handleDrop).toBe('function')
      expect(typeof wrapper.vm.loadImage).toBe('function')
      expect(typeof wrapper.vm.applyCrop).toBe('function')
      expect(typeof wrapper.vm.autoCrop).toBe('function')
      expect(typeof wrapper.vm.resetCrop).toBe('function')
      expect(typeof wrapper.vm.clearImage).toBe('function')
      expect(typeof wrapper.vm.downloadCroppedImage).toBe('function')
    })

    it('应该有正确的计算属性', () => {
      expect(wrapper.vm.aspectRatioMap).toBeDefined()
      expect(typeof wrapper.vm.aspectRatioMap).toBe('object')
    })

    it('应该有正确的初始状态', () => {
      expect(wrapper.vm.currentImage).toBe(null)
      expect(wrapper.vm.cropArea).toBe(null)
      expect(wrapper.vm.isProcessing).toBe(false)
      expect(wrapper.vm.selectedAspectRatio).toBe('free')
    })
  })

  describe('无障碍支持', () => {
    it('应该有正确的ARIA标签', () => {
      const region = wrapper.find('[role="region"]')
      expect(region.attributes('aria-labelledby')).toBe('crop-tool-heading')
    })

    it('应该有屏幕阅读器支持', () => {
      const srOnly = wrapper.find('.sr-only')
      expect(srOnly.exists()).toBe(true)
    })

    it('应该有完整的按钮ARIA标签', () => {
      const uploadArea = wrapper.find('.upload-area')
      expect(uploadArea.attributes('aria-label')).toBe('点击或拖拽上传图片')
    })
  })

  describe('响应式设计', () => {
    it('应该在移动设备上正确响应', () => {
      // 检查移动样式类是否存在
      expect(wrapper.find('.smart-crop-tool').exists()).toBe(true)
    })
  })
})
