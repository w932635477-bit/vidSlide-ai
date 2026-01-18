<template>
  <div class="timeline-editor" role="region" aria-labelledby="timeline-heading">
    <!-- 时间轴编辑器标题区域 -->
    <TimelineHeader
      :is-processing="isProcessing"
      :processing-progress="processingProgress"
      :processing-message="processingMessage"
    />

    <!-- 时间轴工具栏 -->
    <TimelineToolbar
      :is-playing="isPlaying"
      :current-time="currentTime"
      :duration="totalTime"
      :zoom="zoomLevel"
      :snap-enabled="snapEnabled"
      :snap-interval="snapInterval"
      :can-delete-track="selectedTrackId !== null"
      @toggle-play="togglePlay"
      @reset="stop"
      @update:current-time="updateCurrentTime"
      @update:zoom="updateZoom"
      @add-track="addTrack"
      @delete-track="deleteSelectedTrack"
      @update:snap-enabled="snapEnabled = $event"
      @update:snap-interval="snapInterval = $event"
    />

    <!-- 时间轴主体区域 -->
    <div class="timeline-main">
      <el-scrollbar ref="timelineScrollbar" class="timeline-scrollbar">
        <div class="timeline-content" :style="{ width: timelineWidth + 'px' }">
          <!-- 时间标尺 -->
          <TimelineRuler
            :duration="totalTime"
            :current-time="currentTime"
            :zoom="zoomLevel"
            :pixels-per-second="pixelsPerSecond"
            :keyframes="allKeyframes"
            @update:current-time="updateCurrentTime"
            @playhead-drag-start="handlePlayheadDragStart"
            @keyframe-click="handleKeyframeClick"
          />

          <!-- 轨道区域 -->
          <div class="tracks-container">
            <TimelineTrack
              v-for="track in tracks"
              :key="track.id"
              :track="track"
              :is-selected="selectedTrackId === track.id"
              :selected-clip-id="selectedClipId"
              :zoom="zoomLevel"
              :pixels-per-second="pixelsPerSecond"
              :duration="totalTime"
              @select="selectTrack(track.id)"
              @update:name="updateTrackName(track.id, $event)"
              @toggle-visibility="toggleTrackVisibility(track.id)"
              @toggle-lock="toggleTrackLock(track.id)"
              @clip-click="selectClip"
              @clip-drag-start="handleClipDragStart"
              @clip-resize-start="handleClipResizeStart"
              @delete-clip="deleteClip"
              @drop-clip="handleDropClip"
            />
          </div>

          <!-- 空状态提示 -->
          <div v-if="tracks.length === 0" class="empty-timeline">
            <el-empty description="暂无轨道">
              <template #image>
                <div style="font-size: 48px">🎬</div>
              </template>
              <el-button type="primary" @click="addTrack"> 添加第一个轨道 </el-button>
            </el-empty>
          </div>
        </div>
      </el-scrollbar>

      <!-- 属性面板 -->
      <TimelineProperties
        :selected-item="selectedItemData"
        @update-property="handlePropertyUpdate"
        @close="clearSelection"
        @add-keyframe="addKeyframeAtCurrentTime"
        @delete-keyframe="deleteKeyframe"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import TimelineHeader from './timeline-editor/TimelineHeader.vue'
import TimelineToolbar from './timeline-editor/TimelineToolbar.vue'
import TimelineRuler from './timeline-editor/TimelineRuler.vue'
import TimelineTrack from './timeline-editor/TimelineTrack.vue'
import TimelineProperties from './timeline-editor/TimelineProperties.vue'

// Props
const props = defineProps({
  totalTime: {
    type: Number,
    default: 120 // 默认2分钟
  },
  frameRate: {
    type: Number,
    default: 30 // 默认30fps
  },
  initialTracks: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits([
  'time-changed',
  'track-added',
  'track-removed',
  'clip-selected',
  'clip-updated',
  'keyframe-selected',
  'keyframe-updated',
  'play-started',
  'play-paused',
  'play-stopped'
])

// 状态管理
const currentTime = ref(0)
const zoomLevel = ref(1)
const isPlaying = ref(false)
const playInterval = ref(null)
const snapEnabled = ref(true)
const snapInterval = ref(0.5)

// 轨道和选择状态
const tracks = ref([
  {
    id: 'track-1',
    name: '视频轨道 1',
    type: 'video',
    visible: true,
    locked: false,
    clips: []
  }
])

const selectedTrackId = ref(null)
const selectedClipId = ref(null)
const selectedKeyframeId = ref(null)

// 处理状态
const isProcessing = ref(false)
const processingProgress = ref(0)
const processingMessage = ref('')

// 拖拽状态
const isDragging = ref(false)
const dragData = ref(null)
const timelineScrollbar = ref(null)

// 计算属性
const pixelsPerSecond = computed(() => 100)

const timelineWidth = computed(() => {
  return props.totalTime * pixelsPerSecond.value * zoomLevel.value
})

const selectedClip = computed(() => {
  if (!selectedClipId.value) return null
  for (const track of tracks.value) {
    const clip = track.clips.find(c => c.id === selectedClipId.value)
    if (clip) return { ...clip, trackId: track.id }
  }
  return null
})

const selectedKeyframe = computed(() => {
  if (!selectedKeyframeId.value || !selectedClip.value) return null
  return selectedClip.value.keyframes?.find(k => k.id === selectedKeyframeId.value)
})

const selectedItemData = computed(() => {
  if (selectedKeyframe.value) {
    return {
      type: 'keyframe',
      data: selectedKeyframe.value
    }
  }
  if (selectedClip.value) {
    return {
      type: 'clip',
      data: selectedClip.value
    }
  }
  return null
})

const allKeyframes = computed(() => {
  const keyframes = []
  tracks.value.forEach(track => {
    track.clips.forEach(clip => {
      if (clip.keyframes) {
        keyframes.push(...clip.keyframes)
      }
    })
  })
  return keyframes
})

// 播放控制方法
const togglePlay = () => {
  if (isPlaying.value) {
    pause()
  } else {
    play()
  }
}

const play = () => {
  if (isPlaying.value) return

  isPlaying.value = true
  emit('play-started')

  playInterval.value = setInterval(() => {
    currentTime.value += 1 / props.frameRate
    if (currentTime.value >= props.totalTime) {
      stop()
    }
    emit('time-changed', currentTime.value)
  }, 1000 / props.frameRate)
}

const pause = () => {
  if (!isPlaying.value) return

  isPlaying.value = false
  clearInterval(playInterval.value)
  emit('play-paused')
}

const stop = () => {
  isPlaying.value = false
  clearInterval(playInterval.value)
  currentTime.value = 0
  emit('time-changed', currentTime.value)
  emit('play-stopped')
}

const updateCurrentTime = time => {
  currentTime.value = snapEnabled.value
    ? Math.round(time / snapInterval.value) * snapInterval.value
    : time
  emit('time-changed', currentTime.value)
}

// 缩放控制
const updateZoom = newZoom => {
  zoomLevel.value = Math.max(0.5, Math.min(3, newZoom))
}

// 轨道管理方法
const addTrack = () => {
  const trackId = `track-${Date.now()}`
  const newTrack = {
    id: trackId,
    name: `轨道 ${tracks.value.length + 1}`,
    type: 'video',
    visible: true,
    locked: false,
    clips: []
  }

  tracks.value.push(newTrack)
  emit('track-added', newTrack)
}

const deleteSelectedTrack = () => {
  if (!selectedTrackId.value) return

  const index = tracks.value.findIndex(t => t.id === selectedTrackId.value)
  if (index !== -1) {
    const track = tracks.value[index]
    tracks.value.splice(index, 1)
    emit('track-removed', track)
    selectedTrackId.value = null
    selectedClipId.value = null
  }
}

const selectTrack = trackId => {
  selectedTrackId.value = trackId
}

const updateTrackName = (trackId, name) => {
  const track = tracks.value.find(t => t.id === trackId)
  if (track) {
    track.name = name
  }
}

const toggleTrackVisibility = trackId => {
  const track = tracks.value.find(t => t.id === trackId)
  if (track) {
    track.visible = !track.visible
  }
}

const toggleTrackLock = trackId => {
  const track = tracks.value.find(t => t.id === trackId)
  if (track) {
    track.locked = !track.locked
  }
}

// 片段管理方法
const selectClip = clip => {
  selectedClipId.value = clip.id
  selectedKeyframeId.value = null
  emit('clip-selected', clip)
}

const deleteClip = clipId => {
  tracks.value.forEach(track => {
    const index = track.clips.findIndex(c => c.id === clipId)
    if (index !== -1) {
      track.clips.splice(index, 1)
      if (selectedClipId.value === clipId) {
        selectedClipId.value = null
      }
    }
  })
}

const handleClipDragStart = ({ clip, event, trackId }) => {
  isDragging.value = true
  dragData.value = {
    type: 'clip',
    clip,
    trackId,
    startX: event.clientX,
    startTime: clip.startTime
  }
}

const handleClipResizeStart = ({ clip, event, trackId }) => {
  isDragging.value = true
  dragData.value = {
    type: 'resize',
    clip,
    trackId,
    side: event.side,
    startX: event.event.clientX,
    originalStart: clip.startTime,
    originalEnd: clip.endTime
  }
}

const handleDropClip = ({ trackId, time }) => {
  if (!dragData.value) return

  const track = tracks.value.find(t => t.id === trackId)
  if (!track) return

  // 移动片段到新位置
  if (dragData.value.type === 'clip') {
    const clip = dragData.value.clip
    const duration = clip.endTime - clip.startTime
    clip.startTime = snapEnabled.value
      ? Math.round(time / snapInterval.value) * snapInterval.value
      : time
    clip.endTime = clip.startTime + duration
    emit('clip-updated', clip)
  }

  isDragging.value = false
  dragData.value = null
}

// 播放头拖拽
const handlePlayheadDragStart = event => {
  const handleMouseMove = e => {
    const rect = event.target.closest('.timeline-ruler').getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const time = Math.max(
      0,
      Math.min(props.totalTime, offsetX / (pixelsPerSecond.value * zoomLevel.value))
    )
    updateCurrentTime(time)
  }

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

// 关键帧管理
const handleKeyframeClick = keyframe => {
  selectedKeyframeId.value = keyframe.id
  emit('keyframe-selected', keyframe)
}

const addKeyframeAtCurrentTime = () => {
  if (!selectedClip.value) return

  const track = tracks.value.find(t => t.id === selectedClip.value.trackId)
  const clip = track?.clips.find(c => c.id === selectedClip.value.id)

  if (!clip) return

  if (!clip.keyframes) {
    clip.keyframes = []
  }

  const newKeyframe = {
    id: `keyframe-${Date.now()}`,
    time: currentTime.value,
    property: 'opacity',
    value: 1,
    easing: 'linear'
  }

  clip.keyframes.push(newKeyframe)
  emit('keyframe-updated', newKeyframe)
}

const deleteKeyframe = index => {
  if (!selectedClip.value) return

  const track = tracks.value.find(t => t.id === selectedClip.value.trackId)
  const clip = track?.clips.find(c => c.id === selectedClip.value.id)

  if (clip?.keyframes) {
    clip.keyframes.splice(index, 1)
  }
}

// 属性更新
const handlePropertyUpdate = ({ key, value }) => {
  if (selectedKeyframe.value) {
    selectedKeyframe.value[key] = value
    emit('keyframe-updated', selectedKeyframe.value)
  } else if (selectedClip.value) {
    const track = tracks.value.find(t => t.id === selectedClip.value.trackId)
    const clip = track?.clips.find(c => c.id === selectedClip.value.id)
    if (clip) {
      clip[key] = value
      emit('clip-updated', clip)
    }
  }
}

const clearSelection = () => {
  selectedClipId.value = null
  selectedKeyframeId.value = null
}

// 生命周期
onMounted(() => {
  // 初始化轨道
  if (props.initialTracks.length > 0) {
    tracks.value = props.initialTracks
  }
})

onUnmounted(() => {
  if (playInterval.value) {
    clearInterval(playInterval.value)
  }
})

// 监听props变化
watch(
  () => props.initialTracks,
  newTracks => {
    if (newTracks.length > 0) {
      tracks.value = newTracks
    }
  }
)
</script>

<style scoped>
.timeline-editor {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: rgba(20, 20, 20, 0.95);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  min-height: 400px;
}

.timeline-main {
  display: flex;
  gap: 16px;
  flex: 1;
  min-height: 0;
}

.timeline-scrollbar {
  flex: 1;
  min-height: 0;
}

.timeline-content {
  min-width: 100%;
}

.tracks-container {
  padding: 16px 0;
  min-height: 200px;
}

.empty-timeline {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 40px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .timeline-main {
    flex-direction: column;
  }
}
</style>
