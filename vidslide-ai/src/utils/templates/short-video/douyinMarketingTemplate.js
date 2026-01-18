/**
 * douyin-marketing 模板
 */
export default {
  id: 'douyin-marketing',
  name: '抖音营销模板',
  category: 'short-video',
  description: '适合抖音、快手等短视频平台的营销内容展示',

  layers: {
    fixed: [
      {
        id: 'gradient-background',
        type: 'fixed',
        name: '渐变背景层',
        zIndex: 1,
        properties: {
          // 2025 TikTok风格：深色底+霓虹渐变
          background: 'linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #16213e 100%)',
          position: 'fullscreen'
        },
        constraints: { modifiable: false }
      },
      {
        id: 'neon-glow',
        type: 'fixed',
        name: '霓虹光效层',
        zIndex: 1.5,
        properties: {
          // TikTok标志性青粉渐变光效
          background:
            'radial-gradient(ellipse at 30% 20%, rgba(0,217,255,0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(255,0,110,0.15) 0%, transparent 50%)',
          position: 'fullscreen'
        },
        constraints: { modifiable: false }
      },
      {
        id: 'brand-watermark',
        type: 'fixed',
        name: '品牌水印',
        zIndex: 2,
        properties: {
          position: { x: 'right', y: 'top', offsetX: -20, offsetY: 20 },
          opacity: 0.8,
          size: { width: 80, height: 30 }
        },
        constraints: { modifiable: false }
      }
    ],

    dynamic: [
      {
        id: 'hook-text',
        type: 'dynamic',
        name: '钩子文案层',
        zIndex: 3,
        source: 'keyword-analysis',
        properties: {
          position: 'top-center',
          fontSize: 32,
          fontWeight: 'bold',
          color: '#FFFFFF',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
          animation: {
            type: 'bounce-in',
            duration: 0.5
          }
        },
        constraints: { modifiable: false }
      },
      {
        id: 'keyword-bullets',
        type: 'dynamic',
        name: '关键词要点',
        zIndex: 4,
        source: 'keyword-extraction',
        properties: {
          layout: 'vertical-list',
          maxItems: 5,
          bulletStyle: 'emoji',
          animation: {
            type: 'stagger-fade',
            stagger: 200
          }
        },
        constraints: { modifiable: false }
      }
    ],

    adjustable: [
      {
        id: 'cta-button',
        type: 'adjustable',
        name: 'CTA按钮层',
        zIndex: 5,
        properties: {
          text: '点击了解更多',
          position: 'bottom-center',
          backgroundColor: '#FF2D55',
          borderRadius: 25,
          animation: { type: 'pulse', duration: 1.5 }
        },
        constraints: {
          modifiable: true,
          maxLength: { text: 10 }
        }
      }
    ]
  },

  metadata: {
    version: '1.0',
    author: 'VidSlide AI',
    tags: ['抖音', '短视频', '营销', '获客'],
    compatibility: ['short-video', 'marketing', 'social-media']
  }
}
