// 触觉反馈工具模块

class HapticFeedback {
  constructor() {
    this.isSupported = false
    this.isEnabled = true
    this.platform = null
    this.initialize()
  }

  // 初始化触觉反馈
  initialize() {
    try {
      // 检测平台
      // #ifdef APP-PLUS
      this.platform = 'app-plus'
      this.isSupported = true
      // #endif

      // #ifdef MP-WEIXIN
      this.platform = 'mp-weixin'
      this.isSupported = true
      // #endif

      // #ifdef H5
      this.platform = 'h5'
      // H5平台检查Vibration API支持
      this.isSupported = 'vibrate' in navigator
      // #endif

      console.log(`触觉反馈初始化完成 - 平台: ${this.platform}, 支持: ${this.isSupported}`)
    } catch (error) {
      console.error('触觉反馈初始化失败:', error)
      this.isSupported = false
    }
  }

  // 检查是否支持触觉反馈
  checkSupport() {
    return this.isSupported && this.isEnabled
  }

  // 启用/禁用触觉反馈
  setEnabled(enabled) {
    this.isEnabled = enabled
    console.log(`触觉反馈已${enabled ? '启用' : '禁用'}`)
  }

  // 轻微震动 - 用于触摸开始
  light() {
    if (!this.checkSupport()) return false

    try {
      switch (this.platform) {
        case 'app-plus':
          // #ifdef APP-PLUS
          plus.device.vibrate(10)
          // #endif
          break

        case 'mp-weixin':
          // #ifdef MP-WEIXIN
          wx.vibrateShort({
            type: 'light'
          })
          // #endif
          break

        case 'h5':
          // #ifdef H5
          if (navigator.vibrate) {
            navigator.vibrate(10)
          }
          // #endif
          break
      }
      return true
    } catch (error) {
      console.error('轻微震动失败:', error)
      return false
    }
  }

  // 中等震动 - 用于达到阈值
  medium() {
    if (!this.checkSupport()) return false

    try {
      switch (this.platform) {
        case 'app-plus':
          // #ifdef APP-PLUS
          plus.device.vibrate(30)
          // #endif
          break

        case 'mp-weixin':
          // #ifdef MP-WEIXIN
          wx.vibrateShort({
            type: 'medium'
          })
          // #endif
          break

        case 'h5':
          // #ifdef H5
          if (navigator.vibrate) {
            navigator.vibrate(30)
          }
          // #endif
          break
      }
      return true
    } catch (error) {
      console.error('中等震动失败:', error)
      return false
    }
  }

  // 重度震动 - 用于完成操作
  heavy() {
    if (!this.checkSupport()) return false

    try {
      switch (this.platform) {
        case 'app-plus':
          // #ifdef APP-PLUS
          plus.device.vibrate(50)
          // #endif
          break

        case 'mp-weixin':
          // #ifdef MP-WEIXIN
          wx.vibrateShort({
            type: 'heavy'
          })
          // #endif
          break

        case 'h5':
          // #ifdef H5
          if (navigator.vibrate) {
            navigator.vibrate(50)
          }
          // #endif
          break
      }
      return true
    } catch (error) {
      console.error('重度震动失败:', error)
      return false
    }
  }

  // 成功反馈 - 双击震动
  success() {
    if (!this.checkSupport()) return false

    try {
      switch (this.platform) {
        case 'app-plus':
          // #ifdef APP-PLUS
          plus.device.vibrate(30)
          setTimeout(() => plus.device.vibrate(30), 100)
          // #endif
          break

        case 'mp-weixin':
          // #ifdef MP-WEIXIN
          wx.vibrateShort({ type: 'medium' })
          setTimeout(() => wx.vibrateShort({ type: 'medium' }), 100)
          // #endif
          break

        case 'h5':
          // #ifdef H5
          if (navigator.vibrate) {
            navigator.vibrate([30, 100, 30])
          }
          // #endif
          break
      }
      return true
    } catch (error) {
      console.error('成功震动失败:', error)
      return false
    }
  }

  // 错误反馈 - 长震动
  error() {
    if (!this.checkSupport()) return false

    try {
      switch (this.platform) {
        case 'app-plus':
          // #ifdef APP-PLUS
          plus.device.vibrate(100)
          // #endif
          break

        case 'mp-weixin':
          // #ifdef MP-WEIXIN
          wx.vibrateLong()
          // #endif
          break

        case 'h5':
          // #ifdef H5
          if (navigator.vibrate) {
            navigator.vibrate(100)
          }
          // #endif
          break
      }
      return true
    } catch (error) {
      console.error('错误震动失败:', error)
      return false
    }
  }

  // 警告反馈 - 三次短震动
  warning() {
    if (!this.checkSupport()) return false

    try {
      switch (this.platform) {
        case 'app-plus':
          // #ifdef APP-PLUS
          plus.device.vibrate(20)
          setTimeout(() => plus.device.vibrate(20), 80)
          setTimeout(() => plus.device.vibrate(20), 160)
          // #endif
          break

        case 'mp-weixin':
          // #ifdef MP-WEIXIN
          wx.vibrateShort({ type: 'light' })
          setTimeout(() => wx.vibrateShort({ type: 'light' }), 80)
          setTimeout(() => wx.vibrateShort({ type: 'light' }), 160)
          // #endif
          break

        case 'h5':
          // #ifdef H5
          if (navigator.vibrate) {
            navigator.vibrate([20, 80, 20, 80, 20])
          }
          // #endif
          break
      }
      return true
    } catch (error) {
      console.error('警告震动失败:', error)
      return false
    }
  }

  // 自定义震动模式
  custom(pattern) {
    if (!this.checkSupport()) return false

    try {
      if (typeof pattern === 'number') {
        // 单次震动
        switch (this.platform) {
          case 'app-plus':
            // #ifdef APP-PLUS
            plus.device.vibrate(pattern)
            // #endif
            break

          case 'mp-weixin':
            // #ifdef MP-WEIXIN
            const type = pattern <= 20 ? 'light' : pattern <= 40 ? 'medium' : 'heavy'
            wx.vibrateShort({ type })
            // #endif
            break

          case 'h5':
            // #ifdef H5
            if (navigator.vibrate) {
              navigator.vibrate(pattern)
            }
            // #endif
            break
        }
      } else if (Array.isArray(pattern)) {
        // 震动模式数组
        switch (this.platform) {
          case 'app-plus':
            // #ifdef APP-PLUS
            this.executePatternAppPlus(pattern)
            // #endif
            break

          case 'mp-weixin':
            // #ifdef MP-WEIXIN
            this.executePatternMpWeixin(pattern)
            // #endif
            break

          case 'h5':
            // #ifdef H5
            if (navigator.vibrate) {
              navigator.vibrate(pattern)
            }
            // #endif
            break
        }
      }
      return true
    } catch (error) {
      console.error('自定义震动失败:', error)
      return false
    }
  }

  // App Plus平台执行震动模式
  executePatternAppPlus(pattern) {
    // #ifdef APP-PLUS
    let delay = 0
    for (let i = 0; i < pattern.length; i += 2) {
      const vibrateDuration = pattern[i]
      const pauseDuration = pattern[i + 1] || 0

      setTimeout(() => {
        plus.device.vibrate(vibrateDuration)
      }, delay)

      delay += vibrateDuration + pauseDuration
    }
    // #endif
  }

  // 微信小程序平台执行震动模式
  executePatternMpWeixin(pattern) {
    // #ifdef MP-WEIXIN
    let delay = 0
    for (let i = 0; i < pattern.length; i += 2) {
      const vibrateDuration = pattern[i]
      const pauseDuration = pattern[i + 1] || 0

      setTimeout(() => {
        const type = vibrateDuration <= 20 ? 'light' : vibrateDuration <= 40 ? 'medium' : 'heavy'
        wx.vibrateShort({ type })
      }, delay)

      delay += vibrateDuration + pauseDuration
    }
    // #endif
  }

  // 获取平台信息
  getPlatformInfo() {
    return {
      platform: this.platform,
      isSupported: this.isSupported,
      isEnabled: this.isEnabled
    }
  }

  // 测试所有震动类型
  async testAll() {
    if (!this.checkSupport()) {
      console.log('触觉反馈不支持或已禁用')
      return
    }

    console.log('开始测试触觉反馈...')

    console.log('测试轻微震动')
    this.light()
    await this.delay(500)

    console.log('测试中等震动')
    this.medium()
    await this.delay(500)

    console.log('测试重度震动')
    this.heavy()
    await this.delay(500)

    console.log('测试成功反馈')
    this.success()
    await this.delay(800)

    console.log('测试警告反馈')
    this.warning()
    await this.delay(800)

    console.log('触觉反馈测试完成')
  }

  // 延迟工具
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// 创建全局实例
const hapticFeedback = new HapticFeedback()

// 导出便捷方法
export const vibrate = {
  light: () => hapticFeedback.light(),
  medium: () => hapticFeedback.medium(),
  heavy: () => hapticFeedback.heavy(),
  success: () => hapticFeedback.success(),
  error: () => hapticFeedback.error(),
  warning: () => hapticFeedback.warning(),
  custom: (pattern) => hapticFeedback.custom(pattern)
}

export const setHapticEnabled = (enabled) => hapticFeedback.setEnabled(enabled)
export const isHapticSupported = () => hapticFeedback.checkSupport()
export const getHapticInfo = () => hapticFeedback.getPlatformInfo()
export const testHaptic = () => hapticFeedback.testAll()

export default hapticFeedback