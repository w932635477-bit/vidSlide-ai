<template>
  <div class="keyframes-stats">
    <div class="stat-item">
      <span class="stat-label">关键帧总数:</span>
      <span class="stat-value">{{ keyframesCount }}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">覆盖时长:</span>
      <span class="stat-value">{{ totalCoverageTime }}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">平均间隔:</span>
      <span class="stat-value">{{ averageInterval }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  keyframesCount: { type: Number, default: 0 },
  totalCoverageTime: { type: String, default: '0:00' },
  averageInterval: { type: String, default: '0.0s' }
})
</script>

<style scoped>
.keyframes-stats {
  display: flex;
  gap: 24px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #86868b;
  font-weight: 500;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
}

@media (max-width: 768px) {
  .keyframes-stats {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
