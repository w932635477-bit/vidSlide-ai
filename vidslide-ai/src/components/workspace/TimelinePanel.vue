<!--
  TimelinePanel.vue - 底部时间轴 (临时简化版,用于测试)
-->
<template>
  <div class="timeline-panel">
    <div class="timeline-ruler">
      <span class="ruler-text">时间轴</span>
    </div>
    <div class="timeline-tracks">
      <p class="timeline-hint">时间轴轨道将在这里显示</p>
    </div>
  </div>
</template>

<script setup>
// 临时测试版本
</script>

<style scoped>
.timeline-panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--jianying-timeline-bg);
}

.timeline-ruler {
  height: 32px;
  background: var(--jianying-timeline-ruler-bg);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-4);
}

.ruler-text {
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.6);
  font-weight: var(--font-weight-medium);
}

.timeline-tracks {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
}

.timeline-hint {
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.4);
}
</style>
