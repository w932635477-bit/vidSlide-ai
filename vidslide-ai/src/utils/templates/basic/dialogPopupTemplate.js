/**
 * dialog-popup 模板
 */
export default {
  id: 'dialog-popup',
  name: '对话弹窗模板',
  category: 'overlay',
  description: '右下角弹出显示关键词和重要信息',

  layers: {
    fixed: [
      {
        id: 'popup-container',
        type: 'fixed',
        name: '弹窗容器',
        zIndex: 1,
        properties: {
          position: { x: 'right', y: 'bottom', offsetX: -20, offsetY: -20 },
          size: { width: 300, height: 120 },
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderRadius: 8,
          border: { width: 1, color: '#FFD700' },
          animation: {
            type: 'slide-up',
            duration: 0.3,
            easing: 'ease-out'
          }
        },
        constraints: {
          position: ['bottom-right', 'bottom-left', 'top-right', 'top-left'],
          size: { min: 200, max: 400 }
        }
      }
    ],

    dynamic: [
      {
        id: 'keyword-content',
        type: 'dynamic',
        name: '关键词内容层',
        zIndex: 2,
        source: 'keyword-analysis',
        properties: {
          keyword: '',
          importance: 0,
          autoSize: true
        },
        constraints: { modifiable: false }
      }
    ],

    adjustable: [
      {
        id: 'styling-options',
        type: 'adjustable',
        name: '样式选项层',
        zIndex: 3,
        properties: {
          fontSize: 16,
          color: '#FFFFFF',
          showIcon: true,
          autoHide: true,
          duration: 3
        },
        constraints: {
          modifiable: true,
          range: { fontSize: [12, 24], duration: [2, 10] }
        }
      }
    ]
  },

  metadata: {
    version: '1.0',
    author: 'VidSlide AI',
    tags: ['弹窗', '关键词', '强调'],
    compatibility: ['text', 'speech', 'presentation']
  }
}
