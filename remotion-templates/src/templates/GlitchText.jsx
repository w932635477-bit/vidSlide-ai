/**
 * 模板19: 故障艺术文字
 * 特点：RGB分离效果、随机位移、扫描线、数字噪点、快速闪烁
 * 包含：磨砂玻璃、多层阴影、双层边框、渐变光泽、Spring动画
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

export const GlitchText = ({
  title = 'GLITCH',
  subtitle = 'Error Effect',
  brandColor = '#FF0080',
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const glitchOffset = Math.random() > 0.9 ? Math.random() * 10 - 5 : 0;
  const rgbSplit = Math.sin(frame / 5) * 3;

  const titleProgress = spring({
    frame: frame - 30,
    fps,
    config: { damping: 100, stiffness: 140 },
  });

  return (
    <div style={{
      width,
      height,
      background: '#000000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 扫描线 */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: `${i * 5}%`,
            height: 2,
            background: 'rgba(0, 255, 0, 0.1)',
            opacity: Math.random(),
          }}
        />
      ))}

      <div style={{
        textAlign: 'center',
        position: 'relative',
        transform: `scale(${interpolate(titleProgress, [0, 1], [0.9, 1])})`,
        opacity: interpolate(titleProgress, [0, 1], [0, 1]),
      }}>
        {/* RGB分离效果 */}
        <h1 style={{
          fontSize: 160,
          fontWeight: '900',
          color: '#FF0000',
          margin: 0,
          position: 'absolute',
          left: '50%',
          transform: `translateX(calc(-50% + ${rgbSplit}px))`,
          mixBlendMode: 'screen',
          letterSpacing: 10,
        }}>
          {title}
        </h1>

        <h1 style={{
          fontSize: 160,
          fontWeight: '900',
          color: '#00FF00',
          margin: 0,
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          mixBlendMode: 'screen',
          letterSpacing: 10,
        }}>
          {title}
        </h1>

        <h1 style={{
          fontSize: 160,
          fontWeight: '900',
          color: '#0000FF',
          margin: 0,
          position: 'relative',
          transform: `translateX(${-rgbSplit}px)`,
          mixBlendMode: 'screen',
          letterSpacing: 10,
        }}>
          {title}
        </h1>

        {subtitle && (
          <div style={{
            marginTop: 200,
            padding: '20px 40px',
            borderRadius: 16,
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(255, 0, 128, 0.4)',
            display: 'inline-block',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              inset: 5,
              borderRadius: 12,
              border: '1px solid rgba(255, 0, 128, 0.2)',
              pointerEvents: 'none',
            }} />
            <div style={{
              fontSize: 28,
              fontWeight: '600',
              color: brandColor,
              fontFamily: 'monospace',
            }}>
              {subtitle}
            </div>
          </div>
        )}
      </div>

      <div style={{
        position: 'absolute',
        top: 50,
        left: 50,
        padding: '18px 36px',
        borderRadius: 16,
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: '2px solid rgba(255, 0, 128, 0.3)',
        fontSize: 20,
        fontWeight: '600',
        color: brandColor,
        fontFamily: 'monospace',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          inset: 4,
          borderRadius: 12,
          border: '1px solid rgba(255, 0, 128, 0.15)',
          pointerEvents: 'none',
        }} />
        VidSlide AI
      </div>
    </div>
  );
};
