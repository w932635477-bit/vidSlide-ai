/**
 * VidSlide AI - 统一时间轴数据格式
 *
 * 前后端共享，确保完全兼容
 *
 * 创建时间: 2026-01-23
 * 版本: v1.0
 */

/**
 * 基础时间轴格式（Layer 1）
 * 由 TimelineBuilder 生成
 */
export const BaseTimelineSchema = {
  version: '1.0',

  // 视频基础信息
  videoInfo: {
    duration: 0,        // 秒
    fps: 30,
    resolution: '1080x1920',
    audioSampleRate: 44100
  },

  // 语音分段（带精确时间戳）
  speechSegments: [
    {
      id: 'speech_1',
      startTime: 0.0,
      endTime: 0.0,
      text: '',
      confidence: 0.0,
      isPause: false,

      // 词级别时间戳（可选）
      words: [
        {
          word: '',
          startTime: 0.0,
          endTime: 0.0
        }
      ]
    }
  ],

  // 自然断点（最佳插入时机）
  insertionPoints: [
    {
      id: 'point_1',
      time: 0.0,
      type: 'pause',  // pause | sentence_end | scene_change
      duration: 0.0,
      suitability: 'high',  // high | medium | low
      metadata: {
        pauseLength: 0.0,
        energyLevel: 'low',  // low | medium | high
        beforeText: '',
        afterText: ''
      }
    }
  ],

  // 场景变化点（可选）
  sceneChanges: [
    {
      id: 'scene_1',
      time: 0.0,
      type: 'visual_change',
      confidence: 0.0,
      description: ''
    }
  ]
};

/**
 * UI时间轴格式（Layer 2 & 3）
 * 由 SceneDesigner 生成，前端 TimelineEditor 直接使用
 */
export const UITimelineSchema = {
  version: '1.0',
  duration: 0,
  fps: 30,

  // 多轨道结构（与前端UI完全兼容）
  tracks: [
    {
      id: 'track_1',
      name: '轨道名称',
      type: 'video',  // video | overlay | background | audio
      visible: true,
      locked: false,
      zIndex: 0,

      clips: [
        {
          id: 'clip_1',
          name: '片段名称',
          type: 'original',  // original | card | pip | material
          startTime: 0,
          endTime: 0,

          // 关联到基础时间轴
          linkedTo: {
            speechSegmentId: null,
            insertionPointId: null
          },

          // 内容配置（根据type不同而不同）
          content: {},

          // 视频源（仅用于video类型）
          source: {
            type: 'original_video',
            path: '',
            trimStart: 0,
            trimEnd: 0
          },

          // 关键帧（用于动画）
          keyframes: [
            {
              time: 0,
              property: 'opacity',
              value: 1,
              easing: 'linear'
            }
          ]
        }
      ]
    }
  ],

  // 全局标记（用于UI显示）
  markers: [
    {
      id: 'marker_1',
      time: 0,
      label: '标记',
      color: '#00ff00',
      type: 'insertion_point'
    }
  ]
};

/**
 * 创建空的基础时间轴
 */
export function createEmptyBaseTimeline(videoInfo) {
  return {
    version: '1.0',
    videoInfo: {
      duration: videoInfo.duration || 0,
      fps: videoInfo.fps || 30,
      resolution: videoInfo.resolution || '1080x1920',
      audioSampleRate: videoInfo.audioSampleRate || 44100
    },
    speechSegments: [],
    insertionPoints: [],
    sceneChanges: []
  };
}

/**
 * 创建空的UI时间轴
 */
export function createEmptyUITimeline(duration, fps = 30) {
  return {
    version: '1.0',
    duration: duration,
    fps: fps,
    tracks: [],
    markers: []
  };
}

/**
 * 验证基础时间轴格式
 */
export function validateBaseTimeline(timeline) {
  if (!timeline || typeof timeline !== 'object') {
    return { valid: false, error: '时间轴必须是对象' };
  }

  if (!timeline.version) {
    return { valid: false, error: '缺少version字段' };
  }

  if (!timeline.videoInfo) {
    return { valid: false, error: '缺少videoInfo字段' };
  }

  if (!Array.isArray(timeline.speechSegments)) {
    return { valid: false, error: 'speechSegments必须是数组' };
  }

  if (!Array.isArray(timeline.insertionPoints)) {
    return { valid: false, error: 'insertionPoints必须是数组' };
  }

  return { valid: true };
}

/**
 * 验证UI时间轴格式
 */
export function validateUITimeline(timeline) {
  if (!timeline || typeof timeline !== 'object') {
    return { valid: false, error: '时间轴必须是对象' };
  }

  if (!timeline.version) {
    return { valid: false, error: '缺少version字段' };
  }

  if (typeof timeline.duration !== 'number') {
    return { valid: false, error: 'duration必须是数字' };
  }

  if (!Array.isArray(timeline.tracks)) {
    return { valid: false, error: 'tracks必须是数组' };
  }

  return { valid: true };
}

export default {
  BaseTimelineSchema,
  UITimelineSchema,
  createEmptyBaseTimeline,
  createEmptyUITimeline,
  validateBaseTimeline,
  validateUITimeline
};
