/**
 * 多层竖版视频模板 - 专为抖音优化
 *
 * 架构设计:
 * - 第1层: 背景素材层 (全屏，磨砂玻璃效果)
 * - 第2层: Remotion模板层 (透明背景，文字+可选图表)
 * - 第3层: 人脸画中画层 (圆形遮罩) - 由服务器端FFmpeg处理
 *
 * 特点:
 * - 竖版 1080x1920 (9:16)
 * - 磨砂玻璃背景效果
 * - 智能文字提取和动画
 * - 可选数据可视化
 * - 最小化装饰元素
 *
 * @author VidSlide AI Team
 * @version 1.0.0
 */

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill } from 'remotion';

export const MultiLayerVertical = ({
  // 基础内容
  title = '标题文字',
  subtitle = '',
  content = '',

  // 素材
  backgroundMaterial = null, // 背景素材URL

  // 图表数据 (可选)
  chartData = null, // { type, labels, values, colors }

  // 样式配置
  brandColor = '#3742FA',
  accentColor = '#FF6B6B',
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // ========== 动画配置 ==========

  // 标题动画
  const titleProgress = spring({
    frame: frame - 10,
    fps,
    config: { damping: 100, stiffness: 140 },
  });
  const titleY = interpolate(titleProgress, [0, 1], [30, 0]);
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

  // 副标题动画
  const subtitleProgress = spring({
    frame: frame - 20,
    fps,
    config: { damping: 100, stiffness: 140 },
  });
  const subtitleOpacity = interpolate(subtitleProgress, [0, 1], [0, 1]);

  // 内容动画
  const contentProgress = spring({
    frame: frame - 30,
    fps,
    config: { damping: 100, stiffness: 140 },
  });
  const contentOpacity = interpolate(contentProgress, [0, 1], [0, 1]);

  // 图表动画
  const chartProgress = spring({
    frame: frame - 40,
    fps,
    config: { damping: 95, stiffness: 135 },
  });
  const chartScale = interpolate(chartProgress, [0, 1], [0.9, 1]);
  const chartOpacity = interpolate(chartProgress, [0, 1], [0, 1]);

  // ========== 渲染 ==========

  return (
    <AbsoluteFill>
      {/* ==================== 第1层: 背景素材层 ==================== */}
      {backgroundMaterial && (
        <div style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          zIndex: 1,
        }}>
          {/* 背景图片 */}
          <img
            src={backgroundMaterial}
            alt="background"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              // 缓慢放大动画 (Ken Burns效果)
              transform: `scale(${1.05 + frame * 0.00008})`,
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

      {/* ==================== 第2层: 内容层 ==================== */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 2,
        // 如果没有背景素材，使用渐变背景
        background: backgroundMaterial
          ? 'transparent'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: chartData ? 'flex-start' : 'center',
        padding: '80px 40px',
        paddingTop: chartData ? '120px' : '80px',
      }}>

        {/* 标题区域 */}
        <div style={{
          textAlign: 'center',
          marginBottom: chartData ? '60px' : '40px',
          transform: `translateY(${titleY}px)`,
          opacity: titleOpacity,
          maxWidth: '90%',
        }}>
          {/* 标题卡片 */}
          <div style={{
            display: 'inline-block',
            padding: '32px 48px',
            borderRadius: 24,
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
            position: 'relative',
          }}>
            {/* 内边框 */}
            <div style={{
              position: 'absolute',
              inset: 6,
              borderRadius: 20,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              pointerEvents: 'none',
            }} />

            {/* 标题文字 */}
            <h1 style={{
              fontSize: 64,
              fontWeight: '800',
              color: 'white',
              margin: 0,
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.6)',
              letterSpacing: -1,
              lineHeight: 1.2,
            }}>
              {title}
            </h1>

            {/* 副标题 */}
            {subtitle && (
              <p style={{
                fontSize: 28,
                color: 'rgba(255, 255, 255, 0.9)',
                margin: '16px 0 0 0',
                fontWeight: '500',
                opacity: subtitleOpacity,
              }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* 内容文字 (如果没有图表) */}
        {!chartData && content && (
          <div style={{
            maxWidth: '80%',
            textAlign: 'center',
            opacity: contentOpacity,
          }}>
            <p style={{
              fontSize: 32,
              color: 'rgba(255, 255, 255, 0.95)',
              lineHeight: 1.6,
              margin: 0,
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.4)',
              fontWeight: '400',
            }}>
              {content}
            </p>
          </div>
        )}

        {/* 图表区域 (可选) */}
        {chartData && (
          <div style={{
            transform: `scale(${chartScale})`,
            opacity: chartOpacity,
            width: '90%',
            maxWidth: '900px',
          }}>
            {/* 图表卡片 */}
            <div style={{
              borderRadius: 32,
              background: 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(25px) saturate(180%)',
              WebkitBackdropFilter: 'blur(25px) saturate(180%)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              boxShadow: `
                0 40px 100px rgba(0, 0, 0, 0.5),
                0 20px 50px rgba(0, 0, 0, 0.4),
                inset 0 2px 0 rgba(255, 255, 255, 0.15)
              `,
              padding: '50px',
              position: 'relative',
            }}>
              {/* 内边框 */}
              <div style={{
                position: 'absolute',
                inset: 8,
                borderRadius: 28,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                pointerEvents: 'none',
                zIndex: 10,
              }} />

              {/* 顶部光泽 */}
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

              {/* 图表内容 */}
              {chartData.type === 'bar' && (
                <BarChart
                  data={chartData}
                  frame={frame}
                  fps={fps}
                  brandColor={brandColor}
                />
              )}
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
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '2px solid rgba(255, 255, 255, 0.15)',
          fontSize: 20,
          fontWeight: '600',
          color: 'white',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
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

// ========== 柱状图组件 ==========
const BarChart = ({ data, frame, fps, brandColor }) => {
  const { labels, values, colors } = data;

  return (
    <div style={{
      width: '100%',
      height: '500px',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-around',
      gap: 30,
      position: 'relative',
      paddingTop: 60,
    }}>
      {/* Y轴网格线 */}
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

      {/* 柱状图 */}
      {labels.map((label, index) => {
        const barProgress = spring({
          frame: frame - 50 - index * 8,
          fps,
          config: { damping: 80, stiffness: 100 },
        });

        const barHeight = interpolate(barProgress, [0, 1], [0, values[index]]);
        const valueOpacity = interpolate(barProgress, [0, 0.8, 1], [0, 0, 1]);
        const color = colors[index];

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
            {/* 数值标签 */}
            <div style={{
              fontSize: 28,
              fontWeight: '700',
              color: color,
              opacity: valueOpacity,
              textShadow: `0 0 20px ${color}60`,
            }}>
              {Math.round(barHeight)}%
            </div>

            {/* 柱子 */}
            <div style={{
              width: '100%',
              height: `${barHeight}%`,
              borderRadius: '12px 12px 0 0',
              background: `linear-gradient(180deg, ${color} 0%, ${color}80 100%)`,
              position: 'relative',
              border: `2px solid ${color}40`,
              boxShadow: `
                0 -10px 30px ${color}40,
                inset 0 2px 0 rgba(255, 255, 255, 0.3)
              `,
            }}>
              {/* 柱子顶部高光 */}
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

            {/* X轴标签 */}
            <div style={{
              fontSize: 18,
              fontWeight: '600',
              color: 'rgba(255, 255, 255, 0.8)',
              marginTop: 10,
              textAlign: 'center',
            }}>
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
};
