import { useAuthApi, type LoginParams, type RegisterParams, type LoginUserResponse, type LoginResponse } from '~/lib/api/modules/auth'

export const useAuth = () => {
  const authApi = useAuthApi()
  const storage = useStorage()
  
  // 持久化的用户信息状态（存储到 localStorage）
  const userInfo = ref<LoginUserResponse | null>(null)
  
  // 存储键名
  const USER_INFO_KEY = 'user-info'
  const LOGIN_TIME_KEY = 'login-time'
  const TOKEN_INFO_KEY = 'token-info'
  
  // 从 localStorage 恢复用户信息
  const restoreUserInfo = () => {
    const stored = storage.getItem<LoginUserResponse>(USER_INFO_KEY)
    if (stored) {
      userInfo.value = stored
    }
  }
  
  // 保存用户信息到 localStorage
  const saveUserInfo = (data: LoginUserResponse | null) => {
    if (data) {
      storage.setItem(USER_INFO_KEY, data)
      storage.setItem(LOGIN_TIME_KEY, Date.now()) // 记录登录时间
    } else {
      storage.removeItem(USER_INFO_KEY)
      storage.removeItem(LOGIN_TIME_KEY)
      storage.removeItem(TOKEN_INFO_KEY) // 清除 token 信息
    }
    userInfo.value = data
  }
  
  // 保存 token 信息到 localStorage（备份）
  const saveTokenInfo = (tokenName: string, tokenValue: string) => {
    storage.setItem(TOKEN_INFO_KEY, {
      tokenName,
      tokenValue,
      timestamp: Date.now()
    })
  }
  
  // 检查是否已登录
  const isLoggedIn = computed(() => {
    const authCookie = useCookie("authorized-token")
    return !!authCookie.value
  })
  
  // 获取登录时间
  const getLoginTime = (): number | null => {
    return storage.getItem<number>(LOGIN_TIME_KEY)
  }
  
  // 获取登录持续时间（毫秒）
  const getLoginDuration = (): number => {
    const loginTime = getLoginTime()
    return loginTime ? Date.now() - loginTime : 0
  }
  
  // 检查会话是否有效（可选，基于时间）
  const isSessionValid = (maxDurationMs: number = 24 * 60 * 60 * 1000): boolean => {
    if (!isLoggedIn.value) return false
    const duration = getLoginDuration()
    return duration < maxDurationMs
  }
  
  // 初始化时恢复用户信息
  if (process.client) {
    restoreUserInfo()
  }
  
  // 登录
  const login = async (params: LoginParams) => {
    console.log(params, "登录数据1")
    try {
      const response = await authApi.login(params)
      console.log('登录成功:', response)
      
      // 从登录响应中提取用户信息
      if (response && response.data && response.data.loginId) {
        try {
          // 解析 loginId 中的用户信息（JSON 字符串）
          const userData = JSON.parse(response.data.loginId)
          console.log('解析用户信息成功:', userData)
          
          // 存储用户信息到状态中（持久化）
          const parsedUserInfo = {
            id: userData.id?.toString() || '',
            username: userData.userName || ''
          }
          saveUserInfo(parsedUserInfo)
          
          // 存储 token 信息到 cookie
          const authToken = useCookie("authorized-token")
          const tokenName = useCookie("token-name")
          
          authToken.value = response.data.tokenValue
          tokenName.value = response.data.tokenName
          
          // 备份 token 信息到 localStorage
          saveTokenInfo(response.data.tokenName, response.data.tokenValue)
          
          console.log('Token信息已保存:', {
            tokenName: response.data.tokenName,
            tokenValue: response.data.tokenValue
          })
          
                      return {
              loginResponse: response,
              userInfo: parsedUserInfo,
              token: response.data.tokenValue
            }
        } catch (parseError) {
          console.warn('解析用户信息失败:', parseError)
          // 即使解析失败，仍然保存 token 信息
          const authToken = useCookie("authorized-token")
          const tokenName = useCookie("token-name")
          
          authToken.value = response.data.tokenValue
          tokenName.value = response.data.tokenName
          
          // 备份 token 信息到 localStorage
          saveTokenInfo(response.data.tokenName, response.data.tokenValue)
          
          return {
            loginResponse: response,
            userInfo: null,
            token: response.data.tokenValue
          }
        }
      }
      
      return response
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }

  // 注册
  const register = async (params: RegisterParams) => {
    try {
      const response = await authApi.register(params)
      return response
    } catch (error) {
      console.error('注册失败:', error)
      throw error
    }
  }

  // 获取登录用户信息
  const getLoginUser = async () => {
    try {
      const response = await authApi.getLoginUser()
      // 更新用户信息状态（持久化）
      saveUserInfo(response)
      return response
    }
    catch (error) {
      console.error('获取登录用户信息失败:', error)
      throw error
    }
  }

  // 登出
  const logout = () => {
    // 清除认证相关的 cookie
    const authCookie = useCookie("authorized-token")
    const tokenName = useCookie("token-name")
    
    authCookie.value = null
    tokenName.value = null
    
    // 清除用户信息（包括 localStorage）
    saveUserInfo(null)
    
    console.log('用户已登出，已清除所有认证信息')
  }

  // 初始化时检查登录状态
  const initAuth = () => {
    // 恢复用户信息
    restoreUserInfo()
    
    // 检查登录状态一致性
    if (isLoggedIn.value) {
      console.log('用户已登录，token 存在')
      if (!userInfo.value) {
        console.warn('Token 存在但用户信息缺失，可能需要重新登录')
      }
    } else {
      console.log('用户未登录')
      // 清理可能残留的用户信息
      if (userInfo.value) {
        saveUserInfo(null)
      }
    }
  }
  
  return {
    // 状态
    isLoggedIn,
    userInfo: readonly(userInfo), // 只读的用户信息
    
    // 方法
    login,
    register,
    getLoginUser,
    logout,
    initAuth,
    
    // 会话管理
    getLoginTime,
    getLoginDuration,
    isSessionValid,
  }
} 