/**
 * 模板18: 液态变形文字
 * 特点：文字流体效果、波浪动画、液态渐变、形态变换、柔和过渡
 * 包含：磨砂玻璃、多层阴影、双层边框、渐变光泽、Spring动画
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

export const LiquidMorphText = ({
  title = 'LIQUID',
  subtitle = 'Morph Effect',
  brandColor = '#00B894',
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const wave1 = Math.sin(frame / 15) * 20;
  const wave2 = Math.cos(frame / 20) * 15;

  const titleProgress = spring({
    frame: frame - 35,
    fps,
    config: { damping: 60, stiffness: 80, mass: 1.2 },
  });

  const scale = interpolate(titleProgress, [0, 1], [0.5, 1]);
  const opacity = interpolate(titleProgress, [0, 1], [0, 1]);

  return (
    <div style={{
      width,
      height,
      background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 液态背景波浪 */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '40%',
        background: `linear-gradient(180deg, transparent 0%, ${brandColor}20 100%)`,
        transform: `translateY(${wave1}px)`,
        filter: 'blur(50px)',
      }} />

      <div style={{
        textAlign: 'center',
        transform: `scale(${scale}) translateY(${wave2}px)`,
        opacity,
      }}>
        <h1 style={{
          fontSize: 160,
          fontWeight: '900',
          background: `linear-gradient(135deg, ${brandColor} 0%, #55EFC4 50%, ${brandColor} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: 0,
          filter: `drop-shadow(0 10px 40px ${brandColor}60)`,
          letterSpacing: 5,
          textTransform: 'uppercase',
          position: 'relative',
        }}>
          {title}

          {/* 液态效果层 */}
          <div style={{
            position: 'absolute',
            inset: -20,
            background: `radial-gradient(circle at 50% 50%, ${brandColor}10 0%, transparent 70%)`,
            filter: 'blur(30px)',
            zIndex: -1,
          }} />
        </h1>

        {subtitle && (
          <div style={{
            marginTop: 50,
            padding: '22px 44px',
            borderRadius: 18,
            background: 'rgba(255, 255, 255, 0.04)',
            backdropFilter: 'blur(25px)',
            border: `2px solid ${brandColor}40`,
            display: 'inline-block',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              inset: 6,
              borderRadius: 14,
              border: `1px solid ${brandColor}20`,
              pointerEvents: 'none',
            }} />
            <div style={{
              fontSize: 34,
              fontWeight: '600',
              color: '#55EFC4',
              textShadow: `0 0 20px ${brandColor}60`,
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
        color: '#55EFC4',
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
