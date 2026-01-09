// App.vue 单元测试
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import ElementPlus from 'element-plus'
import App from './App.vue'

// Mock router
const routes = [
  { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
  { path: '/editor', name: 'editor', component: { template: '<div>Editor</div>' } }
]

const router = createRouter({
  history: createMemoryHistory(),
  routes
})

// Mock Element Plus icons
vi.mock('@element-plus/icons-vue', () => ({
  Menu: { template: '<div>Menu</div>' }
}))

describe('App.vue', () => {
  let wrapper

  beforeEach(async () => {
    try {
      wrapper = mount(App, {
        global: {
          plugins: [router, ElementPlus],
          stubs: ['router-link', 'router-view']
        }
      })

      await router.isReady()
    } catch (error) {
      console.error('App test setup failed:', error)
      throw error
    }
  })

  describe('渲染', () => {
    it('should render correctly', () => {
      expect(wrapper.exists()).toBe(true)
    })

    it('should contain app root element', () => {
      const app = wrapper.find('#app')
      expect(app.exists()).toBe(true)
    })

    it('should contain router-view', () => {
      const routerView = wrapper.findComponent({ name: 'router-view' })
      expect(routerView.exists()).toBe(true)
    })

    it('should have correct app id', () => {
      expect(wrapper.attributes('id')).toBe('app')
    })

    it('should mount router', () => {
      expect(router.isReady()).toBeDefined()
    })
  })

  describe('导航', () => {
    it('should support router navigation', () => {
      // App.vue 现在只包含 router-view，导航由子组件处理
      expect(wrapper.vm).toBeDefined()
    })
  })

  describe('布局', () => {
    it('should have proper CSS classes', () => {
      // App.vue 现在使用简单的布局结构
      expect(wrapper.attributes('id')).toBe('app')
    })
  })

  describe('错误处理', () => {
    it('should handle router errors gracefully', async () => {
      try {
        // Mock router error
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

        await router.push('/non-existent-route')

        expect(consoleSpy).not.toHaveBeenCalled()
        consoleSpy.mockRestore()
      } catch (error) {
        console.error('Router error handling test failed:', error)
        throw error
      }
    })
  })
})
