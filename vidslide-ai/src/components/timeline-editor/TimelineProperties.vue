<template>
  <div class="timeline-properties" v-if="selectedItem">
    <div class="properties-header">
      <h3>{{ getItemTitle() }}</h3>
      <el-button
        size="small"
        icon="Close"
        @click="$emit('close')"
        title="关闭属性面板"
      />
    </div>

    <el-scrollbar class="properties-content">
      <!-- 片段属性 -->
      <div v-if="selectedItem.type === 'clip'" class="property-section">
        <h4>基本信息</h4>
        
        <div class="property-field">
          <label>名称</label>
          <el-input
            :model-value="selectedItem.data.name"
            @update:model-value="updateProperty('name', $event)"
            size="small"
          />
        </div>

        <div class="property-field">
          <label>类型</label>
          <el-tag size="small">{{ getClipTypeLabel(selectedItem.data.type) }}</el-tag>
        </div>

        <div class="property-field">
          <label>开始时间 (秒)</label>
          <el-input-number
            :model-value="selectedItem.data.startTime"
            @update:model-value="updateProperty('startTime', $event)"
            :min="0"
            :step="0.1"
            :precision="2"
            size="small"
          />
        </div>

        <div class="property-field">
          <label>结束时间 (秒)</label>
          <el-input-number
            :model-value="selectedItem.data.endTime"
            @update:model-value="updateProperty('endTime', $event)"
            :min="selectedItem.data.startTime + 0.1"
            :step="0.1"
            :precision="2"
            size="small"
          />
        </div>

        <div class="property-field">
          <label>持续时间</label>
          <span class="property-value">
            {{ (selectedItem.data.endTime - selectedItem.data.startTime).toFixed(2) }}秒
          </span>
        </div>
      </div>

      <!-- 关键帧属性 -->
      <div v-if="selectedItem.type === 'keyframe'" class="property-section">
        <h4>关键帧属性</h4>

        <div class="property-field">
          <label>时间 (秒)</label>
          <el-input-number
            :model-value="selectedItem.data.time"
            @update:model-value="updateProperty('time', $event)"
            :min="0"
            :step="0.1"
            :precision="2"
            size="small"
          />
        </div>

        <div class="property-field">
          <label>属性</label>
          <el-select
            :model-value="selectedItem.data.property"
            @update:model-value="updateProperty('property', $event)"
            size="small"
          >
            <el-option label="位置 X" value="x" />
            <el-option label="位置 Y" value="y" />
            <el-option label="缩放" value="scale" />
            <el-option label="旋转" value="rotation" />
            <el-option label="不透明度" value="opacity" />
          </el-select>
        </div>

        <div class="property-field">
          <label>值</label>
          <el-input-number
            :model-value="selectedItem.data.value"
            @update:model-value="updateProperty('value', $event)"
            :step="0.1"
            :precision="2"
            size="small"
          />
        </div>

        <div class="property-field">
          <label>缓动函数</label>
          <el-select
            :model-value="selectedItem.data.easing || 'linear'"
            @update:model-value="updateProperty('easing', $event)"
            size="small"
          >
            <el-option label="线性" value="linear" />
            <el-option label="缓入" value="ease-in" />
            <el-option label="缓出" value="ease-out" />
            <el-option label="缓入缓出" value="ease-in-out" />
            <el-option label="弹性" value="elastic" />
            <el-option label="反弹" value="bounce" />
          </el-select>
        </div>
      </div>

      <!-- 变换属性 -->
      <div v-if="selectedItem.data.transform" class="property-section">
        <h4>变换</h4>

        <div class="property-field">
          <label>位置 X</label>
          <el-slider
            :model-value="selectedItem.data.transform.x || 0"
            @update:model-value="updateTransform('x', $event)"
            :min="-1000"
            :max="1000"
            :step="1"
          />
        </div>

        <div class="property-field">
          <label>位置 Y</label>
          <el-slider
            :model-value="selectedItem.data.transform.y || 0"
            @update:model-value="updateTransform('y', $event)"
            :min="-1000"
            :max="1000"
            :step="1"
          />
        </div>

        <div class="property-field">
          <label>缩放</label>
          <el-slider
            :model-value="selectedItem.data.transform.scale || 1"
            @update:model-value="updateTransform('scale', $event)"
            :min="0.1"
            :max="3"
            :step="0.1"
          />
        </div>

        <div class="property-field">
          <label>旋转 (度)</label>
          <el-slider
            :model-value="selectedItem.data.transform.rotation || 0"
            @update:model-value="updateTransform('rotation', $event)"
            :min="-180"
            :max="180"
            :step="1"
          />
        </div>

        <div class="property-field">
          <label>不透明度</label>
          <el-slider
            :model-value="selectedItem.data.transform.opacity || 1"
            @update:model-value="updateTransform('opacity', $event)"
            :min="0"
            :max="1"
            :step="0.01"
          />
        </div>
      </div>

      <!-- 关键帧管理 -->
      <div class="property-section">
        <h4>关键帧</h4>
        
        <el-button
          type="primary"
          size="small"
          icon="Plus"
          @click="$emit('add-keyframe')"
          style="width: 100%"
        >
          在当前时间添加关键帧
        </el-button>

        <div v-if="selectedItem.data.keyframes && selectedItem.data.keyframes.length > 0" class="keyframe-list">
          <div
            v-for="(kf, index) in selectedItem.data.keyframes"
            :key="index"
            class="keyframe-item"
          >
            <span>{{ kf.property }} @ {{ kf.time.toFixed(2) }}s</span>
            <el-button
              size="small"
              icon="Delete"
              @click="$emit('delete-keyframe', index)"
            />
          </div>
        </div>
      </div>
    </el-scrollbar>
  </div>

  <div v-else class="no-selection">
    <el-empty description="未选择任何项目">
      <template #image>
        <div style="font-size: 48px">🎬</div>
      </template>
    </el-empty>
  </div>
</template>

<script setup>
const props = defineProps({
  selectedItem: {
    type: Object,
    default: null
  }
})

const emit = defineEmits([
  'update-property',
  'close',
  'add-keyframe',
  'delete-keyframe'
])

const getItemTitle = () => {
  if (!props.selectedItem) return ''
  if (props.selectedItem.type === 'clip') {
    return `片段: ${props.selectedItem.data.name}`
  }
  if (props.selectedItem.type === 'keyframe') {
    return '关键帧属性'
  }
  return '属性'
}

const getClipTypeLabel = (type) => {
  const labels = {
    video: '视频',
    audio: '音频',
    image: '图片',
    text: '文本',
    effect: '效果'
  }
  return labels[type] || type
}

const updateProperty = (key, value) => {
  emit('update-property', { key, value })
}

const updateTransform = (key, value) => {
  emit('update-property', { 
    key: 'transform', 
    value: {
      ...props.selectedItem.data.transform,
      [key]: value
    }
  })
}
</script>

<style scoped>
.timeline-properties {
  width: 320px;
  height: 100%;
  background: rgba(30, 30, 30, 0.95);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
}

.properties-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.properties-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.properties-content {
  flex: 1;
  padding: 16px;
}

.property-section {
  margin-bottom: 24px;
}

.property-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.property-field {
  margin-bottom: 16px;
}

.property-field label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.property-value {
  display: block;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}

.keyframe-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.keyframe-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}

.no-selection {
  width: 320px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(30, 30, 30, 0.95);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
