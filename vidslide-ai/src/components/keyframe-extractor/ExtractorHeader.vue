<template>
  <header class="extractor-header" role="banner">
    <h2 id="keyframe-heading">🎬 关键帧提取</h2>
    <p class="extractor-description">
      智能检测视频中的重要帧，提取关键视觉内容用于PPT制作
    </p>

    <div
      v-if="isExtracting"
      class="extraction-status"
      role="status"
      aria-live="polite"
    >
      <div class="status-indicator">
        <div class="loading-spinner"></div>
        <span>正在分析关键帧...</span>
      </div>
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: extractionProgress + '%' }"
        ></div>
      </div>
      <div class="extraction-stats">
        <span>已检测: {{ detectedFramesCount }} 帧</span>
        <span>关键帧: {{ keyframesCount }} 个</span>
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  isExtracting: { type: Boolean, default: false },
  extractionProgress: { type: Number, default: 0 },
  detectedFramesCount: { type: Number, default: 0 },
  keyframesCount: { type: Number, default: 0 }
})
</script>

<style scoped>
.extractor-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.extractor-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1d1d1f;
}

.extractor-description {
  margin: 0;
  font-size: 14px;
  color: #86868b;
  line-height: 1.5;
}

.extraction-status {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: rgba(0, 122, 255, 0.05);
  border: 1px solid rgba(0, 122, 255, 0.2);
  border-radius: 8px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #007aff;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0, 122, 255, 0.3);
  border-top: 2px solid #007aff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.progress-bar {
  height: 4px;
  background: rgba(0, 122, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #007aff;
  transition: width 0.3s ease;
}

.extraction-stats {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #86868b;
}
</style>
