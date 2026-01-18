/**
 * document-display 模板
 */
export default {
  id: 'document-display',
  name: '文件展示模板',
  category: 'document',
  description: '3D效果展示文档和文件内容',

  layers: {
    fixed: [
      {
        id: 'document-background',
        type: 'fixed',
        name: '文档背景层',
        zIndex: 1,
        properties: {
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          position: 'fullscreen'
        },
        constraints: { modifiable: false }
      },
      {
        id: 'document-stack',
        type: 'fixed',
        name: '文档堆叠容器',
        zIndex: 2,
        properties: {
          position: 'center',
          size: { width: '60%', height: '70%' },
          perspective: 1000,
          transformStyle: 'preserve-3d'
        },
        constraints: { modifiable: false }
      }
    ],

    dynamic: [
      {
        id: 'document-content',
        type: 'dynamic',
        name: '文档内容层',
        zIndex: 3,
        source: 'document-analysis',
        properties: {
          documents: [],
          maxDocuments: 4,
          overlapOffset: 30,
          rotation: { x: 5, y: 10 }
        },
        constraints: { modifiable: false }
      }
    ],

    adjustable: [
      {
        id: 'document-styling',
        type: 'adjustable',
        name: '文档样式层',
        zIndex: 4,
        properties: {
          shadowIntensity: 0.5,
          borderRadius: 4,
          showHighlights: true,
          highlightColor: '#FFD700'
        },
        constraints: {
          modifiable: true,
          range: { shadowIntensity: [0, 1], borderRadius: [0, 16] }
        }
      }
    ]
  },

  metadata: {
    version: '1.0',
    author: 'VidSlide AI',
    tags: ['文档', '文件', '展示'],
    compatibility: ['document', 'presentation', 'education']
  }
}
