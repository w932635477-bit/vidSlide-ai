/**
 * ppt-big-number 模板
 */
export default {
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
    }
