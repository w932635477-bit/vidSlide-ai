/**
 * Remotion视频渲染服务器
 * 提供HTTP API用于视频渲染
 */

import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { bundle } from '@remotion/bundler'
import { renderMedia, selectComposition, getCompositions } from '@remotion/renderer'
import { v4 as uuidv4 } from 'uuid'
import multer from 'multer'
import ServerVideoProcessor from './server-video-processor.js'
import sharp from 'sharp'
import axios from 'axios'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3002

// 中间件
app.use(cors())
app.use(express.json())

// 配置文件上传
const upload = multer({
  dest: path.join(__dirname, 'uploads/'),
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB限制
})

// 确保必要的目录存在
const uploadsDir = path.join(__dirname, 'uploads')
const outputDir = path.join(__dirname, 'output')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

// 渲染任务存储
const renderTasks = new Map()

// 视频处理器实例
const videoProcessor = new ServerVideoProcessor()

// 模板列表
const templates = [
  // 专用模板
  { id: 'MultiLayerVertical', name: '多层竖版视频', category: 'special' },

  // 基础展示类
  { id: 'GlassmorphismStack', name: '磨砂玻璃3D堆叠', category: 'showcase' },
  { id: 'LuxuryProductShowcase', name: '奢华金色卡片', category: 'showcase' },
  { id: 'NeumorphismSoft', name: '新拟态柔和', category: 'showcase' },
  { id: 'HolographicRainbow', name: '全息彩虹', category: 'showcase' },
  { id: 'MinimalWhiteSpace', name: '极简留白', category: 'showcase' },
  
  // 对比分析类
  { id: 'SplitComparison', name: '分屏对比', category: 'comparison' },
  { id: 'BeforeAfterSlider', name: '前后滑动对比', category: 'comparison' },
  { id: 'DiagonalSplit', name: '对角线分割', category: 'comparison' },
  { id: 'CircularReveal', name: '圆形揭示', category: 'comparison' },
  { id: 'FlipCard', name: '3D翻转卡片', category: 'comparison' },
  
  // 数据可视化类
  { id: 'AnimatedBarChart', name: '动态柱状图', category: 'data' },
  { id: 'CircularProgress', name: '环形进度图', category: 'data' },
  { id: 'LineChartFlow', name: '流动曲线图', category: 'data' },
  { id: 'RadarChart', name: '雷达图展示', category: 'data' },
  { id: 'InfographicGrid', name: '信息图表网格', category: 'data' },
  
  // 文字动画类
  { id: 'KineticTypography', name: '动态字体分解', category: 'text' },
  { id: 'NeonGlowText', name: '霓虹发光文字', category: 'text' },
  { id: 'LiquidMorphText', name: '液态变形文字', category: 'text' },
  { id: 'GlitchText', name: '故障艺术文字', category: 'text' },
  { id: 'ThreeDExtrudeText', name: '3D挤出文字', category: 'text' },
  
  // 创意特效类
  { id: 'ParticleExplosion', name: '粒子爆炸', category: 'effects' },
  { id: 'RippleWave', name: '涟漪波纹', category: 'effects' },
  { id: 'LightBeamScan', name: '光束扫描', category: 'effects' },
  { id: 'MorphShapeTransition', name: '形态变换', category: 'effects' },
  { id: 'FloatingIslands', name: '漂浮岛屿', category: 'effects' },
  
  // 混合效果类
  { id: 'MagneticCards', name: '磁吸卡片', category: 'mixed' },
  { id: 'PerspectiveGallery', name: '透视画廊', category: 'mixed' },
  { id: 'SplitFlap', name: '翻页显示屏', category: 'mixed' },
  { id: 'CrystalPrism', name: '水晶棱镜', category: 'mixed' },
  { id: 'InkSpread', name: '墨水扩散', category: 'mixed' }
]

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Remotion渲染服务器运行正常' })
})

// 获取模板列表
app.get('/templates', (req, res) => {
  res.json({ templates })
})

// 渲染视频
app.post('/render', async (req, res) => {
  const { composition, props, options = {} } = req.body
  
  if (!composition) {
    return res.status(400).json({ error: '缺少composition参数' })
  }

  const renderId = uuidv4()
  const outputPath = path.join(__dirname, 'output', `${renderId}.mp4`)

  // 创建渲染任务
  renderTasks.set(renderId, {
    id: renderId,
    composition,
    status: 'pending',
    progress: 0,
    outputPath: null,
    error: null,
    startTime: Date.now()
  })

  // 异步渲染
  ;(async () => {
    try {
      // 更新状态为渲染中
      renderTasks.get(renderId).status = 'rendering'

      // Bundle项目
      const bundleLocation = await bundle({
        entryPoint: path.join(__dirname, 'src/index.jsx'),
        webpackOverride: (config) => config,
      })

      // 选择composition
      const compositionData = await selectComposition({
        serveUrl: bundleLocation,
        id: composition,
        inputProps: props || {}
      })

      // 渲染视频
      await renderMedia({
        composition: compositionData,
        serveUrl: bundleLocation,
        codec: options.codec || 'h264',
        outputLocation: outputPath,
        inputProps: props || {},
        onProgress: ({ progress }) => {
          const task = renderTasks.get(renderId)
          if (task) {
            task.progress = Math.round(progress * 100)
          }
        }
      })

      // 更新状态为完成
      const task = renderTasks.get(renderId)
      if (task) {
        task.status = 'done'
        task.progress = 100
        task.outputPath = outputPath
        task.endTime = Date.now()
      }

    } catch (error) {
      console.error('渲染失败:', error)
      const task = renderTasks.get(renderId)
      if (task) {
        task.status = 'error'
        task.error = error.message
      }
    }
  })()

  // 立即返回渲染ID
  res.json({
    renderId,
    status: 'pending',
    message: '渲染任务已创建'
  })
})

// 获取渲染进度
app.get('/progress/:renderId', (req, res) => {
  const { renderId } = req.params
  const task = renderTasks.get(renderId)

  if (!task) {
    return res.status(404).json({ error: '渲染任务不存在' })
  }

  res.json({
    id: task.id,
    status: task.status,
    progress: task.progress,
    outputPath: task.outputPath,
    error: task.error
  })
})

// 取消渲染
app.post('/cancel/:renderId', (req, res) => {
  const { renderId } = req.params
  const task = renderTasks.get(renderId)

  if (!task) {
    return res.status(404).json({ error: '渲染任务不存在' })
  }

  task.status = 'cancelled'
  res.json({ message: '渲染任务已取消' })
})

// 下载视频
app.get('/download/:renderId', (req, res) => {
  const { renderId } = req.params
  const task = renderTasks.get(renderId)

  if (!task || task.status !== 'done') {
    return res.status(404).json({ error: '视频不存在或未完成' })
  }

  res.download(task.outputPath)
})

// ==================== 视频处理API ====================

// 上传视频
app.post('/api/upload', upload.single('video'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '未上传文件' })
    }

    console.log('📤 视频上传成功:', req.file.originalname)
    res.json({
      success: true,
      path: req.file.path,
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size
    })
  } catch (error) {
    console.error('❌ 上传失败:', error)
    res.status(500).json({ error: error.message })
  }
})

// 视频分割API
app.post('/api/video/split', upload.single('video'), async (req, res) => {
  try {
    const { scenes } = req.body

    if (!req.file) {
      return res.status(400).json({ error: '未上传视频文件' })
    }

    if (!scenes) {
      return res.status(400).json({ error: '缺少scenes参数' })
    }

    const videoPath = req.file.path
    const taskId = uuidv4()
    const taskOutputDir = path.join(outputDir, taskId)

    console.log('✂️ 开始视频分割任务:', taskId)

    // 异步处理
    ;(async () => {
      try {
        const segments = await videoProcessor.splitVideo(
          videoPath,
          JSON.parse(scenes),
          taskOutputDir
        )

        // 清理上传的文件
        fs.unlinkSync(videoPath)

        console.log('✅ 视频分割完成:', taskId)
      } catch (error) {
        console.error('❌ 视频分割失败:', taskId, error)
      }
    })()

    res.json({
      success: true,
      taskId,
      message: '视频分割任务已创建'
    })
  } catch (error) {
    console.error('❌ 视频分割API错误:', error)
    res.status(500).json({ error: error.message })
  }
})

// 视频合并API
app.post('/api/video/merge', async (req, res) => {
  try {
    const { segmentPaths } = req.body

    if (!segmentPaths || !Array.isArray(segmentPaths)) {
      return res.status(400).json({ error: '缺少segmentPaths参数' })
    }

    const taskId = uuidv4()
    const outputPath = path.join(outputDir, `${taskId}.mp4`)

    console.log('🔗 开始视频合并任务:', taskId)

    // 异步处理
    ;(async () => {
      try {
        await videoProcessor.mergeVideos(segmentPaths, outputPath)
        console.log('✅ 视频合并完成:', taskId)
      } catch (error) {
        console.error('❌ 视频合并失败:', taskId, error)
      }
    })()

    res.json({
      success: true,
      taskId,
      outputPath,
      url: `/download/file/${taskId}.mp4`,
      message: '视频合并任务已创建'
    })
  } catch (error) {
    console.error('❌ 视频合并API错误:', error)
    res.status(500).json({ error: error.message })
  }
})

// PIP合成API
app.post('/api/video/pip-compose', async (req, res) => {
  try {
    const { backgroundPath, foregroundPath, pipConfig } = req.body

    if (!backgroundPath || !foregroundPath) {
      return res.status(400).json({ error: '缺少视频路径参数' })
    }

    const taskId = uuidv4()
    const outputPath = path.join(outputDir, `${taskId}.mp4`)

    // 转换路径为绝对路径
    const resolveVideoPath = (videoPath) => {
      // 如果是绝对路径,直接返回
      if (path.isAbsolute(videoPath)) {
        return videoPath
      }
      // 如果是相对路径,相对于outputDir
      return path.join(outputDir, videoPath)
    }

    const absoluteBackgroundPath = resolveVideoPath(backgroundPath)
    const absoluteForegroundPath = resolveVideoPath(foregroundPath)

    console.log('📹 开始PIP合成任务:', taskId)
    console.log('  - 背景视频:', absoluteBackgroundPath)
    console.log('  - 前景视频:', absoluteForegroundPath)

    // 异步处理
    ;(async () => {
      try {
        await videoProcessor.composePIP(
          absoluteBackgroundPath,
          absoluteForegroundPath,
          outputPath,
          pipConfig || { x: 1400, y: 770, width: 480, height: 270 }
        )
        console.log('✅ PIP合成完成:', taskId)
      } catch (error) {
        console.error('❌ PIP合成失败:', taskId, error)
      }
    })()

    res.json({
      success: true,
      taskId,
      outputPath,
      url: `/download/file/${taskId}.mp4`,
      message: 'PIP合成任务已创建'
    })
  } catch (error) {
    console.error('❌ PIP合成API错误:', error)
    res.status(500).json({ error: error.message })
  }
})

// 视频压缩API
app.post('/api/video/compress', async (req, res) => {
  try {
    const { inputPath, platform } = req.body

    if (!inputPath) {
      return res.status(400).json({ error: '缺少inputPath参数' })
    }

    const taskId = uuidv4()
    const outputPath = path.join(outputDir, `${taskId}.mp4`)

    // 转换路径为绝对路径
    const resolveVideoPath = (videoPath) => {
      // 如果是绝对路径,直接返回
      if (path.isAbsolute(videoPath)) {
        return videoPath
      }
      // 如果是相对路径,相对于outputDir
      return path.join(outputDir, videoPath)
    }

    const absoluteInputPath = resolveVideoPath(inputPath)

    console.log('🗜️ 开始视频压缩任务:', taskId)
    console.log('  - 输入文件:', absoluteInputPath)

    // 异步处理
    ;(async () => {
      try {
        await videoProcessor.compressVideo(
          absoluteInputPath,
          outputPath,
          platform || 'douyin'
        )
        console.log('✅ 视频压缩完成:', taskId)
      } catch (error) {
        console.error('❌ 视频压缩失败:', taskId, error)
      }
    })()

    res.json({
      success: true,
      taskId,
      outputPath,
      url: `/download/file/${taskId}.mp4`,
      message: '视频压缩任务已创建'
    })
  } catch (error) {
    console.error('❌ 视频压缩API错误:', error)
    res.status(500).json({ error: error.message })
  }
})

// 下载文件API - 支持子目录路径
app.get('/download/file/*', (req, res) => {
  try {
    // 获取完整的文件路径（支持子目录）
    const relativePath = req.params[0]
    const filePath = path.join(outputDir, relativePath)

    // 安全检查：确保路径在outputDir内
    const normalizedPath = path.normalize(filePath)
    const normalizedOutputDir = path.normalize(outputDir)
    if (!normalizedPath.startsWith(normalizedOutputDir)) {
      return res.status(403).json({ error: '非法路径' })
    }

    if (!fs.existsSync(filePath)) {
      console.error('❌ 文件不存在:', filePath)
      return res.status(404).json({ error: '文件不存在' })
    }

    console.log('📥 下载文件:', relativePath)
    res.download(filePath)
  } catch (error) {
    console.error('❌ 下载文件错误:', error)
    res.status(500).json({ error: error.message })
  }
})

// 获取视频元数据API
app.post('/api/video/metadata', async (req, res) => {
  try {
    const { videoPath } = req.body

    if (!videoPath) {
      return res.status(400).json({ error: '缺少videoPath参数' })
    }

    const metadata = await videoProcessor.getVideoMetadata(videoPath)

    res.json({
      success: true,
      metadata
    })
  } catch (error) {
    console.error('❌ 获取元数据错误:', error)
    res.status(500).json({ error: error.message })
  }
})

// 图片裁剪API
app.post('/api/crop-image', async (req, res) => {
  try {
    const { imageUrl, width, height, fit = 'cover', position = 'center' } = req.body

    if (!imageUrl || !width || !height) {
      return res.status(400).json({ error: '缺少必要参数' })
    }

    console.log(`🖼️ 裁剪图片: ${imageUrl}`)
    console.log(`  目标尺寸: ${width}x${height}`)

    // 下载图片
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    const imageBuffer = Buffer.from(response.data)

    // 使用Sharp裁剪
    const croppedBuffer = await sharp(imageBuffer)
      .resize(width, height, {
        fit: fit,
        position: position
      })
      .jpeg({ quality: 90 })
      .toBuffer()

    // 保存到临时目录
    const filename = `cropped_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`
    const outputPath = path.join(__dirname, 'uploads', filename)
    await fs.promises.writeFile(outputPath, croppedBuffer)

    // 返回裁剪后的URL
    const croppedUrl = `http://localhost:3002/uploads/${filename}`

    console.log(`✅ 图片裁剪完成: ${croppedUrl}`)

    res.json({
      success: true,
      croppedUrl,
      originalUrl: imageUrl,
      width,
      height
    })
  } catch (error) {
    console.error('❌ 图片裁剪失败:', error.message)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// 静态文件服务 - 提供上传的文件访问
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// 启动服务器
app.listen(PORT, () => {
  console.log(`🎬 Remotion渲染服务器运行在 http://localhost:${PORT}`)
  console.log(`📋 模板数量: ${templates.length}`)
  console.log(`📹 视频处理API已启用`)
  console.log(`✅ 服务器已就绪`)
})
