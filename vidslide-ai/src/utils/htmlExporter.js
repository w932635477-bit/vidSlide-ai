/**
 * VidSlide AI - HTML演示文稿导出器
 * 生成自包含的HTML演示文稿，支持离线播放和水印
 */

import { getWatermarkGenerator } from './WatermarkGenerator.js'

export class HtmlExporter {
  constructor() {
    this.assets = new Map()
    this.watermarkGenerator = getWatermarkGenerator()
    this.templates = {
      modern: this.getModernTemplate(),
      minimal: this.getMinimalTemplate(),
      professional: this.getProfessionalTemplate()
    }
  }

  /**
   * 导出HTML演示文稿
   * @param {Object} options 导出选项
   * @param {Array} options.slides 幻灯片数据
   * @param {Object} options.template 模板配置
   * @param {string} options.title 演示文稿标题
   * @param {string} options.theme 主题样式
   * @param {boolean} options.applyWatermark 是否应用水印
   */
  async exportHtml(options = {}) {
    const {
      slides = [],
      template = 'modern',
      title = 'VidSlide AI 演示',
      theme = 'light',
      includeControls = true,
      autoPlay = false,
      loop = false,
      applyWatermark = true
    } = options

    try {
      // 收集和转换所有资源
      await this.collectAssets(slides)

      // 生成HTML内容
      const htmlContent = this.generateHtml({
        slides,
        template,
        title,
        theme,
        includeControls,
        autoPlay,
        loop,
        applyWatermark
      })

      // 创建Blob
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })

      return {
        blob,
        size: blob.size,
        type: 'text/html',
        filename: this.generateFilename(title)
      }
    } catch (error) {
      console.error('HTML导出失败:', error)
      throw new Error(`HTML导出失败: ${error.message}`)
    }
  }

  /**
   * 收集并转换资源
   */
  async collectAssets(slides) {
    this.assets.clear()

    for (const slide of slides) {
      try {
        // 处理背景图片
        if (slide.background && slide.background.image) {
          const dataUrl = await this.imageToDataUrl(slide.background.image)
          this.assets.set(slide.background.image, dataUrl)
        }

        // 处理元素中的图片
        for (const element of slide.elements || []) {
          if (element.type === 'image' && element.src) {
            try {
              const dataUrl = await this.imageToDataUrl(element.src)
              this.assets.set(element.src, dataUrl)
            } catch (elementError) {
              console.warn(`处理元素图片失败 ${element.src}:`, elementError)
              // 继续处理其他元素，不因单个元素失败而中断整个过程
            }
          }
        }
      } catch (slideError) {
        console.warn('处理幻灯片资源失败:', slideError)
        // 继续处理其他幻灯片
      }
    }
  }

  /**
   * 将图片转换为Data URL
   */
  async imageToDataUrl(src) {
    if (this.assets.has(src)) {
      return this.assets.get(src)
    }

    try {
      // 如果是Data URL，直接返回
      if (src.startsWith('data:')) {
        return src
      }

      // 如果是Blob URL，转换为Data URL
      if (src.startsWith('blob:')) {
        const response = await fetch(src)
        const blob = await response.blob()
        return await this.blobToDataUrl(blob)
      }

      // 尝试作为普通URL获取
      const response = await fetch(src)
      const blob = await response.blob()
      return await this.blobToDataUrl(blob)
    } catch (error) {
      console.warn(`Failed to convert image ${src} to data URL:`, error)
      // 返回占位符
      return this.createPlaceholderDataUrl()
    }
  }

  /**
   * Blob转换为Data URL
   */
  blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  /**
   * 创建占位符Data URL
   */
  createPlaceholderDataUrl() {
    // 创建一个小的占位符图片
    const canvas = document.createElement('canvas')
    canvas.width = 100
    canvas.height = 100
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#f0f0f0'
    ctx.fillRect(0, 0, 100, 100)
    ctx.fillStyle = '#999'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('图片加载失败', 50, 50)

    return canvas.toDataURL('image/png')
  }

  /**
   * 生成HTML内容
   */
  generateHtml(options) {
    const { slides, template, title, theme, includeControls, autoPlay, loop, applyWatermark } =
      options

    const templateHtml = this.templates[template] || this.templates.modern
    const slidesHtml = slides.map((slide, index) => this.generateSlideHtml(slide, index)).join('')

    // 生成水印内容
    const watermarkContent = applyWatermark
      ? this.watermarkGenerator.generateHtmlWatermark()
      : { style: '', html: '' }

    return templateHtml
      .replace('{{title}}', title)
      .replace('{{theme}}', theme)
      .replace('{{slides}}', slidesHtml)
      .replace('{{controls}}', includeControls ? this.generateControlsHtml() : '')
      .replace('{{watermarkStyle}}', watermarkContent.style)
      .replace('{{watermark}}', watermarkContent.html)
      .replace('{{autoPlay}}', autoPlay)
      .replace('{{loop}}', loop)
      .replace('{{slideCount}}', slides.length)
  }

  /**
   * 生成单个幻灯片HTML
   */
  generateSlideHtml(slide, index) {
    const backgroundStyle = this.generateBackgroundStyle(slide.background)
    const elementsHtml = (slide.elements || [])
      .map(element => this.generateElementHtml(element))
      .join('')

    return `
      <div class="slide" data-slide="${index}" style="${backgroundStyle}">
        ${elementsHtml}
      </div>
    `
  }

  /**
   * 生成背景样式
   */
  generateBackgroundStyle(background) {
    if (!background) return ''

    const styles = []

    if (background.color) {
      styles.push(`background-color: ${background.color}`)
    }

    if (background.image) {
      const dataUrl = this.assets.get(background.image) || background.image
      styles.push(`background-image: url('${dataUrl}')`)
      styles.push('background-size: cover')
      styles.push('background-position: center')
      styles.push('background-repeat: no-repeat')
    }

    return styles.join('; ')
  }

  /**
   * 生成元素HTML
   */
  generateElementHtml(element) {
    const { type, content, x = 0, y = 0, width, height, style = {} } = element

    // 基础样式
    let elementStyle = `position: absolute; left: ${x}px; top: ${y}px;`

    if (width) elementStyle += `width: ${width}px;`
    if (height) elementStyle += `height: ${height}px;`

    // 合并自定义样式
    Object.entries(style).forEach(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      elementStyle += `${cssKey}: ${value};`
    })

    switch (type) {
    case 'text':
      return `<div class="text-element" style="${elementStyle}">${content}</div>`

    case 'image':
      const dataUrl = this.assets.get(element.src) || element.src
      return `<img class="image-element" src="${dataUrl}" style="${elementStyle}" alt="${element.alt || ''}">`

    case 'shape':
      const shapeClass = `shape-${element.shape || 'rectangle'}`
      return `<div class="shape-element ${shapeClass}" style="${elementStyle}"></div>`

    default:
      return ''
    }
  }

  /**
   * 生成控制器HTML
   */
  generateControlsHtml() {
    return `
      <div class="presentation-controls">
        <button class="control-btn" onclick="previousSlide()">&#10094;</button>
        <span class="slide-counter"><span id="current-slide">1</span> / <span id="total-slides">1</span></span>
        <button class="control-btn" onclick="nextSlide()">&#10095;</button>
        <button class="control-btn" onclick="toggleFullscreen()">⛶</button>
      </div>
    `
  }

  /**
   * 获取现代化模板
   */
  getModernTemplate() {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <style>
{{watermarkStyle}}
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #000;
            color: #fff;
            overflow: hidden;
            height: 100vh;
            width: 100vw;
        }

        .presentation-container {
            width: 100vw;
            height: 100vh;
            position: relative;
            background: #1a1a1a;
        }

        .slide {
            position: absolute;
            width: 100%;
            height: 100%;
            opacity: 0;
            transition: opacity 0.5s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px;
        }

        .slide.active {
            opacity: 1;
        }

        .text-element {
            font-size: 2.5rem;
            font-weight: 300;
            line-height: 1.2;
            text-align: center;
            max-width: 80%;
            animation: fadeInUp 0.8s ease-out;
        }

        .image-element {
            max-width: 80%;
            max-height: 60%;
            object-fit: contain;
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            animation: fadeIn 0.8s ease-out;
        }

        .shape-element {
            border-radius: 8px;
            background: rgba(255,255,255,0.1);
            border: 2px solid rgba(255,255,255,0.2);
        }

        .presentation-controls {
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            align-items: center;
            gap: 20px;
            background: rgba(0,0,0,0.7);
            padding: 15px 25px;
            border-radius: 50px;
            backdrop-filter: blur(10px);
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .presentation-container:hover .presentation-controls {
            opacity: 1;
        }

        .control-btn {
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            padding: 10px;
            border-radius: 50%;
            transition: background 0.3s ease;
        }

        .control-btn:hover {
            background: rgba(255,255,255,0.1);
        }

        .slide-counter {
            color: white;
            font-size: 16px;
            font-weight: 500;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }

        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
            .text-element {
                font-size: 2rem;
            }

            .presentation-controls {
                bottom: 20px;
                padding: 10px 20px;
            }
        }

        /* 全屏模式 */
        .fullscreen .presentation-controls {
            opacity: 1;
        }
    </style>
</head>
<body>
    <div class="presentation-container" id="presentation">
        {{slides}}
        {{controls}}
    </div>

    <script>
        let currentSlide = 0;
        const slides = document.querySelectorAll('.slide');
        const totalSlides = slides.length;
        const autoPlay = {{autoPlay}};
        const loop = {{loop}};
        let autoPlayInterval;

        function initPresentation() {
            if (slides.length > 0) {
                slides[0].classList.add('active');
            }
            updateCounter();

            if (autoPlay) {
                startAutoPlay();
            }

            // 键盘控制
            document.addEventListener('keydown', handleKeyPress);

            // 触摸控制 (移动端)
            let touchStartX = 0;
            document.addEventListener('touchstart', (e) => {
                touchStartX = e.touches[0].clientX;
            });
            document.addEventListener('touchend', (e) => {
                const touchEndX = e.changedTouches[0].clientX;
                const diff = touchStartX - touchEndX;

                if (Math.abs(diff) > 50) {
                    if (diff > 0) {
                        nextSlide();
                    } else {
                        previousSlide();
                    }
                }
            });
        }

        function handleKeyPress(e) {
            switch(e.key) {
                case 'ArrowRight':
                case ' ':
                    e.preventDefault();
                    nextSlide();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    previousSlide();
                    break;
                case 'f':
                case 'F11':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case 'Escape':
                    if (document.fullscreenElement) {
                        document.exitFullscreen();
                    }
                    break;
            }
        }

        function nextSlide() {
            if (currentSlide < totalSlides - 1) {
                showSlide(currentSlide + 1);
            } else if (loop) {
                showSlide(0);
            }
        }

        function previousSlide() {
            if (currentSlide > 0) {
                showSlide(currentSlide - 1);
            } else if (loop) {
                showSlide(totalSlides - 1);
            }
        }

        function showSlide(index) {
            slides[currentSlide].classList.remove('active');
            slides[index].classList.add('active');
            currentSlide = index;
            updateCounter();
        }

        function updateCounter() {
            const currentElement = document.getElementById('current-slide');
            const totalElement = document.getElementById('total-slides');
            if (currentElement && totalElement) {
                currentElement.textContent = currentSlide + 1;
                totalElement.textContent = totalSlides;
            }
        }

        function toggleFullscreen() {
            const container = document.getElementById('presentation');

            if (!document.fullscreenElement) {
                container.requestFullscreen().then(() => {
                    container.classList.add('fullscreen');
                }).catch(err => {
                    console.error('全屏模式失败:', err);
                });
            } else {
                document.exitFullscreen().then(() => {
                    container.classList.remove('fullscreen');
                });
            }
        }

        function startAutoPlay() {
            autoPlayInterval = setInterval(() => {
                nextSlide();
            }, 5000); // 5秒切换一次
        }

        function stopAutoPlay() {
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
                autoPlayInterval = null;
            }
        }

        // 初始化
        document.addEventListener('DOMContentLoaded', initPresentation);

        // 页面可见性变化时控制自动播放
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                stopAutoPlay();
            } else if (autoPlay) {
                startAutoPlay();
            }
        });
    </script>
{{watermark}}
</body>
</html>`
  }

  /**
   * 获取极简模板
   */
  getMinimalTemplate() {
    // 简化的模板实现
    return this.getModernTemplate().replace('现代化演示', '极简演示')
  }

  /**
   * 获取专业模板
   */
  getProfessionalTemplate() {
    // 专业化的模板实现
    return this.getModernTemplate().replace('现代化演示', '专业演示')
  }

  /**
   * 生成文件名
   */
  generateFilename(title) {
    const timestamp = new Date().toISOString().slice(0, 16).replace(/[-:]/g, '')
    const safeTitle = title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')
    return `${safeTitle}_${timestamp}.html`
  }
}

// 便捷的导出函数
export async function exportHtml(options) {
  const exporter = new HtmlExporter()
  return await exporter.exportHtml(options)
}

// 默认导出
export default HtmlExporter
