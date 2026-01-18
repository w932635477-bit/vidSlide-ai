/** * DispatcherStatus.vue * VidSlide AI - 智能调度器状态显示组件 * *
显示智能调度器的决策状态、性能指标和用户控制选项 */

<!--
  智能调度器状态显示组件
  核心功能：
  - 显示调度决策结果
  - 展示性能指标
  - 提供用户控制选项
  - 支持策略切换
-->
<template>
  <div class="dispatcher-status" role="region" aria-label="智能调度器状态">
    <!-- 调度状态指示器 -->
    <div v-if="lastDecision" class="status-indicator" role="status" aria-live="polite">
      <el-tag :type="getDecisionType(lastDecision)" size="small" class="decision-tag">
        <el-icon class="tag-icon">
          <component :is="getDecisionIcon(lastDecision)" />
        </el-icon>
        {{ getDecisionText(lastDecision) }}
      </el-tag>

      <span class="confidence-score">
        置信度: {{ (lastDecision.confidence * 100).toFixed(0) }}%
      </span>
    </div>

    <!-- 平台选择状态 -->
    <div v-if="lastDecision && lastDecision.platforms.length > 0" class="platform-status">
      <span class="platform-label">推荐平台:</span>
      <el-tag
        v-for="platform in lastDecision.platforms"
        :key="platform.name"
        size="small"
        :type="getPlatformType(platform)"
        class="platform-tag"
      >
        {{ getPlatformDisplayName(platform.name) }}
        <span class="platform-score"> {{ (platform.score * 100).toFixed(0) }}% </span>
      </el-tag>
    </div>

    <!-- 翻译状态 -->
    <div v-if="lastDecision && lastDecision.translation" class="translation-status">
      <el-tooltip :content="`原文: ${lastDecision.translation.original}`" placement="top">
        <span class="translation-text"> 🌐 {{ lastDecision.translation.translated }} </span>
      </el-tooltip>
    </div>

    <!-- 用户控制面板 -->
    <div class="control-panel">
      <el-dropdown trigger="click" @command="handleStrategyChange">
        <el-button size="small" type="link" class="control-button" aria-label="调度策略设置">
          <el-icon>
            <Setting />
          </el-icon>
          策略
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="strategy in availableStrategies"
              :key="strategy.key"
              :command="strategy.key"
              :class="{ active: currentStrategy === strategy.key }"
            >
              <el-icon class="strategy-icon">
                <component :is="strategy.icon" />
              </el-icon>
              {{ strategy.name }}
              <span class="strategy-desc">{{ strategy.description }}</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 性能监控按钮 -->
      <el-button
        size="small"
        type="link"
        class="control-button"
        aria-label="查看性能统计"
        @click="showPerformanceModal = true"
      >
        <el-icon>
          <Monitor />
        </el-icon>
        性能
      </el-button>
    </div>

    <!-- 性能统计弹窗 -->
    <el-dialog
      v-model="showPerformanceModal"
      title="智能调度器性能统计"
      width="600px"
      :before-close="handleCloseModal"
    >
      <div class="performance-content">
        <!-- 基础统计 -->
        <div class="stats-section">
          <h4>基础统计</h4>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">总决策数</span>
              <span class="stat-value">{{ performanceStats.totalTime?.count || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">平均响应时间</span>
              <span class="stat-value"
                >{{ (performanceStats.totalTime?.avg || 0).toFixed(1) }}ms</span
              >
            </div>
            <div class="stat-item">
              <span class="stat-label">缓存大小</span>
              <span class="stat-value">{{ performanceStats.cacheSize || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">缓存命中率</span>
              <span class="stat-value"
                >{{ ((performanceStats.cacheHitRate || 0) * 100).toFixed(1) }}%</span
              >
            </div>
          </div>
        </div>

        <!-- 平台使用统计 -->
        <div class="stats-section">
          <h4>平台使用统计</h4>
          <div class="platform-stats">
            <div
              v-for="[platform, count] in Object.entries(performanceStats.platformUsage || {})"
              :key="platform"
              class="platform-stat"
            >
              <span class="platform-name">{{ getPlatformDisplayName(platform) }}</span>
              <el-progress
                :percentage="
                  (count / Math.max(...Object.values(performanceStats.platformUsage || {}))) * 100
                "
                :show-text="false"
                :stroke-width="6"
                class="platform-progress"
              />
              <span class="platform-count">{{ count }}</span>
            </div>
          </div>
        </div>

        <!-- 优化建议 -->
        <div class="stats-section">
          <h4>优化建议</h4>
          <div class="suggestions">
            <el-alert
              v-for="suggestion in optimizationSuggestions"
              :key="suggestion"
              :title="suggestion"
              type="info"
              :closable="false"
              show-icon
              class="suggestion-alert"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="clearPerformanceData"> 清空统计 </el-button>
        <el-button type="primary" @click="showPerformanceModal = false"> 确定 </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Setting, Monitor, Check, Close, Lightning, Refresh, Cpu } from '@element-plus/icons-vue'
import IntelligentDispatcher from '../services/IntelligentDispatcher.js'

// Props
const props = defineProps({
  searchQuery: {
    type: String,
    default: ''
  },
  isSearching: {
    type: Boolean,
    default: false
  },
  currentStrategy: {
    type: String,
    default: 'balanced'
  }
})

// Emits
const emit = defineEmits(['strategy-changed', 'platform-preference-changed'])

// 响应式数据
const showPerformanceModal = ref(false)
const lastDecision = ref(null)

// 使用props中的currentStrategy
const currentStrategy = computed(() => props.currentStrategy)

// 计算属性
const performanceStats = computed(() => {
  return IntelligentDispatcher.getPerformanceStats()
})

const optimizationSuggestions = computed(() => {
  return IntelligentDispatcher.getOptimizationSuggestions()
})

const availableStrategies = computed(() => [
  {
    key: 'speed',
    name: '速度优先',
    description: '单平台快速响应',
    icon: Lightning
  },
  {
    key: 'quality',
    name: '质量优先',
    description: '多平台深度搜索',
    icon: Cpu
  },
  {
    key: 'balanced',
    name: '平衡模式',
    description: '速度与质量兼顾',
    icon: Refresh
  },
  {
    key: 'auto',
    name: '智能自动',
    description: 'AI自动决策',
    icon: Check
  }
])

// 监听搜索查询变化，获取调度决策
watch(
  () => props.searchQuery,
  async newQuery => {
    if (newQuery && newQuery.trim()) {
      try {
        const decision = await IntelligentDispatcher.dispatch(newQuery.trim(), {
          userPreferences: { strategy: currentStrategy.value }
        })
        lastDecision.value = decision
      } catch (error) {
        console.error('获取调度决策失败:', error)
        lastDecision.value = null
      }
    } else {
      lastDecision.value = null
    }
  },
  { immediate: true }
)

// 方法
const getDecisionType = decision => {
  if (decision.confidence > 0.8) return 'success'
  if (decision.confidence > 0.6) return 'warning'
  return 'info'
}

const getDecisionIcon = decision => {
  if (decision.confidence > 0.8) return Check
  if (decision.confidence > 0.6) return Refresh
  return Close
}

const getDecisionText = decision => {
  const strategyName = decision.strategy.name.replace('_', ' ')
  return `${strategyName}策略`
}

const getPlatformType = platform => {
  const score = platform.score
  if (score > 0.8) return 'success'
  if (score > 0.6) return 'warning'
  return 'info'
}

const getPlatformDisplayName = platformName => {
  const names = {
    baidu: '百度图片',
    unsplash: 'Unsplash',
    pexels: 'Pexels',
    pixabay: 'Pixabay'
  }
  return names[platformName] || platformName
}

const handleStrategyChange = strategyKey => {
  currentStrategy.value = strategyKey
  emit('strategy-changed', strategyKey)

  // 如果有当前决策，重新计算
  if (lastDecision.value) {
    IntelligentDispatcher.dispatch(lastDecision.value.keyword, {
      userPreferences: { strategy: strategyKey }
    })
      .then(decision => {
        lastDecision.value = decision
      })
      .catch(error => {
        console.error('策略切换失败:', error)
      })
  }
}

const clearPerformanceData = () => {
  // 清空调度器的性能数据
  IntelligentDispatcher.clearCache()
  // 这里可以添加清空其他性能数据的逻辑

  // 重新获取统计
  console.log('性能数据已清空')
}

const handleCloseModal = () => {
  showPerformanceModal.value = false
}

// 初始化
onMounted(() => {
  // 初始化调度器
  IntelligentDispatcher.initialize().catch(error => {
    console.error('调度器初始化失败:', error)
  })
})
</script>

<style scoped>
.dispatcher-status {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  font-size: 12px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.decision-tag {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tag-icon {
  font-size: 14px;
}

.confidence-score {
  color: #666;
  font-weight: 500;
}

.platform-status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.platform-label {
  color: #666;
  font-weight: 500;
}

.platform-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
}

.platform-score {
  opacity: 0.8;
  font-size: 10px;
}

.translation-status {
  padding: 2px 6px;
  background: #e8f4fd;
  border-radius: 4px;
  border: 1px solid #b8daff;
}

.translation-text {
  color: #0066cc;
  font-size: 11px;
  font-weight: 500;
  cursor: help;
}

.control-panel {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.control-button {
  padding: 4px 8px;
  font-size: 11px;
  color: #666;
}

.control-button:hover {
  color: #409eff;
  background: rgba(64, 158, 255, 0.1);
}

/* 弹窗样式 */
.performance-content {
  max-height: 400px;
  overflow-y: auto;
}

.stats-section {
  margin-bottom: 24px;
}

.stats-section h4 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.stat-item {
  text-align: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.stat-value {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.platform-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.platform-stat {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.platform-name {
  min-width: 80px;
  font-size: 12px;
  font-weight: 500;
  color: #303133;
}

.platform-progress {
  flex: 1;
  margin: 0 8px;
}

.platform-count {
  font-size: 12px;
  color: #666;
  min-width: 20px;
  text-align: right;
}

.suggestions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.suggestion-alert {
  margin: 0;
}

.suggestion-alert :deep(.el-alert__description) {
  margin: 4px 0 0 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dispatcher-status {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .control-panel {
    margin-left: 0;
    align-self: flex-end;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
