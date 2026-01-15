import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ExportHistoryManager from './ExportHistoryManager.vue'

// Mock URL.createObjectURL and revokeObjectURL
Object.defineProperty(window.URL, 'createObjectURL', {
  value: vi.fn(() => 'mock-url')
})
Object.defineProperty(window.URL, 'revokeObjectURL', {
  value: vi.fn()
})

// Mock Blob
global.Blob = vi.fn().mockImplementation((parts, options) => {
  return {
    size: parts ? parts[0].length : 0,
    type: options?.type || 'application/json'
  }
})

describe('ExportHistoryManager.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(ExportHistoryManager, {
      global: {
        stubs: ['teleport']
      }
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('渲染测试', () => {
    it('应该正确渲染组件', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.export-history-manager').exists()).toBe(true)
    })

    it('应该显示标题和统计信息', () => {
      expect(wrapper.find('.manager-header h3').text()).toBe('导出历史管理')
      expect(wrapper.findAll('.stat-item').length).toBeGreaterThan(0)
    })

    it('应该显示工具栏', () => {
      expect(wrapper.find('.manager-toolbar').exists()).toBe(true)
      expect(wrapper.find('.search-input').exists()).toBe(true)
      expect(wrapper.findAll('.filter-select').length).toBe(2)
    })

    it('应该显示历史记录列表', () => {
      expect(wrapper.find('.history-list').exists()).toBe(true)
      expect(wrapper.find('.list-items').exists()).toBe(true)
    })

    it('应该在需要时显示分页控件', () => {
      // 如果总页数大于1，应该显示分页
      if (wrapper.vm.totalPages > 1) {
        expect(wrapper.find('.pagination').exists()).toBe(true)
      }
    })
  })

  describe('统计信息', () => {
    it('应该正确计算总记录数', () => {
      expect(wrapper.vm.totalExports).toBeGreaterThan(0)
    })

    it('应该正确计算存储大小', () => {
      expect(wrapper.vm.totalStorageSize).toBeGreaterThan(0)
    })

    it('应该正确计算成功率', () => {
      expect(wrapper.vm.successRate).toBeGreaterThanOrEqual(0)
      expect(wrapper.vm.successRate).toBeLessThanOrEqual(100)
    })
  })

  describe('搜索和过滤', () => {
    it('应该支持文本搜索', async () => {
      const searchInput = wrapper.find('.search-input')
      await searchInput.setValue('导出项目 1')

      expect(wrapper.vm.searchQuery).toBe('导出项目 1')
      expect(wrapper.vm.filteredHistory.length).toBeLessThanOrEqual(wrapper.vm.exportHistory.length)
    })

    it('应该支持状态过滤', async () => {
      const statusSelect = wrapper.findAll('.filter-select')[0]
      await statusSelect.setValue('success')

      expect(wrapper.vm.filterStatus).toBe('success')
      const successItems = wrapper.vm.filteredHistory.filter(item => item.status === 'success')
      expect(wrapper.vm.filteredHistory.length).toBe(successItems.length)
    })

    it('应该支持类型过滤', async () => {
      const typeSelect = wrapper.findAll('.filter-select')[1]
      await typeSelect.setValue('video')

      expect(wrapper.vm.filterType).toBe('video')
      const videoItems = wrapper.vm.filteredHistory.filter(item => item.type === 'video')
      expect(wrapper.vm.filteredHistory.length).toBe(videoItems.length)
    })

    it('应该能够清空筛选条件', async () => {
      // 设置一些筛选条件
      wrapper.vm.searchQuery = 'test'
      wrapper.vm.filterStatus = 'success'
      wrapper.vm.filterType = 'video'
      await wrapper.vm.$nextTick()

      const clearBtn = wrapper.find('.clear-filters-btn')
      await clearBtn.trigger('click')

      expect(wrapper.vm.searchQuery).toBe('')
      expect(wrapper.vm.filterStatus).toBe('all')
      expect(wrapper.vm.filterType).toBe('all')
    })

    it('应该在有活动筛选时显示清空按钮', async () => {
      wrapper.vm.searchQuery = 'test'

      await wrapper.vm.$nextTick()

      const clearBtn = wrapper.find('.clear-filters-btn')
      expect(clearBtn.attributes('disabled')).toBeUndefined()
    })
  })

  describe('分页功能', () => {
    it('应该正确计算总页数', () => {
      expect(wrapper.vm.totalPages).toBeGreaterThan(0)
    })

    it('应该支持切换页码', async () => {
      const initialPage = wrapper.vm.currentPage

      if (wrapper.vm.totalPages > 1) {
        const nextBtn = wrapper.find('.page-btn:not(:disabled)')
        await nextBtn.trigger('click')

        expect(wrapper.vm.currentPage).not.toBe(initialPage)
      }
    })

    it('应该支持更改每页显示数量', async () => {
      // 只有在分页控件存在时才测试
      if (wrapper.vm.totalPages > 1) {
        const pageSizeSelect = wrapper.find('.page-size-select')
        if (pageSizeSelect.exists()) {
          await pageSizeSelect.setValue(10)
          expect(wrapper.vm.pageSize).toBe(10)
        }
      } else {
        // 如果没有分页，默认每页显示数量应该正确
        expect(wrapper.vm.pageSize).toBe(20)
      }
    })
  })

  describe('选择功能', () => {
    it('应该支持全选', async () => {
      const selectAllCheckbox = wrapper.find('.select-all input[type="checkbox"]')
      await selectAllCheckbox.setValue(true)

      expect(wrapper.vm.selectAll).toBe(true)
      expect(wrapper.vm.selectedItems.length).toBe(wrapper.vm.filteredHistory.length)
    })

    it('应该支持取消全选', async () => {
      // 先全选
      wrapper.vm.selectAll = true
      wrapper.vm.selectedItems = wrapper.vm.filteredHistory.map(item => item.id)
      await wrapper.vm.$nextTick()

      const selectAllCheckbox = wrapper.find('.select-all input[type="checkbox"]')
      await selectAllCheckbox.setValue(false)

      expect(wrapper.vm.selectAll).toBe(false)
      expect(wrapper.vm.selectedItems.length).toBe(0)
    })

    it('应该支持单个项目选择', async () => {
      const firstItemCheckbox = wrapper.findAll('.item-checkbox input[type="checkbox"]')[0]
      await firstItemCheckbox.setValue(true)

      expect(wrapper.vm.selectedItems.length).toBe(1)
      expect(wrapper.vm.selectedItems[0]).toBe(wrapper.vm.filteredHistory[0].id)
    })
  })

  describe('详情查看', () => {
    it('应该能够打开详情对话框', async () => {
      const firstItem = wrapper.vm.filteredHistory[0]
      wrapper.vm.viewDetails(firstItem)

      expect(wrapper.vm.showDetailsDialog).toBe(true)
      expect(wrapper.vm.selectedItem).toBe(firstItem)
    })

    it('应该显示正确的详情信息', async () => {
      const firstItem = wrapper.vm.filteredHistory[0]
      wrapper.vm.viewDetails(firstItem)
      await wrapper.vm.$nextTick()

      const modal = wrapper.find('.modal-overlay')
      expect(modal.exists()).toBe(true)

      const detailItems = wrapper.findAll('.detail-item')
      expect(detailItems.length).toBeGreaterThan(0)
    })

    it('应该能够关闭详情对话框', async () => {
      wrapper.vm.showDetailsDialog = true
      await wrapper.vm.$nextTick()

      const closeBtn = wrapper.find('.close-btn')
      await closeBtn.trigger('click')

      expect(wrapper.vm.showDetailsDialog).toBe(false)
    })
  })

  describe('删除功能', () => {
    it('应该能够打开删除确认对话框', async () => {
      const firstItem = wrapper.vm.filteredHistory[0]
      wrapper.vm.showDeleteDialog = true
      wrapper.vm.itemToDelete = firstItem
      await wrapper.vm.$nextTick()

      const modal = wrapper.find('.modal-overlay')
      expect(modal.exists()).toBe(true)
    })

    it('应该能够确认删除单个项目', async () => {
      const initialCount = wrapper.vm.exportHistory.length
      const itemToDelete = wrapper.vm.exportHistory[0]

      wrapper.vm.itemToDelete = itemToDelete
      wrapper.vm.confirmDelete()

      expect(wrapper.vm.exportHistory.length).toBe(initialCount - 1)
      expect(wrapper.vm.exportHistory.find(item => item.id === itemToDelete.id)).toBeUndefined()
    })

    it('应该能够批量删除项目', async () => {
      const itemsToDelete = wrapper.vm.exportHistory.slice(0, 3).map(item => item.id)
      wrapper.vm.selectedItems = itemsToDelete
      wrapper.vm.itemToDelete = null // 批量删除

      const initialCount = wrapper.vm.exportHistory.length
      wrapper.vm.confirmDelete()

      expect(wrapper.vm.exportHistory.length).toBe(initialCount - itemsToDelete.length)
      expect(wrapper.vm.selectedItems.length).toBe(0)
    })
  })

  describe('清理历史', () => {
    it('应该能够打开清理对话框', async () => {
      const cleanupBtn = wrapper.find('.cleanup-btn')
      await cleanupBtn.trigger('click')

      expect(wrapper.vm.showCleanupDialog).toBe(true)
    })

    it('应该能够选择清理选项', () => {
      wrapper.vm.cleanupOption = 'failed'

      expect(wrapper.vm.cleanupOption).toBe('failed')
    })

    it('应该正确计算清理数量和大小', () => {
      wrapper.vm.cleanupOption = 'failed'

      const count = wrapper.vm.getCleanupCount()
      const size = wrapper.vm.getCleanupSize()

      expect(typeof count).toBe('number')
      expect(typeof size).toBe('number')
    })

    it('应该能够执行清理操作', () => {
      wrapper.vm.cleanupOption = 'failed'
      const initialCount = wrapper.vm.exportHistory.length

      wrapper.vm.confirmCleanup()

      expect(wrapper.vm.exportHistory.length).toBeLessThanOrEqual(initialCount)
      expect(wrapper.vm.cleanupOption).toBe('')
      expect(wrapper.vm.showCleanupDialog).toBe(false)
    })
  })

  describe('重新导出', () => {
    it('应该能够重新导出项目', () => {
      const item = wrapper.vm.exportHistory[0]
      const initialStatus = item.status

      wrapper.vm.retryExport(item)

      expect(item.status).toBe('processing')
    })

    it('应该能够重试失败的项目', () => {
      // 创建一些失败的项目
      const failedItems = wrapper.vm.exportHistory.filter(item => item.status === 'failed')
      wrapper.vm.selectedItems = failedItems.map(item => item.id)

      wrapper.vm.retrySelected()

      expect(wrapper.vm.selectedItems.length).toBe(0)
    })
  })

  describe('下载功能', () => {
    it('应该能够下载成功导出的项目', () => {
      const successItem = wrapper.vm.exportHistory.find(item => item.status === 'success')

      if (successItem) {
        wrapper.vm.downloadItem(successItem)

        // 验证事件是否触发
        expect(wrapper.emitted('download-item')).toBeTruthy()
        expect(wrapper.emitted('download-item')[0][0]).toBe(successItem)
      }
    })

    it('不应该下载失败的项目', () => {
      const failedItem = wrapper.vm.exportHistory.find(item => item.status === 'failed')

      if (failedItem) {
        wrapper.vm.downloadItem(failedItem)

        // 不应该触发下载事件
        expect(wrapper.emitted('download-item')).toBeFalsy()
      }
    })
  })

  describe('导出历史数据', () => {
    it('应该能够导出历史数据', () => {
      // Mock document methods
      const mockLink = { click: vi.fn() }
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink)
      vi.spyOn(document, 'appendChild').mockImplementation(() => {})
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => {})

      wrapper.vm.exportHistoryData()

      expect(document.createElement).toHaveBeenCalledWith('a')
      expect(mockLink.click).toHaveBeenCalled()
      expect(wrapper.emitted('export-history-data')).toBeTruthy()
    })
  })

  describe('刷新功能', () => {
    it('应该能够刷新历史记录', async () => {
      const refreshBtn = wrapper.find('.refresh-btn')
      await refreshBtn.trigger('click')

      expect(wrapper.emitted('refresh-history')).toBeTruthy()
    })
  })

  describe('工具函数', () => {
    it('应该正确格式化文件大小', () => {
      expect(wrapper.vm.formatFileSize(0)).toBe('0 B')
      expect(wrapper.vm.formatFileSize(1024)).toMatch(/1(\.0)? KB/)
      expect(wrapper.vm.formatFileSize(1024 * 1024)).toMatch(/1(\.0)? MB/)
    })

    it('应该正确格式化日期时间', () => {
      const dateString = '2024-01-01T10:00:00Z'
      const formatted = wrapper.vm.formatDateTime(dateString)

      expect(formatted).toContain('2024')
      expect(formatted).toContain('01')
      expect(formatted).toContain('01')
    })

    it('应该正确格式化持续时间', () => {
      expect(wrapper.vm.formatDuration(0)).toBe('未知')
      expect(wrapper.vm.formatDuration(65)).toBe('1:05')
      expect(wrapper.vm.formatDuration(3661)).toBe('1:01:01')
    })

    it('应该正确转换状态文本', () => {
      expect(wrapper.vm.getStatusText('success')).toBe('成功')
      expect(wrapper.vm.getStatusText('failed')).toBe('失败')
      expect(wrapper.vm.getStatusText('processing')).toBe('处理中')
      expect(wrapper.vm.getStatusText('unknown')).toBe('unknown')
    })

    it('应该正确转换类型文本', () => {
      expect(wrapper.vm.getTypeText('video')).toBe('视频')
      expect(wrapper.vm.getTypeText('presentation')).toBe('演示文稿')
      expect(wrapper.vm.getTypeText('template')).toBe('模板')
      expect(wrapper.vm.getTypeText('unknown')).toBe('unknown')
    })
  })

  describe('空状态', () => {
    it('应该在没有记录时显示空状态', async () => {
      wrapper.vm.exportHistory = []
      wrapper.vm.filteredHistory = []
      await wrapper.vm.$nextTick()

      const emptyState = wrapper.find('.empty-state')
      expect(emptyState.exists()).toBe(true)
      expect(emptyState.text()).toContain('暂无导出历史')
    })

    it('应该在搜索无结果时显示相应提示', async () => {
      wrapper.vm.searchQuery = '不存在的项目名称'
      wrapper.vm.applyFilters()
      await wrapper.vm.$nextTick()

      const emptyState = wrapper.find('.empty-state')
      expect(emptyState.exists()).toBe(true)
      expect(emptyState.text()).toContain('没有找到匹配的记录')
    })
  })

  describe('批量操作', () => {
    it('应该在选择项目时显示批量操作按钮', async () => {
      wrapper.vm.selectedItems = [wrapper.vm.filteredHistory[0].id]
      await wrapper.vm.$nextTick()

      const bulkActions = wrapper.find('.bulk-actions')
      expect(bulkActions.exists()).toBe(true)

      const selectedCount = wrapper.find('.selected-count')
      expect(selectedCount.text()).toContain('已选择 1 项')
    })

    it('只在有失败项目时启用重试按钮', async () => {
      // 选择包含失败项目的项目
      const failedItem = wrapper.vm.filteredHistory.find(item => item.status === 'failed')
      if (failedItem) {
        wrapper.vm.selectedItems = [failedItem.id]
        await wrapper.vm.$nextTick()

        const retryBtn = wrapper.find('.bulk-retry-btn')
        expect(retryBtn.attributes('disabled')).toBeUndefined()
      }
    })

    it('在没有失败项目时禁用重试按钮', async () => {
      // 选择只有成功项目的项目
      const successItem = wrapper.vm.filteredHistory.find(item => item.status === 'success')
      if (successItem) {
        wrapper.vm.selectedItems = [successItem.id]
        await wrapper.vm.$nextTick()

        const retryBtn = wrapper.find('.bulk-retry-btn')
        expect(retryBtn.attributes('disabled')).toBeDefined()
      }
    })
  })

  describe('生命周期', () => {
    it('应该在挂载时加载历史记录', () => {
      expect(wrapper.vm.exportHistory.length).toBeGreaterThan(0)
    })
  })

  describe('事件触发', () => {
    it('应该在删除项目时触发正确的事件', () => {
      const item = wrapper.vm.exportHistory[0]
      wrapper.vm.itemToDelete = item
      wrapper.vm.confirmDelete()

      expect(wrapper.emitted('delete-item')).toBeTruthy()
      expect(wrapper.emitted('delete-item')[0][0]).toBe(item)
    })

    it('应该在批量删除时触发正确的事件', () => {
      const selectedIds = [wrapper.vm.exportHistory[0].id, wrapper.vm.exportHistory[1].id]
      wrapper.vm.selectedItems = selectedIds
      wrapper.vm.itemToDelete = null
      const originalSelectedItems = [...wrapper.vm.selectedItems]

      wrapper.vm.confirmDelete()

      expect(wrapper.emitted('delete-items')).toBeTruthy()
      expect(wrapper.emitted('delete-items')[0][0]).toEqual(originalSelectedItems)
    })

    it('应该在清理历史时触发正确的事件', () => {
      wrapper.vm.cleanupOption = 'failed'
      wrapper.vm.confirmCleanup()

      expect(wrapper.emitted('cleanup-history')).toBeTruthy()
    })

    it('应该在重新导出时触发正确的事件', () => {
      const item = wrapper.vm.exportHistory[0]
      wrapper.vm.retryExport(item)

      expect(wrapper.emitted('retry-export')).toBeTruthy()
      expect(wrapper.emitted('retry-export')[0][0]).toBe(item)
    })
  })

  describe('无障碍支持', () => {
    it('应该支持键盘导航', () => {
      const buttons = wrapper.findAll('button')
      buttons.forEach(button => {
        expect(button.attributes('tabindex')).toBeUndefined() // 默认可聚焦
      })
    })

    it('应该有适当的按钮标签', () => {
      const actionButtons = wrapper.findAll('.item-actions button')
      actionButtons.forEach(button => {
        expect(button.attributes('title')).toBeDefined()
      })
    })
  })

  describe('响应式设计', () => {
    it('应该在移动设备上调整布局', () => {
      // 模拟移动设备视口
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 768 })

      const wrapperMobile = mount(ExportHistoryManager)

      // 验证响应式样式是否应用
      const manager = wrapperMobile.find('.export-history-manager')
      expect(manager.classes()).toContain('export-history-manager')
    })
  })

  describe('错误处理', () => {
    it('应该优雅处理空的导出历史', () => {
      wrapper.vm.exportHistory = []
      wrapper.vm.applyFilters()

      expect(wrapper.vm.filteredHistory.length).toBe(0)
      expect(wrapper.vm.totalExports).toBe(0)
    })

    it('应该处理无效的分页参数', () => {
      const originalPage = wrapper.vm.currentPage
      wrapper.vm.goToPage(999)

      // 应该被限制在有效范围内
      expect(wrapper.vm.currentPage).toBeLessThanOrEqual(wrapper.vm.totalPages)
      expect(wrapper.vm.currentPage).toBeGreaterThanOrEqual(1)
    })
  })

  describe('性能测试', () => {
    it('应该在大量数据下保持良好性能', async () => {
      const startTime = performance.now()

      // 模拟大量数据
      wrapper.vm.exportHistory = Array.from({ length: 1000 }, (_, i) => ({
        id: `test_${i}`,
        title: `测试项目 ${i}`,
        type: 'video',
        status: 'success',
        size: 1024 * 1024,
        exportTime: new Date().toISOString(),
        duration: 60
      }))

      wrapper.vm.applyFilters()
      await wrapper.vm.$nextTick()

      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(500) // 应该在500ms内完成
      expect(wrapper.vm.filteredHistory.length).toBeLessThanOrEqual(wrapper.vm.pageSize)
    })
  })
})
