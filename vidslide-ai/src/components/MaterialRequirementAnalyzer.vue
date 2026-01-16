<template>
  <div
    class="material-requirement-analyzer"
    role="region"
    aria-labelledby="analyzer-heading"
  >
    <!-- 素材需求分析标题区域 -->
    <header
      class="analyzer-header"
      role="banner"
    >
      <h2 id="analyzer-heading">📊 素材需求分析</h2>
      <p class="analyzer-description">
        基于AI分析结果，智能推荐所需的PPT素材资源
      </p>

      <!-- 分析状态显示 -->
      <div
        v-if="isAnalyzing"
        class="analysis-status"
        role="status"
        aria-live="polite"
      >
        <div class="status-indicator">
          <div class="loading-spinner"></div>
          <span>正在分析素材需求...</span>
        </div>
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: analysisProgress + '%' }"
          ></div>
        </div>
      </div>
    </header>

    <!-- 素材需求概览 -->
    <section
      class="requirements-overview"
      role="complementary"
      aria-labelledby="overview-heading"
    >
      <h3 id="overview-heading" class="sr-only">素材需求概览</h3>

      <div class="overview-stats">
        <div class="stat-item">
          <span class="stat-label">总需求数:</span>
          <span class="stat-value">{{ materialRequirements.length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">高优先级:</span>
          <span class="stat-value">{{ highPriorityRequirements.length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">素材类型:</span>
          <span class="stat-value">{{ uniqueMaterialTypes.length }}</span>
        </div>
      </div>
    </section>

    <!-- 精选素材推荐 -->
    <section
      v-if="recommendedRecipes.length > 0"
      class="curated-section"
      role="complementary"
      aria-labelledby="curated-heading"
    >
      <h3 id="curated-heading" class="section-title">💎 精选素材推荐</h3>
      <p class="section-hint">基于您的内容，我们推荐以下精选素材</p>

      <div class="curated-grid">
        <div
          v-for="recipe in recommendedRecipes"
          :key="recipe.id"
          class="recipe-card"
          @click="useCuratedMaterial(recipe)"
          @keydown.enter="useCuratedMaterial(recipe)"
          @keydown.space="useCuratedMaterial(recipe)"
          role="button"
          tabindex="0"
          :aria-label="`使用精选素材 ${recipe.name}`"
        >
          <div class="recipe-icon">🎨</div>
          <div class="recipe-name">{{ recipe.name }}</div>
          <div class="recipe-desc">{{ recipe.description }}</div>
          <div class="recipe-tags">
            <span
              v-for="tag in recipe.tags.slice(0, 3)"
              :key="tag"
              class="tag"
            >
              {{ tag }}
            </span>
          </div>
          <button class="use-btn" @click.stop="useCuratedMaterial(recipe)">
            使用此素材
          </button>
        </div>
      </div>
    </section>

    <!-- 素材需求列表 -->
    <section
      class="requirements-section"
      role="main"
      aria-labelledby="requirements-list-heading"
    >
      <h3 id="requirements-list-heading" class="sr-only">素材需求列表</h3>

      <!-- 需求筛选和排序 -->
      <div class="requirements-controls">
        <div class="filter-controls">
          <label for="type-filter" class="sr-only">素材类型筛选</label>
          <select
            id="type-filter"
            v-model="selectedType"
            class="filter-select"
            @change="filterRequirements"
          >
            <option value="all">全部类型</option>
            <option
              v-for="type in uniqueMaterialTypes"
              :key="type"
              :value="type"
            >
              {{ getTypeDisplayName(type) }}
            </option>
          </select>

          <label for="priority-filter" class="sr-only">优先级筛选</label>
          <select
            id="priority-filter"
            v-model="selectedPriority"
            class="filter-select"
            @change="filterRequirements"
          >
            <option value="all">全部优先级</option>
            <option value="high">高优先级</option>
            <option value="medium">中优先级</option>
            <option value="low">低优先级</option>
          </select>
        </div>

        <button
          class="analyze-btn primary"
          @click="startAnalysis"
          :disabled="isAnalyzing || !hasInputData"
        >
          <span v-if="isAnalyzing" class="loading-spinner small"></span>
          {{ isAnalyzing ? '分析中...' : '重新分析' }}
        </button>
      </div>

      <!-- 素材需求网格 -->
      <div class="requirements-grid">
        <div
          v-for="requirement in filteredRequirements"
          :key="requirement.id"
          class="requirement-card"
          :class="{
            'high-priority': requirement.priority === 'high',
            'medium-priority': requirement.priority === 'medium',
            'low-priority': requirement.priority === 'low'
          }"
          @click="selectRequirement(requirement)"
          @keydown.enter="selectRequirement(requirement)"
          @keydown.space="selectRequirement(requirement)"
          role="button"
          tabindex="0"
          :aria-label="`选择素材需求 ${requirement.title}，优先级 ${getPriorityDisplayName(requirement.priority)}，类型 ${getTypeDisplayName(requirement.type)}`"
        >
          <!-- 需求图标 -->
          <div class="requirement-icon">
            <span class="icon-text">{{ getTypeIcon(requirement.type) }}</span>
          </div>

          <!-- 需求内容 -->
          <div class="requirement-content">
            <h4 class="requirement-title">{{ requirement.title }}</h4>
            <p class="requirement-description">{{ requirement.description }}</p>

            <!-- 需求详情 -->
            <div class="requirement-details">
              <span class="detail-item">
                <span class="detail-label">类型:</span>
                <span class="detail-value">{{ getTypeDisplayName(requirement.type) }}</span>
              </span>
              <span class="detail-item">
                <span class="detail-label">优先级:</span>
                <span class="detail-value priority-badge" :class="requirement.priority">
                  {{ getPriorityDisplayName(requirement.priority) }}
                </span>
              </span>
              <span class="detail-item">
                <span class="detail-label">置信度:</span>
                <span class="detail-value">{{ (requirement.confidence * 100).toFixed(1) }}%</span>
              </span>
            </div>

            <!-- 相关关键词 -->
            <div
              v-if="requirement.relatedKeywords && requirement.relatedKeywords.length > 0"
              class="related-keywords"
            >
              <span class="keywords-label">相关关键词:</span>
              <div class="keywords-list">
                <span
                  v-for="keyword in requirement.relatedKeywords.slice(0, 3)"
                  :key="keyword"
                  class="keyword-tag"
                >
                  {{ keyword }}
                </span>
                <span
                  v-if="requirement.relatedKeywords.length > 3"
                  class="keyword-more"
                >
                  +{{ requirement.relatedKeywords.length - 3 }}
                </span>
              </div>
            </div>

            <!-- 推荐理由 -->
            <div class="recommendation-reason">
              <span class="reason-label">推荐理由:</span>
              <span class="reason-text">{{ requirement.reason }}</span>
            </div>
          </div>

          <!-- 需求操作按钮 -->
          <div class="requirement-actions">
            <button
              class="action-btn search-btn"
              @click.stop="searchMaterial(requirement)"
              :aria-label="`搜索 ${requirement.title} 相关素材`"
              title="搜索相关素材"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </button>

            <button
              class="action-btn add-btn"
              @click.stop="addToCanvas(requirement)"
              :aria-label="`将 ${requirement.title} 添加到画布`"
              title="添加到画布"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14"/>
                <path d="M5 12h14"/>
              </svg>
            </button>

            <button
              class="action-btn info-btn"
              @click.stop="showRequirementDetails(requirement)"
              :aria-label="`查看 ${requirement.title} 详细信息`"
              title="查看详情"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <path d="M12 17h.01"/>
              </svg>
            </button>
          </div>

          <!-- 选中状态指示器 -->
          <div
            v-if="selectedRequirements.includes(requirement)"
            class="selection-indicator"
            aria-hidden="true"
          >
            ✓
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div
        v-if="filteredRequirements.length === 0 && !isAnalyzing"
        class="empty-state"
        role="status"
      >
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="9" cy="9" r="2"/>
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
            <path d="M14 9v6"/>
            <path d="M17 12H8"/>
          </svg>
        </div>
        <h3>{{ hasInputData ? '无匹配需求' : '暂无素材需求' }}</h3>
        <p>
          {{ hasInputData ? '调整筛选条件或重新分析' : '请先提供关键词或关键帧数据进行分析' }}
        </p>
        <button
          v-if="hasInputData"
          class="analyze-btn primary"
          @click="startAnalysis"
        >
          开始分析
        </button>
      </div>
    </section>

    <!-- 选中需求操作面板 -->
    <section
      v-if="selectedRequirements.length > 0"
      class="selected-requirements-panel"
      role="complementary"
      aria-labelledby="selected-panel-heading"
    >
      <h3 id="selected-panel-heading" class="sr-only">选中需求操作</h3>

      <div class="selected-summary">
        <span class="summary-label">已选择 {{ selectedRequirements.length }} 个素材需求:</span>
        <div class="selected-requirements-list">
          <span
            v-for="req in selectedRequirements"
            :key="req.id"
            class="selected-requirement-tag"
            :class="req.priority"
          >
            {{ req.title }}
            <button
              @click="deselectRequirement(req)"
              :aria-label="`取消选择需求 ${req.title}`"
              class="tag-remove-btn"
            >
              ×
            </button>
          </span>
        </div>
      </div>

      <div class="bulk-actions">
        <button
          class="bulk-action-btn primary"
          @click="searchSelectedMaterials"
          :disabled="selectedRequirements.length === 0"
        >
          🔍 批量搜索素材
        </button>

        <button
          class="bulk-action-btn secondary"
          @click="addSelectedToCanvas"
          :disabled="selectedRequirements.length === 0"
        >
          ➕ 批量添加到画布
        </button>

        <button
          class="bulk-action-btn danger"
          @click="clearSelection"
        >
          🗑️ 清空选择
        </button>
      </div>
    </section>

    <!-- 需求详情模态框 -->
    <div
      v-if="detailRequirement"
      class="requirement-detail-modal"
      role="dialog"
      aria-labelledby="detail-modal-title"
      aria-modal="true"
      @click="closeDetailModal"
    >
      <div
        class="detail-content"
        @click.stop
      >
        <header class="detail-header">
          <h3 id="detail-modal-title">素材需求详情</h3>
          <button
            @click="closeDetailModal"
            class="close-btn"
            aria-label="关闭详情"
          >
            ✕
          </button>
        </header>

        <div class="detail-body">
          <div class="detail-main">
            <div class="detail-icon">
              <span class="icon-text large">{{ getTypeIcon(detailRequirement.type) }}</span>
            </div>
            <div class="detail-info">
              <h4>{{ detailRequirement.title }}</h4>
              <p>{{ detailRequirement.description }}</p>

              <div class="detail-meta">
                <div class="meta-item">
                  <span class="meta-label">类型:</span>
                  <span class="meta-value">{{ getTypeDisplayName(detailRequirement.type) }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">优先级:</span>
                  <span class="meta-value priority-badge" :class="detailRequirement.priority">
                    {{ getPriorityDisplayName(detailRequirement.priority) }}
                  </span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">置信度:</span>
                  <span class="meta-value">{{ (detailRequirement.confidence * 100).toFixed(1) }}%</span>
                </div>
              </div>
            </div>
          </div>

          <div class="detail-sections">
            <div class="detail-section">
              <h5>推荐理由</h5>
              <p>{{ detailRequirement.reason }}</p>
            </div>

            <div
              v-if="detailRequirement.relatedKeywords && detailRequirement.relatedKeywords.length > 0"
              class="detail-section"
            >
              <h5>相关关键词</h5>
              <div class="keywords-cloud">
                <span
                  v-for="keyword in detailRequirement.relatedKeywords"
                  :key="keyword"
                  class="keyword-cloud-item"
                  :style="{ fontSize: getKeywordSize(keyword) + 'px' }"
                >
                  {{ keyword }}
                </span>
              </div>
            </div>

            <div
              v-if="detailRequirement.usageSuggestions"
              class="detail-section"
            >
              <h5>使用建议</h5>
              <ul class="suggestions-list">
                <li
                  v-for="suggestion in detailRequirement.usageSuggestions"
                  :key="suggestion"
                >
                  {{ suggestion }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <footer class="detail-footer">
          <button
            @click="searchMaterial(detailRequirement)"
            class="detail-action-btn primary"
          >
            🔍 搜索相关素材
          </button>
          <button
            @click="addToCanvas(detailRequirement)"
            class="detail-action-btn secondary"
          >
            ➕ 添加到画布
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import MaterialService from '../services/MaterialService.js'
import { getRecommendedRecipes } from '../data/curatedMaterialRecipes.js'

// Props
const props = defineProps({
  keywords: {
    type: Array,
    default: () => []
  },
  keyframes: {
    type: Array,
    default: () => []
  },
  videoContent: {
    type: String,
    default: ''
  },
  autoAnalyze: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits([
  'requirement-selected',
  'material-search-requested',
  'canvas-add-requested',
  'analysis-started',
  'analysis-completed'
])

// Reactive data
const materialRequirements = ref([])
const selectedRequirements = ref([])
const isAnalyzing = ref(false)
const analysisProgress = ref(0)
const selectedType = ref('all')
const selectedPriority = ref('all')
const detailRequirement = ref(null)
const recommendedRecipes = ref([])

// Computed properties
const filteredRequirements = computed(() => {
  let filtered = materialRequirements.value

  // 类型筛选
  if (selectedType.value !== 'all') {
    filtered = filtered.filter(req => req.type === selectedType.value)
  }

  // 优先级筛选
  if (selectedPriority.value !== 'all') {
    filtered = filtered.filter(req => req.priority === selectedPriority.value)
  }

  // 按优先级和置信度排序
  return filtered.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
    if (priorityDiff !== 0) return priorityDiff
    return b.confidence - a.confidence
  })
})

const highPriorityRequirements = computed(() => {
  return materialRequirements.value.filter(req => req.priority === 'high')
})

const uniqueMaterialTypes = computed(() => {
  const types = materialRequirements.value.map(req => req.type)
  return [...new Set(types)]
})

const hasInputData = computed(() => {
  return props.keywords.length > 0 || props.keyframes.length > 0 || props.videoContent
})

// Methods
const startAnalysis = async () => {
  if (!hasInputData.value) {
    console.warn('没有可分析的数据')
    return
  }

  isAnalyzing.value = true
  analysisProgress.value = 0
  emit('analysis-started')

  try {
    // 模拟素材需求分析过程
    analysisProgress.value = 20

    // 基于关键词分析
    if (props.keywords.length > 0) {
      await analyzeKeywords()
      analysisProgress.value = 40
    }

    // 基于关键帧分析
    if (props.keyframes.length > 0) {
      await analyzeKeyframes()
      analysisProgress.value = 60
    }

    // 基于视频内容分析
    if (props.videoContent) {
      await analyzeVideoContent()
      analysisProgress.value = 80
    }

    // 生成综合推荐
    await generateRecommendations()
    analysisProgress.value = 100

    emit('analysis-completed', materialRequirements.value)

  } catch (error) {
    console.error('素材需求分析失败:', error)
    // 处理错误状态
  } finally {
    isAnalyzing.value = false
    analysisProgress.value = 0
  }
}

const analyzeKeywords = async () => {
  // 基于关键词生成素材需求
  const keywordBasedRequirements = []

  for (const keyword of props.keywords) {
    if (keyword.importance > 0.7) {
      // 高重要性关键词生成具体需求
      keywordBasedRequirements.push({
        id: `keyword-${keyword.text}`,
        type: inferMaterialType(keyword.text),
        title: `${keyword.text}相关素材`,
        description: `为关键词"${keyword.text}"推荐的相关视觉素材`,
        priority: keyword.importance > 0.9 ? 'high' : 'medium',
        confidence: keyword.importance,
        relatedKeywords: [keyword.text],
        reason: `基于关键词"${keyword.text}"的重要性分析(${keyword.importance.toFixed(2)})`,
        usageSuggestions: [
          '可用于PPT标题或主要视觉元素',
          '建议使用高质量的矢量素材',
          '注意与整体设计风格保持一致'
        ]
      })
    }
  }

  materialRequirements.value.push(...keywordBasedRequirements)
}

const analyzeKeyframes = async () => {
  // 基于关键帧生成素材需求
  const keyframeBasedRequirements = []

  for (const keyframe of props.keyframes) {
    if (keyframe.importance > 0.6) {
      keyframeBasedRequirements.push({
        id: `keyframe-${keyframe.id}`,
        type: 'image',
        title: `关键帧${keyframe.id}插图`,
        description: `为视频关键帧(${formatTime(keyframe.timestamp)})设计的配套插图`,
        priority: keyframe.importance > 0.8 ? 'high' : 'medium',
        confidence: keyframe.importance,
        relatedKeywords: ['视频', '关键帧', '插图'],
        reason: `关键帧在${formatTime(keyframe.timestamp)}的重要性较高(${keyframe.importance.toFixed(2)})`,
        usageSuggestions: [
          '可用于PPT页面的视觉补充',
          '建议与关键帧内容风格保持一致',
          '适用于演示文稿的视觉化展示'
        ]
      })
    }
  }

  materialRequirements.value.push(...keyframeBasedRequirements)
}

const analyzeVideoContent = async () => {
  // 基于视频内容生成通用素材需求
  const contentBasedRequirements = [
    {
      id: 'video-background',
      type: 'background',
      title: '视频主题背景',
      description: '与视频内容相符的背景素材',
      priority: 'medium',
      confidence: 0.75,
      relatedKeywords: ['背景', '主题', '设计'],
      reason: '视频内容需要配套的视觉背景来增强演示效果',
      usageSuggestions: [
        '建议使用抽象或与主题相关的背景图案',
        '注意背景复杂度不宜过高',
        '保持良好的文字可读性'
      ]
    },
    {
      id: 'video-icons',
      type: 'icon',
      title: '主题相关图标',
      description: '视频主题相关的图标集合',
      priority: 'low',
      confidence: 0.6,
      relatedKeywords: ['图标', 'UI', '界面'],
      reason: '图标可以增强PPT的视觉层次和用户体验',
      usageSuggestions: [
        '选择风格统一的图标集',
        '优先使用矢量格式图标',
        '注意图标大小和颜色的一致性'
      ]
    }
  ]

  materialRequirements.value.push(...contentBasedRequirements)
}

const generateRecommendations = async () => {
  // 生成综合推荐
  const recommendations = [
    {
      id: 'comprehensive-graphics',
      type: 'illustration',
      title: '综合插图素材',
      description: '涵盖视频主要主题的插图集合',
      priority: 'high',
      confidence: 0.85,
      relatedKeywords: props.keywords.slice(0, 5).map(k => k.text),
      reason: '基于整体内容分析，为演示文稿提供全面的视觉支持',
      usageSuggestions: [
        '可用于PPT各页面的视觉元素',
        '建议选择风格统一的插图系列',
        '注意与品牌色彩保持一致'
      ]
    }
  ]

  // 确保ID唯一性
  recommendations.forEach(rec => {
    if (!materialRequirements.value.find(r => r.id === rec.id)) {
      materialRequirements.value.push(rec)
    }
  })
}

const inferMaterialType = (keyword) => {
  const lowerKeyword = keyword.toLowerCase()

  const typeMappings = {
    // 图表类关键词（优先级高）
    'chart': 'chart',
    'diagram': 'diagram',
    'graph': 'chart',

    // 图片类关键词
    'image': 'image',
    'photo': 'image',
    'picture': 'image',
    'illustration': 'illustration',
    'infographic': 'illustration',
    'graphic': 'illustration',
    'icon': 'icon',
    'background': 'background',

    // 视频类关键词
    'video': 'video',
    'animation': 'animation',
    'motion': 'animation'
  }

  for (const [key, type] of Object.entries(typeMappings)) {
    if (lowerKeyword.includes(key)) {
      return type
    }
  }

  return 'image' // 默认类型
}

const selectRequirement = (requirement) => {
  const index = selectedRequirements.value.findIndex(r => r.id === requirement.id)
  if (index === -1) {
    selectedRequirements.value.push(requirement)
  } else {
    selectedRequirements.value.splice(index, 1)
  }
  emit('requirement-selected', selectedRequirements.value)
}

const deselectRequirement = (requirement) => {
  const index = selectedRequirements.value.findIndex(r => r.id === requirement.id)
  if (index !== -1) {
    selectedRequirements.value.splice(index, 1)
    emit('requirement-selected', selectedRequirements.value)
  }
}

const searchMaterial = (requirement) => {
  emit('material-search-requested', requirement)
}

const addToCanvas = (requirement) => {
  emit('canvas-add-requested', requirement)
}

const searchSelectedMaterials = () => {
  selectedRequirements.value.forEach(requirement => {
    searchMaterial(requirement)
  })
}

const addSelectedToCanvas = () => {
  selectedRequirements.value.forEach(requirement => {
    addToCanvas(requirement)
  })
  clearSelection()
}

const showRequirementDetails = (requirement) => {
  detailRequirement.value = requirement
}

const closeRequirementDetails = () => {
  detailRequirement.value = null
}

// 精选素材推荐相关方法
const updateRecommendedRecipes = () => {
  if (props.keywords.length === 0) {
    recommendedRecipes.value = []
    return
  }

  const context = {
    keywords: props.keywords.map(k => k.text),
    type: 'mixed',
    scene: 'presentation'
  }

  const recipes = getRecommendedRecipes(context)
  recommendedRecipes.value = recipes.slice(0, 6) // 最多显示6个推荐
  console.log('💎 更新精选素材推荐:', recommendedRecipes.value.length)
}

const useCuratedMaterial = async (recipe) => {
  try {
    console.log('💎 使用精选素材:', recipe.name)

    // 初始化MaterialService
    await MaterialService.initialize()

    // 获取精选素材
    const material = await MaterialService.getCuratedMaterial(recipe.id)

    console.log('✅ 获取到精选素材:', material)

    // 可以在这里显示素材预览或直接添加到画布
    // 暂时通过emit发送事件
    emit('material-search-requested', {
      id: recipe.id,
      title: recipe.name,
      description: recipe.description,
      type: 'curated',
      priority: recipe.priority,
      relatedKeywords: recipe.tags,
      material: material
    })
  } catch (error) {
    console.error('❌ 获取精选素材失败:', error)
  }
}

const clearSelection = () => {
  selectedRequirements.value = []
  emit('requirement-selected', [])
}

const filterRequirements = () => {
  // 筛选逻辑已在computed属性中实现
}

const getTypeIcon = (type) => {
  const icons = {
    image: '🖼️',
    video: '🎬',
    icon: '🔘',
    illustration: '🎨',
    diagram: '📊',
    chart: '📈',
    background: '🎭',
    animation: '🎭'
  }
  return icons[type] || '📄'
}

const getTypeDisplayName = (type) => {
  const names = {
    image: '图片',
    video: '视频',
    icon: '图标',
    illustration: '插图',
    diagram: '图表',
    chart: '图表',
    background: '背景',
    animation: '动画'
  }
  return names[type] || type
}

const getPriorityDisplayName = (priority) => {
  const names = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级'
  }
  return names[priority] || priority
}

const getKeywordSize = (keyword) => {
  // 根据关键词长度动态调整字体大小
  const baseSize = 14
  const length = keyword.length
  return Math.max(baseSize - length, 10)
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Watchers
watch(() => props.keywords, (newKeywords) => {
  if (newKeywords.length > 0 && props.autoAnalyze) {
    startAnalysis()
  }
  // 更新精选素材推荐
  updateRecommendedRecipes()
}, { deep: true, immediate: true })

watch(() => props.keyframes, (newKeyframes) => {
  if (newKeyframes.length > 0 && props.autoAnalyze) {
    startAnalysis()
  }
}, { deep: true })

watch(() => props.videoContent, (newContent) => {
  if (newContent && props.autoAnalyze) {
    startAnalysis()
  }
})

// Lifecycle
onMounted(() => {
  if (props.autoAnalyze && hasInputData.value) {
    startAnalysis()
  }
  // 初始化精选素材推荐
  updateRecommendedRecipes()
})

// Expose methods for parent component
defineExpose({
  startAnalysis,
  clearRequirements: () => { materialRequirements.value = [] },
  getSelectedRequirements: () => selectedRequirements.value,
  getAllRequirements: () => materialRequirements.value,
  selectRequirement,
  searchMaterial,
  addToCanvas
})
</script>

<style scoped>
/* ===========================================
   素材需求分析器 - 苹果设计风格
   =========================================== */

.material-requirement-analyzer {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* 头部区域 */
.analyzer-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.analyzer-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: -0.01em;
}

.analyzer-description {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
}

/* 分析状态 */
.analysis-status {
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

.loading-spinner.small {
  width: 14px;
  height: 14px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

/* 需求概览 */
.requirements-overview {
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.overview-stats {
  display: flex;
  gap: 20px;
  justify-content: center;
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

/* 需求控制 */
.requirements-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
}

.filter-controls {
  display: flex;
  gap: 12px;
}

.filter-select {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
}

.filter-select:focus {
  outline: 2px solid rgba(0, 122, 255, 0.5);
  outline-offset: 2px;
}

.analyze-btn {
  padding: 8px 16px;
  border: 1px solid rgba(0, 122, 255, 0.3);
  border-radius: 6px;
  background: rgba(0, 122, 255, 0.1);
  color: rgba(0, 122, 255, 0.9);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.analyze-btn:hover:not(:disabled) {
  background: rgba(0, 122, 255, 0.2);
  border-color: rgba(0, 122, 255, 0.4);
}

.analyze-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.analyze-btn.primary {
  background: rgba(0, 122, 255, 0.1);
  border-color: rgba(0, 122, 255, 0.3);
  color: rgba(0, 122, 255, 0.9);
}

/* 需求网格 */
.requirements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  max-height: 600px;
  overflow-y: auto;
  padding: 4px;
}

/* 需求卡片 */
.requirement-card {
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.requirement-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.requirement-card:focus {
  outline: 2px solid rgba(0, 122, 255, 0.5);
  outline-offset: 2px;
}

.requirement-card.high-priority {
  border-left: 3px solid rgba(255, 59, 48, 0.8);
}

.requirement-card.medium-priority {
  border-left: 3px solid rgba(255, 149, 0, 0.8);
}

.requirement-card.low-priority {
  border-left: 3px solid rgba(142, 142, 147, 0.8);
}

/* 需求图标 */
.requirement-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin-bottom: 12px;
}

.icon-text {
  font-size: 24px;
}

.icon-text.large {
  font-size: 32px;
}

/* 需求内容 */
.requirement-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.requirement-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.3;
}

.requirement-description {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
}

/* 需求详情 */
.requirement-details {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 8px 0;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.detail-label {
  color: rgba(255, 255, 255, 0.6);
}

.detail-value {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.priority-badge {
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
}

.priority-badge.high {
  background: rgba(255, 59, 48, 0.2);
  color: rgba(255, 59, 48, 0.9);
}

.priority-badge.medium {
  background: rgba(255, 149, 0, 0.2);
  color: rgba(255, 149, 0, 0.9);
}

.priority-badge.low {
  background: rgba(142, 142, 147, 0.2);
  color: rgba(142, 142, 147, 0.9);
}

/* 相关关键词 */
.related-keywords {
  margin: 8px 0;
}

.keywords-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 4px;
  display: block;
}

.keywords-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.keyword-tag {
  padding: 2px 6px;
  background: rgba(0, 122, 255, 0.1);
  border: 1px solid rgba(0, 122, 255, 0.2);
  border-radius: 8px;
  font-size: 11px;
  color: rgba(0, 122, 255, 0.8);
}

.keyword-more {
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}

/* 推荐理由 */
.recommendation-reason {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.reason-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 4px;
  display: block;
}

.reason-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
}

/* 需求操作按钮 */
.requirement-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 12px 0 0 0;
  margin-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.requirement-card:hover .requirement-actions {
  opacity: 1;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
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
  transform: scale(0.95);
}

.search-btn:hover {
  color: rgba(0, 122, 255, 0.9);
}

.add-btn:hover {
  color: rgba(52, 199, 89, 0.9);
}

.info-btn:hover {
  color: rgba(255, 149, 0, 0.9);
}

/* 选中状态指示器 */
.selection-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: rgba(0, 122, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  color: white;
  z-index: 10;
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
  margin: 0 0 16px 0;
  font-size: 14px;
  line-height: 1.4;
}

/* 选中需求面板 */
.selected-requirements-panel {
  margin-top: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
}

.selected-summary {
  margin-bottom: 16px;
}

.summary-label {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8px;
  display: block;
}

.selected-requirements-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.selected-requirement-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.selected-requirement-tag.high {
  background: rgba(255, 59, 48, 0.1);
  border: 1px solid rgba(255, 59, 48, 0.3);
  color: rgba(255, 59, 48, 0.9);
}

.selected-requirement-tag.medium {
  background: rgba(255, 149, 0, 0.1);
  border: 1px solid rgba(255, 149, 0, 0.3);
  color: rgba(255, 149, 0, 0.9);
}

.selected-requirement-tag.low {
  background: rgba(142, 142, 147, 0.1);
  border: 1px solid rgba(142, 142, 147, 0.3);
  color: rgba(142, 142, 147, 0.9);
}

.tag-remove-btn {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 0;
  margin-left: 2px;
  opacity: 0.7;
}

.tag-remove-btn:hover {
  opacity: 1;
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

.bulk-action-btn.secondary {
  background: rgba(52, 199, 89, 0.1);
  border-color: rgba(52, 199, 89, 0.3);
  color: rgba(52, 199, 89, 0.9);
}

.bulk-action-btn.secondary:hover:not(:disabled) {
  background: rgba(52, 199, 89, 0.2);
  border-color: rgba(52, 199, 89, 0.4);
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

/* 详情模态框 */
.requirement-detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.detail-content {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.detail-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.9);
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: rgba(0, 0, 0, 0.5);
  padding: 4px;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: rgba(0, 0, 0, 0.8);
}

.detail-body {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.detail-main {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.detail-icon {
  flex-shrink: 0;
}

.detail-info h4 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.9);
}

.detail-info p {
  margin: 0 0 16px 0;
  color: rgba(0, 0, 0, 0.7);
  line-height: 1.5;
}

.detail-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.meta-label {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
}

.meta-value {
  font-weight: 600;
  color: rgba(0, 0, 0, 0.9);
}

.detail-sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-section h5 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.9);
}

.detail-section p {
  margin: 0;
  color: rgba(0, 0, 0, 0.7);
  line-height: 1.5;
}

.keywords-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.keyword-cloud-item {
  padding: 4px 8px;
  background: rgba(0, 122, 255, 0.1);
  border-radius: 12px;
  color: rgba(0, 122, 255, 0.9);
  font-weight: 500;
  transition: all 0.15s ease;
}

.keyword-cloud-item:hover {
  background: rgba(0, 122, 255, 0.2);
}

.suggestions-list {
  margin: 0;
  padding-left: 20px;
}

.suggestions-list li {
  margin-bottom: 4px;
  color: rgba(0, 0, 0, 0.7);
  line-height: 1.4;
}

.detail-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.detail-action-btn {
  padding: 10px 20px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  background: transparent;
  color: rgba(0, 0, 0, 0.8);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.detail-action-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.3);
}

.detail-action-btn.primary {
  background: rgba(0, 122, 255, 0.1);
  border-color: rgba(0, 122, 255, 0.3);
  color: rgba(0, 122, 255, 0.9);
}

.detail-action-btn.primary:hover {
  background: rgba(0, 122, 255, 0.2);
  border-color: rgba(0, 122, 255, 0.4);
}

.detail-action-btn.secondary {
  background: rgba(52, 199, 89, 0.1);
  border-color: rgba(52, 199, 89, 0.3);
  color: rgba(52, 199, 89, 0.9);
}

.detail-action-btn.secondary:hover {
  background: rgba(52, 199, 89, 0.2);
  border-color: rgba(52, 199, 89, 0.4);
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

/* 精选素材推荐样式 */
.curated-section {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 165, 0, 0.1) 100%);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  border: 2px solid rgba(255, 215, 0, 0.3);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.9);
  margin: 0 0 8px 0;
}

.section-hint {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
  margin: 0 0 20px 0;
}

.curated-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.recipe-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid rgba(255, 215, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recipe-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(255, 215, 0, 0.3);
  border-color: rgba(255, 215, 0, 0.5);
}

.recipe-card:focus {
  outline: 2px solid rgba(255, 215, 0, 0.6);
  outline-offset: 2px;
}

.recipe-icon {
  font-size: 32px;
  text-align: center;
}

.recipe-name {
  font-size: 16px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.9);
  text-align: center;
}

.recipe-desc {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.6);
  text-align: center;
  line-height: 1.4;
  min-height: 40px;
}

.recipe-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
}

.recipe-tags .tag {
  padding: 4px 10px;
  background: rgba(255, 215, 0, 0.15);
  border-radius: 12px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.7);
  font-weight: 500;
}

.use-btn {
  padding: 10px 16px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.9) 0%, rgba(255, 165, 0, 0.9) 100%);
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: auto;
}

.use-btn:hover {
  background: linear-gradient(135deg, rgba(255, 215, 0, 1) 0%, rgba(255, 165, 0, 1) 100%);
  transform: scale(1.05);
}

.use-btn:active {
  transform: scale(0.98);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .material-requirement-analyzer {
    padding: 16px;
    gap: 16px;
  }

  .overview-stats {
    flex-direction: column;
    gap: 12px;
  }

  .curated-grid {
    grid-template-columns: 1fr;
  }

  .requirements-controls {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .filter-controls {
    justify-content: center;
  }

  .requirements-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .requirement-card {
    padding: 12px;
  }

  .requirement-details {
    flex-direction: column;
    gap: 8px;
  }

  .bulk-actions {
    flex-direction: column;
  }

  .bulk-action-btn {
    width: 100%;
    justify-content: center;
  }

  .detail-main {
    flex-direction: column;
    text-align: center;
  }

  .detail-meta {
    align-items: center;
  }

  .detail-footer {
    flex-direction: column;
  }

  .detail-action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>