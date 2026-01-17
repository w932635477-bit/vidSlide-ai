/**
 * 模板14: 雷达图展示
 * 特点：多边形雷达图、多组数据对比、渐变填充、网格线动画
 * 包含：磨砂玻璃、多层阴影、双层边框、渐变光泽、Spring动画
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

export const RadarChart = ({
  title = '能力雷达',
  subtitle = '',
  brandColor = '#8E44AD',
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const titleProgress = spring({
    frame: frame - 20,
    fps,
    config: { damping: 100, stiffness: 140 },
  });

  const chartProgress = spring({
    frame: frame - 40,
    fps,
    config: { damping: 80, stiffness: 100 },
  });

  const scale = interpolate(chartProgress, [0, 1], [0, 1]);

  // 5个维度的数据
  const data = [85, 70, 90, 75, 80];
  const labels = ['技术', '设计', '创新', '效率', '质量'];

  return (
    <div style={{
      width,
      height,
      background: 'linear-gradient(135deg, #2c3e50 0%, #4a5568 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        width: 800,
        height: 800,
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(30px) saturate(180%)',
        border: '3px solid rgba(255, 255, 255, 0.15)',
        boxShadow: `
          0 60px 140px rgba(0, 0, 0, 0.6),
          0 30px 70px rgba(0, 0, 0, 0.5),
          inset 0 2px 0 rgba(255, 255, 255, 0.1)
        `,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* 双层边框 */}
        <div style={{
          position: 'absolute',
          inset: 12,
          borderRadius: '50%',
          border: '2px solid rgba(255, 255, 255, 0.08)',
          pointerEvents: 'none',
          zIndex: 10,
        }} />

        {/* 雷达图网格 */}
        {[20, 40, 60, 80, 100].map((percent, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: `${percent * scale}%`,
              height: `${percent * scale}%`,
              border: `1px solid rgba(255, 255, 255, ${0.1 - i * 0.015})`,
              borderRadius: '50%',
              opacity: interpolate(chartProgress, [0, 1], [0, 1]),
            }}
          />
        ))}

        {/* 数据点和标签 */}
        {data.map((value, i) => {
          const angle = (i / data.length) * Math.PI * 2 - Math.PI / 2;
          const radius = 300;
          const x = Math.cos(angle) * radius * (value / 100) * scale;
          const y = Math.sin(angle) * radius * (value / 100) * scale;

          const labelX = Math.cos(angle) * (radius + 80);
          const labelY = Math.sin(angle) * (radius + 80);

          return (
            <React.Fragment key={i}>
              {/* 数据点 */}
              <div style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: brandColor,
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                boxShadow: `0 0 20px ${brandColor}`,
                zIndex: 5,
              }} />

              {/* 标签 */}
              <div style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${labelX}px), calc(-50% + ${labelY}px))`,
                fontSize: 18,
                fontWeight: '600',
                color: 'white',
                textAlign: 'center',
                zIndex: 6,
              }}>
                {labels[i]}
                <div style={{
                  fontSize: 14,
                  color: brandColor,
                  marginTop: 4,
                }}>
                  {value}%
                </div>
              </div>
            </React.Fragment>
          );
        })}

        {/* 中心点 */}
        <div style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: 'white',
          boxShadow: '0 0 30px rgba(255, 255, 255, 0.5)',
          zIndex: 7,
        }} />
      </div>

      <div style={{
        position: 'absolute',
        top: 80,
        left: 0,
        right: 0,
        textAlign: 'center',
        transform: `translateY(${interpolate(titleProgress, [0, 1], [50, 0])}px)`,
        opacity: interpolate(titleProgress, [0, 1], [0, 1]),
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
          <h1 style={{
            fontSize: 56,
            fontWeight: '800',
            color: 'white',
            margin: 0,
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
