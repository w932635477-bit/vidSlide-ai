<template>
  <div v-if="enabled" class="performance-monitor">
    <h5>性能监控</h5>

    <div class="stats-grid">
      <div class="stat-item">
        <span class="stat-label">FPS:</span>
        <span class="stat-value">{{ stats.averageFPS.toFixed(1) }}</span>
      </div>

      <div class="stat-item">
        <span class="stat-label">帧数:</span>
        <span class="stat-value">{{ stats.frameCount }}</span>
      </div>

      <div class="stat-item">
        <span class="stat-label">GPU:</span>
        <span class="stat-value">{{ gpuAccelerated ? '✅' : '❌' }}</span>
      </div>

      <div class="stat-item">
        <span class="stat-label">WAAPI:</span>
        <span class="stat-value">{{ webAnimations ? '✅' : '❌' }}</span>
      </div>

      <div class="stat-item">
        <span class="stat-label">内存:</span>
        <span class="stat-value">{{ (stats.memoryUsage / 1024 / 1024).toFixed(1) }}MB</span>
      </div>

      <div class="stat-item">
        <span class="stat-label">池大小:</span>
        <span class="stat-value">{{ poolActive }}/{{ poolMax }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  enabled: { type: Boolean, default: false },
  stats: {
    type: Object,
    default: () => ({
      averageFPS: 0,
      frameCount: 0,
      memoryUsage: 0
    })
  },
  gpuAccelerated: { type: Boolean, default: false },
  webAnimations: { type: Boolean, default: false },
  poolActive: { type: Number, default: 0 },
  poolMax: { type: Number, default: 0 }
})
</script>

<style scoped>
.performance-monitor {
  padding: 16px;
  background: rgba(0, 122, 255, 0.05);
  border: 1px solid rgba(0, 122, 255, 0.2);
  border-radius: 8px;
  margin-top: 16px;
}

.performance-monitor h5 {
  margin: 0 0 12px 0;
  font-size: 13px;
  font-weight: 600;
  color: #007aff;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 6px;
}

.stat-label {
  font-size: 12px;
  color: #86868b;
  font-weight: 500;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
