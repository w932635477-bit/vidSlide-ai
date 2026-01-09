/** * WorkspaceView.vue - VidSlide AI 工作页面 * 完全复刻桌面UI设计图 */

<!-- eslint-disable-next-line max-len -->
<template>
  <div class="workspace-view">
    <!-- 顶部导航栏 -->
    <nav class="workspace-navbar">
      <div class="navbar-container">
        <!-- 左侧返回按钮 -->
        <button
class="back-button" @click="goHome"
>
          <svg
viewBox="0 0 24 24" fill="currentColor"
width="20" height="20"
>
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
          Back to Home
        </button>

        <!-- 中间标题 -->
        <h1 class="workspace-title">VidSlide AI Workspace</h1>

        <!-- 右侧操作按钮 -->
        <div class="navbar-actions">
          <button class="settings-button">
            <svg
viewBox="0 0 24 24" fill="currentColor"
width="20" height="20"
>
              <path
                d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"
              />
            </svg>
            Settings
          </button>
          <button class="export-button">
            <svg
viewBox="0 0 24 24" fill="currentColor"
width="20" height="20"
>
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
            </svg>
            Export
          </button>
        </div>
      </div>
    </nav>

    <!-- 工作流进度指示器 -->
    <div class="workflow-progress">
      <div class="progress-container">
        <!-- Upload Video - 当前激活 -->
        <div class="progress-step active">
          <div class="step-icon">
            <svg
viewBox="0 0 24 24" fill="currentColor"
width="24" height="24"
>
              <path
                d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z M14 13v4h-4v-4H7l5-5 5 5h-3z"
              />
            </svg>
          </div>
          <span class="step-label">Upload Video</span>
          <div class="step-connector" />
        </div>

        <!-- AI Processing -->
        <div class="progress-step">
          <div class="step-icon">
            <svg
viewBox="0 0 24 24" fill="currentColor"
width="24" height="24"
>
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              />
            </svg>
          </div>
          <span class="step-label">AI Processing</span>
          <div class="step-connector" />
        </div>

        <!-- Edit & Refine -->
        <div class="progress-step">
          <div class="step-icon">
            <svg
viewBox="0 0 24 24" fill="currentColor"
width="24" height="24"
>
              <path
                d="M21 3H3c-1.11 0-2 .89-2 2v12c0 1.1.89 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.11-.9-2-2-2zm0 14H3V5h18v12zm-5.01-4.13l-.89.89-2.5-2.5-.89.89 2.5 2.5 3.39-3.39-.89-.89z"
              />
            </svg>
          </div>
          <span class="step-label">Edit & Refine</span>
          <div class="step-connector" />
        </div>

        <!-- Export -->
        <div class="progress-step">
          <div class="step-icon">
            <svg
viewBox="0 0 24 24" fill="currentColor"
width="24" height="24"
>
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
            </svg>
          </div>
          <span class="step-label">Export</span>
        </div>
      </div>
    </div>

    <!-- 主内容区 - 动态切换内容 -->
    <main class="workspace-main">
      <!-- 步骤1: 文件上传 -->
      <div
        v-if="currentStep === 'upload'"
        class="upload-area"
        @drop="handleDrop"
        @dragover.prevent
        @dragenter.prevent
        @click="triggerFileInput"
      >
        <input
          ref="fileInput"
          type="file"
          accept="video/*"
          class="file-input-hidden"
          @change="handleFileSelect"
        />

        <div class="upload-content">
          <div class="upload-icon-large">
            <svg
viewBox="0 0 24 24" fill="currentColor"
width="64" height="64"
>
              <path
                d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z M14 13v4h-4v-4H7l5-5 5 5h-3z"
              />
            </svg>
          </div>

          <h2 class="upload-title">Upload Your Video</h2>

          <p class="upload-instruction">
Drag and drop your video file, or click to browse
</p>

          <!-- 支持的文件格式 -->
          <div class="file-formats">
            <span class="format-tag">MP4</span>
            <span class="format-tag">MOV</span>
            <span class="format-tag">AVI</span>
            <span class="format-tag">WEBM</span>
          </div>
        </div>
      </div>

      <!-- 步骤2: AI分析处理 -->
      <div
v-if="currentStep === 'processing'" class="processing-area"
>
        <div class="processing-content">
          <div class="processing-icon">
            <div class="ai-brain-icon">
              🧠
              <div class="processing-rings">
                <div class="ring ring-1" />
                <div class="ring ring-2" />
                <div class="ring ring-3" />
              </div>
            </div>
          </div>

          <h2 class="processing-title">AI is Analyzing Your Video</h2>

          <div class="processing-status">
            <div class="status-item">
              <span class="status-label">Speech Recognition:</span>
              <div class="status-progress">
                <div
class="progress-bar" :style="{ width: processingProgress.speech + '%' }" />
              </div>
              <span class="status-percent">{{ processingProgress.speech }}%</span>
            </div>

            <div class="status-item">
              <span class="status-label">Content Analysis:</span>
              <div class="status-progress">
                <div
class="progress-bar" :style="{ width: processingProgress.content + '%' }"
/>
              </div>
              <span class="status-percent">{{ processingProgress.content }}%</span>
            </div>

            <div class="status-item">
              <span class="status-label">Key Frame Detection:</span>
              <div class="status-progress">
                <div
class="progress-bar" :style="{ width: processingProgress.keyframes + '%' }"
/>
              </div>
              <span class="status-percent">{{ processingProgress.keyframes }}%</span>
            </div>

            <div class="status-item">
              <span class="status-label">Material Matching:</span>
              <div class="status-progress">
                <div
class="progress-bar" :style="{ width: processingProgress.materials + '%' }"
/>
              </div>
              <span class="status-percent">{{ processingProgress.materials }}%</span>
            </div>
          </div>

          <p class="processing-message">
            {{ currentProcessingMessage }}
          </p>
        </div>
      </div>

      <!-- 步骤3: 编辑工作区 -->
      <div
v-if="currentStep === 'editing'" class="editing-area"
>
        <div class="editor-layout">
          <!-- 左侧工具栏 -->
          <aside class="left-panel">
            <section class="panel-section">
              <h4>🎨 Template Selection</h4>
              <TemplateSelector @template-selected="handleTemplateSelected" />
            </section>

            <section class="panel-section">
              <h4>⚙️ Adjustments</h4>
              <UserAdjustmentPanel
                v-if="selectedTemplate"
                :template="selectedTemplate"
                :aria-label="`Adjust ${selectedTemplate?.name || 'selected template'} parameters`"
                @adjustment-change="handleAdjustmentChange"
              />
            </section>
          </aside>

          <!-- 主编辑区 -->
          <section class="main-editor">
            <div class="canvas-container">
              <canvas
                ref="canvasRef"
                :width="canvasWidth"
                :height="canvasHeight"
                class="editor-canvas"
                role="img"
                :aria-label="`Video editing canvas, size ${canvasWidth}x${canvasHeight}`"
                tabindex="0"
                @keydown="handleCanvasKeydown"
              />

              <!-- 画中画控制 -->
              <div
v-if="pipEnabled" class="pip-controls"
>
                <PictureInPicture
                  :video-element="videoElement"
                  :enabled="pipEnabled"
                  :position="pipPosition"
                  :size="pipSize"
                  :style="pipStyle"
                />
              </div>
            </div>

            <!-- 动画控制 -->
            <section class="animation-controls">
              <h3 class="sr-only">Animation Effects Control</h3>
              <AnimationSystem
                :video-element="videoElement"
                :text-elements="textElements"
                aria-label="Video animation effects control system"
                @animation-start="handleAnimationStart"
                @animation-end="handleAnimationEnd"
              />
            </section>
          </section>

          <!-- 右侧素材面板 -->
          <aside class="right-panel">
            <section class="panel-section">
              <h4>🖼️ Asset Browser</h4>
              <AssetBrowser
                aria-label="Asset resource browser and selector"
                @asset-selected="handleAssetSelected"
                @asset-previewed="handleAssetPreviewed"
              />
            </section>

            <section class="panel-section">
              <h4>📊 Performance Monitor</h4>
              <PerformanceMonitor
                :auto-start="true"
                :update-interval="2000"
                aria-label="System performance real-time monitoring panel"
                @performance-alert="handlePerformanceAlert"
                @metrics-updated="handleMetricsUpdated"
              />
            </section>
          </aside>
        </div>
      </div>
    </main>

    <!-- 底部功能栏 -->
    <footer class="workspace-footer">
      <div class="feature-box">
        <div class="feature-icon">📄</div>
        <span class="feature-text">Max 2GB file size</span>
      </div>

      <div class="feature-box">
        <div class="feature-icon">✨</div>
        <span class="feature-text">AI auto-generates PPT</span>
      </div>

      <div class="feature-box">
        <div class="feature-icon">✅</div>
        <span class="feature-text">Export in minutes</span>
      </div>
    </footer>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import { nextTick } from 'vue'
import AssetBrowser from '../components/AssetBrowser.vue'
import AnimationSystem from '../components/AnimationSystem.vue'
import TemplateSelector from '../components/templates/TemplateSelector.vue'
import PerformanceMonitor from '../components/PerformanceMonitor.vue'
import UserAdjustmentPanel from '../components/UserAdjustmentPanel.vue'
import PictureInPicture from '../components/PictureInPicture.vue'
import { getErrorHandler, withUserFeedback } from '../utils/ErrorHandler.js'
import { AssetManager } from '../utils/AssetManager.js'

export default {
  name: 'WorkspaceView',
  components: {
    AssetBrowser,
    AnimationSystem,
    TemplateSelector,
    PerformanceMonitor,
    UserAdjustmentPanel,
    PictureInPicture
  },
  setup() {
    const router = useRouter()

    return {
      goHome: () => router.push('/')
    }
  },
  data() {
    return {
      // 工作流状态
      currentStep: 'upload', // 'upload' | 'processing' | 'editing' | 'export'
      uploadedVideo: null,
      selectedTemplate: null,

      // AI处理状态
      processingProgress: {
        speech: 0,
        content: 0,
        keyframes: 0,
        materials: 0
      },
      currentProcessingMessage: 'Initializing AI analysis...',

      // 编辑器状态
      canvasRef: null,
      canvasWidth: 1920,
      canvasHeight: 1080,
      videoElement: null,
      textElements: [],

      // 画中画状态
      pipEnabled: false,
      pipPosition: 'top-right',
      pipSize: 0.25,
      pipStyle: 'rounded',

      // 素材管理
      assetManager: new AssetManager(),

      // 进度指示器状态
      workflowSteps: [
        { id: 'upload', label: 'Upload Video', active: true },
        { id: 'processing', label: 'AI Processing', active: false },
        { id: 'editing', label: 'Edit & Refine', active: false },
        { id: 'export', label: 'Export', active: false }
      ]
    }
  },
  computed: {
    canvasAspectRatio() {
      return this.canvasWidth / this.canvasHeight
    },

    activeStepIndex() {
      return this.workflowSteps.findIndex(step => step.id === this.currentStep)
    }
  },

  mounted() {
    this.initializeCanvas()
  },
  methods: {
    // 文件上传处理
    triggerFileInput() {
      this.$refs.fileInput?.click()
    },

    async handleFileSelect(event) {
      const file = event.target.files[0]
      if (!file) return

      await withUserFeedback(
        async () => {
          await this.processVideoUpload(file)
        },
        {
          loadingMessage: 'Uploading video...',
          successMessage: 'Video uploaded successfully',
          errorOptions: {
            context: 'video-upload',
            severity: 'high'
          }
        }
      )
    },

    async handleDrop(event) {
      try {
        event.preventDefault()
        const files = event.dataTransfer.files
        if (files.length > 0) {
          const file = files[0]
          if (file.type.startsWith('video/')) {
            await this.processVideoUpload(file)
          } else {
            getErrorHandler().handleError(new Error('请拖拽有效的视频文件'), {
              context: 'file-drop-validation',
              severity: 'low'
            })
          }
        }
      } catch (error) {
        console.error('File drop handling failed:', error)
        getErrorHandler().handleError(error, {
          context: 'file-drop',
          severity: 'medium'
        })
      }
    },

    async processVideoUpload(file) {
      // 验证文件
      if (!file.type.startsWith('video/')) {
        throw new Error('Please select a valid video file')
      }

      const maxSize = 2 * 1024 * 1024 * 1024 // 2GB
      if (file.size > maxSize) {
        throw new Error('Video file is too large (max 2GB)')
      }

      // 保存文件引用
      this.uploadedVideo = file

      // 切换到处理步骤
      this.currentStep = 'processing'

      // 更新工作流进度
      this.updateWorkflowProgress('processing')

      // 开始AI处理
      await this.startAIProcessing()
    },

    // AI内容分析处理
    async startAIProcessing() {
      try {
        // 步骤1: 语音识别
        this.currentProcessingMessage = 'Extracting speech from video...'
        await this.processSpeechRecognition()
        this.processingProgress.speech = 100

        // 步骤2: 内容分析
        this.currentProcessingMessage = 'Analyzing video content...'
        await this.processContentAnalysis()
        this.processingProgress.content = 100

        // 步骤3: 关键帧检测
        this.currentProcessingMessage = 'Detecting key frames...'
        await this.processKeyframeDetection()
        this.processingProgress.keyframes = 100

        // 步骤4: 素材匹配
        this.currentProcessingMessage = 'Matching materials...'
        await this.processMaterialMatching()
        this.processingProgress.materials = 100

        // 处理完成，切换到编辑步骤
        this.currentStep = 'editing'
        this.updateWorkflowProgress('editing')

        // 初始化编辑器
        await this.initializeEditor()
      } catch (error) {
        console.error('AI processing failed:', error)
        getErrorHandler().handleError(error, {
          context: 'ai-processing',
          severity: 'high'
        })
        // 回到上传步骤
        this.currentStep = 'upload'
        this.updateWorkflowProgress('upload')
      }
    },

    async processSpeechRecognition() {
      try {
        // 模拟语音识别处理
        const duration = 3000 // 3秒
        const steps = 30
        for (let i = 0; i <= steps; i++) {
          await new Promise(resolve => setTimeout(resolve, duration / steps))
          this.processingProgress.speech = (i / steps) * 100
        }

        // 这里应该调用实际的语音识别服务
        // const transcription = await whisperService.transcribe(this.uploadedVideo)
      } catch (error) {
        console.error('Speech recognition failed:', error)
        throw new Error('语音识别处理失败')
      }
    },

    async processContentAnalysis() {
      try {
        // 模拟内容分析
        const duration = 2000
        const steps = 20
        for (let i = 0; i <= steps; i++) {
          await new Promise(resolve => setTimeout(resolve, duration / steps))
          this.processingProgress.content = (i / steps) * 100
        }
      } catch (error) {
        console.error('Content analysis failed:', error)
        throw new Error('内容分析处理失败')
      }
    },

    async processKeyframeDetection() {
      try {
        // 模拟关键帧检测
        const duration = 2500
        const steps = 25
        for (let i = 0; i <= steps; i++) {
          await new Promise(resolve => setTimeout(resolve, duration / steps))
          this.processingProgress.keyframes = (i / steps) * 100
        }
      } catch (error) {
        console.error('Keyframe detection failed:', error)
        throw new Error('关键帧检测处理失败')
      }
    },

    async processMaterialMatching() {
      try {
        // 模拟素材匹配
        const duration = 2000
        const steps = 20
        for (let i = 0; i <= steps; i++) {
          await new Promise(resolve => setTimeout(resolve, duration / steps))
          this.processingProgress.materials = (i / steps) * 100
        }
      } catch (error) {
        console.error('Material matching failed:', error)
        throw new Error('素材匹配处理失败')
      }
    },

    // 编辑器初始化
    async initializeEditor() {
      await nextTick()

      // 创建视频元素
      const video = document.createElement('video')
      video.src = URL.createObjectURL(this.uploadedVideo)
      video.muted = true
      video.preload = 'metadata'

      await new Promise(resolve => {
        video.onloadedmetadata = resolve
        video.load()
      })

      this.videoElement = video

      // 初始化画布
      this.initializeCanvas()

      // 启用画中画
      this.pipEnabled = true
    },

    initializeCanvas() {
      const canvas = this.$refs.canvasRef
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
      ctx.fillText('VidSlide AI Canvas', canvas.width / 2, canvas.height / 2)
    },

    // 工作流进度管理
    updateWorkflowProgress(activeStep) {
      this.workflowSteps.forEach(step => {
        step.active = step.id === activeStep
      })
      this.currentStep = activeStep
    },

    // 模板选择处理
    handleTemplateSelected(templateId) {
      // 这里应该从模板引擎获取模板详情
      this.selectedTemplate = {
        id: templateId,
        name: templateId.charAt(0).toUpperCase() + templateId.slice(1),
        type: templateId
      }
    },

    // 调整变化处理
    handleAdjustmentChange(adjustments) {
      console.log('Adjustments changed:', adjustments)
      // 这里应该更新模板渲染
    },

    // 素材选择处理
    handleAssetSelected(asset) {
      console.log('Asset selected:', asset)
      // 这里应该将素材添加到当前模板
    },

    handleAssetPreviewed(asset) {
      console.log('Asset previewed:', asset)
    },

    // 动画处理
    handleAnimationStart(animation) {
      try {
        console.log('Animation started:', animation)
      } catch (error) {
        console.error('Animation start handler failed:', error)
        getErrorHandler().handleError(error, {
          context: 'animation-start',
          severity: 'low'
        })
      }
    },

    handleAnimationEnd(animation) {
      try {
        console.log('Animation ended:', animation)
      } catch (error) {
        console.error('Animation end handler failed:', error)
        getErrorHandler().handleError(error, {
          context: 'animation-end',
          severity: 'low'
        })
      }
    },

    // 性能监控
    handlePerformanceAlert(alert) {
      console.log('Performance alert:', alert)
    },

    handleMetricsUpdated(metrics) {
      console.log('Performance metrics:', metrics)
    },

    // 画布键盘事件
    handleCanvasKeydown(event) {
      const { key, ctrlKey, metaKey } = event
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const cmdKey = isMac ? metaKey : ctrlKey

      switch (key) {
      case 's':
        if (cmdKey) {
          event.preventDefault()
          console.log('Save state')
        }
        break
      case 'e':
        if (cmdKey) {
          event.preventDefault()
          this.handleExport()
        }
        break
      case 'Escape':
        console.log('Cancel operation')
        break
      }
    },

    // 导出处理
    async handleExport() {
      if (!this.selectedTemplate) {
        getErrorHandler().handleError(new Error('Please select a template first'), {
          context: 'export-validation',
          severity: 'low'
        })
        return
      }

      await withUserFeedback(
        async () => {
          // 这里应该实现实际的PPT导出逻辑
          await new Promise(resolve => setTimeout(resolve, 3000))
          throw new Error('PPT export functionality is under development')
        },
        {
          loadingMessage: 'Exporting PPT...',
          successMessage: 'PPT exported successfully',
          errorOptions: {
            context: 'ppt-export',
            severity: 'medium',
            showDialog: true
          }
        }
      )
    }
  }
}
</script>

<style scoped>
/* ===========================================
   工作页面样式 - 完全复刻桌面UI设计
   =========================================== */

/* AI处理区域样式 */
.processing-area {
  width: 100%;
  max-width: 900px;
  min-height: 450px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.processing-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  text-align: center;
  width: 100%;
}

.processing-icon {
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-brain-icon {
  font-size: 4rem;
  position: relative;
  z-index: 2;
}

.processing-rings {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
}

.ring {
  position: absolute;
  top: 50%;
  left: 50%;
  border: 2px solid rgba(0, 122, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: pulse-ring 2s ease-in-out infinite;
}

.ring-1 {
  width: 100px;
  height: 100px;
  animation-delay: 0s;
}

.ring-2 {
  width: 140px;
  height: 140px;
  animation-delay: 0.5s;
}

.ring-3 {
  width: 180px;
  height: 180px;
  animation-delay: 1s;
}

@keyframes pulse-ring {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.7;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.3;
  }
}

.processing-title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  color: var(--text-white);
  margin: 0;
  letter-spacing: -0.03em;
  font-family: var(--font-heading);
  line-height: 1.2;
}

.processing-status {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 400px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.status-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-white);
  min-width: 120px;
}

.status-progress {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
}

.status-progress .progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #007aff 0%, #4da3ff 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
  box-shadow: 0 0 8px rgba(0, 122, 255, 0.6);
}

.status-percent {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-white);
  min-width: 40px;
  text-align: right;
}

.processing-message {
  font-size: 1rem;
  color: var(--text-gray-light);
  margin: 0;
  animation: fade-in 0.5s ease;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 编辑区域样式 */
.editing-area {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-layout {
  flex: 1;
  display: flex;
  gap: 1px;
}

/* 左侧工具栏 */
.left-panel,
.right-panel {
  width: 320px;
  background: rgba(15, 20, 25, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05);
}

.right-panel {
  border-left: 1px solid rgba(255, 255, 255, 0.08);
}

.panel-section {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.panel-section h4 {
  margin: 0 0 1rem 0;
  color: var(--text-white);
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

/* 主编辑区 */
.main-editor {
  flex: 1;
  background: rgba(15, 20, 25, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
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
  padding: 2rem;
  background: rgba(0, 0, 0, 0.2);
  position: relative;
}

.editor-canvas {
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  background: rgba(15, 20, 25, 0.95);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.editor-canvas:hover {
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
}

/* 画中画控制 */
.pip-controls {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 动画控制 */
.animation-controls {
  position: absolute;
  bottom: 1.5rem;
  left: 1.5rem;
  right: 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* ===========================================
   工作页面样式 - 完全复刻桌面UI设计
   =========================================== */

.workspace-view {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  background: var(--bg-dark-blue);
  color: var(--text-white);
  font-family: var(--font-primary);
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

/* ===========================================
   顶部导航栏 - 苹果设计标准优化
   =========================================== */

.workspace-navbar {
  width: 100%;
  background: rgba(15, 20, 25, 0.95);
  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(30px) saturate(180%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.05) inset;
  padding: 1rem 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.navbar-container {
  width: 100%;
  margin: 0;
  padding: 0 clamp(1.5rem, 5vw, 4rem);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  color: var(--text-white);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: -0.01em;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(-2px);
}

.back-button:active {
  transform: translateX(0);
  transition: all 0.1s ease;
}

.back-button svg {
  width: 20px;
  height: 20px;
}

.workspace-title {
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  font-weight: 600;
  color: var(--text-white);
  margin: 0;
  letter-spacing: -0.02em;
  font-family: var(--font-heading);
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.settings-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  color: var(--text-white);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: -0.01em;
}

.settings-button:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.02);
}

.settings-button:active {
  transform: scale(0.98);
  transition: all 0.1s ease;
}

.settings-button svg {
  width: 20px;
  height: 20px;
}

.export-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--primary-blue);
  border: none;
  color: var(--text-white);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
  letter-spacing: -0.01em;
  position: relative;
  overflow: hidden;
}

.export-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transform: translate(-50%, -50%);
  transition:
    width 0.6s ease,
    height 0.6s ease;
}

.export-button:hover::before {
  width: 300px;
  height: 300px;
}

.export-button:hover {
  background: var(--primary-blue-dark);
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 6px 16px rgba(0, 122, 255, 0.4);
}

.export-button:active {
  transform: translateY(0) scale(0.98);
  transition: all 0.1s ease;
}

.export-button svg {
  width: 20px;
  height: 20px;
}

/* ===========================================
   工作流进度指示器
   =========================================== */

.workflow-progress {
  width: 100%;
  background: rgba(15, 20, 25, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 1.5rem 0;
}

.progress-container {
  width: 100%;
  margin: 0;
  padding: 0 clamp(1.5rem, 5vw, 4rem);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(1rem, 3vw, 2rem);
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  flex: 1;
  max-width: 200px;
}

.step-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.15);
  color: var(--text-gray-light);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.step-icon::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(0, 122, 255, 0.2);
  transform: translate(-50%, -50%);
  transition:
    width 0.4s ease,
    height 0.4s ease;
}

.progress-step.active .step-icon {
  background: var(--primary-blue);
  border-color: var(--primary-blue);
  color: var(--text-white);
  box-shadow:
    0 4px 16px rgba(0, 122, 255, 0.4),
    0 0 0 4px rgba(0, 122, 255, 0.1);
  transform: scale(1.05);
}

.progress-step.active .step-icon::after {
  width: 60px;
  height: 60px;
}

.step-icon svg {
  width: 24px;
  height: 24px;
}

.step-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-gray-light);
  text-align: center;
}

.progress-step.active .step-label {
  color: var(--text-white);
  font-weight: 600;
}

.step-connector {
  position: absolute;
  top: 24px;
  left: calc(50% + 24px);
  width: calc(100% - 48px);
  height: 2px;
  background: rgba(255, 255, 255, 0.2);
  z-index: -1;
}

.progress-step:last-child .step-connector {
  display: none;
}

/* ===========================================
   主内容区 - 文件上传
   =========================================== */

.workspace-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(2rem, 6vw, 4rem) clamp(1.5rem, 5vw, 4rem);
  width: 100%;
  margin: 0;
}

.upload-area {
  width: 100%;
  max-width: 900px;
  min-height: 450px;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.upload-area::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(0, 122, 255, 0.1) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.upload-area:hover {
  border-color: var(--primary-blue);
  background: rgba(0, 122, 255, 0.08);
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 122, 255, 0.2);
}

.upload-area:hover::before {
  opacity: 1;
}

.upload-area.dragover {
  border-color: var(--primary-blue);
  background: rgba(0, 122, 255, 0.15);
  transform: scale(1.02) translateY(-4px);
  box-shadow: 0 24px 48px rgba(0, 122, 255, 0.3);
  border-style: solid;
}

.file-input-hidden {
  display: none;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  text-align: center;
  padding: 2rem;
}

.upload-icon-large {
  width: 80px;
  height: 80px;
  background: var(--primary-blue-gradient);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-white);
  box-shadow:
    0 8px 24px rgba(0, 122, 255, 0.4),
    0 0 0 8px rgba(0, 122, 255, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.upload-area:hover .upload-icon-large {
  transform: scale(1.1) rotate(5deg);
  box-shadow:
    0 12px 32px rgba(0, 122, 255, 0.5),
    0 0 0 12px rgba(0, 122, 255, 0.15);
}

.upload-area.dragover .upload-icon-large {
  transform: scale(1.15) rotate(-5deg);
  animation: upload-pulse 1s ease-in-out infinite;
}

@keyframes upload-pulse {
  0%,
  100% {
    transform: scale(1.15) rotate(-5deg);
  }
  50% {
    transform: scale(1.2) rotate(5deg);
  }
}

.upload-title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  color: var(--text-white);
  margin: 0;
  letter-spacing: -0.03em;
  font-family: var(--font-heading);
  line-height: 1.2;
}

.upload-instruction {
  font-size: 1rem;
  color: var(--text-gray-light);
  margin: 0;
}

.file-formats {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 1rem;
}

.format-tag {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-white);
}

/* ===========================================
   底部功能栏
   =========================================== */

.workspace-footer {
  width: 100%;
  background: rgba(15, 20, 25, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: clamp(2rem, 5vw, 3rem) clamp(1.5rem, 5vw, 4rem);
  display: flex;
  justify-content: center;
  gap: clamp(1.5rem, 4vw, 2.5rem);
  flex-wrap: wrap;
}

.feature-box {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 200px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.feature-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.6s ease;
}

.feature-box:hover::before {
  left: 100%;
}

.feature-box:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.feature-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-text {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-white);
  letter-spacing: -0.01em;
  line-height: 1.5;
}

/* ===========================================
   响应式设计
   =========================================== */

@media (max-width: 1024px) {
  .navbar-container {
    flex-wrap: wrap;
    gap: 1rem;
  }

  .workspace-title {
    order: 3;
    width: 100%;
    text-align: center;
  }

  .progress-container {
    flex-wrap: wrap;
    gap: 2rem;
  }

  .step-connector {
    display: none;
  }

  .workspace-footer {
    flex-direction: column;
    align-items: center;
  }

  .feature-box {
    width: 100%;
    max-width: 400px;
  }
}

@media (max-width: 768px) {
  .navbar-container {
    padding: 0 1rem;
  }

  .back-button,
  .settings-button {
    font-size: 0.875rem;
    padding: 0.5rem;
  }

  .export-button {
    font-size: 0.875rem;
    padding: 0.5rem 1rem;
  }

  .workspace-title {
    font-size: 1.25rem;
  }

  .upload-title {
    font-size: 1.5rem;
  }

  .upload-area {
    min-height: 300px;
  }

  .upload-icon-large {
    width: 60px;
    height: 60px;
  }

  .upload-icon-large svg {
    width: 32px;
    height: 32px;
  }
}
</style>
