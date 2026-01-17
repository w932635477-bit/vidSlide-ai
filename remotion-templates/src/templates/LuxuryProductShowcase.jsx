/**
 * 高级模板 2: 奢华产品展示
 * 特点：金色光泽、高级渐变、精致阴影、双边框
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, Img } from 'remotion';

export const LuxuryProductShowcase = ({
  title = '奢华系列',
  subtitle = '',
  images = [],
  accentColor = '#FFD700',
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const titleProgress = spring({
    frame: frame - 20,
    fps,
    config: { damping: 130, stiffness: 170 },
  });

  const cardProgress = spring({
    frame: frame - 40,
    fps,
    config: { damping: 110, stiffness: 150 },
  });

  const scale = interpolate(cardProgress, [0, 1], [0.6, 1]);
  const opacity = interpolate(cardProgress, [0, 1], [0, 1]);
  const rotateY = interpolate(cardProgress, [0, 1], [25, 0]);

  return (
    <div style={{
      width,
      height,
      background: `
        radial-gradient(circle at 30% 40%, #1a1a1a 0%, #000000 100%)
      `,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 金色光效背景 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 50% 30%, ${accentColor}08 0%, transparent 60%),
          radial-gradient(circle at 20% 70%, ${accentColor}05 0%, transparent 50%)
        `,
      }} />

      {/* 装饰线条 */}
      <div style={{
        position: 'absolute',
        top: 100,
        left: 100,
        right: 100,
        height: 1,
        background: `linear-gradient(90deg, transparent 0%, ${accentColor}40 50%, transparent 100%)`,
      }} />
      <div style={{
        position: 'absolute',
        bottom: 100,
        left: 100,
        right: 100,
        height: 1,
        background: `linear-gradient(90deg, transparent 0%, ${accentColor}40 50%, transparent 100%)`,
      }} />

      {/* 主卡片 */}
      <div style={{
        perspective: 1500,
        transformStyle: 'preserve-3d',
      }}>
        <div style={{
          width: 600,
          height: 700,
          transform: `rotateY(${rotateY}deg) scale(${scale})`,
          opacity,
          position: 'relative',
        }}>
          {/* 外层金色光晕 */}
          <div style={{
            position: 'absolute',
            inset: -30,
            background: `radial-gradient(circle, ${accentColor}20 0%, transparent 70%)`,
            borderRadius: 40,
            filter: 'blur(40px)',
          }} />

          {/* 主容器 - 多层边框 */}
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: 32,
            position: 'relative',
            // 外边框 - 金色
            border: `2px solid ${accentColor}40`,
            // 多层阴影
            boxShadow: `
              0 40px 100px rgba(0, 0, 0, 0.6),
              0 20px 50px rgba(0, 0, 0, 0.4),
              0 10px 25px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 215, 0, 0.2),
              inset 0 -1px 0 rgba(0, 0, 0, 0.5)
            `,
            background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
          }}>
            {/* 内边框 - 双层效果 */}
            <div style={{
              position: 'absolute',
              inset: 6,
              borderRadius: 28,
              border: `1px solid ${accentColor}20`,
              pointerEvents: 'none',
              zIndex: 2,
            }} />

            {/* 顶部金色光泽 */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '50%',
              background: `linear-gradient(180deg, ${accentColor}08 0%, transparent 100%)`,
              borderRadius: '32px 32px 0 0',
              pointerEvents: 'none',
              zIndex: 1,
            }} />

            {/* 图片内容区 */}
            <div style={{
              position: 'absolute',
              inset: 12,
              borderRadius: 24,
              overflow: 'hidden',
              background: '#000',
            }}>
              {images[0] ? (
                <Img
                  src={images[0]}
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
                      ${accentColor}10 0%,
                      ${accentColor}20 50%,
                      ${accentColor}10 100%)
                  `,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <div style={{
                    fontSize: 120,
                    fontWeight: '900',
                    background: `linear-gradient(135deg, ${accentColor} 0%, #FFA500 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 40px rgba(255, 215, 0, 0.3)',
                  }}>
                    LUXURY
                  </div>
                </div>
              )}
            </div>

            {/* 底部渐变 */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '40%',
              background: 'linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 100%)',
              borderRadius: '0 0 32px 32px',
              pointerEvents: 'none',
            }} />
          </div>
        </div>
      </div>

      {/* 标题 - 金色渐变文字 */}
      <div style={{
        position: 'absolute',
        bottom: 120,
        left: 0,
        right: 0,
        textAlign: 'center',
        opacity: interpolate(titleProgress, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(titleProgress, [0, 1], [50, 0])}px)`,
      }}>
        <h1 style={{
          fontSize: 72,
          fontWeight: '900',
          margin: 0,
          background: `linear-gradient(135deg, ${accentColor} 0%, #FFA500 50%, ${accentColor} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: `0 0 60px ${accentColor}40`,
          letterSpacing: 2,
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{
            fontSize: 28,
            color: 'rgba(255, 215, 0, 0.7)',
            marginTop: 15,
            fontWeight: '500',
            letterSpacing: 1,
          }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* 角落装饰 */}
      {[
        { top: 80, left: 80 },
        { top: 80, right: 80 },
        { bottom: 80, left: 80 },
        { bottom: 80, right: 80 },
      ].map((pos, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            ...pos,
            width: 40,
            height: 40,
            border: `2px solid ${accentColor}30`,
            borderRadius: 4,
            transform: 'rotate(45deg)',
          }}
        />
      ))}
    </div>
  );
};
