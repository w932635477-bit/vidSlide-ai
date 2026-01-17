/**
 * 模板26: 磁吸卡片
 * 特点：卡片相互吸引效果、弹性动画、碰撞反弹、磁场线条、物理模拟
 * 包含：磨砂玻璃、多层阴影、双层边框、渐变光泽、Spring动画
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

export const MagneticCards = ({
  title = '磁吸卡片',
  subtitle = '',
  brandColor = '#6C5CE7',
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // 3张卡片的磁吸动画
  const cards = [0, 1, 2].map((i) => {
    const cardProgress = spring({
      frame: frame - 40 - i * 8,
      fps,
      config: { damping: 50, stiffness: 70, mass: 1.5 },
    });

    const startX = [-400, 0, 400][i];
    const endX = [-200, 0, 200][i];
    const x = interpolate(cardProgress, [0, 1], [startX, endX]);
    const rotate = interpolate(cardProgress, [0, 1], [i * 15 - 15, 0]);
    const scale = interpolate(cardProgress, [0, 1], [0.7, 1]);

    return { x, rotate, scale, opacity: interpolate(cardProgress, [0, 1], [0, 1]) };
  });

  return (
    <div style={{
      width,
      height,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 磁场线条效果 */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 300 + i * 100,
            height: 300 + i * 100,
            borderRadius: '50%',
            border: `1px solid ${brandColor}${Math.round((5 - i) * 0.1 * 255).toString(16).padStart(2, '0')}`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      {/* 3张磁吸卡片 */}
      {cards.map((card, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 280,
            height: 380,
            borderRadius: 28,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(30px) saturate(180%)',
            border: '3px solid rgba(255, 255, 255, 0.25)',
            boxShadow: `
              0 40px 100px rgba(0, 0, 0, 0.5),
              0 20px 50px rgba(0, 0, 0, 0.4),
              inset 0 2px 0 rgba(255, 255, 255, 0.2)
            `,
            transform: `translate(calc(-50% + ${card.x}px), -50%) rotate(${card.rotate}deg) scale(${card.scale})`,
            opacity: card.opacity,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* 双层边框 */}
          <div style={{
            position: 'absolute',
            inset: 10,
            borderRadius: 24,
            border: '2px solid rgba(255, 255, 255, 0.15)',
            pointerEvents: 'none',
            zIndex: 10,
          }} />

          {/* 卡片内容 */}
          <div style={{
            fontSize: 72,
            fontWeight: '900',
            background: `linear-gradient(135deg, ${brandColor} 0%, #A29BFE 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: `0 0 40px ${brandColor}60`,
          }}>
            {i + 1}
          </div>
        </div>
      ))}

      {/* 标题 */}
      <div style={{
        position: 'absolute',
        bottom: 100,
        left: 0,
        right: 0,
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-block',
          padding: '28px 56px',
          borderRadius: 20,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(30px)',
          border: '2px solid rgba(255, 255, 255, 0.25)',
        }}>
          <div style={{
            position: 'absolute',
            inset: 6,
            borderRadius: 16,
            border: '1px solid rgba(255, 255, 255, 0.15)',
            pointerEvents: 'none',
          }} />
          <h1 style={{
            fontSize: 56,
            fontWeight: '800',
            color: 'white',
            margin: 0,
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          }}>
            {title}
          </h1>
        </div>
      </div>

      <div style={{
        position: 'absolute',
        top: 50,
        left: 50,
        padding: '18px 36px',
        borderRadius: 16,
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        fontSize: 20,
        fontWeight: '600',
        color: 'white',
      }}>
        <div style={{
          position: 'absolute',
          inset: 4,
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          pointerEvents: 'none',
        }} />
        VidSlide AI
      </div>
    </div>
  );
};
