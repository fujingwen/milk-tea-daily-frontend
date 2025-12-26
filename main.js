import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import uView from './uni_modules/uview-plus'
import App from './App.vue'
import { initStorage } from './utils/storageManager.js'

export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(uView)

  // 初始化存储管理器
  initStorage().catch(error => {
    console.error('存储管理器初始化失败:', error)
    // 可以在这里添加其他错误处理逻辑，如显示用户友好的提示
  })

  return {
    app,
    pinia
  }
}