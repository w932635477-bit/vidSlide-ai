/**
 * 模板10: 翻转卡片对比
 * 特点：3D翻转180度、正反面内容、透视效果、双面设计
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, Img } from 'remotion';

export const FlipCard = ({
  title = '翻转对比',
  subtitle = '',
  frontImage = null,
  backImage = null,
  frontLabel = '正面',
  backLabel = '反面',
  brandColor = '#E74C3C',
  accentColor = '#3498DB',
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // 标题动画
  const titleProgress = spring({
    frame: frame - 25,
    fps,
    config: { damping: 110, stiffness: 150 },
  });

  const titleY = interpolate(titleProgress, [0, 1], [50, 0]);
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

  // 翻转动画 - 0度 → 180度
  const flipProgress = spring({
    frame: frame - 45,
    fps,
    config: { damping: 90, stiffness: 120, mass: 1.2 },
  });

  const rotateY = interpolate(flipProgress, [0, 1], [0, 180]);

  // 卡片缩放动画
  const scaleProgress = spring({
    frame: frame - 35,
    fps,
    config: { damping: 100, stiffness: 140 },
  });

  const scale = interpolate(scaleProgress, [0, 1], [0.8, 1]);

  return (
    <div style={{
      width,
      height,
      background: `linear-gradient(135deg, #16222a 0%, #3a6073 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      perspective: '2000px',
    }}>
      {/* 背景装饰 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 30% 40%, ${brandColor}08 0%, transparent 50%),
          radial-gradient(circle at 70% 60%, ${accentColor}08 0%, transparent 50%)
        `,
      }} />

      {/* 3D翻转容器 */}
      <div style={{
        width: 750,
        height: 600,
        position: 'relative',
        transformStyle: 'preserve-3d',
        transform: `scale(${scale}) rotateY(${rotateY}deg)`,
      }}>
        {/* 正面卡片 */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          borderRadius: 32,
          overflow: 'hidden',
          // 磨砂玻璃边框
          border: '3px solid rgba(255, 255, 255, 0.2)',
          // 多层阴影
          boxShadow: `
            0 50px 120px rgba(0, 0, 0, 0.5),
            0 25px 60px rgba(0, 0, 0, 0.4),
            0 12px 30px rgba(0, 0, 0, 0.3),
            inset 0 2px 0 rgba(255, 255, 255, 0.15)
          `,
        }}>
          {/* 正面背景 */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: frontImage
              ? 'transparent'
              : `linear-gradient(135deg, ${brandColor}50 0%, ${brandColor}70 100%)`,
          }}>
            {frontImage ? (
              <Img
                src={frontImage}
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
                fontSize: 160,
                fontWeight: '900',
                color: brandColor,
              }}>
                A
              </div>
            )}
          </div>

          {/* 正面光泽效果 */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)',
            pointerEvents: 'none',
          }} />

          {/* 正面标签 */}
          <div style={{
            position: 'absolute',
            top: 40,
            left: 40,
            padding: '18px 36px',
            borderRadius: 18,
            background: `${brandColor}dd`,
            backdropFilter: 'blur(15px)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            fontSize: 24,
            fontWeight: '700',
            color: 'white',
            letterSpacing: 1,
            boxShadow: `0 10px 30px ${brandColor}60`,
          }}>
            {frontLabel}
          </div>

          {/* 正面装饰元素 */}
          <div style={{
            position: 'absolute',
            bottom: 40,
            right: 40,
            width: 80,
            height: 80,
            borderRadius: '50%',
            border: `3px solid ${brandColor}`,
            boxShadow: `0 0 30px ${brandColor}60`,
          }} />
        </div>

        {/* 反面卡片 */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          borderRadius: 32,
          overflow: 'hidden',
          // 磨砂玻璃边框
          border: '3px solid rgba(255, 255, 255, 0.2)',
          // 多层阴影
          boxShadow: `
            0 50px 120px rgba(0, 0, 0, 0.5),
            0 25px 60px rgba(0, 0, 0, 0.4),
            0 12px 30px rgba(0, 0, 0, 0.3),
            inset 0 2px 0 rgba(255, 255, 255, 0.15)
          `,
        }}>
          {/* 反面背景 */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: backImage
              ? 'transparent'
              : `linear-gradient(135deg, ${accentColor}50 0%, ${accentColor}70 100%)`,
          }}>
            {backImage ? (
              <Img
                src={backImage}
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
                fontSize: 160,
                fontWeight: '900',
                color: accentColor,
              }}>
                B
              </div>
            )}
          </div>

          {/* 反面光泽效果 */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)',
            pointerEvents: 'none',
          }} />

          {/* 反面标签 */}
          <div style={{
            position: 'absolute',
            top: 40,
            right: 40,
            padding: '18px 36px',
            borderRadius: 18,
            background: `${accentColor}dd`,
            backdropFilter: 'blur(15px)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            fontSize: 24,
            fontWeight: '700',
            color: 'white',
            letterSpacing: 1,
            boxShadow: `0 10px 30px ${accentColor}60`,
          }}>
            {backLabel}
          </div>

          {/* 反面装饰元素 */}
          <div style={{
            position: 'absolute',
            bottom: 40,
            left: 40,
            width: 80,
            height: 80,
            borderRadius: '50%',
            border: `3px solid ${accentColor}`,
            boxShadow: `0 0 30px ${accentColor}60`,
          }} />
        </div>
      </div>

      {/* 翻转指示器 */}
      <div style={{
        position: 'absolute',
        bottom: 200,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 15,
      }}>
        {[0, 1].map((i) => (
          <div
            key={i}
            style={{
              width: 50,
              height: 8,
              borderRadius: 4,
              background: rotateY > 90 === (i === 1)
                ? 'white'
                : 'rgba(255, 255, 255, 0.3)',
              transition: 'all 0.3s ease',
              boxShadow: rotateY > 90 === (i === 1)
                ? '0 0 20px rgba(255, 255, 255, 0.6)'
                : 'none',
            }}
          />
        ))}
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
          padding: '28px 56px',
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
