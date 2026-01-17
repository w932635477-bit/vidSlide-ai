/**
 * Remotion视频渲染服务器
 * 提供HTTP API用于视频渲染
 */

import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { bundle } from '@remotion/bundler'
import { renderMedia, selectComposition, getCompositions } from '@remotion/renderer'
import { v4 as uuidv4 } from 'uuid'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3002

// 中间件
app.use(cors())
app.use(express.json())

// 渲染任务存储
const renderTasks = new Map()

// 模板列表
const templates = [
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

// 启动服务器
app.listen(PORT, () => {
  console.log(`🎬 Remotion渲染服务器运行在 http://localhost:${PORT}`)
  console.log(`📋 模板数量: ${templates.length}`)
  console.log(`✅ 服务器已就绪`)
})
