/**
 * TemplateArchitecture - 模板架构系统
 *
 * 实现规范的模板层级结构：预设固定层 + AI动态生成层 + 用户调整层
 */

class TemplateArchitecture {
  constructor() {
    this.templates = new Map()
    this.constraints = new Map()
    this.initialized = false
  }

  /**
   * 初始化模板架构
   */
  async initialize() {
    if (this.initialized) return

    // 注册所有预定义模板
    await this.registerTemplates()

    // 设置约束系统
    this.setupConstraints()

    this.initialized = true
  }

  /**
   * 注册所有预定义模板
   */
  async registerTemplates() {
    // 画中画模板
    this.templates.set('picture-in-picture', {
      id: 'picture-in-picture',
      name: '画中画模板',
      category: 'overlay',
      description: '视频画面中叠加小窗口显示演讲者',

      // 层级结构定义
      layers: {
        fixed: [
          {
            id: 'background-overlay',
            type: 'fixed',
            name: '背景遮罩层',
            zIndex: 1,
            properties: {
              backgroundColor: '#000000',
              opacity: 0.4,
              position: 'fullscreen'
            },
            constraints: {
              modifiable: false,
              reason: '保持视觉层次'
            }
          },
          {
            id: 'pip-container',
            type: 'fixed',
            name: '画中画容器',
            zIndex: 2,
            properties: {
              position: { x: 'right', y: 'top', offsetX: -35, offsetY: 35 },
              size: { width: 320, height: 180 },
              borderRadius: 100,
              border: { width: 2, color: '#FFFFFF' },
              animation: {
                type: 'fade-in',
                duration: 0.2,
                easing: 'ease-in-out'
              }
            },
            constraints: {
              position: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
              size: { min: 160, max: 400 },
              modifiable: true,
              userAdjustable: ['position', 'size']
            }
          }
        ],

        dynamic: [
          {
            id: 'video-content',
            type: 'dynamic',
            name: '视频内容层',
            zIndex: 3,
            source: 'ai-analysis',
            properties: {
              content: null, // 由AI分析填充
              fit: 'cover',
              autoCrop: true
            },
            constraints: {
              modifiable: false,
              reason: 'AI生成内容保持完整性'
            }
          },
          {
            id: 'face-tracking',
            type: 'dynamic',
            name: '人脸跟踪层',
            zIndex: 4,
            source: 'face-detection',
            properties: {
              trackingEnabled: true,
              smoothing: 0.8,
              confidence: 0.8
            },
            constraints: {
              modifiable: false,
              reason: '技术功能层不可修改'
            }
          }
        ],

        adjustable: [
          {
            id: 'user-overlay',
            type: 'adjustable',
            name: '用户叠加层',
            zIndex: 5,
            properties: {
              elements: [],
              maxElements: 3
            },
            constraints: {
              modifiable: true,
              userAdjustable: ['elements', 'position', 'style']
            }
          }
        ]
      },

      // 模板元数据
      metadata: {
        version: '1.0',
        author: 'VidSlide AI',
        tags: ['视频', '演讲', '演示'],
        compatibility: ['video', 'presentation']
      }
    })

    // 信息卡片模板
    this.templates.set('info-card', {
      id: 'info-card',
      name: '信息卡片模板',
      category: 'information',
      description: '突出显示重要信息和关键词',

      layers: {
        fixed: [
          {
            id: 'background-overlay',
            type: 'fixed',
            name: '背景遮罩层',
            zIndex: 1,
            properties: {
              backgroundColor: '#000000',
              opacity: 0.6,
              position: 'fullscreen'
            },
            constraints: { modifiable: false }
          },
          {
            id: 'card-container',
            type: 'fixed',
            name: '卡片容器',
            zIndex: 2,
            properties: {
              size: { width: '80%', height: '60%' },
              backgroundColor: '#1A1A1A',
              border: { width: 2, color: '#FFD700' },
              borderRadius: 8,
              animation: {
                type: 'scale-in',
                duration: 0.3,
                from: { scale: 0.9 },
                to: { scale: 1.0 }
              }
            },
            constraints: {
              modifiable: false,
              reason: '保持设计一致性'
            }
          }
        ],

        dynamic: [
          {
            id: 'content-analysis',
            type: 'dynamic',
            name: '内容分析层',
            zIndex: 3,
            source: 'ai-analysis',
            properties: {
              keywords: [],
              importance: [],
              autoLayout: true
            },
            constraints: { modifiable: false }
          }
        ],

        adjustable: [
          {
            id: 'user-content',
            type: 'adjustable',
            name: '用户内容层',
            zIndex: 4,
            properties: {
              title: '',
              description: '',
              image: null,
              links: []
            },
            constraints: {
              modifiable: true,
              maxLength: { title: 20, description: 100 }
            }
          }
        ]
      },

      metadata: {
        version: '1.0',
        author: 'VidSlide AI',
        tags: ['信息', '卡片', '展示'],
        compatibility: ['text', 'image', 'presentation']
      }
    })

    // 关键词高亮模板
    this.templates.set('keyword-highlight', {
      id: 'keyword-highlight',
      name: '关键词高亮模板',
      category: 'highlight',
      description: '突出显示重要的关键词汇',

      layers: {
        fixed: [
          {
            id: 'background-overlay',
            type: 'fixed',
            name: '背景遮罩层',
            zIndex: 1,
            properties: {
              backgroundColor: '#000000',
              opacity: 0.45,
              position: 'fullscreen'
            },
            constraints: { modifiable: false }
          },
          {
            id: 'highlight-container',
            type: 'fixed',
            name: '高亮容器',
            zIndex: 2,
            properties: {
              size: { width: '50%', height: '18%' },
              position: 'center',
              backgroundColor: '#1A1A1A',
              border: { width: 2, color: '#FFD700' },
              animation: {
                type: 'fade-in-up',
                duration: 0.2,
                offset: 10
              }
            },
            constraints: { modifiable: false }
          }
        ],

        dynamic: [
          {
            id: 'keyword-extraction',
            type: 'dynamic',
            name: '关键词提取层',
            zIndex: 3,
            source: 'nlp-analysis',
            properties: {
              keywords: [],
              confidence: [],
              fontSize: 'auto'
            },
            constraints: { modifiable: false }
          }
        ],

        adjustable: [
          {
            id: 'styling-options',
            type: 'adjustable',
            name: '样式选项层',
            zIndex: 4,
            properties: {
              color: '#FFFFFF',
              fontFamily: 'PingFang SC',
              shadow: true
            },
            constraints: {
              modifiable: true,
              colorOptions: ['#FFFFFF', '#FFD700', '#FF6B6B', '#4ECDC4']
            }
          }
        ]
      },

      metadata: {
        version: '1.0',
        author: 'VidSlide AI',
        tags: ['关键词', '高亮', '强调'],
        compatibility: ['text', 'speech']
      }
    })

    // 时间线模板
    this.templates.set('timeline', {
      id: 'timeline',
      name: '时间线展示模板',
      category: 'sequence',
      description: '展示时间发展的内容和历程',

      layers: {
        fixed: [
          {
            id: 'timeline-axis',
            type: 'fixed',
            name: '时间轴线',
            zIndex: 1,
            properties: {
              orientation: 'horizontal',
              position: 'center-vertical',
              style: { width: 3, color: '#FFD700' },
              animation: {
                type: 'draw-line',
                duration: 1.0,
                direction: 'left-to-right'
              }
            },
            constraints: { modifiable: false }
          }
        ],

        dynamic: [
          {
            id: 'timeline-events',
            type: 'dynamic',
            name: '时间事件层',
            zIndex: 2,
            source: 'content-analysis',
            properties: {
              events: [],
              autoLayout: true,
              spacing: 'auto'
            },
            constraints: { modifiable: false }
          }
        ],

        adjustable: [
          {
            id: 'event-details',
            type: 'adjustable',
            name: '事件详情层',
            zIndex: 3,
            properties: {
              showImages: true,
              showDescriptions: true,
              customEvents: []
            },
            constraints: {
              modifiable: true,
              maxEvents: 8
            }
          }
        ]
      },

      metadata: {
        version: '1.0',
        author: 'VidSlide AI',
        tags: ['时间线', '历程', '发展'],
        compatibility: ['sequence', 'history', 'process']
      }
    })

    // 分屏对比模板
    this.templates.set('split-screen', {
      id: 'split-screen',
      name: '分屏对比模板',
      category: 'comparison',
      description: '左右分屏展示对比内容',

      layers: {
        fixed: [
          {
            id: 'split-line',
            type: 'fixed',
            name: '分屏分割线',
            zIndex: 1,
            properties: {
              position: 'center-vertical',
              style: { width: 2, color: '#FFFFFF' },
              animation: {
                type: 'slide-in',
                duration: 0.3,
                direction: 'center'
              }
            },
            constraints: { modifiable: false }
          },
          {
            id: 'left-panel',
            type: 'fixed',
            name: '左侧面板',
            zIndex: 2,
            properties: {
              position: 'left-half',
              backgroundColor: 'transparent'
            },
            constraints: { modifiable: false }
          },
          {
            id: 'right-panel',
            type: 'fixed',
            name: '右侧面板',
            zIndex: 3,
            properties: {
              position: 'right-half',
              backgroundColor: 'transparent'
            },
            constraints: { modifiable: false }
          }
        ],

        dynamic: [
          {
            id: 'content-distribution',
            type: 'dynamic',
            name: '内容分配层',
            zIndex: 4,
            source: 'comparison-analysis',
            properties: {
              leftContent: null,
              rightContent: null,
              syncAnimation: true
            },
            constraints: { modifiable: false }
          }
        ],

        adjustable: [
          {
            id: 'panel-customization',
            type: 'adjustable',
            name: '面板自定义层',
            zIndex: 5,
            properties: {
              leftTitle: '',
              rightTitle: '',
              showLabels: true
            },
            constraints: {
              modifiable: true,
              maxLength: { title: 15 }
            }
          }
        ]
      },

      metadata: {
        version: '1.0',
        author: 'VidSlide AI',
        tags: ['对比', '分屏', '分析'],
        compatibility: ['comparison', 'before-after', 'pros-cons']
      }
    })

    // 对话弹窗模板
    this.templates.set('dialog-popup', {
      id: 'dialog-popup',
      name: '对话弹窗模板',
      category: 'overlay',
      description: '右下角弹出显示关键词和重要信息',

      layers: {
        fixed: [
          {
            id: 'popup-container',
            type: 'fixed',
            name: '弹窗容器',
            zIndex: 1,
            properties: {
              position: { x: 'right', y: 'bottom', offsetX: -20, offsetY: -20 },
              size: { width: 300, height: 120 },
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              borderRadius: 8,
              border: { width: 1, color: '#FFD700' },
              animation: {
                type: 'slide-up',
                duration: 0.3,
                easing: 'ease-out'
              }
            },
            constraints: {
              position: ['bottom-right', 'bottom-left', 'top-right', 'top-left'],
              size: { min: 200, max: 400 }
            }
          }
        ],

        dynamic: [
          {
            id: 'keyword-content',
            type: 'dynamic',
            name: '关键词内容层',
            zIndex: 2,
            source: 'keyword-analysis',
            properties: {
              keyword: '',
              importance: 0,
              autoSize: true
            },
            constraints: { modifiable: false }
          }
        ],

        adjustable: [
          {
            id: 'styling-options',
            type: 'adjustable',
            name: '样式选项层',
            zIndex: 3,
            properties: {
              fontSize: 16,
              color: '#FFFFFF',
              showIcon: true,
              autoHide: true,
              duration: 3
            },
            constraints: {
              modifiable: true,
              range: { fontSize: [12, 24], duration: [2, 10] }
            }
          }
        ]
      },

      metadata: {
        version: '1.0',
        author: 'VidSlide AI',
        tags: ['弹窗', '关键词', '强调'],
        compatibility: ['text', 'speech', 'presentation']
      }
    })

    // 图表分析模板
    this.templates.set('chart-analysis', {
      id: 'chart-analysis',
      name: '图表分析模板',
      category: 'data',
      description: '智能匹配和展示数据图表',

      layers: {
        fixed: [
          {
            id: 'chart-background',
            type: 'fixed',
            name: '图表背景层',
            zIndex: 1,
            properties: {
              backgroundColor: '#1A1A1A',
              borderRadius: 8,
              padding: 20
            },
            constraints: { modifiable: false }
          },
          {
            id: 'chart-container',
            type: 'fixed',
            name: '图表容器',
            zIndex: 2,
            properties: {
              size: { width: '70%', height: '60%' },
              position: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: 4,
              shadow: '0 4px 12px rgba(0,0,0,0.3)'
            },
            constraints: { modifiable: false }
          }
        ],

        dynamic: [
          {
            id: 'data-visualization',
            type: 'dynamic',
            name: '数据可视化层',
            zIndex: 3,
            source: 'data-analysis',
            properties: {
              chartType: 'auto', // bar, line, pie, etc.
              data: [],
              autoScale: true
            },
            constraints: { modifiable: false }
          }
        ],

        adjustable: [
          {
            id: 'chart-customization',
            type: 'adjustable',
            name: '图表自定义层',
            zIndex: 4,
            properties: {
              title: '',
              colors: ['#007AFF', '#FFD700', '#FF6B6B'],
              showLegend: true,
              showGrid: false
            },
            constraints: {
              modifiable: true,
              maxLength: { title: 30 }
            }
          }
        ]
      },

      metadata: {
        version: '1.0',
        author: 'VidSlide AI',
        tags: ['图表', '数据', '分析'],
        compatibility: ['data', 'statistics', 'analytics']
      }
    })

    // 文件展示模板
    this.templates.set('document-display', {
      id: 'document-display',
      name: '文件展示模板',
      category: 'document',
      description: '3D效果展示文档和文件内容',

      layers: {
        fixed: [
          {
            id: 'document-background',
            type: 'fixed',
            name: '文档背景层',
            zIndex: 1,
            properties: {
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              position: 'fullscreen'
            },
            constraints: { modifiable: false }
          },
          {
            id: 'document-stack',
            type: 'fixed',
            name: '文档堆叠容器',
            zIndex: 2,
            properties: {
              position: 'center',
              size: { width: '60%', height: '70%' },
              perspective: 1000,
              transformStyle: 'preserve-3d'
            },
            constraints: { modifiable: false }
          }
        ],

        dynamic: [
          {
            id: 'document-content',
            type: 'dynamic',
            name: '文档内容层',
            zIndex: 3,
            source: 'document-analysis',
            properties: {
              documents: [],
              maxDocuments: 4,
              overlapOffset: 30,
              rotation: { x: 5, y: 10 }
            },
            constraints: { modifiable: false }
          }
        ],

        adjustable: [
          {
            id: 'document-styling',
            type: 'adjustable',
            name: '文档样式层',
            zIndex: 4,
            properties: {
              shadowIntensity: 0.5,
              borderRadius: 4,
              showHighlights: true,
              highlightColor: '#FFD700'
            },
            constraints: {
              modifiable: true,
              range: { shadowIntensity: [0, 1], borderRadius: [0, 16] }
            }
          }
        ]
      },

      metadata: {
        version: '1.0',
        author: 'VidSlide AI',
        tags: ['文档', '文件', '展示'],
        compatibility: ['document', 'presentation', 'education']
      }
    })

    // 简洁模板
    this.templates.set('minimalist', {
      id: 'minimalist',
      name: '简洁模板',
      category: 'minimal',
      description: '极简设计，突出核心内容',

      layers: {
        fixed: [
          {
            id: 'clean-background',
            type: 'fixed',
            name: '干净背景层',
            zIndex: 1,
            properties: {
              backgroundColor: '#FFFFFF',
              position: 'fullscreen'
            },
            constraints: { modifiable: false }
          }
        ],

        dynamic: [
          {
            id: 'core-content',
            type: 'dynamic',
            name: '核心内容层',
            zIndex: 2,
            source: 'content-analysis',
            properties: {
              content: '',
              autoLayout: true,
              maxElements: 3
            },
            constraints: { modifiable: false }
          }
        ],

        adjustable: [
          {
            id: 'minimal-customization',
            type: 'adjustable',
            name: '极简自定义层',
            zIndex: 3,
            properties: {
              fontFamily: 'Helvetica Neue',
              textColor: '#1D1D1F',
              accentColor: '#007AFF',
              spacing: 'generous'
            },
            constraints: {
              modifiable: true,
              limitedOptions: true
            }
          }
        ]
      },

      metadata: {
        version: '1.0',
        author: 'VidSlide AI',
        tags: ['简洁', '极简', '清晰'],
        compatibility: ['text', 'presentation', 'education']
      }
    })

    // 演讲者聚焦模板
    this.templates.set('speaker-focus', {
      id: 'speaker-focus',
      name: '演讲者聚焦模板',
      category: 'presentation',
      description: '突出演讲者，弱化背景内容',

      layers: {
        fixed: [
          {
            id: 'blur-background',
            type: 'fixed',
            name: '模糊背景层',
            zIndex: 1,
            properties: {
              filter: 'blur(10px)',
              opacity: 0.6,
              position: 'fullscreen'
            },
            constraints: { modifiable: false }
          },
          {
            id: 'speaker-spotlight',
            type: 'fixed',
            name: '演讲者聚光灯',
            zIndex: 2,
            properties: {
              position: 'center',
              size: { width: 400, height: 300 },
              background: 'radial-gradient(circle, transparent 40%, rgba(0,0,0,0.8) 100%)',
              animation: {
                type: 'fade-in',
                duration: 0.5
              }
            },
            constraints: {
              position: ['center', 'center-left', 'center-right'],
              size: { min: 300, max: 600 }
            }
          }
        ],

        dynamic: [
          {
            id: 'speaker-tracking',
            type: 'dynamic',
            name: '演讲者跟踪层',
            zIndex: 3,
            source: 'face-detection',
            properties: {
              trackingMode: 'speaker',
              smoothing: 0.8,
              autoFocus: true
            },
            constraints: { modifiable: false }
          }
        ],

        adjustable: [
          {
            id: 'focus-customization',
            type: 'adjustable',
            name: '聚焦自定义层',
            zIndex: 4,
            properties: {
              blurIntensity: 10,
              spotlightColor: 'rgba(255,255,255,0.1)',
              showSubtitles: true
            },
            constraints: {
              modifiable: true,
              range: { blurIntensity: [5, 20] }
            }
          }
        ]
      },

      metadata: {
        version: '1.0',
        author: 'VidSlide AI',
        tags: ['演讲', '聚焦', '人像'],
        compatibility: ['video', 'presentation', 'speech']
      }
    })

    // 教育模板
    this.templates.set('educational', {
      id: 'educational',
      name: '教育模板',
      category: 'education',
      description: '适合教学内容的结构化展示',

      layers: {
        fixed: [
          {
            id: 'lesson-background',
            type: 'fixed',
            name: '课程背景层',
            zIndex: 1,
            properties: {
              backgroundColor: '#F8F9FA',
              position: 'fullscreen'
            },
            constraints: { modifiable: false }
          },
          {
            id: 'content-area',
            type: 'fixed',
            name: '内容区域',
            zIndex: 2,
            properties: {
              position: 'center',
              size: { width: '80%', height: '70%' },
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              shadow: '0 8px 32px rgba(0,0,0,0.1)'
            },
            constraints: { modifiable: false }
          }
        ],

        dynamic: [
          {
            id: 'educational-content',
            type: 'dynamic',
            name: '教育内容层',
            zIndex: 3,
            source: 'educational-analysis',
            properties: {
              learningObjectives: [],
              keyPoints: [],
              autoStructure: true
            },
            constraints: { modifiable: false }
          }
        ],

        adjustable: [
          {
            id: 'teaching-aids',
            type: 'adjustable',
            name: '教学辅助层',
            zIndex: 4,
            properties: {
              showObjectives: true,
              highlightKeyPoints: true,
              addQuizzes: false,
              theme: 'educational'
            },
            constraints: {
              modifiable: true
            }
          }
        ]
      },

      metadata: {
        version: '1.0',
        author: 'VidSlide AI',
        tags: ['教育', '教学', '学习'],
        compatibility: ['education', 'training', 'course']
      }
    })

    // 产品展示模板
    this.templates.set('product-showcase', {
      id: 'product-showcase',
      name: '产品展示模板',
      category: 'marketing',
      description: '突出产品特点和优势',

      layers: {
        fixed: [
          {
            id: 'product-background',
            type: 'fixed',
            name: '产品背景层',
            zIndex: 1,
            properties: {
              backgroundColor: '#000000',
              position: 'fullscreen'
            },
            constraints: { modifiable: false }
          },
          {
            id: 'product-spotlight',
            type: 'fixed',
            name: '产品聚光灯',
            zIndex: 2,
            properties: {
              position: 'center-left',
              size: { width: 500, height: 400 },
              background: 'radial-gradient(ellipse, rgba(255,255,255,0.1) 0%, transparent 70%)',
              animation: {
                type: 'fade-in',
                duration: 0.8
              }
            },
            constraints: {
              position: ['center-left', 'center-right', 'center'],
              size: { min: 300, max: 800 }
            }
          }
        ],

        dynamic: [
          {
            id: 'product-features',
            type: 'dynamic',
            name: '产品特性层',
            zIndex: 3,
            source: 'product-analysis',
            properties: {
              features: [],
              specifications: [],
              autoHighlight: true
            },
            constraints: { modifiable: false }
          }
        ],

        adjustable: [
          {
            id: 'marketing-elements',
            type: 'adjustable',
            name: '营销元素层',
            zIndex: 4,
            properties: {
              showPrice: false,
              showCTA: true,
              brandColors: ['#007AFF', '#FFD700'],
              tagline: ''
            },
            constraints: {
              modifiable: true,
              maxLength: { tagline: 50 }
            }
          }
        ]
      },

      metadata: {
        version: '1.0',
        author: 'VidSlide AI',
        tags: ['产品', '展示', '营销'],
        compatibility: ['product', 'marketing', 'showcase']
      }
    })

    // ========== 短视频/自媒体场景专用模板 ==========

    // 抖音营销模板 - 2025 Brat风格配色
    this.templates.set('douyin-marketing', {
      id: 'douyin-marketing',
      name: '抖音营销模板',
      category: 'short-video',
      description: '适合抖音、快手等短视频平台的营销内容展示',

      layers: {
        fixed: [
          {
            id: 'gradient-background',
            type: 'fixed',
            name: '渐变背景层',
            zIndex: 1,
            properties: {
              // 2025 TikTok风格：深色底+霓虹渐变
              background: 'linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #16213e 100%)',
              position: 'fullscreen'
            },
            constraints: { modifiable: false }
          },
          {
            id: 'neon-glow',
            type: 'fixed',
            name: '霓虹光效层',
            zIndex: 1.5,
            properties: {
              // TikTok标志性青粉渐变光效
              background: 'radial-gradient(ellipse at 30% 20%, rgba(0,217,255,0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(255,0,110,0.15) 0%, transparent 50%)',
              position: 'fullscreen'
            },
            constraints: { modifiable: false }
          },
          {
            id: 'brand-watermark',
            type: 'fixed',
            name: '品牌水印',
            zIndex: 2,
            properties: {
              position: { x: 'right', y: 'top', offsetX: -20, offsetY: 20 },
              opacity: 0.8,
              size: { width: 80, height: 30 }
            },
            constraints: { modifiable: false }
          }
        ],

        dynamic: [
          {
            id: 'hook-text',
            type: 'dynamic',
            name: '钩子文案层',
            zIndex: 3,
            source: 'keyword-analysis',
            properties: {
              position: 'top-center',
              fontSize: 32,
              fontWeight: 'bold',
              color: '#FFFFFF',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              animation: {
                type: 'bounce-in',
                duration: 0.5
              }
            },
            constraints: { modifiable: false }
          },
          {
            id: 'keyword-bullets',
            type: 'dynamic',
            name: '关键词要点',
            zIndex: 4,
            source: 'keyword-extraction',
            properties: {
              layout: 'vertical-list',
              maxItems: 5,
              bulletStyle: 'emoji',
              animation: {
                type: 'stagger-fade',
                stagger: 200
              }
            },
            constraints: { modifiable: false }
          }
        ],

        adjustable: [
          {
            id: 'cta-button',
            type: 'adjustable',
            name: 'CTA按钮层',
            zIndex: 5,
            properties: {
              text: '点击了解更多',
              position: 'bottom-center',
              backgroundColor: '#FF2D55',
              borderRadius: 25,
              animation: { type: 'pulse', duration: 1.5 }
            },
            constraints: {
              modifiable: true,
              maxLength: { text: 10 }
            }
          }
        ]
      },

      metadata: {
        version: '1.0',
        author: 'VidSlide AI',
        tags: ['抖音', '短视频', '营销', '获客'],
        compatibility: ['short-video', 'marketing', 'social-media']
      }
    })

    // 流量获客模板 - 2025专业商务蓝绿渐变
    this.templates.set('traffic-acquisition', {
      id: 'traffic-acquisition',
      name: '流量获客模板',
      category: 'marketing',
      description: '展示流量转化和获客策略的专业模板',

      layers: {
        fixed: [
          {
            id: 'dark-background',
            type: 'fixed',
            name: '深色背景',
            zIndex: 1,
            properties: {
              // 2025专业深蓝渐变 - 商务科技感
              background: 'linear-gradient(135deg, #0D1117 0%, #161B22 50%, #21262D 100%)',
              position: 'fullscreen'
            },
            constraints: { modifiable: false }
          },
          {
            id: 'grid-overlay',
            type: 'fixed',
            name: '网格叠加层',
            zIndex: 1.5,
            properties: {
              // 科技感网格背景
              background: 'linear-gradient(rgba(45,212,191,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(45,212,191,0.03) 1px, transparent 1px)',
              backgroundSize: '50px 50px',
              position: 'fullscreen'
            },
            constraints: { modifiable: false }
          },
          {
            id: 'funnel-container',
            type: 'fixed',
            name: '漏斗容器',
            zIndex: 2,
            properties: {
              position: 'center-left',
              size: { width: '45%', height: '70%' },
              background: 'transparent'
            },
            constraints: { modifiable: false }
          }
        ],

        dynamic: [
          {
            id: 'traffic-funnel',
            type: 'dynamic',
            name: '流量漏斗',
            zIndex: 3,
            source: 'data-analysis',
            properties: {
              funnelStages: ['曝光', '点击', '互动', '转化', '成交'],
              colors: ['#FF6B6B', '#FFE66D', '#4ECDC4', '#45B7D1', '#96CEB4'],
              animation: {
                type: 'funnel-fill',
                duration: 2000
              }
            },
            constraints: { modifiable: false }
          },
          {
            id: 'conversion-stats',
            type: 'dynamic',
            name: '转化数据',
            zIndex: 4,
            source: 'data-extraction',
            properties: {
              position: 'center-right',
              layout: 'stats-cards',
              animation: {
                type: 'count-up',
                duration: 1500
              }
            },
            constraints: { modifiable: false }
          }
        ],

        adjustable: [
          {
            id: 'strategy-tips',
            type: 'adjustable',
            name: '策略提示',
            zIndex: 5,
            properties: {
              tips: [],
              showIcons: true,
              theme: 'dark'
            },
            constraints: {
              modifiable: true,
              maxItems: 4
            }
          }
        ]
      },

      metadata: {
        version: '1.0',
        author: 'VidSlide AI',
        tags: ['流量', '获客', '转化', '漏斗'],
        compatibility: ['marketing', 'analytics', 'business']
      }
    })

    // 投放效果模板
    this.templates.set('ad-performance', {
      id: 'ad-performance',
      name: '投放效果模板',
      category: 'advertising',
      description: '展示广告投放效果和ROI数据',

      layers: {
        fixed: [
          {
            id: 'dashboard-background',
            type: 'fixed',
            name: '仪表盘背景',
            zIndex: 1,
            properties: {
              // 2025专业数据仪表盘风格 - 深蓝紫渐变
              background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
              position: 'fullscreen'
            },
            constraints: { modifiable: false }
          },
          {
            id: 'data-grid-overlay',
            type: 'fixed',
            name: '数据网格层',
            zIndex: 1.5,
            properties: {
              // 数据可视化网格背景
              background: 'linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              position: 'fullscreen'
            },
            constraints: { modifiable: false }
          },
          {
            id: 'header-bar',
            type: 'fixed',
            name: '顶部标题栏',
            zIndex: 2,
            properties: {
              position: 'top',
              height: 60,
              // 玻璃态顶栏
              background: 'linear-gradient(90deg, rgba(99,102,241,0.1) 0%, rgba(168,85,247,0.1) 100%)',
              backdropFilter: 'blur(10px)',
              borderBottom: '1px solid rgba(168,85,247,0.2)'
            },
            constraints: { modifiable: false }
          }
        ],

        dynamic: [
          {
            id: 'roi-display',
            type: 'dynamic',
            name: 'ROI展示',
            zIndex: 3,
            source: 'data-analysis',
            properties: {
              position: 'top-left',
              size: { width: '30%', height: '40%' },
              chartType: 'gauge',
              colors: ['#FF6B6B', '#FFE66D', '#4ECDC4'],
              animation: {
                type: 'gauge-fill',
                duration: 1500
              }
            },
            constraints: { modifiable: false }
          },
          {
            id: 'cost-breakdown',
            type: 'dynamic',
            name: '成本分解',
            zIndex: 4,
            source: 'data-extraction',
            properties: {
              position: 'top-right',
              chartType: 'pie',
              showLegend: true
            },
            constraints: { modifiable: false }
          },
          {
            id: 'trend-chart',
            type: 'dynamic',
            name: '趋势图表',
            zIndex: 5,
            source: 'time-series',
            properties: {
              position: 'bottom',
              chartType: 'line',
              showGrid: true,
              animation: {
                type: 'draw-line',
                duration: 2000
              }
            },
            constraints: { modifiable: false }
          }
        ],

        adjustable: [
          {
            id: 'metric-labels',
            type: 'adjustable',
            name: '指标标签',
            zIndex: 6,
            properties: {
              metrics: ['CPM', 'CPC', 'CTR', 'CVR'],
              showValues: true,
              theme: 'neon'
            },
            constraints: {
              modifiable: true
            }
          }
        ]
      },

      metadata: {
        version: '1.0',
        author: 'VidSlide AI',
        tags: ['投放', '广告', 'ROI', '数据'],
        compatibility: ['advertising', 'analytics', 'performance']
      }
    })

    // IP打造模板
    this.templates.set('personal-ip', {
      id: 'personal-ip',
      name: 'IP打造模板',
      category: 'personal-brand',
      description: '展示个人IP和品牌形象',

      layers: {
        fixed: [
          {
            id: 'brand-background',
            type: 'fixed',
            name: '品牌背景',
            zIndex: 1,
            properties: {
              // 2025 IP打造风格 - 神秘黑紫渐变
              background: 'linear-gradient(135deg, #0D0D0D 0%, #3B0A45 40%, #6A2C91 70%, #B84E8C 100%)',
              position: 'fullscreen'
            },
            constraints: { modifiable: false }
          },
          {
            id: 'spotlight-glow',
            type: 'fixed',
            name: '聚光灯效果',
            zIndex: 1.5,
            properties: {
              // 中心聚光效果
              background: 'radial-gradient(ellipse at 50% 30%, rgba(184,78,140,0.25) 0%, transparent 60%)',
              position: 'fullscreen'
            },
            constraints: { modifiable: false }
          },
          {
            id: 'avatar-frame',
            type: 'fixed',
            name: '头像框架',
            zIndex: 2,
            properties: {
              position: { x: 'center', y: 'top', offsetY: 80 },
              size: { width: 150, height: 150 },
              borderRadius: '50%',
              // 渐变边框效果
              border: '4px solid transparent',
              background: 'linear-gradient(135deg, #B84E8C, #6A2C91, #FFD700)',
              shadow: '0 0 40px rgba(184,78,140,0.5), 0 0 80px rgba(106,44,145,0.3)'
            },
            constraints: { modifiable: false }
          }
        ],

        dynamic: [
          {
            id: 'ip-name',
            type: 'dynamic',
            name: 'IP名称',
            zIndex: 3,
            source: 'content-analysis',
            properties: {
              position: 'center',
              fontSize: 36,
              fontWeight: 'bold',
              color: '#FFFFFF',
              animation: {
                type: 'fade-in-up',
                duration: 0.5
              }
            },
            constraints: { modifiable: false }
          },
          {
            id: 'ip-tags',
            type: 'dynamic',
            name: 'IP标签',
            zIndex: 4,
            source: 'keyword-extraction',
            properties: {
              layout: 'horizontal-tags',
              maxTags: 4,
              tagStyle: 'pill',
              colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#96CEB4']
            },
            constraints: { modifiable: false }
          }
        ],

        adjustable: [
          {
            id: 'bio-section',
            type: 'adjustable',
            name: '简介区域',
            zIndex: 5,
            properties: {
              bio: '',
              socialLinks: [],
              showFollowers: true
            },
            constraints: {
              modifiable: true,
              maxLength: { bio: 100 }
            }
          }
        ]
      },

      metadata: {
        version: '1.0',
        author: 'VidSlide AI',
        tags: ['IP', '个人品牌', 'KOL', '自媒体'],
        compatibility: ['personal-brand', 'influencer', 'social-media']
      }
    })

    // 粉丝互动模板
    this.templates.set('fan-engagement', {
      id: 'fan-engagement',
      name: '粉丝互动模板',
      category: 'engagement',
      description: '展示粉丝互动和社区运营效果',

      layers: {
        fixed: [
          {
            id: 'community-background',
            type: 'fixed',
            name: '社区背景',
            zIndex: 1,
            properties: {
              // 2025 粉丝互动风格 - 温暖粉红渐变
              background: 'linear-gradient(135deg, #ff8177 0%, #ff867a 21%, #ff8c7f 52%, #f99185 78%, #cf556c 90%, #b12a5b 100%)',
              position: 'fullscreen'
            },
            constraints: { modifiable: false }
          },
          {
            id: 'heart-particles',
            type: 'fixed',
            name: '爱心粒子层',
            zIndex: 1.5,
            properties: {
              // 爱心光效装饰
              background: 'radial-gradient(ellipse at 20% 80%, rgba(255,255,255,0.15) 0%, transparent 40%), radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 40%)',
              position: 'fullscreen'
            },
            constraints: { modifiable: false }
          }
        ],

        dynamic: [
          {
            id: 'engagement-metrics',
            type: 'dynamic',
            name: '互动指标',
            zIndex: 2,
            source: 'data-analysis',
            properties: {
              metrics: ['点赞', '评论', '分享', '收藏'],
              layout: 'icon-grid',
              animation: {
                type: 'pop-in',
                stagger: 150
              }
            },
            constraints: { modifiable: false }
          },
          {
            id: 'comment-showcase',
            type: 'dynamic',
            name: '评论展示',
            zIndex: 3,
            source: 'content-extraction',
            properties: {
              position: 'center',
              maxComments: 3,
              style: 'bubble',
              animation: {
                type: 'slide-in',
                direction: 'left'
              }
            },
            constraints: { modifiable: false }
          }
        ],

        adjustable: [
          {
            id: 'cta-engagement',
            type: 'adjustable',
            name: '互动引导',
            zIndex: 4,
            properties: {
              text: '双击点赞，评论区见！',
              position: 'bottom',
              style: 'animated-text'
            },
            constraints: {
              modifiable: true,
              maxLength: { text: 20 }
            }
          }
        ]
      },

      metadata: {
        version: '1.0',
        author: 'VidSlide AI',
        tags: ['粉丝', '互动', '社区', '运营'],
        compatibility: ['engagement', 'community', 'social-media']
      }
    })

    // 干货分享模板
    this.templates.set('knowledge-sharing', {
      id: 'knowledge-sharing',
      name: '干货分享模板',
      category: 'content',
      description: '适合知识分享和干货内容展示',

      layers: {
        fixed: [
          {
            id: 'clean-background',
            type: 'fixed',
            name: '简洁背景',
            zIndex: 1,
            properties: {
              // 2025 干货分享风格 - 清新蓝绿渐变
              background: 'linear-gradient(135deg, #1fa2ff 0%, #12d8fa 50%, #a6ffcb 100%)',
              position: 'fullscreen'
            },
            constraints: { modifiable: false }
          },
          {
            id: 'content-card',
            type: 'fixed',
            name: '内容卡片',
            zIndex: 2,
            properties: {
              position: 'center',
              size: { width: '85%', height: '75%' },
              // 玻璃态卡片效果
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: 24,
              border: '1px solid rgba(255,255,255,0.5)',
              shadow: '0 20px 60px rgba(31,162,255,0.2), 0 10px 30px rgba(0,0,0,0.1)'
            },
            constraints: { modifiable: false }
          }
        ],

        dynamic: [
          {
            id: 'title-section',
            type: 'dynamic',
            name: '标题区域',
            zIndex: 3,
            source: 'content-analysis',
            properties: {
              position: 'top',
              fontSize: 28,
              fontWeight: 'bold',
              color: '#1D1D1F',
              icon: '💡'
            },
            constraints: { modifiable: false }
          },
          {
            id: 'key-points',
            type: 'dynamic',
            name: '要点列表',
            zIndex: 4,
            source: 'keyword-extraction',
            properties: {
              layout: 'numbered-list',
              maxPoints: 5,
              bulletStyle: 'number-circle',
              animation: {
                type: 'reveal',
                stagger: 300
              }
            },
            constraints: { modifiable: false }
          }
        ],

        adjustable: [
          {
            id: 'summary-footer',
            type: 'adjustable',
            name: '总结区域',
            zIndex: 5,
            properties: {
              summary: '',
              showSavePrompt: true,
              theme: 'light'
            },
            constraints: {
              modifiable: true,
              maxLength: { summary: 50 }
            }
          }
        ]
      },

      metadata: {
        version: '1.0',
        author: 'VidSlide AI',
        tags: ['干货', '知识', '分享', '教程'],
        compatibility: ['education', 'tutorial', 'knowledge']
      }
    })

    // 对比种草模板
    this.templates.set('comparison-review', {
      id: 'comparison-review',
      name: '对比种草模板',
      category: 'review',
      description: '产品对比和种草推荐展示',

      layers: {
        fixed: [
          {
            id: 'review-background',
            type: 'fixed',
            name: '评测背景',
            zIndex: 1,
            properties: {
              // 2025 对比种草风格 - 珊瑚色到青色渐变
              background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E72 25%, #FFC3A0 50%, #A8E6CF 75%, #4ECDC4 100%)',
              position: 'fullscreen'
            },
            constraints: { modifiable: false }
          },
          {
            id: 'glass-overlay',
            type: 'fixed',
            name: '玻璃遮罩层',
            zIndex: 1.5,
            properties: {
              // 轻微磨砂效果增加层次感
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(2px)',
              position: 'fullscreen'
            },
            constraints: { modifiable: false }
          },
          {
            id: 'vs-divider',
            type: 'fixed',
            name: 'VS分隔线',
            zIndex: 2,
            properties: {
              position: 'center',
              content: 'VS',
              fontSize: 48,
              fontWeight: 'bold',
              // 渐变文字效果
              background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4)',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              textShadow: '0 4px 20px rgba(255,107,107,0.4)',
              animation: {
                type: 'scale-bounce',
                duration: 0.5
              }
            },
            constraints: { modifiable: false }
          }
        ],

        dynamic: [
          {
            id: 'product-left',
            type: 'dynamic',
            name: '左侧产品',
            zIndex: 3,
            source: 'comparison-analysis',
            properties: {
              position: 'left',
              showImage: true,
              showSpecs: true,
              showPrice: true
            },
            constraints: { modifiable: false }
          },
          {
            id: 'product-right',
            type: 'dynamic',
            name: '右侧产品',
            zIndex: 4,
            source: 'comparison-analysis',
            properties: {
              position: 'right',
              showImage: true,
              showSpecs: true,
              showPrice: true
            },
            constraints: { modifiable: false }
          },
          {
            id: 'winner-badge',
            type: 'dynamic',
            name: '推荐标识',
            zIndex: 5,
            source: 'recommendation',
            properties: {
              text: '推荐',
              style: 'badge',
              color: '#34C759'
            },
            constraints: { modifiable: false }
          }
        ],

        adjustable: [
          {
            id: 'verdict-section',
            type: 'adjustable',
            name: '结论区域',
            zIndex: 6,
            properties: {
              verdict: '',
              showRating: true,
              ratingStyle: 'stars'
            },
            constraints: {
              modifiable: true,
              maxLength: { verdict: 80 }
            }
          }
        ]
      },

      metadata: {
        version: '1.0',
        author: 'VidSlide AI',
        tags: ['对比', '种草', '评测', '推荐'],
        compatibility: ['review', 'comparison', 'recommendation']
      }
    })

    // 数据可视化模板（增强版）
    this.templates.set('data-storytelling', {
      id: 'data-storytelling',
      name: '数据故事模板',
      category: 'data',
      description: '用数据讲故事，适合展示增长、趋势等',

      layers: {
        fixed: [
          {
            id: 'data-background',
            type: 'fixed',
            name: '数据背景',
            zIndex: 1,
            properties: {
              // 2025 数据故事风格 - 深邃紫蓝渐变
              background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 40%, #24243e 70%, #1a1a2e 100%)',
              position: 'fullscreen'
            },
            constraints: { modifiable: false }
          },
          {
            id: 'data-grid-pattern',
            type: 'fixed',
            name: '数据网格',
            zIndex: 1.3,
            properties: {
              // 数据可视化网格背景
              background: 'linear-gradient(rgba(78,205,196,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(78,205,196,0.03) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
              position: 'fullscreen'
            },
            constraints: { modifiable: false }
          },
          {
            id: 'glow-accent',
            type: 'fixed',
            name: '光效装饰',
            zIndex: 1.5,
            properties: {
              // 数据高亮光效
              background: 'radial-gradient(ellipse at 50% 50%, rgba(255,215,0,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(78,205,196,0.1) 0%, transparent 40%)',
              position: 'fullscreen'
            },
            constraints: { modifiable: false }
          }
        ],

        dynamic: [
          {
            id: 'hero-number',
            type: 'dynamic',
            name: '核心数字',
            zIndex: 2,
            source: 'data-extraction',
            properties: {
              position: 'center',
              fontSize: 72,
              fontWeight: 'bold',
              color: '#FFD700',
              animation: {
                type: 'count-up',
                duration: 2000,
                easing: 'ease-out'
              }
            },
            constraints: { modifiable: false }
          },
          {
            id: 'trend-indicator',
            type: 'dynamic',
            name: '趋势指示',
            zIndex: 3,
            source: 'trend-analysis',
            properties: {
              showArrow: true,
              showPercentage: true,
              positiveColor: '#34C759',
              negativeColor: '#FF3B30'
            },
            constraints: { modifiable: false }
          },
          {
            id: 'context-chart',
            type: 'dynamic',
            name: '背景图表',
            zIndex: 4,
            source: 'time-series',
            properties: {
              chartType: 'area',
              opacity: 0.3,
              color: '#4ECDC4',
              animation: {
                type: 'draw-area',
                duration: 1500
              }
            },
            constraints: { modifiable: false }
          }
        ],

        adjustable: [
          {
            id: 'data-context',
            type: 'adjustable',
            name: '数据说明',
            zIndex: 5,
            properties: {
              label: '',
              subtitle: '',
              showComparison: true
            },
            constraints: {
              modifiable: true,
              maxLength: { label: 20, subtitle: 40 }
            }
          }
        ]
      },

      metadata: {
        version: '1.0',
        author: 'VidSlide AI',
        tags: ['数据', '增长', '趋势', '可视化'],
        compatibility: ['data', 'analytics', 'storytelling']
      }
    })

    // ========== PPT风格模板 - 可直接Canvas渲染 ==========

    // PPT标题幻灯片模板
    this.templates.set('ppt-title-slide', {
      id: 'ppt-title-slide',
      name: 'PPT标题幻灯片',
      category: 'ppt-style',
      description: '大标题+副标题的经典PPT开场风格',

      layers: {
        fixed: [
          {
            id: 'gradient-bg',
            type: 'fixed',
            name: '渐变背景',
            zIndex: 1,
            properties: {
              position: 'fullscreen',
              backgroundColor: '#1a1a2e',
              // Canvas2D可渲染的纯色背景
              opacity: 1.0
            },
            constraints: { modifiable: false }
          },
          {
            id: 'accent-bar',
            type: 'fixed',
            name: '装饰条',
            zIndex: 2,
            properties: {
              position: { x: 0, y: 'center', offsetY: -50 },
              size: { width: 120, height: 6 },
              backgroundColor: '#FFD700',
              borderRadius: 3
            },
            constraints: { modifiable: false }
          }
        ],

        dynamic: [
          {
            id: 'main-title',
            type: 'dynamic',
            name: '主标题',
            zIndex: 3,
            source: 'keyword-analysis',
            properties: {
              position: 'center',
              fontSize: 64,
              fontWeight: 'bold',
              color: '#FFFFFF',
              textAlign: 'center',
              fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
              animation: {
                type: 'fade-in',
                duration: 500
              }
            },
            constraints: { modifiable: false }
          },
          {
            id: 'subtitle',
            type: 'dynamic',
            name: '副标题',
            zIndex: 4,
            source: 'content-analysis',
            properties: {
              position: { x: 'center', y: 'center', offsetY: 80 },
              fontSize: 28,
              fontWeight: 'normal',
              color: '#AAAAAA',
              textAlign: 'center',
              fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
              animation: {
                type: 'fade-in',
                duration: 500
              }
            },
            constraints: { modifiable: false }
          }
        ],

        adjustable: [
          {
            id: 'branding',
            type: 'adjustable',
            name: '品牌区域',
            zIndex: 5,
            properties: {
              position: { x: 'center', y: 'bottom', offsetY: -60 },
              fontSize: 16,
              color: '#666666'
            },
            constraints: {
              modifiable: true,
              maxLength: { text: 30 }
            }
          }
        ]
      },

      metadata: {
        version: '1.0',
        author: 'VidSlide AI',
        tags: ['PPT', '标题', '开场', '演示'],
        compatibility: ['presentation', 'speech', 'introduction'],
        renderEngine: 'canvas2d'
      }
    })

    // PPT要点列表模板
    this.templates.set('ppt-bullet-points', {
      id: 'ppt-bullet-points',
      name: 'PPT要点列表',
      category: 'ppt-style',
      description: '清晰的要点列表展示，适合干货内容',

      layers: {
        fixed: [
          {
            id: 'clean-bg',
            type: 'fixed',
            name: '简洁背景',
            zIndex: 1,
            properties: {
              position: 'fullscreen',
              backgroundColor: '#0D1117',
              opacity: 1.0
            },
            constraints: { modifiable: false }
          },
          {
            id: 'left-accent',
            type: 'fixed',
            name: '左侧装饰线',
            zIndex: 2,
            properties: {
              position: { x: 60, y: 100 },
              size: { width: 4, height: 400 },
              backgroundColor: '#4ECDC4',
              borderRadius: 2
            },
            constraints: { modifiable: false }
          },
          {
            id: 'header-area',
            type: 'fixed',
            name: '标题区域',
            zIndex: 2,
            properties: {
              position: { x: 80, y: 80 },
              size: { width: 600, height: 60 },
              backgroundColor: 'transparent'
            },
            constraints: { modifiable: false }
          }
        ],

        dynamic: [
          {
            id: 'section-title',
            type: 'dynamic',
            name: '章节标题',
            zIndex: 3,
            source: 'keyword-analysis',
            properties: {
              position: { x: 80, y: 100 },
              fontSize: 36,
              fontWeight: 'bold',
              color: '#FFFFFF',
              textAlign: 'left',
              fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif'
            },
            constraints: { modifiable: false }
          },
          {
            id: 'bullet-list',
            type: 'dynamic',
            name: '要点列表',
            zIndex: 4,
            source: 'keyword-extraction',
            properties: {
              position: { x: 100, y: 200 },
              layout: 'vertical-list',
              maxItems: 5,
              itemSpacing: 60,
              bulletStyle: 'circle',
              bulletColor: '#4ECDC4',
              fontSize: 24,
              color: '#E0E0E0',
              fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
              animation: {
                type: 'fade-in',
                duration: 300,
                stagger: 200
              }
            },
            constraints: { modifiable: false }
          }
        ],

        adjustable: [
          {
            id: 'page-number',
            type: 'adjustable',
            name: '页码',
            zIndex: 5,
            properties: {
              position: { x: 'right', y: 'bottom', offsetX: -40, offsetY: -40 },
              fontSize: 14,
              color: '#666666'
            },
            constraints: { modifiable: true }
          }
        ]
      },

      metadata: {
        version: '1.0',
        author: 'VidSlide AI',
        tags: ['PPT', '要点', '列表', '干货'],
        compatibility: ['education', 'tutorial', 'knowledge'],
        renderEngine: 'canvas2d'
      }
    })

    // PPT大数字展示模板
    this.templates.set('ppt-big-number', {
      id: 'ppt-big-number',
      name: 'PPT大数字展示',
      category: 'ppt-style',
      description: '突出展示核心数据和统计数字',

      layers: {
        fixed: [
          {
            id: 'dark-bg',
            type: 'fixed',
            name: '深色背景',
            zIndex: 1,
            properties: {
              position: 'fullscreen',
              backgroundColor: '#0f0c29',
              opacity: 1.0
            },
            constraints: { modifiable: false }
          },
          {
            id: 'glow-circle',
            type: 'fixed',
            name: '光晕圆圈',
            zIndex: 2,
            properties: {
              position: 'center',
              size: { width: 300, height: 300 },
              backgroundColor: 'rgba(255, 215, 0, 0.1)',
              borderRadius: 150,
              border: { width: 2, color: 'rgba(255, 215, 0, 0.3)' }
            },
            constraints: { modifiable: false }
          }
        ],

        dynamic: [
          {
            id: 'hero-number',
            type: 'dynamic',
            name: '核心数字',
            zIndex: 3,
            source: 'data-extraction',
            properties: {
              position: 'center',
              fontSize: 120,
              fontWeight: 'bold',
              color: '#FFD700',
              textAlign: 'center',
              fontFamily: 'DIN Alternate, Helvetica Neue, sans-serif',
              animation: {
                type: 'scale-in',
                duration: 600,
                from: { scale: 0.5 },
                to: { scale: 1.0 }
              }
            },
            constraints: { modifiable: false }
          },
          {
            id: 'number-label',
            type: 'dynamic',
            name: '数字标签',
            zIndex: 4,
            source: 'content-analysis',
            properties: {
              position: { x: 'center', y: 'center', offsetY: 100 },
              fontSize: 28,
              fontWeight: 'normal',
              color: '#AAAAAA',
              textAlign: 'center',
              fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif'
            },
            constraints: { modifiable: false }
          },
          {
            id: 'trend-indicator',
            type: 'dynamic',
            name: '趋势指示',
            zIndex: 5,
            source: 'trend-analysis',
            properties: {
              position: { x: 'center', y: 'center', offsetY: -80 },
              fontSize: 24,
              color: '#34C759',
              showArrow: true
            },
            constraints: { modifiable: false }
          }
        ],

        adjustable: [
          {
            id: 'context-text',
            type: 'adjustable',
            name: '上下文说明',
            zIndex: 6,
            properties: {
              position: { x: 'center', y: 'bottom', offsetY: -80 },
              fontSize: 18,
              color: '#888888',
              textAlign: 'center'
            },
            constraints: {
              modifiable: true,
              maxLength: { text: 50 }
            }
          }
        ]
      },

      metadata: {
        version: '1.0',
        author: 'VidSlide AI',
        tags: ['PPT', '数据', '数字', '统计'],
        compatibility: ['data', 'analytics', 'statistics'],
        renderEngine: 'canvas2d'
      }
    })

    // PPT左右对比模板
    this.templates.set('ppt-comparison', {
      id: 'ppt-comparison',
      name: 'PPT左右对比',
      category: 'ppt-style',
      description: '清晰的左右对比布局，适合优缺点分析',

      layers: {
        fixed: [
          {
            id: 'split-bg',
            type: 'fixed',
            name: '分割背景',
            zIndex: 1,
            properties: {
              position: 'fullscreen',
              backgroundColor: '#1a1a1a',
              opacity: 1.0
            },
            constraints: { modifiable: false }
          },
          {
            id: 'left-panel-bg',
            type: 'fixed',
            name: '左侧面板背景',
            zIndex: 2,
            properties: {
              position: { x: 40, y: 120 },
              size: { width: 440, height: 400 },
              backgroundColor: 'rgba(52, 199, 89, 0.1)',
              borderRadius: 16,
              border: { width: 2, color: 'rgba(52, 199, 89, 0.3)' }
            },
            constraints: { modifiable: false }
          },
          {
            id: 'right-panel-bg',
            type: 'fixed',
            name: '右侧面板背景',
            zIndex: 2,
            properties: {
              position: { x: 520, y: 120 },
              size: { width: 440, height: 400 },
              backgroundColor: 'rgba(255, 59, 48, 0.1)',
              borderRadius: 16,
              border: { width: 2, color: 'rgba(255, 59, 48, 0.3)' }
            },
            constraints: { modifiable: false }
          },
          {
            id: 'vs-badge',
            type: 'fixed',
            name: 'VS标识',
            zIndex: 3,
            properties: {
              position: { x: 460, y: 280 },
              size: { width: 80, height: 80 },
              backgroundColor: '#FFD700',
              borderRadius: 40,
              text: 'VS',
              fontSize: 24,
              fontWeight: 'bold',
              color: '#000000',
              textAlign: 'center'
            },
            constraints: { modifiable: false }
          }
        ],

        dynamic: [
          {
            id: 'comparison-title',
            type: 'dynamic',
            name: '对比标题',
            zIndex: 4,
            source: 'keyword-analysis',
            properties: {
              position: { x: 'center', y: 60 },
              fontSize: 32,
              fontWeight: 'bold',
              color: '#FFFFFF',
              textAlign: 'center',
              fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif'
            },
            constraints: { modifiable: false }
          },
          {
            id: 'left-title',
            type: 'dynamic',
            name: '左侧标题',
            zIndex: 5,
            source: 'comparison-analysis',
            properties: {
              position: { x: 60, y: 140 },
              fontSize: 24,
              fontWeight: 'bold',
              color: '#34C759',
              textAlign: 'left'
            },
            constraints: { modifiable: false }
          },
          {
            id: 'left-points',
            type: 'dynamic',
            name: '左侧要点',
            zIndex: 6,
            source: 'comparison-analysis',
            properties: {
              position: { x: 60, y: 200 },
              layout: 'vertical-list',
              maxItems: 4,
              itemSpacing: 50,
              bulletStyle: 'checkmark',
              bulletColor: '#34C759',
              fontSize: 18,
              color: '#E0E0E0'
            },
            constraints: { modifiable: false }
          },
          {
            id: 'right-title',
            type: 'dynamic',
            name: '右侧标题',
            zIndex: 5,
            source: 'comparison-analysis',
            properties: {
              position: { x: 540, y: 140 },
              fontSize: 24,
              fontWeight: 'bold',
              color: '#FF3B30',
              textAlign: 'left'
            },
            constraints: { modifiable: false }
          },
          {
            id: 'right-points',
            type: 'dynamic',
            name: '右侧要点',
            zIndex: 6,
            source: 'comparison-analysis',
            properties: {
              position: { x: 540, y: 200 },
              layout: 'vertical-list',
              maxItems: 4,
              itemSpacing: 50,
              bulletStyle: 'cross',
              bulletColor: '#FF3B30',
              fontSize: 18,
              color: '#E0E0E0'
            },
            constraints: { modifiable: false }
          }
        ],

        adjustable: [
          {
            id: 'conclusion',
            type: 'adjustable',
            name: '结论区域',
            zIndex: 7,
            properties: {
              position: { x: 'center', y: 'bottom', offsetY: -40 },
              fontSize: 20,
              color: '#FFD700',
              textAlign: 'center'
            },
            constraints: {
              modifiable: true,
              maxLength: { text: 60 }
            }
          }
        ]
      },

      metadata: {
        version: '1.0',
        author: 'VidSlide AI',
        tags: ['PPT', '对比', '分析', '优缺点'],
        compatibility: ['comparison', 'analysis', 'review'],
        renderEngine: 'canvas2d'
      }
    })

    // PPT金句/引用模板
    this.templates.set('ppt-quote', {
      id: 'ppt-quote',
      name: 'PPT金句引用',
      category: 'ppt-style',
      description: '突出展示金句、名言或核心观点',

      layers: {
        fixed: [
          {
            id: 'elegant-bg',
            type: 'fixed',
            name: '优雅背景',
            zIndex: 1,
            properties: {
              position: 'fullscreen',
              backgroundColor: '#16213e',
              opacity: 1.0
            },
            constraints: { modifiable: false }
          },
          {
            id: 'quote-mark-left',
            type: 'fixed',
            name: '左引号',
            zIndex: 2,
            properties: {
              position: { x: 60, y: 150 },
              text: '"',
              fontSize: 200,
              color: 'rgba(255, 215, 0, 0.2)',
              fontFamily: 'Georgia, serif'
            },
            constraints: { modifiable: false }
          },
          {
            id: 'quote-mark-right',
            type: 'fixed',
            name: '右引号',
            zIndex: 2,
            properties: {
              position: { x: 'right', y: 'bottom', offsetX: -100, offsetY: -150 },
              text: '"',
              fontSize: 200,
              color: 'rgba(255, 215, 0, 0.2)',
              fontFamily: 'Georgia, serif'
            },
            constraints: { modifiable: false }
          },
          {
            id: 'bottom-line',
            type: 'fixed',
            name: '底部装饰线',
            zIndex: 2,
            properties: {
              position: { x: 'center', y: 'bottom', offsetY: -100 },
              size: { width: 200, height: 3 },
              backgroundColor: '#FFD700',
              borderRadius: 1.5
            },
            constraints: { modifiable: false }
          }
        ],

        dynamic: [
          {
            id: 'quote-text',
            type: 'dynamic',
            name: '金句内容',
            zIndex: 3,
            source: 'keyword-analysis',
            properties: {
              position: 'center',
              fontSize: 36,
              fontWeight: 'normal',
              fontStyle: 'italic',
              color: '#FFFFFF',
              textAlign: 'center',
              fontFamily: 'PingFang SC, Microsoft YaHei, serif',
              lineHeight: 1.6,
              maxWidth: 800,
              animation: {
                type: 'fade-in',
                duration: 800
              }
            },
            constraints: { modifiable: false }
          },
          {
            id: 'quote-author',
            type: 'dynamic',
            name: '来源/作者',
            zIndex: 4,
            source: 'content-analysis',
            properties: {
              position: { x: 'center', y: 'bottom', offsetY: -60 },
              fontSize: 20,
              fontWeight: 'normal',
              color: '#888888',
              textAlign: 'center',
              fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif'
            },
            constraints: { modifiable: false }
          }
        ],

        adjustable: [
          {
            id: 'highlight-word',
            type: 'adjustable',
            name: '高亮词',
            zIndex: 5,
            properties: {
              highlightColor: '#FFD700',
              highlightStyle: 'underline'
            },
            constraints: { modifiable: true }
          }
        ]
      },

      metadata: {
        version: '1.0',
        author: 'VidSlide AI',
        tags: ['PPT', '金句', '引用', '名言'],
        compatibility: ['quote', 'highlight', 'emphasis'],
        renderEngine: 'canvas2d'
      }
    })

    console.log(`已注册 ${this.templates.size} 个预定义模板`)
  }

  /**
   * 设置约束系统
   */
  setupConstraints() {
    // 全局约束规则
    this.constraints.set('global', {
      maxLayers: 10,
      maxElementsPerLayer: 5,
      allowedTypes: ['fixed', 'dynamic', 'adjustable'],
      zIndexRange: { min: 1, max: 100 }
    })

    // 层级特定约束
    this.constraints.set('fixed', {
      modifiable: false,
      removable: false,
      properties: ['position', 'size', 'style', 'animation'],
      userAdjustable: ['position', 'size'] // 有限调整权限
    })

    this.constraints.set('dynamic', {
      modifiable: false,
      removable: false,
      properties: ['content', 'data', 'config'],
      userAdjustable: [] // 不允许用户调整
    })

    this.constraints.set('adjustable', {
      modifiable: true,
      removable: true,
      properties: ['content', 'style', 'position', 'config'],
      userAdjustable: ['content', 'style', 'position', 'config'] // 完全可调整
    })
  }

  /**
   * 获取模板定义
   * @param {string} templateId - 模板ID
   * @returns {Object|null} 模板定义
   */
  getTemplate(templateId) {
    return this.templates.get(templateId) || null
  }

  /**
   * 获取所有模板列表
   * @returns {Array} 模板列表
   */
  getAllTemplates() {
    return Array.from(this.templates.values())
  }

  /**
   * 根据内容类型推荐模板
   * @param {Object} contentAnalysis - 内容分析结果
   * @returns {Array} 推荐模板列表
   */
  recommendTemplates(contentAnalysis) {
    const { keywords = [], textDensity = 0, dataMentions = 0, hasVideo = false } = contentAnalysis
    const recommendations = []

    // 规则引擎匹配
    if (hasVideo && keywords.some(k => ['演讲', '演示', '讲解'].includes(k))) {
      recommendations.push({
        template: this.templates.get('picture-in-picture'),
        score: 0.9,
        reason: '视频内容包含演讲元素，适合画中画模板'
      })
    }

    if (dataMentions > 0.3) {
      recommendations.push({
        template: this.templates.get('info-card'),
        score: 0.8,
        reason: '内容包含大量数据信息，适合信息卡片展示'
      })
    }

    if (keywords.some(k => ['时间', '发展', '历程', '阶段'].includes(k))) {
      recommendations.push({
        template: this.templates.get('timeline'),
        score: 0.85,
        reason: '内容涉及时间发展，适合时间线展示'
      })
    }

    if (keywords.some(k => ['对比', '区别', '比较', '优缺点'].includes(k))) {
      recommendations.push({
        template: this.templates.get('split-screen'),
        score: 0.8,
        reason: '内容包含对比元素，适合分屏展示'
      })
    }

    if (keywords.length > 0) {
      recommendations.push({
        template: this.templates.get('keyword-highlight'),
        score: 0.7,
        reason: '内容包含关键词，适合高亮展示'
      })
    }

    // 按评分排序
    return recommendations.sort((a, b) => b.score - a.score).slice(0, 3) // 返回前3个推荐
  }

  /**
   * 验证模板修改是否符合约束
   * @param {string} templateId - 模板ID
   * @param {string} layerId - 层ID
   * @param {string} property - 属性名
   * @param {any} value - 新值
   * @returns {Object} 验证结果
   */
  validateModification(templateId, layerId, property, value) {
    const template = this.getTemplate(templateId)
    if (!template) {
      return { valid: false, reason: '模板不存在' }
    }

    // 查找层定义
    let layerDef = null
    for (const layerType of Object.keys(template.layers)) {
      const layer = template.layers[layerType].find(l => l.id === layerId)
      if (layer) {
        layerDef = { ...layer, layerType }
        break
      }
    }

    if (!layerDef) {
      return { valid: false, reason: '层不存在' }
    }

    // 检查层级约束
    const layerConstraints = this.constraints.get(layerDef.layerType)
    if (!layerConstraints) {
      return { valid: false, reason: '层级约束未定义' }
    }

    // 检查是否允许修改
    if (!layerConstraints.modifiable) {
      return {
        valid: false,
        reason: layerDef.constraints?.reason || `${layerDef.layerType}层不可修改`
      }
    }

    // 检查属性是否允许调整
    if (!layerConstraints.userAdjustable.includes(property)) {
      return {
        valid: false,
        reason: `属性 ${property} 不允许用户调整`
      }
    }

    // 检查特定约束
    if (layerDef.constraints) {
      const layerSpecificConstraints = layerDef.constraints

      // 位置约束
      if (property === 'position' && layerSpecificConstraints.position) {
        if (!layerSpecificConstraints.position.includes(value)) {
          return {
            valid: false,
            reason: `位置必须是: ${layerSpecificConstraints.position.join(', ')}`
          }
        }
      }

      // 大小约束
      if (property === 'size' && layerSpecificConstraints.size) {
        const { min, max } = layerSpecificConstraints.size
        if (value < min || value > max) {
          return {
            valid: false,
            reason: `尺寸必须在 ${min}-${max} 范围内`
          }
        }
      }

      // 长度约束
      if (layerSpecificConstraints.maxLength && layerSpecificConstraints.maxLength[property]) {
        if (value.length > layerSpecificConstraints.maxLength[property]) {
          return {
            valid: false,
            reason: `${property}长度不能超过 ${layerSpecificConstraints.maxLength[property]} 个字符`
          }
        }
      }
    }

    return { valid: true }
  }

  /**
   * 创建新的模板实例
   * @param {string} templateId - 模板ID
   * @param {Object} customizations - 自定义选项
   * @returns {Object} 模板实例
   */
  createTemplateInstance(templateId, customizations = {}) {
    const template = this.getTemplate(templateId)
    if (!template) {
      throw new Error(`模板 ${templateId} 不存在`)
    }

    // 深拷贝模板定义
    const instance = JSON.parse(JSON.stringify(template))

    // 应用自定义选项
    this.applyCustomizations(instance, customizations)

    // 设置实例元数据
    instance.instanceId = `instance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    instance.createdAt = new Date().toISOString()
    instance.version = '1.0'

    return instance
  }

  /**
   * 应用自定义选项
   * @param {Object} instance - 模板实例
   * @param {Object} customizations - 自定义选项
   */
  applyCustomizations(instance, customizations) {
    // 应用主题自定义
    if (customizations.theme) {
      instance.theme = { ...instance.theme, ...customizations.theme }
    }

    // 应用层级自定义（只允许adjustable层）
    if (customizations.layers) {
      for (const [layerId, properties] of Object.entries(customizations.layers)) {
        const layer = this.findLayer(instance, layerId)
        if (layer && layer.type === 'adjustable') {
          // 验证修改
          for (const [prop, value] of Object.entries(properties)) {
            const validation = this.validateModification(instance.id, layerId, prop, value)
            if (validation.valid) {
              layer.properties[prop] = value
            } else {
              console.warn(`自定义选项被拒绝: ${validation.reason}`)
            }
          }
        }
      }
    }
  }

  /**
   * 查找层定义
   * @param {Object} instance - 模板实例
   * @param {string} layerId - 层ID
   * @returns {Object|null} 层定义
   */
  findLayer(instance, layerId) {
    for (const layerType of Object.keys(instance.layers)) {
      const layer = instance.layers[layerType].find(l => l.id === layerId)
      if (layer) return layer
    }
    return null
  }

  /**
   * 获取模板统计信息
   * @returns {Object} 统计信息
   */
  getStatistics() {
    const stats = {
      totalTemplates: this.templates.size,
      templatesByCategory: {},
      layersByType: { fixed: 0, dynamic: 0, adjustable: 0 }
    }

    for (const template of this.templates.values()) {
      // 分类统计
      const category = template.category
      stats.templatesByCategory[category] = (stats.templatesByCategory[category] || 0) + 1

      // 层级统计
      for (const [layerType, layers] of Object.entries(template.layers)) {
        stats.layersByType[layerType] += layers.length
      }
    }

    return stats
  }

  /**
   * 清理资源
   */
  cleanup() {
    this.templates.clear()
    this.constraints.clear()
    this.initialized = false
  }
}

export default new TemplateArchitecture()
