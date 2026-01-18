/**
 * minimalist 模板
 */
export default {
  id: 'minimalist',
  name: '简洁模板',
  category: 'minimal',
  description: '极简设计，突出核心内容',

  layers: {
    fixed: [
      {
        id: 'clean-background',
        type: 'fixed',
        name: '干净背景层',
        zIndex: 1,
        properties: {
          backgroundColor: '#FFFFFF',
          position: 'fullscreen'
        },
        constraints: { modifiable: false }
      }
    ],

    dynamic: [
      {
        id: 'core-content',
        type: 'dynamic',
        name: '核心内容层',
        zIndex: 2,
        source: 'content-analysis',
        properties: {
          content: '',
          autoLayout: true,
          maxElements: 3
        },
        constraints: { modifiable: false }
      }
    ],

    adjustable: [
      {
        id: 'minimal-customization',
        type: 'adjustable',
        name: '极简自定义层',
        zIndex: 3,
        properties: {
          fontFamily: 'Helvetica Neue',
          textColor: '#1D1D1F',
          accentColor: '#007AFF',
          spacing: 'generous'
        },
        constraints: {
          modifiable: true,
          limitedOptions: true
        }
      }
    ]
  },

  metadata: {
    version: '1.0',
    author: 'VidSlide AI',
    tags: ['简洁', '极简', '清晰'],
    compatibility: ['text', 'presentation', 'education']
  }
}
