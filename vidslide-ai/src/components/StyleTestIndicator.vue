<!--
  StyleTestIndicator.vue - 样式测试指示器
  用于确认新样式是否生效
-->
<template>
  <div class="style-test-indicator">
    <div class="indicator-badge">
      <div class="badge-dot"></div>
      <span class="badge-text">新样式已激活</span>
    </div>
    <div class="test-colors">
      <div class="color-sample primary" title="主色调"></div>
      <div class="color-sample secondary" title="次要色"></div>
      <div class="color-sample success" title="成功色"></div>
    </div>
  </div>
</template>

<style scoped>
.style-test-indicator {
  position: fixed;
  bottom: var(--spacing-4);
  right: var(--spacing-4);
  z-index: var(--z-top);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  pointer-events: none;
}

.indicator-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--color-surface);
  backdrop-filter: var(--blur-lg);
  -webkit-backdrop-filter: var(--blur-lg);
  border-radius: var(--radius-2xl);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-float);
}

.badge-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--color-success);
  animation: pulse 2s ease-in-out infinite;
}

.badge-text {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.test-colors {
  display: flex;
  gap: var(--spacing-1);
  padding: var(--spacing-2);
  background: var(--color-surface);
  backdrop-filter: var(--blur-lg);
  -webkit-backdrop-filter: var(--blur-lg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.color-sample {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  cursor: help;
}

.color-sample.primary {
  background: var(--color-primary);
}

.color-sample.secondary {
  background: var(--color-secondary);
}

.color-sample.success {
  background: var(--color-success);
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(0.9);
  }
}
</style>
