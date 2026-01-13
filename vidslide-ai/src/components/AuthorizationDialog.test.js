/**
 * AuthorizationDialog.vue 单元测试
 * VidSlide AI - 外部素材获取授权对话框组件测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AuthorizationDialog from './AuthorizationDialog.vue'
import { nextTick } from 'vue'

describe('AuthorizationDialog.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(AuthorizationDialog, {
      props: {
        visible: true,
        searchKeywords: ['纽约城市', '现代建筑', '都市景观']
      }
    })
  })

  describe('基本渲染', () => {
    it('应该正确渲染对话框', () => {
      expect(wrapper.find('.authorization-dialog').exists()).toBe(true)
      expect(wrapper.find('.dialog-title').text()).toContain('外部素材获取授权')
    })

    it('应该显示搜索关键词', () => {
      const keywordsText = wrapper.find('.info-value').text()
      expect(keywordsText).toContain('纽约城市')
      expect(keywordsText).toContain('现代建筑')
      expect(keywordsText).toContain('都市景观')
    })

    it('应该显示隐私保护信息', () => {
      const privacyItems = wrapper.findAll('.privacy-item')
      expect(privacyItems.length).toBe(4)
      expect(privacyItems[0].text()).toContain('仅传输关键词')
      expect(privacyItems[1].text()).toContain('搜索结果仅在当前会话使用')
    })

    it('应该包含授权复选框', () => {
      const checkbox = wrapper.find('.consent-checkbox')
      expect(checkbox.exists()).toBe(true)
      expect(checkbox.text()).toContain('我已阅读并同意授权搜索外部素材')
    })

    it('应该显示替代方案按钮', () => {
      const alternativeBtn = wrapper.find('.alternative-btn')
      expect(alternativeBtn.exists()).toBe(true)
      expect(alternativeBtn.text()).toContain('仅使用本地素材')
    })
  })

  describe('用户交互', () => {
    it('应该在未勾选复选框时禁用确认按钮', async () => {
      const confirmBtn = wrapper.find('.confirm-btn')
      expect(confirmBtn.attributes('disabled')).toBeDefined()
    })

    it('应该包含确认按钮', () => {
      const confirmBtn = wrapper.find('.confirm-btn')
      expect(confirmBtn.exists()).toBe(true)
    })

    it('应该在点击取消时发出cancel事件', async () => {
      const cancelBtn = wrapper.find('.cancel-btn')
      await cancelBtn.trigger('click')

      expect(wrapper.emitted().cancel).toBeTruthy()
    })

    it('应该在点击关闭按钮时发出cancel事件', async () => {
      const closeBtn = wrapper.find('.close-btn')
      await closeBtn.trigger('click')

      expect(wrapper.emitted().cancel).toBeTruthy()
    })

    it('应该在点击仅使用本地素材时发出use-local-only事件', async () => {
      const localBtn = wrapper.find('.alternative-btn')
      await localBtn.trigger('click')

      expect(wrapper.emitted()['use-local-only']).toBeTruthy()
    })
  })

  describe('无障碍支持', () => {
    it('应该包含正确的ARIA属性', () => {
      const dialog = wrapper.find('.authorization-dialog')
      expect(dialog.attributes('role')).toBe('dialog')
      expect(dialog.attributes('aria-labelledby')).toBe('auth-dialog-title')
      expect(dialog.attributes('aria-describedby')).toBe('auth-dialog-description')
    })

    it('应该包含可聚焦的元素', () => {
      const closeBtn = wrapper.find('.close-btn')
      expect(closeBtn.attributes('aria-label')).toBe('关闭对话框')
    })
  })

  describe('响应式设计', () => {
    it('应该在移动设备上正确显示', async () => {
      // 设置移动设备视口
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      })

      // 重新挂载组件
      wrapper.unmount()
      wrapper = mount(AuthorizationDialog, {
        props: {
          visible: true,
          searchKeywords: ['测试关键词']
        }
      })

      const dialog = wrapper.find('.authorization-dialog')
      expect(dialog.exists()).toBe(true)

      // 恢复原始视口
      window.innerWidth = 1024
    })
  })

  describe('状态管理', () => {
    it('应该正确初始化状态', () => {
      expect(wrapper.vm.userConsent).toBe(false)
    })
  })

  describe('错误处理', () => {
    it('应该处理空的关键词数组', () => {
      wrapper = mount(AuthorizationDialog, {
        props: {
          visible: true,
          searchKeywords: []
        }
      })

      const keywordsValue = wrapper.find('.info-value')
      expect(keywordsValue.exists()).toBe(true)
    })

    it('应该处理长关键词列表', () => {
      const longKeywords = Array.from({ length: 10 }, (_, i) => `关键词${i + 1}`)
      wrapper = mount(AuthorizationDialog, {
        props: {
          visible: true,
          searchKeywords: longKeywords
        }
      })

      const keywordsText = wrapper.find('.info-value').text()
      expect(keywordsText.length).toBeGreaterThan(0)
    })
  })
})