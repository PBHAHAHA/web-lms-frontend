import { useApi } from '../index'

// 认证相关类型定义
export interface LoginParams {
  email: string
  password: string
}

export interface RegisterParams {
  username: string
  email: string
  password: string
  code: string
}

export interface EmailVerificationParams {
  email: string
}

export interface EmailVerificationResponse {
  errorCode: number
  errorMsg: string
  data?: any
}

export interface LoginUserResponse {
  id: string
  userName: string
  email: string
  member: string
}

// API响应包装结构
export interface ApiResponse<T> {
  errorCode: string
  errorMsg: string
  data: T
  requestId: string | null
}

// 用户信息API响应
export interface GetLoginUserResponse extends ApiResponse<LoginUserResponse> {}

// 登录响应数据结构
export interface LoginResponse {
  errorCode: string
  errorMsg: string
  data: {
    tokenName: string
    tokenValue: string
    isLogin: boolean
    loginId: string // JSON 字符串，包含用户信息 {"id":3,"userName":"pub"}
    loginType: string
    tokenTimeout: number
    sessionTimeout: number
    tokenSessionTimeout: number
    tokenActivityTimeout: number
    loginDevice: string
    tag: null
  }
  requestId: null
}


// 认证相关API
export const useAuthApi = () => {
  const api = useApi()
  
  return {
    // 登录
    login: (data: LoginParams) => {
      console.log(data, "登录数据2")    
      return api.post<LoginResponse>('/auth/login', data)
    },
    // 注册
    register: (data: RegisterParams) => {
      return api.post<any>('/auth/registered', data)
    },
    // 获取登录用户信息
    getLoginUser: () => {
      return api.get<GetLoginUserResponse>('/auth/getLoginUser')
    },
    // 发送邮箱验证码
    sendEmailVerification: (data: EmailVerificationParams) => {
      return api.post<EmailVerificationResponse>('/auth/verificationEmail', data)
    },
    // 退出登录
    logout: () => {
      return api.post<ApiResponse<any>>('/auth/loginOut')
    }
  }
}