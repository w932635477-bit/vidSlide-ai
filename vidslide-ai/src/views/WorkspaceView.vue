<!--
  WorkspaceView.vue - 剪映风格工作区（重构版）
  从 1281 行简化到约 300 行
  使用组件化架构：WorkspaceSidebar + WorkspaceMainArea + WorkspaceRightPanel
-->
<template>
  <div class="workspace">
    <!-- 全局组件 -->
    <ErrorHandler ref="errorHandler" />

    <AuthorizationDialog
      :visible="showAuthDialog"
      :search-keywords="pendingSearchKeywords"
      @authorize="handleMaterialAuthorize"
      @cancel="handleAuthCancel"
      @use-local-only="handleUseLocalOnly"
    />

    <MaterialSelectionDialog
      :visible="showMaterialDialog"
      :materials="searchResults"
      :source="searchResultSource"
      :platforms="searchResultPlatforms"
      @close="closeMaterialDialog"
      @confirm="confirmMaterialSelection"
      @update:visible="showMaterialDialog = $event"
    />

    <!-- 剪映风格顶部工具栏 -->
    <header class="header fade-in">
      <div class="header-left">
        <div class="logo">🎬 VidSlide AI</div>
        <nav class="nav-tabs">
          <button class="nav-tab active">编辑</button>
          <button class="nav-tab">字幕</button>
          <button class="nav-tab">特效</button>
          <button class="nav-tab">音乐</button>
          <button class="nav-tab">导出</button>
        </nav>
      </div>
      <div class="header-right">
        <button class="header-btn" title="撤销 (⌘Z)">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />
          </svg>
          <span class="btn-label">撤销</span>
        </button>
        <button class="header-btn" title="重做 (⌘⇧Z)">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M21 7v6h-6" />
            <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7" />
          </svg>
          <span class="btn-label">重做</span>
        </button>
        <button class="header-btn primary" title="保存 (⌘S)">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          <span class="btn-label">保存</span>
        </button>
      </div>
    </header>

    <!-- 主工作区容器 -->
    <div class="main-container">
      <!-- 左侧边栏（使用 WorkspaceSidebar 组件） -->
      <WorkspaceSidebar
        :projects="projects"
        :videos="videos"
        :images="images"
        :audios="audios"
        :can-generate="canGenerate"
        @auto-generate="handleAutoGenerate"
        @select-asset="handleSelectAsset"
      />

      <!-- 中间工作区 -->
      <main class="workspace-main">
        <div v-if="hasVideo" class="video-workspace">
          <WorkspaceMainArea
            ref="workspaceMainArea"
            :is-generating="isAutoGenerating"
            @auto-generate="handleAutoGenerate"
            @ppt-slides-updated="handlePptSlidesUpdated"
          />
        </div>
        <div v-else class="preview-placeholder fade-in">
          <VideoUploader @video-uploaded="handleVideoUploaded" />
        </div>
      </main>

      <!-- 右侧属性面板（使用 WorkspaceRightPanel 组件） -->
      <WorkspaceRightPanel
        :workflow-steps="workflowSteps"
        :execution-steps="executionSteps"
        :current-step-index="autoGenStepIndex"
        :is-running="isWorkflowRunning"
        :is-paused="isWorkflowPaused"
        :is-completed="isWorkflowCompleted"
        :has-error="hasWorkflowError"
        :statistics="workflowStatistics"
        :video-resolution="videoResolution"
        :video-duration="videoDuration"
        :video-format="videoFormat"
        :ppt-slides="pptSlides"
        :show-ppt-tab="showPptTab"
        :multi-agent-progress="progress"
        :multi-agent-current-step="currentStep"
        :show-multi-agent-progress="showProgress"
        :elapsed-time="elapsedTime"
        @workflow-pause="handleWorkflowPause"
        @workflow-resume="handleWorkflowResume"
        @workflow-cancel="handleWorkflowCancel"
        @clear-logs="handleClearLogs"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'

// Store和Composables
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useVideoProcessing } from '@/composables/useVideoProcessing'
import { useProjectManagement } from '@/composables/useProjectManagement'
import { useMaterialManagement } from '@/composables/useMaterialManagement'
import { useAutoGeneration } from '@/composables/useAutoGeneration'

// 组件导入
import ErrorHandler from '@/components/ErrorHandler.vue'
import AuthorizationDialog from '@/components/AuthorizationDialog.vue'
import MaterialSelectionDialog from '@/components/MaterialSelectionDialog.vue'
import VideoUploader from '@/components/VideoUploader.vue'
import WorkspaceSidebar from '@/components/workspace/WorkspaceSidebar.vue'
import WorkspaceMainArea from '@/components/workspace/WorkspaceMainArea.vue'
import WorkspaceRightPanel from '@/components/workspace/WorkspaceRightPanel.vue'

// ========== 初始化 ==========
const store = useWorkspaceStore()
const errorHandler = ref(null)
const workspaceMainArea = ref(null)

// Composables
const { handleVideoUpload } = useVideoProcessing()
const { autoSave, debouncedAutoSave, restoreAutoSave } = useProjectManagement()
const {
  showAuthDialog,
  showMaterialDialog,
  searchResults,
  searchResultSource,
  searchResultPlatforms,
  pendingSearchKeywords,
  authorizeSearch,
  cancelAuthorization,
  useLocalOnly,
  confirmMaterialSelection,
  closeMaterialDialog
} = useMaterialManagement()

// 自动化生成
const {
  isProcessing: isAutoGenerating,
  progress,
  currentStep,
  showProgress,
  autoGenerate,
  cancelGeneration,
  // V0风格执行步骤
  executionSteps,
  currentStepIndex: autoGenStepIndex,
  elapsedTime,
  clearExecutionSteps
} = useAutoGeneration()

// ========== 计算属性 ==========
const hasVideo = computed(() => store.hasVideo)
const canGenerate = computed(() => hasVideo.value && !isAutoGenerating.value)

// 素材数据（传递给 WorkspaceSidebar）
const projects = computed(() => store.projects || [])
const videos = computed(() =>
  hasVideo.value ? [{ id: 1, name: '当前视频', src: store.video.src }] : []
)
const images = computed(() => store.images || [])
const audios = computed(() => store.audios || [])

// 视频属性（传递给 WorkspaceRightPanel）
const videoResolution = computed(() => {
  if (!store.video.width || !store.video.height) return '未知'
  return `${store.video.width}x${store.video.height}`
})

const videoDuration = computed(() => {
  if (!store.video.duration) return '0:00'
  const mins = Math.floor(store.video.duration / 60)
  const secs = Math.floor(store.video.duration % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
})

const videoFormat = computed(() => {
  if (!store.video.file || !store.video.file.name) return '未知'
  const ext = store.video.file.name.split('.').pop()?.toUpperCase()
  return ext || 'MP4'
})

// PPT 幻灯片状态
const pptSlides = ref([])
const showPptTab = ref(false)

// ========== 工作流监控状态 ==========
const workflowSteps = ref([])
const currentWorkflowStep = ref(0)
const isWorkflowRunning = ref(false)
const isWorkflowPaused = ref(false)
const isWorkflowCompleted = ref(false)
const hasWorkflowError = ref(false)
const workflowStatistics = ref(null)

// ========== 事件处理 ==========

// 视频上传
const handleVideoUploaded = async file => {
  try {
    console.log('📹 视频上传:', file.name)
    await handleVideoUpload(file)
    console.log('✅ 视频上传完成，等待用户点击一键生成')
    ElMessage.success('视频上传成功！点击"一键生成"开始处理')
  } catch (error) {
    console.error('视频上传失败:', error)
    ElMessage.error(`上传失败: ${error.message}`)
    if (errorHandler.value) {
      errorHandler.value.addError({
        type: 'upload',
        title: '视频上传失败',
        message: error.message,
        canRetry: true
      })
    }
  }
}

// 手动触发一键生成
const handleAutoGenerate = async () => {
  try {
    console.log('🚀 手动触发一键生成')

    // 初始化工作流监控
    initWorkflowMonitor()

    // 模拟工作流步骤更新
    simulateWorkflowProgress()

    // 获取当前视频文件
    const videoFile = store.video.file
    if (!videoFile) {
      ElMessage.error('请先上传视频')
      return
    }

    // 调用一键自动生成
    const result = await autoGenerate(videoFile)

    console.log('✅ 自动生成完成', result)
    isWorkflowCompleted.value = true
    isWorkflowRunning.value = false

    // 显示成功消息
    ElMessage.success({
      message: '生成完成！正在加载预览...',
      duration: 2000
    })

    // 显示生成预览
    if (workspaceMainArea.value && result) {
      console.log('📺 准备显示预览，结果:', result)

      // ⭐ 保存Timeline数据到store
      if (result.timeline) {
        console.log('✅ Timeline数据可用:', result.timeline)
        store.setTimeline(result.timeline)
        console.log('✅ Timeline已保存到workspaceStore')
      } else {
        console.warn('⚠️ 未收到Timeline数据')
      }

      // 使用生成的视频路径（多智能体生成的最终视频）
      let videoUrl = store.video.src // 默认使用原视频

      if (result.videoPath) {
        // 使用后端生成的视频
        videoUrl = `http://localhost:3002/api/multi-agent/download/${result.taskId}`
        console.log('🎬 使用生成的视频:', videoUrl)
      } else {
        console.warn('⚠️ 未找到生成的视频，使用原视频')
      }

      // 从Timeline生成PPT幻灯片
      const pptSlides = result.timeline?.clips?.map((clip, index) => ({
        id: index + 1,
        title: `场景 ${index + 1}`,
        content: `时长: ${clip.duration.toFixed(2)}s`,
        thumbnail: '',
        image: ''
      })) || []

      console.log('📄 PPT幻灯片数据:', pptSlides)
      console.log('🎬 视频URL:', videoUrl)

      // 获取Remotion预览参数
      let remotionProps = null
      if (result.taskId) {
        try {
          console.log('🎬 获取Remotion预览参数...')
          const remotionResponse = await fetch(`http://localhost:3002/api/multi-agent/remotion-props/${result.taskId}`)
          if (remotionResponse.ok) {
            const remotionData = await remotionResponse.json()
            remotionProps = remotionData.defaultProps
            console.log('✅ Remotion预览参数获取成功:', remotionProps)
          } else {
            console.warn('⚠️ 获取Remotion预览参数失败')
          }
        } catch (error) {
          console.error('❌ 获取Remotion预览参数出错:', error)
        }
      }

      workspaceMainArea.value.showPreview(
        videoUrl,
        pptSlides,
        new Date().toLocaleString(),
        store.video.file?.size || 0,
        remotionProps
      )
    }
  } catch (error) {
    console.error('自动生成失败:', error)
    ElMessage.error(`生成失败: ${error.message}`)
    hasWorkflowError.value = true
    isWorkflowRunning.value = false
    if (errorHandler.value) {
      errorHandler.value.addError({
        type: 'processing',
        title: '视频生成失败',
        message: error.message,
        details: error.stack,
        canRetry: true
      })
    }
  }
}

// 取消生成
const handleCancelGeneration = () => {
  console.log('🛑 用户取消生成')
  cancelGeneration()
  isWorkflowRunning.value = false
  hasWorkflowError.value = false
  ElMessage.info('已取消生成')
}

// 处理 PPT 幻灯片更新
const handlePptSlidesUpdated = data => {
  pptSlides.value = data.slides || []
  showPptTab.value = data.showPptTab || false
  console.log('PPT 幻灯片已更新:', pptSlides.value.length, '页')
}

// 选择素材
const handleSelectAsset = asset => {
  console.log('选择素材:', asset)
  ElMessage.info(`已选择: ${asset.name}`)
}

// 素材授权
const handleMaterialAuthorize = async platforms => {
  try {
    await authorizeSearch(platforms)
  } catch (error) {
    console.error('授权搜索失败:', error)
    if (errorHandler.value) {
      errorHandler.value.addError({
        type: 'permission',
        title: '授权失败',
        message: error.message,
        canRetry: true
      })
    }
  }
}

// 取消授权
const handleAuthCancel = () => {
  cancelAuthorization()
}

// 仅使用本地素材
const handleUseLocalOnly = async () => {
  try {
    await useLocalOnly()
  } catch (error) {
    console.error('本地搜索失败:', error)
    if (errorHandler.value) {
      errorHandler.value.addError({
        type: 'processing',
        title: '本地搜索失败',
        message: error.message,
        canRetry: true
      })
    }
  }
}

// ========== 工作流监控事件处理 ==========

// 暂停工作流
const handleWorkflowPause = () => {
  console.log('⏸️ 暂停工作流')
  isWorkflowPaused.value = true
  isWorkflowRunning.value = false
  ElMessage.info('工作流已暂停')
}

// 恢复工作流
const handleWorkflowResume = () => {
  console.log('▶️ 恢复工作流')
  isWorkflowPaused.value = false
  isWorkflowRunning.value = true
  ElMessage.success('工作流已恢复')
}

// 取消工作流
const handleWorkflowCancel = () => {
  console.log('⏹️ 取消工作流')

  // 取消多智能体生成
  if (isAutoGenerating.value) {
    cancelGeneration()
  }

  isWorkflowRunning.value = false
  isWorkflowPaused.value = false
  hasWorkflowError.value = true
  ElMessage.warning('工作流已取消')
}

// 清空日志
const handleClearLogs = () => {
  console.log('🗑️ 清空工作流日志')
  workflowSteps.value = []
  currentWorkflowStep.value = 0
  isWorkflowCompleted.value = false
  hasWorkflowError.value = false
  workflowStatistics.value = null
  // 清空V0风格执行步骤
  clearExecutionSteps()
  ElMessage.success('日志已清空')
}

// 初始化工作流监控
const initWorkflowMonitor = () => {
  console.log('📊 初始化工作流监控')

  workflowSteps.value = [
    {
      id: 'step-1',
      name: '视频分析',
      status: 'pending',
      expanded: false,
      logs: [],
      input: null,
      output: null,
      error: null,
      duration: null
    },
    {
      id: 'step-2',
      name: '内容提取',
      status: 'pending',
      expanded: false,
      logs: [],
      input: null,
      output: null,
      error: null,
      duration: null
    },
    {
      id: 'step-3',
      name: '素材搜索',
      status: 'pending',
      expanded: false,
      logs: [],
      input: null,
      output: null,
      error: null,
      duration: null
    },
    {
      id: 'step-4',
      name: '内容生成',
      status: 'pending',
      expanded: false,
      logs: [],
      input: null,
      output: null,
      error: null,
      duration: null
    },
    {
      id: 'step-5',
      name: '最终合成',
      status: 'pending',
      expanded: false,
      logs: [],
      input: null,
      output: null,
      error: null,
      duration: null
    }
  ]

  currentWorkflowStep.value = 0
  isWorkflowRunning.value = true
  isWorkflowPaused.value = false
  isWorkflowCompleted.value = false
  hasWorkflowError.value = false

  workflowStatistics.value = {
    totalSteps: 5,
    completedSteps: 0,
    failedSteps: 0,
    totalDuration: 0
  }
}

// 更新工作流步骤状态
const updateWorkflowStep = (stepIndex, status, data = {}) => {
  if (stepIndex >= 0 && stepIndex < workflowSteps.value.length) {
    const step = workflowSteps.value[stepIndex]
    step.status = status

    if (data.logs) {
      step.logs.push(...data.logs)
    }

    if (data.input) {
      step.input = data.input
    }

    if (data.output) {
      step.output = data.output
    }

    if (data.error) {
      step.error = data.error
      hasWorkflowError.value = true
    }

    if (data.duration) {
      step.duration = data.duration
    }

    // 更新统计信息
    if (status === 'success') {
      workflowStatistics.value.completedSteps++
    } else if (status === 'error') {
      workflowStatistics.value.failedSteps++
    }

    // 自动展开当前步骤
    step.expanded = true
  }
}

// 模拟工作流进度
const simulateWorkflowProgress = () => {
  const steps = [
    { index: 0, delay: 1000, duration: 2000 },
    { index: 1, delay: 3000, duration: 3000 },
    { index: 2, delay: 6000, duration: 4000 },
    { index: 3, delay: 10000, duration: 5000 },
    { index: 4, delay: 15000, duration: 3000 }
  ]

  steps.forEach(({ index, delay, duration }) => {
    // 开始步骤
    setTimeout(() => {
      currentWorkflowStep.value = index
      updateWorkflowStep(index, 'running', {
        logs: [
          {
            time: new Date().toLocaleTimeString(),
            level: 'info',
            message: `开始执行步骤 ${index + 1}`
          }
        ]
      })
    }, delay)

    // 完成步骤
    setTimeout(() => {
      updateWorkflowStep(index, 'success', {
        duration,
        logs: [
          {
            time: new Date().toLocaleTimeString(),
            level: 'success',
            message: `步骤 ${index + 1} 执行成功`
          }
        ],
        output: {
          status: 'success',
          message: `步骤 ${index + 1} 完成`
        }
      })

      // 更新总耗时
      if (workflowStatistics.value) {
        workflowStatistics.value.totalDuration += duration
      }
    }, delay + duration)
  })
}

// ========== 生命周期 ==========

// 自动保存定时器引用
let autoSaveInterval = null

onMounted(async () => {
  console.log('🚀 WorkspaceView mounted')

  // 尝试恢复自动保存
  try {
    await restoreAutoSave()
  } catch (error) {
    console.log('没有自动保存的项目')
  }

  // 设置自动保存定时器（每60秒检查一次）
  autoSaveInterval = setInterval(() => {
    autoSave()
  }, 60000) // 改为60秒
})

// 监听 store 变化，使用防抖自动保存
watch(
  () => store.project.isDirty,
  isDirty => {
    if (isDirty) {
      debouncedAutoSave()
    }
  }
)

// 清理定时器
onUnmounted(() => {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval)
    autoSaveInterval = null
  }
  console.log('🔚 WorkspaceView unmounted')
})

// 页面卸载前保存
window.addEventListener('beforeunload', e => {
  if (store.project.isDirty) {
    e.preventDefault()
    e.returnValue = ''
    autoSave()
  }
})
</script>

<style scoped>
/* 剪映风格 - Apple-inspired 设计系统 */
.workspace {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: var(--system-background);
  font-family:
    -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Helvetica,
    Arial, sans-serif;
  color: var(--label-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 顶部工具栏 */
.header {
  height: 52px;
  background: var(--system-background);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--separator-opaque);
  display: flex;
  align-items: center;
  padding: 0 24px;
  z-index: 1000;
  position: relative;
  box-shadow: 0 1px 0 var(--separator-non-opaque);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.logo {
  font-size: 17px;
  font-weight: 600;
  color: var(--label-primary);
  display: flex;
  align-items: center;
  gap: 6px;
  letter-spacing: -0.022em;
}

.nav-tabs {
  display: flex;
  gap: 1px;
  margin-left: 32px;
}

.nav-tab {
  padding: 8px 12px;
  background: transparent;
  border: none;
  color: var(--label-secondary);
  cursor: pointer;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 400;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.nav-tab:hover {
  background: var(--secondary-background);
  color: var(--label-primary);
}

.nav-tab.active {
  background: var(--system-blue);
  color: var(--label-primary);
  font-weight: 500;
}

.header-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-btn {
  padding: 6px 12px;
  background: var(--tertiary-background);
  border: 1px solid var(--separator-opaque);
  border-radius: 8px;
  color: var(--label-primary);
  cursor: pointer;
  font-size: 13px;
  font-weight: 400;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 32px;
  box-shadow: 0 1px 2px var(--card-shadow);
}

.header-btn svg {
  flex-shrink: 0;
}

.header-btn .btn-label {
  font-size: 13px;
  font-weight: 400;
}

.header-btn:hover {
  background: var(--quaternary-background);
  border-color: var(--separator-opaque);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px var(--card-shadow-hover);
}

.header-btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px var(--card-shadow);
}

.header-btn.primary {
  background: var(--system-blue);
  border-color: var(--system-blue);
  color: white;
  font-weight: 500;
}

.header-btn.primary:hover {
  background: var(--primary-hover);
  border-color: var(--primary-hover);
}

/* 主容器布局 */
.main-container {
  display: flex;
  height: calc(100vh - 52px);
  overflow: hidden;
  flex: 1;
  min-height: 0;
}

/* 中间工作区 */
.workspace-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--system-background);
  overflow: hidden;
  min-height: 0;
}

.video-workspace {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 0;
}

.preview-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--label-tertiary);
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .nav-tabs {
    display: none;
  }
}

@media (max-width: 768px) {
  .header-right {
    gap: 6px;
  }
  .header-btn .btn-label {
    display: none;
  }
}
</style>
