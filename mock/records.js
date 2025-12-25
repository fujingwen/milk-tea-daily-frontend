// 记录数据mock

// 生成唯一ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// 生成随机时间戳（最近30天内）
function getRandomTimestamp() {
  const now = Date.now()
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000
  return Math.floor(Math.random() * (now - thirtyDaysAgo)) + thirtyDaysAgo
}

// 心情记录mock数据
export const moodRecords = [
  {
    recordId: generateId(),
    moduleType: 'mood',
    moodType: 'happy',
    description: '今天工作顺利，心情很好！',
    createTime: getRandomTimestamp(),
    updateTime: getRandomTimestamp(),
    tags: ['工作', '开心']
  },
  {
    recordId: generateId(),
    moduleType: 'mood',
    moodType: 'sad',
    description: '下雨天总是让人感到忧郁',
    createTime: getRandomTimestamp(),
    updateTime: getRandomTimestamp(),
    tags: ['天气', '忧郁']
  },
  {
    recordId: generateId(),
    moduleType: 'mood',
    moodType: 'excited',
    description: '收到了心仪已久的礼物，太兴奋了！',
    createTime: getRandomTimestamp(),
    updateTime: getRandomTimestamp(),
    tags: ['礼物', '惊喜']
  },
  {
    recordId: generateId(),
    moduleType: 'mood',
    moodType: 'calm',
    description: '在公园里散步，感觉很平静',
    createTime: getRandomTimestamp(),
    updateTime: getRandomTimestamp(),
    tags: ['散步', '公园']
  }
]

// 体重记录mock数据
export const weightRecords = [
  {
    recordId: generateId(),
    moduleType: 'weight',
    weightValue: 65.5,
    measureTime: getRandomTimestamp(),
    remark: '早晨空腹测量',
    createTime: getRandomTimestamp(),
    updateTime: getRandomTimestamp()
  },
  {
    recordId: generateId(),
    moduleType: 'weight',
    weightValue: 66.2,
    measureTime: getRandomTimestamp(),
    remark: '晚饭后测量',
    createTime: getRandomTimestamp(),
    updateTime: getRandomTimestamp()
  },
  {
    recordId: generateId(),
    moduleType: 'weight',
    weightValue: 64.8,
    measureTime: getRandomTimestamp(),
    remark: '运动后测量',
    createTime: getRandomTimestamp(),
    updateTime: getRandomTimestamp()
  }
]

// 奶茶记录mock数据
export const milkTeaRecords = [
  {
    recordId: generateId(),
    moduleType: 'milkTea',
    name: '珍珠奶茶',
    shop: '喜茶',
    sugar: 'half',
    ice: 'normal',
    price: 28,
    remark: '珍珠很Q弹',
    createTime: getRandomTimestamp(),
    updateTime: getRandomTimestamp(),
    tags: ['珍珠', '经典']
  },
  {
    recordId: generateId(),
    moduleType: 'milkTea',
    name: '芝士莓莓',
    shop: '奈雪的茶',
    sugar: 'low',
    ice: 'less',
    price: 32,
    remark: '芝士味很浓郁',
    createTime: getRandomTimestamp(),
    updateTime: getRandomTimestamp(),
    tags: ['芝士', '草莓']
  },
  {
    recordId: generateId(),
    moduleType: 'milkTea',
    name: '黑糖珍珠鲜奶',
    shop: '鹿角巷',
    sugar: 'normal',
    ice: 'normal',
    price: 25,
    remark: '黑糖香味十足',
    createTime: getRandomTimestamp(),
    updateTime: getRandomTimestamp(),
    tags: ['黑糖', '鲜奶']
  }
]

// 记账记录mock数据
export const accountRecords = [
  {
    recordId: generateId(),
    moduleType: 'account',
    type: 'expense',
    amount: 35.8,
    category: '餐饮',
    payType: 'wechat',
    remark: '午餐 - 麻辣烫',
    createTime: getRandomTimestamp(),
    updateTime: getRandomTimestamp(),
    tags: ['午餐', '麻辣烫']
  },
  {
    recordId: generateId(),
    moduleType: 'account',
    type: 'income',
    amount: 5000,
    category: '工资',
    payType: 'bank',
    remark: '月度工资',
    createTime: getRandomTimestamp(),
    updateTime: getRandomTimestamp(),
    tags: ['工资', '收入']
  },
  {
    recordId: generateId(),
    moduleType: 'account',
    type: 'expense',
    amount: 128,
    category: '交通',
    payType: 'alipay',
    remark: '打车费用',
    createTime: getRandomTimestamp(),
    updateTime: getRandomTimestamp(),
    tags: ['打车', '交通']
  },
  {
    recordId: generateId(),
    moduleType: 'account',
    type: 'expense',
    amount: 299,
    category: '购物',
    payType: 'credit',
    remark: '买了一件T恤',
    createTime: getRandomTimestamp(),
    updateTime: getRandomTimestamp(),
    tags: ['服装', '购物']
  }
]

// 待办事项mock数据
export const todoRecords = [
  {
    recordId: generateId(),
    moduleType: 'todo',
    content: '完成项目文档编写',
    priority: 'high',
    deadline: Date.now() + 2 * 24 * 60 * 60 * 1000, // 2天后
    isCompleted: false,
    createTime: getRandomTimestamp(),
    updateTime: getRandomTimestamp(),
    tags: ['工作', '文档']
  },
  {
    recordId: generateId(),
    moduleType: 'todo',
    content: '购买生活用品',
    priority: 'mid',
    deadline: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7天后
    isCompleted: true,
    completeRemark: '已在超市购买完成',
    createTime: getRandomTimestamp(),
    updateTime: getRandomTimestamp(),
    tags: ['购物', '生活']
  },
  {
    recordId: generateId(),
    moduleType: 'todo',
    content: '预约体检',
    priority: 'low',
    deadline: Date.now() + 14 * 24 * 60 * 60 * 1000, // 14天后
    isCompleted: false,
    createTime: getRandomTimestamp(),
    updateTime: getRandomTimestamp(),
    tags: ['健康', '体检']
  }
]

// 随笔记录mock数据
export const essayRecords = [
  {
    recordId: generateId(),
    moduleType: 'essay',
    content: '今天是个特别的日子，阳光明媚，微风轻拂。走在熟悉的街道上，突然想起了很多往事。生活就像一本书，每一天都是新的一页，有喜有悲，有得有失。重要的是要学会珍惜当下，感恩生活中的每一个美好瞬间。',
    createTime: getRandomTimestamp(),
    updateTime: getRandomTimestamp(),
    tags: ['感悟', '生活', '阳光']
  },
  {
    recordId: generateId(),
    moduleType: 'essay',
    content: '读了一本很棒的书，书中的一句话深深打动了我："人生最重要的不是所站的位置，而是所朝的方向。" 这让我重新思考了自己的人生目标和方向。',
    createTime: getRandomTimestamp(),
    updateTime: getRandomTimestamp(),
    tags: ['读书', '感悟', '人生']
  }
]

// 合并所有记录
export const allRecords = [
  ...moodRecords,
  ...weightRecords,
  ...milkTeaRecords,
  ...accountRecords,
  ...todoRecords,
  ...essayRecords
].sort((a, b) => b.createTime - a.createTime) // 按时间倒序排列

export default {
  moodRecords,
  weightRecords,
  milkTeaRecords,
  accountRecords,
  todoRecords,
  essayRecords,
  allRecords
}