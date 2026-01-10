/**
 * ExportDialog 单元测试
 * 测试导出对话框组件，包括UI交互和导出流程
 *
 * @author VidSlide AI Team
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ExportDialog from './ExportDialog.vue'

// Mock Element Plus组件
vi.mock('element-plus', () => ({
  ElDialog: {
    name: 'ElDialog',
    props: ['modelValue', 'title'],
    template: '<div><slot /></div>'
  },
  ElForm: {
    name: 'ElForm',
    template: '<form><slot /></form>'
  },
  ElFormItem: {
    name: 'ElFormItem',
    template: '<div><slot /></div>'
  },
  ElSelect: {
    name: 'ElSelect',
    props: ['modelValue'],
    template: '<select><slot /></select>'
  },
  ElOption: {
    name: 'ElOption',
    template: '<option><slot /></option>'
  },
  ElInputNumber: {
    name: 'ElInputNumber',
    props: ['modelValue'],
    template: '<input type="number" />'
  },
  ElSwitch: {
    name: 'ElSwitch',
    props: ['modelValue'],
    template: '<input type="checkbox" />'
  },
  ElButton: {
    name: 'ElButton',
    props: ['type', 'loading'],
    template: '<button><slot /></button>'
  },
  ElProgress: {
    name: 'ElProgress',
    props: ['percentage'],
    template: '<div class="progress"></div>'
  },
  ElAlert: {
    name: 'ElAlert',
    template: '<div class="alert"><slot /></div>'
  }
}))

// Mock导出器
vi.mock('../utils/videoExporter.js', () => ({
  VideoExporter: vi.fn().mockImplementation(() => ({
    startRecording: vi.fn(),
    stopRecording: vi.fn(),
    isRecording: vi.fn(() => false),
    getSupportedFormats: vi.fn(() => [
      { mimeType: 'video/webm', description: 'WebM' },
      { mimeType: 'video/mp4', description: 'MP4' }
    ])
  }))
}))

vi.mock('../utils/htmlExporter.js', () => ({
  HtmlExporter: vi.fn().mockImplementation(() => ({
    exportToHtml: vi.fn()
  }))
}))

vi.mock('../utils/WatermarkGenerator.js', () => ({
  WatermarkGenerator: vi.fn().mockImplementation(() => ({
    detectUserTier: vi.fn(() => 'free'),
    isWatermarkEnabled: vi.fn(() => true),
    getWatermarkStyle: vi.fn(() => ({ opacity: 0.7 }))
  }))
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(() => 'free'),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
global.localStorage = localStorageMock

// Mock onMounted (not used in tests)
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    onMounted: vi.fn()
  }
})

describe('ExportDialog', () => {
  let wrapper
  let mockVideoExporter
  let mockHtmlExporter

  const defaultProps = {
    modelValue: true,
    projectData: {
      title: '测试项目',
      slides: [
        { id: 'slide1', content: '第一张幻灯片' },
        { id: 'slide2', content: '第二张幻灯片' }
      ]
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // 创建mock实例
    mockVideoExporter = new (vi.mocked(require('../utils/videoExporter.js').VideoExporter))()
    mockHtmlExporter = new (vi.mocked(require('../utils/htmlExporter.js').HtmlExporter))()
    new (vi.mocked(require('../utils/WatermarkGenerator.js').WatermarkGenerator))()

    wrapper = mount(ExportDialog, {
      props: defaultProps,
      global: {
        stubs: {
          ElDialog: true,
          ElForm: true,
          ElFormItem: true,
          ElSelect: true,
          ElOption: true,
          ElInputNumber: true,
          ElSwitch: true,
          ElButton: true,
          ElProgress: true,
          ElAlert: true
        }
      }
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  describe('组件渲染', () => {
    it('应该正确渲染导出对话框', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.export-dialog').exists()).toBe(true)
    })

    it('应该显示项目信息', () => {
      expect(wrapper.text()).toContain('测试项目')
      expect(wrapper.text()).toContain('2') // 幻灯片数量
    })

    it('应该显示导出选项', () => {
      expect(wrapper.find('.export-options').exists()).toBe(true)
    })
  })

  describe('导出格式选择', () => {
    it('应该支持MP4格式选择', async () => {
      const formatSelect = wrapper.find('.format-select')
      await formatSelect.setValue('mp4')

      expect(wrapper.vm.selectedFormat).toBe('mp4')
    })

    it('应该支持HTML格式选择', async () => {
      const formatSelect = wrapper.find('.format-select')
      await formatSelect.setValue('html')

      expect(wrapper.vm.selectedFormat).toBe('html')
    })

    it('应该支持PDF格式选择', async () => {
      const formatSelect = wrapper.find('.format-select')
      await formatSelect.setValue('pdf')

      expect(wrapper.vm.selectedFormat).toBe('pdf')
    })

    it('应该支持PPTX格式选择', async () => {
      const formatSelect = wrapper.find('.format-select')
      await formatSelect.setValue('pptx')

      expect(wrapper.vm.selectedFormat).toBe('pptx')
    })
  })

  describe('视频导出选项', () => {
    beforeEach(async () => {
      await wrapper.find('.format-select').setValue('mp4')
    })

    it('应该显示视频质量选项', () => {
      expect(wrapper.find('.quality-options').exists()).toBe(true)
    })

    it('应该支持帧率设置', async () => {
      const frameRateInput = wrapper.find('.frame-rate-input')
      await frameRateInput.setValue(60)

      expect(wrapper.vm.exportOptions.frameRate).toBe(60)
    })

    it('应该支持码率设置', async () => {
      const bitrateInput = wrapper.find('.bitrate-input')
      await bitrateInput.setValue(10000000)

      expect(wrapper.vm.exportOptions.bitrate).toBe(10000000)
    })
  })

  describe('水印配置', () => {
    it('应该显示水印选项', () => {
      expect(wrapper.find('.watermark-options').exists()).toBe(true)
    })

    it('应该显示用户等级信息', () => {
      expect(wrapper.text()).toContain('免费版')
    })

    it('应该支持水印开关', async () => {
      const watermarkSwitch = wrapper.find('.watermark-switch')
      await watermarkSwitch.setValue(false)

      expect(wrapper.vm.exportOptions.includeWatermark).toBe(false)
    })

    it('应该根据用户等级设置默认水印状态', () => {
      expect(wrapper.vm.exportOptions.includeWatermark).toBe(true) // 免费用户默认开启
    })
  })

  describe('导出流程', () => {
    it('应该处理MP4导出', async () => {
      await wrapper.find('.format-select').setValue('mp4')
      mockVideoExporter.stopRecording.mockResolvedValue(new Blob())

      const exportButton = wrapper.find('.export-button')
      await exportButton.trigger('click')

      expect(mockVideoExporter.startRecording).toHaveBeenCalled()
      expect(wrapper.emitted('export-complete')).toBeTruthy()
    })

    it('应该处理HTML导出', async () => {
      await wrapper.find('.format-select').setValue('html')
      mockHtmlExporter.exportToHtml.mockResolvedValue('<html>...</html>')

      const exportButton = wrapper.find('.export-button')
      await exportButton.trigger('click')

      expect(mockHtmlExporter.exportToHtml).toHaveBeenCalledWith(
        defaultProps.projectData,
        expect.any(Object)
      )
    })

    it('应该显示导出进度', async () => {
      await wrapper.find('.format-select').setValue('mp4')

      const exportButton = wrapper.find('.export-button')
      await exportButton.trigger('click')

      expect(wrapper.vm.isExporting).toBe(true)
      expect(wrapper.find('.progress-bar').exists()).toBe(true)
    })

    it('应该处理导出错误', async () => {
      await wrapper.find('.format-select').setValue('mp4')
      mockVideoExporter.startRecording.mockRejectedValue(new Error('导出失败'))

      const exportButton = wrapper.find('.export-button')
      await exportButton.trigger('click')

      await wrapper.vm.$nextTick()

      expect(wrapper.vm.errorMessage).toBe('导出失败')
      expect(wrapper.find('.error-alert').exists()).toBe(true)
    })
  })

  describe('文件大小估算', () => {
    it('应该估算MP4文件大小', async () => {
      await wrapper.find('.format-select').setValue('mp4')

      const estimatedSize = wrapper.vm.estimatedFileSize

      expect(typeof estimatedSize).toBe('string')
      expect(estimatedSize).toContain('MB')
    })

    it('应该估算HTML文件大小', async () => {
      await wrapper.find('.format-select').setValue('html')

      const estimatedSize = wrapper.vm.estimatedFileSize

      expect(typeof estimatedSize).toBe('string')
      expect(estimatedSize).toContain('KB')
    })
  })

  describe('导出状态管理', () => {
    it('应该在导出期间禁用按钮', async () => {
      await wrapper.find('.format-select').setValue('mp4')

      const exportButton = wrapper.find('.export-button')
      await exportButton.trigger('click')

      expect(wrapper.vm.isExporting).toBe(true)
      expect(exportButton.attributes('disabled')).toBeTruthy()
    })

    it('应该在导出完成后重置状态', async () => {
      await wrapper.find('.format-select').setValue('mp4')
      mockVideoExporter.stopRecording.mockResolvedValue(new Blob())

      const exportButton = wrapper.find('.export-button')
      await exportButton.trigger('click')

      await wrapper.vm.$nextTick()

      expect(wrapper.vm.isExporting).toBe(false)
      expect(wrapper.vm.exportProgress).toBe(0)
    })
  })

  describe('PDF导出', () => {
    beforeEach(async () => {
      await wrapper.find('.format-select').setValue('pdf')
    })

    it('应该调用PDF导出器', async () => {
      const exportButton = wrapper.find('.export-button')
      await exportButton.trigger('click')

      await wrapper.vm.$nextTick()

      expect(wrapper.vm.isExporting).toBe(false)
    })

    it('应该显示PDF进度', async () => {
      const exportButton = wrapper.find('.export-button')
      await exportButton.trigger('click')

      expect(wrapper.vm.progressMessage).toContain('PDF')
    })

    it('应该估算PDF文件大小', async () => {
      const estimatedSize = wrapper.vm.estimatedFileSize

      expect(typeof estimatedSize).toBe('string')
      expect(estimatedSize).toContain('KB')
    })
  })

  describe('PPTX导出', () => {
    beforeEach(async () => {
      await wrapper.find('.format-select').setValue('pptx')
    })

    it('应该调用PPTX导出器', async () => {
      const exportButton = wrapper.find('.export-button')
      await exportButton.trigger('click')

      await wrapper.vm.$nextTick()

      expect(wrapper.vm.isExporting).toBe(false)
    })

    it('应该显示PPTX进度', async () => {
      const exportButton = wrapper.find('.export-button')
      await exportButton.trigger('click')

      expect(wrapper.vm.progressMessage).toContain('PPTX')
    })

    it('应该估算PPTX文件大小', async () => {
      const estimatedSize = wrapper.vm.estimatedFileSize

      expect(typeof estimatedSize).toBe('string')
      expect(estimatedSize).toContain('KB')
    })
  })

  describe('用户交互', () => {
    it('应该支持取消导出', async () => {
      const cancelButton = wrapper.find('.cancel-button')
      await cancelButton.trigger('click')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([false])
    })

    it('应该支持关闭对话框', async () => {
      await wrapper.setProps({ modelValue: false })

      expect(wrapper.vm.visible).toBe(false)
    })

    it('应该验证必填字段', async () => {
      // 设置无效的项目数据
      await wrapper.setProps({
        projectData: null
      })

      const exportButton = wrapper.find('.export-button')
      await exportButton.trigger('click')

      expect(wrapper.vm.errorMessage).toContain('项目数据')
    })
  })

  describe('性能监控', () => {
    it('应该监控导出性能', async () => {
      const startTime = Date.now()

      await wrapper.find('.format-select').setValue('mp4')
      const exportButton = wrapper.find('.export-button')
      await exportButton.trigger('click')

      const endTime = Date.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(100) // 点击响应应该很快
    })

    it('应该处理大项目导出', async () => {
      const largeProject = {
        title: '大项目',
        slides: Array.from({ length: 100 }, (_, i) => ({
          id: `slide${i}`,
          content: `幻灯片 ${i} 内容`.repeat(10) // 增加内容大小
        }))
      }

      await wrapper.setProps({ projectData: largeProject })
      await wrapper.find('.format-select').setValue('html')

      const startTime = Date.now()
      const exportButton = wrapper.find('.export-button')
      await exportButton.trigger('click')
      const endTime = Date.now()

      expect(endTime - startTime).toBeLessThan(500) // 即使是大项目，响应也应该及时
    })
  })

  describe('错误处理', () => {
    it('应该处理网络错误', async () => {
      await wrapper.find('.format-select').setValue('html')
      mockHtmlExporter.exportToHtml.mockRejectedValue(new Error('网络错误'))

      const exportButton = wrapper.find('.export-button')
      await exportButton.trigger('click')

      await wrapper.vm.$nextTick()

      expect(wrapper.vm.errorMessage).toBe('网络错误')
    })

    it('应该处理权限错误', async () => {
      await wrapper.find('.format-select').setValue('mp4')
      mockVideoExporter.startRecording.mockRejectedValue(new Error('权限被拒绝'))

      const exportButton = wrapper.find('.export-button')
      await exportButton.trigger('click')

      await wrapper.vm.$nextTick()

      expect(wrapper.vm.errorMessage).toBe('权限被拒绝')
    })

    it('应该处理内存不足错误', async () => {
      await wrapper.find('.format-select').setValue('mp4')
      mockVideoExporter.startRecording.mockRejectedValue(new Error('内存不足'))

      const exportButton = wrapper.find('.export-button')
      await exportButton.trigger('click')

      await wrapper.vm.$nextTick()

      expect(wrapper.vm.errorMessage).toBe('内存不足')
    })
  })

  describe('可访问性', () => {
    it('应该提供适当的ARIA标签', () => {
      const dialog = wrapper.find('.export-dialog')

      expect(dialog.attributes('role')).toBe('dialog')
      expect(dialog.attributes('aria-labelledby')).toBeTruthy()
    })

    it('应该支持键盘导航', async () => {
      const exportButton = wrapper.find('.export-button')

      await exportButton.trigger('keydown', { key: 'Enter' })
      expect(mockVideoExporter.startRecording).toHaveBeenCalled()
    })
  })
})
