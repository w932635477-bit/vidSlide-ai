/**
 * PracticalTimelineGenerator - 实用时间轴生成器
 *
 * 功能：
 * 1. 多层时间轴编排
 * 2. 动画效果定义
 * 3. 字幕同步
 */

class PracticalTimelineGenerator {
  constructor() {
    this.defaultPosition = {
      banner: { x: 'center', y: 50, width: 800, height: 100 },
      questionCards: { x: 'center', y: 'center', width: 600, height: 400 },
      conceptCard: { x: 'center', y: 'center', width: 400, height: 300 },
      subtitle: { x: 'center', y: 500, fontSize: 32 }
    }
  }

  /**
   * 生成时间轴
   */
  generate(analysisResult, pattern, assets) {
    console.log('开始生成时间轴...')

    // 1. 创建基础时间轴
    const timeline = this.createBaseTimeline(assets.duration)

    // 2. 添加固定层（主视频+横幅）
    timeline.layers.push(...this.createFixedLayers(assets))

    // 3. 根据叙事模式添加动态层
    if (pattern.name === 'sequential_reveal') {
      timeline.layers.push(...this.createSequentialRevealLayers(analysisResult, assets))
    } else if (pattern.name === 'comparison') {
      timeline.layers.push(...this.createComparisonLayers(analysisResult, assets))
    } else if (pattern.name === 'timeline') {
      timeline.layers.push(...this.createTimelineLayers(analysisResult, assets))
    } else {
      timeline.layers.push(...this.createBasicLayers(analysisResult, assets))
    }

    // 4. 添加字幕层
    timeline.layers.push(this.createSubtitleLayer(analysisResult))

    // 5. 验证时间轴
    if (!this.validateTimeline(timeline)) {
      console.warn('⚠️ 时间轴验证失败，可能存在问题')
    }

    console.log('✅ 时间轴生成完成，共', timeline.layers.length, '层')
    return timeline
  }

  /**
   * 创建基础时间轴结构
   */
  createBaseTimeline(duration) {
    return {
      duration: duration,
      fps: 30,
      resolution: { width: 1920, height: 1080 },
      layers: []
    }
  }

  /**
   * 创建固定层（主视频+横幅）
   */
  createFixedLayers(assets) {
    const layers = []

    // 主视频层（底层）
    layers.push({
      type: 'video',
      name: 'main-video',
      source: assets.videoPath,
      startTime: 0,
      endTime: assets.duration,
      position: { x: 0, y: 0, width: 1920, height: 1080 },
      zIndex: 0
    })

    // 横幅层
    layers.push({
      type: 'image',
      name: 'banner',
      source: assets.bannerPath,
      startTime: 0,
      endTime: assets.duration,
      position: this.defaultPosition.banner,
      zIndex: 10,
      effects: [
        this.createFadeEffect(0, 0.5), // 开场淡入
        this.createScaleEffect(0, 0.5, 0.8, 1.0) // 开场缩放
      ]
    })

    return layers
  }

  /**
   * 创建Sequential Reveal模式的动态层
   */
  createSequentialRevealLayers(analysisResult, assets) {
    const layers = []
    let conceptIndex = 0

    analysisResult.segments.forEach((segment, index) => {
      if (segment.type === 'suspense') {
        // 悬念阶段：显示问号卡片
        layers.push({
          type: 'image',
          name: 'question-cards',
          source: assets.questionCardsPath,
          startTime: segment.startTime,
          endTime: segment.endTime,
          position: this.defaultPosition.questionCards,
          zIndex: 20,
          effects: [
            this.createFadeEffect(segment.startTime, segment.startTime + 0.5),
            this.createScaleEffect(segment.startTime, segment.startTime + 0.5, 0.8, 1.0)
          ]
        })
      } else if (segment.type === 'reveal' && segment.concepts && segment.concepts.length > 0) {
        // 揭示阶段：翻转显示概念卡片
        const concept = segment.concepts[0]
        const conceptCard = assets.conceptCards.find(c => c.concept === concept)

        if (conceptCard && conceptIndex < assets.conceptCards.length) {
          layers.push({
            type: 'image',
            name: `concept-${conceptIndex}`,
            source: conceptCard.path,
            startTime: segment.startTime,
            endTime: segment.endTime,
            position: this.defaultPosition.conceptCard,
            zIndex: 30,
            effects: [
              this.createFlipEffect(segment.startTime, segment.startTime + 0.5),
              this.createFadeEffect(segment.endTime - 0.5, segment.endTime)
            ]
          })

          conceptIndex++
        }
      }
    })

    return layers
  }

  /**
   * 创建Comparison模式的动态层
   */
  createComparisonLayers(analysisResult, assets) {
    const layers = []

    // 左右对比布局
    const leftPosition = { x: 300, y: 'center', width: 500, height: 400 }
    const rightPosition = { x: 1120, y: 'center', width: 500, height: 400 }

    assets.conceptCards.forEach((card, index) => {
      const position = index % 2 === 0 ? leftPosition : rightPosition
      const segment = analysisResult.segments.find(s => s.concepts && s.concepts.includes(card.concept))

      if (segment) {
        layers.push({
          type: 'image',
          name: `concept-${index}`,
          source: card.path,
          startTime: segment.startTime,
          endTime: segment.endTime,
          position: position,
          zIndex: 20,
          effects: [
            this.createFadeEffect(segment.startTime, segment.startTime + 0.5),
            this.createScaleEffect(segment.startTime, segment.startTime + 0.5, 0.8, 1.0)
          ]
        })
      }
    })

    return layers
  }

  /**
   * 创建Timeline模式的动态层
   */
  createTimelineLayers(analysisResult, assets) {
    const layers = []

    // 时间线布局：从左到右依次展示
    const baseX = 200
    const spacing = 400

    assets.conceptCards.forEach((card, index) => {
      const segment = analysisResult.segments.find(s => s.concepts && s.concepts.includes(card.concept))

      if (segment) {
        layers.push({
          type: 'image',
          name: `concept-${index}`,
          source: card.path,
          startTime: segment.startTime,
          endTime: segment.endTime,
          position: {
            x: baseX + index * spacing,
            y: 'center',
            width: 350,
            height: 300
          },
          zIndex: 20,
          effects: [
            this.createFadeEffect(segment.startTime, segment.startTime + 0.5),
            this.createSlideEffect(segment.startTime, segment.startTime + 0.5, 'left')
          ]
        })
      }
    })

    return layers
  }

  /**
   * 创建Basic模式的动态层
   */
  createBasicLayers(analysisResult, assets) {
    const layers = []

    assets.conceptCards.forEach((card, index) => {
      const segment = analysisResult.segments.find(s => s.concepts && s.concepts.includes(card.concept))

      if (segment) {
        layers.push({
          type: 'image',
          name: `concept-${index}`,
          source: card.path,
          startTime: segment.startTime,
          endTime: segment.endTime,
          position: this.defaultPosition.conceptCard,
          zIndex: 20,
          effects: [this.createFadeEffect(segment.startTime, segment.startTime + 0.5)]
        })
      }
    })

    return layers
  }

  /**
   * 创建字幕层
   */
  createSubtitleLayer(analysisResult) {
    const subtitles = analysisResult.segments.map(segment => ({
      text: segment.text,
      startTime: segment.startTime,
      endTime: segment.endTime
    }))

    return {
      type: 'subtitle',
      name: 'subtitles',
      subtitles: subtitles,
      position: this.defaultPosition.subtitle,
      style: {
        fontSize: 32,
        fontFamily: 'Arial',
        color: 'white',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 10
      },
      zIndex: 100
    }
  }

  /**
   * 创建淡入淡出效果
   */
  createFadeEffect(startTime, endTime) {
    return {
      type: 'fade',
      startTime: startTime,
      endTime: endTime,
      from: 0,
      to: 1
    }
  }

  /**
   * 创建翻转效果
   */
  createFlipEffect(startTime, endTime) {
    return {
      type: 'flip',
      startTime: startTime,
      endTime: endTime,
      duration: endTime - startTime,
      axis: 'y'
    }
  }

  /**
   * 创建缩放效果
   */
  createScaleEffect(startTime, endTime, from, to) {
    return {
      type: 'scale',
      startTime: startTime,
      endTime: endTime,
      from: from,
      to: to
    }
  }

  /**
   * 创建滑动效果
   */
  createSlideEffect(startTime, endTime, direction) {
    return {
      type: 'slide',
      startTime: startTime,
      endTime: endTime,
      direction: direction
    }
  }

  /**
   * 计算层的持续时间
   */
  calculateDuration(layer) {
    return layer.endTime - layer.startTime
  }

  /**
   * 检测时间重叠
   */
  hasOverlap(layer1, layer2) {
    return !(layer1.endTime <= layer2.startTime || layer2.endTime <= layer1.startTime)
  }

  /**
   * 验证时间轴完整性
   */
  validateTimeline(timeline) {
    // 检查所有层的时间是否在有效范围内
    for (const layer of timeline.layers) {
      if (layer.startTime < 0 || layer.endTime > timeline.duration) {
        console.error('层时间超出范围:', layer)
        return false
      }

      if (layer.startTime >= layer.endTime) {
        console.error('层时间无效:', layer)
        return false
      }
    }

    return true
  }
}

export default PracticalTimelineGenerator
