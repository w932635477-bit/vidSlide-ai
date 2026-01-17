/**
 * 分屏对比模板 - 左右对比效果
 * 模仿参考图片中的分屏、VS标识、对比效果
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

export const SplitComparison = ({
  leftTitle,
  rightTitle,
  leftImage,
  rightImage,
  leftColor = '#FF6B6B',
  rightColor = '#4ECDC4',
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // 分割线动画
  const lineProgress = spring({
    frame: frame - 10,
    fps,
    config: {
      damping: 100,
      stiffness: 200,
    },
  });

  const lineScale = interpolate(lineProgress, [0, 1], [0, 1]);

  // 左侧面板动画
  const leftProgress = spring({
    frame: frame - 20,
    fps,
    config: {
      damping: 100,
      stiffness: 150,
    },
  });

  const leftX = interpolate(leftProgress, [0, 1], [-width / 2, 0]);

  // 右侧面板动画
  const rightProgress = spring({
    frame: frame - 20,
    fps,
    config: {
      damping: 100,
      stiffness: 150,
    },
  });

  const rightX = interpolate(rightProgress, [0, 1], [width / 2, 0]);

  // VS 标识动画
  const vsProgress = spring({
    frame: frame - 40,
    fps,
    config: {
      damping: 100,
      stiffness: 300,
    },
  });

  const vsScale = interpolate(vsProgress, [0, 1], [0, 1]);
  const vsRotate = interpolate(vsProgress, [0, 1], [180, 0]);

  return (
    <div
      style={{
        width,
        height,
        background: '#1a1a2e',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 左侧面板 */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: width / 2,
          height,
          transform: `translateX(${leftX}px)`,
          background: `linear-gradient(135deg, ${leftColor}22, ${leftColor}44)`,
        }}
      >
        {/* 左侧图片 */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '70%',
            height: '60%',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          }}
        >
          {leftImage ? (
            <img
              src={leftImage}
              alt="Left"
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
                background: `linear-gradient(135deg, ${leftColor}, ${leftColor}dd)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 48,
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              Before
            </div>
          )}
        </div>

        {/* 左侧标题 */}
        <div
          style={{
            position: 'absolute',
            bottom: 80,
            left: 0,
            right: 0,
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontSize: 48,
              fontWeight: 'bold',
              color: leftColor,
              margin: 0,
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            }}
          >
            {leftTitle || '对比前'}
          </h2>
        </div>
      </div>

      {/* 右侧面板 */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: width / 2,
          height,
          transform: `translateX(${rightX}px)`,
          background: `linear-gradient(135deg, ${rightColor}22, ${rightColor}44)`,
        }}
      >
        {/* 右侧图片 */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '70%',
            height: '60%',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          }}
        >
          {rightImage ? (
            <img
              src={rightImage}
              alt="Right"
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
                background: `linear-gradient(135deg, ${rightColor}, ${rightColor}dd)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 48,
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              After
            </div>
          )}
        </div>

        {/* 右侧标题 */}
        <div
          style={{
            position: 'absolute',
            bottom: 80,
            left: 0,
            right: 0,
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontSize: 48,
              fontWeight: 'bold',
              color: rightColor,
              margin: 0,
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            }}
          >
            {rightTitle || '对比后'}
          </h2>
        </div>
      </div>

      {/* 中间分割线 */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          bottom: 0,
          width: 4,
          marginLeft: -2,
          background: 'linear-gradient(to bottom, transparent, white, transparent)',
          transform: `scaleY(${lineScale})`,
          boxShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
        }}
      />

      {/* VS 标识 */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) scale(${vsScale}) rotate(${vsRotate}deg)`,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
          border: '4px solid white',
        }}
      >
        <span
          style={{
            fontSize: 48,
            fontWeight: 'bold',
            color: 'white',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
          }}
        >
          VS
        </span>
      </div>
    </div>
  );
};
