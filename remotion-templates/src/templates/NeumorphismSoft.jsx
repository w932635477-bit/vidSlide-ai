/**
 * 模板3: 新拟态柔和风格
 * 特点：浅色背景、柔和内外阴影、凸起/凹陷效果、无边框纯阴影塑形
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, Img } from 'remotion';

export const NeumorphismSoft = ({
  title = '新拟态设计',
  subtitle = '',
  images = [],
  brandColor = '#5B9FED',
  backgroundColor = '#e0e5ec',
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // 标题动画
  const titleProgress = spring({
    frame: frame - 20,
    fps,
    config: { damping: 100, stiffness: 150, mass: 0.5 },
  });

  const titleY = interpolate(titleProgress, [0, 1], [50, 0]);
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

  // 卡片动画
  const cardProgress = spring({
    frame: frame - 35,
    fps,
    config: { damping: 90, stiffness: 140, mass: 0.6 },
  });

  const cardScale = interpolate(cardProgress, [0, 1], [0.85, 1]);
  const cardOpacity = interpolate(cardProgress, [0, 1], [0, 1]);

  // 浮动动画
  const floatY = Math.sin(frame / 30) * 8;

  return (
    <div style={{
      width,
      height,
      background: backgroundColor,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 背景装饰圆形 - 凹陷效果 */}
      <div style={{
        position: 'absolute',
        top: '15%',
        right: '10%',
        width: 200,
        height: 200,
        borderRadius: '50%',
        background: backgroundColor,
        boxShadow: `
          inset 12px 12px 24px rgba(163, 177, 198, 0.6),
          inset -12px -12px 24px rgba(255, 255, 255, 0.5)
        `,
      }} />

      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '8%',
        width: 150,
        height: 150,
        borderRadius: '50%',
        background: backgroundColor,
        boxShadow: `
          inset 10px 10px 20px rgba(163, 177, 198, 0.6),
          inset -10px -10px 20px rgba(255, 255, 255, 0.5)
        `,
      }} />

      {/* 主卡片容器 */}
      <div style={{
        transform: `scale(${cardScale}) translateY(${floatY}px)`,
        opacity: cardOpacity,
        position: 'relative',
      }}>
        {/* 新拟态卡片 - 凸起效果 */}
        <div style={{
          width: 550,
          height: 650,
          borderRadius: 40,
          background: backgroundColor,
          position: 'relative',
          // 新拟态核心：柔和的外阴影（凸起效果）
          boxShadow: `
            20px 20px 60px rgba(163, 177, 198, 0.5),
            -20px -20px 60px rgba(255, 255, 255, 0.8),
            inset 2px 2px 4px rgba(255, 255, 255, 0.3),
            inset -2px -2px 4px rgba(163, 177, 198, 0.2)
          `,
        }}>
          {/* 内容区域 - 凹陷效果 */}
          <div style={{
            position: 'absolute',
            inset: 30,
            borderRadius: 30,
            background: backgroundColor,
            overflow: 'hidden',
            // 凹陷效果
            boxShadow: `
              inset 8px 8px 16px rgba(163, 177, 198, 0.4),
              inset -8px -8px 16px rgba(255, 255, 255, 0.6)
            `,
          }}>
            {/* 图片或占位内容 */}
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}>
              {images[0] ? (
                <Img
                  src={images[0]}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 20,
                  }}
                />
              ) : (
                <div style={{
                  fontSize: 80,
                  fontWeight: '700',
                  color: brandColor,
                  textShadow: `
                    2px 2px 4px rgba(163, 177, 198, 0.3),
                    -2px -2px 4px rgba(255, 255, 255, 0.8)
                  `,
                  textAlign: 'center',
                  lineHeight: 1.2,
                }}>
                  Soft<br/>Design
                </div>
              )}
            </div>
          </div>

          {/* 装饰按钮 - 凸起效果 */}
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                bottom: 40 + i * 70,
                right: 40,
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: backgroundColor,
                boxShadow: `
                  6px 6px 12px rgba(163, 177, 198, 0.4),
                  -6px -6px 12px rgba(255, 255, 255, 0.7)
                `,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                color: brandColor,
                opacity: interpolate(cardProgress, [0, 1], [0, 1 - i * 0.2]),
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* 标题区域 - 凸起卡片 */}
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
          borderRadius: 25,
          background: backgroundColor,
          boxShadow: `
            15px 15px 30px rgba(163, 177, 198, 0.5),
            -15px -15px 30px rgba(255, 255, 255, 0.8)
          `,
        }}>
          <h1 style={{
            fontSize: 58,
            fontWeight: '700',
            color: '#4a5568',
            margin: 0,
            textShadow: `
              2px 2px 4px rgba(163, 177, 198, 0.3),
              -1px -1px 2px rgba(255, 255, 255, 0.8)
            `,
            letterSpacing: -0.5,
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{
              fontSize: 24,
              color: '#718096',
              margin: '12px 0 0 0',
              fontWeight: '500',
              textShadow: `
                1px 1px 2px rgba(163, 177, 198, 0.2),
                -1px -1px 2px rgba(255, 255, 255, 0.6)
              `,
            }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* 品牌标识 - 凸起按钮 */}
      <div style={{
        position: 'absolute',
        top: 50,
        left: 50,
        padding: '18px 35px',
        borderRadius: 20,
        background: backgroundColor,
        boxShadow: `
          10px 10px 20px rgba(163, 177, 198, 0.4),
          -10px -10px 20px rgba(255, 255, 255, 0.7)
        `,
        fontSize: 20,
        fontWeight: '600',
        color: '#4a5568',
        textShadow: `
          1px 1px 2px rgba(163, 177, 198, 0.2),
          -1px -1px 2px rgba(255, 255, 255, 0.6)
        `,
      }}>
        VidSlide AI
      </div>
    </div>
  );
};
