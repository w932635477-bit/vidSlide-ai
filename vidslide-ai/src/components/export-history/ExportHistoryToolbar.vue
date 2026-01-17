<template>
  <div class="manager-toolbar">
    <div class="search-section">
      <input
        type="text"
        :value="searchQuery"
        @input="$emit('update:searchQuery', $event.target.value)"
        placeholder="搜索导出记录..."
        class="search-input"
      />
      <select :value="filterStatus" @change="$emit('update:filterStatus', $event.target.value)" class="filter-select">
        <option value="all">全部状态</option>
        <option value="success">成功</option>
        <option value="failed">失败</option>
        <option value="processing">处理中</option>
      </select>
      <select :value="filterType" @change="$emit('update:filterType', $event.target.value)" class="filter-select">
        <option value="all">全部类型</option>
        <option value="video">视频</option>
        <option value="presentation">演示文稿</option>
        <option value="template">模板</option>
      </select>
      <button class="clear-filters-btn" @click="$emit('clear-filters')" :disabled="!hasActiveFilters">
        清空筛选
      </button>
    </div>

    <div class="action-buttons">
      <button class="refresh-btn" @click="$emit('refresh')">
        刷新
      </button>
      <button class="cleanup-btn" @click="$emit('show-cleanup')" :disabled="totalExports === 0">
        清理历史
      </button>
      <button class="export-history-btn" @click="$emit('export-data')">
        导出历史数据
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  searchQuery: { type: String, default: '' },
  filterStatus: { type: String, default: 'all' },
  filterType: { type: String, default: 'all' },
  hasActiveFilters: { type: Boolean, default: false },
  totalExports: { type: Number, default: 0 }
})

defineEmits([
  'update:searchQuery',
  'update:filterStatus',
  'update:filterType',
  'clear-filters',
  'refresh',
  'show-cleanup',
  'export-data'
])
</script>

<style scoped>
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

@media (max-width: 768px) {
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
}
</style>
