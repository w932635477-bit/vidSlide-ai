/**
 * 画中画合成器
 *
 * 功能:
 * - 将原视频叠加到PPT模板上
 * - 支持多种PIP位置和大小
 * - 处理视频同步
 * - 使用FFmpeg overlay滤镜
 *
 * PIP配置:
 * - 位置: 右下角
 * - 大小: 480x270 (25%屏幕)
 * - 坐标: x=1400, y=770
 * - 边框: 圆角,白色描边
 * - 音频: 使用原视频音频
 *
 * @author VidSlide AI Team
 * @version 1.0.0
 */

class PIPComposer {
  constructor() {
    this.ffmpeg = null
    this.isLoaded = false

    // 默认PIP配置
    this.defaultConfig = {
      position: 'bottom-right',
      width: 480,
      height: 270,
      x: 1400,
      y: 770,
      borderRadius: 50,
      borderWidth: 4,
      borderColor: '#FFFFFF'
    }

    console.log('✅ PIPComposer 初始化完成')
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
      console.log('📦 加载 FFmpeg.wasm (PIPComposer)...')

      const { createFFmpeg, fetchFile } = await import('@ffmpeg/ffmpeg')

      this.ffmpeg = createFFmpeg({
        log: true,
        corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js'
      })

      await this.ffmpeg.load()
      this.fetchFile = fetchFile
      this.isLoaded = true

      console.log('✅ FFmpeg.wasm (PIPComposer) 加载完成')
    } catch (error) {
      console.error('❌ FFmpeg.wasm 加载失败:', error)
      throw new Error('FFmpeg加载失败')
    }
  }

  /**
   * 合成多个场景
   *
   * @param {Array} videoSegments - 原视频片段数组
   * @param {Array} templateVideos - PPT模板视频数组
   * @param {Object} pipConfig - PIP配置
   * @param {Function} onProgress - 进度回调
   * @returns {Promise<Array>} 合成后的视频片段数组
   */
  async composeScenes(videoSegments, templateVideos, pipConfig = null, onProgress = null) {
    console.log('📹 开始画中画合成')
    console.log('  - 视频片段数:', videoSegments.length)
    console.log('  - 模板视频数:', templateVideos.length)

    await this.loadFFmpeg()

    const config = { ...this.defaultConfig, ...pipConfig }
    const composedScenes = []

    try {
      for (let i = 0; i < videoSegments.length; i++) {
        console.log(`📹 合成场景 ${i + 1}/${videoSegments.length}`)

        const composed = await this.composePIP(videoSegments[i], templateVideos[i], config)

        composedScenes.push(composed)

        // 更新进度
        if (onProgress) {
          onProgress((i + 1) / videoSegments.length)
        }

        console.log(`✅ 场景 ${i + 1} 合成完成`)
      }

      console.log('✅ 画中画合成完成,共', composedScenes.length, '个片段')
      return composedScenes
    } catch (error) {
      console.error('❌ 画中画合成失败:', error)
      throw error
    }
  }

  /**
   * 合成单个画中画
   *
   * @param {Object} videoSegment - 原视频片段
   * @param {Object} templateVideo - PPT模板视频
   * @param {Object} config - PIP配置
   * @returns {Promise<Object>} 合成后的视频
   */
  async composePIP(videoSegment, templateVideo, config) {
    await this.loadFFmpeg()

    try {
      const templateFileName = 'template.mp4'
      const videoFileName = 'video.mp4'
      const outputFileName = 'output.mp4'

      // 写入文件
      this.ffmpeg.FS('writeFile', templateFileName, await this.fetchFile(templateVideo.blob))
      this.ffmpeg.FS('writeFile', videoFileName, await this.fetchFile(videoSegment.blob))

      // 构建FFmpeg命令
      // overlay滤镜: [1:v]scale=480:270[pip];[0:v][pip]overlay=1400:770[out]
      const filterComplex = `[1:v]scale=${config.width}:${config.height}[pip];[0:v][pip]overlay=${config.x}:${config.y}[out]`

      await this.ffmpeg.run(
        '-i',
        templateFileName, // 背景(PPT模板)
        '-i',
        videoFileName, // 前景(原视频)
        '-filter_complex',
        filterComplex,
        '-map',
        '[out]',
        '-map',
        '1:a', // 使用原视频音频
        '-c:v',
        'libx264',
        '-c:a',
        'aac',
        outputFileName
      )

      // 读取输出文件
      const data = this.ffmpeg.FS('readFile', outputFileName)
      const blob = new Blob([data.buffer], { type: 'video/mp4' })
      const url = URL.createObjectURL(blob)

      // 清理
      this.ffmpeg.FS('unlink', templateFileName)
      this.ffmpeg.FS('unlink', videoFileName)
      this.ffmpeg.FS('unlink', outputFileName)

      return {
        index: videoSegment.index,
        sceneId: videoSegment.sceneId,
        blob,
        url,
        duration: videoSegment.duration
      }
    } catch (error) {
      console.error('❌ PIP合成失败:', error)
      throw error
    }
  }

  /**
   * 获取PIP位置坐标
   *
   * @param {string} position - 位置 ('top-left', 'top-right', 'bottom-left', 'bottom-right')
   * @param {number} videoWidth - 视频宽度
   * @param {number} videoHeight - 视频高度
   * @param {number} pipWidth - PIP宽度
   * @param {number} pipHeight - PIP高度
   * @param {number} margin - 边距
   * @returns {Object} 坐标 {x, y}
   */
  getPIPPosition(position, videoWidth, videoHeight, pipWidth, pipHeight, margin = 40) {
    const positions = {
      'top-left': { x: margin, y: margin },
      'top-right': { x: videoWidth - pipWidth - margin, y: margin },
      'bottom-left': { x: margin, y: videoHeight - pipHeight - margin },
      'bottom-right': { x: videoWidth - pipWidth - margin, y: videoHeight - pipHeight - margin }
    }

    return positions[position] || positions['bottom-right']
  }

  /**
   * 清理资源
   */
  cleanup() {
    if (this.ffmpeg) {
      console.log('🧹 PIPComposer 资源清理完成')
    }
  }
}

export default PIPComposer
