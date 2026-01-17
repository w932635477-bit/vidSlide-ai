<template>
  <div 
    class="timeline-track"
    :class="{ 
      selected: isSelected,
      'can-drop': canDrop 
    }"
    @click="handleTrackClick"
    @dragover.prevent="handleDragOver"
    @drop="handleDrop"
    :style="{ width: trackWidth + 'px' }"
  >
    <!-- 轨道头部 -->
    <div class="track-header">
      <div class="track-info">
        <el-input
          v-model="localTrackName"
          @change="$emit('update:name', localTrackName)"
          size="small"
          placeholder="轨道名称"
          class="track-name-input"
        />
        <div class="track-controls">
          <el-button
            :icon="track.visible ? 'View' : 'Hide'"
            size="small"
            @click.stop="$emit('toggle-visibility')"
            :title="track.visible ? '隐藏' : '显示'"
          />
          <el-button
            :icon="track.locked ? 'Lock' : 'Unlock'"
            size="small"
            @click.stop="$emit('toggle-lock')"
            :title="track.locked ? '解锁' : '锁定'"
          />
        </div>
      </div>
    </div>

    <!-- 轨道内容区域 -->
    <div class="track-content" :style="{ opacity: track.visible ? 1 : 0.5 }">
      <TimelineClip
        v-for="clip in track.clips"
        :key="clip.id"
        :clip="clip"
        :zoom="zoom"
        :pixels-per-second="pixelsPerSecond"
        :is-selected="selectedClipId === clip.id"
        :is-locked="track.locked"
        @click="handleClipClick(clip)"
        @drag-start="handleClipDragStart(clip, $event)"
        @resize-start="handleClipResizeStart(clip, $event)"
        @delete="$emit('delete-clip', clip.id)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import TimelineClip from './TimelineClip.vue'

const props = defineProps({
  track: {
    type: Object,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  selectedClipId: {
    type: [String, Number, null],
    default: null
  },
  zoom: {
    type: Number,
    default: 1
  },
  pixelsPerSecond: {
    type: Number,
    default: 100
  },
  duration: {
    type: Number,
    default: 10
  }
})

const emit = defineEmits([
  'select',
  'update:name',
  'toggle-visibility',
  'toggle-lock',
  'clip-click',
  'clip-drag-start',
  'clip-resize-start',
  'delete-clip',
  'drop-clip'
])

const localTrackName = ref(props.track.name || '未命名轨道')
const canDrop = ref(false)

// 计算轨道宽度
const trackWidth = computed(() => {
  return props.duration * props.pixelsPerSecond * props.zoom
})

// 处理轨道点击
const handleTrackClick = () => {
  emit('select', props.track.id)
}

// 处理片段点击
const handleClipClick = (clip) => {
  emit('clip-click', clip)
}

// 处理片段拖拽开始
const handleClipDragStart = (clip, event) => {
  if (props.track.locked) return
  emit('clip-drag-start', { clip, event, trackId: props.track.id })
}

// 处理片段调整大小开始
const handleClipResizeStart = (clip, event) => {
  if (props.track.locked) return
  emit('clip-resize-start', { clip, event, trackId: props.track.id })
}

// 处理拖拽悬停
const handleDragOver = (event) => {
  if (props.track.locked) return
  canDrop.value = true
  event.dataTransfer.dropEffect = 'move'
}

// 处理放置
const handleDrop = (event) => {
  if (props.track.locked) return
  canDrop.value = false
  
  const rect = event.currentTarget.getBoundingClientRect()
  const offsetX = event.clientX - rect.left
  const time = offsetX / (props.pixelsPerSecond * props.zoom)
  
  emit('drop-clip', {
    trackId: props.track.id,
    time: Math.max(0, time)
  })
}
</script>

<style scoped>
.timeline-track {
  position: relative;
  min-height: 80px;
  border: 2px solid transparent;
  border-radius: 4px;
  transition: all 0.2s ease;
  margin-bottom: 8px;
}

.timeline-track.selected {
  border-color: rgba(0, 122, 255, 0.5);
  background: rgba(0, 122, 255, 0.05);
}

.timeline-track.can-drop {
  background: rgba(0, 255, 0, 0.1);
  border-color: rgba(0, 255, 0, 0.3);
}

.track-header {
  position: sticky;
  left: 0;
  z-index: 10;
  background: rgba(30, 30, 30, 0.95);
  padding: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.track-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.track-name-input {
  flex: 1;
  max-width: 200px;
}

.track-controls {
  display: flex;
  gap: 4px;
}

.track-content {
  position: relative;
  min-height: 60px;
  padding: 8px 0;
  transition: opacity 0.2s ease;
}
</style>
