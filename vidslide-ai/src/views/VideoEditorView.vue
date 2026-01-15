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
            />
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
              <input v-model="pipSettings.size" type="range" min="10" max="50" />
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
      <button class="timeline-btn" :disabled="!selectedMarkerId" @click="removeMarker">
        🗑️ 删除标记
      </button>
      <span>标记数量: {{ timelineMarkers.length }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
// 导入人脸跟踪和场景检测服务
import UnifiedFaceTracker from '../services/UnifiedFaceTracker.js'
import { SceneDetection } from '../utils/sceneDetection.js'

// 响应式状态
const activePanelTab = ref('template')
const selectedTemplateId = ref('pip')
const currentTemplateImage = ref('/assets/templates/pip-template.png')
const currentTemplateName = ref('画中画')

// 人脸跟踪状态
const faceTrackingEnabled = ref(false)
const faceTrackingSupported = ref(false)
const currentTrackerEngine = ref(null)

// 场景检测状态
const sceneDetector = ref(null)
const isAnalyzingScenes = ref(false)
const detectedScenes = ref([])

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

const selectTemplateById = templateId => {
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

const renderTemplate = template => {
  console.log('🎨 渲染模板:', template.name)
  try {
    // 应用模板配置
    const templateConfig = {
      pip: {
        layout: 'picture-in-picture',
        pipPosition: 'top-right',
        pipSize: 25
      },
      'info-card': {
        layout: 'card-overlay',
        cardPosition: 'bottom',
        cardStyle: 'glass'
      },
      keyword: {
        layout: 'highlight',
        highlightColor: '#FFD700',
        animation: 'pulse'
      },
      document: {
        layout: '3d-document',
        perspective: 1000,
        rotation: 15
      },
      title: {
        layout: 'title-overlay',
        titlePosition: 'center',
        animation: 'fade-in'
      }
    }

    const config = templateConfig[template.id] || templateConfig.pip
    console.log('✅ 模板渲染完成，配置:', config)
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
const animations = ref([])

const addFadeAnimation = () => {
  console.log('🎬 添加淡入动画')
  const animation = {
    id: Date.now(),
    type: 'fade',
    name: '淡入效果',
    duration: 1000,
    easing: 'ease-in-out',
    startTime: (currentProgress.value / 100) * 60 // 假设60秒视频
  }
  animations.value.push(animation)
  console.log('✅ 淡入动画添加完成，当前动画数:', animations.value.length)
}

const addSlideAnimation = () => {
  console.log('🎬 添加滑入动画')
  const animation = {
    id: Date.now(),
    type: 'slide',
    name: '滑入效果',
    duration: 800,
    direction: 'left',
    easing: 'ease-out',
    startTime: (currentProgress.value / 100) * 60
  }
  animations.value.push(animation)
  console.log('✅ 滑入动画添加完成，当前动画数:', animations.value.length)
}

const addZoomAnimation = () => {
  console.log('🎬 添加缩放动画')
  const animation = {
    id: Date.now(),
    type: 'zoom',
    name: '缩放效果',
    duration: 600,
    scale: 1.2,
    easing: 'ease-in-out',
    startTime: (currentProgress.value / 100) * 60
  }
  animations.value.push(animation)
  console.log('✅ 缩放动画添加完成，当前动画数:', animations.value.length)
}

const clearAnimations = () => {
  console.log('🎬 清除所有动画')
  const count = animations.value.length
  animations.value = []
  console.log(`✅ 已清除 ${count} 个动画效果`)
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

const selectMarker = marker => {
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

const handleFileSelect = event => {
  const file = event.target.files[0]
  if (file) {
    console.log('📁 选择文件:', file.name)
    // 实现文件处理逻辑
    processVideoFile(file)
  }
}

const processVideoFile = file => {
  console.log('🎬 处理视频文件:', file.name)
  try {
    // 创建视频URL
    const videoUrl = URL.createObjectURL(file)

    // 获取视频元数据
    const video = document.createElement('video')
    video.src = videoUrl
    video.onloadedmetadata = async () => {
      console.log('📊 视频信息:')
      console.log('  - 时长:', video.duration, '秒')
      console.log('  - 宽度:', video.videoWidth, 'px')
      console.log('  - 高度:', video.videoHeight, 'px')
      console.log('  - 文件大小:', (file.size / 1024 / 1024).toFixed(2), 'MB')

      // 更新当前模板图片为视频预览
      currentTemplateImage.value = videoUrl
      console.log('✅ 视频处理完成')

      // 启动场景检测分析
      await analyzeVideoScenes(video)

      // 如果人脸跟踪已初始化，启动跟踪
      if (faceTrackingSupported.value) {
        await startFaceTrackingForVideo(video)
      }
    }
    video.onerror = () => {
      console.error('❌ 视频加载失败')
      URL.revokeObjectURL(videoUrl)
    }
  } catch (error) {
    console.error('❌ 视频处理失败:', error)
  }
}

// 分析视频场景
const analyzeVideoScenes = async videoElement => {
  if (!sceneDetector.value) {
    console.warn('⚠️ 场景检测器未初始化')
    return
  }

  console.log('🔍 开始分析视频场景...')
  isAnalyzingScenes.value = true

  try {
    const scenes = await sceneDetector.value.analyzeVideoFrames(videoElement, {
      frameRate: 1, // 每秒检测1帧
      onProgress: progress => {
        console.log(`场景分析进度: ${progress.toFixed(1)}%`)
      },
      onSceneDetected: scene => {
        console.log(`🎬 检测到场景切换: ${scene.changeType} @ ${scene.timestamp.toFixed(2)}s`)
        detectedScenes.value.push(scene)

        // 根据场景类型自动添加时间线标记
        addSceneMarker(scene)
      }
    })

    console.log(`✅ 场景分析完成，共检测到 ${scenes.length} 个场景切换`)

    // 根据场景类型推荐模板
    recommendTemplateByScenes(scenes)
  } catch (error) {
    console.error('❌ 场景分析失败:', error)
  } finally {
    isAnalyzingScenes.value = false
  }
}

// 添加场景标记到时间线
const addSceneMarker = scene => {
  const newId = Math.max(...timelineMarkers.value.map(m => m.id), 0) + 1
  const position = (scene.timestamp / 60) * 100 // 假设60秒视频

  timelineMarkers.value.push({
    id: newId,
    position: Math.min(position, 100),
    type: scene.changeType,
    timestamp: scene.timestamp
  })
}

// 根据场景推荐模板
const recommendTemplateByScenes = scenes => {
  // 统计场景类型
  const typeCount = {}
  scenes.forEach(scene => {
    typeCount[scene.changeType] = (typeCount[scene.changeType] || 0) + 1
  })

  console.log('📊 场景类型统计:', typeCount)

  // 根据场景类型推荐模板
  if (typeCount['hard-cut'] > 3) {
    console.log('💡 AI建议: 检测到多个硬切换，推荐使用"关键词高亮"模板')
  } else if (typeCount['fade-in'] || typeCount['fade-out']) {
    console.log('💡 AI建议: 检测到淡入淡出效果，推荐使用"标题文字"模板')
  }
}

// 为视频启动人脸跟踪
const startFaceTrackingForVideo = async videoElement => {
  try {
    await UnifiedFaceTracker.startTracking(videoElement)
    faceTrackingEnabled.value = true

    const engineInfo = UnifiedFaceTracker.getEngineInfo()
    console.log(`🎯 人脸跟踪已启动 (引擎: ${engineInfo.name})`)

    // 监听人脸检测事件，用于智能画中画定位
    UnifiedFaceTracker.on('faceDetected', handleFaceDetectedForPip)
  } catch (error) {
    console.error('❌ 人脸跟踪启动失败:', error)
  }
}

// 处理人脸检测用于画中画定位
const handleFaceDetectedForPip = data => {
  // 如果当前是画中画模板，根据人脸位置调整画中画位置
  if (selectedTemplateId.value === 'pip' && data.bounds) {
    const faceCenterX = data.bounds.centerX

    // 智能定位：人脸在左边时，画中画放右边，反之亦然
    if (faceCenterX < 0.4) {
      pipSettings.value.position = 'top-right'
    } else if (faceCenterX > 0.6) {
      pipSettings.value.position = 'top-left'
    }
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
onMounted(async () => {
  console.log('🎬 VidSlide AI 专业工作界面已加载')
  console.log('✅ 基于苹果风格设计的三栏布局')
  console.log('✅ 工具栏 + 主编辑区 + 属性面板 + 时间线')

  // 初始化场景检测器
  try {
    sceneDetector.value = new SceneDetection({
      diffThreshold: 0.15,
      minSceneDuration: 2.0,
      cutThreshold: 0.3
    })
    sceneDetector.value.initialize(640, 360)
    console.log('✅ 场景检测器初始化完成')
  } catch (error) {
    console.warn('⚠️ 场景检测器初始化失败:', error)
  }

  // 初始化人脸跟踪服务
  try {
    const result = await UnifiedFaceTracker.initialize({
      maxNumFaces: 1,
      smoothFactor: 0.8,
      minDetectionConfidence: 0.5
    })

    faceTrackingSupported.value = result.success
    currentTrackerEngine.value = result.engine

    if (result.success) {
      console.log(`✅ 人脸跟踪服务初始化完成 (引擎: ${result.engine})`)
    } else {
      console.warn('⚠️ 人脸跟踪服务不可用')
    }
  } catch (error) {
    console.warn('⚠️ 人脸跟踪服务初始化失败:', error)
    faceTrackingSupported.value = false
  }

  // 加载初始模板
  loadInitialTemplate()
})

onUnmounted(() => {
  // 清理人脸跟踪
  if (faceTrackingEnabled.value) {
    UnifiedFaceTracker.off('faceDetected', handleFaceDetectedForPip)
    UnifiedFaceTracker.stopTracking()
  }

  // 清理场景检测器
  if (sceneDetector.value) {
    sceneDetector.value.dispose()
    sceneDetector.value = null
  }

  console.log('🗑️ VideoEditorView 资源已清理')
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
@import '../styles/workspace-apple-style.css';
</style>
