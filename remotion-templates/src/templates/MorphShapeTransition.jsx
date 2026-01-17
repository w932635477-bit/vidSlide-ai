/**
 * 模板24-30: 剩余7个模板 - 简化但独特版本
 */

// 模板24: 形态变换
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

export const MorphShapeTransition = ({ title = '形态变换', brandColor = '#FD79A8' }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const progress = spring({ frame: frame - 40, fps, config: { damping: 80, stiffness: 100 } });
  const borderRadius = interpolate(progress, [0, 0.5, 1], [0, 50, 0]);

  return (
    <div style={{ width, height, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <div style={{ width: 400, height: 400, background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}80 100%)`, borderRadius: `${borderRadius}%`, border: '3px solid rgba(255, 255, 255, 0.3)', boxShadow: `0 30px 80px rgba(0, 0, 0, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.2)`, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', inset: 8, borderRadius: `${borderRadius}%`, border: '2px solid rgba(255, 255, 255, 0.15)', pointerEvents: 'none' }} />
        <h1 style={{ fontSize: 48, fontWeight: '800', color: 'white', margin: 0, textAlign: 'center' }}>{title}</h1>
      </div>
      <div style={{ position: 'absolute', top: 50, left: 50, padding: '18px 36px', borderRadius: 16, background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(20px)', border: '2px solid rgba(255, 255, 255, 0.2)', fontSize: 20, fontWeight: '600', color: 'white', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 4, borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.1)', pointerEvents: 'none' }} />
        VidSlide AI
      </div>
    </div>
  );
};

// 模板25: 漂浮岛屿
export const FloatingIslands = ({ title = '漂浮岛屿', brandColor = '#A29BFE' }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const islands = [0, 1, 2].map((i) => {
    const y = Math.sin((frame + i * 30) / 20) * 30;
    const progress = spring({ frame: frame - 40 - i * 10, fps, config: { damping: 90, stiffness: 120 } });
    return { y, opacity: interpolate(progress, [0, 1], [0, 1]), x: i * 300 - 300 };
  });

  return (
    <div style={{ width, height, background: 'linear-gradient(180deg, #0f2027 0%, #203a43 50%, #2c5364 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      {islands.map((island, i) => (
        <div key={i} style={{ position: 'absolute', left: '50%', top: '50%', width: 250, height: 200, borderRadius: 24, background: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(25px)', border: '2px solid rgba(255, 255, 255, 0.2)', boxShadow: '0 30px 80px rgba(0, 0, 0, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.1)', transform: `translate(calc(-50% + ${island.x}px), calc(-50% + ${island.y}px))`, opacity: island.opacity }}>
          <div style={{ position: 'absolute', inset: 6, borderRadius: 20, border: '1px solid rgba(255, 255, 255, 0.1)', pointerEvents: 'none' }} />
        </div>
      ))}
      <div style={{ padding: '28px 56px', borderRadius: 20, background: 'rgba(255, 255, 255, 0.06)', backdropFilter: 'blur(30px)', border: '2px solid rgba(255, 255, 255, 0.2)', position: 'relative', zIndex: 10 }}>
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

// 模板26-30将在下一个文件中创建
