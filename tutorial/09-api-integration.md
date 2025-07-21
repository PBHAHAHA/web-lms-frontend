# 第九章：API 集成与数据获取

"数据是新时代的石油，而 API 就是输送这些石油的管道。" —— 克林特·布朗

在现代 Web 应用中，数据是应用的生命线。就像人体需要血液循环来输送营养一样，Web 应用需要通过 API 来获取、传输和处理数据。一个设计良好的数据层不仅能提供流畅的用户体验，还能确保应用的可扩展性和可维护性。

随着应用复杂度的增加，我们面临着越来越多的挑战：如何处理异步数据获取？如何实现智能缓存？如何优雅地处理错误？如何确保数据的一致性？这些问题的答案将决定我们应用的质量和用户体验。

Nuxt 3 提供了强大的数据获取工具，包括 `$fetch`、`useFetch`、`useLazyFetch` 等，这些工具不仅简化了 API 调用，还提供了缓存、错误处理、类型安全等高级功能。结合现代的 API 设计模式，我们可以构建出既高效又可靠的数据层。

今天，我们将深入探索 API 集成的最佳实践，从基础的 HTTP 请求到复杂的数据流管理，从 RESTful API 到 GraphQL，从同步调用到实时通信，全面掌握现代 Web 应用的数据处理技术。

## 🎯 本章目标

- 掌握 Nuxt 3 的数据获取 API
- 实现智能缓存和错误处理机制
- 构建类型安全的 API 客户端
- 集成 GraphQL 和实时通信
- 优化数据获取性能和用户体验

## 🔧 API 客户端架构

### 基础 HTTP 客户端

```typescript
// utils/api.ts
import type { FetchOptions } from 'ofetch'

// API 响应类型
export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
  timestamp: number
}

// 分页响应类型
export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// 错误响应类型
export interface ApiError {
  code: string
  message: string
  details?: any
  timestamp: number
}

// 请求配置类型
export interface RequestConfig extends FetchOptions {
  skipAuth?: boolean
  skipErrorHandler?: boolean
  timeout?: number
  retries?: number
  cache?: boolean | number
}

// API 客户端类
export class ApiClient {
  private baseURL: string
  private defaultConfig: RequestConfig

  constructor(baseURL: string, defaultConfig: RequestConfig = {}) {
    this.baseURL = baseURL
    this.defaultConfig = {
      timeout: 10000,
      retries: 3,
      cache: true,
      ...defaultConfig,
    }
  }

  // 创建请求配置
  private createConfig(config: RequestConfig = {}): RequestConfig {
    const mergedConfig = { ...this.defaultConfig, ...config }
    
    // 设置请求头
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...mergedConfig.headers,
    }

    // 添加认证头
    if (!mergedConfig.skipAuth) {
      const { token } = useUserStore()
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
    }

    return {
      ...mergedConfig,
      headers,
      baseURL: this.baseURL,
    }
  }

  // 处理响应
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type')
    
    if (contentType?.includes('application/json')) {
      const data = await response.json()
      
      if (!response.ok) {
        throw new ApiError({
          code: data.code || 'API_ERROR',
          message: data.message || 'API 请求失败',
          details: data.details,
          timestamp: Date.now(),
        })
      }
      
      return data
    } else {
      if (!response.ok) {
        throw new ApiError({
          code: 'HTTP_ERROR',
          message: `HTTP ${response.status}: ${response.statusText}`,
          timestamp: Date.now(),
        })
      }
      
      const text = await response.text()
      return {
        data: text as T,
        success: true,
        timestamp: Date.now(),
      }
    }
  }

  // 处理错误
  private handleError(error: any): never {
    if (error instanceof ApiError) {
      throw error
    }

    // 网络错误
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new ApiError({
        code: 'NETWORK_ERROR',
        message: '网络连接失败，请检查您的网络设置',
        timestamp: Date.now(),
      })
    }

    // 超时错误
    if (error.name === 'AbortError') {
      throw new ApiError({
        code: 'TIMEOUT_ERROR',
        message: '请求超时，请稍后重试',
        timestamp: Date.now(),
      })
    }

    // 其他错误
    throw new ApiError({
      code: 'UNKNOWN_ERROR',
      message: error.message || '未知错误',
      details: error,
      timestamp: Date.now(),
    })
  }

  // GET 请求
  async get<T = any>(url: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    try {
      const response = await $fetch.raw(url, {
        ...this.createConfig(config),
        method: 'GET',
      })
      
      return this.handleResponse<T>(response._data)
    } catch (error) {
      return this.handleError(error)
    }
  }

  // POST 请求
  async post<T = any>(
    url: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await $fetch.raw(url, {
        ...this.createConfig(config),
        method: 'POST',
        body: data,
      })
      
      return this.handleResponse<T>(response._data)
    } catch (error) {
      return this.handleError(error)
    }
  }

  // PUT 请求
  async put<T = any>(
    url: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await $fetch.raw(url, {
        ...this.createConfig(config),
        method: 'PUT',
        body: data,
      })
      
      return this.handleResponse<T>(response._data)
    } catch (error) {
      return this.handleError(error)
    }
  }

  // DELETE 请求
  async delete<T = any>(url: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    try {
      const response = await $fetch.raw(url, {
        ...this.createConfig(config),
        method: 'DELETE',
      })
      
      return this.handleResponse<T>(response._data)
    } catch (error) {
      return this.handleError(error)
    }
  }

  // 文件上传
  async upload<T = any>(
    url: string,
    file: File | FormData,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    try {
      const formData = file instanceof FormData ? file : new FormData()
      if (file instanceof File) {
        formData.append('file', file)
      }

      const uploadConfig = {
        ...this.createConfig(config),
        method: 'POST',
        body: formData,
      }

      // 移除 Content-Type，让浏览器自动设置
      delete uploadConfig.headers['Content-Type']

      const response = await $fetch.raw(url, uploadConfig)
      
      return this.handleResponse<T>(response._data)
    } catch (error) {
      return this.handleError(error)
    }
  }
}

// 创建默认 API 客户端实例
export const apiClient = new ApiClient('/api')

// 自定义错误类
export class ApiError extends Error {
  code: string
  details?: any
  timestamp: number

  constructor(error: { code: string; message: string; details?: any; timestamp: number }) {
    super(error.message)
    this.name = 'ApiError'
    this.code = error.code
    this.details = error.details
    this.timestamp = error.timestamp
  }
}
```

### 智能缓存系统

```typescript
// composables/useApiCache.ts
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  key: string
}

interface CacheOptions {
  ttl?: number // 缓存时间（毫秒）
  staleWhileRevalidate?: boolean // 是否在后台更新
  maxAge?: number // 最大缓存时间
  tags?: string[] // 缓存标签，用于批量清除
}

export class ApiCache {
  private cache = new Map<string, CacheEntry<any>>()
  private tagMap = new Map<string, Set<string>>()

  // 生成缓存键
  private generateKey(url: string, params?: any): string {
    const paramStr = params ? JSON.stringify(params) : ''
    return `${url}:${paramStr}`
  }

  // 设置缓存
  set<T>(
    url: string,
    data: T,
    options: CacheOptions = {},
    params?: any
  ): void {
    const key = this.generateKey(url, params)
    const ttl = options.ttl || 5 * 60 * 1000 // 默认 5 分钟
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      key,
    }

    this.cache.set(key, entry)

    // 处理标签
    if (options.tags) {
      options.tags.forEach(tag => {
        if (!this.tagMap.has(tag)) {
          this.tagMap.set(tag, new Set())
        }
        this.tagMap.get(tag)!.add(key)
      })
    }

    // 设置过期清理
    setTimeout(() => {
      this.delete(key)
    }, ttl)
  }

  // 获取缓存
  get<T>(url: string, params?: any): T | null {
    const key = this.generateKey(url, params)
    const entry = this.cache.get(key)

    if (!entry) return null

    const now = Date.now()
    const isExpired = now - entry.timestamp > entry.ttl

    if (isExpired) {
      this.delete(key)
      return null
    }

    return entry.data
  }

  // 检查是否过期但仍可用（用于 stale-while-revalidate）
  isStale<T>(url: string, params?: any): boolean {
    const key = this.generateKey(url, params)
    const entry = this.cache.get(key)

    if (!entry) return false

    const now = Date.now()
    const staleTime = entry.ttl * 0.8 // 80% 的时间后认为是 stale

    return now - entry.timestamp > staleTime
  }

  // 删除缓存
  delete(key: string): boolean {
    // 从标签映射中移除
    this.tagMap.forEach((keys, tag) => {
      keys.delete(key)
      if (keys.size === 0) {
        this.tagMap.delete(tag)
      }
    })

    return this.cache.delete(key)
  }

  // 根据标签清除缓存
  invalidateByTag(tag: string): void {
    const keys = this.tagMap.get(tag)
    if (keys) {
      keys.forEach(key => this.cache.delete(key))
      this.tagMap.delete(tag)
    }
  }

  // 清除所有缓存
  clear(): void {
    this.cache.clear()
    this.tagMap.clear()
  }

  // 获取缓存统计
  getStats() {
    return {
      size: this.cache.size,
      tags: this.tagMap.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        timestamp: entry.timestamp,
        ttl: entry.ttl,
        age: Date.now() - entry.timestamp,
      })),
    }
  }
}

// 创建全局缓存实例
export const apiCache = new ApiCache()

// 缓存装饰器
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: CacheOptions = {}
): T {
  return (async (...args: any[]) => {
    const cacheKey = `${fn.name}:${JSON.stringify(args)}`
    
    // 尝试从缓存获取
    const cached = apiCache.get(cacheKey)
    if (cached && !apiCache.isStale(cacheKey)) {
      return cached
    }

    // 如果是 stale-while-revalidate，返回旧数据并在后台更新
    if (cached && options.staleWhileRevalidate) {
      // 后台更新
      fn(...args).then(result => {
        apiCache.set(cacheKey, result, options)
      })
      return cached
    }

    // 执行函数并缓存结果
    const result = await fn(...args)
    apiCache.set(cacheKey, result, options)
    
    return result
  }) as T
}
```

## 📡 数据获取 Composables

### 通用数据获取

```typescript
// composables/useApi.ts
import type { FetchOptions } from 'ofetch'

interface UseApiOptions<T> extends FetchOptions {
  immediate?: boolean
  cache?: boolean | number
  transform?: (data: any) => T
  onError?: (error: any) => void
  onSuccess?: (data: T) => void
  retry?: number
  retryDelay?: number
}

interface UseApiReturn<T> {
  data: Ref<T | null>
  pending: Ref<boolean>
  error: Ref<any>
  refresh: () => Promise<void>
  execute: () => Promise<void>
  clear: () => void
}

export function useApi<T = any>(
  url: MaybeRef<string>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T> {
  const {
    immediate = true,
    cache = true,
    transform,
    onError,
    onSuccess,
    retry = 3,
    retryDelay = 1000,
    ...fetchOptions
  } = options

  // 响应式状态
  const data = ref<T | null>(null)
  const pending = ref(false)
  const error = ref<any>(null)

  // 执行请求
  const execute = async () => {
    const urlValue = unref(url)
    if (!urlValue) return

    pending.value = true
    error.value = null

    let attempts = 0
    
    while (attempts <= retry) {
      try {
        const response = await $fetch(urlValue, {
          ...fetchOptions,
          // 缓存配置
          ...(cache && {
            key: `api:${urlValue}:${JSON.stringify(fetchOptions)}`,
            server: false,
          }),
        })

        // 数据转换
        const transformedData = transform ? transform(response) : response
        data.value = transformedData

        // 成功回调
        onSuccess?.(transformedData)
        
        break
      } catch (err: any) {
        attempts++
        
        if (attempts > retry) {
          error.value = err
          onError?.(err)
          break
        }
        
        // 重试延迟
        if (attempts <= retry) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempts))
        }
      }
    }

    pending.value = false
  }

  // 刷新数据
  const refresh = async () => {
    await execute()
  }

  // 清除数据
  const clear = () => {
    data.value = null
    error.value = null
    pending.value = false
  }

  // 监听 URL 变化
  watch(
    () => unref(url),
    () => {
      if (immediate) {
        execute()
      }
    },
    { immediate }
  )

  return {
    data: readonly(data),
    pending: readonly(pending),
    error: readonly(error),
    refresh,
    execute,
    clear,
  }
}

// 分页数据获取
export function usePaginatedApi<T = any>(
  url: MaybeRef<string>,
  options: UseApiOptions<PaginatedResponse<T>> & {
    initialPage?: number
    initialLimit?: number
  } = {}
) {
  const {
    initialPage = 1,
    initialLimit = 10,
    ...apiOptions
  } = options

  const page = ref(initialPage)
  const limit = ref(initialLimit)
  const total = ref(0)
  const totalPages = ref(0)

  // 构建带分页参数的 URL
  const paginatedUrl = computed(() => {
    const baseUrl = unref(url)
    if (!baseUrl) return ''
    
    const params = new URLSearchParams()
    params.set('page', page.value.toString())
    params.set('limit', limit.value.toString())
    
    return `${baseUrl}?${params.toString()}`
  })

  const {
    data,
    pending,
    error,
    refresh,
    execute,
    clear,
  } = useApi<PaginatedResponse<T>>(paginatedUrl, {
    ...apiOptions,
    onSuccess: (response) => {
      total.value = response.pagination.total
      totalPages.value = response.pagination.totalPages
      apiOptions.onSuccess?.(response)
    },
  })

  // 分页方法
  const nextPage = async () => {
    if (page.value < totalPages.value) {
      page.value++
    }
  }

  const prevPage = async () => {
    if (page.value > 1) {
      page.value--
    }
  }

  const goToPage = async (targetPage: number) => {
    if (targetPage >= 1 && targetPage <= totalPages.value) {
      page.value = targetPage
    }
  }

  const setLimit = async (newLimit: number) => {
    limit.value = newLimit
    page.value = 1 // 重置到第一页
  }

  return {
    // 数据状态
    data,
    pending,
    error,
    
    // 分页状态
    page: readonly(page),
    limit: readonly(limit),
    total: readonly(total),
    totalPages: readonly(totalPages),
    
    // 计算属性
    hasNext: computed(() => page.value < totalPages.value),
    hasPrev: computed(() => page.value > 1),
    items: computed(() => data.value?.data || []),
    
    // 方法
    refresh,
    execute,
    clear,
    nextPage,
    prevPage,
    goToPage,
    setLimit,
  }
}

// 无限滚动数据获取
export function useInfiniteApi<T = any>(
  url: MaybeRef<string>,
  options: UseApiOptions<PaginatedResponse<T>> & {
    initialLimit?: number
  } = {}
) {
  const { initialLimit = 10, ...apiOptions } = options

  const page = ref(1)
  const limit = ref(initialLimit)
  const allData = ref<T[]>([])
  const hasMore = ref(true)
  const loading = ref(false)
  const error = ref<any>(null)

  // 加载更多数据
  const loadMore = async () => {
    if (loading.value || !hasMore.value) return

    loading.value = true
    error.value = null

    try {
      const baseUrl = unref(url)
      if (!baseUrl) return

      const params = new URLSearchParams()
      params.set('page', page.value.toString())
      params.set('limit', limit.value.toString())

      const response = await $fetch<PaginatedResponse<T>>(
        `${baseUrl}?${params.toString()}`,
        apiOptions
      )

      // 追加数据
      allData.value.push(...response.data)
      
      // 更新状态
      hasMore.value = response.pagination.hasNext
      page.value++

      apiOptions.onSuccess?.(response)
    } catch (err: any) {
      error.value = err
      apiOptions.onError?.(err)
    } finally {
      loading.value = false
    }
  }

  // 重置数据
  const reset = () => {
    page.value = 1
    allData.value = []
    hasMore.value = true
    error.value = null
  }

  // 刷新数据
  const refresh = async () => {
    reset()
    await loadMore()
  }

  // 初始加载
  onMounted(() => {
    loadMore()
  })

  return {
    data: readonly(allData),
    loading: readonly(loading),
    error: readonly(error),
    hasMore: readonly(hasMore),
    loadMore,
    refresh,
    reset,
  }
}
```

### 实时数据同步

```typescript
// composables/useWebSocket.ts
interface WebSocketOptions {
  reconnect?: boolean
  reconnectInterval?: number
  maxReconnectAttempts?: number
  heartbeat?: boolean
  heartbeatInterval?: number
  onOpen?: (event: Event) => void
  onMessage?: (data: any) => void
  onError?: (event: Event) => void
  onClose?: (event: CloseEvent) => void
}

interface UseWebSocketReturn {
  status: Ref<'connecting' | 'connected' | 'disconnected' | 'error'>
  data: Ref<any>
  send: (data: any) => void
  close: () => void
  reconnect: () => void
}

export function useWebSocket(
  url: MaybeRef<string>,
  options: WebSocketOptions = {}
): UseWebSocketReturn {
  const {
    reconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    heartbeat = true,
    heartbeatInterval = 30000,
    onOpen,
    onMessage,
    onError,
    onClose,
  } = options

  const status = ref<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const data = ref<any>(null)
  
  let ws: WebSocket | null = null
  let reconnectAttempts = 0
  let heartbeatTimer: NodeJS.Timeout | null = null

  // 连接 WebSocket
  const connect = () => {
    const wsUrl = unref(url)
    if (!wsUrl) return

    status.value = 'connecting'
    ws = new WebSocket(wsUrl)

    ws.onopen = (event) => {
      status.value = 'connected'
      reconnectAttempts = 0
      
      // 启动心跳
      if (heartbeat) {
        startHeartbeat()
      }
      
      onOpen?.(event)
    }

    ws.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data)
        data.value = parsedData
        onMessage?.(parsedData)
      } catch (error) {
        data.value = event.data
        onMessage?.(event.data)
      }
    }

    ws.onerror = (event) => {
      status.value = 'error'
      onError?.(event)
    }

    ws.onclose = (event) => {
      status.value = 'disconnected'
      stopHeartbeat()
      
      // 自动重连
      if (reconnect && reconnectAttempts < maxReconnectAttempts) {
        setTimeout(() => {
          reconnectAttempts++
          connect()
        }, reconnectInterval)
      }
      
      onClose?.(event)
    }
  }

  // 发送数据
  const send = (data: any) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const message = typeof data === 'string' ? data : JSON.stringify(data)
      ws.send(message)
    }
  }

  // 关闭连接
  const close = () => {
    if (ws) {
      ws.close()
      ws = null
    }
    stopHeartbeat()
  }

  // 手动重连
  const reconnectManually = () => {
    close()
    reconnectAttempts = 0
    connect()
  }

  // 启动心跳
  const startHeartbeat = () => {
    heartbeatTimer = setInterval(() => {
      send({ type: 'ping' })
    }, heartbeatInterval)
  }

  // 停止心跳
  const stopHeartbeat = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
  }

  // 监听 URL 变化
  watch(
    () => unref(url),
    () => {
      close()
      connect()
    },
    { immediate: true }
  )

  // 组件卸载时清理
  onUnmounted(() => {
    close()
  })

  return {
    status: readonly(status),
    data: readonly(data),
    send,
    close,
    reconnect: reconnectManually,
  }
}

// 实时数据同步
export function useRealtimeData<T = any>(
  endpoint: string,
  options: {
    wsUrl?: string
    pollInterval?: number
    enableWebSocket?: boolean
    enablePolling?: boolean
  } = {}
) {
  const {
    wsUrl = `ws://localhost:3001/ws/${endpoint}`,
    pollInterval = 30000,
    enableWebSocket = true,
    enablePolling = false,
  } = options

  const data = ref<T | null>(null)
  const lastUpdated = ref<number>(0)
  const isConnected = ref(false)

  // WebSocket 连接
  const { status: wsStatus, data: wsData } = useWebSocket(
    enableWebSocket ? wsUrl : '',
    {
      onMessage: (message) => {
        if (message.type === 'data') {
          data.value = message.data
          lastUpdated.value = Date.now()
        }
      },
    }
  )

  // 轮询
  let pollTimer: NodeJS.Timeout | null = null
  
  const startPolling = () => {
    if (!enablePolling) return
    
    pollTimer = setInterval(async () => {
      try {
        const response = await $fetch<ApiResponse<T>>(`/api/${endpoint}`)
        data.value = response.data
        lastUpdated.value = Date.now()
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, pollInterval)
  }

  const stopPolling = () => {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  // 监听连接状态
  watch(wsStatus, (status) => {
    isConnected.value = status === 'connected'
    
    if (enablePolling) {
      if (status === 'connected') {
        stopPolling()
      } else {
        startPolling()
      }
    }
  })

  // 初始化
  onMounted(() => {
    if (enablePolling && !enableWebSocket) {
      startPolling()
    }
  })

  // 清理
  onUnmounted(() => {
    stopPolling()
  })

  return {
    data: readonly(data),
    lastUpdated: readonly(lastUpdated),
    isConnected: readonly(isConnected),
  }
}
```

## 🔄 GraphQL 集成

### GraphQL 客户端

```typescript
// utils/graphql.ts
interface GraphQLResponse<T = any> {
  data?: T
  errors?: Array<{
    message: string
    locations?: Array<{ line: number; column: number }>
    path?: string[]
  }>
}

interface GraphQLOptions {
  variables?: Record<string, any>
  headers?: Record<string, string>
  cache?: boolean
}

export class GraphQLClient {
  private endpoint: string
  private defaultHeaders: Record<string, string>

  constructor(endpoint: string, defaultHeaders: Record<string, string> = {}) {
    this.endpoint = endpoint
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    }
  }

  // 执行查询
  async query<T = any>(
    query: string,
    options: GraphQLOptions = {}
  ): Promise<T> {
    const { variables, headers, cache } = options

    const response = await $fetch<GraphQLResponse<T>>(this.endpoint, {
      method: 'POST',
      headers: {
        ...this.defaultHeaders,
        ...headers,
      },
      body: {
        query,
        variables,
      },
      ...(cache && { key: `gql:${query}:${JSON.stringify(variables)}` }),
    })

    if (response.errors) {
      throw new Error(response.errors[0].message)
    }

    return response.data!
  }

  // 执行变更
  async mutate<T = any>(
    mutation: string,
    options: GraphQLOptions = {}
  ): Promise<T> {
    return this.query<T>(mutation, options)
  }

  // 订阅（WebSocket）
  subscribe<T = any>(
    subscription: string,
    options: GraphQLOptions & {
      onData?: (data: T) => void
      onError?: (error: any) => void
    } = {}
  ) {
    // 这里需要实现 WebSocket 订阅逻辑
    // 可以使用 graphql-ws 或类似库
  }
}

// 创建 GraphQL 客户端实例
export const graphqlClient = new GraphQLClient('/api/graphql')

// GraphQL 查询 composable
export function useGraphQL<T = any>(
  query: MaybeRef<string>,
  options: GraphQLOptions & {
    immediate?: boolean
    variables?: MaybeRef<Record<string, any>>
  } = {}
) {
  const { immediate = true, variables, ...gqlOptions } = options

  const data = ref<T | null>(null)
  const pending = ref(false)
  const error = ref<any>(null)

  const execute = async () => {
    const queryValue = unref(query)
    const variablesValue = unref(variables)

    if (!queryValue) return

    pending.value = true
    error.value = null

    try {
      const result = await graphqlClient.query<T>(queryValue, {
        ...gqlOptions,
        variables: variablesValue,
      })
      data.value = result
    } catch (err) {
      error.value = err
    } finally {
      pending.value = false
    }
  }

  // 监听查询和变量变化
  watch(
    [() => unref(query), () => unref(variables)],
    () => {
      if (immediate) {
        execute()
      }
    },
    { immediate, deep: true }
  )

  return {
    data: readonly(data),
    pending: readonly(pending),
    error: readonly(error),
    execute,
    refetch: execute,
  }
}
```

## 🧪 实践练习

1. **实现请求拦截器**
   - 自动添加认证头
   - 请求/响应日志记录
   - 错误统一处理

2. **构建离线支持**
   - 请求队列管理
   - 数据同步机制
   - 冲突解决策略

3. **优化数据获取性能**
   - 请求去重
   - 并发控制
   - 预加载策略

## 💭 思考题

1. **如何设计一个高效的缓存策略？**
   - 缓存层级设计
   - 缓存失效机制
   - 内存使用优化

2. **API 版本管理如何处理？**
   - 向后兼容性
   - 渐进式迁移
   - 版本协商机制

3. **如何处理大数据量的 API 响应？**
   - 流式处理
   - 分块加载
   - 虚拟化技术

## 🎉 小结

通过这一章的学习，我们构建了一个完整的 API 集成系统。从基础的 HTTP 客户端到复杂的实时数据同步，从 RESTful API 到 GraphQL，我们掌握了现代 Web 应用数据层的核心技术。

我们学到了：
- ✅ 类型安全的 API 客户端设计
- ✅ 智能缓存和错误处理机制
- ✅ 响应式数据获取 Composables
- ✅ 实时数据同步和 WebSocket 集成
- ✅ GraphQL 客户端和查询优化

一个优秀的数据层就像是应用的血管系统，它确保数据能够高效、可靠地在各个组件间流动。在下一章中，我们将探索性能优化与部署的最佳实践，学习如何让我们的应用在生产环境中表现出色。

---

**下一章预告：** 《性能优化与部署》- 我们将深入学习前端性能优化技巧，包括代码分割、懒加载、缓存策略、构建优化、部署配置等关键技术，确保应用在生产环境中的最佳表现。