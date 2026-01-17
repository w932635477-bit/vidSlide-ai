/**
 * 模板9: 圆形揭示对比
 * 特点：圆形遮罩扩散、中心点扩散动画、圆形边框发光、涟漪效果、径向渐变
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, Img } from 'remotion';

export const CircularReveal = ({
  title = '圆形揭示',
  subtitle = '',
  beforeImage = null,
  afterImage = null,
  beforeLabel = 'BEFORE',
  afterLabel = 'AFTER',
  brandColor = '#9B59B6',
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // 标题动画
  const titleProgress = spring({
    frame: frame - 20,
    fps,
    config: { damping: 105, stiffness: 145 },
  });

  const titleY = interpolate(titleProgress, [0, 1], [50, 0]);
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

  // 圆形扩散动画
  const circleProgress = spring({
    frame: frame - 40,
    fps,
    config: { damping: 75, stiffness: 95, mass: 1 },
  });

  const circleRadius = interpolate(circleProgress, [0, 1], [0, 70]);

  // 涟漪效果
  const ripples = [0, 1, 2].map((i) => {
    const rippleProgress = spring({
      frame: frame - 50 - i * 10,
      fps,
      config: { damping: 60, stiffness: 80 },
    });
    const rippleRadius = interpolate(rippleProgress, [0, 1], [0, 80]);
    const rippleOpacity = interpolate(rippleProgress, [0, 1], [0.8, 0]);
    return { radius: rippleRadius, opacity: rippleOpacity };
  });

  return (
    <div style={{
      width,
      height,
      background: `radial-gradient(circle at 50% 50%, #1a1a2e 0%, #0f0f1e 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 背景装饰圆环 */}
      {[200, 350, 500].map((size, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: size,
            height: size,
            borderRadius: '50%',
            border: `1px solid ${brandColor}15`,
            transform: 'translate(-50%, -50%)',
            opacity: 0.3,
          }}
        />
      ))}

      {/* 主对比容器 */}
      <div style={{
        width: 850,
        height: 650,
        position: 'relative',
        borderRadius: 30,
        overflow: 'hidden',
        // 磨砂玻璃边框
        border: '3px solid rgba(255, 255, 255, 0.15)',
        // 多层阴影
        boxShadow: `
          0 60px 140px rgba(0, 0, 0, 0.6),
          0 30px 70px rgba(0, 0, 0, 0.5),
          0 15px 35px rgba(0, 0, 0, 0.4),
          inset 0 2px 0 rgba(255, 255, 255, 0.1)
        `,
      }}>
        {/* BEFORE 图片（底层） */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: beforeImage
            ? 'transparent'
            : `radial-gradient(circle at 50% 50%, #555 0%, #333 100%)`,
        }}>
          {beforeImage ? (
            <Img
              src={beforeImage}
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
              fontSize: 150,
              fontWeight: '900',
              color: '#666',
            }}>
              OLD
            </div>
          )}
        </div>

        {/* AFTER 图片（顶层，圆形遮罩） */}
        <div style={{
          position: 'absolute',
          inset: 0,
          clipPath: `circle(${circleRadius}% at 50% 50%)`,
          background: afterImage
            ? 'transparent'
            : `radial-gradient(circle at 50% 50%, ${brandColor}60 0%, ${brandColor}80 100%)`,
        }}>
          {afterImage ? (
            <Img
              src={afterImage}
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
              fontSize: 150,
              fontWeight: '900',
              color: brandColor,
            }}>
              NEW
            </div>
          )}
        </div>

        {/* 圆形边框发光 */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: `${circleRadius * 2}%`,
          height: `${circleRadius * 2}%`,
          borderRadius: '50%',
          border: `4px solid ${brandColor}`,
          transform: 'translate(-50%, -50%)',
          boxShadow: `
            0 0 40px ${brandColor}80,
            0 0 80px ${brandColor}60,
            inset 0 0 40px ${brandColor}40
          `,
          pointerEvents: 'none',
          zIndex: 10,
        }} />

        {/* 涟漪效果 */}
        {ripples.map((ripple, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: `${ripple.radius * 2}%`,
              height: `${ripple.radius * 2}%`,
              borderRadius: '50%',
              border: `2px solid ${brandColor}`,
              transform: 'translate(-50%, -50%)',
              opacity: ripple.opacity,
              pointerEvents: 'none',
              zIndex: 5,
            }}
          />
        ))}

        {/* BEFORE 标签 */}
        <div style={{
          position: 'absolute',
          top: 40,
          left: 40,
          padding: '16px 32px',
          borderRadius: 16,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(15px)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          fontSize: 22,
          fontWeight: '700',
          color: 'white',
          letterSpacing: 2,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
        }}>
          {beforeLabel}
        </div>

        {/* AFTER 标签 */}
        <div style={{
          position: 'absolute',
          top: 40,
          right: 40,
          padding: '16px 32px',
          borderRadius: 16,
          background: `${brandColor}dd`,
          backdropFilter: 'blur(15px)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          fontSize: 22,
          fontWeight: '700',
          color: 'white',
          letterSpacing: 2,
          boxShadow: `0 8px 24px ${brandColor}60`,
          opacity: interpolate(circleProgress, [0, 0.3, 1], [0, 0, 1]),
        }}>
          {afterLabel}
        </div>

        {/* 中心点指示器 */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: 'white',
          transform: 'translate(-50%, -50%)',
          boxShadow: `0 0 20px white, 0 0 40px ${brandColor}`,
          opacity: interpolate(circleProgress, [0, 0.5, 1], [1, 0.5, 0]),
          zIndex: 15,
        }} />
      </div>

      {/* 标题区域 */}
      <div style={{
        position: 'absolute',
        bottom: 75,
        left: 0,
        right: 0,
        textAlign: 'center',
        transform: `translateY(${titleY}px)`,
        opacity: titleOpacity,
      }}>
        <div style={{
          display: 'inline-block',
          padding: '30px 60px',
          borderRadius: 22,
          background: 'rgba(255, 255, 255, 0.06)',
          backdropFilter: 'blur(30px)',
          border: `2px solid ${brandColor}40`,
          boxShadow: `0 25px 70px rgba(0, 0, 0, 0.5), 0 0 60px ${brandColor}20`,
        }}>
          <h1 style={{
            fontSize: 58,
            fontWeight: '800',
            color: 'white',
            margin: 0,
            textShadow: `0 4px 20px rgba(0, 0, 0, 0.6), 0 0 40px ${brandColor}40`,
            letterSpacing: -0.5,
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{
              fontSize: 26,
              color: 'rgba(255, 255, 255, 0.9)',
              margin: '14px 0 0 0',
              fontWeight: '500',
            }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* 品牌标识 */}
      <div style={{
        position: 'absolute',
        top: 50,
        left: 50,
        padding: '20px 40px',
        borderRadius: 18,
        background: 'rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        fontSize: 22,
        fontWeight: '600',
        color: 'white',
      }}>
        VidSlide AI
      </div>
    </div>
  );
};
