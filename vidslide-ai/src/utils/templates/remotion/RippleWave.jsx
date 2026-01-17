/**
 * 模板22: 涟漪波纹
 * 特点：同心圆扩散、多层波纹、透明度递减、连续触发、水波效果
 * 包含：磨砂玻璃、多层阴影、双层边框、渐变光泽、Spring动画
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

export const RippleWave = ({
  title = '涟漪波纹',
  subtitle = '',
  brandColor = '#74B9FF',
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const ripples = [0, 1, 2, 3].map((i) => {
    const progress = spring({
      frame: frame - 40 - i * 15,
      fps,
      config: { damping: 60, stiffness: 70 },
    });
    return {
      scale: interpolate(progress, [0, 1], [0, 3]),
      opacity: interpolate(progress, [0, 0.3, 1], [0, 0.8, 0]),
    };
  });

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
      {/* 涟漪效果 */}
      {ripples.map((ripple, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 200,
            height: 200,
            borderRadius: '50%',
            border: `4px solid ${brandColor}`,
            transform: `translate(-50%, -50%) scale(${ripple.scale})`,
            opacity: ripple.opacity,
            pointerEvents: 'none',
          }}
        />
      ))}

      <div style={{
        padding: '30px 60px',
        borderRadius: 22,
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(30px)',
        border: `2px solid ${brandColor}40`,
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{
          position: 'absolute',
          inset: 6,
          borderRadius: 18,
          border: `1px solid ${brandColor}20`,
          pointerEvents: 'none',
        }} />
        <h1 style={{
          fontSize: 58,
          fontWeight: '800',
          color: 'white',
          margin: 0,
          textShadow: `0 0 40px ${brandColor}60`,
        }}>
          {title}
        </h1>
      </div>

      <div style={{
        position: 'absolute',
        top: 50,
        left: 50,
        padding: '18px 36px',
        borderRadius: 16,
        background: 'rgba(255, 255, 255, 0.05)',
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
