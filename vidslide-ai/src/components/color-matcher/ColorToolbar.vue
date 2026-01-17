<template>
  <div class="matcher-toolbar">
    <div class="analysis-controls">
      <el-button
        type="primary"
        @click="$emit('analyze')"
        :disabled="isProcessing"
        :loading="isProcessing"
      >
        <template #icon>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4"/>
            <path d="M12 8h.01"/>
          </svg>
        </template>
        AI色彩分析
      </el-button>

      <el-button
        @click="$emit('generate-palette')"
        :disabled="isProcessing || !hasColors"
      >
        <template #icon>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4"/>
            <path d="M12 8h.01"/>
          </svg>
        </template>
        生成配色
      </el-button>

      <el-button
        @click="$emit('apply-correction')"
        :disabled="isProcessing || !hasColors"
      >
        <template #icon>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </template>
        色彩校正
      </el-button>
    </div>

    <div class="export-controls">
      <el-button
        @click="$emit('export')"
        :disabled="!hasHarmonizedPalette"
      >
        <template #icon>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </template>
        导出配色
      </el-button>

      <el-button
        type="danger"
        @click="$emit('clear')"
      >
        清除图片
      </el-button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isProcessing: {
    type: Boolean,
    default: false
  },
  hasColors: {
    type: Boolean,
    default: false
  },
  hasHarmonizedPalette: {
    type: Boolean,
    default: false
  }
})

defineEmits([
  'analyze',
  'generate-palette',
  'apply-correction',
  'export',
  'clear'
])
</script>

<style scoped>
.matcher-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  flex-wrap: wrap;
  gap: 12px;
}

.analysis-controls,
.export-controls {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
