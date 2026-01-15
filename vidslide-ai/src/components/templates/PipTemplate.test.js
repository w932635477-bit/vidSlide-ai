import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PipTemplate from './PipTemplate.vue'

describe('PipTemplate.vue', () => {
  it('renders correctly with default props', () => {
    const wrapper = mount(PipTemplate)

    // 检查组件是否正确渲染
    expect(wrapper.exists()).toBe(true)

    // 检查是否有pip-template容器
    const pipTemplate = wrapper.find('.pip-template')
    expect(pipTemplate.exists()).toBe(true)

    // 检查是否有主内容区域
    const mainContent = wrapper.find('.main-content')
    expect(mainContent.exists()).toBe(true)

    // 检查是否有画中画窗口
    const pipWindow = wrapper.find('.pip-window')
    expect(pipWindow.exists()).toBe(true)

    // 检查默认尺寸
    expect(wrapper.vm.width).toBe(1920)
    expect(wrapper.vm.height).toBe(1080)
  })

  it('accepts and applies custom dimensions', () => {
    const wrapper = mount(PipTemplate, {
      props: {
        width: 1280,
        height: 720
      }
    })

    expect(wrapper.vm.width).toBe(1280)
    expect(wrapper.vm.height).toBe(720)
  })

  it('renders template content correctly', () => {
    const wrapper = mount(PipTemplate)

    // 检查标题内容
    const title = wrapper.find('h2')
    expect(title.exists()).toBe(true)
    expect(title.text()).toBe('PPT标题内容')

    // 检查内容描述
    const content = wrapper.find('p')
    expect(content.exists()).toBe(true)
    expect(content.text()).toContain('这里是PPT的主要内容区域')

    // 检查项目符号列表
    const bullets = wrapper.findAll('.bullet-item')
    expect(bullets.length).toBe(3)
  })

  it('applies correct CSS classes', () => {
    const wrapper = mount(PipTemplate)

    expect(wrapper.find('.pip-template').exists()).toBe(true)
    expect(wrapper.find('.main-content').exists()).toBe(true)
    expect(wrapper.find('.pip-window').exists()).toBe(true)
    expect(wrapper.find('.video-placeholder').exists()).toBe(true)
  })

  it('handles pip position configuration', () => {
    const wrapper = mount(PipTemplate, {
      props: {
        pipPosition: 'right'
      }
    })

    expect(wrapper.vm.pipPosition).toBe('right')
  })

  it('includes hover effects and interactions', () => {
    const wrapper = mount(PipTemplate)

    // 检查播放按钮是否存在
    const playButton = wrapper.find('.play-button')
    expect(playButton.exists()).toBe(true)

    // 检查视频覆盖层
    const videoOverlay = wrapper.find('.video-overlay')
    expect(videoOverlay.exists()).toBe(true)
    expect(videoOverlay.text()).toBe('视频预览')
  })

  it('maintains aspect ratio and responsive design', () => {
    const wrapper = mount(PipTemplate)

    // 检查组件是否正确计算样式
    expect(wrapper.vm.slideWidth).toBe(1920)
    expect(wrapper.vm.slideHeight).toBe(1080)

    // 检查计算属性是否正常工作
    const mainContentStyle = wrapper.vm.mainContentStyle
    expect(mainContentStyle).toHaveProperty('width', '70%')
    expect(mainContentStyle).toHaveProperty('height', '100%')
  })

  it('supports face tracking indicator', () => {
    const wrapper = mount(PipTemplate, {
      props: {
        faceTracking: true
      }
    })

    // 检查人脸跟踪指示器是否显示
    const indicator = wrapper.find('.face-tracking-indicator')
    expect(indicator.exists()).toBe(true)
  })

  it('handles custom content props', () => {
    const customTitle = '自定义标题'
    const customContent = '自定义内容'
    const customBullets = [
      { id: 1, text: '自定义项目1' },
      { id: 2, text: '自定义项目2' }
    ]

    const wrapper = mount(PipTemplate, {
      props: {
        title: customTitle,
        content: customContent,
        bullets: customBullets
      }
    })

    expect(wrapper.find('h2').text()).toBe(customTitle)
    expect(wrapper.find('p').text()).toBe(customContent)
    expect(wrapper.findAll('.bullet-item').length).toBe(2)
  })
})
