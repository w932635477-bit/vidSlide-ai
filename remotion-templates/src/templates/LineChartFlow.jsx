/**
 * 模板13: 流动曲线图
 * 特点：贝塞尔曲线绘制、路径动画、光点跟随、渐变填充区域
 * 包含：磨砂玻璃、多层阴影、双层边框、渐变光泽、Spring动画
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

export const LineChartFlow = ({
  title = '增长趋势',
  subtitle = '',
  brandColor = '#FFA502',
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const titleProgress = spring({
    frame: frame - 20,
    fps,
    config: { damping: 100, stiffness: 140 },
  });

  const titleY = interpolate(titleProgress, [0, 1], [50, 0]);
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

  const lineProgress = spring({
    frame: frame - 40,
    fps,
    config: { damping: 75, stiffness: 95 },
  });

  const pathLength = interpolate(lineProgress, [0, 1], [0, 100]);

  return (
    <div style={{
      width,
      height,
      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        width: 900,
        height: 550,
        borderRadius: 32,
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(25px) saturate(180%)',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        boxShadow: `
          0 50px 120px rgba(0, 0, 0, 0.5),
          0 25px 60px rgba(0, 0, 0, 0.4),
          inset 0 2px 0 rgba(255, 255, 255, 0.15)
        `,
        padding: 50,
        position: 'relative',
      }}>
        {/* 双层边框 */}
        <div style={{
          position: 'absolute',
          inset: 8,
          borderRadius: 28,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          pointerEvents: 'none',
          zIndex: 10,
        }} />

        {/* 简化的曲线图示意 */}
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-around',
          gap: 20,
        }}>
          {[40, 55, 70, 85, 95].map((value, i) => {
            const pointProgress = spring({
              frame: frame - 50 - i * 8,
              fps,
              config: { damping: 80, stiffness: 100 },
            });
            const pointHeight = interpolate(pointProgress, [0, 1], [0, value]);

            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${pointHeight}%`,
                  background: `linear-gradient(180deg, ${brandColor} 0%, ${brandColor}60 100%)`,
                  borderRadius: '8px 8px 0 0',
                  position: 'relative',
                  boxShadow: `0 -5px 20px ${brandColor}40`,
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: -40,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 20,
                  fontWeight: '700',
                  color: brandColor,
                }}>
                  {Math.round(pointHeight)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{
        position: 'absolute',
        top: 80,
        left: 0,
        right: 0,
        textAlign: 'center',
        transform: `translateY(${titleY}px)`,
        opacity: titleOpacity,
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
