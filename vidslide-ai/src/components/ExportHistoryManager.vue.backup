<template>
  <div class="export-history-manager">
    <div class="manager-header">
      <h3>导出历史管理</h3>
      <div class="header-stats">
        <div class="stat-item">
          <span class="stat-label">总记录:</span>
          <span class="stat-value">{{ totalExports }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">存储占用:</span>
          <span class="stat-value">{{ formatFileSize(totalStorageSize) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">成功率:</span>
          <span class="stat-value">{{ successRate }}%</span>
        </div>
      </div>
    </div>

    <div class="manager-toolbar">
      <div class="search-section">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="搜索导出记录..."
          class="search-input"
          @input="handleSearch"
        />
        <select v-model="filterStatus" @change="handleFilter" class="filter-select">
          <option value="all">全部状态</option>
          <option value="success">成功</option>
          <option value="failed">失败</option>
          <option value="processing">处理中</option>
        </select>
        <select v-model="filterType" @change="handleFilter" class="filter-select">
          <option value="all">全部类型</option>
          <option value="video">视频</option>
          <option value="presentation">演示文稿</option>
          <option value="template">模板</option>
        </select>
        <button class="clear-filters-btn" @click="clearFilters" :disabled="!hasActiveFilters">
          清空筛选
        </button>
      </div>

      <div class="action-buttons">
        <button class="refresh-btn" @click="refreshHistory">
          刷新
        </button>
        <button class="cleanup-btn" @click="showCleanupDialog = true" :disabled="totalExports === 0">
          清理历史
        </button>
        <button class="export-history-btn" @click="exportHistoryData">
          导出历史数据
        </button>
      </div>
    </div>

    <div class="history-list">
      <div class="list-header">
        <label class="select-all">
          <input
            type="checkbox"
            v-model="selectAll"
            @change="toggleSelectAll"
            :indeterminate="isIndeterminate"
          />
          <span>全选</span>
        </label>
        <div class="selected-count" v-if="selectedItems.length > 0">
          已选择 {{ selectedItems.length }} 项
        </div>
        <div class="bulk-actions" v-if="selectedItems.length > 0">
          <button class="bulk-delete-btn" @click="showDeleteDialog = true">
            批量删除
          </button>
          <button class="bulk-retry-btn" @click="retrySelected" :disabled="!hasFailedItems">
            重试失败项
          </button>
        </div>
      </div>

      <div class="list-items">
        <div
          v-for="item in filteredHistory"
          :key="item.id"
          class="history-item"
          :class="{ selected: selectedItems.includes(item.id) }"
        >
          <div class="item-checkbox">
            <input
              type="checkbox"
              :value="item.id"
              v-model="selectedItems"
            />
          </div>

          <div class="item-info">
            <div class="item-header">
              <div class="item-title">{{ item.title }}</div>
              <div class="item-status" :class="item.status">
                <span class="status-icon">
                  <span v-if="item.status === 'success'">✅</span>
                  <span v-else-if="item.status === 'failed'">❌</span>
                  <span v-else-if="item.status === 'processing'">⏳</span>
                  <span v-else>⏸️</span>
                </span>
                <span class="status-text">{{ getStatusText(item.status) }}</span>
              </div>
            </div>

            <div class="item-meta">
              <div class="meta-item">
                <span class="meta-label">类型:</span>
                <span class="meta-value">{{ getTypeText(item.type) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">大小:</span>
                <span class="meta-value">{{ formatFileSize(item.size) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">导出时间:</span>
                <span class="meta-value">{{ formatDateTime(item.exportTime) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">耗时:</span>
                <span class="meta-value">{{ formatDuration(item.duration) }}</span>
              </div>
            </div>

            <div class="item-details" v-if="item.errorMessage">
              <div class="error-message">
                <strong>错误信息:</strong> {{ item.errorMessage }}
              </div>
            </div>
          </div>

          <div class="item-actions">
            <button
              class="view-details-btn"
              @click="viewDetails(item)"
              title="查看详情"
            >
              📋
            </button>
            <button
              class="download-btn"
              @click="downloadItem(item)"
              :disabled="item.status !== 'success'"
              title="下载"
            >
              📥
            </button>
            <button
              class="retry-btn"
              @click="retryExport(item)"
              :disabled="item.status === 'processing'"
              title="重新导出"
            >
              🔄
            </button>
            <button
              class="delete-btn"
              @click="showDeleteDialog = true; itemToDelete = item"
              title="删除"
            >
              🗑️
            </button>
          </div>
        </div>

        <div v-if="filteredHistory.length === 0" class="empty-state">
          <div class="empty-icon">📭</div>
          <div class="empty-text">
            <p>{{ searchQuery || hasActiveFilters ? '没有找到匹配的记录' : '暂无导出历史' }}</p>
            <p v-if="searchQuery || hasActiveFilters">
              <button class="clear-search-btn" @click="clearFilters">清空搜索条件</button>
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="pagination" v-if="totalPages > 1">
      <button class="page-btn" @click="goToPage(1)" :disabled="currentPage === 1">
        首页
      </button>
      <button class="page-btn" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">
        上一页
      </button>

      <span class="page-info">
        第 {{ currentPage }} 页，共 {{ totalPages }} 页
      </span>

      <button class="page-btn" @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">
        下一页
      </button>
      <button class="page-btn" @click="goToPage(totalPages)" :disabled="currentPage === totalPages">
        末页
      </button>

      <select v-model="pageSize" @change="changePageSize" class="page-size-select">
        <option :value="10">10条/页</option>
        <option :value="20">20条/页</option>
        <option :value="50">50条/页</option>
        <option :value="100">100条/页</option>
      </select>
    </div>

    <!-- 详情查看对话框 -->
    <div v-if="showDetailsDialog" class="modal-overlay" @click="showDetailsDialog = false">
      <div class="modal-content details-modal" @click.stop>
        <div class="modal-header">
          <h4>导出详情</h4>
          <button class="close-btn" @click="showDetailsDialog = false">✕</button>
        </div>

        <div class="modal-body" v-if="selectedItem">
          <div class="detail-grid">
            <div class="detail-item">
              <label class="detail-label">标题:</label>
              <span class="detail-value">{{ selectedItem.title }}</span>
            </div>
            <div class="detail-item">
              <label class="detail-label">类型:</label>
              <span class="detail-value">{{ getTypeText(selectedItem.type) }}</span>
            </div>
            <div class="detail-item">
              <label class="detail-label">状态:</label>
              <span class="detail-value status" :class="selectedItem.status">
                {{ getStatusText(selectedItem.status) }}
              </span>
            </div>
            <div class="detail-item">
              <label class="detail-label">文件大小:</label>
              <span class="detail-value">{{ formatFileSize(selectedItem.size) }}</span>
            </div>
            <div class="detail-item">
              <label class="detail-label">导出时间:</label>
              <span class="detail-value">{{ formatDateTime(selectedItem.exportTime) }}</span>
            </div>
            <div class="detail-item">
              <label class="detail-label">耗时:</label>
              <span class="detail-value">{{ formatDuration(selectedItem.duration) }}</span>
            </div>
            <div class="detail-item" v-if="selectedItem.outputPath">
              <label class="detail-label">输出路径:</label>
              <span class="detail-value">{{ selectedItem.outputPath }}</span>
            </div>
            <div class="detail-item" v-if="selectedItem.format">
              <label class="detail-label">格式:</label>
              <span class="detail-value">{{ selectedItem.format }}</span>
            </div>
            <div class="detail-item" v-if="selectedItem.resolution">
              <label class="detail-label">分辨率:</label>
              <span class="detail-value">{{ selectedItem.resolution }}</span>
            </div>
            <div class="detail-item" v-if="selectedItem.settings">
              <label class="detail-label">导出设置:</label>
              <pre class="detail-value settings">{{ JSON.stringify(selectedItem.settings, null, 2) }}</pre>
            </div>
            <div class="detail-item full-width" v-if="selectedItem.errorMessage">
              <label class="detail-label">错误信息:</label>
              <div class="detail-value error-message">{{ selectedItem.errorMessage }}</div>
            </div>
            <div class="detail-item full-width" v-if="selectedItem.logs">
              <label class="detail-label">执行日志:</label>
              <pre class="detail-value logs">{{ selectedItem.logs }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <div v-if="showDeleteDialog" class="modal-overlay" @click="showDeleteDialog = false">
      <div class="modal-content confirm-modal" @click.stop>
        <div class="modal-header">
          <h4>确认删除</h4>
        </div>

        <div class="modal-body">
          <p>
            确定要删除{{ itemToDelete ? '这个导出记录' : `选中的 ${selectedItems.length} 个记录` }}吗？
          </p>
          <p class="warning-text">此操作不可撤销，已导出的文件不会被删除。</p>
        </div>

        <div class="modal-actions">
          <button class="cancel-btn" @click="showDeleteDialog = false">取消</button>
          <button class="delete-confirm-btn" @click="confirmDelete">
            确认删除
          </button>
        </div>
      </div>
    </div>

    <!-- 清理历史对话框 -->
    <div v-if="showCleanupDialog" class="modal-overlay" @click="showCleanupDialog = false">
      <div class="modal-content cleanup-modal" @click.stop>
        <div class="modal-header">
          <h4>清理导出历史</h4>
        </div>

        <div class="modal-body">
          <div class="cleanup-options">
            <label class="option-item">
              <input type="radio" v-model="cleanupOption" value="failed" />
              <span>仅删除失败的记录</span>
            </label>
            <label class="option-item">
              <input type="radio" v-model="cleanupOption" value="older" />
              <span>删除30天前的记录</span>
            </label>
            <label class="option-item">
              <input type="radio" v-model="cleanupOption" value="all" />
              <span>删除所有记录</span>
            </label>
          </div>

          <div class="cleanup-preview">
            <p>将删除 {{ getCleanupCount() }} 条记录，释放 {{ formatFileSize(getCleanupSize()) }} 存储空间。</p>
          </div>
        </div>

        <div class="modal-actions">
          <button class="cancel-btn" @click="showCleanupDialog = false">取消</button>
          <button class="cleanup-confirm-btn" @click="confirmCleanup" :disabled="!cleanupOption">
            确认清理
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

/**
 * 导出历史管理组件
 *
 * 功能特性：
 * - 导出记录列表展示和搜索过滤
 * - 批量操作（删除、重试失败项）
 * - 分页浏览和存储空间管理
 * - 导出详情查看和历史清理
 *
 * @emits download-item - 下载项目时触发
 * @emits retry-export - 重新导出时触发
 * @emits delete-item - 删除单个项目时触发
 * @emits delete-items - 批量删除时触发
 * @emits cleanup-history - 清理历史时触发
 * @emits refresh-history - 刷新历史时触发
 * @emits export-history-data - 导出历史数据时触发
 */

// ==================== 组件状态定义 ====================

/** 导出历史记录数组 */
const exportHistory = ref([])
const filteredHistory = ref([])
const selectedItems = ref([])
const selectAll = ref(false)
const isIndeterminate = ref(false)

/** 搜索和过滤状态 */
const searchQuery = ref('')
const filterStatus = ref('all')
const filterType = ref('all')
const currentPage = ref(1)
const pageSize = ref(20)

/** 对话框显示状态 */
const showDetailsDialog = ref(false)
const showDeleteDialog = ref(false)
const showCleanupDialog = ref(false)
const selectedItem = ref(null)
const itemToDelete = ref(null)
const cleanupOption = ref('')

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

const totalPages = computed(() => {
  return Math.ceil(filteredHistory.value.length / pageSize.value)
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

// ==================== 核心方法 ====================

/**
 * 加载导出历史记录
 * 从本地存储或API获取导出历史数据
 */
const loadExportHistory = () => {
  // 模拟从本地存储或API加载导出历史
  // 在实际应用中，这里会从IndexedDB或服务器API获取数据
  const mockHistory = generateMockHistory()
  exportHistory.value = mockHistory
  applyFilters()
}

/**
 * 生成模拟历史数据（开发阶段使用）
 * @returns {Array} 模拟的导出历史记录数组
 */
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
      size: Math.floor(Math.random() * 100) * 1024 * 1024, // 0-100MB
      exportTime: exportTime.toISOString(),
      duration: Math.floor(Math.random() * 300) + 10, // 10-310秒
      format: formats[Math.floor(Math.random() * formats.length)],
      resolution: ['1080p', '720p', '4K'][Math.floor(Math.random() * 3)],
      outputPath: `/exports/project_${i + 1}.${status === 'success' ? 'mp4' : 'tmp'}`,
      settings: {
        quality: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
        includeAudio: Math.random() > 0.5,
        watermark: Math.random() > 0.7
      },
      errorMessage: status === 'failed' ? '导出过程中发生未知错误，请重试' : null,
      logs: status === 'failed' ? '2024-01-01 10:00:00 - 开始导出\n2024-01-01 10:05:00 - 处理失败\n2024-01-01 10:05:01 - 导出取消' : null
    })
  }

  // 按导出时间倒序排序
  return history.sort((a, b) => new Date(b.exportTime) - new Date(a.exportTime))
}

/**
 * 应用搜索和过滤条件
 * 根据当前搜索查询、状态过滤、类型过滤和分页设置更新显示列表
 */
const applyFilters = () => {
  let filtered = [...exportHistory.value]

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query) ||
      (item.format && item.format.toLowerCase().includes(query))
    )
  }

  // 状态过滤
  if (filterStatus.value !== 'all') {
    filtered = filtered.filter(item => item.status === filterStatus.value)
  }

  // 类型过滤
  if (filterType.value !== 'all') {
    filtered = filtered.filter(item => item.type === filterType.value)
  }

  // 分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  filteredHistory.value = filtered.slice(start, end)
}

const handleSearch = () => {
  currentPage.value = 1
  applyFilters()
}

const handleFilter = () => {
  currentPage.value = 1
  applyFilters()
}

const clearFilters = () => {
  searchQuery.value = ''
  filterStatus.value = 'all'
  filterType.value = 'all'
  currentPage.value = 1
  applyFilters()
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedItems.value = filteredHistory.value.map(item => item.id)
  } else {
    selectedItems.value = []
  }
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    applyFilters()
  }
}

const changePageSize = () => {
  currentPage.value = 1
  applyFilters()
}

const viewDetails = (item) => {
  selectedItem.value = item
  showDetailsDialog.value = true
}

const downloadItem = (item) => {
  if (item.status === 'success' && item.outputPath) {
    // 模拟下载
    console.log('Downloading:', item.outputPath)
    emit('download-item', item)
  }
}

const retryExport = (item) => {
  // 模拟重新导出
  item.status = 'processing'
  emit('retry-export', item)

  // 模拟导出过程
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

const confirmDelete = () => {
  if (itemToDelete.value) {
    // 删除单个项目
    const index = exportHistory.value.findIndex(item => item.id === itemToDelete.value.id)
    if (index > -1) {
      exportHistory.value.splice(index, 1)
    }
    emit('delete-item', itemToDelete.value)
  } else {
    // 批量删除
    exportHistory.value = exportHistory.value.filter(item => !selectedItems.value.includes(item.id))
    emit('delete-items', selectedItems.value)
  }

  selectedItems.value = []
  itemToDelete.value = null
  showDeleteDialog.value = false
  applyFilters()
}

const getCleanupCount = () => {
  if (!cleanupOption.value) return 0

  let itemsToDelete = []
  const now = new Date()

  switch (cleanupOption.value) {
    case 'failed':
      itemsToDelete = exportHistory.value.filter(item => item.status === 'failed')
      break
    case 'older':
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      itemsToDelete = exportHistory.value.filter(item => new Date(item.exportTime) < thirtyDaysAgo)
      break
    case 'all':
      itemsToDelete = [...exportHistory.value]
      break
  }

  return itemsToDelete.length
}

const getCleanupSize = () => {
  if (!cleanupOption.value) return 0

  let itemsToDelete = []
  const now = new Date()

  switch (cleanupOption.value) {
    case 'failed':
      itemsToDelete = exportHistory.value.filter(item => item.status === 'failed')
      break
    case 'older':
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      itemsToDelete = exportHistory.value.filter(item => new Date(item.exportTime) < thirtyDaysAgo)
      break
    case 'all':
      itemsToDelete = [...exportHistory.value]
      break
  }

  return itemsToDelete.reduce((total, item) => total + (item.size || 0), 0)
}

const confirmCleanup = () => {
  let itemsToDelete = []
  const now = new Date()

  switch (cleanupOption.value) {
    case 'failed':
      itemsToDelete = exportHistory.value.filter(item => item.status === 'failed')
      break
    case 'older':
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      itemsToDelete = exportHistory.value.filter(item => new Date(item.exportTime) < thirtyDaysAgo)
      break
    case 'all':
      itemsToDelete = [...exportHistory.value]
      break
  }

  const deleteIds = itemsToDelete.map(item => item.id)
  exportHistory.value = exportHistory.value.filter(item => !deleteIds.includes(item.id))

  emit('cleanup-history', { option: cleanupOption.value, deletedCount: itemsToDelete.length, deletedSize: getCleanupSize() })

  cleanupOption.value = ''
  showCleanupDialog.value = false
  applyFilters()
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

// ==================== 工具函数 ====================

/**
 * 格式化文件大小显示
 * @param {number} bytes - 文件大小（字节）
 * @returns {string} 格式化的文件大小字符串
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

/**
 * 格式化日期时间显示
 * @param {string} dateString - ISO日期字符串
 * @returns {string} 格式化的日期时间字符串
 */
const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

/**
 * 格式化持续时间显示
 * @param {number} seconds - 持续时间（秒）
 * @returns {string} 格式化的持续时间字符串
 */
const formatDuration = (seconds) => {
  if (!seconds) return '未知'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }
}

const getStatusText = (status) => {
  const statusMap = {
    success: '成功',
    failed: '失败',
    processing: '处理中',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

const getTypeText = (type) => {
  const typeMap = {
    video: '视频',
    presentation: '演示文稿',
    template: '模板'
  }
  return typeMap[type] || type
}

// 监听选择变化
watch(selectedItems, () => {
  const currentPageItems = filteredHistory.value.map(item => item.id)
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

// 生命周期
onMounted(() => {
  loadExportHistory()
})

// 事件定义
const emit = defineEmits([
  'download-item',
  'retry-export',
  'delete-item',
  'delete-items',
  'cleanup-history',
  'refresh-history',
  'export-history-data'
])
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

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.manager-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
}

.header-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #86868b;
  font-weight: 500;
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: #1d1d1f;
}

.manager-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
}

.search-section {
  display: flex;
  gap: 12px;
  align-items: center;
  flex: 1;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  background: white;
  font-size: 14px;
  flex: 1;
  min-width: 200px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  background: white;
  font-size: 14px;
  min-width: 120px;
}

.clear-filters-btn {
  padding: 8px 16px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  background: white;
  color: #1d1d1f;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.clear-filters-btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.05);
}

.clear-filters-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.refresh-btn,
.cleanup-btn,
.export-history-btn {
  padding: 8px 16px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  background: white;
  color: #1d1d1f;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  background: rgba(0, 122, 255, 0.1);
  border-color: #007aff;
}

.cleanup-btn:hover:not(:disabled) {
  background: rgba(255, 193, 7, 0.1);
  border-color: #ffc107;
}

.cleanup-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.export-history-btn:hover {
  background: rgba(52, 199, 89, 0.1);
  border-color: #34c759;
}

.history-list {
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.select-all {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
}

.select-all input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #007aff;
}

.selected-count {
  font-size: 14px;
  color: #007aff;
  font-weight: 500;
}

.bulk-actions {
  display: flex;
  gap: 8px;
}

.bulk-delete-btn,
.bulk-retry-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.bulk-delete-btn {
  background: #ff3b30;
  color: white;
}

.bulk-delete-btn:hover {
  background: #d63027;
}

.bulk-retry-btn {
  background: #007aff;
  color: white;
}

.bulk-retry-btn:hover:not(:disabled) {
  background: #0056cc;
}

.bulk-retry-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.list-items {
  max-height: 600px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: background-color 0.2s ease;
}

.history-item:hover {
  background: rgba(0, 122, 255, 0.02);
}

.history-item.selected {
  background: rgba(0, 122, 255, 0.05);
}

.item-checkbox {
  margin-right: 16px;
}

.item-checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #007aff;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
}

.item-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.item-status.success {
  background: rgba(52, 199, 89, 0.1);
  color: #34c759;
}

.item-status.failed {
  background: rgba(255, 59, 48, 0.1);
  color: #ff3b30;
}

.item-status.processing {
  background: rgba(0, 122, 255, 0.1);
  color: #007aff;
}

.item-status.cancelled {
  background: rgba(142, 142, 147, 0.1);
  color: #8e8e93;
}

.item-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  gap: 4px;
  font-size: 12px;
  color: #86868b;
}

.meta-label {
  font-weight: 500;
}

.item-details {
  margin-top: 8px;
}

.error-message {
  padding: 8px;
  background: rgba(255, 59, 48, 0.05);
  border-left: 3px solid #ff3b30;
  border-radius: 4px;
  font-size: 12px;
  color: #ff3b30;
}

.item-actions {
  display: flex;
  gap: 8px;
  margin-left: 16px;
}

.view-details-btn,
.download-btn,
.retry-btn,
.delete-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.05);
  color: #1d1d1f;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s ease;
}

.view-details-btn:hover {
  background: rgba(0, 122, 255, 0.1);
  color: #007aff;
}

.download-btn:hover:not(:disabled) {
  background: rgba(52, 199, 89, 0.1);
  color: #34c759;
}

.download-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.retry-btn:hover:not(:disabled) {
  background: rgba(0, 122, 255, 0.1);
  color: #007aff;
}

.retry-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.delete-btn:hover {
  background: rgba(255, 59, 48, 0.1);
  color: #ff3b30;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  opacity: 0.5;
  margin-bottom: 16px;
}

.empty-text p {
  margin: 8px 0;
  color: #86868b;
}

.clear-search-btn {
  background: none;
  border: none;
  color: #007aff;
  cursor: pointer;
  text-decoration: underline;
  font-size: inherit;
}

.clear-search-btn:hover {
  color: #0056cc;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
  padding: 16px 0;
}

.page-btn {
  padding: 8px 12px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  background: white;
  color: #1d1d1f;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: rgba(0, 122, 255, 0.1);
  border-color: #007aff;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #86868b;
  margin: 0 16px;
}

.page-size-select {
  padding: 6px 8px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  background: white;
  font-size: 12px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.details-modal {
  max-width: 700px;
}

.confirm-modal {
  max-width: 400px;
}

.cleanup-modal {
  max-width: 500px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.modal-header h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #86868b;
}

.close-btn:hover {
  color: #1d1d1f;
}

.modal-body {
  padding: 24px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-label {
  font-size: 12px;
  font-weight: 600;
  color: #86868b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 14px;
  color: #1d1d1f;
  word-break: break-word;
}

.detail-value.status {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  width: fit-content;
}

.detail-value.status.success {
  background: rgba(52, 199, 89, 0.1);
  color: #34c759;
}

.detail-value.status.failed {
  background: rgba(255, 59, 48, 0.1);
  color: #ff3b30;
}

.detail-value.status.processing {
  background: rgba(0, 122, 255, 0.1);
  color: #007aff;
}

.detail-value.settings,
.detail-value.logs {
  background: rgba(0, 0, 0, 0.05);
  padding: 12px;
  border-radius: 6px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  white-space: pre-wrap;
  max-height: 200px;
  overflow-y: auto;
}

.error-message {
  background: rgba(255, 59, 48, 0.05);
  border-left: 3px solid #ff3b30;
  padding: 12px;
  border-radius: 4px;
  color: #ff3b30;
}

.cleanup-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-item input[type="radio"] {
  width: 16px;
  height: 16px;
  accent-color: #007aff;
}

.option-item span {
  font-size: 14px;
  color: #1d1d1f;
}

.cleanup-preview {
  padding: 16px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  margin-bottom: 20px;
}

.cleanup-preview p {
  margin: 0;
  font-size: 14px;
  color: #1d1d1f;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.cancel-btn {
  padding: 8px 16px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  background: white;
  color: #1d1d1f;
  cursor: pointer;
  font-size: 14px;
}

.cancel-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.delete-confirm-btn,
.cleanup-confirm-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #ff3b30;
  color: white;
  cursor: pointer;
  font-size: 14px;
}

.delete-confirm-btn:hover,
.cleanup-confirm-btn:hover:not(:disabled) {
  background: #d63027;
}

.cleanup-confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 无障碍支持 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .export-history-manager {
    padding: 16px;
    max-width: none;
  }

  .manager-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .header-stats {
    flex-wrap: wrap;
    gap: 16px;
  }

  .manager-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .search-section {
    flex-direction: column;
    gap: 8px;
  }

  .action-buttons {
    justify-content: center;
  }

  .history-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .item-actions {
    align-self: flex-end;
    margin-left: 0;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .pagination {
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>