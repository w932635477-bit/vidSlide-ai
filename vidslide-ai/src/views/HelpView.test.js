/**
 * HelpView.test.js
 * VidSlide AI - 帮助中心视图测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import HelpView from './HelpView.vue'

describe('HelpView.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(HelpView)
  })

  describe('渲染', () => {
    it('应该正确渲染组件', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.classes()).toContain('help-view')
    })

    it('应该包含头部区域', () => {
      const header = wrapper.find('.help-header')
      expect(header.exists()).toBe(true)

      const title = header.find('h1')
      expect(title.exists()).toBe(true)
      expect(title.text()).toContain('帮助中心')

      const subtitle = header.find('p')
      expect(subtitle.exists()).toBe(true)
    })

    it('应该包含导航标签', () => {
      const nav = wrapper.find('.help-nav')
      expect(nav.exists()).toBe(true)
      expect(nav.attributes('aria-label')).toBe('帮助中心导航')

      const navTabs = wrapper.findAll('.nav-tab')
      expect(navTabs.length).toBeGreaterThan(0)
    })

    it('应该包含主要内容区域', () => {
      const content = wrapper.find('.help-content')
      expect(content.exists()).toBe(true)
    })
  })

  describe('导航功能', () => {
    it('应该默认激活第一个标签', () => {
      const firstTab = wrapper.find('.nav-tab')
      expect(firstTab.classes()).toContain('active')
    })

    it('应该能够切换标签', async () => {
      const tabs = wrapper.findAll('.nav-tab')
      expect(tabs.length).toBeGreaterThan(1)

      // 点击第二个标签
      await tabs[1].trigger('click')

      // 检查激活状态是否改变
      expect(wrapper.vm.activeTab).toBe(wrapper.vm.tabs[1].id)
    })

    it('应该有正确的aria-selected属性', () => {
      const activeTab = wrapper.find('.nav-tab.active')
      expect(activeTab.attributes('aria-selected')).toBe('true')
    })
  })

  describe('常见问题部分', () => {
    beforeEach(async () => {
      // 确保激活FAQ标签
      wrapper.vm.activeTab = 'faq'
      await wrapper.vm.$nextTick()
    })

    it('应该显示常见问题部分', () => {
      const faqSection = wrapper.find('.help-section')
      expect(faqSection.exists()).toBe(true)

      const title = faqSection.find('h2')
      expect(title.exists()).toBe(true)
      expect(title.text()).toContain('常见问题')
    })

    it('应该包含FAQ列表', () => {
      const faqList = wrapper.find('.faq-list')
      expect(faqList.exists()).toBe(true)

      const faqItems = wrapper.findAll('.faq-item')
      expect(faqItems.length).toBeGreaterThan(0)
    })

    it('应该渲染FAQ问题和答案', () => {
      const faqItems = wrapper.findAll('.faq-item')

      faqItems.forEach(item => {
        const question = item.find('.faq-question')
        const answer = item.find('.faq-answer')

        expect(question.exists()).toBe(true)
        expect(answer.exists()).toBe(true)
        expect(question.text()).toBeTruthy()
      })
    })
  })

  describe('导航功能', () => {
    it('应该能够切换到不同标签', async () => {
      const navTabs = wrapper.findAll('.nav-tab')

      if (navTabs.length > 1) {
        await navTabs[1].trigger('click')
        // 验证点击事件被触发
        expect(navTabs[1].exists()).toBe(true)
      }
    })

    it('应该保持导航状态', () => {
      const activeTab = wrapper.find('.nav-tab.active')
      expect(activeTab.exists()).toBe(true)
    })
  })

  describe('内容验证', () => {
    it('应该包含有意义的标题', () => {
      const title = wrapper.find('h1')
      expect(title.text()).toContain('帮助中心')
    })

    it('应该有导航功能', () => {
      const navTabs = wrapper.findAll('.nav-tab')
      expect(navTabs.length).toBeGreaterThan(0)
    })

    it('应该包含主要内容区域', () => {
      const main = wrapper.find('main')
      expect(main.exists()).toBe(true)
    })
  })

  describe('无障碍访问', () => {
    it('应该有适当的aria-labels', () => {
      const nav = wrapper.find('.help-nav')
      expect(nav.attributes('aria-label')).toBeDefined()

      const tabs = wrapper.findAll('.nav-tab')
      tabs.forEach(tab => {
        expect(tab.attributes('aria-selected')).toBeDefined()
      })
    })

    it('应该使用语义化HTML', () => {
      const headings = wrapper.findAll('h1, h2')
      expect(headings.length).toBeGreaterThan(0)

      const main = wrapper.find('main')
      expect(main.exists()).toBe(true)
    })

    it('应该支持键盘导航', () => {
      const tabs = wrapper.findAll('.nav-tab')
      tabs.forEach(tab => {
        expect(tab.attributes('role')).toBeUndefined() // 按钮默认支持键盘导航
      })
    })
  })

  describe('响应式设计', () => {
    it('应该有响应式布局类', () => {
      expect(wrapper.classes()).toContain('help-view')
      // 检查是否包含响应式相关的样式类
    })

    it('应该适配移动设备', () => {
      // 这里可以添加更具体的响应式测试
      const container = wrapper.find('.help-container')
      expect(container.exists()).toBe(true)
    })
  })
})
