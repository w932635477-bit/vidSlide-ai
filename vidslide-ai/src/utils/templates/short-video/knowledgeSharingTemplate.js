/**
 * knowledge-sharing 模板
 */
export default {
  id: 'knowledge-sharing',
  name: '干货分享模板',
  category: 'content',
  description: '适合知识分享和干货内容展示',

  layers: {
    fixed: [
      {
        id: 'clean-background',
        type: 'fixed',
        name: '简洁背景',
        zIndex: 1,
        properties: {
          // 2025 干货分享风格 - 清新蓝绿渐变
          background: 'linear-gradient(135deg, #1fa2ff 0%, #12d8fa 50%, #a6ffcb 100%)',
          position: 'fullscreen'
        },
        constraints: { modifiable: false }
      },
      {
        id: 'content-card',
        type: 'fixed',
        name: '内容卡片',
        zIndex: 2,
        properties: {
          position: 'center',
          size: { width: '85%', height: '75%' },
          // 玻璃态卡片效果
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: 24,
          border: '1px solid rgba(255,255,255,0.5)',
          shadow: '0 20px 60px rgba(31,162,255,0.2), 0 10px 30px rgba(0,0,0,0.1)'
        },
        constraints: { modifiable: false }
      }
    ],

    dynamic: [
      {
        id: 'title-section',
        type: 'dynamic',
        name: '标题区域',
        zIndex: 3,
        source: 'content-analysis',
        properties: {
          position: 'top',
          fontSize: 28,
          fontWeight: 'bold',
          color: '#1D1D1F',
          icon: '💡'
        },
        constraints: { modifiable: false }
      },
      {
        id: 'key-points',
        type: 'dynamic',
        name: '要点列表',
        zIndex: 4,
        source: 'keyword-extraction',
        properties: {
          layout: 'numbered-list',
          maxPoints: 5,
          bulletStyle: 'number-circle',
          animation: {
            type: 'reveal',
            stagger: 300
          }
        },
        constraints: { modifiable: false }
      }
    ],

    adjustable: [
      {
        id: 'summary-footer',
        type: 'adjustable',
        name: '总结区域',
        zIndex: 5,
        properties: {
          summary: '',
          showSavePrompt: true,
          theme: 'light'
        },
        constraints: {
          modifiable: true,
          maxLength: { summary: 50 }
        }
      }
    ]
  },

  metadata: {
    version: '1.0',
    author: 'VidSlide AI',
    tags: ['干货', '知识', '分享', '教程'],
    compatibility: ['education', 'tutorial', 'knowledge']
  }
}
