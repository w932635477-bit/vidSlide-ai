/**
 * 模板28: 翻页显示屏
 * 特点：机场翻页屏效果、上下翻转动画、分段显示、机械感、复古风格
 * 包含：磨砂玻璃、多层阴影、双层边框、渐变光泽、Spring动画
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

export const SplitFlap = ({
  title = 'SPLIT FLAP',
  subtitle = 'Display Board',
  brandColor = '#2C3E50',
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const letters = title.split('');

  return (
    <div style={{
      width,
      height,
      background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 翻页字母 */}
      <div style={{
        display: 'flex',
        gap: 15,
      }}>
        {letters.map((letter, i) => {
          const flipProgress = spring({
            frame: frame - 40 - i * 4,
            fps,
            config: { damping: 80, stiffness: 100 },
          });

          const rotateX = interpolate(flipProgress, [0, 0.5, 1], [90, 0, 0]);

          return (
            <div
              key={i}
              style={{
                width: letter === ' ' ? 30 : 90,
                height: 130,
                perspective: '1000px',
                position: 'relative',
              }}
            >
              {letter !== ' ' && (
                <>
                  {/* 翻页卡片 */}
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 12,
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '3px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: `
                      0 20px 60px rgba(0, 0, 0, 0.5),
                      inset 0 2px 0 rgba(255, 255, 255, 0.15),
                      inset 0 -2px 0 rgba(0, 0, 0, 0.3)
                    `,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: `rotateX(${rotateX}deg)`,
                    transformStyle: 'preserve-3d',
                    position: 'relative',
                  }}>
                    {/* 双层边框 */}
                    <div style={{
                      position: 'absolute',
                      inset: 6,
                      borderRadius: 8,
                      border: '2px solid rgba(255, 255, 255, 0.1)',
                      pointerEvents: 'none',
                    }} />

                    {/* 中间分割线 */}
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: '50%',
                      height: 2,
                      background: 'rgba(0, 0, 0, 0.5)',
                    }} />

                    {/* 字母 */}
                    <div style={{
                      fontSize: 72,
                      fontWeight: '900',
                      color: '#FFF',
                      fontFamily: 'monospace',
                      textShadow: '0 4px 10px rgba(0, 0, 0, 0.5)',
                    }}>
                      {letter}
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* 副标题 */}
      {subtitle && (
        <div style={{
          position: 'absolute',
          bottom: 150,
          left: 0,
          right: 0,
          textAlign: 'center',
        }}>
          <div style={{
            display: 'inline-block',
            padding: '20px 40px',
            borderRadius: 16,
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(25px)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
          }}>
            <div style={{
              position: 'absolute',
              inset: 5,
              borderRadius: 12,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              pointerEvents: 'none',
            }} />
            <div style={{
              fontSize: 28,
              fontWeight: '600',
              color: 'rgba(255, 255, 255, 0.9)',
              fontFamily: 'monospace',
            }}>
              {subtitle}
            </div>
          </div>
        </div>
      )}

      <div style={{
        position: 'absolute',
        top: 50,
        left: 50,
        padding: '18px 36px',
        borderRadius: 16,
        background: 'rgba(255, 255, 255, 0.08)',
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
  );
};
