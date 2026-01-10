/**
 * VidSlide AI - PPTX演示文稿导出器
 * 生成PPTX格式的演示文稿，支持企业级编辑
 *
 * @author VidSlide AI Team
 * @version 1.0.0
 */

import { getWatermarkGenerator } from './WatermarkGenerator.js'

export class PptxExporter {
  constructor() {
    this.assets = new Map()
    this.watermarkGenerator = getWatermarkGenerator()
    this.isInitialized = false
    this.PptxGenJS = null
  }

  /**
   * 初始化PPTX导出器
   */
  async initialize() {
    if (this.isInitialized) return { success: true }

    try {
      // 动态加载PptxGenJS
      if (typeof window !== 'undefined') {
        if (typeof PptxGenJS === 'undefined') {
          await this.loadPptxGenJS()
        }
        this.PptxGenJS = window.PptxGenJS || PptxGenJS
      } else {
        throw new Error('PPTX导出在Node.js环境中不可用，请在浏览器中使用')
      }

      this.isInitialized = true
      return { success: true }
    } catch (error) {
      console.error('PPTX导出器初始化失败:', error)
      return {
        success: false,
        error: error.message,
        fallback: '请在浏览器环境中使用PPTX导出功能'
      }
    }
  }

  /**
   * 动态加载PptxGenJS库
   */
  async loadPptxGenJS() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.min.js'
      script.onload = () => {
        if (typeof PptxGenJS !== 'undefined' || typeof window.PptxGenJS !== 'undefined') {
          resolve()
        } else {
          reject(new Error('PptxGenJS库加载失败'))
        }
      }
      script.onerror = () => reject(new Error('无法加载PptxGenJS库'))
      document.head.appendChild(script)

      // 设置超时
      setTimeout(() => reject(new Error('PptxGenJS库加载超时')), 15000)
    })
  }

  /**
   * 导出PPTX演示文稿
   * @param {Object} options 导出选项
   * @param {Array} options.slides 幻灯片数据
   * @param {Object} options.template 模板配置
   * @param {string} options.title 演示文稿标题
   * @param {string} options.layout 幻灯片布局 (16x9, 4x3, A4等)
   * @param {boolean} options.applyWatermark 是否应用水印
   */
  async exportPptx(options = {}) {
    const initResult = await this.initialize()
    if (!initResult.success) {
      throw new Error(initResult.error)
    }

    const {
      slides = [],
      template = 'professional',
      title = 'VidSlide AI 演示',
      layout = '16x9',
      author = 'VidSlide AI',
      company = 'VidSlide AI',
      subject = 'AI生成的演示文稿',
      applyWatermark = true
    } = options

    try {
      // 创建PPTX演示文稿
      const pptx = new this.PptxGenJS()

      // 设置演示文稿属性
      pptx.author = author
      pptx.company = company
      pptx.subject = subject
      pptx.title = title

      // 设置布局
      this.setLayout(pptx, layout)

      // 定义母版
      await this.defineMasterSlide(pptx, template)

      // 处理每个幻灯片
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i]
        await this.addSlide(pptx, slide, {
          slideIndex: i,
          totalSlides: slides.length,
          template,
          layout,
          applyWatermark
        })
      }

      // 生成文件名
      const fileName = `${title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}.pptx`

      // 保存PPTX文件
      await pptx.writeFile({ fileName })

      return {
        success: true,
        fileName,
        slideCount: slides.length,
        fileSize: this.estimateFileSize(slides),
        format: 'PPTX'
      }
    } catch (error) {
      console.error('PPTX导出失败:', error)
      throw new Error(`PPTX导出失败: ${error.message}`)
    }
  }

  /**
   * 设置演示文稿布局
   */
  setLayout(pptx, layout) {
    const layouts = {
      '16x9': { width: 10, height: 5.625 }, // 16:9 宽屏
      '4x3': { width: 10, height: 7.5 }, // 4:3 传统
      A4: { width: 8.27, height: 11.69 }, // A4纸张比例
      wide: { width: 13.33, height: 7.5 } // 宽屏
    }

    const dimensions = layouts[layout] || layouts['16x9']
    pptx.defineLayout({ name: 'CUSTOM', width: dimensions.width, height: dimensions.height })
    pptx.layout = 'CUSTOM'
  }

  /**
   * 定义母版幻灯片
   */
  async defineMasterSlide(pptx, template) {
    const masterSlide = pptx.defineSlideMaster({
      title: 'MASTER_SLIDE',
      background: this.getTemplateBackground(template)
    })

    // 根据模板添加母版元素
    switch (template) {
    case 'professional':
      // 添加页脚和页码占位符
      masterSlide.addText('{{slideNum}}', {
        placeholder: 'slideNumber',
        x: '90%',
        y: '95%',
        w: '10%',
        h: 0.3,
        fontSize: 10,
        color: '666666',
        align: 'right'
      })
      break

    case 'modern':
      // 现代风格母版
      masterSlide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: '100%',
        h: '10%',
        fill: { color: '007ACC' }
      })
      break

    case 'minimal':
      // 极简风格 - 几乎空白
      break
    }
  }

  /**
   * 添加幻灯片
   */
  async addSlide(pptx, slideData, options) {
    const { slideIndex, totalSlides, template, applyWatermark } = options

    // 创建新幻灯片
    const slide = pptx.addSlide()

    // 设置背景
    if (slideData.background) {
      this.setSlideBackground(slide, slideData.background)
    }

    // 添加水印
    if (applyWatermark && this.watermarkGenerator) {
      await this.addWatermarkToSlide(slide, pptx)
    }

    // 处理幻灯片元素
    if (slideData.elements) {
      for (const element of slideData.elements) {
        await this.addElementToSlide(slide, element, pptx)
      }
    }

    // 添加幻灯片编号
    slide.addText(`${slideIndex + 1}`, {
      x: '95%',
      y: '95%',
      w: 0.5,
      h: 0.3,
      fontSize: 10,
      color: '999999'
    })
  }

  /**
   * 设置幻灯片背景
   */
  setSlideBackground(slide, background) {
    if (background.color) {
      slide.background = { fill: { color: background.color.replace('#', '') } }
    } else if (background.image) {
      // PPTX支持图片背景，但需要先下载图片
      console.warn('PPTX导出暂不支持图片背景，请使用纯色背景')
      slide.background = { fill: { color: 'FFFFFF' } }
    } else {
      slide.background = { fill: { color: 'FFFFFF' } }
    }
  }

  /**
   * 添加元素到幻灯片
   */
  async addElementToSlide(slide, element, pptx) {
    try {
      switch (element.type) {
      case 'text':
        this.addTextElement(slide, element, pptx)
        break
      case 'image':
        await this.addImageElement(slide, element, pptx)
        break
      case 'shape':
        this.addShapeElement(slide, element, pptx)
        break
      case 'chart':
        this.addChartElement(slide, element, pptx)
        break
      default:
        console.warn(`PPTX导出不支持的元素类型: ${element.type}`)
      }
    } catch (error) {
      console.warn(`PPTX元素添加失败 (${element.type}):`, error)
    }
  }

  /**
   * 添加文本元素
   */
  addTextElement(slide, element, pptx) {
    const { content, style = {}, position = {}, size = {} } = element

    // 计算位置和大小（转换为英寸，PPTX使用英寸为单位）
    const x = ((position.x || 0) / 100) * 10 // 假设10英寸宽的幻灯片
    const y = ((position.y || 0) / 100) * 5.625 // 假设5.625英寸高的幻灯片
    const w = ((size.width || 50) / 100) * 10
    const h = ((size.height || 20) / 100) * 5.625

    // 文本样式
    const textOptions = {
      x,
      y,
      w,
      h,
      fontSize: style.fontSize || 18,
      color: style.color ? style.color.replace('#', '') : '000000',
      align: this.mapTextAlign(style.textAlign),
      valign: this.mapVerticalAlign(style.verticalAlign),
      bold: style.fontWeight === 'bold',
      italic: style.fontStyle === 'italic',
      underline: style.textDecoration === 'underline',
      margin: style.margin || 0
    }

    // 处理多行文本
    const lines = content.split('\n')
    if (lines.length > 1) {
      textOptions.text = lines
    } else {
      textOptions.text = content
    }

    slide.addText(textOptions)
  }

  /**
   * 添加图片元素
   */
  async addImageElement(slide, element, pptx) {
    const { src, position = {}, size = {} } = element

    if (!src) return

    try {
      // 计算位置和大小
      const x = ((position.x || 0) / 100) * 10
      const y = ((position.y || 0) / 100) * 5.625
      const w = ((size.width || 30) / 100) * 10
      const h = ((size.height || 20) / 100) * 5.625

      // 处理图片URL
      let imageData = src
      if (src.startsWith('http')) {
        // 对于外部URL，需要先转换为base64或blob
        imageData = await this.urlToDataUrl(src)
      }

      slide.addImage({
        data: imageData,
        x,
        y,
        w,
        h,
        sizing: { type: 'contain', w, h }
      })
    } catch (error) {
      console.warn('PPTX图片添加失败:', error)
      // 添加占位符文本
      slide.addText('图片加载失败', {
        x: x,
        y: y,
        w: w,
        h: h,
        color: '999999',
        align: 'center',
        valign: 'middle'
      })
    }
  }

  /**
   * 添加形状元素
   */
  addShapeElement(slide, element, pptx) {
    const { shape, style = {}, position = {}, size = {} } = element

    const x = ((position.x || 0) / 100) * 10
    const y = ((position.y || 0) / 100) * 5.625
    const w = ((size.width || 20) / 100) * 10
    const h = ((size.height || 20) / 100) * 5.625

    // 形状选项
    const shapeOptions = {
      x,
      y,
      w,
      h,
      fill: style.fill ? { color: style.fill.replace('#', '') } : undefined,
      line: style.stroke
        ? {
          color: style.stroke.replace('#', ''),
          width: style.strokeWidth || 1
        }
        : undefined
    }

    // 根据形状类型添加
    switch (shape) {
    case 'rectangle':
      slide.addShape(pptx.ShapeType.rect, shapeOptions)
      break
    case 'circle':
      slide.addShape(pptx.ShapeType.ellipse, shapeOptions)
      break
    case 'triangle':
      slide.addShape(pptx.ShapeType.triangle, shapeOptions)
      break
    default:
      console.warn(`PPTX不支持的形状: ${shape}`)
      slide.addShape(pptx.ShapeType.rect, shapeOptions)
    }
  }

  /**
   * 添加图表元素
   */
  addChartElement(slide, element, pptx) {
    const { chartType, data, position = {}, size = {} } = element

    const x = ((position.x || 0) / 100) * 10
    const y = ((position.y || 0) / 100) * 5.625
    const w = ((size.width || 40) / 100) * 10
    const h = ((size.height || 30) / 100) * 5.625

    try {
      // 转换数据格式为PptxGenJS格式
      const chartData = this.convertChartData(data)

      slide.addChart(pptx.ChartType[chartType.toUpperCase()] || pptx.ChartType.bar, chartData, {
        x,
        y,
        w,
        h,
        chartColors: ['007ACC', 'FF6600', '00AA00', 'CC0000', '6600CC']
      })
    } catch (error) {
      console.warn('PPTX图表添加失败:', error)
      slide.addText('图表生成失败', {
        x,
        y,
        w,
        h,
        color: '999999',
        align: 'center',
        valign: 'middle'
      })
    }
  }

  /**
   * 添加水印到幻灯片
   */
  async addWatermarkToSlide(slide, pptx) {
    try {
      const watermarkText = this.watermarkGenerator.getWatermarkText()

      // 在右下角添加水印
      slide.addText(watermarkText, {
        x: '85%',
        y: '90%',
        w: '15%',
        h: 0.3,
        fontSize: 10,
        color: 'CCCCCC',
        align: 'right',
        rotate: 0
      })
    } catch (error) {
      console.warn('PPTX水印添加失败:', error)
    }
  }

  /**
   * 获取模板背景
   */
  getTemplateBackground(template) {
    const backgrounds = {
      professional: { fill: { color: 'F8F9FA' } },
      modern: { fill: { color: 'FFFFFF' } },
      minimal: { fill: { color: 'FFFFFF' } },
      corporate: { fill: { color: 'E6F3FF' } }
    }

    return backgrounds[template] || backgrounds.professional
  }

  /**
   * 映射文本对齐方式
   */
  mapTextAlign(align) {
    const alignMap = {
      left: 'left',
      center: 'center',
      right: 'right',
      justify: 'justify'
    }
    return alignMap[align] || 'left'
  }

  /**
   * 映射垂直对齐方式
   */
  mapVerticalAlign(valign) {
    const valignMap = {
      top: 'top',
      middle: 'middle',
      bottom: 'bottom'
    }
    return valignMap[valign] || 'top'
  }

  /**
   * 将URL转换为DataURL
   */
  async urlToDataUrl(url) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        const dataUrl = canvas.toDataURL('image/png')
        resolve(dataUrl)
      }
      img.onerror = () => reject(new Error('图片加载失败'))
      img.src = url
    })
  }

  /**
   * 转换图表数据格式
   */
  convertChartData(data) {
    // 将VidSlide数据格式转换为PptxGenJS格式
    if (!data || !data.labels || !data.datasets) {
      throw new Error('无效的图表数据格式')
    }

    return data.labels.map((label, index) => ({
      name: label,
      labels: data.datasets.map(ds => ds.label),
      values: data.datasets.map(ds => ds.data[index])
    }))
  }

  /**
   * 估算文件大小
   */
  estimateFileSize(slides) {
    const baseSize = 100 * 1024 // 100KB基础大小
    const slideSize = slides.length * 200 * 1024 // 每张幻灯片约200KB
    return Math.round(baseSize + slideSize)
  }

  /**
   * 检查PPTX导出是否支持
   */
  static isSupported() {
    return typeof window !== 'undefined' && typeof document !== 'undefined'
  }

  /**
   * 获取PPTX导出功能信息
   */
  static getCapabilities() {
    return {
      supported: this.isSupported(),
      layouts: ['16x9', '4x3', 'A4', 'wide'],
      templates: ['professional', 'modern', 'minimal', 'corporate'],
      features: ['企业编辑', '母版设计', '图表支持', '多媒体元素'],
      limitations: ['动画效果不支持', '复杂布局需要手动调整']
    }
  }
}

// 导出函数
export function createPptxExporter() {
  return new PptxExporter()
}

// 默认导出
export default PptxExporter
