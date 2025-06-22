import { useAuthApi, type LoginParams } from '~/lib/api/modules/auth'

export const useAuth = () => {
  const authApi = useAuthApi()
  
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


  
  return {

    // 方法
    login,
  }
} 