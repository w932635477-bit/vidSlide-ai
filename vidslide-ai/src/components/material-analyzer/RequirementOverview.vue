<template>
  <section
    class="requirements-overview"
    role="complementary"
    aria-labelledby="overview-heading"
  >
    <h3 id="overview-heading" class="sr-only">素材需求概览</h3>

    <div class="overview-stats">
      <div class="stat-item">
        <span class="stat-label">总需求数:</span>
        <span class="stat-value">{{ totalRequirements }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">高优先级:</span>
        <span class="stat-value">{{ highPriorityCount }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">素材类型:</span>
        <span class="stat-value">{{ uniqueTypesCount }}</span>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  totalRequirements: {
    type: Number,
    default: 0
  },
  highPriorityCount: {
    type: Number,
    default: 0
  },
  uniqueTypesCount: {
    type: Number,
    default: 0
  }
})
</script>

<style scoped>
.requirements-overview {
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.overview-stats {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
