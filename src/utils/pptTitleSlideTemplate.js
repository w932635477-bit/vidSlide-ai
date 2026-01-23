/**
 * ppt-title-slide 模板
 */
export default {
  id: 'ppt-title-slide',
  name: 'PPT标题幻灯片',
  category: 'ppt-style',
  description: '大标题+副标题的经典PPT开场风格',

  layers: {
    fixed: [
      {
        id: 'gradient-bg',
        type: 'fixed',
        name: '渐变背景',
        zIndex: 1,
        properties: {
          position: 'fullscreen',
          backgroundColor: '#1a1a2e',
          // Canvas2D可渲染的纯色背景
          opacity: 1.0
        },
        constraints: { modifiable: false }
      },
      {
        id: 'accent-bar',
        type: 'fixed',
        name: '装饰条',
        zIndex: 2,
        properties: {
          position: { x: 0, y: 'center', offsetY: -50 },
          size: { width: 120, height: 6 },
          backgroundColor: '#FFD700',
          borderRadius: 3
        },
        constraints: { modifiable: false }
      }
    ],

    dynamic: [
      {
        id: 'main-title',
        type: 'dynamic',
        name: '主标题',
        zIndex: 3,
        source: 'keyword-analysis',
        properties: {
          position: 'center',
          fontSize: 64,
          fontWeight: 'bold',
          color: '#FFFFFF',
          textAlign: 'center',
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          animation: {
            type: 'fade-in',
            duration: 500
          }
        },
        constraints: { modifiable: false }
      },
      {
        id: 'subtitle',
        type: 'dynamic',
        name: '副标题',
        zIndex: 4,
        source: 'content-analysis',
        properties: {
          position: { x: 'center', y: 'center', offsetY: 80 },
          fontSize: 28,
          fontWeight: 'normal',
          color: '#AAAAAA',
          textAlign: 'center',
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          animation: {
            type: 'fade-in',
            duration: 500
          }
        },
        constraints: { modifiable: false }
      }
    ],

    adjustable: [
      {
        id: 'branding',
        type: 'adjustable',
        name: '品牌区域',
        zIndex: 5,
        properties: {
          position: { x: 'center', y: 'bottom', offsetY: -60 },
          fontSize: 16,
          color: '#666666'
        },
        constraints: {
          modifiable: true,
          maxLength: { text: 30 }
        }
      }
    ]
  },

  metadata: {
    version: '1.0',
    author: 'VidSlide AI',
    tags: ['PPT', '标题', '开场', '演示'],
    compatibility: ['presentation', 'speech', 'introduction'],
    renderEngine: 'canvas2d'
  }
}
