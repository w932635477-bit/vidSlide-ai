/**
 * info-card 模板
 */
export default {
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
    }
