/**
 * 高级模板 1: 磨砂玻璃卡片堆叠
 * 特点：磨砂效果、双边框、多层阴影、光泽渐变
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, Img } from 'remotion';

export const GlassmorphismStack = ({
  title = '产品展示',
  subtitle = '',
  images = [],
  brandColor = '#007AFF',
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // 标题动画 - 使用更平滑的缓动
  const titleProgress = spring({
    frame: frame - 15,
    fps,
    config: { damping: 120, stiffness: 180, mass: 0.8 },
  });

  const titleY = interpolate(titleProgress, [0, 1], [80, 0]);
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

  // 渲染卡片
  const renderCards = () => {
    const displayImages = images.slice(0, 3);
    if (displayImages.length === 0) {
      displayImages.push(null, null, null);
    }

    return displayImages.map((image, index) => {
      const cardProgress = spring({
        frame: frame - 35 - index * 8,
        fps,
        config: { damping: 100, stiffness: 160, mass: 0.6 },
      });

      // 3D 变换
      const rotateY = interpolate(cardProgress, [0, 1], [60, 0]);
      const translateZ = interpolate(cardProgress, [0, 1], [300, index * 40]);
      const translateX = interpolate(cardProgress, [0, 1], [400, index * 30]);
      const scale = interpolate(cardProgress, [0, 1], [0.4, 1 - index * 0.06]);
      const opacity = interpolate(cardProgress, [0, 1], [0, 1]);

      return (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 450,
            height: 550,
            marginLeft: -225,
            marginTop: -275,
            transform: `
              translateX(${translateX}px)
              translateZ(${translateZ}px)
              rotateY(${rotateY}deg)
              scale(${scale})
            `,
            transformStyle: 'preserve-3d',
            opacity,
            zIndex: 10 - index,
          }}
        >
          {/* 外层光晕 */}
          <div style={{
            position: 'absolute',
            inset: -20,
            background: `radial-gradient(circle at 50% 0%, ${brandColor}40, transparent 70%)`,
            borderRadius: 30,
            filter: 'blur(20px)',
            opacity: 0.6,
          }} />

          {/* 主卡片 - 磨砂玻璃效果 */}
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: 24,
            overflow: 'hidden',
            position: 'relative',
            // 多层阴影 - 高级感关键
            boxShadow: `
              0 ${25 + index * 15}px ${60 + index * 30}px rgba(0, 0, 0, ${0.35 - index * 0.05}),
              0 ${15 + index * 8}px ${30 + index * 15}px rgba(0, 0, 0, ${0.25 - index * 0.05}),
              0 ${8 + index * 4}px ${15 + index * 8}px rgba(0, 0, 0, ${0.15 - index * 0.03}),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `,
            // 双边框效果
            border: '1px solid rgba(255, 255, 255, 0.18)',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px) saturate(180%)',
          }}>
            {/* 内边框 - 增加层次感 */}
            <div style={{
              position: 'absolute',
              inset: 4,
              borderRadius: 20,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              pointerEvents: 'none',
              zIndex: 2,
            }} />

            {/* 顶部光泽 */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '40%',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%)',
              pointerEvents: 'none',
              zIndex: 1,
            }} />

            {/* 图片内容 */}
            <div style={{
              width: '100%',
              height: '100%',
              position: 'relative',
            }}>
              {image ? (
                <Img
                  src={image}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: `
                    linear-gradient(135deg,
                      ${brandColor}15 0%,
                      ${brandColor}25 50%,
                      ${brandColor}35 100%)
                  `,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 64,
                  color: brandColor,
                  fontWeight: '700',
                  textShadow: '0 2px 20px rgba(0,0,0,0.2)',
                }}>
                  {index + 1}
                </div>
              )}
            </div>

            {/* 底部渐变遮罩 */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '30%',
              background: 'linear-gradient(0deg, rgba(0,0,0,0.4) 0%, transparent 100%)',
              pointerEvents: 'none',
            }} />
          </div>
        </div>
      );
    });
  };

  return (
    <div style={{
      width,
      height,
      background: `
        linear-gradient(135deg,
          #0f0c29 0%,
          #302b63 50%,
          #24243e 100%)
      `,
      position: 'relative',
      perspective: 1200,
      perspectiveOrigin: '50% 50%',
      overflow: 'hidden',
    }}>
      {/* 背景装饰 - 柔和光效 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 30%, ${brandColor}15 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, #FF6B6B15 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 70%)
        `,
      }} />

      {/* 网格背景 - 增加科技感 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        opacity: 0.3,
      }} />

      {/* 3D 卡片容器 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        transformStyle: 'preserve-3d',
      }}>
        {renderCards()}
      </div>

      {/* 标题区域 - 磨砂背景 */}
      <div style={{
        position: 'absolute',
        bottom: 80,
        left: 0,
        right: 0,
        textAlign: 'center',
        transform: `translateY(${titleY}px)`,
        opacity: titleOpacity,
      }}>
        <div style={{
          display: 'inline-block',
          padding: '30px 60px',
          borderRadius: 20,
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(30px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: `
            0 20px 60px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1)
          `,
        }}>
          <h1 style={{
            fontSize: 68,
            fontWeight: '800',
            color: 'white',
            margin: 0,
            textShadow: `
              0 2px 10px rgba(0, 0, 0, 0.3),
              0 4px 20px rgba(0, 0, 0, 0.2)
            `,
            letterSpacing: -1.5,
            background: `linear-gradient(135deg, white 0%, rgba(255,255,255,0.8) 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{
              fontSize: 28,
              color: 'rgba(255, 255, 255, 0.85)',
              margin: '12px 0 0 0',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
              fontWeight: '500',
            }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* 品牌标识 - 磨砂容器 */}
      <div style={{
        position: 'absolute',
        top: 50,
        left: 50,
        padding: '15px 30px',
        borderRadius: 12,
        background: 'rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        fontSize: 20,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.9)',
      }}>
        VidSlide AI
      </div>
    </div>
  );
};
