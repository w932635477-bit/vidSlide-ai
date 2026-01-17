/**
 * 模板7: 前后滑动对比
 * 特点：滑动遮罩效果、拖动手柄、Before/After标签、滑动动画、对比线条
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, Img } from 'remotion';

export const BeforeAfterSlider = ({
  title = '前后对比',
  subtitle = '',
  leftImage = null,
  rightImage = null,
  leftLabel = 'BEFORE',
  rightLabel = 'AFTER',
  brandColor = '#007AFF',
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // 标题动画
  const titleProgress = spring({
    frame: frame - 20,
    fps,
    config: { damping: 110, stiffness: 150 },
  });

  const titleY = interpolate(titleProgress, [0, 1], [50, 0]);
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

  // 滑块动画 - 从左到右再回中间
  const sliderProgress = spring({
    frame: frame - 40,
    fps,
    config: { damping: 80, stiffness: 100, mass: 1 },
  });

  // 滑块位置：0% -> 100% -> 50%
  let sliderPosition;
  if (frame < 100) {
    sliderPosition = interpolate(sliderProgress, [0, 1], [0, 100]);
  } else {
    const returnProgress = spring({
      frame: frame - 100,
      fps,
      config: { damping: 90, stiffness: 120 },
    });
    sliderPosition = interpolate(returnProgress, [0, 1], [100, 50]);
  }

  return (
    <div style={{
      width,
      height,
      background: `
        linear-gradient(135deg,
          #1e3c72 0%,
          #2a5298 50%,
          #1e3c72 100%)
      `,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 背景装饰 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 30% 40%, ${brandColor}10 0%, transparent 50%),
          radial-gradient(circle at 70% 60%, rgba(255,255,255,0.03) 0%, transparent 50%)
        `,
      }} />

      {/* 主对比容器 */}
      <div style={{
        width: 800,
        height: 600,
        position: 'relative',
        borderRadius: 24,
        overflow: 'hidden',
        // 磨砂玻璃边框
        border: '2px solid rgba(255, 255, 255, 0.2)',
        // 多层阴影
        boxShadow: `
          0 40px 100px rgba(0, 0, 0, 0.4),
          0 20px 50px rgba(0, 0, 0, 0.3),
          0 10px 25px rgba(0, 0, 0, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.1)
        `,
      }}>
        {/* AFTER 图片（右侧/底层） */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: rightImage
            ? 'transparent'
            : `linear-gradient(135deg, ${brandColor}30 0%, ${brandColor}50 100%)`,
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
              fontSize: 120,
              fontWeight: '900',
              color: brandColor,
            }}>
              AFTER
            </div>
          )}
        </div>

        {/* BEFORE 图片（左侧/顶层，带遮罩） */}
        <div style={{
          position: 'absolute',
          inset: 0,
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
          background: leftImage
            ? 'transparent'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
              fontSize: 120,
              fontWeight: '900',
              color: 'white',
            }}>
              BEFORE
            </div>
          )}
        </div>

        {/* 分割线 + 手柄 */}
        <div style={{
          position: 'absolute',
          left: `${sliderPosition}%`,
          top: 0,
          bottom: 0,
          width: 4,
          background: 'white',
          transform: 'translateX(-50%)',
          boxShadow: `
            0 0 20px rgba(255, 255, 255, 0.5),
            0 0 40px rgba(255, 255, 255, 0.3)
          `,
          zIndex: 10,
        }}>
          {/* 手柄圆形 */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'white',
            border: '3px solid rgba(0, 0, 0, 0.1)',
            boxShadow: `
              0 8px 24px rgba(0, 0, 0, 0.3),
              0 4px 12px rgba(0, 0, 0, 0.2),
              inset 0 2px 4px rgba(255, 255, 255, 0.8)
            `,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {/* 左右箭头 */}
            <div style={{
              fontSize: 24,
              color: '#333',
              fontWeight: '900',
            }}>
              ⟷
            </div>
          </div>
        </div>

        {/* BEFORE 标签 */}
        <div style={{
          position: 'absolute',
          top: 30,
          left: 30,
          padding: '12px 24px',
          borderRadius: 12,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          fontSize: 18,
          fontWeight: '700',
          color: 'white',
          letterSpacing: 2,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        }}>
          {leftLabel}
        </div>

        {/* AFTER 标签 */}
        <div style={{
          position: 'absolute',
          top: 30,
          right: 30,
          padding: '12px 24px',
          borderRadius: 12,
          background: `rgba(${brandColor === '#007AFF' ? '0, 122, 255' : '102, 126, 234'}, 0.8)`,
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          fontSize: 18,
          fontWeight: '700',
          color: 'white',
          letterSpacing: 2,
          boxShadow: `0 4px 12px ${brandColor}40`,
        }}>
          {rightLabel}
        </div>
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
          padding: '25px 50px',
          borderRadius: 18,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}>
          <h1 style={{
            fontSize: 54,
            fontWeight: '800',
            color: 'white',
            margin: 0,
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
            letterSpacing: -0.5,
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{
              fontSize: 22,
              color: 'rgba(255, 255, 255, 0.9)',
              margin: '10px 0 0 0',
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
        padding: '16px 32px',
        borderRadius: 14,
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        fontSize: 19,
        fontWeight: '600',
        color: 'white',
      }}>
        VidSlide AI
      </div>
    </div>
  );
};
