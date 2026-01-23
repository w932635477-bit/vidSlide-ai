/**
 * 抖音平台视频规范和安全区域配置
 */

export const DOUYIN_SPECS = {
  // 标准尺寸
  width: 1080,
  height: 1920,
  aspectRatio: '9:16',

  // 安全区域（避开抖音UI）
  safeArea: {
    top: 120,      // 顶部状态栏和返回按钮
    bottom: 400,   // 底部文字、点赞、评论、分享按钮
    left: 40,      // 左侧边距
    right: 40      // 右侧边距（头像和按钮）
  },

  // 画中画推荐位置
  pipPositions: {
    // 左上角（推荐）
    topLeft: {
      x: 60,
      y: 140,
      description: '左上角，避开状态栏'
    },
    // 右上角（推荐）
    topRight: {
      x: 720,  // 1080 - 300(宽度) - 60(边距)
      y: 140,
      description: '右上角，避开状态栏'
    },
    // 居中上方（推荐）
    topCenter: {
      x: 390,  // (1080 - 300) / 2
      y: 140,
      description: '顶部居中'
    },
    // 左中（可用）
    middleLeft: {
      x: 60,
      y: 810,  // (1920 - 300) / 2
      description: '左侧居中'
    },
    // 右中（可用）
    middleRight: {
      x: 720,
      y: 810,
      description: '右侧居中'
    }
  },

  // 卡片推荐尺寸
  cardSizes: {
    small: {
      width: 280,
      height: 160,
      description: '小卡片'
    },
    medium: {
      width: 400,
      height: 225,
      description: '中等卡片'
    },
    large: {
      width: 640,
      height: 360,
      description: '大卡片'
    },
    fullWidth: {
      width: 1000,  // 留40px边距
      height: 280,
      description: '全宽卡片'
    }
  },

  // 画中画推荐尺寸
  pipSizes: {
    small: {
      width: 300,
      height: 533,  // 保持9:16比例
      description: '小画中画'
    },
    medium: {
      width: 400,
      height: 711,
      description: '中等画中画'
    },
    large: {
      width: 500,
      height: 889,
      description: '大画中画'
    }
  }
};

/**
 * 获取安全的画中画位置
 * @param {string} position - 位置名称
 * @param {Object} size - 尺寸对象 {width, height}
 * @returns {Object} {x, y}
 */
export function getSafePIPPosition(position = 'topRight', size = DOUYIN_SPECS.pipSizes.small) {
  const pos = DOUYIN_SPECS.pipPositions[position];
  if (!pos) {
    // 默认右上角
    return DOUYIN_SPECS.pipPositions.topRight;
  }
  return pos;
}

/**
 * 获取安全的卡片位置
 * @param {string} position - 位置名称
 * @param {Object} size - 尺寸对象 {width, height}
 * @returns {Object} {x, y}
 */
export function getSafeCardPosition(position = 'topCenter', size = DOUYIN_SPECS.cardSizes.large) {
  // 卡片通常居中显示
  const x = (DOUYIN_SPECS.width - size.width) / 2;

  // 根据位置调整y坐标
  let y;
  switch (position) {
    case 'top':
      y = DOUYIN_SPECS.safeArea.top + 20;
      break;
    case 'middle':
      y = (DOUYIN_SPECS.height - size.height) / 2;
      break;
    case 'bottom':
      y = DOUYIN_SPECS.height - DOUYIN_SPECS.safeArea.bottom - size.height - 20;
      break;
    default:
      y = (DOUYIN_SPECS.height - size.height) / 2;
  }

  return { x, y };
}

/**
 * 验证视频尺寸是否符合抖音规范
 * @param {number} width - 视频宽度
 * @param {number} height - 视频高度
 * @returns {boolean}
 */
export function validateDouyinSize(width, height) {
  return width === DOUYIN_SPECS.width && height === DOUYIN_SPECS.height;
}

/**
 * 计算缩放参数以适配抖音尺寸
 * @param {number} originalWidth - 原始宽度
 * @param {number} originalHeight - 原始高度
 * @returns {Object} {width, height, scale}
 */
export function calculateDouyinScale(originalWidth, originalHeight) {
  const targetRatio = DOUYIN_SPECS.width / DOUYIN_SPECS.height;
  const originalRatio = originalWidth / originalHeight;

  let width, height, scale;

  if (originalRatio > targetRatio) {
    // 原视频更宽，以高度为准
    height = DOUYIN_SPECS.height;
    width = Math.round(height * originalRatio);
    scale = height / originalHeight;
  } else {
    // 原视频更高或相同，以宽度为准
    width = DOUYIN_SPECS.width;
    height = Math.round(width / originalRatio);
    scale = width / originalWidth;
  }

  return { width, height, scale };
}
