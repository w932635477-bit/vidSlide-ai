/**
 * timeline 模板
 */
export default {
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
    }
