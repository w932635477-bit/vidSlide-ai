<template>
  <div class="requirements-controls">
    <div class="filter-controls">
      <label for="type-filter" class="sr-only">素材类型筛选</label>
      <select
        id="type-filter"
        :value="selectedType"
        class="filter-select"
        @change="$emit('update:selectedType', $event.target.value)"
      >
        <option value="all">全部类型</option>
        <option
          v-for="type in uniqueTypes"
          :key="type"
          :value="type"
        >
          {{ getTypeDisplayName(type) }}
        </option>
      </select>

      <label for="priority-filter" class="sr-only">优先级筛选</label>
      <select
        id="priority-filter"
        :value="selectedPriority"
        class="filter-select"
        @change="$emit('update:selectedPriority', $event.target.value)"
      >
        <option value="all">全部优先级</option>
        <option value="high">高优先级</option>
        <option value="medium">中优先级</option>
        <option value="low">低优先级</option>
      </select>
    </div>

    <button
      class="analyze-btn primary"
      @click="$emit('analyze')"
      :disabled="isAnalyzing || !hasInputData"
    >
      <span v-if="isAnalyzing" class="loading-spinner small"></span>
      {{ isAnalyzing ? '分析中...' : '重新分析' }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  selectedType: {
    type: String,
    default: 'all'
  },
  selectedPriority: {
    type: String,
    default: 'all'
  },
  uniqueTypes: {
    type: Array,
    default: () => []
  },
  isAnalyzing: {
    type: Boolean,
    default: false
  },
  hasInputData: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:selectedType', 'update:selectedPriority', 'analyze'])

const getTypeDisplayName = (type) => {
  const names = {
    image: '图片',
    video: '视频',
    icon: '图标',
    illustration: '插图',
    diagram: '图表',
    chart: '图表',
    background: '背景',
    animation: '动画'
  }
  return names[type] || type
}
</script>

<style scoped>
.requirements-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
}

.filter-controls {
  display: flex;
  gap: 12px;
}

.filter-select {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
}

.filter-select:focus {
  outline: 2px solid rgba(0, 122, 255, 0.5);
  outline-offset: 2px;
}

.analyze-btn {
  padding: 8px 16px;
  border: 1px solid rgba(0, 122, 255, 0.3);
  border-radius: 6px;
  background: rgba(0, 122, 255, 0.1);
  color: rgba(0, 122, 255, 0.9);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.analyze-btn:hover:not(:disabled) {
  background: rgba(0, 122, 255, 0.2);
  border-color: rgba(0, 122, 255, 0.4);
}

.analyze-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(0, 122, 255, 0.3);
  border-top: 2px solid rgba(0, 122, 255, 0.9);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
