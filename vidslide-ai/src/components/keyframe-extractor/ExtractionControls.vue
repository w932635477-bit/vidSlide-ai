<template>
  <div class="extraction-controls">
    <button v-if="!isExtracting" class="control-btn primary" @click="$emit('start-extraction')">
      🎬 开始提取
    </button>

    <button v-else class="control-btn danger" @click="$emit('stop-extraction')">⏸️ 停止提取</button>

    <button class="control-btn" :disabled="!hasKeyframes" @click="$emit('export-keyframes')">
      💾 导出关键帧
    </button>

    <button class="control-btn danger" :disabled="!hasKeyframes" @click="$emit('clear-all')">
      🗑️ 清除全部
    </button>
  </div>
</template>

<script setup>
defineProps({
  hasKeyframes: { type: Boolean, default: false },
  isExtracting: { type: Boolean, default: false }
})

defineEmits(['start-extraction', 'stop-extraction', 'export-keyframes', 'clear-all'])
</script>

<style scoped>
.extraction-controls {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.control-btn {
  padding: 12px 24px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  background: white;
  color: #1d1d1f;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.control-btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.05);
}

.control-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.control-btn.primary {
  background: #007aff;
  color: white;
  border-color: #007aff;
}

.control-btn.primary:hover {
  background: #0051d5;
}

.control-btn.danger {
  background: #ff3b30;
  color: white;
  border-color: #ff3b30;
}

.control-btn.danger:hover {
  background: #d63027;
}

@media (max-width: 768px) {
  .extraction-controls {
    flex-wrap: wrap;
  }

  .control-btn {
    flex: 1;
    min-width: 140px;
  }
}
</style>
