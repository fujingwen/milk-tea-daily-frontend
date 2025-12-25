# Mock数据说明

这个目录包含了项目的模拟数据，用于开发和测试。

## 文件结构

```
mock/
├── index.js          # 统一导出和初始化函数
├── records.js        # 记录数据mock
├── user.js          # 用户数据mock  
├── modules.js       # 模块配置mock
├── api.js           # API接口mock
└── README.md        # 说明文档
```

## 数据类型

### 记录数据 (records.js)

包含6种类型的记录数据：

- **心情记录** (mood) - 心情类型、描述等
- **体重记录** (weight) - 体重值、测量时间、备注
- **奶茶记录** (milkTea) - 名称、店铺、甜度、冰度、价格
- **记账记录** (account) - 收支类型、金额、分类、支付方式
- **待办事项** (todo) - 任务内容、优先级、截止时间、完成状态
- **随笔记录** (essay) - 文字内容

### 用户数据 (user.js)

- **用户信息** - 基本资料、设置等
- **用户统计** - 记录数量、使用天数、成就等
- **用户偏好** - 默认设置、提醒配置等
- **用户反馈** - 问题反馈、功能建议等

### 模块配置 (modules.js)

- **模块模板** - 每个模块的字段配置、快捷模板
- **模块统计** - 各模块的使用统计数据

### API接口 (api.js)

模拟后端API接口：

- **用户API** - 登录、注册、用户信息管理
- **记录API** - CRUD操作、搜索、分页
- **统计API** - 各种统计数据
- **同步API** - 数据备份和恢复

## 使用方法

### 1. 自动初始化

项目启动时会自动检查本地存储，如果没有数据会自动初始化mock数据：

```javascript
import { initMockData } from '@/mock'

// 在App.vue或main.js中调用
initMockData()
```

### 2. 手动管理

```javascript
import { 
  initMockData, 
  clearMockData, 
  resetMockData,
  getRandomRecords,
  generateTestRecord 
} from '@/mock'

// 初始化mock数据
initMockData()

// 清除所有数据
clearMockData()

// 重置数据（清除后重新初始化）
resetMockData()

// 获取随机记录（用于测试）
const randomRecords = getRandomRecords(5)

// 生成测试记录
const testRecord = generateTestRecord('mood')
```

### 3. 使用API Mock

```javascript
import { userApi, recordApi, statsApi } from '@/mock/api'

// 模拟登录
const loginResult = await userApi.login({
  phone: '13800138000',
  code: '123456'
})

// 模拟获取记录
const recordsResult = await recordApi.getRecords({
  page: 1,
  pageSize: 10,
  moduleType: 'mood'
})
```

## 数据特点

### 时间分布

- 记录时间分布在最近30天内
- 模拟真实的使用场景和频率

### 数据完整性

- 所有必填字段都有值
- 可选字段随机填充
- 数据类型和格式正确

### 关联性

- 用户统计数据与记录数据保持一致
- 模块统计反映实际使用情况

## 开发调试

### 调试工具

```javascript
import { mockDebug } from '@/mock'

// 打印所有mock数据
mockDebug.logAllData()

// 验证数据完整性
const isValid = mockDebug.validateData()
```

### 数据验证

- 检查必填字段
- 验证数据类型
- 确保ID唯一性

## 注意事项

1. **数据持久化**: Mock数据会保存到本地存储，重启应用后仍然存在
2. **数据覆盖**: 如果本地已有数据，不会覆盖现有数据
3. **开发环境**: 建议只在开发环境使用mock数据
4. **数据量**: 当前包含约150条记录，可根据需要调整
5. **更新频率**: Mock数据应该定期更新以反映最新的业务需求

## 扩展说明

如需添加新的mock数据：

1. 在对应文件中添加数据
2. 更新导出接口
3. 在index.js中添加初始化逻辑
4. 更新此README文档

Mock数据的设计遵循真实业务场景，确保开发和测试的有效性。
