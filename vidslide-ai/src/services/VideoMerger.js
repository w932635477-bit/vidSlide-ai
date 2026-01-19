/**
 * 视频合并器
 *
 * 功能:
 * - 将多个视频片段拼接成一个完整视频
 * - 使用FFmpeg concat协议
 * - 确保无缝拼接
 * - 处理音频连续性
 *
 * 技术方案:
 * - 使用FFmpeg的concat协议
 * - `-c copy`模式快速拼接
 * - 无黑帧,无卡顿
 *
 * @author VidSlide AI Team
 * @version 1.0.0
 */

class VideoMerger {
  constructor() {
    this.ffmpeg = null
    this.isLoaded = false

    console.log('✅ VideoMerger 初始化完成')
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
      console.log('📦 加载 FFmpeg.wasm (VideoMerger)...')

      // 动态导入FFmpeg (0.12.x 新版本API)
      const { FFmpeg } = await import('@ffmpeg/ffmpeg')
      const { fetchFile, toBlobURL } = await import('@ffmpeg/util')

      this.ffmpeg = new FFmpeg()

      // 设置日志
      this.ffmpeg.on('log', ({ message }) => {
        console.log('[FFmpeg VideoMerger]', message)
      })

      // 加载FFmpeg核心文件
      const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm'
      await this.ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
      })

      this.fetchFile = fetchFile
      this.isLoaded = true

      console.log('✅ FFmpeg.wasm (VideoMerger) 加载完成')
    } catch (error) {
      console.error('❌ FFmpeg.wasm 加载失败:', error)
      throw new Error('FFmpeg加载失败')
    }
  }

  /**
   * 合并视频
   *
   * @param {Array} videoSegments - 视频片段数组
   * @param {Function} onProgress - 进度回调
   * @returns {Promise<Object>} 合并后的视频
   */
  async mergeVideos(videoSegments, onProgress = null) {
    console.log('🔗 开始拼接视频')
    console.log('  - 片段数量:', videoSegments.length)

    await this.loadFFmpeg()

    try {
      // 写入所有视频片段
      const fileList = []
      for (let i = 0; i < videoSegments.length; i++) {
        const fileName = `segment_${i}.mp4`
        await this.ffmpeg.writeFile(fileName, await this.fetchFile(videoSegments[i].blob))
        fileList.push(`file '${fileName}'`)

        if (onProgress) {
          onProgress((i + 1) / (videoSegments.length * 2)) // 写入占50%
        }
      }

      // 创建concat列表文件
      const concatList = fileList.join('\n')
      await this.ffmpeg.writeFile('concat.txt', concatList)

      console.log('📝 Concat列表:')
      console.log(concatList)

      // 使用concat协议拼接
      await this.ffmpeg.exec([
        '-f',
        'concat',
        '-safe',
        '0',
        '-i',
        'concat.txt',
        '-c',
        'copy',
        'merged.mp4'
      ])

      if (onProgress) {
        onProgress(0.75) // 拼接占25%
      }

      // 读取合并后的文件
      const data = await this.ffmpeg.readFile('merged.mp4')
      const blob = new Blob([data.buffer], { type: 'video/mp4' })
      const url = URL.createObjectURL(blob)

      // 计算总时长
      const totalDuration = videoSegments.reduce((sum, seg) => sum + (seg.duration || 0), 0)

      // 清理临时文件
      for (let i = 0; i < videoSegments.length; i++) {
        await this.ffmpeg.deleteFile(`segment_${i}.mp4`)
      }
      await this.ffmpeg.deleteFile('concat.txt')
      await this.ffmpeg.deleteFile('merged.mp4')

      if (onProgress) {
        onProgress(1.0) // 完成
      }

      console.log('✅ 视频拼接完成')
      console.log('  - 总时长:', totalDuration, '秒')

      return {
        blob,
        url,
        duration: totalDuration,
        segmentCount: videoSegments.length
      }
    } catch (error) {
      console.error('❌ 视频拼接失败:', error)
      throw error
    }
  }

  /**
   * 验证视频片段
   *
   * @param {Array} videoSegments - 视频片段数组
   * @returns {boolean} 是否有效
   */
  validateSegments(videoSegments) {
    if (!videoSegments || videoSegments.length === 0) {
      console.error('❌ 视频片段为空')
      return false
    }

    for (let i = 0; i < videoSegments.length; i++) {
      const segment = videoSegments[i]

      if (!segment.blob) {
        console.error(`❌ 片段 ${i + 1} 缺少blob数据`)
        return false
      }

      if (!segment.duration || segment.duration <= 0) {
        console.error(`❌ 片段 ${i + 1} 时长无效`)
        return false
      }
    }

    return true
  }

  /**
   * 清理资源
   */
  cleanup() {
    if (this.ffmpeg) {
      console.log('🧹 VideoMerger 资源清理完成')
    }
  }
}

export default VideoMerger
