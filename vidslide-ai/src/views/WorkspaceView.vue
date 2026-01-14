<!--
  VidSlide AI - 工作空间
  简洁实用的视频编辑界面
-->
<template>
  <div class="workspace">
    <!-- 头部工具栏 -->
    <header class="workspace-header">
      <div class="header-content">
        <h1 class="workspace-title">🎬 VidSlide AI - 工作空间</h1>
        <div class="header-actions">
          <button class="header-btn" @click="newProject">新建项目</button>
          <button class="header-btn" @click="openProject">打开项目</button>
          <button class="header-btn primary" @click="saveProject">保存</button>
        </div>
      </div>
    </header>

    <!-- 主工作区 - 测试破坏 -->
    <main class="workspace-main-test">
      <!-- 左侧面板 -->
      <aside class="left-panel">
        <div class="panel-section">
          <h3 class="panel-title">🎨 模板选择</h3>
          <div class="template-list">
            <button
              v-for="template in templates"
              :key="template.id"
              class="template-btn"
              :class="{ active: selectedTemplate?.id === template.id }"
              @click="selectTemplate(template)"
            >
              <span class="template-icon">{{ template.icon }}</span>
              <div class="template-info">
                <div class="template-name">{{ template.name }}</div>
                <div class="template-desc">{{ template.description }}</div>
              </div>
            </button>
          </div>
        </div>

        <div class="panel-section">
          <h3 class="panel-title">⚙️ 画中画设置</h3>
          <div class="control-group">
            <label class="control-label">位置</label>
            <select v-model="pipSettings.position" class="control-select">
              <option value="top-left">左上角</option>
              <option value="top-right">右上角</option>
              <option value="bottom-left">左下角</option>
              <option value="bottom-right">右下角</option>
            </select>
          </div>

          <div class="control-group">
            <label class="control-label">大小: {{ pipSettings.size }}%</label>
            <input type="range" min="10" max="50" v-model="pipSettings.size" class="control-range">
          </div>

          <div class="control-group">
            <label class="control-label">样式</label>
            <select v-model="pipSettings.style" class="control-select">
              <option value="simple">简洁</option>
              <option value="professional">专业</option>
              <option value="dynamic">活跃</option>
            </select>
          </div>
        </div>
      </aside>

      <!-- 主编辑区 -->
      <section class="main-editor">
        <!-- 上传区域 -->
        <div v-if="!videoSrc" class="upload-area">
          <div class="upload-content">
            <div class="upload-icon">🎥</div>
            <h2 class="upload-title">上传您的视频</h2>
            <p class="upload-desc">支持 MP4、AVI、MOV 等格式，文件大小不超过 500MB</p>
            <label for="video-upload" class="upload-btn">
              选择视频文件
            </label>
            <input
              id="video-upload"
              type="file"
              accept="video/*"
              @change="handleVideoUpload"
              style="display: none;"
            >
          </div>
        </div>

        <!-- 编辑区域 -->
        <div v-else class="editor-area">
          <div class="editor-header">
            <h3 class="editor-title">{{ selectedTemplate?.name || '选择模板开始编辑' }}</h3>
            <div class="editor-actions">
              <button class="action-btn" @click="previewVideo">预览</button>
              <button class="action-btn primary" @click="exportVideo">导出</button>
            </div>
          </div>

          <div class="editor-canvas">
            <video
              v-if="videoSrc"
              ref="videoElement"
              :src="videoSrc"
              class="preview-video"
              controls
              @loadedmetadata="onVideoLoaded"
            ></video>

            <!-- 画中画预览 -->
            <div v-if="pipEnabled && videoSrc" class="pip-overlay">
              <div class="pip-window" :style="pipStyle">
                <video
                  :src="videoSrc"
                  muted
                  autoplay
                  loop
                  class="pip-video"
                ></video>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 右侧面板 -->
      <aside class="right-panel">
        <div class="panel-section">
          <h3 class="panel-title">📊 项目状态</h3>
          <div class="status-list">
            <div class="status-item">
              <span class="status-label">视频:</span>
              <span class="status-value" :class="{ ready: videoSrc, empty: !videoSrc }">
                {{ videoSrc ? '已加载' : '未加载' }}
              </span>
            </div>
            <div class="status-item">
              <span class="status-label">模板:</span>
              <span class="status-value" :class="{ ready: selectedTemplate, empty: !selectedTemplate }">
                {{ selectedTemplate ? selectedTemplate.name : '未选择' }}
              </span>
            </div>
            <div class="status-item">
              <span class="status-label">画中画:</span>
              <span class="status-value" :class="{ enabled: pipEnabled }">
                {{ pipEnabled ? '启用' : '禁用' }}
              </span>
            </div>
          </div>
        </div>

        <div class="panel-section">
          <h3 class="panel-title">🎬 动画效果</h3>
          <div class="animation-list">
            <button class="animation-btn" @click="addFadeEffect">淡入效果</button>
            <button class="animation-btn" @click="addSlideEffect">滑入效果</button>
            <button class="animation-btn" @click="addZoomEffect">缩放效果</button>
            <button class="animation-btn" @click="clearAnimations">清除动画</button>
          </div>
        </div>

        <div class="panel-section">
          <h3 class="panel-title">🤖 AI建议</h3>
          <div class="ai-list">
            <div class="ai-item">
              💡 建议使用画中画模板突出演讲者
            </div>
            <div class="ai-item">
              🎨 检测到数据内容，推荐图表模板
            </div>
            <div class="ai-item">
              ⚡ AI已自动优化颜色搭配
            </div>
          </div>
        </div>
      </aside>
    </main>

    <!-- 时间线 -->
    <footer class="timeline">
      <div class="timeline-track">
        <div class="timeline-progress" :style="{ width: progressPercent + '%' }"></div>
        <div
          v-for="marker in timelineMarkers"
          :key="marker.id"
          class="timeline-marker"
          :style="{ left: marker.position + '%' }"
          @click="selectMarker(marker)"
        ></div>
      </div>
      <div class="timeline-controls">
        <button class="timeline-btn" @click="addMarker">
          <span class="btn-icon">➕</span>
          添加标记
        </button>
        <button class="timeline-btn" @click="removeMarker" :disabled="!selectedMarkerId">
          <span class="btn-icon">🗑️</span>
          删除标记
        </button>
        <span class="marker-count">标记数量: {{ timelineMarkers.length }}</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 响应式状态
const videoSrc = ref('')
const selectedTemplate = ref(null)
const pipEnabled = ref(false)
const videoElement = ref(null)

// 模板数据
const templates = ref([
  {
    id: 'pip',
    name: '画中画',
    description: '视频与PPT并排显示',
    icon: '📺'
  },
  {
    id: 'info-card',
    name: '信息卡片',
    description: '数据可视化展示',
    icon: '📊'
  },
  {
    id: 'keyword',
    name: '关键词高亮',
    description: '重点内容突出显示',
    icon: '🔍'
  },
  {
    id: 'document',
    name: '文档展示',
    description: '文件内容3D展示',
    icon: '📄'
  },
  {
    id: 'title',
    name: '标题文字',
    description: '醒目标题动画',
    icon: '📝'
  }
])

// 画中画设置
const pipSettings = ref({
  position: 'top-right',
  size: 25,
  style: 'professional'
})

// 时间线标记
const timelineMarkers = ref([
  { id: 1, position: 20 },
  { id: 2, position: 45 },
  { id: 3, position: 70 }
])

const selectedMarkerId = ref(null)
const currentProgress = ref(30)

// 计算属性
const progressPercent = computed(() => currentProgress.value)

const pipStyle = computed(() => {
  const size = pipSettings.value.size
  const position = pipSettings.value.position

  let positionStyle = {}
  switch (position) {
    case 'top-left':
      positionStyle = { top: '20px', left: '20px' }
      break
    case 'top-right':
      positionStyle = { top: '20px', right: '20px' }
      break
    case 'bottom-left':
      positionStyle = { bottom: '20px', left: '20px' }
      break
    case 'bottom-right':
      positionStyle = { bottom: '20px', right: '20px' }
      break
  }

  return {
    width: `${size}%`,
    height: `${size * 9 / 16}%`, // 保持16:9比例
    ...positionStyle
  }
})

// 方法
const newProject = () => {
  console.log('🆕 新建项目')
  resetWorkspace()
}

const openProject = () => {
  console.log('📂 打开项目')
}

const saveProject = () => {
  console.log('💾 保存项目')
}

const selectTemplate = (template) => {
  console.log('🎨 选择模板:', template.name)
  selectedTemplate.value = template
  pipEnabled.value = template.id === 'pip'
}

const handleVideoUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    console.log('📁 选择文件:', file.name)

    // 验证文件类型
    if (!file.type.startsWith('video/')) {
      alert('请选择有效的视频文件')
      return
    }

    // 验证文件大小 (500MB)
    if (file.size > 500 * 1024 * 1024) {
      alert('文件过大，请选择小于500MB的文件')
      return
    }

    const url = URL.createObjectURL(file)
    videoSrc.value = url
  }
}

const onVideoLoaded = () => {
  console.log('🎬 视频加载完成')
}

const previewVideo = () => {
  console.log('▶️ 预览视频')
}

const exportVideo = () => {
  console.log('📤 导出视频')
}

const togglePip = () => {
  pipEnabled.value = !pipEnabled.value
  console.log('🎬 切换画中画:', pipEnabled.value ? '启用' : '禁用')
}

const addFadeEffect = () => {
  console.log('🌅 添加淡入效果')
}

const addSlideEffect = () => {
  console.log('➡️ 添加滑入效果')
}

const addZoomEffect = () => {
  console.log('🔍 添加缩放效果')
}

const clearAnimations = () => {
  console.log('🗑️ 清除动画')
}

const addMarker = () => {
  const newId = Math.max(...timelineMarkers.value.map(m => m.id)) + 1
  timelineMarkers.value.push({
    id: newId,
    position: Math.random() * 80 + 10
  })
}

const removeMarker = () => {
  if (selectedMarkerId.value) {
    const index = timelineMarkers.value.findIndex(m => m.id === selectedMarkerId.value)
    if (index > -1) {
      timelineMarkers.value.splice(index, 1)
      selectedMarkerId.value = null
    }
  }
}

const selectMarker = (marker) => {
  selectedMarkerId.value = marker.id
}

const resetWorkspace = () => {
  console.log('🔄 重置工作空间')
  videoSrc.value = ''
  selectedTemplate.value = null
  pipEnabled.value = false
  timelineMarkers.value = [
    { id: 1, position: 20 },
    { id: 2, position: 45 },
    { id: 3, position: 70 }
  ]
  selectedMarkerId.value = null
  currentProgress.value = 30
}

onMounted(() => {
  console.log('🎬 VidSlide AI 工作空间已加载')
  console.log('✅ 简单实用的视频编辑界面')
})
</script>

<style scoped>
/* ===========================================
   VidSlide AI - 工作空间
   苹果设计风格优化版本
   =========================================== */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.workspace {
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  background: #FAFAFA;
  color: #1C1C1E;
}

/* 头部工具栏 */
.workspace-header {
  height: 52px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid #E5E5EA;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.workspace-title {
  font-size: 17px;
  font-weight: 600;
  color: #1C1C1E;
  letter-spacing: -0.022em;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: #F2F2F7;
  color: #636366;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.05);
}

.header-btn:hover {
  background: #E5E5EA;
  transform: translateY(-0.5px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.05);
}

.header-btn.primary {
  background: #007AFF;
  color: white;
  box-shadow: 0 2px 0 rgba(0, 122, 255, 0.3);
}

.header-btn.primary:hover {
  background: #0056CC;
  box-shadow: 0 4px 8px rgba(0, 122, 255, 0.3);
}

.header-btn.primary:active {
  box-shadow: 0 1px 0 rgba(0, 122, 255, 0.2);
}

/* 主工作区 - 三栏布局 */
.workspace-main {
  flex: 1;
  display: grid;
  grid-template-columns: 320px 1fr 300px;
  gap: 24px;
  padding: 24px;
}

/* 左侧面板和右侧面板 */
.left-panel,
.right-panel {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid #E5E5EA;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
}

.panel-section {
  padding: 20px;
  border-bottom: 1px solid #F2F2F7;
}

.panel-section:last-child {
  border-bottom: none;
}

.panel-title {
  font-size: 15px;
  font-weight: 600;
  color: #1C1C1E;
  margin-bottom: 16px;
  letter-spacing: -0.016em;
}

/* 模板列表 */
.template-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.template-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: #FAFAFA;
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.05);
}

.template-btn:hover {
  background: #F2F2F7;
  border-color: #007AFF;
  transform: translateY(-0.5px);
  box-shadow: 0 2px 4px rgba(0, 122, 255, 0.1);
}

.template-btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.05);
}

.template-btn.active {
  background: #007AFF;
  color: white;
  border-color: #007AFF;
  box-shadow: 0 2px 4px rgba(0, 122, 255, 0.2);
}

.template-icon {
  font-size: 18px;
  width: 28px;
  text-align: center;
  flex-shrink: 0;
}

.template-info {
  flex: 1;
  min-width: 0;
}

.template-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  line-height: 1.3;
}

.template-desc {
  font-size: 12px;
  color: #8E8E93;
  line-height: 1.4;
}

/* 控制组件 */
.control-group {
  margin-bottom: 16px;
}

.control-group:last-child {
  margin-bottom: 0;
}

.control-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #636366;
  margin-bottom: 8px;
  letter-spacing: -0.006em;
}

.control-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #D1D1D6;
  border-radius: 8px;
  background: white;
  color: #1C1C1E;
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 8px center;
  background-repeat: no-repeat;
  background-size: 16px 16px;
  padding-right: 32px;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.05);
}

.control-select:focus {
  outline: none;
  border-color: #007AFF;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.control-select:hover {
  border-color: #C7C7CC;
}

.control-range {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #E5E5EA;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}

.control-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #007AFF;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 122, 255, 0.2);
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.control-range::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 122, 255, 0.3);
}

.control-range::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #007AFF;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 122, 255, 0.2);
}

/* 主编辑区 */
.main-editor {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid #E5E5EA;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
}

/* 上传区域 */
.upload-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.upload-content {
  text-align: center;
  max-width: 400px;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 24px;
  opacity: 0.6;
}

.upload-title {
  font-size: 22px;
  font-weight: 600;
  color: #1C1C1E;
  margin-bottom: 12px;
  letter-spacing: -0.022em;
}

.upload-desc {
  font-size: 15px;
  color: #8E8E93;
  margin-bottom: 32px;
  line-height: 1.5;
}

.upload-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  background: #007AFF;
  color: white;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 0 rgba(0, 122, 255, 0.3);
  min-height: 44px;
}

.upload-btn:hover {
  background: #0056CC;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 122, 255, 0.3);
}

.upload-btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 0 rgba(0, 122, 255, 0.2);
}

/* 编辑区域 */
.editor-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #FAFAFA;
  border-bottom: 1px solid #E5E5EA;
}

.editor-title {
  font-size: 17px;
  font-weight: 600;
  color: #1C1C1E;
  letter-spacing: -0.022em;
}

.editor-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: #AEAEB2;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.2);
  min-height: 32px;
}

.action-btn:hover {
  background: #8E8E93;
  transform: translateY(-0.5px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.action-btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);
}

.action-btn.primary {
  background: #007AFF;
  box-shadow: 0 2px 0 rgba(0, 122, 255, 0.3);
}

.action-btn.primary:hover {
  background: #0056CC;
  box-shadow: 0 4px 8px rgba(0, 122, 255, 0.3);
}

.editor-canvas {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F2F2F7;
  position: relative;
}

.preview-video {
  max-width: 90%;
  max-height: 90%;
  border-radius: 12px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);
  border: 1px solid #E5E5EA;
}

/* 画中画预览 */
.pip-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.pip-window {
  position: absolute;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 2px solid #007AFF;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);
  pointer-events: auto;
}

.pip-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
}

/* 右侧面板 */
.status-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #FAFAFA;
  border-radius: 8px;
  border: 1px solid #E5E5EA;
}

.status-label {
  font-size: 14px;
  font-weight: 500;
  color: #636366;
}

.status-value {
  font-size: 14px;
  font-weight: 500;
}

.status-value.ready {
  color: #34C759;
}

.status-value.empty {
  color: #AEAEB2;
}

.status-value.enabled {
  color: #007AFF;
}

.animation-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.animation-btn {
  padding: 8px 12px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: #FAFAFA;
  color: #1C1C1E;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.05);
}

.animation-btn:hover {
  background: #F2F2F7;
  border-color: #007AFF;
  transform: translateY(-0.5px);
  box-shadow: 0 2px 4px rgba(0, 122, 255, 0.1);
}

.animation-btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.05);
}

.ai-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ai-item {
  padding: 12px;
  background: rgba(0, 122, 255, 0.05);
  border-left: 3px solid #007AFF;
  border-radius: 8px;
  font-size: 14px;
  color: #1C1C1E;
  line-height: 1.4;
}

/* 时间线 */
.timeline {
  height: 88px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid #E5E5EA;
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 20px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
}

.timeline-track {
  flex: 1;
  height: 6px;
  background: #E5E5EA;
  border-radius: 3px;
  position: relative;
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.timeline-track:hover {
  background: #D1D1D6;
}

.timeline-progress {
  height: 100%;
  background: linear-gradient(135deg, #007AFF, #0056CC);
  border-radius: 3px;
  width: 30%;
  transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.timeline-progress::after {
  content: '';
  position: absolute;
  right: -3px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  background: #007AFF;
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 122, 255, 0.2);
}

.timeline-marker {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  background: #FF3B30;
  border-radius: 50%;
  border: 2px solid white;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(255, 59, 48, 0.3);
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.timeline-marker:hover {
  transform: translate(-50%, -50%) scale(1.2);
  box-shadow: 0 4px 8px rgba(255, 59, 48, 0.4);
}

.timeline-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.timeline-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  background: #007AFF;
  color: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 0 rgba(0, 122, 255, 0.3);
  min-height: 32px;
}

.timeline-btn:hover {
  background: #0056CC;
  transform: translateY(-0.5px);
  box-shadow: 0 2px 4px rgba(0, 122, 255, 0.3);
}

.timeline-btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 0 rgba(0, 122, 255, 0.2);
}

.timeline-btn:disabled {
  background: #C7C7CC;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.marker-count {
  font-size: 13px;
  font-weight: 500;
  color: #8E8E93;
  min-width: 60px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .workspace-main {
    grid-template-columns: 300px 1fr 280px;
    padding: 20px;
  }
}

@media (max-width: 1024px) {
  .workspace-main {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto;
    padding: 16px;
  }

  .left-panel,
  .right-panel {
    display: none;
  }

  .timeline {
    grid-column: 1 / -1;
  }

  .upload-area {
    padding: 32px;
  }
}

@media (max-width: 768px) {
  .workspace-header {
    height: 48px;
  }

  .header-content {
    padding: 0 16px;
  }

  .workspace-title {
    font-size: 16px;
  }

  .header-actions {
    gap: 8px;
  }

  .header-btn {
    padding: 4px 12px;
    font-size: 13px;
    min-height: 36px;
  }

  .upload-content {
    padding: 16px;
  }

  .upload-title {
    font-size: 20px;
  }

  .upload-icon {
    font-size: 40px;
    margin-bottom: 20px;
  }

  .upload-btn {
    padding: 8px 20px;
    font-size: 14px;
    min-height: 40px;
  }

  .timeline {
    height: 72px;
    padding: 0 16px;
    gap: 16px;
  }

  .timeline-btn {
    padding: 4px 12px;
    font-size: 12px;
    min-height: 28px;
  }

  .marker-count {
    font-size: 12px;
    min-width: 50px;
  }
}

@media (max-width: 480px) {
  .workspace-header {
    height: 44px;
  }

  .header-content {
    padding: 0 12px;
  }

  .workspace-title {
    font-size: 15px;
  }

  .header-actions {
    gap: 4px;
  }

  .header-btn {
    padding: 4px 8px;
    font-size: 12px;
    min-height: 32px;
  }

  .upload-area {
    padding: 24px;
  }

  .upload-content {
    max-width: 300px;
  }

  .upload-title {
    font-size: 18px;
  }

  .upload-desc {
    font-size: 14px;
  }

  .upload-btn {
    padding: 8px 16px;
    font-size: 13px;
    min-height: 36px;
  }

  .timeline {
    height: 64px;
    padding: 0 12px;
    gap: 12px;
  }

  .timeline-btn {
    padding: 4px 8px;
    font-size: 11px;
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .workspace {
    background: #000000;
  }

  .workspace-header {
    background: rgba(0, 0, 0, 0.9);
    border-bottom-color: rgba(255, 255, 255, 0.3);
  }

  .left-panel,
  .right-panel {
    background: rgba(0, 0, 0, 0.8);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .header-btn {
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }

  .timeline-progress {
    transition: none;
  }
}
</style>console.log('test')
