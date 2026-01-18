<template>
  <div class="background-options">
    <h4>背景设置</h4>
    <div class="background-presets">
      <button
        v-for="bg in backgroundPresets"
        :key="bg.id"
        class="bg-preset-btn"
        :class="{ active: selectedBackground.id === bg.id }"
        :aria-label="`设置为${bg.name}背景`"
        @click="$emit('select-background', bg)"
      >
        <div class="bg-content">
          <div class="bg-preview" :style="{ background: bg.style }"></div>
          <span>{{ bg.name }}</span>
        </div>
      </button>
    </div>

    <div class="custom-background">
      <label for="custom-bg-color" class="control-label"> 自定义背景色: </label>
      <input
        id="custom-bg-color"
        :value="customBgColor"
        type="color"
        class="color-picker small"
        aria-label="选择自定义背景颜色"
        @input="$emit('update:customBgColor', $event.target.value)"
        @change="$emit('set-custom-background')"
      />
      <span class="color-value">{{ customBgColor.toUpperCase() }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  selectedBackground: {
    type: Object,
    default: () => ({ id: 'transparent', name: '透明', style: 'transparent' })
  },
  customBgColor: { type: String, default: '#ffffff' }
})

defineEmits(['select-background', 'update:customBgColor', 'set-custom-background'])

const backgroundPresets = computed(() => [
  { id: 'transparent', name: '透明', style: 'transparent' },
  { id: 'white', name: '白色', style: '#ffffff' },
  { id: 'black', name: '黑色', style: '#000000' },
  { id: 'blue', name: '蓝色', style: '#007aff' },
  { id: 'green', name: '绿色', style: '#34c759' },
  { id: 'red', name: '红色', style: '#ff3b30' },
  { id: 'gradient', name: '渐变', style: 'linear-gradient(45deg, #007aff, #34c759)' }
])
</script>

<style scoped>
.background-options {
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
}

.background-options h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.background-presets {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 8px;
  margin-bottom: 16px;
}

.bg-preset-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.bg-preset-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.95);
}

.bg-preset-btn.active {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(0, 122, 255, 0.4);
  color: rgba(0, 122, 255, 0.9);
}

.bg-preview {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.custom-background {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.control-label {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
}

.color-picker.small {
  width: 40px;
  height: 28px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  cursor: pointer;
}

.color-value {
  font-size: 12px;
  font-family: monospace;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 8px;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .background-presets {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
