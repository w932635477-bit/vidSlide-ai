/**
 * 模板23: 光束扫描
 * 特点：光束从左到右扫描、光晕拖尾、扫描线效果、高光反射、科技感
 * 包含：磨砂玻璃、多层阴影、双层边框、渐变光泽、Spring动画
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

export const LightBeamScan = ({
  title = '光束扫描',
  brandColor = '#00CEC9',
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const beamProgress = spring({
    frame: frame - 40,
    fps,
    config: { damping: 70, stiffness: 85 },
  });

  const beamX = interpolate(beamProgress, [0, 1], [-200, width + 200]);

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
      {/* 光束 */}
      <div style={{
        position: 'absolute',
        left: beamX,
        top: 0,
        bottom: 0,
        width: 100,
        background: `linear-gradient(90deg, transparent 0%, ${brandColor}60 50%, transparent 100%)`,
        filter: 'blur(20px)',
        boxShadow: `0 0 100px ${brandColor}`,
      }} />

      <div style={{
        padding: '30px 60px',
        borderRadius: 22,
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(30px)',
        border: `2px solid ${brandColor}40`,
        position: 'relative',
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
          color: brandColor,
          margin: 0,
          textShadow: `0 0 40px ${brandColor}`,
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
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        border: `2px solid ${brandColor}30`,
        fontSize: 20,
        fontWeight: '600',
        color: brandColor,
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          inset: 4,
          borderRadius: 12,
          border: `1px solid ${brandColor}15`,
          pointerEvents: 'none',
        }} />
        VidSlide AI
      </div>
    </div>
  );
};
