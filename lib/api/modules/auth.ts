import { useApi } from '../index'

// 认证相关类型定义
export interface LoginParams {
  username: string
  password: string
}

export interface RegisterParams {
  username: string
  password: string
  code: string
}

export interface LoginUserResponse {
  id: string
  username: string
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
    register: (data: RegisterParams) => {
      return api.post<any>('/auth/registered', data)
    },
    getLoginUser: () => {
      return api.get<LoginUserResponse>('/auth/getLoginUser')
    }
  }
}