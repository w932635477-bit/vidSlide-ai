/**
 * setup.js
 * VidSlide AI - 测试环境设置
 * 提供完整的浏览器API模拟
 */

// 浏览器存储API模拟
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn((key) => {
      if (key === 'vidslide_dispatcher_strategy') return 'balanced'
      return null
    }),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    key: vi.fn(),
    length: 0
  },
  writable: true
})

Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    key: vi.fn(),
    length: 0
  },
  writable: true
})

// IndexedDB模拟
const indexedDBMock = {
  open: vi.fn(() => ({
    onsuccess: null,
    onerror: null,
    onupgradeneeded: null,
    result: {
      createObjectStore: vi.fn(() => ({
        createIndex: vi.fn(),
        put: vi.fn(),
        get: vi.fn(),
        delete: vi.fn(),
        clear: vi.fn(),
        openCursor: vi.fn(() => ({
          onsuccess: null,
          onerror: null,
          result: null
        }))
      })),
      transaction: vi.fn(() => ({
        objectStore: vi.fn(() => ({
          put: vi.fn(),
          get: vi.fn(),
          delete: vi.fn(),
          clear: vi.fn(),
          openCursor: vi.fn(() => ({
            onsuccess: null,
            onerror: null,
            result: null
          }))
        }))
      }))
    }
  }))
}

Object.defineProperty(window, 'indexedDB', {
  value: indexedDBMock,
  writable: true
})

// IDBDatabase构造函数模拟
global.IDBDatabase = vi.fn()
global.IDBObjectStore = vi.fn()
global.IDBTransaction = vi.fn()
global.IDBRequest = vi.fn()

// ImageData构造函数模拟
global.ImageData = vi.fn((width, height) => ({
  width,
  height,
  data: new Uint8ClampedArray(width * height * 4)
}))

// Canvas API模拟
global.HTMLCanvasElement = vi.fn()
global.CanvasRenderingContext2D = vi.fn(() => ({
  drawImage: vi.fn(),
  getImageData: vi.fn(() => new ImageData(100, 100)),
  putImageData: vi.fn(),
  createImageData: vi.fn(() => new ImageData(100, 100)),
  setTransform: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  fillText: vi.fn(),
  strokeText: vi.fn(),
  measureText: vi.fn(() => ({ width: 50 })),
  beginPath: vi.fn(),
  closePath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  clip: vi.fn(),
  isPointInPath: vi.fn(() => false),
  isPointInStroke: vi.fn(() => false)
}))

// WebGL上下文模拟
global.WebGLRenderingContext = vi.fn()
global.WebGL2RenderingContext = vi.fn()

// 媒体API模拟
global.MediaRecorder = vi.fn(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  ondataavailable: null,
  onstop: null,
  state: 'inactive'
}))

global.MediaStream = vi.fn()
global.MediaStreamTrack = vi.fn()

// 性能API模拟
global.performance = {
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByName: vi.fn(() => []),
  getEntriesByType: vi.fn(() => []),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn()
}

// URL构造函数模拟
global.URL = class URL {
  constructor(url) {
    this.href = url
    this.origin = 'http://localhost:3000'
    this.pathname = '/'
    this.search = ''
    this.hash = ''
  }

  static createObjectURL = vi.fn(() => 'blob:mock-url')
  static revokeObjectURL = vi.fn()
}

global.Blob = vi.fn((content, options) => ({
  size: content ? content.length : 0,
  type: options?.type || '',
  arrayBuffer: vi.fn(() => Promise.resolve(new ArrayBuffer(0))),
  text: vi.fn(() => Promise.resolve('')),
  slice: vi.fn(() => new Blob())
}))

// File API模拟
global.File = vi.fn((bits, filename, options) => ({
  name: filename,
  size: bits ? bits.length : 0,
  type: options?.type || '',
  lastModified: options?.lastModified || Date.now(),
  arrayBuffer: vi.fn(() => Promise.resolve(new ArrayBuffer(0))),
  text: vi.fn(() => Promise.resolve('')),
  slice: vi.fn(() => new Blob())
}))

global.FileReader = vi.fn(() => ({
  readAsArrayBuffer: vi.fn(),
  readAsText: vi.fn(),
  readAsDataURL: vi.fn(),
  onload: null,
  onerror: null,
  onprogress: null,
  result: null
}))

// 加密API模拟
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      digest: vi.fn(() => Promise.resolve(new ArrayBuffer(32))),
      encrypt: vi.fn(() => Promise.resolve(new ArrayBuffer(0))),
      decrypt: vi.fn(() => Promise.resolve(new ArrayBuffer(0)))
    },
    getRandomValues: vi.fn((array) => array)
  },
  writable: true,
  configurable: true
})

// btoa/atob函数模拟
global.btoa = vi.fn((str) => Buffer.from(str, 'binary').toString('base64'))
global.atob = vi.fn((str) => Buffer.from(str, 'base64').toString('binary'))

// 其他浏览器API
global.matchMedia = vi.fn(() => ({
  matches: false,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn()
}))

global.requestAnimationFrame = vi.fn((callback) => setTimeout(callback, 16))
global.cancelAnimationFrame = vi.fn((id) => clearTimeout(id))

// Intersection Observer模拟
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Resize Observer模拟
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// 控制台方法模拟（避免测试中的console调用出错）
global.console = {
  ...console,
  // 可以在这里添加特定的console方法模拟
}

// 清理函数
afterEach(() => {
  vi.clearAllMocks()
})

afterAll(() => {
  vi.restoreAllMocks()
})
