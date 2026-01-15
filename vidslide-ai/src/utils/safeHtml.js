/**
 * 安全的HTML渲染工具
 * 防止XSS攻击
 */

class SafeHtmlRenderer {
  constructor() {
    this.allowedTags = [
      'div',
      'span',
      'p',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'strong',
      'em',
      'u',
      'br',
      'img',
      'a'
    ]
    this.allowedAttributes = ['class', 'id', 'style', 'src', 'alt', 'href', 'target']
  }

  /**
   * 安全的HTML渲染
   * @param {string} html - 要渲染的HTML字符串
   * @returns {string} - 清理后的安全HTML
   */
  sanitize(html) {
    if (!html) return ''

    // 创建DOM元素进行清理
    const div = document.createElement('div')
    div.innerHTML = html

    // 递归清理所有元素
    this.cleanElement(div)

    return div.innerHTML
  }

  /**
   * 递归清理DOM元素
   * @param {Element} element - 要清理的元素
   */
  cleanElement(element) {
    const children = Array.from(element.children)

    for (const child of children) {
      // 检查标签是否允许
      if (!this.allowedTags.includes(child.tagName.toLowerCase())) {
        // 移除不允许的标签
        element.removeChild(child)
        continue
      }

      // 清理属性
      const attributes = Array.from(child.attributes)
      for (const attr of attributes) {
        if (!this.allowedAttributes.includes(attr.name.toLowerCase())) {
          child.removeAttribute(attr.name)
        }
      }

      // 递归处理子元素
      this.cleanElement(child)
    }
  }

  /**
   * 转义HTML特殊字符
   * @param {string} text - 要转义的文本
   * @returns {string} - 转义后的文本
   */
  escape(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }
}

// 导出单例实例
export const safeHtml = new SafeHtmlRenderer()

// Vue指令版本
export const SafeHtmlDirective = {
  mounted(el, binding) {
    el.innerHTML = safeHtml.sanitize(binding.value)
  },
  updated(el, binding) {
    el.innerHTML = safeHtml.sanitize(binding.value)
  }
}

export default SafeHtmlRenderer
