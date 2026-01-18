<template>
  <div
    class="requirement-card"
    :class="{
      'high-priority': requirement.priority === 'high',
      'medium-priority': requirement.priority === 'medium',
      'low-priority': requirement.priority === 'low'
    }"
    role="button"
    tabindex="0"
    @click="$emit('select', requirement)"
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
          <span v-if="requirement.relatedKeywords.length > 3" class="keyword-more">
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
        title="搜索相关素材"
        @click.stop="$emit('search', requirement)"
      >
        🔍
      </button>

      <button class="action-btn add-btn" title="添加到画布" @click.stop="$emit('add', requirement)">
        ➕
      </button>

      <button class="action-btn info-btn" title="查看详情" @click.stop="$emit('info', requirement)">
        ℹ️
      </button>
    </div>

    <!-- 选中状态指示器 -->
    <div v-if="isSelected" class="selection-indicator" aria-hidden="true">✓</div>
  </div>
</template>

<script setup>
defineProps({
  requirement: {
    type: Object,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  }
})

defineEmits(['select', 'search', 'add', 'info'])

const getTypeIcon = type => {
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

const getTypeDisplayName = type => {
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

const getPriorityDisplayName = priority => {
  const names = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级'
  }
  return names[priority] || priority
}
</script>

<style scoped>
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

.requirement-card.high-priority {
  border-left: 3px solid rgba(255, 59, 48, 0.8);
}

.requirement-card.medium-priority {
  border-left: 3px solid rgba(255, 149, 0, 0.8);
}

.requirement-card.low-priority {
  border-left: 3px solid rgba(142, 142, 147, 0.8);
}

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
  font-size: 16px;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

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
</style>
