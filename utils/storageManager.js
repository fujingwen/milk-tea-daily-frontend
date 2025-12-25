// 本地存储管理工具

const STORAGE_VERSION = '1.0.0'
const STORAGE_PREFIX = 'milktea_'

class StorageManager {
  constructor() {
    this.cache = new Map()
    this.listeners = new Map()
    this.isInitialized = false
  }

  // 初始化存储管理器
  async initialize() {
    if (this.isInitialized) {
      return
    }

    try {
      // 检查存储可用性
      await this.checkStorageAvailability()

      // 执行数据迁移（如果需要）
      await this.performMigration()

      this.isInitialized = true
      console.log('存储管理器初始化成功')
    } catch (error) {
      console.error('存储管理器初始化失败:', error)
      throw error
    }
  }

  // 检查存储可用性
  async checkStorageAvailability() {
    try {
      const testKey = `${STORAGE_PREFIX}test`
      const testValue = 'test_value'

      // 测试写入
      uni.setStorageSync(testKey, testValue)

      // 测试读取
      const readValue = uni.getStorageSync(testKey)
      if (readValue !== testValue) {
        throw new Error('存储读写测试失败')
      }

      // 清理测试数据
      uni.removeStorageSync(testKey)

      return true
    } catch (error) {
      throw new Error(`存储不可用: ${error.message}`)
    }
  }

  // 生成存储键
  generateKey(key) {
    return `${STORAGE_PREFIX}${key}`
  }

  // 设置数据
  async setItem(key, value, options = {}) {
    const {
      encrypt = false,
      compress = false,
      ttl = null,
      version = STORAGE_VERSION
    } = options

    try {
      const storageKey = this.generateKey(key)

      // 构建存储数据
      const storageData = {
        value,
        version,
        timestamp: Date.now(),
        ttl,
        metadata: {
          encrypted: encrypt,
          compressed: compress
        }
      }

      // 数据处理
      let processedData = storageData

      if (compress) {
        processedData = await this.compressData(processedData)
      }

      if (encrypt) {
        processedData = await this.encryptData(processedData)
      }

      // 存储数据
      uni.setStorageSync(storageKey, JSON.stringify(processedData))

      // 更新缓存
      this.cache.set(key, { data: value, timestamp: Date.now() })

      // 触发监听器
      this.notifyListeners(key, 'set', value)

      console.log(`数据已保存: ${key}`)
      return true
    } catch (error) {
      console.error(`保存数据失败 (${key}):`, error)
      throw new Error(`保存数据失败: ${error.message}`)
    }
  }

  // 获取数据
  async getItem(key, defaultValue = null, options = {}) {
    const { useCache = true, validateTTL = true } = options

    try {
      // 检查缓存
      if (useCache && this.cache.has(key)) {
        const cached = this.cache.get(key)
        if (Date.now() - cached.timestamp < 60000) { // 1分钟缓存
          return cached.data
        }
      }

      const storageKey = this.generateKey(key)
      const rawData = uni.getStorageSync(storageKey)

      if (!rawData) {
        return defaultValue
      }

      // 解析数据
      let storageData
      try {
        storageData = JSON.parse(rawData)
      } catch (parseError) {
        console.warn(`数据解析失败 (${key}), 使用默认值`)
        return defaultValue
      }

      // 验证数据结构
      if (!this.validateStorageData(storageData)) {
        console.warn(`数据格式无效 (${key}), 使用默认值`)
        return defaultValue
      }

      // 检查TTL
      if (validateTTL && storageData.ttl) {
        const isExpired = Date.now() - storageData.timestamp > storageData.ttl
        if (isExpired) {
          console.log(`数据已过期 (${key}), 删除并使用默认值`)
          await this.removeItem(key)
          return defaultValue
        }
      }

      // 数据解密和解压
      let processedData = storageData

      if (storageData.metadata?.encrypted) {
        processedData = await this.decryptData(processedData)
      }

      if (storageData.metadata?.compressed) {
        processedData = await this.decompressData(processedData)
      }

      const value = processedData.value

      // 更新缓存
      if (useCache) {
        this.cache.set(key, { data: value, timestamp: Date.now() })
      }

      return value
    } catch (error) {
      console.error(`获取数据失败 (${key}):`, error)
      return defaultValue
    }
  }

  // 删除数据
  async removeItem(key) {
    try {
      const storageKey = this.generateKey(key)
      uni.removeStorageSync(storageKey)

      // 清除缓存
      this.cache.delete(key)

      // 触发监听器
      this.notifyListeners(key, 'remove', null)

      console.log(`数据已删除: ${key}`)
      return true
    } catch (error) {
      console.error(`删除数据失败 (${key}):`, error)
      return false
    }
  }

  // 检查数据是否存在
  async hasItem(key) {
    try {
      const storageKey = this.generateKey(key)
      const data = uni.getStorageSync(storageKey)
      return !!data
    } catch (error) {
      console.error(`检查数据存在性失败 (${key}):`, error)
      return false
    }
  }

  // 获取所有键
  async getAllKeys() {
    try {
      const info = uni.getStorageInfoSync()
      return info.keys
        .filter(key => key.startsWith(STORAGE_PREFIX))
        .map(key => key.replace(STORAGE_PREFIX, ''))
    } catch (error) {
      console.error('获取所有键失败:', error)
      return []
    }
  }

  // 清除所有数据
  async clear() {
    try {
      const keys = await this.getAllKeys()

      for (const key of keys) {
        await this.removeItem(key)
      }

      // 清除缓存
      this.cache.clear()

      console.log('所有数据已清除')
      return true
    } catch (error) {
      console.error('清除数据失败:', error)
      return false
    }
  }

  // 获取存储信息
  async getStorageInfo() {
    try {
      const info = uni.getStorageInfoSync()
      const appKeys = info.keys.filter(key => key.startsWith(STORAGE_PREFIX))

      return {
        totalKeys: info.keys.length,
        appKeys: appKeys.length,
        currentSize: info.currentSize,
        limitSize: info.limitSize,
        usage: info.limitSize > 0 ? (info.currentSize / info.limitSize * 100).toFixed(2) + '%' : 'N/A'
      }
    } catch (error) {
      console.error('获取存储信息失败:', error)
      return null
    }
  }

  // 数据验证
  validateStorageData(data) {
    return data &&
      typeof data === 'object' &&
      data.hasOwnProperty('value') &&
      data.hasOwnProperty('version') &&
      data.hasOwnProperty('timestamp') &&
      typeof data.timestamp === 'number'
  }

  // 版本兼容性检查
  isVersionCompatible(dataVersion, currentVersion = STORAGE_VERSION) {
    // 简单的版本比较，可以根据需要扩展
    const parseVersion = (version) => {
      return version.split('.').map(num => parseInt(num, 10))
    }

    try {
      const dataVer = parseVersion(dataVersion)
      const currentVer = parseVersion(currentVersion)

      // 主版本号必须相同
      return dataVer[0] === currentVer[0]
    } catch (error) {
      return false
    }
  }

  // 数据迁移
  async performMigration() {
    try {
      const keys = await this.getAllKeys()
      let migratedCount = 0

      for (const key of keys) {
        const data = await this.getItem(key, null, { validateTTL: false })
        if (data && typeof data === 'object' && data.version) {
          if (!this.isVersionCompatible(data.version)) {
            // 执行数据迁移逻辑
            const migratedData = await this.migrateData(key, data)
            if (migratedData) {
              await this.setItem(key, migratedData)
              migratedCount++
            }
          }
        }
      }

      if (migratedCount > 0) {
        console.log(`数据迁移完成，迁移了 ${migratedCount} 个项目`)
      }
    } catch (error) {
      console.error('数据迁移失败:', error)
    }
  }

  // 数据迁移逻辑（可扩展）
  async migrateData(key, oldData) {
    // 这里可以根据具体需求实现数据迁移逻辑
    console.log(`迁移数据: ${key}`)
    return oldData
  }

  // 添加监听器
  addListener(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set())
    }
    this.listeners.get(key).add(callback)
  }

  // 移除监听器
  removeListener(key, callback) {
    if (this.listeners.has(key)) {
      this.listeners.get(key).delete(callback)
    }
  }

  // 通知监听器
  notifyListeners(key, action, value) {
    if (this.listeners.has(key)) {
      this.listeners.get(key).forEach(callback => {
        try {
          callback({ key, action, value, timestamp: Date.now() })
        } catch (error) {
          console.error('监听器回调执行失败:', error)
        }
      })
    }
  }

  // 数据压缩（简单实现）
  async compressData(data) {
    // 这里可以实现真正的压缩算法
    // 目前只是标记为已压缩
    return {
      ...data,
      metadata: { ...data.metadata, compressed: true }
    }
  }

  // 数据解压
  async decompressData(data) {
    // 对应的解压实现
    return {
      ...data,
      metadata: { ...data.metadata, compressed: false }
    }
  }

  // 数据加密（简单实现）
  async encryptData(data) {
    // 这里可以实现真正的加密算法
    // 目前只是标记为已加密
    return {
      ...data,
      metadata: { ...data.metadata, encrypted: true }
    }
  }

  // 数据解密
  async decryptData(data) {
    // 对应的解密实现
    return {
      ...data,
      metadata: { ...data.metadata, encrypted: false }
    }
  }

  // 清理过期数据
  async cleanupExpiredData() {
    try {
      const keys = await this.getAllKeys()
      let cleanedCount = 0

      for (const key of keys) {
        const data = await this.getItem(key, null, { validateTTL: true, useCache: false })
        if (data === null) {
          // 数据已过期并被删除
          cleanedCount++
        }
      }

      if (cleanedCount > 0) {
        console.log(`清理了 ${cleanedCount} 个过期数据项`)
      }

      return cleanedCount
    } catch (error) {
      console.error('清理过期数据失败:', error)
      return 0
    }
  }

  // 获取缓存统计
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }

  // 清除缓存
  clearCache() {
    this.cache.clear()
  }
}

// 创建全局实例
const storageManager = new StorageManager()

// 导出便捷方法
export const initStorage = () => storageManager.initialize()
export const setStorage = (key, value, options) => storageManager.setItem(key, value, options)
export const getStorage = (key, defaultValue, options) => storageManager.getItem(key, defaultValue, options)
export const removeStorage = (key) => storageManager.removeItem(key)
export const hasStorage = (key) => storageManager.hasItem(key)
export const clearStorage = () => storageManager.clear()
export const getStorageInfo = () => storageManager.getStorageInfo()
export const addStorageListener = (key, callback) => storageManager.addListener(key, callback)
export const removeStorageListener = (key, callback) => storageManager.removeListener(key, callback)
export const cleanupExpiredStorage = () => storageManager.cleanupExpiredData()

export default storageManager