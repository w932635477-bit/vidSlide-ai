/**
 * 圆角相关的工具函数
 * 提供配置验证、参数计算等辅助功能
 */

/**
 * 验证圆角配置
 * @param {Object} config - 圆角配置
 * @returns {Object} 验证结果
 */
function validateRoundedCornerConfig(config) {
  const errors = [];
  const warnings = [];

  // 验证必需参数
  if (!config.width || config.width <= 0) {
    errors.push('width 必须是正数');
  }

  if (!config.height || config.height <= 0) {
    errors.push('height 必须是正数');
  }

  if (config.radius === undefined || config.radius < 0) {
    errors.push('radius 必须是非负数');
  }

  // 验证圆角半径是否过大
  if (config.radius > Math.min(config.width, config.height) / 2) {
    warnings.push(`圆角半径 (${config.radius}) 超过最大值 (${Math.min(config.width, config.height) / 2})，将被限制`);
    config.radius = Math.min(config.width, config.height) / 2;
  }

  // 验证边框宽度
  if (config.borderWidth && config.borderWidth < 0) {
    errors.push('borderWidth 必须是非负数');
  }

  // 验证阴影配置
  if (config.shadow && config.shadow.enabled) {
    if (config.shadow.blur && config.shadow.blur < 0) {
      errors.push('shadow.blur 必须是非负数');
    }

    if (config.shadow.opacity !== undefined) {
      if (config.shadow.opacity < 0 || config.shadow.opacity > 1) {
        errors.push('shadow.opacity 必须在 0-1 之间');
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    config  // 返回修正后的配置
  };
}

/**
 * 标准化圆角配置
 * @param {Object} config - 原始配置
 * @returns {Object} 标准化后的配置
 */
function normalizeRoundedCornerConfig(config) {
  const normalized = {
    width: config.width,
    height: config.height,
    radius: config.radius || 0,
    borderWidth: config.borderWidth || 0,
    borderColor: config.borderColor || 'white',
    shadow: {
      enabled: config.shadow?.enabled || false,
      offsetX: config.shadow?.offsetX || 2,
      offsetY: config.shadow?.offsetY || 6,
      blur: config.shadow?.blur || 4,
      opacity: config.shadow?.opacity || 0.3,
      color: config.shadow?.color || '#000000'
    },
    useVP9: config.useVP9 !== undefined ? config.useVP9 : true,
    antiAlias: config.antiAlias !== undefined ? config.antiAlias : true
  };

  // 验证配置
  const validation = validateRoundedCornerConfig(normalized);

  if (!validation.valid) {
    throw new Error(`配置验证失败: ${validation.errors.join(', ')}`);
  }

  if (validation.warnings.length > 0) {
    console.warn('⚠️ 配置警告:', validation.warnings.join(', '));
  }

  return validation.config;
}

/**
 * 计算圆角视频的总尺寸（包含边框和阴影）
 * @param {Object} config - 圆角配置
 * @returns {Object} 总尺寸信息
 */
function calculateTotalDimensions(config) {
  const { width, height, borderWidth, shadow } = config;

  let totalWidth = width + borderWidth * 2;
  let totalHeight = height + borderWidth * 2;

  if (shadow && shadow.enabled) {
    const shadowSpace = shadow.blur * 4;
    totalWidth += shadowSpace;
    totalHeight += shadowSpace;
  }

  return {
    totalWidth,
    totalHeight,
    contentWidth: width,
    contentHeight: height,
    borderWidth,
    shadowSpace: shadow?.enabled ? shadow.blur * 4 : 0
  };
}

/**
 * 生成圆角预设配置
 * @param {string} preset - 预设名称
 * @returns {Object} 预设配置
 */
function getRoundedCornerPreset(preset) {
  const presets = {
    // 小圆角（适用于小元素）
    small: {
      radius: 4,
      borderWidth: 2,
      shadow: { enabled: false }
    },

    // 中等圆角（适用于卡片）
    medium: {
      radius: 8,
      borderWidth: 3,
      shadow: { enabled: true, blur: 3, opacity: 0.2 }
    },

    // 大圆角（适用于大卡片）
    large: {
      radius: 12,
      borderWidth: 4,
      shadow: { enabled: true, blur: 4, opacity: 0.3 }
    },

    // 超大圆角（适用于特殊设计）
    xlarge: {
      radius: 20,
      borderWidth: 4,
      shadow: { enabled: true, blur: 6, opacity: 0.3 }
    },

    // 圆形（适用于头像等）
    circle: {
      radius: 9999,  // 足够大的值
      borderWidth: 4,
      shadow: { enabled: true, blur: 4, opacity: 0.25 }
    },

    // 画中画（抖音风格）
    pip_douyin: {
      radius: 20,
      borderWidth: 4,
      borderColor: 'white',
      shadow: { enabled: true, offsetX: 2, offsetY: 6, blur: 4, opacity: 0.3 }
    },

    // 画中画（快手风格）
    pip_kuaishou: {
      radius: 20,
      borderWidth: 4,
      borderColor: 'white',
      shadow: { enabled: true, offsetX: 2, offsetY: 6, blur: 4, opacity: 0.3 }
    },

    // 无圆角（仅边框）
    none: {
      radius: 0,
      borderWidth: 4,
      shadow: { enabled: false }
    }
  };

  return presets[preset] || presets.medium;
}

/**
 * 检查文件是否存在
 * @param {string} filePath - 文件路径
 * @returns {boolean} 是否存在
 */
function fileExists(filePath) {
  const fs = require('fs');
  return fs.existsSync(filePath);
}

/**
 * 获取文件扩展名
 * @param {string} filePath - 文件路径
 * @returns {string} 扩展名（小写）
 */
function getFileExtension(filePath) {
  const path = require('path');
  return path.extname(filePath).toLowerCase();
}

/**
 * 判断是否为视频文件
 * @param {string} filePath - 文件路径
 * @returns {boolean} 是否为视频
 */
function isVideoFile(filePath) {
  const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv', '.wmv'];
  return videoExtensions.includes(getFileExtension(filePath));
}

/**
 * 判断是否为图片文件
 * @param {string} filePath - 文件路径
 * @returns {boolean} 是否为图片
 */
function isImageFile(filePath) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
  return imageExtensions.includes(getFileExtension(filePath));
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的大小
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 计算处理进度
 * @param {number} current - 当前数量
 * @param {number} total - 总数量
 * @returns {Object} 进度信息
 */
function calculateProgress(current, total) {
  const percentage = Math.round((current / total) * 100);
  const remaining = total - current;

  return {
    current,
    total,
    percentage,
    remaining,
    completed: current === total
  };
}

/**
 * 生成唯一的文件名
 * @param {string} prefix - 前缀
 * @param {string} extension - 扩展名
 * @returns {string} 文件名
 */
function generateUniqueFilename(prefix = 'file', extension = '.mp4') {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}${extension}`;
}

/**
 * 解析颜色字符串为RGB
 * @param {string} color - 颜色字符串（如 '#ffffff' 或 'white'）
 * @returns {Object} RGB对象
 */
function parseColor(color) {
  const colorMap = {
    'white': '#ffffff',
    'black': '#000000',
    'red': '#ff0000',
    'green': '#00ff00',
    'blue': '#0000ff',
    'yellow': '#ffff00',
    'cyan': '#00ffff',
    'magenta': '#ff00ff'
  };

  // 转换颜色名称
  const hexColor = colorMap[color.toLowerCase()] || color;

  // 解析十六进制颜色
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return { r, g, b, hex: hexColor };
}

/**
 * 限制数值在指定范围内
 * @param {number} value - 值
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} 限制后的值
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * 深度合并对象
 * @param {Object} target - 目标对象
 * @param {Object} source - 源对象
 * @returns {Object} 合并后的对象
 */
function deepMerge(target, source) {
  const result = { ...target };

  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }

  return result;
}

module.exports = {
  validateRoundedCornerConfig,
  normalizeRoundedCornerConfig,
  calculateTotalDimensions,
  getRoundedCornerPreset,
  fileExists,
  getFileExtension,
  isVideoFile,
  isImageFile,
  formatFileSize,
  calculateProgress,
  generateUniqueFilename,
  parseColor,
  clamp,
  deepMerge
};
