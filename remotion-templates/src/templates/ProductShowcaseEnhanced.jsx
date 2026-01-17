/**
 * 增强版产品展示模板 - 支持完全自定义内容
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, Img } from 'remotion';

export const ProductShowcaseEnhanced = ({
  // 文字内容
  title = '产品展示',
  subtitle = '',
  description = '',
  features = [], // 特性列表：['特性1', '特性2', '特性3']

  // 图片内容
  images = [], // 图片数组，支持本地路径或URL
  logo = null, // 品牌Logo
  backgroundImage = null, // 背景图片

  // 样式配置
  brandColor = '#007AFF',
  backgroundColor = null, // 如果不设置，使用默认渐变
  textColor = 'white',

  // 动画配置
  animationSpeed = 1, // 动画速度倍数
  cardCount = 3, // 显示的卡片数量
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // 根据速度调整动画
  const adjustedFrame = frame * animationSpeed;

  // 标题动画
  const titleProgress = spring({
    frame: adjustedFrame - 10,
    fps,
    config: {
      damping: 100,
      stiffness: 200,
      mass: 0.5,
    },
  });

  const titleY = interpolate(titleProgress, [0, 1], [100, 0]);
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

  // 特性列表动画
  const renderFeatures = () => {
    if (!features || features.length === 0) return null;

    return (
      <div
        style={{
          position: 'absolute',
          bottom: 200,
          left: 100,
          right: 100,
          display: 'flex',
          justifyContent: 'center',
          gap: 30,
        }}
      >
        {features.slice(0, 4).map((feature, index) => {
          const featureProgress = spring({
            frame: adjustedFrame - 60 - index * 5,
            fps,
            config: { damping: 100, stiffness: 200 },
          });

          const featureY = interpolate(featureProgress, [0, 1], [50, 0]);
          const featureOpacity = interpolate(featureProgress, [0, 1], [0, 1]);

          return (
            <div
              key={index}
              style={{
                transform: `translateY(${featureY}px)`,
                opacity: featureOpacity,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                padding: '15px 25px',
                borderRadius: 10,
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <span style={{ color: textColor, fontSize: 18 }}>
                ✓ {feature}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // 卡片渲染
  const renderCards = () => {
    const displayImages = images.slice(0, cardCount);

    if (displayImages.length === 0) {
      // 如果没有图片，显示占位符
      displayImages.push(null, null, null);
    }

    return displayImages.map((image, index) => {
      const cardDelay = index * 5;
      const cardSpring = spring({
        frame: adjustedFrame - 40 - cardDelay,
        fps,
        config: {
          damping: 100,
          stiffness: 200,
        },
      });

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
            {image ? (
              // 真实图片
              <Img
                src={image}
                alt={`Card ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              // 占位符
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
        background: backgroundColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        perspective: 1000,
        perspectiveOrigin: '50% 50%',
      }}
    >
      {/* 背景图片（可选） */}
      {backgroundImage && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.3,
          }}
        >
          <Img
            src={backgroundImage}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      )}

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

      {/* Logo（可选） */}
      {logo && (
        <div
          style={{
            position: 'absolute',
            top: 60,
            left: 60,
            opacity: 0.9,
          }}
        >
          <Img src={logo} style={{ height: 50 }} />
        </div>
      )}

      {/* 标题文字 */}
      <div
        style={{
          position: 'absolute',
          bottom: description || features.length > 0 ? 280 : 100,
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
            color: textColor,
            margin: 0,
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            letterSpacing: -2,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              fontSize: 32,
              color: `${textColor}e6`,
              margin: '20px 0 0 0',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
            }}
          >
            {subtitle}
          </p>
        )}
        {description && (
          <p
            style={{
              fontSize: 20,
              color: `${textColor}cc`,
              margin: '15px auto 0',
              maxWidth: 800,
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
            }}
          >
            {description}
          </p>
        )}
      </div>

      {/* 特性列表 */}
      {renderFeatures()}
    </div>
  );
};
