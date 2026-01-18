<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content cleanup-modal" @click.stop>
      <div class="modal-header">
        <h4>清理导出历史</h4>
      </div>

      <div class="modal-body">
        <div class="cleanup-options">
          <label class="option-item">
            <input v-model="selectedOption" type="radio" :value="'failed'" />
            <span>仅删除失败的记录</span>
          </label>
          <label class="option-item">
            <input v-model="selectedOption" type="radio" :value="'older'" />
            <span>删除30天前的记录</span>
          </label>
          <label class="option-item">
            <input v-model="selectedOption" type="radio" :value="'all'" />
            <span>删除所有记录</span>
          </label>
        </div>

        <div class="cleanup-preview">
          <p>将删除 {{ cleanupCount }} 条记录，释放 {{ formattedCleanupSize }} 存储空间。</p>
        </div>
      </div>

      <div class="modal-actions">
        <button class="cancel-btn" @click="$emit('close')">取消</button>
        <button class="cleanup-confirm-btn" :disabled="!selectedOption" @click="handleConfirm">
          确认清理
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  history: { type: Array, default: () => [] }
})

const emit = defineEmits(['close', 'confirm'])

const selectedOption = ref('')

watch(
  () => props.show,
  newVal => {
    if (!newVal) {
      selectedOption.value = ''
    }
  }
)

const cleanupCount = computed(() => {
  if (!selectedOption.value) return 0
  const now = new Date()

  switch (selectedOption.value) {
    case 'failed':
      return props.history.filter(item => item.status === 'failed').length
    case 'older':
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      return props.history.filter(item => new Date(item.exportTime) < thirtyDaysAgo).length
    case 'all':
      return props.history.length
    default:
      return 0
  }
})

const cleanupSize = computed(() => {
  if (!selectedOption.value) return 0
  const now = new Date()
  let itemsToDelete = []

  switch (selectedOption.value) {
    case 'failed':
      itemsToDelete = props.history.filter(item => item.status === 'failed')
      break
    case 'older':
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      itemsToDelete = props.history.filter(item => new Date(item.exportTime) < thirtyDaysAgo)
      break
    case 'all':
      itemsToDelete = [...props.history]
      break
  }

  return itemsToDelete.reduce((total, item) => total + (item.size || 0), 0)
})

const formattedCleanupSize = computed(() => {
  const bytes = cleanupSize.value
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
})

const handleConfirm = () => {
  emit('confirm', {
    option: selectedOption.value,
    count: cleanupCount.value,
    size: cleanupSize.value
  })
}
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
  max-width: 500px;
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

.modal-body {
  padding: 24px;
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

.option-item input[type='radio'] {
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

.cleanup-confirm-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #ff3b30;
  color: white;
  cursor: pointer;
  font-size: 14px;
}

.cleanup-confirm-btn:hover:not(:disabled) {
  background: #d63027;
}

.cleanup-confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
