/**
 * traffic-acquisition 模板
 */
export default {
  id: 'traffic-acquisition',
  name: '流量获客模板',
  category: 'marketing',
  description: '展示流量转化和获客策略的专业模板',

  layers: {
    fixed: [
      {
        id: 'dark-background',
        type: 'fixed',
        name: '深色背景',
        zIndex: 1,
        properties: {
          // 2025专业深蓝渐变 - 商务科技感
          background: 'linear-gradient(135deg, #0D1117 0%, #161B22 50%, #21262D 100%)',
          position: 'fullscreen'
        },
        constraints: { modifiable: false }
      },
      {
        id: 'grid-overlay',
        type: 'fixed',
        name: '网格叠加层',
        zIndex: 1.5,
        properties: {
          // 科技感网格背景
          background:
            'linear-gradient(rgba(45,212,191,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(45,212,191,0.03) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          position: 'fullscreen'
        },
        constraints: { modifiable: false }
      },
      {
        id: 'funnel-container',
        type: 'fixed',
        name: '漏斗容器',
        zIndex: 2,
        properties: {
          position: 'center-left',
          size: { width: '45%', height: '70%' },
          background: 'transparent'
        },
        constraints: { modifiable: false }
      }
    ],

    dynamic: [
      {
        id: 'traffic-funnel',
        type: 'dynamic',
        name: '流量漏斗',
        zIndex: 3,
        source: 'data-analysis',
        properties: {
          funnelStages: ['曝光', '点击', '互动', '转化', '成交'],
          colors: ['#FF6B6B', '#FFE66D', '#4ECDC4', '#45B7D1', '#96CEB4'],
          animation: {
            type: 'funnel-fill',
            duration: 2000
          }
        },
        constraints: { modifiable: false }
      },
      {
        id: 'conversion-stats',
        type: 'dynamic',
        name: '转化数据',
        zIndex: 4,
        source: 'data-extraction',
        properties: {
          position: 'center-right',
          layout: 'stats-cards',
          animation: {
            type: 'count-up',
            duration: 1500
          }
        },
        constraints: { modifiable: false }
      }
    ],

    adjustable: [
      {
        id: 'strategy-tips',
        type: 'adjustable',
        name: '策略提示',
        zIndex: 5,
        properties: {
          tips: [],
          showIcons: true,
          theme: 'dark'
        },
        constraints: {
          modifiable: true,
          maxItems: 4
        }
      }
    ]
  },

  metadata: {
    version: '1.0',
    author: 'VidSlide AI',
    tags: ['流量', '获客', '转化', '漏斗'],
    compatibility: ['marketing', 'analytics', 'business']
  }
}
