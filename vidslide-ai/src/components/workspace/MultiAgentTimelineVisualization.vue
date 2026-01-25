<!--
  MultiAgentTimelineVisualization.vue - 多智能体Timeline可视化组件

  功能：
  - 显示多智能体系统生成的Timeline数据
  - 可视化Clip列表和多层场景
  - 显示每层的详细配置
  - 支持时间轴缩放和滚动
  - 与视频播放器同步
-->
<template>
  <div class="multi-agent-timeline">
    <!-- 头部工具栏 -->
    <div class="timeline-header">
      <div class="timeline-info">
        <span class="info-item">
          <i class="icon">📊</i>
          总Clip数: <strong>{{ clipCount }}</strong>
        </span>
        <span class="info-item">
          <i class="icon">🎬</i>
          多层场景: <strong>{{ multiLayerSceneCount }}</strong>
        </span>
        <span class="info-item">
          <i class="icon">📐</i>
          总层数: <strong>{{ totalLayerCount }}</strong>
        </span>
        <span class="info-item">
          <i class="icon">⏱️</i>
          总时长: <strong>{{ formatDuration(totalDuration) }}</strong>
        </span>
      </div>

      <div class="timeline-controls">
        <button @click="zoomIn" class="control-btn" title="放大">
          <i class="icon">🔍+</i>
        </button>
        <button @click="zoomOut" class="control-btn" title="缩小">
          <i class="icon">🔍-</i>
        </button>
        <button @click="fitToView" class="control-btn" title="适应窗口">
          <i class="icon">⬜</i>
        </button>
        <button @click="refresh" class="control-btn" title="刷新">
          <i class="icon">🔄</i>
        </button>
      </div>
    </div>

    <!-- Timeline主体 -->
    <div class="timeline-body" ref="timelineBody">
      <!-- 时间标尺 -->
      <div class="timeline-ruler" :style="{ width: timelineWidth + 'px' }">
        <div
          v-for="mark in timeMarks"
          :key="mark.time"
          class="time-mark"
          :style="{ left: mark.position + 'px' }"
        >
          <span class="time-label">{{ formatTime(mark.time) }}</span>
        </div>
      </div>

      <!-- Clip轨道 -->
      <div class="timeline-tracks" :style="{ width: timelineWidth + 'px' }">
        <div
          v-for="(clip, index) in clips"
          :key="clip.id || index"
          class="clip-item"
          :class="{
            'multi-layer': isMultiLayerClip(clip),
            'selected': selectedClipIndex === index
          }"
          :style="getClipStyle(clip)"
          @click="selectClip(index)"
        >
          <!-- Clip基本信息 -->
          <div class="clip-header">
            <span class="clip-type">
              {{ isMultiLayerClip(clip) ? '🎬 多层场景' : '🎥 原视频' }}
            </span>
            <span class="clip-duration">{{ formatDuration(clip.duration) }}</span>
          </div>

          <!-- 多层场景的层显示 -->
          <div v-if="isMultiLayerClip(clip)" class="clip-layers">
            <div
              v-for="(layer, layerIndex) in getClipLayers(clip)"
              :key="layerIndex"
              class="layer-item"
              :class="`layer-${layerIndex}`"
              :title="getLayerTitle(layer, layerIndex)"
            >
              <span class="layer-icon">{{ getLayerIcon(layerIndex) }}</span>
              <span class="layer-name">{{ getLayerName(layerIndex) }}</span>
            </div>
          </div>

          <!-- 原视频Clip显示 -->
          <div v-else class="clip-content">
            <span class="clip-label">Clip {{ index + 1 }}</span>
          </div>
        </div>
      </div>

      <!-- 播放指针 -->
      <div
        v-if="currentTime !== null"
        class="playhead"
        :style="{ left: playheadPosition + 'px' }"
      >
        <div class="playhead-line"></div>
        <div class="playhead-handle"></div>
      </div>
    </div>

    <!-- Clip详情面板 -->
    <div v-if="selectedClip" class="clip-details">
      <div class="details-header">
        <h3>Clip详情</h3>
        <button @click="selectedClipIndex = null" class="close-btn">✕</button>
      </div>

      <div class="details-content">
        <div class="detail-item">
          <label>类型:</label>
          <span>{{ isMultiLayerClip(selectedClip) ? '多层场景' : '原视频' }}</span>
        </div>
        <div class="detail-item">
          <label>开始时间:</label>
          <span>{{ formatTime(selectedClip.start) }}</span>
        </div>
        <div class="detail-item">
          <label>时长:</label>
          <span>{{ formatDuration(selectedClip.duration) }}</span>
        </div>
        <div class="detail-item">
          <label>结束时间:</label>
          <span>{{ formatTime(selectedClip.start + selectedClip.duration) }}</span>
        </div>

        <!-- 多层场景详情 -->
        <div v-if="isMultiLayerClip(selectedClip)" class="layer-details">
          <h4>层配置 ({{ getClipLayers(selectedClip).length }}层)</h4>
          <div
            v-for="(layer, layerIndex) in getClipLayers(selectedClip)"
            :key="layerIndex"
            class="layer-detail-item"
          >
            <div class="layer-detail-header">
              <span class="layer-icon">{{ getLayerIcon(layerIndex) }}</span>
              <strong>Layer {{ layerIndex }}: {{ getLayerName(layerIndex) }}</strong>
            </div>
            <div class="layer-detail-content">
              <div v-if="layer.agent" class="detail-row">
                <label>智能体:</label>
                <span class="agent-badge">{{ layer.agent }}</span>
              </div>
              <div v-if="layer.status" class="detail-row">
                <label>状态:</label>
                <span :class="'status-' + layer.status">{{ layer.status }}</span>
              </div>
              <div v-if="layer.path" class="detail-row">
                <label>路径:</label>
                <span class="path-text">{{ layer.path }}</span>
              </div>
              <div v-if="layer.config" class="detail-row">
                <label>配置:</label>
                <pre class="config-json">{{ JSON.stringify(layer.config, null, 2) }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'

const store = useWorkspaceStore()

// 组件状态
const timelineBody = ref(null)
const zoom = ref(1) // 缩放级别
const selectedClipIndex = ref(null)
const currentTime = ref(null) // 当前播放时间

// 从store获取Timeline数据
const timeline = computed(() => store.multiAgent.timeline)
const clips = computed(() => timeline.value?.clips || [])

// 统计信息
const clipCount = computed(() => clips.value.length)
const multiLayerSceneCount = computed(() => {
  return clips.value.filter(clip => isMultiLayerClip(clip)).length
})
const totalLayerCount = computed(() => {
  return clips.value.reduce((total, clip) => {
    if (isMultiLayerClip(clip)) {
      return total + getClipLayers(clip).length
    }
    return total
  }, 0)
})
const totalDuration = computed(() => {
  if (clips.value.length === 0) return 0
  const lastClip = clips.value[clips.value.length - 1]
  return lastClip.start + lastClip.duration
})

// 选中的Clip
const selectedClip = computed(() => {
  if (selectedClipIndex.value === null) return null
  return clips.value[selectedClipIndex.value]
})

// Timeline宽度（基于总时长和缩放级别）
const timelineWidth = computed(() => {
  const baseWidth = totalDuration.value * 100 // 每秒100px
  return baseWidth * zoom.value
})

// 时间标记（每5秒一个标记）
const timeMarks = computed(() => {
  const marks = []
  const interval = 5 // 5秒间隔
  const duration = totalDuration.value

  for (let time = 0; time <= duration; time += interval) {
    marks.push({
      time,
      position: (time / duration) * timelineWidth.value
    })
  }

  return marks
})

// 播放指针位置
const playheadPosition = computed(() => {
  if (currentTime.value === null || totalDuration.value === 0) return 0
  return (currentTime.value / totalDuration.value) * timelineWidth.value
})

/**
 * 判断是否为多层Clip
 */
function isMultiLayerClip(clip) {
  return clip.type === 'multi-layer' || (clip.layers && clip.layers.length > 0)
}

/**
 * 获取Clip的层列表
 */
function getClipLayers(clip) {
  if (!clip.layers) return []
  return clip.layers
}

/**
 * 获取Clip样式
 */
function getClipStyle(clip) {
  const start = clip.start || 0
  const duration = clip.duration || 0
  const totalDur = totalDuration.value

  if (totalDur === 0) return {}

  const left = (start / totalDur) * 100
  const width = (duration / totalDur) * 100

  return {
    left: `${left}%`,
    width: `${width}%`
  }
}

/**
 * 获取层图标
 */
function getLayerIcon(layerIndex) {
  const icons = ['🖼️', '🎨', '🌫️', '📝', '👤']
  return icons[layerIndex] || '📐'
}

/**
 * 获取层名称
 */
function getLayerName(layerIndex) {
  const names = ['背景', '素材', '遮罩', '文字卡片', '人脸PIP']
  return names[layerIndex] || `Layer ${layerIndex}`
}

/**
 * 获取层标题（tooltip）
 */
function getLayerTitle(layer, layerIndex) {
  const name = getLayerName(layerIndex)
  const agent = layer.agent || '未知'
  const status = layer.status || '未知'
  return `${name} - 智能体: ${agent} - 状态: ${status}`
}

/**
 * 格式化时间（秒 -> MM:SS）
 */
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * 格式化时长
 */
function formatDuration(seconds) {
  return `${seconds.toFixed(1)}s`
}

/**
 * 选择Clip
 */
function selectClip(index) {
  selectedClipIndex.value = index
}

/**
 * 缩放控制
 */
function zoomIn() {
  zoom.value = Math.min(zoom.value * 1.5, 5)
}

function zoomOut() {
  zoom.value = Math.max(zoom.value / 1.5, 0.5)
}

function fitToView() {
  zoom.value = 1
}

function refresh() {
  // 刷新Timeline数据
  console.log('🔄 刷新Timeline')
}

/**
 * 监听视频播放时间
 */
watch(() => store.video.currentTime, (newTime) => {
  currentTime.value = newTime
})

/**
 * 监听Timeline数据变化
 */
watch(timeline, (newTimeline) => {
  if (newTimeline) {
    console.log('📋 Timeline数据已更新:', newTimeline)
  }
})

onMounted(() => {
  console.log('✅ MultiAgentTimelineVisualization已挂载')
})

onUnmounted(() => {
  console.log('👋 MultiAgentTimelineVisualization已卸载')
})
</script>

<style scoped>
.multi-agent-timeline {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
  color: #fff;
  overflow: hidden;
}

/* 头部工具栏 */
.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #252525;
  border-bottom: 1px solid #333;
}

.timeline-info {
  display: flex;
  gap: 20px;
  font-size: 13px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #aaa;
}

.info-item .icon {
  font-size: 16px;
}

.info-item strong {
  color: #fff;
  font-weight: 600;
}

.timeline-controls {
  display: flex;
  gap: 8px;
}

.control-btn {
  padding: 6px 12px;
  background: #333;
  border: 1px solid #444;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.control-btn:hover {
  background: #444;
  border-color: #555;
}

/* Timeline主体 */
.timeline-body {
  flex: 1;
  position: relative;
  overflow-x: auto;
  overflow-y: hidden;
  background: #1e1e1e;
}

/* 时间标尺 */
.timeline-ruler {
  height: 30px;
  position: relative;
  background: #252525;
  border-bottom: 1px solid #333;
}

.time-mark {
  position: absolute;
  top: 0;
  height: 100%;
  border-left: 1px solid #444;
  padding-left: 4px;
}

.time-label {
  font-size: 11px;
  color: #888;
}

/* Clip轨道 */
.timeline-tracks {
  position: relative;
  height: 200px;
  padding: 10px 0;
}

.clip-item {
  position: absolute;
  top: 10px;
  height: 180px;
  background: #2a2a2a;
  border: 2px solid #444;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
}

.clip-item:hover {
  border-color: #666;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.clip-item.selected {
  border-color: #4a9eff;
  box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.3);
}

.clip-item.multi-layer {
  background: linear-gradient(135deg, #2a4a6a 0%, #1a3a5a 100%);
  border-color: #4a7aaa;
}

.clip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 12px;
}

.clip-type {
  font-weight: 600;
}

.clip-duration {
  color: #aaa;
}

/* 多层场景的层显示 */
.clip-layers {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.layer-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  font-size: 11px;
  border-left: 3px solid;
}

.layer-item.layer-0 { border-left-color: #ff6b6b; }
.layer-item.layer-1 { border-left-color: #4ecdc4; }
.layer-item.layer-2 { border-left-color: #ffe66d; }
.layer-item.layer-3 { border-left-color: #a8e6cf; }
.layer-item.layer-4 { border-left-color: #ff8b94; }

.layer-icon {
  font-size: 14px;
}

.layer-name {
  color: #ccc;
  font-size: 10px;
}

/* 原视频Clip */
.clip-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 14px;
  color: #888;
}

/* 播放指针 */
.playhead {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  pointer-events: none;
  z-index: 100;
}

.playhead-line {
  width: 2px;
  height: 100%;
  background: #ff4444;
  box-shadow: 0 0 8px rgba(255, 68, 68, 0.6);
}

.playhead-handle {
  position: absolute;
  top: 0;
  left: -6px;
  width: 14px;
  height: 14px;
  background: #ff4444;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

/* Clip详情面板 */
.clip-details {
  width: 100%;
  max-height: 300px;
  background: #252525;
  border-top: 1px solid #333;
  overflow-y: auto;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #333;
}

.details-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.close-btn:hover {
  background: #333;
  color: #fff;
}

.details-content {
  padding: 16px;
}

.detail-item {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 13px;
}

.detail-item label {
  color: #888;
  min-width: 80px;
}

.detail-item span {
  color: #fff;
}

/* 层详情 */
.layer-details {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #333;
}

.layer-details h4 {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: #aaa;
}

.layer-detail-item {
  margin-bottom: 16px;
  padding: 12px;
  background: #1e1e1e;
  border-radius: 6px;
  border-left: 3px solid #4a9eff;
}

.layer-detail-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
}

.layer-detail-content {
  padding-left: 24px;
}

.detail-row {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 12px;
}

.detail-row label {
  color: #888;
  min-width: 60px;
}

.agent-badge {
  padding: 2px 8px;
  background: #4a9eff;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.status-completed {
  color: #4ade80;
}

.status-pending {
  color: #fbbf24;
}

.status-failed {
  color: #f87171;
}

.path-text {
  font-family: monospace;
  font-size: 11px;
  color: #aaa;
  word-break: break-all;
}

.config-json {
  margin: 8px 0 0 0;
  padding: 8px;
  background: #0a0a0a;
  border-radius: 4px;
  font-size: 11px;
  color: #4ade80;
  overflow-x: auto;
}
</style>
