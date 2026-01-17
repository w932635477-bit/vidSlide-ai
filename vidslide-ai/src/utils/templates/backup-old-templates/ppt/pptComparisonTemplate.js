/**
 * ppt-comparison 模板
 */
export default {
      id: 'ppt-comparison',
      name: 'PPT左右对比',
      category: 'ppt-style',
      description: '清晰的左右对比布局，适合优缺点分析',

      layers: {
        fixed: [
          {
            id: 'split-bg',
            type: 'fixed',
            name: '分割背景',
            zIndex: 1,
            properties: {
              position: 'fullscreen',
              backgroundColor: '#1a1a1a',
              opacity: 1.0
            },
            constraints: { modifiable: false }
          },
          {
            id: 'left-panel-bg',
            type: 'fixed',
            name: '左侧面板背景',
            zIndex: 2,
            properties: {
              position: { x: 40, y: 120 },
              size: { width: 440, height: 400 },
              backgroundColor: 'rgba(52, 199, 89, 0.1)',
              borderRadius: 16,
              border: { width: 2, color: 'rgba(52, 199, 89, 0.3)' }
            },
            constraints: { modifiable: false }
          },
          {
            id: 'right-panel-bg',
            type: 'fixed',
            name: '右侧面板背景',
            zIndex: 2,
            properties: {
              position: { x: 520, y: 120 },
              size: { width: 440, height: 400 },
              backgroundColor: 'rgba(255, 59, 48, 0.1)',
              borderRadius: 16,
              border: { width: 2, color: 'rgba(255, 59, 48, 0.3)' }
            },
            constraints: { modifiable: false }
          },
          {
            id: 'vs-badge',
            type: 'fixed',
            name: 'VS标识',
            zIndex: 3,
            properties: {
              position: { x: 460, y: 280 },
              size: { width: 80, height: 80 },
              backgroundColor: '#FFD700',
              borderRadius: 40,
              text: 'VS',
              fontSize: 24,
              fontWeight: 'bold',
              color: '#000000',
              textAlign: 'center'
            },
            constraints: { modifiable: false }
          }
        ],

        dynamic: [
          {
            id: 'comparison-title',
            type: 'dynamic',
            name: '对比标题',
            zIndex: 4,
            source: 'keyword-analysis',
            properties: {
              position: { x: 'center', y: 60 },
              fontSize: 32,
              fontWeight: 'bold',
              color: '#FFFFFF',
              textAlign: 'center',
              fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif'
            },
            constraints: { modifiable: false }
          },
          {
            id: 'left-title',
            type: 'dynamic',
            name: '左侧标题',
            zIndex: 5,
            source: 'comparison-analysis',
            properties: {
              position: { x: 60, y: 140 },
              fontSize: 24,
              fontWeight: 'bold',
              color: '#34C759',
              textAlign: 'left'
            },
            constraints: { modifiable: false }
          },
          {
            id: 'left-points',
            type: 'dynamic',
            name: '左侧要点',
            zIndex: 6,
            source: 'comparison-analysis',
            properties: {
              position: { x: 60, y: 200 },
              layout: 'vertical-list',
              maxItems: 4,
              itemSpacing: 50,
              bulletStyle: 'checkmark',
              bulletColor: '#34C759',
              fontSize: 18,
              color: '#E0E0E0'
            },
            constraints: { modifiable: false }
          },
          {
            id: 'right-title',
            type: 'dynamic',
            name: '右侧标题',
            zIndex: 5,
            source: 'comparison-analysis',
            properties: {
              position: { x: 540, y: 140 },
              fontSize: 24,
              fontWeight: 'bold',
              color: '#FF3B30',
              textAlign: 'left'
            },
            constraints: { modifiable: false }
          },
          {
            id: 'right-points',
            type: 'dynamic',
            name: '右侧要点',
            zIndex: 6,
            source: 'comparison-analysis',
            properties: {
              position: { x: 540, y: 200 },
              layout: 'vertical-list',
              maxItems: 4,
              itemSpacing: 50,
              bulletStyle: 'cross',
              bulletColor: '#FF3B30',
              fontSize: 18,
              color: '#E0E0E0'
            },
            constraints: { modifiable: false }
          }
        ],

        adjustable: [
          {
            id: 'conclusion',
            type: 'adjustable',
            name: '结论区域',
            zIndex: 7,
            properties: {
              position: { x: 'center', y: 'bottom', offsetY: -40 },
              fontSize: 20,
              color: '#FFD700',
              textAlign: 'center'
            },
            constraints: {
              modifiable: true,
              maxLength: { text: 60 }
            }
          }
        ]
      },

      metadata: {
        version: '1.0',
        author: 'VidSlide AI',
        tags: ['PPT', '对比', '分析', '优缺点'],
        compatibility: ['comparison', 'analysis', 'review'],
        renderEngine: 'canvas2d'
      }
    }
