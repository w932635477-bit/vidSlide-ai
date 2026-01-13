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
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 3) // 返回前3个推荐
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