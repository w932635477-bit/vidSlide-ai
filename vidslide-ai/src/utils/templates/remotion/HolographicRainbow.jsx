/**
 * 模板4: 全息彩虹效果
 * 特点：彩虹渐变边框、全息光泽、彩色光点粒子、镭射质感、未来科技感
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, Img } from 'remotion';

export const HolographicRainbow = ({
  title = '全息投影',
  subtitle = '',
  images = [],
  brandColor = '#00F5FF',
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // 标题动画
  const titleProgress = spring({
    frame: frame - 25,
    fps,
    config: { damping: 110, stiffness: 160, mass: 0.7 },
  });

  const titleY = interpolate(titleProgress, [0, 1], [60, 0]);
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

  // 卡片动画
  const cardProgress = spring({
    frame: frame - 40,
    fps,
    config: { damping: 95, stiffness: 145, mass: 0.65 },
  });

  const cardScale = interpolate(cardProgress, [0, 1], [0.7, 1]);
  const cardRotate = interpolate(cardProgress, [0, 1], [15, 0]);
  const cardOpacity = interpolate(cardProgress, [0, 1], [0, 1]);

  // 彩虹边框旋转动画
  const rainbowRotate = (frame * 2) % 360;

  // 粒子动画
  const particles = Array.from({ length: 20 }, (_, i) => {
    const angle = (i / 20) * Math.PI * 2;
    const distance = 300 + Math.sin(frame / 20 + i) * 50;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    const opacity = (Math.sin(frame / 15 + i) + 1) / 2;

    return { x, y, opacity, hue: (i / 20) * 360 };
  });

  return (
    <div style={{
      width,
      height,
      background: `
        radial-gradient(circle at 50% 50%, #0a0a1a 0%, #000000 100%)
      `,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 彩色粒子背景 */}
      {particles.map((particle, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: `hsl(${particle.hue}, 100%, 60%)`,
            boxShadow: `0 0 20px hsl(${particle.hue}, 100%, 60%)`,
            transform: `translate(${particle.x}px, ${particle.y}px)`,
            opacity: particle.opacity * 0.6,
          }}
        />
      ))}

      {/* 主卡片容器 */}
      <div style={{
        transform: `scale(${cardScale}) rotate(${cardRotate}deg)`,
        opacity: cardOpacity,
        position: 'relative',
      }}>
        {/* 彩虹边框容器（旋转） */}
        <div style={{
          width: 600,
          height: 700,
          borderRadius: 35,
          padding: 4,
          background: `conic-gradient(
            from ${rainbowRotate}deg,
            #ff0080,
            #ff8c00,
            #ffd700,
            #00ff00,
            #00ffff,
            #0080ff,
            #8000ff,
            #ff0080
          )`,
          position: 'relative',
          // 外层光晕
          boxShadow: `
            0 0 60px rgba(255, 0, 128, 0.4),
            0 0 100px rgba(0, 255, 255, 0.3),
            0 30px 80px rgba(0, 0, 0, 0.5)
          `,
        }}>
          {/* 内层卡片 */}
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: 32,
            background: 'rgba(10, 10, 26, 0.95)',
            backdropFilter: 'blur(20px) saturate(180%)',
            position: 'relative',
            overflow: 'hidden',
            // 内边框光泽
            border: '2px solid rgba(255, 255, 255, 0.1)',
            boxShadow: `
              inset 0 0 60px rgba(255, 255, 255, 0.05),
              inset 0 1px 0 rgba(255, 255, 255, 0.2)
            `,
          }}>
            {/* 全息光泽效果 */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '50%',
              background: `linear-gradient(
                135deg,
                rgba(255, 0, 128, 0.15) 0%,
                rgba(0, 255, 255, 0.15) 50%,
                transparent 100%
              )`,
              pointerEvents: 'none',
              zIndex: 2,
            }} />

            {/* 扫描线效果 */}
            <div style={{
              position: 'absolute',
              top: `${(frame * 3) % 100}%`,
              left: 0,
              right: 0,
              height: 2,
              background: 'rgba(0, 255, 255, 0.5)',
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.8)',
              pointerEvents: 'none',
              zIndex: 3,
            }} />

            {/* 内容区域 */}
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 40,
              position: 'relative',
            }}>
              {images[0] ? (
                <Img
                  src={images[0]}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 20,
                    filter: 'contrast(1.1) saturate(1.2)',
                  }}
                />
              ) : (
                <div style={{
                  fontSize: 90,
                  fontWeight: '900',
                  background: `linear-gradient(
                    135deg,
                    #ff0080 0%,
                    #00ffff 50%,
                    #8000ff 100%
                  )`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textAlign: 'center',
                  textShadow: '0 0 40px rgba(0, 255, 255, 0.5)',
                  letterSpacing: 2,
                }}>
                  HOLO
                </div>
              )}
            </div>

            {/* 角落装饰 */}
            {[
              { top: 20, left: 20, rotate: 0 },
              { top: 20, right: 20, rotate: 90 },
              { bottom: 20, left: 20, rotate: 270 },
              { bottom: 20, right: 20, rotate: 180 },
            ].map((pos, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  ...pos,
                  width: 30,
                  height: 30,
                  border: '2px solid',
                  borderImage: 'linear-gradient(135deg, #ff0080, #00ffff) 1',
                  transform: `rotate(${pos.rotate}deg)`,
                  opacity: interpolate(cardProgress, [0, 1], [0, 0.8]),
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 标题区域 - 全息效果 */}
      <div style={{
        position: 'absolute',
        bottom: 90,
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
          background: 'rgba(10, 10, 26, 0.8)',
          backdropFilter: 'blur(30px)',
          border: '2px solid',
          borderImage: `linear-gradient(
            90deg,
            #ff0080,
            #00ffff,
            #8000ff
          ) 1`,
          boxShadow: `
            0 0 40px rgba(0, 255, 255, 0.3),
            0 20px 60px rgba(0, 0, 0, 0.4)
          `,
        }}>
          <h1 style={{
            fontSize: 62,
            fontWeight: '900',
            margin: 0,
            background: `linear-gradient(
              90deg,
              #ff0080 0%,
              #00ffff 50%,
              #8000ff 100%
            )`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 30px rgba(0, 255, 255, 0.5)',
            letterSpacing: 1,
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{
              fontSize: 26,
              color: 'rgba(0, 255, 255, 0.8)',
              margin: '12px 0 0 0',
              fontWeight: '500',
              textShadow: '0 0 20px rgba(0, 255, 255, 0.4)',
            }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* 品牌标识 - 全息风格 */}
      <div style={{
        position: 'absolute',
        top: 50,
        left: 50,
        padding: '16px 32px',
        borderRadius: 15,
        background: 'rgba(10, 10, 26, 0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0, 255, 255, 0.3)',
        fontSize: 20,
        fontWeight: '700',
        color: '#00ffff',
        textShadow: '0 0 10px rgba(0, 255, 255, 0.6)',
        boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)',
      }}>
        VidSlide AI
      </div>
    </div>
  );
};
