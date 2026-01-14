<script setup>
import { ref, computed, onMounted } from 'vue'

// 导入核心服务
import TemplateRenderer from '../utils/TemplateRenderer.js'
import MaterialService from '../services/MaterialService.js'
import BackgroundRemovalService from '../services/BackgroundRemovalService.js'
// import AIService from '../services/AIService.js' // TODO: 需要创建AIService
// import AnimationSystem from '../utils/AnimationSystem.js' // TODO: 需要创建AnimationSystem

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

// 核心服务实例
const templateRenderer = ref(null)
const materialService = ref(null)
const backgroundRemovalService = ref(null)
// const aiService = ref(null) // TODO: 需要创建AIService
// const animationSystem = ref(null) // TODO: 需要创建AnimationSystem

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
    if (templateRenderer.value) {
      templateRenderer.value.renderTemplate(template)
      console.log('✅ 模板渲染完成')
    } else {
      console.warn('⚠️ TemplateRenderer 服务未初始化')
    }
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
    if (backgroundRemovalService.value) {
      // 调用背景移除服务处理视频
      backgroundRemovalService.value.processVideo(file)
      console.log('✅ 视频处理完成')
    } else {
      console.warn('⚠️ BackgroundRemovalService 服务未初始化')
    }
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

  // 初始化核心服务
  console.log('🔧 初始化核心服务...')

  try {
    // 初始化核心服务实例
    templateRenderer.value = new TemplateRenderer()
    materialService.value = new MaterialService()
    backgroundRemovalService.value = new BackgroundRemovalService()
    // aiService.value = new AIService() // TODO: 需要创建AIService
    // animationSystem.value = new AnimationSystem() // TODO: 需要创建AnimationSystem

    console.log('✅ 核心服务初始化完成')

    // 加载初始模板
    loadInitialTemplate()

  } catch (error) {
    console.error('❌ 核心服务初始化失败:', error)
  }
})

// 加载初始模板
const loadInitialTemplate = () => {
  try {
    const initialTemplate = templates.value.find(t => t.id === selectedTemplateId.value)
    if (initialTemplate && templateRenderer.value) {
      templateRenderer.value.renderTemplate(initialTemplate)
      console.log('✅ 初始模板加载完成')
    }
  } catch (error) {
    console.error('❌ 初始模板加载失败:', error)
  }
}
</script>
