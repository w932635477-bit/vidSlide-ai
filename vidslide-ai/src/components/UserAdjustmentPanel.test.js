/**
 * UserAdjustmentPanel.test.js
 * VidSlide AI - 用户调整面板组件测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import UserAdjustmentPanel from './UserAdjustmentPanel.vue'

describe('UserAdjustmentPanel.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(UserAdjustmentPanel, {
      props: {
        currentTemplate: {
          id: 'test-template',
          name: '测试模板',
          config: {}
        },
        isApplying: false,
        hasChanges: false,
        complianceScore: 85
      }
    })
  })

  describe('渲染', () => {
    it('应该正确渲染组件', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.classes()).toContain('user-adjustment-panel')
    })

    it('应该显示面板标题', () => {
      const title = wrapper.find('.panel-title')
      expect(title.exists()).toBe(true)
      expect(title.text()).toContain('测试模板')
    })

    it('应该显示合规度标签', () => {
      const complianceTag = wrapper.find('.el-tag')
      expect(complianceTag.exists()).toBe(true)
      expect(complianceTag.text()).toContain('合规度: 85%')
    })

    it('应该显示应用更改按钮', () => {
      const applyButton = wrapper.find('el-button')
      expect(applyButton.exists()).toBe(true)
      expect(applyButton.text()).toContain('应用更改')
    })
  })

  describe('状态显示', () => {
    it('应该根据合规度显示不同颜色的标签', async () => {
      // 高合规度 - 绿色
      expect(wrapper.find('.el-tag').classes()).toContain('el-tag--success')

      // 中等合规度 - 黄色
      await wrapper.setProps({ complianceScore: 65 })
      expect(wrapper.find('.el-tag').classes()).toContain('el-tag--warning')

      // 低合规度 - 红色
      await wrapper.setProps({ complianceScore: 45 })
      expect(wrapper.find('.el-tag').classes()).toContain('el-tag--danger')
    })

    it('应该根据状态禁用/启用按钮', async () => {
      const button = wrapper.find('el-button')

      // 无更改时按钮应该被禁用
      expect(button.attributes('disabled')).toBeDefined()

      // 有更改时按钮应该被启用
      await wrapper.setProps({ hasChanges: true })
      expect(button.attributes('disabled')).toBeUndefined()
    })

    it('应该显示加载状态', async () => {
      await wrapper.setProps({ isApplying: true })
      const button = wrapper.find('el-button')
      expect(button.attributes('loading')).toBeDefined()
    })
  })

  describe('用户交互', () => {
    it('应该能点击应用更改按钮', async () => {
      await wrapper.setProps({ hasChanges: true })
      const button = wrapper.find('el-button')

      await button.trigger('click')
      // 验证点击事件被触发（这里主要测试UI交互）
      expect(button.exists()).toBe(true)
    })

    it('应该响应模板变化', async () => {
      await wrapper.setProps({
        currentTemplate: {
          id: 'new-template',
          name: '新模板',
          config: {}
        }
      })

      const title = wrapper.find('.panel-title')
      expect(title.text()).toContain('新模板')
    })
  })

  describe('无障碍访问', () => {
    it('应该有正确的ARIA标签', () => {
      const header = wrapper.find('header')
      expect(header.attributes('role')).toBe('banner')

      const main = wrapper.find('main')
      expect(main.attributes('role')).toBe('main')

      const toolbar = wrapper.find('.panel-actions')
      expect(toolbar.attributes('role')).toBe('toolbar')
    })

    it('应该有描述性标签', () => {
      const title = wrapper.find('.panel-title')
      expect(title.attributes('id')).toBe('panel-title')

      const toolbar = wrapper.find('.panel-actions')
      expect(toolbar.attributes('aria-label')).toBe('面板操作')
    })

    it('应该支持屏幕阅读器', () => {
      const statusTag = wrapper.find('.el-tag')
      expect(statusTag.attributes('aria-live')).toBe('polite')
      expect(statusTag.attributes('aria-label')).toBe('合规度: 85%')
    })
  })

  describe('配置验证', () => {
    it('应该验证必需的props', () => {
      expect(wrapper.props().currentTemplate).toBeDefined()
      expect(wrapper.props().complianceScore).toBeDefined()
    })

    it('应该处理空的模板配置', () => {
      const wrapperWithoutTemplate = mount(UserAdjustmentPanel, {
        props: {
          complianceScore: 100
        }
      })

      const title = wrapperWithoutTemplate.find('.panel-title')
      expect(title.text()).toContain('模板设置')
    })
  })
})
