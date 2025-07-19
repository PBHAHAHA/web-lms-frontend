<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>开通会员</DialogTitle>
        <DialogDescription>
          开通会员即可享受所有课程内容
        </DialogDescription>
      </DialogHeader>
      
      <div class="space-y-3">
        <!-- 会员权益和价格信息并排显示 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <!-- 会员权益 -->
          <div class="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-3">
            <h4 class="font-semibold text-blue-600 mb-2 flex items-center text-sm">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z"/>
              </svg>
              会员权益
            </h4>
            <ul class="space-y-1 text-xs">
              <li class="flex items-center">
                <svg class="w-3 h-3 text-green-500 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
                解锁所有章节
              </li>
              <li class="flex items-center">
                <svg class="w-3 h-3 text-green-500 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
                全站课程免费学习
              </li>
              <li class="flex items-center">
                <svg class="w-3 h-3 text-green-500 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
                专业答疑解惑
              </li>
            </ul>
          </div>

          <!-- 价格信息 -->
          <div class="bg-gray-50 dark:bg-zinc-800 p-3">
            <div class="text-center">
              <div class="flex items-center justify-center mb-1">
                <span class="text-xs text-gray-500 line-through">¥299</span>
                <span class="text-xl font-bold text-red-600 ml-2">¥199</span>
              </div>
              <div class="text-xs text-gray-600 dark:text-gray-400 mb-1">终身免费</div>
              <div class="bg-red-50 dark:bg-red-900/20 px-2 py-1">
                <span class="text-xs text-red-600 dark:text-red-400">立省¥100</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 支付宝支付区域 -->
        <!-- <div class="bg-blue-50 dark:bg-blue-900/20 p-3">
          <div class="flex items-center justify-center mb-2">
            
            <span class="font-semibold text-blue-600 text-sm">支付宝支付</span>
          </div>
          <div class="flex items-center justify-center">
            <div class="w-24 h-24 bg-white border border-gray-200 flex items-center justify-center mr-3">
              <span class="text-xs text-gray-500">二维码</span>
            </div>
            <div class="text-xs text-gray-500">
              <p>扫码支付</p>
              <p>或使用支付宝APP</p>
            </div>
          </div>
        </div> -->
      </div>

      <DialogFooter class="flex gap-3 mt-4">
        <DialogClose as-child>
          <Button variant="outline" class="flex-1">
            取消
          </Button>
        </DialogClose>
        <Button @click="handlePayment" class="flex-1 bg-blue-600 hover:bg-blue-700">
          立即开通（支付宝支付）
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { postOrder } from '~/lib/api/modules/order'

// Props
const props = defineProps({
  open: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:open', 'payment'])

// 处理支付
const handlePayment = async () => {
  try {
    // 调用后端API创建会员支付订单
    const orderParams = {
    //   type: 'membership',
    //   amount: 199,
    //   description: '开通会员 - 全栈开发实战课程',
    //   paymentMethod: 'alipay',
      returnUrl: window.location.href // 支付完成后返回当前页面
    }
    
    console.log('创建订单参数:', orderParams)
    const response = await postOrder(orderParams)
    
    if (response.errorCode == 0) {
      console.log('订单创建成功:', response.data)
      
      // 获取支付宝支付链接
      const paymentUrl = response.data.content
      
      if (paymentUrl) {
        // 跳转到支付宝支付页面
        window.open(paymentUrl, '_blank')
        
        // 触发支付事件
        emit('payment', { 
          type: 'membership', 
          price: 199,
          orderId: response.data?.orderId,
          success: true,
          paymentUrl: paymentUrl
        })
        
        // 关闭支付弹窗
        emit('update:open', false)
      } else {
        console.error('支付链接为空')
        alert('支付链接生成失败，请重试')
      }
    } else {
      console.error('订单创建失败:', response)
      alert('订单创建失败，请重试')
    }
  } catch (error) {
    console.error('支付处理错误:', error)
    alert('支付处理出错，请重试')
  }
}
</script> 