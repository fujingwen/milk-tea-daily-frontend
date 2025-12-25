// 生日提醒服务
import {
  checkBirthdayReminders,
  getTodayBirthdays,
  getThisMonthBirthdays,
  showToast
} from './index.js'

class BirthdayService {
  constructor() {
    this.reminders = []
    this.isInitialized = false
  }

  // 初始化生日服务
  init() {
    if (this.isInitialized) return

    // 检查今日生日提醒
    this.checkDailyReminders()

    // 设置定时检查（每天检查一次）
    this.setupDailyCheck()

    this.isInitialized = true
    console.log('生日提醒服务已启动')
  }

  // 获取所有生日记录
  getBirthdayRecords() {
    try {
      const records = uni.getStorageSync('records')
      const allRecords = records ? JSON.parse(records) : []
      return allRecords.filter(record => record.moduleType === 'birthday')
    } catch (error) {
      console.error('获取生日记录失败:', error)
      return []
    }
  }

  // 检查每日提醒
  checkDailyReminders() {
    const birthdayRecords = this.getBirthdayRecords()
    if (birthdayRecords.length === 0) return

    const reminders = checkBirthdayReminders(birthdayRecords)

    if (reminders.length > 0) {
      this.reminders = reminders
      this.showReminders(reminders)

      // 保存提醒记录
      this.saveReminderHistory(reminders)
    }
  }

  // 显示提醒
  showReminders(reminders) {
    reminders.forEach((reminder, index) => {
      setTimeout(() => {
        showToast(reminder.message, 'none', 3000)

        // 如果是当天生日，显示特殊提醒
        if (reminder.daysUntil === 0) {
          setTimeout(() => {
            uni.showModal({
              title: '🎉 生日提醒',
              content: `今天是${reminder.name}的${reminder.age}岁生日！\n记得送上生日祝福哦~`,
              showCancel: false,
              confirmText: '知道了'
            })
          }, 1000)
        }
      }, index * 2000) // 每个提醒间隔2秒
    })
  }

  // 获取今日生日
  getTodayBirthdays() {
    const birthdayRecords = this.getBirthdayRecords()
    return getTodayBirthdays(birthdayRecords)
  }

  // 获取本月生日
  getThisMonthBirthdays() {
    const birthdayRecords = this.getBirthdayRecords()
    return getThisMonthBirthdays(birthdayRecords)
  }

  // 获取即将到来的生日（7天内）
  getUpcomingBirthdays() {
    const birthdayRecords = this.getBirthdayRecords()
    return birthdayRecords.filter(record => {
      const daysUntil = this.getDaysUntilBirthday(record.birthday)
      return daysUntil >= 0 && daysUntil <= 7
    }).sort((a, b) => {
      return this.getDaysUntilBirthday(a.birthday) - this.getDaysUntilBirthday(b.birthday)
    })
  }

  // 计算距离生日天数（复用工具函数）
  getDaysUntilBirthday(birthday) {
    const today = new Date()
    const birthDate = new Date(birthday)
    const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())

    if (thisYearBirthday < today) {
      thisYearBirthday.setFullYear(today.getFullYear() + 1)
    }

    const timeDiff = thisYearBirthday.getTime() - today.getTime()
    return Math.ceil(timeDiff / (1000 * 3600 * 24))
  }

  // 设置每日检查
  setupDailyCheck() {
    // 计算到明天凌晨的毫秒数
    const now = new Date()
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    const msUntilTomorrow = tomorrow.getTime() - now.getTime()

    // 设置明天凌晨的检查
    setTimeout(() => {
      this.checkDailyReminders()

      // 然后每24小时检查一次
      setInterval(() => {
        this.checkDailyReminders()
      }, 24 * 60 * 60 * 1000)
    }, msUntilTomorrow)
  }

  // 保存提醒历史
  saveReminderHistory(reminders) {
    try {
      const today = new Date().toDateString()
      const history = uni.getStorageSync('birthdayReminderHistory') || '{}'
      const historyObj = typeof history === 'string' ? JSON.parse(history) : history

      historyObj[today] = reminders.map(r => ({
        name: r.name,
        daysUntil: r.daysUntil,
        message: r.message,
        timestamp: Date.now()
      }))

      uni.setStorageSync('birthdayReminderHistory', JSON.stringify(historyObj))
    } catch (error) {
      console.error('保存提醒历史失败:', error)
    }
  }

  // 获取提醒历史
  getReminderHistory(days = 7) {
    try {
      const history = uni.getStorageSync('birthdayReminderHistory') || '{}'
      const historyObj = typeof history === 'string' ? JSON.parse(history) : history

      const result = []
      const today = new Date()

      for (let i = 0; i < days; i++) {
        const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
        const dateStr = date.toDateString()

        if (historyObj[dateStr]) {
          result.push({
            date: dateStr,
            reminders: historyObj[dateStr]
          })
        }
      }

      return result
    } catch (error) {
      console.error('获取提醒历史失败:', error)
      return []
    }
  }

  // 手动触发检查（用于测试）
  manualCheck() {
    console.log('手动检查生日提醒...')
    this.checkDailyReminders()
  }

  // 添加生日记录
  addBirthdayRecord(record) {
    try {
      const records = uni.getStorageSync('records')
      const allRecords = records ? JSON.parse(records) : []

      const newRecord = {
        recordId: Date.now().toString(36) + Math.random().toString(36).substring(2),
        moduleType: 'birthday',
        createTime: Date.now(),
        updateTime: Date.now(),
        ...record
      }

      allRecords.unshift(newRecord)
      uni.setStorageSync('records', JSON.stringify(allRecords))

      console.log('生日记录添加成功')
      return newRecord
    } catch (error) {
      console.error('添加生日记录失败:', error)
      return null
    }
  }

  // 更新生日记录
  updateBirthdayRecord(recordId, updates) {
    try {
      const records = uni.getStorageSync('records')
      const allRecords = records ? JSON.parse(records) : []

      const index = allRecords.findIndex(r => r.recordId === recordId)
      if (index !== -1) {
        allRecords[index] = {
          ...allRecords[index],
          ...updates,
          updateTime: Date.now()
        }

        uni.setStorageSync('records', JSON.stringify(allRecords))
        console.log('生日记录更新成功')
        return allRecords[index]
      }

      return null
    } catch (error) {
      console.error('更新生日记录失败:', error)
      return null
    }
  }

  // 删除生日记录
  deleteBirthdayRecord(recordId) {
    try {
      const records = uni.getStorageSync('records')
      const allRecords = records ? JSON.parse(records) : []

      const index = allRecords.findIndex(r => r.recordId === recordId)
      if (index !== -1) {
        allRecords.splice(index, 1)
        uni.setStorageSync('records', JSON.stringify(allRecords))
        console.log('生日记录删除成功')
        return true
      }

      return false
    } catch (error) {
      console.error('删除生日记录失败:', error)
      return false
    }
  }
}

// 创建单例实例
const birthdayService = new BirthdayService()

export default birthdayService