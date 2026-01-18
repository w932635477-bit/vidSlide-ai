/**
 * product-showcase 模板
 */
export default {
  id: 'product-showcase',
  name: '产品展示模板',
  category: 'marketing',
  description: '突出产品特点和优势',

  layers: {
    fixed: [
      {
        id: 'product-background',
        type: 'fixed',
        name: '产品背景层',
        zIndex: 1,
        properties: {
          backgroundColor: '#000000',
          position: 'fullscreen'
        },
        constraints: { modifiable: false }
      },
      {
        id: 'product-spotlight',
        type: 'fixed',
        name: '产品聚光灯',
        zIndex: 2,
        properties: {
          position: 'center-left',
          size: { width: 500, height: 400 },
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.1) 0%, transparent 70%)',
          animation: {
            type: 'fade-in',
            duration: 0.8
          }
        },
        constraints: {
          position: ['center-left', 'center-right', 'center'],
          size: { min: 300, max: 800 }
        }
      }
    ],

    dynamic: [
      {
        id: 'product-features',
        type: 'dynamic',
        name: '产品特性层',
        zIndex: 3,
        source: 'product-analysis',
        properties: {
          features: [],
          specifications: [],
          autoHighlight: true
        },
        constraints: { modifiable: false }
      }
    ],

    adjustable: [
      {
        id: 'marketing-elements',
        type: 'adjustable',
        name: '营销元素层',
        zIndex: 4,
        properties: {
          showPrice: false,
          showCTA: true,
          brandColors: ['#007AFF', '#FFD700'],
          tagline: ''
        },
        constraints: {
          modifiable: true,
          maxLength: { tagline: 50 }
        }
      }
    ]
  },

  metadata: {
    version: '1.0',
    author: 'VidSlide AI',
    tags: ['产品', '展示', '营销'],
    compatibility: ['product', 'marketing', 'showcase']
  }
}
