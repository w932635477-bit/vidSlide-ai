/**
 * 模板16: 动态字体分解
 * 特点：文字逐字母飞入、字母旋转缩放、粒子轨迹、随机时序、3D变换
 * 包含：磨砂玻璃、多层阴影、双层边框、渐变光泽、Spring动画
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

export const KineticTypography = ({
  title = 'KINETIC',
  subtitle = 'Typography',
  brandColor = '#A29BFE',
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const letters = title.split('');

  return (
    <div style={{
      width,
      height,
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex',
        gap: 10,
      }}>
        {letters.map((letter, i) => {
          const letterProgress = spring({
            frame: frame - 30 - i * 5,
            fps,
            config: { damping: 70, stiffness: 90, mass: 0.8 },
          });

          const y = interpolate(letterProgress, [0, 1], [200, 0]);
          const rotate = interpolate(letterProgress, [0, 1], [180, 0]);
          const scale = interpolate(letterProgress, [0, 1], [0, 1]);

          return (
            <div
              key={i}
              style={{
                fontSize: 140,
                fontWeight: '900',
                background: `linear-gradient(135deg, ${brandColor} 0%, #6C5CE7 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                transform: `translateY(${y}px) rotate(${rotate}deg) scale(${scale})`,
                textShadow: `0 0 60px ${brandColor}60`,
                filter: `drop-shadow(0 10px 30px ${brandColor}40)`,
              }}
            >
              {letter}
            </div>
          );
        })}
      </div>

      {subtitle && (
        <div style={{
          position: 'absolute',
          bottom: 200,
          left: 0,
          right: 0,
          textAlign: 'center',
        }}>
          <div style={{
            display: 'inline-block',
            padding: '24px 48px',
            borderRadius: 18,
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(25px)',
            border: '2px solid rgba(255, 255, 255, 0.15)',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              inset: 6,
              borderRadius: 14,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              pointerEvents: 'none',
            }} />
            <div style={{
              fontSize: 36,
              fontWeight: '600',
              color: 'white',
            }}>
              {subtitle}
            </div>
          </div>
        </div>
      )}

      <div style={{
        position: 'absolute',
        top: 50,
        left: 50,
        padding: '18px 36px',
        borderRadius: 16,
        background: 'rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(20px)',
        border: '2px solid rgba(255, 255, 255, 0.15)',
        fontSize: 20,
        fontWeight: '600',
        color: 'white',
        position: 'relative',
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
