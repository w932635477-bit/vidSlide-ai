<template>
  <header class="browser-header" role="banner">
    <div class="header-left">
      <h1 id="asset-browser-title">素材浏览器</h1>
      <el-tag :type="statusColor" size="small" aria-label="浏览器状态">
        {{ statusText }}
      </el-tag>
    </div>

    <div class="header-actions" role="toolbar" aria-label="浏览器操作">
      <el-button
        type="primary"
        size="small"
        :loading="isLoading"
        aria-label="刷新素材列表"
        @click="$emit('refresh')"
      >
        <el-icon aria-hidden="true">
          <RefreshRight />
        </el-icon>
        刷新
      </el-button>

      <el-button type="success" size="small" aria-label="上传本地素材文件" @click="$emit('upload')">
        <el-icon aria-hidden="true">
          <Upload />
        </el-icon>
        上传本地
      </el-button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { RefreshRight, Upload } from '@element-plus/icons-vue'

const props = defineProps({
  status: {
    type: Object,
    required: true
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['refresh', 'upload'])

const statusColor = computed(() => {
  if (props.status.initialized) return 'success'
  if (props.status.storage) return 'warning'
  return 'danger'
})

const statusText = computed(() => {
  if (props.status.initialized) return '就绪'
  if (props.status.storage) return '初始化中'
  return '未初始化'
})
</script>

<style scoped>
.browser-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e5ea;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #f2f2f7 0%, #ffffff 100%);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-left h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: -0.022em;
}

.header-actions {
  display: flex;
  gap: 12px;
}
</style>
