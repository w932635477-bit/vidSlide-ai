<template>
  <div
    class="timeline-clip"
    :class="{ 
      selected: isSelected,
      locked: isLocked,
      dragging: isDragging
    }"
    :style="clipStyle"
    @click.stop="handleClick"
    @mousedown="handleMouseDown"
    draggable="true"
    @dragstart="handleDragStart"
  >
    <!-- 片段内容 -->
    <div class="clip-content">
      <div class="clip-icon">{{ getClipIcon(clip.type) }}</div>
      <div class="clip-info">
        <div class="clip-name">{{ clip.name }}</div>
        <div class="clip-time">{{ formatTime(clip.startTime) }}s - {{ formatTime(clip.endTime) }}s</div>
      </div>
    </div>

    <!-- 关键帧指示器 -->
    <div v-if="clip.keyframes && clip.keyframes.length > 0" class="keyframe-indicators">
      <div
        v-for="(kf, idx) in clip.keyframes"
        :key="idx"
        class="keyframe-indicator"
        :style="{ left: getKeyframePosition(kf.time) + '%' }"
        :title="`关键帧: ${kf.property}`"
      >
        <div class="keyframe-dot"></div>
      </div>
    </div>

    <!-- 调整大小手柄 -->
    <div
      v-if="!isLocked"
      class="resize-handle resize-left"
      @mousedown.stop="handleResizeStart('left', $event)"
      title="调整开始时间"
    ></div>
    <div
      v-if="!isLocked"
      class="resize-handle resize-right"
      @mousedown.stop="handleResizeStart('right', $event)"
      title="调整结束时间"
    ></div>

    <!-- 删除按钮 -->
    <el-button
      v-if="isSelected && !isLocked"
      class="delete-button"
      type="danger"
      size="small"
      icon="Delete"
      circle
      @click.stop="$emit('delete')"
      title="删除片段"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  clip: {
    type: Object,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  zoom: {
    type: Number,
    default: 1
  },
  pixelsPerSecond: {
    type: Number,
    default: 100
  }
})

const emit = defineEmits(['click', 'drag-start', 'resize-start', 'delete'])

const isDragging = ref(false)

// 计算片段样式
const clipStyle = computed(() => {
  const startPos = props.clip.startTime * props.pixelsPerSecond * props.zoom
  const duration = props.clip.endTime - props.clip.startTime
  const width = duration * props.pixelsPerSecond * props.zoom

  return {
    left: `${startPos}px`,
    width: `${width}px`,
    background: getClipColor(props.clip.type)
  }
})

// 获取片段颜色
const getClipColor = (type) => {
  const colors = {
    video: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(37, 99, 235, 0.8))',
    audio: 'linear-gradient(135deg, rgba(16, 185, 129, 0.8), rgba(5, 150, 105, 0.8))',
    image: 'linear-gradient(135deg, rgba(245, 158, 11, 0.8), rgba(217, 119, 6, 0.8))',
    text: 'linear-gradient(135deg, rgba(236, 72, 153, 0.8), rgba(219, 39, 119, 0.8))',
    effect: 'linear-gradient(135deg, rgba(168, 85, 247, 0.8), rgba(147, 51, 234, 0.8))'
  }
  return colors[type] || 'linear-gradient(135deg, rgba(107, 114, 128, 0.8), rgba(75, 85, 99, 0.8))'
}

// 获取片段图标
const getClipIcon = (type) => {
  const icons = {
    video: '🎬',
    audio: '🎵',
    image: '🖼️',
    text: '📝',
    effect: '✨'
  }
  return icons[type] || '📄'
}

// 格式化时间
const formatTime = (time) => {
  return time.toFixed(2)
}

// 获取关键帧位置百分比
const getKeyframePosition = (time) => {
  const clipDuration = props.clip.endTime - props.clip.startTime
  const relativeTime = time - props.clip.startTime
  return (relativeTime / clipDuration) * 100
}

// 处理点击
const handleClick = () => {
  if (!props.isLocked) {
    emit('click')
  }
}

// 处理鼠标按下
const handleMouseDown = (event) => {
  if (props.isLocked) {
    event.preventDefault()
  }
}

// 处理拖拽开始
const handleDragStart = (event) => {
  if (props.isLocked) {
    event.preventDefault()
    return
  }
  isDragging.value = true
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('clipId', props.clip.id)
  emit('drag-start', event)
  
  // 拖拽结束后重置状态
  setTimeout(() => {
    isDragging.value = false
  }, 100)
}

// 处理调整大小开始
const handleResizeStart = (side, event) => {
  emit('resize-start', { side, event })
}
</script>

<style scoped>
.timeline-clip {
  position: absolute;
  top: 8px;
  height: 44px;
  border-radius: 4px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  cursor: move;
  transition: all 0.2s ease;
  user-select: none;
}

.timeline-clip:hover {
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.timeline-clip.selected {
  border-color: rgba(0, 122, 255, 0.8);
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.3);
}

.timeline-clip.locked {
  cursor: not-allowed;
  opacity: 0.6;
}

.timeline-clip.dragging {
  opacity: 0.5;
}

.clip-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  height: 100%;
  color: white;
}

.clip-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.clip-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.clip-name {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.clip-time {
  font-size: 11px;
  opacity: 0.8;
  white-space: nowrap;
}

.keyframe-indicators {
  position: absolute;
  bottom: 2px;
  left: 0;
  right: 0;
  height: 4px;
}

.keyframe-indicator {
  position: absolute;
  top: 0;
  width: 8px;
  height: 8px;
  margin-left: -4px;
}

.keyframe-dot {
  width: 6px;
  height: 6px;
  background: #00aaff;
  border: 1px solid white;
  border-radius: 50%;
  box-shadow: 0 0 4px rgba(0, 170, 255, 0.6);
}

.resize-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 8px;
  cursor: ew-resize;
  background: rgba(255, 255, 255, 0.1);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.timeline-clip:hover .resize-handle {
  opacity: 1;
}

.resize-left {
  left: 0;
  border-right: 2px solid rgba(255, 255, 255, 0.5);
}

.resize-right {
  right: 0;
  border-left: 2px solid rgba(255, 255, 255, 0.5);
}

.delete-button {
  position: absolute;
  top: -12px;
  right: -12px;
  z-index: 10;
}
</style>
