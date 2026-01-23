/**
 * chart-analysis 模板
 */
export default {
  id: 'chart-analysis',
  name: '图表分析模板',
  category: 'data',
  description: '智能匹配和展示数据图表',

  layers: {
    fixed: [
      {
        id: 'chart-background',
        type: 'fixed',
        name: '图表背景层',
        zIndex: 1,
        properties: {
          backgroundColor: '#1A1A1A',
          borderRadius: 8,
          padding: 20
        },
        constraints: { modifiable: false }
      },
      {
        id: 'chart-container',
        type: 'fixed',
        name: '图表容器',
        zIndex: 2,
        properties: {
          size: { width: '70%', height: '60%' },
          position: 'center',
          backgroundColor: '#FFFFFF',
          borderRadius: 4,
          shadow: '0 4px 12px rgba(0,0,0,0.3)'
        },
        constraints: { modifiable: false }
      }
    ],

    dynamic: [
      {
        id: 'data-visualization',
        type: 'dynamic',
        name: '数据可视化层',
        zIndex: 3,
        source: 'data-analysis',
        properties: {
          chartType: 'auto', // bar, line, pie, etc.
          data: [],
          autoScale: true
        },
        constraints: { modifiable: false }
      }
    ],

    adjustable: [
      {
        id: 'chart-customization',
        type: 'adjustable',
        name: '图表自定义层',
        zIndex: 4,
        properties: {
          title: '',
          colors: ['#007AFF', '#FFD700', '#FF6B6B'],
          showLegend: true,
          showGrid: false
        },
        constraints: {
          modifiable: true,
          maxLength: { title: 30 }
        }
      }
    ]
  },

  metadata: {
    version: '1.0',
    author: 'VidSlide AI',
    tags: ['图表', '数据', '分析'],
    compatibility: ['data', 'statistics', 'analytics']
  }
}
