/**
 * 模板8: 对角线分割对比
 * 特点：45度对角线分割、三角形遮罩、动态分割线移动、不对称布局
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, Img } from 'remotion';

export const DiagonalSplit = ({
  title = '对角线对比',
  subtitle = '',
  leftImage = null,
  rightImage = null,
  leftLabel = '方案A',
  rightLabel = '方案B',
  brandColor = '#FF6B6B',
  accentColor = '#4ECDC4',
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // 标题动画
  const titleProgress = spring({
    frame: frame - 25,
    fps,
    config: { damping: 100, stiffness: 140 },
  });

  const titleY = interpolate(titleProgress, [0, 1], [50, 0]);
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

  // 对角线动画 - 从左上到右下扫过
  const diagonalProgress = spring({
    frame: frame - 35,
    fps,
    config: { damping: 85, stiffness: 110, mass: 0.8 },
  });

  const diagonalOffset = interpolate(diagonalProgress, [0, 1], [-100, 100]);

  return (
    <div style={{
      width,
      height,
      background: `linear-gradient(135deg, #2c3e50 0%, #34495e 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 主对比容器 */}
      <div style={{
        width: 900,
        height: 650,
        position: 'relative',
        borderRadius: 28,
        overflow: 'hidden',
        // 磨砂玻璃边框
        border: '2px solid rgba(255, 255, 255, 0.2)',
        // 多层阴影
        boxShadow: `
          0 50px 120px rgba(0, 0, 0, 0.5),
          0 25px 60px rgba(0, 0, 0, 0.4),
          0 12px 30px rgba(0, 0, 0, 0.3),
          inset 0 2px 0 rgba(255, 255, 255, 0.1)
        `,
      }}>
        {/* 右下部分 - 方案B */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: rightImage
            ? 'transparent'
            : `linear-gradient(135deg, ${accentColor}40 0%, ${accentColor}60 100%)`,
        }}>
          {rightImage ? (
            <Img
              src={rightImage}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 140,
              fontWeight: '900',
              color: accentColor,
              opacity: 0.3,
            }}>
              B
            </div>
          )}
        </div>

        {/* 左上部分 - 方案A（对角线遮罩） */}
        <div style={{
          position: 'absolute',
          inset: 0,
          clipPath: `polygon(
            0 0,
            100% 0,
            ${50 + diagonalOffset}% ${50 - diagonalOffset}%,
            0 100%
          )`,
          background: leftImage
            ? 'transparent'
            : `linear-gradient(135deg, ${brandColor}40 0%, ${brandColor}60 100%)`,
        }}>
          {leftImage ? (
            <Img
              src={leftImage}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 140,
              fontWeight: '900',
              color: brandColor,
              opacity: 0.3,
            }}>
              A
            </div>
          )}
        </div>

        {/* 对角线分割线 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '141.4%', // sqrt(2) * 100%
          height: 6,
          background: `linear-gradient(90deg,
            ${brandColor} 0%,
            white 50%,
            ${accentColor} 100%
          )`,
          transform: `rotate(45deg) translate(${diagonalOffset * 5}px, ${-diagonalOffset * 5}px)`,
          transformOrigin: 'top left',
          boxShadow: `
            0 0 30px rgba(255, 255, 255, 0.6),
            0 0 60px rgba(255, 255, 255, 0.4)
          `,
          zIndex: 10,
        }} />

        {/* 方案A标签 - 左上角 */}
        <div style={{
          position: 'absolute',
          top: 35,
          left: 35,
          padding: '14px 28px',
          borderRadius: 14,
          background: `${brandColor}dd`,
          backdropFilter: 'blur(15px)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          fontSize: 20,
          fontWeight: '700',
          color: 'white',
          letterSpacing: 1,
          boxShadow: `
            0 8px 24px ${brandColor}60,
            0 4px 12px rgba(0, 0, 0, 0.3)
          `,
          zIndex: 20,
        }}>
          {leftLabel}
        </div>

        {/* 方案B标签 - 右下角 */}
        <div style={{
          position: 'absolute',
          bottom: 35,
          right: 35,
          padding: '14px 28px',
          borderRadius: 14,
          background: `${accentColor}dd`,
          backdropFilter: 'blur(15px)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          fontSize: 20,
          fontWeight: '700',
          color: 'white',
          letterSpacing: 1,
          boxShadow: `
            0 8px 24px ${accentColor}60,
            0 4px 12px rgba(0, 0, 0, 0.3)
          `,
          zIndex: 20,
        }}>
          {rightLabel}
        </div>

        {/* 装饰三角形 - 左下角 */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: 0,
          height: 0,
          borderLeft: '80px solid transparent',
          borderBottom: `80px solid ${brandColor}40`,
          opacity: interpolate(diagonalProgress, [0, 1], [0, 0.6]),
        }} />

        {/* 装饰三角形 - 右上角 */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 0,
          height: 0,
          borderRight: '80px solid transparent',
          borderTop: `80px solid ${accentColor}40`,
          opacity: interpolate(diagonalProgress, [0, 1], [0, 0.6]),
        }} />
      </div>

      {/* 标题区域 */}
      <div style={{
        position: 'absolute',
        bottom: 70,
        left: 0,
        right: 0,
        textAlign: 'center',
        transform: `translateY(${titleY}px)`,
        opacity: titleOpacity,
      }}>
        <div style={{
          display: 'inline-block',
          padding: '28px 55px',
          borderRadius: 20,
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(30px)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.4)',
        }}>
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

      {/* 品牌标识 */}
      <div style={{
        position: 'absolute',
        top: 50,
        left: 50,
        padding: '18px 36px',
        borderRadius: 16,
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        fontSize: 20,
        fontWeight: '600',
        color: 'white',
      }}>
        VidSlide AI
      </div>
    </div>
  );
};
