<template>
  <header class="analyzer-header" role="banner">
    <h2 id="analyzer-heading">📊 素材需求分析</h2>
    <p class="analyzer-description">基于AI分析结果，智能推荐所需的PPT素材资源</p>

    <!-- 分析状态显示 -->
    <div v-if="isAnalyzing" class="analysis-status" role="status" aria-live="polite">
      <div class="status-indicator">
        <div class="loading-spinner"></div>
        <span>正在分析素材需求...</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: analysisProgress + '%' }"></div>
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  isAnalyzing: {
    type: Boolean,
    default: false
  },
  analysisProgress: {
    type: Number,
    default: 0
  }
})
</script>

<style scoped>
.analyzer-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.analyzer-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: -0.01em;
}

.analyzer-description {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
}

.analysis-status {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: rgba(0, 122, 255, 0.1);
  border: 1px solid rgba(0, 122, 255, 0.2);
  border-radius: 8px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: rgba(0, 122, 255, 0.9);
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0, 122, 255, 0.3);
  border-top: 2px solid rgba(0, 122, 255, 0.9);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.progress-bar {
  height: 4px;
  background: rgba(0, 122, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, rgba(0, 122, 255, 0.8) 0%, rgba(0, 122, 255, 0.9) 100%);
  border-radius: 2px;
  transition: width 0.3s ease;
}
</style>
