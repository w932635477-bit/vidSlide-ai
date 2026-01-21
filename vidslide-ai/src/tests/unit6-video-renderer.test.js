/**
 * 单元6: 视频渲染器测试
 * 测试EnhancedVideoRenderer的FFmpeg渲染能力
 */

import { describe, it, expect, beforeAll } from 'vitest'
import EnhancedVideoRenderer from '../services/EnhancedVideoRenderer.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

describe('单元6: EnhancedVideoRenderer', () => {
  let renderer
  const outputDir = path.join(__dirname, '../output/test-render')

  beforeAll(() => {
    renderer = new EnhancedVideoRenderer()

    // 创建输出目录
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
  })

  describe('6.1 FFmpeg命令构建', () => {
    it('应该构建基础FFmpeg命令', () => {
      const timeline = {
        duration: 10,
        layers: [
          {
            type: 'video',
            source: '/path/to/video.mp4',
            startTime: 0,
            endTime: 10
          }
        ]
      }

      const command = renderer.buildFFmpegCommand(timeline, path.join(outputDir, 'output.mp4'))

      expect(command).toBeDefined()
      expect(command).toContain('ffmpeg')
      expect(command).toContain('-i')
      console.log('✅ 基础FFmpeg命令:', command.substring(0, 100) + '...')
    })

    it('应该添加输入文件', () => {
      const inputs = ['/path/to/video.mp4', '/path/to/banner.png', '/path/to/image.png']

      const command = renderer.buildInputs(inputs)

      expect(command).toContain('-i')
      expect(command.split('-i').length - 1).toBe(3)
      console.log('✅ 输入文件命令:', command)
    })

    it('应该构建filter_complex', () => {
      const timeline = {
        layers: [
          {
            type: 'video',
            source: '/path/to/video.mp4',
            zIndex: 0
          },
          {
            type: 'image',
            source: '/path/to/banner.png',
            startTime: 0,
            endTime: 10,
            position: { x: 'center', y: 50, width: 800, height: 100 },
            zIndex: 10
          }
        ]
      }

      const filterComplex = renderer.buildFilterComplex(timeline)

      expect(filterComplex).toBeDefined()
      expect(filterComplex).toContain('overlay')
      console.log('✅ Filter Complex:', filterComplex.substring(0, 150) + '...')
    })
  })

  describe('6.2 时间控制', () => {
    it('应该生成alpha通道时间控制', () => {
      const layer = {
        startTime: 3,
        endTime: 6
      }

      const alphaFilter = renderer.buildAlphaTimeControl(layer)

      expect(alphaFilter).toBeDefined()
      expect(alphaFilter).toContain('geq')
      expect(alphaFilter).toContain('between(T,3,6)')
      console.log('✅ Alpha时间控制:', alphaFilter)
    })

    it('应该处理淡入淡出效果', () => {
      const effect = {
        type: 'fade',
        startTime: 3,
        endTime: 3.5,
        from: 0,
        to: 1
      }

      const fadeFilter = renderer.buildFadeFilter(effect)

      expect(fadeFilter).toBeDefined()
      expect(fadeFilter).toContain('fade')
      console.log('✅ 淡入淡出滤镜:', fadeFilter)
    })

    it('应该处理缩放效果', () => {
      const effect = {
        type: 'scale',
        startTime: 0,
        endTime: 1,
        from: 0.8,
        to: 1.0
      }

      const scaleFilter = renderer.buildScaleFilter(effect)

      expect(scaleFilter).toBeDefined()
      expect(scaleFilter).toContain('scale')
      console.log('✅ 缩放滤镜:', scaleFilter)
    })
  })

  describe('6.3 图层合成', () => {
    it('应该构建overlay命令', () => {
      const layer = {
        type: 'image',
        position: { x: 100, y: 200, width: 800, height: 600 }
      }

      const overlayCmd = renderer.buildOverlay(layer, 0, 1)

      expect(overlayCmd).toBeDefined()
      expect(overlayCmd).toContain('overlay')
      expect(overlayCmd).toContain('100')
      expect(overlayCmd).toContain('200')
      console.log('✅ Overlay命令:', overlayCmd)
    })

    it('应该处理center定位', () => {
      const layer = {
        type: 'image',
        position: { x: 'center', y: 'center', width: 800, height: 600 }
      }

      const overlayCmd = renderer.buildOverlay(layer, 0, 1)

      expect(overlayCmd).toContain('(W-w)/2')
      expect(overlayCmd).toContain('(H-h)/2')
      console.log('✅ Center定位:', overlayCmd)
    })

    it('应该按zIndex排序图层', () => {
      const layers = [
        { zIndex: 30, name: 'layer3' },
        { zIndex: 10, name: 'layer1' },
        { zIndex: 20, name: 'layer2' }
      ]

      const sorted = renderer.sortLayersByZIndex(layers)

      expect(sorted[0].zIndex).toBe(10)
      expect(sorted[1].zIndex).toBe(20)
      expect(sorted[2].zIndex).toBe(30)
      console.log('✅ 图层排序:', sorted.map(l => l.name))
    })
  })

  describe('6.4 字幕渲染', () => {
    it('应该构建字幕滤镜', () => {
      const subtitleLayer = {
        type: 'subtitle',
        subtitles: [
          { text: '第一段', startTime: 0, endTime: 3 },
          { text: '第二段', startTime: 3, endTime: 6 }
        ],
        style: {
          fontSize: 32,
          color: 'white',
          backgroundColor: 'rgba(0,0,0,0.7)'
        }
      }

      const subtitleFilter = renderer.buildSubtitleFilter(subtitleLayer)

      expect(subtitleFilter).toBeDefined()
      expect(subtitleFilter).toContain('drawtext')
      console.log('✅ 字幕滤镜:', subtitleFilter.substring(0, 100) + '...')
    })

    it('应该转义特殊字符', () => {
      const text = "Hello: World's \"Test\""
      const escaped = renderer.escapeText(text)

      expect(escaped).toContain('\\:')
      expect(escaped).toContain("\\'")
      expect(escaped).toContain('\\"')
      console.log('✅ 转义文本:', escaped)
    })
  })

  describe('6.5 素材验证', () => {
    it('应该验证时间轴结构', () => {
      const timeline = {
        duration: 10,
        layers: [
          { type: 'video', source: '/path/to/video.mp4', startTime: 0, endTime: 10 },
          { type: 'image', source: '/path/to/banner.png', startTime: 0, endTime: 10 }
        ]
      }

      const result = renderer.validateTimeline(timeline)

      expect(result.valid).toBe(true)
      console.log('✅ 时间轴验证通过')
    })

    it('应该检测无效的时间范围', () => {
      const timeline = {
        duration: 10,
        layers: [
          { type: 'video', source: '/path/to/video.mp4', startTime: 0, endTime: 15 } // 超出范围
        ]
      }

      const result = renderer.validateTimeline(timeline)

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      console.log('✅ 检测到无效时间范围')
    })
  })

  describe('6.6 辅助功能', () => {
    it('应该计算位置坐标', () => {
      const position = { x: 'center', y: 100, width: 800, height: 600 }
      const videoSize = { width: 1920, height: 1080 }

      const coords = renderer.calculatePosition(position, videoSize)

      expect(coords.x).toBe('(W-w)/2')
      expect(coords.y).toBe(100)
      console.log('✅ 位置坐标:', coords)
    })

    it('应该收集所有输入文件', () => {
      const timeline = {
        layers: [
          { type: 'video', source: '/path/to/video.mp4' },
          { type: 'image', source: '/path/to/banner.png' },
          { type: 'image', source: '/path/to/image.png' }
        ]
      }

      const inputs = renderer.collectInputs(timeline)

      expect(inputs.length).toBe(3)
      expect(inputs[0]).toBe('/path/to/video.mp4')
      console.log('✅ 收集输入文件:', inputs.length, '个')
    })
  })
})
