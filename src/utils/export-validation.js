/**
 * VidSlide AI - 导出功能技术验证工具
 * 用于验证各种导出功能的技术可行性
 */

export class ExportValidation {
  constructor() {
    this.results = {}
    this.startTime = Date.now()
  }

  /**
   * 运行完整验证套件
   */
  async runFullValidation() {
    console.log('🚀 开始导出功能技术验证...')

    const validations = [
      this.validateWebCodecsAPI(),
      this.validateMediaRecorderAPI(),
      this.validateHTMLExport(),
      this.validatePDFExport(),
      this.validatePPTXExport(),
      this.validateBrowserCompatibility()
    ]

    const results = await Promise.allSettled(validations)

    this.generateReport(results)
    return this.results
  }

  /**
   * 验证WebCodecs API
   */
  async validateWebCodecsAPI() {
    console.log('🔍 验证WebCodecs API...')

    const result = {
      name: 'WebCodecs API',
      status: 'unknown',
      details: {},
      recommendations: []
    }

    try {
      // 检查API可用性
      const webCodecsAvailable = 'VideoEncoder' in window && 'VideoDecoder' in window
      result.details.apiAvailable = webCodecsAvailable

      if (!webCodecsAvailable) {
        result.status = 'failed'
        result.details.error = 'WebCodecs API not supported'
        result.recommendations.push('使用MediaRecorder作为备选方案')
        this.results.webCodecs = result
        return result
      }

      // 测试编码器配置
      const config = {
        codec: 'avc1.42001f', // H.264
        width: 1920,
        height: 1080,
        bitrate: 8000000,
        framerate: 30
      }

      const encoder = new VideoEncoder({
        output: chunk => {
          // 编码输出处理
          result.details.chunkReceived = true
        },
        error: error => {
          result.details.encoderError = error.message
        }
      })

      // 配置编码器
      await encoder.configure(config)
      result.details.encoderConfigured = true

      // 测试编码一帧
      const canvas = document.createElement('canvas')
      canvas.width = 1920
      canvas.height = 1080
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = 'red'
      ctx.fillRect(0, 0, 1920, 1080)

      const frame = new VideoFrame(canvas, { timestamp: 0 })
      encoder.encode(frame)
      frame.close()

      // 等待编码完成
      await new Promise(resolve => setTimeout(resolve, 100))

      encoder.close()
      result.details.encodingTested = true

      // 评估性能
      result.details.performanceEstimate = await this.estimateWebCodecsPerformance()

      result.status = 'passed'
      result.recommendations.push('WebCodecs API可用，推荐用于高质量视频导出')
    } catch (error) {
      result.status = 'failed'
      result.details.error = error.message
      result.recommendations.push('WebCodecs不可用，使用MediaRecorder备选方案')
    }

    this.results.webCodecs = result
    return result
  }

  /**
   * 验证MediaRecorder API
   */
  async validateMediaRecorderAPI() {
    console.log('🔍 验证MediaRecorder API...')

    const result = {
      name: 'MediaRecorder API',
      status: 'unknown',
      details: {},
      recommendations: []
    }

    try {
      const mediaRecorderAvailable = 'MediaRecorder' in window
      result.details.apiAvailable = mediaRecorderAvailable

      if (!mediaRecorderAvailable) {
        result.status = 'failed'
        result.details.error = 'MediaRecorder API not supported'
        this.results.mediaRecorder = result
        return result
      }

      // 测试支持的格式
      const supportedFormats = []
      const testFormats = [
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/mp4;codecs=h264',
        'video/mp4'
      ]

      for (const format of testFormats) {
        if (MediaRecorder.isTypeSupported(format)) {
          supportedFormats.push(format)
        }
      }

      result.details.supportedFormats = supportedFormats

      if (supportedFormats.length === 0) {
        result.status = 'failed'
        result.details.error = 'No supported video formats found'
        this.results.mediaRecorder = result
        return result
      }

      // 创建测试Canvas
      const canvas = document.createElement('canvas')
      canvas.width = 640
      canvas.height = 360
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = 'blue'
      ctx.fillRect(0, 0, 640, 360)

      // 获取媒体流
      const stream = canvas.captureStream(30)
      result.details.streamCreated = true

      // 创建MediaRecorder
      const recorder = new MediaRecorder(stream, {
        mimeType: supportedFormats[0]
      })

      result.details.recorderCreated = true

      // 测试录制
      const chunks = []
      recorder.ondataavailable = event => {
        if (event.data.size > 0) {
          chunks.push(event.data)
          result.details.dataChunksReceived = true
        }
      }

      recorder.onstop = () => {
        if (chunks.length > 0) {
          const blob = new Blob(chunks, { type: supportedFormats[0] })
          result.details.blobCreated = true
          result.details.blobSize = blob.size
        }
      }

      // 开始录制
      recorder.start()
      result.details.recordingStarted = true

      // 录制1秒
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 停止录制
      recorder.stop()
      result.details.recordingStopped = true

      // 等待数据处理
      await new Promise(resolve => {
        const checkComplete = () => {
          if (recorder.state === 'inactive') {
            resolve()
          } else {
            setTimeout(checkComplete, 100)
          }
        }
        checkComplete()
      })

      result.status = 'passed'
      result.recommendations.push('MediaRecorder可用，作为WebCodecs的备选方案')
    } catch (error) {
      result.status = 'failed'
      result.details.error = error.message
    }

    this.results.mediaRecorder = result
    return result
  }

  /**
   * 验证HTML导出
   */
  async validateHTMLExport() {
    console.log('🔍 验证HTML导出...')

    const result = {
      name: 'HTML Export',
      status: 'unknown',
      details: {},
      recommendations: []
    }

    try {
      // 测试Data URL生成
      const canvas = document.createElement('canvas')
      canvas.width = 200
      canvas.height = 100
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = 'green'
      ctx.fillRect(0, 0, 200, 100)

      const dataUrl = canvas.toDataURL('image/png')
      result.details.dataUrlGenerated = dataUrl.startsWith('data:image/png;base64,')

      // 测试HTML模板渲染
      const testData = {
        title: '测试演示',
        slides: [
          {
            content: '测试内容',
            background: dataUrl,
            elements: [{ type: 'text', content: 'Hello World', x: 100, y: 50 }]
          }
        ]
      }

      const html = this.generateTestHTML(testData)
      result.details.htmlGenerated = html.includes('测试演示')

      // 测试离线播放
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      result.details.blobUrlCreated = url.startsWith('blob:')

      // 清理
      URL.revokeObjectURL(url)

      result.status = 'passed'
      result.recommendations.push('HTML导出技术成熟，可实现自包含离线演示')
    } catch (error) {
      result.status = 'failed'
      result.details.error = error.message
    }

    this.results.htmlExport = result
    return result
  }

  /**
   * 验证PDF导出
   */
  async validatePDFExport() {
    console.log('🔍 验证PDF导出...')

    const result = {
      name: 'PDF Export',
      status: 'unknown',
      details: {},
      recommendations: []
    }

    try {
      // 动态加载jsPDF库进行测试
      if (!window.jspdf) {
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
      }

      const { jsPDF } = window.jspdf
      const doc = new jsPDF()

      // 测试基本功能
      doc.text('测试PDF导出', 20, 30)
      result.details.basicTextAdded = true

      // 测试中文支持
      doc.text('测试中文内容', 20, 50)
      result.details.chineseTextAdded = true

      // 测试图片添加
      const canvas = document.createElement('canvas')
      canvas.width = 100
      canvas.height = 50
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = 'yellow'
      ctx.fillRect(0, 0, 100, 50)

      const imgData = canvas.toDataURL('image/png')
      doc.addImage(imgData, 'PNG', 20, 70, 50, 25)
      result.details.imageAdded = true

      // 生成PDF
      const pdfOutput = doc.output('blob')
      result.details.pdfGenerated = pdfOutput instanceof Blob
      result.details.pdfSize = pdfOutput.size

      result.status = 'passed'
      result.recommendations.push('PDF导出可行，建议使用jsPDF库')
    } catch (error) {
      result.status = 'failed'
      result.details.error = error.message
      result.recommendations.push('考虑使用服务端PDF生成作为备选方案')
    }

    this.results.pdfExport = result
    return result
  }

  /**
   * 验证PPTX导出
   */
  async validatePPTXExport() {
    console.log('🔍 验证PPTX导出...')

    const result = {
      name: 'PPTX Export',
      status: 'unknown',
      details: {},
      recommendations: []
    }

    try {
      // 动态加载PptxGenJS库
      if (!window.PptxGenJS) {
        await this.loadScript('https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.min.js')
      }

      const pptx = new window.PptxGenJS()
      result.details.libraryLoaded = true

      // 创建幻灯片
      const slide = pptx.addSlide()
      result.details.slideCreated = true

      // 添加文本
      slide.addText('测试PPTX导出', {
        x: 1,
        y: 0.5,
        w: 8,
        h: 1,
        fontSize: 24,
        bold: true
      })
      result.details.textAdded = true

      // 添加形状
      slide.addShape(pptx.ShapeType.rect, {
        x: 1,
        y: 2,
        w: 3,
        h: 1.5,
        fill: { color: 'FF0000' }
      })
      result.details.shapeAdded = true

      // 生成PPTX
      const pptxData = await pptx.write({ outputType: 'blob' })
      result.details.pptxGenerated = pptxData instanceof Blob
      result.details.pptxSize = pptxData.size

      result.status = 'passed'
      result.recommendations.push('PPTX导出可行，PptxGenJS库功能完善')
    } catch (error) {
      result.status = 'failed'
      result.details.error = error.message
      result.recommendations.push('PPTX导出复杂度较高，可考虑服务端生成')
    }

    this.results.pptxExport = result
    return result
  }

  /**
   * 验证浏览器兼容性
   */
  async validateBrowserCompatibility() {
    console.log('🔍 验证浏览器兼容性...')

    const result = {
      name: 'Browser Compatibility',
      status: 'passed',
      details: {},
      recommendations: []
    }

    // 检测当前浏览器
    const ua = navigator.userAgent
    result.details.userAgent = ua
    result.details.isChrome = /Chrome/.test(ua)
    result.details.isFirefox = /Firefox/.test(ua)
    result.details.isSafari = /Safari/.test(ua) && !/Chrome/.test(ua)
    result.details.isEdge = /Edg/.test(ua)

    // WebCodecs支持检测
    result.details.webCodecsSupport = 'VideoEncoder' in window

    // MediaRecorder支持检测
    result.details.mediaRecorderSupport = 'MediaRecorder' in window

    // 检查MediaRecorder支持的格式
    if (result.details.mediaRecorderSupport) {
      const formats = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/mp4;codecs=h264']
      result.details.supportedFormats = formats.filter(format =>
        MediaRecorder.isTypeSupported(format)
      )
    }

    // File System Access API (可选)
    result.details.fileSystemAccess = 'showSaveFilePicker' in window

    // 性能评估
    result.details.performance = await this.assessPerformance()

    // 生成兼容性建议
    if (!result.details.webCodecsSupport) {
      result.recommendations.push('WebCodecs不支持，使用MediaRecorder备选方案')
    }

    if (result.details.supportedFormats.length === 0) {
      result.recommendations.push('无支持的视频格式，需要降级处理')
      result.status = 'warning'
    }

    this.results.browserCompatibility = result
    return result
  }

  /**
   * 生成验证报告
   */
  generateReport(validationResults) {
    console.log('\n📊 导出功能技术验证报告')
    console.log('='.repeat(50))

    const summary = {
      total: validationResults.length,
      passed: 0,
      failed: 0,
      warnings: 0
    }

    validationResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const validation = result.value
        console.log(`\n${index + 1}. ${validation.name}: ${validation.status.toUpperCase()}`)

        if (validation.status === 'passed') {
          summary.passed++
          console.log('   ✅ 通过')
        } else if (validation.status === 'failed') {
          summary.failed++
          console.log('   ❌ 失败')
        } else {
          summary.warnings++
          console.log('   ⚠️  警告')
        }

        if (validation.details.error) {
          console.log(`   错误: ${validation.details.error}`)
        }

        if (validation.recommendations.length > 0) {
          console.log('   建议:')
          validation.recommendations.forEach(rec => console.log(`     - ${rec}`))
        }
      }
    })

    console.log('\n📈 验证总结:')
    console.log(`   总计: ${summary.total}`)
    console.log(`   通过: ${summary.passed}`)
    console.log(`   失败: ${summary.failed}`)
    console.log(`   警告: ${summary.warnings}`)

    const duration = Date.now() - this.startTime
    console.log(`   耗时: ${Math.round(duration / 1000)}秒`)

    // 总体评估
    if (summary.failed === 0) {
      console.log('\n🎉 验证结果: 所有导出功能技术可行！')
      this.results.overallStatus = 'passed'
    } else if (summary.failed < 3) {
      console.log('\n⚠️ 验证结果: 大部分功能可行，少数功能需要备选方案')
      this.results.overallStatus = 'warning'
    } else {
      console.log('\n❌ 验证结果: 存在重大技术障碍，需要重新评估')
      this.results.overallStatus = 'failed'
    }
  }

  /**
   * 评估WebCodecs性能
   */
  async estimateWebCodecsPerformance() {
    // 简化的性能评估
    return {
      encodingSpeed: 'estimated 30fps',
      memoryUsage: 'estimated < 100MB',
      quality: 'high'
    }
  }

  /**
   * 评估整体性能
   */
  async assessPerformance() {
    const performance = window.performance
    const memory = performance.memory

    return {
      timing: performance.timing,
      memory: memory
        ? {
            used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
            total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
            limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
          }
        : 'not available'
    }
  }

  /**
   * 生成测试HTML
   */
  generateTestHTML(data) {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>${data.title}</title>
    <style>
        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
        .slide { width: 800px; height: 600px; border: 1px solid #ccc; margin: 20px; }
        .background { width: 100%; height: 100%; object-fit: cover; }
        .element { position: absolute; }
    </style>
</head>
<body>
    <h1>${data.title}</h1>
    ${data.slides
      .map(
        slide => `
        <div class="slide">
            ${slide.background ? `<img class="background" src="${slide.background}" alt="背景">` : ''}
            ${slide.elements
              .map(
                element => `
                <div class="element" style="left: ${element.x}px; top: ${element.y}px;">
                    ${element.content}
                </div>
            `
              )
              .join('')}
        </div>
    `
      )
      .join('')}
</body>
</html>`
  }

  /**
   * 动态加载脚本
   */
  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = src
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  /**
   * 获取验证结果
   */
  getResults() {
    return this.results
  }
}

// 导出验证函数
export async function validateExportCapabilities() {
  const validator = new ExportValidation()
  return await validator.runFullValidation()
}

// 如果在浏览器环境中，直接运行验证
if (typeof window !== 'undefined') {
  window.validateExportCapabilities = validateExportCapabilities
}
