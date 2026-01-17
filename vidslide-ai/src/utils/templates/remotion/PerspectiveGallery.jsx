/**
 * 模板27: 透视画廊
 * 特点：3D透视空间、画廊式排列、深度景深、旋转浏览、聚焦效果
 * 包含：磨砂玻璃、多层阴影、双层边框、渐变光泽、Spring动画
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, Img } from 'remotion';

export const PerspectiveGallery = ({
  title = '透视画廊',
  subtitle = '',
  images = [],
  brandColor = '#E74C3C',
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const galleryProgress = spring({
    frame: frame - 40,
    fps,
    config: { damping: 80, stiffness: 100 },
  });

  const rotateY = interpolate(galleryProgress, [0, 1], [45, 0]);

  // 5张画廊卡片
  const cards = [0, 1, 2, 3, 4].map((i) => {
    const cardProgress = spring({
      frame: frame - 50 - i * 6,
      fps,
      config: { damping: 90, stiffness: 120 },
    });

    const z = interpolate(cardProgress, [0, 1], [-500, i * -150]);
    const opacity = interpolate(cardProgress, [0, 1], [0, 1 - i * 0.15]);
    const scale = 1 - i * 0.1;

    return { z, opacity, scale };
  });

  return (
    <div style={{
      width,
      height,
      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      perspective: '1500px',
    }}>
      {/* 3D画廊容器 */}
      <div style={{
        transformStyle: 'preserve-3d',
        transform: `rotateY(${rotateY}deg)`,
        position: 'relative',
      }}>
        {cards.map((card, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 500,
              height: 350,
              marginLeft: -250,
              marginTop: -175,
              borderRadius: 24,
              background: images[i]
                ? 'transparent'
                : `linear-gradient(135deg, ${brandColor}${Math.round((5 - i) * 0.2 * 255).toString(16).padStart(2, '0')} 0%, rgba(255,255,255,0.1) 100%)`,
              backdropFilter: 'blur(25px) saturate(180%)',
              border: '3px solid rgba(255, 255, 255, 0.2)',
              boxShadow: `
                0 ${30 + i * 10}px ${80 + i * 20}px rgba(0, 0, 0, ${0.5 + i * 0.1}),
                inset 0 2px 0 rgba(255, 255, 255, 0.15)
              `,
              transform: `translateZ(${card.z}px) scale(${card.scale})`,
              opacity: card.opacity,
              overflow: 'hidden',
            }}
          >
            {/* 双层边框 */}
            <div style={{
              position: 'absolute',
              inset: 8,
              borderRadius: 20,
              border: '2px solid rgba(255, 255, 255, 0.1)',
              pointerEvents: 'none',
              zIndex: 10,
            }} />

            {/* 卡片内容 */}
            {images[i] ? (
              <Img
                src={images[i]}
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 120,
                fontWeight: '900',
                color: 'rgba(255, 255, 255, 0.3)',
              }}>
                {i + 1}
              </div>
            )}

            {/* 聚焦高光 */}
            {i === 0 && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '50%',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)',
                pointerEvents: 'none',
              }} />
            )}
          </div>
        ))}
      </div>

      {/* 标题 */}
      <div style={{
        position: 'absolute',
        top: 80,
        left: 0,
        right: 0,
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-block',
          padding: '28px 56px',
          borderRadius: 20,
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(30px)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
        }}>
          <div style={{
            position: 'absolute',
            inset: 6,
            borderRadius: 16,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            pointerEvents: 'none',
          }} />
          <h1 style={{
            fontSize: 56,
            fontWeight: '800',
            color: 'white',
            margin: 0,
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          }}>
            {title}
          </h1>
        </div>
      </div>

      <div style={{
        position: 'absolute',
        top: 50,
        left: 50,
        padding: '18px 36px',
        borderRadius: 16,
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        border: '2px solid rgba(255, 255, 255, 0.15)',
        fontSize: 20,
        fontWeight: '600',
        color: 'white',
      }}>
        <div style={{
          position: 'absolute',
          inset: 4,
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          pointerEvents: 'none',
        }} />
        VidSlide AI
      </div>
    </div>
  );
};
