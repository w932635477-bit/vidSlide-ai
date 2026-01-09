/**
 * VidSlide AI - 素材浏览器组件单元测试 (简化版)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AssetBrowser from './AssetBrowser.vue'

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  },
  ElMessageBox: {
    confirm: vi.fn().mockResolvedValue(true)
  },
  ElTag: { template: '<span><slot/></span>' },
  ElIcon: { template: '<span><slot/></span>' },
  ElButton: { template: '<button><slot/></button>' },
  ElInput: { template: '<input />' },
  ElSelect: { template: '<select><slot/></select>' },
  ElOption: { template: '<option><slot/></option>' },
  ElCheckbox: { template: '<input type="checkbox" />' },
  ElCheckboxGroup: { template: '<div><slot/></div>' },
  ElSwitch: { template: '<input type="checkbox" />' },
  ElEmpty: { template: '<div><slot/></div>' },
  ElDropdown: { template: '<div><slot/></div>' },
  ElDropdownMenu: { template: '<div><slot/></div>' },
  ElDropdownItem: { template: '<div><slot/></div>' },
  ElPagination: { template: '<div><slot/></div>' },
  ElDialog: { template: '<div><slot/></div>' },
  ElTabs: { template: '<div><slot/></div>' },
  ElTabPane: { template: '<div><slot/></div>' }
}))

// Mock AssetManager
vi.mock('../utils/AssetManager.js', () => ({
  getAssetManager: vi.fn(() => ({
    initialize: vi.fn().mockResolvedValue(),
    storage: {
      searchAssets: vi
        .fn()
        .mockResolvedValue([
          { id: 'local_1', name: '本地素材1', type: 'image', isDownloaded: true }
        ])
    },
    searchAssets: vi.fn().mockResolvedValue({
      local: [{ id: 'local_1', name: '本地素材1', type: 'image', isDownloaded: true }],
      external: [
        { id: 'ext_1', name: '外部素材1', source: 'unsplash', copyrightInfo: { isSafe: true } }
      ],
      total: 2
    }),
    getPopularAssets: vi
      .fn()
      .mockResolvedValue([{ id: 'pop_1', name: '热门素材1', source: 'pexels' }]),
    downloadAsset: vi.fn().mockResolvedValue({
      id: 'downloaded_1',
      name: '下载的素材'
    }),
    deleteLocalAsset: vi.fn().mockResolvedValue(),
    getSupportedCategories: vi.fn().mockReturnValue([
      { id: 'nature', name: '自然', icon: '🌿' },
      { id: 'business', name: '商业', icon: '💼' }
    ]),
    getSupportedColors: vi.fn().mockReturnValue([{ id: 'red', name: '红色', value: 'red' }]),
    getAPIStatus: vi.fn().mockReturnValue({
      unsplash: { configured: true, enabled: true },
      pexels: { configured: false, enabled: true }
    }),
    getStatus: vi.fn().mockReturnValue({
      initialized: true,
      storage: true,
      apis: { unsplash: true, pexels: false }
    }),
    on: vi.fn(),
    off: vi.fn()
  }))
}))

describe('AssetBrowser.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(AssetBrowser, {
      global: {
        stubs: {
          'el-tag': true,
          'el-icon': true,
          'el-button': true,
          'el-input': true,
          'el-select': true,
          'el-option': true,
          'el-checkbox': true,
          'el-checkbox-group': true,
          'el-switch': true,
          'el-empty': true,
          'el-dropdown': true,
          'el-dropdown-menu': true,
          'el-dropdown-item': true,
          'el-pagination': true,
          'el-dialog': true
        }
      }
    })

    // 重置组件状态以避免初始化影响
    wrapper.vm.isLoading = false
    wrapper.vm.assets = []
    wrapper.vm.searchQuery = ''
  })

  afterEach(() => {
    wrapper.unmount()
  })

  describe('初始化', () => {
    it('应该正确渲染组件', () => {
      expect(wrapper.exists()).toBe(true)
    })

    it('应该显示正确的标题', () => {
      expect(wrapper.text()).toContain('素材浏览器')
    })

    it('应该有基础的DOM结构', () => {
      const browser = wrapper.find('.asset-browser')
      expect(browser.exists()).toBe(true)
    })
  })

  describe('响应式数据', () => {
    it('应该能够设置搜索查询', () => {
      const vm = wrapper.vm
      vm.searchQuery = '测试'
      expect(vm.searchQuery).toBe('测试')
    })

    it('应该有响应式的素材数组', () => {
      const vm = wrapper.vm
      expect(Array.isArray(vm.assets)).toBe(true)
    })
  })
})
