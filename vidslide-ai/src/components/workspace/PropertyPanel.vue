<!--
  PropertyPanel.vue - 右侧属性面板 (临时简化版,用于测试)
-->
<template>
  <div class="property-panel">
    <div class="panel-header">
      <h3 class="panel-title">属性</h3>
    </div>
    <div class="panel-content">
      <p class="panel-hint">属性面板内容将在这里显示</p>
    </div>
  </div>
</template>

<script setup>
// 临时测试版本
</script>

<style scoped>
.property-panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-secondary);
}

.panel-header {
  padding: var(--spacing-4);
  border-bottom: 1px solid var(--color-divider);
}

.panel-title {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.panel-content {
  flex: 1;
  padding: var(--spacing-4);
  overflow-y: auto;
}

.panel-hint {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  text-align: center;
}
</style>
