/**
 * 模板15: 信息图表网格
 * 特点：2x2网格布局、图标+数字+文字、错开动画时序、卡片式设计
 * 包含：磨砂玻璃、多层阴影、双层边框、渐变光泽、Spring动画
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

export const InfographicGrid = ({
  title = '数据概览',
  subtitle = '',
  brandColor = '#E67E22',
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const stats = [
    { value: '2.5K', label: '用户数', icon: '👥', color: '#3498DB' },
    { value: '98%', label: '满意度', icon: '⭐', color: '#2ECC71' },
    { value: '150+', label: '项目数', icon: '📊', color: '#E74C3C' },
    { value: '24/7', label: '在线服务', icon: '🚀', color: '#9B59B6' },
  ];

  return (
    <div style={{
      width,
      height,
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 40,
        maxWidth: 900,
      }}>
        {stats.map((stat, i) => {
          const cardProgress = spring({
            frame: frame - 40 - i * 10,
            fps,
            config: { damping: 90, stiffness: 120 },
          });

          return (
            <div
              key={i}
              style={{
                width: 400,
                height: 300,
                borderRadius: 24,
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(25px) saturate(180%)',
                border: '2px solid rgba(255, 255, 255, 0.15)',
                boxShadow: `
                  0 30px 80px rgba(0, 0, 0, 0.5),
                  0 15px 40px rgba(0, 0, 0, 0.4),
                  inset 0 2px 0 rgba(255, 255, 255, 0.1)
                `,
                padding: 40,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 20,
                transform: `scale(${interpolate(cardProgress, [0, 1], [0.8, 1])})`,
                opacity: interpolate(cardProgress, [0, 1], [0, 1]),
                position: 'relative',
              }}
            >
              <div style={{
                position: 'absolute',
                inset: 8,
                borderRadius: 20,
                border: '1px solid rgba(255, 255, 255, 0.08)',
                pointerEvents: 'none',
              }} />

              <div style={{
                fontSize: 80,
                filter: `drop-shadow(0 0 20px ${stat.color}60)`,
              }}>
                {stat.icon}
              </div>

              <div style={{
                fontSize: 64,
                fontWeight: '900',
                color: stat.color,
                textShadow: `0 0 30px ${stat.color}60`,
              }}>
                {stat.value}
              </div>

              <div style={{
                fontSize: 24,
                fontWeight: '600',
                color: 'rgba(255, 255, 255, 0.8)',
                textAlign: 'center',
              }}>
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        position: 'absolute',
        top: 80,
        left: 0,
        right: 0,
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-block',
          padding: '28px 56px',
          borderRadius: 20,
          background: 'rgba(255, 255, 255, 0.06)',
          backdropFilter: 'blur(30px)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            inset: 6,
            borderRadius: 16,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            pointerEvents: 'none',
          }} />
          <h1 style={{ fontSize: 56, fontWeight: '800', color: 'white', margin: 0 }}>
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
