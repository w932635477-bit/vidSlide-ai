<!--
  WorkspaceView.vue - 重构版
  从4,285行简化到~250行
  使用Pinia Store + Composables + 子组件架构
-->
<template>
  <div class="workspace">
    <!-- 全局组件 -->
    <ErrorHandler ref="errorHandler" />

    <ProgressIndicator
      :visible="showProgress"
      :current-stage-id="currentStage"
      :progress="progressValue"
      :estimated-time-remaining="estimatedTime"
      :can-cancel="canCancelProgress"
      @cancel="handleProgressCancel"
    />

    <!-- 自动化生成进度 -->
    <AutoGenerationProgress
      :visible="showAutoGenProgress"
      :current-step="autoGenCurrentStep"
      :progress="autoGenProgress"
      :can-cancel="true"
      @cancel="handleAutoGenCancel"
    />

    <AuthorizationDialog
      :visible="showAuthDialog"
      :searchKeywords="pendingSearchKeywords"
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

    <!-- 动画系统 -->
    <AnimationSystem
      v-if="hasVideo && showAnimationSystem"
      @animation-start="handleAnimationStart"
      @animation-end="handleAnimationEnd"
      @sync-update="handleSyncUpdate"
    />

    <!-- 剪映风格顶部工具栏 -->
    <header class="header fade-in">
      <div class="header-left">
        <div class="logo">
          🎬 VidSlide AI
        </div>
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
          <span>↶</span>
        </button>
        <button class="header-btn" title="重做 (⌘⇧Z)">
          <span>↷</span>
        </button>
        <button class="header-btn primary" title="保存 (⌘S)">
          <span>💾</span>
        </button>
      </div>
    </header>

    <!-- 主工作区容器 -->
    <div class="main-container">
      <!-- 左侧工具栏 -->
      <aside class="left-sidebar slide-in-bottom">
        <div class="sidebar-tabs">
          <button class="sidebar-tab active" title="媒体素材">📹 媒体</button>
          <button class="sidebar-tab" title="文字元素">📝 文字</button>
          <button class="sidebar-tab" title="特效资源">✨ 特效</button>
          <button class="sidebar-tab" title="音频素材">🎵 音乐</button>
        </div>
        <div class="sidebar-content">
          <div class="media-section">
            <div class="media-section-title">最近使用</div>
            <div class="media-grid">
              <div class="media-item" v-if="hasVideo">
                <div class="media-icon">🎥</div>
                <div class="media-info">
                  <div class="media-name">当前视频</div>
                  <div class="media-meta">video</div>
                </div>
              </div>
            </div>
          </div>

          <div class="media-section">
            <div class="media-section-title">素材库</div>
            <div class="media-grid">
              <div class="media-item">
                <div class="media-icon">🎥</div>
                <div class="media-info">
                  <div class="media-name">示例视频</div>
                  <div class="media-meta">video</div>
                </div>
              </div>
              <div class="media-item">
                <div class="media-icon">🎵</div>
                <div class="media-info">
                  <div class="media-name">背景音乐</div>
                  <div class="media-meta">audio</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- 中间工作区 -->
      <main class="workspace-main-area">
        <!-- 预览区域 -->
        <div class="preview-area">
          <div class="preview-container">
            <div v-if="hasVideo">
              <WorkspaceMainArea />
            </div>
            <div v-else class="preview-placeholder fade-in">
              <VideoUploader @video-uploaded="handleVideoUploaded" />
            </div>
          </div>
        </div>

        <!-- 时间轴 -->
        <div class="timeline-container slide-in-bottom" v-if="hasVideo">
          <WorkspaceBottomPanel />
        </div>
      </main>

      <!-- 右侧属性面板 -->
      <aside class="right-panel slide-in-bottom">
        <div class="panel-tabs">
          <button class="panel-tab active" title="基本属性">⚙️ 属性</button>
          <button class="panel-tab" title="视觉特效">✨ 特效</button>
          <button class="panel-tab" title="动画效果">🎭 动画</button>
        </div>
        <div class="panel-content">
          <div class="property-group">
            <div class="property-title">项目信息</div>
            <div class="property-item" v-if="hasVideo">
              <label class="property-label">视频状态</label>
              <div class="status-indicator status-success">已加载</div>
            </div>
            <div class="property-item" v-else>
              <label class="property-label">视频状态</label>
              <div class="status-indicator status-warning">未加载</div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'

// Store和Composables
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useVideoProcessing } from '@/composables/useVideoProcessing'
import { useProjectManagement } from '@/composables/useProjectManagement'
import { useMaterialManagement } from '@/composables/useMaterialManagement'
import { useAutoGeneration } from '@/composables/useAutoGeneration'

// 组件导入
import ErrorHandler from '@/components/ErrorHandler.vue'
import ProgressIndicator from '@/components/ProgressIndicator.vue'
import AutoGenerationProgress from '@/components/AutoGenerationProgress.vue'
import AuthorizationDialog from '@/components/AuthorizationDialog.vue'
import MaterialSelectionDialog from '@/components/MaterialSelectionDialog.vue'
import VideoUploader from '@/components/VideoUploader.vue'
import WorkspaceMainArea from '@/components/workspace/WorkspaceMainArea.vue'
import WorkspaceBottomPanel from '@/components/workspace/WorkspaceBottomPanel.vue'
import AnimationSystem from '@/components/AnimationSystem.vue'

// ========== 初始化 ==========
const store = useWorkspaceStore()
const errorHandler = ref(null)

// Composables
const { handleVideoUpload, startAnalysis } = useVideoProcessing()
const { autoSave, restoreAutoSave } = useProjectManagement()
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
  progress: autoGenProgress,
  currentStep: autoGenCurrentStep,
  showProgress: showAutoGenProgress,
  autoGenerate,
  cancelGeneration: cancelAutoGeneration
} = useAutoGeneration()

// ========== 计算属性 ==========
const hasVideo = computed(() => store.hasVideo)
const showProgress = computed(() => store.progress.visible)
const currentStage = computed(() => store.progress.currentStage)
const progressValue = computed(() => store.progress.value)
const estimatedTime = computed(() => store.progress.estimatedTime)
const canCancelProgress = computed(() => store.progress.canCancel)

// 动画系统状态
const showAnimationSystem = ref(true) // 默认显示动画系统

// ========== 事件处理 ==========

// 视频上传 - 自动触发一键生成
const handleVideoUploaded = async (file) => {
  try {
    console.log('📹 视频上传:', file.name)

    // 保存视频文件到 store
    await handleVideoUpload(file)

    // 🚀 自动触发一键生成（不再需要手动点击）
    ElMessage.success('视频上传成功，开始自动生成PPT+视频...')

    // 调用一键自动生成
    await autoGenerate(file)

    ElMessage.success('🎉 自动生成完成！您可以预览或手动调整')
  } catch (error) {
    console.error('自动生成失败:', error)
    ElMessage.error(`生成失败: ${error.message}`)
    if (errorHandler.value) {
      errorHandler.value.handleError(error)
    }
  }
}

// 进度取消
const handleProgressCancel = () => {
  console.log('用户取消进度')
  store.hideProgress()
  ElMessage.info('已取消操作')
}

// 自动生成取消
const handleAutoGenCancel = () => {
  console.log('用户取消自动生成')
  cancelAutoGeneration()
}

// 素材授权
const handleMaterialAuthorize = async (platforms) => {
  try {
    await authorizeSearch(platforms)
  } catch (error) {
    console.error('授权搜索失败:', error)
    if (errorHandler.value) {
      errorHandler.value.handleError(error)
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
      errorHandler.value.handleError(error)
    }
  }
}

// 动画系统事件处理
const handleAnimationStart = (data) => {
  console.log('🎬 动画开始:', data)
}

const handleAnimationEnd = (data) => {
  console.log('✅ 动画结束:', data)
}

const handleSyncUpdate = (data) => {
  console.log('🔄 时间轴同步更新:', data)
}

// ========== 生命周期 ==========

onMounted(async () => {
  console.log('🚀 WorkspaceView mounted')

  // 尝试恢复自动保存
  try {
    await restoreAutoSave()
  } catch (error) {
    console.log('没有自动保存的项目')
  }

  // 设置自动保存定时器（每30秒）
  const autoSaveInterval = setInterval(() => {
    autoSave()
  }, 30000)

  // 清理定时器
  onUnmounted(() => {
    clearInterval(autoSaveInterval)
    console.log('🔚 WorkspaceView unmounted')
  })
})

// 页面卸载前保存
window.addEventListener('beforeunload', (e) => {
  if (store.project.isDirty) {
    e.preventDefault()
    e.returnValue = ''
    autoSave()
  }
})
</script>

<style scoped>
/* 剪映风格 - Apple-inspired 设计系统 */
/* CSS变量已在全局样式中定义 */

.workspace {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: var(--system-background);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif;
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
  color: var(--label-primary);
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
}

/* 左侧工具栏 */
.left-sidebar {
  width: 280px;
  background: var(--secondary-background);
  border-right: 1px solid var(--separator-opaque);
  display: flex;
  flex-direction: column;
  box-shadow: inset -1px 0 0 var(--separator-non-opaque);
}

.sidebar-tabs {
  display: flex;
  border-bottom: 1px solid var(--separator-opaque);
  background: var(--tertiary-background);
}

.sidebar-tab {
  flex: 1;
  padding: 12px 16px;
  background: transparent;
  border: none;
  color: var(--label-secondary);
  cursor: pointer;
  font-size: 13px;
  font-weight: 400;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  border-radius: 6px;
  margin: 4px;
}

.sidebar-tab:hover {
  background: var(--quaternary-background);
  color: var(--label-primary);
}

.sidebar-tab.active {
  background: var(--system-blue);
  color: var(--label-primary);
  font-weight: 500;
}

.sidebar-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.media-section {
  margin-bottom: 24px;
}

.media-section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--label-primary);
  margin-bottom: 16px;
  letter-spacing: -0.022em;
  text-transform: uppercase;
  opacity: 0.8;
}

.media-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.media-item {
  padding: 16px;
  border-radius: 8px;
  background: var(--tertiary-background);
  border: 1px solid var(--separator-opaque);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 1px 2px var(--card-shadow);
}

.media-item:hover {
  background: var(--quaternary-background);
  border-color: var(--system-blue);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--card-shadow-hover);
}

.media-icon {
  width: 40px;
  height: 40px;
  background: var(--quaternary-background);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--label-secondary);
  font-size: 18px;
  flex-shrink: 0;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.media-info {
  flex: 1;
  min-width: 0;
}

.media-name {
  font-size: 13px;
  color: var(--label-primary);
  font-weight: 500;
  line-height: 1.3;
  letter-spacing: -0.022em;
  margin-bottom: 2px;
}

.media-meta {
  font-size: 11px;
  color: var(--label-secondary);
  font-weight: 400;
  opacity: 0.8;
}

/* 中间工作区 */
.workspace-main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--system-background);
  overflow: hidden;
}

.preview-area {
  flex: 1;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--secondary-background);
  overflow: hidden;
}

.preview-container {
  width: 100%;
  max-width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
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

/* 时间轴 */
.timeline-container {
  height: 220px;
  background: var(--timeline-bg);
  border-top: 1px solid var(--separator-opaque);
  display: flex;
  flex-direction: column;
  box-shadow: inset 0 1px 0 var(--separator-non-opaque);
}

/* 右侧属性面板 */
.right-panel {
  width: 320px;
  background: var(--secondary-background);
  border-left: 1px solid var(--separator-opaque);
  display: flex;
  flex-direction: column;
  box-shadow: inset 1px 0 0 var(--separator-non-opaque);
}

.panel-tabs {
  display: flex;
  border-bottom: 1px solid var(--separator-opaque);
  background: var(--tertiary-background);
}

.panel-tab {
  flex: 1;
  padding: 12px 16px;
  background: transparent;
  border: none;
  color: var(--label-secondary);
  cursor: pointer;
  font-size: 13px;
  font-weight: 400;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  border-radius: 6px;
  margin: 4px;
}

.panel-tab:hover {
  background: var(--quaternary-background);
  color: var(--label-primary);
}

.panel-tab.active {
  background: var(--system-blue);
  color: var(--label-primary);
  font-weight: 500;
}

.panel-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.property-group {
  margin-bottom: 32px;
}

.property-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--label-primary);
  margin-bottom: 16px;
  letter-spacing: -0.022em;
  text-transform: uppercase;
  opacity: 0.8;
}

.property-item {
  margin-bottom: 20px;
}

.property-label {
  font-size: 12px;
  color: var(--label-primary);
  margin-bottom: 8px;
  display: block;
  font-weight: 500;
}

/* 状态指示器 */
.status-indicator {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  display: inline-block;
}

.status-success {
  background: rgba(52, 199, 89, 0.2);
  color: var(--success-color);
}

.status-warning {
  background: rgba(255, 149, 0, 0.2);
  color: var(--warning-color);
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

::-webkit-scrollbar-track {
  background: var(--secondary-background);
  border-radius: 6px;
}

::-webkit-scrollbar-thumb {
  background: var(--quaternary-background);
  border-radius: 6px;
  border: 2px solid var(--secondary-background);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--separator-opaque);
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

@keyframes slideInFromBottom {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-in-bottom {
  animation: slideInFromBottom 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 响应式设计 */
@media (max-width: 1440px) {
  .left-sidebar { width: 260px; }
  .right-panel { width: 300px; }
}

@media (max-width: 1200px) {
  .left-sidebar { width: 240px; }
  .right-panel { width: 280px; }
  .preview-area { padding: 20px; }
}

@media (max-width: 1024px) {
  .left-sidebar { width: 220px; }
  .right-panel { width: 260px; }
  .timeline-container { height: 200px; }
}

@media (max-width: 768px) {
  .left-sidebar { width: 200px; }
  .right-panel { width: 240px; }
  .timeline-container { height: 180px; }
  .nav-tabs { display: none; }
  .header-right { gap: 6px; }
  .header-btn span { display: none; }
}
</style>
