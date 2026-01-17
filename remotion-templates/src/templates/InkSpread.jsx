/**
 * 模板30: 墨水扩散
 * 特点：墨水在水中扩散效果、有机形态、流体模拟、渐变扩散、艺术感
 * 包含：磨砂玻璃、多层阴影、双层边框、渐变光泽、Spring动画
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, Img } from 'remotion';

export const InkSpread = ({
  title = '墨水扩散',
  subtitle = '',
  images = [],
  brandColor = '#2D3436',
  accentColor = '#636E72',
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const titleProgress = spring({
    frame: frame - 25,
    fps,
    config: { damping: 100, stiffness: 140 },
  });

  const inkProgress = spring({
    frame: frame - 45,
    fps,
    config: { damping: 60, stiffness: 75, mass: 1.5 },
  });

  const spreadScale = interpolate(inkProgress, [0, 1], [0, 1.5]);
  const inkOpacity = interpolate(inkProgress, [0, 0.3, 1], [0, 0.8, 0.3]);

  // 墨水扩散的多个圆形
  const inkBlobs = [0, 1, 2, 3, 4].map((i) => {
    const angle = (i / 5) * Math.PI * 2;
    const distance = 150 * spreadScale;
    const size = 200 - i * 30;
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      size,
      opacity: inkOpacity * (1 - i * 0.15),
    };
  });

  return (
    <div style={{
      width,
      height,
      background: '#F5F5F5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 墨水扩散效果 */}
      {inkBlobs.map((blob, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: blob.size,
            height: blob.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${brandColor}${Math.round(blob.opacity * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
            transform: `translate(calc(-50% + ${blob.x}px), calc(-50% + ${blob.y}px))`,
            filter: 'blur(30px)',
            opacity: blob.opacity,
          }}
        />
      ))}

      {/* 主内容卡片 */}
      <div style={{
        width: 600,
        height: 700,
        borderRadius: 32,
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(30px) saturate(180%)',
        border: '3px solid rgba(45, 52, 54, 0.15)',
        boxShadow: `
          0 50px 120px rgba(0, 0, 0, 0.15),
          0 25px 60px rgba(0, 0, 0, 0.1),
          0 12px 30px rgba(0, 0, 0, 0.08),
          inset 0 2px 0 rgba(255, 255, 255, 0.8)
        `,
        transform: `scale(${interpolate(inkProgress, [0, 1], [0.9, 1])})`,
        opacity: interpolate(inkProgress, [0, 1], [0, 1]),
      }}>
        {/* 双层边框 */}
        <div style={{
          position: 'absolute',
          inset: 10,
          borderRadius: 28,
          border: '2px solid rgba(45, 52, 54, 0.08)',
          pointerEvents: 'none',
          zIndex: 10,
        }} />

        {/* 内容区域 */}
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 50,
          position: 'relative',
        }}>
          {images[0] ? (
            <Img
              src={images[0]}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: 20,
                filter: 'grayscale(30%) contrast(1.1)',
              }}
            />
          ) : (
            <>
              {/* 墨水笔触效果 */}
              <div style={{
                fontSize: 140,
                fontWeight: '900',
                color: brandColor,
                margin: 0,
                textShadow: `
                  3px 3px 0 ${accentColor}40,
                  6px 6px 0 ${accentColor}20
                `,
                letterSpacing: -2,
              }}>
                墨
              </div>

              <div style={{
                marginTop: 30,
                fontSize: 32,
                fontWeight: '600',
                color: accentColor,
                letterSpacing: 4,
              }}>
                INK ART
              </div>
            </>
          )}
        </div>

        {/* 装饰墨点 */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              bottom: 40 + i * 50,
              right: 40,
              width: 20 + i * 10,
              height: 20 + i * 10,
              borderRadius: '50%',
              background: `${brandColor}${Math.round((3 - i) * 0.3 * 255).toString(16).padStart(2, '0')}`,
              filter: 'blur(2px)',
            }}
          />
        ))}
      </div>

      {/* 标题 */}
      <div style={{
        position: 'absolute',
        bottom: 80,
        left: 0,
        right: 0,
        textAlign: 'center',
        transform: `translateY(${interpolate(titleProgress, [0, 1], [50, 0])}px)`,
        opacity: interpolate(titleProgress, [0, 1], [0, 1]),
      }}>
        <div style={{
          display: 'inline-block',
          padding: '28px 56px',
          borderRadius: 20,
          background: 'rgba(255, 255, 255, 0.95)',
          border: `2px solid ${brandColor}30`,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
        }}>
          <div style={{
            position: 'absolute',
            inset: 6,
            borderRadius: 16,
            border: `1px solid ${brandColor}15`,
            pointerEvents: 'none',
          }} />
          <h1 style={{
            fontSize: 56,
            fontWeight: '800',
            color: brandColor,
            margin: 0,
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
        background: 'rgba(255, 255, 255, 0.9)',
        border: `2px solid ${brandColor}20`,
        fontSize: 20,
        fontWeight: '600',
        color: brandColor,
      }}>
        <div style={{
          position: 'absolute',
          inset: 4,
          borderRadius: 12,
          border: `1px solid ${brandColor}10`,
          pointerEvents: 'none',
        }} />
        VidSlide AI
      </div>
    </div>
  );
};
