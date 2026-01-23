/**
 * keyword-highlight 模板
 */
export default {
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
}
