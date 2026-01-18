<template>
  <div
    class="keyframe-item"
    :class="{
      selected: isSelected,
      processing: keyframe.isProcessing
    }"
    role="button"
    tabindex="0"
    :aria-label="`选择关键帧 ${keyframe.id}，时间 ${formatTime(keyframe.timestamp)}，重要性 ${(keyframe.importance * 100).toFixed(1)}%`"
    @click="$emit('select')"
    @keydown.enter="$emit('select')"
    @keydown.space="$emit('select')"
  >
    <div class="thumbnail-container">
      <img
        v-if="keyframe.thumbnailUrl"
        :src="keyframe.thumbnailUrl"
        :alt="`关键帧 ${keyframe.id} 在 ${formatTime(keyframe.timestamp)}`"
        class="keyframe-thumbnail"
        loading="lazy"
      />
      <div v-else class="thumbnail-placeholder">🎬</div>

      <div v-if="keyframe.isProcessing" class="processing-overlay">
        <div class="processing-spinner"></div>
      </div>
    </div>

    <div class="keyframe-info">
      <div class="timestamp">{{ formatTime(keyframe.timestamp) }}</div>
      <div class="detection-method">
        <span class="method-badge" :class="getMethodClass(keyframe.detectionMethod)">
          {{ getMethodLabel(keyframe.detectionMethod) }}
        </span>
      </div>
      <div class="importance-bar">
        <div class="importance-fill" :style="{ width: keyframe.importance * 100 + '%' }"></div>
      </div>
      <div class="importance-value">{{ (keyframe.importance * 100).toFixed(1) }}%</div>
    </div>

    <div class="keyframe-actions">
      <button class="action-btn preview-btn" title="预览关键帧" @click.stop="$emit('preview')">
        👁️
      </button>
      <button
        class="action-btn create-card-btn"
        title="创建文字卡片"
        @click.stop="$emit('create-card')"
      >
        📄
      </button>
      <button class="action-btn delete-btn" title="删除关键帧" @click.stop="$emit('remove')">
        🗑️
      </button>
    </div>

    <div v-if="isSelected" class="selection-indicator">✓</div>
  </div>
</template>

<script setup>
defineProps({
  keyframe: { type: Object, required: true },
  isSelected: { type: Boolean, default: false }
})

defineEmits(['select', 'preview', 'create-card', 'remove'])

const formatTime = seconds => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const getMethodClass = method => {
  const classes = {
    'scene-change': 'method-scene',
    motion: 'method-motion',
    face: 'method-face',
    text: 'method-text'
  }
  return classes[method] || 'method-default'
}

const getMethodLabel = method => {
  const labels = {
    'scene-change': '场景',
    motion: '运动',
    face: '人脸',
    text: '文字'
  }
  return labels[method] || '其他'
}
</script>

<style scoped>
.keyframe-item {
  position: relative;
  background: white;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.keyframe-item:hover {
  border-color: #007aff;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.15);
}

.keyframe-item.selected {
  border-color: #007aff;
  background: rgba(0, 122, 255, 0.05);
}

.keyframe-item.processing {
  opacity: 0.6;
}

.thumbnail-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #f5f5f7;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
}

.keyframe-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 32px;
  opacity: 0.3;
}

.processing-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.processing-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.keyframe-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.timestamp {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
}

.detection-method {
  display: flex;
}

.method-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.method-scene {
  background: rgba(0, 122, 255, 0.1);
  color: #007aff;
}

.method-motion {
  background: rgba(52, 199, 89, 0.1);
  color: #34c759;
}

.method-face {
  background: rgba(255, 149, 0, 0.1);
  color: #ff9500;
}

.method-text {
  background: rgba(175, 82, 222, 0.1);
  color: #af52de;
}

.importance-bar {
  height: 4px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.importance-fill {
  height: 100%;
  background: linear-gradient(90deg, #34c759, #007aff);
  transition: width 0.3s ease;
}

.importance-value {
  font-size: 12px;
  color: #86868b;
  text-align: right;
}

.keyframe-actions {
  display: flex;
  gap: 6px;
}

.action-btn {
  flex: 1;
  padding: 6px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 14px;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.selection-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: #007aff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}
</style>
