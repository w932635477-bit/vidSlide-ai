/**
 * VidSlide AI - 约束系统
 * 验证用户调整是否符合专业设计规范
 */

import { TEMPLATE_TYPES } from './TemplateDefinitions.js'

/**
 * ConstraintSystem 类
 * 紧急补齐阶段功能实现
 */
export class ConstraintSystem {
  constructor() {
    this.constraints = this.initializeConstraints()
  }

  /**
   * 初始化约束规则
   * @returns {Object} 约束规则配置
   */
  /**

   * initializeConstraints 方法

   * VidSlide AI 功能实现

   */

  initializeConstraints() {
    return {
      // 文字内容约束
      text: {
        minLength: 1,
        maxLength: {
          [TEMPLATE_TYPES.DIALOG_POPUP]: 200,
          [TEMPLATE_TYPES.EMPHASIS_FOCUS]: 100,
          [TEMPLATE_TYPES.TIMELINE_DISPLAY]: 500,
          [TEMPLATE_TYPES.SPLIT_SCREEN]: 300,
          [TEMPLATE_TYPES.CHART_ANALYSIS]: 300
        },
        allowedChars: /^[\u4e00-\u9fa5a-zA-Z0-9\s\.,!?\-—:;""''（）《》【】]+$/
      },

      // 位置约束
      position: {
        allowedPositions: {
          [TEMPLATE_TYPES.DIALOG_POPUP]: ['bottom-right', 'bottom-left', 'top-right', 'top-left'],
          [TEMPLATE_TYPES.EMPHASIS_FOCUS]: ['center'],
          [TEMPLATE_TYPES.TIMELINE_DISPLAY]: ['bottom', 'left-to-right'],
          [TEMPLATE_TYPES.SPLIT_SCREEN]: ['center'],
          [TEMPLATE_TYPES.CHART_ANALYSIS]: ['center', 'bottom-right', 'bottom-left']
        },
        margins: {
          minEdgeDistance: 20, // 最小边距
          safeArea: 0.1 // 安全区域比例
        }
      },

      // 尺寸约束
      size: {
        minSize: {
          width: 0.1, // 最小宽度比例
          height: 0.1 // 最小高度比例
        },
        maxSize: {
          width: 0.9, // 最大宽度比例
          height: 0.9 // 最大高度比例
        },
        aspectRatio: {
          [TEMPLATE_TYPES.DIALOG_POPUP]: { min: 1.2, max: 2.5 },
          [TEMPLATE_TYPES.EMPHASIS_FOCUS]: { min: 1.0, max: 2.0 },
          [TEMPLATE_TYPES.TIMELINE_DISPLAY]: { min: 3.0, max: 8.0 },
          [TEMPLATE_TYPES.SPLIT_SCREEN]: { min: 1.5, max: 3.0 },
          [TEMPLATE_TYPES.CHART_ANALYSIS]: { min: 1.0, max: 2.0 }
        }
      },

      // 颜色约束
      colors: {
        allowedPalettes: [
          ['#ffffff', '#000000', '#FFD700', '#007BFF'], // 专业配色
          ['#ffffff', '#333333', '#666666', '#999999'], // 灰度配色
          ['#ffffff', '#007BFF', '#28A745', '#FFC107'] // 彩色配色
        ],
        contrastRatio: {
          min: 4.5, // WCAG AA标准
          recommended: 7.0 // WCAG AAA标准
        },
        brightness: {
          min: 0.2, // 最小亮度
          max: 0.9 // 最大亮度
        }
      },

      // 布局约束
      layout: {
        textMargins: {
          min: 10, // 最小文字边距
          recommended: 20 // 推荐文字边距
        },
        elementSpacing: {
          min: 8, // 最小元素间距
          recommended: 16 // 推荐元素间距
        },
        alignment: {
          allowed: ['left', 'center', 'right', 'justify']
        }
      },

      // 性能约束
      performance: {
        maxRenderTime: 100, // 最大渲染时间(ms)
        maxMemoryUsage: 50, // 最大内存使用(MB)
        maxElements: 100 // 最大元素数量
      },

      // 专业性约束
      professionalism: {
        avoidCombinations: [
          // 避免的颜色组合
          ['#ff0000', '#00ff00'], // 红绿搭配（色盲不友好）
          ['#ffff00', '#0000ff'], // 黄蓝搭配（色盲不友好）
          ['#ffffff', '#ffffff'], // 全白组合
          ['#000000', '#000000'], // 全黑组合
          ['#ff0000', '#ffff00'] // 红黄搭配（警示色误用）
        ],
        requiredElements: {
          [TEMPLATE_TYPES.DIALOG_POPUP]: ['title', 'content'],
          [TEMPLATE_TYPES.EMPHASIS_FOCUS]: ['title'],
          [TEMPLATE_TYPES.TIMELINE_DISPLAY]: ['events', 'years'],
          [TEMPLATE_TYPES.SPLIT_SCREEN]: ['leftContent', 'rightContent'],
          [TEMPLATE_TYPES.CHART_ANALYSIS]: ['data', 'title']
        }
      },

      // 字体设计规范
      typography: {
        fontSize: {
          min: 12, // 最小字体大小(px)
          max: 72, // 最大字体大小(px)
          recommended: {
            title: { min: 24, max: 48 },
            subtitle: { min: 16, max: 24 },
            body: { min: 14, max: 18 },
            caption: { min: 12, max: 14 }
          }
        },
        lineHeight: {
          min: 1.2, // 最小行高倍数
          max: 2.0, // 最大行高倍数
          recommended: {
            title: 1.1, // 标题行高较小
            body: 1.5, // 正文行高适中
            caption: 1.3 // 说明文字行高
          }
        },
        fontWeight: {
          allowed: [300, 400, 500, 600, 700], // 允许的字重
          recommended: {
            title: 600, // 标题使用中等字重
            body: 400, // 正文使用正常字重
            emphasis: 700 // 强调使用粗体
          }
        }
      },

      // 视觉层次规范
      hierarchy: {
        sizeRatio: {
          min: 1.2, // 最小尺寸比例
          max: 2.0, // 最大尺寸比例
          recommended: 1.618 // 黄金比例
        },
        contrastSteps: {
          primary: 1.25, // 主要层次对比
          secondary: 1.125 // 次要层次对比
        },
        maxLevels: 5 // 最大层次数量
      },

      // 品牌一致性
      branding: {
        colorPalette: {
          maxColors: 3, // 单个设计最多使用颜色数
          primaryColors: ['#007bff', '#28a745', '#ffc107', '#dc3545'], // 推荐主色
          neutralColors: ['#ffffff', '#f8f9fa', '#e9ecef', '#6c757d', '#343a40'] // 中性色
        },
        spacingScale: [4, 8, 12, 16, 24, 32, 48, 64], // 间距比例尺
        borderRadius: [0, 4, 8, 12, 16, 24] // 圆角比例尺
      },

      // 用户体验规范
      ux: {
        touchTargets: {
          minSize: 44, // 最小触摸目标尺寸(px)
          recommendedSize: 48 // 推荐触摸目标尺寸(px)
        },
        readability: {
          maxLineLength: 80, // 最大行长度(字符)
          minLineLength: 40, // 最小行长度(字符)
          maxLinesPerScreen: 20 // 最大屏幕行数
        },
        accessibility: {
          focusIndicator: true, // 需要焦点指示器
          colorContrast: 4.5, // 最小对比度
          altText: true // 需要替代文本
        }
      }
    }
  }

  /**
   * 验证用户调整
   * @param {Object} adjustments - 用户调整数据
   * @param {string} templateType - 模板类型
   * @param {Object} context - 验证上下文
   * @returns {Object} 验证结果 {valid, violations, warnings, suggestions}
   */
  validateAdjustments(adjustments, templateType, context) {
    if (context == null) context = {}
    /**
     * violations 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description violations 功能的具体实现
     */
    // violations - 变量声明
    const violations = []
    /**
     * warnings 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description warnings 功能的具体实现
     */
    // warnings - 变量声明
    const warnings = []
    /**
     * suggestions 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description suggestions 功能的具体实现
     */
    // suggestions - 变量声明
    const suggestions = []

    // 文字内容验证
    this.validateTextContent(adjustments, templateType, violations, warnings, suggestions)

    // 位置验证
    this.validatePosition(adjustments, templateType, violations, warnings, suggestions)

    // 尺寸验证
    this.validateSize(adjustments, templateType, violations, warnings, suggestions)

    // 颜色验证
    this.validateColors(adjustments, templateType, violations, warnings, suggestions)

    // 布局验证
    this.validateLayout(adjustments, templateType, violations, warnings, suggestions)

    // 专业性验证
    this.validateProfessionalism(adjustments, templateType, violations, warnings, suggestions)

    // 用户体验验证
    this.validateUX(adjustments, templateType, violations, warnings, suggestions)

    return {
      isValid: violations.length === 0,
      violations,
      warnings,
      suggestions,
      score: this.calculateComplianceScore(violations, warnings)
    }
  }

  /**
   * 验证文字内容
   */
  /**
   * 验证文字内容约束
   * @param {Object} adjustments - 用户调整数据
   * @param {string} templateType - 模板类型
   * @param {Array} violations - 违反规则列表
   * @param {Array} warnings - 警告列表
   * @param {Array} suggestions - 建议列表
   */
  /**

   * validateTextContent 方法

   * VidSlide AI 功能实现

   */

  validateTextContent(adjustments, templateType, violations, warnings, suggestions) {
    /**
     * textConstraints 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description textConstraints 功能的具体实现
     */
    // textConstraints - 变量声明
    const textConstraints = this.constraints.text

    /**


     * if 方法


     * VidSlide AI 功能实现


     */


    if(adjustments.text) {
      // 长度验证
      /**
       * maxLength 函数
       * VidSlide AI 紧急补齐阶段功能实现
       * @description maxLength 功能的具体实现
       */
      // maxLength - 变量声明
      const maxLength = textConstraints.maxLength[templateType] || 500
      /**

       * if 方法

       * VidSlide AI 功能实现

       */

      if(adjustments.text.length > maxLength) {
        violations.push({
          type: 'TEXT_LENGTH',
          field: 'text',
          message: `文字内容过长，最大允许${maxLength}字符`,
          current: adjustments.text.length,
          limit: maxLength
        })
      }

      /**


       * if 方法


       * VidSlide AI 功能实现


       */


      if(adjustments.text.length < textConstraints.minLength) {
        violations.push({
          type: 'TEXT_LENGTH',
          field: 'text',
          message: `文字内容过短，最少需要${textConstraints.minLength}字符`,
          current: adjustments.text.length,
          limit: textConstraints.minLength
        })
      }

      // 字符验证
      if (!textConstraints.allowedChars.test(adjustments.text)) {
        warnings.push({
          type: 'TEXT_CHARS',
          field: 'text',
          message: '包含不建议使用的特殊字符',
          suggestion: '建议使用标准中英文字符和常见标点'
        })
      }

      // 内容质量检查
      if (this.isTextTooRepetitive(adjustments.text)) {
        suggestions.push({
          type: 'TEXT_QUALITY',
          message: '文字内容可能过于重复',
          suggestion: '建议使用更多样化的表达方式'
        })
      }
    }
  }

  /**
   * 验证位置
   */
  /**
   * 验证位置约束
   * @param {Object} adjustments - 用户调整数据
   * @param {string} templateType - 模板类型
   * @param {Array} violations - 违反规则列表
   * @param {Array} warnings - 警告列表
   * @param {Array} suggestions - 建议列表
   */
  /**

   * validatePosition 方法

   * VidSlide AI 功能实现

   */

  validatePosition(adjustments, templateType, violations, warnings, suggestions) {
    /**
     * positionConstraints 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description positionConstraints 功能的具体实现
     */
    // positionConstraints - 变量声明
    const positionConstraints = this.constraints.position

    /**


     * if 方法


     * VidSlide AI 功能实现


     */


    if(adjustments.position) {
      /**
       * allowedPositions 函数
       * VidSlide AI 紧急补齐阶段功能实现
       * @description allowedPositions 功能的具体实现
       */
      // allowedPositions - 变量声明
      const allowedPositions = positionConstraints.allowedPositions[templateType] || []

      if (!allowedPositions.includes(adjustments.position)) {
        violations.push({
          type: 'POSITION_INVALID',
          field: 'position',
          message: `位置 "${adjustments.position}" 不适用于此模板类型`,
          allowed: allowedPositions,
          current: adjustments.position
        })
      }

      // 边界距离检查
      /**

       * if 方法

       * VidSlide AI 功能实现

       */

      if(adjustments.coordinates) {
        const { x, y } = adjustments.coordinates
        /**
         * margins 函数
         * VidSlide AI 紧急补齐阶段功能实现
         * @description margins 功能的具体实现
         */
        // margins - 变量声明
        const margins = positionConstraints.margins

        /**


         * if 方法


         * VidSlide AI 功能实现


         */


        if(x < margins.minEdgeDistance || y < margins.minEdgeDistance) {
          warnings.push({
            type: 'POSITION_MARGIN',
            field: 'position',
            message: '元素距离屏幕边缘过近',
            suggestion: `建议保持至少${margins.minEdgeDistance}px的边距`
          })
        }
      }
    }
  }

  /**
   * 验证尺寸
   */
  /**

   * validateSize 方法

   * VidSlide AI 功能实现

   */

  validateSize(adjustments, templateType, violations, warnings, suggestions) {
    /**
     * sizeConstraints 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description sizeConstraints 功能的具体实现
     */
    // sizeConstraints - 变量声明
    const sizeConstraints = this.constraints.size

    /**


     * if 方法


     * VidSlide AI 功能实现


     */


    if(adjustments.size) {
      const { width, height } = adjustments.size
      /**
       * minSize 函数
       * VidSlide AI 紧急补齐阶段功能实现
       * @description minSize 功能的具体实现
       */
      // minSize - 变量声明
      const minSize = sizeConstraints.minSize
      /**
       * maxSize 函数
       * VidSlide AI 紧急补齐阶段功能实现
       * @description maxSize 功能的具体实现
       */
      // maxSize - 变量声明
      const maxSize = sizeConstraints.maxSize

      // 尺寸范围验证
      /**

       * if 方法

       * VidSlide AI 功能实现

       */

      if(width < minSize.width || height < minSize.height) {
        violations.push({
          type: 'SIZE_TOO_SMALL',
          field: 'size',
          message: `尺寸过小，最小尺寸为 ${minSize.width * 100}% x ${minSize.height * 100}%`,
          current: { width, height },
          minimum: minSize
        })
      }

      /**


       * if 方法


       * VidSlide AI 功能实现


       */


      if(width > maxSize.width || height > maxSize.height) {
        violations.push({
          type: 'SIZE_TOO_LARGE',
          field: 'size',
          message: `尺寸过大，最大尺寸为 ${maxSize.width * 100}% x ${maxSize.height * 100}%`,
          current: { width, height },
          maximum: maxSize
        })
      }

      // 宽高比验证
      /**
       * aspectRatio 函数
       * VidSlide AI 紧急补齐阶段功能实现
       * @description aspectRatio 功能的具体实现
       */
      // aspectRatio - 变量声明
      const aspectRatio = width / height
      /**
       * allowedRatio 函数
       * VidSlide AI 紧急补齐阶段功能实现
       * @description allowedRatio 功能的具体实现
       */
      // allowedRatio - 变量声明
      const allowedRatio = sizeConstraints.aspectRatio[templateType]

      if (allowedRatio && (aspectRatio < allowedRatio.min || aspectRatio > allowedRatio.max)) {
        warnings.push({
          type: 'ASPECT_RATIO',
          field: 'size',
          message: `宽高比 ${aspectRatio.toFixed(2)} 超出推荐范围`,
          recommended: `${allowedRatio.min} - ${allowedRatio.max}`,
          current: aspectRatio
        })
      }
    }
  }

  /**
   * 验证颜色
   */
  /**

   * validateColors 方法

   * VidSlide AI 功能实现

   */

  validateColors(adjustments, templateType, violations, warnings, suggestions) {
    /**
     * colorConstraints 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description colorConstraints 功能的具体实现
     */
    // colorConstraints - 变量声明
    const colorConstraints = this.constraints.colors

    /**


     * if 方法


     * VidSlide AI 功能实现


     */


    if(adjustments.colors) {
      const { background, text, accent } = adjustments.colors

      // 对比度验证
      /**

       * if 方法

       * VidSlide AI 功能实现

       */

      if(background && text) {
        /**
         * contrastRatio 函数
         * VidSlide AI 紧急补齐阶段功能实现
         * @description contrastRatio 功能的具体实现
         */
        // contrastRatio - 变量声明
        const contrastRatio = this.calculateContrastRatio(text, background)

        /**


         * if 方法


         * VidSlide AI 功能实现


         */


        if(contrastRatio < colorConstraints.contrastRatio.min) {
          violations.push({
            type: 'CONTRAST_RATIO',
            field: 'colors',
            message: `文字与背景对比度不足 ${contrastRatio.toFixed(2)}，需要至少 ${colorConstraints.contrastRatio.min}`,
            current: contrastRatio,
            required: colorConstraints.contrastRatio.min
          })
        } else /**
  * if 方法
  * VidSlide AI 功能实现
  */
 if(contrastRatio < colorConstraints.contrastRatio.recommended) {
          warnings.push({
            type: 'CONTRAST_RATIO',
            field: 'colors',
            message: `建议提高对比度至 ${colorConstraints.contrastRatio.recommended} 以获得更好可读性`,
            current: contrastRatio,
            recommended: colorConstraints.contrastRatio.recommended
          })
        }
      }

      // 颜色组合验证
      /**
       * colorCombination 函数
       * VidSlide AI 紧急补齐阶段功能实现
       * @description colorCombination 功能的具体实现
       */
      // colorCombination - 变量声明
      const colorCombination = [background, text, accent].filter(c => c)
      /**

       * if 方法

       * VidSlide AI 功能实现

       */

      if(colorCombination.length >= 2) {
        /**
         * isAvoided 函数
         * VidSlide AI 紧急补齐阶段功能实现
         * @description isAvoided 功能的具体实现
         */
        // isAvoided - 变量声明
        const isAvoided = colorConstraints.professionalism.avoidCombinations.some(combo =>
          this.colorsMatch(combo, colorCombination)
        )

        /**


         * if 方法


         * VidSlide AI 功能实现


         */


        if(isAvoided) {
          warnings.push({
            type: 'COLOR_COMBINATION',
            field: 'colors',
            message: '当前颜色组合可能影响专业外观',
            suggestion: '建议使用预设的专业配色方案'
          })
        }
      }

      // 亮度验证
      ;[background, text, accent].forEach((color, index) => {
        /**

         * if 方法

         * VidSlide AI 功能实现

         */

        if(color) {
          /**
           * brightness 函数
           * VidSlide AI 紧急补齐阶段功能实现
           * @description brightness 功能的具体实现
           */
          // brightness - 变量声明
          const brightness = this.calculateBrightness(color)
          /**
           * fieldName 函数
           * VidSlide AI 紧急补齐阶段功能实现
           * @description fieldName 功能的具体实现
           */
          // fieldName - 变量声明
          const fieldName = ['background', 'text', 'accent'][index]

          /**


           * if 方法


           * VidSlide AI 功能实现


           */


          if(
            brightness < colorConstraints.brightness.min ||
            brightness > colorConstraints.brightness.max
          ) {
            suggestions.push({
              type: 'BRIGHTNESS',
              field: fieldName,
              message: `${fieldName} 颜色亮度 ${brightness.toFixed(2)} 超出推荐范围`,
              suggestion: `建议亮度在 ${colorConstraints.brightness.min} - ${colorConstraints.brightness.max} 之间`
            })
          }
        }
      })
    }
  }

  /**
   * 验证布局
   */
  /**

   * validateLayout 方法

   * VidSlide AI 功能实现

   */

  validateLayout(adjustments, templateType, violations, warnings, suggestions) {
    /**
     * layoutConstraints 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description layoutConstraints 功能的具体实现
     */
    // layoutConstraints - 变量声明
    const layoutConstraints = this.constraints.layout

    /**


     * if 方法


     * VidSlide AI 功能实现


     */


    if(adjustments.layout) {
      const { textAlign, margins, spacing } = adjustments.layout

      // 对齐方式验证
      if (textAlign && !layoutConstraints.alignment.allowed.includes(textAlign)) {
        violations.push({
          type: 'ALIGNMENT_INVALID',
          field: 'layout',
          message: `对齐方式 "${textAlign}" 不被支持`,
          allowed: layoutConstraints.alignment.allowed,
          current: textAlign
        })
      }

      // 边距验证
      /**

       * if 方法

       * VidSlide AI 功能实现

       */

      if(margins) {
        const { top, right, bottom, left } = margins
        /**
         * minMargin 函数
         * VidSlide AI 紧急补齐阶段功能实现
         * @description minMargin 功能的具体实现
         */
        // minMargin - 变量声明
        const minMargin = layoutConstraints.textMargins.min

        ;[top, right, bottom, left].forEach((margin, index) => {
          /**

           * if 方法

           * VidSlide AI 功能实现

           */

          if(margin !== undefined && margin < minMargin) {
            warnings.push({
              type: 'MARGIN_TOO_SMALL',
              field: 'layout',
              message: `${['上', '右', '下', '左'][index]}边距过小`,
              suggestion: `建议至少 ${minMargin}px`
            })
          }
        })
      }

      // 间距验证
      /**

       * if 方法

       * VidSlide AI 功能实现

       */

      if(spacing && spacing < layoutConstraints.elementSpacing.min) {
        suggestions.push({
          type: 'ELEMENT_SPACING',
          field: 'layout',
          message: '元素间距较小，可能影响视觉层次',
          suggestion: `建议使用至少 ${layoutConstraints.elementSpacing.recommended}px 的间距`
        })
      }
    }
  }

  /**
   * 验证用户体验规范
   * VidSlide AI 功能实现
   */
  validateUX(adjustments, templateType, violations, warnings, suggestions) {
    const uxRules = this.constraints.ux

    // 检查触摸目标尺寸
    if (adjustments.touchTargetSize) {
      const size = adjustments.touchTargetSize

      if (size < uxRules.touchTargets.minSize) {
        violations.push({
          type: 'TOUCH_TARGET_TOO_SMALL',
          field: 'touchTargetSize',
          value: size,
          min: uxRules.touchTargets.minSize,
          message: `触摸目标尺寸 ${size}px 小于最小要求 ${uxRules.touchTargets.minSize}px`
        })
      } else if (size < uxRules.touchTargets.recommendedSize) {
        warnings.push({
          type: 'TOUCH_TARGET_SMALL',
          field: 'touchTargetSize',
          value: size,
          recommended: uxRules.touchTargets.recommendedSize,
          message: `触摸目标尺寸 ${size}px 小于推荐尺寸 ${uxRules.touchTargets.recommendedSize}px`
        })
      }
    }

    // 检查可读性
    if (adjustments.lineLength) {
      const length = adjustments.lineLength

      if (length > uxRules.readability.maxLineLength) {
        warnings.push({
          type: 'LINE_TOO_LONG',
          field: 'lineLength',
          value: length,
          max: uxRules.readability.maxLineLength,
          message: `行长度 ${length} 字符过长，建议不超过 ${uxRules.readability.maxLineLength} 字符`
        })
      } else if (length < uxRules.readability.minLineLength) {
        suggestions.push({
          type: 'LINE_TOO_SHORT',
          field: 'lineLength',
          value: length,
          min: uxRules.readability.minLineLength,
          message: `行长度 ${length} 字符过短，建议至少 ${uxRules.readability.minLineLength} 字符`
        })
      }
    }

    // 检查辅助功能
    if (adjustments.accessibility) {
      const accessibility = adjustments.accessibility

      if (!accessibility.altText && uxRules.accessibility.altText) {
        violations.push({
          type: 'MISSING_ALT_TEXT',
          field: 'accessibility',
          message: '图片缺少替代文本，影响屏幕阅读器用户'
        })
      }

      if (!accessibility.focusIndicator && uxRules.accessibility.focusIndicator) {
        warnings.push({
          type: 'MISSING_FOCUS_INDICATOR',
          field: 'accessibility',
          message: '缺少键盘焦点指示器，影响键盘导航用户'
        })
      }
    }
  }

  /**
   * 验证专业性
   */
  /**

   * validateProfessionalism 方法

   * VidSlide AI 功能实现

   */

  validateProfessionalism(adjustments, templateType, violations, warnings, suggestions) {
    /**
     * requiredElements 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description requiredElements 功能的具体实现
     */
    // requiredElements - 变量声明
    const requiredElements = this.constraints.professionalism.requiredElements[templateType]

    /**


     * if 方法


     * VidSlide AI 功能实现


     */


    if(requiredElements) {
      requiredElements.forEach(element => {
        /**

         * if 方法

         * VidSlide AI 功能实现

         */

        if(!adjustments[element] || adjustments[element].length === 0) {
          violations.push({
            type: 'MISSING_ELEMENT',
            field: element,
            message: `缺少必需的元素: ${element}`,
            required: true
          })
        }
      })
    }

    // 模板特定验证
    /**

     * switch 方法

     * VidSlide AI 功能实现

     */

    switch(templateType) {
      case TEMPLATE_TYPES.CHART_ANALYSIS:
        /**

         * if 方法

         * VidSlide AI 功能实现

         */

        if(adjustments.data && adjustments.data.length < 2) {
          warnings.push({
            type: 'INSUFFICIENT_DATA',
            field: 'data',
            message: '图表数据点过少',
            suggestion: '建议至少提供2个数据点以构成有效图表'
          })
        }
        break

      case TEMPLATE_TYPES.TIMELINE_DISPLAY:
        /**

         * if 方法

         * VidSlide AI 功能实现

         */

        if(adjustments.events && adjustments.events.length < 2) {
          warnings.push({
            type: 'INSUFFICIENT_EVENTS',
            field: 'events',
            message: '时间线事件过少',
            suggestion: '建议至少提供2个事件以构成有效时间线'
          })
        }
        break
    }
  }

  /**
   * 计算合规分数
   * @param {Array} violations - 违反项
   * @param {Array} warnings - 警告项
   * @returns {number} 合规分数 (0-100)
   */
  /**

   * calculateComplianceScore 方法

   * VidSlide AI 功能实现

   */

  calculateComplianceScore(violations, warnings) {
    /**
     * violationPenalty 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description violationPenalty 功能的具体实现
     */
    // violationPenalty - 变量声明
    const violationPenalty = violations.length * 20 // 每个违反扣20分
    /**
     * warningPenalty 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description warningPenalty 功能的具体实现
     */
    // warningPenalty - 变量声明
    const warningPenalty = warnings.length * 5 // 每个警告扣5分

    /**
     * baseScore 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description baseScore 功能的具体实现
     */
    // baseScore - 变量声明
    const baseScore = 100
    /**
     * totalPenalty 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description totalPenalty 功能的具体实现
     */
    // totalPenalty - 变量声明
    const totalPenalty = violationPenalty + warningPenalty

    return Math.max(0, baseScore - totalPenalty)
  }

  /**
   * 检查文字是否过于重复
   * @param {string} text - 文字内容
   * @returns {boolean} 是否重复
   */
  /**

   * isTextTooRepetitive 方法

   * VidSlide AI 功能实现

   */

  isTextTooRepetitive(text) {
    /**
     * words 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description words 功能的具体实现
     */
    // words - 变量声明
    const words = text.toLowerCase().split(/\s+/)
    /**
     * wordCount 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description wordCount 功能的具体实现
     */
    // wordCount - 变量声明
    const wordCount = words.length
    /**
     * uniqueWords 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description uniqueWords 功能的具体实现
     */
    // uniqueWords - 变量声明
    const uniqueWords = new Set(words).size

    // 如果唯一单词少于总单词的30%，认为重复
    return uniqueWords / wordCount < 0.3
  }

  /**
   * 计算对比度比率
   * @param {string} color1 - 颜色1
   * @param {string} color2 - 颜色2
   * @returns {number} 对比度比率
   */
  /**

   * calculateContrastRatio 方法

   * VidSlide AI 功能实现

   */

  calculateContrastRatio(color1, color2) {
    /**
     * lum1 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description lum1 功能的具体实现
     */
    // lum1 - 变量声明
    const lum1 = this.calculateLuminance(color1)
    /**
     * lum2 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description lum2 功能的具体实现
     */
    // lum2 - 变量声明
    const lum2 = this.calculateLuminance(color2)

    /**
     * brightest 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description brightest 功能的具体实现
     */
    // brightest - 变量声明
    const brightest = Math.max(lum1, lum2)
    /**
     * darkest 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description darkest 功能的具体实现
     */
    // darkest - 变量声明
    const darkest = Math.min(lum1, lum2)

    return (brightest + 0.05) / (darkest + 0.05)
  }

  /**
   * 计算颜色亮度
   * @param {string} color - 颜色值
   * @returns {number} 亮度值 (0-1)
   */
  /**

   * calculateLuminance 方法

   * VidSlide AI 功能实现

   */

  calculateLuminance(color) {
    /**
     * rgb 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description rgb 功能的具体实现
     */
    // rgb - 变量声明
    const rgb = this.hexToRgb(color)
    if (!rgb) return 0

    const { r, g, b } = rgb
    /**
     * rsRGB 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description rsRGB 功能的具体实现
     */
    // rsRGB - 变量声明
    const rsRGB = r / 255
    /**
     * gsRGB 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description gsRGB 功能的具体实现
     */
    // gsRGB - 变量声明
    const gsRGB = g / 255
    /**
     * bsRGB 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description bsRGB 功能的具体实现
     */
    // bsRGB - 变量声明
    const bsRGB = b / 255

    /**
     * rLinear 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description rLinear 功能的具体实现
     */
    // rLinear - 变量声明
    const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4)
    /**
     * gLinear 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description gLinear 功能的具体实现
     */
    // gLinear - 变量声明
    const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4)
    /**
     * bLinear 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description bLinear 功能的具体实现
     */
    // bLinear - 变量声明
    const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4)

    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear
  }

  /**
   * 计算颜色亮度
   * @param {string} color - 颜色值
   * @returns {number} 亮度值 (0-1)
   */
  /**

   * calculateBrightness 方法

   * VidSlide AI 功能实现

   */

  calculateBrightness(color) {
    return this.calculateLuminance(color)
  }

  /**
   * 颜色是否匹配组合
   * @param {Array} combo - 颜色组合
   * @param {Array} colors - 当前颜色
   * @returns {boolean} 是否匹配
   */
  /**

   * colorsMatch 方法

   * VidSlide AI 功能实现

   */

  colorsMatch(combo, colors) {
    return combo.every(comboColor =>
      colors.some(currentColor => this.colorsSimilar(comboColor, currentColor))
    )
  }

  /**
   * 颜色是否相似
   * @param {string} color1 - 颜色1
   * @param {string} color2 - 颜色2
   * @returns {boolean} 是否相似
   */
  /**

   * colorsSimilar 方法

   * VidSlide AI 功能实现

   */

  colorsSimilar(color1, color2) {
    /**
     * rgb1 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description rgb1 功能的具体实现
     */
    // rgb1 - 变量声明
    const rgb1 = this.hexToRgb(color1)
    /**
     * rgb2 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description rgb2 功能的具体实现
     */
    // rgb2 - 变量声明
    const rgb2 = this.hexToRgb(color2)

    if (!rgb1 || !rgb2) return false

    /**
     * threshold 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description threshold 功能的具体实现
     */
    // threshold - 变量声明
    const threshold = 50 // 颜色差异阈值
    /**
     * diff 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description diff 功能的具体实现
     */
    // diff - 变量声明
    const diff = Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) + Math.pow(rgb1.g - rgb2.g, 2) + Math.pow(rgb1.b - rgb2.b, 2)
    )

    return diff < threshold
  }

  /**
   * HEX转RGB
   * @param {string} hex - HEX颜色值
   * @returns {Object|null} RGB对象或null
   */
  /**

   * hexToRgb 方法

   * VidSlide AI 功能实现

   */

  hexToRgb(hex) {
    /**
     * result 函数
     * VidSlide AI 紧急补齐阶段功能实现
     * @description result 功能的具体实现
     */
    // result - 变量声明
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        }
      : null
  }

  /**
   * 获取约束配置
   * @param {string} category - 约束类别
   * @returns {Object} 约束配置
   */
  /**

   * getConstraints 方法

   * VidSlide AI 功能实现

   */

  getConstraints(category) {
    return this.constraints[category] || {}
  }

  /**
   * 更新约束配置
   * @param {string} category - 约束类别
   * @param {Object} newConstraints - 新约束配置
   */
  /**

   * updateConstraints 方法

   * VidSlide AI 功能实现

   */

  updateConstraints(category, newConstraints) {
    /**

     * if 方法

     * VidSlide AI 功能实现

     */

    if(this.constraints[category]) {
      this.constraints[category] = { ...this.constraints[category], ...newConstraints }
    }
  }

  /**
   * 重置为默认约束
   */
  /**

   * resetToDefaults 方法

   * VidSlide AI 功能实现

   */

  resetToDefaults() {
    this.constraints = this.initializeConstraints()
  }

  /**
   * 生成合规性报告
   * VidSlide AI 功能实现
   */
  generateComplianceReport(adjustments, templateType, validationResult) {
    const report = {
      timestamp: new Date().toISOString(),
      templateType: templateType,
      overallScore: validationResult.score,
      status: validationResult.isValid ? 'compliant' : 'non-compliant',
      summary: {
        violations: validationResult.violations.length,
        warnings: validationResult.warnings.length,
        suggestions: validationResult.suggestions.length
      },
      details: {
        violations: validationResult.violations,
        warnings: validationResult.warnings,
        suggestions: validationResult.suggestions
      },
      recommendations: this.generateRecommendations(validationResult),
      metadata: {
        totalChecks: validationResult.violations.length + validationResult.warnings.length + validationResult.suggestions.length,
        criticalIssues: validationResult.violations.filter(v => v.severity === 'high').length,
        complianceLevel: this.getComplianceLevel(validationResult.score)
      }
    }

    return report
  }

  /**
   * 生成修复建议
   * VidSlide AI 功能实现
   */
  generateRecommendations(validationResult) {
    const recommendations = []

    // 基于违规类型生成建议
    const violationTypes = [...new Set(validationResult.violations.map(v => v.type))]
    const warningTypes = [...new Set(validationResult.warnings.map(w => w.type))]

    // 紧急修复（违规）
    violationTypes.forEach(type => {
      recommendations.push(...this.getRecommendationsForType(type, 'violation'))
    })

    // 改进建议（警告）
    warningTypes.forEach(type => {
      recommendations.push(...this.getRecommendationsForType(type, 'warning'))
    })

    return recommendations
  }

  /**
   * 根据问题类型生成具体建议
   * VidSlide AI 功能实现
   */
  getRecommendationsForType(type, severity) {
    const recommendations = []

    switch (type) {
      case 'TEXT_LENGTH':
        recommendations.push({
          priority: severity === 'violation' ? 'high' : 'medium',
          category: 'typography',
          action: '调整文字长度',
          description: '确保文字内容长度在允许范围内',
          implementation: '检查并截断或扩展文字内容'
        })
        break

      case 'FONT_SIZE_OUT_OF_RANGE':
        recommendations.push({
          priority: 'high',
          category: 'typography',
          action: '调整字体大小',
          description: '使用符合规范的字体大小',
          implementation: '选择12px-72px范围内的字体大小'
        })
        break

      case 'CONTRAST_RATIO':
        recommendations.push({
          priority: 'high',
          category: 'accessibility',
          action: '提高颜色对比度',
          description: '确保文字与背景的对比度符合WCAG标准',
          implementation: '调整文字或背景颜色，提高对比度至4.5:1以上'
        })
        break

      case 'TOUCH_TARGET_TOO_SMALL':
        recommendations.push({
          priority: 'high',
          category: 'ux',
          action: '增大触摸目标',
          description: '确保触摸目标至少44px x 44px',
          implementation: '增加按钮或链接的尺寸或内边距'
        })
        break

      case 'MISSING_ALT_TEXT':
        recommendations.push({
          priority: 'high',
          category: 'accessibility',
          action: '添加替代文本',
          description: '为所有图片添加描述性替代文本',
          implementation: '为img元素添加alt属性，描述图片内容'
        })
        break

      case 'TOO_MANY_COLORS':
        recommendations.push({
          priority: 'medium',
          category: 'branding',
          action: '简化配色方案',
          description: '减少使用的颜色数量以保持一致性',
          implementation: '使用不超过3种主要颜色'
        })
        break

      case 'LINE_TOO_LONG':
        recommendations.push({
          priority: 'medium',
          category: 'readability',
          action: '优化行长度',
          description: '确保每行文字长度适中',
          implementation: '调整容器宽度或字体大小'
        })
        break
    }

    return recommendations
  }

  /**
   * 获取合规性等级
   * VidSlide AI 功能实现
   */
  getComplianceLevel(score) {
    if (score >= 90) return 'excellent'
    if (score >= 80) return 'good'
    if (score >= 70) return 'acceptable'
    if (score >= 60) return 'needs-improvement'
    return 'poor'
  }
}

export default ConstraintSystem
