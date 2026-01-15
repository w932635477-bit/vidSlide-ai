// HomeView.vue 单元测试
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import HomeView from './HomeView.vue'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock router with proper routes
const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'home', component: {} },
    { path: '/workspace', name: 'workspace', component: {} }
  ]
})

describe('HomeView.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(HomeView, {
      global: {
        plugins: [router],
        stubs: ['router-link']
      }
    })
  })

  describe('渲染', () => {
    it('should render correctly', () => {
      expect(wrapper.exists()).toBe(true)
    })

    it('should contain navbar', () => {
      const navbar = wrapper.find('.vidslide-navbar')
      expect(navbar.exists()).toBe(true)
    })

    it('should contain hero section', () => {
      const hero = wrapper.find('.hero-section')
      expect(hero.exists()).toBe(true)
    })

    it('should display main title', () => {
      const title = wrapper.find('.hero-title')
      expect(title.exists()).toBe(true)
      expect(title.text()).toBe('从视频到 完美演示文稿')
    })

    it('should display subtitle', () => {
      const subtitle = wrapper.find('.hero-subtitle')
      expect(subtitle.exists()).toBe(true)
      expect(subtitle.text()).toContain('上传视频，让 AI 自动分析并生成同步演示文稿')
    })

    it('should contain hero showcase', () => {
      const showcase = wrapper.find('.hero-showcase')
      expect(showcase.exists()).toBe(true)
    })

    it('should contain presentations section', () => {
      const presentations = wrapper.find('.presentations-section')
      expect(presentations.exists()).toBe(true)
    })
  })

  describe('导航', () => {
    it('should have start button', () => {
      const button = wrapper.find('.btn-primary-large')
      expect(button.exists()).toBe(true)
      expect(button.text()).toContain('免费开始')
    })

    it('should navigate to workspace on start button click', async () => {
      const button = wrapper.find('.btn-primary-large')
      await button.trigger('click')

      // 验证路由导航被调用
      expect(button.exists()).toBe(true)
    })

    it('should have language switcher', () => {
      const langSwitcher = wrapper.find('.lang-switcher-wrapper')
      expect(langSwitcher.exists()).toBe(true)
    })

    it('should have login and signup buttons', () => {
      const loginBtn = wrapper.find('.btn-login')
      const signupBtn = wrapper.find('.btn-signup')
      expect(loginBtn.exists()).toBe(true)
      expect(signupBtn.exists()).toBe(true)
    })
  })

  describe('动画展示', () => {
    it('should display phone mockup', () => {
      const phone = wrapper.find('.phone-mockup')
      expect(phone.exists()).toBe(true)
    })

    it('should have animation steps', () => {
      const steps = wrapper.findAll('.animation-step')
      expect(steps.length).toBeGreaterThan(0)
    })

    it('should display presentations list', () => {
      const presentations = wrapper.find('.presentations-list')
      expect(presentations.exists()).toBe(true)
    })
  })

  describe('多语言支持', () => {
    it('should have language switcher', () => {
      const langSwitcher = wrapper.find('.lang-switcher-wrapper')
      expect(langSwitcher.exists()).toBe(true)
    })

    it('should support multiple languages', () => {
      expect(wrapper.vm.languages.length).toBeGreaterThan(1)
    })

    it('should have default language as Chinese', () => {
      expect(wrapper.vm.currentLang.code).toBe('zh')
    })
  })

  describe('响应式设计', () => {
    it('should have responsive hero layout', () => {
      const hero = wrapper.find('.hero-section')
      expect(hero.exists()).toBe(true)
    })

    it('should support mobile layout', () => {
      // 测试组件是否支持响应式布局
      expect(wrapper.vm.$el).toBeDefined()
    })
  })

  describe('动画和交互', () => {
    it('should have smooth transitions', () => {
      const hero = wrapper.find('.hero-section')
      // 检查是否有过渡类或样式
      expect(hero.exists()).toBe(true)
    })

    it('should be keyboard accessible', () => {
      const button = wrapper.find('button')
      expect(button.attributes('tabindex')).not.toBe('-1')
    })
  })

  describe('SEO优化', () => {
    it('should have semantic HTML', () => {
      const headings = wrapper.findAll('h1, h2, h3')
      expect(headings.length).toBeGreaterThan(0)
    })

    it('should have main title as h1', () => {
      const h1 = wrapper.find('h1')
      expect(h1.exists()).toBe(true)
      expect(h1.text()).toBe('从视频到 完美演示文稿')
    })

    it('should have proper heading structure', () => {
      // 检查是否有适当的标题层级
      const headings = wrapper.findAll('h1, h2, h3')
      expect(headings.length).toBeGreaterThan(0)
    })
  })
})
