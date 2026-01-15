/**
 * WebGLRenderer.test.js
 * WebGL渲染器单元测试
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import WebGLRenderer from './WebGLRenderer.js'

describe('WebGLRenderer', () => {
  let renderer
  let mockCanvas

  beforeEach(() => {
    mockCanvas = {
      width: 800,
      height: 600,
      getContext: vi.fn()
    }
    renderer = new WebGLRenderer(mockCanvas)
  })

  afterEach(() => {
    renderer.cleanup()
  })

  describe('初始化', () => {
    it('应该正确初始化渲染器', () => {
      expect(renderer.canvas).toBe(mockCanvas)
      expect(renderer.gl).toBeNull()
      expect(renderer.program).toBeNull()
      expect(renderer.isInitialized).toBe(false)
    })

    it('应该初始化WebGL上下文', async () => {
      const mockGL = {
        viewport: vi.fn(),
        enable: vi.fn(),
        blendFunc: vi.fn(),
        clearColor: vi.fn(),
        clear: vi.fn(),
        createProgram: vi.fn().mockReturnValue({}),
        attachShader: vi.fn(),
        linkProgram: vi.fn(),
        getProgramParameter: vi.fn().mockReturnValue(true),
        useProgram: vi.fn(),
        createBuffer: vi.fn().mockReturnValue({}),
        bindBuffer: vi.fn(),
        bufferData: vi.fn(),
        getAttribLocation: vi.fn().mockReturnValue(0),
        enableVertexAttribArray: vi.fn(),
        vertexAttribPointer: vi.fn(),
        getUniformLocation: vi.fn().mockReturnValue({}),
        uniformMatrix3fv: vi.fn(),
        uniform1f: vi.fn(),
        drawElements: vi.fn(),
        createTexture: vi.fn().mockReturnValue({}),
        bindTexture: vi.fn(),
        texParameteri: vi.fn(),
        texImage2D: vi.fn(),
        COLOR_BUFFER_BIT: 1,
        DEPTH_BUFFER_BIT: 2,
        BLEND: 3,
        SRC_ALPHA: 4,
        ONE_MINUS_SRC_ALPHA: 5,
        DEPTH_TEST: 6,
        LEQUAL: 7,
        VERTEX_SHADER: 8,
        FRAGMENT_SHADER: 9,
        ARRAY_BUFFER: 10,
        ELEMENT_ARRAY_BUFFER: 11,
        STATIC_DRAW: 12,
        FLOAT: 13,
        TRIANGLES: 14,
        UNSIGNED_SHORT: 15,
        TEXTURE_2D: 16,
        RGBA: 17,
        UNSIGNED_BYTE: 18,
        CLAMP_TO_EDGE: 19,
        LINEAR: 20
      }

      mockCanvas.getContext.mockReturnValue(mockGL)

      // Mock shader creation
      vi.spyOn(renderer, 'createShader').mockReturnValue({})
      vi.spyOn(renderer, 'createBuffers').mockImplementation(() => {})

      await renderer.initialize()

      expect(renderer.isInitialized).toBe(true)
      expect(renderer.gl).toBe(mockGL)
    })

    it('应该在WebGL不支持时抛出错误', async () => {
      mockCanvas.getContext.mockReturnValue(null)

      await expect(renderer.initialize()).rejects.toThrow('WebGL not supported')
    })
  })

  describe('着色器管理', () => {
    beforeEach(async () => {
      const mockGL = {
        createShader: vi.fn().mockReturnValue({}),
        shaderSource: vi.fn(),
        compileShader: vi.fn(),
        getShaderParameter: vi.fn().mockReturnValue(true),
        createProgram: vi.fn().mockReturnValue({}),
        attachShader: vi.fn(),
        linkProgram: vi.fn(),
        getProgramParameter: vi.fn().mockReturnValue(true),
        useProgram: vi.fn()
      }
      mockCanvas.getContext.mockReturnValue(mockGL)

      renderer.gl = mockGL
    })

    it('应该创建着色器', () => {
      const shader = renderer.createShader(1, 'test shader')

      expect(shader).toBeDefined()
    })

    it('应该在着色器编译失败时抛出错误', () => {
      renderer.gl.getShaderParameter.mockReturnValue(false)
      renderer.gl.getShaderInfoLog = vi.fn().mockReturnValue('Compile error')

      expect(() => {
        renderer.createShader(1, 'invalid shader')
      }).toThrow('着色器编译失败')
    })
  })

  describe('模板渲染', () => {
    beforeEach(async () => {
      // Setup mock WebGL context
      const mockGL = {
        viewport: vi.fn(),
        enable: vi.fn(),
        blendFunc: vi.fn(),
        clearColor: vi.fn(),
        clear: vi.fn(),
        createProgram: vi.fn().mockReturnValue({}),
        attachShader: vi.fn(),
        linkProgram: vi.fn(),
        getProgramParameter: vi.fn().mockReturnValue(true),
        useProgram: vi.fn(),
        createBuffer: vi.fn().mockReturnValue({}),
        bindBuffer: vi.fn(),
        bufferData: vi.fn(),
        getAttribLocation: vi.fn().mockReturnValue(0),
        enableVertexAttribArray: vi.fn(),
        vertexAttribPointer: vi.fn(),
        getUniformLocation: vi.fn().mockReturnValue({}),
        uniformMatrix3fv: vi.fn(),
        uniform1f: vi.fn(),
        drawElements: vi.fn(),
        COLOR_BUFFER_BIT: 1,
        DEPTH_BUFFER_BIT: 2
      }

      mockCanvas.getContext.mockReturnValue(mockGL)

      vi.spyOn(renderer, 'createShaders').mockResolvedValue()
      vi.spyOn(renderer, 'createBuffers').mockImplementation(() => {})

      await renderer.initialize()
    })

    it('应该渲染模板', async () => {
      const template = {
        id: 'test-template',
        layers: { fixed: [], dynamic: [], adjustable: [] }
      }
      const data = {}
      const options = { width: 800, height: 600 }

      vi.spyOn(renderer, 'renderTemplateLayers').mockResolvedValue()

      const result = await renderer.renderTemplate(template, data, options)

      expect(result).toHaveProperty('success', true)
      expect(result).toHaveProperty('renderer', 'webgl')
      expect(result).toHaveProperty('fps')
    })
  })

  describe('性能监控', () => {
    it('应该提供性能统计', () => {
      renderer.isInitialized = true
      renderer.fps = 60

      const stats = renderer.getPerformanceStats()

      expect(stats).toHaveProperty('fps', 60)
      expect(stats).toHaveProperty('isWebGL', true)
      expect(stats).toHaveProperty('renderer', 'WebGL')
    })
  })

  describe('截图功能', () => {
    it('应该生成截图', async () => {
      renderer.canvas.toBlob = vi.fn().mockImplementation(callback => {
        callback(new Blob(['screenshot'], { type: 'image/png' }))
      })

      const screenshot = await renderer.takeScreenshot()

      expect(typeof screenshot).toBe('string')
    })
  })

  describe('资源清理', () => {
    it('应该正确清理资源', () => {
      renderer.isInitialized = true
      renderer.program = {}
      renderer.textures.set('test', {})

      renderer.gl = {
        deleteProgram: vi.fn(),
        deleteBuffer: vi.fn(),
        deleteTexture: vi.fn()
      }

      renderer.cleanup()

      expect(renderer.isInitialized).toBe(false)
      expect(renderer.program).toBeNull()
      expect(renderer.textures.size).toBe(0)
    })
  })
})
