/**
 * fan-engagement 模板
 */
export default {
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
    }
