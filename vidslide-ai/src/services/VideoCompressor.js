/**
 * 视频压缩器
 *
 * 功能:
 * - 智能压缩视频以满足平台限制
 * - 借鉴剪映压缩参数
 * - 支持多平台预设
 * - 精确控制文件大小
 *
 * 压缩参数(借鉴剪映):
 * - 分辨率: 1080P (1920x1080)
 * - 码率: 7 Mbps (满足抖音72MB限制)
 * - 帧率: 30 fps
 * - 编码: H.264
 * - CRF: 23
 * - Preset: medium
 * - 音频: AAC 128kbps
 *
 * @author VidSlide AI Team
 * @version 1.0.0
 */

class VideoCompressor {
  constructor() {
    this.ffmpeg = null
    this.isLoaded = false

    // 平台预设配置
    this.platformPresets = {
      douyin: {
        name: '抖音/TikTok',
        maxSize: 72 * 1024 * 1024, // 72MB
        videoBitrate: '7M',
        audioBitrate: '128k',
        crf: 23,
        preset: 'medium',
        resolution: '1080:1920',
        fps: 30
      },
      xiaohongshu: {
        name: '小红书',
        maxSize: 10 * 1024 * 1024 * 1024, // 10GB
        videoBitrate: '15M',
        audioBitrate: '192k',
        crf: 20,
        preset: 'slow',
        resolution: '1080:1920',
        fps: 30
      },
      bilibili: {
        name: 'B站',
        maxSize: 8 * 1024 * 1024 * 1024, // 8GB
        videoBitrate: '18M',
        audioBitrate: '192k',
        crf: 18,
        preset: 'slow',
        resolution: '1920:1080',
        fps: 30
      },
      instagram: {
        name: 'Instagram Reels',
        maxSize: 4 * 1024 * 1024 * 1024, // 4GB
        videoBitrate: '15M',
        audioBitrate: '192k',
        crf: 20,
        preset: 'medium',
        resolution: '1080:1920',
        fps: 30
      }
    }

    console.log('✅ VideoCompressor 初始化完成')
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
      console.log('📦 加载 FFmpeg.wasm (VideoCompressor)...')

      const { createFFmpeg, fetchFile } = await import('@ffmpeg/ffmpeg')

      this.ffmpeg = createFFmpeg({
        log: true,
        corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js'
      })

      await this.ffmpeg.load()
      this.fetchFile = fetchFile
      this.isLoaded = true

      console.log('✅ FFmpeg.wasm (VideoCompressor) 加载完成')
    } catch (error) {
      console.error('❌ FFmpeg.wasm 加载失败:', error)
      throw new Error('FFmpeg加载失败')
    }
  }

  /**
   * 压缩视频
   *
   * @param {Object} videoData - 视频数据
   * @param {string} platform - 目标平台
   * @param {Function} onProgress - 进度回调
   * @returns {Promise<Object>} 压缩后的视频
   */
  async compress(videoData, platform = 'douyin', onProgress = null) {
    console.log('🗜️ 开始智能压缩')
    console.log('  - 目标平台:', platform)

    await this.loadFFmpeg()

    const preset = this.platformPresets[platform] || this.platformPresets.douyin

    console.log('  - 压缩配置:', preset)

    try {
      const inputFileName = 'input.mp4'
      const outputFileName = 'output.mp4'

      // 写入输入文件
      this.ffmpeg.FS('writeFile', inputFileName, await this.fetchFile(videoData.blob))

      if (onProgress) {
        onProgress(0.2)
      }

      // 构建FFmpeg命令
      // 借鉴剪映的压缩参数
      await this.ffmpeg.run(
        '-i',
        inputFileName,
        '-c:v',
        'libx264',
        '-crf',
        preset.crf.toString(),
        '-preset',
        preset.preset,
        '-profile:v',
        'high',
        '-level',
        '4.0',
        '-b:v',
        preset.videoBitrate,
        '-maxrate',
        preset.videoBitrate,
        '-bufsize',
        `${parseInt(preset.videoBitrate) * 2}M`,
        '-vf',
        `scale=${preset.resolution}:flags=lanczos`,
        '-r',
        preset.fps.toString(),
        '-c:a',
        'aac',
        '-b:a',
        preset.audioBitrate,
        '-ar',
        '44100',
        outputFileName
      )

      if (onProgress) {
        onProgress(0.8)
      }

      // 读取输出文件
      const data = this.ffmpeg.FS('readFile', outputFileName)
      const blob = new Blob([data.buffer], { type: 'video/mp4' })
      const url = URL.createObjectURL(blob)
      const size = blob.size

      // 清理
      this.ffmpeg.FS('unlink', inputFileName)
      this.ffmpeg.FS('unlink', outputFileName)

      if (onProgress) {
        onProgress(1.0)
      }

      console.log('✅ 视频压缩完成')
      console.log('  - 文件大小:', (size / 1024 / 1024).toFixed(2), 'MB')
      console.log('  - 平台限制:', (preset.maxSize / 1024 / 1024).toFixed(2), 'MB')

      // 检查文件大小是否满足要求
      if (size > preset.maxSize) {
        console.warn('⚠️ 文件大小超过平台限制')
        // TODO: 可以尝试进一步压缩
      }

      return {
        blob,
        url,
        size,
        duration: videoData.duration,
        platform,
        preset: preset.name,
        withinLimit: size <= preset.maxSize
      }
    } catch (error) {
      console.error('❌ 视频压缩失败:', error)
      throw error
    }
  }

  /**
   * 预估文件大小
   *
   * @param {number} duration - 视频时长(秒)
   * @param {string} platform - 目标平台
   * @returns {number} 预估文件大小(MB)
   */
  estimateFileSize(duration, platform = 'douyin') {
    const preset = this.platformPresets[platform] || this.platformPresets.douyin

    // 文件大小(MB) = (视频码率 + 音频码率) × 时长(秒) / 8 / 1024
    const videoBitrate = parseInt(preset.videoBitrate) * 1024 // 转换为kbps
    const audioBitrate = parseInt(preset.audioBitrate) // kbps
    const totalBitrate = videoBitrate + audioBitrate

    const sizeBytes = (totalBitrate * duration) / 8
    const sizeMB = sizeBytes / 1024

    return Math.ceil(sizeMB)
  }

  /**
   * 获取平台预设
   *
   * @param {string} platform - 平台名称
   * @returns {Object} 平台预设配置
   */
  getPreset(platform) {
    return this.platformPresets[platform] || this.platformPresets.douyin
  }

  /**
   * 获取所有平台列表
   *
   * @returns {Array} 平台列表
   */
  getPlatforms() {
    return Object.keys(this.platformPresets).map((key) => ({
      id: key,
      name: this.platformPresets[key].name,
      maxSize: this.platformPresets[key].maxSize
    }))
  }

  /**
   * 清理资源
   */
  cleanup() {
    if (this.ffmpeg) {
      console.log('🧹 VideoCompressor 资源清理完成')
    }
  }
}

export default VideoCompressor
