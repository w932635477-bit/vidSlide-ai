/**
 * ppt-bullet-points 模板
 */
export default {
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
    }
