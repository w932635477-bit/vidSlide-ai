<template>
  <div class="keyframes-grid">
    <KeyframeCard
      v-for="keyframe in keyframes"
      :key="keyframe.id"
      :keyframe="keyframe"
      :is-selected="selectedKeyframes.includes(keyframe)"
      @select="$emit('select-keyframe', keyframe)"
      @preview="$emit('preview-keyframe', keyframe)"
      @create-card="$emit('create-card', keyframe)"
      @remove="$emit('remove-keyframe', keyframe)"
    />
  </div>

  <div
    v-if="keyframes.length === 0"
    class="empty-state"
    role="status"
  >
    <div class="empty-icon">🎬</div>
    <h3>暂无关键帧</h3>
    <p>开始提取视频关键帧以显示内容</p>
  </div>
</template>

<script setup>
import KeyframeCard from './KeyframeCard.vue'

defineProps({
  keyframes: { type: Array, default: () => [] },
  selectedKeyframes: { type: Array, default: () => [] }
})

defineEmits([
  'select-keyframe',
  'preview-keyframe',
  'create-card',
  'remove-keyframe'
])
</script>

<style scoped>
.keyframes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  margin-top: 20px;
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
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
  color: #86868b;
}

@media (max-width: 768px) {
  .keyframes-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }
}
</style>
