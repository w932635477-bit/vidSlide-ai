<!--
  VidSlide AI - 工作空间
  Apple设计风格优化版本
  核心原则：Clarity, Depth, Deference, Fluidity
-->
<template>
  <div class="workspace">
    <!-- 全局错误处理器 -->
    <ErrorHandler ref="errorHandler" />

    <!-- 进度指示器 -->
    <ProgressIndicator
      :visible="showProgress"
      :current-stage-id="currentStage"
      :progress="progressValue"
      :estimated-time-remaining="estimatedTime"
      :can-cancel="canCancelProgress"
      @cancel="handleProgressCancel"
    />

    <!-- 头部工具栏 - 简洁毛玻璃效果 -->
    <header class="workspace-header">
      <div class="header-content">
        <div class="header-left">
          <div class="logo-section">
            <span class="logo-icon">🎬</span>
            <h1 class="workspace-title">VidSlide AI</h1>
          </div>
          <div class="header-actions-left">
            <button class="header-btn icon-btn" @click="newProject" :title="t('workspace.header.newProject')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>
            <button class="header-btn icon-btn" @click="openProject" :title="t('workspace.header.openProject')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
            </button>
            <button class="header-btn icon-btn" @click="saveProject" :title="t('workspace.header.save')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="header-right">
          <LanguageSwitcher />
          <ExportHandler
            ref="exportHandler"
            :can-export="canExport"
            :is-premium="isPremium"
            :duration="videoDuration"
            @export-started="handleExportStarted"
            @export-completed="handleExportCompleted"
          />
        </div>
      </div>
    </header>

    <!-- 主工作区 - 全宽布局 -->
    <main class="workspace-main">
      <!-- 主编辑区 -->
      <section class="main-editor">
        <!-- 视频上传器 -->
        <VideoUploader
          v-if="!videoSrc"
          @video-uploaded="handleVideoUploaded"
        />

        <!-- 编辑区域 - 视频和分析面板并排 -->
        <div v-else class="editor-area">
          <div class="editor-content-wrapper">
            <!-- 左侧：视频预览区 -->
            <div class="video-section" :class="{ 'vertical-video': isVerticalVideo }">
              <div class="editor-canvas">
                <video
                  v-if="videoSrc"
                  ref="videoElement"
                  :src="videoSrc"
                  class="preview-video"
                  :class="{ 'vertical': isVerticalVideo }"
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

                <!-- 视频控制覆盖层 -->
                <div class="video-controls-overlay" v-if="videoSrc">
                  <div class="video-info">
                    <span class="video-time">{{ formatTime(currentTime) }} / {{ formatTime(videoDuration) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 右侧：AI分析结果面板 -->
            <div class="analysis-sidebar" :class="{ 'analyzing': isAIAnalyzing }">
              <div class="sidebar-header">
                <h3>🧠 AI内容分析</h3>
                <button
                  v-if="!isAIAnalyzing && !aiAnalysisComplete"
                  class="start-analysis-btn"
                  @click="startAIAnalysis"
                >
                  🚀 智能分析
                </button>
                <span v-else-if="isAIAnalyzing" class="analyzing-status">
                  <span class="spinner">⟳</span> {{ currentAnalysisStep }}
                </span>
                <button v-else class="restart-analysis-btn" @click="restartAnalysis">
                  🔄 重新分析
                </button>
              </div>

              <!-- 可滚动的内容区域 -->
              <div class="analysis-sidebar-content">
                <!-- 分析进度 -->
                <div v-if="isAIAnalyzing" class="analysis-progress-section">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: aiAnalysisProgress + '%' }"></div>
                  </div>
                  <div class="progress-info">
                    <span class="progress-percent">{{ aiAnalysisProgress }}%</span>
                  </div>
                  <div class="analysis-tip" v-if="isSpeechRecognizing">
                    <span class="recording-indicator">🔴</span>
                    正在识别语音，请等待视频播放完成...
                  </div>
                </div>

                <!-- 关键帧提取结果 - 紧凑版 -->
                <div v-if="extractedKeyframes.length > 0" class="keyframes-section compact">
                  <div class="section-header">
                    <h4>📸 关键帧</h4>
                    <span class="section-count">{{ extractedKeyframes.length }}帧</span>
                  </div>
                  <div class="keyframes-scroll">
                    <div
                      v-for="(frame, index) in extractedKeyframes"
                      :key="index"
                      class="keyframe-item-compact"
                      @click="seekToTime(frame.time)"
                    >
                      <span class="frame-number">{{ index + 1 }}</span>
                      <span class="keyframe-time">{{ formatTime(frame.time) }}</span>
                    </div>
                  </div>
                </div>

                <!-- 语音识别结果 -->
                <div v-if="transcriptText || aiAnalysisComplete" class="transcript-section">
                  <div class="section-header">
                    <h4>🎤 语音转文字</h4>
                    <span class="section-status" v-if="isSpeechRecognizing">识别中...</span>
                    <button v-else-if="aiAnalysisComplete" class="edit-transcript-btn" @click="toggleTranscriptEdit">
                      {{ isEditingTranscript ? '完成' : '编辑' }}
                    </button>
                  </div>
                  <div v-if="!isEditingTranscript" class="transcript-content" v-html="highlightedTranscript || '暂无识别结果'"></div>
                  <div v-else class="transcript-edit-area">
                    <textarea
                      v-model="transcriptText"
                      class="transcript-textarea"
                      placeholder="请输入或粘贴视频文案内容..."
                      @input="onTranscriptEdit"
                    ></textarea>
                    <div class="transcript-edit-tip">
                      💡 提示：语音识别准确率受环境影响，您可以手动编辑或粘贴正确的文案
                    </div>
                  </div>
                </div>

                <!-- 提取的关键词 -->
                <div v-if="extractedKeywords.length > 0" class="keywords-section">
                  <div class="section-header">
                    <h4>🏷️ 关键词</h4>
                    <span class="section-count">{{ extractedKeywords.length }}个</span>
                  </div>
                  <div class="keywords-list">
                    <span
                      v-for="keyword in extractedKeywords"
                      :key="keyword.text"
                      class="keyword-tag"
                      :class="{ 'highlight': keyword.importance >= 0.8 }"
                    >
                      {{ keyword.text }}
                    </span>
                  </div>
                </div>

                <!-- 空状态 -->
                <div v-if="!isAIAnalyzing && !aiAnalysisComplete" class="empty-analysis">
                  <div class="empty-icon">🎬</div>
                  <p>点击"智能分析"自动完成以下任务：</p>
                  <ul class="feature-list">
                    <li>📸 智能关键帧提取</li>
                    <li>🎤 语音识别转文字</li>
                    <li>🏷️ 关键词自动提取</li>
                    <li>💡 重点内容高亮</li>
                  </ul>
                </div>
              </div><!-- 关闭 analysis-sidebar-content -->
            </div><!-- 关闭 analysis-sidebar -->
          </div><!-- 关闭 editor-content-wrapper -->

          <!-- 工作流程指示器 -->
          <div class="workflow-indicator">
            <div
              v-for="(step, index) in workflowSteps"
              :key="step.id"
              class="workflow-step"
              :class="{
                active: currentWorkflowStep === step.id,
                completed: isStepCompleted(step.id),
                clickable: canNavigateToStep(step.id)
              }"
              @click="navigateToStep(step.id)"
            >
              <div class="step-icon">
                <svg v-if="isStepCompleted(step.id)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span v-else>{{ index + 1 }}</span>
              </div>
              <span class="step-label">{{ step.label }}</span>
              <div v-if="index < workflowSteps.length - 1" class="step-connector"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- 底部工具面板 - 标签页形式 -->
      <section class="bottom-panel" :class="{ collapsed: isPanelCollapsed }">
        <div class="panel-header">
          <div class="panel-tabs">
            <button
              v-for="tab in panelTabs"
              :key="tab.id"
              class="panel-tab"
              :class="{ active: activeTab === tab.id }"
              @click="activeTab = tab.id"
            >
              <span class="tab-icon">{{ tab.icon }}</span>
              <span class="tab-label">{{ tab.label }}</span>
            </button>
          </div>
          <button class="panel-toggle" @click="isPanelCollapsed = !isPanelCollapsed">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline :points="isPanelCollapsed ? '18 15 12 9 6 15' : '6 9 12 15 18 9'"/>
            </svg>
          </button>
        </div>

        <div class="panel-content" v-show="!isPanelCollapsed">
          <!-- AI内容分析标签页 -->
          <div v-if="activeTab === 'analysis'" class="tab-content analysis-tab">
            <AIContentAnalyzer
              ref="aiAnalyzerRef"
              :video-src="videoSrc"
              :video-duration="videoDuration"
              @analysis-complete="handleAnalysisComplete"
              @analysis-error="handleAnalysisError"
              @analysis-progress="handleAnalysisProgress"
            />
          </div>

          <!-- 素材需求分析标签页 -->
          <div v-if="activeTab === 'materials'" class="tab-content materials-tab">
            <MaterialRequirementAnalyzer
              ref="materialAnalyzerRef"
              :keywords="materialAnalyzerKeywords"
              :keyframes="materialAnalyzerKeyframes"
              :video-content="transcriptText"
              :auto-analyze="false"
              @requirement-selected="handleRequirementSelected"
              @material-search-requested="handleMaterialSearchRequested"
              @canvas-add-requested="handleCanvasAddRequested"
              @analysis-started="handleMaterialAnalysisStarted"
              @analysis-completed="handleMaterialAnalysisCompleted"
            />
          </div>

          <!-- 模板选择标签页 -->
          <div v-if="activeTab === 'templates'" class="tab-content templates-tab">
            <div class="templates-grid">
              <div
                v-for="template in templates"
                :key="template.id"
                class="template-card"
                :class="{ selected: selectedTemplate?.id === template.id }"
                @click="handleTemplateSelected(template)"
              >
                <div class="template-preview">
                  <span class="template-icon">{{ template.icon }}</span>
                </div>
                <div class="template-info">
                  <span class="template-name">{{ template.name }}</span>
                  <span class="template-desc">{{ template.description }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 画中画设置标签页 -->
          <div v-if="activeTab === 'pip'" class="tab-content pip-tab">
            <PictureInPicture
              :pip-enabled="pipEnabled"
              :pip-settings="pipSettings"
              @settings-changed="handlePipSettingsChanged"
            />
          </div>

          <!-- 动画效果标签页 -->
          <div v-if="activeTab === 'animations'" class="tab-content animations-tab">
            <div class="animations-grid">
              <button class="animation-card" @click="addFadeEffect">
                <span class="animation-icon">✨</span>
                <span class="animation-name">{{ t('workspace.animations.fade') }}</span>
              </button>
              <button class="animation-card" @click="addSlideEffect">
                <span class="animation-icon">➡️</span>
                <span class="animation-name">{{ t('workspace.animations.slide') }}</span>
              </button>
              <button class="animation-card" @click="addZoomEffect">
                <span class="animation-icon">🔍</span>
                <span class="animation-name">{{ t('workspace.animations.zoom') }}</span>
              </button>
              <button class="animation-card danger" @click="clearAnimations">
                <span class="animation-icon">🗑️</span>
                <span class="animation-name">{{ t('workspace.animations.clear') }}</span>
              </button>
            </div>
          </div>

          <!-- AI建议标签页 -->
          <div v-if="activeTab === 'ai'" class="tab-content ai-tab">
            <div class="ai-suggestions">
              <div class="ai-suggestion-card" v-if="!selectedTemplate || selectedTemplate.id !== 'pip'">
                <span class="suggestion-icon">💡</span>
                <span class="suggestion-text">{{ t('workspace.ai.suggestions.pip') }}</span>
                <button class="suggestion-action" @click="handleTemplateSelected(templates.find(t => t.id === 'pip'))">
                  应用
                </button>
              </div>
              <div class="ai-suggestion-card">
                <span class="suggestion-icon">📊</span>
                <span class="suggestion-text">{{ t('workspace.ai.suggestions.chart') }}</span>
              </div>
              <div class="ai-suggestion-card">
                <span class="suggestion-icon">🎨</span>
                <span class="suggestion-text">{{ t('workspace.ai.suggestions.color') }}</span>
              </div>
            </div>
          </div>

          <!-- 用户调整标签页 -->
          <div v-if="activeTab === 'adjust'" class="tab-content adjust-tab">
            <UserAdjustmentPanel
              v-if="selectedTemplate"
              :template="selectedTemplate"
              :content-data="contentData"
              @content-updated="handleContentUpdated"
            />
            <div v-else class="empty-state">
              <span class="empty-icon">📝</span>
              <span class="empty-text">请先选择模板</span>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 时间轴组件 -->
    <Timeline
      :duration="videoDuration"
      :current-time="currentTime"
      :markers="timelineMarkers"
      :selected-marker-id="selectedMarkerId"
      @marker-added="handleMarkerAdded"
      @marker-removed="handleMarkerRemoved"
      @marker-selected="handleMarkerSelected"
      @marker-moved="handleMarkerMoved"
      @markers-cleared="handleMarkersCleared"
    />
  </div>
</template>

<script setup name="WorkspaceView">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'

// 导入组件
import VideoUploader from '../components/VideoUploader.vue'
import Timeline from '../components/Timeline.vue'
import ProgressIndicator from '../components/ProgressIndicator.vue'
import PictureInPicture from '../components/PictureInPicture.vue'
import UserAdjustmentPanel from '../components/UserAdjustmentPanel.vue'
import ExportHandler from '../components/ExportHandler.vue'
import ErrorHandler from '../components/ErrorHandler.vue'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'
import AIContentAnalyzer from '../components/AIContentAnalyzer.vue'
import MaterialRequirementAnalyzer from '../components/MaterialRequirementAnalyzer.vue'

// 导入素材服务
import MaterialService from '../services/MaterialService.js'

// 导入语音识别服务
import { getSpeechRecognitionService } from '../services/SpeechRecognitionService.js'
import { getBaiduSpeechService } from '../services/BaiduSpeechService.js'

// 响应式状态
const videoSrc = ref('')
const videoFile = ref(null) // 保存原始视频文件用于语音识别
const selectedTemplate = ref(null)
const pipEnabled = ref(false)
const videoElement = ref(null)
const videoDuration = ref(0)
const currentTime = ref(0)
const isPlaying = ref(false)
const animations = ref([])
const projectData = ref(null)

// 视频尺寸相关状态
const videoWidth = ref(0)
const videoHeight = ref(0)
const isVerticalVideo = computed(() => videoHeight.value > videoWidth.value)

// 当检测到竖版视频时，自动折叠底部面板以腾出更多空间
const autoCollapseForVerticalVideo = () => {
  if (isVerticalVideo.value) {
    isPanelCollapsed.value = true
  }
}

// 使用vue-i18n
const { t } = useI18n()

// 新布局相关状态
const isPanelCollapsed = ref(false)
const activeTab = ref('analysis')
const currentWorkflowStep = ref('upload')

// 工作流程步骤
const workflowSteps = computed(() => [
  { id: 'upload', label: '上传' },
  { id: 'analyze', label: '分析' },
  { id: 'template', label: '模板' },
  { id: 'effect', label: '效果' },
  { id: 'preview', label: '预览' },
  { id: 'export', label: '导出' }
])

// 底部面板标签页
const panelTabs = computed(() => [
  { id: 'analysis', label: 'AI分析', icon: '🧠' },
  { id: 'materials', label: '素材需求', icon: '📦' },
  { id: 'templates', label: t('workspace.status.template'), icon: '📋' },
  { id: 'pip', label: t('workspace.status.pip'), icon: '📺' },
  { id: 'animations', label: t('workspace.animations.title'), icon: '✨' },
  { id: 'ai', label: t('workspace.ai.title'), icon: '🤖' },
  { id: 'adjust', label: '调整', icon: '⚙️' }
])

// 进度相关状态
const showProgress = ref(false)
const currentStage = ref('analyze')
const progressValue = ref(0)
const estimatedTime = ref(0)
const canCancelProgress = ref(true)

// 导出相关状态
const canExport = ref(false)
const isPremium = ref(false)

// 内容数据
const contentData = ref({
  textContent: [],
  imageUrls: [],
  chartData: null
})

// AI分析相关状态
const aiAnalyzerRef = ref(null)
const materialAnalyzerRef = ref(null)
const analysisResults = ref(null)
const isAIAnalyzing = ref(false)
const aiAnalysisComplete = ref(false)
const aiAnalysisProgress = ref(0)
const currentAnalysisStep = ref('')
const extractedKeyframes = ref([])
const transcriptText = ref('')
const extractedKeywords = ref([])

// 语音识别相关状态
const isSpeechRecognizing = ref(false)
const speechService = ref(null)
const isEditingTranscript = ref(false)

// 切换转录文本编辑模式
const toggleTranscriptEdit = async () => {
  isEditingTranscript.value = !isEditingTranscript.value
  // 如果退出编辑模式，重新提取关键词
  if (!isEditingTranscript.value && transcriptText.value) {
    if (speechService.value) {
      try {
        const keywords = await speechService.value.extractKeywords(transcriptText.value)
        extractedKeywords.value = Array.isArray(keywords) ? keywords : []
      } catch (error) {
        console.error('关键词提取失败:', error)
      }
    }
  }
}

// 转录文本编辑时的处理
const onTranscriptEdit = () => {
  // 实时更新关键词（防抖处理）
  if (transcriptEditTimer) {
    clearTimeout(transcriptEditTimer)
  }
  transcriptEditTimer = setTimeout(async () => {
    if (speechService.value && transcriptText.value) {
      try {
        const keywords = await speechService.value.extractKeywords(transcriptText.value)
        extractedKeywords.value = Array.isArray(keywords) ? keywords : []
      } catch (error) {
        console.error('关键词提取失败:', error)
      }
    }
  }, 500)
}

let transcriptEditTimer = null

// 高亮关键词的转录文本（保留用于未来功能）
const highlightedTranscript = computed(() => {
  if (!transcriptText.value || extractedKeywords.value.length === 0) {
    return transcriptText.value
  }

  let result = transcriptText.value
  const sortedKeywords = [...extractedKeywords.value]
    .filter(k => k.importance >= 0.7)
    .sort((a, b) => b.importance - a.importance)

  sortedKeywords.forEach(keyword => {
    const regex = new RegExp(`(${keyword.text})`, 'gi')
    result = result.replace(regex, '<mark class="keyword-highlight">$1</mark>')
  })

  return result
})

// 跳转到指定时间
const seekToTime = (time) => {
  if (videoElement.value) {
    videoElement.value.currentTime = time
  }
}

// 开始语音识别
const startSpeechRecognition = () => {
  if (!speechService.value) {
    speechService.value = getSpeechRecognitionService()
  }

  if (!speechService.value.isSupported) {
    ElMessage.error('您的浏览器不支持语音识别，请使用Chrome浏览器')
    return
  }

  isSpeechRecognizing.value = true
  ElMessage.info('语音识别已启动，请播放视频或对着麦克风说话')

  speechService.value.start(
    // 实时结果回调
    (result) => {
      transcriptText.value = result.fullText
    },
    // 结束回调
    (result) => {
      isSpeechRecognizing.value = false
      if (result.error) {
        ElMessage.error(`语音识别错误: ${result.error}`)
      } else if (result.text) {
        extractedKeywords.value = result.keywords || []
        ElMessage.success('语音识别完成')
      }
    }
  )
}

// 停止语音识别
const stopSpeechRecognition = () => {
  if (speechService.value) {
    speechService.value.stop()
  }
  isSpeechRecognizing.value = false
  ElMessage.info('语音识别已停止')
}

// 手动输入文字时的处理
const onTranscriptInput = () => {
  // 清空之前的关键词，等待用户点击提取
  // extractedKeywords.value = []
}

// 从文本中提取关键词
const extractKeywordsFromText = async () => {
  if (!transcriptText.value || transcriptText.value.length < 10) {
    ElMessage.warning('请先输入或识别足够的文字内容')
    return
  }

  if (!speechService.value) {
    speechService.value = getSpeechRecognitionService()
  }

  try {
    const keywords = await speechService.value.extractKeywords(transcriptText.value)
    extractedKeywords.value = Array.isArray(keywords) ? keywords : []

    if (extractedKeywords.value.length > 0) {
      ElMessage.success(`成功提取 ${extractedKeywords.value.length} 个关键词`)
    } else {
      ElMessage.warning('未能提取到有效关键词，请输入更多内容')
    }
  } catch (error) {
    console.error('关键词提取失败:', error)
    extractedKeywords.value = []
    ElMessage.error('关键词提取失败')
  }
}

// 重新开始分析
const restartAnalysis = () => {
  aiAnalysisComplete.value = false
  transcriptText.value = ''
  extractedKeywords.value = []
  extractedKeyframes.value = []
  startAIAnalysis()
}

// 开始AI分析 - 全自动流程
const startAIAnalysis = async () => {
  if (isAIAnalyzing.value || !videoSrc.value) return

  isAIAnalyzing.value = true
  aiAnalysisComplete.value = false
  aiAnalysisProgress.value = 0
  extractedKeyframes.value = []
  transcriptText.value = ''
  extractedKeywords.value = []

  try {
    // 步骤1: 关键帧提取 (0-20%)
    currentAnalysisStep.value = '提取关键帧...'
    await simulateAnalysisStep(0, 20, 1500)
    extractedKeyframes.value = generateMockKeyframes()

    // 步骤2: 语音识别 (20-80%)
    currentAnalysisStep.value = '语音识别中...'
    aiAnalysisProgress.value = 20
    isSpeechRecognizing.value = true

    // 尝试使用百度语音识别API（更准确）
    const baiduService = getBaiduSpeechService()

    if (baiduService.isSupported() && videoFile.value) {
      // 使用百度语音识别API
      currentAnalysisStep.value = '正在提取音频并识别...'

      try {
        const recognizedText = await baiduService.transcribeVideo(videoFile.value, (progress) => {
          // 更新进度 (20-80%)
          aiAnalysisProgress.value = 20 + Math.round(progress * 60)
        })

        if (recognizedText) {
          transcriptText.value = recognizedText
          // 初始化speechService用于关键词提取
          if (!speechService.value) {
            speechService.value = getSpeechRecognitionService()
          }
          try {
            const keywords = await speechService.value.extractKeywords(recognizedText)
            extractedKeywords.value = Array.isArray(keywords) ? keywords : []
          } catch (error) {
            console.error('关键词提取失败:', error)
            extractedKeywords.value = []
          }
        } else {
          transcriptText.value = '【提示】未能识别到语音内容，视频可能没有音频或音频质量较差。'
        }
      } catch (baiduError) {
        console.warn('百度语音识别失败，尝试使用Web Speech API:', baiduError)
        // 回退到Web Speech API
        await fallbackToWebSpeechAPI()
      }
    } else if (!baiduService.isConfigured) {
      // 百度API未配置，使用Web Speech API
      console.log('百度语音API未配置，使用Web Speech API')
      await fallbackToWebSpeechAPI()
    } else {
      // 没有视频文件，跳过语音识别
      transcriptText.value = '【提示】无法进行语音识别，请重新上传视频。'
      await simulateAnalysisStep(20, 80, 1000)
    }

    isSpeechRecognizing.value = false
    aiAnalysisProgress.value = 80

    // 步骤3: 提取关键词 (80-95%)
    currentAnalysisStep.value = '提取关键词...'
    await simulateAnalysisStep(80, 95, 800)

    // 如果有转录文本但没有关键词，尝试提取
    if (transcriptText.value && extractedKeywords.value.length === 0 && !transcriptText.value.startsWith('【')) {
      if (!speechService.value) {
        speechService.value = getSpeechRecognitionService()
      }
      try {
        const keywords = await speechService.value.extractKeywords(transcriptText.value)
        extractedKeywords.value = Array.isArray(keywords) ? keywords : []
      } catch (error) {
        console.error('关键词提取失败:', error)
        extractedKeywords.value = []
      }
    }

    // 步骤4: 完成 (95-100%)
    currentAnalysisStep.value = '完成'
    await simulateAnalysisStep(95, 100, 500)

    aiAnalysisComplete.value = true
    currentWorkflowStep.value = 'analyze'

    if (transcriptText.value && !transcriptText.value.startsWith('【')) {
      ElMessage.success('智能分析完成！')
    } else {
      ElMessage.warning('分析完成，语音识别可能不完整')
    }

  } catch (error) {
    ElMessage.error('分析过程中发生错误: ' + error.message)
    console.error('AI分析错误:', error)

    // 停止语音识别
    if (speechService.value) {
      speechService.value.stop()
    }
    isSpeechRecognizing.value = false
  } finally {
    isAIAnalyzing.value = false
  }
}

// 回退到Web Speech API（通过麦克风识别）
const fallbackToWebSpeechAPI = async () => {
  // 初始化语音识别服务
  if (!speechService.value) {
    speechService.value = getSpeechRecognitionService()
  }

  if (speechService.value.isSupported && videoElement.value) {
    // 设置语音识别回调
    speechService.value.start(
      // 实时结果回调
      (result) => {
        transcriptText.value = result.fullText
      },
      // 结束回调
      async (result) => {
        if (result.text) {
          transcriptText.value = result.text
          try {
            const keywords = await speechService.value.extractKeywords(result.text)
            extractedKeywords.value = Array.isArray(keywords) ? keywords : []
          } catch (error) {
            console.error('关键词提取失败:', error)
            extractedKeywords.value = []
          }
        }
      }
    )

    // 播放视频
    videoElement.value.currentTime = 0
    videoElement.value.volume = 1
    await videoElement.value.play()

    // 等待视频播放完成或超时
    const maxWaitTime = (videoDuration.value + 5) * 1000
    const startTime = Date.now()

    await new Promise((resolve) => {
      const checkProgress = () => {
        const elapsed = Date.now() - startTime
        const videoProgress = videoElement.value ? videoElement.value.currentTime / videoDuration.value : 0

        // 更新进度 (20-80%)
        aiAnalysisProgress.value = 20 + Math.round(videoProgress * 60)

        if (videoElement.value?.ended || elapsed > maxWaitTime) {
          resolve()
        } else {
          requestAnimationFrame(checkProgress)
        }
      }
      checkProgress()
    })

    // 停止语音识别
    speechService.value.stop()

    // 暂停视频
    if (videoElement.value) {
      videoElement.value.pause()
      videoElement.value.currentTime = 0
    }
  } else {
    // 浏览器不支持语音识别
    transcriptText.value = '【提示】您的浏览器不支持语音识别功能，请使用Chrome浏览器获得最佳体验，或配置百度语音API。'
    await simulateAnalysisStep(20, 80, 1000)
  }
}

// 模拟分析步骤进度
const simulateAnalysisStep = (startProgress, endProgress, duration) => {
  return new Promise((resolve) => {
    const startTime = Date.now()
    const updateProgress = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      aiAnalysisProgress.value = Math.round(startProgress + (endProgress - startProgress) * progress)

      if (progress < 1) {
        requestAnimationFrame(updateProgress)
      } else {
        resolve()
      }
    }
    updateProgress()
  })
}

// 生成模拟关键帧数据
const generateMockKeyframes = () => {
  const duration = videoDuration.value || 60
  const frameCount = Math.min(Math.floor(duration / 10) + 1, 8)
  const frames = []

  for (let i = 0; i < frameCount; i++) {
    frames.push({
      time: (duration / frameCount) * i,
      type: i === 0 ? '开场' : i === frameCount - 1 ? '结尾' : '内容'
    })
  }

  return frames
}

// 生成模拟转录文本
const generateMockTranscript = () => {
  return '大家好，欢迎来到VidSlide AI的演示视频。在这个视频中，我们将展示如何使用人工智能技术将普通的视频内容自动转换为专业的演示文稿。这个过程非常简单，只需要几个步骤即可完成。首先上传您的视频文件，然后AI会自动分析视频内容，提取关键信息，最后生成结构化的演示文稿。整个过程完全在浏览器中完成，确保了数据的安全性和隐私性。我们的智能算法能够识别视频中的重要场景，提取语音内容，并自动生成关键词标签。'
}

// 生成模拟关键词数据
const generateMockKeywords = () => {
  return [
    { text: '人工智能', importance: 0.95 },
    { text: '演示文稿', importance: 0.88 },
    { text: '视频转换', importance: 0.85 },
    { text: '智能分析', importance: 0.82 },
    { text: '关键信息', importance: 0.78 },
    { text: '数据安全', importance: 0.75 },
    { text: '浏览器', importance: 0.70 },
    { text: '自动生成', importance: 0.68 },
    { text: '语音内容', importance: 0.65 },
    { text: '场景识别', importance: 0.62 }
  ]
}

// AI分析事件处理
const handleAnalysisComplete = (results) => {
  analysisResults.value = results
  currentWorkflowStep.value = 'template'
  ElMessage.success('AI内容分析完成')
}

const handleAnalysisError = (error) => {
  ElMessage.error(`分析失败: ${error}`)
}

const handleAnalysisProgress = ({ progress, step }) => {
  console.log(`分析进度: ${progress}% - ${step}`)
}

// ============================================
// 素材需求分析相关
// ============================================

// 转换关键词格式供MaterialRequirementAnalyzer使用
const materialAnalyzerKeywords = computed(() => {
  if (!extractedKeywords.value || !Array.isArray(extractedKeywords.value)) {
    return []
  }
  return extractedKeywords.value.map(k => ({
    text: k.text,
    importance: k.importance
  }))
})

// 转换关键帧格式供MaterialRequirementAnalyzer使用
const materialAnalyzerKeyframes = computed(() => {
  if (!extractedKeyframes.value || !Array.isArray(extractedKeyframes.value)) {
    return []
  }
  return extractedKeyframes.value.map((frame, index) => ({
    id: `frame-${index}`,
    timestamp: frame.time,
    importance: 0.7 + (index === 0 || index === extractedKeyframes.value.length - 1 ? 0.2 : 0)
  }))
})

// 素材需求选择事件
const handleRequirementSelected = (selectedRequirements) => {
  console.log('选中的素材需求:', selectedRequirements)
}

// 素材搜索请求事件
const handleMaterialSearchRequested = async (requirement) => {
  console.log('搜索素材请求:', requirement)

  try {
    // 初始化素材服务
    await MaterialService.initialize()

    // 构建搜索关键词
    const searchKeyword = requirement.relatedKeywords?.[0] || requirement.title

    // 执行搜索
    const results = await MaterialService.searchMaterials(searchKeyword, {
      limit: 20,
      context: {
        type: requirement.type,
        priority: requirement.priority
      }
    })

    if (results.success && results.materials.length > 0) {
      ElMessage.success(`找到 ${results.materials.length} 个相关素材`)
      console.log('搜索结果:', results.materials)
      // TODO: 显示素材选择弹窗
    } else {
      ElMessage.warning('未找到相关素材，请尝试其他关键词')
    }
  } catch (error) {
    console.error('素材搜索失败:', error)
    ElMessage.error('素材搜索失败: ' + error.message)
  }
}

// 添加到画布请求事件
const handleCanvasAddRequested = (requirement) => {
  console.log('添加到画布请求:', requirement)
  ElMessage.info(`素材需求"${requirement.title}"已添加到待处理列表`)
  // TODO: 实现实际的画布添加逻辑
}

// 素材分析开始事件
const handleMaterialAnalysisStarted = () => {
  console.log('素材需求分析开始')
}

// 素材分析完成事件
const handleMaterialAnalysisCompleted = (requirements) => {
  console.log('素材需求分析完成:', requirements)
  ElMessage.success(`分析完成，发现 ${requirements.length} 个素材需求`)
}

// 工作流程辅助方法
const isStepCompleted = (stepId) => {
  const stepOrder = ['upload', 'analyze', 'template', 'effect', 'preview', 'export']
  const currentIndex = stepOrder.indexOf(currentWorkflowStep.value)
  const stepIndex = stepOrder.indexOf(stepId)
  return stepIndex < currentIndex
}

const canNavigateToStep = (stepId) => {
  const stepOrder = ['upload', 'analyze', 'template', 'effect', 'preview', 'export']
  const currentIndex = stepOrder.indexOf(currentWorkflowStep.value)
  const stepIndex = stepOrder.indexOf(stepId)
  return stepIndex <= currentIndex
}

const navigateToStep = (stepId) => {
  if (canNavigateToStep(stepId)) {
    currentWorkflowStep.value = stepId
  }
}

// 时间格式化
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 事件处理函数
const handleVideoUploaded = (file) => {
  videoSrc.value = URL.createObjectURL(file)
  videoFile.value = file // 保存原始文件用于语音识别
  canExport.value = true
  currentWorkflowStep.value = 'analyze'
  ElMessage.success(t('workspace.upload.uploadSuccess'))
}

const handleTemplateSelected = (template) => {
  selectedTemplate.value = template
  pipEnabled.value = template.id === 'pip'
  if (currentWorkflowStep.value === 'analyze' || currentWorkflowStep.value === 'template') {
    currentWorkflowStep.value = 'effect'
  }
  ElMessage.info(`${t('workspace.status.selected')}: ${template.name}`)
}

const handlePipSettingsChanged = (settings) => {
  pipSettings.value = { ...pipSettings.value, ...settings }
}

const handleContentUpdated = (data) => {
  contentData.value = { ...contentData.value, ...data }
}

const handleMarkerAdded = (marker) => {
  timelineMarkers.value.push(marker)
  ElMessage.success(t('workspace.timeline.markerAdded'))
}

const handleMarkerRemoved = (markerId) => {
  const index = timelineMarkers.value.findIndex(m => m.id === markerId)
  if (index > -1) {
    timelineMarkers.value.splice(index, 1)
  }
}

const handleMarkerSelected = (markerId) => {
  selectedMarkerId.value = markerId
}

const handleMarkerMoved = (data) => {
  const marker = timelineMarkers.value.find(m => m.id === data.id)
  if (marker) {
    marker.time = data.newTime
  }
}

const handleMarkersCleared = () => {
  timelineMarkers.value = []
  selectedMarkerId.value = null
}

const handleExportStarted = (exportData) => {
  showProgress.value = true
  currentStage.value = 'render'
  progressValue.value = 0
  estimatedTime.value = Math.ceil(videoDuration.value * 0.1)
}

const handleExportCompleted = (result) => {
  showProgress.value = false
  ElMessage.success(t('workspace.export.exportSuccess'))
}

const handleProgressCancel = () => {
  showProgress.value = false
  ElMessage.info(t('workspace.export.exportCancelled'))
}

// 生命周期钩子（vue-i18n自动处理语言变化）
onMounted(() => {
  // 初始化逻辑
})

onUnmounted(() => {
  // 清理逻辑
})

// 模板数据 - 使用计算属性以便响应语言变化
const templates = computed(() => [
  {
    id: 'pip',
    name: t('workspace.templates.pip.name'),
    description: t('workspace.templates.pip.desc'),
    icon: '📺'
  },
  {
    id: 'info-card',
    name: t('workspace.templates.infoCard.name'),
    description: t('workspace.templates.infoCard.desc'),
    icon: '📊'
  },
  {
    id: 'keyword',
    name: t('workspace.templates.keyword.name'),
    description: t('workspace.templates.keyword.desc'),
    icon: '🔍'
  },
  {
    id: 'document',
    name: t('workspace.templates.document.name'),
    description: t('workspace.templates.document.desc'),
    icon: '📄'
  },
  {
    id: 'title',
    name: t('workspace.templates.title.name'),
    description: t('workspace.templates.title.desc'),
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
  ElMessageBox.confirm(
    t('workspace.timeline.confirmNewProject'),
    t('workspace.timeline.confirmTitle'),
    {
      confirmButtonText: t('workspace.timeline.confirm'),
      cancelButtonText: t('workspace.timeline.cancel'),
      type: 'warning'
    }
  ).then(() => {
    resetWorkspace()
    ElMessage.success(t('workspace.timeline.successNewProject'))
  }).catch(() => {
    // 用户取消
  })
}

const openProject = () => {
  // 创建文件输入元素
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.vsp,.json' // VidSlide Project 格式
  input.onchange = async (event) => {
    const file = event.target.files[0]
    if (file) {
      try {
        const text = await file.text()
        const data = JSON.parse(text)

        // 验证项目文件格式
        if (!data.version || !data.type || data.type !== 'vidslide-project') {
          throw new Error(t('workspace.timeline.errorInvalidFormat'))
        }

        // 加载项目数据
        projectData.value = data
        selectedTemplate.value = data.template || null
        pipSettings.value = data.pipSettings || pipSettings.value
        timelineMarkers.value = data.markers || []
        animations.value = data.animations || []
        pipEnabled.value = data.pipEnabled || false

        const projectName = data.name || t('workspace.timeline.unnamed')
        ElMessage.success(t('workspace.timeline.successLoadProject').replace('{name}', projectName))
      } catch (error) {
        ElMessage.error(t('workspace.timeline.errorLoadProject') + ': ' + error.message)
      }
    }
  }
  input.click()
}

const saveProject = () => {
  // 构建项目数据
  const data = {
    version: '1.0',
    type: 'vidslide-project',
    name: projectData.value?.name || t('workspace.timeline.unnamed'),
    createdAt: projectData.value?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    template: selectedTemplate.value,
    pipSettings: pipSettings.value,
    pipEnabled: pipEnabled.value,
    markers: timelineMarkers.value,
    animations: animations.value,
    videoInfo: videoSrc.value ? {
      duration: videoDuration.value,
      hasVideo: true
    } : null
  }

  // 创建下载链接
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${data.name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}.vsp`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  ElMessage.success(t('workspace.timeline.successSaveProject'))
}

const selectTemplate = (template) => {
  selectedTemplate.value = template
  pipEnabled.value = template.id === 'pip'
  ElMessage.info(`${t('workspace.status.selected')}: ${template.name}`)
}

const handleVideoUpload = (event) => {
  const file = event.target.files[0]
  if (file) {

    // 验证文件类型
    if (!file.type.startsWith('video/')) {
      ElMessage.error('请选择有效的视频文件')
      return
    }

    // 验证文件大小 (500MB)
    if (file.size > 500 * 1024 * 1024) {
      ElMessage.error('文件过大，请选择小于500MB的文件')
      return
    }

    const url = URL.createObjectURL(file)
    videoSrc.value = url
    ElMessage.success('视频加载成功')
  }
}

const onVideoLoaded = () => {
  if (videoElement.value) {
    videoDuration.value = videoElement.value.duration

    // 获取视频原始尺寸
    videoWidth.value = videoElement.value.videoWidth
    videoHeight.value = videoElement.value.videoHeight

    const aspectRatio = videoWidth.value / videoHeight.value
    const orientation = isVerticalVideo.value ? '竖版' : '横版'
    console.log(`视频加载完成 - 时长: ${videoDuration.value}秒, 尺寸: ${videoWidth.value}x${videoHeight.value}, 比例: ${aspectRatio.toFixed(2)}, 方向: ${orientation}`)

    // 竖版视频自动折叠底部面板以获得更多显示空间
    autoCollapseForVerticalVideo()

    // 更新进度条
    videoElement.value.addEventListener('timeupdate', () => {
      if (videoElement.value) {
        currentTime.value = videoElement.value.currentTime
        currentProgress.value = (currentTime.value / videoDuration.value) * 100
      }
    })

    videoElement.value.addEventListener('play', () => {
      isPlaying.value = true
    })

    videoElement.value.addEventListener('pause', () => {
      isPlaying.value = false
    })
  }
}

const previewVideo = () => {
  if (!videoSrc.value) {
    ElMessage.warning('请先上传视频')
    return
  }

  if (!selectedTemplate.value) {
    ElMessage.warning('请先选择模板')
    return
  }

  // 打开预览模式
  if (videoElement.value) {
    if (isPlaying.value) {
      videoElement.value.pause()
      ElMessage.info('预览已暂停')
    } else {
      videoElement.value.play()
      ElMessage.success('开始预览')
    }
  }
}

const exportVideo = async () => {
  if (!videoSrc.value) {
    ElMessage.warning('请先上传视频')
    return
  }

  if (!selectedTemplate.value) {
    ElMessage.warning('请先选择模板')
    return
  }

  // 显示导出选项对话框
  try {
    const { value: format } = await ElMessageBox.prompt(
      '请选择导出格式 (输入: mp4, pptx, html)',
      '导出项目',
      {
        confirmButtonText: '导出',
        cancelButtonText: '取消',
        inputValue: 'mp4',
        inputPattern: /^(mp4|pptx|html)$/,
        inputErrorMessage: '请输入有效的格式: mp4, pptx, html'
      }
    )

    ElMessage.info(`正在导出为 ${format.toUpperCase()} 格式...`)

    // 模拟导出过程
    setTimeout(() => {
      ElMessage.success(`导出完成！格式: ${format.toUpperCase()}`)
    }, 2000)

  } catch {
    // 用户取消
  }
}

const togglePip = () => {
  pipEnabled.value = !pipEnabled.value
}

const addFadeEffect = () => {
  const effect = {
    id: Date.now(),
    type: 'fade',
    name: '淡入效果',
    duration: 1000,
    startTime: currentTime.value
  }
  animations.value.push(effect)
  ElMessage.success('已添加淡入效果')
}

const addSlideEffect = () => {
  const effect = {
    id: Date.now(),
    type: 'slide',
    name: '滑入效果',
    duration: 800,
    direction: 'left',
    startTime: currentTime.value
  }
  animations.value.push(effect)
  ElMessage.success('已添加滑入效果')
}

const addZoomEffect = () => {
  const effect = {
    id: Date.now(),
    type: 'zoom',
    name: '缩放效果',
    duration: 600,
    scale: 1.2,
    startTime: currentTime.value
  }
  animations.value.push(effect)
  ElMessage.success('已添加缩放效果')
}

const clearAnimations = () => {
  if (animations.value.length === 0) {
    ElMessage.info('当前没有动画效果')
    return
  }

  ElMessageBox.confirm(
    `确定要清除所有 ${animations.value.length} 个动画效果吗？`,
    '清除动画',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    animations.value = []
    ElMessage.success('已清除所有动画效果')
  }).catch(() => {
    // 用户取消
  })
}

const addMarker = () => {
  const newId = Math.max(0, ...timelineMarkers.value.map(m => m.id)) + 1
  const position = currentProgress.value || Math.random() * 80 + 10
  timelineMarkers.value.push({
    id: newId,
    position: position
  })
  ElMessage.success('已添加标记点')
}

const removeMarker = () => {
  if (selectedMarkerId.value) {
    const index = timelineMarkers.value.findIndex(m => m.id === selectedMarkerId.value)
    if (index > -1) {
      timelineMarkers.value.splice(index, 1)
      selectedMarkerId.value = null
      ElMessage.success('已删除标记点')
    }
  } else {
    ElMessage.warning('请先选择要删除的标记点')
  }
}

const selectMarker = (marker) => {
  selectedMarkerId.value = marker.id
  // 跳转到标记位置
  if (videoElement.value && videoDuration.value) {
    const targetTime = (marker.position / 100) * videoDuration.value
    videoElement.value.currentTime = targetTime
  }
}

const resetWorkspace = () => {
  // 释放视频资源
  if (videoSrc.value) {
    URL.revokeObjectURL(videoSrc.value)
  }

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
  animations.value = []
  projectData.value = null
  videoDuration.value = 0
  currentTime.value = 0
  isPlaying.value = false
}

// 生命周期
onMounted(() => {
  console.log('WorkspaceView mounted')
})

onUnmounted(() => {
  // 清理资源
  if (videoSrc.value) {
    URL.revokeObjectURL(videoSrc.value)
  }
})
</script>

<style scoped>
/* ===========================================
   VidSlide AI - 工作空间
   Apple设计风格优化版本 v2.0
   核心原则：Clarity, Depth, Deference, Fluidity
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
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', sans-serif;
  background: linear-gradient(180deg, #F5F5F7 0%, #FFFFFF 100%);
  color: #1D1D1F;
  overflow: hidden;
}

/* ==========================================
   头部工具栏 - 毛玻璃效果
   ========================================== */
.workspace-header {
  height: 56px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 0.5px solid rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  height: 100%;
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  font-size: 24px;
}

.workspace-title {
  font-size: 17px;
  font-weight: 600;
  color: #1D1D1F;
  letter-spacing: -0.022em;
}

.header-actions-left {
  display: flex;
  align-items: center;
  gap: 4px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #1D1D1F;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.25, 0.1, 0.25, 1);
}

.header-btn:hover {
  background: rgba(0, 0, 0, 0.04);
}

.header-btn:active {
  background: rgba(0, 0, 0, 0.08);
  transform: scale(0.98);
}

.header-btn.icon-btn {
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.header-btn.icon-btn svg {
  width: 18px;
  height: 18px;
  color: #636366;
}

.header-btn.icon-btn:hover svg {
  color: #1D1D1F;
}

/* ==========================================
   主工作区 - 全宽布局
   ========================================== */
.workspace-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
}

/* ==========================================
   主编辑区
   ========================================== */
.main-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #F5F5F7;
  position: relative;
  min-height: 0;
}

.editor-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

/* 视频和分析面板并排布局 - 居中显示 */
.editor-content-wrapper {
  flex: 1;
  display: flex;
  gap: 24px;
  padding: 16px;
  min-height: 0;
  overflow: hidden;
  justify-content: center;
  align-items: flex-start;
}

.video-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 0;
}

.video-section.vertical-video {
  flex: 0 0 auto;
}

.editor-canvas {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #E8E8ED 0%, #F5F5F7 100%);
  position: relative;
  padding: 16px;
  border-radius: 12px;
  max-width: 100%;
  max-height: 100%;
}

.preview-video {
  max-width: 100%;
  max-height: calc(100vh - 300px);
  width: auto;
  height: auto;
  border-radius: 12px;
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.07),
    0 12px 28px rgba(0, 0, 0, 0.12),
    0 0 0 0.5px rgba(0, 0, 0, 0.08);
  background: #000;
  object-fit: contain;
}

/* 竖版视频专用样式 - 保持原始尺寸 */
.editor-canvas.vertical-video {
  padding: 8px;
}

.preview-video.vertical {
  max-width: 100%;
  max-height: calc(100vh - 300px);
  width: auto;
  height: auto;
  object-fit: contain;
}

/* ==========================================
   右侧AI分析面板
   ========================================== */
.analysis-sidebar {
  width: 360px;
  max-height: calc(100vh - 200px);
  flex-shrink: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 分析面板内容区域可滚动 */
.analysis-sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 16px;
}

.analysis-sidebar.analyzing {
  border: 2px solid #007AFF;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #E5E5EA;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #FAFAFA;
}

.sidebar-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1D1D1F;
  margin: 0;
}

.start-analysis-btn {
  padding: 8px 16px;
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 200ms ease;
}

.start-analysis-btn:hover {
  background: #0056CC;
  transform: translateY(-1px);
}

.analyzing-status {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #007AFF;
  font-size: 13px;
  font-weight: 500;
}

.spinner {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.analysis-complete-badge {
  color: #34C759;
  font-size: 13px;
  font-weight: 500;
}

/* 分析进度 */
.analysis-progress-section {
  padding: 16px;
  background: #F5F5F7;
  border-bottom: 1px solid #E5E5EA;
}

.analysis-progress-section .progress-bar {
  height: 6px;
  background: #E5E5EA;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.analysis-progress-section .progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007AFF, #5856D6);
  border-radius: 3px;
  transition: width 100ms ease;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.progress-step {
  color: #636366;
}

.progress-percent {
  color: #007AFF;
  font-weight: 600;
}

/* 关键帧区域 */
.keyframes-section,
.transcript-section,
.keywords-section {
  padding: 16px;
  border-bottom: 1px solid #E5E5EA;
}

.keyframes-section h4,
.transcript-section h4,
.keywords-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #1D1D1F;
  margin: 0 0 12px 0;
}

.keyframes-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.keyframe-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: transform 200ms ease;
}

.keyframe-item:hover {
  transform: scale(1.05);
}

.keyframe-thumbnail {
  width: 100%;
  aspect-ratio: 16/9;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.frame-number {
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.keyframe-time {
  font-size: 10px;
  color: #8E8E93;
}

/* 紧凑版关键帧样式 */
.keyframes-section.compact {
  padding: 12px 16px;
}

.keyframes-section.compact .section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.keyframes-section.compact h4 {
  margin: 0;
  font-size: 13px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.section-header h4 {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #1D1D1F;
}

.section-count {
  font-size: 11px;
  color: #8E8E93;
  background: #F2F2F7;
  padding: 2px 8px;
  border-radius: 10px;
}

.section-status {
  font-size: 11px;
  color: #FF9500;
  font-weight: 500;
}

.keyframes-scroll {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-height: 80px;
  overflow-y: auto;
}

.keyframe-item-compact {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 12px;
  cursor: pointer;
  transition: transform 150ms ease, opacity 150ms ease;
}

.keyframe-item-compact:hover {
  transform: scale(1.05);
  opacity: 0.9;
}

.keyframe-item-compact .frame-number {
  font-size: 11px;
  font-weight: 600;
  color: white;
  background: rgba(255,255,255,0.2);
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.keyframe-item-compact .keyframe-time {
  font-size: 11px;
  color: rgba(255,255,255,0.9);
}

/* 分析提示 */
.analysis-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #FFF3CD;
  border-radius: 8px;
  font-size: 12px;
  color: #856404;
  margin-top: 8px;
}

.recording-indicator {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 重新分析按钮 */
.restart-analysis-btn {
  padding: 6px 12px;
  background: #F2F2F7;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #007AFF;
  cursor: pointer;
  transition: all 200ms ease;
}

.restart-analysis-btn:hover {
  background: #E5E5EA;
}

/* 转录文本区域 */
.transcript-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.transcript-header h4 {
  margin: 0;
}

.speech-controls {
  display: flex;
  gap: 8px;
}

.speech-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 200ms ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.speech-btn.start {
  background: #34C759;
  color: white;
}

.speech-btn.start:hover {
  background: #2DB84D;
}

.speech-btn.stop {
  background: #FF3B30;
  color: white;
}

.speech-btn.stop:hover {
  background: #E6352B;
}

.speech-hint {
  background: #F0F9FF;
  border: 1px solid #BAE6FD;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.speech-hint p {
  font-size: 13px;
  font-weight: 600;
  color: #0369A1;
  margin: 0 0 8px 0;
}

.speech-hint ol {
  margin: 0;
  padding-left: 20px;
  font-size: 12px;
  color: #0C4A6E;
  line-height: 1.6;
}

.speech-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #991B1B;
}

.recording-indicator {
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.transcript-content-wrapper {
  margin-bottom: 12px;
}

.transcript-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #E5E5EA;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.6;
  color: #1D1D1F;
  background: #FAFAFA;
  resize: vertical;
  font-family: inherit;
  transition: border-color 200ms ease;
}

.transcript-input:focus {
  outline: none;
  border-color: #007AFF;
  background: white;
}

.transcript-input::placeholder {
  color: #8E8E93;
}

.extract-keywords-btn {
  width: 100%;
  padding: 10px 16px;
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 200ms ease;
}

.extract-keywords-btn:hover {
  background: #0056CC;
}

.transcript-content {
  font-size: 13px;
  line-height: 1.6;
  color: #1D1D1F;
  max-height: 150px;
  overflow-y: auto;
  padding: 12px;
  background: #F5F5F7;
  border-radius: 8px;
}

.transcript-content :deep(.keyword-highlight) {
  background: linear-gradient(120deg, #fff3cd 0%, #ffeeba 100%);
  padding: 2px 4px;
  border-radius: 3px;
  font-weight: 500;
  color: #856404;
}

/* 编辑转录文本按钮 */
.edit-transcript-btn {
  padding: 4px 10px;
  background: #F2F2F7;
  border: none;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  color: #007AFF;
  cursor: pointer;
  transition: all 200ms ease;
}

.edit-transcript-btn:hover {
  background: #E5E5EA;
}

/* 转录文本编辑区域 */
.transcript-edit-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.transcript-textarea {
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 1px solid #E5E5EA;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.6;
  color: #1D1D1F;
  resize: vertical;
  font-family: inherit;
  transition: border-color 200ms ease;
}

.transcript-textarea:focus {
  outline: none;
  border-color: #007AFF;
}

.transcript-edit-tip {
  font-size: 11px;
  color: #8E8E93;
  padding: 8px 12px;
  background: #F5F5F7;
  border-radius: 6px;
}

/* 关键词区域 */
.keywords-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.keyword-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: #F5F5F7;
  border-radius: 16px;
  font-size: 12px;
  color: #636366;
  transition: all 200ms ease;
}

.keyword-tag.highlight {
  background: linear-gradient(120deg, #fff3cd 0%, #ffeeba 100%);
  color: #856404;
  font-weight: 500;
}

.keyword-score {
  font-size: 10px;
  opacity: 0.7;
}

/* 空状态 */
.empty-analysis {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  text-align: center;
}

.empty-analysis .empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-analysis p {
  color: #8E8E93;
  font-size: 14px;
  margin-bottom: 16px;
}

.empty-analysis .feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

.empty-analysis .feature-list li {
  font-size: 13px;
  color: #636366;
  padding: 6px 0;
}

/* 视频控制覆盖层 */
.video-controls-overlay {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 8px 16px;
}

.video-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.video-time {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  font-variant-numeric: tabular-nums;
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
  background: #000;
  border: 2px solid rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  overflow: hidden;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 0 0.5px rgba(255, 255, 255, 0.2);
  pointer-events: auto;
  transition: all 300ms cubic-bezier(0.25, 0.1, 0.25, 1);
}

.pip-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ==========================================
   工作流程指示器 - 紧凑版
   ========================================== */
.workflow-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 24px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 0.5px solid rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
}

.workflow-step {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  cursor: default;
  opacity: 0.4;
  transition: all 200ms ease;
}

.workflow-step.clickable {
  cursor: pointer;
}

.workflow-step.clickable:hover {
  opacity: 0.7;
}

.workflow-step.active {
  opacity: 1;
}

.workflow-step.completed {
  opacity: 0.8;
}

.step-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #E5E5EA;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: #8E8E93;
  transition: all 200ms ease;
}

.workflow-step.active .step-icon {
  background: #007AFF;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
}

.workflow-step.completed .step-icon {
  background: #34C759;
  color: white;
}

.workflow-step.completed .step-icon svg {
  width: 14px;
  height: 14px;
}

.step-label {
  font-size: 13px;
  font-weight: 500;
  color: #8E8E93;
  transition: color 200ms ease;
}

.workflow-step.active .step-label {
  color: #1D1D1F;
}

.workflow-step.completed .step-label {
  color: #636366;
}

.step-connector {
  width: 32px;
  height: 2px;
  background: #E5E5EA;
  margin: 0 8px;
  border-radius: 1px;
}

.workflow-step.completed + .workflow-step .step-connector,
.workflow-step.completed .step-connector {
  background: #34C759;
}

/* ==========================================
   底部工具面板
   ========================================== */
.bottom-panel {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-top: 0.5px solid rgba(0, 0, 0, 0.1);
  transition: all 300ms cubic-bezier(0.25, 0.1, 0.25, 1);
  flex-shrink: 0;
}

.bottom-panel.collapsed {
  height: auto;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 40px;
  border-bottom: 0.5px solid rgba(0, 0, 0, 0.06);
}

.panel-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
}

.panel-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #636366;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 200ms ease;
}

.panel-tab:hover {
  background: rgba(0, 0, 0, 0.04);
  color: #1D1D1F;
}

.panel-tab.active {
  background: #007AFF;
  color: white;
}

.tab-icon {
  font-size: 14px;
}

.panel-toggle {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #8E8E93;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 200ms ease;
}

.panel-toggle:hover {
  background: rgba(0, 0, 0, 0.04);
  color: #1D1D1F;
}

.panel-toggle svg {
  width: 16px;
  height: 16px;
}

.panel-content {
  padding: 12px 20px;
  max-height: 160px;
  overflow-y: auto;
}

/* AI分析标签页 - 需要更大的高度 */
.analysis-tab {
  max-height: none;
}

.analysis-tab .ai-content-analyzer {
  max-height: 400px;
  overflow-y: auto;
}

/* 模板选择标签页 */
.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.template-card {
  background: #F5F5F7;
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 200ms ease;
  text-align: center;
}

.template-card:hover {
  background: #EBEBF0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.template-card.selected {
  border-color: #007AFF;
  background: rgba(0, 122, 255, 0.08);
}

.template-preview {
  margin-bottom: 8px;
}

.template-icon {
  font-size: 32px;
}

.template-name {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #1D1D1F;
  margin-bottom: 4px;
}

.template-desc {
  display: block;
  font-size: 11px;
  color: #8E8E93;
  line-height: 1.3;
}

/* 动画效果标签页 */
.animations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.animation-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border: none;
  border-radius: 12px;
  background: #F5F5F7;
  cursor: pointer;
  transition: all 200ms ease;
}

.animation-card:hover {
  background: #EBEBF0;
  transform: translateY(-2px);
}

.animation-card:active {
  transform: translateY(0);
}

.animation-card.danger {
  background: #FFF2F2;
}

.animation-card.danger:hover {
  background: #FFE5E5;
}

.animation-icon {
  font-size: 24px;
}

.animation-name {
  font-size: 13px;
  font-weight: 500;
  color: #1D1D1F;
}

/* AI建议标签页 */
.ai-suggestions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ai-suggestion-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.08) 0%, rgba(88, 86, 214, 0.08) 100%);
  border-radius: 12px;
  border: 1px solid rgba(0, 122, 255, 0.1);
}

.suggestion-icon {
  font-size: 20px;
}

.suggestion-text {
  flex: 1;
  font-size: 14px;
  color: #1D1D1F;
}

.suggestion-action {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  background: #007AFF;
  color: white;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 200ms ease;
}

.suggestion-action:hover {
  background: #0056CC;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  color: #8E8E93;
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 8px;
  opacity: 0.5;
}

.empty-text {
  font-size: 14px;
}

/* ==========================================
   响应式设计
   ========================================== */
@media (max-width: 768px) {
  .workspace-header {
    height: 48px;
  }

  .header-content {
    padding: 0 12px;
  }

  .workspace-title {
    font-size: 15px;
  }

  .workflow-indicator {
    padding: 12px 16px;
    overflow-x: auto;
  }

  .step-label {
    display: none;
  }

  .step-connector {
    width: 20px;
  }

  .panel-content {
    max-height: 160px;
  }

  .templates-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 8px;
  }

  .template-card {
    padding: 12px;
  }

  .template-icon {
    font-size: 24px;
  }

  .template-name {
    font-size: 12px;
  }

  .template-desc {
    display: none;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .workspace {
    background: #FFFFFF;
  }

  .workspace-header {
    background: #FFFFFF;
    border-bottom: 2px solid #000000;
  }

  .panel-tab.active {
    background: #000000;
  }

  .template-card.selected {
    border-width: 3px;
  }
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .workspace {
    background: linear-gradient(180deg, #1C1C1E 0%, #000000 100%);
    color: #F5F5F7;
  }

  .workspace-header {
    background: rgba(28, 28, 30, 0.72);
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }

  .workspace-title {
    color: #F5F5F7;
  }

  .header-btn {
    color: #F5F5F7;
  }

  .header-btn:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  .header-btn.icon-btn svg {
    color: #98989D;
  }

  .main-editor {
    background: #1C1C1E;
  }

  .editor-canvas {
    background: linear-gradient(180deg, #2C2C2E 0%, #1C1C1E 100%);
  }

  .workflow-indicator {
    background: rgba(28, 28, 30, 0.8);
    border-top-color: rgba(255, 255, 255, 0.08);
  }

  .step-icon {
    background: #3A3A3C;
    color: #98989D;
  }

  .step-label {
    color: #98989D;
  }

  .workflow-step.active .step-label {
    color: #F5F5F7;
  }

  .step-connector {
    background: #3A3A3C;
  }

  .bottom-panel {
    background: rgba(28, 28, 30, 0.95);
    border-top-color: rgba(255, 255, 255, 0.1);
  }

  .panel-header {
    border-bottom-color: rgba(255, 255, 255, 0.06);
  }

  .panel-tab {
    color: #98989D;
  }

  .panel-tab:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #F5F5F7;
  }

  .template-card {
    background: #2C2C2E;
  }

  .template-card:hover {
    background: #3A3A3C;
  }

  .template-card.selected {
    background: rgba(0, 122, 255, 0.2);
  }

  .template-name {
    color: #F5F5F7;
  }

  .animation-card {
    background: #2C2C2E;
  }

  .animation-card:hover {
    background: #3A3A3C;
  }

  .animation-name {
    color: #F5F5F7;
  }

  .ai-suggestion-card {
    background: linear-gradient(135deg, rgba(0, 122, 255, 0.15) 0%, rgba(88, 86, 214, 0.15) 100%);
    border-color: rgba(0, 122, 255, 0.2);
  }

  .suggestion-text {
    color: #F5F5F7;
  }

  .empty-state {
    color: #98989D;
  }
}
</style>