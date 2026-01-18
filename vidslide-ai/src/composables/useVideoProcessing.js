/**
 * useVideoProcessing - 视频处理Composable
 * 处理视频上传、分析、关键帧提取等功能
 */
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { getVideoProcessingService } from '@/services/VideoProcessingService'

export function useVideoProcessing() {
  const store = useWorkspaceStore()
  const videoProcessingService = ref(null)

  // 初始化服务
  const initService = () => {
    if (!videoProcessingService.value) {
      videoProcessingService.value = getVideoProcessingService()
    }
    return videoProcessingService.value
  }

  // 处理视频上传
  const handleVideoUpload = async file => {
    try {
      console.log('📹 开始处理视频:', file.name)

      // 创建视频URL
      const videoUrl = URL.createObjectURL(file)

      // 更新store
      store.setVideo({
        src: videoUrl,
        file: file
      })

      // 加载视频元数据
      await loadVideoMetadata(videoUrl)

      ElMessage.success('视频上传成功')
      return videoUrl
    } catch (error) {
      console.error('视频上传失败:', error)
      ElMessage.error(`视频上传失败: ${error.message}`)
      throw error
    }
  }

  // 加载视频元数据
  const loadVideoMetadata = videoUrl => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      video.src = videoUrl

      video.onloadedmetadata = () => {
        store.setVideo({
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight
        })

        console.log('✅ 视频元数据加载完成:', {
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight
        })

        resolve()
      }

      video.onerror = error => {
        reject(new Error('视频元数据加载失败'))
      }
    })
  }

  // 开始AI分析
  const startAnalysis = async () => {
    const service = initService()

    try {
      console.log('🧠 开始AI分析...')
      store.showProgress('analyze')

      const videoFile = store.video.file
      if (!videoFile) {
        throw new Error('没有视频文件')
      }

      // 加载视频
      await service.loadVideo(videoFile)
      store.updateProgress(10)

      // 提取关键帧
      console.log('🎬 提取关键帧...')
      const keyframes = await service.extractKeyframes({
        onProgress: progress => {
          store.updateProgress(10 + progress * 0.3)
        }
      })
      store.setKeyframes(keyframes)
      console.log(`✅ 提取了 ${keyframes.length} 个关键帧`)

      // 场景检测
      console.log('🎭 检测场景...')
      const scenes = await service.detectScenes({
        onProgress: progress => {
          store.updateProgress(40 + progress * 0.2)
        }
      })
      console.log(`✅ 检测到 ${scenes.length} 个场景`)

      // 语音识别
      console.log('🎤 语音识别...')
      const transcript = await service.recognizeSpeech({
        onProgress: progress => {
          store.updateProgress(60 + progress * 0.2)
        }
      })
      store.updateTranscript(transcript)
      console.log(`✅ 转录文本长度: ${transcript.length}`)

      // 关键词提取
      console.log('🔑 提取关键词...')
      const keywords = await service.extractKeywords(transcript, {
        onProgress: progress => {
          store.updateProgress(80 + progress * 0.2)
        }
      })
      store.updateKeywords(keywords)
      console.log(`✅ 提取了 ${keywords.length} 个关键词`)

      // 完成
      store.updateProgress(100)
      store.hideProgress()

      ElMessage.success('AI分析完成')

      // 切换到下一步
      store.setWorkflowStep('template')
      store.setActiveTab('materials')

      return {
        keyframes,
        scenes,
        transcript,
        keywords
      }
    } catch (error) {
      console.error('❌ AI分析失败:', error)
      store.hideProgress()
      ElMessage.error(`分析失败: ${error.message}`)
      throw error
    }
  }

  // 更新视频时间
  const updateVideoTime = time => {
    store.updateVideoTime(time)
  }

  // 切换播放状态
  const togglePlayback = () => {
    store.toggleVideoPlayback()
  }

  // 清除视频
  const clearVideo = () => {
    if (store.video.src) {
      URL.revokeObjectURL(store.video.src)
    }
    store.clearVideo()
  }

  return {
    // 状态
    video: computed(() => store.video),
    hasVideo: computed(() => store.hasVideo),
    isVerticalVideo: computed(() => store.isVerticalVideo),

    // 方法
    handleVideoUpload,
    startAnalysis,
    updateVideoTime,
    togglePlayback,
    clearVideo
  }
}
