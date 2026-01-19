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

      // 检查浏览器兼容性
      console.log('  🔍 检查浏览器兼容性...')
      console.log('    - SharedArrayBuffer支持:', typeof SharedArrayBuffer !== 'undefined')
      console.log('    - WebAssembly支持:', typeof WebAssembly !== 'undefined')
      console.log('    - 浏览器:', navigator.userAgent)

      // 动态导入FFmpeg (0.12.x 新版本API)
      console.log('  步骤1: 导入FFmpeg模块...')
      const { FFmpeg } = await import('@ffmpeg/ffmpeg')
      const { fetchFile, toBlobURL } = await import('@ffmpeg/util')
      console.log('  ✅ FFmpeg模块导入成功')

      console.log('  步骤2: 创建FFmpeg实例...')
      this.ffmpeg = new FFmpeg()
      console.log('  ✅ FFmpeg实例创建成功')

      // 设置日志
      this.ffmpeg.on('log', ({ message }) => {
        console.log('[FFmpeg]', message)
      })

      // 加载核心文件 - 使用 jsdelivr CDN (国内访问更快)
      console.log('  步骤3: 下载FFmpeg核心文件...')
      const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm'

      console.log('    - 下载 ffmpeg-core.js...')
      const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript')
      console.log('    ✅ ffmpeg-core.js 下载完成')

      console.log('    - 下载 ffmpeg-core.wasm...')
      const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
      console.log('    ✅ ffmpeg-core.wasm 下载完成')

      console.log('  步骤4: 加载FFmpeg核心...')
      console.log('    ⏳ 这可能需要1-3分钟,请耐心等待...')
      console.log('    💡 提示: WASM文件较大(约10MB),首次加载需要编译')
      console.log('    💡 如果一直卡住,可能是浏览器兼容性问题')

      // 添加超时处理 (300秒/5分钟超时)
      const loadPromise = this.ffmpeg.load({
        coreURL,
        wasmURL
      })

      // 添加进度提示
      const progressInterval = setInterval(() => {
        console.log('    ⏳ FFmpeg仍在加载中,请继续等待...')
      }, 30000) // 每30秒提示一次

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          clearInterval(progressInterval)
          reject(
            new Error(
              'FFmpeg加载超时(5分钟)。\n' +
                '可能原因:\n' +
                '1. 浏览器不支持SharedArrayBuffer (需要Chrome 92+或Firefox 89+)\n' +
                '2. 浏览器内存不足\n' +
                '3. 网络问题\n' +
                '建议:\n' +
                '- 尝试使用Chrome或Edge浏览器\n' +
                '- 关闭其他标签页释放内存\n' +
                '- 刷新页面重试'
            )
          )
        }, 300000) // 5分钟超时
      })

      try {
        await Promise.race([loadPromise, timeoutPromise])
        clearInterval(progressInterval)
        console.log('  ✅ FFmpeg核心加载成功')
      } catch (error) {
        clearInterval(progressInterval)
        throw error
      }

      this.fetchFile = fetchFile
      this.isLoaded = true

      console.log('✅ FFmpeg.wasm 加载完成')
    } catch (error) {
      console.error('❌ FFmpeg.wasm 加载失败:', error)
      console.error('  错误详情:', error.message)
      console.error('  错误堆栈:', error.stack)

      // 提供更详细的错误信息
      console.error('\n💡 故障排查建议:')
      console.error('  1. 检查浏览器版本 (需要Chrome 92+或Firefox 89+)')
      console.error('  2. 检查浏览器控制台是否有CORS错误')
      console.error('  3. 尝试清除浏览器缓存后重试')
      console.error('  4. 尝试使用无痕模式')
      console.error('  5. 检查是否有浏览器扩展干扰')

      throw new Error(`FFmpeg加载失败: ${error.message}`)
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
      await this.ffmpeg.writeFile(inputFileName, await this.fetchFile(videoFile))

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
        await this.ffmpeg.exec([
          '-i',
          inputFileName,
          '-ss',
          scene.startTime.toString(),
          '-to',
          scene.endTime.toString(),
          '-c',
          'copy',
          outputFileName
        ])

        // 读取分割后的文件
        const data = await this.ffmpeg.readFile(outputFileName)
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
        await this.ffmpeg.deleteFile(outputFileName)

        console.log(`✅ 场景 ${i + 1} 分割完成`)
      }

      // 清理输入文件
      await this.ffmpeg.deleteFile(inputFileName)

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
      await this.ffmpeg.writeFile(inputFileName, await this.fetchFile(videoFile))

      // 分割
      await this.ffmpeg.exec([
        '-i',
        inputFileName,
        '-ss',
        startTime.toString(),
        '-to',
        endTime.toString(),
        '-c',
        'copy',
        outputFileName
      ])

      // 读取输出文件
      const data = await this.ffmpeg.readFile(outputFileName)
      const blob = new Blob([data.buffer], { type: 'video/mp4' })

      // 清理
      await this.ffmpeg.deleteFile(inputFileName)
      await this.ffmpeg.deleteFile(outputFileName)

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
