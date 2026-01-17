/**
 * 模板29: 水晶棱镜
 * 特点：多面体设计、折射光效、彩虹色散、透明质感、光线追踪
 * 包含：磨砂玻璃、多层阴影、双层边框、渐变光泽、Spring动画
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

export const CrystalPrism = ({
  title = '水晶棱镜',
  subtitle = '',
  brandColor = '#9B59B6',
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const prismProgress = spring({
    frame: frame - 40,
    fps,
    config: { damping: 70, stiffness: 90 },
  });

  const rotateY = interpolate(frame, [0, 150], [0, 360]);
  const scale = interpolate(prismProgress, [0, 1], [0.5, 1]);

  // 彩虹色散效果
  const colors = ['#FF0080', '#FF8C00', '#FFD700', '#00FF00', '#00FFFF', '#0080FF', '#8000FF'];

  return (
    <div style={{
      width,
      height,
      background: 'radial-gradient(circle at 50% 50%, #1a1a2e 0%, #0a0a0a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      perspective: '1500px',
    }}>
      {/* 彩虹光线 */}
      {colors.map((color, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 400,
            height: 2,
            background: `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)`,
            transform: `translate(-50%, -50%) rotate(${i * 51.4 + rotateY}deg)`,
            opacity: 0.6,
            filter: 'blur(2px)',
          }}
        />
      ))}

      {/* 水晶棱镜主体 */}
      <div style={{
        width: 400,
        height: 400,
        transform: `rotateY(${rotateY}deg) scale(${scale})`,
        transformStyle: 'preserve-3d',
        position: 'relative',
      }}>
        {/* 多面体效果 */}
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 300,
              height: 300,
              marginLeft: -150,
              marginTop: -150,
              borderRadius: 24,
              background: `linear-gradient(135deg, ${colors[i]}20 0%, ${colors[i + 1] || colors[0]}20 100%)`,
              backdropFilter: 'blur(30px) saturate(200%)',
              border: `2px solid ${colors[i]}40`,
              boxShadow: `
                0 30px 80px ${colors[i]}30,
                inset 0 2px 0 rgba(255, 255, 255, 0.2),
                inset 0 -2px 0 ${colors[i]}20
              `,
              transform: `rotateY(${i * 90}deg) translateZ(150px)`,
            }}
          >
            {/* 双层边框 */}
            <div style={{
              position: 'absolute',
              inset: 8,
              borderRadius: 20,
              border: `1px solid ${colors[i]}20`,
              pointerEvents: 'none',
            }} />
          </div>
        ))}
      </div>

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
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(30px)',
          border: '2px solid rgba(255, 255, 255, 0.15)',
        }}>
          <div style={{
            position: 'absolute',
            inset: 6,
            borderRadius: 16,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            pointerEvents: 'none',
          }} />
          <h1 style={{
            fontSize: 56,
            fontWeight: '800',
            background: `linear-gradient(90deg, ${colors.join(', ')})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))',
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
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: '2px solid rgba(255, 255, 255, 0.12)',
        fontSize: 20,
        fontWeight: '600',
        color: 'white',
      }}>
        <div style={{
          position: 'absolute',
          inset: 4,
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.06)',
          pointerEvents: 'none',
        }} />
        VidSlide AI
      </div>
    </div>
  );
};
