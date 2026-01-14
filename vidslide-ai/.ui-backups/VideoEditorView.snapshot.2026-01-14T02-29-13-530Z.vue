<!--
  VidSlide AI - 苹果风格专业工作界面
  基于V0.dev设计的完整功能工作空间
  三栏布局：工具栏 + 主编辑区 + 属性面板 + 时间线
-->
<template>
  <!-- 标题栏 -->
  <div class="title-bar">
    <h1>🎬 VidSlide AI - 专业视频编辑工作台</h1>
  </div>

  <!-- 主工作区 -->
  <div class="workspace">
    <!-- 左侧工具栏 -->
    <div class="toolbar">
      <div class="tool-group">
        <button class="tool-btn" title="新建项目" @click="newProject">📄</button>
        <button class="tool-btn" title="打开项目" @click="openProject">📂</button>
        <button class="tool-btn" title="保存" @click="saveProject">💾</button>
      </div>

      <div class="tool-group">
        <button class="tool-btn active" title="上传视频" @click="uploadVideo">🎥</button>
        <button class="tool-btn" title="剪辑" @click="trimVideo">✂️</button>
        <button class="tool-btn" title="分割" @click="splitVideo">🔀</button>
      </div>

      <div class="tool-group">
        <button class="tool-btn" title="模板选择" @click="selectTemplate">🎨</button>
        <button class="tool-btn" title="幻灯片管理" @click="manageSlides">📊</button>
        <button class="tool-btn" title="样式设置" @click="setStyle">🎯</button>
      </div>

      <div class="tool-group">
        <button class="tool-btn" title="文字工具" @click="textTool">📝</button>
        <button class="tool-btn" title="形状工具" @click="shapeTool">⬜</button>
        <button class="tool-btn" title="颜色" @click="colorTool">🎨</button>
      </div>

      <div class="tool-group">
        <button class="tool-btn" title="AI生成" @click="aiGenerate">🤖</button>
        <button class="tool-btn" title="智能同步" @click="smartSync">⚡</button>
        <button class="tool-btn" title="一键优化" @click="optimize">✨</button>
      </div>
    </div>

    <!-- 主编辑区 -->
    <div class="main-canvas">
      <div class="canvas-container">
        <div class="canvas-content">
          <div class="template-preview">
            <img
              :src="currentTemplateImage"
              :alt="currentTemplateName + '模板预览'"
              class="template-image"
            >
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧属性面板 -->
    <div class="properties-panel">
      <div class="panel-tabs">
        <button
          class="panel-tab"
          :class="{ active: activePanelTab === 'template' }"
          @click="activePanelTab = 'template'"
        >
          🎨 模板
        </button>
        <button
          class="panel-tab"
          :class="{ active: activePanelTab === 'style' }"
          @click="activePanelTab = 'style'"
        >
          ⚙️ 样式
        </button>
        <button
          class="panel-tab"
          :class="{ active: activePanelTab === 'animation' }"
          @click="activePanelTab = 'animation'"
        >
          🎬 动画
        </button>
        <button
          class="panel-tab"
          :class="{ active: activePanelTab === 'ai' }"
          @click="activePanelTab = 'ai'"
        >
          🤖 AI助手
        </button>
      </div>

      <div class="panel-content">
        <!-- 模板标签页 -->
        <div v-if="activePanelTab === 'template'" class="property-group">
          <h3>模板选择</h3>
          <div class="template-selector">
            <div
              v-for="template in templates"
              :key="template.id"
              class="template-card"
              :class="{ selected: selectedTemplateId === template.id }"
              @click="selectTemplateById(template.id)"
            >
              <div class="template-name">{{ template.name }}</div>
              <div class="template-desc">{{ template.description }}</div>
            </div>
          </div>
        </div>

        <!-- 样式标签页 -->
        <div v-if="activePanelTab === 'style'" class="property-group">
          <h3>画中画设置</h3>
          <div class="style-controls">
            <div class="control-item">
              <label>位置</label>
              <select v-model="pipSettings.position">
                <option value="top-left">左上角</option>
                <option value="top-right">右上角</option>
                <option value="bottom-left">左下角</option>
                <option value="bottom-right">右下角</option>
              </select>
            </div>
            <div class="control-item">
              <label>大小: {{ pipSettings.size }}%</label>
              <input type="range" min="10" max="50" v-model="pipSettings.size">
            </div>
            <div class="control-item">
              <label>样式</label>
              <select v-model="pipSettings.style">
                <option value="simple">简洁</option>
                <option value="professional">专业</option>
                <option value="dynamic">活跃</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 动画标签页 -->
        <div v-if="activePanelTab === 'animation'" class="property-group">
          <h3>动画效果</h3>
          <div class="animation-controls">
            <button class="control-btn" @click="addFadeAnimation">淡入效果</button>
            <button class="control-btn" @click="addSlideAnimation">滑入效果</button>
            <button class="control-btn" @click="addZoomAnimation">缩放效果</button>
            <button class="control-btn" @click="clearAnimations">清除动画</button>
          </div>
        </div>

        <!-- AI助手标签页 -->
        <div v-if="activePanelTab === 'ai'" class="property-group">
          <h3>AI智能助手</h3>
          <div class="ai-assistant">
            <div class="ai-suggestions">
              <div class="suggestion-item">
                <span class="suggestion-icon">💡</span>
                <span>建议使用画中画模板突出演讲者</span>
              </div>
              <div class="suggestion-item">
                <span class="suggestion-icon">🎨</span>
                <span>检测到数据内容，推荐图表模板</span>
              </div>
              <div class="suggestion-item">
                <span class="suggestion-icon">⚡</span>
                <span>AI已自动优化颜色搭配</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 时间线 -->
  <div class="timeline">
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
      <button class="timeline-btn" @click="addMarker">➕ 添加标记</button>
      <button class="timeline-btn" @click="removeMarker" :disabled="!selectedMarkerId">🗑️ 删除标记</button>
      <span>标记数量: {{ timelineMarkers.length }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 响应式状态
const activePanelTab = ref('template')
const selectedTemplateId = ref('pip')
const currentTemplateImage = ref('/assets/templates/pip-template.png')
const currentTemplateName = ref('画中画')

// 模板数据
const templates = ref([
  {
    id: 'pip',
    name: '画中画',
    description: '视频与PPT并排显示',
    image: '/assets/templates/pip-template.png'
  },
  {
    id: 'info-card',
    name: '信息卡片',
    description: '数据可视化展示',
    image: '/assets/templates/info-card-template.png'
  },
  {
    id: 'keyword',
    name: '关键词高亮',
    description: '重点内容突出显示',
    image: '/assets/templates/keyword-template.png'
  },
  {
    id: 'document',
    name: '文档展示',
    description: '文件内容3D展示',
    image: '/assets/templates/document-template.png'
  },
  {
    id: 'title',
    name: '标题文字',
    description: '醒目标题动画',
    image: '/assets/templates/title-template.png'
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

// 方法 - 工具栏操作
const newProject = () => {
  console.log('🆕 新建项目')
  // 实现新建项目逻辑
  resetWorkspace()
}

const openProject = () => {
  console.log('📂 打开项目')
  // 实现打开项目逻辑
}

const saveProject = () => {
  console.log('💾 保存项目')
  // 实现保存逻辑
}

const uploadVideo = () => {
  console.log('🎥 上传视频')
  // 实现视频上传逻辑
  triggerFileInput()
}

const trimVideo = () => {
  console.log('✂️ 剪辑视频')
  // 实现视频剪辑逻辑
}

const splitVideo = () => {
  console.log('🔀 分割视频')
  // 实现视频分割逻辑
}

// 模板相关方法
const selectTemplate = () => {
  console.log('🎨 选择模板')
  activePanelTab.value = 'template'
}

const selectTemplateById = (templateId) => {
  console.log('🎨 选择模板:', templateId)
  selectedTemplateId.value = templateId

  const template = templates.value.find(t => t.id === templateId)
  if (template) {
    currentTemplateImage.value = template.image
    currentTemplateName.value = template.name

    // 调用模板渲染服务
    renderTemplate(template)
  }
}

const renderTemplate = (template) => {
  console.log('🎨 渲染模板:', template.name)
  try {
    // 这里应该调用实际的模板渲染服务
    console.log('✅ 模板渲染完成 (占位符)')
  } catch (error) {
    console.error('❌ 模板渲染失败:', error)
  }
}

// 其他工具方法
const manageSlides = () => {
  console.log('📊 管理幻灯片')
}

const setStyle = () => {
  console.log('🎯 设置样式')
  activePanelTab.value = 'style'
}

const textTool = () => {
  console.log('📝 文字工具')
}

const shapeTool = () => {
  console.log('⬜ 形状工具')
}

const colorTool = () => {
  console.log('🎨 颜色工具')
}

const aiGenerate = () => {
  console.log('🤖 AI生成')
}

const smartSync = () => {
  console.log('⚡ 智能同步')
}

const optimize = () => {
  console.log('✨ 一键优化')
}

// 动画方法
const addFadeAnimation = () => {
  console.log('🎬 添加淡入动画')
  console.log('✅ 淡入动画添加完成 (占位符)')
}

const addSlideAnimation = () => {
  console.log('🎬 添加滑入动画')
  console.log('✅ 滑入动画添加完成 (占位符)')
}

const addZoomAnimation = () => {
  console.log('🎬 添加缩放动画')
  console.log('✅ 缩放动画添加完成 (占位符)')
}

const clearAnimations = () => {
  console.log('🎬 清除所有动画')
  console.log('✅ 所有动画已清除 (占位符)')
}

// 时间线方法
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

// 工具方法
const triggerFileInput = () => {
  // 创建隐藏的文件输入元素
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'video/*'
  input.onchange = handleFileSelect
  input.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    console.log('📁 选择文件:', file.name)
    // 实现文件处理逻辑
    processVideoFile(file)
  }
}

const processVideoFile = (file) => {
  console.log('🎬 处理视频文件:', file.name)
  try {
    // 这里应该调用背景移除服务处理视频
    console.log('✅ 视频处理完成 (占位符)')
  } catch (error) {
    console.error('❌ 视频处理失败:', error)
  }
}

const resetWorkspace = () => {
  console.log('🔄 重置工作空间')
  selectedTemplateId.value = 'pip'
  currentTemplateImage.value = '/assets/templates/pip-template.png'
  currentTemplateName.value = '画中画'
  activePanelTab.value = 'template'
  timelineMarkers.value = [
    { id: 1, position: 20 },
    { id: 2, position: 45 },
    { id: 3, position: 70 }
  ]
  selectedMarkerId.value = null
  currentProgress.value = 30
}

// 生命周期
onMounted(() => {
  console.log('🎬 VidSlide AI 专业工作界面已加载')
  console.log('✅ 基于苹果风格设计的三栏布局')
  console.log('✅ 工具栏 + 主编辑区 + 属性面板 + 时间线')

  // 加载初始模板
  loadInitialTemplate()
})

// 加载初始模板
const loadInitialTemplate = () => {
  try {
    const initialTemplate = templates.value.find(t => t.id === selectedTemplateId.value)
    if (initialTemplate) {
      renderTemplate(initialTemplate)
      console.log('✅ 初始模板加载完成')
    }
  } catch (error) {
    console.error('❌ 初始模板加载失败:', error)
  }
}
</script>

<style scoped>
/* ===========================================
   VidSlide AI - 苹果风格专业UI界面
   基于V0.dev设计的完整功能工作空间
   =========================================== */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', sans-serif;
  background: #1A1A1A;
  color: #FFFFFF;
  height: 100vh;
  overflow: hidden;
}

/* 标题栏 */
.title-bar {
  height: 40px;
  background: #2A2A2A;
  border-bottom: 1px solid #404040;
  display: flex;
  align-items: center;
  padding: 0 20px;
  -webkit-app-region: drag; /* 使整个标题栏可拖动 */
}

.title-bar h1 {
  font-size: 14px;
  font-weight: 500;
  color: #FFFFFF;
}

/* 主工作区 - 三栏布局 */
.workspace {
  display: grid;
  grid-template-columns: 64px 1fr 320px; /* 左侧工具栏，主编辑区，右侧属性面板 */
  height: calc(100vh - 40px); /* 减去标题栏高度 */
}

/* 左侧工具栏 */
.toolbar {
  background: #2A2A2A;
  border-right: 1px solid #404040;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  gap: 16px;
}

.tool-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
}

.tool-btn {
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tool-btn:hover {
  background: rgba(0, 122, 255, 0.2);
}

.tool-btn.active {
  background: #007AFF;
}

/* 主编辑区 */
.main-canvas {
  background: #1A1A1A;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 画布容器 */
.canvas-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(45deg, #1A1A1A 25%, transparent 25%),
              linear-gradient(-45deg, #1A1A1A 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #1A1A1A 75%),
              linear-gradient(-45deg, transparent 75%, #1A1A1A 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  position: relative;
}

.canvas-content {
  max-width: 1440px;
  width: 100%;
  aspect-ratio: 16/9;
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

/* 模板预览 */
.template-preview {
  width: 100%;
  height: 100%;
  background: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.template-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

/* 右侧属性面板 */
.properties-panel {
  background: #2A2A2A;
  border-left: 1px solid #404040;
  display: flex;
  flex-direction: column;
}

.panel-tabs {
  display: flex;
  border-bottom: 1px solid #404040;
}

.panel-tab {
  flex: 1;
  padding: 12px;
  text-align: center;
  background: transparent;
  border: none;
  color: #CCCCCC;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.panel-tab:hover {
  color: #FFFFFF;
}

.panel-tab.active {
  background: #007AFF;
  color: #FFFFFF;
}

.panel-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.property-group {
  margin-bottom: 24px;
  background: rgba(255, 255, 255, 0.05);
  padding: 16px;
  border-radius: 8px;
}

.property-group h3 {
  font-size: 14px;
  color: #FFFFFF;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 8px;
}

/* 模板选择器 */
.template-selector {
  display: grid;
  grid-template-columns: 1fr; /* 单列布局 */
  gap: 12px;
}

.template-card {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.template-card:hover {
  background: rgba(0, 122, 255, 0.2);
  border-color: #007AFF;
}

.template-card.selected {
  background: #007AFF;
  border-color: #007AFF;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
}

.template-name {
  font-size: 14px;
  font-weight: 500;
  color: #FFFFFF;
  margin-bottom: 4px;
}

.template-desc {
  font-size: 11px;
  color: #CCCCCC;
}

/* 样式控制 */
.style-controls,
.animation-controls,
.ai-assistant {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.control-item label {
  font-size: 12px;
  color: #CCCCCC;
}

.control-item input[type="range"],
.control-item select {
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 6px 8px;
  color: #FFFFFF;
  font-size: 12px;
  -webkit-appearance: none; /* 移除默认样式 */
  appearance: none;
}

.control-item input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #007AFF;
  cursor: pointer;
  border: 2px solid #FFFFFF;
  margin-top: -6px; /* 居中滑块 */
}

.control-item input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #007AFF;
  cursor: pointer;
  border: 2px solid #FFFFFF;
}

.control-item select option {
  background: #2A2A2A;
  color: #FFFFFF;
}

.control-btn {
  padding: 8px 12px;
  background: rgba(0, 122, 255, 0.6);
  color: #FFFFFF;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s ease;
}

.control-btn:hover {
  background: #007AFF;
}

/* AI助手 */
.ai-suggestions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.suggestion-item {
  background: rgba(52, 199, 89, 0.1);
  border: 1px solid rgba(52, 199, 89, 0.3);
  border-radius: 6px;
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #34C759;
}

.suggestion-icon {
  font-size: 16px;
}

/* 时间线 */
.timeline {
  height: 120px;
  background: #2A2A2A;
  border-top: 1px solid #404040;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 20px;
}

.timeline-track {
  width: 100%;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  position: relative;
  margin-bottom: 12px;
  cursor: pointer;
}

.timeline-progress {
  height: 100%;
  background: #007AFF;
  border-radius: 10px;
  width: 0%;
  transition: width 0.1s linear;
}

.timeline-marker {
  position: absolute;
  top: -5px;
  width: 4px;
  height: 30px;
  background: #FF3B30;
  border-radius: 2px;
  cursor: pointer;
  border: 1px solid #FFFFFF;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.timeline-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.timeline-btn {
  padding: 8px 12px;
  background: #007AFF;
  color: #FFFFFF;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
}

.timeline-btn:hover {
  background: #0056CC;
}

.timeline-controls span {
  font-size: 12px;
  color: #CCCCCC;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .workspace {
    grid-template-columns: 64px 1fr; /* 隐藏右侧面板 */
  }

  .properties-panel {
    display: none; /* 默认隐藏 */
  }

  .main-canvas {
    grid-column: 2 / 3;
  }
}

@media (max-width: 768px) {
  .workspace {
    grid-template-columns: 1fr; /* 单列布局 */
    grid-template-rows: auto 1fr auto; /* 工具栏、主编辑区、时间线 */
  }

  .toolbar {
    flex-direction: row;
    flex-wrap: wrap;
    height: auto;
    border-right: none;
    border-bottom: 1px solid #404040;
    padding: 10px;
    justify-content: center;
  }

  .tool-group {
    flex-direction: row;
    padding: 4px;
    gap: 4px;
  }

  .tool-btn {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }

  .main-canvas {
    grid-row: 2 / 3;
  }

  .timeline {
    grid-row: 3 / 4;
    padding: 10px;
    height: 100px;
  }

  .timeline-track {
    height: 15px;
  }

  .timeline-marker {
    height: 25px;
    top: -5px;
  }

  .timeline-controls {
    justify-content: center;
  }

  .title-bar {
    padding: 0 10px;
  }

  .title-bar h1 {
    font-size: 12px;
  }
}
</style>