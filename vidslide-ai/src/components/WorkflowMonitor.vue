<template>
  <div class="workflow-monitor">
    <!-- 头部 -->
    <div class="monitor-header">
      <h3>📊 工作流程监控台</h3>
      <div class="monitor-status">
        <span v-if="isRunning" class="status-running">⏳ 正在执行...</span>
        <span v-else-if="isCompleted" class="status-completed">✅ 已完成</span>
        <span v-else-if="hasError" class="status-error">❌ 执行失败</span>
        <span v-else class="status-idle">⏸️ 就绪</span>
      </div>
    </div>

    <!-- 多智能体5-Phase进度 -->
    <div v-if="showMultiAgentProgress" class="multi-agent-progress">
      <div class="progress-header">
        <h4>🤖 多智能体生成进度</h4>
        <span class="progress-percentage">{{ Math.round(multiAgentProgress) }}%</span>
      </div>

      <el-progress
        :percentage="multiAgentProgress"
        :status="multiAgentProgress >= 100 ? 'success' : undefined"
        :stroke-width="10"
        class="main-progress"
      />

      <div v-if="multiAgentCurrentStep" class="current-step-info">
        <span class="step-label">当前步骤:</span>
        <span class="step-text">{{ multiAgentCurrentStep }}</span>
      </div>

      <!-- 5个Phase步骤 -->
      <div class="phase-steps">
        <div
          v-for="(phase, index) in multiAgentPhases"
          :key="index"
          class="phase-item"
          :class="{
            'phase-completed': phase.completed,
            'phase-current': phase.current,
            'phase-pending': !phase.completed && !phase.current
          }"
        >
          <div class="phase-icon">
            <span v-if="phase.completed" class="icon-completed">✓</span>
            <span v-else-if="phase.current" class="icon-current">⏳</span>
            <span v-else class="icon-pending">○</span>
          </div>
          <div class="phase-name">{{ phase.name }}</div>
        </div>
      </div>
    </div>

    <!-- 步骤列表 -->
    <div ref="stepsContainer" class="monitor-steps">
      <div
        v-for="(step, index) in steps"
        :key="step.id"
        :ref="
          el => {
            if (el) stepRefs[index] = el
          }
        "
        class="step-item"
        :class="[`step-${step.status}`]"
      >
        <!-- 步骤头部 -->
        <div class="step-header" @click="toggleStep(step.id)">
          <span class="step-icon">{{ getStepIcon(step.status) }}</span>
          <div class="step-info">
            <span class="step-name">[步骤 {{ index + 1 }}/{{ steps.length }}] {{ step.name }}</span>
            <span v-if="step.duration" class="step-duration">
              ⏱️ {{ formatDuration(step.duration) }}
            </span>
          </div>
          <span class="step-toggle">
            {{ step.expanded ? '▼' : '▶' }}
          </span>
        </div>

        <!-- 步骤详情（可折叠） -->
        <div v-if="step.expanded" class="step-details">
          <!-- 输入数据 -->
          <div v-if="step.input && showInput" class="step-section">
            <div class="section-title">📝 输入数据:</div>
            <pre class="code-block input-block">{{ formatJSON(step.input) }}</pre>
          </div>

          <!-- 执行日志 -->
          <div v-if="step.logs && step.logs.length" class="step-section">
            <div class="section-title">📋 执行日志:</div>
            <div class="logs-container">
              <div
                v-for="(log, logIndex) in step.logs"
                :key="logIndex"
                class="log-item"
                :class="[`log-${log.level}`]"
              >
                <span class="log-time">{{ log.time }}</span>
                <span class="log-level">{{ log.level.toUpperCase() }}</span>
                <span class="log-message">{{ log.message }}</span>
                <pre v-if="log.data" class="log-data">{{ formatJSON(log.data) }}</pre>
              </div>
            </div>
          </div>

          <!-- 输出数据 -->
          <div v-if="step.output && showOutput" class="step-section">
            <div class="section-title">📤 输出数据:</div>
            <pre class="code-block output-block">{{ formatJSON(step.output) }}</pre>
          </div>

          <!-- 错误信息 -->
          <div v-if="step.error" class="step-section">
            <div class="section-title">❌ 错误信息:</div>
            <div class="error-block">
              <div class="error-message">{{ step.error.message }}</div>
              <div class="error-time">时间: {{ step.error.timestamp }}</div>
              <details v-if="step.error.stack" class="error-stack">
                <summary>查看堆栈跟踪</summary>
                <pre>{{ step.error.stack }}</pre>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div v-if="statistics" class="monitor-statistics">
      <div class="stat-item">
        <span class="stat-label">总步骤</span>
        <span class="stat-value">{{ statistics.totalSteps }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">已完成</span>
        <span class="stat-value success">{{ statistics.completedSteps }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">失败</span>
        <span class="stat-value error">{{ statistics.failedSteps }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">总耗时</span>
        <span class="stat-value">{{ formatDuration(statistics.totalDuration) }}</span>
      </div>
    </div>

    <!-- 控制按钮 -->
    <div class="monitor-controls">
      <el-button v-if="isRunning" type="warning" size="small" @click="$emit('pause')">
        ⏸️ 暂停
      </el-button>
      <el-button v-if="isPaused" type="primary" size="small" @click="$emit('resume')">
        ▶️ 继续
      </el-button>
      <el-button v-if="isRunning || isPaused" type="danger" size="small" @click="$emit('cancel')">
        ⏹️ 取消
      </el-button>
      <el-button type="info" size="small" @click="toggleShowInput">
        {{ showInput ? '隐藏输入' : '显示输入' }}
      </el-button>
      <el-button type="info" size="small" @click="toggleShowOutput">
        {{ showOutput ? '隐藏输出' : '显示输出' }}
      </el-button>
      <el-button type="info" size="small" @click="clearLogs"> 🗑️ 清空日志 </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onBeforeUpdate } from 'vue'

const props = defineProps({
  steps: {
    type: Array,
    default: () => []
  },
  currentStepIndex: {
    type: Number,
    default: 0
  },
  isRunning: {
    type: Boolean,
    default: false
  },
  isPaused: {
    type: Boolean,
    default: false
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  hasError: {
    type: Boolean,
    default: false
  },
  statistics: {
    type: Object,
    default: null
  },
  // 多智能体进度相关props
  multiAgentProgress: {
    type: Number,
    default: 0
  },
  multiAgentCurrentStep: {
    type: String,
    default: ''
  },
  showMultiAgentProgress: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['pause', 'resume', 'cancel', 'clear-logs'])

// 状态
const showInput = ref(false)
const showOutput = ref(false)
const stepsContainer = ref(null)
const stepRefs = ref([])

// 在每次更新前清空 stepRefs
onBeforeUpdate(() => {
  stepRefs.value = []
})

// 多智能体5个Phase
const multiAgentPhases = computed(() => [
  {
    name: 'Phase 1: 内容理解 (ContentAnalyst)',
    completed: props.multiAgentProgress > 20,
    current: props.multiAgentProgress <= 20 && props.multiAgentProgress > 0
  },
  {
    name: 'Phase 2: 场景设计 (SceneDesigner)',
    completed: props.multiAgentProgress > 40,
    current: props.multiAgentProgress > 20 && props.multiAgentProgress <= 40
  },
  {
    name: 'Phase 3: 层编排 (LayerOrchestrator)',
    completed: props.multiAgentProgress > 60,
    current: props.multiAgentProgress > 40 && props.multiAgentProgress <= 60
  },
  {
    name: 'Phase 4: 质量检查 (QualityDirector)',
    completed: props.multiAgentProgress > 80,
    current: props.multiAgentProgress > 60 && props.multiAgentProgress <= 80
  },
  {
    name: 'Phase 5: 视频合成 (VideoEngineer)',
    completed: props.multiAgentProgress >= 100,
    current: props.multiAgentProgress > 80 && props.multiAgentProgress < 100
  }
])

// 方法
const getStepIcon = status => {
  const icons = {
    pending: '⏸️',
    running: '⏳',
    success: '✅',
    error: '❌',
    retrying: '🔄'
  }
  return icons[status] || '⏸️'
}

const formatJSON = obj => {
  if (!obj) return ''

  // 过滤掉一些不需要显示的字段
  const filtered = { ...obj }
  delete filtered.videoFile // 文件对象太大
  delete filtered.video // 视频对象太大

  return JSON.stringify(filtered, null, 2)
}

const formatDuration = ms => {
  if (!ms) return '0ms'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

const toggleStep = stepId => {
  const step = props.steps.find(s => s.id === stepId)
  if (step) {
    step.expanded = !step.expanded
  }
}

const toggleShowInput = () => {
  showInput.value = !showInput.value
}

const toggleShowOutput = () => {
  showOutput.value = !showOutput.value
}

const clearLogs = () => {
  emit('clear-logs')
}

// 自动滚动到当前步骤
const scrollToCurrentStep = async () => {
  await nextTick()

  if (!stepsContainer.value || props.currentStepIndex < 0) return

  const currentStepElement = stepRefs.value[props.currentStepIndex]
  if (!currentStepElement) return

  // 使用 scrollIntoView 平滑滚动到当前步骤
  currentStepElement.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest'
  })
}

// 自动展开当前步骤
watch(
  () => props.currentStepIndex,
  newIndex => {
    if (newIndex >= 0 && newIndex < props.steps.length) {
      const currentStep = props.steps[newIndex]
      if (currentStep) {
        currentStep.expanded = true
      }
    }

    // 滚动到当前步骤
    scrollToCurrentStep()
  }
)

// 监听步骤状态变化，当步骤开始执行时自动滚动
watch(
  () => props.steps.map(s => s.status),
  () => {
    scrollToCurrentStep()
  },
  { deep: true }
)
</script>

<style scoped>
.workflow-monitor {
  width: 100%;
  height: 100%;
  background: #1e1e1e;
  color: #d4d4d4;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 头部 */
.monitor-header {
  padding: 16px;
  background: #252526;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.monitor-header h3 {
  margin: 0;
  font-size: 14px;
  color: #fff;
  font-weight: 600;
}

.monitor-status {
  font-size: 12px;
}

.status-running {
  color: #4a9eff;
}

.status-completed {
  color: #4ec9b0;
}

.status-error {
  color: #f48771;
}

.status-idle {
  color: #86868b;
}

/* 步骤列表 */
.monitor-steps {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.step-item {
  margin-bottom: 8px;
  border: 1px solid #3e3e42;
  border-radius: 4px;
  background: #252526;
  transition: all 0.2s;
}

.step-item.step-running {
  border-color: #4a9eff;
  box-shadow: 0 0 8px rgba(74, 158, 255, 0.3);
  animation: pulse-border 2s ease-in-out infinite;
}

@keyframes pulse-border {
  0%,
  100% {
    box-shadow: 0 0 8px rgba(74, 158, 255, 0.3);
  }
  50% {
    box-shadow: 0 0 16px rgba(74, 158, 255, 0.6);
  }
}

.step-item.step-success {
  border-color: #4ec9b0;
  animation: fade-in 0.3s ease-out;
}

@keyframes fade-in {
  from {
    opacity: 0.5;
    transform: translateX(-4px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.step-item.step-error {
  border-color: #f48771;
}

.step-item.step-retrying {
  border-color: #dcdcaa;
}

/* 步骤头部 */
.step-header {
  padding: 10px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  user-select: none;
}

.step-header:hover {
  background: #2a2d2e;
}

.step-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.step-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.step-name {
  font-size: 13px;
  color: #d4d4d4;
  font-weight: 500;
}

.step-duration {
  font-size: 11px;
  color: #86868b;
}

.step-toggle {
  font-size: 10px;
  color: #86868b;
  flex-shrink: 0;
}

/* 步骤详情 */
.step-details {
  padding: 12px;
  border-top: 1px solid #3e3e42;
  background: #1e1e1e;
}

.step-section {
  margin-bottom: 12px;
}

.step-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 12px;
  color: #4a9eff;
  margin-bottom: 6px;
  font-weight: 600;
}

/* 代码块 */
.code-block {
  background: #1e1e1e;
  border: 1px solid #3e3e42;
  border-radius: 4px;
  padding: 8px;
  margin: 0;
  overflow-x: auto;
  font-size: 11px;
  line-height: 1.5;
  color: #d4d4d4;
  max-height: 300px;
  overflow-y: auto;
}

.input-block {
  border-left: 3px solid #569cd6;
}

.output-block {
  border-left: 3px solid #4ec9b0;
}

/* 日志容器 */
.logs-container {
  background: #1e1e1e;
  border: 1px solid #3e3e42;
  border-radius: 4px;
  padding: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.log-item {
  padding: 4px 0;
  font-size: 11px;
  line-height: 1.4;
  border-bottom: 1px solid #2d2d30;
}

.log-item:last-child {
  border-bottom: none;
}

.log-time {
  color: #86868b;
  margin-right: 8px;
}

.log-level {
  display: inline-block;
  width: 60px;
  font-weight: 600;
  margin-right: 8px;
}

.log-item.log-error .log-level {
  color: #f48771;
}

.log-item.log-warning .log-level {
  color: #dcdcaa;
}

.log-item.log-success .log-level {
  color: #4ec9b0;
}

.log-item.log-info .log-level {
  color: #4a9eff;
}

.log-message {
  color: #d4d4d4;
}

.log-data {
  margin: 4px 0 0 76px;
  padding: 4px 8px;
  background: #252526;
  border-radius: 2px;
  font-size: 10px;
  color: #86868b;
}

/* 错误块 */
.error-block {
  background: #3f1f1f;
  border: 1px solid #f48771;
  border-radius: 4px;
  padding: 12px;
  color: #f48771;
}

.error-message {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
}

.error-time {
  font-size: 11px;
  color: #d4a5a5;
  margin-bottom: 8px;
}

.error-stack {
  margin-top: 8px;
}

.error-stack summary {
  cursor: pointer;
  font-size: 11px;
  color: #d4a5a5;
  user-select: none;
}

.error-stack pre {
  margin-top: 8px;
  padding: 8px;
  background: #2d1515;
  border-radius: 2px;
  font-size: 10px;
  overflow-x: auto;
}

/* 统计信息 */
.monitor-statistics {
  padding: 12px 16px;
  background: #2d2d30;
  border-top: 1px solid #333;
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 11px;
  color: #86868b;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #d4d4d4;
}

.stat-value.success {
  color: #4ec9b0;
}

.stat-value.error {
  color: #f48771;
}

/* 控制按钮 */
.monitor-controls {
  padding: 12px;
  background: #252526;
  border-top: 1px solid #333;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 滚动条样式 */
.monitor-steps::-webkit-scrollbar,
.logs-container::-webkit-scrollbar,
.code-block::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.monitor-steps::-webkit-scrollbar-track,
.logs-container::-webkit-scrollbar-track,
.code-block::-webkit-scrollbar-track {
  background: #1e1e1e;
}

.monitor-steps::-webkit-scrollbar-thumb,
.logs-container::-webkit-scrollbar-thumb,
.code-block::-webkit-scrollbar-thumb {
  background: #3e3e42;
  border-radius: 4px;
}

.monitor-steps::-webkit-scrollbar-thumb:hover,
.logs-container::-webkit-scrollbar-thumb:hover,
.code-block::-webkit-scrollbar-thumb:hover {
  background: #4e4e52;
}

/* 多智能体进度样式 */
.multi-agent-progress {
  padding: 16px;
  background: #252526;
  border-radius: 8px;
  margin-bottom: 16px;
  border: 1px solid #3e3e42;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-header h4 {
  margin: 0;
  font-size: 14px;
  color: #d4d4d4;
  font-weight: 600;
}

.progress-percentage {
  font-size: 18px;
  font-weight: 700;
  color: #4a9eff;
}

.main-progress {
  margin-bottom: 12px;
}

.current-step-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #1e1e1e;
  border-radius: 4px;
  margin-bottom: 12px;
  border-left: 3px solid #4a9eff;
}

.step-label {
  font-size: 12px;
  color: #86868b;
  font-weight: 600;
}

.step-text {
  font-size: 12px;
  color: #d4d4d4;
  flex: 1;
}

.phase-steps {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.phase-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #1e1e1e;
  border-radius: 6px;
  border: 1px solid #3e3e42;
  transition: all 0.3s ease;
}

.phase-item.phase-completed {
  background: #1e3a1e;
  border-color: #4ec9b0;
}

.phase-item.phase-current {
  background: #1e2a3e;
  border-color: #4a9eff;
  box-shadow: 0 0 8px rgba(74, 158, 255, 0.3);
}

.phase-item.phase-pending {
  opacity: 0.6;
}

.phase-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 14px;
  flex-shrink: 0;
}

.phase-completed .phase-icon {
  background: #4ec9b0;
  color: #1e1e1e;
}

.phase-current .phase-icon {
  background: #4a9eff;
  color: #1e1e1e;
}

.phase-pending .phase-icon {
  background: #3e3e42;
  color: #86868b;
}

.icon-completed,
.icon-current,
.icon-pending {
  font-weight: bold;
}

.phase-name {
  font-size: 12px;
  color: #d4d4d4;
  flex: 1;
  font-weight: 500;
}

.phase-completed .phase-name {
  color: #4ec9b0;
}

.phase-current .phase-name {
  color: #4a9eff;
  font-weight: 600;
}

</style>
