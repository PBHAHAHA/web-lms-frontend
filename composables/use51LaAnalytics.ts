/**
 * 51.la 统计功能组合式函数
 */
export const use51LaAnalytics = () => {
  /**
   * 检查51.la是否已加载
   */
  const isLoaded = computed(() => {
    return process.client && typeof window.LA !== 'undefined'
  })

  /**
   * 追踪页面访问
   * @param page 页面路径
   * @param title 页面标题
   */
  const trackPageView = (page?: string, title?: string) => {
    if (isLoaded.value && window.LA.track) {
      try {
        window.LA.track('pageview', {
          page: page || (process.client ? window.location.pathname : ''),
          title: title || (process.client ? document.title : '')
        })
        console.log('📊 Page view tracked:', { page, title })
      } catch (error) {
        console.error('Failed to track page view:', error)
      }
    }
  }

  /**
   * 追踪自定义事件
   * @param eventName 事件名称
   * @param eventData 事件数据
   */
  const trackEvent = (eventName: string, eventData?: Record<string, any>) => {
    if (isLoaded.value && window.LA.track) {
      try {
        window.LA.track('event', {
          event_name: eventName,
          ...eventData
        })
        console.log('📈 Event tracked:', { eventName, eventData })
      } catch (error) {
        console.error('Failed to track event:', error)
      }
    }
  }

  /**
   * 追踪用户行为
   * @param action 行为类型
   * @param category 分类
   * @param label 标签
   * @param value 值
   */
  const trackAction = (action: string, category?: string, label?: string, value?: number) => {
    if (isLoaded.value && window.LA.track) {
      try {
        window.LA.track('action', {
          action,
          category,
          label,
          value
        })
        console.log('🎯 Action tracked:', { action, category, label, value })
      } catch (error) {
        console.error('Failed to track action:', error)
      }
    }
  }

  /**
   * 设置用户属性
   * @param properties 用户属性
   */
  const setUserProperties = (properties: Record<string, any>) => {
    if (isLoaded.value && window.LA.setUser) {
      try {
        window.LA.setUser(properties)
        console.log('👤 User properties set:', properties)
      } catch (error) {
        console.error('Failed to set user properties:', error)
      }
    }
  }

  return {
    isLoaded: readonly(isLoaded),
    trackPageView,
    trackEvent,
    trackAction,
    setUserProperties
  }
}

// 类型声明
declare global {
  interface Window {
    LA: {
      track: (type: string, data: any) => void
      setUser: (properties: any) => void
      [key: string]: any
    }
  }
}