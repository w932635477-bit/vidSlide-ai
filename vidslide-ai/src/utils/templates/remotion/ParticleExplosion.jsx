/**
 * 模板21-30: 快速创建剩余10个模板
 * 每个都包含双层边框和独特视觉效果
 */

// 模板21: 粒子爆炸
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

export const ParticleExplosion = ({ title = '粒子爆炸', brandColor = '#FF7675' }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const particles = Array.from({ length: 50 }, (_, i) => {
    const angle = (i / 50) * Math.PI * 2;
    const progress = spring({ frame: frame - 40, fps, config: { damping: 60, stiffness: 80 } });
    const distance = interpolate(progress, [0, 1], [0, 400]);
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      opacity: interpolate(progress, [0, 0.5, 1], [0, 1, 0]),
    };
  });

  return (
    <div style={{ width, height, background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      {particles.map((p, i) => (
        <div key={i} style={{ position: 'absolute', left: '50%', top: '50%', width: 12, height: 12, borderRadius: '50%', background: brandColor, transform: `translate(calc(-50% + ${p.x}px), calc(-50% + ${p.y}px))`, opacity: p.opacity, boxShadow: `0 0 20px ${brandColor}` }} />
      ))}
      <div style={{ padding: '28px 56px', borderRadius: 20, background: 'rgba(255, 255, 255, 0.06)', backdropFilter: 'blur(30px)', border: '2px solid rgba(255, 255, 255, 0.2)', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 6, borderRadius: 16, border: '1px solid rgba(255, 255, 255, 0.1)', pointerEvents: 'none' }} />
        <h1 style={{ fontSize: 56, fontWeight: '800', color: 'white', margin: 0 }}>{title}</h1>
      </div>
      <div style={{ position: 'absolute', top: 50, left: 50, padding: '18px 36px', borderRadius: 16, background: 'rgba(255, 255, 255, 0.06)', backdropFilter: 'blur(20px)', border: '2px solid rgba(255, 255, 255, 0.15)', fontSize: 20, fontWeight: '600', color: 'white', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 4, borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.08)', pointerEvents: 'none' }} />
        VidSlide AI
      </div>
    </div>
  );
};
