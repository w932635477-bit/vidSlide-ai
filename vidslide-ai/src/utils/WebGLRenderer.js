/**
 * WebGLRenderer - WebGL模板渲染引擎
 *
 * 替代DOM渲染，提供高性能的WebGL渲染，支持复杂动画和视觉效果
 */

class WebGLRenderer {
  constructor(canvas) {
    this.canvas = canvas
    this.gl = null
    this.program = null
    this.buffers = {}
    this.textures = new Map()
    this.animations = new Map()
    this.isInitialized = false

    // 渲染配置
    this.config = {
      antialias: true,
      alpha: true,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false
    }
  }

  /**
   * 初始化WebGL上下文
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.isInitialized) return

    try {
      // 获取WebGL上下文
      this.gl = this.canvas.getContext('webgl', this.config) ||
                this.canvas.getContext('experimental-webgl', this.config)

      if (!this.gl) {
        throw new Error('WebGL not supported')
      }

      // 初始化WebGL设置
      this.setupWebGL()

      // 创建着色器程序
      await this.createShaders()

      // 初始化缓冲区
      this.createBuffers()

      // 设置渲染循环
      this.setupRenderLoop()

      this.isInitialized = true
      console.log('WebGL渲染引擎初始化完成')

    } catch (error) {
      console.error('WebGL初始化失败:', error)
      throw new Error(`WebGL渲染引擎初始化失败: ${error.message}`)
    }
  }

  /**
   * 设置WebGL基础配置
   */
  setupWebGL() {
    const gl = this.gl

    // 设置视口
    gl.viewport(0, 0, this.canvas.width, this.canvas.height)

    // 启用混合
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    // 启用深度测试（用于层级渲染）
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)

    // 设置清除颜色
    gl.clearColor(0.0, 0.0, 0.0, 0.0)

    // 清除缓冲区
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  }

  /**
   * 创建着色器程序
   * @returns {Promise<void>}
   */
  async createShaders() {
    const gl = this.gl

    // 顶点着色器源码
    const vertexShaderSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      attribute vec4 a_color;
      attribute float a_zIndex;

      uniform mat3 u_matrix;
      uniform float u_time;

      varying vec2 v_texCoord;
      varying vec4 v_color;
      varying float v_zIndex;

      void main() {
        vec3 pos = u_matrix * vec3(a_position, 1.0);
        gl_Position = vec4(pos.xy, a_zIndex * 0.001, 1.0);

        v_texCoord = a_texCoord;
        v_color = a_color;
        v_zIndex = a_zIndex;
      }
    `

    // 片段着色器源码
    const fragmentShaderSource = `
      precision mediump float;

      uniform sampler2D u_texture;
      uniform bool u_useTexture;
      uniform vec4 u_tintColor;
      uniform float u_opacity;
      uniform float u_time;

      varying vec2 v_texCoord;
      varying vec4 v_color;
      varying float v_zIndex;

      void main() {
        vec4 color;

        if (u_useTexture) {
          color = texture2D(u_texture, v_texCoord) * u_tintColor;
        } else {
          color = v_color * u_tintColor;
        }

        color.a *= u_opacity;

        // 简单动画效果
        float alpha = color.a;
        if (u_time > 0.0) {
          // 添加轻微的脉动效果
          alpha *= (1.0 + sin(u_time * 3.0) * 0.05);
        }

        gl_FragColor = vec4(color.rgb, alpha);
      }
    `

    // 创建着色器
    const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentShaderSource)

    // 创建程序
    this.program = gl.createProgram()
    gl.attachShader(this.program, vertexShader)
    gl.attachShader(this.program, fragmentShader)
    gl.linkProgram(this.program)

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      throw new Error('着色器程序链接失败: ' + gl.getProgramInfoLog(this.program))
    }

    gl.useProgram(this.program)
  }

  /**
   * 创建着色器
   * @param {number} type - 着色器类型
   * @param {string} source - 着色器源码
   * @returns {WebGLShader} 着色器对象
   */
  createShader(type, source) {
    const gl = this.gl
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const error = gl.getShaderInfoLog(shader)
      gl.deleteShader(shader)
      throw new Error(`着色器编译失败 (${type}): ${error}`)
    }

    return shader
  }

  /**
   * 创建缓冲区
   */
  createBuffers() {
    const gl = this.gl

    // 顶点缓冲区
    this.buffers.vertexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.vertexBuffer)

    // 纹理坐标缓冲区
    this.buffers.texCoordBuffer = gl.createBuffer()

    // 颜色缓冲区
    this.buffers.colorBuffer = gl.createBuffer()

    // 索引缓冲区（用于矩形渲染）
    this.buffers.indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([
      0, 1, 2, 0, 2, 3
    ]), gl.STATIC_DRAW)
  }

  /**
   * 设置渲染循环
   */
  setupRenderLoop() {
    this.animationFrameId = null
    this.isRendering = false
    this.lastFrameTime = 0
    this.frameCount = 0
    this.fps = 0
  }

  /**
   * 开始渲染循环
   */
  startRenderLoop() {
    if (this.isRendering) return

    this.isRendering = true
    this.lastFrameTime = performance.now()
    this.render()
  }

  /**
   * 停止渲染循环
   */
  stopRenderLoop() {
    this.isRendering = false
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  /**
   * 渲染循环
   */
  render = () => {
    if (!this.isRendering) return

    const currentTime = performance.now()
    const deltaTime = currentTime - this.lastFrameTime

    // 更新FPS
    this.frameCount++
    if (deltaTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / deltaTime)
      this.frameCount = 0
      this.lastFrameTime = currentTime
    }

    // 清除画布
    const gl = this.gl
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    // 更新动画
    this.updateAnimations(deltaTime)

    // 渲染所有元素
    this.renderElements()

    // 继续循环
    this.animationFrameId = requestAnimationFrame(this.render)
  }

  /**
   * 更新动画
   * @param {number} deltaTime - 时间增量
   */
  updateAnimations(deltaTime) {
    for (const [id, animation] of this.animations) {
      animation.update(deltaTime)
      if (animation.isComplete()) {
        this.animations.delete(id)
      }
    }
  }

  /**
   * 渲染所有元素
   */
  renderElements() {
    // 这里实现具体的元素渲染逻辑
    // 暂时使用简化的实现
    this.renderBackground()
  }

  /**
   * 渲染背景
   */
  renderBackground() {
    const gl = this.gl

    // 设置顶点数据（全屏矩形）
    const vertices = new Float32Array([
      -1.0, -1.0,  // 左下
       1.0, -1.0,  // 右下
       1.0,  1.0,  // 右上
      -1.0,  1.0   // 左上
    ])

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

    const positionLocation = gl.getAttribLocation(this.program, 'a_position')
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    // 设置统一的背景颜色
    const matrixLocation = gl.getUniformLocation(this.program, 'u_matrix')
    const matrix = new Float32Array([
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    ])
    gl.uniformMatrix3fv(matrixLocation, false, matrix)

    const timeLocation = gl.getUniformLocation(this.program, 'u_time')
    gl.uniform1f(timeLocation, performance.now() * 0.001)

    // 绘制
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
  }

  /**
   * 渲染模板元素
   * @param {Object} template - 模板定义
   * @param {Object} data - 渲染数据
   * @param {Object} options - 渲染选项
   */
  async renderTemplate(template, data, options = {}) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    console.log('使用WebGL渲染模板:', template.id)

    try {
      // 预处理模板数据
      const processedData = this.preprocessTemplateData(template, data)

      // 加载所需的纹理
      await this.loadTemplateTextures(template)

      // 设置渲染参数
      this.setupRenderParameters(options)

      // 开始渲染循环
      this.startRenderLoop()

      return {
        success: true,
        renderer: 'webgl',
        fps: () => this.fps,
        stop: () => this.stopRenderLoop()
      }

    } catch (error) {
      console.error('WebGL模板渲染失败:', error)
      throw new Error(`WebGL渲染失败: ${error.message}`)
    }
  }

  /**
   * 预处理模板数据
   * @param {Object} template - 模板定义
   * @param {Object} data - 数据
   * @returns {Object} 处理后的数据
   */
  preprocessTemplateData(template, data) {
    // 转换数据格式以适应WebGL渲染
    const processed = {
      layers: [],
      animations: [],
      textures: []
    }

    // 处理层级数据
    for (const layerType of Object.keys(template.layers)) {
      for (const layer of template.layers[layerType]) {
        processed.layers.push({
          ...layer,
          webglData: this.convertToWebGLFormat(layer)
        })
      }
    }

    return processed
  }

  /**
   * 转换数据为WebGL格式
   * @param {Object} layer - 层定义
   * @returns {Object} WebGL格式数据
   */
  convertToWebGLFormat(layer) {
    return {
      vertices: this.generateVertices(layer),
      texCoords: this.generateTexCoords(layer),
      colors: this.generateColors(layer),
      zIndex: layer.zIndex || 0,
      transform: this.generateTransform(layer.properties)
    }
  }

  /**
   * 生成顶点数据
   * @param {Object} layer - 层定义
   * @returns {Float32Array} 顶点数组
   */
  generateVertices(layer) {
    const props = layer.properties
    let x = 0, y = 0, width = 100, height = 100

    // 根据位置和大小计算顶点
    if (props.position) {
      if (props.position === 'fullscreen') {
        x = 0
        y = 0
        width = this.canvas.width
        height = this.canvas.height
      } else if (props.position === 'center') {
        x = (this.canvas.width - (props.size?.width || 100)) / 2
        y = (this.canvas.height - (props.size?.height || 100)) / 2
        width = props.size?.width || 100
        height = props.size?.height || 100
      }
    }

    // 转换为WebGL坐标系 (-1 到 1)
    const glX = (x / this.canvas.width) * 2 - 1
    const glY = (y / this.canvas.height) * 2 - 1
    const glWidth = (width / this.canvas.width) * 2
    const glHeight = (height / this.canvas.height) * 2

    return new Float32Array([
      glX, glY,                    // 左下
      glX + glWidth, glY,          // 右下
      glX + glWidth, glY + glHeight, // 右上
      glX, glY + glHeight          // 左上
    ])
  }

  /**
   * 生成纹理坐标
   * @param {Object} layer - 层定义
   * @returns {Float32Array} 纹理坐标数组
   */
  generateTexCoords(layer) {
    // 标准矩形纹理坐标
    return new Float32Array([
      0.0, 1.0,  // 左下
      1.0, 1.0,  // 右下
      1.0, 0.0,  // 右上
      0.0, 0.0   // 左上
    ])
  }

  /**
   * 生成颜色数据
   * @param {Object} layer - 层定义
   * @returns {Float32Array} 颜色数组
   */
  generateColors(layer) {
    const color = layer.properties.backgroundColor || '#FFFFFF'
    const rgba = this.hexToRGBA(color)

    // 为四个顶点重复颜色
    return new Float32Array([
      rgba.r, rgba.g, rgba.b, rgba.a,
      rgba.r, rgba.g, rgba.b, rgba.a,
      rgba.r, rgba.g, rgba.b, rgba.a,
      rgba.r, rgba.g, rgba.b, rgba.a
    ])
  }

  /**
   * 生成变换矩阵
   * @param {Object} properties - 属性
   * @returns {Float32Array} 变换矩阵
   */
  generateTransform(properties) {
    // 简化的3x3变换矩阵
    const matrix = new Float32Array([
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    ])

    // 应用旋转
    if (properties.rotation) {
      const rad = (properties.rotation * Math.PI) / 180
      const cos = Math.cos(rad)
      const sin = Math.sin(rad)

      matrix[0] = cos
      matrix[1] = -sin
      matrix[3] = sin
      matrix[4] = cos
    }

    // 应用缩放
    if (properties.scale) {
      matrix[0] *= properties.scale.x || properties.scale
      matrix[4] *= properties.scale.y || properties.scale
    }

    return matrix
  }

  /**
   * 加载模板纹理
   * @param {Object} template - 模板定义
   * @returns {Promise<void>}
   */
  async loadTemplateTextures(template) {
    const texturePromises = []

    // 遍历所有层级查找纹理
    for (const layerType of Object.keys(template.layers)) {
      for (const layer of template.layers[layerType]) {
        if (layer.properties.image || layer.properties.backgroundImage) {
          const imageUrl = layer.properties.image || layer.properties.backgroundImage
          texturePromises.push(this.loadTexture(imageUrl, layer.id))
        }
      }
    }

    await Promise.all(texturePromises)
  }

  /**
   * 加载纹理
   * @param {string} url - 图片URL
   * @param {string} textureId - 纹理ID
   * @returns {Promise<void>}
   */
  async loadTexture(url, textureId) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const texture = this.createGLTexture(img)
        this.textures.set(textureId, texture)
        resolve()
      }
      img.onerror = reject
      img.src = url
    })
  }

  /**
   * 创建WebGL纹理
   * @param {HTMLImageElement} image - 图片元素
   * @returns {WebGLTexture} 纹理对象
   */
  createGLTexture(image) {
    const gl = this.gl
    const texture = gl.createTexture()

    gl.bindTexture(gl.TEXTURE_2D, texture)

    // 设置纹理参数
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

    // 上传纹理数据
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)

    return texture
  }

  /**
   * 设置渲染参数
   * @param {Object} options - 渲染选项
   */
  setupRenderParameters(options) {
    const gl = this.gl

    // 设置视口
    const width = options.width || this.canvas.width
    const height = options.height || this.canvas.height
    gl.viewport(0, 0, width, height)

    // 设置背景色
    const bgColor = options.backgroundColor || [0, 0, 0, 0]
    gl.clearColor(bgColor[0], bgColor[1], bgColor[2], bgColor[3])
  }

  /**
   * 添加动画
   * @param {string} id - 动画ID
   * @param {Object} animation - 动画定义
   */
  addAnimation(id, animation) {
    this.animations.set(id, {
      ...animation,
      startTime: performance.now(),
      update: (deltaTime) => {
        // 动画更新逻辑
      },
      isComplete: () => {
        // 检查动画是否完成
        return false // 暂时返回false
      }
    })
  }

  /**
   * 移除动画
   * @param {string} id - 动画ID
   */
  removeAnimation(id) {
    this.animations.delete(id)
  }

  /**
   * 十六进制颜色转RGBA
   * @param {string} hex - 十六进制颜色
   * @returns {Object} RGBA对象
   */
  hexToRGBA(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255,
      a: result[4] ? parseInt(result[4], 16) / 255 : 1
    } : { r: 1, g: 1, b: 1, a: 1 }
  }

  /**
   * 获取性能统计
   * @returns {Object} 性能数据
   */
  getPerformanceStats() {
    return {
      fps: this.fps,
      isWebGL: true,
      renderer: 'WebGL',
      maxTextureSize: this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE),
      supportedExtensions: this.gl.getSupportedExtensions()
    }
  }

  /**
   * 截图
   * @param {Object} options - 截图选项
   * @returns {Promise<string>} Base64图片数据
   */
  async takeScreenshot(options = {}) {
    const { format = 'png', quality = 0.9 } = options

    return new Promise(resolve => {
      this.canvas.toBlob(blob => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.readAsDataURL(blob)
      }, `image/${format}`, quality)
    })
  }

  /**
   * 清理资源
   */
  cleanup() {
    this.stopRenderLoop()

    const gl = this.gl
    if (gl) {
      // 删除程序
      if (this.program) {
        gl.deleteProgram(this.program)
      }

      // 删除缓冲区
      Object.values(this.buffers).forEach(buffer => {
        if (buffer) gl.deleteBuffer(buffer)
      })

      // 删除纹理
      for (const texture of this.textures.values()) {
        gl.deleteTexture(texture)
      }
    }

    this.textures.clear()
    this.animations.clear()
    this.isInitialized = false

    console.log('WebGL渲染引擎已清理')
  }
}

export default WebGLRenderer