<template>
  <div class="removal-toolbar">
    <!-- 模式切换 -->
    <div class="mode-controls">
      <div class="mode-toggle">
        <button
          @click="$emit('update:useAIMode', true)"
          :class="{ active: useAIMode }"
          class="mode-btn ai-mode"
          aria-label="切换到AI自动模式"
        >
          🤖 AI自动
        </button>
        <button
          @click="$emit('update:useAIMode', false)"
          :class="{ active: !useAIMode }"
          class="mode-btn manual-mode"
          aria-label="切换到手动模式"
        >
          🎨 手动调整
        </button>
      </div>

      <!-- AI服务状态 -->
      <div
        v-if="aiServiceStatus"
        class="service-status"
        :class="{ available: aiServiceStatus.hasAvailableService, unavailable: !aiServiceStatus.hasAvailableService }"
      >
        <span class="status-icon">{{ aiServiceStatus.hasAvailableService ? '🟢' : '🔴' }}</span>
        <span class="status-text">
          {{ aiServiceStatus.hasAvailableService ? `可用服务: ${aiServiceStatus.availableServices.join(', ')}` : 'AI服务不可用' }}
        </span>
      </div>
    </div>

    <!-- 手动模式控制 -->
    <div v-if="!useAIMode" class="manual-controls">
      <div class="background-controls">
        <label for="bg-color-picker" class="control-label">
          背景色选择:
        </label>
        <input
          id="bg-color-picker"
          :value="selectedBgColor"
          @input="$emit('update:selectedBgColor', $event.target.value)"
          type="color"
          class="color-picker"
          aria-label="选择要移除的背景颜色"
        />
        <span class="color-value">{{ selectedBgColor.toUpperCase() }}</span>
      </div>

      <div class="tolerance-controls">
        <label for="tolerance-slider" class="control-label">
          容差范围: {{ tolerance }}
        </label>
        <input
          id="tolerance-slider"
          :value="tolerance"
          @input="$emit('update:tolerance', Number($event.target.value))"
          type="range"
          min="0"
          max="255"
          step="5"
          class="tolerance-slider"
          aria-label="调整颜色匹配容差"
        />
        <div class="tolerance-presets">
          <button
            v-for="preset in tolerancePresets"
            :key="preset.value"
            @click="$emit('update:tolerance', preset.value)"
            class="preset-btn"
            :class="{ active: tolerance === preset.value }"
            :aria-label="`设置容差为${preset.label}`"
          >
            {{ preset.label }}
          </button>
        </div>
      </div>
    </div>

    <div class="tool-actions">
      <button
        v-if="useAIMode"
        class="tool-btn ai-btn"
        @click="$emit('ai-remove')"
        :disabled="isProcessing || !aiServiceStatus?.hasAvailableService"
        aria-label="AI智能背景移除"
      >
        AI智能移除
      </button>

      <button
        v-if="!useAIMode"
        class="tool-btn"
        @click="$emit('manual-remove')"
        :disabled="isProcessing"
        aria-label="手动背景移除"
      >
        手动移除
      </button>

      <button
        class="tool-btn"
        @click="$emit('refine-edges')"
        :disabled="isProcessing || !hasProcessedImage"
        aria-label="优化边缘"
      >
        优化边缘
      </button>

      <button
        class="tool-btn primary"
        @click="$emit('apply')"
        :disabled="isProcessing || !hasProcessedImage"
        aria-label="应用背景移除"
      >
        应用移除
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  useAIMode: { type: Boolean, default: true },
  aiServiceStatus: { type: Object, default: null },
  selectedBgColor: { type: String, default: '#ffffff' },
  tolerance: { type: Number, default: 30 },
  isProcessing: { type: Boolean, default: false },
  hasProcessedImage: { type: Boolean, default: false }
})

defineEmits([
  'update:useAIMode',
  'update:selectedBgColor',
  'update:tolerance',
  'ai-remove',
  'manual-remove',
  'refine-edges',
  'apply'
])

const tolerancePresets = computed(() => [
  { value: 10, label: '精确' },
  { value: 30, label: '标准' },
  { value: 50, label: '宽松' },
  { value: 80, label: '粗略' }
])
</script>

<style scoped>
.removal-toolbar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
}

.mode-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mode-toggle {
  display: flex;
  gap: 8px;
}

.mode-btn {
  flex: 1;
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.mode-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.9);
}

.mode-btn.active {
  background: rgba(0, 122, 255, 0.2);
  border-color: rgba(0, 122, 255, 0.4);
  color: rgba(0, 122, 255, 0.9);
}

.ai-mode.active {
  background: rgba(52, 199, 89, 0.2);
  border-color: rgba(52, 199, 89, 0.4);
  color: rgba(52, 199, 89, 0.9);
}

.manual-mode.active {
  background: rgba(255, 149, 0, 0.2);
  border-color: rgba(255, 149, 0, 0.4);
  color: rgba(255, 149, 0, 0.9);
}

.service-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.service-status.available {
  background: rgba(52, 199, 89, 0.1);
  border: 1px solid rgba(52, 199, 89, 0.2);
  color: rgba(52, 199, 89, 0.8);
}

.service-status.unavailable {
  background: rgba(255, 59, 48, 0.1);
  border: 1px solid rgba(255, 59, 48, 0.2);
  color: rgba(255, 59, 48, 0.8);
}

.manual-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.background-controls,
.tolerance-controls {
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

.color-picker {
  width: 50px;
  height: 32px;
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

.tolerance-slider {
  flex: 1;
  max-width: 200px;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
}

.tolerance-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: rgba(0, 122, 255, 0.9);
  border-radius: 50%;
  cursor: pointer;
}

.tolerance-presets {
  display: flex;
  gap: 8px;
}

.preset-btn {
  padding: 4px 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.preset-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}

.preset-btn.active {
  background: rgba(0, 122, 255, 0.2);
  border-color: rgba(0, 122, 255, 0.4);
  color: rgba(0, 122, 255, 0.9);
}

.tool-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tool-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.95);
}

.tool-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.tool-btn.primary {
  background: rgba(0, 122, 255, 0.1);
  border-color: rgba(0, 122, 255, 0.3);
  color: rgba(0, 122, 255, 0.9);
}

.tool-btn.primary:hover:not(:disabled) {
  background: rgba(0, 122, 255, 0.2);
  border-color: rgba(0, 122, 255, 0.4);
}

.tool-btn.ai-btn {
  background: rgba(52, 199, 89, 0.1);
  border-color: rgba(52, 199, 89, 0.3);
  color: rgba(52, 199, 89, 0.9);
}

.tool-btn.ai-btn:hover:not(:disabled) {
  background: rgba(52, 199, 89, 0.2);
  border-color: rgba(52, 199, 89, 0.4);
}

@media (max-width: 768px) {
  .background-controls,
  .tolerance-controls,
  .tool-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .tolerance-slider {
    max-width: none;
    width: 100%;
  }
}
</style>
