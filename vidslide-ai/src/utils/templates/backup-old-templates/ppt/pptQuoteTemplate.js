/**
 * ppt-quote 模板
 */
export default {
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
    }
