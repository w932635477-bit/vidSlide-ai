<template>
  <div class="color-section">
    <h4>{{ title }}</h4>

    <!-- 原始色彩调色板 -->
    <div v-if="type === 'original'" class="color-palette original-palette">
      <div
        v-for="(color, index) in colors"
        :key="'color-' + index"
        class="color-swatch"
        :style="{ backgroundColor: color.hex }"
        :class="{ selected: selectedColor && selectedColor.hex === color.hex }"
        role="button"
        tabindex="0"
        :aria-label="`选择颜色 ${color.hex}，占比 ${color.percentage}%`"
        @click="$emit('select-color', color)"
      >
        <span class="color-info">
          <span class="color-hex">{{ color.hex }}</span>
          <span class="color-percentage">{{ color.percentage }}%</span>
        </span>
      </div>
    </div>

    <!-- 协调配色方案 -->
    <div v-else-if="type === 'harmonized'" class="harmonized-palettes">
      <div v-for="(scheme, index) in schemes" :key="'scheme-' + index" class="palette-scheme">
        <h5>{{ scheme.name }}</h5>
        <div class="scheme-colors">
          <div
            v-for="(hex, colorIndex) in scheme.colors"
            :key="'scheme-color-' + colorIndex"
            class="scheme-swatch"
            :style="{ backgroundColor: hex }"
            :title="`点击复制 ${hex}`"
            @click="copyColor(hex)"
          >
            <span class="swatch-hex">{{ hex }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 色彩统计 -->
    <div v-if="stats" class="color-statistics">
      <div class="stat-item">
        <span class="stat-label">主色调:</span>
        <span class="stat-value color-preview" :style="{ backgroundColor: stats.dominantHue }">
          {{ stats.dominantHue }}
        </span>
      </div>
      <div class="stat-item">
        <span class="stat-label">色彩丰富度:</span>
        <span class="stat-value">{{ stats.colorfulness }}/100</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">亮度范围:</span>
        <span class="stat-value">{{ stats.brightnessRange }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'

defineProps({
  title: {
    type: String,
    default: '色彩分析'
  },
  type: {
    type: String,
    default: 'original', // 'original' | 'harmonized'
    validator: value => ['original', 'harmonized'].includes(value)
  },
  colors: {
    type: Array,
    default: () => []
  },
  schemes: {
    type: Array,
    default: () => []
  },
  selectedColor: {
    type: Object,
    default: null
  },
  stats: {
    type: Object,
    default: null
  }
})

defineEmits(['select-color'])

const copyColor = async hex => {
  try {
    await navigator.clipboard.writeText(hex)
    ElMessage.success(`已复制颜色 ${hex}`)
  } catch (err) {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped>
.color-section {
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
}

.color-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.color-palette {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.color-swatch {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.color-swatch:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.color-swatch.selected {
  border-color: rgba(0, 122, 255, 0.8);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.3);
}

.color-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 6px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 0 0 6px 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.color-hex {
  font-size: 11px;
  font-weight: 500;
  color: white;
}

.color-percentage {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.7);
}

.harmonized-palettes {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.palette-scheme h5 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
}

.scheme-colors {
  display: flex;
  gap: 8px;
}

.scheme-swatch {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}

.scheme-swatch:hover {
  transform: scale(1.05);
}

.swatch-hex {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 9px;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
}

.color-statistics {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.stat-value {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.stat-value.color-preview {
  padding: 4px 8px;
  border-radius: 4px;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}
</style>
