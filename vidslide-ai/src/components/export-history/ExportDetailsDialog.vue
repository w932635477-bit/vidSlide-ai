<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content details-modal" @click.stop>
      <div class="modal-header">
        <h4>导出详情</h4>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div v-if="item" class="modal-body">
        <div class="detail-grid">
          <div class="detail-item">
            <label class="detail-label">标题:</label>
            <span class="detail-value">{{ item.title }}</span>
          </div>
          <div class="detail-item">
            <label class="detail-label">类型:</label>
            <span class="detail-value">{{ typeText }}</span>
          </div>
          <div class="detail-item">
            <label class="detail-label">状态:</label>
            <span class="detail-value status" :class="item.status">
              {{ statusText }}
            </span>
          </div>
          <div class="detail-item">
            <label class="detail-label">文件大小:</label>
            <span class="detail-value">{{ formattedSize }}</span>
          </div>
          <div class="detail-item">
            <label class="detail-label">导出时间:</label>
            <span class="detail-value">{{ formattedDateTime }}</span>
          </div>
          <div class="detail-item">
            <label class="detail-label">耗时:</label>
            <span class="detail-value">{{ formattedDuration }}</span>
          </div>
          <div v-if="item.outputPath" class="detail-item">
            <label class="detail-label">输出路径:</label>
            <span class="detail-value">{{ item.outputPath }}</span>
          </div>
          <div v-if="item.format" class="detail-item">
            <label class="detail-label">格式:</label>
            <span class="detail-value">{{ item.format }}</span>
          </div>
          <div v-if="item.resolution" class="detail-item">
            <label class="detail-label">分辨率:</label>
            <span class="detail-value">{{ item.resolution }}</span>
          </div>
          <div v-if="item.settings" class="detail-item">
            <label class="detail-label">导出设置:</label>
            <pre class="detail-value settings">{{ JSON.stringify(item.settings, null, 2) }}</pre>
          </div>
          <div v-if="item.errorMessage" class="detail-item full-width">
            <label class="detail-label">错误信息:</label>
            <div class="detail-value error-message">{{ item.errorMessage }}</div>
          </div>
          <div v-if="item.logs" class="detail-item full-width">
            <label class="detail-label">执行日志:</label>
            <pre class="detail-value logs">{{ item.logs }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  item: { type: Object, default: null }
})

defineEmits(['close'])

const statusText = computed(() => {
  if (!props.item) return ''
  const statusMap = {
    success: '成功',
    failed: '失败',
    processing: '处理中',
    cancelled: '已取消'
  }
  return statusMap[props.item.status] || props.item.status
})

const typeText = computed(() => {
  if (!props.item) return ''
  const typeMap = {
    video: '视频',
    presentation: '演示文稿',
    template: '模板'
  }
  return typeMap[props.item.type] || props.item.type
})

const formattedSize = computed(() => {
  if (!props.item) return ''
  const bytes = props.item.size || 0
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
})

const formattedDateTime = computed(() => {
  if (!props.item) return ''
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
  if (!props.item) return ''
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
  max-width: 700px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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

@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
