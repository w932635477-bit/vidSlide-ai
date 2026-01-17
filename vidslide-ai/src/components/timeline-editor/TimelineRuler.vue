<template>
  <div class="timeline-ruler" :style="{ width: rulerWidth + 'px' }">
    <!-- 时间标记 -->
    <div class="ruler-marks">
      <div
        v-for="mark in timeMarks"
        :key="mark.time"
        class="time-mark"
        :style="{ left: mark.position + 'px' }"
      >
        <div class="mark-line" :class="{ major: mark.isMajor }"></div>
        <span v-if="mark.isMajor" class="mark-label">{{ formatTime(mark.time) }}</span>
      </div>
    </div>

    <!-- 播放头/游标 -->
    <div
      class="playhead"
      :style="{ left: playheadPosition + 'px' }"
      @mousedown="handlePlayheadDragStart"
      role="slider"
      :aria-valuenow="currentTime"
      :aria-valuemin="0"
      :aria-valuemax="duration"
      aria-label="播放头位置"
      tabindex="0"
    >
      <div class="playhead-handle"></div>
      <div class="playhead-line"></div>
    </div>

    <!-- 关键帧标记 -->
    <div
      v-for="(keyframe, index) in keyframes"
      :key="index"
      class="keyframe-mark"
      :style="{ left: timeToPosition(keyframe.time) + 'px' }"
      @click="$emit('keyframe-click', keyframe)"
      :title="`关键帧 ${formatTime(keyframe.time)}s`"
    >
      <div class="keyframe-diamond"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  duration: {
    type: Number,
    default: 10
  },
  currentTime: {
    type: Number,
    default: 0
  },
  zoom: {
    type: Number,
    default: 1
  },
  pixelsPerSecond: {
    type: Number,
    default: 100
  },
  keyframes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'update:currentTime',
  'playhead-drag-start',
  'keyframe-click'
])

// 计算标尺宽度
const rulerWidth = computed(() => {
  return props.duration * props.pixelsPerSecond * props.zoom
})

// 计算播放头位置
const playheadPosition = computed(() => {
  return props.currentTime * props.pixelsPerSecond * props.zoom
})

// 生成时间标记
const timeMarks = computed(() => {
  const marks = []
  const interval = props.zoom >= 2 ? 0.5 : props.zoom >= 1 ? 1 : 2
  const majorInterval = props.zoom >= 2 ? 2 : props.zoom >= 1 ? 5 : 10

  for (let time = 0; time <= props.duration; time += interval) {
    marks.push({
      time,
      position: time * props.pixelsPerSecond * props.zoom,
      isMajor: time % majorInterval === 0
    })
  }

  return marks
})

// 时间转换为位置
const timeToPosition = (time) => {
  return time * props.pixelsPerSecond * props.zoom
}

// 格式化时间显示
const formatTime = (time) => {
  return time.toFixed(1)
}

// 处理播放头拖拽
const handlePlayheadDragStart = (event) => {
  emit('playhead-drag-start', event)
}
</script>

<style scoped>
.timeline-ruler {
  position: relative;
  height: 60px;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  user-select: none;
}

.ruler-marks {
  position: relative;
  width: 100%;
  height: 100%;
}

.time-mark {
  position: absolute;
  top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mark-line {
  width: 1px;
  height: 8px;
  background: rgba(255, 255, 255, 0.3);
}

.mark-line.major {
  height: 16px;
  background: rgba(255, 255, 255, 0.5);
}

.mark-label {
  margin-top: 4px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}

.playhead {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  cursor: ew-resize;
  z-index: 10;
}

.playhead-handle {
  position: absolute;
  top: 0;
  left: -6px;
  width: 14px;
  height: 14px;
  background: #ff4444;
  border: 2px solid #fff;
  border-radius: 50%;
  cursor: grab;
}

.playhead-handle:active {
  cursor: grabbing;
}

.playhead-line {
  position: absolute;
  top: 14px;
  left: 0;
  width: 2px;
  height: calc(100% - 14px);
  background: #ff4444;
  pointer-events: none;
}

.keyframe-mark {
  position: absolute;
  top: 35px;
  width: 12px;
  height: 12px;
  margin-left: -6px;
  cursor: pointer;
  z-index: 5;
}

.keyframe-diamond {
  width: 8px;
  height: 8px;
  background: #00aaff;
  border: 1px solid #fff;
  transform: rotate(45deg);
  transition: all 0.2s ease;
}

.keyframe-mark:hover .keyframe-diamond {
  background: #00ccff;
  width: 10px;
  height: 10px;
  margin: -1px 0 0 -1px;
}
</style>
