/**
 * Workspace Store - 工作区状态管理
 * 集中管理所有工作区相关的状态
 */
import { defineStore } from 'pinia'

export const useWorkspaceStore = defineStore('workspace', {
  state: () => ({
    // ========== 视频状态 ==========
    video: {
      src: '',
      file: null,
      duration: 0,
      currentTime: 0,
      isPlaying: false,
      width: 0,
      height: 0,
      element: null // 视频元素引用
    },

    // ========== 模板状态 ==========
    template: {
      selected: null,
      settings: {},
      contentType: 'general'
    },

    // ========== 素材状态 ==========
    materials: {
      requirements: [],
      selected: [],
      searchResults: [],
      searchResultSource: '',
      searchResultPlatforms: []
    },

    // ========== UI状态 ==========
    ui: {
      activeTab: 'analysis',
      isPanelCollapsed: false,
      showQualityControl: false,
      currentWorkflowStep: 'upload',
      activeSmartTool: 'crop'
    },

    // ========== 分析结果 ==========
    analysis: {
      keyframes: [],
      extractedKeyframes: [],
      keywords: [],
      transcript: '',
      transcriptText: '',
      scenes: [],
      segments: [],
      isAnalyzing: false,
      analysisProgress: 0
    },

    // ========== 画中画状态 ==========
    pip: {
      enabled: false,
      settings: {
        position: 'top-right',
        size: 25,
        style: 'circle',
        animation: 'fade-in',
        trackingMode: 'auto'
      }
    },

    // ========== 动画状态 ==========
    animations: {
      list: [],
      enabled: true
    },

    // ========== 进度状态 ==========
    progress: {
      visible: false,
      currentStage: 'analyze',
      value: 0,
      estimatedTime: 0,
      canCancel: true
    },

    // ========== 导出状态 ==========
    export: {
      isExporting: false,
      format: 'ppt',
      quality: 'high'
    },

    // ========== 项目状态 ==========
    project: {
      data: null,
      isDirty: false,
      lastSaved: null
    },

    // ========== 对话框状态 ==========
    dialogs: {
      showAuthDialog: false,
      showMaterialDialog: false,
      pendingSearchKeywords: []
    },

    // ========== 预览质量控制 ==========
    preview: {
      resolution: '1080p',
      quality: 80,
      optimizations: {
        hardwareAcceleration: true,
        multiThreading: true,
        memoryOptimization: true
      }
    }
  }),

  getters: {
    // 视频相关
    isVerticalVideo: (state) => state.video.height > state.video.width,
    hasVideo: (state) => !!state.video.src,
    videoAspectRatio: (state) => {
      if (!state.video.width || !state.video.height) return 16 / 9
      return state.video.width / state.video.height
    },

    // 导出相关
    canExport: (state) => {
      return !!state.video.src && !!state.template.selected
    },

    // 分析相关
    hasAnalysisResults: (state) => {
      return state.analysis.keywords.length > 0 ||
             state.analysis.keyframes.length > 0
    },

    // 素材相关
    hasMaterialRequirements: (state) => {
      return state.materials.requirements.length > 0
    },

    // 项目相关
    projectTitle: (state) => {
      return state.project.data?.title || '未命名项目'
    }
  },

  actions: {
    // ========== 视频操作 ==========
    setVideo(videoData) {
      this.video = { ...this.video, ...videoData }
      this.project.isDirty = true
    },

    updateVideoTime(time) {
      this.video.currentTime = time
    },

    toggleVideoPlayback() {
      this.video.isPlaying = !this.video.isPlaying
    },

    clearVideo() {
      this.video = {
        src: '',
        file: null,
        duration: 0,
        currentTime: 0,
        isPlaying: false,
        width: 0,
        height: 0,
        element: null
      }
      this.ui.currentWorkflowStep = 'upload'
    },

    // ========== 模板操作 ==========
    setTemplate(template) {
      this.template.selected = template
      this.project.isDirty = true
    },

    updateTemplateSettings(settings) {
      this.template.settings = { ...this.template.settings, ...settings }
      this.project.isDirty = true
    },

    // ========== 分析结果操作 ==========
    setAnalysisResults(results) {
      this.analysis = { ...this.analysis, ...results }
      this.project.isDirty = true
    },

    updateKeywords(keywords) {
      this.analysis.keywords = keywords
      this.project.isDirty = true
    },

    updateTranscript(transcript) {
      this.analysis.transcript = transcript
      this.analysis.transcriptText = transcript
      this.project.isDirty = true
    },

    setKeyframes(keyframes) {
      this.analysis.keyframes = keyframes
      this.project.isDirty = true
    },

    setExtractedKeyframes(keyframes) {
      this.analysis.extractedKeyframes = keyframes
      this.project.isDirty = true
    },

    // ========== 素材操作 ==========
    setMaterialRequirements(requirements) {
      this.materials.requirements = requirements
    },

    setMaterialSearchResults(results, source, platforms) {
      this.materials.searchResults = results
      this.materials.searchResultSource = source
      this.materials.searchResultPlatforms = platforms
    },

    clearMaterialSearchResults() {
      this.materials.searchResults = []
      this.materials.searchResultSource = ''
      this.materials.searchResultPlatforms = []
    },

    // ========== UI操作 ==========
    setActiveTab(tab) {
      this.ui.activeTab = tab
    },

    togglePanelCollapse() {
      this.ui.isPanelCollapsed = !this.ui.isPanelCollapsed
    },

    setWorkflowStep(step) {
      this.ui.currentWorkflowStep = step
    },

    setActiveSmartTool(tool) {
      this.ui.activeSmartTool = tool
    },

    // ========== 画中画操作 ==========
    togglePip() {
      this.pip.enabled = !this.pip.enabled
      this.project.isDirty = true
    },

    updatePipSettings(settings) {
      this.pip.settings = { ...this.pip.settings, ...settings }
      this.project.isDirty = true
    },

    // ========== 动画操作 ==========
    addAnimation(animation) {
      this.animations.list.push(animation)
      this.project.isDirty = true
    },

    removeAnimation(animationId) {
      const index = this.animations.list.findIndex(a => a.id === animationId)
      if (index > -1) {
        this.animations.list.splice(index, 1)
        this.project.isDirty = true
      }
    },

    clearAnimations() {
      this.animations.list = []
      this.project.isDirty = true
    },

    // ========== 进度操作 ==========
    showProgress(stage = 'analyze') {
      this.progress.visible = true
      this.progress.currentStage = stage
      this.progress.value = 0
    },

    updateProgress(value, estimatedTime = 0) {
      this.progress.value = value
      this.progress.estimatedTime = estimatedTime
    },

    hideProgress() {
      this.progress.visible = false
      this.progress.value = 0
    },

    // ========== 对话框操作 ==========
    showAuthorizationDialog(keywords) {
      this.dialogs.showAuthDialog = true
      this.dialogs.pendingSearchKeywords = keywords
    },

    hideAuthorizationDialog() {
      this.dialogs.showAuthDialog = false
      this.dialogs.pendingSearchKeywords = []
    },

    showMaterialSelectionDialog() {
      this.dialogs.showMaterialDialog = true
    },

    hideMaterialSelectionDialog() {
      this.dialogs.showMaterialDialog = false
    },

    // ========== 项目操作 ==========
    setProjectData(data) {
      this.project.data = data
      this.project.isDirty = false
      this.project.lastSaved = new Date()
    },

    markProjectClean() {
      this.project.isDirty = false
      this.project.lastSaved = new Date()
    },

    // ========== 重置操作 ==========
    resetWorkspace() {
      // 重置所有状态到初始值
      this.$reset()
    },

    // ========== 导出当前状态（用于保存项目）==========
    exportState() {
      return {
        video: { ...this.video, element: null }, // 不保存DOM引用
        template: this.template,
        analysis: this.analysis,
        pip: this.pip,
        animations: this.animations,
        preview: this.preview
      }
    },

    // ========== 导入状态（用于加载项目）==========
    importState(state) {
      if (state.video) this.video = { ...this.video, ...state.video }
      if (state.template) this.template = state.template
      if (state.analysis) this.analysis = state.analysis
      if (state.pip) this.pip = state.pip
      if (state.animations) this.animations = state.animations
      if (state.preview) this.preview = state.preview

      this.project.isDirty = false
    }
  }
})
