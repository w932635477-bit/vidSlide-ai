<template>
  <div class="timeline">
    <!-- 时间轴头部工具栏 -->
    <div class="timeline-header">
      <div class="timeline-info">
        <span class="timeline-label">{{ t('workspace.timeline.title') }}</span>
        <span class="marker-count"
          >{{ t('workspace.timeline.markerCount') }}: {{ markers.length }}</span
        >
      </div>

      <div class="timeline-controls">
        <div class="zoom-controls">
          <button class="zoom-btn" :disabled="zoomLevel <= 0.5" @click="zoomOut">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>

          <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>

          <button class="zoom-btn" :disabled="zoomLevel >= 3.0" @click="zoomIn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        <button class="action-btn primary" @click="addMarker">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {{ t('workspace.timeline.addMarker') }}
        </button>
      </div>
    </div>

    <!-- 时间轴主体 -->
    <div ref="timelineBody" class="timeline-body">
      <!-- 时间刻度 -->
      <div class="timeline-ruler">
        <div
          v-for="tick in visibleTicks"
          :key="tick.time"
          class="ruler-tick"
          :style="{ left: tick.position + 'px' }"
        >
          <div class="tick-line"></div>
          <div class="tick-label">{{ formatTime(tick.time) }}</div>
        </div>
      </div>

      <!-- 时间轴轨道 -->
      <div class="timeline-track">
        <!-- 背景轨道 -->
        <div class="track-background"></div>

        <!-- 播放进度指示器 -->
        <div
          v-if="currentTime >= 0"
          class="current-time-indicator"
          :style="{ left: timeToPosition(currentTime) + 'px' }"
        ></div>

        <!-- 时间轴标记 -->
        <div
          v-for="marker in markers"
          :key="marker.id"
          class="timeline-marker"
          :class="{ active: marker.id === selectedMarkerId }"
          :style="{ left: timeToPosition(marker.time) + 'px' }"
          @mousedown="startDrag(marker)"
          @click.stop="selectMarker(marker)"
        >
          <div class="marker-handle">
            <div class="marker-line"></div>
            <div class="marker-dot"></div>
          </div>

          <!-- 标记信息提示 -->
          <div class="marker-tooltip">
            <div class="marker-time">{{ formatTime(marker.time) }}</div>
            <div class="marker-type">{{ getMarkerTypeText(marker.type) }}</div>
          </div>
        </div>

        <!-- 拖拽中的标记预览 -->
        <div v-if="draggingMarker" class="marker-preview" :style="{ left: dragPosition + 'px' }">
          <div class="marker-handle preview">
            <div class="marker-line"></div>
            <div class="marker-dot"></div>
          </div>
        </div>
      </div>

      <!-- 时间轴底部控制栏 -->
      <div class="timeline-footer">
        <div class="playback-controls">
          <button class="control-btn" :disabled="!markers.length" @click="goToStart">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="19,20 9,12 19,4" />
              <line x1="5" y1="4" x2="5" y2="20" />
            </svg>
          </button>

          <button class="control-btn" :disabled="!markers.length" @click="previousMarker">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="15,20 5,12 15,4" />
            </svg>
          </button>

          <button class="control-btn" :disabled="!markers.length" @click="nextMarker">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="9,20 19,12 9,4" />
            </svg>
          </button>

          <button class="control-btn" :disabled="!markers.length" @click="goToEnd">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5,20 15,12 5,4" />
              <line x1="19" y1="4" x2="19" y2="20" />
            </svg>
          </button>
        </div>

        <div class="marker-actions">
          <button v-if="selectedMarkerId" class="action-btn danger" @click="deleteSelectedMarker">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3,6 5,6 21,6" />
              <path
                d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"
              />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
            {{ t('workspace.timeline.removeMarker') }}
          </button>

          <button class="action-btn secondary" :disabled="!markers.length" @click="clearAllMarkers">
            {{ t('workspace.timeline.clearAll') }}
          </button>
        </div>
      </div>
    </div>

    <!-- 添加标记对话框 -->
    <div v-if="showAddDialog" class="add-marker-dialog" @click.self="closeAddDialog">
      <div class="dialog-content">
        <h3 class="dialog-title">{{ t('workspace.timeline.addNewMarker') }}</h3>

        <div class="form-group">
          <label class="form-label">{{ t('workspace.timeline.markerType') }}</label>
          <select v-model="newMarkerType" class="form-select">
            <option value="text">{{ t('workspace.timeline.types.text') }}</option>
            <option value="image">{{ t('workspace.timeline.types.image') }}</option>
            <option value="chart">{{ t('workspace.timeline.types.chart') }}</option>
            <option value="transition">{{ t('workspace.timeline.types.transition') }}</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">{{ t('workspace.timeline.markerTime') }}</label>
          <input
            v-model.number="newMarkerTime"
            type="number"
            min="0"
            :max="duration"
            step="0.1"
            class="form-input"
          />
          <span class="time-display">{{ formatTime(newMarkerTime) }}</span>
        </div>

        <div class="dialog-actions">
          <button class="action-btn secondary" @click="closeAddDialog">
            {{ t('workspace.timeline.cancel') }}
          </button>
          <button class="action-btn primary" @click="confirmAddMarker">
            {{ t('workspace.timeline.confirm') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup name="Timeline">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'

// 国际化
const { t } = useI18n()

// 定义组件属性
const props = defineProps({
  duration: {
    type: Number,
    default: 120 // 默认2分钟
  },
  currentTime: {
    type: Number,
    default: 0
  },
  markers: {
    type: Array,
    default: () => []
  },
  selectedMarkerId: {
    type: [String, Number],
    default: null
  }
})

// 定义组件事件
const emit = defineEmits([
  'marker-added',
  'marker-removed',
  'marker-selected',
  'marker-moved',
  'markers-cleared'
])

// 响应式数据
const timelineBody = ref(null)
const zoomLevel = ref(1.0)
const showAddDialog = ref(false)
const newMarkerType = ref('text')
const newMarkerTime = ref(0)
const draggingMarker = ref(null)
const dragPosition = ref(0)
const isDragging = ref(false)

// 计算属性
const visibleTicks = computed(() => {
  const ticks = []
  const interval = Math.max(1, Math.floor(10 / zoomLevel.value)) // 根据缩放调整间隔
  const totalTicks = Math.ceil(props.duration / interval)

  for (let i = 0; i <= totalTicks; i++) {
    const time = i * interval
    if (time <= props.duration) {
      ticks.push({
        time,
        position: timeToPosition(time)
      })
    }
  }

  return ticks
})

// 工具函数
const timeToPosition = time => {
  if (!timelineBody.value) return 0
  const trackWidth = timelineBody.value.clientWidth - 40 // 减去padding
  return (time / props.duration) * trackWidth * zoomLevel.value
}

const positionToTime = position => {
  if (!timelineBody.value) return 0
  const trackWidth = timelineBody.value.clientWidth - 40
  return (position / (trackWidth * zoomLevel.value)) * props.duration
}

const formatTime = seconds => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 10)
  return `${mins}:${secs.toString().padStart(2, '0')}.${ms}`
}

const getMarkerTypeText = type => {
  const types = {
    text: t('workspace.timeline.types.text'),
    image: t('workspace.timeline.types.image'),
    chart: t('workspace.timeline.types.chart'),
    transition: t('workspace.timeline.types.transition')
  }
  return types[type] || type
}

// 缩放控制
const zoomIn = () => {
  if (zoomLevel.value < 3.0) {
    zoomLevel.value = Math.min(3.0, zoomLevel.value + 0.5)
  }
}

const zoomOut = () => {
  if (zoomLevel.value > 0.5) {
    zoomLevel.value = Math.max(0.5, zoomLevel.value - 0.5)
  }
}

// 标记管理
const addMarker = () => {
  newMarkerTime.value = props.currentTime || 0
  showAddDialog.value = true
}

const confirmAddMarker = () => {
  if (newMarkerTime.value < 0 || newMarkerTime.value > props.duration) {
    ElMessage.error(t('workspace.timeline.errors.invalidTime'))
    return
  }

  const newMarker = {
    id: Date.now(),
    time: newMarkerTime.value,
    type: newMarkerType.value,
    title: `${getMarkerTypeText(newMarkerType.value)} ${props.markers.length + 1}`
  }

  emit('marker-added', newMarker)
  closeAddDialog()
  ElMessage.success(t('workspace.timeline.markerAdded'))
}

const closeAddDialog = () => {
  showAddDialog.value = false
  newMarkerType.value = 'text'
  newMarkerTime.value = 0
}

const selectMarker = marker => {
  emit('marker-selected', marker.id)
}

const deleteSelectedMarker = () => {
  if (!props.selectedMarkerId) return

  ElMessageBox.confirm(t('workspace.timeline.confirmDelete'), t('workspace.timeline.deleteTitle'), {
    confirmButtonText: t('workspace.timeline.confirm'),
    cancelButtonText: t('workspace.timeline.cancel'),
    type: 'warning'
  }).then(() => {
    emit('marker-removed', props.selectedMarkerId)
    ElMessage.success(t('workspace.timeline.markerDeleted'))
  })
}

const clearAllMarkers = () => {
  ElMessageBox.confirm(
    t('workspace.timeline.confirmClearAll'),
    t('workspace.timeline.clearTitle'),
    {
      confirmButtonText: t('workspace.timeline.confirm'),
      cancelButtonText: t('workspace.timeline.cancel'),
      type: 'warning'
    }
  ).then(() => {
    emit('markers-cleared')
    ElMessage.success(t('workspace.timeline.allMarkersCleared'))
  })
}

// 拖拽功能
const startDrag = marker => {
  draggingMarker.value = marker
  isDragging.value = true

  const handleMouseMove = e => {
    if (!timelineBody.value) return

    const rect = timelineBody.value.getBoundingClientRect()
    const x = e.clientX - rect.left - 20 // 减去左padding
    const time = positionToTime(x)

    dragPosition.value = Math.max(0, Math.min(timeToPosition(props.duration), x))

    // 实时更新标记时间（但不触发事件）
    if (draggingMarker.value) {
      draggingMarker.value.time = Math.max(0, Math.min(props.duration, time))
    }
  }

  const handleMouseUp = () => {
    if (draggingMarker.value) {
      emit('marker-moved', {
        id: draggingMarker.value.id,
        newTime: draggingMarker.value.time
      })
    }

    draggingMarker.value = null
    isDragging.value = false

    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

// 播放控制
const goToStart = () => {
  const firstMarker = props.markers[0]
  if (firstMarker) {
    emit('marker-selected', firstMarker.id)
  }
}

const goToEnd = () => {
  const lastMarker = props.markers[props.markers.length - 1]
  if (lastMarker) {
    emit('marker-selected', lastMarker.id)
  }
}

const previousMarker = () => {
  if (!props.selectedMarkerId || props.markers.length === 0) return

  const currentIndex = props.markers.findIndex(m => m.id === props.selectedMarkerId)
  if (currentIndex > 0) {
    emit('marker-selected', props.markers[currentIndex - 1].id)
  }
}

const nextMarker = () => {
  if (!props.selectedMarkerId || props.markers.length === 0) return

  const currentIndex = props.markers.findIndex(m => m.id === props.selectedMarkerId)
  if (currentIndex < props.markers.length - 1) {
    emit('marker-selected', props.markers[currentIndex + 1].id)
  }
}

// 生命周期
onMounted(() => {
  // 监听键盘事件
  const handleKeyDown = e => {
    if (e.key === 'Delete' && props.selectedMarkerId) {
      deleteSelectedMarker()
    }
  }

  document.addEventListener('keydown', handleKeyDown)

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })
})

// 监听duration变化，调整缩放
watch(
  () => props.duration,
  () => {
    // 确保缩放级别合理
    if (zoomLevel.value * props.duration > 10000) {
      zoomLevel.value = Math.max(0.5, 10000 / props.duration)
    }
  }
)

// 暴露方法给父组件
defineExpose({
  zoomIn,
  zoomOut,
  addMarker,
  clearAllMarkers
})
</script>

<style scoped>
.timeline {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

/* 时间轴头部 */
.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.timeline-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.timeline-label {
  font-weight: 600;
  color: #1f2937;
}

.marker-count {
  font-size: 14px;
  color: #6b7280;
}

.timeline-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}

.zoom-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.zoom-btn:hover:not(:disabled) {
  background: #f3f4f6;
  color: #374151;
}

.zoom-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.zoom-level {
  font-size: 12px;
  color: #6b7280;
  min-width: 32px;
  text-align: center;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.primary {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.action-btn.primary:hover {
  background: #2563eb;
}

.action-btn.danger {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.action-btn.danger:hover {
  background: #dc2626;
}

.action-btn.secondary:hover {
  background: #f9fafb;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn svg {
  width: 16px;
  height: 16px;
}

/* 时间轴主体 */
.timeline-body {
  position: relative;
  height: 120px;
}

/* 时间刻度 */
.timeline-ruler {
  position: relative;
  height: 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.ruler-tick {
  position: absolute;
  top: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.tick-line {
  width: 1px;
  height: 12px;
  background: #d1d5db;
}

.tick-label {
  font-size: 10px;
  color: #6b7280;
  margin-top: 2px;
  white-space: nowrap;
}

/* 时间轴轨道 */
.timeline-track {
  position: relative;
  height: 60px;
  padding: 0 20px;
  background: #ffffff;
}

.track-background {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
}

/* 当前时间指示器 */
.current-time-indicator {
  position: absolute;
  top: 16px;
  width: 2px;
  height: 12px;
  background: #ef4444;
  z-index: 10;
  border-radius: 1px;
}

.current-time-indicator::after {
  content: '';
  position: absolute;
  top: -4px;
  left: -2px;
  width: 6px;
  height: 6px;
  background: #ef4444;
  border-radius: 50%;
}

/* 时间轴标记 */
.timeline-marker {
  position: absolute;
  top: 10px;
  height: 40px;
  cursor: grab;
  z-index: 5;
}

.timeline-marker.active {
  z-index: 15;
}

.timeline-marker:active {
  cursor: grabbing;
}

.marker-handle {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
}

.marker-line {
  width: 2px;
  height: 32px;
  background: #3b82f6;
  border-radius: 1px;
  transition: all 0.2s ease;
}

.timeline-marker.active .marker-line {
  background: #ef4444;
  width: 3px;
}

.marker-dot {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background: #3b82f6;
  border: 2px solid #ffffff;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.timeline-marker.active .marker-dot {
  background: #ef4444;
  width: 16px;
  height: 16px;
}

.marker-preview .marker-line {
  background: #10b981;
  opacity: 0.7;
}

.marker-preview .marker-dot {
  background: #10b981;
}

/* 标记提示 */
.marker-tooltip {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background: #1f2937;
  color: white;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  z-index: 20;
}

.marker-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: #1f2937;
}

.timeline-marker:hover .marker-tooltip {
  opacity: 1;
}

.marker-time {
  font-weight: 500;
}

.marker-type {
  font-size: 11px;
  opacity: 0.8;
}

/* 时间轴底部控制栏 */
.timeline-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.playback-controls {
  display: flex;
  gap: 4px;
}

.control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-btn:hover:not(:disabled) {
  border-color: #9ca3af;
  color: #374151;
  background: #f9fafb;
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-btn svg {
  width: 16px;
  height: 16px;
}

.marker-actions {
  display: flex;
  gap: 8px;
}

/* 添加标记对话框 */
.add-marker-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  background: white;
  border-radius: 8px;
  padding: 24px;
  width: 400px;
  max-width: 90vw;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.form-select,
.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.form-select:focus,
.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.time-display {
  display: inline-block;
  margin-left: 8px;
  font-size: 12px;
  color: #6b7280;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .timeline-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .timeline-controls {
    justify-content: space-between;
  }

  .timeline-footer {
    flex-direction: column;
    gap: 12px;
  }

  .marker-actions {
    justify-content: center;
  }

  .dialog-content {
    width: 95vw;
    padding: 16px;
  }
}
</style>
