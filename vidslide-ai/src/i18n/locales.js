/**
 * 多语言配置
 * 支持：中文、英文
 */

export const locales = {
  zhCN: {
    name: '中文',
    flag: '🇨🇳',
    // 导航栏
    nav: {
      features: '功能',
      pricing: '定价',
      about: '关于',
      login: '登录',
      signup: '免费试用'
    },
    // Hero区域
    hero: {
      badge: 'AI驱动的视频转PPT工具',
      title: '3分钟将口播视频转换为专业PPT演示',
      subtitle:
        'VidSlide AI 自动分析视频内容，智能生成现代化PPT幻灯片，与原视频完美融合。节省3-5小时工作量，让内容创作更高效。',
      cta: {
        primary: '立即开始',
        secondary: '观看演示'
      },
      stats: {
        users: '活跃用户',
        time: '节省时间',
        local: '本地处理'
      }
    },
    // 工作页面
    workspace: {
      title: '🎬 VidSlide AI - 工作空间',
      header: {
        newProject: '新建项目',
        openProject: '打开项目',
        save: '保存'
      },
      upload: {
        title: '上传您的视频',
        desc: '支持 MP4、AVI、MOV 等格式，文件大小不超过 500MB',
        button: '选择视频文件',
        supportedFormats: '支持格式',
        maxSize: '最大文件大小',
        uploading: '正在上传...',
        completed: '已完成',
        cancel: '取消',
        uploadSuccess: '视频上传成功',
        uploadCancelled: '上传已取消',
        uploadAnother: '上传其他视频',
        startAnalysis: '开始分析',
        uploadError: '上传失败',
        tryAgain: '重试',
        errors: {
          invalidFormat: '不支持的文件格式',
          fileTooLarge: '文件大小超过限制 ({maxSize})',
          uploadFailed: '上传失败，请重试'
        }
      },
      editor: {
        selectTemplate: '请选择模板',
        preview: '预览',
        export: '导出'
      },
      status: {
        title: '项目状态',
        video: '视频',
        template: '模板',
        pip: '画中画',
        loaded: '已加载',
        notLoaded: '未加载',
        selected: '已选择',
        notSelected: '未选择',
        enabled: '已启用',
        disabled: '已禁用'
      },
      animations: {
        title: '动画效果',
        fade: '淡入淡出',
        slide: '滑动',
        zoom: '缩放',
        clear: '清除动画'
      },
      ai: {
        title: 'AI 建议',
        suggestions: {
          pip: '建议使用画中画模板',
          chart: '检测到数据内容，推荐图表模板',
          color: '建议调整色彩对比度'
        }
      },
      templates: {
        pip: {
          name: '画中画模板',
          desc: '视频与PPT并排显示'
        },
        infoCard: {
          name: '信息卡片',
          desc: '结构化展示信息'
        },
        keyword: {
          name: '关键词高亮',
          desc: '突出显示重要内容'
        },
        document: {
          name: '文档展示',
          desc: '3D效果展示文档'
        },
        title: {
          name: '标题幻灯片',
          desc: '简洁的标题展示'
        }
      },
      timeline: {
        title: '时间轴',
        markerCount: '标记数量',
        addMarker: '添加标记',
        removeMarker: '删除标记',
        clearAll: '清除全部',
        addNewMarker: '添加新标记',
        markerType: '标记类型',
        markerTime: '标记时间',
        cancel: '取消',
        confirm: '确认',
        markerAdded: '标记已添加',
        markerDeleted: '标记已删除',
        allMarkersCleared: '所有标记已清除',
        confirmDelete: '确定要删除此标记吗？',
        deleteTitle: '删除标记',
        confirmClearAll: '确定要清除所有标记吗？',
        clearTitle: '清除标记',
        confirmNewProject: '创建新项目将清除当前内容，是否继续？',
        types: {
          text: '文字',
          image: '图片',
          chart: '图表',
          transition: '转场'
        },
        errors: {
          invalidTime: '时间超出范围'
        }
      },
      export: {
        export: '导出',
        title: '导出设置',
        format: '导出格式',
        settings: '导出选项',
        quality: '视频质量',
        quality720p: '720p 标清',
        quality1080p: '1080p 高清',
        quality4k: '4K 超清',
        includeAudio: '包含音频',
        watermark: '水印设置',
        watermarkNone: '无水印',
        watermarkLight: '轻量水印',
        watermarkPremium: '高级水印',
        filename: '文件名',
        filenamePlaceholder: '输入导出文件名',
        preview: '预览',
        duration: '时长',
        size: '预估大小',
        cancel: '取消',
        startExport: '开始导出',
        exporting: '正在导出...',
        remaining: '剩余时间',
        cannotExport: '当前无法导出',
        selectFormat: '请选择导出格式',
        exportSuccess: '导出成功',
        exportFailed: '导出失败',
        exportCancelled: '导出已取消',
        steps: {
          preparing: '准备中...',
          processing: '处理中...',
          rendering: '渲染中...',
          finalizing: '完成中...'
        }
      },
      progress: {
        processedFrames: '已处理帧数',
        templatesMatched: '已匹配模板',
        materialsLoaded: '已加载素材',
        cancel: '取消',
        showDetails: '显示详情',
        hideDetails: '隐藏详情',
        minimize: '最小化',
        errorTitle: '处理出错',
        retry: '重试',
        timeUnknown: '计算中...',
        stages: {
          analyze: '分析',
          analyzeTitle: '正在分析视频内容',
          analyzeDesc: 'AI正在识别视频中的关键信息和场景',
          template: '模板',
          templateTitle: '正在匹配模板',
          templateDesc: '根据内容智能选择最佳模板',
          render: '渲染',
          renderTitle: '正在生成效果',
          renderDesc: '合成最终视频效果'
        }
      },
      error: {
        title: '发生错误',
        showDetails: '显示详情',
        close: '关闭',
        retry: '重试',
        report: '报告问题',
        history: '错误历史',
        stats: '错误统计',
        totalErrors: '总错误数',
        criticalErrors: '严重错误',
        resolvedErrors: '已解决',
        recoveryRate: '恢复率',
        reportSent: '错误报告已发送',
        network: {
          title: '网络错误',
          message: '网络连接失败，请检查您的网络设置'
        },
        upload: {
          title: '上传错误',
          message: '文件上传失败'
        },
        processing: {
          title: '处理错误',
          message: '处理过程中发生错误'
        },
        export: {
          title: '导出错误',
          message: '导出过程中发生错误'
        },
        validation: {
          title: '验证错误',
          message: '输入验证失败'
        },
        permission: {
          title: '权限错误',
          message: '没有执行此操作的权限'
        },
        runtime: {
          title: '运行时错误',
          message: '应用程序发生运行时错误'
        },
        promise: {
          title: '异步错误',
          message: '异步操作失败'
        },
        unknown: {
          title: '未知错误'
        }
      }
    }
  },
  enUS: {
    name: 'English',
    flag: '🇺🇸',
    // Navigation
    nav: {
      features: 'Features',
      pricing: 'Pricing',
      about: 'About',
      login: 'Login',
      signup: 'Free Trial'
    },
    // Hero section
    hero: {
      badge: 'AI-Powered Video to PPT Tool',
      title: 'Convert Video to Professional PPT in 3 Minutes',
      subtitle:
        'VidSlide AI automatically analyzes video content, intelligently generates modern PPT slides, and perfectly integrates with the original video. Save 3-5 hours of work and make content creation more efficient.',
      cta: {
        primary: 'Get Started',
        secondary: 'Watch Demo'
      },
      stats: {
        users: 'Active Users',
        time: 'Time Saved',
        local: 'Local Processing'
      }
    },
    // Workspace
    workspace: {
      title: '🎬 VidSlide AI - Workspace',
      header: {
        newProject: 'New Project',
        openProject: 'Open Project',
        save: 'Save'
      },
      upload: {
        title: 'Upload Your Video',
        desc: 'Supports MP4, AVI, MOV formats, file size up to 500MB',
        button: 'Select Video File',
        supportedFormats: 'Supported formats',
        maxSize: 'Max file size',
        uploading: 'Uploading...',
        completed: 'completed',
        cancel: 'Cancel',
        uploadSuccess: 'Video uploaded successfully',
        uploadCancelled: 'Upload cancelled',
        uploadAnother: 'Upload another video',
        startAnalysis: 'Start Analysis',
        uploadError: 'Upload failed',
        tryAgain: 'Try again',
        errors: {
          invalidFormat: 'Unsupported file format',
          fileTooLarge: 'File size exceeds limit ({maxSize})',
          uploadFailed: 'Upload failed, please try again'
        }
      },
      editor: {
        selectTemplate: 'Select a template',
        preview: 'Preview',
        export: 'Export'
      },
      status: {
        title: 'Project Status',
        video: 'Video',
        template: 'Template',
        pip: 'Picture-in-Picture',
        loaded: 'Loaded',
        notLoaded: 'Not loaded',
        selected: 'Selected',
        notSelected: 'Not selected',
        enabled: 'Enabled',
        disabled: 'Disabled'
      },
      animations: {
        title: 'Animations',
        fade: 'Fade',
        slide: 'Slide',
        zoom: 'Zoom',
        clear: 'Clear'
      },
      ai: {
        title: 'AI Suggestions',
        suggestions: {
          pip: 'Recommend PIP template',
          chart: 'Data detected, chart template recommended',
          color: 'Suggest adjusting color contrast'
        }
      },
      templates: {
        pip: {
          name: 'Picture-in-Picture',
          desc: 'Video and PPT side by side'
        },
        infoCard: {
          name: 'Info Card',
          desc: 'Structured information display'
        },
        keyword: {
          name: 'Keyword Highlight',
          desc: 'Highlight important content'
        },
        document: {
          name: 'Document Display',
          desc: '3D document showcase'
        },
        title: {
          name: 'Title Slide',
          desc: 'Clean title display'
        }
      },
      timeline: {
        title: 'Timeline',
        markerCount: 'Markers',
        addMarker: 'Add Marker',
        removeMarker: 'Remove Marker',
        clearAll: 'Clear All',
        addNewMarker: 'Add New Marker',
        markerType: 'Marker Type',
        markerTime: 'Marker Time',
        cancel: 'Cancel',
        confirm: 'Confirm',
        markerAdded: 'Marker added',
        markerDeleted: 'Marker deleted',
        allMarkersCleared: 'All markers cleared',
        confirmDelete: 'Are you sure you want to delete this marker?',
        deleteTitle: 'Delete Marker',
        confirmClearAll: 'Are you sure you want to clear all markers?',
        clearTitle: 'Clear Markers',
        confirmNewProject: 'Creating a new project will clear current content. Continue?',
        types: {
          text: 'Text',
          image: 'Image',
          chart: 'Chart',
          transition: 'Transition'
        },
        errors: {
          invalidTime: 'Time out of range'
        }
      },
      export: {
        export: 'Export',
        title: 'Export Settings',
        format: 'Export Format',
        settings: 'Export Options',
        quality: 'Video Quality',
        quality720p: '720p SD',
        quality1080p: '1080p HD',
        quality4k: '4K Ultra HD',
        includeAudio: 'Include Audio',
        watermark: 'Watermark',
        watermarkNone: 'No Watermark',
        watermarkLight: 'Light Watermark',
        watermarkPremium: 'Premium Watermark',
        filename: 'Filename',
        filenamePlaceholder: 'Enter export filename',
        preview: 'Preview',
        duration: 'Duration',
        size: 'Estimated Size',
        cancel: 'Cancel',
        startExport: 'Start Export',
        exporting: 'Exporting...',
        remaining: 'Remaining',
        cannotExport: 'Cannot export now',
        selectFormat: 'Please select export format',
        exportSuccess: 'Export successful',
        exportFailed: 'Export failed',
        exportCancelled: 'Export cancelled',
        steps: {
          preparing: 'Preparing...',
          processing: 'Processing...',
          rendering: 'Rendering...',
          finalizing: 'Finalizing...'
        }
      },
      progress: {
        processedFrames: 'Processed frames',
        templatesMatched: 'Templates matched',
        materialsLoaded: 'Materials loaded',
        cancel: 'Cancel',
        showDetails: 'Show details',
        hideDetails: 'Hide details',
        minimize: 'Minimize',
        errorTitle: 'Processing error',
        retry: 'Retry',
        timeUnknown: 'Calculating...',
        stages: {
          analyze: 'Analyze',
          analyzeTitle: 'Analyzing video content',
          analyzeDesc: 'AI is identifying key information and scenes',
          template: 'Template',
          templateTitle: 'Matching templates',
          templateDesc: 'Intelligently selecting the best template',
          render: 'Render',
          renderTitle: 'Generating effects',
          renderDesc: 'Compositing final video effects'
        }
      },
      error: {
        title: 'An error occurred',
        showDetails: 'Show details',
        close: 'Close',
        retry: 'Retry',
        report: 'Report issue',
        history: 'Error history',
        stats: 'Error statistics',
        totalErrors: 'Total errors',
        criticalErrors: 'Critical errors',
        resolvedErrors: 'Resolved',
        recoveryRate: 'Recovery rate',
        reportSent: 'Error report sent',
        network: {
          title: 'Network Error',
          message: 'Network connection failed, please check your network settings'
        },
        upload: {
          title: 'Upload Error',
          message: 'File upload failed'
        },
        processing: {
          title: 'Processing Error',
          message: 'An error occurred during processing'
        },
        export: {
          title: 'Export Error',
          message: 'An error occurred during export'
        },
        validation: {
          title: 'Validation Error',
          message: 'Input validation failed'
        },
        permission: {
          title: 'Permission Error',
          message: 'You do not have permission to perform this action'
        },
        runtime: {
          title: 'Runtime Error',
          message: 'A runtime error occurred in the application'
        },
        promise: {
          title: 'Async Error',
          message: 'Async operation failed'
        },
        unknown: {
          title: 'Unknown Error'
        }
      }
    }
  }
}
