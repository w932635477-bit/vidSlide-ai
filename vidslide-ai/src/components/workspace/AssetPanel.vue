<!--
  AssetPanel.vue - 左侧素材库 (剪映风格)
  包含素材分类、搜索、列表和一键生成按钮
-->
<template>
  <div class="asset-panel">
    <!-- 搜索框 -->
    <div class="asset-search">
      <div class="search-input-wrapper">
        <svg
          class="search-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          class="jianying-input search-input"
          placeholder="搜索素材..."
          @input="handleSearch"
        />
        <button v-if="searchQuery" class="clear-btn" @click="clearSearch">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 素材分类标签 -->
    <div class="asset-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="jianying-tab"
        :class="{ 'jianying-tab-active': activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>

    <!-- 素材列表 -->
    <div ref="assetListRef" class="asset-list">
      <!-- 项目列表 -->
      <div v-if="activeTab === 'project'" class="asset-category">
        <div class="category-header">
          <h3 class="category-title">最近项目</h3>
          <button class="jianying-btn-icon" title="刷新" @click="refreshProjects">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path
                d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"
              />
            </svg>
          </button>
        </div>
        <div class="asset-items">
          <div
            v-for="project in filteredProjects"
            :key="project.id"
            class="asset-item project-item"
            @click="openProject(project)"
          >
            <div class="project-thumbnail">
              <img v-if="project.thumbnail" :src="project.thumbnail" alt="" />
              <div v-else class="project-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path
                    d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
                  />
                </svg>
              </div>
            </div>
            <div class="project-info">
              <div class="project-name">{{ project.name }}</div>
              <div class="project-date">{{ formatDate(project.updatedAt) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 视频列表 -->
      <div v-if="activeTab === 'video'" class="asset-category">
        <div class="category-header">
          <h3 class="category-title">视频素材</h3>
          <button class="jianying-btn-icon" title="上传" @click="uploadVideo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
          </button>
        </div>
        <div class="asset-items">
          <div
            v-for="video in filteredVideos"
            :key="video.id"
            class="asset-item media-item"
            draggable="true"
            @dragstart="handleDragStart($event, video)"
            @click="selectAsset(video)"
          >
            <div class="media-thumbnail">
              <img :src="video.thumbnail" alt="" />
              <div class="media-duration">{{ formatDuration(video.duration) }}</div>
            </div>
            <div class="media-name">{{ video.name }}</div>
          </div>
        </div>
      </div>

      <!-- 图片列表 -->
      <div v-if="activeTab === 'image'" class="asset-category">
        <div class="category-header">
          <h3 class="category-title">图片素材</h3>
          <button class="jianying-btn-icon" title="上传" @click="uploadImage">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
          </button>
        </div>
        <div class="asset-items grid">
          <div
            v-for="image in filteredImages"
            :key="image.id"
            class="asset-item image-item"
            draggable="true"
            @dragstart="handleDragStart($event, image)"
            @click="selectAsset(image)"
          >
            <img :src="image.url" :alt="image.name" />
          </div>
        </div>
      </div>

      <!-- 音频列表 -->
      <div v-if="activeTab === 'audio'" class="asset-category">
        <div class="category-header">
          <h3 class="category-title">音频素材</h3>
          <button class="jianying-btn-icon" title="上传" @click="uploadAudio">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
          </button>
        </div>
        <div class="asset-items">
          <div
            v-for="audio in filteredAudios"
            :key="audio.id"
            class="asset-item audio-item"
            draggable="true"
            @dragstart="handleDragStart($event, audio)"
            @click="selectAsset(audio)"
          >
            <div class="audio-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path
                  d="M9 18V5l12-2v13M9 13c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z"
                />
              </svg>
            </div>
            <div class="audio-info">
              <div class="audio-name">{{ audio.name }}</div>
              <div class="audio-duration">{{ formatDuration(audio.duration) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 文本列表 -->
      <div v-if="activeTab === 'text'" class="asset-category">
        <div class="category-header">
          <h3 class="category-title">文本样式</h3>
          <button class="jianying-btn-icon" title="添加文本" @click="addText">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
        <div class="asset-items">
          <div
            v-for="textStyle in textStyles"
            :key="textStyle.id"
            class="asset-item text-style-item"
            @click="selectAsset(textStyle)"
          >
            <div class="text-preview" :style="textStyle.style">
              {{ textStyle.preview }}
            </div>
            <div class="text-style-name">{{ textStyle.name }}</div>
          </div>
        </div>
      </div>

      <!-- 特效列表 -->
      <div v-if="activeTab === 'effect'" class="asset-category">
        <div class="category-header">
          <h3 class="category-title">视觉特效</h3>
        </div>
        <div class="asset-items grid">
          <div
            v-for="effect in effects"
            :key="effect.id"
            class="asset-item effect-item"
            @click="selectAsset(effect)"
          >
            <div class="effect-preview">
              <div class="effect-icon">{{ effect.icon }}</div>
            </div>
            <div class="effect-name">{{ effect.name }}</div>
          </div>
        </div>
      </div>

      <!-- 动画列表 -->
      <div v-if="activeTab === 'animation'" class="asset-category">
        <div class="category-header">
          <h3 class="category-title">动画效果</h3>
        </div>
        <div class="asset-items">
          <div
            v-for="animation in animations"
            :key="animation.id"
            class="asset-item animation-item"
            @click="selectAsset(animation)"
          >
            <div class="animation-preview">
              <div class="animation-demo" :class="`animation-${animation.type}`">
                <div class="demo-box"></div>
              </div>
            </div>
            <div class="animation-name">{{ animation.name }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部一键生成按钮 -->
    <div class="asset-footer">
      <button class="auto-generate-btn" :disabled="!canGenerate" @click="handleAutoGenerate">
        <svg
          class="btn-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
        <span class="btn-text">一键自动生成</span>
      </button>
      <p class="auto-generate-hint">上传视频后自动生成PPT</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
  projects: {
    type: Array,
    default: () => []
  },
  videos: {
    type: Array,
    default: () => []
  },
  images: {
    type: Array,
    default: () => []
  },
  audios: {
    type: Array,
    default: () => []
  },
  canGenerate: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits([
  'auto-generate',
  'open-project',
  'upload-video',
  'upload-image',
  'upload-audio',
  'add-text',
  'select-asset',
  'refresh-projects'
])

// 状态
const searchQuery = ref('')
const activeTab = ref('project')
const assetListRef = ref(null)

// 标签配置
const tabs = [
  { id: 'project', icon: '📁', label: '项目' },
  { id: 'video', icon: '📹', label: '视频' },
  { id: 'image', icon: '🖼️', label: '图片' },
  { id: 'audio', icon: '🎵', label: '音频' },
  { id: 'text', icon: '📝', label: '文本' },
  { id: 'effect', icon: '✨', label: '特效' },
  { id: 'animation', icon: '🎭', label: '动画' }
]

// 文本样式
const textStyles = [
  { id: 1, name: '标题大字', preview: '标题', style: { fontSize: '24px', fontWeight: 'bold' } },
  { id: 2, name: '副标题', preview: '副标题', style: { fontSize: '18px', fontWeight: '600' } },
  { id: 3, name: '正文', preview: '正文', style: { fontSize: '16px' } },
  { id: 4, name: '注释', preview: '注释', style: { fontSize: '14px', color: '#86868B' } }
]

// 特效
const effects = [
  { id: 1, name: '淡入淡出', icon: '🌟', type: 'fade' },
  { id: 2, name: '模糊效果', icon: '🌫️', type: 'blur' },
  { id: 3, name: '色彩调整', icon: '🎨', type: 'color' },
  { id: 4, name: '马赛克', icon: '🔲', type: 'mosaic' }
]

// 动画
const animations = [
  { id: 1, name: '淡入', type: 'fade-in' },
  { id: 2, name: '滑入', type: 'slide-in' },
  { id: 3, name: '缩放', type: 'scale' },
  { id: 4, name: '旋转', type: 'rotate' }
]

// 过滤后的列表
const filteredProjects = computed(() => {
  if (!searchQuery.value) return props.projects
  return props.projects.filter(p => p.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

const filteredVideos = computed(() => {
  if (!searchQuery.value) return props.videos
  return props.videos.filter(v => v.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

const filteredImages = computed(() => {
  if (!searchQuery.value) return props.images
  return props.images.filter(i => i.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

const filteredAudios = computed(() => {
  if (!searchQuery.value) return props.audios
  return props.audios.filter(a => a.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

// 方法
const handleSearch = () => {
  // 搜索逻辑已在computed中处理
}

const clearSearch = () => {
  searchQuery.value = ''
}

const handleAutoGenerate = () => {
  emit('auto-generate')
}

const openProject = project => {
  emit('open-project', project)
}

const uploadVideo = () => {
  emit('upload-video')
}

const uploadImage = () => {
  emit('upload-image')
}

const uploadAudio = () => {
  emit('upload-audio')
}

const addText = () => {
  emit('add-text')
}

const selectAsset = asset => {
  emit('select-asset', asset)
}

const refreshProjects = () => {
  emit('refresh-projects')
}

const handleDragStart = (event, asset) => {
  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setData('application/json', JSON.stringify(asset))
}

const formatDate = date => {
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

const formatDuration = seconds => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.asset-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-bg-primary);
}

/* 搜索框 */
.asset-search {
  padding: var(--spacing-4);
  border-bottom: 1px solid var(--color-divider);
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  width: 18px;
  height: 18px;
  color: var(--color-text-tertiary);
  pointer-events: none;
}

.search-input {
  padding-left: 40px !important;
  padding-right: 40px !important;
}

.clear-btn {
  position: absolute;
  right: 8px;
  width: 24px;
  height: 24px;
  padding: 0;
  background: none;
  border: none;
  border-radius: var(--radius-full);
  color: var(--color-text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--duration-base) var(--ease-out);
}

.clear-btn:hover {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.clear-btn svg {
  width: 14px;
  height: 14px;
}

/* 标签页 */
.asset-tabs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-1);
  padding: var(--spacing-2);
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-divider);
}

.jianying-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-2);
  min-height: 56px;
}

.tab-icon {
  font-size: 20px;
}

.tab-label {
  font-size: var(--text-xs);
}

/* 素材列表 */
.asset-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.asset-category {
  padding: var(--spacing-4);
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-3);
}

.category-title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.asset-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.asset-items.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-2);
}

/* 项目项 */
.project-item {
  display: flex;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-base) var(--ease-out);
}

.project-item:hover {
  background: var(--color-bg-tertiary);
  transform: translateX(4px);
}

.project-thumbnail {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--color-bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.project-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-quaternary);
}

.project-placeholder svg {
  width: 24px;
  height: 24px;
}

.project-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  justify-content: center;
}

.project-name {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-date {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}

/* 媒体项 */
.media-item {
  cursor: grab;
  transition: all var(--duration-base) var(--ease-out);
}

.media-item:hover {
  transform: scale(1.02);
}

.media-item:active {
  cursor: grabbing;
}

.media-thumbnail {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-bg-secondary);
  margin-bottom: var(--spacing-2);
}

.media-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-duration {
  position: absolute;
  bottom: var(--spacing-1);
  right: var(--spacing-1);
  padding: 2px var(--spacing-1);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  font-size: var(--text-xs);
  border-radius: var(--radius-sm);
}

.media-name {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 图片项 */
.image-item {
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: grab;
  transition: all var(--duration-base) var(--ease-out);
}

.image-item:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-md);
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 音频项 */
.audio-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  cursor: grab;
  transition: all var(--duration-base) var(--ease-out);
}

.audio-item:hover {
  background: var(--color-bg-tertiary);
}

.audio-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-light);
  border-radius: var(--radius-md);
  color: var(--color-primary);
}

.audio-icon svg {
  width: 20px;
  height: 20px;
}

.audio-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.audio-name {
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.audio-duration {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}

/* 底部按钮 */
.asset-footer {
  padding: var(--spacing-4);
  border-top: 1px solid var(--color-divider);
  background: var(--color-bg-primary);
}

.auto-generate-btn {
  width: 100%;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: var(--radius-2xl);
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  box-shadow: var(--shadow-md);
  transition: all var(--duration-base) var(--ease-out);
}

.auto-generate-btn:hover:not(:disabled) {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.auto-generate-btn:active:not(:disabled) {
  transform: translateY(0);
}

.auto-generate-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  width: 20px;
  height: 20px;
}

.auto-generate-hint {
  margin-top: var(--spacing-2);
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  text-align: center;
}
</style>
