/**
 * 模板17: 霓虹发光文字
 * 特点：霓虹管效果、多层发光阴影、闪烁动画、彩色光晕、暗色背景
 * 包含：磨砂玻璃、多层阴影、双层边框、渐变光泽、Spring动画
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

export const NeonGlowText = ({
  title = 'NEON',
  subtitle = 'Glow Effect',
  brandColor = '#FF006E',
  accentColor = '#00F5FF',
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const glowIntensity = Math.sin(frame / 10) * 0.3 + 0.7;

  const titleProgress = spring({
    frame: frame - 30,
    fps,
    config: { damping: 100, stiffness: 140 },
  });

  return (
    <div style={{
      width,
      height,
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 背景光晕 */}
      <div style={{
        position: 'absolute',
        width: 800,
        height: 800,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${brandColor}15 0%, transparent 70%)`,
        filter: 'blur(100px)',
      }} />

      <div style={{
        textAlign: 'center',
        transform: `scale(${interpolate(titleProgress, [0, 1], [0.8, 1])})`,
        opacity: interpolate(titleProgress, [0, 1], [0, 1]),
      }}>
        <h1 style={{
          fontSize: 180,
          fontWeight: '900',
          color: brandColor,
          margin: 0,
          textShadow: `
            0 0 10px ${brandColor},
            0 0 20px ${brandColor},
            0 0 40px ${brandColor},
            0 0 80px ${brandColor}${Math.round(glowIntensity * 255).toString(16)},
            0 0 120px ${accentColor}${Math.round(glowIntensity * 128).toString(16)}
          `,
          letterSpacing: 10,
          textTransform: 'uppercase',
        }}>
          {title}
        </h1>

        {subtitle && (
          <div style={{
            marginTop: 40,
            padding: '20px 40px',
            borderRadius: 16,
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            border: `2px solid ${accentColor}40`,
            display: 'inline-block',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              inset: 5,
              borderRadius: 12,
              border: `1px solid ${accentColor}20`,
              pointerEvents: 'none',
            }} />
            <div style={{
              fontSize: 32,
              fontWeight: '600',
              color: accentColor,
              textShadow: `0 0 20px ${accentColor}`,
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
        border: `2px solid ${brandColor}40`,
        fontSize: 20,
        fontWeight: '600',
        color: brandColor,
        textShadow: `0 0 10px ${brandColor}`,
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          inset: 4,
          borderRadius: 12,
          border: `1px solid ${brandColor}20`,
          pointerEvents: 'none',
        }} />
        VidSlide AI
      </div>
    </div>
  );
};
