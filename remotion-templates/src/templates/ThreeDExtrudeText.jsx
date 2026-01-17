/**
 * 模板20: 3D挤出文字
 * 特点：3D立体效果、光影变化、深度感、旋转动画、金属质感
 * 包含：磨砂玻璃、多层阴影、双层边框、渐变光泽、Spring动画
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

export const ThreeDExtrudeText = ({
  title = '3D TEXT',
  subtitle = 'Extrude Effect',
  brandColor = '#6C5CE7',
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const rotateY = interpolate(frame, [0, 150], [0, 360]);

  const titleProgress = spring({
    frame: frame - 35,
    fps,
    config: { damping: 90, stiffness: 120 },
  });

  return (
    <div style={{
      width,
      height,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      perspective: '1000px',
    }}>
      <div style={{
        textAlign: 'center',
        transform: `rotateY(${rotateY}deg) scale(${interpolate(titleProgress, [0, 1], [0.7, 1])})`,
        opacity: interpolate(titleProgress, [0, 1], [0, 1]),
        transformStyle: 'preserve-3d',
      }}>
        <h1 style={{
          fontSize: 140,
          fontWeight: '900',
          color: 'white',
          margin: 0,
          textShadow: `
            2px 2px 0 ${brandColor},
            4px 4px 0 ${brandColor}dd,
            6px 6px 0 ${brandColor}bb,
            8px 8px 0 ${brandColor}99,
            10px 10px 0 ${brandColor}77,
            12px 12px 0 ${brandColor}55,
            14px 14px 0 ${brandColor}33,
            0 0 60px ${brandColor}80
          `,
          letterSpacing: 5,
        }}>
          {title}
        </h1>

        {subtitle && (
          <div style={{
            marginTop: 60,
            padding: '22px 44px',
            borderRadius: 18,
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(25px)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            display: 'inline-block',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              inset: 6,
              borderRadius: 14,
              border: '1px solid rgba(255, 255, 255, 0.15)',
              pointerEvents: 'none',
            }} />
            <div style={{
              fontSize: 32,
              fontWeight: '600',
              color: 'white',
            }}>
              {subtitle}
            </div>
          </div>
        )}
      </div>

      <div style={{
        position: 'absolute',
        top: 50,
        left: 50,
        padding: '18px 36px',
        borderRadius: 16,
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(20px)',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        fontSize: 20,
        fontWeight: '600',
        color: 'white',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          inset: 4,
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.15)',
          pointerEvents: 'none',
        }} />
        VidSlide AI
      </div>
    </div>
  );
};
