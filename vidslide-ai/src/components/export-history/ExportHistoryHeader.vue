<template>
  <div class="manager-header">
    <h3>导出历史管理</h3>
    <div class="header-stats">
      <div class="stat-item">
        <span class="stat-label">总记录:</span>
        <span class="stat-value">{{ totalExports }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">存储占用:</span>
        <span class="stat-value">{{ formattedStorageSize }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">成功率:</span>
        <span class="stat-value">{{ successRate }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  totalExports: { type: Number, default: 0 },
  totalStorageSize: { type: Number, default: 0 },
  successRate: { type: Number, default: 0 }
})

const formattedStorageSize = computed(() => {
  const bytes = props.totalStorageSize
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
})
</script>

<style scoped>
.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.manager-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
}

.header-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #86868b;
  font-weight: 500;
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: #1d1d1f;
}

@media (max-width: 768px) {
  .manager-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .header-stats {
    flex-wrap: wrap;
    gap: 16px;
  }
}
</style>
