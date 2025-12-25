// API mock数据和模拟接口
import { allRecords } from './records.js'
import { userInfo, userStats } from './user.js'
import { moduleStats } from './modules.js'

// 模拟网络延迟
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

// 模拟API响应格式
const createResponse = (data, success = true, message = 'success') => ({
  success,
  data,
  message,
  timestamp: Date.now()
})

// 用户相关API
export const userApi = {
  // 用户登录
  async login(params) {
    await delay(800)
    const { phone, code, type = 'phone' } = params

    if (type === 'phone') {
      if (!phone || !code) {
        return createResponse(null, false, '手机号和验证码不能为空')
      }
      if (code !== '123456') {
        return createResponse(null, false, '验证码错误')
      }
    }

    return createResponse({
      token: 'mock_token_' + Date.now(),
      userInfo: {
        ...userInfo,
        userId: type + '_' + (phone || Date.now()),
        phone: phone || userInfo.phone
      }
    })
  },

  // 发送验证码
  async sendCode(phone) {
    await delay(300)
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return createResponse(null, false, '手机号格式错误')
    }
    return createResponse({ code: '123456' }, true, '验证码发送成功')
  },

  // 获取用户信息
  async getUserInfo() {
    await delay(200)
    return createResponse(userInfo)
  },

  // 更新用户信息
  async updateUserInfo(data) {
    await delay(400)
    return createResponse({ ...userInfo, ...data })
  },

  // 获取用户统计
  async getUserStats() {
    await delay(300)
    return createResponse(userStats)
  }
}

// 记录相关API
export const recordApi = {
  // 获取记录列表
  async getRecords(params = {}) {
    await delay(400)
    const { page = 1, pageSize = 20, moduleType, startTime, endTime, keyword } = params

    let filteredRecords = [...allRecords]

    // 模块类型筛选
    if (moduleType) {
      filteredRecords = filteredRecords.filter(record => record.moduleType === moduleType)
    }

    // 时间范围筛选
    if (startTime && endTime) {
      filteredRecords = filteredRecords.filter(record =>
        record.createTime >= startTime && record.createTime <= endTime
      )
    }

    // 关键词搜索
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase()
      filteredRecords = filteredRecords.filter(record => {
        const content = JSON.stringify(record).toLowerCase()
        return content.includes(lowerKeyword)
      })
    }

    // 分页
    const total = filteredRecords.length
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const records = filteredRecords.slice(start, end)

    return createResponse({
      records,
      total,
      page,
      pageSize,
      hasMore: end < total
    })
  },

  // 获取单条记录
  async getRecord(id) {
    await delay(200)
    const record = allRecords.find(r => r.recordId === id)
    if (!record) {
      return createResponse(null, false, '记录不存在')
    }
    return createResponse(record)
  },

  // 创建记录
  async createRecord(data) {
    await delay(600)
    const newRecord = {
      ...data,
      recordId: 'mock_' + Date.now(),
      createTime: Date.now(),
      updateTime: Date.now()
    }
    return createResponse(newRecord)
  },

  // 更新记录
  async updateRecord(id, data) {
    await delay(500)
    const record = allRecords.find(r => r.recordId === id)
    if (!record) {
      return createResponse(null, false, '记录不存在')
    }

    const updatedRecord = {
      ...record,
      ...data,
      updateTime: Date.now()
    }
    return createResponse(updatedRecord)
  },

  // 删除记录
  async deleteRecord(id) {
    await delay(300)
    const record = allRecords.find(r => r.recordId === id)
    if (!record) {
      return createResponse(null, false, '记录不存在')
    }
    return createResponse({ recordId: id })
  },

  // 批量删除记录
  async batchDeleteRecords(ids) {
    await delay(800)
    return createResponse({ deletedIds: ids })
  }
}

// 统计相关API
export const statsApi = {
  // 获取模块统计
  async getModuleStats(moduleType) {
    await delay(300)
    const stats = moduleStats[moduleType]
    if (!stats) {
      return createResponse(null, false, '模块不存在')
    }
    return createResponse(stats)
  },

  // 获取时间范围统计
  async getTimeRangeStats(startTime, endTime) {
    await delay(400)
    const records = allRecords.filter(record =>
      record.createTime >= startTime && record.createTime <= endTime
    )

    const stats = {
      totalRecords: records.length,
      moduleDistribution: {},
      dailyCount: {},
      trends: []
    }

    // 模块分布统计
    records.forEach(record => {
      stats.moduleDistribution[record.moduleType] =
        (stats.moduleDistribution[record.moduleType] || 0) + 1
    })

    return createResponse(stats)
  },

  // 获取今日统计
  async getTodayStats() {
    await delay(200)
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1

    return this.getTimeRangeStats(startOfDay, endOfDay)
  }
}

// 数据同步API
export const syncApi = {
  // 上传数据到云端
  async uploadData(data) {
    await delay(2000)
    return createResponse({
      uploadId: 'upload_' + Date.now(),
      uploadTime: Date.now(),
      recordCount: data.records?.length || 0
    })
  },

  // 从云端下载数据
  async downloadData() {
    await delay(1500)
    return createResponse({
      records: allRecords,
      userInfo,
      downloadTime: Date.now()
    })
  },

  // 检查数据版本
  async checkVersion() {
    await delay(300)
    return createResponse({
      localVersion: '1.0.0',
      cloudVersion: '1.0.1',
      needUpdate: Math.random() > 0.5
    })
  }
}

// 导出所有API
export default {
  userApi,
  recordApi,
  statsApi,
  syncApi
}