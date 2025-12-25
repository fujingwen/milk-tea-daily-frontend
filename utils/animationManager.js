// 动画状态管理工具

class AnimationManager {
  constructor() {
    this.activeAnimations = new Map()
    this.animationQueue = []
    this.isProcessingQueue = false
  }

  // 注册动画
  registerAnimation(id, element, config = {}) {
    const animation = {
      id,
      element,
      type: config.type || 'default',
      duration: config.duration || 300,
      easing: config.easing || 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      onStart: config.onStart || (() => {}),
      onComplete: config.onComplete || (() => {}),
      onError: config.onError || (() => {}),
      startTime: null,
      isActive: false
    }

    this.activeAnimations.set(id, animation)
    return animation
  }

  // 开始动画
  async startAnimation(id, properties = {}) {
    const animation = this.activeAnimations.get(id)
    if (!animation || animation.isActive) {
      return false
    }

    try {
      animation.isActive = true
      animation.startTime = Date.now()

      // 调用开始回调
      animation.onStart(animation)

      // 应用动画属性
      if (animation.element) {
        this.applyAnimationProperties(animation.element, properties, animation)
      }

      // 等待动画完成
      await this.waitForAnimation(animation)

      // 调用完成回调
      animation.onComplete(animation)

      return true
    } catch (error) {
      console.error(`动画 ${id} 执行失败:`, error)
      animation.onError(error, animation)
      return false
    } finally {
      animation.isActive = false
    }
  }

  // 停止动画
  stopAnimation(id, force = false) {
    const animation = this.activeAnimations.get(id)
    if (!animation || !animation.isActive) {
      return false
    }

    try {
      if (force) {
        // 强制停止，立即完成
        this.forceCompleteAnimation(animation)
      } else {
        // 优雅停止，让动画自然结束
        animation.shouldStop = true
      }

      animation.isActive = false
      return true
    } catch (error) {
      console.error(`停止动画 ${id} 失败:`, error)
      return false
    }
  }

  // 应用动画属性
  applyAnimationProperties(element, properties, animation) {
    if (!element || !element.style) {
      return
    }

    // 设置过渡属性
    element.style.transition = `all ${animation.duration}ms ${animation.easing}`

    // 应用样式属性
    Object.keys(properties).forEach(key => {
      element.style[key] = properties[key]
    })
  }

  // 等待动画完成
  waitForAnimation(animation) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (animation.isActive && !animation.shouldStop) {
          resolve()
        }
      }, animation.duration + 50) // 额外50ms缓冲

      // 监听过渡结束事件
      const handleTransitionEnd = (event) => {
        if (event.target === animation.element) {
          clearTimeout(timeout)
          animation.element.removeEventListener('transitionend', handleTransitionEnd)
          resolve()
        }
      }

      if (animation.element) {
        animation.element.addEventListener('transitionend', handleTransitionEnd)
      }

      // 错误处理
      const handleError = (error) => {
        clearTimeout(timeout)
        if (animation.element) {
          animation.element.removeEventListener('transitionend', handleTransitionEnd)
        }
        reject(error)
      }

      // 检查动画是否应该停止
      const checkStop = () => {
        if (animation.shouldStop) {
          clearTimeout(timeout)
          resolve()
        } else if (animation.isActive) {
          setTimeout(checkStop, 16) // 60fps检查
        }
      }
      checkStop()
    })
  }

  // 强制完成动画
  forceCompleteAnimation(animation) {
    if (!animation.element || !animation.element.style) {
      return
    }

    // 移除过渡效果
    animation.element.style.transition = 'none'

    // 强制重绘
    animation.element.offsetHeight

    // 恢复过渡效果
    setTimeout(() => {
      if (animation.element && animation.element.style) {
        animation.element.style.transition = ''
      }
    }, 0)
  }

  // 批量动画处理
  async batchAnimations(animations, options = {}) {
    const { stagger = 0, concurrent = false } = options

    if (concurrent) {
      // 并发执行
      const promises = animations.map(({ id, properties }) =>
        this.startAnimation(id, properties)
      )
      return Promise.all(promises)
    } else {
      // 顺序执行，支持错开时间
      const results = []
      for (let i = 0; i < animations.length; i++) {
        const { id, properties } = animations[i]

        if (i > 0 && stagger > 0) {
          await this.delay(stagger)
        }

        const result = await this.startAnimation(id, properties)
        results.push(result)
      }
      return results
    }
  }

  // 延迟工具
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // 检查动画是否活跃
  isAnimationActive(id) {
    const animation = this.activeAnimations.get(id)
    return animation ? animation.isActive : false
  }

  // 获取活跃动画数量
  getActiveAnimationCount() {
    let count = 0
    this.activeAnimations.forEach(animation => {
      if (animation.isActive) count++
    })
    return count
  }

  // 清理动画
  cleanup(id) {
    if (id) {
      // 清理特定动画
      const animation = this.activeAnimations.get(id)
      if (animation) {
        this.stopAnimation(id, true)
        this.activeAnimations.delete(id)
      }
    } else {
      // 清理所有动画
      this.activeAnimations.forEach((animation, id) => {
        this.stopAnimation(id, true)
      })
      this.activeAnimations.clear()
    }
  }

  // 性能监控
  getPerformanceStats() {
    const activeCount = this.getActiveAnimationCount()
    const totalCount = this.activeAnimations.size

    return {
      activeAnimations: activeCount,
      totalAnimations: totalCount,
      memoryUsage: this.estimateMemoryUsage()
    }
  }

  // 估算内存使用
  estimateMemoryUsage() {
    // 简单估算，每个动画对象约占用1KB
    return this.activeAnimations.size * 1024
  }

  // 错误恢复
  recoverFromError(id) {
    const animation = this.activeAnimations.get(id)
    if (animation) {
      animation.isActive = false
      animation.shouldStop = false

      // 重置元素状态
      if (animation.element && animation.element.style) {
        animation.element.style.transition = ''
        animation.element.style.transform = ''
        animation.element.style.opacity = ''
      }
    }
  }
}

// 创建全局实例
const animationManager = new AnimationManager()

// 导出工具函数
export const createAnimation = (id, element, config) => {
  return animationManager.registerAnimation(id, element, config)
}

export const startAnimation = (id, properties) => {
  return animationManager.startAnimation(id, properties)
}

export const stopAnimation = (id, force) => {
  return animationManager.stopAnimation(id, force)
}

export const batchAnimations = (animations, options) => {
  return animationManager.batchAnimations(animations, options)
}

export const isAnimationActive = (id) => {
  return animationManager.isAnimationActive(id)
}

export const cleanupAnimations = (id) => {
  return animationManager.cleanup(id)
}

export const getAnimationStats = () => {
  return animationManager.getPerformanceStats()
}

export default animationManager