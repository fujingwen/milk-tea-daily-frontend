import { CHINESE_HOLIDAYS, MODULE_TYPES } from './constants'

/**
 * 提醒服务 - 处理各种提醒逻辑
 */
class ReminderService {
  /**
   * 获取30天内的节日提醒
   * @returns {Array} 节日提醒列表
   */
  getUpcomingHolidays() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const currentYear = today.getFullYear()
    const reminders = []

    CHINESE_HOLIDAYS.forEach(holiday => {
      // 处理农历节日（需要指定年份）
      if (holiday.type === 'lunar' && holiday.year) {
        if (holiday.year !== currentYear && holiday.year !== currentYear + 1) {
          return
        }
      }

      // 计算节日日期
      let holidayDate
      if (holiday.type === 'lunar' && holiday.year) {
        holidayDate = new Date(`${holiday.year}-${holiday.date}`)
      } else {
        // 公历节日，先尝试今年
        holidayDate = new Date(`${currentYear}-${holiday.date}`)
        // 如果今年已过，计算明年
        if (holidayDate < today) {
          holidayDate = new Date(`${currentYear + 1}-${holiday.date}`)
        }
      }

      holidayDate.setHours(0, 0, 0, 0)

      // 计算天数差
      const timeDiff = holidayDate.getTime() - today.getTime()
      const daysUntil = Math.ceil(timeDiff / (1000 * 3600 * 24))

      // 只显示30天内的节日
      if (daysUntil >= 0 && daysUntil <= 30) {
        reminders.push({
          name: holiday.name,
          date: holidayDate,
          daysUntil,
          holiday: holiday.holiday,
          emoji: holiday.emoji,
          message: this.getHolidayMessage(holiday.name, daysUntil, holiday.holiday)
        })
      }
    })

    // 按天数排序
    return reminders.sort((a, b) => a.daysUntil - b.daysUntil)
  }

  /**
   * 生成节日提醒消息
   */
  getHolidayMessage(name, daysUntil, isHoliday) {
    const holidayText = isHoliday ? '（放假）' : ''

    if (daysUntil === 0) {
      return `🎉 今天是${name}${holidayText}！`
    } else if (daysUntil === 1) {
      return `📅 明天是${name}${holidayText}`
    } else if (daysUntil <= 7) {
      return `📆 还有${daysUntil}天就是${name}${holidayText}`
    } else {
      return `🗓️ ${name}${holidayText}还有${daysUntil}天`
    }
  }

  /**
   * 获取30天内的生日提醒
   * @param {Array} birthdayRecords 生日记录列表
   * @returns {Array} 生日提醒列表
   */
  getUpcomingBirthdays(birthdayRecords) {
    if (!birthdayRecords || birthdayRecords.length === 0) return []

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const reminders = []

    birthdayRecords.forEach(record => {
      const daysUntil = this.getDaysUntilBirthday(record.birthday)

      // 只显示30天内的生日
      if (daysUntil >= 0 && daysUntil <= 30) {
        const age = this.calculateAge(record.birthday) + (daysUntil === 0 ? 1 : 0)
        reminders.push({
          recordId: record.recordId,
          name: record.name,
          relationship: record.relationship,
          daysUntil,
          age,
          birthday: record.birthday,
          message: this.getBirthdayMessage(record.name, daysUntil, age)
        })
      }
    })

    return reminders.sort((a, b) => a.daysUntil - b.daysUntil)
  }

  /**
   * 计算距离下次生日的天数
   */
  getDaysUntilBirthday(birthday) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const birthDate = new Date(birthday)

    const thisYearBirthday = new Date(
      today.getFullYear(),
      birthDate.getMonth(),
      birthDate.getDate()
    )

    if (thisYearBirthday < today) {
      thisYearBirthday.setFullYear(today.getFullYear() + 1)
    }

    const timeDiff = thisYearBirthday.getTime() - today.getTime()
    return Math.ceil(timeDiff / (1000 * 3600 * 24))
  }

  /**
   * 计算年龄
   */
  calculateAge(birthday) {
    const today = new Date()
    const birthDate = new Date(birthday)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
  }

  /**
   * 生成生日提醒消息
   */
  getBirthdayMessage(name, daysUntil, age) {
    if (daysUntil === 0) {
      return `🎉 今天是${name}的${age}岁生日！`
    } else if (daysUntil === 1) {
      return `🎂 明天是${name}的${age}岁生日`
    } else if (daysUntil <= 7) {
      return `🎈 ${daysUntil}天后是${name}的${age}岁生日`
    } else {
      return `📅 ${name}的${age}岁生日还有${daysUntil}天`
    }
  }

  /**
   * 获取未完成的待办事项
   * @param {Array} records 所有记录
   * @returns {Array} 待办事项列表
   */
  getPendingTodos(records) {
    if (!records || records.length === 0) return []

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return records
      .filter(record => {
        return record.moduleType === MODULE_TYPES.TODO && !record.isCompleted
      })
      .map(record => {
        let urgency = 'normal'
        let message = record.content

        if (record.deadline) {
          const deadline = new Date(record.deadline)
          deadline.setHours(0, 0, 0, 0)
          const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 3600 * 24))

          if (daysUntil < 0) {
            urgency = 'overdue'
            message = `⚠️ 已逾期${Math.abs(daysUntil)}天`
          } else if (daysUntil === 0) {
            urgency = 'today'
            message = '📌 今天截止'
          } else if (daysUntil <= 3) {
            urgency = 'urgent'
            message = `⏰ ${daysUntil}天后截止`
          } else {
            message = `📅 ${daysUntil}天后截止`
          }
        }

        return {
          recordId: record.recordId,
          content: record.content,
          priority: record.priority,
          deadline: record.deadline,
          urgency,
          message
        }
      })
      .sort((a, b) => {
        // 按紧急程度排序
        const urgencyOrder = { overdue: 0, today: 1, urgent: 2, normal: 3 }
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
      })
  }

  /**
   * 获取姨妈期提醒
   * @param {Array} records 所有记录
   * @returns {Object|null} 姨妈期提醒信息
   */
  getMenstruationReminder(records) {
    if (!records || records.length === 0) return null

    // 获取最近的姨妈记录
    const menstruationRecords = records
      .filter(record => record.moduleType === MODULE_TYPES.MENSTRUATION)
      .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))

    if (menstruationRecords.length === 0) return null

    const lastRecord = menstruationRecords[0]
    const lastStartDate = new Date(lastRecord.startDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 计算平均周期（默认28天）
    let avgCycle = 28
    if (menstruationRecords.length >= 2) {
      let totalDays = 0
      for (let i = 0; i < Math.min(menstruationRecords.length - 1, 6); i++) {
        const current = new Date(menstruationRecords[i].startDate)
        const previous = new Date(menstruationRecords[i + 1].startDate)
        totalDays += Math.round((current - previous) / (1000 * 3600 * 24))
      }
      avgCycle = Math.round(totalDays / Math.min(menstruationRecords.length - 1, 6))
    }

    // 预测下次姨妈日期
    const nextPeriodDate = new Date(lastStartDate)
    nextPeriodDate.setDate(nextPeriodDate.getDate() + avgCycle)

    const daysUntil = Math.ceil((nextPeriodDate.getTime() - today.getTime()) / (1000 * 3600 * 24))

    // 判断当前状态
    let status = 'normal'
    let message = ''
    let emoji = '🌸'

    // 检查是否在经期中
    if (lastRecord.endDate) {
      const endDate = new Date(lastRecord.endDate)
      if (today >= lastStartDate && today <= endDate) {
        status = 'ongoing'
        const dayInPeriod = Math.ceil((today - lastStartDate) / (1000 * 3600 * 24)) + 1
        message = `经期第${dayInPeriod}天，注意保暖休息`
        emoji = '🩸'
      }
    } else if (today >= lastStartDate) {
      const daysSinceStart = Math.ceil((today - lastStartDate) / (1000 * 3600 * 24))
      if (daysSinceStart <= 7) {
        status = 'ongoing'
        message = `经期第${daysSinceStart + 1}天，注意保暖休息`
        emoji = '🩸'
      }
    }

    // 如果不在经期中，显示预测信息
    if (status === 'normal') {
      if (daysUntil <= 0) {
        status = 'expected'
        message = '预计今天来姨妈，注意准备'
        emoji = '⚠️'
      } else if (daysUntil <= 3) {
        status = 'soon'
        message = `预计${daysUntil}天后来姨妈，提前准备`
        emoji = '📅'
      } else if (daysUntil <= 7) {
        status = 'upcoming'
        message = `预计${daysUntil}天后来姨妈`
        emoji = '🗓️'
      } else {
        return null // 超过7天不显示提醒
      }
    }

    return {
      status,
      message,
      emoji,
      daysUntil,
      nextPeriodDate,
      avgCycle,
      lastStartDate
    }
  }

  /**
   * 获取今日语录
   * @returns {String} 今日语录
   */
  getDailyQuote() {
    const quotes = [
      "今天的努力是明天成功的基石，坚持下去！",
      "每一个小小的进步都值得庆祝，你做得很好。",
      "困难只是成长路上的垫脚石，勇敢面对吧。",
      "相信自己的能力，你比想象中更强大。",
      "保持好奇心，世界还有很多美好等你发现。",
      "善待自己，你值得拥有所有的美好。",
      "今天的选择决定明天的你，选择积极向上。",
      "不要害怕犯错，错误是学习的最好老师。",
      "保持感恩的心，生活会回馈给你更多惊喜。",
      "做自己喜欢的事，成为自己想成为的人。"
    ];

    // 根据日期生成随机索引，确保同一天返回相同的语录
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    const hash = this.simpleHash(dateString);
    const index = hash % quotes.length;

    return quotes[index];
  }

  /**
   * 简单哈希函数
   * @param {String} str
   * @returns {Number}
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash);
  }

  /**
   * 获取天气信息（模拟数据，实际需要接入天气API）
   * @returns {Object} 天气信息
   */
  async getWeatherInfo() {
    // 模拟天气数据，实际应用中需要接入天气API
    const weatherTypes = [
      { type: 'sunny', emoji: '☀️', desc: '晴', temp: '25°C', tip: '天气晴朗，适合外出' },
      { type: 'cloudy', emoji: '⛅', desc: '多云', temp: '22°C', tip: '多云天气，温度适宜' },
      { type: 'rainy', emoji: '🌧️', desc: '小雨', temp: '18°C', tip: '记得带伞，注意防滑' },
      { type: 'overcast', emoji: '☁️', desc: '阴', temp: '20°C', tip: '阴天，适合室内活动' }
    ]

    // 随机返回一种天气（实际应该调用天气API）
    const randomIndex = Math.floor(Math.random() * weatherTypes.length)
    return weatherTypes[randomIndex]
  }

  /**
   * 获取所有今日提醒
   * @param {Array} records 所有记录
   * @param {Array} birthdayRecords 生日记录
   * @returns {Object} 所有提醒信息
   */
  async getAllReminders(records, birthdayRecords) {
    const [weather, holidays, birthdays, todos, menstruation] = await Promise.all([
      this.getWeatherInfo(),
      Promise.resolve(this.getUpcomingHolidays()),
      Promise.resolve(this.getUpcomingBirthdays(birthdayRecords)),
      Promise.resolve(this.getPendingTodos(records)),
      Promise.resolve(this.getMenstruationReminder(records))
    ])

    return {
      weather,
      holidays: holidays.slice(0, 3), // 最多显示3个节日
      birthdays: birthdays.slice(0, 3), // 最多显示3个生日
      todos: todos.slice(0, 5), // 最多显示5个待办
      menstruation,
      hasReminders: holidays.length > 0 || birthdays.length > 0 || todos.length > 0 || menstruation !== null
    }
  }
}

export default new ReminderService()