import { defineStore } from 'pinia'
import { initMockData } from '../mock/index.js'

// 导出模块可见性store
export { useModuleVisibilityStore } from './moduleVisibility.js'

// 主应用状态
export const useAppStore = defineStore('app', {
  state: () => ({
    user: null,
    isLogin: false,
    settings: {
      voiceEnabled: true,
      backupEnabled: false,
      notifications: {
        menstruation: true,
        todo: true,
        backup: false
      }
    }
  }),

  getters: {
    userInfo: (state) => state.user,
    isLoggedIn: (state) => state.isLogin
  },

  actions: {
    setUser(user) {
      this.user = user
      this.isLogin = true
      try {
        uni.setStorageSync('user', JSON.stringify(user))
      } catch (error) {
        console.error('保存用户数据失败:', error)
      }
    },

    logout() {
      this.user = null
      this.isLogin = false
      uni.removeStorageSync('user')
    },

    updateSettings(settings) {
      this.settings = { ...this.settings, ...settings }
      try {
        uni.setStorageSync('settings', JSON.stringify(this.settings))
      } catch (error) {
        console.error('保存设置失败:', error)
      }
    },

    loadUserData() {
      try {
        const user = uni.getStorageSync('user')
        const settings = uni.getStorageSync('settings')

        if (user) {
          this.user = typeof user === 'string' ? JSON.parse(user) : user
          this.isLogin = true
        } else {
          // 如果没有用户数据，初始化mock数据
          initMockData()
          const mockUser = uni.getStorageSync('userInfo')
          if (mockUser) {
            this.user = typeof mockUser === 'string' ? JSON.parse(mockUser) : mockUser
          }
        }

        if (settings) {
          this.settings = {
            ...this.settings,
            ...(typeof settings === 'string' ? JSON.parse(settings) : settings)
          }
        }
      } catch (error) {
        console.error('加载用户数据失败:', error)
      }
    }
  }
})

// 记录数据状态
export const useRecordStore = defineStore('record', {
  state: () => ({
    records: [],
    currentModule: null,
    filterDate: null
  }),

  getters: {
    // 按模块分组的记录
    recordsByModule: (state) => {
      const grouped = {}
      state.records.forEach(record => {
        if (!grouped[record.moduleType]) {
          grouped[record.moduleType] = []
        }
        grouped[record.moduleType].push(record)
      })
      return grouped
    },

    // 按日期分组的记录
    recordsByDate: (state) => {
      const grouped = {}
      state.records.forEach(record => {
        const date = new Date(record.createTime).toDateString()
        if (!grouped[date]) {
          grouped[date] = []
        }
        grouped[date].push(record)
      })
      return grouped
    },

    // 获取指定模块的记录
    getRecordsByModule: (state) => (moduleType) => {
      return state.records.filter(record => record.moduleType === moduleType)
    }
  },

  actions: {
    // 添加记录
    addRecord(record) {
      const newRecord = {
        recordId: this.generateId(),
        userId: useAppStore().user?.userId || 'local',
        createTime: Date.now(),
        updateTime: Date.now(),
        ...record
      }

      this.records.unshift(newRecord)
      this.saveToStorage()
      return newRecord
    },

    // 更新记录
    updateRecord(recordId, updates) {
      const index = this.records.findIndex(r => r.recordId === recordId)
      if (index !== -1) {
        this.records[index] = {
          ...this.records[index],
          ...updates,
          updateTime: Date.now()
        }
        this.saveToStorage()
        return true
      }
      return false
    },

    // 删除记录
    deleteRecord(recordId) {
      const index = this.records.findIndex(r => r.recordId === recordId)
      if (index !== -1) {
        this.records.splice(index, 1)
        this.saveToStorage()
      }
    },

    // 加载本地数据
    loadFromStorage() {
      try {
        const records = uni.getStorageSync('records')
        if (records) {
          // 如果是字符串，需要解析
          this.records = typeof records === 'string' ? JSON.parse(records) : records
        } else {
          // 如果没有本地数据，初始化mock数据
          console.log('没有找到本地记录数据，初始化mock数据')
          initMockData()
          const mockRecords = uni.getStorageSync('records')
          if (mockRecords) {
            this.records = typeof mockRecords === 'string' ? JSON.parse(mockRecords) : mockRecords
          }
        }
      } catch (error) {
        console.error('加载记录数据失败:', error)
        this.records = []
      }
    },

    // 保存到本地
    saveToStorage() {
      try {
        uni.setStorageSync('records', JSON.stringify(this.records))
      } catch (error) {
        console.error('保存记录数据失败:', error)
      }
    },

    // 生成唯一ID
    generateId() {
      return Date.now().toString(36) + Math.random().toString(36).substring(2)
    }
  }
})