<template>
  <div class="history-item" :class="{ selected: isSelected }">
    <div class="item-checkbox">
      <input type="checkbox" :checked="isSelected" @change="$emit('toggle-select', item.id)" />
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
          <span class="status-text">{{ statusText }}</span>
        </div>
      </div>

      <div class="item-meta">
        <div class="meta-item">
          <span class="meta-label">类型:</span>
          <span class="meta-value">{{ typeText }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">大小:</span>
          <span class="meta-value">{{ formattedSize }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">导出时间:</span>
          <span class="meta-value">{{ formattedDateTime }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">耗时:</span>
          <span class="meta-value">{{ formattedDuration }}</span>
        </div>
      </div>

      <div v-if="item.errorMessage" class="item-details">
        <div class="error-message"><strong>错误信息:</strong> {{ item.errorMessage }}</div>
      </div>
    </div>

    <div class="item-actions">
      <button class="view-details-btn" title="查看详情" @click="$emit('view-details', item)">
        📋
      </button>
      <button
        class="download-btn"
        :disabled="item.status !== 'success'"
        title="下载"
        @click="$emit('download', item)"
      >
        📥
      </button>
      <button
        class="retry-btn"
        :disabled="item.status === 'processing'"
        title="重新导出"
        @click="$emit('retry', item)"
      >
        🔄
      </button>
      <button class="delete-btn" title="删除" @click="$emit('delete', item)">🗑️</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  item: { type: Object, required: true },
  isSelected: { type: Boolean, default: false }
})

defineEmits(['toggle-select', 'view-details', 'download', 'retry', 'delete'])

const statusText = computed(() => {
  const statusMap = {
    success: '成功',
    failed: '失败',
    processing: '处理中',
    cancelled: '已取消'
  }
  return statusMap[props.item.status] || props.item.status
})

const typeText = computed(() => {
  const typeMap = {
    video: '视频',
    presentation: '演示文稿',
    template: '模板'
  }
  return typeMap[props.item.type] || props.item.type
})

const formattedSize = computed(() => {
  const bytes = props.item.size || 0
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
})

const formattedDateTime = computed(() => {
  const date = new Date(props.item.exportTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
})

const formattedDuration = computed(() => {
  const seconds = props.item.duration
  if (!seconds) return '未知'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }
})
</script>

<style scoped>
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

.item-checkbox input[type='checkbox'] {
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

@media (max-width: 768px) {
  .history-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .item-actions {
    align-self: flex-end;
    margin-left: 0;
  }
}
</style>
