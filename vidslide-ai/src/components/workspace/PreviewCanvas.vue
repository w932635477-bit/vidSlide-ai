<!--
  PreviewCanvas.vue - 中央预览区 (临时简化版,用于测试)
-->
<template>
  <div class="preview-canvas">
    <div class="preview-container">
      <div class="preview-content">
        <h2 class="preview-title">预览区域</h2>
        <p class="preview-hint">视频预览和Canvas渲染将在这里显示</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// 临时测试版本
</script>

<style scoped>
.preview-canvas {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-darker);
}

.preview-container {
  max-width: 800px;
  text-align: center;
  padding: var(--spacing-8);
}

.preview-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-inverse);
  margin-bottom: var(--spacing-4);
}

.preview-hint {
  font-size: var(--text-base);
  color: var(--color-text-tertiary);
}
</style>
