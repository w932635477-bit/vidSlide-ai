<template>
  <div class="ai-content-analyzer" role="region" aria-labelledby="analyzer-heading">
    <!-- AI内容分析界面 -->
    <header class="analyzer-header" role="banner">
      <h2 id="analyzer-heading">🧠 AI内容分析</h2>
      <p class="analyzer-description">智能分析视频内容，提取关键信息和结构化数据</p>
    </header>

    <!-- 分析控制区域 -->
    <section class="analysis-controls" role="region" aria-labelledby="controls-heading">
      <h3 id="controls-heading" class="sr-only">分析控制</h3>

      <div class="control-buttons">
        <button
          class="btn-analyze"
          :disabled="isAnalyzing || !videoSrc"
          :aria-describedby="isAnalyzing ? 'analyzing-status' : undefined"
          @click="startAnalysis"
        >
          <span v-if="isAnalyzing" class="loading-spinner">⟳</span>
          <span v-else>🎯 开始分析</span>
        </button>

        <button class="btn-stop" :disabled="!isAnalyzing" @click="stopAnalysis">🛑 停止分析</button>

        <button class="btn-reset" :disabled="isAnalyzing" @click="resetAnalysis">🔄 重置</button>
      </div>

      <div v-if="isAnalyzing" id="analyzing-status" class="sr-only">
        正在分析视频内容，请稍候...
      </div>
    </section>

    <!-- 分析进度显示 -->
    <section
      v-if="isAnalyzing || progress > 0"
      class="analysis-progress"
      role="region"
      aria-labelledby="progress-heading"
      aria-live="polite"
    >
      <h3 id="progress-heading" class="sr-only">分析进度</h3>

      <div class="progress-container">
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: progress + '%' }"
            :aria-valuenow="progress"
            aria-valuemin="0"
            aria-valuemax="100"
            role="progressbar"
            :aria-label="`分析进度: ${progress}%`"
          />
        </div>
        <div class="progress-text">{{ progress }}% - {{ currentStep }}</div>
        <div v-if="estimatedTime" class="estimated-time">预计剩余: {{ estimatedTime }}</div>
      </div>
    </section>

    <!-- 分析结果显示 -->
    <section
      v-if="analysisResults"
      class="analysis-results"
      role="region"
      aria-labelledby="results-heading"
    >
      <h3 id="results-heading" class="sr-only">分析结果</h3>

      <!-- 语音识别结果 -->
      <div class="result-card transcript-card">
        <header class="card-header">
          <h4>🎤 语音识别结果</h4>
          <div
            class="confidence-badge"
            :class="getConfidenceClass(analysisResults.transcriptConfidence)"
          >
            置信度: {{ analysisResults.transcriptConfidence }}%
          </div>
        </header>

        <div class="card-content">
          <div v-if="analysisResults.transcript" class="transcript-text">
            {{ analysisResults.transcript }}
          </div>
          <div v-else class="no-data">未检测到语音内容</div>
        </div>
      </div>

      <!-- 内容分析结果 -->
      <div class="result-card analysis-card">
        <header class="card-header">
          <h4>📊 内容分析</h4>
          <div class="duration-badge">
            处理时长: {{ formatDuration(analysisResults.processingTime) }}
          </div>
        </header>

        <div class="card-content">
          <!-- 关键词 -->
          <div class="analysis-item">
            <h5>关键词</h5>
            <div class="keywords-list">
              <span
                v-for="keyword in analysisResults.keywords"
                :key="keyword.text"
                :class="['keyword-tag', getKeywordType(keyword.score)]"
              >
                {{ keyword.text }}
                <span class="keyword-score">({{ keyword.score }})</span>
              </span>
            </div>
          </div>

          <!-- 主题分类 -->
          <div v-if="analysisResults.topics" class="analysis-item">
            <h5>主题分类</h5>
            <div class="topics-list">
              <span v-for="topic in analysisResults.topics" :key="topic" class="topic-tag">
                {{ topic }}
              </span>
            </div>
          </div>

          <!-- 情感分析 -->
          <div v-if="analysisResults.sentiment" class="analysis-item">
            <h5>情感倾向</h5>
            <div class="sentiment-indicator">
              <span class="sentiment-label">{{ analysisResults.sentiment.label }}</span>
              <div class="sentiment-bar">
                <div
                  class="sentiment-fill"
                  :class="analysisResults.sentiment.label.toLowerCase()"
                  :style="{ width: analysisResults.sentiment.score + '%' }"
                />
              </div>
              <span class="sentiment-score">{{ analysisResults.sentiment.score }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 视频结构分析 -->
      <div v-if="analysisResults.videoStructure" class="result-card structure-card">
        <header class="card-header">
          <h4>🎬 视频结构分析</h4>
        </header>

        <div class="card-content">
          <div class="structure-timeline">
            <div
              v-for="segment in analysisResults.videoStructure.segments"
              :key="segment.id"
              class="timeline-segment"
              :style="{
                left: (segment.startTime / analysisResults.videoStructure.duration) * 100 + '%',
                width:
                  ((segment.endTime - segment.startTime) /
                    analysisResults.videoStructure.duration) *
                    100 +
                  '%'
              }"
            >
              <div class="segment-label">
                {{ segment.type }}
              </div>
              <div class="segment-time">
                {{ formatTime(segment.startTime) }}
              </div>
            </div>
          </div>

          <div class="structure-stats">
            <div class="stat-item">
              <span class="stat-label">总时长:</span>
              <span class="stat-value">{{
                formatDuration(analysisResults.videoStructure.duration)
              }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">段落数:</span>
              <span class="stat-value">{{ analysisResults.videoStructure.segments.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">关键帧:</span>
              <span class="stat-value">{{ analysisResults.videoStructure.keyframes }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 错误状态显示 -->
    <section v-if="error" class="error-section" role="alert" aria-live="assertive">
      <div class="error-card">
        <div class="error-icon">⚠️</div>
        <div class="error-content">
          <h4>分析失败</h4>
          <p>{{ error }}</p>
          <button class="btn-retry" @click="retryAnalysis">重试分析</button>
        </div>
      </div>
    </section>

    <!-- 空状态提示 -->
    <section
      v-if="!videoSrc && !isAnalyzing && !analysisResults"
      class="empty-state"
      role="region"
      aria-labelledby="empty-heading"
    >
      <h3 id="empty-heading" class="sr-only">等待分析</h3>

      <div class="empty-content">
        <div class="empty-icon">🎬</div>
        <h4>准备开始AI分析</h4>
        <p>请先上传视频文件，然后点击"开始分析"进行智能内容分析</p>
        <div class="feature-list">
          <div class="feature-item">
            <span class="feature-icon">🎤</span>
            <span>语音识别</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">📊</span>
            <span>内容分析</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🏷️</span>
            <span>关键词提取</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">📈</span>
            <span>情感分析</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

/**
 * AI内容分析界面组件
 * VidSlide AI - P0级核心功能
 *
 * 功能：显示语音识别进度和AI分析结果
 * 验证标准：界面能正确显示AI分析进度条，语音识别结果实时展示，错误状态正确处理和显示
 */

// Props
const props = defineProps({
  videoSrc: {
    type: String,
    default: null
  },
  videoDuration: {
    type: Number,
    default: 0
  }
})

// Emits
const emit = defineEmits(['analysis-complete', 'analysis-error', 'analysis-progress'])

// 响应式状态
const isAnalyzing = ref(false)
const progress = ref(0)
const currentStep = ref('')
const estimatedTime = ref('')
const analysisResults = ref(null)
const error = ref(null)

// 计算属性
const hasVideo = computed(() => !!props.videoSrc)
const analysisStatus = computed(() => {
  if (error.value) return 'error'
  if (isAnalyzing.value) return 'analyzing'
  if (analysisResults.value) return 'completed'
  return 'idle'
})

// 分析步骤配置
const analysisSteps = [
  { name: '初始化AI引擎', duration: 2000, weight: 10 },
  { name: '加载语音识别模型', duration: 3000, weight: 15 },
  { name: '音频预处理', duration: 1500, weight: 10 },
  { name: '语音转文字', duration: 8000, weight: 25 },
  { name: '内容语义分析', duration: 4000, weight: 15 },
  { name: '关键词提取', duration: 2000, weight: 10 },
  { name: '情感分析', duration: 1500, weight: 5 },
  { name: '视频结构分析', duration: 3000, weight: 5 },
  { name: '生成分析报告', duration: 1000, weight: 5 }
]

// 分析控制器
let analysisController = null
let progressTimer = null

// 方法
const startAnalysis = async () => {
  if (!hasVideo.value) {
    error.value = '请先上传视频文件'
    return
  }

  if (isAnalyzing.value) return

  // 重置状态
  resetAnalysis()

  // 开始分析
  isAnalyzing.value = true
  error.value = null
  progress.value = 0

  try {
    analysisController = new AbortController()
    await performAnalysis(analysisController.signal)
  } catch (err) {
    if (err.name !== 'AbortError') {
      error.value = err.message || '分析过程中发生错误'
      emit('analysis-error', error.value)
    }
  } finally {
    isAnalyzing.value = false
    analysisController = null
    if (progressTimer) {
      clearInterval(progressTimer)
      progressTimer = null
    }
  }
}

const performAnalysis = async signal => {
  let completedWeight = 0

  for (let i = 0; i < analysisSteps.length; i++) {
    if (signal.aborted) throw new Error('分析已取消')

    const step = analysisSteps[i]
    currentStep.value = step.name

    // 更新预计剩余时间
    const remainingSteps = analysisSteps.slice(i)
    const totalRemainingTime = remainingSteps.reduce((sum, s) => sum + s.duration, 0)
    estimatedTime.value = formatDuration(totalRemainingTime)

    // 模拟步骤执行
    await simulateStep(step, signal)

    // 更新进度
    completedWeight += step.weight
    progress.value = Math.min(completedWeight, 100)
    emit('analysis-progress', { progress: progress.value, step: step.name })
  }

  // 生成分析结果
  analysisResults.value = generateMockResults()
  emit('analysis-complete', analysisResults.value)
}

const simulateStep = async (step, signal) => {
  const stepStartTime = Date.now()
  const checkInterval = 100 // 100ms检查一次

  return new Promise((resolve, reject) => {
    const timer = setInterval(() => {
      if (signal.aborted) {
        clearInterval(timer)
        reject(new Error('分析已取消'))
        return
      }

      const elapsed = Date.now() - stepStartTime
      if (elapsed >= step.duration) {
        clearInterval(timer)
        resolve()
      }
    }, checkInterval)
  })
}

const stopAnalysis = () => {
  if (analysisController) {
    analysisController.abort()
  }
  isAnalyzing.value = false
  currentStep.value = '分析已停止'
}

const resetAnalysis = () => {
  if (analysisController) {
    analysisController.abort()
  }

  isAnalyzing.value = false
  progress.value = 0
  currentStep.value = ''
  estimatedTime.value = ''
  analysisResults.value = null
  error.value = null

  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
}

const retryAnalysis = () => {
  resetAnalysis()
  startAnalysis()
}

const generateMockResults = () => {
  return {
    transcript:
      '大家好，欢迎来到VidSlide AI的演示视频。在这个视频中，我们将展示如何使用AI技术将普通的视频内容自动转换为专业的演示文稿。这个过程非常简单，只需要几个步骤即可完成。首先上传您的视频文件，然后AI会自动分析视频内容，提取关键信息，最后生成结构化的演示文稿。整个过程完全在浏览器中完成，确保了数据的安全性和隐私性。',
    transcriptConfidence: 92,
    keywords: [
      { text: 'AI', score: 95 },
      { text: '演示文稿', score: 88 },
      { text: '视频转换', score: 85 },
      { text: '智能分析', score: 82 },
      { text: '浏览器', score: 78 },
      { text: '数据安全', score: 75 }
    ],
    topics: ['人工智能', '内容创作', '技术演示', '数据安全'],
    sentiment: {
      label: '积极',
      score: 85
    },
    videoStructure: {
      duration: 125,
      keyframes: 8,
      segments: [
        { id: 'intro', type: '开场', startTime: 0, endTime: 15 },
        { id: 'demo', type: '演示', startTime: 15, endTime: 75 },
        { id: 'features', type: '功能介绍', startTime: 75, endTime: 105 },
        { id: 'conclusion', type: '总结', startTime: 105, endTime: 125 }
      ]
    },
    processingTime: 28500 // 28.5秒
  }
}

// 工具函数
const getConfidenceClass = confidence => {
  if (confidence >= 90) return 'high'
  if (confidence >= 70) return 'medium'
  return 'low'
}

const getKeywordType = score => {
  if (score >= 90) return 'danger'
  if (score >= 80) return 'warning'
  return 'info'
}

const formatDuration = milliseconds => {
  if (!milliseconds) return '0秒'

  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes > 0) {
    return `${minutes}分${remainingSeconds}秒`
  }
  return `${remainingSeconds}秒`
}

const formatTime = seconds => {
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

// 监听视频源变化
watch(
  () => props.videoSrc,
  newSrc => {
    if (!newSrc) {
      resetAnalysis()
    }
  }
)

// 组件挂载和卸载
onMounted(() => {
  console.log('🧠 AI内容分析界面组件已挂载')
})

onUnmounted(() => {
  resetAnalysis()
})

// 暴露组件接口
defineExpose({
  startAnalysis,
  stopAnalysis,
  resetAnalysis,
  isAnalyzing,
  analysisResults,
  error
})
</script>

<style scoped>
.ai-content-analyzer {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* 头部样式 */
.analyzer-header {
  padding: 24px 24px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.analyzer-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
}

.analyzer-description {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

/* 控制区域样式 */
.analysis-controls {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.control-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
}

.btn-analyze,
.btn-stop,
.btn-reset {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-analyze {
  background: #007bff;
  color: white;
}

.btn-analyze:hover:not(:disabled) {
  background: #0056b3;
  transform: translateY(-1px);
}

.btn-analyze:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.btn-stop {
  background: #dc3545;
  color: white;
}

.btn-stop:hover:not(:disabled) {
  background: #c82333;
  transform: translateY(-1px);
}

.btn-stop:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.btn-reset {
  background: #6c757d;
  color: white;
}

.btn-reset:hover:not(:disabled) {
  background: #5a6268;
  transform: translateY(-1px);
}

.btn-reset:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

/* 进度显示样式 */
.analysis-progress {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: #f8f9fa;
}

.progress-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #28a745, #20c997);
  transition: width 0.3s ease;
  border-radius: 4px;
}

.progress-text {
  font-size: 14px;
  color: #495057;
  font-weight: 500;
}

.estimated-time {
  font-size: 12px;
  color: #6c757d;
}

/* 结果卡片样式 */
.analysis-results {
  padding: 24px;
}

.result-card {
  margin-bottom: 20px;
  border: 1px solid #e0e6ed;
  border-radius: 8px;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e6ed;
}

.card-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.confidence-badge,
.duration-badge {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.confidence-badge.high {
  background: #d4edda;
  color: #155724;
}

.confidence-badge.medium {
  background: #fff3cd;
  color: #856404;
}

.confidence-badge.low {
  background: #f8d7da;
  color: #721c24;
}

.duration-badge {
  background: #e7f3ff;
  color: #0066cc;
}

.card-content {
  padding: 20px;
}

/* 转录文本样式 */
.transcript-text {
  line-height: 1.6;
  color: #606266;
  font-size: 14px;
  white-space: pre-wrap;
}

.no-data {
  color: #909399;
  font-style: italic;
  text-align: center;
  padding: 20px;
}

/* 分析项目样式 */
.analysis-item {
  margin-bottom: 20px;
}

.analysis-item h5 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

/* 关键词样式 */
.keywords-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.keyword-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid transparent;
}

.keyword-tag.danger {
  background: #fef2f2;
  color: #f56c6c;
  border-color: #fbc4c4;
}

.keyword-tag.warning {
  background: #fdf6ec;
  color: #e6a23c;
  border-color: #f5dab1;
}

.keyword-tag.info {
  background: #f4f4f5;
  color: #909399;
  border-color: #d3d4d6;
}

.keyword-score {
  font-size: 11px;
  opacity: 0.8;
}

/* 主题标签样式 */
.topics-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.topic-tag {
  display: inline-block;
  padding: 4px 12px;
  background: #f0f9ff;
  color: #0066cc;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
}

/* 情感分析样式 */
.sentiment-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sentiment-label {
  font-size: 14px;
  font-weight: 600;
  min-width: 40px;
}

.sentiment-bar {
  flex: 1;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.sentiment-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.sentiment-fill.积极 {
  background: linear-gradient(90deg, #28a745, #20c997);
}

.sentiment-fill.消极 {
  background: linear-gradient(90deg, #dc3545, #fd7e14);
}

.sentiment-fill.中性 {
  background: linear-gradient(90deg, #6c757d, #adb5bd);
}

.sentiment-score {
  font-size: 14px;
  font-weight: 600;
  color: #495057;
  min-width: 50px;
  text-align: right;
}

/* 视频结构分析样式 */
.structure-timeline {
  position: relative;
  height: 40px;
  background: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 16px;
  overflow: hidden;
}

.timeline-segment {
  position: absolute;
  top: 0;
  height: 100%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 2px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 10px;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  min-width: 60px;
}

.segment-label {
  font-size: 10px;
  line-height: 1;
}

.segment-time {
  font-size: 8px;
  opacity: 0.9;
  margin-top: 2px;
}

.structure-stats {
  display: flex;
  gap: 24px;
  justify-content: center;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-value {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

/* 错误状态样式 */
.error-section {
  padding: 24px;
}

.error-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
}

.error-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.error-content h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
}

.error-content p {
  margin: 0 0 16px 0;
  font-size: 14px;
}

.btn-retry {
  padding: 6px 12px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-retry:hover {
  background: #b91c1c;
}

/* 空状态样式 */
.empty-state {
  padding: 40px 24px;
  text-align: center;
}

.empty-content {
  max-width: 400px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-content h4 {
  margin: 0 0 12px 0;
  font-size: 18px;
  color: #303133;
}

.empty-content p {
  margin: 0 0 24px 0;
  color: #606266;
  line-height: 1.6;
}

.feature-list {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  min-width: 80px;
}

.feature-icon {
  font-size: 20px;
}

.feature-item span:last-child {
  font-size: 12px;
  color: #606266;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .analyzer-header {
    padding: 20px 16px 16px;
  }

  .analyzer-header h2 {
    font-size: 20px;
  }

  .analysis-controls,
  .analysis-progress,
  .analysis-results,
  .error-section,
  .empty-state {
    padding: 16px;
  }

  .control-buttons {
    flex-direction: column;
    width: 100%;
  }

  .btn-analyze,
  .btn-stop,
  .btn-reset {
    width: 100%;
    justify-content: center;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .structure-stats {
    flex-direction: column;
    gap: 12px;
  }

  .feature-list {
    flex-direction: column;
    align-items: center;
  }
}

/* 无障碍辅助样式 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* 加载动画 */
.loading-spinner {
  display: inline-block;
  animation: rotating 2s linear infinite;
  font-size: 16px;
}

@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 悬停效果 */
.btn-analyze:not(:disabled):hover,
.btn-stop:not(:disabled):hover,
.btn-reset:not(:disabled):hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.result-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 过渡动画 */
.progress-fill,
.sentiment-fill {
  transition: width 0.3s ease;
}

.result-card {
  transition: box-shadow 0.2s ease;
}
</style>
