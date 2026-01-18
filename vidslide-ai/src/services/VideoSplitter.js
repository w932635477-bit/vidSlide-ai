/**
 * 视频分割器
 *
 * 功能:
 * - 按场景时间点精确分割原视频
 * - 使用FFmpeg进行无损分割
 * - 保持音频同步
 * - 支持进度回调
 *
 * 技术方案:
 * - 使用FFmpeg的 `-c copy` 模式进行无损分割
 * - 精度可达毫秒级
 * - 音频自动同步
 *
 * @author VidSlide AI Team
 * @version 1.0.0
 */

class VideoSplitter {
  constructor() {
    this.ffmpeg = null
    this.isLoaded = false

    console.log('✅ VideoSplitter 初始化完成')
  }

  /**
   * 加载FFmpeg
   *
   * @returns {Promise<void>}
   */
  async loadFFmpeg() {
    if (this.isLoaded) {
      return
    }

    try {
      console.log('📦 加载 FFmpeg.wasm...')

      // 动态导入FFmpeg
      const { createFFmpeg, fetchFile } = await import('@ffmpeg/ffmpeg')

      this.ffmpeg = createFFmpeg({
        log: true,
        corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js'
      })

      await this.ffmpeg.load()
      this.fetchFile = fetchFile
      this.isLoaded = true

      console.log('✅ FFmpeg.wasm 加载完成')
    } catch (error) {
      console.error('❌ FFmpeg.wasm 加载失败:', error)
      throw new Error('FFmpeg加载失败,请刷新页面重试')
    }
  }

  /**
   * 分割视频
   *
   * @param {File} videoFile - 原视频文件
   * @param {Array} scenes - 场景数据数组
   * @param {Function} onProgress - 进度回调函数
   * @returns {Promise<Array>} 视频片段数组
   */
  async splitVideo(videoFile, scenes, onProgress = null) {
    console.log('✂️ 开始分割视频')
    console.log('  - 视频文件:', videoFile.name)
    console.log('  - 场景数量:', scenes.length)

    // 确保FFmpeg已加载
    await this.loadFFmpeg()

    const segments = []

    try {
      // 将视频文件写入FFmpeg虚拟文件系统
      const inputFileName = 'input.mp4'
      this.ffmpeg.FS('writeFile', inputFileName, await this.fetchFile(videoFile))

      // 分割每个场景
      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i]
        const outputFileName = `segment_${i}.mp4`

        console.log(`✂️ 分割场景 ${i + 1}/${scenes.length}`)
        console.log(`  - 时间范围: ${scene.startTime}s - ${scene.endTime}s`)

        // 使用FFmpeg分割
        // -ss: 开始时间
        // -to: 结束时间
        // -c copy: 无损复制,不重新编码
        await this.ffmpeg.run(
          '-i',
          inputFileName,
          '-ss',
          scene.startTime.toString(),
          '-to',
          scene.endTime.toString(),
          '-c',
          'copy',
          outputFileName
        )

        // 读取分割后的文件
        const data = this.ffmpeg.FS('readFile', outputFileName)
        const blob = new Blob([data.buffer], { type: 'video/mp4' })
        const url = URL.createObjectURL(blob)

        segments.push({
          index: i,
          sceneId: scene.id,
          startTime: scene.startTime,
          endTime: scene.endTime,
          duration: scene.endTime - scene.startTime,
          blob,
          url,
          fileName: outputFileName
        })

        // 更新进度
        if (onProgress) {
          onProgress((i + 1) / scenes.length)
        }

        // 清理临时文件
        this.ffmpeg.FS('unlink', outputFileName)

        console.log(`✅ 场景 ${i + 1} 分割完成`)
      }

      // 清理输入文件
      this.ffmpeg.FS('unlink', inputFileName)

      console.log('✅ 视频分割完成,共', segments.length, '个片段')
      return segments
    } catch (error) {
      console.error('❌ 视频分割失败:', error)
      throw new Error(`视频分割失败: ${error.message}`)
    }
  }

  /**
   * 提取单个片段
   *
   * @param {File} videoFile - 原视频文件
   * @param {number} startTime - 开始时间(秒)
   * @param {number} endTime - 结束时间(秒)
   * @returns {Promise<Blob>} 视频片段Blob
   */
  async extractSegment(videoFile, startTime, endTime) {
    await this.loadFFmpeg()

    try {
      const inputFileName = 'input.mp4'
      const outputFileName = 'output.mp4'

      // 写入输入文件
      this.ffmpeg.FS('writeFile', inputFileName, await this.fetchFile(videoFile))

      // 分割
      await this.ffmpeg.run(
        '-i',
        inputFileName,
        '-ss',
        startTime.toString(),
        '-to',
        endTime.toString(),
        '-c',
        'copy',
        outputFileName
      )

      // 读取输出文件
      const data = this.ffmpeg.FS('readFile', outputFileName)
      const blob = new Blob([data.buffer], { type: 'video/mp4' })

      // 清理
      this.ffmpeg.FS('unlink', inputFileName)
      this.ffmpeg.FS('unlink', outputFileName)

      return blob
    } catch (error) {
      console.error('❌ 提取片段失败:', error)
      throw error
    }
  }

  /**
   * 验证场景时间点
   *
   * @param {Array} scenes - 场景数据数组
   * @param {number} videoDuration - 视频总时长
   * @returns {boolean} 是否有效
   */
  validateScenes(scenes, videoDuration) {
    if (!scenes || scenes.length === 0) {
      console.error('❌ 场景数据为空')
      return false
    }

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i]

      // 检查时间点是否有效
      if (scene.startTime < 0 || scene.endTime > videoDuration) {
        console.error(`❌ 场景 ${i + 1} 时间点超出视频范围`)
        return false
      }

      if (scene.startTime >= scene.endTime) {
        console.error(`❌ 场景 ${i + 1} 开始时间大于等于结束时间`)
        return false
      }

      // 检查场景是否重叠
      if (i > 0) {
        const prevScene = scenes[i - 1]
        if (scene.startTime < prevScene.endTime) {
          console.error(`❌ 场景 ${i + 1} 与场景 ${i} 重叠`)
          return false
        }
      }
    }

    return true
  }

  /**
   * 获取视频元数据
   *
   * @param {File} videoFile - 视频文件
   * @returns {Promise<Object>} 视频元数据
   */
  async getVideoMetadata(videoFile) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      video.preload = 'metadata'

      video.onloadedmetadata = () => {
        resolve({
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight
        })
        URL.revokeObjectURL(video.src)
      }

      video.onerror = () => {
        reject(new Error('无法读取视频元数据'))
        URL.revokeObjectURL(video.src)
      }

      video.src = URL.createObjectURL(videoFile)
    })
  }

  /**
   * 清理资源
   */
  cleanup() {
    if (this.ffmpeg) {
      // FFmpeg.wasm 会自动清理
      console.log('🧹 VideoSplitter 资源清理完成')
    }
  }
}

// 导出类(不是单例,因为可能需要多个实例)
export default VideoSplitter
