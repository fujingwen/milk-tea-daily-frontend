// 模块滑动隐藏功能的TypeScript类型定义

export interface ModuleConfig {
  type: string
  name: string
  icon: string
  color: string
  group: string
}

export interface SwipeState {
  startX: number
  currentX: number
  distance: number
  isActive: boolean
  threshold: number
}

export interface ModuleVisibilityData {
  hiddenModules: string[]
  lastUpdated: number
  version: string
}

export interface ModuleVisibilityState {
  hiddenModules: Set<string>
  animatingModules: Set<string>
  isInitialized: boolean
}

export interface SwipeableContainerProps {
  moduleType: string
  isHidden: boolean
  onHide: () => void
  onShow: () => void
}

export interface FloatingButtonProps {
  moduleConfig: ModuleConfig
  onClick: () => void
}

// 滑动手势事件类型
export interface SwipeEvent {
  type: 'start' | 'move' | 'end'
  clientX: number
  clientY: number
  timestamp: number
}

// 动画状态类型
export interface AnimationState {
  isAnimating: boolean
  animationType: 'hide' | 'show' | null
  progress: number
}