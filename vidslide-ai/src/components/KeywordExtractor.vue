<template>
  <div class="keyword-extractor" role="region" aria-labelledby="keyword-heading">
    <!-- 关键词提取标题区域 -->
    <header class="extractor-header" role="banner">
      <h2 id="keyword-heading">🔍 关键词提取</h2>
      <p class="extractor-description">智能分析视频内容，提取关键主题词和概念</p>

      <!-- 提取状态显示 -->
      <div v-if="isExtracting" class="extraction-status" role="status" aria-live="polite">
        <div class="status-indicator">
          <div class="loading-spinner"></div>
          <span>正在分析关键词...</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: extractionProgress + '%' }"></div>
        </div>
      </div>
    </header>

    <!-- 关键词展示区域 -->
    <section class="keywords-section" role="main" aria-labelledby="keywords-list-heading">
      <h3 id="keywords-list-heading" class="sr-only">关键词列表</h3>

      <!-- 关键词统计信息 -->
      <div class="keywords-stats">
        <div class="stat-item">
          <span class="stat-label">总关键词数:</span>
          <span class="stat-value">{{ keywords.length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">高重要性:</span>
          <span class="stat-value">{{ highImportanceKeywords.length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">中重要性:</span>
          <span class="stat-value">{{ mediumImportanceKeywords.length }}</span>
        </div>
      </div>

      <!-- 关键词列表 -->
      <div class="keywords-container">
        <div
          v-for="keyword in sortedKeywords"
          :key="keyword.text"
          class="keyword-item"
          :class="{
            'high-importance': keyword.importance >= 0.8,
            'medium-importance': keyword.importance >= 0.5 && keyword.importance < 0.8,
            'low-importance': keyword.importance < 0.5
          }"
          role="button"
          tabindex="0"
          :aria-label="`选择关键词 ${keyword.text}，重要性 ${(keyword.importance * 100).toFixed(1)}%`"
          @click="selectKeyword(keyword)"
          @keydown.enter="selectKeyword(keyword)"
          @keydown.space="selectKeyword(keyword)"
        >
          <!-- 关键词文本 -->
          <span class="keyword-text">{{ keyword.text }}</span>

          <!-- 重要性指示器 -->
          <div class="importance-indicator">
            <div class="importance-bar">
              <div class="importance-fill" :style="{ width: keyword.importance * 100 + '%' }"></div>
            </div>
            <span class="importance-value"> {{ (keyword.importance * 100).toFixed(1) }}% </span>
          </div>

          <!-- 关键词操作按钮 -->
          <div class="keyword-actions">
            <button
              class="action-btn search-btn"
              :aria-label="`使用关键词 ${keyword.text} 搜索素材`"
              title="搜索相关素材"
              @click.stop="searchWithKeyword(keyword)"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            <button
              class="action-btn edit-btn"
              :aria-label="`编辑关键词 ${keyword.text}`"
              title="编辑关键词"
              @click.stop="editKeyword(keyword)"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
              </svg>
            </button>

            <button
              class="action-btn delete-btn"
              :aria-label="`删除关键词 ${keyword.text}`"
              title="删除关键词"
              @click.stop="removeKeyword(keyword)"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
          </div>

          <!-- 选中状态指示器 -->
          <div
            v-if="selectedKeywords.includes(keyword)"
            class="selection-indicator"
            aria-hidden="true"
          >
            ✓
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="keywords.length === 0 && !isExtracting" class="empty-state" role="status">
        <div class="empty-icon">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
        <h3>暂无关键词</h3>
        <p>请先上传视频或输入文本内容进行分析</p>
      </div>
    </section>

    <!-- 关键词操作面板 -->
    <section
      v-if="selectedKeywords.length > 0"
      class="keyword-actions-panel"
      role="complementary"
      aria-labelledby="actions-panel-heading"
    >
      <h3 id="actions-panel-heading" class="sr-only">关键词操作</h3>

      <div class="selected-keywords-summary">
        <span class="summary-label">已选择 {{ selectedKeywords.length }} 个关键词:</span>
        <div class="selected-keywords-list">
          <span
            v-for="keyword in selectedKeywords"
            :key="keyword.text"
            class="selected-keyword-tag"
          >
            {{ keyword.text }}
            <button
              :aria-label="`取消选择关键词 ${keyword.text}`"
              class="tag-remove-btn"
              @click="deselectKeyword(keyword)"
            >
              ×
            </button>
          </span>
        </div>
      </div>

      <div class="bulk-actions">
        <button
          class="bulk-action-btn primary"
          :disabled="selectedKeywords.length === 0"
          @click="searchSelectedKeywords"
        >
          🔍 批量搜索素材
        </button>

        <button
          class="bulk-action-btn secondary"
          :disabled="selectedKeywords.length === 0"
          @click="exportKeywords"
        >
          📤 导出关键词
        </button>

        <button class="bulk-action-btn danger" @click="clearSelection">🗑️ 清空选择</button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

// Props
const props = defineProps({
  videoSrc: {
    type: String,
    default: ''
  },
  textContent: {
    type: String,
    default: ''
  },
  autoExtract: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits([
  'keyword-selected',
  'keyword-removed',
  'search-requested',
  'extraction-started',
  'extraction-completed'
])

// Reactive data
const keywords = ref([])
const selectedKeywords = ref([])
const isExtracting = ref(false)
const extractionProgress = ref(0)

// Computed properties
const sortedKeywords = computed(() => {
  return [...keywords.value].sort((a, b) => b.importance - a.importance)
})

const highImportanceKeywords = computed(() => {
  return keywords.value.filter(k => k.importance >= 0.8)
})

const mediumImportanceKeywords = computed(() => {
  return keywords.value.filter(k => k.importance >= 0.5 && k.importance < 0.8)
})

// Methods
const startKeywordExtraction = async () => {
  if (!props.videoSrc && !props.textContent) {
    console.warn('没有可分析的内容')
    return
  }

  isExtracting.value = true
  extractionProgress.value = 0
  emit('extraction-started')

  try {
    // 模拟关键词提取过程
    extractionProgress.value = 20

    // 这里应该调用实际的关键词提取API
    // 暂时使用模拟数据
    await new Promise(resolve => setTimeout(resolve, 1000))
    extractionProgress.value = 60

    await new Promise(resolve => setTimeout(resolve, 1000))
    extractionProgress.value = 90

    // 生成模拟关键词数据
    const mockKeywords = [
      { text: '人工智能', importance: 0.95, category: 'technology' },
      { text: '机器学习', importance: 0.88, category: 'technology' },
      { text: '深度学习', importance: 0.82, category: 'technology' },
      { text: '数据分析', importance: 0.78, category: 'business' },
      { text: '自动化', importance: 0.75, category: 'technology' },
      { text: '创新', importance: 0.72, category: 'business' },
      { text: '效率', importance: 0.68, category: 'business' },
      { text: '未来', importance: 0.65, category: 'general' },
      { text: '技术', importance: 0.62, category: 'technology' },
      { text: '发展', importance: 0.58, category: 'general' }
    ]

    keywords.value = mockKeywords
    extractionProgress.value = 100

    emit('extraction-completed', mockKeywords)
  } catch (error) {
    console.error('关键词提取失败:', error)
    // 处理错误状态
  } finally {
    isExtracting.value = false
    extractionProgress.value = 0
  }
}

const selectKeyword = keyword => {
  const index = selectedKeywords.value.findIndex(k => k.text === keyword.text)
  if (index === -1) {
    selectedKeywords.value.push(keyword)
  } else {
    selectedKeywords.value.splice(index, 1)
  }
  emit('keyword-selected', selectedKeywords.value)
}

const deselectKeyword = keyword => {
  const index = selectedKeywords.value.findIndex(k => k.text === keyword.text)
  if (index !== -1) {
    selectedKeywords.value.splice(index, 1)
    emit('keyword-selected', selectedKeywords.value)
  }
}

const searchWithKeyword = keyword => {
  emit('search-requested', [keyword])
}

const searchSelectedKeywords = () => {
  emit('search-requested', selectedKeywords.value)
}

const editKeyword = keyword => {
  // 实现关键词编辑功能
  const newText = prompt('编辑关键词:', keyword.text)
  if (newText && newText.trim() !== keyword.text) {
    keyword.text = newText.trim()
  }
}

const removeKeyword = keyword => {
  const index = keywords.value.findIndex(k => k.text === keyword.text)
  if (index !== -1) {
    keywords.value.splice(index, 1)

    // 如果被删除的关键词在选中列表中，也要移除
    const selectedIndex = selectedKeywords.value.findIndex(k => k.text === keyword.text)
    if (selectedIndex !== -1) {
      selectedKeywords.value.splice(selectedIndex, 1)
      emit('keyword-selected', selectedKeywords.value)
    }

    emit('keyword-removed', keyword)
  }
}

const exportKeywords = () => {
  const dataStr = JSON.stringify(selectedKeywords.value, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

  const exportFileDefaultName = `keywords-${new Date().toISOString().split('T')[0]}.json`

  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', exportFileDefaultName)
  linkElement.click()
}

const clearSelection = () => {
  selectedKeywords.value = []
  emit('keyword-selected', [])
}

// Watchers
watch(
  () => props.videoSrc,
  newSrc => {
    if (newSrc && props.autoExtract) {
      startKeywordExtraction()
    }
  }
)

watch(
  () => props.textContent,
  newContent => {
    if (newContent && props.autoExtract) {
      startKeywordExtraction()
    }
  }
)

// Lifecycle
onMounted(() => {
  if (props.autoExtract && (props.videoSrc || props.textContent)) {
    startKeywordExtraction()
  }
})

// Expose methods for parent component
defineExpose({
  startKeywordExtraction,
  clearKeywords: () => {
    keywords.value = []
  },
  getSelectedKeywords: () => selectedKeywords.value,
  getAllKeywords: () => keywords.value
})
</script>

<style scoped>
/* ===========================================
   关键词提取器 - 苹果设计风格
   =========================================== */

.keyword-extractor {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* 头部区域 */
.extractor-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.extractor-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: -0.01em;
}

.extractor-description {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
}

/* 提取状态 */
.extraction-status {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: rgba(0, 122, 255, 0.1);
  border: 1px solid rgba(0, 122, 255, 0.2);
  border-radius: 8px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: rgba(0, 122, 255, 0.9);
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0, 122, 255, 0.3);
  border-top: 2px solid rgba(0, 122, 255, 0.9);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.progress-bar {
  height: 4px;
  background: rgba(0, 122, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, rgba(0, 122, 255, 0.8) 0%, rgba(0, 122, 255, 0.9) 100%);
  border-radius: 2px;
  transition: width 0.3s ease;
}

/* 关键词统计 */
.keywords-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

/* 关键词容器 */
.keywords-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
}

/* 关键词项 */
.keyword-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.keyword-item:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
  transform: translateY(-1px);
}

.keyword-item:focus {
  outline: 2px solid rgba(0, 122, 255, 0.5);
  outline-offset: 2px;
}

/* 重要性级别样式 */
.keyword-item.high-importance {
  border-left: 3px solid rgba(52, 199, 89, 0.8);
}

.keyword-item.medium-importance {
  border-left: 3px solid rgba(255, 149, 0, 0.8);
}

.keyword-item.low-importance {
  border-left: 3px solid rgba(142, 142, 147, 0.8);
}

/* 关键词文本 */
.keyword-text {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: -0.01em;
}

/* 重要性指示器 */
.importance-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 80px;
}

.importance-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.importance-fill {
  height: 100%;
  background: linear-gradient(90deg, rgba(0, 122, 255, 0.6) 0%, rgba(0, 122, 255, 0.8) 100%);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.importance-value {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  min-width: 35px;
  text-align: right;
}

/* 关键词操作按钮 */
.keyword-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.keyword-item:hover .keyword-actions {
  opacity: 1;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
  color: rgba(255, 255, 255, 0.6);
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}

.action-btn:active {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(0.95);
}

.search-btn:hover {
  color: rgba(0, 122, 255, 0.9);
}

.edit-btn:hover {
  color: rgba(52, 199, 89, 0.9);
}

.delete-btn:hover {
  color: rgba(255, 59, 48, 0.9);
}

/* 选中状态指示器 */
.selection-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  background: rgba(0, 122, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  color: white;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.4;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
}

.empty-state p {
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
}

/* 关键词操作面板 */
.keyword-actions-panel {
  margin-top: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
}

.selected-keywords-summary {
  margin-bottom: 16px;
}

.summary-label {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8px;
  display: block;
}

.selected-keywords-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.selected-keyword-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: rgba(0, 122, 255, 0.1);
  border: 1px solid rgba(0, 122, 255, 0.3);
  border-radius: 12px;
  font-size: 12px;
  color: rgba(0, 122, 255, 0.9);
}

.tag-remove-btn {
  background: none;
  border: none;
  color: rgba(0, 122, 255, 0.7);
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 0;
  margin-left: 2px;
}

.tag-remove-btn:hover {
  color: rgba(0, 122, 255, 0.9);
}

/* 批量操作按钮 */
.bulk-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.bulk-action-btn {
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.bulk-action-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.95);
}

.bulk-action-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.bulk-action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.bulk-action-btn.primary {
  background: rgba(0, 122, 255, 0.1);
  border-color: rgba(0, 122, 255, 0.3);
  color: rgba(0, 122, 255, 0.9);
}

.bulk-action-btn.primary:hover:not(:disabled) {
  background: rgba(0, 122, 255, 0.2);
  border-color: rgba(0, 122, 255, 0.4);
}

.bulk-action-btn.danger {
  background: rgba(255, 59, 48, 0.1);
  border-color: rgba(255, 59, 48, 0.3);
  color: rgba(255, 59, 48, 0.9);
}

.bulk-action-btn.danger:hover:not(:disabled) {
  background: rgba(255, 59, 48, 0.2);
  border-color: rgba(255, 59, 48, 0.4);
}

/* 无障碍支持 */
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

/* 响应式设计 */
@media (max-width: 768px) {
  .keyword-extractor {
    padding: 16px;
    gap: 16px;
  }

  .keywords-stats {
    flex-direction: column;
    gap: 12px;
  }

  .keyword-item {
    padding: 10px 12px;
    gap: 8px;
  }

  .keyword-text {
    font-size: 13px;
  }

  .bulk-actions {
    flex-direction: column;
  }

  .bulk-action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
