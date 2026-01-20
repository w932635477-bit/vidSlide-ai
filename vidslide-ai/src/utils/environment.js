/**
 * 环境检测工具
 * 用于判断当前运行环境（Node.js 或浏览器）
 */

// 检测是否为 Node.js 环境
export const isNode = typeof window === 'undefined' && typeof process !== 'undefined';

// 检测是否为浏览器环境
export const isBrowser = !isNode;

// 获取环境名称
export const getEnvironment = () => {
  return isNode ? 'node' : 'browser';
};

// 日志输出（兼容两种环境）
export const log = (...args) => {
  console.log(...args);
};

// 错误输出（兼容两种环境）
export const error = (...args) => {
  console.error(...args);
};

// 警告输出（兼容两种环境）
export const warn = (...args) => {
  console.warn(...args);
};

export default {
  isNode,
  isBrowser,
  getEnvironment,
  log,
  error,
  warn
};
