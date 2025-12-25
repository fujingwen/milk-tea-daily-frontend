import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { initStorage } from '@/utils/storageManager.js'

export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()

  app.use(pinia)

  // 初始化存储管理器
  initStorage().catch(error => {
    console.error('存储管理器初始化失败:', error)
  })

  return {
    app,
    pinia
  }
}