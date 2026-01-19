/**
 * 智能素材裁剪服务
 * 支持多种裁剪策略
 */
class SmartImageCropper {
  /**
   * 智能裁剪图片为竖版
   */
  async cropForVertical(material, options = {}) {
    const { targetWidth = 1080, targetHeight = 1920 } = options

    // 策略1: URL参数裁剪 (Pexels/Unsplash)
    const urlCropped = this.tryUrlCrop(material, targetWidth, targetHeight)
    if (urlCropped) {
      console.log('✅ 使用URL参数裁剪')
      return urlCropped
    }

    // 策略2: 服务器端裁剪 (百度图片)
    try {
      const serverCropped = await this.serverCrop(material, targetWidth, targetHeight)
      console.log('✅ 使用服务器端裁剪')
      return serverCropped
    } catch (error) {
      console.warn('⚠️ 服务器端裁剪失败，使用原图:', error.message)
      return material.url
    }
  }

  /**
   * URL参数裁剪 (Pexels/Unsplash)
   */
  tryUrlCrop(material, width, height) {
    const url = material.url

    if (url.includes('pexels.com')) {
      return `${url}?auto=compress&cs=tinysrgb&w=${width}&h=${height}&fit=crop`
    }

    if (url.includes('unsplash.com')) {
      return `${url}?w=${width}&h=${height}&fit=crop&crop=center`
    }

    return null
  }

  /**
   * 服务器端裁剪 (百度图片等)
   */
  async serverCrop(material, width, height) {
    const response = await fetch('http://localhost:3002/api/crop-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageUrl: material.url,
        width,
        height,
        fit: 'cover',
        position: 'center'
      })
    })

    if (!response.ok) {
      throw new Error('服务器裁剪失败')
    }

    const result = await response.json()
    return result.croppedUrl
  }
}

export default new SmartImageCropper()
