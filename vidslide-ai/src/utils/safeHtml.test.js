/**
 * safeHtml.test.js
 * VidSlide AI - 安全HTML工具测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { safeHtml, SafeHtmlDirective } from './safeHtml.js'

// Mock document for Node.js environment
const mockDocument = {
  createElement: vi.fn((tag) => {
    const element = {
      tagName: tag.toUpperCase(),
      innerHTML: '',
      textContent: '',
      children: [],
      attributes: [],
      removeChild: vi.fn(),
      removeAttribute: vi.fn(),
      setAttribute: vi.fn(),
      appendChild: vi.fn()
    }

    // Mock children array behavior
    Object.defineProperty(element, 'children', {
      get: () => element._children || [],
      set: (value) => element._children = value
    })

    // Mock attributes behavior
    element.attributes = []
    element.setAttribute = (name, value) => {
      element.attributes.push({ name, value })
    }

    return element
  })
}

global.document = mockDocument

describe('safeHtml', () => {
  let renderer

  beforeEach(() => {
    renderer = new safeHtml.constructor()
    vi.clearAllMocks()
  })

  describe('初始化', () => {
    it('应该正确初始化安全HTML渲染器', () => {
      expect(renderer).toBeDefined()
      expect(renderer.allowedTags).toBeDefined()
      expect(renderer.allowedAttributes).toBeDefined()
    })

    it('应该包含允许的HTML标签', () => {
      const expectedTags = ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'u', 'br', 'img', 'a']
      expect(renderer.allowedTags).toEqual(expectedTags)
    })

    it('应该包含允许的属性', () => {
      const expectedAttributes = ['class', 'id', 'style', 'src', 'alt', 'href', 'target']
      expect(renderer.allowedAttributes).toEqual(expectedAttributes)
    })
  })

  describe('HTML清理', () => {
    it('应该清理不安全的HTML标签', () => {
      const unsafeHtml = '<script>alert("xss")</script><div>Safe content</div><iframe src="evil.com"></iframe>'
      const result = renderer.sanitize(unsafeHtml)
      expect(result).not.toContain('<script>')
      expect(result).not.toContain('<iframe>')
      expect(result).toContain('<div>Safe content</div>')
    })

    it('应该保留安全的HTML标签', () => {
      const safeHtml = '<div class="test"><p>Hello <strong>world</strong></p></div>'
      const result = renderer.sanitize(safeHtml)
      expect(result).toBe(safeHtml)
    })

    it('应该清理不安全的属性', () => {
      const unsafeHtml = '<div onclick="evil()" onload="bad()" class="safe">Content</div>'
      const result = renderer.sanitize(unsafeHtml)
      expect(result).not.toContain('onclick')
      expect(result).not.toContain('onload')
      expect(result).toContain('class="safe"')
    })

    it('应该保留安全的属性', () => {
      const safeHtml = '<img src="test.jpg" alt="Test image" class="image">'
      const result = renderer.sanitize(safeHtml)
      expect(result).toBe(safeHtml)
    })

    it('应该处理嵌套的不安全标签', () => {
      const nestedUnsafe = '<div><script>evil()</script><p>Safe</p></div>'
      const result = renderer.sanitize(nestedUnsafe)
      expect(result).not.toContain('<script>')
      expect(result).toContain('<div><p>Safe</p></div>')
    })

    it('应该处理空输入', () => {
      expect(renderer.sanitize('')).toBe('')
      expect(renderer.sanitize(null)).toBe('')
      expect(renderer.sanitize(undefined)).toBe('')
    })
  })

  describe('文本转义', () => {
    it('应该转义HTML特殊字符', () => {
      const dangerousText = '<script>alert("xss")</script>& < > " \''
      const result = renderer.escape(dangerousText)
      expect(result).toContain('&lt;script&gt;')
      expect(result).toContain('&amp;')
      expect(result).toContain('&gt;')
      expect(result).toContain('&quot;')
    })

    it('应该处理普通文本', () => {
      const normalText = 'Hello world'
      const result = renderer.escape(normalText)
      expect(result).toBe(normalText)
    })

    it('应该处理空文本', () => {
      expect(renderer.escape('')).toBe('')
      expect(renderer.escape(null)).toBe('')
    })
  })

  describe('单例导出', () => {
    it('应该导出单例实例', () => {
      expect(safeHtml).toBeDefined()
      expect(safeHtml.constructor.name).toBe('SafeHtmlRenderer')
    })

    it('应该能够调用单例方法', () => {
      const result = safeHtml.sanitize('<div>Safe</div>')
      expect(result).toBe('<div>Safe</div>')
    })
  })

  describe('Vue指令', () => {
    it('应该定义Vue指令', () => {
      expect(SafeHtmlDirective).toBeDefined()
      expect(typeof SafeHtmlDirective.mounted).toBe('function')
      expect(typeof SafeHtmlDirective.updated).toBe('function')
    })

    it('应该在mounted时设置innerHTML', () => {
      const mockElement = { innerHTML: '' }
      const binding = { value: '<div>Safe content</div>' }

      SafeHtmlDirective.mounted(mockElement, binding)
      expect(mockElement.innerHTML).toBe('<div>Safe content</div>')
    })

    it('应该在updated时更新innerHTML', () => {
      const mockElement = { innerHTML: '' }
      const binding = { value: '<p>Updated content</p>' }

      SafeHtmlDirective.updated(mockElement, binding)
      expect(mockElement.innerHTML).toBe('<p>Updated content</p>')
    })

    it('应该清理不安全的HTML', () => {
      const mockElement = { innerHTML: '' }
      const binding = { value: '<script>evil()</script><div>Safe</div>' }

      SafeHtmlDirective.mounted(mockElement, binding)
      expect(mockElement.innerHTML).toContain('<div>Safe</div>')
      expect(mockElement.innerHTML).not.toContain('<script>')
    })
  })

  describe('复杂场景', () => {
    it('应该处理复杂的HTML结构', () => {
      const complexHtml = `
        <div class="container">
          <h1>Title</h1>
          <p>Paragraph with <strong>bold</strong> and <em>italic</em> text</p>
          <img src="image.jpg" alt="Image" onerror="evil()">
          <a href="http://example.com" onclick="bad()">Link</a>
          <script>dangerous()</script>
        </div>
      `

      const result = renderer.sanitize(complexHtml)

      expect(result).toContain('<div class="container">')
      expect(result).toContain('<h1>Title</h1>')
      expect(result).toContain('<strong>bold</strong>')
      expect(result).toContain('<em>italic</em>')
      expect(result).toContain('<img src="image.jpg" alt="Image">')
      expect(result).toContain('<a href="http://example.com">Link</a>')
      expect(result).not.toContain('onerror')
      expect(result).not.toContain('onclick')
      expect(result).not.toContain('<script>')
    })

    it('应该处理自闭合标签', () => {
      const selfClosingHtml = '<div><br><img src="test.jpg" alt="test"><input type="text" disabled></div>'
      const result = renderer.sanitize(selfClosingHtml)

      expect(result).toContain('<br>')
      expect(result).toContain('<img src="test.jpg" alt="test">')
      expect(result).not.toContain('disabled') // disabled不在允许属性中
    })
  })
})