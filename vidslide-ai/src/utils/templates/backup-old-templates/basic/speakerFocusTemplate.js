/**
 * speaker-focus 模板
 */
export default {
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
    }
