import { defineStore } from 'pinia'
import { setStorage, getStorage, removeStorage } from '@/utils/storageManager.js'

const STORAGE_KEY = 'module_visibility'
const STORAGE_VERSION = '1.0.0'

export const useModuleVisibilityStore = defineStore('moduleVisibility', {
  state: () => ({
    hiddenModules: new Set(),
    animatingModules: new Set(),
    isInitialized: false
  }),

  getters: {
    // 检查模块是否隐藏
    isModuleHidden: (state) => (moduleType) => {
      return state.hiddenModules.has(moduleType)
    },

    // 检查模块是否正在动画中
    isModuleAnimating: (state) => (moduleType) => {
      return state.animatingModules.has(moduleType)
    },

    // 获取隐藏模块数量
    hiddenModulesCount: (state) => {
      return state.hiddenModules.size
    },

    // 获取隐藏模块列表
    hiddenModulesList: (state) => {
      return Array.from(state.hiddenModules)
    },

    // 检查是否有隐藏的模块
    hasHiddenModules: (state) => {
      return state.hiddenModules.size > 0
    }
  },

  actions: {
    // 隐藏模块
    async hideModule(moduleType) {
      if (!moduleType || this.hiddenModules.has(moduleType)) {
        return
      }

      // 添加到动画状态
      this.animatingModules.add(moduleType)

      try {
        // 添加到隐藏列表
        this.hiddenModules.add(moduleType)

        // 保存到本地存储
        await this.saveToStorage()

        console.log(`模块 ${moduleType} 已隐藏`)
      } catch (error) {
        console.error('隐藏模块失败:', error)
        // 回滚操作
        this.hiddenModules.delete(moduleType)
      } finally {
        // 移除动画状态
        setTimeout(() => {
          this.animatingModules.delete(moduleType)
        }, 300) // 等待动画完成
      }
    },

    // 显示模块
    async showModule(moduleType) {
      if (!moduleType || !this.hiddenModules.has(moduleType)) {
        return
      }

      // 添加到动画状态
      this.animatingModules.add(moduleType)

      try {
        // 从隐藏列表移除
        this.hiddenModules.delete(moduleType)

        // 保存到本地存储
        await this.saveToStorage()

        console.log(`模块 ${moduleType} 已显示`)
      } catch (error) {
        console.error('显示模块失败:', error)
        // 回滚操作
        this.hiddenModules.add(moduleType)
      } finally {
        // 移除动画状态
        setTimeout(() => {
          this.animatingModules.delete(moduleType)
        }, 300) // 等待动画完成
      }
    },

    // 显示所有模块
    async showAllModules() {
      if (this.hiddenModules.size === 0) {
        return
      }

      const hiddenList = Array.from(this.hiddenModules)

      // 添加所有模块到动画状态
      hiddenList.forEach(moduleType => {
        this.animatingModules.add(moduleType)
      })

      try {
        // 清空隐藏列表
        this.hiddenModules.clear()

        // 保存到本地存储
        await this.saveToStorage()

        console.log('所有模块已显示')
      } catch (error) {
        console.error('显示所有模块失败:', error)
        // 回滚操作
        hiddenList.forEach(moduleType => {
          this.hiddenModules.add(moduleType)
        })
      } finally {
        // 错开移除动画状态，避免视觉混乱
        hiddenList.forEach((moduleType, index) => {
          setTimeout(() => {
            this.animatingModules.delete(moduleType)
          }, 300 + index * 100) // 错开100ms
        })
      }
    },

    // 从本地存储加载数据
    async loadFromStorage() {
      try {
        const data = await getStorage(STORAGE_KEY, null, {
          useCache: true,
          validateTTL: false // 不验证TTL，因为设置为永不过期
        })

        if (!data) {
          // 没有存储数据，使用默认状态
          this.hiddenModules = new Set()
          this.isInitialized = true
          console.log('没有找到模块可见性数据，使用默认状态')
          return
        }

        // 检查数据版本兼容性
        if (!this.isDataValid(data)) {
          console.warn('模块可见性数据格式不兼容，使用默认状态')
          this.hiddenModules = new Set()
          this.isInitialized = true
          return
        }

        // 恢复隐藏模块状态
        this.hiddenModules = new Set(data.hiddenModules || [])
        this.isInitialized = true

        console.log('模块可见性数据加载成功:', Array.from(this.hiddenModules))
      } catch (error) {
        console.error('加载模块可见性数据失败:', error)
        // 使用默认状态
        this.hiddenModules = new Set()
        this.isInitialized = true
      }
    },

    // 保存到本地存储
    async saveToStorage() {
      try {
        const data = {
          hiddenModules: Array.from(this.hiddenModules),
          lastUpdated: Date.now(),
          version: STORAGE_VERSION
        }

        await setStorage(STORAGE_KEY, data, {
          version: STORAGE_VERSION,
          ttl: null // 永不过期
        })

        console.log('模块可见性数据保存成功')
      } catch (error) {
        console.error('保存模块可见性数据失败:', error)
        throw error
      }
    },

    // 验证数据有效性
    isDataValid(data) {
      if (!data || typeof data !== 'object') {
        return false
      }

      // 检查必要字段
      if (!Array.isArray(data.hiddenModules)) {
        return false
      }

      // 检查版本兼容性
      if (data.version && typeof data.version !== 'string') {
        return false
      }

      return true
    },

    // 重置所有状态
    reset() {
      this.hiddenModules.clear()
      this.animatingModules.clear()
      this.isInitialized = false

      // 清除本地存储
      try {
        removeStorage(STORAGE_KEY)
        console.log('模块可见性状态已重置')
      } catch (error) {
        console.error('重置模块可见性状态失败:', error)
      }
    }
  }
})