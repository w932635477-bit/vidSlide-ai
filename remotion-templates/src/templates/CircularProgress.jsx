/**
 * 模板12: 环形进度图
 * 特点：SVG圆环绘制动画、渐变描边、中心百分比数字、发光效果、多层圆环
 * 包含：磨砂玻璃、多层阴影、双层边框、渐变光泽、Spring动画
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

export const CircularProgress = ({
  title = '完成进度',
  subtitle = '',
  percentage = 75,
  brandColor = '#2ED573',
  accentColor = '#1ABC9C',
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // 标题动画
  const titleProgress = spring({
    frame: frame - 20,
    fps,
    config: { damping: 105, stiffness: 145 },
  });

  const titleY = interpolate(titleProgress, [0, 1], [50, 0]);
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

  // 圆环动画
  const circleProgress = spring({
    frame: frame - 40,
    fps,
    config: { damping: 70, stiffness: 90, mass: 1 },
  });

  const progress = interpolate(circleProgress, [0, 1], [0, percentage]);
  const radius = 200;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // 数字计数动画
  const numberProgress = spring({
    frame: frame - 50,
    fps,
    config: { damping: 80, stiffness: 100 },
  });

  const displayNumber = Math.round(interpolate(numberProgress, [0, 1], [0, percentage]));

  return (
    <div style={{
      width,
      height,
      background: `radial-gradient(circle at 50% 50%, #1a1a2e 0%, #0f0f1e 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 背景装饰圆环 */}
      {[300, 450, 600].map((size, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: size,
            height: size,
            borderRadius: '50%',
            border: `1px solid ${brandColor}10`,
            transform: 'translate(-50%, -50%)',
            opacity: 0.3,
          }}
        />
      ))}

      {/* 主容器 */}
      <div style={{
        width: 700,
        height: 700,
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(30px) saturate(180%)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // 外边框
        border: '3px solid rgba(255, 255, 255, 0.15)',
        // 多层阴影
        boxShadow: `
          0 60px 140px rgba(0, 0, 0, 0.6),
          0 30px 70px rgba(0, 0, 0, 0.5),
          0 15px 35px rgba(0, 0, 0, 0.4),
          inset 0 2px 0 rgba(255, 255, 255, 0.1)
        `,
      }}>
        {/* 内边框 - 双层效果 */}
        <div style={{
          position: 'absolute',
          inset: 12,
          borderRadius: '50%',
          border: '2px solid rgba(255, 255, 255, 0.08)',
          pointerEvents: 'none',
          zIndex: 10,
        }} />

        {/* SVG圆环 */}
        <svg
          width="500"
          height="500"
          style={{
            position: 'absolute',
            transform: 'rotate(-90deg)',
          }}
        >
          {/* 背景圆环 */}
          <circle
            cx="250"
            cy="250"
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="30"
          />

          {/* 进度圆环 - 渐变 */}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={brandColor} />
              <stop offset="100%" stopColor={accentColor} />
            </linearGradient>
          </defs>

          <circle
            cx="250"
            cy="250"
            r={radius}
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="30"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              filter: `drop-shadow(0 0 20px ${brandColor}80)`,
            }}
          />
        </svg>

        {/* 中心内容 */}
        <div style={{
          textAlign: 'center',
          zIndex: 5,
        }}>
          {/* 百分比数字 */}
          <div style={{
            fontSize: 120,
            fontWeight: '900',
            background: `linear-gradient(135deg, ${brandColor} 0%, ${accentColor} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: `0 0 60px ${brandColor}60`,
            lineHeight: 1,
            marginBottom: 20,
          }}>
            {displayNumber}%
          </div>

          {/* 标签 */}
          <div style={{
            fontSize: 28,
            fontWeight: '600',
            color: 'rgba(255, 255, 255, 0.8)',
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}>
            Complete
          </div>
        </div>

        {/* 发光点 */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: brandColor,
          transform: `
            translate(-50%, -50%)
            rotate(${progress * 3.6 - 90}deg)
            translateY(-${radius}px)
          `,
          boxShadow: `
            0 0 30px ${brandColor},
            0 0 60px ${brandColor}80
          `,
          zIndex: 15,
        }} />
      </div>

      {/* 标题区域 */}
      <div style={{
        position: 'absolute',
        bottom: 80,
        left: 0,
        right: 0,
        textAlign: 'center',
        transform: `translateY(${titleY}px)`,
        opacity: titleOpacity,
      }}>
        <div style={{
          display: 'inline-block',
          padding: '30px 60px',
          borderRadius: 22,
          background: 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(30px)',
          // 外边框
          border: `2px solid ${brandColor}40`,
          boxShadow: `0 25px 70px rgba(0, 0, 0, 0.5), 0 0 60px ${brandColor}20`,
          position: 'relative',
        }}>
          {/* 内边框 */}
          <div style={{
            position: 'absolute',
            inset: 6,
            borderRadius: 18,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            pointerEvents: 'none',
          }} />

          <h1 style={{
            fontSize: 58,
            fontWeight: '800',
            color: 'white',
            margin: 0,
            textShadow: `0 4px 20px rgba(0, 0, 0, 0.6), 0 0 40px ${brandColor}40`,
            letterSpacing: -0.5,
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{
              fontSize: 26,
              color: 'rgba(255, 255, 255, 0.9)',
              margin: '14px 0 0 0',
              fontWeight: '500',
            }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* 品牌标识 */}
      <div style={{
        position: 'absolute',
        top: 50,
        left: 50,
        padding: '20px 40px',
        borderRadius: 18,
        background: 'rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(20px)',
        // 外边框
        border: '2px solid rgba(255, 255, 255, 0.12)',
        fontSize: 22,
        fontWeight: '600',
        color: 'white',
        position: 'relative',
      }}>
        {/* 内边框 */}
        <div style={{
          position: 'absolute',
          inset: 5,
          borderRadius: 14,
          border: '1px solid rgba(255, 255, 255, 0.06)',
          pointerEvents: 'none',
        }} />
        VidSlide AI
      </div>
    </div>
  );
};
