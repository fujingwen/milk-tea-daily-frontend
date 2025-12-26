# Index 页面组件拆分说明

## 概述

将原本的 `pages/index/index.vue` 文件按功能模块拆分为多个独立的组件，提高代码的可维护性和复用性。

## 拆分后的组件结构

### 1. SearchHeader.vue

**功能**: 顶部搜索栏

- 搜索输入框
- 搜索按钮
- 搜索导航逻辑

### 2. TodayReminders.vue  

**功能**: 今日提醒模块

- 天气信息显示
- 姨妈期提醒
- 待办事项提醒
- 生日提醒
- 节日提醒
- 待办完成操作

**Props**:

- `weatherInfo`: 天气信息对象
- `menstruationReminder`: 姨妈期提醒对象
- `pendingTodos`: 待办事项数组
- `upcomingBirthdays`: 生日提醒数组
- `upcomingHolidays`: 节日提醒数组

**Events**:

- `todo-complete`: 待办事项完成事件

### 3. ModuleGroups.vue

**功能**: 模块分组显示

- 今日打卡模块组
- 生活记录模块组
- 美食相关模块组
- 计划提醒模块组
- 模块隐藏/显示功能
- 悬浮按钮和显示所有模块按钮

**Props**:

- `records`: 记录数据数组
- `moduleVisibilityStore`: 模块可见性状态管理

**Events**:

- `module-hide`: 隐藏模块事件
- `module-show`: 显示模块事件
- `show-all-modules`: 显示所有模块事件

### 4. RecentRecords.vue

**功能**: 最近记录列表

- 记录列表显示
- 记录摘要生成
- 记录详情导航
- 空状态显示

**Props**:

- `records`: 记录数据数组

### 5. TodoCompleteModal.vue

**功能**: 待办事项完成确认弹窗

- 完成确认界面
- 备注输入
- 字符计数
- 响应式设计
- 暗色模式支持

**Props**:

- `visible`: 弹窗显示状态
- `todo`: 待办事项对象

**Events**:

- `close`: 关闭弹窗事件
- `confirm`: 确认完成事件

## 主页面 (pages/index/index.vue)

重构后的主页面变得更加简洁，主要负责：

- 数据管理和状态维护
- 组件间的事件处理
- 生命周期管理
- 业务逻辑协调

## 文件结构

```
pages/index/
├── index.vue                    # 主页面
└── components/                  # 页面专用组件
    ├── SearchHeader.vue         # 搜索头部
    ├── TodayReminders.vue       # 今日提醒
    ├── ModuleGroups.vue         # 模块分组
    ├── RecentRecords.vue        # 最近记录
    ├── TodoCompleteModal.vue    # 待办完成弹窗
    └── README.md               # 组件说明文档
```

## 优势

1. **代码可维护性**: 每个组件职责单一，便于维护和调试
2. **组件复用性**: 拆分后的组件可以在其他页面中复用
3. **开发效率**: 团队成员可以并行开发不同的组件
4. **测试友好**: 每个组件可以独立进行单元测试
5. **性能优化**: 可以针对单个组件进行性能优化
6. **代码可读性**: 文件结构更清晰，代码逻辑更容易理解
7. **项目结构**: 组件放在页面目录下，符合项目组织规范

## 注意事项

- 所有组件都保持了原有的样式和功能
- 事件传递通过 props 和 emit 进行
- 保持了原有的响应式设计和暗色模式支持
- 维持了原有的用户体验和交互逻辑
- 组件导入使用相对路径，便于维护
