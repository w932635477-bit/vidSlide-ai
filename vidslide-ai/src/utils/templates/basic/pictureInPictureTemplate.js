/**
 * picture-in-picture 模板
 */
export default {
  id: 'picture-in-picture',
  name: '画中画模板',
  category: 'overlay',
  description: '视频画面中叠加小窗口显示演讲者',

  // 层级结构定义
  layers: {
    fixed: [
      {
        id: 'background-overlay',
        type: 'fixed',
        name: '背景遮罩层',
        zIndex: 1,
        properties: {
          backgroundColor: '#000000',
          opacity: 0.4,
          position: 'fullscreen'
        },
        constraints: {
          modifiable: false,
          reason: '保持视觉层次'
        }
      },
      {
        id: 'pip-container',
        type: 'fixed',
        name: '画中画容器',
        zIndex: 2,
        properties: {
          position: { x: 'right', y: 'top', offsetX: -35, offsetY: 35 },
          size: { width: 320, height: 180 },
          borderRadius: 100,
          border: { width: 2, color: '#FFFFFF' },
          animation: {
            type: 'fade-in',
            duration: 0.2,
            easing: 'ease-in-out'
          }
        },
        constraints: {
          position: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
          size: { min: 160, max: 400 },
          modifiable: true,
          userAdjustable: ['position', 'size']
        }
      }
    ],

    dynamic: [
      {
        id: 'video-content',
        type: 'dynamic',
        name: '视频内容层',
        zIndex: 3,
        source: 'ai-analysis',
        properties: {
          content: null, // 由AI分析填充
          fit: 'cover',
          autoCrop: true
        },
        constraints: {
          modifiable: false,
          reason: 'AI生成内容保持完整性'
        }
      },
      {
        id: 'face-tracking',
        type: 'dynamic',
        name: '人脸跟踪层',
        zIndex: 4,
        source: 'face-detection',
        properties: {
          trackingEnabled: true,
          smoothing: 0.8,
          confidence: 0.8
        },
        constraints: {
          modifiable: false,
          reason: '技术功能层不可修改'
        }
      }
    ],

    adjustable: [
      {
        id: 'user-overlay',
        type: 'adjustable',
        name: '用户叠加层',
        zIndex: 5,
        properties: {
          elements: [],
          maxElements: 3
        },
        constraints: {
          modifiable: true,
          userAdjustable: ['elements', 'position', 'style']
        }
      }
    ]
  },

  // 模板元数据
  metadata: {
    version: '1.0',
    author: 'VidSlide AI',
    tags: ['视频', '演讲', '演示'],
    compatibility: ['video', 'presentation']
  }
}
