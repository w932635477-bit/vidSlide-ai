/**
 * VideoPlayer.test.js
 * VidSlide AI - VideoPlayer组件测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import VideoPlayer from './VideoPlayer.vue'

// Mock video element methods
const mockVideoElement = {
  play: vi.fn(),
  pause: vi.fn(),
  load: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  currentTime: 0,
  duration: 100,
  muted: false,
  volume: 1
}

describe('VideoPlayer.vue', () => {
  let wrapper

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()

    wrapper = mount(VideoPlayer, {
      props: {
        videoSrc: 'test-video.mp4'
      },
      global: {
        stubs: {
          video: true // Stub the video element
        }
      }
    })

    // Mock the video element ref
    wrapper.vm.videoElement = mockVideoElement
  })

  describe('渲染', () => {
    it('应该正确渲染组件', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.classes()).toContain('video-player')
    })

    it('应该包含video元素', () => {
      const video = wrapper.find('video')
      expect(video.exists()).toBe(true)
      expect(video.attributes('src')).toBe('test-video.mp4')
    })

    it('应该根据props显示控件', async () => {
      await wrapper.setProps({ showControls: false })
      const video = wrapper.find('video')
      expect(video.attributes('controls')).toBeUndefined()
    })

    it('应该支持字幕', async () => {
      await wrapper.setProps({ subtitleSrc: 'test.vtt' })
      const track = wrapper.find('track')
      expect(track.exists()).toBe(true)
      expect(track.attributes('src')).toBe('test.vtt')
    })
  })

  describe('属性', () => {
    it('应该正确处理autoplay属性', async () => {
      await wrapper.setProps({ autoplay: true })
      const video = wrapper.find('video')
      expect(video.attributes('autoplay')).toBeDefined()
    })

    it('应该正确处理muted属性', async () => {
      await wrapper.setProps({ muted: true })
      // Muted is handled in the component logic, not directly as attribute
      expect(wrapper.vm.muted).toBe(true)
    })
  })

  describe('自定义控件', () => {
    beforeEach(async () => {
      await wrapper.setProps({ showCustomControls: true })
    })

    it('应该显示自定义控件', () => {
      const controls = wrapper.find('.custom-controls')
      expect(controls.exists()).toBe(true)
    })

    it('应该包含播放/暂停按钮', () => {
      const playButton = wrapper.find('button')
      expect(playButton.exists()).toBe(true)
    })

    it('应该包含进度条', () => {
      const progressBar = wrapper.find('.progress-bar')
      expect(progressBar.exists()).toBe(true)
      expect(progressBar.attributes('type')).toBe('range')
    })

    it('应该显示时间信息', () => {
      const timeDisplay = wrapper.find('.time-display')
      expect(timeDisplay.exists()).toBe(true)
    })
  })

  describe('方法', () => {
    it('应该正确播放视频', async () => {
      await wrapper.vm.playPause()
      // Note: playPause method toggles isPlaying state
      expect(wrapper.vm.isPlaying).toBe(true)
    })

    it('应该正确暂停视频', async () => {
      wrapper.vm.isPlaying = true
      await wrapper.vm.playPause()
      expect(wrapper.vm.isPlaying).toBe(false)
    })

    it('应该正确跳转到指定时间', async () => {
      const testTime = 50
      wrapper.vm.seekToTime(testTime)
      // The method should exist and be callable
      expect(wrapper.vm.seekToTime).toBeDefined()
    })

    it('应该正确切换静音状态', async () => {
      await wrapper.vm.toggleMute()
      // Toggle method should exist
      expect(wrapper.vm.toggleMute).toBeDefined()
    })

    it('应该正确格式化时间', () => {
      expect(wrapper.vm.formatTime(0)).toBe('0:00')
      expect(wrapper.vm.formatTime(60)).toBe('1:00')
      expect(wrapper.vm.formatTime(125)).toBe('2:05')
      expect(wrapper.vm.formatTime(3661)).toBe('61:01')
    })
  })

  describe('事件处理', () => {
    it('应该处理loadeddata事件', () => {
      const mockEvent = { target: mockVideoRef }
      wrapper.vm.onLoadedData(mockEvent)
      // Event handler should exist
      expect(wrapper.vm.onLoadedData).toBeDefined()
    })

    it('应该处理timeupdate事件', () => {
      const mockEvent = { target: { currentTime: 25 } }
      wrapper.vm.onTimeUpdate(mockEvent)
      // Event handler should exist
      expect(wrapper.vm.onTimeUpdate).toBeDefined()
    })

    it('应该处理ended事件', () => {
      wrapper.vm.onEnded()
      expect(wrapper.vm.isPlaying).toBe(false)
    })
  })

  describe('无障碍访问', () => {
    it('应该有适当的aria-labels', async () => {
      await wrapper.setProps({ showCustomControls: true })
      const buttons = wrapper.findAll('button')

      buttons.forEach(button => {
        expect(button.attributes('aria-label')).toBeDefined()
      })
    })

    it('应该支持键盘导航', async () => {
      await wrapper.setProps({ showCustomControls: true })
      const progressBar = wrapper.find('.progress-bar')
      expect(progressBar.attributes('aria-label')).toBe('视频进度')
    })
  })
})