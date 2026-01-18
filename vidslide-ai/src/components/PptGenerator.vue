<template>
  <div class="ppt-generator">
    <!-- 生成器头部 -->
    <div class="generator-header">
      <h3 class="generator-title">
        <span class="title-icon">📊</span>
        PPT生成器
      </h3>
      <p class="generator-subtitle">基于AI分析结果自动生成专业PPT演示文稿</p>
    </div>

    <!-- 生成步骤 -->
    <div class="generation-steps">
      <!-- 步骤1: 内容分析 -->
      <div class="step-card" :class="{ active: currentStep === 1, completed: currentStep > 1 }">
        <div class="step-number">1</div>
        <div class="step-content">
          <h4 class="step-title">内容分析</h4>
          <p class="step-description">{{ analysisStatus }}</p>
          <div v-if="contentAnalysis" class="analysis-summary">
            <div class="summary-item">
              <span class="summary-label">关键词:</span>
              <span class="summary-value">{{ contentAnalysis.keywords?.length || 0 }}个</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">场景:</span>
              <span class="summary-value">{{ contentAnalysis.scenes?.length || 0 }}个</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">时长:</span>
              <span class="summary-value">{{ formatDuration(contentAnalysis.duration) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 步骤2: 模板推荐 -->
      <div class="step-card" :class="{ active: currentStep === 2, completed: currentStep > 2 }">
        <div class="step-number">2</div>
        <div class="step-content">
          <h4 class="step-title">模板推荐</h4>
          <p class="step-description">{{ templateStatus }}</p>

          <div v-if="recommendations.length > 0" class="template-recommendations">
            <div
              v-for="(rec, index) in recommendations.slice(0, 3)"
              :key="rec.templateId"
              class="template-card"
              :class="{ selected: selectedTemplate === rec.templateId }"
              @click="selectTemplate(rec.templateId)"
            >
              <div class="template-preview">
                <span class="template-icon">{{ getTemplateIcon(rec.templateId) }}</span>
              </div>
              <div class="template-info">
                <h5 class="template-name">{{ rec.name }}</h5>
                <div class="template-score">
                  <span class="score-label">匹配度:</span>
                  <span class="score-value">{{ Math.round(rec.score * 100) }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 步骤3: 内容组合 -->
      <div class="step-card" :class="{ active: currentStep === 3, completed: currentStep > 3 }">
        <div class="step-number">3</div>
        <div class="step-content">
          <h4 class="step-title">内容组合</h4>
          <p class="step-description">{{ compositionStatus }}</p>

          <div v-if="composition" class="composition-summary">
            <div class="summary-item">
              <span class="summary-label">组合模式:</span>
              <span class="summary-value">{{ composition.patternName }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">幻灯片数:</span>
              <span class="summary-value">{{ composition.sceneCount }}张</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">总时长:</span>
              <span class="summary-value">{{ formatDuration(composition.totalDuration) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 步骤4: PPT导出 -->
      <div class="step-card" :class="{ active: currentStep === 4, completed: currentStep > 4 }">
        <div class="step-number">4</div>
        <div class="step-content">
          <h4 class="step-title">PPT导出</h4>
          <p class="step-description">{{ exportStatus }}</p>

          <div v-if="exportResult" class="export-result">
            <div class="result-icon">✅</div>
            <div class="result-info">
              <p class="result-filename">{{ exportResult.fileName }}</p>
              <p class="result-details">
                {{ exportResult.slideCount }}张幻灯片 ·
                {{ formatFileSize(exportResult.fileSize) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 配置选项 -->
    <div v-if="currentStep === 2 || currentStep === 3" class="generation-options">
      <h4 class="options-title">生成选项</h4>

      <div class="option-group">
        <label class="option-label">
          <span class="label-text">演示文稿标题</span>
          <input
            v-model="options.title"
            type="text"
            class="option-input"
            placeholder="输入标题..."
          />
        </label>
      </div>

      <div class="option-group">
        <label class="option-label">
          <span class="label-text">幻灯片布局</span>
          <select v-model="options.layout" class="option-select">
            <option value="16x9">16:9 宽屏</option>
            <option value="4x3">4:3 传统</option>
            <option value="A4">A4 纸张</option>
          </select>
        </label>
      </div>

      <div class="option-group">
        <label class="option-checkbox">
          <input v-model="options.applyWatermark" type="checkbox" />
          <span class="checkbox-text">添加水印</span>
        </label>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="generator-actions">
      <button
        v-if="currentStep === 1"
        class="action-btn primary-btn"
        :disabled="!contentAnalysis || isProcessing"
        @click="startGeneration"
      >
        <span v-if="!isProcessing">🚀 开始生成</span>
        <span v-else>⏳ 处理中...</span>
      </button>

      <button
        v-if="currentStep === 2"
        class="action-btn primary-btn"
        :disabled="!selectedTemplate || isProcessing"
        @click="generateComposition"
      >
        <span v-if="!isProcessing">📝 生成内容</span>
        <span v-else>⏳ 组合中...</span>
      </button>

      <button
        v-if="currentStep === 3"
        class="action-btn primary-btn"
        :disabled="!composition || isProcessing"
        @click="exportPpt"
      >
        <span v-if="!isProcessing">💾 导出PPT</span>
        <span v-else>⏳ 导出中...</span>
      </button>

      <button v-if="currentStep === 4" class="action-btn secondary-btn" @click="resetGenerator">
        🔄 重新生成
      </button>

      <button
        v-if="currentStep > 1 && currentStep < 4"
        class="action-btn cancel-btn"
        :disabled="isProcessing"
        @click="previousStep"
      >
        ← 上一步
      </button>
    </div>

    <!-- 进度指示器 -->
    <div v-if="isProcessing" class="progress-indicator">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
      </div>
      <p class="progress-text">{{ progressText }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import TemplateRecommender from '../services/TemplateRecommender.js'
import TemplateComposer from '../services/TemplateComposer.js'
import { createPptxExporter } from '../utils/pptxExporter.js'

// Props
const props = defineProps({
  contentAnalysis: {
    type: Object,
    default: null
  }
})

// 状态管理
const currentStep = ref(1)
const isProcessing = ref(false)
const progress = ref(0)
const progressText = ref('')

// 推荐和组合结果
const recommendations = ref([])
const selectedTemplate = ref(null)
const composition = ref(null)
const exportResult = ref(null)

// 生成选项
const options = ref({
  title: '视频内容演示',
  layout: '16x9',
  applyWatermark: true
})

// 服务实例
let pptxExporter = null

// 计算属性
const analysisStatus = computed(() => {
  if (!props.contentAnalysis) {
    return '等待AI分析完成...'
  }
  return '✅ 分析完成'
})

const templateStatus = computed(() => {
  if (recommendations.value.length === 0) {
    return '正在分析内容并推荐模板...'
  }
  return `✅ 找到 ${recommendations.value.length} 个匹配模板`
})

const compositionStatus = computed(() => {
  if (!composition.value) {
    return '等待选择模板...'
  }
  return '✅ 内容组合完成'
})

const exportStatus = computed(() => {
  if (!exportResult.value) {
    return '准备导出...'
  }
  return '✅ 导出成功'
})

// 初始化
onMounted(async () => {
  try {
    await TemplateRecommender.initialize()
    await TemplateComposer.initialize()
    pptxExporter = createPptxExporter()
    await pptxExporter.initialize()

    // 如果已有分析结果，自动设置标题
    if (props.contentAnalysis?.title) {
      options.value.title = props.contentAnalysis.title
    }
  } catch (error) {
    console.error('PPT生成器初始化失败:', error)
    ElMessage.error('PPT生成器初始化失败')
  }
})

// 方法
const startGeneration = async () => {
  if (!props.contentAnalysis) {
    ElMessage.warning('请先完成AI分析')
    return
  }

  isProcessing.value = true
  progress.value = 0
  progressText.value = '正在分析内容...'

  try {
    // 生成模板推荐
    progress.value = 30
    progressText.value = '正在推荐模板...'

    const recs = await TemplateRecommender.generateRecommendations(props.contentAnalysis, {
      maxRecommendations: 5,
      minScore: 0.3
    })

    recommendations.value = recs

    if (recs.length > 0) {
      // 自动选择最佳模板
      selectedTemplate.value = recs[0].templateId
    }

    progress.value = 100
    progressText.value = '推荐完成'

    setTimeout(() => {
      currentStep.value = 2
      isProcessing.value = false
    }, 500)
  } catch (error) {
    console.error('模板推荐失败:', error)
    ElMessage.error('模板推荐失败: ' + error.message)
    isProcessing.value = false
  }
}

const selectTemplate = templateId => {
  selectedTemplate.value = templateId
}

const generateComposition = async () => {
  if (!selectedTemplate.value) {
    ElMessage.warning('请先选择一个模板')
    return
  }

  isProcessing.value = true
  progress.value = 0
  progressText.value = '正在组合内容...'

  try {
    progress.value = 30

    // 生成内容组合
    const comp = await TemplateComposer.generateComposition(props.contentAnalysis, {
      totalDuration: props.contentAnalysis.duration || 30000,
      minSceneDuration: 2000,
      maxSceneDuration: 8000
    })

    composition.value = comp

    progress.value = 100
    progressText.value = '组合完成'

    setTimeout(() => {
      currentStep.value = 3
      isProcessing.value = false
    }, 500)
  } catch (error) {
    console.error('内容组合失败:', error)
    ElMessage.error('内容组合失败: ' + error.message)
    isProcessing.value = false
  }
}

const exportPpt = async () => {
  if (!composition.value) {
    ElMessage.warning('请先完成内容组合')
    return
  }

  isProcessing.value = true
  progress.value = 0
  progressText.value = '正在生成PPT...'

  try {
    progress.value = 20

    // 转换场景为幻灯片数据
    const slides = composition.value.scenes.map(scene => ({
      elements: convertSceneToElements(scene)
    }))

    progress.value = 50
    progressText.value = '正在导出文件...'

    // 导出PPTX
    const result = await pptxExporter.exportPptx({
      slides,
      title: options.value.title,
      layout: options.value.layout,
      applyWatermark: options.value.applyWatermark,
      template: 'professional'
    })

    exportResult.value = result

    progress.value = 100
    progressText.value = '导出成功'

    ElMessage.success('PPT导出成功！')

    setTimeout(() => {
      currentStep.value = 4
      isProcessing.value = false
    }, 500)
  } catch (error) {
    console.error('PPT导出失败:', error)
    ElMessage.error('PPT导出失败: ' + error.message)
    isProcessing.value = false
  }
}

const convertSceneToElements = scene => {
  const elements = []

  // 根据模板类型生成元素
  if (scene.content) {
    if (scene.content.title) {
      elements.push({
        type: 'text',
        content: scene.content.title,
        style: {
          fontSize: 36,
          fontWeight: 'bold',
          color: '#1d1d1f',
          textAlign: 'center'
        },
        position: { x: 10, y: 20 },
        size: { width: 80, height: 15 }
      })
    }

    if (scene.content.subtitle) {
      elements.push({
        type: 'text',
        content: scene.content.subtitle,
        style: {
          fontSize: 18,
          color: '#666666',
          textAlign: 'center'
        },
        position: { x: 10, y: 40 },
        size: { width: 80, height: 10 }
      })
    }

    if (scene.content.bullets) {
      const bulletText = scene.content.bullets.map((b, i) => `${i + 1}. ${b}`).join('\n')
      elements.push({
        type: 'text',
        content: bulletText,
        style: {
          fontSize: 20,
          color: '#333333',
          textAlign: 'left'
        },
        position: { x: 15, y: 30 },
        size: { width: 70, height: 50 }
      })
    }

    if (scene.content.number) {
      elements.push({
        type: 'text',
        content: scene.content.number,
        style: {
          fontSize: 72,
          fontWeight: 'bold',
          color: '#007ACC',
          textAlign: 'center'
        },
        position: { x: 30, y: 30 },
        size: { width: 40, height: 30 }
      })
    }

    if (scene.content.quote) {
      elements.push({
        type: 'text',
        content: `"${scene.content.quote}"`,
        style: {
          fontSize: 28,
          fontStyle: 'italic',
          color: '#444444',
          textAlign: 'center'
        },
        position: { x: 15, y: 35 },
        size: { width: 70, height: 30 }
      })
    }
  }

  return elements
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const resetGenerator = () => {
  currentStep.value = 1
  recommendations.value = []
  selectedTemplate.value = null
  composition.value = null
  exportResult.value = null
  progress.value = 0
  progressText.value = ''
}

const getTemplateIcon = templateId => {
  const icons = {
    'ppt-title-slide': '📋',
    'ppt-bullet-points': '📝',
    'ppt-big-number': '🔢',
    'ppt-comparison': '⚖️',
    'ppt-quote': '💬'
  }
  return icons[templateId] || '📄'
}

const formatDuration = ms => {
  if (!ms) return '0秒'
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}秒`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}分${remainingSeconds}秒`
}

const formatFileSize = bytes => {
  if (!bytes) return '0 KB'
  const kb = Math.round(bytes / 1024)
  if (kb < 1024) return `${kb} KB`
  const mb = (kb / 1024).toFixed(1)
  return `${mb} MB`
}
</script>

<style scoped>
.ppt-generator {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

/* 头部 */
.generator-header {
  text-align: center;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.generator-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
}

.title-icon {
  font-size: 28px;
}

.generator-subtitle {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

/* 生成步骤 */
.generation-steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step-card {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s ease;
}

.step-card.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15));
  border-color: rgba(102, 126, 234, 0.4);
}

.step-card.completed {
  opacity: 0.7;
}

.step-number {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(102, 126, 234, 0.2);
  border-radius: 50%;
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.step-card.completed .step-number {
  background: rgba(76, 175, 80, 0.3);
}

.step-content {
  flex: 1;
}

.step-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.step-description {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

/* 分析摘要 */
.analysis-summary,
.composition-summary {
  display: flex;
  gap: 20px;
  margin-top: 12px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.summary-value {
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

/* 模板推荐 */
.template-recommendations {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.template-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
}

.template-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(102, 126, 234, 0.3);
  transform: translateY(-2px);
}

.template-card.selected {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
  border-color: rgba(102, 126, 234, 0.6);
}

.template-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.template-icon {
  font-size: 32px;
}

.template-info {
  text-align: center;
}

.template-name {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.template-score {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 12px;
}

.score-label {
  color: rgba(255, 255, 255, 0.5);
}

.score-value {
  font-weight: 600;
  color: rgba(102, 126, 234, 0.9);
}

/* 导出结果 */
.export-result {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(76, 175, 80, 0.3);
  margin-top: 12px;
}

.result-icon {
  font-size: 32px;
}

.result-info {
  flex: 1;
}

.result-filename {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.result-details {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

/* 生成选项 */
.generation-options {
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.options-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.option-group {
  margin-bottom: 16px;
}

.option-label {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label-text {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
}

.option-input,
.option-select {
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  transition: all 0.2s ease;
}

.option-input:focus,
.option-select:focus {
  outline: none;
  border-color: rgba(102, 126, 234, 0.5);
  background: rgba(255, 255, 255, 0.08);
}

.option-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.option-checkbox input[type='checkbox'] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

/* 操作按钮 */
.generator-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.action-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.primary-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.primary-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.secondary-btn {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.secondary-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.cancel-btn {
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.cancel-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.9);
}

/* 进度指示器 */
.progress-indicator {
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.progress-text {
  margin: 0;
  text-align: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}
</style>
