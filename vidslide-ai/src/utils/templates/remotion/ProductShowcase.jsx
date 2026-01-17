/**
 * 产品展示模板 - 3D卡片堆叠效果
 * 模仿参考图片中的卡片堆叠、透视、阴影效果
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

export const ProductShowcase = ({ title, subtitle, images, brandColor = '#007AFF' }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // 标题动画
  const titleProgress = spring({
    frame: frame - 10,
    fps,
    config: {
      damping: 100,
      stiffness: 200,
      mass: 0.5,
    },
  });

  const titleY = interpolate(titleProgress, [0, 1], [100, 0]);
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

  // 卡片动画
  const cardProgress = spring({
    frame: frame - 30,
    fps,
    config: {
      damping: 100,
      stiffness: 150,
    },
  });

  // 3D 卡片堆叠效果
  const renderCards = () => {
    if (!images || images.length === 0) {
      return null;
    }

    return images.slice(0, 3).map((image, index) => {
      const cardDelay = index * 5;
      const cardSpring = spring({
        frame: frame - 40 - cardDelay,
        fps,
        config: {
          damping: 100,
          stiffness: 200,
        },
      });

      // 3D 透视效果
      const rotateY = interpolate(cardSpring, [0, 1], [45, 0]);
      const translateZ = interpolate(cardSpring, [0, 1], [200, index * 30]);
      const translateX = interpolate(cardSpring, [0, 1], [300, index * 20]);
      const scale = interpolate(cardSpring, [0, 1], [0.5, 1 - index * 0.05]);
      const opacity = interpolate(cardSpring, [0, 1], [0, 1]);

      return (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 400,
            height: 500,
            marginLeft: -200,
            marginTop: -250,
            transform: `
              translateX(${translateX}px)
              translateZ(${translateZ}px)
              rotateY(${rotateY}deg)
              scale(${scale})
            `,
            transformStyle: 'preserve-3d',
            opacity,
            zIndex: 10 - index,
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 20,
              overflow: 'hidden',
              boxShadow: `
                0 ${20 + index * 10}px ${40 + index * 20}px rgba(0, 0, 0, ${0.3 - index * 0.05}),
                0 ${10 + index * 5}px ${20 + index * 10}px rgba(0, 0, 0, ${0.2 - index * 0.05})
              `,
              background: 'white',
            }}
          >
            {typeof image === 'string' ? (
              <img
                src={image}
                alt={`Card ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: `linear-gradient(135deg, ${brandColor}22, ${brandColor}44)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 48,
                  color: brandColor,
                  fontWeight: 'bold',
                }}
              >
                {index + 1}
              </div>
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <div
      style={{
        width,
        height,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        perspective: 1000,
        perspectiveOrigin: '50% 50%',
      }}
    >
      {/* 背景装饰 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)
          `,
        }}
      />

      {/* 3D 卡片容器 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          transformStyle: 'preserve-3d',
        }}
      >
        {renderCards()}
      </div>

      {/* 标题文字 */}
      <div
        style={{
          position: 'absolute',
          bottom: 100,
          left: 0,
          right: 0,
          textAlign: 'center',
          transform: `translateY(${titleY}px)`,
          opacity: titleOpacity,
        }}
      >
        <h1
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            color: 'white',
            margin: 0,
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            letterSpacing: -2,
          }}
        >
          {title || '产品展示'}
        </h1>
        {subtitle && (
          <p
            style={{
              fontSize: 32,
              color: 'rgba(255, 255, 255, 0.9)',
              margin: '20px 0 0 0',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* 品牌标识 */}
      <div
        style={{
          position: 'absolute',
          top: 60,
          left: 60,
          fontSize: 24,
          fontWeight: 'bold',
          color: 'white',
          opacity: 0.8,
        }}
      >
        VidSlide AI
      </div>
    </div>
  );
};
