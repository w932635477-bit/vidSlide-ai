<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <h4>加载模板</h4>
      <div class="template-list">
        <div
          v-for="(template, index) in templates"
          :key="index"
          class="template-item"
          @click="$emit('load', template)"
        >
          <div class="template-name">{{ template.name }}</div>
          <div class="template-meta">
            {{ template.slides.length }} 页 · {{ formatDate(template.updatedAt) }}
          </div>
        </div>
        <div v-if="templates.length === 0" class="empty-state">暂无保存的模板</div>
      </div>
      <div class="modal-actions">
        <button class="cancel-btn" @click="$emit('close')">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: { type: Boolean, default: false },
  templates: { type: Array, default: () => [] }
})

defineEmits(['close', 'load'])

const formatDate = dateString => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
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
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content h4 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
}

.template-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.template-item {
  padding: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.template-item:hover {
  background: rgba(0, 122, 255, 0.05);
  border-color: rgba(0, 122, 255, 0.3);
}

.template-name {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 4px;
}

.template-meta {
  font-size: 12px;
  color: #86868b;
}

.empty-state {
  padding: 24px;
  text-align: center;
  color: #86868b;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
}

.cancel-btn {
  padding: 8px 16px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  background: white;
  color: #1d1d1f;
  cursor: pointer;
}

.cancel-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}
</style>
