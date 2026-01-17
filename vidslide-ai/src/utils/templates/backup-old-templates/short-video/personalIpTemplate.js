/**
 * personal-ip 模板
 */
export default {
      id: 'personal-ip',
      name: 'IP打造模板',
      category: 'personal-brand',
      description: '展示个人IP和品牌形象',

      layers: {
        fixed: [
          {
            id: 'brand-background',
            type: 'fixed',
            name: '品牌背景',
            zIndex: 1,
            properties: {
              // 2025 IP打造风格 - 神秘黑紫渐变
              background: 'linear-gradient(135deg, #0D0D0D 0%, #3B0A45 40%, #6A2C91 70%, #B84E8C 100%)',
              position: 'fullscreen'
            },
            constraints: { modifiable: false }
          },
          {
            id: 'spotlight-glow',
            type: 'fixed',
            name: '聚光灯效果',
            zIndex: 1.5,
            properties: {
              // 中心聚光效果
              background: 'radial-gradient(ellipse at 50% 30%, rgba(184,78,140,0.25) 0%, transparent 60%)',
              position: 'fullscreen'
            },
            constraints: { modifiable: false }
          },
          {
            id: 'avatar-frame',
            type: 'fixed',
            name: '头像框架',
            zIndex: 2,
            properties: {
              position: { x: 'center', y: 'top', offsetY: 80 },
              size: { width: 150, height: 150 },
              borderRadius: '50%',
              // 渐变边框效果
              border: '4px solid transparent',
              background: 'linear-gradient(135deg, #B84E8C, #6A2C91, #FFD700)',
              shadow: '0 0 40px rgba(184,78,140,0.5), 0 0 80px rgba(106,44,145,0.3)'
            },
            constraints: { modifiable: false }
          }
        ],

        dynamic: [
          {
            id: 'ip-name',
            type: 'dynamic',
            name: 'IP名称',
            zIndex: 3,
            source: 'content-analysis',
            properties: {
              position: 'center',
              fontSize: 36,
              fontWeight: 'bold',
              color: '#FFFFFF',
              animation: {
                type: 'fade-in-up',
                duration: 0.5
              }
            },
            constraints: { modifiable: false }
          },
          {
            id: 'ip-tags',
            type: 'dynamic',
            name: 'IP标签',
            zIndex: 4,
            source: 'keyword-extraction',
            properties: {
              layout: 'horizontal-tags',
              maxTags: 4,
              tagStyle: 'pill',
              colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#96CEB4']
            },
            constraints: { modifiable: false }
          }
        ],

        adjustable: [
          {
            id: 'bio-section',
            type: 'adjustable',
            name: '简介区域',
            zIndex: 5,
            properties: {
              bio: '',
              socialLinks: [],
              showFollowers: true
            },
            constraints: {
              modifiable: true,
              maxLength: { bio: 100 }
            }
          }
        ]
      },

      metadata: {
        version: '1.0',
        author: 'VidSlide AI',
        tags: ['IP', '个人品牌', 'KOL', '自媒体'],
        compatibility: ['personal-brand', 'influencer', 'social-media']
      }
    }
