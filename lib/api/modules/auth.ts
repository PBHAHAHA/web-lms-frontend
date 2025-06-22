import { useApi } from '../index'

// 认证相关类型定义
export interface LoginParams {
  username: string
  password: string
}


// 认证相关API
export const useAuthApi = () => {
  const api = useApi()
  
  return {
    // 登录
    login: (data: LoginParams) => {
      console.log(data, "登录数据2")    
      return api.post<any>('/auth/login', data)
    },
   
  }
}