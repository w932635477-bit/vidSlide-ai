/**
 * comparison-review 模板
 */
export default {
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
    }
