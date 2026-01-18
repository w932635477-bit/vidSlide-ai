<template>
  <div class="editor-sidebar">
    <div class="sidebar-section">
      <h4>模板元素</h4>
      <div class="element-palette">
        <div
          v-for="element in elements"
          :key="element.type"
          class="element-item"
          draggable="true"
          @dragstart="$emit('drag-start', $event, element)"
        >
          <div class="element-icon">{{ element.icon }}</div>
          <div class="element-info">
            <div class="element-name">{{ element.name }}</div>
            <div class="element-desc">{{ element.description }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="sidebar-section">
      <h4>全局样式</h4>
      <div class="style-controls">
        <div class="style-group">
          <label class="style-label">主题色</label>
          <input
            type="color"
            :value="theme.primaryColor"
            class="color-input"
            @input="$emit('update-theme', 'primaryColor', $event.target.value)"
          />
        </div>
        <div class="style-group">
          <label class="style-label">背景色</label>
          <input
            type="color"
            :value="theme.backgroundColor"
            class="color-input"
            @input="$emit('update-theme', 'backgroundColor', $event.target.value)"
          />
        </div>
        <div class="style-group">
          <label class="style-label">字体</label>
          <select
            :value="theme.fontFamily"
            @change="$emit('update-theme', 'fontFamily', $event.target.value)"
          >
            <option value="PingFang SC, -apple-system">苹方</option>
            <option value="Helvetica Neue, Arial">Helvetica</option>
            <option value="Microsoft YaHei">微软雅黑</option>
            <option value="SimSun">宋体</option>
          </select>
        </div>
        <div class="style-group">
          <label class="style-label">圆角半径</label>
          <input
            type="range"
            min="0"
            max="20"
            :value="theme.borderRadius"
            class="range-input"
            @input="$emit('update-theme', 'borderRadius', Number($event.target.value))"
          />
          <span class="range-value">{{ theme.borderRadius }}px</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  elements: { type: Array, default: () => [] },
  theme: { type: Object, default: () => ({}) }
})

defineEmits(['drag-start', 'update-theme'])
</script>

<style scoped>
.editor-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  overflow-y: auto;
}

.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sidebar-section h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
}

.element-palette {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.element-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: white;
  cursor: grab;
  transition: all 0.2s ease;
}

.element-item:hover {
  border-color: #007aff;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.1);
}

.element-item:active {
  cursor: grabbing;
}

.element-icon {
  font-size: 20px;
}

.element-info {
  flex: 1;
}

.element-name {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 2px;
}

.element-desc {
  font-size: 12px;
  color: #86868b;
}

.style-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.style-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.style-label {
  font-size: 13px;
  font-weight: 500;
  color: #1d1d1f;
}

.color-input {
  width: 100%;
  height: 40px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  cursor: pointer;
}

.style-group select {
  padding: 8px 12px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  background: white;
  font-size: 13px;
}

.range-input {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.1);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #007aff;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 122, 255, 0.3);
}

.range-value {
  font-size: 12px;
  color: #86868b;
  text-align: center;
}
</style>
