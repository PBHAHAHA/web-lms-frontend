import { useHttpFetch } from '../index'

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
  
  return {
    // 登录
    login: (data: LoginParams) => {
      console.log(data, "登录数据2")    
      return useHttpFetch('/auth/login', {
        method: 'POST',
        body: data
      })
    },
    register: (data: RegisterParams) => {
      return useHttpFetch('/auth/registered', {
        method: 'POST',
        body: data
      })
    },
    getLoginUser: () => {
      return useHttpFetch('/auth/getLoginUser', {
        method: 'GET'
      })
    }
  }
}