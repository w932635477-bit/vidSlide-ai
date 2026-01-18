<!--
  LayoutTestPage.vue - 测试新布局的页面
-->
<template>
  <div>
    <!-- 样式测试指示器 -->
    <StyleTestIndicator />

    <WorkspaceLayout
      :asset-panel-collapsed="assetPanelCollapsed"
      :property-panel-collapsed="propertyPanelCollapsed"
      :timeline-height="timelineHeight"
      @update:asset-panel-collapsed="assetPanelCollapsed = $event"
      @update:property-panel-collapsed="propertyPanelCollapsed = $event"
      @update:timeline-height="timelineHeight = $event"
    >
      <!-- Header Slot -->
      <template #header>
        <WorkspaceHeader />
      </template>

      <!-- Asset Panel Slot -->
      <template #asset-panel>
        <AssetPanel
          :projects="testProjects"
          :videos="testVideos"
          :images="testImages"
          :audios="testAudios"
          :can-generate="canGenerate"
          @auto-generate="handleAutoGenerate"
          @open-project="handleOpenProject"
          @upload-video="handleUploadVideo"
          @upload-image="handleUploadImage"
          @upload-audio="handleUploadAudio"
          @select-asset="handleSelectAsset"
        />
      </template>

      <!-- Preview Canvas Slot -->
      <template #preview-canvas>
        <PreviewCanvas />
      </template>

      <!-- Property Panel Slot -->
      <template #property-panel>
        <PropertyPanel />
      </template>

      <!-- Timeline Slot -->
      <template #timeline>
        <TimelinePanel />
      </template>
    </WorkspaceLayout>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import StyleTestIndicator from '@/components/StyleTestIndicator.vue'
import WorkspaceLayout from '@/components/workspace/WorkspaceLayout.vue'
import WorkspaceHeader from '@/components/workspace/WorkspaceHeader.vue'
import AssetPanel from '@/components/workspace/AssetPanel.vue'
import PreviewCanvas from '@/components/workspace/PreviewCanvas.vue'
import PropertyPanel from '@/components/workspace/PropertyPanel.vue'
import TimelinePanel from '@/components/workspace/TimelinePanel.vue'
import { ElMessage } from 'element-plus'

// 布局状态
const assetPanelCollapsed = ref(false)
const propertyPanelCollapsed = ref(false)
const timelineHeight = ref('200px')

// 测试数据
const testProjects = ref([
  {
    id: 1,
    name: '产品介绍视频',
    thumbnail: null,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60) // 1小时前
  },
  {
    id: 2,
    name: '教程视频项目',
    thumbnail: null,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1天前
  },
  {
    id: 3,
    name: '营销视频',
    thumbnail: null,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) // 3天前
  }
])

const testVideos = ref([
  {
    id: 1,
    name: 'sample-video-1.mp4',
    thumbnail: 'https://via.placeholder.com/320x180',
    duration: 125
  },
  {
    id: 2,
    name: 'sample-video-2.mp4',
    thumbnail: 'https://via.placeholder.com/320x180',
    duration: 89
  }
])

const testImages = ref([
  {
    id: 1,
    name: 'image-1.jpg',
    url: 'https://via.placeholder.com/300'
  },
  {
    id: 2,
    name: 'image-2.jpg',
    url: 'https://via.placeholder.com/300'
  },
  {
    id: 3,
    name: 'image-3.jpg',
    url: 'https://via.placeholder.com/300'
  },
  {
    id: 4,
    name: 'image-4.jpg',
    url: 'https://via.placeholder.com/300'
  }
])

const testAudios = ref([
  {
    id: 1,
    name: 'background-music.mp3',
    duration: 180
  },
  {
    id: 2,
    name: 'sound-effect.mp3',
    duration: 5
  }
])

const canGenerate = ref(true)

// 事件处理
const handleAutoGenerate = () => {
  ElMessage.success('🚀 开始一键自动生成!')
  console.log('一键自动生成')
}

const handleOpenProject = project => {
  ElMessage.info(`打开项目: ${project.name}`)
  console.log('打开项目:', project)
}

const handleUploadVideo = () => {
  ElMessage.info('上传视频')
  console.log('上传视频')
}

const handleUploadImage = () => {
  ElMessage.info('上传图片')
  console.log('上传图片')
}

const handleUploadAudio = () => {
  ElMessage.info('上传音频')
  console.log('上传音频')
}

const handleSelectAsset = asset => {
  ElMessage.success(`选中素材: ${asset.name}`)
  console.log('选中素材:', asset)
}
</script>

<style scoped>
/* 页面级样式 */
</style>
