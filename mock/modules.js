// 模块配置mock数据
export const moduleTemplates = {
  mood: {
    name: '心情记录',
    icon: '😊',
    color: '#FF6B6B',
    description: '记录每日心情变化',
    fields: [
      {
        key: 'moodType',
        label: '心情类型',
        type: 'select',
        required: true,
        options: [
          { value: 'happy', label: '开心', emoji: '😊' },
          { value: 'sad', label: '难过', emoji: '😢' },
          { value: 'angry', label: '生气', emoji: '😠' },
          { value: 'excited', label: '兴奋', emoji: '🤩' },
          { value: 'calm', label: '平静', emoji: '😌' },
          { value: 'anxious', label: '焦虑', emoji: '😰' },
          { value: 'tired', label: '疲惫', emoji: '😴' }
        ]
      },
      {
        key: 'description',
        label: '心情描述',
        type: 'textarea',
        required: false,
        placeholder: '描述一下今天的心情...'
      }
    ],
    quickTemplates: [
      { name: '今天很开心', data: { moodType: 'happy', description: '今天心情很好！' } },
      { name: '有点累', data: { moodType: 'tired', description: '今天工作有点累' } },
      { name: '很平静', data: { moodType: 'calm', description: '心情很平静' } }
    ]
  },

  weight: {
    name: '体重记录',
    icon: '⚖️',
    color: '#4ECDC4',
    description: '记录体重变化',
    fields: [
      {
        key: 'weightValue',
        label: '体重(kg)',
        type: 'number',
        required: true,
        min: 30,
        max: 200,
        step: 0.1
      },
      {
        key: 'measureTime',
        label: '测量时间',
        type: 'datetime',
        required: false,
        defaultValue: 'now'
      },
      {
        key: 'remark',
        label: '备注',
        type: 'text',
        required: false,
        placeholder: '如：空腹测量、饭后测量等'
      }
    ],
    quickTemplates: [
      { name: '早晨空腹', data: { remark: '早晨空腹测量' } },
      { name: '晚上测量', data: { remark: '晚上测量' } }
    ]
  },

  milkTea: {
    name: '奶茶记录',
    icon: '🧋',
    color: '#FFD93D',
    description: '记录奶茶消费',
    fields: [
      {
        key: 'name',
        label: '奶茶名称',
        type: 'text',
        required: true,
        placeholder: '如：珍珠奶茶'
      },
      {
        key: 'shop',
        label: '购买店铺',
        type: 'text',
        required: false,
        placeholder: '如：喜茶、奈雪等'
      },
      {
        key: 'sugar',
        label: '甜度',
        type: 'select',
        required: true,
        options: [
          { value: 'none', label: '无糖' },
          { value: 'low', label: '三分糖' },
          { value: 'half', label: '五分糖' },
          { value: 'normal', label: '七分糖' },
          { value: 'full', label: '全糖' }
        ]
      },
      {
        key: 'ice',
        label: '冰度',
        type: 'select',
        required: true,
        options: [
          { value: 'hot', label: '热饮' },
          { value: 'none', label: '去冰' },
          { value: 'less', label: '少冰' },
          { value: 'normal', label: '正常冰' },
          { value: 'more', label: '多冰' }
        ]
      },
      {
        key: 'price',
        label: '价格',
        type: 'number',
        required: false,
        min: 0,
        step: 0.1
      },
      {
        key: 'remark',
        label: '备注',
        type: 'textarea',
        required: false,
        placeholder: '口感、评价等'
      }
    ],
    quickTemplates: [
      { name: '珍珠奶茶', data: { name: '珍珠奶茶', sugar: 'half', ice: 'normal' } },
      { name: '芝士奶盖', data: { name: '芝士奶盖茶', sugar: 'low', ice: 'less' } }
    ]
  },

  account: {
    name: '记账',
    icon: '💰',
    color: '#6BCF7F',
    description: '记录收支情况',
    fields: [
      {
        key: 'type',
        label: '类型',
        type: 'radio',
        required: true,
        options: [
          { value: 'income', label: '收入' },
          { value: 'expense', label: '支出' }
        ]
      },
      {
        key: 'amount',
        label: '金额',
        type: 'number',
        required: true,
        min: 0,
        step: 0.01
      },
      {
        key: 'category',
        label: '分类',
        type: 'select',
        required: false,
        options: [
          { value: '餐饮', label: '餐饮' },
          { value: '交通', label: '交通' },
          { value: '购物', label: '购物' },
          { value: '娱乐', label: '娱乐' },
          { value: '医疗', label: '医疗' },
          { value: '教育', label: '教育' },
          { value: '工资', label: '工资' },
          { value: '奖金', label: '奖金' },
          { value: '其他', label: '其他' }
        ]
      },
      {
        key: 'payType',
        label: '支付方式',
        type: 'select',
        required: false,
        options: [
          { value: 'cash', label: '现金' },
          { value: 'alipay', label: '支付宝' },
          { value: 'wechat', label: '微信支付' },
          { value: 'bank', label: '银行卡' },
          { value: 'credit', label: '信用卡' }
        ]
      },
      {
        key: 'remark',
        label: '备注',
        type: 'text',
        required: false,
        placeholder: '详细说明'
      }
    ],
    quickTemplates: [
      { name: '午餐', data: { type: 'expense', category: '餐饮', payType: 'alipay' } },
      { name: '打车', data: { type: 'expense', category: '交通', payType: 'wechat' } },
      { name: '工资', data: { type: 'income', category: '工资', payType: 'bank' } }
    ]
  },

  todo: {
    name: '待办事项',
    icon: '✅',
    color: '#A8E6CF',
    description: '管理待办任务',
    fields: [
      {
        key: 'content',
        label: '任务内容',
        type: 'text',
        required: true,
        placeholder: '要做什么...'
      },
      {
        key: 'priority',
        label: '优先级',
        type: 'select',
        required: true,
        options: [
          { value: 'low', label: '低', color: '#34c759' },
          { value: 'mid', label: '中', color: '#ff9500' },
          { value: 'high', label: '高', color: '#ff3b30' }
        ]
      },
      {
        key: 'deadline',
        label: '截止时间',
        type: 'datetime',
        required: false
      },
      {
        key: 'isCompleted',
        label: '是否完成',
        type: 'switch',
        required: false,
        defaultValue: false
      },
      {
        key: 'completeRemark',
        label: '完成备注',
        type: 'text',
        required: false,
        placeholder: '完成情况说明',
        showWhen: { field: 'isCompleted', value: true }
      }
    ],
    quickTemplates: [
      { name: '工作任务', data: { priority: 'high' } },
      { name: '生活事项', data: { priority: 'mid' } },
      { name: '学习计划', data: { priority: 'low' } }
    ]
  },

  essay: {
    name: '随笔',
    icon: '📝',
    color: '#DDA0DD',
    description: '记录生活感悟',
    fields: [
      {
        key: 'content',
        label: '内容',
        type: 'textarea',
        required: true,
        placeholder: '写下你的想法...',
        minLength: 10,
        maxLength: 1000
      }
    ],
    quickTemplates: [
      { name: '今日感悟', data: { content: '今天...' } },
      { name: '读书笔记', data: { content: '读了一本书...' } }
    ]
  }
}

// 模块使用统计
export const moduleStats = {
  mood: {
    totalCount: 45,
    weekCount: 7,
    monthCount: 28,
    avgPerDay: 1.5,
    mostUsedTime: '21:00',
    popularTags: ['工作', '生活', '开心']
  },
  weight: {
    totalCount: 15,
    weekCount: 2,
    monthCount: 8,
    avgPerDay: 0.5,
    mostUsedTime: '07:30',
    trend: 'down' // up, down, stable
  },
  milkTea: {
    totalCount: 23,
    weekCount: 3,
    monthCount: 12,
    avgPerDay: 0.8,
    totalSpent: 658,
    avgPrice: 28.6,
    favoriteShop: '喜茶'
  },
  account: {
    totalCount: 89,
    weekCount: 12,
    monthCount: 45,
    totalIncome: 15000,
    totalExpense: 8500,
    balance: 6500,
    topCategory: '餐饮'
  },
  todo: {
    totalCount: 67,
    completedCount: 52,
    completionRate: 77.6,
    avgCompletionTime: 2.3, // 天
    overdueCount: 3
  },
  essay: {
    totalCount: 12,
    weekCount: 1,
    monthCount: 5,
    avgLength: 156,
    totalWords: 1872
  }
}

export default {
  moduleTemplates,
  moduleStats
}