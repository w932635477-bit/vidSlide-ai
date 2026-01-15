/**
 * index.test.js
 * VidSlide AI - 路由配置测试
 */

import { describe, it, expect, vi } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import router from './index.js'

// Mock 组件导入
vi.mock('../views/HomeView.vue', () => ({ default: { name: 'HomeView' } }))
vi.mock('../views/VideoEditorView.vue', () => ({ default: { name: 'VideoEditorView' } }))
vi.mock('../views/WorkspaceView.vue', () => ({ default: { name: 'WorkspaceView' } }))
vi.mock('../views/HelpView.vue', () => ({ default: { name: 'HelpView' } }))
vi.mock('../components/WegicDesignShowcase.vue', () => ({ default: { name: 'WegicDesignShowcase' } }))

describe('Router Configuration', () => {
  it('should export a router instance', () => {
    expect(router).toBeDefined()
    expect(router).toBeInstanceOf(Object)
  })

  it('should have correct routes configuration', () => {
    const routes = router.options.routes
    expect(routes).toHaveLength(5)

    // 检查每个路由
    expect(routes[0]).toEqual({
      path: '/',
      name: 'home',
      component: expect.any(Function)
    })

    expect(routes[1]).toEqual({
      path: '/editor',
      name: 'editor',
      component: expect.any(Function)
    })

    expect(routes[2]).toEqual({
      path: '/workspace',
      name: 'workspace',
      component: expect.any(Function)
    })

    expect(routes[3]).toEqual({
      path: '/help',
      name: 'help',
      component: expect.any(Function)
    })

    expect(routes[4]).toEqual({
      path: '/wegic-showcase',
      name: 'wegic-showcase',
      component: expect.any(Function)
    })
  })

  it('should use web history mode', () => {
    expect(router.options.history).toBeDefined()
    expect(router.options.history.location).toBe('/')
  })

    it('should have lazy-loaded components', () => {
      const routes = router.options.routes

      routes.forEach(route => {
        expect(typeof route.component).toBe('function')
        // Dynamic import functions may or may not have a name property
        expect(route.component).toBeDefined()
      })
    })

  it('should have unique route names', () => {
    const routes = router.options.routes
    const names = routes.map(route => route.name)
    const uniqueNames = [...new Set(names)]

    expect(names).toHaveLength(uniqueNames.length)
    expect(names).toEqual(uniqueNames)
  })

  it('should have valid route paths', () => {
    const routes = router.options.routes

    routes.forEach(route => {
      expect(route.path).toMatch(/^\/[a-zA-Z0-9\-]*$/)
    })
  })
})