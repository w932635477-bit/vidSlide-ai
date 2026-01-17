/**
 * educational 模板
 */
export default {
      id: 'educational',
      name: '教育模板',
      category: 'education',
      description: '适合教学内容的结构化展示',

      layers: {
        fixed: [
          {
            id: 'lesson-background',
            type: 'fixed',
            name: '课程背景层',
            zIndex: 1,
            properties: {
              backgroundColor: '#F8F9FA',
              position: 'fullscreen'
            },
            constraints: { modifiable: false }
          },
          {
            id: 'content-area',
            type: 'fixed',
            name: '内容区域',
            zIndex: 2,
            properties: {
              position: 'center',
              size: { width: '80%', height: '70%' },
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              shadow: '0 8px 32px rgba(0,0,0,0.1)'
            },
            constraints: { modifiable: false }
          }
        ],

        dynamic: [
          {
            id: 'educational-content',
            type: 'dynamic',
            name: '教育内容层',
            zIndex: 3,
            source: 'educational-analysis',
            properties: {
              learningObjectives: [],
              keyPoints: [],
              autoStructure: true
            },
            constraints: { modifiable: false }
          }
        ],

        adjustable: [
          {
            id: 'teaching-aids',
            type: 'adjustable',
            name: '教学辅助层',
            zIndex: 4,
            properties: {
              showObjectives: true,
              highlightKeyPoints: true,
              addQuizzes: false,
              theme: 'educational'
            },
            constraints: {
              modifiable: true
            }
          }
        ]
      },

      metadata: {
        version: '1.0',
        author: 'VidSlide AI',
        tags: ['教育', '教学', '学习'],
        compatibility: ['education', 'training', 'course']
      }
    }
