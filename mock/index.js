// Mock数据统一导出

// 生成唯一ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// 生成指定天数前的随机时间戳
function getTimestampDaysAgo(daysAgo, hourRange = [0, 23]) {
  const now = new Date()
  const targetDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
  const randomHour = Math.floor(Math.random() * (hourRange[1] - hourRange[0] + 1)) + hourRange[0]
  const randomMinute = Math.floor(Math.random() * 60)

  targetDate.setHours(randomHour, randomMinute, 0, 0)
  return targetDate.getTime()
}

// 生成随机时间戳（最近指定天数内）
function getRandomTimestamp(maxDaysAgo = 30) {
  const daysAgo = Math.floor(Math.random() * maxDaysAgo)
  return getTimestampDaysAgo(daysAgo)
}

// 心情类型数组
const moodTypes = ['happy', 'sad', 'excited', 'calm', 'anxious', 'tired', 'angry', 'grateful']
const moodDescriptions = {
  happy: ['今天心情特别好！', '工作顺利，开心', '收到好消息了', '和朋友聚餐很开心', '天气不错，心情愉悦'],
  sad: ['今天有点难过', '工作不太顺利', '想家了', '看了悲伤的电影', '心情低落'],
  excited: ['太兴奋了！', '有好事发生', '期待已久的事情实现了', '收到惊喜', '心情激动'],
  calm: ['今天很平静', '心情很安宁', '冥想后感觉很好', '在公园散步', '读书时光'],
  anxious: ['有点焦虑', '担心明天的会议', '压力有点大', '紧张的一天', '心情不安'],
  tired: ['今天好累', '工作太忙了', '熬夜了', '身心疲惫', '需要休息'],
  angry: ['今天很生气', '遇到不公平的事', '心情烦躁', '被人误解了', '交通堵塞'],
  grateful: ['感恩的一天', '感谢朋友的帮助', '珍惜现在的生活', '心怀感激', '被温暖感动']
}

// 奶茶数据
const milkTeaData = [
  { name: '珍珠奶茶', shops: ['喜茶', '奈雪', '一点点', 'CoCo'], prices: [25, 28, 22, 20] },
  { name: '芝士莓莓', shops: ['喜茶', '奈雪'], prices: [32, 35] },
  { name: '黑糖珍珠鲜奶', shops: ['鹿角巷', '老虎堂'], prices: [28, 26] },
  { name: '烤奶茶', shops: ['茶颜悦色', '文和友'], prices: [18, 20] },
  { name: '芋泥波波茶', shops: ['奈雪', '喜茶'], prices: [30, 28] },
  { name: '柠檬茶', shops: ['一点点', 'CoCo', '茶百道'], prices: [15, 18, 16] },
  { name: '抹茶拿铁', shops: ['星巴克', '瑞幸'], prices: [35, 28] },
  { name: '红豆奶茶', shops: ['CoCo', '一点点'], prices: [22, 20] }
]

const sugarTypes = ['none', 'low', 'half', 'normal', 'full']
const iceTypes = ['hot', 'none', 'less', 'normal', 'more']

// 记账数据
const expenseCategories = ['餐饮', '交通', '购物', '娱乐', '医疗', '教育', '住房', '其他']
const incomeCategories = ['工资', '兼职', '红包', '投资', '其他']
const payTypes = ['wechat', 'alipay', 'cash', 'card']

const expenseItems = {
  餐饮: ['早餐', '午餐', '晚餐', '下午茶', '夜宵', '聚餐', '外卖', '买菜'],
  交通: ['地铁', '公交', '打车', '加油', '停车费', '高铁票', '机票', '共享单车'],
  购物: ['衣服', '鞋子', '化妆品', '数码产品', '书籍', '日用品', '礼物', '零食'],
  娱乐: ['电影票', 'KTV', '游戏充值', '健身房', '旅游', '演唱会', '展览', '桌游'],
  医疗: ['看病', '买药', '体检', '牙科', '眼科', '保健品', '按摩', '理疗'],
  教育: ['培训费', '书本费', '考试费', '网课', '学习用品', '辅导班', '证书费', '资料费'],
  住房: ['房租', '水电费', '网费', '物业费', '维修费', '家具', '装修', '搬家费'],
  其他: ['红包', '捐款', '罚款', '手续费', '保险', '税费', '维修', '杂费']
}

// 待办事项数据
const todoItems = [
  '完成工作报告', '准备会议材料', '回复邮件', '整理桌面', '买生活用品',
  '预约体检', '缴纳水电费', '学习新技能', '锻炼身体', '读书',
  '整理照片', '备份数据', '清理衣柜', '联系朋友', '规划旅行',
  '写日记', '冥想', '做饭', '洗衣服', '打扫卫生'
]

// 随笔内容
const essayContents = [
  '今天是个特别的日子，阳光明媚，心情也格外舒畅。走在街上，看到路边的花开得正艳，忍不住停下脚步欣赏。生活中总有这样的小美好，让人感到温暖。',
  '最近在思考人生的意义，觉得每个人都有自己的使命和价值。重要的不是我们走得多快，而是我们是否在正确的道路上。慢下来，感受生活的美好。',
  '今天读了一本很棒的书，书中的一句话深深打动了我："人生最重要的不是所站的位置，而是所朝的方向。"这让我重新审视了自己的目标和方向。',
  '和老朋友聊天，回忆起大学时光，那些青春岁月真是美好。虽然现在各自忙碌，但友谊依然深厚。珍惜身边的每一个人，珍惜每一份真挚的感情。',
  '今天尝试了一道新菜，虽然第一次做得不太成功，但过程很有趣。生活就是这样，充满了尝试和探索，每一次经历都是成长。',
  '晚上散步时看到满天繁星，突然觉得自己很渺小，但同时也感到很幸运。能够在这个美丽的世界上生活，本身就是一种恩赐。',
  '工作中遇到了挑战，但通过努力最终解决了问题。这让我明白，困难并不可怕，可怕的是失去面对困难的勇气。每一次挑战都是成长的机会。',
  '今天帮助了一个陌生人，虽然只是举手之劳，但看到对方感激的笑容，心里很温暖。善良是一种选择，也是一种力量。'
]

// 生成丰富的mock数据
function generateRichMockData() {
  const records = []

  // 生成最近60天的数据
  for (let day = 0; day < 60; day++) {
    const recordsPerDay = Math.floor(Math.random() * 5) + 1 // 每天1-5条记录

    for (let i = 0; i < recordsPerDay; i++) {
      const recordType = Math.random()
      let record = {
        recordId: generateId(),
        createTime: getTimestampDaysAgo(day, [7, 23]),
        updateTime: getTimestampDaysAgo(day, [7, 23])
      }

      if (recordType < 0.25) {
        // 心情记录 (25%)
        const moodType = moodTypes[Math.floor(Math.random() * moodTypes.length)]
        const descriptions = moodDescriptions[moodType]
        record = {
          ...record,
          moduleType: 'mood',
          moodType,
          description: descriptions[Math.floor(Math.random() * descriptions.length)],
          tags: ['心情', moodType]
        }
      } else if (recordType < 0.4) {
        // 奶茶记录 (15%)
        const teaData = milkTeaData[Math.floor(Math.random() * milkTeaData.length)]
        const shopIndex = Math.floor(Math.random() * teaData.shops.length)
        record = {
          ...record,
          moduleType: 'milkTea',
          name: teaData.name,
          shop: teaData.shops[shopIndex],
          sugar: sugarTypes[Math.floor(Math.random() * sugarTypes.length)],
          ice: iceTypes[Math.floor(Math.random() * iceTypes.length)],
          price: teaData.prices[shopIndex] + (Math.random() * 6 - 3), // 价格浮动
          remark: Math.random() > 0.7 ? '味道不错' : '',
          tags: ['奶茶', teaData.shops[shopIndex]]
        }
      } else if (recordType < 0.65) {
        // 记账记录 (25%)
        const isIncome = Math.random() < 0.2 // 20%概率是收入
        const type = isIncome ? 'income' : 'expense'
        const categories = isIncome ? incomeCategories : expenseCategories
        const category = categories[Math.floor(Math.random() * categories.length)]

        let amount, remark
        if (isIncome) {
          amount = Math.floor(Math.random() * 8000) + 2000 // 收入2000-10000
          remark = category === '工资' ? '月度工资' : `${category}收入`
        } else {
          const items = expenseItems[category]
          const item = items[Math.floor(Math.random() * items.length)]
          amount = Math.floor(Math.random() * 500) + 10 // 支出10-510
          remark = item
        }

        record = {
          ...record,
          moduleType: 'account',
          type,
          amount: parseFloat(amount.toFixed(2)),
          category,
          payType: payTypes[Math.floor(Math.random() * payTypes.length)],
          remark,
          tags: [category, type]
        }
      } else if (recordType < 0.8) {
        // 待办事项 (15%)
        const content = todoItems[Math.floor(Math.random() * todoItems.length)]
        const priority = ['low', 'mid', 'high'][Math.floor(Math.random() * 3)]
        const isCompleted = Math.random() < 0.6 // 60%概率已完成

        record = {
          ...record,
          moduleType: 'todo',
          content,
          priority,
          deadline: record.createTime + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000,
          isCompleted,
          completeRemark: isCompleted && Math.random() > 0.5 ? '已完成' : '',
          tags: ['待办', priority]
        }
      } else if (recordType < 0.9) {
        // 体重记录 (10%)
        const baseWeight = 65 + (Math.random() * 20 - 10) // 55-75kg范围
        record = {
          ...record,
          moduleType: 'weight',
          weightValue: parseFloat((baseWeight + (Math.random() * 2 - 1)).toFixed(1)),
          measureTime: record.createTime,
          remark: ['早晨空腹测量', '晚上测量', '运动后测量', '饭后测量'][Math.floor(Math.random() * 4)],
          tags: ['健康', '体重']
        }
      } else {
        // 随笔记录 (10%)
        record = {
          ...record,
          moduleType: 'essay',
          content: essayContents[Math.floor(Math.random() * essayContents.length)],
          tags: ['随笔', '感悟']
        }
      }

      records.push(record)
    }
  }

  return records
}

// 生成生日记录
const mockBirthdayRecords = [
  {
    recordId: generateId(),
    moduleType: 'birthday',
    name: '张小明',
    birthday: '1995-03-15',
    relationship: 'friend',
    phone: '138****1234',
    address: '北京市朝阳区',
    notes: '大学同学，喜欢打篮球',
    reminderSettings: [30, 7, 3, 1, 0],
    createTime: getRandomTimestamp(60),
    updateTime: getRandomTimestamp(60),
    tags: ['朋友', '同学']
  },
  {
    recordId: generateId(),
    moduleType: 'birthday',
    name: '李小红',
    birthday: '1992-12-25',
    relationship: 'family',
    phone: '139****5678',
    address: '上海市浦东新区',
    notes: '表妹，在上海工作',
    reminderSettings: [30, 7, 3, 2, 1, 0],
    createTime: getRandomTimestamp(60),
    updateTime: getRandomTimestamp(60),
    tags: ['家人', '表妹']
  },
  {
    recordId: generateId(),
    moduleType: 'birthday',
    name: '王大伟',
    birthday: '1988-07-08',
    relationship: 'colleague',
    phone: '137****9012',
    address: '广州市天河区',
    notes: '部门同事，技术很厉害',
    reminderSettings: [7, 1, 0],
    createTime: getRandomTimestamp(60),
    updateTime: getRandomTimestamp(60),
    tags: ['同事', '技术']
  },
  {
    recordId: generateId(),
    moduleType: 'birthday',
    name: '刘美丽',
    birthday: '1996-01-20',
    relationship: 'lover',
    phone: '136****3456',
    address: '深圳市南山区',
    notes: '我的女朋友，最重要的人',
    reminderSettings: [30, 14, 7, 3, 2, 1, 0],
    createTime: getRandomTimestamp(60),
    updateTime: getRandomTimestamp(60),
    tags: ['恋人', '重要']
  },
  {
    recordId: generateId(),
    moduleType: 'birthday',
    name: '陈老师',
    birthday: '1980-09-10',
    relationship: 'other',
    phone: '135****7890',
    address: '杭州市西湖区',
    notes: '高中班主任，教师节要记得问候',
    reminderSettings: [7, 1, 0],
    createTime: getRandomTimestamp(60),
    updateTime: getRandomTimestamp(60),
    tags: ['老师', '恩师']
  },
  {
    recordId: generateId(),
    moduleType: 'birthday',
    name: '小猫咪',
    birthday: '2020-05-20',
    relationship: 'other',
    phone: '',
    address: '家里',
    notes: '我的宠物猫，很可爱',
    reminderSettings: [3, 1, 0],
    createTime: getRandomTimestamp(60),
    updateTime: getRandomTimestamp(60),
    tags: ['宠物', '猫咪']
  }
]

// 合并所有记录
const mockRecords = [
  ...generateRichMockData(),
  ...mockBirthdayRecords
].sort((a, b) => b.createTime - a.createTime) // 按时间倒序排列

// 简化的用户信息
const mockUserInfo = {
  userId: generateId(),
  nickname: '奶茶爱好者',
  avatar: '/static/default-avatar.png',
  phone: '138****8888',
  registerTime: Date.now() - 60 * 24 * 60 * 60 * 1000,
  lastLoginTime: Date.now() - 2 * 60 * 60 * 1000
}

// 初始化mock数据的函数
export function initMockData() {
  // 检查是否已有本地数据
  const hasLocalData = uni.getStorageSync('records') || uni.getStorageSync('userInfo')

  if (!hasLocalData) {
    // 如果没有本地数据，则使用mock数据初始化
    try {
      // 存储记录数据
      uni.setStorageSync('records', JSON.stringify(mockRecords))

      // 存储用户信息
      uni.setStorageSync('userInfo', JSON.stringify(mockUserInfo))

      console.log(`Mock数据初始化成功，共生成${mockRecords.length}条记录`)
      return true
    } catch (error) {
      console.error('Mock数据初始化失败:', error)
      return false
    }
  }

  console.log('本地已有数据，跳过mock数据初始化')
  return true
}

// 清除所有mock数据
export function clearMockData() {
  try {
    uni.removeStorageSync('records')
    uni.removeStorageSync('userInfo')
    console.log('Mock数据清除成功')
    return true
  } catch (error) {
    console.error('Mock数据清除失败:', error)
    return false
  }
}

// 重置mock数据
export function resetMockData() {
  clearMockData()
  return initMockData()
}

// 生成额外的测试数据
export function generateMoreTestData(days = 30) {
  const existingRecords = JSON.parse(uni.getStorageSync('records') || '[]')
  const newRecords = generateRichMockData()

  const allRecords = [...existingRecords, ...newRecords]
    .sort((a, b) => b.createTime - a.createTime)

  uni.setStorageSync('records', JSON.stringify(allRecords))
  console.log(`已添加${newRecords.length}条新记录`)
  return allRecords.length
}

export default {
  initMockData,
  clearMockData,
  resetMockData,
  generateMoreTestData,
  mockRecords,
  mockUserInfo,
  mockBirthdayRecords
}