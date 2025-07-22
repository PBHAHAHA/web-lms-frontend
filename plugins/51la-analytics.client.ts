export default defineNuxtPlugin(() => {
  // 确保只在客户端执行
  if (process.client) {
    const { trackPageView } = use51LaAnalytics()
    
    // 等待DOM加载完成
    const initAnalytics = () => {
      try {
        // 检查LA对象是否已加载
        if (typeof window.LA !== 'undefined') {
          console.log('✅ 51.la analytics initialized successfully')
          
          // 设置路由监听，自动追踪页面访问
          const router = useRouter()
          router.afterEach((to) => {
            nextTick(() => {
              trackPageView(to.fullPath, to.meta?.title as string || document.title)
            })
          })
          
          // 追踪初始页面加载
          nextTick(() => {
            trackPageView()
          })
          
        } else {
          console.warn('⚠️ 51.la analytics not loaded yet, retrying...')
          // 如果LA对象还没加载，等待一段时间后重试
          setTimeout(initAnalytics, 1000)
        }
      } catch (error) {
        console.error('❌ 51.la analytics initialization failed:', error)
      }
    }

    // 延迟初始化，确保脚本已加载
    setTimeout(initAnalytics, 500)
  }
})