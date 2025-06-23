import { useAuthApi, type LoginParams, type RegisterParams } from '~/lib/api/modules/auth'

export const useAuth = () => {
  const authApi = useAuthApi()
  
  // 检查是否已登录
  const isLoggedIn = computed(() => {
    const authCookie = useCookie("authorized-token")
    return !!authCookie.value
  })
  
  // 登录
  const login = async (params: LoginParams) => {
    console.log(params, "登录数据1")
    try {
      const response = await authApi.login(params)
      
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
      return response
    }
    catch (error) {
      console.error('获取登录用户信息失败:', error)
      throw error
    }
  }
  
  return {
    // 状态
    isLoggedIn,
    
    // 方法
    login,
    register,
    getLoginUser,
  }
} 