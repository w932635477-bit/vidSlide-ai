/**
 * WegicDesignShowcase.test.js
 * Wegic.ai 设计系统展示组件测试
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import WegicDesignShowcase from './WegicDesignShowcase.vue'

describe('WegicDesignShowcase', () => {
  it('应该正确渲染组件', () => {
    const wrapper = mount(WegicDesignShowcase)
    expect(wrapper.exists()).toBe(true)
  })

  it('应该包含标题', () => {
    const wrapper = mount(WegicDesignShowcase)
    const title = wrapper.find('.wegic-heading-xl')
    expect(title.exists()).toBe(true)
    expect(title.text()).toContain('Wegic Design Showcase')
  })

  it('应该包含按钮组件展示', () => {
    const wrapper = mount(WegicDesignShowcase)
    const buttons = wrapper.findAll('.wegic-btn')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('应该包含颜色调色板', () => {
    const wrapper = mount(WegicDesignShowcase)
    const colorPalette = wrapper.find('.color-palette')
    expect(colorPalette.exists()).toBe(true)
  })

  it('应该包含卡片组件展示', () => {
    const wrapper = mount(WegicDesignShowcase)
    const cards = wrapper.findAll('.wegic-card')
    expect(cards.length).toBeGreaterThan(0)
  })

  it('应该包含徽章展示', () => {
    const wrapper = mount(WegicDesignShowcase)
    const badges = wrapper.findAll('.wegic-badge')
    expect(badges.length).toBeGreaterThan(0)
  })

  it('应该包含动画效果展示', () => {
    const wrapper = mount(WegicDesignShowcase)
    const animations = wrapper.find('.animation-showcase')
    expect(animations.exists()).toBe(true)
  })

  it('应该有正确的初始数据', () => {
    const wrapper = mount(WegicDesignShowcase)
    const vm = wrapper.vm

    expect(vm.colorPalette).toBeDefined()
    expect(vm.colorPalette.length).toBeGreaterThan(0)

    expect(vm.showcaseCards).toBeDefined()
    expect(vm.showcaseCards.length).toBeGreaterThan(0)
  })
})
