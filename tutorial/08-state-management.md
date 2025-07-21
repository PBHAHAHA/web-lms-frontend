# 第八章：状态管理与数据流

"简单是复杂的终极形式。" —— 列奥纳多·达·芬奇

在现代前端应用中，状态管理就像是一个城市的交通系统。想象一下，如果没有红绿灯、交通标志和统一的交通规则，城市的交通将会是一片混乱。同样，如果没有良好的状态管理，应用的数据流将变得难以追踪和维护。

随着应用复杂度的增加，组件间的数据共享、状态同步、副作用处理等问题变得越来越突出。我们需要一个既强大又简洁的状态管理方案，既能处理复杂的业务逻辑，又能保持代码的可读性和可维护性。

Pinia 作为 Vue 3 的官方状态管理库，提供了直观的 API、优秀的 TypeScript 支持和强大的开发工具。它不仅继承了 Vuex 的优点，还解决了许多历史遗留问题，让状态管理变得更加简单和高效。

今天，我们将深入探索 Pinia 的高级用法，学习如何构建可扩展、可维护的状态管理架构，从基础概念到高级模式，从单一 Store 到复杂的状态生态系统。

## 🎯 本章目标

- 掌握 Pinia 的高级用法和最佳实践
- 设计模块化的状态管理架构
- 实现状态持久化和同步机制
- 构建响应式的数据流系统
- 优化状态管理的性能和开发体验

## 🏗️ 状态管理架构设计

### 核心概念与设计原则

在设计状态管理架构时，我们需要遵循以下原则：

1. **单一数据源**：每个状态都有唯一的来源
2. **状态不可变**：通过 actions 修改状态
3. **可预测性**：状态变化可追踪和调试
4. **模块化**：按功能域划分 Store
5. **类型安全**：充分利用 TypeScript

```typescript
// stores/index.ts
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'

// 创建 Pinia 实例
export const pinia = createPinia()

// 添加持久化插件
pinia.use(createPersistedState({
  storage: localStorage,
  serializer: {
    serialize: JSON.stringify,
    deserialize: JSON.parse,
  },
}))

// Store 类型定义
export interface StoreState {
  // 用户相关状态
  user: {
    profile: User | null
    preferences: UserPreferences
    permissions: Permission[]
  }
  
  // 应用相关状态
  app: {
    theme: 'light' | 'dark' | 'system'
    language: string
    sidebar: {
      collapsed: boolean
      width: number
    }
    notifications: Notification[]
  }
  
  // 课程相关状态
  course: {
    courses: Course[]
    currentCourse: Course | null
    enrollments: Enrollment[]
    progress: Record<string, Progress>
  }
  
  // 学习相关状态
  learning: {
    currentLesson: Lesson | null
    playbackState: PlaybackState
    notes: Note[]
    bookmarks: Bookmark[]
  }
}

// 全局状态类型
export type RootState = StoreState
```

### 基础 Store 抽象

```typescript
// stores/base.ts
import { defineStore } from 'pinia'
import type { Ref } from 'vue'

// 基础状态接口
export interface BaseState {
  loading: boolean
  error: string | null
  lastUpdated: number | null
}

// 基础 Store 配置
export interface BaseStoreOptions<T extends BaseState> {
  id: string
  initialState: () => T
  persist?: boolean | {
    key?: string
    storage?: Storage
    paths?: string[]
  }
}

// 创建基础 Store
export function createBaseStore<T extends BaseState>(
  options: BaseStoreOptions<T>
) {
  return defineStore(options.id, {
    state: () => ({
      ...options.initialState(),
      loading: false,
      error: null,
      lastUpdated: null,
    } as T),

    getters: {
      // 是否有错误
      hasError: (state) => !!state.error,
      
      // 是否正在加载
      isLoading: (state) => state.loading,
      
      // 数据是否过期（5分钟）
      isStale: (state) => {
        if (!state.lastUpdated) return true
        return Date.now() - state.lastUpdated > 5 * 60 * 1000
      },
    },

    actions: {
      // 设置加载状态
      setLoading(loading: boolean) {
        this.loading = loading
      },

      // 设置错误
      setError(error: string | null) {
        this.error = error
      },

      // 清除错误
      clearError() {
        this.error = null
      },

      // 更新时间戳
      updateTimestamp() {
        this.lastUpdated = Date.now()
      },

      // 重置状态
      $reset() {
        Object.assign(this, options.initialState())
        this.loading = false
        this.error = null
        this.lastUpdated = null
      },
    },

    persist: options.persist,
  })
}

// 异步操作包装器
export function withAsyncState<T>(
  store: any,
  asyncFn: () => Promise<T>
): Promise<{ data: T | null; error: string | null }> {
  return new Promise(async (resolve) => {
    store.setLoading(true)
    store.clearError()

    try {
      const data = await asyncFn()
      store.updateTimestamp()
      resolve({ data, error: null })
    } catch (error: any) {
      const errorMessage = error.message || '操作失败'
      store.setError(errorMessage)
      resolve({ data: null, error: errorMessage })
    } finally {
      store.setLoading(false)
    }
  })
}
```

## 🔐 用户状态管理

### 用户 Store

```typescript
// stores/user.ts
import { defineStore } from 'pinia'
import type { User, UserPreferences, Permission } from '~/types/user'
import { createBaseStore, withAsyncState } from './base'

interface UserState extends BaseState {
  profile: User | null
  preferences: UserPreferences
  permissions: Permission[]
  isAuthenticated: boolean
  token: string | null
  refreshToken: string | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    profile: null,
    preferences: {
      theme: 'system',
      language: 'zh-CN',
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
      privacy: {
        profileVisible: true,
        progressVisible: true,
      },
    },
    permissions: [],
    isAuthenticated: false,
    token: null,
    refreshToken: null,
    loading: false,
    error: null,
    lastUpdated: null,
  }),

  getters: {
    // 用户全名
    fullName: (state) => {
      if (!state.profile) return ''
      return `${state.profile.firstName} ${state.profile.lastName}`.trim()
    },

    // 用户头像
    avatar: (state) => {
      return state.profile?.avatar || '/images/default-avatar.png'
    },

    // 用户角色
    roles: (state) => {
      return state.profile?.roles || []
    },

    // 是否为管理员
    isAdmin: (state) => {
      return state.profile?.roles.includes('admin') || false
    },

    // 是否为讲师
    isInstructor: (state) => {
      return state.profile?.roles.includes('instructor') || false
    },

    // 检查权限
    hasPermission: (state) => (permission: string) => {
      return state.permissions.some(p => p.name === permission)
    },

    // 检查多个权限
    hasAnyPermission: (state) => (permissions: string[]) => {
      return permissions.some(permission => 
        state.permissions.some(p => p.name === permission)
      )
    },

    // 检查所有权限
    hasAllPermissions: (state) => (permissions: string[]) => {
      return permissions.every(permission => 
        state.permissions.some(p => p.name === permission)
      )
    },
  },

  actions: {
    // 登录
    async login(credentials: { email: string; password: string }) {
      return withAsyncState(this, async () => {
        const { data } = await $fetch<{
          user: User
          token: string
          refreshToken: string
          permissions: Permission[]
        }>('/api/auth/login', {
          method: 'POST',
          body: credentials,
        })

        this.profile = data.user
        this.token = data.token
        this.refreshToken = data.refreshToken
        this.permissions = data.permissions
        this.isAuthenticated = true

        // 设置请求头
        this.setAuthHeader(data.token)

        return data
      })
    },

    // 注册
    async register(userData: {
      email: string
      password: string
      firstName: string
      lastName: string
    }) {
      return withAsyncState(this, async () => {
        const { data } = await $fetch<{
          user: User
          token: string
          refreshToken: string
        }>('/api/auth/register', {
          method: 'POST',
          body: userData,
        })

        this.profile = data.user
        this.token = data.token
        this.refreshToken = data.refreshToken
        this.isAuthenticated = true

        this.setAuthHeader(data.token)

        return data
      })
    },

    // 登出
    async logout() {
      return withAsyncState(this, async () => {
        if (this.token) {
          await $fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          })
        }

        this.$reset()
        this.clearAuthHeader()

        // 重定向到登录页
        await navigateTo('/login')
      })
    },

    // 刷新令牌
    async refreshAccessToken() {
      if (!this.refreshToken) {
        throw new Error('No refresh token available')
      }

      return withAsyncState(this, async () => {
        const { data } = await $fetch<{
          token: string
          refreshToken: string
        }>('/api/auth/refresh', {
          method: 'POST',
          body: {
            refreshToken: this.refreshToken,
          },
        })

        this.token = data.token
        this.refreshToken = data.refreshToken
        this.setAuthHeader(data.token)

        return data
      })
    },

    // 获取用户信息
    async fetchProfile() {
      return withAsyncState(this, async () => {
        const { data } = await $fetch<{
          user: User
          permissions: Permission[]
        }>('/api/user/profile')

        this.profile = data.user
        this.permissions = data.permissions

        return data
      })
    },

    // 更新用户信息
    async updateProfile(updates: Partial<User>) {
      return withAsyncState(this, async () => {
        const { data } = await $fetch<{ user: User }>('/api/user/profile', {
          method: 'PUT',
          body: updates,
        })

        this.profile = data.user

        return data
      })
    },

    // 更新偏好设置
    async updatePreferences(preferences: Partial<UserPreferences>) {
      return withAsyncState(this, async () => {
        const { data } = await $fetch<{ preferences: UserPreferences }>(
          '/api/user/preferences',
          {
            method: 'PUT',
            body: preferences,
          }
        )

        this.preferences = data.preferences

        return data
      })
    },

    // 修改密码
    async changePassword(passwordData: {
      currentPassword: string
      newPassword: string
    }) {
      return withAsyncState(this, async () => {
        await $fetch('/api/user/password', {
          method: 'PUT',
          body: passwordData,
        })

        return { success: true }
      })
    },

    // 上传头像
    async uploadAvatar(file: File) {
      return withAsyncState(this, async () => {
        const formData = new FormData()
        formData.append('avatar', file)

        const { data } = await $fetch<{ avatarUrl: string }>(
          '/api/user/avatar',
          {
            method: 'POST',
            body: formData,
          }
        )

        if (this.profile) {
          this.profile.avatar = data.avatarUrl
        }

        return data
      })
    },

    // 设置认证头
    setAuthHeader(token: string) {
      // 这里可以设置全局的请求头
      // 或者使用 Nuxt 的 $fetch 配置
    },

    // 清除认证头
    clearAuthHeader() {
      // 清除全局请求头
    },

    // 检查认证状态
    async checkAuth() {
      if (!this.token) {
        this.isAuthenticated = false
        return false
      }

      try {
        await this.fetchProfile()
        this.isAuthenticated = true
        return true
      } catch (error) {
        this.isAuthenticated = false
        this.$reset()
        return false
      }
    },
  },

  persist: {
    key: 'user-store',
    storage: localStorage,
    paths: ['profile', 'preferences', 'token', 'refreshToken', 'isAuthenticated'],
  },
})

// 导出便捷的组合式函数
export const useAuth = () => {
  const store = useUserStore()

  return {
    // 状态
    user: readonly(toRef(store, 'profile')),
    preferences: readonly(toRef(store, 'preferences')),
    permissions: readonly(toRef(store, 'permissions')),
    isAuthenticated: readonly(toRef(store, 'isAuthenticated')),
    isLoading: readonly(toRef(store, 'loading')),
    error: readonly(toRef(store, 'error')),

    // 计算属性
    fullName: computed(() => store.fullName),
    avatar: computed(() => store.avatar),
    roles: computed(() => store.roles),
    isAdmin: computed(() => store.isAdmin),
    isInstructor: computed(() => store.isInstructor),

    // 方法
    login: store.login,
    register: store.register,
    logout: store.logout,
    updateProfile: store.updateProfile,
    updatePreferences: store.updatePreferences,
    changePassword: store.changePassword,
    uploadAvatar: store.uploadAvatar,
    hasPermission: store.hasPermission,
    hasAnyPermission: store.hasAnyPermission,
    hasAllPermissions: store.hasAllPermissions,
    checkAuth: store.checkAuth,
  }
}
```

## 🎨 应用状态管理

### 应用 Store

```typescript
// stores/app.ts
import { defineStore } from 'pinia'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  duration?: number
  persistent?: boolean
  actions?: Array<{
    label: string
    action: () => void
  }>
  createdAt: number
}

interface AppState {
  // 主题设置
  theme: 'light' | 'dark' | 'system'
  
  // 语言设置
  language: string
  
  // 侧边栏状态
  sidebar: {
    collapsed: boolean
    width: number
    mobile: boolean
  }
  
  // 通知系统
  notifications: Notification[]
  
  // 全局加载状态
  globalLoading: boolean
  
  // 网络状态
  online: boolean
  
  // 页面元数据
  pageTitle: string
  breadcrumbs: Array<{
    label: string
    to?: string
  }>
  
  // 模态框状态
  modals: Record<string, boolean>
  
  // 全局设置
  settings: {
    autoSave: boolean
    autoSaveInterval: number
    showTutorial: boolean
    enableAnimations: boolean
    enableSounds: boolean
  }
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    theme: 'system',
    language: 'zh-CN',
    sidebar: {
      collapsed: false,
      width: 280,
      mobile: false,
    },
    notifications: [],
    globalLoading: false,
    online: navigator.onLine,
    pageTitle: '',
    breadcrumbs: [],
    modals: {},
    settings: {
      autoSave: true,
      autoSaveInterval: 30000,
      showTutorial: true,
      enableAnimations: true,
      enableSounds: false,
    },
  }),

  getters: {
    // 当前主题
    currentTheme: (state) => {
      if (state.theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
      }
      return state.theme
    },

    // 未读通知数量
    unreadNotificationsCount: (state) => {
      return state.notifications.length
    },

    // 错误通知
    errorNotifications: (state) => {
      return state.notifications.filter(n => n.type === 'error')
    },

    // 是否显示侧边栏
    shouldShowSidebar: (state) => {
      return !state.sidebar.mobile || !state.sidebar.collapsed
    },

    // 内容区域样式
    contentStyles: (state) => {
      const sidebarWidth = state.sidebar.collapsed ? 64 : state.sidebar.width
      return {
        marginLeft: state.sidebar.mobile ? 0 : `${sidebarWidth}px`,
        transition: 'margin-left 0.3s ease',
      }
    },
  },

  actions: {
    // 设置主题
    setTheme(theme: 'light' | 'dark' | 'system') {
      this.theme = theme
      this.applyTheme()
    },

    // 应用主题
    applyTheme() {
      const theme = this.currentTheme
      document.documentElement.classList.toggle('dark', theme === 'dark')
      document.documentElement.setAttribute('data-theme', theme)
    },

    // 切换主题
    toggleTheme() {
      const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system']
      const currentIndex = themes.indexOf(this.theme)
      const nextIndex = (currentIndex + 1) % themes.length
      this.setTheme(themes[nextIndex])
    },

    // 设置语言
    setLanguage(language: string) {
      this.language = language
      // 这里可以集成 i18n
    },

    // 切换侧边栏
    toggleSidebar() {
      this.sidebar.collapsed = !this.sidebar.collapsed
    },

    // 设置侧边栏状态
    setSidebarCollapsed(collapsed: boolean) {
      this.sidebar.collapsed = collapsed
    },

    // 设置侧边栏宽度
    setSidebarWidth(width: number) {
      this.sidebar.width = Math.max(200, Math.min(400, width))
    },

    // 设置移动端模式
    setMobileMode(mobile: boolean) {
      this.sidebar.mobile = mobile
      if (mobile) {
        this.sidebar.collapsed = true
      }
    },

    // 添加通知
    addNotification(notification: Omit<Notification, 'id' | 'createdAt'>) {
      const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const newNotification: Notification = {
        ...notification,
        id,
        createdAt: Date.now(),
      }

      this.notifications.unshift(newNotification)

      // 自动移除通知
      if (!notification.persistent && notification.duration !== 0) {
        const duration = notification.duration || 5000
        setTimeout(() => {
          this.removeNotification(id)
        }, duration)
      }

      return id
    },

    // 移除通知
    removeNotification(id: string) {
      const index = this.notifications.findIndex(n => n.id === id)
      if (index > -1) {
        this.notifications.splice(index, 1)
      }
    },

    // 清除所有通知
    clearNotifications() {
      this.notifications = []
    },

    // 显示成功通知
    showSuccess(title: string, message?: string) {
      return this.addNotification({
        type: 'success',
        title,
        message: message || '',
      })
    },

    // 显示错误通知
    showError(title: string, message?: string) {
      return this.addNotification({
        type: 'error',
        title,
        message: message || '',
        persistent: true,
      })
    },

    // 显示警告通知
    showWarning(title: string, message?: string) {
      return this.addNotification({
        type: 'warning',
        title,
        message: message || '',
      })
    },

    // 显示信息通知
    showInfo(title: string, message?: string) {
      return this.addNotification({
        type: 'info',
        title,
        message: message || '',
      })
    },

    // 设置全局加载状态
    setGlobalLoading(loading: boolean) {
      this.globalLoading = loading
    },

    // 设置网络状态
    setOnlineStatus(online: boolean) {
      this.online = online
      
      if (!online) {
        this.showWarning('网络连接断开', '请检查您的网络连接')
      } else {
        this.showSuccess('网络连接已恢复')
      }
    },

    // 设置页面标题
    setPageTitle(title: string) {
      this.pageTitle = title
      document.title = title ? `${title} - 学习管理系统` : '学习管理系统'
    },

    // 设置面包屑
    setBreadcrumbs(breadcrumbs: AppState['breadcrumbs']) {
      this.breadcrumbs = breadcrumbs
    },

    // 打开模态框
    openModal(modalId: string) {
      this.modals[modalId] = true
    },

    // 关闭模态框
    closeModal(modalId: string) {
      this.modals[modalId] = false
    },

    // 切换模态框
    toggleModal(modalId: string) {
      this.modals[modalId] = !this.modals[modalId]
    },

    // 更新设置
    updateSettings(settings: Partial<AppState['settings']>) {
      this.settings = { ...this.settings, ...settings }
    },

    // 初始化应用
    async initializeApp() {
      // 应用主题
      this.applyTheme()

      // 监听网络状态
      window.addEventListener('online', () => this.setOnlineStatus(true))
      window.addEventListener('offline', () => this.setOnlineStatus(false))

      // 监听主题变化
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', () => {
        if (this.theme === 'system') {
          this.applyTheme()
        }
      })

      // 监听窗口大小变化
      const handleResize = () => {
        this.setMobileMode(window.innerWidth < 768)
      }
      window.addEventListener('resize', handleResize)
      handleResize()
    },
  },

  persist: {
    key: 'app-store',
    storage: localStorage,
    paths: ['theme', 'language', 'sidebar', 'settings'],
  },
})

// 导出便捷的组合式函数
export const useApp = () => {
  const store = useAppStore()

  return {
    // 状态
    theme: readonly(toRef(store, 'theme')),
    language: readonly(toRef(store, 'language')),
    sidebar: readonly(toRef(store, 'sidebar')),
    notifications: readonly(toRef(store, 'notifications')),
    globalLoading: readonly(toRef(store, 'globalLoading')),
    online: readonly(toRef(store, 'online')),
    pageTitle: readonly(toRef(store, 'pageTitle')),
    breadcrumbs: readonly(toRef(store, 'breadcrumbs')),
    settings: readonly(toRef(store, 'settings')),

    // 计算属性
    currentTheme: computed(() => store.currentTheme),
    unreadNotificationsCount: computed(() => store.unreadNotificationsCount),
    shouldShowSidebar: computed(() => store.shouldShowSidebar),
    contentStyles: computed(() => store.contentStyles),

    // 方法
    setTheme: store.setTheme,
    toggleTheme: store.toggleTheme,
    setLanguage: store.setLanguage,
    toggleSidebar: store.toggleSidebar,
    setSidebarCollapsed: store.setSidebarCollapsed,
    addNotification: store.addNotification,
    removeNotification: store.removeNotification,
    clearNotifications: store.clearNotifications,
    showSuccess: store.showSuccess,
    showError: store.showError,
    showWarning: store.showWarning,
    showInfo: store.showInfo,
    setPageTitle: store.setPageTitle,
    setBreadcrumbs: store.setBreadcrumbs,
    openModal: store.openModal,
    closeModal: store.closeModal,
    toggleModal: store.toggleModal,
    updateSettings: store.updateSettings,
  }
}
```

## 🔄 状态同步与持久化

### 高级持久化配置

```typescript
// plugins/pinia-persistence.ts
import { PiniaPluginContext } from 'pinia'
import { watch } from 'vue'

// 自定义持久化插件
export function createAdvancedPersistence() {
  return ({ store, options }: PiniaPluginContext) => {
    // 获取持久化配置
    const persistConfig = options.persist

    if (!persistConfig) return

    const {
      key = store.$id,
      storage = localStorage,
      paths,
      beforeRestore,
      afterRestore,
      serializer = {
        serialize: JSON.stringify,
        deserialize: JSON.parse,
      },
    } = typeof persistConfig === 'object' ? persistConfig : {}

    // 恢复状态
    const restore = () => {
      try {
        const stored = storage.getItem(key)
        if (!stored) return

        beforeRestore?.(store)

        const data = serializer.deserialize(stored)
        
        if (paths) {
          // 只恢复指定路径的状态
          paths.forEach(path => {
            if (data[path] !== undefined) {
              store.$patch({ [path]: data[path] })
            }
          })
        } else {
          // 恢复所有状态
          store.$patch(data)
        }

        afterRestore?.(store)
      } catch (error) {
        console.error(`Failed to restore store ${store.$id}:`, error)
      }
    }

    // 保存状态
    const persist = () => {
      try {
        const data = paths
          ? paths.reduce((acc, path) => {
              acc[path] = store[path]
              return acc
            }, {} as any)
          : store.$state

        storage.setItem(key, serializer.serialize(data))
      } catch (error) {
        console.error(`Failed to persist store ${store.$id}:`, error)
      }
    }

    // 初始恢复
    restore()

    // 监听状态变化并持久化
    store.$subscribe(
      (mutation, state) => {
        persist()
      },
      { detached: true }
    )
  }
}

// 状态同步插件
export function createStateSyncPlugin() {
  return ({ store }: PiniaPluginContext) => {
    // 跨标签页状态同步
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === store.$id && e.newValue) {
          try {
            const newState = JSON.parse(e.newValue)
            store.$patch(newState)
          } catch (error) {
            console.error('Failed to sync state:', error)
          }
        }
      })
    }

    // 添加状态同步方法
    store.syncState = (targetStore: any) => {
      watch(
        () => store.$state,
        (newState) => {
          targetStore.$patch(newState)
        },
        { deep: true }
      )
    }
  }
}
```

### 状态迁移系统

```typescript
// utils/state-migration.ts
interface MigrationConfig {
  version: number
  migrations: Record<number, (state: any) => any>
}

export class StateMigration {
  private config: MigrationConfig

  constructor(config: MigrationConfig) {
    this.config = config
  }

  // 迁移状态
  migrate(state: any): any {
    const currentVersion = state._version || 0
    const targetVersion = this.config.version

    if (currentVersion >= targetVersion) {
      return state
    }

    let migratedState = { ...state }

    // 逐步执行迁移
    for (let version = currentVersion + 1; version <= targetVersion; version++) {
      const migration = this.config.migrations[version]
      if (migration) {
        migratedState = migration(migratedState)
      }
    }

    // 更新版本号
    migratedState._version = targetVersion

    return migratedState
  }

  // 检查是否需要迁移
  needsMigration(state: any): boolean {
    const currentVersion = state._version || 0
    return currentVersion < this.config.version
  }
}

// 用户状态迁移配置
export const userStateMigration = new StateMigration({
  version: 3,
  migrations: {
    1: (state) => ({
      ...state,
      preferences: {
        ...state.preferences,
        theme: state.theme || 'system', // 迁移旧的主题设置
      },
    }),
    2: (state) => ({
      ...state,
      permissions: state.permissions || [], // 添加权限字段
    }),
    3: (state) => ({
      ...state,
      preferences: {
        ...state.preferences,
        notifications: {
          email: true,
          push: true,
          sms: false,
          ...state.preferences.notifications,
        },
      },
    }),
  },
})
```

## 🧪 实践练习

1. **实现状态时间旅行调试**
   - 记录状态变化历史
   - 实现撤销/重做功能
   - 添加状态快照功能

2. **构建实时状态同步**
   - WebSocket 状态同步
   - 冲突解决机制
   - 离线状态处理

3. **优化状态管理性能**
   - 状态分片和懒加载
   - 计算属性缓存优化
   - 大数据集处理策略

## 💭 思考题

1. **如何设计一个可扩展的状态管理架构？**
   - 模块化设计原则
   - 状态依赖关系管理
   - 插件系统设计

2. **状态持久化的安全性如何保障？**
   - 敏感数据加密存储
   - 状态完整性验证
   - 跨域安全考虑

3. **如何处理复杂的状态同步场景？**
   - 多用户协作状态
   - 实时数据更新
   - 网络异常处理

## 🎉 小结

通过这一章的学习，我们构建了一个完整的状态管理系统。从基础概念到高级模式，从单一 Store 到复杂的状态生态系统，我们掌握了现代前端应用状态管理的核心技能。

我们学到了：
- ✅ Pinia 的高级用法和最佳实践
- ✅ 模块化状态管理架构设计
- ✅ 状态持久化和同步机制
- ✅ 响应式数据流系统构建
- ✅ 性能优化和开发体验提升

一个优秀的状态管理系统就像是应用的神经系统，它连接着各个组件，协调着数据的流动，确保应用的稳定运行。在下一章中，我们将探索 API 集成与数据获取的高级技巧，学习如何构建高效、可靠的数据层。

---

**下一章预告：** 《API 集成与数据获取》- 我们将深入学习现代 API 集成模式，包括 RESTful API、GraphQL、实时通信、错误处理、缓存策略等核心技术。