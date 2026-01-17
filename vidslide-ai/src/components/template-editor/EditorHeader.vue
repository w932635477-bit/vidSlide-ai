<template>
  <div class="editor-header">
    <h3>模板自定义编辑器</h3>
    <div class="header-actions">
      <button class="preview-btn" @click="$emit('toggle-preview')" :class="{ active: showPreview }">
        {{ showPreview ? '编辑模式' : '预览模式' }}
      </button>
      <button class="save-btn" @click="$emit('save')" :disabled="!hasChanges">
        保存模板
      </button>
      <button class="load-btn" @click="$emit('show-load')">
        加载模板
      </button>
      <button class="export-btn" @click="$emit('export')">
        导出模板
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  showPreview: { type: Boolean, default: false },
  hasChanges: { type: Boolean, default: false }
})

defineEmits(['toggle-preview', 'save', 'show-load', 'export'])
</script>

<style scoped>
.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.editor-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.preview-btn,
.save-btn,
.load-btn,
.export-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preview-btn {
  background: rgba(0, 122, 255, 0.1);
  border: 1px solid rgba(0, 122, 255, 0.3);
  color: #007aff;
}

.preview-btn.active,
.preview-btn:hover {
  background: #007aff;
  color: white;
}

.save-btn {
  background: #34c759;
  border: 1px solid #34c759;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #28a745;
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.load-btn {
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.2);
  color: #1d1d1f;
}

.load-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.export-btn {
  background: #ff9f0a;
  border: 1px solid #ff9f0a;
  color: white;
}

.export-btn:hover {
  background: #e08e0b;
}

@media (max-width: 768px) {
  .editor-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .header-actions {
    flex-wrap: wrap;
  }
}
</style>
