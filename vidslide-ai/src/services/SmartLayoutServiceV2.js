/**
 * 智能排版服务 V2
 * 基于抖音视频最佳实践的专业级布局系统
 *
 * 核心特性：
 * 1. 固定布局模式（单图/双图/三图/四图）
 * 2. 智能图片裁剪（保留主体）
 * 3. 精确的间距控制
 * 4. PIP避让机制
 * 5. 视觉层次优化
 */

class SmartLayoutServiceV2 {
  constructor() {
    // 视频尺寸（抖音竖屏）
    this.videoSize = {
      width: 1080,
      height: 1920
    };

    // 安全区域定义
    this.safeZones = {
      top: { start: 0, end: 100 },           // 状态栏
      title: { start: 100, end: 400 },       // 标题区
      content: { start: 400, end: 1600 },    // 主内容区
      footer: { start: 1600, end: 1820 },    // 底部信息区
      bottom: { start: 1820, end: 1920 }     // 抖音UI预留
    };

    // 边距规范
    this.margins = {
      horizontal: 60,      // 左右边距
      top: 100,           // 顶部边距
      bottom: 100,        // 底部边距
      contentPadding: 40  // 内容间距
    };

    // PIP配置（右上角）
    this.pipArea = {
      x: 720,
      y: 120,
      width: 320,
      height: 180,
      borderRadius: 16,
      borderWidth: 3,
      borderColor: '#FFFFFF'
    };

    // 布局模式定义
    this.layoutModes = {
      single: this.getSingleImageLayout.bind(this),
      double: this.getDoubleImageLayout.bind(this),
      triple: this.getTripleImageLayout.bind(this),
      quad: this.getQuadImageLayout.bind(this)
    };
  }

  /**
   * 生成布局（主入口）
   * @param {number} imageCount - 图片数量
   * @param {object} options - 选项
   * @returns {Array} 布局配置数组
   */
  generateLayouts(imageCount, options = {}) {
    const {
      layoutStyle = 'auto',  // auto, pyramid, grid, horizontal, vertical
      avoidPIP = true
    } = options;

    // 根据图片数量选择布局模式
    let layouts;

    switch (imageCount) {
      case 1:
        layouts = this.layoutModes.single(layoutStyle);
        break;
      case 2:
        layouts = this.layoutModes.double(layoutStyle);
        break;
      case 3:
        layouts = this.layoutModes.triple(layoutStyle);
        break;
      case 4:
        layouts = this.layoutModes.quad(layoutStyle);
        break;
      default:
        // 超过4张图片，使用网格布局
        layouts = this.getGridLayout(imageCount);
    }

    // PIP避让检查
    if (avoidPIP) {
      layouts = layouts.map(layout => this.adjustForPIP(layout));
    }

    return layouts;
  }

  /**
   * 单图布局（1张图片）
   */
  getSingleImageLayout(style) {
    return [{
      size: {
        width: 900,
        height: 900
      },
      position: {
        x: 540,   // 水平居中
        y: 960,   // 垂直居中（考虑标题和底部区域）
        anchor: 'center'
      },
      crop: {
        fit: 'cover',
        position: 'attention',  // Sharp智能裁剪
        kernel: 'lanczos3'
      },
      style: {
        borderRadius: 24,
        borderWidth: 4,
        borderColor: '#FFFFFF',
        shadow: {
          offsetX: 0,
          offsetY: 8,
          blur: 32,
          color: 'rgba(0,0,0,0.3)'
        }
      },
      zIndex: 1
    }];
  }

  /**
   * 双图布局（2张图片）
   */
  getDoubleImageLayout(style) {
    // 默认：左右并排
    if (style === 'vertical') {
      // 上下排列（修复：调整位置避免重叠和超出边界）
      return [
        {
          size: { width: 650, height: 650 },
          position: { x: 540, y: 750, anchor: 'center' },  // 调整到内容区内
          crop: { fit: 'cover', position: 'attention', kernel: 'lanczos3' },
          style: this.getImageStyle(),
          zIndex: 1
        },
        {
          size: { width: 650, height: 650 },
          position: { x: 540, y: 1250, anchor: 'center' },  // 确保间距充足
          crop: { fit: 'cover', position: 'attention', kernel: 'lanczos3' },
          style: this.getImageStyle(),
          zIndex: 1
        }
      ];
    }

    // 左右并排（默认）
    return [
      {
        size: { width: 420, height: 420 },
        position: { x: 270, y: 900, anchor: 'center' },
        crop: { fit: 'cover', position: 'attention', kernel: 'lanczos3' },
        style: this.getImageStyle(),
        zIndex: 1
      },
      {
        size: { width: 420, height: 420 },
        position: { x: 810, y: 900, anchor: 'center' },
        crop: { fit: 'cover', position: 'attention', kernel: 'lanczos3' },
        style: this.getImageStyle(),
        zIndex: 1
      }
    ];
  }

  /**
   * 三图布局（3张图片）
   */
  getTripleImageLayout(style) {
    // 默认：金字塔布局（上1下2）
    if (style === 'grid') {
      // 网格布局（上2下1）
      return [
        {
          size: { width: 420, height: 420 },
          position: { x: 270, y: 800, anchor: 'center' },
          crop: { fit: 'cover', position: 'attention', kernel: 'lanczos3' },
          style: this.getImageStyle(),
          zIndex: 1
        },
        {
          size: { width: 420, height: 420 },
          position: { x: 810, y: 800, anchor: 'center' },
          crop: { fit: 'cover', position: 'attention', kernel: 'lanczos3' },
          style: this.getImageStyle(),
          zIndex: 1
        },
        {
          size: { width: 420, height: 420 },
          position: { x: 540, y: 1300, anchor: 'center' },
          crop: { fit: 'cover', position: 'attention', kernel: 'lanczos3' },
          style: this.getImageStyle(),
          zIndex: 1
        }
      ];
    }

    // 金字塔布局（默认）- 修复：调整位置避免重叠
    return [
      {
        size: { width: 650, height: 650 },
        position: { x: 540, y: 700, anchor: 'center' },  // 上方大图
        crop: { fit: 'cover', position: 'attention', kernel: 'lanczos3' },
        style: this.getImageStyle('large'),
        zIndex: 2  // 主图层级更高
      },
      {
        size: { width: 380, height: 380 },
        position: { x: 290, y: 1350, anchor: 'center' },  // 左下小图
        crop: { fit: 'cover', position: 'attention', kernel: 'lanczos3' },
        style: this.getImageStyle('small'),
        zIndex: 1
      },
      {
        size: { width: 380, height: 380 },
        position: { x: 790, y: 1350, anchor: 'center' },  // 右下小图
        crop: { fit: 'cover', position: 'attention', kernel: 'lanczos3' },
        style: this.getImageStyle('small'),
        zIndex: 1
      }
    ];
  }

  /**
   * 四图布局（4张图片）
   */
  getQuadImageLayout(style) {
    // 2x2 网格布局
    return [
      {
        size: { width: 400, height: 400 },
        position: { x: 300, y: 800, anchor: 'center' },
        crop: { fit: 'cover', position: 'attention', kernel: 'lanczos3' },
        style: this.getImageStyle(),
        zIndex: 1
      },
      {
        size: { width: 400, height: 400 },
        position: { x: 780, y: 800, anchor: 'center' },
        crop: { fit: 'cover', position: 'attention', kernel: 'lanczos3' },
        style: this.getImageStyle(),
        zIndex: 1
      },
      {
        size: { width: 400, height: 400 },
        position: { x: 300, y: 1280, anchor: 'center' },
        crop: { fit: 'cover', position: 'attention', kernel: 'lanczos3' },
        style: this.getImageStyle(),
        zIndex: 1
      },
      {
        size: { width: 400, height: 400 },
        position: { x: 780, y: 1280, anchor: 'center' },
        crop: { fit: 'cover', position: 'attention', kernel: 'lanczos3' },
        style: this.getImageStyle(),
        zIndex: 1
      }
    ];
  }

  /**
   * 网格布局（5+张图片）
   */
  getGridLayout(imageCount) {
    const layouts = [];
    const cols = 3;
    const imageSize = 300;
    const spacing = 60;
    const startY = 500;

    for (let i = 0; i < imageCount; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;

      const x = this.margins.horizontal + imageSize / 2 + col * (imageSize + spacing);
      const y = startY + row * (imageSize + spacing);

      layouts.push({
        size: { width: imageSize, height: imageSize },
        position: { x, y, anchor: 'center' },
        crop: { fit: 'cover', position: 'attention', kernel: 'lanczos3' },
        style: this.getImageStyle('small'),
        zIndex: 1
      });
    }

    return layouts;
  }

  /**
   * 获取图片样式
   */
  getImageStyle(size = 'medium') {
    const styles = {
      large: {
        borderRadius: 24,
        borderWidth: 4,
        borderColor: '#FFFFFF',
        shadow: {
          offsetX: 0,
          offsetY: 8,
          blur: 32,
          color: 'rgba(0,0,0,0.3)'
        }
      },
      medium: {
        borderRadius: 20,
        borderWidth: 3,
        borderColor: '#FFFFFF',
        shadow: {
          offsetX: 0,
          offsetY: 6,
          blur: 24,
          color: 'rgba(0,0,0,0.25)'
        }
      },
      small: {
        borderRadius: 16,
        borderWidth: 3,
        borderColor: '#FFFFFF',
        shadow: {
          offsetX: 0,
          offsetY: 4,
          blur: 16,
          color: 'rgba(0,0,0,0.2)'
        }
      }
    };

    return styles[size] || styles.medium;
  }

  /**
   * PIP避让调整
   */
  adjustForPIP(layout) {
    const imageRect = this.getImageRect(layout);
    const pipRect = this.getPIPRect();

    // 检查是否重叠
    if (this.checkOverlap(imageRect, pipRect)) {
      console.log(`  [布局] 图片与PIP重叠，调整位置`);

      // 向左移动
      layout.position.x -= 100;

      // 再次检查
      const newImageRect = this.getImageRect(layout);
      if (this.checkOverlap(newImageRect, pipRect)) {
        // 如果还重叠，向下移动
        layout.position.y += 100;
      }
    }

    return layout;
  }

  /**
   * 获取图片矩形区域
   */
  getImageRect(layout) {
    const { position, size } = layout;
    return {
      left: position.x - size.width / 2,
      right: position.x + size.width / 2,
      top: position.y - size.height / 2,
      bottom: position.y + size.height / 2
    };
  }

  /**
   * 获取PIP矩形区域
   */
  getPIPRect() {
    const { x, y, width, height } = this.pipArea;
    return {
      left: x,
      right: x + width,
      top: y,
      bottom: y + height
    };
  }

  /**
   * 检查矩形重叠
   */
  checkOverlap(rect1, rect2) {
    return !(
      rect1.right < rect2.left ||
      rect1.left > rect2.right ||
      rect1.bottom < rect2.top ||
      rect1.top > rect2.bottom
    );
  }

  /**
   * 获取标题配置
   */
  getTitleConfig() {
    return {
      main: {
        x: 540,
        y: 220,
        fontSize: 64,
        fontWeight: 'bold',
        color: '#FFFFFF',
        align: 'center',
        maxWidth: 900,
        shadow: {
          offsetX: 0,
          offsetY: 4,
          blur: 16,
          color: 'rgba(0,0,0,0.5)'
        },
        glow: {
          blur: 12,
          color: '#667eea',
          opacity: 0.6
        }
      },
      sub: {
        x: 540,
        y: 300,
        fontSize: 40,
        fontWeight: '500',
        color: 'rgba(255,255,255,0.9)',
        align: 'center',
        maxWidth: 800
      }
    };
  }

  /**
   * 获取关键词配置
   */
  getKeywordConfig() {
    return {
      position: {
        y: 1680,
        startX: 100,
        spacing: 20
      },
      style: {
        height: 48,
        padding: 20,
        borderRadius: 24,
        backgroundColor: '#667eea',
        opacity: 0.95
      },
      text: {
        fontSize: 24,
        fontWeight: '600',
        color: '#FFFFFF'
      },
      maxCount: 3
    };
  }

  /**
   * 获取背景配置
   */
  getBackgroundConfig(stylePreset = 'tech') {
    const gradients = {
      tech: {
        type: 'linear',
        angle: 180,
        stops: [
          { offset: 0, color: '#0a0e27' },
          { offset: 50, color: '#1a1f3a' },
          { offset: 100, color: '#0a0e27' }
        ]
      },
      business: {
        type: 'linear',
        angle: 180,
        stops: [
          { offset: 0, color: '#0f1419' },
          { offset: 50, color: '#1e2936' },
          { offset: 100, color: '#0f1419' }
        ]
      },
      data: {
        type: 'linear',
        angle: 180,
        stops: [
          { offset: 0, color: '#0d1b2a' },
          { offset: 50, color: '#1b263b' },
          { offset: 100, color: '#0d1b2a' }
        ]
      }
    };

    return gradients[stylePreset] || gradients.tech;
  }

  /**
   * 获取装饰元素配置
   */
  getDecorationConfig() {
    return {
      lines: {
        top: {
          x1: 100, y1: 380,
          x2: 980, y2: 380,
          stroke: '#667eea',
          strokeWidth: 2,
          opacity: 0.3
        },
        bottom: {
          x1: 100, y1: 1620,
          x2: 980, y2: 1620,
          stroke: '#667eea',
          strokeWidth: 2,
          opacity: 0.3
        }
      },
      corners: {
        topLeft: {
          points: '60,60 60,140 140,140',
          stroke: '#667eea',
          strokeWidth: 3,
          opacity: 0.5
        }
      }
    };
  }

  /**
   * 验证布局
   */
  validateLayout(layouts) {
    const issues = [];

    layouts.forEach((layout, index) => {
      // 检查是否在安全区域内
      const rect = this.getImageRect(layout);

      if (rect.left < this.margins.horizontal) {
        issues.push(`图片${index + 1}超出左边界`);
      }
      if (rect.right > this.videoSize.width - this.margins.horizontal) {
        issues.push(`图片${index + 1}超出右边界`);
      }
      if (rect.top < this.safeZones.content.start) {
        issues.push(`图片${index + 1}超出顶部内容区`);
      }
      if (rect.bottom > this.safeZones.content.end) {
        issues.push(`图片${index + 1}超出底部内容区`);
      }
    });

    // 检查图片之间是否重叠
    for (let i = 0; i < layouts.length; i++) {
      for (let j = i + 1; j < layouts.length; j++) {
        const rect1 = this.getImageRect(layouts[i]);
        const rect2 = this.getImageRect(layouts[j]);

        if (this.checkOverlap(rect1, rect2)) {
          issues.push(`图片${i + 1}和图片${j + 1}重叠`);
        }
      }
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * 预览布局（用于调试）
   */
  previewLayout(imageCount, options = {}) {
    const layouts = this.generateLayouts(imageCount, options);
    const validation = this.validateLayout(layouts);

    return {
      layouts,
      validation,
      titleConfig: this.getTitleConfig(),
      keywordConfig: this.getKeywordConfig(),
      pipArea: this.pipArea
    };
  }
}

// 导出单例
let instance = null;

export function getInstance() {
  if (!instance) {
    instance = new SmartLayoutServiceV2();
  }
  return instance;
}

export { SmartLayoutServiceV2 };
export default SmartLayoutServiceV2;
