<template>
  <div class="material-requirement-analyzer" role="region">
    <!-- 分析器头部 -->
    <AnalyzerHeader
      :is-analyzing="isAnalyzing"
      :analysis-progress="analysisProgress"
    />

    <!-- 需求概览 -->
    <RequirementOverview
      :total-requirements="materialRequirements.length"
      :high-priority-count="highPriorityRequirements.length"
      :unique-types-count="uniqueMaterialTypes.length"
    />

    <!-- 精选素材推荐 -->
    <section
      v-if="recommendedRecipes.length > 0"
      class="curated-section"
      role="complementary"
    >
      <h3 class="section-title">💎 精选素材推荐</h3>
      <p class="section-hint">基于您的内容，我们推荐以下精选素材</p>

      <div class="curated-grid">
        <div
          v-for="recipe in recommendedRecipes"
          :key="recipe.id"
          class="recipe-card"
          @click="useCuratedMaterial(recipe)"
          role="button"
          tabindex="0"
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

    <!-- 需求筛选和控制 -->
    <section class="requirements-section" role="main">
      <RequirementFilters
        v-model:selected-type="selectedType"
        v-model:selected-priority="selectedPriority"
        :unique-types="uniqueMaterialTypes"
        :is-analyzing="isAnalyzing"
        :has-input-data="hasInputData"
        @analyze="startAnalysis"
      />

      <!-- 需求网格 -->
      <div class="requirements-grid">
        <RequirementCard
          v-for="requirement in filteredRequirements"
          :key="requirement.id"
          :requirement="requirement"
          :is-selected="selectedRequirements.some(r => r.id === requirement.id)"
          @select="selectRequirement"
          @search="searchMaterial"
          @add="addToCanvas"
          @info="showRequirementDetails"
        />
      </div>

      <!-- 空状态 -->
      <div
        v-if="filteredRequirements.length === 0 && !isAnalyzing"
        class="empty-state"
        role="status"
      >
        <div class="empty-icon">📋</div>
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
    >
      <div class="selected-summary">
        <span class="summary-label">已选择 {{ selectedRequirements.length }} 个素材需求</span>
      </div>

      <div class="bulk-actions">
        <button
          class="bulk-action-btn primary"
          @click="searchSelectedMaterials"
        >
          🔍 批量搜索素材
        </button>

        <button
          class="bulk-action-btn secondary"
          @click="addSelectedToCanvas"
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import MaterialService from '../../services/MaterialService.js'
import { getRecommendedRecipes } from '../../data/curatedMaterialRecipes.js'
import AnalyzerHeader from './material-analyzer/AnalyzerHeader.vue'
import RequirementOverview from './material-analyzer/RequirementOverview.vue'
import RequirementFilters from './material-analyzer/RequirementFilters.vue'
import RequirementCard from './material-analyzer/RequirementCard.vue'

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
const recommendedRecipes = ref([])

// Computed properties
const filteredRequirements = computed(() => {
  let filtered = materialRequirements.value

  if (selectedType.value !== 'all') {
    filtered = filtered.filter(req => req.type === selectedType.value)
  }

  if (selectedPriority.value !== 'all') {
    filtered = filtered.filter(req => req.priority === selectedPriority.value)
  }

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
    analysisProgress.value = 20

    if (props.keywords.length > 0) {
      await analyzeKeywords()
      analysisProgress.value = 40
    }

    if (props.keyframes.length > 0) {
      await analyzeKeyframes()
      analysisProgress.value = 60
    }

    if (props.videoContent) {
      await analyzeVideoContent()
      analysisProgress.value = 80
    }

    await generateRecommendations()
    analysisProgress.value = 100

    emit('analysis-completed', materialRequirements.value)
  } catch (error) {
    console.error('素材需求分析失败:', error)
  } finally {
    isAnalyzing.value = false
    analysisProgress.value = 0
  }
}

const analyzeKeywords = async () => {
  const keywordBasedRequirements = []

  for (const keyword of props.keywords) {
    if (keyword.importance > 0.7) {
      keywordBasedRequirements.push({
        id: `keyword-${keyword.text}`,
        type: inferMaterialType(keyword.text),
        title: `${keyword.text}相关素材`,
        description: `为关键词"${keyword.text}"推荐的相关视觉素材`,
        priority: keyword.importance > 0.9 ? 'high' : 'medium',
        confidence: keyword.importance,
        relatedKeywords: [keyword.text],
        reason: `基于关键词"${keyword.text}"的重要性分析(${keyword.importance.toFixed(2)})`
      })
    }
  }

  materialRequirements.value.push(...keywordBasedRequirements)
}

const analyzeKeyframes = async () => {
  const keyframeBasedRequirements = []

  for (const keyframe of props.keyframes) {
    if (keyframe.importance > 0.6) {
      keyframeBasedRequirements.push({
        id: `keyframe-${keyframe.id}`,
        type: 'image',
        title: `关键帧${keyframe.id}插图`,
        description: `为视频关键帧设计的配套插图`,
        priority: keyframe.importance > 0.8 ? 'high' : 'medium',
        confidence: keyframe.importance,
        relatedKeywords: ['视频', '关键帧', '插图'],
        reason: `关键帧的重要性较高(${keyframe.importance.toFixed(2)})`
      })
    }
  }

  materialRequirements.value.push(...keyframeBasedRequirements)
}

const analyzeVideoContent = async () => {
  const contentBasedRequirements = [
    {
      id: 'video-background',
      type: 'background',
      title: '视频主题背景',
      description: '与视频内容相符的背景素材',
      priority: 'medium',
      confidence: 0.75,
      relatedKeywords: ['背景', '主题', '设计'],
      reason: '视频内容需要配套的视觉背景来增强演示效果'
    }
  ]

  materialRequirements.value.push(...contentBasedRequirements)
}

const generateRecommendations = async () => {
  const recommendations = [
    {
      id: 'comprehensive-graphics',
      type: 'illustration',
      title: '综合插图素材',
      description: '涵盖视频主要主题的插图集合',
      priority: 'high',
      confidence: 0.85,
      relatedKeywords: props.keywords.slice(0, 5).map(k => k.text),
      reason: '基于整体内容分析，为演示文稿提供全面的视觉支持'
    }
  ]

  recommendations.forEach(rec => {
    if (!materialRequirements.value.find(r => r.id === rec.id)) {
      materialRequirements.value.push(rec)
    }
  })
}

const inferMaterialType = (keyword) => {
  const lowerKeyword = keyword.toLowerCase()
  const typeMappings = {
    'chart': 'chart',
    'diagram': 'diagram',
    'graph': 'chart',
    'image': 'image',
    'photo': 'image',
    'icon': 'icon',
    'background': 'background'
  }

  for (const [key, type] of Object.entries(typeMappings)) {
    if (lowerKeyword.includes(key)) {
      return type
    }
  }

  return 'image'
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

const searchMaterial = (requirement) => {
  emit('material-search-requested', requirement)
}

const addToCanvas = (requirement) => {
  emit('canvas-add-requested', requirement)
}

const showRequirementDetails = (requirement) => {
  console.log('显示详情:', requirement)
}

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
  recommendedRecipes.value = recipes.slice(0, 6)
}

const useCuratedMaterial = async (recipe) => {
  try {
    await MaterialService.initialize()
    const material = await MaterialService.getCuratedMaterial(recipe.id)

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
    console.error('获取精选素材失败:', error)
  }
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

const clearSelection = () => {
  selectedRequirements.value = []
  emit('requirement-selected', [])
}

// Watchers
watch(() => props.keywords, (newKeywords) => {
  if (newKeywords.length > 0 && props.autoAnalyze) {
    startAnalysis()
  }
  updateRecommendedRecipes()
}, { deep: true, immediate: true })

watch(() => props.keyframes, (newKeyframes) => {
  if (newKeyframes.length > 0 && props.autoAnalyze) {
    startAnalysis()
  }
}, { deep: true })

// Lifecycle
onMounted(() => {
  if (props.autoAnalyze && hasInputData.value) {
    startAnalysis()
  }
  updateRecommendedRecipes()
})

// Expose methods
defineExpose({
  startAnalysis,
  clearRequirements: () => { materialRequirements.value = [] },
  getSelectedRequirements: () => selectedRequirements.value,
  getAllRequirements: () => materialRequirements.value
})
</script>

<style scoped>
.material-requirement-analyzer {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.requirements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  max-height: 600px;
  overflow-y: auto;
  padding: 4px;
}

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
  font-size: 48px;
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
}

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

.bulk-action-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.3);
}

.bulk-action-btn.primary {
  background: rgba(0, 122, 255, 0.1);
  border-color: rgba(0, 122, 255, 0.3);
  color: rgba(0, 122, 255, 0.9);
}

.bulk-action-btn.secondary {
  background: rgba(52, 199, 89, 0.1);
  border-color: rgba(52, 199, 89, 0.3);
  color: rgba(52, 199, 89, 0.9);
}

.bulk-action-btn.danger {
  background: rgba(255, 59, 48, 0.1);
  border-color: rgba(255, 59, 48, 0.3);
  color: rgba(255, 59, 48, 0.9);
}

/* 精选素材推荐样式 */
.curated-section {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 165, 0, 0.1) 100%);
  border-radius: 12px;
  padding: 24px;
  border: 2px solid rgba(255, 215, 0, 0.3);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.section-hint {
  font-size: 14px;
  margin: 0 0 20px 0;
  opacity: 0.8;
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
  color: #333;
}

.recipe-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(255, 215, 0, 0.3);
  border-color: rgba(255, 215, 0, 0.5);
}

.recipe-icon {
  font-size: 32px;
  text-align: center;
}

.recipe-name {
  font-size: 16px;
  font-weight: 600;
  text-align: center;
}

.recipe-desc {
  font-size: 13px;
  opacity: 0.7;
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
  transform: scale(1.05);
}
</style>
