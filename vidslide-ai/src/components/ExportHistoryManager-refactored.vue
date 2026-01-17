<template>
  <div class="export-history-manager">
    <!-- 头部统计 -->
    <ExportHistoryHeader
      :total-exports="totalExports"
      :total-storage-size="totalStorageSize"
      :success-rate="successRate"
    />

    <!-- 工具栏 -->
    <ExportHistoryToolbar
      v-model:search-query="searchQuery"
      v-model:filter-status="filterStatus"
      v-model:filter-type="filterType"
      :has-active-filters="hasActiveFilters"
      :total-exports="totalExports"
      @clear-filters="clearFilters"
      @refresh="refreshHistory"
      @show-cleanup="showCleanupDialog = true"
      @export-data="exportHistoryData"
    />

    <!-- 历史列表 -->
    <ExportHistoryList
      :items="paginatedHistory"
      :selected-items="selectedItems"
      :select-all="selectAll"
      :is-indeterminate="isIndeterminate"
      :selected-count="selectedItems.length"
      :has-failed-items="hasFailedItems"
      :has-active-filters="hasActiveFilters"
      @toggle-select-all="toggleSelectAll"
      @toggle-select="toggleSelect"
      @bulk-delete="showBulkDeleteDialog"
      @bulk-retry="retrySelected"
      @view-details="viewDetails"
      @download="downloadItem"
      @retry="retryExport"
      @delete="showSingleDeleteDialog"
      @clear-filters="clearFilters"
    />

    <!-- 分页 -->
    <ExportHistoryPagination
      :current-page="currentPage"
      :total-pages="totalPages"
      :page-size="pageSize"
      @go-to-page="goToPage"
      @change-page-size="changePageSize"
    />

    <!-- 详情对话框 -->
    <ExportDetailsDialog
      :show="showDetailsDialog"
      :item="selectedItem"
      @close="showDetailsDialog = false"
    />

    <!-- 删除确认对话框 -->
    <DeleteConfirmDialog
      :show="showDeleteDialog"
      :is-bulk-delete="!itemToDelete"
      :selected-count="selectedItems.length"
      @close="closeDeleteDialog"
      @confirm="confirmDelete"
    />

    <!-- 清理对话框 -->
    <CleanupDialog
      :show="showCleanupDialog"
      :history="exportHistory"
      @close="showCleanupDialog = false"
      @confirm="confirmCleanup"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import ExportHistoryHeader from './export-history/ExportHistoryHeader.vue'
import ExportHistoryToolbar from './export-history/ExportHistoryToolbar.vue'
import ExportHistoryList from './export-history/ExportHistoryList.vue'
import ExportHistoryPagination from './export-history/ExportHistoryPagination.vue'
import ExportDetailsDialog from './export-history/ExportDetailsDialog.vue'
import DeleteConfirmDialog from './export-history/DeleteConfirmDialog.vue'
import CleanupDialog from './export-history/CleanupDialog.vue'

/**
 * 导出历史管理组件（重构版）
 * 功能：导出记录列表、搜索过滤、批量操作、分页、历史清理
 */

const emit = defineEmits([
  'download-item',
  'retry-export',
  'delete-item',
  'delete-items',
  'cleanup-history',
  'refresh-history',
  'export-history-data'
])

// 状态
const exportHistory = ref([])
const selectedItems = ref([])
const selectAll = ref(false)
const isIndeterminate = ref(false)

// 搜索和过滤
const searchQuery = ref('')
const filterStatus = ref('all')
const filterType = ref('all')
const currentPage = ref(1)
const pageSize = ref(20)

// 对话框状态
const showDetailsDialog = ref(false)
const showDeleteDialog = ref(false)
const showCleanupDialog = ref(false)
const selectedItem = ref(null)
const itemToDelete = ref(null)

// 计算属性
const totalExports = computed(() => exportHistory.value.length)

const totalStorageSize = computed(() => {
  return exportHistory.value.reduce((total, item) => total + (item.size || 0), 0)
})

const successRate = computed(() => {
  if (totalExports.value === 0) return 0
  const successCount = exportHistory.value.filter(item => item.status === 'success').length
  return Math.round((successCount / totalExports.value) * 100)
})

const filteredHistory = computed(() => {
  let filtered = [...exportHistory.value]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query) ||
      (item.format && item.format.toLowerCase().includes(query))
    )
  }

  if (filterStatus.value !== 'all') {
    filtered = filtered.filter(item => item.status === filterStatus.value)
  }

  if (filterType.value !== 'all') {
    filtered = filtered.filter(item => item.type === filterType.value)
  }

  return filtered
})

const totalPages = computed(() => {
  return Math.ceil(filteredHistory.value.length / pageSize.value)
})

const paginatedHistory = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredHistory.value.slice(start, end)
})

const hasActiveFilters = computed(() => {
  return searchQuery.value || filterStatus.value !== 'all' || filterType.value !== 'all'
})

const hasFailedItems = computed(() => {
  return selectedItems.value.some(id => {
    const item = exportHistory.value.find(item => item.id === id)
    return item && item.status === 'failed'
  })
})

// 方法
const loadExportHistory = () => {
  const mockHistory = generateMockHistory()
  exportHistory.value = mockHistory
}

const generateMockHistory = () => {
  const types = ['video', 'presentation', 'template']
  const statuses = ['success', 'failed', 'processing', 'cancelled']
  const formats = ['MP4', 'PDF', 'JSON', 'PPTX']

  const history = []
  for (let i = 0; i < 50; i++) {
    const exportTime = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    const status = statuses[Math.floor(Math.random() * statuses.length)]

    history.push({
      id: `export_${i + 1}`,
      title: `导出项目 ${i + 1}`,
      type: types[Math.floor(Math.random() * types.length)],
      status: status,
      size: Math.floor(Math.random() * 100) * 1024 * 1024,
      exportTime: exportTime.toISOString(),
      duration: Math.floor(Math.random() * 300) + 10,
      format: formats[Math.floor(Math.random() * formats.length)],
      resolution: ['1080p', '720p', '4K'][Math.floor(Math.random() * 3)],
      outputPath: `/exports/project_${i + 1}.${status === 'success' ? 'mp4' : 'tmp'}`,
      settings: {
        quality: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
        includeAudio: Math.random() > 0.5,
        watermark: Math.random() > 0.7
      },
      errorMessage: status === 'failed' ? '导出过程中发生未知错误，请重试' : null,
      logs: status === 'failed' ? '2024-01-01 10:00:00 - 开始导出\n2024-01-01 10:05:00 - 处理失败' : null
    })
  }

  return history.sort((a, b) => new Date(b.exportTime) - new Date(a.exportTime))
}

const clearFilters = () => {
  searchQuery.value = ''
  filterStatus.value = 'all'
  filterType.value = 'all'
  currentPage.value = 1
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedItems.value = []
    selectAll.value = false
  } else {
    selectedItems.value = paginatedHistory.value.map(item => item.id)
    selectAll.value = true
  }
}

const toggleSelect = (id) => {
  const index = selectedItems.value.indexOf(id)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  } else {
    selectedItems.value.push(id)
  }
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const changePageSize = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const viewDetails = (item) => {
  selectedItem.value = item
  showDetailsDialog.value = true
}

const downloadItem = (item) => {
  if (item.status === 'success' && item.outputPath) {
    emit('download-item', item)
  }
}

const retryExport = (item) => {
  item.status = 'processing'
  emit('retry-export', item)

  setTimeout(() => {
    item.status = Math.random() > 0.3 ? 'success' : 'failed'
    item.exportTime = new Date().toISOString()
    item.duration = Math.floor(Math.random() * 300) + 10
    if (item.status === 'failed') {
      item.errorMessage = '重新导出失败，请检查设置'
    }
  }, 2000)
}

const retrySelected = () => {
  const failedItems = exportHistory.value.filter(item =>
    selectedItems.value.includes(item.id) && item.status === 'failed'
  )
  failedItems.forEach(item => retryExport(item))
  selectedItems.value = []
}

const showSingleDeleteDialog = (item) => {
  itemToDelete.value = item
  showDeleteDialog.value = true
}

const showBulkDeleteDialog = () => {
  itemToDelete.value = null
  showDeleteDialog.value = true
}

const closeDeleteDialog = () => {
  showDeleteDialog.value = false
  itemToDelete.value = null
}

const confirmDelete = () => {
  if (itemToDelete.value) {
    const index = exportHistory.value.findIndex(item => item.id === itemToDelete.value.id)
    if (index > -1) {
      exportHistory.value.splice(index, 1)
    }
    emit('delete-item', itemToDelete.value)
  } else {
    exportHistory.value = exportHistory.value.filter(item => !selectedItems.value.includes(item.id))
    emit('delete-items', selectedItems.value)
  }

  selectedItems.value = []
  closeDeleteDialog()
}

const confirmCleanup = ({ option, count, size }) => {
  const now = new Date()
  let deleteIds = []

  switch (option) {
    case 'failed':
      deleteIds = exportHistory.value.filter(item => item.status === 'failed').map(item => item.id)
      break
    case 'older':
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      deleteIds = exportHistory.value.filter(item => new Date(item.exportTime) < thirtyDaysAgo).map(item => item.id)
      break
    case 'all':
      deleteIds = exportHistory.value.map(item => item.id)
      break
  }

  exportHistory.value = exportHistory.value.filter(item => !deleteIds.includes(item.id))
  emit('cleanup-history', { option, deletedCount: count, deletedSize: size })
  showCleanupDialog.value = false
}

const refreshHistory = () => {
  loadExportHistory()
  emit('refresh-history')
}

const exportHistoryData = () => {
  const historyData = {
    exportTime: new Date().toISOString(),
    totalRecords: exportHistory.value.length,
    successRate: successRate.value,
    totalSize: totalStorageSize.value,
    records: exportHistory.value
  }

  const jsonData = JSON.stringify(historyData, null, 2)
  const blob = new Blob([jsonData], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `export-history-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  emit('export-history-data', historyData)
}

// 监听选择变化
watch(selectedItems, () => {
  const currentPageItems = paginatedHistory.value.map(item => item.id)
  const selectedInCurrentPage = selectedItems.value.filter(id => currentPageItems.includes(id))

  if (selectedInCurrentPage.length === 0) {
    selectAll.value = false
    isIndeterminate.value = false
  } else if (selectedInCurrentPage.length === currentPageItems.length) {
    selectAll.value = true
    isIndeterminate.value = false
  } else {
    selectAll.value = false
    isIndeterminate.value = true
  }
})

// 监听过滤条件变化
watch([searchQuery, filterStatus, filterType], () => {
  currentPage.value = 1
})

onMounted(() => {
  loadExportHistory()
})
</script>

<style scoped>
.export-history-manager {
  padding: 24px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  max-width: 1200px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

@media (max-width: 768px) {
  .export-history-manager {
    padding: 16px;
    max-width: none;
  }
}
</style>
