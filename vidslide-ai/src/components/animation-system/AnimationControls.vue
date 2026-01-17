<template>
  <div class="animation-controls">
    <h4>🎬 动画系统控制</h4>

    <!-- 动画开关 -->
    <div class="control-group">
      <label>
        <input v-model="localEnabled" type="checkbox" @change="$emit('update:enabled', localEnabled)" />
        启用动画效果
      </label>
    </div>

    <!-- 动画速度设置 -->
    <div v-if="enabled" class="control-group">
      <label>动画速度：</label>
      <select :value="speed" @change="$emit('update:speed', $event.target.value)">
        <option value="slow">慢速 (0.5x)</option>
        <option value="normal">正常 (1.0x)</option>
        <option value="fast">快速 (1.5x)</option>
      </select>
    </div>

    <!-- 时序同步控制 -->
    <div v-if="enabled" class="control-group">
      <label>
        <input :checked="syncEnabled" type="checkbox" @change="$emit('update:syncEnabled', $event.target.checked)" />
        启用时序同步
      </label>
    </div>

    <!-- 测试按钮 -->
    <div class="control-group">
      <button class="test-btn" @click="$emit('test-text')">测试文字动画</button>
      <button class="test-btn" @click="$emit('test-pip')">测试画中画动画</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  enabled: { type: Boolean, default: false },
  speed: { type: String, default: 'normal' },
  syncEnabled: { type: Boolean, default: false }
})

const emit = defineEmits(['update:enabled', 'update:speed', 'update:syncEnabled', 'test-text', 'test-pip'])

const localEnabled = ref(props.enabled)

watch(() => props.enabled, (newVal) => {
  localEnabled.value = newVal
})
</script>

<style scoped>
.animation-controls {
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.animation-controls h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.control-group {
  margin-bottom: 16px;
}

.control-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
}

.control-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.test-btn {
  width: 100%;
  padding: 10px;
  margin-top: 8px;
  border: 1px solid rgba(0, 122, 255, 0.3);
  border-radius: 6px;
  background: rgba(0, 122, 255, 0.1);
  color: rgba(0, 122, 255, 0.9);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.test-btn:hover {
  background: rgba(0, 122, 255, 0.2);
}
</style>
