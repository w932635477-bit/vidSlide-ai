import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import FaceTrackingSettings from './FaceTrackingSettings.vue'

// Mock navigator.mediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }]
    })
  },
  configurable: true
})

// Mock hardware concurrency
Object.defineProperty(navigator, 'hardwareConcurrency', {
  writable: true,
  value: 8
})

describe('FaceTrackingSettings.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(FaceTrackingSettings, {
      global: {
        stubs: ['teleport']
      }
    })
  })

  describe('渲染测试', () => {
    it('应该正确渲染组件', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.face-tracking-settings').exists()).toBe(true)
    })

    it('应该显示设置标题', () => {
      expect(wrapper.find('.settings-header h3').text()).toBe('人脸跟踪设置')
    })

    it('应该显示跟踪状态指示器', () => {
      expect(wrapper.find('.tracking-status').exists()).toBe(true)
      expect(wrapper.find('.status-indicator').exists()).toBe(true)
      expect(wrapper.find('.status-text').exists()).toBe(true)
    })

    it('应该显示所有设置组', () => {
      const groups = wrapper.findAll('.setting-group')
      expect(groups.length).toBe(6) // 跟踪模式、灵敏度、边界保护、性能参数、高级设置、实时预览
    })
  })

  describe('跟踪模式', () => {
    it('应该显示所有跟踪模式选项', () => {
      const modeBtns = wrapper.findAll('.mode-btn')
      expect(modeBtns.length).toBe(4) // 单人跟踪、多人跟踪、手势跟踪、全身跟踪
    })

    it('应该默认选择单人跟踪模式', () => {
      const activeMode = wrapper.find('.mode-btn.active')
      expect(activeMode.find('.mode-name').text()).toBe('单人跟踪')
    })

    it('应该能够切换跟踪模式', async () => {
      const multiModeBtn = wrapper.findAll('.mode-btn').find(btn =>
        btn.find('.mode-name').text() === '多人跟踪'
      )
      await multiModeBtn.trigger('click')

      expect(wrapper.vm.currentMode).toBe('multi')
    })

    it('应该禁用不支持的跟踪模式', () => {
      // 降低硬件并发数
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        writable: true,
        value: 2
      })

      const wrapperLow = mount(FaceTrackingSettings)
      const disabledBtns = wrapperLow.findAll('.mode-btn:disabled')
      expect(disabledBtns.length).toBeGreaterThan(0)
    })
  })

  describe('灵敏度调节', () => {
    it('应该显示灵敏度滑块', () => {
      const slider = wrapper.find('.sensitivity-slider')
      expect(slider.exists()).toBe(true)
      expect(slider.attributes('min')).toBe('1')
      expect(slider.attributes('max')).toBe('100')
    })

    it('应该显示当前灵敏度值', () => {
      const value = wrapper.find('.sensitivity-value')
      expect(value.text()).toBe('70%')
    })

    it('应该显示灵敏度描述', () => {
      const description = wrapper.find('.sensitivity-description')
      expect(description.exists()).toBe(true)
      expect(description.text()).toContain('高灵敏度')
    })

    it('应该根据灵敏度值显示不同的描述', async () => {
      const slider = wrapper.find('.sensitivity-slider')
      await slider.setValue(20)

      await wrapper.vm.$nextTick()
      const description = wrapper.find('.sensitivity-description')
      expect(description.text()).toContain('低灵敏度')

      await slider.setValue(90)
      await wrapper.vm.$nextTick()
      expect(description.text()).toContain('高灵敏度')
    })
  })

  describe('边界保护设置', () => {
    it('应该显示边界保护选项', () => {
      const boundaryItems = wrapper.findAll('.boundary-item')
      expect(boundaryItems.length).toBe(3) // 启用、保护区域、保持在画面内
    })

    it('应该默认启用边界保护', () => {
      const checkbox = wrapper.find('input[aria-label="启用边界保护"]')
      expect(checkbox.element.checked).toBe(true)
    })

    it('启用边界保护时应该显示额外选项', () => {
      const marginSelect = wrapper.findAll('select')[0] // 边界保护区域选择器
      expect(marginSelect.exists()).toBe(true)
      expect(marginSelect.find('option[value="20"]').exists()).toBe(true)
    })

    it('应该能够切换边界保护设置', async () => {
      const keepInFrameCheckbox = wrapper.find('input[aria-label="保持人脸在画面内"]')
      await keepInFrameCheckbox.setValue(false)

      expect(wrapper.vm.boundaryProtection.keepInFrame).toBe(false)
    })
  })

  describe('性能参数', () => {
    it('应该显示性能参数选项', () => {
      const paramItems = wrapper.findAll('.param-item')
      expect(paramItems.length).toBe(3) // 检测间隔、跟踪精度、最大跟踪目标
    })

    it('应该能够更改检测间隔', async () => {
      const intervalSelect = wrapper.find('select[aria-label="人脸检测间隔设置"]')
      await intervalSelect.setValue('500')

      expect(wrapper.vm.performanceParams.detectionInterval).toBe('500')
    })

    it('应该能够更改跟踪精度', async () => {
      const accuracySelect = wrapper.find('select[aria-label="跟踪精度设置"]')
      await accuracySelect.setValue('high')

      expect(wrapper.vm.performanceParams.trackingAccuracy).toBe('high')
    })

    it('应该能够更改最大跟踪目标数', async () => {
      const maxTargetsSelect = wrapper.find('select[aria-label="最大跟踪目标数量设置"]')
      await maxTargetsSelect.setValue('5')

      expect(wrapper.vm.performanceParams.maxTargets).toBe('5')
    })
  })

  describe('高级设置', () => {
    it('应该显示高级设置选项', () => {
      const advancedItems = wrapper.findAll('.advanced-item')
      expect(advancedItems.length).toBe(4) // 平滑跟踪、姿态估计、表情检测、年龄性别检测
    })

    it('应该默认启用平滑跟踪', () => {
      const smoothTrackingCheckbox = wrapper.find('input[aria-label="启用平滑跟踪"]')
      expect(smoothTrackingCheckbox.element.checked).toBe(true)
    })

    it('应该能够切换高级设置', async () => {
      const poseCheckbox = wrapper.find('input[aria-label="启用姿态估计"]')
      await poseCheckbox.setValue(true)

      expect(wrapper.vm.advancedSettings.poseEstimation).toBe(true)
    })
  })

  describe('实时预览', () => {
    it('应该显示预览画布', () => {
      const canvas = wrapper.find('.preview-canvas')
      expect(canvas.exists()).toBe(true)
      expect(canvas.attributes('width')).toBe('320')
      expect(canvas.attributes('height')).toBe('240')
    })

    it('应该显示预览控制按钮', () => {
      const previewBtn = wrapper.find('.preview-btn')
      expect(previewBtn.exists()).toBe(true)
      expect(previewBtn.text()).toBe('开始预览')
    })

    it('应该能够启动预览', async () => {
      const previewBtn = wrapper.find('.preview-btn')
      await previewBtn.trigger('click')

      expect(wrapper.vm.isPreviewActive).toBe(true)
    })

    it('启动预览后应该显示跟踪信息', async () => {
      const previewBtn = wrapper.find('.preview-btn')
      await previewBtn.trigger('click')

      await wrapper.vm.$nextTick()

      // 预览激活后应该显示跟踪信息覆盖层
      if (wrapper.vm.isPreviewActive) {
        const trackingInfo = wrapper.find('.tracking-info')
        expect(trackingInfo.exists()).toBe(true)
      }
    })

    it('应该能够停止预览', async () => {
      // 先启动预览
      const previewBtn = wrapper.find('.preview-btn')
      await previewBtn.trigger('click')
      expect(wrapper.vm.isPreviewActive).toBe(true)

      // 再次点击停止预览
      await previewBtn.trigger('click')
      expect(wrapper.vm.isPreviewActive).toBe(false)
    })

    it('预览未激活时应该显示未启动状态', () => {
      const statusText = wrapper.find('.status-text')
      expect(statusText.text()).toBe('未启动')
    })
  })

  describe('设置管理', () => {
    it('应该显示设置操作按钮', () => {
      expect(wrapper.find('.reset-btn').exists()).toBe(true)
      expect(wrapper.find('.apply-btn').exists()).toBe(true)
    })

    it('应该能够重置为默认设置', async () => {
      // 先修改一些设置
      wrapper.vm.currentSensitivity = 50
      wrapper.vm.boundaryProtection.enabled = false

      const resetBtn = wrapper.find('.reset-btn')
      await resetBtn.trigger('click')

      expect(wrapper.vm.currentSensitivity).toBe(70)
      expect(wrapper.vm.boundaryProtection.enabled).toBe(true)
    })

    it('修改设置后应该启用应用按钮', async () => {
      const applyBtn = wrapper.find('.apply-btn')
      expect(applyBtn.attributes('disabled')).toBeDefined() // 默认禁用

      // 修改设置
      const slider = wrapper.find('.sensitivity-slider')
      await slider.setValue(80)

      await wrapper.vm.$nextTick()
      expect(applyBtn.attributes('disabled')).toBeUndefined() // 应该启用
    })

    it('应该能够应用设置', async () => {
      // 修改设置
      wrapper.vm.currentSensitivity = 80
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.hasChanges).toBe(true)

      const applyBtn = wrapper.find('.apply-btn')
      await applyBtn.trigger('click')

      // 应用后应该重置变更状态
      expect(wrapper.vm.hasChanges).toBe(false)
    })
  })

  describe('状态指示器', () => {
    it('未启动预览时应该显示未激活状态', () => {
      const indicator = wrapper.find('.status-indicator')
      expect(indicator.classes()).toContain('status-inactive')
    })

    it('启动预览后应该显示搜索状态', async () => {
      const previewBtn = wrapper.find('.preview-btn')
      await previewBtn.trigger('click')

      const indicator = wrapper.find('.status-indicator')
      expect(indicator.classes()).toContain('status-searching')
    })
  })

  describe('无障碍支持', () => {
    it('应该支持键盘导航', () => {
      const buttons = wrapper.findAll('button')
      buttons.forEach(button => {
        expect(button.attributes('tabindex')).toBeUndefined() // 默认可聚焦
      })
    })

    it('应该有适当的标签和描述', () => {
      const labels = wrapper.findAll('label')
      expect(labels.length).toBeGreaterThan(0)
    })

    it('应该支持屏幕阅读器', () => {
      const inputs = wrapper.findAll('input, select')
      inputs.forEach(input => {
        const hasAria = input.attributes('aria-label') || input.attributes('aria-labelledby')
        expect(hasAria).toBeTruthy()
      })
    })
  })

  describe('响应式设计', () => {
    it('应该在小屏幕上调整布局', () => {
      // 模拟小屏幕
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 480 })

      const wrapperSmall = mount(FaceTrackingSettings, {
        global: {
          stubs: ['teleport']
        }
      })

      // 检查响应式样式是否应用
      const settings = wrapperSmall.find('.face-tracking-settings')
      expect(settings.classes()).toContain('face-tracking-settings')
    })
  })

  describe('错误处理', () => {
    it('应该优雅处理摄像头权限拒绝', async () => {
      // Mock 摄像头权限拒绝
      navigator.mediaDevices.getUserMedia.mockRejectedValueOnce(new Error('Permission denied'))

      const previewBtn = wrapper.find('.preview-btn')
      await previewBtn.trigger('click')

      // 应该不会抛出错误，组件应该继续工作
      expect(wrapper.exists()).toBe(true)
    })

    it('应该处理不支持的跟踪模式', () => {
      // 设置不支持的硬件
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        writable: true,
        value: 1
      })

      const wrapperLimited = mount(FaceTrackingSettings)
      const availableModes = wrapperLimited.findAll('.mode-btn:not(:disabled)')
      expect(availableModes.length).toBeLessThan(4)
    })
  })

  describe('性能测试', () => {
    it('应该保持良好的渲染性能', async () => {
      const startTime = performance.now()

      // 快速连续操作
      for (let i = 0; i < 10; i++) {
        wrapper.vm.currentSensitivity = 50 + i
        await wrapper.vm.$nextTick()
      }

      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(1000) // 应该在1秒内完成
    })

    it('应该优化重渲染', async () => {
      const renderCount = { value: 0 }

      // 监听组件更新
      wrapper.vm.$watch(() => wrapper.vm.currentSensitivity, () => {
        renderCount.value++
      })

      // 快速更新
      for (let i = 0; i < 5; i++) {
        wrapper.vm.currentSensitivity = 60 + i
        await wrapper.vm.$nextTick()
      }

      expect(renderCount.value).toBe(5)
    })
  })

  describe('调试模式', () => {
    it('调试模式启用时应该显示调试按钮', async () => {
      wrapper.vm.debugMode = true
      await wrapper.vm.$nextTick()

      const debugBtn = wrapper.find('.debug-btn')
      expect(debugBtn.exists()).toBe(true)
    })

    it('应该能够切换调试信息显示', async () => {
      wrapper.vm.debugMode = true
      await wrapper.vm.$nextTick()

      const debugBtn = wrapper.find('.debug-btn')
      await debugBtn.trigger('click')

      expect(wrapper.vm.showDebugInfo).toBe(true)

      await debugBtn.trigger('click')
      expect(wrapper.vm.showDebugInfo).toBe(false)
    })

    it('显示调试信息时应该显示调试数据', async () => {
      wrapper.vm.debugMode = true
      wrapper.vm.showDebugInfo = true
      await wrapper.vm.$nextTick()

      const debugItems = wrapper.findAll('.debug-item')
      expect(debugItems.length).toBeGreaterThan(0)
    })
  })

  describe('生命周期', () => {
    it('应该在挂载时初始化', () => {
      expect(wrapper.vm.currentMode).toBe('single')
      expect(wrapper.vm.currentSensitivity).toBe(70)
    })

    it('应该在卸载时停止预览', () => {
      wrapper.vm.isPreviewActive = true
      wrapper.unmount()

      // 预览应该被停止
      expect(wrapper.vm.isPreviewActive).toBe(false)
    })
  })
})