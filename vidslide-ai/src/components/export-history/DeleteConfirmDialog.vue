<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content confirm-modal" @click.stop>
      <div class="modal-header">
        <h4>确认删除</h4>
      </div>

      <div class="modal-body">
        <p>确定要删除{{ isBulkDelete ? `选中的 ${selectedCount} 个记录` : '这个导出记录' }}吗？</p>
        <p class="warning-text">此操作不可撤销，已导出的文件不会被删除。</p>
      </div>

      <div class="modal-actions">
        <button class="cancel-btn" @click="$emit('close')">取消</button>
        <button class="delete-confirm-btn" @click="$emit('confirm')">确认删除</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: { type: Boolean, default: false },
  isBulkDelete: { type: Boolean, default: false },
  selectedCount: { type: Number, default: 0 }
})

defineEmits(['close', 'confirm'])
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
  max-width: 400px;
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

.modal-body p {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #1d1d1f;
}

.warning-text {
  color: #ff3b30 !important;
  font-size: 13px !important;
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

.delete-confirm-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #ff3b30;
  color: white;
  cursor: pointer;
  font-size: 14px;
}

.delete-confirm-btn:hover {
  background: #d63027;
}
</style>
