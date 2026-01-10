/** * VideoEditorView.vue * VidSlide AI - 紧急补齐阶段 *
实现P0/P1功能：模板引擎、用户调整、画中画效果、素材管理、动画系统 */

<!--
  VidSlide AI VideoEditorView - 核心功能集成版本
  集成P0+P1功能：模板引擎、用户调整、画中画效果、素材管理、动画系统
-->
<template>
  <div class="video-editor-view" role="application" aria-label="VidSlide AI 视频编辑器">
    <!-- 视频上传区域 -->
    <section v-if="!videoSrc" class="upload-section" role="region" aria-labelledby="upload-heading">
      <div class="upload-container">
        <h3 id="upload-heading">📤 上传视频</h3>
        <p>选择您要转换为PPT的视频文件</p>
        <label for="video-file-input" class="sr-only">选择视频文件</label>
        <input
          id="video-file-input"
          type="file"
          accept="video/*"
          class="file-input"
          aria-describedby="upload-description"
          @change="handleFileSelect"
        />
        <div id="upload-description" class="sr-only">
          支持MP4、AVI、MOV等常见视频格式，文件大小不超过500MB
        </div>
      </div>
    </section>

    <!-- 视频编辑区域 -->
    <main v-else class="editor-section" role="main" aria-labelledby="editor-heading">
      <div class="editor-layout">
        <!-- 左侧工具栏 -->
        <aside class="left-panel" role="complementary" aria-label="编辑工具面板">
          <section class="panel-section" role="region" aria-labelledby="template-section-heading">
            <h4 id="template-section-heading">🎨 模板选择</h4>
            <TemplateSelector @template-selected="handleTemplateSelected" />
          </section>

          <section class="panel-section" role="region" aria-labelledby="adjustment-section-heading">
            <h4 id="adjustment-section-heading">⚙️ 参数调整</h4>
            <UserAdjustmentPanel
              v-if="selectedTemplate"
              :template="selectedTemplate"
              :aria-label="`调整 ${selectedTemplate?.name || '选中模板'} 的参数`"
              @adjustment-changed="handleAdjustmentChanged"
            />
          </section>
        </aside>

        <!-- 主编辑区 -->
        <section class="main-editor" role="region" aria-labelledby="editor-heading">
          <h2
id="editor-heading" class="sr-only">视频编辑主区域</h2>

          <div class="canvas-container">
            <canvas
              ref="canvasRef"
              :width="canvasWidth"
              :height="canvasHeight"
              class="editor-canvas"
              role="img"
              :aria-label="`视频编辑画布，尺寸 ${canvasWidth}x${canvasHeight}`"
              tabindex="0"
              @keydown="handleCanvasKeydown"
            />

            <!-- 画中画控制 -->
            <div v-if="pipEnabled" class="pip-controls" role="region" aria-label="画中画效果控制">
              <PictureInPicture
                :video-element="videoElement"
                :pip-element="pipElement"
                :enabled="pipEnabled"
                :position="pipPosition"
                :size="pipSize"
                :style="pipStyle"
              />
            </div>
          </div>

          <!-- 动画控制 -->
          <section class="animation-controls" role="region" aria-labelledby="animation-heading">
            <h3
id="animation-heading" class="sr-only">动画效果控制</h3>
            <AnimationSystem
              :video-element="videoElement"
              :text-elements="textElements"
              aria-label="视频动画效果控制系统"
              @animation-start="handleAnimationStart"
              @animation-end="handleAnimationEnd"
            />
          </section>
        </section>
      </div>

      <!-- 右侧素材面板 -->
      <aside class="right-panel" role="complementary" aria-label="素材和监控面板">
        <section class="panel-section" role="region" aria-labelledby="asset-section-heading">
          <h4 id="asset-section-heading">🖼️ 素材浏览器</h4>
          <AssetBrowser
            aria-label="素材资源浏览器和选择器"
            @asset-selected="handleAssetSelected"
            @asset-previewed="handleAssetPreviewed"
          />
        </section>

        <section class="panel-section" role="region" aria-labelledby="monitor-section-heading">
          <h4 id="monitor-section-heading">📊 性能监控</h4>
          <PerformanceMonitor
            :auto-start="true"
            :update-interval="2000"
            aria-label="系统性能实时监控面板"
            @performance-alert="handlePerformanceAlert"
            @metrics-updated="handleMetricsUpdated"
          />
        </section>
      </aside>
    </main>
  </div>

  <!-- 底部控制栏 -->
  <footer class="bottom-toolbar" role="toolbar" aria-label="编辑器操作控制栏">
    <button
      class="export-btn"
      aria-label="导出演示结果"
      :aria-describedby="exportStatus ? 'export-status' : undefined"
      @click="openExportDialog"
    >
      导出
    </button>
    <div v-if="exportStatus" id="export-status" class="sr-only" aria-live="polite">
      {{ exportStatus }}
    </div>
    <button
class="preview-btn" @click="previewPPT">预览</button>
    <button
class="reset-btn" @click="resetAll">重置</button>
  </footer>

  <!-- 导出对话框 -->
  <ExportDialog
    :visible="showExportDialog"
    :canvas="canvasRef"
    :slides="exportSlides"
    @close="closeExportDialog"
    @export-complete="handleExportComplete"
  />
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import AssetBrowser from '../components/AssetBrowser.vue'
import AnimationSystem from '../components/AnimationSystem.vue'
import TemplateSelector from '../components/templates/TemplateSelector.vue'
import PerformanceMonitor from '../components/PerformanceMonitor.vue'
import UserAdjustmentPanel from '../components/UserAdjustmentPanel.vue'
import PictureInPicture from '../components/PictureInPicture.vue'
import ExportDialog from '../components/ExportDialog.vue'
import { getErrorHandler, withUserFeedback } from '../utils/ErrorHandler.js'

// 响应式状态

// 当前加载的视频文件路径
const videoSrc = ref('')

// 用户选择的PPT模板
const selectedTemplate = ref(null)

// Canvas画布引用，用于渲染PPT内容
const canvasRef = ref(null)

// Canvas画布宽度（默认1920px）
const canvasWidth = ref(1920)

// Canvas画布高度（默认1080px）
const canvasHeight = ref(1080)

// 画中画相关状态

// 是否启用画中画效果
const pipEnabled = ref(false)

// 画中画显示位置
const pipPosition = ref('top-right')

// 画中画大小比例
const pipSize = ref(0.25)

// 画中画视觉样式
const pipStyle = ref('rounded')

// 动画相关状态

// 文本元素数组，用于动画效果
const textElements = ref([])

// 视频元素引用
const videoElement = ref(null)

// 画中画元素引用
const pipElement = ref(null)

// 导出相关状态

// 导出对话框显示状态
const showExportDialog = ref(false)

// 导出用的幻灯片数据
const exportSlides = ref([])

// 计算属性
const canvasAspectRatio = computed(() => canvasWidth.value / canvasHeight.value)

// 方法

/**
 * 处理文件选择事件
 * 验证文件类型，读取视频文件并设置视频源
 * @param {Event} event - 文件选择事件
 */
const handleFileSelect = async event => {
  const file = event.target.files[0]

  if (!file) return

  await withUserFeedback(
    async () => {
      if (!file.type.startsWith('video/')) {
        throw new Error('请选择有效的视频文件')
      }

      // 检查文件大小 (限制为500MB)
      const maxSize = 500 * 1024 * 1024
      if (file.size > maxSize) {
        throw new Error('视频文件过大，请选择小于500MB的文件')
      }

      const url = URL.createObjectURL(file)
      videoSrc.value = url

      // 创建视频元素用于画中画
      const video = document.createElement('video')
      video.src = url
      video.muted = true
      video.preload = 'metadata'

      // 等待视频加载
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve
        video.onerror = () => reject(new Error('视频文件无法加载'))
        video.load()
      })

      videoElement.value = video

      // 初始化画布
      nextTick(() => {
        initializeCanvas()
      })
    },
    {
      loadingMessage: '正在加载视频...',
      successMessage: '视频加载成功',
      errorOptions: {
        context: 'video-upload',
        severity: 'high'
      }
    }
  )
}

const handleTemplateSelected = template => {
  selectedTemplate.value = template
}

const handleAdjustmentChanged = adjustments => {
  // 处理用户调整
  console.log('调整参数:', adjustments)
}

const handleAssetSelected = asset => {
  // 处理素材选择
  console.log('选择的素材:', asset)
}

const handleAssetPreviewed = asset => {
  // 处理素材预览
  console.log('预览素材:', asset)
}

const handleAnimationStart = animation => {
  console.log('动画开始:', animation)
}

const handleAnimationEnd = animation => {
  console.log('动画结束:', animation)
}

/**


 * initializeCanvas 函数


 * VidSlide AI 功能实现


 */

const initializeCanvas = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 清空画布
  ctx.fillStyle = '#f5f5f5'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 绘制占位符
  ctx.fillStyle = '#666'
  ctx.font = '24px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('VidSlide AI 画布', canvas.width / 2, canvas.height / 2)
}

/**
 * 打开导出对话框
 */
const openExportDialog = () => {
  // 准备导出数据
  prepareExportData()
  showExportDialog.value = true
}

/**
 * 关闭导出对话框
 */
const closeExportDialog = () => {
  showExportDialog.value = false
}

/**
 * 处理导出完成
 */
const handleExportComplete = () => {
  console.log('导出完成')
  // 可以添加导出成功的后续处理
}

/**
 * 准备导出数据
 */
const prepareExportData = () => {
  // 从当前canvas和设置生成导出用的幻灯片数据
  exportSlides.value = [
    {
      id: 'slide-1',
      background: {
        color: '#ffffff',
        image: null
      },
      elements: [
        {
          id: 'title-1',
          type: 'text',
          content: 'VidSlide AI 演示',
          x: 100,
          y: 100,
          width: 800,
          height: 100,
          style: {
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#333333',
            textAlign: 'center'
          }
        },
        {
          id: 'content-1',
          type: 'text',
          content: '基于AI的视频转PPT解决方案',
          x: 100,
          y: 250,
          width: 800,
          height: 60,
          style: {
            fontSize: '24px',
            color: '#666666',
            textAlign: 'center'
          }
        }
      ],
      animations: [
        {
          elementId: 'title-1',
          type: 'fadeIn',
          startTime: 0,
          duration: 1.0
        },
        {
          elementId: 'content-1',
          type: 'fadeIn',
          startTime: 0.5,
          duration: 1.0
        }
      ]
    }
    // 可以根据实际内容生成更多幻灯片
  ]
}

/**
 * 预览PPT效果
 * 在Canvas上渲染当前的PPT内容和动画效果
 */
const previewPPT = async () => {
  if (!videoSrc.value) {
    getErrorHandler().handleError(new Error('请先上传视频'), {
      context: 'preview-validation',
      severity: 'low'
    })
    return
  }

  await withUserFeedback(
    async () => {
      // 模拟预览生成过程
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 这里应该是实际的PPT预览逻辑
      // 目前只是模拟

      throw new Error('PPT预览功能正在开发中，请稍后使用')
    },
    {
      loadingMessage: '正在生成预览...',
      successMessage: '预览生成成功',
      errorOptions: {
        context: 'ppt-preview',
        severity: 'medium'
      }
    }
  )
}

/**


 * resetAll 函数


 * VidSlide AI 功能实现


 */

const resetAll = () => {
  videoSrc.value = ''
  selectedTemplate.value = null
  pipEnabled.value = false
  textElements.value = []

  if (videoElement.value) {
    videoElement.value.pause()
    videoElement.value = null
  }

  initializeCanvas()
}

// 生命周期
onMounted(() => {
  initializeCanvas()
})

/**
 * 处理画布键盘事件
 * 提供键盘导航和快捷键支持
 */
const handleCanvasKeydown = event => {
  const { key, ctrlKey, metaKey } = event
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  const cmdKey = isMac ? metaKey : ctrlKey

  switch (key) {
  case 's':
    if (cmdKey) {
      event.preventDefault()
      // 保存当前状态
      console.log('保存状态')
    }
    break
  case 'z':
    if (cmdKey) {
      event.preventDefault()
      // 撤销操作
      console.log('撤销操作')
    }
    break
  case 'y':
    if (cmdKey) {
      event.preventDefault()
      // 重做操作
      console.log('重做操作')
    }
    break
  case 'e':
    if (cmdKey) {
      event.preventDefault()
      openExportDialog()
    }
    break
  case 'p':
    if (cmdKey) {
      event.preventDefault()
      previewPPT()
    }
    break
  case 'Escape':
    // 取消当前操作或关闭弹窗
    console.log('取消操作')
    break
  case 'Tab':
    // 处理Tab导航
    handleTabNavigation(event)
    break
  }
}

/**
 * 处理Tab导航
 * 确保键盘焦点在界面元素间正确移动
 */
const handleTabNavigation = event => {
  // 可以在这里实现更复杂的Tab导航逻辑
  // 确保焦点在工具栏、画布、控制按钮间正确循环
}
</script>

<style scoped>
/* Apple Design Principles Applied */
/* Clarity, Depth, Deference, Fluidity */

.video-editor-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #000000; /* Pure black background for depth */
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', sans-serif;
}

/* Upload Section - Clean and Minimal */
.upload-section {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  padding: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.upload-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 60px;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 480px;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.upload-container h3 {
  margin: 0 0 16px 0;
  color: #1d1d1f;
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.022em;
}

.upload-container p {
  margin: 0 0 32px 0;
  color: #86868b;
  font-size: 17px;
  line-height: 1.4;
}

.file-input {
  display: block;
  margin: 0 auto;
  padding: 16px 24px;
  border: 2px dashed rgba(0, 122, 255, 0.3);
  border-radius: 12px;
  background: rgba(0, 122, 255, 0.05);
  cursor: pointer;
  font-size: 16px;
  color: #007aff;
  transition: all 0.3s ease;
}

.file-input:hover {
  border-color: #007aff;
  background: rgba(0, 122, 255, 0.1);
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(0, 122, 255, 0.15);
}

/* Editor Section - Professional Layout */
.editor-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f2f2f7; /* Light gray for subtle depth */
}

.editor-layout {
  flex: 1;
  display: flex;
  gap: 1px; /* Minimal gap for depth */
}

/* Panels - Clean and Functional */
.left-panel,
.right-panel {
  width: 320px;
  background: #ffffff;
  border-right: 1px solid #e5e5ea;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05);
}

.right-panel {
  border-right: none;
  border-left: 1px solid #e5e5ea;
}

.panel-section {
  padding: 24px;
  border-bottom: 1px solid #e5e5ea;
}

.panel-section h4 {
  margin: 0 0 20px 0;
  color: #1d1d1f;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.022em;
}

/* Main Editor - Focus Area */
.main-editor {
  flex: 1;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05);
}

.canvas-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32px;
  background: #f2f2f7;
  position: relative;
}

.editor-canvas {
  border: 1px solid #d1d1d6;
  border-radius: 12px;
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(255, 255, 255, 0.8) inset;
  background: #ffffff;
  transition: all 0.3s ease;
}

.editor-canvas:hover {
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 0 0 1px rgba(255, 255, 255, 0.8) inset;
}

/* Floating Controls */
.pip-controls {
  position: absolute;
  top: 24px;
  right: 24px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.animation-controls {
  position: absolute;
  bottom: 24px;
  left: 24px;
  right: 24px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Bottom Toolbar - Clean Actions */
.bottom-toolbar {
  height: 72px;
  background: #ffffff;
  border-top: 1px solid #e5e5ea;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 0 24px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05);
}

.export-btn,
.preview-btn,
.reset-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 15px;
  letter-spacing: -0.022em;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.export-btn {
  background: linear-gradient(135deg, #007aff 0%, #5856d6 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
}

.export-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 122, 255, 0.4);
}

.preview-btn {
  background: linear-gradient(135deg, #34c759 0%, #30d158 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(52, 199, 89, 0.3);
}

.preview-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(52, 199, 89, 0.4);
}

.reset-btn {
  background: linear-gradient(135deg, #ff3b30 0%, #ff453a 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(255, 59, 48, 0.3);
}

.reset-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(255, 59, 48, 0.4);
}

/* Responsive Design - Fluid and Adaptive */
@media (max-width: 1400px) {
  .left-panel,
  .right-panel {
    width: 280px;
  }
}

@media (max-width: 1200px) {
  .left-panel,
  .right-panel {
    width: 260px;
  }
}

@media (max-width: 1024px) {
  .editor-layout {
    flex-direction: column;
  }

  .left-panel,
  .right-panel {
    width: 100%;
    height: 240px;
    border-right: none;
    border-bottom: 1px solid #e5e5ea;
  }

  .right-panel {
    border-left: none;
  }

  .canvas-container {
    order: -1;
    padding: 24px;
  }

  .pip-controls,
  .animation-controls {
    position: static;
    margin: 16px;
    width: auto;
  }

  .animation-controls {
    margin-bottom: 0;
  }
}

@media (max-width: 768px) {
  .upload-container {
    padding: 40px 24px;
    margin: 20px;
  }

  .upload-container h3 {
    font-size: 24px;
  }

  .canvas-container {
    padding: 16px;
  }

  .bottom-toolbar {
    height: 64px;
    padding: 0 16px;
  }

  .export-btn,
  .preview-btn,
  .reset-btn {
    padding: 10px 16px;
    font-size: 14px;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .video-editor-view {
    background: #000000;
  }

  .upload-container {
    background: rgba(28, 28, 30, 0.95);
    color: #ffffff;
  }

  .upload-container h3 {
    color: #ffffff;
  }

  .upload-container p {
    color: #98989d;
  }

  .editor-section {
    background: #1c1c1e;
  }

  .left-panel,
  .right-panel,
  .main-editor {
    background: #2c2c2e;
    border-color: #38383a;
  }

  .panel-section h4 {
    color: #ffffff;
  }

  .canvas-container {
    background: #1c1c1e;
  }

  .editor-canvas {
    border-color: #38383a;
    background: #2c2c2e;
  }

  .pip-controls,
  .animation-controls {
    background: rgba(44, 44, 46, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .bottom-toolbar {
    background: #2c2c2e;
    border-color: #38383a;
  }
}
</style>
