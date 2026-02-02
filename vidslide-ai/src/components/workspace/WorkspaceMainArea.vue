<!--
  ⚠️ 设计保护区域 - 请勿随意修改

  此组件为工作区核心设计的一部分，任何修改都需要项目负责人批准。

  受保护的内容：
  - 布局结构（视频区域 + 时间轴）
  - 按钮位置（一键生成、预览操作按钮）
  - 时间轴显示逻辑（始终显示）

  参考文档：WORKSPACE_DESIGN_PROTECTION.md
  修改流程：DESIGN_PROTECTION_README.md
-->
<template>
  <div class="workspace-main-area">
    <!-- 视频预览区 / 生成预览区 -->
    <div class="video-section" :class="{ 'vertical-video': isVerticalVideo }">
      <!-- 原始视频预览 -->
      <div v-if="!showGeneratedPreview" class="editor-canvas">
        <video
          v-if="videoSrc"
          ref="videoElement"
          :src="videoSrc"
          class="preview-video"
          :class="{ vertical: isVerticalVideo }"
          controls
          @loadedmetadata="onVideoLoaded"
          @timeupdate="onTimeUpdate"
          @play="onPlay"
          @pause="onPause"
        ></video>

        <!-- 一键生成按钮（剪映风格） -->
        <button
          v-if="videoSrc && !isGenerating"
          class="auto-generate-btn"
          title="一键生成视频"
          @click="$emit('auto-generate')"
        >
          <span class="btn-icon">✨</span>
          <span class="btn-text">一键生成</span>
        </button>

        <!-- 生成中提示 -->
        <div v-if="isGenerating" class="generating-overlay">
          <div class="generating-content">
            <div class="generating-spinner"></div>
            <div class="generating-text">正在生成中...</div>
            <div class="generating-tip">请在右侧监控台查看进度</div>
          </div>
        </div>

        <!-- 画中画预览 -->
        <div v-if="pipEnabled && videoSrc" class="pip-overlay">
          <div class="pip-window" :style="pipStyle">
            <video :src="videoSrc" class="pip-video" muted></video>
          </div>
        </div>

        <!-- 质量控制按钮 -->
        <button
          v-if="videoSrc"
          class="quality-control-toggle"
          title="质量控制"
          @click="toggleQualityControl"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="3" />
            <path
              d="M12 1v6m0 6v6m-5.2-9.8l4.2 4.2m4.2 4.2l4.2 4.2m-16.8 0l4.2-4.2m4.2-4.2l4.2-4.2"
            />
          </svg>
        </button>

        <!-- 质量控制面板 -->
        <PreviewQualityControl
          v-if="showQualityControl"
          :resolution="previewResolution"
          :quality="previewQuality"
          :optimizations="previewOptimizations"
          @update:resolution="updateResolution"
          @update:quality="updateQuality"
          @update:optimizations="updateOptimizations"
          @close="toggleQualityControl"
        />
      </div>

      <!-- 生成预览（替换视频区域，但保留时间轴） -->
      <div v-else class="preview-canvas">
        <GeneratedPreview
          ref="generatedPreviewElement"
          :video-src="generatedVideoSrc"
          :ppt-slides="generatedPptSlides"
          :generation-time="generationTime"
          :file-size="generatedFileSize"
          :remotion-props="generatedRemotionProps"
          @switch-to-original="showGeneratedPreview = false"
          @download-ppt="handleDownloadPpt"
          @export-video="handleExportVideo"
          @play="onPlay"
          @pause="onPause"
          @timeupdate="onTimeUpdate"
          @loadedmetadata="onVideoLoaded"
        />

        <!-- 预览操作按钮组（右下角） -->
        <div class="preview-action-buttons">
          <button
            class="preview-action-btn"
            title="返回原视频"
            @click="showGeneratedPreview = false"
          >
            <span>🔙</span>
            <span>返回原视频</span>
          </button>
          <button class="preview-action-btn primary" title="下载PPT" @click="handleDownloadPpt">
            <span>📥</span>
            <span>下载PPT</span>
          </button>
          <button class="preview-action-btn primary" title="导出视频" @click="handleExportVideo">
            <span>🎬</span>
            <span>导出视频</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 简化Timeline（始终显示） -->
    <SimplifiedTimeline
      v-if="videoSrc"
      :clips="timelineClips"
      :current-time="currentTime"
      :duration="duration"
      :is-playing="isPlaying"
      @seek-to-time="handleSeekToTime"
      @toggle-play="togglePlayPause"
      @add-effect="handleAddEffect"
      @edit-effect="handleEditEffect"
      @delete-effect="handleDeleteEffect"
      @copy-effect="handleCopyEffect"
      @apply-suggestion="handleApplySuggestion"
      @toggle-effect="handleToggleEffect"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import PreviewQualityControl from '../PreviewQualityControl.vue'
import GeneratedPreview from './GeneratedPreview.vue'
import SimplifiedTimeline from './SimplifiedTimeline.vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  isGenerating: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['auto-generate', 'ppt-slides-updated'])

const store = useWorkspaceStore()
const videoElement = ref(null)
const generatedPreviewElement = ref(null)

// 时间轴状态
const currentTime = ref(0)
const duration = ref(0)
const isPlaying = ref(false)
const videoFileName = ref('当前视频')

// 生成预览状态
const showGeneratedPreview = ref(false)
const generatedVideoSrc = ref('')
const generatedPptSlides = ref([])
const generationTime = ref('')
const generatedFileSize = ref(0)
const generatedRemotionProps = ref(null) // 新增：Remotion预览参数

// 计算属性
const videoSrc = computed(() => store.video.src)
const isVerticalVideo = computed(() => store.isVerticalVideo)
const pipEnabled = computed(() => store.pip.enabled)
const showQualityControl = computed(() => store.ui.showQualityControl)
const previewResolution = computed(() => store.preview.resolution)
const previewQuality = computed(() => store.preview.quality)
const previewOptimizations = computed(() => store.preview.optimizations)
const isGenerating = computed(() => store.isGenerating || false)

// 画中画样式
const pipStyle = computed(() => {
  const settings = store.pip.settings
  const position = settings.position || 'top-right'
  const size = settings.size || 25

  const positions = {
    'top-left': { top: '20px', left: '20px' },
    'top-right': { top: '20px', right: '20px' },
    'bottom-left': { bottom: '20px', left: '20px' },
    'bottom-right': { bottom: '20px', right: '20px' }
  }

  return {
    ...positions[position],
    width: `${size}%`,
    aspectRatio: '16/9'
  }
})

// Timeline clips 数据（转换为简化格式）
const timelineClips = computed(() => {
  const timeline = store.multiAgent.timeline
  if (!timeline || !timeline.clips) return []

  return timeline.clips.map((clip, index) => {
    // ⭐ 修复：使用 clip.type 而不是 clip.sceneType（与新架构一致）
    const clipType = clip.type || clip.sceneType || 'original'
    const isMultiLayer = clipType === 'multi-layer-composition' ||
                         clipType === 'card-group' ||
                         clipType === 'video-with-card' ||
                         (clip.layers && clip.layers.length > 0)

    // 根据场景类型生成效果列表
    let effects = []
    if (clipType === 'multi-layer-composition') {
      effects = [
        { icon: '🖼️', name: '背景图片', enabled: true },
        { icon: '📝', name: '文字卡片', enabled: true },
        { icon: '👤', name: '画中画', enabled: true }
      ]
    } else if (clipType === 'card-group') {
      effects = [
        { icon: '📝', name: '卡片组', enabled: true, count: clip.cards?.length || 0 }
      ]
    } else if (clipType === 'video-with-card') {
      effects = [
        { icon: '📝', name: '文字卡片', enabled: true }
      ]
    }

    return {
      id: clip.id || `clip-${index}`,
      start: clip.startTime || clip.start || 0,
      duration: clip.duration || (clip.endTime - clip.startTime) || 0,
      type: isMultiLayer ? 'effect' : 'original',
      sceneType: clipType,  // ⭐ 保留原始场景类型
      effects: effects,
      keyword: clip.keyword || clip.keywordObj?.text || '',
      cards: clip.cards || [],
      suggestion: {
        show: false,
        message: ''
      }
    }
  })
})

// Timeline 事件处理
const handleSeekToTime = (time) => {
  store.updateVideoTime(time)
  if (store.video.element) {
    store.video.element.currentTime = time
  }
}

const handleAddEffect = (clip) => {
  console.log('添加特效:', clip)
  ElMessage.info('特效模板选择功能开发中...')
  // TODO: 打开模板选择对话框
}

const handleEditEffect = (clip) => {
  console.log('编辑特效:', clip)
  ElMessage.info('特效编辑功能开发中...')
  // TODO: 打开编辑面板
}

const handleDeleteEffect = (clip) => {
  console.log('删除特效:', clip)
  ElMessage.warning('确定要删除这个特效吗？')
  // TODO: 确认并删除
}

const handleCopyEffect = (clip) => {
  console.log('复制特效:', clip)
  ElMessage.success('特效已复制')
  // TODO: 复制到剪贴板
}

const handleApplySuggestion = (clip) => {
  console.log('应用建议:', clip)
  ElMessage.info('AI建议功能开发中...')
  // TODO: 调用后端API应用建议
}

const handleToggleEffect = (clip, effect) => {
  console.log('切换特效:', clip, effect)
  ElMessage.success(`${effect.name} 已${effect.enabled ? '关闭' : '开启'}`)
  // TODO: 更新特效开关状态
}

// 切换播放/暂停
const togglePlayPause = () => {
  let currentVideo = null

  // 根据当前模式选择正确的视频元素
  if (showGeneratedPreview.value && generatedPreviewElement.value) {
    // 预览模式：获取 GeneratedPreview 组件中的视频元素
    currentVideo = generatedPreviewElement.value.$refs.videoElement
  } else if (videoElement.value) {
    // 原始视频模式
    currentVideo = videoElement.value
  }

  if (!currentVideo) return

  if (isPlaying.value) {
    currentVideo.pause()
  } else {
    currentVideo.play()
  }
}

// 视频加载完成
const onVideoLoaded = event => {
  const video = event.target
  duration.value = video.duration
  videoFileName.value = store.video.name || '当前视频'

  store.setVideo({
    duration: video.duration,
    width: video.videoWidth,
    height: video.videoHeight,
    element: video
  })
  console.log('✅ 视频加载完成:', {
    duration: video.duration,
    width: video.videoWidth,
    height: video.videoHeight
  })
}

// 时间更新
const onTimeUpdate = event => {
  currentTime.value = event.target.currentTime
  store.updateVideoTime(event.target.currentTime)
}

// 播放
const onPlay = () => {
  isPlaying.value = true
  store.video.isPlaying = true
}

// 暂停
const onPause = () => {
  isPlaying.value = false
  store.video.isPlaying = false
}

// 切换质量控制
const toggleQualityControl = () => {
  store.ui.showQualityControl = !store.ui.showQualityControl
}

// 更新分辨率
const updateResolution = resolution => {
  store.preview.resolution = resolution
}

// 更新质量
const updateQuality = quality => {
  store.preview.quality = quality
}

// 更新优化选项
const updateOptimizations = optimizations => {
  store.preview.optimizations = optimizations
}

// 下载PPT
const handleDownloadPpt = () => {
  if (!generatedPptSlides.value || generatedPptSlides.value.length === 0) {
    ElMessage.warning('没有可下载的PPT')
    return
  }

  try {
    // 创建一个简单的PPT下载链接
    // 实际项目中，这里应该调用后端API生成真实的PPT文件
    ElMessage.success({
      message: `正在准备下载 ${generatedPptSlides.value.length} 页PPT...`,
      duration: 2000
    })

    // 模拟下载延迟
    setTimeout(() => {
      // 这里应该触发真实的文件下载
      // 例如：window.location.href = pptDownloadUrl
      ElMessage.info('PPT下载功能需要后端支持，当前为演示模式')
    }, 1000)
  } catch (error) {
    console.error('下载PPT失败:', error)
    ElMessage.error('下载PPT失败')
  }
}

// 导出视频
const handleExportVideo = async () => {
  if (!generatedVideoSrc.value) {
    ElMessage.warning('没有可导出的视频')
    return
  }

  try {
    ElMessage.info('正在准备下载视频...')

    let downloadUrl = generatedVideoSrc.value
    let shouldRevoke = false

    // 如果是HTTP URL，需要先fetch数据再创建blob URL
    if (generatedVideoSrc.value.startsWith('http://') || generatedVideoSrc.value.startsWith('https://')) {
      console.log('📥 从服务器获取视频数据:', generatedVideoSrc.value)

      const response = await fetch(generatedVideoSrc.value)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const blob = await response.blob()
      downloadUrl = URL.createObjectURL(blob)
      shouldRevoke = true

      console.log('✅ 视频数据获取成功，大小:', (blob.size / 1024 / 1024).toFixed(2), 'MB')
    }

    // 创建下载链接
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `vidslide-generated-${Date.now()}.mp4`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // 如果创建了临时blob URL，需要释放
    if (shouldRevoke) {
      setTimeout(() => {
        URL.revokeObjectURL(downloadUrl)
      }, 100)
    }

    ElMessage.success('视频导出成功')
  } catch (error) {
    console.error('导出视频失败:', error)
    ElMessage.error(`导出视频失败: ${error.message}`)
  }
}

// 显示生成预览（供外部调用）
const showPreview = (videoSrc, pptSlides = [], time = '', fileSize = 0, remotionProps = null) => {
  console.log('🎬 WorkspaceMainArea.showPreview 被调用')
  console.log('  - videoSrc:', videoSrc)
  console.log('  - pptSlides:', pptSlides)
  console.log('  - remotionProps:', remotionProps)
  console.log('  - 当前 showGeneratedPreview:', showGeneratedPreview.value)

  generatedVideoSrc.value = videoSrc
  generatedPptSlides.value = pptSlides
  generationTime.value = time
  generatedFileSize.value = fileSize
  generatedRemotionProps.value = remotionProps // 保存remotionProps
  showGeneratedPreview.value = true

  console.log('  - 设置后 showGeneratedPreview:', showGeneratedPreview.value)
  console.log('  - generatedVideoSrc:', generatedVideoSrc.value)
  console.log('  - generatedPptSlides 数量:', generatedPptSlides.value.length)
  console.log('  - generatedRemotionProps:', generatedRemotionProps.value)
}

// 暴露方法给父组件
defineExpose({
  showPreview,
  handleExportVideo
})

// 监听视频源变化，更新视频元素
watch(videoSrc, newSrc => {
  if (videoElement.value && newSrc) {
    videoElement.value.load()
  }
})

// 监听生成预览状态变化，通知父组件更新 PPT 数据
watch(showGeneratedPreview, newValue => {
  if (newValue && generatedPptSlides.value.length > 0) {
    emit('ppt-slides-updated', {
      slides: generatedPptSlides.value,
      showPptTab: true
    })
  } else {
    emit('ppt-slides-updated', {
      slides: [],
      showPptTab: false
    })
  }
})
</script>

<style scoped>
.workspace-main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #1a1a1a;
  min-height: 0; /* 重要：允许flex子元素收缩 */
}

.video-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 16px; /* 减小 padding，参考剪映 */
  min-height: 0; /* 重要：允许flex子元素收缩 */
}

.video-section.vertical-video {
  padding: 16px 40px; /* 竖版视频稍微增加左右 padding */
}

.editor-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0; /* 重要：允许flex子元素收缩 */
}

.preview-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  min-height: 0; /* 重要：允许flex子元素收缩 */
}

.preview-video {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain; /* 确保视频完整显示 */
  border-radius: 4px; /* 减小圆角，参考剪映 */
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
}

.preview-video.vertical {
  max-width: 45%; /* 竖版视频限制宽度，参考剪映 */
  max-height: 100%;
}

/* 画中画预览 */
.pip-overlay {
  position: absolute;
  pointer-events: none;
  z-index: 10;
}

.pip-window {
  position: absolute;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.2);
  pointer-events: auto;
}

.pip-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 一键生成按钮（剪映风格） */
.auto-generate-btn {
  position: absolute;
  bottom: 24px;
  right: 24px;
  padding: 12px 24px;
  border: none;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%);
  border-radius: 24px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 16px rgba(255, 71, 87, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 15;
  user-select: none;
}

.auto-generate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 71, 87, 0.5);
  background: linear-gradient(135deg, #ff7b7b 0%, #ff5767 100%);
}

.auto-generate-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(255, 71, 87, 0.3);
}

.auto-generate-btn .btn-icon {
  font-size: 16px;
  animation: sparkle 2s ease-in-out infinite;
}

.auto-generate-btn .btn-text {
  letter-spacing: 0.5px;
}

@keyframes sparkle {
  0%,
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: scale(1.2) rotate(180deg);
    opacity: 0.8;
  }
}

/* 预览操作按钮组（右下角） */
.preview-action-buttons {
  position: absolute;
  bottom: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 15;
}

.preview-action-btn {
  padding: 10px 20px;
  border: 1px solid #3a3a3a;
  background: rgba(42, 42, 42, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  color: #d4d4d4;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.preview-action-btn:hover {
  background: rgba(58, 58, 58, 0.95);
  border-color: #4a4a4a;
  transform: translateX(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

.preview-action-btn.primary {
  background: linear-gradient(135deg, #4a9eff 0%, #4ec9b0 100%);
  border-color: transparent;
  color: white;
  box-shadow: 0 4px 12px rgba(74, 158, 255, 0.4);
}

.preview-action-btn.primary:hover {
  background: linear-gradient(135deg, #5aafff 0%, #5ed9c0 100%);
  box-shadow: 0 6px 16px rgba(74, 158, 255, 0.5);
}

.preview-action-btn span:first-child {
  font-size: 16px;
}

/* 生成中遮罩 */
.generating-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

.generating-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.generating-spinner {
  width: 64px;
  height: 64px;
  border: 4px solid rgba(74, 158, 255, 0.2);
  border-top-color: #4a9eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.generating-text {
  font-size: 18px;
  color: white;
  font-weight: 600;
}

.generating-tip {
  font-size: 14px;
  color: #8a8a8a;
}

/* 质量控制按钮 */
.quality-control-toggle {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 20;
}

.quality-control-toggle:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .video-section {
    padding: 10px;
  }

  .video-section.vertical-video {
    padding: 10px 20px;
  }

  .preview-video.vertical {
    max-width: 70%;
  }

  .quality-control-toggle {
    top: 10px;
    right: 10px;
  }

  .auto-generate-btn {
    bottom: 16px;
    right: 16px;
    padding: 10px 20px;
    font-size: 13px;
  }

  .auto-generate-btn .btn-icon {
    font-size: 14px;
  }
}
</style>
