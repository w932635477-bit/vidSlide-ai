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

  // 开始多智能体处理
  const startAnalysis = async () => {
    const service = initService()

    try {
      console.log('🧠 开始多智能体处理...')
      store.showProgress('analyze')

      const videoFile = store.video.file
      if (!videoFile) {
        throw new Error('没有视频文件')
      }

      // 先检查服务健康状态
      console.log('🔍 检查后端服务...')
      const health = await service.checkHealth()
      console.log('✅ 后端服务正常:', health)

      // 上传视频到多智能体系统
      console.log('📤 上传视频到多智能体系统...')
      const uploadResult = await service.uploadVideo(videoFile, {
        platform: 'douyin',
        allowRework: true,
        onProgress: (progress) => {
          console.log(`📤 上传进度: ${progress}%`)
        }
      })

      const taskId = uploadResult.taskId
      console.log(`✅ 任务已创建: ${taskId}`)

      // 使用WebSocket监听实时更新
      console.log('🔌 连接WebSocket监听实时更新...')
      const socket = service.subscribeToUpdates(taskId, (taskData) => {
        console.log(`📊 进度: ${taskData.progress}% - ${taskData.message}`)

        // 更新进度
        store.updateProgress(taskData.progress)

        // 如果有Timeline数据，更新store
        if (taskData.timeline) {
          console.log('📋 收到Timeline数据:', taskData.timeline)
          store.setTimeline(taskData.timeline)
        }

        // 任务完成
        if (taskData.status === 'completed') {
          console.log('✅ 多智能体处理完成')
          store.hideProgress()
          ElMessage.success('多智能体处理完成')

          // 切换到下一步
          store.setWorkflowStep('template')
          store.setActiveTab('materials')

          // 关闭WebSocket连接
          if (socket) {
            socket.disconnect()
          }
        }

        // 任务失败
        if (taskData.status === 'failed') {
          console.error('❌ 多智能体处理失败:', taskData.error)
          store.hideProgress()
          ElMessage.error(`处理失败: ${taskData.error}`)

          // 关闭WebSocket连接
          if (socket) {
            socket.disconnect()
          }
        }
      })

      // 如果WebSocket连接失败，使用轮询作为备用方案
      if (!socket) {
        console.log('⚠️ WebSocket连接失败，使用轮询方式...')
        await service.pollTaskStatus(taskId, (taskData) => {
          console.log(`📊 进度: ${taskData.progress}% - ${taskData.message}`)
          store.updateProgress(taskData.progress)

          if (taskData.timeline) {
            store.setTimeline(taskData.timeline)
          }
        })

        store.hideProgress()
        ElMessage.success('多智能体处理完成')
        store.setWorkflowStep('template')
        store.setActiveTab('materials')
      }

      return {
        taskId,
        socket
      }
    } catch (error) {
      console.error('❌ 多智能体处理失败:', error)
      store.hideProgress()
      ElMessage.error(`处理失败: ${error.message}`)
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
