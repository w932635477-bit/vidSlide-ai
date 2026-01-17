<template>
  <div class="history-list">
    <div class="list-header">
      <label class="select-all">
        <input
          type="checkbox"
          :checked="selectAll"
          @change="$emit('toggle-select-all')"
          :indeterminate="isIndeterminate"
        />
        <span>全选</span>
      </label>
      <div class="selected-count" v-if="selectedCount > 0">
        已选择 {{ selectedCount }} 项
      </div>
      <div class="bulk-actions" v-if="selectedCount > 0">
        <button class="bulk-delete-btn" @click="$emit('bulk-delete')">
          批量删除
        </button>
        <button class="bulk-retry-btn" @click="$emit('bulk-retry')" :disabled="!hasFailedItems">
          重试失败项
        </button>
      </div>
    </div>

    <div class="list-items">
      <ExportHistoryItem
        v-for="item in items"
        :key="item.id"
        :item="item"
        :is-selected="selectedItems.includes(item.id)"
        @toggle-select="$emit('toggle-select', $event)"
        @view-details="$emit('view-details', $event)"
        @download="$emit('download', $event)"
        @retry="$emit('retry', $event)"
        @delete="$emit('delete', $event)"
      />

      <div v-if="items.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <div class="empty-text">
          <p>{{ hasActiveFilters ? '没有找到匹配的记录' : '暂无导出历史' }}</p>
          <p v-if="hasActiveFilters">
            <button class="clear-search-btn" @click="$emit('clear-filters')">清空搜索条件</button>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import ExportHistoryItem from './ExportHistoryItem.vue'

defineProps({
  items: { type: Array, default: () => [] },
  selectedItems: { type: Array, default: () => [] },
  selectAll: { type: Boolean, default: false },
  isIndeterminate: { type: Boolean, default: false },
  selectedCount: { type: Number, default: 0 },
  hasFailedItems: { type: Boolean, default: false },
  hasActiveFilters: { type: Boolean, default: false }
})

defineEmits([
  'toggle-select-all',
  'toggle-select',
  'bulk-delete',
  'bulk-retry',
  'view-details',
  'download',
  'retry',
  'delete',
  'clear-filters'
])
</script>

<style scoped>
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
</style>
