/**
 * 模板5: 极简留白设计
 * 特点：大量留白、细线边框、简约黑白配色、小尺寸卡片、优雅字体排版
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, Img } from 'remotion';

export const MinimalWhiteSpace = ({
  title = '极简主义',
  subtitle = '',
  images = [],
  brandColor = '#000000',
  accentColor = '#666666',
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // 标题动画 - 极其平滑
  const titleProgress = spring({
    frame: frame - 30,
    fps,
    config: { damping: 140, stiffness: 120, mass: 1 },
  });

  const titleY = interpolate(titleProgress, [0, 1], [40, 0]);
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

  // 卡片动画 - 缓慢优雅
  const cardProgress = spring({
    frame: frame - 50,
    fps,
    config: { damping: 130, stiffness: 110, mass: 1.2 },
  });

  const cardScale = interpolate(cardProgress, [0, 1], [0.92, 1]);
  const cardOpacity = interpolate(cardProgress, [0, 1], [0, 1]);

  // 装饰线条动画
  const lineProgress = spring({
    frame: frame - 20,
    fps,
    config: { damping: 120, stiffness: 130 },
  });

  const lineWidth = interpolate(lineProgress, [0, 1], [0, 100]);

  return (
    <div style={{
      width,
      height,
      background: '#FAFAFA',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 顶部装饰线 */}
      <div style={{
        position: 'absolute',
        top: 60,
        left: '50%',
        transform: 'translateX(-50%)',
        width: `${lineWidth}%`,
        height: 1,
        background: `linear-gradient(
          90deg,
          transparent 0%,
          ${accentColor} 50%,
          transparent 100%
        )`,
      }} />

      {/* 底部装饰线 */}
      <div style={{
        position: 'absolute',
        bottom: 60,
        left: '50%',
        transform: 'translateX(-50%)',
        width: `${lineWidth}%`,
        height: 1,
        background: `linear-gradient(
          90deg,
          transparent 0%,
          ${accentColor} 50%,
          transparent 100%
        )`,
      }} />

      {/* 主卡片容器 - 小尺寸居中 */}
      <div style={{
        transform: `scale(${cardScale})`,
        opacity: cardOpacity,
        position: 'relative',
      }}>
        {/* 极简卡片 */}
        <div style={{
          width: 480,
          height: 600,
          borderRadius: 8,
          background: '#FFFFFF',
          position: 'relative',
          // 极细边框
          border: `1px solid ${accentColor}20`,
          // 极其微妙的阴影
          boxShadow: `
            0 20px 60px rgba(0, 0, 0, 0.04),
            0 8px 24px rgba(0, 0, 0, 0.03),
            0 2px 8px rgba(0, 0, 0, 0.02)
          `,
        }}>
          {/* 内容区域 - 大量留白 */}
          <div style={{
            position: 'absolute',
            inset: 50,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {/* 图片或占位内容 */}
            <div style={{
              width: '100%',
              maxWidth: 320,
              aspectRatio: '4/5',
              position: 'relative',
            }}>
              {images[0] ? (
                <Img
                  src={images[0]}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 4,
                    filter: 'grayscale(20%) contrast(1.05)',
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  border: `1px solid ${accentColor}15`,
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#FAFAFA',
                }}>
                  <div style={{
                    fontSize: 120,
                    fontWeight: '200',
                    color: accentColor,
                    letterSpacing: -2,
                  }}>
                    M
                  </div>
                </div>
              )}
            </div>

            {/* 装饰元素 - 小方块 */}
            <div style={{
              marginTop: 30,
              width: 40,
              height: 1,
              background: brandColor,
            }} />
          </div>

          {/* 序号标识 - 左上角 */}
          <div style={{
            position: 'absolute',
            top: 25,
            left: 25,
            fontSize: 14,
            fontWeight: '400',
            color: accentColor,
            letterSpacing: 2,
            fontFamily: 'monospace',
          }}>
            01
          </div>

          {/* 年份标识 - 右上角 */}
          <div style={{
            position: 'absolute',
            top: 25,
            right: 25,
            fontSize: 14,
            fontWeight: '400',
            color: accentColor,
            letterSpacing: 1,
            fontFamily: 'monospace',
          }}>
            2026
          </div>
        </div>
      </div>

      {/* 标题区域 - 极简排版 */}
      <div style={{
        position: 'absolute',
        bottom: 120,
        left: 0,
        right: 0,
        textAlign: 'center',
        transform: `translateY(${titleY}px)`,
        opacity: titleOpacity,
      }}>
        <h1 style={{
          fontSize: 48,
          fontWeight: '300',
          color: brandColor,
          margin: 0,
          letterSpacing: 4,
          textTransform: 'uppercase',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{
            fontSize: 16,
            color: accentColor,
            margin: '20px 0 0 0',
            fontWeight: '400',
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* 品牌标识 - 极简风格 */}
      <div style={{
        position: 'absolute',
        top: 50,
        left: 50,
        fontSize: 16,
        fontWeight: '400',
        color: brandColor,
        letterSpacing: 1,
        borderBottom: `1px solid ${brandColor}`,
        paddingBottom: 4,
      }}>
        VidSlide AI
      </div>

      {/* 右下角装饰 */}
      <div style={{
        position: 'absolute',
        bottom: 50,
        right: 50,
        width: 60,
        height: 60,
        border: `1px solid ${accentColor}20`,
        borderRadius: '50%',
        opacity: interpolate(cardProgress, [0, 1], [0, 0.3]),
      }} />
    </div>
  );
};
