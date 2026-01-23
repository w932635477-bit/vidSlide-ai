/**
 * ad-performance 模板
 */
export default {
  id: 'ad-performance',
  name: '投放效果模板',
  category: 'advertising',
  description: '展示广告投放效果和ROI数据',

  layers: {
    fixed: [
      {
        id: 'dashboard-background',
        type: 'fixed',
        name: '仪表盘背景',
        zIndex: 1,
        properties: {
          // 2025专业数据仪表盘风格 - 深蓝紫渐变
          background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
          position: 'fullscreen'
        },
        constraints: { modifiable: false }
      },
      {
        id: 'data-grid-overlay',
        type: 'fixed',
        name: '数据网格层',
        zIndex: 1.5,
        properties: {
          // 数据可视化网格背景
          background:
            'linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          position: 'fullscreen'
        },
        constraints: { modifiable: false }
      },
      {
        id: 'header-bar',
        type: 'fixed',
        name: '顶部标题栏',
        zIndex: 2,
        properties: {
          position: 'top',
          height: 60,
          // 玻璃态顶栏
          background: 'linear-gradient(90deg, rgba(99,102,241,0.1) 0%, rgba(168,85,247,0.1) 100%)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(168,85,247,0.2)'
        },
        constraints: { modifiable: false }
      }
    ],

    dynamic: [
      {
        id: 'roi-display',
        type: 'dynamic',
        name: 'ROI展示',
        zIndex: 3,
        source: 'data-analysis',
        properties: {
          position: 'top-left',
          size: { width: '30%', height: '40%' },
          chartType: 'gauge',
          colors: ['#FF6B6B', '#FFE66D', '#4ECDC4'],
          animation: {
            type: 'gauge-fill',
            duration: 1500
          }
        },
        constraints: { modifiable: false }
      },
      {
        id: 'cost-breakdown',
        type: 'dynamic',
        name: '成本分解',
        zIndex: 4,
        source: 'data-extraction',
        properties: {
          position: 'top-right',
          chartType: 'pie',
          showLegend: true
        },
        constraints: { modifiable: false }
      },
      {
        id: 'trend-chart',
        type: 'dynamic',
        name: '趋势图表',
        zIndex: 5,
        source: 'time-series',
        properties: {
          position: 'bottom',
          chartType: 'line',
          showGrid: true,
          animation: {
            type: 'draw-line',
            duration: 2000
          }
        },
        constraints: { modifiable: false }
      }
    ],

    adjustable: [
      {
        id: 'metric-labels',
        type: 'adjustable',
        name: '指标标签',
        zIndex: 6,
        properties: {
          metrics: ['CPM', 'CPC', 'CTR', 'CVR'],
          showValues: true,
          theme: 'neon'
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
    tags: ['投放', '广告', 'ROI', '数据'],
    compatibility: ['advertising', 'analytics', 'performance']
  }
}
