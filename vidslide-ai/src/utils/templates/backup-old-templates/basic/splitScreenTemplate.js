/**
 * split-screen 模板
 */
export default {
      id: 'split-screen',
      name: '分屏对比模板',
      category: 'comparison',
      description: '左右分屏展示对比内容',

      layers: {
        fixed: [
          {
            id: 'split-line',
            type: 'fixed',
            name: '分屏分割线',
            zIndex: 1,
            properties: {
              position: 'center-vertical',
              style: { width: 2, color: '#FFFFFF' },
              animation: {
                type: 'slide-in',
                duration: 0.3,
                direction: 'center'
              }
            },
            constraints: { modifiable: false }
          },
          {
            id: 'left-panel',
            type: 'fixed',
            name: '左侧面板',
            zIndex: 2,
            properties: {
              position: 'left-half',
              backgroundColor: 'transparent'
            },
            constraints: { modifiable: false }
          },
          {
            id: 'right-panel',
            type: 'fixed',
            name: '右侧面板',
            zIndex: 3,
            properties: {
              position: 'right-half',
              backgroundColor: 'transparent'
            },
            constraints: { modifiable: false }
          }
        ],

        dynamic: [
          {
            id: 'content-distribution',
            type: 'dynamic',
            name: '内容分配层',
            zIndex: 4,
            source: 'comparison-analysis',
            properties: {
              leftContent: null,
              rightContent: null,
              syncAnimation: true
            },
            constraints: { modifiable: false }
          }
        ],

        adjustable: [
          {
            id: 'panel-customization',
            type: 'adjustable',
            name: '面板自定义层',
            zIndex: 5,
            properties: {
              leftTitle: '',
              rightTitle: '',
              showLabels: true
            },
            constraints: {
              modifiable: true,
              maxLength: { title: 15 }
            }
          }
        ]
      },

      metadata: {
        version: '1.0',
        author: 'VidSlide AI',
        tags: ['对比', '分屏', '分析'],
        compatibility: ['comparison', 'before-after', 'pros-cons']
      }
    }
