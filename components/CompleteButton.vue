<template>
  <view class="complete-button-container">
    <!-- 完成按钮 -->
    <u-button
      :type="isCompleted ? 'info' : 'success'"
      shape="circle"
      :size="120"
      :disabled="disabled"
      @click="handleComplete"
    >
      <u-text
        :text="isCompleted ? '✓ 已完成' : '○ 完成'"
        color="white"
        :size="24"
        bold
      ></u-text>
    </u-button>

    <!-- 二次确认弹窗 -->
    <u-modal
      v-model="showConfirmModal"
      title="确认完成"
      :show-cancel-button="true"
      confirm-text="确认完成"
      cancel-text="取消"
      @confirm="confirmComplete"
      @cancel="closeModal"
    >
      <view class="modal-content">
        <u-text text="确定要标记为已完成吗？" :size="28" color="#333" align="center"></u-text>

        <!-- 备注输入 -->
        <view class="remark-section">
          <u-text text="完成备注（可选）" :size="26" color="#666"></u-text>
          <u-input
            v-model="completeRemark"
            type="textarea"
            placeholder="添加完成备注..."
            :maxlength="100"
            :show-word-limit="true"
            :auto-height="true"
            border="surround"
            style="margin-top: 12rpx;"
          ></u-input>
        </view>
      </view>
    </u-modal>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { vibrate } from '@/utils/hapticFeedback.js'

// Props定义
const props = defineProps({
  isCompleted: {
    type: Boolean,
    default: false
  },
  onComplete: {
    type: Function,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

// 响应式数据
const showConfirmModal = ref(false)
const completeRemark = ref('')

// 方法
const handleComplete = () => {
  if (props.disabled || props.isCompleted) {
    return
  }

  // 触觉反馈
  vibrate.light()

  // 显示确认弹窗
  showConfirmModal.value = true
}

const confirmComplete = async () => {
  try {
    // 调用完成回调
    await props.onComplete({
      isCompleted: true,
      completeRemark: completeRemark.value.trim(),
      completeTime: Date.now()
    })

    // 触觉反馈
    vibrate.success()

    // 关闭弹窗
    closeModal()

    uni.showToast({
      title: '已标记为完成',
      icon: 'success'
    })
  } catch (error) {
    console.error('完成操作失败:', error)
    uni.showToast({
      title: '操作失败，请重试',
      icon: 'none'
    })
  }
}

const closeModal = () => {
  showConfirmModal.value = false
  completeRemark.value = ''
}
</script>

<style lang="scss" scoped>
.complete-button-container {
  position: relative;
}

.modal-content {
  padding: 20rpx;

  .remark-section {
    margin-top: 30rpx;
  }
}
</style>