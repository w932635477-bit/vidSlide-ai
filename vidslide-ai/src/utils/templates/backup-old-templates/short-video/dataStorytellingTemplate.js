/**
 * data-storytelling 模板
 */
export default {
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
    }
