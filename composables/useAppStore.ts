// 应用级别的持久化状态管理
export const useAppStore = () => {
  const storage = useStorage()
  
  // 应用设置
  const appSettings = ref({
    theme: 'light' as 'light' | 'dark',
    language: 'zh-CN',
    sidebarCollapsed: false,
    notifications: true,
  })
  
  // 用户偏好设置
  const userPreferences = ref({
    pageSize: 10,
    dateFormat: 'YYYY-MM-DD',
    timezone: 'Asia/Shanghai',
  })
  
  // 存储键名
  const APP_SETTINGS_KEY = 'app-settings'
  const USER_PREFERENCES_KEY = 'user-preferences'
  const RECENT_ACTIONS_KEY = 'recent-actions'
  
  // 恢复应用设置
  const restoreAppSettings = () => {
    const stored = storage.getItem(APP_SETTINGS_KEY)
    if (stored) {
      appSettings.value = { ...appSettings.value, ...stored }
    }
  }
  
  // 保存应用设置
  const saveAppSettings = () => {
    storage.setItem(APP_SETTINGS_KEY, appSettings.value)
  }
  
  // 恢复用户偏好
  const restoreUserPreferences = () => {
    const stored = storage.getItem(USER_PREFERENCES_KEY)
    if (stored) {
      userPreferences.value = { ...userPreferences.value, ...stored }
    }
  }
  
  // 保存用户偏好
  const saveUserPreferences = () => {
    storage.setItem(USER_PREFERENCES_KEY, userPreferences.value)
  }
  
  // 更新主题
  const setTheme = (theme: 'light' | 'dark') => {
    appSettings.value.theme = theme
    saveAppSettings()
  }
  
  // 更新语言
  const setLanguage = (language: string) => {
    appSettings.value.language = language
    saveAppSettings()
  }
  
  // 切换侧边栏状态
  const toggleSidebar = () => {
    appSettings.value.sidebarCollapsed = !appSettings.value.sidebarCollapsed
    saveAppSettings()
  }
  
  // 记录用户操作（最近操作历史）
  const addRecentAction = (action: { type: string; data?: any; timestamp?: number }) => {
    const recentActions = storage.getItem<any[]>(RECENT_ACTIONS_KEY, []) || []
    const newAction = {
      ...action,
      timestamp: action.timestamp || Date.now()
    }
    
    // 保持最近 50 条记录
    recentActions.unshift(newAction)
    if (recentActions.length > 50) {
      recentActions.splice(50)
    }
    
    storage.setItem(RECENT_ACTIONS_KEY, recentActions)
  }
  
  // 获取最近操作
  const getRecentActions = (limit: number = 10) => {
    const actions = storage.getItem<any[]>(RECENT_ACTIONS_KEY, []) || []
    return actions.slice(0, limit)
  }
  
  // 清除最近操作
  const clearRecentActions = () => {
    storage.removeItem(RECENT_ACTIONS_KEY)
  }
  
  // 初始化时恢复数据
  if (process.client) {
    restoreAppSettings()
    restoreUserPreferences()
  }
  
  // 监听设置变化并自动保存
  watch(appSettings, saveAppSettings, { deep: true })
  watch(userPreferences, saveUserPreferences, { deep: true })
  
  return {
    // 状态
    appSettings: readonly(appSettings),
    userPreferences: readonly(userPreferences),
    
    // 方法
    setTheme,
    setLanguage,
    toggleSidebar,
    addRecentAction,
    getRecentActions,
    clearRecentActions,
    
    // 手动保存方法
    saveAppSettings,
    saveUserPreferences,
  }
} 