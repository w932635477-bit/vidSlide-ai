<template>
  <div
    class="timeline-editor"
    role="region"
    aria-labelledby="timeline-heading"
  >
    <!-- 时间轴编辑器标题区域 -->
    <header
      class="editor-header"
      role="banner"
    >
      <h2 id="timeline-heading">⏰ 时间轴编辑器</h2>
      <p class="editor-description">
        专业的关键帧和动画时间控制，支持多轨道同时编辑
      </p>

      <!-- 编辑器状态显示 -->
      <div
        v-if="isProcessing"
        class="processing-status"
        role="status"
        aria-live="polite"
      >
        <div class="status-indicator">
          <div class="loading-spinner"></div>
          <span>{{ processingMessage }}</span>
        </div>
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: processingProgress + '%' }"
          ></div>
        </div>
      </div>
    </header>

    <!-- 时间轴工具栏 -->
    <section
      class="timeline-toolbar"
      role="toolbar"
      aria-labelledby="toolbar-heading"
    >
      <h3 id="toolbar-heading" class="sr-only">时间轴工具栏</h3>

      <div class="toolbar-controls">
        <!-- 播放控制 -->
        <div class="playback-controls">
          <button
            class="control-btn"
            @click="play"
            :disabled="!canPlay"
            aria-label="播放"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </button>

          <button
            class="control-btn"
            @click="pause"
            :disabled="!isPlaying"
            aria-label="暂停"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="6" y="4" width="4" height="16"/>
              <rect x="14" y="4" width="4" height="16"/>
            </svg>
          </button>

          <button
            class="control-btn"
            @click="stop"
            aria-label="停止"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            </svg>
          </button>
        </div>

        <!-- 时间控制 -->
        <div class="time-controls">
          <button
            class="control-btn small"
            @click="goToStart"
            aria-label="跳转到开始"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="11 19 2 12 11 5 11 19"/>
              <polygon points="22 19 13 12 22 5 22 19"/>
            </svg>
          </button>

          <button
            class="control-btn small"
            @click="stepBackward"
            aria-label="后退一帧"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="19 12 5 21 5 3 19 12"/>
            </svg>
          </button>

          <div class="time-display">
            <span class="current-time">{{ formatTime(currentTime) }}</span>
            <span class="time-separator">/</span>
            <span class="total-time">{{ formatTime(totalTime) }}</span>
          </div>

          <button
            class="control-btn small"
            @click="stepForward"
            aria-label="前进一帧"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 12 19 3 19 21 5 12"/>
            </svg>
          </button>

          <button
            class="control-btn small"
            @click="goToEnd"
            aria-label="跳转到结束"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="13 19 22 12 13 5 13 19"/>
              <polygon points="2 19 11 12 2 5 2 19"/>
            </svg>
          </button>
        </div>

        <!-- 缩放控制 -->
        <div class="zoom-controls">
          <label for="zoom-slider" class="sr-only">时间轴缩放</label>
          <input
            id="zoom-slider"
            v-model="zoomLevel"
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            class="zoom-slider"
            @input="updateZoom"
            aria-label="调整时间轴缩放级别"
          />

          <div class="zoom-buttons">
            <button
              class="zoom-btn"
              @click="zoomIn"
              aria-label="放大时间轴"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
                <line x1="13" y1="6" x2="18" y2="6"/>
                <line x1="16" y1="4" x2="16" y2="8"/>
              </svg>
            </button>

            <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>

            <button
              class="zoom-btn"
              @click="zoomOut"
              aria-label="缩小时间轴"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
                <line x1="13" y1="6" x2="18" y2="6"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- 轨道控制 -->
        <div class="track-controls">
          <button
            class="control-btn"
            @click="addTrack"
            aria-label="添加新轨道"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14"/>
              <path d="M5 12h14"/>
            </svg>
            添加轨道
          </button>

          <button
            class="control-btn secondary"
            @click="clearTimeline"
            aria-label="清空时间轴"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18"/>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
            清空
          </button>
        </div>
      </div>
    </section>

    <!-- 时间轴主体 -->
    <section
      class="timeline-body"
      role="main"
      aria-labelledby="timeline-body-heading"
    >
      <h3 id="timeline-body-heading" class="sr-only">时间轴主体</h3>

      <!-- 时间轴标尺 -->
      <div class="timeline-ruler">
        <div
          class="ruler-container"
          ref="rulerContainer"
          @scroll="syncScroll"
        >
          <div
            class="ruler-marks"
            :style="{ width: timelineWidth + 'px' }"
          >
            <!-- 时间标记 -->
            <div
              v-for="mark in timeMarks"
              :key="'mark-' + mark.time"
              class="time-mark"
              :style="{ left: mark.position + 'px' }"
            >
              <span class="mark-line"></span>
              <span class="mark-label">{{ mark.label }}</span>
            </div>
          </div>
        </div>

        <!-- 时间指针 -->
        <div
          class="time-cursor"
          :style="{ left: cursorPosition + 'px' }"
          ref="timeCursor"
        >
          <div class="cursor-line"></div>
          <div class="cursor-handle"></div>
        </div>
      </div>

      <!-- 轨道区域 -->
      <div class="tracks-container">
        <div
          class="tracks-wrapper"
          ref="tracksWrapper"
          @scroll="syncScroll"
        >
          <div
            class="tracks-content"
            :style="{ width: timelineWidth + 'px' }"
          >
            <!-- 轨道列表 -->
            <div
              v-for="(track, trackIndex) in tracks"
              :key="'track-' + track.id"
              class="timeline-track"
              :class="{ 'selected-track': selectedTrackId === track.id }"
              @click="selectTrack(track)"
            >
              <!-- 轨道头部 -->
              <div class="track-header">
                <div class="track-info">
                  <span class="track-name">{{ track.name }}</span>
                  <span class="track-type">{{ getTrackTypeLabel(track.type) }}</span>
                </div>

                <div class="track-controls">
                  <button
                    class="track-btn small"
                    @click.stop="toggleTrackVisibility(track)"
                    :aria-label="`切换轨道 ${track.name} 可见性`"
                  >
                    {{ track.visible ? '👁️' : '👁️‍🗨️' }}
                  </button>

                  <button
                    class="track-btn small"
                    @click.stop="toggleTrackLock(track)"
                    :aria-label="`切换轨道 ${track.name} 锁定状态`"
                  >
                    {{ track.locked ? '🔒' : '🔓' }}
                  </button>

                  <button
                    class="track-btn small danger"
                    @click.stop="removeTrack(track)"
                    :aria-label="`删除轨道 ${track.name}`"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <!-- 轨道内容区域 -->
              <div
                class="track-content"
                :class="{ 'locked-track': track.locked }"
                @mousedown="startClipDrag($event, track)"
                @mousemove="updateClipDrag"
                @mouseup="endClipDrag"
                @mouseleave="endClipDrag"
              >
                <!-- 轨道片段 -->
                <div
                  v-for="clip in track.clips"
                  :key="'clip-' + clip.id"
                  class="timeline-clip"
                  :class="{ 'selected-clip': selectedClipId === clip.id }"
                  :style="{
                    left: timeToPosition(clip.startTime) + 'px',
                    width: timeToPosition(clip.endTime - clip.startTime) + 'px'
                  }"
                  @mousedown.stop="selectClip(clip)"
                  @dblclick="editClip(clip)"
                >
                  <!-- 片段内容 -->
                  <div class="clip-content">
                    <div class="clip-thumbnail">
                      <img
                        v-if="clip.thumbnail"
                        :src="clip.thumbnail"
                        :alt="`片段 ${clip.name} 缩略图`"
                        class="thumbnail-img"
                      />
                      <div v-else class="thumbnail-placeholder">
                        {{ getClipTypeIcon(clip.type) }}
                      </div>
                    </div>

                    <div class="clip-info">
                      <span class="clip-name">{{ clip.name }}</span>
                      <span class="clip-duration">{{ formatDuration(clip.endTime - clip.startTime) }}</span>
                    </div>
                  </div>

                  <!-- 片段控制点 -->
                  <div
                    class="clip-handle left"
                    @mousedown.stop="startResizeClip($event, clip, 'left')"
                  ></div>
                  <div
                    class="clip-handle right"
                    @mousedown.stop="startResizeClip($event, clip, 'right')"
                  ></div>

                  <!-- 关键帧 -->
                  <div
                    v-for="keyframe in clip.keyframes"
                    :key="'keyframe-' + keyframe.id"
                    class="clip-keyframe"
                    :style="{ left: ((keyframe.time - clip.startTime) / (clip.endTime - clip.startTime) * 100) + '%' }"
                    @mousedown.stop="selectKeyframe(keyframe)"
                  ></div>
                </div>

                <!-- 轨道背景 -->
                <div class="track-background"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 时间轴属性面板 -->
    <aside
      v-if="selectedClip || selectedKeyframe"
      class="timeline-properties"
      role="complementary"
      aria-labelledby="properties-heading"
    >
      <h3 id="properties-heading">属性面板</h3>

      <!-- 片段属性 -->
      <div
        v-if="selectedClip"
        class="properties-section"
      >
        <h4>片段属性</h4>

        <div class="property-group">
          <label class="property-label">名称</label>
          <input
            v-model="selectedClip.name"
            type="text"
            class="property-input"
            @input="updateClipProperty(selectedClip, 'name', $event.target.value)"
          />
        </div>

        <div class="property-group">
          <label class="property-label">开始时间</label>
          <input
            v-model.number="selectedClip.startTime"
            type="number"
            step="0.1"
            min="0"
            :max="props.totalTime"
            class="property-input"
            @input="updateClipProperty(selectedClip, 'startTime', parseFloat($event.target.value))"
          />
        </div>

        <div class="property-group">
          <label class="property-label">持续时间</label>
          <input
            v-model.number="clipDuration"
            type="number"
            step="0.1"
            min="0.1"
            class="property-input"
            @input="updateClipDuration(selectedClip, parseFloat($event.target.value))"
          />
        </div>

        <div class="property-group">
          <label class="property-label">透明度</label>
          <input
            v-model.number="selectedClip.opacity"
            type="range"
            min="0"
            max="1"
            step="0.01"
            class="property-slider"
            @input="updateClipProperty(selectedClip, 'opacity', parseFloat($event.target.value))"
          />
          <span class="property-value">{{ Math.round(selectedClip.opacity * 100) }}%</span>
        </div>
      </div>

      <!-- 关键帧属性 -->
      <div
        v-if="selectedKeyframe"
        class="properties-section"
      >
        <h4>关键帧属性</h4>

        <div class="property-group">
          <label class="property-label">时间</label>
          <input
            v-model.number="selectedKeyframe.time"
            type="number"
            step="0.1"
            min="0"
            :max="props.totalTime"
            class="property-input"
            @input="updateKeyframeProperty(selectedKeyframe, 'time', parseFloat($event.target.value))"
          />
        </div>

        <div class="property-group">
          <label class="property-label">值</label>
          <input
            v-model.number="selectedKeyframe.value"
            type="number"
            step="0.01"
            class="property-input"
            @input="updateKeyframeProperty(selectedKeyframe, 'value', parseFloat($event.target.value))"
          />
        </div>

        <div class="property-group">
          <label class="property-label">缓动类型</label>
          <select
            v-model="selectedKeyframe.easing"
            class="property-select"
            @change="updateKeyframeProperty(selectedKeyframe, 'easing', $event.target.value)"
          >
            <option value="linear">线性</option>
            <option value="ease-in">缓入</option>
            <option value="ease-out">缓出</option>
            <option value="ease-in-out">缓入缓出</option>
          </select>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

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

// Reactive data
const currentTime = ref(0)
const zoomLevel = ref(1)
const isPlaying = ref(false)
const playInterval = ref(null)
const tracks = ref([
  {
    id: 'track-1',
    name: '视频轨道 1',
    type: 'video',
    visible: true,
    locked: false,
    clips: [],
    height: 60
  },
  {
    id: 'track-2',
    name: '音频轨道 1',
    type: 'audio',
    visible: true,
    locked: false,
    clips: [],
    height: 40
  }
])
const selectedTrackId = ref(null)
const selectedClipId = ref(null)
const selectedKeyframeId = ref(null)
const isProcessing = ref(false)
const processingProgress = ref(0)
const processingMessage = ref('')

// Drag states
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartTime = ref(0)
const draggedClip = ref(null)
const resizeHandle = ref(null) // 'left' or 'right'
const rulerContainer = ref(null)
const tracksWrapper = ref(null)
const timeCursor = ref(null)

// Computed properties
const canPlay = computed(() => tracks.value.some(track => track.clips.length > 0))

const timelineWidth = computed(() => {
  const pixelsPerSecond = 50 * zoomLevel.value // 基础50像素每秒，乘以缩放级别
  return Math.max(800, totalTime * pixelsPerSecond)
})

const cursorPosition = computed(() => {
  const pixelsPerSecond = 50 * zoomLevel.value
  return Math.min(currentTime.value * pixelsPerSecond, timelineWidth.value - 2)
})

  const timeMarks = computed(() => {
    const marks = []
    const pixelsPerSecond = 50 * zoomLevel.value
    const interval = zoomLevel.value >= 2 ? 1 : (zoomLevel.value >= 1 ? 5 : 10)

    for (let time = 0; time <= props.totalTime; time += interval) {
      marks.push({
        time,
        position: time * pixelsPerSecond,
        label: formatTime(time)
      })
    }

    return marks
  })

const selectedClip = computed(() => {
  if (!selectedClipId.value) return null
  for (const track of tracks.value) {
    const clip = track.clips.find(c => c.id === selectedClipId.value)
    if (clip) return clip
  }
  return null
})

const selectedKeyframe = computed(() => {
  if (!selectedKeyframeId.value || !selectedClip.value) return null
  return selectedClip.value.keyframes?.find(k => k.id === selectedKeyframeId.value)
})

const clipDuration = computed(() => {
  return selectedClip.value ? selectedClip.value.endTime - selectedClip.value.startTime : 0
})

// Methods
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

const goToStart = () => {
  currentTime.value = 0
  emit('time-changed', currentTime.value)
}

const goToEnd = () => {
  currentTime.value = totalTime
  emit('time-changed', currentTime.value)
}

  const stepForward = () => {
    currentTime.value = Math.min(currentTime.value + 1 / props.frameRate, props.totalTime)
    emit('time-changed', currentTime.value)
  }

  const stepBackward = () => {
    currentTime.value = Math.max(currentTime.value - 1 / props.frameRate, 0)
    emit('time-changed', currentTime.value)
  }

const updateZoom = () => {
  // 缩放级别更新后需要重新计算时间轴宽度
  nextTick(() => {
    syncScroll()
  })
}

const zoomIn = () => {
  zoomLevel.value = Math.min(zoomLevel.value * 1.2, 10)
  updateZoom()
}

const zoomOut = () => {
  zoomLevel.value = Math.max(zoomLevel.value / 1.2, 0.1)
  updateZoom()
}

const syncScroll = () => {
  if (rulerContainer.value && tracksWrapper.value) {
    const scrollLeft = rulerContainer.value.scrollLeft
    tracksWrapper.value.scrollLeft = scrollLeft
  }
}

const addTrack = () => {
  const trackId = `track-${Date.now()}`
  const newTrack = {
    id: trackId,
    name: `新轨道 ${tracks.value.length + 1}`,
    type: 'video',
    visible: true,
    locked: false,
    clips: [],
    height: 60
  }

  tracks.value.push(newTrack)
  emit('track-added', newTrack)
}

const removeTrack = (track) => {
  const index = tracks.value.findIndex(t => t.id === track.id)
  if (index !== -1) {
    tracks.value.splice(index, 1)
    emit('track-removed', track)

    if (selectedTrackId.value === track.id) {
      selectedTrackId.value = null
    }
  }
}

const selectTrack = (track) => {
  selectedTrackId.value = track.id
}

const toggleTrackVisibility = (track) => {
  track.visible = !track.visible
}

const toggleTrackLock = (track) => {
  track.locked = !track.locked
}

const clearTimeline = () => {
  tracks.value.forEach(track => {
    track.clips = []
  })
  selectedTrackId.value = null
  selectedClipId.value = null
  selectedKeyframeId.value = null
  currentTime.value = 0
}

const timeToPosition = (time) => {
  const pixelsPerSecond = 50 * zoomLevel.value
  return time * pixelsPerSecond
}

const positionToTime = (position) => {
  const pixelsPerSecond = 50 * zoomLevel.value
  return position / pixelsPerSecond
}

const startClipDrag = (event, track) => {
  if (track.locked) return

  isDragging.value = true
  dragStartX.value = event.clientX
  draggedClip.value = null

  // 检查是否点击在现有片段上
  const rect = event.currentTarget.getBoundingClientRect()
  const x = event.clientX - rect.left
  const time = positionToTime(x)

  for (const clip of track.clips) {
    if (time >= clip.startTime && time <= clip.endTime) {
      draggedClip.value = clip
      dragStartTime.value = clip.startTime
      selectClip(clip)
      break
    }
  }

  // 如果没有点击在片段上，准备创建新片段
  if (!draggedClip.value) {
    createClipAt(track, time)
  }
}

const updateClipDrag = (event) => {
  if (!isDragging.value || !draggedClip.value) return

  const deltaX = event.clientX - dragStartX.value
  const deltaTime = positionToTime(deltaX) - positionToTime(0)

  const newStartTime = Math.max(0, dragStartTime.value + deltaTime)
  const duration = draggedClip.value.endTime - draggedClip.value.startTime
  const newEndTime = newStartTime + duration

  if (newEndTime <= totalTime) {
    draggedClip.value.startTime = newStartTime
    draggedClip.value.endTime = newEndTime
  }
}

const endClipDrag = () => {
  if (draggedClip.value) {
    emit('clip-updated', draggedClip.value)
  }

  isDragging.value = false
  draggedClip.value = null
}

  const createClipAt = (track, time) => {
    const clipId = `clip-${Date.now()}`
    const newClip = {
      id: clipId,
      name: `片段 ${track.clips.length + 1}`,
      type: track.type,
      startTime: time,
      endTime: Math.min(time + 5, props.totalTime), // 默认5秒
      opacity: 1,
      keyframes: []
    }

    track.clips.push(newClip)
    selectClip(newClip)
  }

const selectClip = (clip) => {
  selectedClipId.value = clip.id
  selectedKeyframeId.value = null
  emit('clip-selected', clip)
}

const editClip = (clip) => {
  // 这里可以打开剪辑编辑对话框
  console.log('编辑片段:', clip)
}

const startResizeClip = (event, clip, handle) => {
  event.stopPropagation()
  resizeHandle.value = handle
  draggedClip.value = clip
  dragStartX.value = event.clientX
  dragStartTime.value = handle === 'left' ? clip.startTime : clip.endTime
  isDragging.value = true
}

const updateClipDuration = (clip, duration) => {
  if (duration <= 0) return

  const newEndTime = clip.startTime + duration
  if (newEndTime <= props.totalTime) {
    clip.endTime = newEndTime
    emit('clip-updated', clip)
  }
}

const updateClipProperty = (clip, property, value) => {
  clip[property] = value
  emit('clip-updated', clip)
}

const selectKeyframe = (keyframe) => {
  selectedKeyframeId.value = keyframe.id
  emit('keyframe-selected', keyframe)
}

const updateKeyframeProperty = (keyframe, property, value) => {
  keyframe[property] = value
  emit('keyframe-updated', keyframe)
}

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const frames = Math.floor((seconds % 1) * props.frameRate)

    if (zoomLevel.value >= 2) {
      return `${mins}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`
    } else {
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }
  }

const formatDuration = (seconds) => {
  if (seconds < 1) {
    return `${Math.round(seconds * frameRate)}帧`
  } else {
    return `${seconds.toFixed(1)}秒`
  }
}

const getTrackTypeLabel = (type) => {
  const labels = {
    video: '视频',
    audio: '音频',
    text: '文字',
    image: '图片',
    effect: '效果'
  }
  return labels[type] || type
}

const getClipTypeIcon = (type) => {
  const icons = {
    video: '🎬',
    audio: '🎵',
    text: '📝',
    image: '🖼️',
    effect: '✨'
  }
  return icons[type] || '📄'
}

// 处理时间轴点击跳转
const handleTimelineClick = (event) => {
  if (event.target === timeCursor.value) return

  const rect = rulerContainer.value.getBoundingClientRect()
  const x = event.clientX - rect.left + rulerContainer.value.scrollLeft
  const time = positionToTime(x)

  currentTime.value = Math.max(0, Math.min(time, props.totalTime))
  emit('time-changed', currentTime.value)
}

// 监听时间轴容器点击
onMounted(() => {
  if (rulerContainer.value) {
    rulerContainer.value.addEventListener('click', handleTimelineClick)
  }

  // 初始化播放位置
  currentTime.value = 0
})

onUnmounted(() => {
  if (playInterval.value) {
    clearInterval(playInterval.value)
  }

  if (rulerContainer.value) {
    rulerContainer.value.removeEventListener('click', handleTimelineClick)
  }
})

// Watchers
watch(() => props.totalTime, (newTime) => {
  if (currentTime.value > newTime) {
    currentTime.value = newTime
  }
}, { immediate: true })

watch(() => props.initialTracks, (newTracks) => {
  if (newTracks && newTracks.length > 0) {
    tracks.value = [...newTracks]
  }
}, { immediate: true })

// Expose methods for parent component
defineExpose({
  play,
  pause,
  stop,
  goToTime: (time) => { currentTime.value = time },
  addClip: (trackId, clip) => {
    const track = tracks.value.find(t => t.id === trackId)
    if (track) {
      track.clips.push(clip)
    }
  },
  removeClip: (clipId) => {
    for (const track of tracks.value) {
      const index = track.clips.findIndex(c => c.id === clipId)
      if (index !== -1) {
        track.clips.splice(index, 1)
        break
      }
    }
  },
  getCurrentTime: () => currentTime.value,
  getTracks: () => tracks.value,
  getSelectedClip: () => selectedClip.value,
  getSelectedKeyframe: () => selectedKeyframe.value
})
</script>

<style scoped>
/* ===========================================
   时间轴编辑器 - 苹果设计风格
   =========================================== */

.timeline-editor {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  height: 100%;
  min-height: 600px;
}

/* 头部区域 */
.editor-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.editor-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: -0.01em;
}

.editor-description {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
}

/* 处理状态 */
.processing-status {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: rgba(0, 122, 255, 0.1);
  border: 1px solid rgba(0, 122, 255, 0.2);
  border-radius: 8px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: rgba(0, 122, 255, 0.9);
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0, 122, 255, 0.3);
  border-top: 2px solid rgba(0, 122, 255, 0.9);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.progress-bar {
  height: 4px;
  background: rgba(0, 122, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, rgba(0, 122, 255, 0.8) 0%, rgba(0, 122, 255, 0.9) 100%);
  border-radius: 2px;
  transition: width 0.3s ease;
}

/* 时间轴工具栏 */
.timeline-toolbar {
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
}

.toolbar-controls {
  display: flex;
  gap: 24px;
  align-items: center;
  flex-wrap: wrap;
}

/* 播放控制 */
.playback-controls {
  display: flex;
  gap: 8px;
}

.control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.15s ease;
}

.control-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.95);
}

.control-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.control-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.control-btn.small {
  width: 28px;
  height: 28px;
}

/* 时间控制 */
.time-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-display {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  font-family: monospace;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}

.current-time {
  font-weight: 600;
  color: rgba(0, 122, 255, 0.9);
}

.time-separator {
  color: rgba(255, 255, 255, 0.5);
}

/* 缩放控制 */
.zoom-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.zoom-slider {
  width: 120px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  outline: none;
  -webkit-appearance: none;
}

.zoom-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: rgba(0, 122, 255, 0.9);
  border-radius: 50%;
  cursor: pointer;
}

.zoom-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.zoom-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.15s ease;
}

.zoom-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}

.zoom-level {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  min-width: 40px;
  text-align: center;
}

/* 轨道控制 */
.track-controls {
  display: flex;
  gap: 8px;
}

.control-btn.secondary {
  background: rgba(142, 142, 147, 0.1);
  border-color: rgba(142, 142, 147, 0.3);
  color: rgba(142, 142, 147, 0.9);
}

.control-btn.secondary:hover:not(:disabled) {
  background: rgba(142, 142, 147, 0.2);
  border-color: rgba(142, 142, 147, 0.4);
}

/* 时间轴主体 */
.timeline-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  overflow: hidden;
}

/* 时间轴标尺 */
.timeline-ruler {
  position: relative;
  height: 40px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.time-ruler {
  position: relative;
  height: 40px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.ruler-container {
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
}

.ruler-marks {
  position: relative;
  height: 100%;
  background:
    linear-gradient(90deg,
      transparent 0px,
      transparent 49px,
      rgba(255, 255, 255, 0.1) 49px,
      rgba(255, 255, 255, 0.1) 51px
    );
  background-size: 50px 100%;
}

.time-mark {
  position: absolute;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
}

.mark-line {
  width: 1px;
  height: 12px;
  background: rgba(255, 255, 255, 0.6);
}

.mark-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.7);
  transform: rotate(-45deg);
  transform-origin: center top;
  white-space: nowrap;
}

/* 时间指针 */
.time-cursor {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgba(0, 122, 255, 0.9);
  z-index: 10;
  cursor: ew-resize;
}

.cursor-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 122, 255, 0.9);
}

.cursor-handle {
  position: absolute;
  top: -4px;
  left: -4px;
  width: 10px;
  height: 10px;
  background: rgba(0, 122, 255, 0.9);
  border-radius: 50%;
  cursor: ew-resize;
}

/* 轨道区域 */
.tracks-container {
  flex: 1;
  overflow: hidden;
}

.tracks-wrapper {
  height: 100%;
  overflow-x: auto;
  overflow-y: auto;
}

.tracks-content {
  position: relative;
  min-height: 100%;
}

/* 时间轴轨道 */
.timeline-track {
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.track-row {
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.timeline-track:hover {
  background: rgba(255, 255, 255, 0.01);
}

.timeline-track.selected-track {
  background: rgba(0, 122, 255, 0.05);
  border-left: 3px solid rgba(0, 122, 255, 0.6);
}

/* 轨道头部 */
.track-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 200px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.02);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.track-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.track-name {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.track-type {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}

.track-controls {
  display: flex;
  gap: 4px;
}

.track-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  font-size: 12px;
  transition: all 0.15s ease;
}

.track-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.track-btn.danger:hover {
  background: rgba(255, 59, 48, 0.2);
  color: rgba(255, 59, 48, 0.9);
}

/* 轨道内容 */
.track-content {
  flex: 1;
  position: relative;
  height: 60px;
  background: transparent;
}

.track-content.locked-track {
  opacity: 0.6;
  pointer-events: none;
}

.track-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    linear-gradient(90deg,
      transparent 0px,
      transparent 49px,
      rgba(255, 255, 255, 0.02) 49px,
      rgba(255, 255, 255, 0.02) 51px
    );
  background-size: 50px 100%;
}

/* 时间轴片段 */
.timeline-clip {
  position: absolute;
  top: 4px;
  bottom: 4px;
  background: rgba(0, 122, 255, 0.8);
  border: 1px solid rgba(0, 122, 255, 0.6);
  border-radius: 4px;
  cursor: move;
  transition: all 0.15s ease;
  overflow: hidden;
}

.timeline-clip:hover {
  background: rgba(0, 122, 255, 0.9);
  border-color: rgba(0, 122, 255, 0.8);
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
}

.timeline-clip.selected-clip {
  background: rgba(0, 122, 255, 0.95);
  border-color: rgba(0, 122, 255, 1);
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.5);
}

.clip-content {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 100%;
  padding: 4px 8px;
}

.clip-thumbnail {
  width: 32px;
  height: 32px;
  border-radius: 3px;
  overflow: hidden;
  flex-shrink: 0;
}

.thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  font-size: 16px;
}

.clip-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}

.clip-name {
  font-size: 11px;
  font-weight: 500;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.clip-duration {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.8);
}

/* 片段控制点 */
.clip-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 8px;
  background: rgba(255, 255, 255, 0.3);
  cursor: ew-resize;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.timeline-clip:hover .clip-handle {
  opacity: 1;
}

.clip-handle.left {
  left: 0;
  border-radius: 4px 0 0 4px;
}

.clip-handle.right {
  right: 0;
  border-radius: 0 4px 4px 0;
}

/* 关键帧 */
.clip-keyframe {
  position: absolute;
  top: -4px;
  width: 8px;
  height: 8px;
  background: rgba(255, 59, 48, 0.9);
  border: 2px solid white;
  border-radius: 50%;
  cursor: pointer;
  z-index: 5;
}

/* 属性面板 */
.timeline-properties {
  width: 280px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  margin-left: 16px;
}

.timeline-properties h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.properties-section {
  margin-bottom: 20px;
}

.properties-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
}

.property-group {
  margin-bottom: 12px;
}

.property-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 4px;
}

.property-input,
.property-select {
  width: 100%;
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
}

.property-input:focus,
.property-select:focus {
  outline: 2px solid rgba(0, 122, 255, 0.5);
  outline-offset: 2px;
}

.property-slider {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
}

.property-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: rgba(0, 122, 255, 0.9);
  border-radius: 50%;
  cursor: pointer;
}

.property-value {
  display: block;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 4px;
}

/* 无障碍支持 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .timeline-properties {
    width: 100%;
    margin-left: 0;
    margin-top: 16px;
  }
}

@media (max-width: 768px) {
  .toolbar-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .playback-controls,
  .time-controls,
  .zoom-controls,
  .track-controls {
    justify-content: center;
  }

  .track-header {
    width: 150px;
    padding: 6px 8px;
  }

  .track-name {
    font-size: 12px;
  }

  .track-type {
    font-size: 10px;
  }

  .clip-name {
    font-size: 10px;
  }

  .clip-duration {
    font-size: 8px;
  }
}
</style>