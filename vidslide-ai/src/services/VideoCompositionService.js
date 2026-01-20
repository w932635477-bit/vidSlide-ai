/**
 * 视频合成服务
 *
 * 核心功能:
 * - 协调整个视频合成流程
 * - 原视频 + 组合单元图片 → 合成视频
 * - 支持画中画(PIP)效果
 * - 优化输出以满足社交媒体平台要求
 *
 * 处理流程:
 * 1. 场景分割: 按场景时间点精确分割原视频
 * 2. 组合单元叠加: 使用FFmpeg将组合单元图片叠加到视频上
 * 3. 画中画合成: 将原视频叠加到组合单元上
 * 4. 视频拼接: 将所有片段无缝拼接
 * 5. 智能压缩: 压缩以满足平台限制
 *
 * @author VidSlide AI Team
 * @version 2.0.0
 */

import ServerVideoProcessor from './ServerVideoProcessor.js'

class VideoCompositionService {
  constructor() {
    // 初始化服务器端视频处理器
    this.videoProcessor = new ServerVideoProcessor()

    // 状态
    this.isProcessing = false
    this.currentProgress = 0
    this.currentStep = ''

    console.log('✅ VideoCompositionService 初始化完成 (使用服务器端处理)')
  }

  /**
   * 合成视频 - 主流程
   *
   * @param {File} videoFile - 原视频文件
   * @param {Array} scenes - 场景数据数组
   * @param {Object} template - PPT模板配置
   * @param {Object} options - 合成选项
   * @param {Function} onProgress - 进度回调函数
   * @returns {Promise<Object>} 合成结果
   */
  async composeVideo(videoFile, scenes, template, options = {}, onProgress = null) {
    if (this.isProcessing) {
      throw new Error('视频合成正在进行中,请等待完成')
    }

    this.isProcessing = true
    this.currentProgress = 0

    try {
      console.log('🎬 开始视频合成流程')
      console.log('  - 原视频:', videoFile.name)
      console.log('  - 场景数量:', scenes.length)
      console.log('  - 模板:', template.id)

      // 步骤1: 分割原视频 (0-20%)
      this.updateProgress('分割视频', 0, onProgress)
      const videoSegments = await this.videoProcessor.splitVideo(videoFile, scenes, progress => {
        this.updateProgress('分割视频', progress * 20, onProgress)
      })
      console.log('✅ 视频分割完成,片段数:', videoSegments.length)

      // 步骤2: 处理场景 - 区分组合场景和原视频场景 (20-60%)
      this.updateProgress('处理场景', 20, onProgress)
      const composedScenes = []

      console.log('📋 VideoCompositionService 收到的场景列表:')
      scenes.forEach((scene, i) => {
        console.log(`  场景 ${i + 1}: type="${scene.type}", id=${scene.id}`)
      })

      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i]
        const progress = 20 + (i / scenes.length) * 40

        console.log(`\n🔍 处理场景 ${i + 1}: type="${scene.type}", 判断: ${scene.type === 'composition'}`)

        if (scene.type === 'composition') {
          // 组合场景: 使用组合单元图片 + FFmpeg合成
          this.updateProgress(`合成场景 ${i + 1}/${scenes.length}`, progress, onProgress)

          // 检查是否有组合单元路径
          if (!scene.compositionUnitPath) {
            console.warn(`⚠️ 场景 ${i + 1} 缺少组合单元路径，使用原视频`)
            const originalSegment = videoSegments[i]
            composedScenes.push(originalSegment)
            continue
          }

          // 提取对应的原视频片段
          const originalSegment = videoSegments[i]

          // 使用FFmpeg叠加组合单元
          const composed = await this.overlayCompositionUnit(
            scene.compositionUnitPath,
            originalSegment,
            {
              ...options.pipConfig,
              pipConfig: scene.pipConfig,
              duration: scene.endTime - scene.startTime
            }
          )
          console.log(`✅ 场景 ${i + 1} 组合单元叠加完成`)

          composedScenes.push(composed)
        } else {
          // 原视频场景: 直接使用原视频片段
          this.updateProgress(`处理场景 ${i + 1}/${scenes.length}`, progress, onProgress)
          const originalSegment = videoSegments[i]
          composedScenes.push(originalSegment)
          console.log(`✅ 场景 ${i + 1} 使用原视频`)
        }
      }

      console.log('✅ 所有场景处理完成,片段数:', composedScenes.length)

      // 步骤4: 拼接视频 (60-80%)
      this.updateProgress('拼接视频', 60, onProgress)
      const mergedVideo = await this.videoProcessor.mergeVideos(composedScenes, progress => {
        this.updateProgress('拼接视频', 60 + progress * 20, onProgress)
      })
      console.log('✅ 视频拼接完成')

      // 步骤5: 智能压缩 (80-100%)
      this.updateProgress('智能压缩', 80, onProgress)
      const finalVideo = await this.videoProcessor.compress(
        mergedVideo,
        options.platform || 'douyin',
        progress => {
          this.updateProgress('智能压缩', 80 + progress * 20, onProgress)
        }
      )
      console.log('✅ 视频压缩完成')

      // 完成
      this.updateProgress('完成', 100, onProgress)
      console.log('🎉 视频合成流程完成!')

      return {
        success: true,
        videoUrl: finalVideo.url,
        videoBlob: finalVideo.blob,
        fileSize: finalVideo.size,
        duration: finalVideo.duration,
        metadata: {
          resolution: '1080P',
          fps: 30,
          codec: 'H.264',
          platform: options.platform || 'douyin'
        }
      }
    } catch (error) {
      console.error('❌ 视频合成失败:', error)
      this.updateProgress('失败', this.currentProgress, onProgress)
      throw error
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * 叠加组合单元到视频片段
   *
   * @param {string} compositionUnitPath - 组合单元图片路径
   * @param {string} videoSegmentPath - 视频片段路径
   * @param {Object} options - 合成选项
   * @returns {Promise<string>} 合成后的视频路径
   */
  async overlayCompositionUnit(compositionUnitPath, videoSegmentPath, options = {}) {
    console.log(`🎨 叠加组合单元: ${compositionUnitPath}`)

    try {
      // 使用 ServerVideoProcessor 的 overlayImage 方法
      const result = await this.videoProcessor.overlayImage(
        videoSegmentPath,
        compositionUnitPath,
        {
          position: 'center',
          scale: 1.0,
          duration: options.duration,
          ...options
        }
      )

      return result
    } catch (error) {
      console.error('❌ 组合单元叠加失败:', error)
      throw error
    }
  }

  /**
   * 更新进度
   *
   * @param {string} step - 当前步骤
   * @param {number} progress - 进度百分比 (0-100)
   * @param {Function} callback - 进度回调函数
   */
  updateProgress(step, progress, callback) {
    this.currentStep = step
    this.currentProgress = Math.min(100, Math.max(0, progress))

    if (callback && typeof callback === 'function') {
      callback({
        step: this.currentStep,
        progress: this.currentProgress
      })
    }
  }

  /**
   * 取消合成
   */
  cancel() {
    if (!this.isProcessing) {
      return
    }

    console.log('⚠️ 取消视频合成')
    // TODO: 实现取消逻辑
    this.isProcessing = false
  }

  /**
   * 获取当前状态
   *
   * @returns {Object} 当前状态
   */
  getStatus() {
    return {
      isProcessing: this.isProcessing,
      currentStep: this.currentStep,
      currentProgress: this.currentProgress
    }
  }

  /**
   * 预估处理时间
   *
   * @param {number} videoDuration - 视频时长(秒)
   * @param {number} sceneCount - 场景数量
   * @returns {number} 预估时间(秒)
   */
  estimateProcessingTime(videoDuration, sceneCount) {
    // 基于性能指标预估（使用FFmpeg直接合成，速度更快）
    const splitTime = 10 // 视频分割: 10秒
    const overlayTime = sceneCount * 5 // 组合单元叠加: 5秒/场景（比Remotion快12倍）
    const mergeTime = 10 // 视频拼接: 10秒
    const compressTime = 30 // 智能压缩: 30秒

    const totalTime = splitTime + overlayTime + mergeTime + compressTime

    return totalTime
  }

  /**
   * 预估文件大小
   *
   * @param {number} videoDuration - 视频时长(秒)
   * @param {string} platform - 目标平台
   * @returns {number} 预估文件大小(MB)
   */
  // eslint-disable-next-line no-unused-vars
  estimateFileSize(videoDuration, platform = 'douyin') {
    // 文件大小(MB) = (视频码率 + 音频码率) × 时长(秒) / 8 / 1024
    const videoBitrate = 7 * 1024 // 7 Mbps = 7168 kbps
    const audioBitrate = 128 // 128 kbps
    const totalBitrate = videoBitrate + audioBitrate

    const sizeBytes = (totalBitrate * videoDuration) / 8
    const sizeMB = sizeBytes / 1024

    return Math.ceil(sizeMB)
  }
}

// 导出单例实例
export default new VideoCompositionService()
