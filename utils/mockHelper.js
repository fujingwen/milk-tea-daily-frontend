// Mock数据辅助工具
import { resetMockData, generateMoreTestData, clearMockData } from '../mock/index.js'

class MockHelper {
  // 重置所有mock数据
  static resetAllData() {
    try {
      const result = resetMockData()
      if (result) {
        uni.showToast({
          title: 'Mock数据重置成功',
          icon: 'success'
        })

        // 刷新页面数据
        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/index/index'
          })
        }, 1500)
      }
      return result
    } catch (error) {
      console.error('重置Mock数据失败:', error)
      uni.showToast({
        title: '重置失败',
        icon: 'error'
      })
      return false
    }
  }

  // 清除所有数据
  static clearAllData() {
    try {
      const result = clearMockData()
      if (result) {
        uni.showToast({
          title: '数据清除成功',
          icon: 'success'
        })

        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/index/index'
          })
        }, 1500)
      }
      return result
    } catch (error) {
      console.error('清除数据失败:', error)
      uni.showToast({
        title: '清除失败',
        icon: 'error'
      })
      return false
    }
  }

  // 生成更多测试数据
  static generateMoreData(days = 30) {
    try {
      const totalRecords = generateMoreTestData(days)
      uni.showToast({
        title: `已生成数据，共${totalRecords}条`,
        icon: 'success'
      })

      // 刷新当前页面
      setTimeout(() => {
        const pages = getCurrentPages()
        const currentPage = pages[pages.length - 1]
        if (currentPage && currentPage.onLoad) {
          currentPage.onLoad()
        }
      }, 1500)

      return totalRecords
    } catch (error) {
      console.error('生成数据失败:', error)
      uni.showToast({
        title: '生成失败',
        icon: 'error'
      })
      return 0
    }
  }

  // 获取数据统计
  static getDataStats() {
    try {
      const records = JSON.parse(uni.getStorageSync('records') || '[]')
      const stats = {
        total: records.length,
        byType: {},
        byDate: {}
      }

      records.forEach(record => {
        // 按类型统计
        stats.byType[record.moduleType] = (stats.byType[record.moduleType] || 0) + 1

        // 按日期统计
        const date = new Date(record.createTime).toDateString()
        stats.byDate[date] = (stats.byDate[date] || 0) + 1
      })

      return stats
    } catch (error) {
      console.error('获取统计失败:', error)
      return { total: 0, byType: {}, byDate: {} }
    }
  }

  // 显示数据统计
  static showDataStats() {
    const stats = this.getDataStats()
    const typeStats = Object.entries(stats.byType)
      .map(([type, count]) => `${type}: ${count}条`)
      .join('\n')

    uni.showModal({
      title: '数据统计',
      content: `总记录数: ${stats.total}条\n\n按类型统计:\n${typeStats}`,
      showCancel: false
    })
  }

  // 导出数据（开发用）
  static exportData() {
    try {
      const records = uni.getStorageSync('records')
      const userInfo = uni.getStorageSync('userInfo')

      const exportData = {
        records: JSON.parse(records || '[]'),
        userInfo: JSON.parse(userInfo || '{}'),
        exportTime: new Date().toISOString()
      }

      console.log('导出的数据:', exportData)

      uni.showToast({
        title: '数据已输出到控制台',
        icon: 'success'
      })

      return exportData
    } catch (error) {
      console.error('导出数据失败:', error)
      uni.showToast({
        title: '导出失败',
        icon: 'error'
      })
      return null
    }
  }

  // 开发者菜单
  static showDeveloperMenu() {
    const actions = [
      '查看数据统计',
      '重置Mock数据',
      '生成更多数据',
      '清除所有数据',
      '导出数据'
    ]

    uni.showActionSheet({
      itemList: actions,
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            this.showDataStats()
            break
          case 1:
            uni.showModal({
              title: '确认重置',
              content: '这将清除现有数据并重新生成Mock数据，确定继续吗？',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  this.resetAllData()
                }
              }
            })
            break
          case 2:
            this.generateMoreData(30)
            break
          case 3:
            uni.showModal({
              title: '确认清除',
              content: '这将清除所有数据，确定继续吗？',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  this.clearAllData()
                }
              }
            })
            break
          case 4:
            this.exportData()
            break
        }
      }
    })
  }
}

// 全局注册开发者工具（仅在开发环境）
if (process.env.NODE_ENV === 'development') {
  // 可以通过 uni.$mockHelper 访问
  uni.$mockHelper = MockHelper

  // 添加全局方法
  uni.addGlobalClass = function () {
    return MockHelper
  }
}

export default MockHelper