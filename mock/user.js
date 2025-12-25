// 用户数据mock

// 生成唯一ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// 用户信息mock数据
export const userInfo = {
  userId: generateId(),
  nickname: '随手记用户',
  avatar: '/static/default-avatar.png',
  phone: '138****8888',
  email: 'user@example.com',
  registerTime: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30天前注册
  lastLoginTime: Date.now() - 2 * 60 * 60 * 1000, // 2小时前登录
  isVip: false,
  vipExpireTime: null,
  settings: {
    theme: 'light', // light, dark, auto
    language: 'zh-CN',
    notifications: {
      reminder: true,
      backup: true,
      update: false
    },
    privacy: {
      dataSync: true,
      analytics: false
    }
  }
}

// 用户统计数据mock
export const userStats = {
  totalRecords: 156,
  usedDays: 28,
  activeModules: 6,
  favoriteModule: 'mood',
  weeklyAverage: 5.6,
  monthlyGrowth: 12.5,
  streakDays: 7, // 连续记录天数
  achievements: [
    {
      id: 'first_record',
      name: '初次记录',
      description: '完成第一条记录',
      icon: '🎉',
      unlockTime: Date.now() - 25 * 24 * 60 * 60 * 1000,
      isUnlocked: true
    },
    {
      id: 'week_streak',
      name: '坚持一周',
      description: '连续记录7天',
      icon: '🔥',
      unlockTime: Date.now() - 1 * 24 * 60 * 60 * 1000,
      isUnlocked: true
    },
    {
      id: 'hundred_records',
      name: '百条记录',
      description: '累计记录100条',
      icon: '💯',
      unlockTime: Date.now() - 3 * 24 * 60 * 60 * 1000,
      isUnlocked: true
    },
    {
      id: 'month_streak',
      name: '坚持一月',
      description: '连续记录30天',
      icon: '🏆',
      unlockTime: null,
      isUnlocked: false
    }
  ]
}

// 用户偏好设置mock
export const userPreferences = {
  defaultModule: 'mood', // 默认记录模块
  quickActions: ['mood', 'account', 'todo'], // 快捷操作
  reminderTime: '21:00', // 提醒时间
  reminderDays: [1, 2, 3, 4, 5], // 提醒日期 (1-7, 周一到周日)
  autoBackup: true,
  backupFrequency: 'weekly', // daily, weekly, monthly
  exportFormat: 'json', // json, csv, txt
  dataRetention: 365, // 数据保留天数
  customCategories: {
    account: ['餐饮', '交通', '购物', '娱乐', '医疗', '教育', '其他'],
    mood: ['工作', '生活', '感情', '健康', '学习', '其他'],
    todo: ['工作', '学习', '生活', '健康', '娱乐', '其他']
  }
}

// 用户反馈数据mock
export const userFeedback = [
  {
    id: generateId(),
    type: 'bug',
    title: '记录列表加载缓慢',
    content: '当记录数量较多时，列表加载速度很慢，希望能优化一下',
    status: 'pending', // pending, processing, resolved
    createTime: Date.now() - 5 * 24 * 60 * 60 * 1000,
    updateTime: Date.now() - 3 * 24 * 60 * 60 * 1000
  },
  {
    id: generateId(),
    type: 'feature',
    title: '希望增加标签功能',
    content: '建议为每条记录添加标签功能，方便分类和搜索',
    status: 'resolved',
    createTime: Date.now() - 10 * 24 * 60 * 60 * 1000,
    updateTime: Date.now() - 2 * 24 * 60 * 60 * 1000
  }
]

export default {
  userInfo,
  userStats,
  userPreferences,
  userFeedback
}