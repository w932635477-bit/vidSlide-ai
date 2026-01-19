/**
 * 模板11: 动态柱状图
 * 特点：柱状图从底部生长动画、渐变填充、网格背景、数值标签、坐标轴
 * 包含：磨砂玻璃、多层阴影、双层边框、渐变光泽、Spring动画
 * 新增：背景素材层、可选图表数据
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill } from 'remotion';

export const AnimatedBarChart = ({
  title = '数据增长',
  subtitle = '',
  chartData = null, // 接收图表数据（可选）
  backgroundMaterial = null, // 背景素材
  data = [
    { label: 'Q1', value: 65, color: '#3498DB' },
    { label: 'Q2', value: 78, color: '#2ECC71' },
    { label: 'Q3', value: 85, color: '#F39C12' },
    { label: 'Q4', value: 92, color: '#E74C3C' },
  ],
  brandColor = '#3742FA',
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // 使用传入的chartData，如果没有则使用默认data
  const displayData = chartData ? chartData.labels.map((label, i) => ({
    label,
    value: chartData.values[i],
    color: chartData.colors[i]
  })) : data;

  // 标题动画
  const titleProgress = spring({
    frame: frame - 20,
    fps,
    config: { damping: 100, stiffness: 140 },
  });

  const titleY = interpolate(titleProgress, [0, 1], [50, 0]);
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

  // 图表容器动画
  const chartProgress = spring({
    frame: frame - 35,
    fps,
    config: { damping: 95, stiffness: 135 },
  });

  const chartScale = interpolate(chartProgress, [0, 1], [0.9, 1]);
  const chartOpacity = interpolate(chartProgress, [0, 1], [0, 1]);

  return (
    <AbsoluteFill>
      {/* 第1层: 背景素材 - 磨砂玻璃效果 */}
      {backgroundMaterial && (
        <div style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
        }}>
          <img
            src={backgroundMaterial}
            alt="background"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `scale(${1.1 + frame * 0.0001})`, // 缓慢放大
            }}
          />
          {/* 磨砂玻璃遮罩层 */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backdropFilter: 'blur(10px) saturate(180%)',
            WebkitBackdropFilter: 'blur(10px) saturate(180%)',
            backgroundColor: 'rgba(0, 0, 0, 0.3)', // 轻度暗化
          }} />
        </div>
      )}

      {/* 第2层: 内容层 */}
      <div style={{
        width,
        height,
        background: backgroundMaterial
          ? 'transparent'
          : `linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* 背景网格 - 仅在没有背景素材时显示 */}
        {!backgroundMaterial && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(${brandColor}08 1px, transparent 1px),
              linear-gradient(90deg, ${brandColor}08 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            opacity: 0.3,
          }} />
        )}

        {/* 标题区域 */}
        <div style={{
          position: 'absolute',
          top: chartData ? 80 : '50%',
          left: 0,
          right: 0,
          textAlign: 'center',
          transform: chartData ? `translateY(${titleY}px)` : `translate(0, -50%) translateY(${titleY}px)`,
          opacity: titleOpacity,
        }}>
          <div style={{
            display: 'inline-block',
            padding: '28px 56px',
            borderRadius: 20,
            background: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(30px)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 25px 70px rgba(0, 0, 0, 0.4)',
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
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
              letterSpacing: -0.5,
            }}>
              {title}
            </h1>
            {subtitle && (
              <p style={{
                fontSize: 24,
                color: 'rgba(255, 255, 255, 0.9)',
                margin: '12px 0 0 0',
                fontWeight: '500',
              }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* 图表区域 - 仅在有数据时显示 */}
        {chartData && (
          <div style={{
            transform: `scale(${chartScale})`,
            opacity: chartOpacity,
            position: 'relative',
          }}>
            <div style={{
              width: 900,
              height: 600,
              borderRadius: 32,
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(25px) saturate(180%)',
              position: 'relative',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              boxShadow: `
                0 50px 120px rgba(0, 0, 0, 0.5),
                0 25px 60px rgba(0, 0, 0, 0.4),
                0 12px 30px rgba(0, 0, 0, 0.3),
                inset 0 2px 0 rgba(255, 255, 255, 0.15)
              `,
              padding: 50,
            }}>
              <div style={{
                position: 'absolute',
                inset: 8,
                borderRadius: 28,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                pointerEvents: 'none',
                zIndex: 10,
              }} />

              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '40%',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)',
                borderRadius: '32px 32px 0 0',
                pointerEvents: 'none',
                zIndex: 5,
              }} />

              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-around',
                gap: 40,
                position: 'relative',
                paddingTop: 60,
              }}>
                {[0, 25, 50, 75, 100].map((value) => (
                  <div
                    key={value}
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: `${value}%`,
                      height: 1,
                      background: 'rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{
                      position: 'absolute',
                      left: -40,
                      fontSize: 14,
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontWeight: '500',
                    }}>
                      {value}
                    </span>
                  </div>
                ))}

                {displayData.map((item, index) => {
                  const barProgress = spring({
                    frame: frame - 50 - index * 8,
                    fps,
                    config: { damping: 80, stiffness: 100 },
                  });

                  const barHeight = interpolate(barProgress, [0, 1], [0, item.value]);
                  const valueOpacity = interpolate(barProgress, [0, 0.8, 1], [0, 0, 1]);

                  return (
                    <div
                      key={index}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 15,
                      }}
                    >
                      <div style={{
                        fontSize: 28,
                        fontWeight: '700',
                        color: item.color,
                        opacity: valueOpacity,
                        textShadow: `0 0 20px ${item.color}60`,
                      }}>
                        {Math.round(barHeight)}%
                      </div>

                      <div style={{
                        width: '100%',
                        height: `${barHeight}%`,
                        borderRadius: '12px 12px 0 0',
                        background: `linear-gradient(180deg, ${item.color} 0%, ${item.color}80 100%)`,
                        position: 'relative',
                        border: `2px solid ${item.color}40`,
                        boxShadow: `
                          0 -10px 30px ${item.color}40,
                          inset 0 2px 0 rgba(255, 255, 255, 0.3)
                        `,
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 4,
                          background: 'rgba(255, 255, 255, 0.5)',
                          borderRadius: '12px 12px 0 0',
                        }} />
                      </div>

                      <div style={{
                        fontSize: 20,
                        fontWeight: '600',
                        color: 'rgba(255, 255, 255, 0.8)',
                        marginTop: 10,
                      }}>
                        {item.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 品牌标识 */}
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
    </AbsoluteFill>
  );
};
