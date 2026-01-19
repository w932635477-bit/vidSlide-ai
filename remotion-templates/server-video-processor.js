/**
 * 服务器端视频处理器
 * 使用原生FFmpeg进行视频处理
 *
 * 功能:
 * - 视频分割
 * - 视频合并
 * - PIP合成
 * - 视频压缩
 *
 * @author VidSlide AI Team
 * @version 2.0.0
 */

import ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import fs from 'fs'
import { promisify } from 'util'

const mkdir = promisify(fs.mkdir)
const unlink = promisify(fs.unlink)
const writeFile = promisify(fs.writeFile)

class ServerVideoProcessor {
  constructor() {
    console.log('✅ ServerVideoProcessor 初始化完成')
  }

  /**
   * 分割视频
   *
   * @param {string} inputPath - 输入视频路径
   * @param {Array} scenes - 场景数组 [{startTime, endTime}, ...]
   * @param {string} outputDir - 输出目录
   * @param {Function} onProgress - 进度回调
   * @returns {Promise<Array>} 分割后的视频片段数组
   */
  async splitVideo(inputPath, scenes, outputDir, onProgress = null) {
    console.log('✂️ 开始服务器端视频分割')
    console.log('  - 输入文件:', inputPath)
    console.log('  - 场景数量:', scenes.length)
    console.log('  - 输出目录:', outputDir)

    // 确保输出目录存在
    await mkdir(outputDir, { recursive: true })

    const segments = []

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i]
      const outputPath = path.join(outputDir, `segment_${i}.mp4`)

      console.log(`  ✂️ 分割场景 ${i + 1}/${scenes.length}`)
      console.log(`    - 时间范围: ${scene.startTime}s - ${scene.endTime}s`)

      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .setStartTime(scene.startTime)
          .setDuration(scene.endTime - scene.startTime)
          .output(outputPath)
          .outputOptions([
            '-c copy',  // 无损复制,不重新编码
            '-avoid_negative_ts 1'  // 避免负时间戳
          ])
          .on('start', (commandLine) => {
            console.log('    FFmpeg命令:', commandLine)
          })
          .on('progress', (progress) => {
            if (progress.percent) {
              console.log(`    进度: ${Math.round(progress.percent)}%`)
            }
          })
          .on('end', () => {
            console.log(`    ✅ 场景 ${i + 1} 分割完成`)
            segments.push({
              index: i,
              path: outputPath,
              startTime: scene.startTime,
              endTime: scene.endTime,
              duration: scene.endTime - scene.startTime
            })
            resolve()
          })
          .on('error', (err) => {
            console.error(`    ❌ 场景 ${i + 1} 分割失败:`, err.message)
            reject(err)
          })
          .run()
      })

      // 更新进度
      if (onProgress) {
        onProgress((i + 1) / scenes.length)
      }
    }

    console.log('✅ 视频分割完成,共', segments.length, '个片段')
    return segments
  }

  /**
   * 合并视频
   *
   * @param {Array} inputPaths - 输入视频路径数组
   * @param {string} outputPath - 输出视频路径
   * @param {Function} onProgress - 进度回调
   * @returns {Promise<string>} 输出视频路径
   */
  async mergeVideos(inputPaths, outputPath, onProgress = null) {
    console.log('🔗 开始服务器端视频合并')
    console.log('  - 片段数量:', inputPaths.length)
    console.log('  - 输出文件:', outputPath)

    // 确保输出目录存在
    const outputDir = path.dirname(outputPath)
    await mkdir(outputDir, { recursive: true })

    // 创建concat文件
    const concatFile = path.join(outputDir, `concat_${Date.now()}.txt`)
    const concatContent = inputPaths.map(p => `file '${p}'`).join('\n')
    await writeFile(concatFile, concatContent)

    console.log('📝 Concat文件内容:')
    console.log(concatContent)

    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(concatFile)
        .inputOptions(['-f concat', '-safe 0'])
        .outputOptions(['-c copy'])  // 无损复制
        .output(outputPath)
        .on('start', (commandLine) => {
          console.log('  FFmpeg命令:', commandLine)
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            console.log(`  进度: ${Math.round(progress.percent)}%`)
            if (onProgress) {
              onProgress(progress.percent / 100)
            }
          }
        })
        .on('end', () => {
          console.log('  ✅ 视频合并完成')
          resolve()
        })
        .on('error', (err) => {
          console.error('  ❌ 视频合并失败:', err.message)
          reject(err)
        })
        .run()
    })

    // 清理concat文件
    await unlink(concatFile)

    console.log('✅ 视频合并完成')
    return outputPath
  }

  /**
   * PIP合成 (画中画) - 优化版
   * 支持圆形遮罩和竖版视频
   *
   * @param {string} backgroundPath - 背景视频路径 (PPT模板)
   * @param {string} foregroundPath - 前景视频路径 (原视频)
   * @param {string} outputPath - 输出视频路径
   * @param {Object} config - PIP配置 {x, y, width, height, shape, position}
   * @param {Function} onProgress - 进度回调
   * @returns {Promise<string>} 输出视频路径
   */
  async composePIP(backgroundPath, foregroundPath, outputPath, config, onProgress = null) {
    console.log('📹 开始服务器端PIP合成')
    console.log('  - 背景视频:', backgroundPath)
    console.log('  - 前景视频:', foregroundPath)
    console.log('  - 输出文件:', outputPath)
    console.log('  - PIP配置:', config)

    // 确保输出目录存在
    const outputDir = path.dirname(outputPath)
    await mkdir(outputDir, { recursive: true })

    // 默认配置
    const {
      pipWidth = 300,
      pipHeight = 300,
      position = 'center-top', // 'center-top' 或 'right-top'
      shape = 'circle' // 'circle' 或 'rounded-rect'
    } = config

    // 计算PIP位置
    let pipX, pipY
    if (position === 'center-top') {
      // 中央上方: 水平居中，距离顶部300px
      pipX = `(W-${pipWidth})/2`
      pipY = 300
    } else if (position === 'right-top') {
      // 右侧上方: 距离右边80px，距离顶部200px
      pipX = `W-${pipWidth}-80`
      pipY = 200
    } else {
      // 默认中央
      pipX = `(W-${pipWidth})/2`
      pipY = 300
    }

    // 构建filter_complex
    let filterComplex
    if (shape === 'circle') {
      // 圆形遮罩
      filterComplex = [
        // 确保背景是竖版
        '[0:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2[bg]',
        // 缩放前景视频为PIP尺寸，保持宽高比并裁剪
        `[1:v]scale=${pipWidth}:${pipHeight}:force_original_aspect_ratio=increase,crop=${pipWidth}:${pipHeight}[pip_scaled]`,
        // 创建圆形遮罩
        `[pip_scaled]format=yuva420p,geq='lum=p(X,Y):a=if(lt(sqrt(pow(X-W/2,2)+pow(Y-H/2,2)),W/2),255,0)'[pip_masked]`,
        // 叠加到背景上
        `[bg][pip_masked]overlay=${pipX}:${pipY}[out]`
      ]
    } else {
      // 圆角矩形
      filterComplex = [
        '[0:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2[bg]',
        `[1:v]scale=${pipWidth}:${pipHeight}:force_original_aspect_ratio=increase,crop=${pipWidth}:${pipHeight}[pip]`,
        `[bg][pip]overlay=${pipX}:${pipY}[out]`
      ]
    }

    console.log('  - PIP位置:', position, `(${pipX}, ${pipY})`)
    console.log('  - PIP尺寸:', `${pipWidth}x${pipHeight}`)
    console.log('  - PIP形状:', shape)

    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(backgroundPath)  // 输入0: 背景
        .input(foregroundPath)  // 输入1: 前景
        .complexFilter(filterComplex)
        .outputOptions([
          '-map [out]',      // 使用合成后的视频
          '-map 1:a?',       // 使用前景音频(如果存在)
          '-c:v libx264',    // 视频编码器
          '-preset fast',    // 编码速度
          '-crf 23',         // 质量
          '-pix_fmt yuv420p', // 像素格式
          '-c:a aac',        // 音频编码器
          '-b:a 128k'        // 音频码率
        ])
        .output(outputPath)
        .on('start', (commandLine) => {
          console.log('  FFmpeg命令:', commandLine)
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            console.log(`  进度: ${Math.round(progress.percent)}%`)
            if (onProgress) {
              onProgress(progress.percent / 100)
            }
          }
        })
        .on('end', () => {
          console.log('  ✅ PIP合成完成')
          resolve()
        })
        .on('error', (err) => {
          console.error('  ❌ PIP合成失败:', err.message)
          reject(err)
        })
        .run()
    })

    console.log('✅ PIP合成完成')
    return outputPath
  }

  /**
   * 压缩视频
   *
   * @param {string} inputPath - 输入视频路径
   * @param {string} outputPath - 输出视频路径
   * @param {string} platform - 目标平台 (douyin, xiaohongshu, bilibili, instagram)
   * @param {Function} onProgress - 进度回调
   * @returns {Promise<string>} 输出视频路径
   */
  async compressVideo(inputPath, outputPath, platform = 'douyin', onProgress = null) {
    console.log('🗜️ 开始服务器端视频压缩')
    console.log('  - 输入文件:', inputPath)
    console.log('  - 输出文件:', outputPath)
    console.log('  - 目标平台:', platform)

    // 确保输出目录存在
    const outputDir = path.dirname(outputPath)
    await mkdir(outputDir, { recursive: true })

    // 平台预设配置
    const presets = {
      douyin: {
        name: '抖音/TikTok',
        videoBitrate: '7M',
        audioBitrate: '128k',
        crf: 23,
        preset: 'medium',
        resolution: '1080:1920',
        fps: 30
      },
      xiaohongshu: {
        name: '小红书',
        videoBitrate: '15M',
        audioBitrate: '192k',
        crf: 20,
        preset: 'slow',
        resolution: '1080:1920',
        fps: 30
      },
      bilibili: {
        name: 'B站',
        videoBitrate: '18M',
        audioBitrate: '192k',
        crf: 18,
        preset: 'slow',
        resolution: '1920:1080',
        fps: 30
      },
      instagram: {
        name: 'Instagram Reels',
        videoBitrate: '15M',
        audioBitrate: '192k',
        crf: 20,
        preset: 'medium',
        resolution: '1080:1920',
        fps: 30
      }
    }

    const preset = presets[platform] || presets.douyin
    console.log('  - 压缩配置:', preset)

    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-c:v libx264',
          `-crf ${preset.crf}`,
          `-preset ${preset.preset}`,
          '-profile:v high',
          '-level 4.0',
          `-b:v ${preset.videoBitrate}`,
          `-maxrate ${preset.videoBitrate}`,
          `-bufsize ${parseInt(preset.videoBitrate) * 2}M`,
          `-vf scale=${preset.resolution}:flags=lanczos`,
          `-r ${preset.fps}`,
          '-c:a aac',
          `-b:a ${preset.audioBitrate}`,
          '-ar 44100'
        ])
        .output(outputPath)
        .on('start', (commandLine) => {
          console.log('  FFmpeg命令:', commandLine)
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            console.log(`  进度: ${Math.round(progress.percent)}%`)
            if (onProgress) {
              onProgress(progress.percent / 100)
            }
          }
        })
        .on('end', () => {
          console.log('  ✅ 视频压缩完成')
          resolve()
        })
        .on('error', (err) => {
          console.error('  ❌ 视频压缩失败:', err.message)
          reject(err)
        })
        .run()
    })

    // 获取文件大小
    const stats = fs.statSync(outputPath)
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2)
    console.log(`  - 文件大小: ${sizeMB} MB`)

    console.log('✅ 视频压缩完成')
    return outputPath
  }

  /**
   * 获取视频元数据
   *
   * @param {string} videoPath - 视频路径
   * @returns {Promise<Object>} 视频元数据
   */
  async getVideoMetadata(videoPath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          reject(err)
        } else {
          const videoStream = metadata.streams.find(s => s.codec_type === 'video')
          const audioStream = metadata.streams.find(s => s.codec_type === 'audio')

          resolve({
            duration: metadata.format.duration,
            size: metadata.format.size,
            bitrate: metadata.format.bit_rate,
            video: videoStream ? {
              codec: videoStream.codec_name,
              width: videoStream.width,
              height: videoStream.height,
              fps: eval(videoStream.r_frame_rate)
            } : null,
            audio: audioStream ? {
              codec: audioStream.codec_name,
              sampleRate: audioStream.sample_rate,
              channels: audioStream.channels
            } : null
          })
        }
      })
    })
  }

  /**
   * 清理临时文件
   *
   * @param {Array} filePaths - 文件路径数组
   */
  async cleanupFiles(filePaths) {
    for (const filePath of filePaths) {
      try {
        if (fs.existsSync(filePath)) {
          await unlink(filePath)
          console.log('🧹 已清理:', filePath)
        }
      } catch (error) {
        console.error('⚠️ 清理失败:', filePath, error.message)
      }
    }
  }
}

export default ServerVideoProcessor
