<!--
  VidSlide AI - 性能监控组件
  提供实时的性能指标监控和可视化
-->
<template>
  <div class="performance-monitor"
:class="{ minimized }">
    <!-- 监控面板头部 -->
    <div class="monitor-header"
@click="toggleMinimized">
      <h3 class="monitor-title">
        <el-icon><DataAnalysis /></el-icon>
        性能监控
      </h3>
      <div class="header-actions">
        <el-tag
          :type="getOverallStatus()"
          size="small"
          :aria-label="`整体性能状态: ${getOverallStatusText()}`"
        >
          {{ getOverallStatusText() }}
        </el-tag>
        <el-button
          type="text"
          size="small"
          :aria-label="minimized ? '展开性能监控面板' : '最小化性能监控面板'"
          @click.stop="toggleMinimized"
        >
          <el-icon>
            <ArrowUp v-if="minimized" />
            <ArrowDown v-else />
          </el-icon>
        </el-button>
      </div>
    </div>

    <!-- 监控内容区域 -->
    <div v-show="!minimized"
class="monitor-content">
      <!-- 实时指标 -->
      <div class="metrics-section">
        <h4 class="section-title">实时指标</h4>
        <div class="metrics-grid">
          <!-- FPS指标 -->
          <div
            class="metric-card"
            :aria-label="`FPS指标: ${currentFps}, 状态: ${getFpsStatusText()}`"
          >
            <div class="metric-icon">
              <el-icon><VideoPlay /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-value">
                {{ currentFps }}
              </div>
              <div class="metric-label">FPS</div>
              <div class="metric-status"
:class="getFpsStatus()">
                {{ getFpsStatusText() }}
              </div>
            </div>
          </div>

          <!-- 内存使用 -->
          <div
            class="metric-card"
            :aria-label="`内存使用: ${formatMemory(memoryUsage)}, 状态: ${getMemoryStatusText()}`"
          >
            <div class="metric-icon">
              <el-icon><Memory /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-value">
                {{ formatMemory(memoryUsage) }}
              </div>
              <div class="metric-label">内存使用</div>
              <div class="metric-status"
:class="getMemoryStatus()">
                {{ getMemoryStatusText() }}
              </div>
            </div>
          </div>

          <!-- 渲染时间 -->
          <div
            class="metric-card"
            :aria-label="`渲染时间: ${renderTime.toFixed(1)}毫秒, 状态: ${getRenderStatusText()}`"
          >
            <div class="metric-icon">
              <el-icon><Timer /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ renderTime.toFixed(1) }}ms</div>
              <div class="metric-label">渲染时间</div>
              <div class="metric-status"
:class="getRenderStatus()">
                {{ getRenderStatusText() }}
              </div>
            </div>
          </div>

          <!-- 缓存命中率 -->
          <div
            class="metric-card"
            :aria-label="`缓存命中率: ${cacheHitRate}%, 状态: ${getCacheStatusText()}`"
          >
            <div class="metric-icon">
              <el-icon><Box /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ cacheHitRate }}%</div>
              <div class="metric-label">缓存命中率</div>
              <div class="metric-status"
:class="getCacheStatus()">
                {{ getCacheStatusText() }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 性能历史图表 -->
      <div class="charts-section">
        <h4 class="section-title">性能趋势</h4>
        <div class="charts-container">
          <div class="chart-item">
            <div class="chart-header">
              <span>FPS 历史</span>
              <span class="chart-value">{{ averageFps.toFixed(1) }} avg</span>
            </div>
            <div class="chart-visual"
:aria-label="`FPS趋势图表，平均值: ${averageFps.toFixed(1)}`">
              <div
                v-for="(fps, index) in fpsHistory.slice(-10)"
                :key="index"
                class="chart-bar"
                :style="{ height: `${(fps / 60) * 100}%` }"
                :aria-label="`第${index + 1}个数据点: ${fps} FPS`"
              />
            </div>
          </div>

          <div class="chart-item">
            <div class="chart-header">
              <span>内存使用历史</span>
              <span class="chart-value">{{ formatMemory(maxMemoryUsage) }} max</span>
            </div>
            <div
              class="chart-visual"
              :aria-label="`内存使用趋势图表，最大值: ${formatMemory(maxMemoryUsage)}`"
            >
              <div
                v-for="(mem, index) in memoryHistory.slice(-10)"
                :key="index"
                class="chart-bar"
                :style="{ height: `${(mem / maxMemoryUsage) * 100}%` }"
                :aria-label="`第${index + 1}个数据点: ${formatMemory(mem)}`"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 性能建议 -->
      <div class="recommendations-section">
        <h4 class="section-title">优化建议</h4>
        <div class="recommendations-list">
          <div
            v-for="recommendation in performanceRecommendations"
            :key="recommendation.id"
            class="recommendation-item"
            :class="recommendation.priority"
          >
            <el-icon :class="getRecommendationIcon(recommendation.priority)">
              <Warning v-if="recommendation.priority === 'high'" />
              <InfoFilled v-else-if="recommendation.priority === 'medium'" />
              <Check v-else />
            </el-icon>
            <span>{{ recommendation.message }}</span>
          </div>
        </div>
      </div>

      <!-- 控制按钮 -->
      <div class="monitor-controls">
        <el-button size="small"
@click="clearStats" :aria-label="清除性能统计数据">
          <el-icon><Delete /></el-icon>
          清除统计
        </el-button>
        <el-button size="small"
type="primary" :aria-label="导出性能报告" @click="exportReport">
          <el-icon><Download /></el-icon>
          导出报告
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  DataAnalysis,
  ArrowUp,
  ArrowDown,
  VideoPlay,
  Memory,
  Timer,
  Box,
  Warning,
  InfoFilled,
  Check,
  Delete,
  Download
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getAssetManager } from '../utils/AssetManager.js'

/**
 * 组件属性定义
 * @typedef {Object} PerformanceMonitorProps
 * @property {boolean} autoStart - 是否自动开始监控，默认为true
 * @property {number} updateInterval - 监控更新间隔(毫秒)，默认为1000ms
 */

/** 组件属性 */
const props = defineProps({
  autoStart: {
    type: Boolean,
    default: true
  },
  updateInterval: {
    type: Number,
    default: 1000 // 1秒更新一次
  }
})

/**
 * 组件事件定义
 * @typedef {Object} PerformanceMonitorEmits
 * @property {function} performance-alert - 性能警告事件
 * @property {function} metrics-updated - 指标更新事件
 */

/** 组件事件 */
const emit = defineEmits(['performance-alert', 'metrics-updated'])

/** 响应式状态数据 */
const minimized = ref(false) // 面板是否最小化
const currentFps = ref(60) // 当前FPS值
const memoryUsage = ref(0) // 当前内存使用量(字节)
const renderTime = ref(0) // 渲染时间(毫秒)
const cacheHitRate = ref(0) // 缓存命中率(百分比)
const fpsHistory = ref([]) // FPS历史记录数组
const memoryHistory = ref([]) // 内存历史记录数组
const maxMemoryUsage = ref(0) // 历史最大内存使用量

/** 性能监控内部变量 */
let animationFrameId = null // 动画帧ID
let lastFrameTime = 0 // 上一帧时间戳
let frameCount = 0 // 帧计数器
let monitorInterval = null // 监控定时器
let renderStartTime = 0 // 渲染开始时间
let visibilityListener = null // 页面可见性监听器
let isPageVisible = true // 页面是否可见

/**
 * 计算平均FPS
 * @returns {number} 平均帧率
 */
const averageFps = computed(() => {
  if (fpsHistory.value.length === 0) return 60
  const sum = fpsHistory.value.reduce((a, b) => a + b, 0)
  return sum / fpsHistory.value.length
})

/**
 * 基于当前性能指标生成优化建议
 * @returns {Array<{id: string, priority: 'high'|'medium'|'good', message: string}>} 性能建议列表
 */
const performanceRecommendations = computed(() => {
  const recommendations = []

  // FPS性能检查 - 高优先级
  if (averageFps.value < 30) {
    recommendations.push({
      id: 'low-fps',
      priority: 'high',
      message: '帧率过低，建议减少动画效果或优化渲染'
    })
  } else if (averageFps.value < 50) {
    recommendations.push({
      id: 'medium-fps',
      priority: 'medium',
      message: '帧率偏低，考虑优化动画性能'
    })
  }

  // 内存使用检查 - 高优先级
  if (memoryUsage.value > 50 * 1024 * 1024) {
    // 50MB
    recommendations.push({
      id: 'high-memory',
      priority: 'high',
      message: '内存使用过高，建议清理缓存或减少同时加载的素材'
    })
  }

  // 缓存命中率检查 - 中优先级
  if (cacheHitRate.value < 70) {
    recommendations.push({
      id: 'low-cache-hit',
      priority: 'medium',
      message: '缓存命中率偏低，考虑增加缓存大小或优化缓存策略'
    })
  }

  // 渲染时间检查 - 中优先级
  if (renderTime.value > 16.67) {
    // 超过一帧的时间(60fps)
    recommendations.push({
      id: 'slow-render',
      priority: 'medium',
      message: '渲染时间过长，可能影响用户体验'
    })
  }

  // 如果没有问题，给出正面反馈
  if (recommendations.length === 0) {
    recommendations.push({
      id: 'good-performance',
      priority: 'good',
      message: '性能表现良好，继续保持'
    })
  }

  return recommendations
})

/**
 * 启动性能监控
 * 开始收集FPS、内存等性能指标，并设置定时更新
 */
const startMonitoring = () => {
  if (monitorInterval) return

  // 启动FPS监控
  const measureFps = () => {
    // 只有在页面可见时才进行FPS测量
    if (!isPageVisible) {
      animationFrameId = requestAnimationFrame(measureFps)
      return
    }

    const now = performance.now()
    const deltaTime = now - lastFrameTime

    if (lastFrameTime !== 0) {
      const fps = 1000 / deltaTime
      currentFps.value = Math.round(fps)
      fpsHistory.value.push(currentFps.value)

      // 优化的历史记录管理：定期清理而不是每次都检查
      if (fpsHistory.value.length > 100) {
        // 保留最近80%的数据，清理20%的旧数据
        const keepCount = Math.floor(fpsHistory.value.length * 0.8)
        fpsHistory.value = fpsHistory.value.slice(-keepCount)
      }
    }

    lastFrameTime = now
    frameCount++
    animationFrameId = requestAnimationFrame(measureFps)
  }

  // 启动常规指标监控
  monitorInterval = setInterval(() => {
    // 只有在页面可见时才更新性能指标
    if (isPageVisible) {
      updatePerformanceMetrics()
    }
  }, props.updateInterval)

  // 设置页面可见性监听
  if (typeof document !== 'undefined' && 'visibilityState' in document) {
    visibilityListener = () => {
      isPageVisible = !document.hidden

      // 页面变为可见时，重置时间戳以避免FPS计算错误
      if (isPageVisible) {
        lastFrameTime = performance.now()
      }
    }

    document.addEventListener('visibilitychange', visibilityListener)
  }

  // 开始FPS测量
  if (props.autoStart) {
    measureFps()
  }
}

/**
 * 停止性能监控
 * 清除定时器、动画帧和事件监听器，停止数据收集
 */
const stopMonitoring = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }

  if (monitorInterval) {
    clearInterval(monitorInterval)
    monitorInterval = null
  }

  // 清理页面可见性监听器
  if (visibilityListener && typeof document !== 'undefined') {
    document.removeEventListener('visibilitychange', visibilityListener)
    visibilityListener = null
  }

  // 重置状态
  isPageVisible = true
}

/**
 * 更新性能指标
 * 收集当前FPS、内存使用等性能数据并更新历史记录
 */
const updatePerformanceMetrics = () => {
  // 获取内存信息
  if ('memory' in performance) {
    const memInfo = performance.memory
    memoryUsage.value = memInfo.usedJSHeapSize
    memoryHistory.value.push(memoryUsage.value)
    maxMemoryUsage.value = Math.max(maxMemoryUsage.value, memoryUsage.value)

    // 优化的历史记录管理：批量清理而不是逐个移除
    if (memoryHistory.value.length > 100) {
      // 保留最近80%的数据，避免频繁的内存分配
      const keepCount = Math.floor(memoryHistory.value.length * 0.8)
      memoryHistory.value = memoryHistory.value.slice(-keepCount)
    }
  }

  // 获取AssetManager性能统计
  const assetManager = getAssetManager()
  if (assetManager && assetManager.getPerformanceStats) {
    const stats = assetManager.getPerformanceStats()
    cacheHitRate.value = parseFloat(stats.cacheHitRate) || 0
  }

  // 计算渲染时间（模拟）
  const renderEndTime = performance.now()
  renderTime.value = renderEndTime - renderStartTime
  renderStartTime = renderEndTime

  // 触发更新事件
  emit('metrics-updated', {
    fps: currentFps.value,
    memory: memoryUsage.value,
    renderTime: renderTime.value,
    cacheHitRate: cacheHitRate.value
  })

  // 检查是否需要性能警告
  if (currentFps.value < 25 || memoryUsage.value > 100 * 1024 * 1024) {
    emit('performance-alert', {
      type: 'critical',
      message: '检测到严重性能问题',
      metrics: {
        fps: currentFps.value,
        memory: memoryUsage.value
      }
    })
  }
}

// UI控制方法
/**
 * 切换面板最小化状态
 * 在展开和最小化之间切换监控面板显示
 */
const toggleMinimized = () => {
  minimized.value = !minimized.value
}

/**
 * 清除所有性能统计数据
 * 重置FPS历史、内存历史等统计数据
 */
const clearStats = () => {
  fpsHistory.value = []
  memoryHistory.value = []
  maxMemoryUsage.value = 0
  ElMessage.success('性能统计已清除')
}

const exportReport = () => {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      averageFps: averageFps.value,
      maxMemoryUsage: maxMemoryUsage.value,
      averageRenderTime: renderTime.value,
      cacheHitRate: cacheHitRate.value
    },
    history: {
      fps: fpsHistory.value,
      memory: memoryHistory.value
    },
    recommendations: performanceRecommendations.value
  }

  const blob = new Blob([JSON.stringify(report, null, 2)], {
    type: 'application/json'
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `performance-report-${Date.now()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  ElMessage.success('性能报告已导出')
}

// 状态判断方法
const getOverallStatus = () => {
  const recommendations = performanceRecommendations.value
  const hasHighPriority = recommendations.some(r => r.priority === 'high')

  if (hasHighPriority) return 'danger'
  if (recommendations.some(r => r.priority === 'medium')) return 'warning'
  return 'success'
}

/**


 * getOverallStatusText 函数


 * VidSlide AI 功能实现


 */

const getOverallStatusText = () => {
  const status = getOverallStatus()
  const statusMap = {
    success: '良好',
    warning: '一般',
    danger: '需优化'
  }
  return statusMap[status] || '未知'
}

/**


 * getFpsStatus 函数


 * VidSlide AI 功能实现


 */

const getFpsStatus = () => {
  if (currentFps.value >= 50) return 'good'
  if (currentFps.value >= 30) return 'warning'
  return 'danger'
}

/**


 * getFpsStatusText 函数


 * VidSlide AI 功能实现


 */

const getFpsStatusText = () => {
  const status = getFpsStatus()
  const statusMap = {
    good: '流畅',
    warning: '一般',
    danger: '卡顿'
  }
  return statusMap[status] || '未知'
}

/**


 * getMemoryStatus 函数


 * VidSlide AI 功能实现


 */

const getMemoryStatus = () => {
  const mb = memoryUsage.value / (1024 * 1024)
  if (mb < 30) return 'good'
  if (mb < 70) return 'warning'
  return 'danger'
}

/**


 * getMemoryStatusText 函数


 * VidSlide AI 功能实现


 */

const getMemoryStatusText = () => {
  const status = getMemoryStatus()
  const statusMap = {
    good: '正常',
    warning: '偏高',
    danger: '过高'
  }
  return statusMap[status] || '未知'
}

/**


 * getRenderStatus 函数


 * VidSlide AI 功能实现


 */

const getRenderStatus = () => {
  if (renderTime.value < 8.33) return 'good' // 120fps
  if (renderTime.value < 16.67) return 'warning' // 60fps
  return 'danger'
}

const getRenderStatusText = () => {
  const status = getRenderStatus()
  const statusMap = {
    good: '优秀',
    warning: '良好',
    danger: '需优化'
  }
  return statusMap[status] || '未知'
}

/**


 * getCacheStatus 函数


 * VidSlide AI 功能实现


 */

const getCacheStatus = () => {
  if (cacheHitRate.value >= 80) return 'good'
  if (cacheHitRate.value >= 60) return 'warning'
  return 'danger'
}

/**


 * getCacheStatusText 函数


 * VidSlide AI 功能实现


 */

const getCacheStatusText = () => {
  const status = getCacheStatus()
  const statusMap = {
    good: '高效',
    warning: '一般',
    danger: '需优化'
  }
  return statusMap[status] || '未知'
}

const getRecommendationIcon = priority => {
  const iconMap = {
    high: 'text-red-500',
    medium: 'text-yellow-500',
    good: 'text-green-500'
  }
  return iconMap[priority] || 'text-gray-500'
}

// 工具函数
const formatMemory = bytes => {
  if (!bytes) return '0 MB'
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(1)} MB`
}

// 生命周期
onMounted(() => {
  if (props.autoStart) {
    startMonitoring()
  }
})

onUnmounted(() => {
  stopMonitoring()
})

// 暴露方法给父组件
defineExpose({
  startMonitoring,
  stopMonitoring,
  getMetrics: () => ({
    fps: currentFps.value,
    memory: memoryUsage.value,
    renderTime: renderTime.value,
    cacheHitRate: cacheHitRate.value
  })
})
</script>

<style scoped>
.performance-monitor {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 350px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 1000;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  transition: all 0.3s ease;
}

.performance-monitor.minimized {
  width: 60px;
  height: 60px;
  cursor: pointer;
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.monitor-header:hover {
  background: rgba(0, 0, 0, 0.05);
}

.monitor-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
}

.minimized .monitor-title {
  display: none;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.monitor-content {
  padding: 16px;
  max-height: 500px;
  overflow-y: auto;
}

.metrics-section,
.charts-section,
.recommendations-section {
  margin-bottom: 20px;
}

.section-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.metric-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 122, 255, 0.1);
  border-radius: 6px;
  color: #007aff;
}

.metric-info {
  flex: 1;
}

.metric-value {
  font-size: 18px;
  font-weight: 700;
  color: #1d1d1f;
  line-height: 1;
}

.metric-label {
  font-size: 12px;
  color: #86868b;
  margin-top: 2px;
}

.metric-status {
  font-size: 11px;
  font-weight: 500;
  margin-top: 2px;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}

.metric-status.good {
  background: rgba(103, 194, 58, 0.1);
  color: #67c23a;
}

.metric-status.warning {
  background: rgba(230, 162, 60, 0.1);
  color: #e6a23c;
}

.metric-status.danger {
  background: rgba(245, 108, 108, 0.1);
  color: #f56c6c;
}

.charts-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.chart-item {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
  color: #86868b;
}

.chart-value {
  font-weight: 600;
  color: #1d1d1f;
}

.chart-visual {
  height: 40px;
  display: flex;
  align-items: end;
  gap: 2px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  padding: 4px;
}

.chart-bar {
  flex: 1;
  background: linear-gradient(180deg, #007aff 0%, #007aff 100%);
  border-radius: 2px;
  min-height: 4px;
  transition: height 0.3s ease;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recommendation-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  font-size: 12px;
  line-height: 1.4;
}

.recommendation-item.high {
  background: rgba(245, 108, 108, 0.1);
  border-left: 3px solid #f56c6c;
}

.recommendation-item.medium {
  background: rgba(230, 162, 60, 0.1);
  border-left: 3px solid #e6a23c;
}

.recommendation-item.good {
  background: rgba(103, 194, 58, 0.1);
  border-left: 3px solid #67c23a;
}

.monitor-controls {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .performance-monitor {
    bottom: 10px;
    right: 10px;
    width: 300px;
  }

  .performance-monitor.minimized {
    width: 50px;
    height: 50px;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .monitor-content {
    padding: 12px;
    max-height: 400px;
  }
}

@media (max-width: 480px) {
  .performance-monitor {
    width: calc(100vw - 20px);
    max-width: 350px;
  }

  .charts-container {
    grid-template-columns: 1fr;
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .performance-monitor {
    border-width: 2px;
  }

  .metric-card,
  .chart-item {
    border-width: 2px;
  }

  .metric-status {
    font-weight: 700;
  }
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .performance-monitor,
  .chart-bar {
    transition: none;
  }
}
</style>
