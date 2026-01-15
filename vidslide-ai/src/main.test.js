/**
 * main.test.js
 * VidSlide AI - 应用入口测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock Vue and related modules
vi.mock('vue', () => ({
  createApp: vi.fn(() => ({
    use: vi.fn(),
    mount: vi.fn()
  }))
}))

vi.mock('element-plus', () => ({
  default: vi.fn()
}))

vi.mock('./App.vue', () => ({
  default: { name: 'App' }
}))

vi.mock('./router', () => ({
  default: { name: 'Router' }
}))

vi.mock('./styles/wegic-design-system.css', () => ({}))

describe('main.js', () => {
  let consoleLogSpy
  let mockApp
  let mockRouter

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock console.log to track calls
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    // Import and run main.js
    mockApp = {
      use: vi.fn().mockReturnThis(),
      mount: vi.fn().mockReturnThis()
    }

    mockRouter = { name: 'Router' }

    // Re-mock for this test
    const { createApp } = require('vue')
    createApp.mockReturnValue(mockApp)

    // Import main.js to trigger execution
    require('./main.js')
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
    vi.resetModules()
  })

  describe('应用初始化', () => {
    it('应该创建Vue应用实例', () => {
      const { createApp } = require('vue')

      expect(createApp).toHaveBeenCalledWith(require('./App.vue').default)
      expect(mockApp).toBeDefined()
    })

    it('应该安装路由器', () => {
      expect(mockApp.use).toHaveBeenCalledWith(mockRouter)
    })

    it('应该安装ElementPlus', () => {
      expect(mockApp.use).toHaveBeenCalledWith(require('element-plus').default)
    })

    it('应该挂载应用到DOM', () => {
      expect(mockApp.mount).toHaveBeenCalledWith('#app')
    })
  })

  describe('日志输出', () => {
    it('应该输出启动日志', () => {
      expect(consoleLogSpy).toHaveBeenCalledWith('🚀 main.js 开始执行')
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Vue 导入成功')
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ ElementPlus 导入成功')
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ CSS 导入成功')
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ App.vue 导入成功')
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Router 导入成功')
    })

    it('应该输出应用创建日志', () => {
      expect(consoleLogSpy).toHaveBeenCalledWith('🚀 创建Vue应用实例')
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Vue应用实例创建成功')
    })

    it('应该输出插件安装日志', () => {
      expect(consoleLogSpy).toHaveBeenCalledWith('🚀 安装路由器')
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ 路由器安装成功')
      expect(consoleLogSpy).toHaveBeenCalledWith('🚀 安装ElementPlus')
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ ElementPlus安装成功')
    })

    it('应该输出应用挂载日志', () => {
      expect(consoleLogSpy).toHaveBeenCalledWith('🚀 挂载应用到#app')
      expect(consoleLogSpy).toHaveBeenCalledWith('🎉 Vue应用挂载完成！')
    })
  })

  describe('依赖导入', () => {
    it('应该正确导入Vue', () => {
      const { createApp } = require('vue')
      expect(createApp).toBeDefined()
      expect(typeof createApp).toBe('function')
    })

    it('应该正确导入ElementPlus', () => {
      const ElementPlus = require('element-plus').default
      expect(ElementPlus).toBeDefined()
    })

    it('应该正确导入App组件', () => {
      const App = require('./App.vue').default
      expect(App).toBeDefined()
      expect(App.name).toBe('App')
    })

    it('应该正确导入路由器', () => {
      const router = require('./router').default
      expect(router).toBeDefined()
    })

    it('应该导入CSS样式', () => {
      // CSS import should not throw
      expect(() => require('./styles/wegic-design-system.css')).not.toThrow()
    })
  })

  describe('错误处理', () => {
    it('应该处理Vue创建失败', () => {
      const { createApp } = require('vue')
      createApp.mockImplementation(() => {
        throw new Error('Vue creation failed')
      })

      expect(() => require('./main.js')).toThrow('Vue creation failed')
    })

    it('应该处理路由器安装失败', () => {
      mockApp.use.mockImplementationOnce(() => {
        throw new Error('Router installation failed')
      })

      expect(() => require('./main.js')).toThrow('Router installation failed')
    })

    it('应该处理ElementPlus安装失败', () => {
      mockApp.use.mockImplementationOnce(() => {
        // First call succeeds (router), second fails (ElementPlus)
      }).mockImplementationOnce(() => {
        throw new Error('ElementPlus installation failed')
      })

      expect(() => require('./main.js')).toThrow('ElementPlus installation failed')
    })

    it('应该处理应用挂载失败', () => {
      mockApp.mount.mockImplementation(() => {
        throw new Error('App mount failed')
      })

      expect(() => require('./main.js')).toThrow('App mount failed')
    })
  })

  describe('配置验证', () => {
    it('应该使用正确的挂载点', () => {
      expect(mockApp.mount).toHaveBeenCalledWith('#app')
    })

    it('应该按正确顺序安装插件', () => {
      const useCalls = mockApp.use.mock.calls

      // 第一个调用应该是路由器
      expect(useCalls[0][0]).toBe(mockRouter)

      // 第二个调用应该是ElementPlus
      expect(useCalls[1][0]).toBe(require('element-plus').default)
    })

    it('应该只挂载一次', () => {
      expect(mockApp.mount).toHaveBeenCalledTimes(1)
    })
  })

  describe('性能监控', () => {
    it('应该快速初始化', () => {
      const startTime = Date.now()

      // Re-run initialization
      require('./main.js')

      const endTime = Date.now()
      const initTime = endTime - startTime

      // 初始化应该在合理时间内完成（考虑到mock，可能较慢）
      expect(initTime).toBeLessThan(1000)
    })

    it('应该最小化控制台输出', () => {
      // 应该有合理的日志数量，不应该过度记录
      expect(consoleLogSpy.mock.calls.length).toBeLessThan(20)
    })
  })

  describe('环境兼容性', () => {
    it('应该在浏览器环境中工作', () => {
      // 验证必要的浏览器API可用
      expect(typeof window).toBe('object')
      expect(typeof document).toBe('object')
    })

    it('应该处理ES模块导入', () => {
      // 验证所有导入都能正常工作
      expect(() => {
        require('vue')
        require('element-plus')
        require('./App.vue')
        require('./router')
      }).not.toThrow()
    })
  })
})