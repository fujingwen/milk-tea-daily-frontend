// 工具函数集合

// 格式化日期
export function formatDate(timestamp, format = 'YYYY-MM-DD') {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second)
}

// 格式化时间为相对时间
export function formatRelativeTime(timestamp) {
  const now = Date.now()
  const diff = now - timestamp
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const month = 30 * day

  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < week) {
    return `${Math.floor(diff / day)}天前`
  } else if (diff < month) {
    return `${Math.floor(diff / week)}周前`
  } else {
    return formatDate(timestamp)
  }
}

// 防抖函数
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// 节流函数
export function throttle(func, limit) {
  let inThrottle
  return function () {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// 深拷贝
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (typeof obj === 'object') {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

// 生成唯一ID
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// 验证手机号
export function validatePhone(phone) {
  const reg = /^1[3-9]\d{9}$/
  return reg.test(phone)
}

// 验证邮箱
export function validateEmail(email) {
  const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return reg.test(email)
}

// 格式化金额
export function formatMoney(amount) {
  return (amount || 0).toFixed(2)
}

// 获取今天的开始和结束时间戳
export function getTodayRange() {
  const today = new Date()
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  const end = start + 24 * 60 * 60 * 1000 - 1
  return { start, end }
}

// 获取本周的开始和结束时间戳
export function getWeekRange() {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - dayOfWeek).getTime()
  const end = start + 7 * 24 * 60 * 60 * 1000 - 1
  return { start, end }
}

// 获取本月的开始和结束时间戳
export function getMonthRange() {
  const today = new Date()
  const start = new Date(today.getFullYear(), today.getMonth(), 1).getTime()
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999).getTime()
  return { start, end }
}

// 显示提示信息
export function showToast(title, icon = 'none', duration = 2000) {
  uni.showToast({
    title,
    icon,
    duration
  })
}

// 显示确认对话框
export function showConfirm(content, title = '提示') {
  return new Promise((resolve) => {
    uni.showModal({
      title,
      content,
      success: (res) => {
        resolve(res.confirm)
      }
    })
  })
}

// 显示加载中
export function showLoading(title = '加载中...') {
  uni.showLoading({
    title,
    mask: true
  })
}

// 隐藏加载中
export function hideLoading() {
  uni.hideLoading()
}

// 存储相关工具函数
export function setStorage(key, value) {
  try {
    uni.setStorageSync(key, JSON.stringify(value))
    return true
  } catch (e) {
    console.error('存储失败:', e)
    return false
  }
}

export function getStorage(key, defaultValue = null) {
  try {
    const value = uni.getStorageSync(key)
    return value ? JSON.parse(value) : defaultValue
  } catch (e) {
    console.error('读取存储失败:', e)
    return defaultValue
  }
}

export function removeStorage(key) {
  try {
    uni.removeStorageSync(key)
    return true
  } catch (e) {
    console.error('删除存储失败:', e)
    return false
  }
}

// 网络请求工具
export function request(options) {
  return new Promise((resolve, reject) => {
    uni.request({
      ...options,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data)
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

// 图片选择和上传
export function chooseImage(count = 1) {
  return new Promise((resolve, reject) => {
    uni.chooseImage({
      count,
      success: (res) => {
        resolve(res.tempFilePaths)
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

// 页面跳转工具
export function navigateTo(url, params = {}) {
  const query = Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&')
  const fullUrl = query ? `${url}?${query}` : url
  uni.navigateTo({ url: fullUrl })
}

export function redirectTo(url, params = {}) {
  const query = Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&')
  const fullUrl = query ? `${url}?${query}` : url
  uni.redirectTo({ url: fullUrl })
}

// 获取系统信息
export function getSystemInfo() {
  return new Promise((resolve) => {
    uni.getSystemInfo({
      success: (res) => {
        resolve(res)
      }
    })
  })
}

// 数组工具函数
export function arrayToTree(arr, parentId = null, idKey = 'id', parentKey = 'parentId', childrenKey = 'children') {
  return arr
    .filter(item => item[parentKey] === parentId)
    .map(item => ({
      ...item,
      [childrenKey]: arrayToTree(arr, item[idKey], idKey, parentKey, childrenKey)
    }))
}

// 字符串工具函数
export function truncateText(text, maxLength, suffix = '...') {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + suffix
}

// 数字格式化
export function formatNumber(num) {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

// 颜色工具
export function hexToRgba(hex, alpha = 1) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// 计算两个日期之间的天数差
export function daysBetween(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000
  const firstDate = new Date(date1)
  const secondDate = new Date(date2)
  return Math.round(Math.abs((firstDate - secondDate) / oneDay))
}// 生日相关工具函数

// 计算年龄
export function calculateAge(birthday) {
  const today = new Date()
  const birthDate = new Date(birthday)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

// 计算距离下次生日的天数
export function getDaysUntilBirthday(birthday) {
  const today = new Date()
  const birthDate = new Date(birthday)

  // 设置今年的生日
  const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())

  // 如果今年生日已过，计算明年的生日
  if (thisYearBirthday < today) {
    thisYearBirthday.setFullYear(today.getFullYear() + 1)
  }

  // 计算天数差
  const timeDiff = thisYearBirthday.getTime() - today.getTime()
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))

  return daysDiff
}

// 获取下次生日日期
export function getNextBirthday(birthday) {
  const today = new Date()
  const birthDate = new Date(birthday)

  const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())

  if (thisYearBirthday < today) {
    thisYearBirthday.setFullYear(today.getFullYear() + 1)
  }

  return thisYearBirthday
}

// 检查是否需要生日提醒
export function checkBirthdayReminders(birthdayRecords) {
  const today = new Date()
  const reminders = []

  birthdayRecords.forEach(record => {
    const daysUntil = getDaysUntilBirthday(record.birthday)
    const reminderDays = record.reminderSettings || [30, 7, 3, 1, 0]

    reminderDays.forEach(days => {
      if (daysUntil === days) {
        const age = calculateAge(record.birthday) + (daysUntil === 0 ? 1 : 0)
        reminders.push({
          recordId: record.recordId,
          name: record.name,
          relationship: record.relationship,
          daysUntil,
          age,
          birthday: record.birthday,
          message: getBirthdayReminderMessage(record.name, daysUntil, age)
        })
      }
    })
  })

  return reminders
}

// 生成生日提醒消息
export function getBirthdayReminderMessage(name, daysUntil, age) {
  if (daysUntil === 0) {
    return `🎉 今天是${name}的${age}岁生日！记得送上祝福哦~`
  } else if (daysUntil === 1) {
    return `🎂 明天是${name}的${age}岁生日，记得准备礼物！`
  } else if (daysUntil <= 7) {
    return `🎈 还有${daysUntil}天就是${name}的${age}岁生日了`
  } else {
    return `📅 ${name}的${age}岁生日还有${daysUntil}天`
  }
}

// 获取星座
export function getZodiacSign(birthday) {
  const date = new Date(birthday)
  const month = date.getMonth() + 1
  const day = date.getDate()

  const zodiacSigns = [
    { name: '水瓶座', start: [1, 20], end: [2, 18], emoji: '♒' },
    { name: '双鱼座', start: [2, 19], end: [3, 20], emoji: '♓' },
    { name: '白羊座', start: [3, 21], end: [4, 19], emoji: '♈' },
    { name: '金牛座', start: [4, 20], end: [5, 20], emoji: '♉' },
    { name: '双子座', start: [5, 21], end: [6, 21], emoji: '♊' },
    { name: '巨蟹座', start: [6, 22], end: [7, 22], emoji: '♋' },
    { name: '狮子座', start: [7, 23], end: [8, 22], emoji: '♌' },
    { name: '处女座', start: [8, 23], end: [9, 22], emoji: '♍' },
    { name: '天秤座', start: [9, 23], end: [10, 23], emoji: '♎' },
    { name: '天蝎座', start: [10, 24], end: [11, 22], emoji: '♏' },
    { name: '射手座', start: [11, 23], end: [12, 21], emoji: '♐' },
    { name: '摩羯座', start: [12, 22], end: [1, 19], emoji: '♑' }
  ]

  for (const sign of zodiacSigns) {
    const [startMonth, startDay] = sign.start
    const [endMonth, endDay] = sign.end

    if (
      (month === startMonth && day >= startDay) ||
      (month === endMonth && day <= endDay) ||
      (startMonth > endMonth && (month === startMonth || month === endMonth))
    ) {
      return sign
    }
  }

  return { name: '未知', emoji: '❓' }
}

// 格式化生日显示
export function formatBirthdayDisplay(birthday, calendarType = 'solar') {
  const date = new Date(birthday)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  if (calendarType === 'lunar') {
    return `农历${month}月${day}日`
  }

  return `${month}月${day}日`
}

// 检查今日生日
export function getTodayBirthdays(birthdayRecords) {
  return birthdayRecords.filter(record => {
    return getDaysUntilBirthday(record.birthday) === 0
  })
}

// 获取本月生日
export function getThisMonthBirthdays(birthdayRecords) {
  const today = new Date()
  const currentMonth = today.getMonth()

  return birthdayRecords.filter(record => {
    const birthDate = new Date(record.birthday)
    return birthDate.getMonth() === currentMonth
  }).sort((a, b) => {
    const dateA = new Date(a.birthday)
    const dateB = new Date(b.birthday)
    return dateA.getDate() - dateB.getDate()
  })
}