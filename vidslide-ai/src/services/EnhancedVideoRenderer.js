/**
 * EnhancedVideoRenderer - 增强视频渲染器
 *
 * 功能：
 * 1. FFmpeg多层合成
 * 2. 时间控制
 * 3. 动画效果渲染
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'

const execAsync = promisify(exec)

class EnhancedVideoRenderer {
  constructor() {
    this.tempDir = path.join(process.cwd(), 'temp')

    // 确保临时目录存在
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true })
    }
  }

  /**
   * 渲染视频
   */
  async render(timeline, outputPath) {
    console.log('开始渲染视频...')

    try {
      // 1. 验证时间轴
      console.log('步骤1: 验证时间轴...')
      const validation = this.validateTimeline(timeline)
      if (!validation.valid) {
        throw new Error(`时间轴验证失败: ${validation.errors.join(', ')}`)
      }

      // 2. 构建FFmpeg命令
      console.log('步骤2: 构建FFmpeg命令...')
      const command = this.buildFFmpegCommand(timeline, outputPath)

      // 3. 执行渲染
      console.log('步骤3: 执行FFmpeg渲染...')
      console.log('命令:', command)
      const { stdout, stderr } = await execAsync(command)

      if (stderr && !stderr.includes('frame=')) {
        console.warn('FFmpeg警告:', stderr)
      }

      console.log('✅ 视频渲染完成:', outputPath)
      return outputPath
    } catch (error) {
      console.error('渲染失败:', error.message)
      throw error
    }
  }

  /**
   * 构建FFmpeg命令
   */
  buildFFmpegCommand(timeline, outputPath) {
    // 收集所有输入文件
    const inputs = this.collectInputs(timeline)

    // 构建输入命令
    const inputCmd = this.buildInputs(inputs)

    // 构建filter_complex
    const filterComplex = this.buildFilterComplex(timeline)

    // 构建完整命令
    const command = `ffmpeg -y ${inputCmd} -filter_complex "${filterComplex}" -t ${timeline.duration} -c:v libx264 -preset fast -crf 23 "${outputPath}"`

    return command
  }

  /**
   * 收集所有输入文件
   */
  collectInputs(timeline) {
    const inputs = []
    const seen = new Set()

    timeline.layers.forEach(layer => {
      if (layer.source && !seen.has(layer.source)) {
        inputs.push(layer.source)
        seen.add(layer.source)
      }
    })

    return inputs
  }

  /**
   * 构建输入命令
   */
  buildInputs(inputs) {
    return inputs.map(input => `-i "${input}"`).join(' ')
  }

  /**
   * 构建filter_complex
   */
  buildFilterComplex(timeline) {
    const filters = []
    const inputs = this.collectInputs(timeline)

    // 按zIndex排序图层
    const sortedLayers = this.sortLayersByZIndex(timeline.layers)

    // 处理字幕层
    const subtitleLayer = sortedLayers.find(l => l.type === 'subtitle')
    const imageLayers = sortedLayers.filter(l => l.type === 'image')

    let currentStream = '[0:v]'
    let streamIndex = 1

    // 处理图片层
    imageLayers.forEach((layer, index) => {
      const inputIndex = inputs.indexOf(layer.source)

      // 构建图片处理滤镜
      let imageFilter = `[${inputIndex}:v]scale=${layer.position.width || 800}:${layer.position.height || 600}`

      // 添加时间控制
      if (layer.startTime !== undefined && layer.endTime !== undefined) {
        imageFilter += `,${this.buildAlphaTimeControl(layer)}`
      }

      // 添加动画效果
      if (layer.effects && layer.effects.length > 0) {
        layer.effects.forEach(effect => {
          if (effect.type === 'fade') {
            imageFilter += `,${this.buildFadeFilter(effect)}`
          } else if (effect.type === 'scale') {
            imageFilter += `,${this.buildScaleFilter(effect)}`
          }
        })
      }

      imageFilter += `[img${index}]`
      filters.push(imageFilter)

      // 构建overlay
      const overlayFilter = `${currentStream}[img${index}]${this.buildOverlay(layer, streamIndex, index)}`
      filters.push(overlayFilter)

      currentStream = `[v${streamIndex}]`
      streamIndex++
    })

    // 处理字幕
    if (subtitleLayer) {
      const subtitleFilter = this.buildSubtitleFilter(subtitleLayer)
      filters.push(`${currentStream}${subtitleFilter}[vout]`)
      currentStream = '[vout]'
    }

    // 最后输出
    if (!subtitleLayer && imageLayers.length > 0) {
      filters[filters.length - 1] = filters[filters.length - 1].replace(/\[v\d+\]$/, '[vout]')
    } else if (imageLayers.length === 0 && !subtitleLayer) {
      filters.push(`${currentStream}copy[vout]`)
    }

    return filters.join(';')
  }

  /**
   * 构建alpha通道时间控制
   */
  buildAlphaTimeControl(layer) {
    return `geq=lum='lum(X,Y)':a='if(between(T,${layer.startTime},${layer.endTime}),255,0)'`
  }

  /**
   * 构建淡入淡出滤镜
   */
  buildFadeFilter(effect) {
    const duration = effect.endTime - effect.startTime
    return `fade=t=in:st=${effect.startTime}:d=${duration}:alpha=1`
  }

  /**
   * 构建缩放滤镜
   */
  buildScaleFilter(effect) {
    // 简化版本：使用固定缩放
    return `scale=iw*${effect.to}:ih*${effect.to}`
  }

  /**
   * 构建overlay命令
   */
  buildOverlay(layer, streamIndex, imageIndex) {
    const position = this.calculatePosition(layer.position, { width: 1920, height: 1080 })

    return `overlay=${position.x}:${position.y}[v${streamIndex}]`
  }

  /**
   * 计算位置坐标
   */
  calculatePosition(position, videoSize) {
    const x = position.x === 'center' ? '(W-w)/2' : position.x
    const y = position.y === 'center' ? '(H-h)/2' : position.y

    return { x, y }
  }

  /**
   * 按zIndex排序图层
   */
  sortLayersByZIndex(layers) {
    return [...layers].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
  }

  /**
   * 构建字幕滤镜
   */
  buildSubtitleFilter(subtitleLayer) {
    const filters = []

    subtitleLayer.subtitles.forEach((subtitle, index) => {
      const escapedText = this.escapeText(subtitle.text)
      const fontSize = subtitleLayer.style?.fontSize || 32
      const fontColor = subtitleLayer.style?.color || 'white'

      const filter = `drawtext=text='${escapedText}':fontsize=${fontSize}:fontcolor=${fontColor}:x=(w-text_w)/2:y=h-100:enable='between(t,${subtitle.startTime},${subtitle.endTime})'`

      filters.push(filter)
    })

    return filters.join(',')
  }

  /**
   * 转义特殊字符
   */
  escapeText(text) {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/:/g, '\\:')
      .replace(/"/g, '\\"')
  }

  /**
   * 验证时间轴
   */
  validateTimeline(timeline) {
    const errors = []

    if (!timeline.duration || timeline.duration <= 0) {
      errors.push('时间轴duration无效')
    }

    if (!timeline.layers || timeline.layers.length === 0) {
      errors.push('时间轴没有图层')
    }

    timeline.layers.forEach((layer, index) => {
      if (layer.startTime !== undefined && layer.endTime !== undefined) {
        if (layer.startTime < 0 || layer.endTime > timeline.duration) {
          errors.push(`图层${index}时间超出范围`)
        }

        if (layer.startTime >= layer.endTime) {
          errors.push(`图层${index}时间无效`)
        }
      }

      if (!layer.source && layer.type !== 'subtitle') {
        errors.push(`图层${index}缺少source`)
      }
    })

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * 验证素材文件
   */
  async validateAssets(timeline) {
    const errors = []

    for (const layer of timeline.layers) {
      if (layer.source && !fs.existsSync(layer.source)) {
        errors.push(`文件不存在: ${layer.source}`)
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * 获取视频信息
   */
  async getVideoInfo(videoPath) {
    try {
      const command = `ffprobe -v error -select_streams v:0 -show_entries stream=width,height,duration -of json "${videoPath}"`
      const { stdout } = await execAsync(command)
      const info = JSON.parse(stdout)

      return {
        width: info.streams[0].width,
        height: info.streams[0].height,
        duration: parseFloat(info.streams[0].duration)
      }
    } catch (error) {
      console.error('获取视频信息失败:', error.message)
      throw error
    }
  }

  /**
   * 调整图片尺寸
   */
  async resizeImage(imagePath, width, height, outputPath) {
    try {
      const command = `ffmpeg -y -i "${imagePath}" -vf scale=${width}:${height} "${outputPath}"`
      await execAsync(command)
      return outputPath
    } catch (error) {
      console.error('调整图片尺寸失败:', error.message)
      throw error
    }
  }
}

export default EnhancedVideoRenderer
