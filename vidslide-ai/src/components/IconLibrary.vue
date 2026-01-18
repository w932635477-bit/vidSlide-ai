/** * IconLibrary.vue - 优雅的图标库 * Apple SF Symbols 风格的图标系统 */
<template>
  <svg
    :width="size"
    :height="size"
    :viewBox="viewBox"
    fill="none"
    :stroke="color"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    :class="['icon', `icon-${name}`]"
  >
    <component :is="iconComponent" />
  </svg>
</template>

<script setup>
import { computed, h } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: [Number, String],
    default: 20
  },
  color: {
    type: String,
    default: 'currentColor'
  },
  strokeWidth: {
    type: [Number, String],
    default: 1.5
  }
})

const viewBox = computed(() => '0 0 24 24')

// 图标组件映射 - SF Symbols 风格
const icons = {
  // 项目管理
  plus: () => h('path', { d: 'M12 5v14M5 12h14' }),
  folder: () =>
    h('path', {
      d: 'M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-7l-2-2H5a2 2 0 0 0-2 2z'
    }),
  save: () => [
    h('path', { d: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z' }),
    h('path', { d: 'M7 3v5h8M7 21v-8h10v8' })
  ],

  // 上传/下载
  upload: () => h('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12' }),
  download: () =>
    h('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3' }),

  // 媒体控制
  play: () => h('path', { d: 'M5 3l14 9-14 9V3z' }),
  pause: () => [h('path', { d: 'M6 4h4v16H6zM14 4h4v16h-4z' })],
  stop: () => h('rect', { x: '6', y: '6', width: '12', height: '12', rx: '1' }),

  // 编辑操作
  scissors: () => [
    h('circle', { cx: '6', cy: '6', r: '3' }),
    h('circle', { cx: '6', cy: '18', r: '3' }),
    h('path', { d: 'M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12' })
  ],
  layers: () => [
    h('path', { d: 'M12 2L2 7l10 5 10-5-10-5z' }),
    h('path', { d: 'M2 17l10 5 10-5M2 12l10 5 10-5' })
  ],
  move: () => [
    h('path', { d: 'M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20' })
  ],

  // 视图控制
  eye: () => [
    h('path', { d: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' }),
    h('circle', { cx: '12', cy: '12', r: '3' })
  ],
  'eye-off': () => [
    h('path', {
      d: 'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22'
    })
  ],
  grid: () => [
    h('rect', { x: '3', y: '3', width: '7', height: '7' }),
    h('rect', { x: '14', y: '3', width: '7', height: '7' }),
    h('rect', { x: '14', y: '14', width: '7', height: '7' }),
    h('rect', { x: '3', y: '14', width: '7', height: '7' })
  ],

  // 设置和工具
  settings: () =>
    h('path', {
      d: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z'
    }),
  refresh: () =>
    h('path', {
      d: 'M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2'
    }),
  search: () => [h('circle', { cx: '11', cy: '11', r: '8' }), h('path', { d: 'm21 21-4.35-4.35' })],

  // 状态图标
  check: () => h('path', { d: 'M20 6L9 17l-5-5' }),
  x: () => [h('path', { d: 'M18 6L6 18M6 6l12 12' })],
  info: () => [
    h('circle', { cx: '12', cy: '12', r: '10' }),
    h('path', { d: 'M12 16v-4M12 8h.01' })
  ],
  alert: () => [
    h('path', {
      d: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z'
    }),
    h('path', { d: 'M12 9v4M12 17h.01' })
  ],

  // 箭头
  'chevron-down': () => h('path', { d: 'm6 9 6 6 6-6' }),
  'chevron-up': () => h('path', { d: 'm18 15-6-6-6 6' }),
  'chevron-left': () => h('path', { d: 'm15 18-6-6 6-6' }),
  'chevron-right': () => h('path', { d: 'm9 18 6-6-6-6' }),

  // 特殊图标 - 闪电(一键生成)
  zap: () => h('path', { d: 'M13 2L3 14h8l-1 8 10-12h-8l1-8z' }),

  // 音乐和音频
  music: () => [
    h('path', { d: 'M9 18V5l12-2v13' }),
    h('circle', { cx: '6', cy: '18', r: '3' }),
    h('circle', { cx: '18', cy: '16', r: '3' })
  ],
  volume: () => [
    h('path', { d: 'M11 5L6 9H2v6h4l5 4V5z' }),
    h('path', { d: 'M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14' })
  ]
}

const iconComponent = computed(() => {
  const icon = icons[props.name]
  return icon ? icon : icons['x']
})
</script>

<style scoped>
.icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
  transition: all var(--duration-base) var(--ease-smooth);
}

.icon:hover {
  transform: scale(1.05);
}
</style>
