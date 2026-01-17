<template>
  <div class="auto-generation-overlay" v-if="visible">
    <div class="progress-modal">
      <!-- 动画图标 -->
      <div class="loading-icon">
        <svg class="spinner" viewBox="0 0 50 50">
          <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="4"></circle>
        </svg>
      </div>

      <!-- 当前步骤 -->
      <h3 class="step-title">{{ currentStep }}</h3>

      <!-- 进度条 -->
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
      </div>

      <!-- 进度百分比 -->
      <p class="progress-text">{{ progress }}%</p>

      <!-- 详细步骤列表 -->
      <div class="step-list">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="step-item"
          :class="{
            'completed': step.completed,
            'current': step.current
          }"
        >
          <div class="step-icon">
            <svg v-if="step.completed" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            <div v-else-if="step.current" class="dot"></div>
            <div v-else class="dot inactive"></div>
          </div>
          <span class="step-name">{{ step.name }}</span>
        </div>
      </div>

      <!-- 取消按钮 -->
      <button class="cancel-btn" @click="onCancel" v-if="canCancel">
        取消
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  currentStep: {
    type: String,
    default: ''
  },
  progress: {
    type: Number,
    default: 0
  },
  canCancel: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['cancel'])

const steps = computed(() => [
  {
    name: '分析视频内容',
    completed: props.progress > 40,
    current: props.progress <= 40 && props.progress > 0
  },
  {
    name: '推荐最佳模板',
    completed: props.progress > 50,
    current: props.progress > 40 && props.progress <= 50
  },
  {
    name: '搜索匹配素材',
    completed: props.progress > 70,
    current: props.progress > 50 && props.progress <= 70
  },
  {
    name: '组合生成内容',
    completed: props.progress > 85,
    current: props.progress > 70 && props.progress <= 85
  },
  {
    name: '渲染最终视频',
    completed: props.progress >= 100,
    current: props.progress > 85 && props.progress < 100
  }
])

const onCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.auto-generation-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.progress-modal {
  background: white;
  border-radius: 20px;
  padding: 48px;
  min-width: 480px;
  max-width: 600px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
  animation: slideUp 0.4s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.loading-icon {
  margin: 0 auto 24px;
  width: 80px;
  height: 80px;
}

.spinner {
  animation: rotate 2s linear infinite;
  width: 100%;
  height: 100%;
}

.spinner .path {
  stroke: #0071E3;
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

.step-title {
  font-size: 24px;
  font-weight: 700;
  color: #1D1D1F;
  margin: 0 0 24px;
  min-height: 32px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #E8E8ED;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 16px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #0071E3, #00A0FF);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 18px;
  font-weight: 600;
  color: #0071E3;
  margin: 0 0 32px;
}

.step-list {
  text-align: left;
  margin-bottom: 24px;
}

.step-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  gap: 12px;
  transition: all 0.3s ease;
}

.step-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-icon svg {
  width: 24px;
  height: 24px;
  fill: #34C759;
  animation: checkmark 0.3s ease;
}

@keyframes checkmark {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

.step-icon .dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #0071E3;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

.step-icon .dot.inactive {
  background: #C7C7CC;
  animation: none;
}

.step-name {
  font-size: 16px;
  color: #1D1D1F;
  transition: all 0.3s ease;
}

.step-item.completed .step-name {
  color: #86868B;
}

.step-item.current .step-name {
  font-weight: 600;
  color: #0071E3;
}

.cancel-btn {
  padding: 12px 32px;
  background: transparent;
  border: 1px solid #D2D2D7;
  border-radius: 20px;
  color: #1D1D1F;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: #F5F5F7;
  border-color: #B0B0B5;
}

.cancel-btn:active {
  transform: scale(0.98);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .progress-modal {
    min-width: 90%;
    padding: 32px 24px;
  }

  .step-title {
    font-size: 20px;
  }

  .progress-text {
    font-size: 16px;
  }

  .step-name {
    font-size: 14px;
  }
}
</style>
