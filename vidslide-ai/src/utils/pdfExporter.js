/**
 * VidSlide AI - PDF演示文稿导出器
 * 生成PDF格式的演示文稿，支持中文字体和布局
 *
 * @author VidSlide AI Team
 * @version 1.0.0
 */

import { getWatermarkGenerator } from './WatermarkGenerator.js'

export class PdfExporter {
  constructor() {
    this.assets = new Map()
    this.watermarkGenerator = getWatermarkGenerator()
    this.isInitialized = false
    this.jsPDF = null
    this.fonts = new Map()
  }

  /**
   * 初始化PDF导出器
   */
  async initialize() {
    if (this.isInitialized) return { success: true }

    try {
      // 动态加载jsPDF
      if (typeof window !== 'undefined') {
        // 浏览器环境
        if (typeof jsPDF === 'undefined') {
          await this.loadJsPDF()
        }
        this.jsPDF = window.jsPDF || jsPDF
      } else {
        // Node.js环境 - 需要特殊处理
        // 这里可能需要使用不同的PDF库如pdfkit
        throw new Error('PDF导出在Node.js环境中不可用，请在浏览器中使用')
      }

      // 加载中文字体
      await this.loadChineseFonts()

      this.isInitialized = true
      return { success: true }
    } catch (error) {
      console.error('PDF导出器初始化失败:', error)
      return {
        success: false,
        error: error.message,
        fallback: '请在浏览器环境中使用PDF导出功能'
      }
    }
  }

  /**
   * 动态加载jsPDF库
   */
  async loadJsPDF() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
      script.onload = () => {
        if (typeof window.jsPDF !== 'undefined') {
          resolve()
        } else {
          reject(new Error('jsPDF库加载失败'))
        }
      }
      script.onerror = () => reject(new Error('无法加载jsPDF库'))
      document.head.appendChild(script)

      // 设置超时
      setTimeout(() => reject(new Error('jsPDF库加载超时')), 10000)
    })
  }

  /**
   * 加载中文字体
   */
  async loadChineseFonts() {
    try {
      // 加载思源黑体或其他中文字体
      const fontUrl =
        'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap'
      const link = document.createElement('link')
      link.href = fontUrl
      link.rel = 'stylesheet'
      document.head.appendChild(link)

      // 等待字体加载
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.warn('中文字体加载失败，使用默认字体:', error)
    }
  }

  /**
   * 导出PDF演示文稿
   * @param {Object} options 导出选项
   * @param {Array} options.slides 幻灯片数据
   * @param {Object} options.template 模板配置
   * @param {string} options.title 演示文稿标题
   * @param {string} options.layout 页面布局 (A4, A3, 16:9等)
   * @param {boolean} options.applyWatermark 是否应用水印
   */
  async exportPdf(options = {}) {
    const initResult = await this.initialize()
    if (!initResult.success) {
      throw new Error(initResult.error)
    }

    const {
      slides = [],
      template = 'standard',
      title = 'VidSlide AI 演示',
      layout = 'A4',
      orientation = 'portrait', // portrait, landscape
      applyWatermark = true,
      quality = 'high',
      includeMetadata = true
    } = options

    try {
      // 创建PDF文档
      const pdfOptions = this.getPdfOptions(layout, orientation)
      const pdf = new this.jsPDF(pdfOptions)

      // 设置文档属性
      if (includeMetadata) {
        pdf.setProperties({
          title: title,
          subject: 'VidSlide AI 生成的演示文稿',
          author: 'VidSlide AI',
          creator: 'VidSlide AI v1.0'
        })
      }

      // 处理每个幻灯片
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i]

        // 添加新页面（除了第一页）
        if (i > 0) {
          pdf.addPage()
        }

        // 渲染幻灯片内容
        await this.renderSlide(pdf, slide, {
          pageIndex: i,
          totalPages: slides.length,
          layout,
          orientation,
          applyWatermark,
          quality
        })
      }

      // 生成文件名
      const fileName = `${title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}.pdf`

      // 保存PDF
      pdf.save(fileName)

      return {
        success: true,
        fileName,
        pageCount: slides.length,
        fileSize: this.estimateFileSize(slides, quality)
      }
    } catch (error) {
      console.error('PDF导出失败:', error)
      throw new Error(`PDF导出失败: ${error.message}`)
    }
  }

  /**
   * 获取PDF选项
   */
  getPdfOptions(layout, orientation) {
    const layouts = {
      A4: { width: 210, height: 297 },
      A3: { width: 297, height: 420 },
      Letter: { width: 215.9, height: 279.4 },
      '16:9': { width: 297, height: 167 }, // 16:9宽屏比例
      '4:3': { width: 297, height: 223 } // 4:3传统比例
    }

    const dimensions = layouts[layout] || layouts['A4']

    return {
      orientation: orientation === 'landscape' ? 'l' : 'p',
      unit: 'mm',
      format: [dimensions.width, dimensions.height],
      compress: true,
      precision: 2,
      userUnit: 1.0
    }
  }

  /**
   * 渲染单个幻灯片
   */
  async renderSlide(pdf, slide, options) {
    const { pageIndex, layout, orientation, applyWatermark, quality } = options

    // 获取页面尺寸（转换为PDF坐标系，点为单位，1mm = 2.83465点）
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()

    // 设置背景
    this.renderBackground(pdf, slide.background, pageWidth, pageHeight)

    // 渲染文本元素
    if (slide.elements) {
      for (const element of slide.elements) {
        await this.renderElement(pdf, element, pageWidth, pageHeight, quality)
      }
    }

    // 应用水印
    if (applyWatermark && this.watermarkGenerator) {
      await this.applyWatermarkToPdf(pdf, pageWidth, pageHeight)
    }

    // 添加页码
    this.addPageNumber(pdf, pageIndex + 1, pageWidth, pageHeight)
  }

  /**
   * 渲染背景
   */
  renderBackground(pdf, background, pageWidth, pageHeight) {
    if (!background) return

    try {
      // 设置背景色
      if (background.color) {
        pdf.setFillColor(...this.hexToRgb(background.color))
        pdf.rect(0, 0, pageWidth, pageHeight, 'F')
      }

      // 设置背景图片（如果有的话）
      if (background.image) {
        // 简化实现：这里可能需要先将图片转换为base64
        console.warn('PDF导出暂不支持背景图片，请使用纯色背景')
      }
    } catch (error) {
      console.warn('背景渲染失败:', error)
    }
  }

  /**
   * 渲染元素
   */
  async renderElement(pdf, element, pageWidth, pageHeight, quality) {
    try {
      switch (element.type) {
      case 'text':
        this.renderTextElement(pdf, element, pageWidth, pageHeight)
        break
      case 'image':
        await this.renderImageElement(pdf, element, pageWidth, pageHeight, quality)
        break
      case 'shape':
        this.renderShapeElement(pdf, element, pageWidth, pageHeight)
        break
      default:
        console.warn(`不支持的元素类型: ${element.type}`)
      }
    } catch (error) {
      console.warn(`元素渲染失败 (${element.type}):`, error)
    }
  }

  /**
   * 渲染文本元素
   */
  renderTextElement(pdf, element, pageWidth, pageHeight) {
    const { content, style = {}, position = {} } = element

    // 设置字体和大小
    const fontSize = style.fontSize || 14
    pdf.setFontSize(fontSize)

    // 设置字体颜色
    if (style.color) {
      pdf.setTextColor(...this.hexToRgb(style.color))
    } else {
      pdf.setTextColor(0, 0, 0) // 黑色
    }

    // 设置字体样式
    let fontStyle = 'normal'
    if (style.fontWeight === 'bold') fontStyle = 'bold'
    if (style.fontStyle === 'italic') fontStyle = 'italic'

    // 计算位置（转换为PDF坐标系）
    const x = ((position.x || 0) * pageWidth) / 100
    const y = ((position.y || 0) * pageHeight) / 100

    // 处理多行文本
    const lines = content.split('\n')
    const lineHeight = fontSize * 1.2

    lines.forEach((line, index) => {
      // 处理文本对齐
      let textX = x
      const textWidth = pdf.getTextWidth(line)

      switch (style.textAlign) {
      case 'center':
        textX = x - textWidth / 2
        break
      case 'right':
        textX = x - textWidth
        break
      case 'justify':
        // 两端对齐需要更复杂的处理，这里简化
        break
      }

      pdf.text(line, textX, y + index * lineHeight)
    })
  }

  /**
   * 渲染图片元素
   */
  async renderImageElement(pdf, element, pageWidth, pageHeight, quality) {
    const { src, position = {}, size = {} } = element

    if (!src) return

    try {
      // 将图片URL转换为base64（简化实现）
      const base64Data = await this.urlToBase64(src)

      // 计算位置和大小
      const x = ((position.x || 0) * pageWidth) / 100
      const y = ((position.y || 0) * pageHeight) / 100
      const width = ((size.width || 20) * pageWidth) / 100
      const height = ((size.height || 20) * pageHeight) / 100

      // 添加图片到PDF
      pdf.addImage(base64Data, 'JPEG', x, y, width, height)
    } catch (error) {
      console.warn('图片渲染失败:', error)
      // 绘制占位符
      pdf.setFillColor(200, 200, 200)
      pdf.rect(x, y, width, height, 'F')
      pdf.setTextColor(100, 100, 100)
      pdf.setFontSize(10)
      pdf.text('图片加载失败', x + 5, y + height / 2)
    }
  }

  /**
   * 渲染形状元素
   */
  renderShapeElement(pdf, element, pageWidth, pageHeight) {
    const { shape, style = {}, position = {}, size = {} } = element

    const x = ((position.x || 0) * pageWidth) / 100
    const y = ((position.y || 0) * pageHeight) / 100
    const width = ((size.width || 20) * pageWidth) / 100
    const height = ((size.height || 20) * pageHeight) / 100

    // 设置填充色
    if (style.fill) {
      pdf.setFillColor(...this.hexToRgb(style.fill))
    }

    // 设置边框色
    if (style.stroke) {
      pdf.setDrawColor(...this.hexToRgb(style.stroke))
      pdf.setLineWidth(style.strokeWidth || 1)
    }

    switch (shape) {
    case 'rectangle':
      if (style.fill) {
        pdf.rect(x, y, width, height, 'F')
      }
      if (style.stroke) {
        pdf.rect(x, y, width, height, 'S')
      }
      break

    case 'circle':
      const radius = Math.min(width, height) / 2
      const centerX = x + width / 2
      const centerY = y + height / 2

      if (style.fill) {
        pdf.circle(centerX, centerY, radius, 'F')
      }
      if (style.stroke) {
        pdf.circle(centerX, centerY, radius, 'S')
      }
      break

    default:
      console.warn(`不支持的形状: ${shape}`)
    }
  }

  /**
   * 应用水印到PDF
   */
  async applyWatermarkToPdf(pdf, pageWidth, pageHeight) {
    try {
      // 生成水印文本
      const watermarkText = this.watermarkGenerator.getWatermarkText()

      // 设置水印样式
      pdf.setFontSize(12)
      pdf.setTextColor(150, 150, 150) // 灰色
      pdf.setGState(new pdf.GState({ opacity: 0.1 })) // 透明度

      // 在页面四个角添加水印
      const positions = [
        { x: 10, y: pageHeight - 10 },
        { x: pageWidth - 10, y: pageHeight - 10, align: 'right' },
        { x: 10, y: 10 },
        { x: pageWidth - 10, y: 10, align: 'right' }
      ]

      positions.forEach(pos => {
        pdf.text(watermarkText, pos.x, pos.y, { align: pos.align || 'left' })
      })

      // 恢复透明度
      pdf.setGState(new pdf.GState({ opacity: 1 }))
    } catch (error) {
      console.warn('PDF水印应用失败:', error)
    }
  }

  /**
   * 添加页码
   */
  addPageNumber(pdf, pageNum, pageWidth, pageHeight) {
    pdf.setFontSize(10)
    pdf.setTextColor(100, 100, 100)
    pdf.text(`${pageNum}`, pageWidth - 10, pageHeight - 5, { align: 'right' })
  }

  /**
   * 将URL转换为base64
   */
  async urlToBase64(url) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        const base64 = canvas.toDataURL('image/jpeg', 0.8)
        resolve(base64)
      }
      img.onerror = () => reject(new Error('图片加载失败'))
      img.src = url
    })
  }

  /**
   * 将十六进制颜色转换为RGB
   */
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [0, 0, 0]
  }

  /**
   * 估算文件大小
   */
  estimateFileSize(slides, quality) {
    const baseSize = 50 * 1024 // 50KB基础大小
    const slideSize = slides.length * 100 * 1024 // 每张幻灯片约100KB
    const qualityMultiplier = { low: 0.5, medium: 1, high: 1.5 }[quality] || 1

    return Math.round((baseSize + slideSize) * qualityMultiplier)
  }

  /**
   * 检查PDF导出是否支持
   */
  static isSupported() {
    return typeof window !== 'undefined' && typeof document !== 'undefined'
  }

  /**
   * 获取PDF导出功能信息
   */
  static getCapabilities() {
    return {
      supported: this.isSupported(),
      formats: ['A4', 'A3', 'Letter', '16:9', '4:3'],
      orientations: ['portrait', 'landscape'],
      features: ['中文支持', '水印', '多页', '高质量输出'],
      limitations: ['图片可能需要额外处理', '复杂布局支持有限']
    }
  }
}

// 导出函数
export function createPdfExporter() {
  return new PdfExporter()
}

// 默认导出
export default PdfExporter
