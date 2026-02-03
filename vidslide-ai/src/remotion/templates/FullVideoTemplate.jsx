import { Img, AbsoluteFill, OffthreadVideo, useCurrentFrame, useVideoConfig, staticFile } from 'remotion';
import { getStyleConfig } from '../../config/GlobalStyleConfig';
import { MaterialCarouselLayer } from '../components/MaterialCarouselLayer';  // ⭐⭐⭐ 新增：导入素材轮播组件

/**
 * FullVideoTemplate - 完整视频模板（v5.1 - 正确的场景布局）
 *
 * ⭐ 场景类型布局说明（基于理想效果截图）：
 *
 * 1. original: 原视频全屏播放，无任何叠加
 *    ┌─────────────────────────────────────┐
 *    │                                     │
 *    │     原视频全屏播放（主播人物）        │
 *    │                                     │
 *    └─────────────────────────────────────┘
 *
 * 2. video-with-card: 原视频全屏 + 底部卡片（支持多张垂直排列）
 *    ┌─────────────────────────────────────┐
 *    │                                     │
 *    │     原视频全屏播放（主播人物）        │
 *    │                                     │
 *    │  ┌─────────────────────────────┐    │
 *    │  │ 强化学习  Reinforcement     │    │  ← 底部卡片区域
 *    │  ├─────────────────────────────┤    │    支持1-4张垂直排列
 *    │  │  涌 现   Emergence          │    │    类似PPT样式
 *    │  └─────────────────────────────┘    │
 *    └─────────────────────────────────────┘
 *
 * 3. multi-layer-composition: 背景 + 素材 + 卡片 + PIP小窗口
 *    ┌─────────────────────────────────────┐
 *    │  [标题区域]           ┌────────┐    │  ← PIP在右上角
 *    │                       │  PIP   │    │    显示主播人物
 *    │                       │ 小窗口 │    │
 *    │                       └────────┘    │
 *    │     素材内容区域（占据主体）          │  ← 深色背景 + 素材图片
 *    │                                     │
 *    │  ┌─────────────────────────────┐    │
 *    │  │         卡片                │    │  ← 底部卡片
 *    │  └─────────────────────────────┘    │
 *    └─────────────────────────────────────┘
 *
 * ⚠️ 抖音布局规则（重要）：
 * - PIP画中画不能放在左下角或右下角，会被抖音的评论、点赞按钮遮挡
 * - 推荐PIP位置：右上角、左上角、中间偏上
 * - 底部区域（约200px高度）应避免放置重要内容
 */

/**
 * 本地深色背景图片列表（10张，循环使用）
 */
const BACKGROUND_IMAGES = [
  'backgrounds/felix-mulderrig-Y_ILun16aQM-unsplash.jpg',
  'backgrounds/kihong-kim-mZcCRkALHSI-unsplash.jpg',
  'backgrounds/max-whitehead-6MUoaZCdgyY-unsplash.jpg',
  'backgrounds/michael-meyer-7p4tmY0xB2A-unsplash.jpg',
  'backgrounds/mihail-tregubov-pdZsTiYBznA-unsplash.jpg',
  'backgrounds/mitch-UDbVx4TK69k-unsplash.jpg',
  'backgrounds/ricardo-gomez-angel-RmO0BMX8J-0-unsplash.jpg',
  'backgrounds/risto-kokkonen-461OYLhAo04-unsplash.jpg',
  'backgrounds/sergey-kvint-Psfif-5y-JY-unsplash.jpg',
  'backgrounds/tobias-rademacher-5jJZfI8DvII-unsplash.jpg'
];

/**
 * 本地卡片背景图片列表（6张，循环使用）
 */
const CARD_BACKGROUND_IMAGES = [
  'card-backgrounds/codioful-formerly-gradienta-bKESVqfxass-unsplash.jpg',
  'card-backgrounds/engin-akyurt-Hlkuojv_P6I-unsplash.jpg',
  'card-backgrounds/julian-bock-Y6-GL40aPPs-unsplash.jpg',
  'card-backgrounds/moises-rodriguez-b1fuDczpg9c-unsplash.jpg',
  'card-backgrounds/paul-lichtblau-fX-qWsXl5x8-unsplash.jpg',
  'card-backgrounds/tareq-ajalyakin-Ig1YHgmJrnQ-unsplash.jpg'
];

export const FullVideoTemplate = ({
  videoPath,
  scenes = [],
  stylePreset = 'douyin_modern'
}) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const globalStyle = getStyleConfig(stylePreset);
  const currentTime = frame / fps;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* ⭐ 第1层: 原视频（底层，全屏播放，提供音频）
          重要：原视频一直播放，不受场景类型影响 */}
      {videoPath && (
        <AbsoluteFill>
          <OffthreadVideo
            src={videoPath}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </AbsoluteFill>
      )}

      {/* ⭐ 第2层: 场景叠加效果 */}
      {scenes.map((scene, index) => {
        const isActive = currentTime >= scene.startTime && currentTime < scene.endTime;
        if (!isActive) return null;

        // original 场景：无叠加，只显示原视频
        if (scene.type === 'original') return null;

        const sceneTime = currentTime - scene.startTime;
        const sceneDuration = scene.endTime - scene.startTime;

        // video-with-card 场景
        if (scene.type === 'video-with-card') {
          return (
            <VideoWithCardLayer
              key={`scene-${index}`}
              scene={scene}
              sceneTime={sceneTime}
              sceneDuration={sceneDuration}
              sceneIndex={index}
              globalStyle={globalStyle}
              fps={fps}
            />
          );
        }

        // ⭐ card-group 场景（主关键词+次关键词组合，约40%占比）
        // 与 video-with-card 类似，但专门用于多卡片组合展示
        if (scene.type === 'card-group') {
          return (
            <VideoWithCardLayer
              key={`scene-${index}`}
              scene={scene}
              sceneTime={sceneTime}
              sceneDuration={sceneDuration}
              sceneIndex={index}
              globalStyle={globalStyle}
              fps={fps}
            />
          );
        }

        // multi-layer-composition 场景
        if (scene.type === 'multi-layer-composition') {
          return (
            <MultiLayerCompositionLayer
              key={`scene-${index}`}
              scene={scene}
              sceneTime={sceneTime}
              sceneDuration={sceneDuration}
              sceneIndex={index}
              videoPath={videoPath}
            />
          );
        }

        return null;
      })}
    </AbsoluteFill>
  );
};

/**
 * VideoWithCardLayer - 卡片+原视频场景
 *
 * 布局：原视频全屏 + 底部卡片（支持上下垂直排列，类似PPT）
 *
 * ⭐⭐⭐ 优化版本：
 * - 更大的卡片尺寸（宽度占屏幕85%）
 * - 更长的入场延迟（每张卡片间隔0.8秒，类似PPT）
 * - 弹簧动画效果
 * - 卡片从底部滑入
 */
const VideoWithCardLayer = ({ scene, sceneTime, sceneDuration, sceneIndex, fps }) => {
  // 获取卡片内容（支持多卡片）
  const cards = scene.cards || [{ text: scene.cardText || scene.keyword || '' }];
  const cardCount = cards.length;

  // ⭐⭐⭐ 参考抖音理想效果的卡片尺寸（紧凑型）
  // 参考图片中卡片约 280-300px 宽，180-200px 高
  // 纵向排列时宽度可以稍大（约45%屏幕宽度）
  const cardSizes = {
    1: { width: 580, height: 180, fontSize: 56, subtitleSize: 32 },
    2: { width: 540, height: 160, fontSize: 48, subtitleSize: 28 },
    3: { width: 500, height: 140, fontSize: 44, subtitleSize: 26 },
    4: { width: 460, height: 120, fontSize: 40, subtitleSize: 24 }
  };
  const cardSize = cardSizes[Math.min(cardCount, 4)] || cardSizes[4];

  // ⭐⭐⭐ 优化：更长的入场延迟（类似PPT，每张卡片间隔0.8秒）
  const cardEnterDelay = 0.8;  // 每张卡片入场间隔
  const cardEnterDuration = 0.6;  // 单张卡片入场动画时长

  // 出场动画
  const exitDuration = 0.4;
  const exitStartTime = sceneDuration - exitDuration;

  return (
    <AbsoluteFill>
      {/* ⭐ 卡片区域 - 屏幕中央偏下（参考抖音理想效果位置） */}
      <div style={{
        position: 'absolute',
        top: '50%',  // 屏幕中央
        left: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',  // 卡片间距
        width: '100%'
      }}>
        {cards.map((card, cardIndex) => {
          // ⭐⭐⭐ 计算每张卡片的入场时间
          const cardStartTime = cardIndex * cardEnterDelay;
          const cardTime = sceneTime - cardStartTime;

          // 入场动画进度（弹簧效果）
          const enterProgress = cardTime <= 0 ? 0 :
            cardTime >= cardEnterDuration ? 1 :
            easeOutBack(cardTime / cardEnterDuration);

          // 出场动画进度
          const exitProgress = sceneTime >= exitStartTime
            ? Math.min(1, (sceneTime - exitStartTime) / exitDuration)
            : 0;

          // 最终动画值
          const opacity = Math.min(enterProgress, 1 - exitProgress);
          const translateY = 80 * (1 - enterProgress) - 30 * exitProgress;
          const scale = 0.85 + 0.15 * enterProgress - 0.1 * exitProgress;

          // 如果卡片还没到入场时间，不渲染
          if (cardTime < -0.1) return null;

          const cardBackgroundImage = staticFile(CARD_BACKGROUND_IMAGES[(sceneIndex * 10 + cardIndex) % CARD_BACKGROUND_IMAGES.length]);

          return (
            <div
              key={`card-${cardIndex}`}
              style={{
                width: cardSize.width,
                height: cardSize.height,
                opacity: opacity,
                transform: `translateY(${translateY}px) scale(${scale})`,
                transformOrigin: 'center'
              }}
            >
              <div style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                borderRadius: '20px',  // 参考图片的圆角
                overflow: 'hidden',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)'
              }}>
                {/* 卡片背景图片 */}
                <Img
                  src={cardBackgroundImage}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'brightness(0.75)'
                  }}
                />
                {/* 半透明遮罩 */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.45) 100%)'
                }} />
                {/* 文字内容 - 紧凑布局 */}
                <div style={{
                  position: 'relative',
                  zIndex: 2,
                  padding: '20px 30px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  gap: '8px'
                }}>
                  {/* 主文字 */}
                  <div style={{
                    fontSize: cardSize.fontSize,
                    fontWeight: 'bold',
                    color: '#ffffff',
                    textShadow: '0 3px 10px rgba(0, 0, 0, 0.7)',
                    textAlign: 'center',
                    lineHeight: 1.2
                  }}>
                    {card.text || card.keyword || ''}
                  </div>
                  {/* 副标题/英文 */}
                  {(card.subtitle || card.english) && (
                    <div style={{
                      fontSize: cardSize.subtitleSize,
                      fontWeight: '500',
                      color: 'rgba(255, 255, 255, 0.85)',
                      textShadow: '0 2px 6px rgba(0, 0, 0, 0.5)',
                      textAlign: 'center'
                    }}>
                      {card.subtitle || card.english}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/**
 * ⭐ 弹簧缓动函数（easeOutBack）
 * 产生轻微的回弹效果，让动画更有活力
 */
function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

/**
 * MultiLayerCompositionLayer - 多层复合场景
 *
 * 布局：深色背景 + 素材内容 + 卡片 + PIP小窗口
 *
 * ⭐ 关键区别：原视频变成右上角的PIP小窗口，不再全屏显示
 * ⚠️ 抖音规则：PIP不能放在左下角或右下角，会被评论和点赞按钮遮挡
 */
const MultiLayerCompositionLayer = ({
  scene,
  sceneTime,
  sceneDuration,
  sceneIndex,
  videoPath
}) => {
  // 动画配置
  const enterDuration = 0.6;
  const exitDuration = 0.4;

  // 入场/出场动画进度
  const enterProgress = Math.min(1, sceneTime / enterDuration);
  const exitProgress = sceneTime > sceneDuration - exitDuration
    ? (sceneTime - (sceneDuration - exitDuration)) / exitDuration
    : 0;

  const opacity = Math.min(enterProgress, 1 - exitProgress);
  const scale = 0.95 + 0.05 * enterProgress;

  // 获取背景图片（循环使用）
  const backgroundImage = staticFile(BACKGROUND_IMAGES[sceneIndex % BACKGROUND_IMAGES.length]);

  // 获取卡片内容
  const cardText = scene.cardText || scene.keyword || '';
  const cardSubtitle = scene.cardSubtitle || scene.english || null;

  // PIP 配置 - 放在右上角（避免被抖音底部UI遮挡）
  // ⚠️ 抖音规则：不能放在左下角或右下角
  const pipConfig = {
    width: '30%',
    height: '22%',
    top: '80px',      // 右上角位置
    right: '40px',
    borderRadius: '16px',
    borderWidth: '3px',
    borderColor: '#ffffff'
  };

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* ⭐ 第1层: 深色背景图片（覆盖原视频） */}
      <AbsoluteFill>
        <Img
          src={backgroundImage}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.4) blur(2px)',
            transform: `scale(${scale})`
          }}
        />
        {/* 深色遮罩层 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.8) 100%)'
        }} />
      </AbsoluteFill>

      {/* ⭐ 第2层: 素材图片或素材轮播（如果有） */}
      {scene.materialCarousel && scene.materialCarousel.length > 0 ? (
        // ⭐⭐⭐ 素材轮播模式
        <div style={{
          position: 'absolute',
          top: '8%',
          left: '50%',
          transform: `translateX(-50%) scale(${scale})`,
          opacity: opacity,
          width: '92%',  // ⭐ 调整：从85%增加到92%，几乎占满屏幕
          height: '55%',  // ⭐ 调整：从50%增加到55%，更大的显示区域
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
        }}>
          <MaterialCarouselLayer
            materials={scene.materialCarousel}
            config={{
              durationPerMaterial: 3.5,  // ⭐ 调整：从1.5秒增加到3.5秒，更慢的轮播速度
              transitionDuration: 0.5,   // ⭐ 调整：从0.3秒增加到0.5秒，更平滑的过渡
              transitionType: 'fade'
            }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
        </div>
      ) : scene.materialImage ? (
        // 单素材模式（降级）
        <MaterialLayer
          materialImage={scene.materialImage}
          sceneTime={sceneTime}
          enterDuration={enterDuration}
        />
      ) : null}

      {/* ⭐ 第3层: 卡片（左下角或底部中央） */}
      {cardText && (
        <CardLayer
          text={cardText}
          subtitle={cardSubtitle}
          sceneIndex={sceneIndex}
          sceneTime={sceneTime}
          enterDuration={enterDuration}
          hasPIP={!!videoPath}
        />
      )}

      {/* ⭐ 第4层: PIP画中画（右上角，显示原视频/主播人物）
          ⚠️ 抖音规则：不能放在左下角或右下角，会被评论和点赞按钮遮挡 */}
      {videoPath && (
        <PIPLayer
          videoPath={videoPath}
          config={pipConfig}
          sceneTime={sceneTime}
          enterDuration={enterDuration}
          scene={scene}
        />
      )}
    </AbsoluteFill>
  );
};

/**
 * MaterialLayer - 素材图片层
 */
const MaterialLayer = ({ materialImage, sceneTime, enterDuration }) => {
  const progress = Math.min(1, sceneTime / enterDuration);
  const opacity = progress;
  const scale = 0.9 + 0.1 * progress;

  return (
    <div style={{
      position: 'absolute',
      top: '10%',
      left: '50%',
      transform: `translateX(-50%) scale(${scale})`,
      opacity: opacity,
      width: '85%',
      maxWidth: '1100px',
      maxHeight: '50%',
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
    }}>
      <Img
        src={materialImage}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain'
        }}
      />
    </div>
  );
};

/**
 * CardLayer - 卡片层（多层场景中使用）
 */
const CardLayer = ({ text, subtitle, sceneIndex, sceneTime, enterDuration, hasPIP }) => {
  const progress = Math.min(1, (sceneTime - 0.2) / enterDuration);
  const opacity = Math.max(0, progress);
  const translateY = 30 * (1 - progress);

  // 如果有PIP，卡片放在左下角；否则放在底部中央
  // ⭐ 修复：将bottom从200px调整到260px，避免被播放器遮挡
  const positionStyle = hasPIP
    ? { bottom: '260px', left: '40px' }
    : { bottom: '260px', left: '50%', transform: `translateX(-50%) translateY(${translateY}px)` };

  const cardBackgroundImage = staticFile(CARD_BACKGROUND_IMAGES[sceneIndex % CARD_BACKGROUND_IMAGES.length]);

  return (
    <div style={{
      position: 'absolute',
      ...positionStyle,
      transform: hasPIP ? `translateY(${translateY}px)` : positionStyle.transform,
      opacity: opacity,
      width: hasPIP ? '55%' : '80%',
      maxWidth: hasPIP ? '650px' : '900px'
    }}>
      <div style={{
        position: 'relative',
        width: '100%',
        height: 'auto',
        minHeight: '180px',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 15px 40px rgba(0, 0, 0, 0.4)'
      }}>
        {/* 卡片背景图片 */}
        <Img
          src={cardBackgroundImage}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.8)'
          }}
        />
        {/* 半透明遮罩 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 100%)'
        }} />
        {/* 文字内容 */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          padding: '40px 50px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '64px',
            fontWeight: 'bold',
            color: '#ffffff',
            textShadow: '0 4px 12px rgba(0, 0, 0, 0.8)',
            marginBottom: subtitle ? '15px' : 0
          }}>
            {text}
          </div>
          {subtitle && (
            <div style={{
              fontSize: '32px',
              fontWeight: '500',
              color: 'rgba(255, 255, 255, 0.9)',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)'
            }}>
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * PIPLayer - 画中画层（显示裁剪后的人脸视频）
 * ⚠️ 抖音规则：不能放在左下角或右下角，推荐右上角
 * ⭐ 修复：优先使用裁剪后的人脸视频（scene.pipVideo），避免显示原视频UI
 * ⭐⭐⭐ 关键修复：使用 useVideoConfig 获取实际 fps，避免时长计算错误
 */
const PIPLayer = ({ videoPath, config, sceneTime, enterDuration, scene }) => {
  // ⭐⭐⭐ 关键修复：从 useVideoConfig 获取实际 fps
  const { fps } = useVideoConfig();

  const progress = Math.min(1, (sceneTime - 0.3) / enterDuration);
  const opacity = Math.max(0, progress);
  const scale = 0.8 + 0.2 * progress;

  // 支持 top 或 bottom 定位
  const positionStyle = config.top
    ? { top: config.top, right: config.right }
    : { bottom: config.bottom, right: config.right };

  // ⭐ 优先使用裁剪后的人脸视频，避免显示原视频的抖音UI
  const pipVideoSrc = scene.pipVideo || videoPath;

  // ⭐⭐⭐ 关键修复：PIP视频的播放时间
  // 如果使用的是裁剪后的人脸视频（scene.pipVideo），应该从0开始播放
  // 如果使用的是原视频（videoPath），应该从scene.startTime开始播放
  const pipStartFrame = scene.pipVideo
    ? 0  // 裁剪后的视频从头播放
    : Math.floor(scene.startTime * fps);  // 原视频从场景开始时间播放

  return (
    <div style={{
      position: 'absolute',
      ...positionStyle,
      width: config.width,
      height: config.height,
      borderRadius: config.borderRadius,
      border: `${config.borderWidth} solid ${config.borderColor}`,
      overflow: 'hidden',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
      opacity: opacity,
      transform: `scale(${scale})`
    }}>
      <OffthreadVideo
        src={pipVideoSrc}
        startFrom={pipStartFrame}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
        muted
      />
    </div>
  );
};

/**
 * SingleCardVertical - 垂直排列的单张卡片组件（类似PPT样式）
 *
 * 特点：
 * - 宽度占满容器
 * - 高度根据卡片数量自适应
 * - 支持依次入场动画
 */
const SingleCardVertical = ({ text, subtitle, backgroundIndex, height, delay, sceneTime }) => {
  const progress = Math.min(1, Math.max(0, (sceneTime - delay) / 0.4));
  const opacity = progress;
  const translateX = -50 * (1 - progress);  // 从左侧滑入
  const scale = 0.9 + 0.1 * progress;

  const cardBackgroundImage = staticFile(CARD_BACKGROUND_IMAGES[backgroundIndex % CARD_BACKGROUND_IMAGES.length]);

  return (
    <div style={{
      width: '100%',
      height: height,
      opacity: opacity,
      transform: `translateX(${translateX}px) scale(${scale})`
    }}>
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
      }}>
        {/* 卡片背景图片 */}
        <Img
          src={cardBackgroundImage}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.85)'
          }}
        />
        {/* 半透明遮罩 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.4) 100%)'
        }} />
        {/* 文字内容 - 左对齐，类似PPT */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          padding: '25px 35px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          height: '100%',
          gap: '20px'
        }}>
          {/* 主文字 */}
          <div style={{
            fontSize: '52px',
            fontWeight: 'bold',
            color: '#ffffff',
            textShadow: '0 3px 10px rgba(0, 0, 0, 0.8)',
            whiteSpace: 'nowrap'
          }}>
            {text}
          </div>
          {/* 副标题/英文 */}
          {subtitle && (
            <div style={{
              fontSize: '28px',
              fontWeight: '500',
              color: 'rgba(255, 255, 255, 0.85)',
              textShadow: '0 2px 6px rgba(0, 0, 0, 0.6)'
            }}>
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FullVideoTemplate;
