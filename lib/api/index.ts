import type { ApiResponse, RequestConfig, ApiError } from "./types";

// 创建请求实例
export const createRequest = (config: RequestConfig = {}) => {
  // 在函数内部获取API基础地址
  const getApiBaseUrl = (): string => {
    const runtimeConfig = useRuntimeConfig();
    console.log(runtimeConfig, "runtimeConfig");
    return (runtimeConfig.public.apiBaseUrl as string) || "/api";
  };

  // 默认配置
  const defaultConfig: RequestConfig = {
    baseURL: getApiBaseUrl(),
    timeout: 10000,
    retry: 3,
    retryDelay: 1000,
    // 自动携带cookie
    credentials: 'include',
  };

  const finalConfig = { ...defaultConfig, ...config };

  // 请求拦截器
  const requestInterceptor = (config: RequestConfig) => {
    console.log(config, "config");
    
    // 获取 token 信息
    const authToken = useCookie("authorized-token");
    const tokenName = useCookie("token-name"); // 存储 tokenName
    
    console.log("Token信息:", {
      tokenName: tokenName.value,
      tokenValue: authToken.value
    });
    
    // 设置基础请求头
    config.headers = {
      ...config.headers,
      "Content-Type": "application/json",
    };
    
    // 如果有 token 信息，添加到请求头
    if (authToken.value && tokenName.value) {
      // 使用 tokenName 作为 key，tokenValue 作为 value
      config.headers[tokenName.value] = authToken.value;
      console.log(`添加请求头: ${tokenName.value} = ${authToken.value}`);
    } else if (authToken.value) {
      // 如果没有 tokenName，使用默认的 Authorization
      config.headers.Authorization = `Bearer ${authToken.value}`;
      console.log(`使用默认Authorization: Bearer ${authToken.value}`);
    }
    
    return config;
  };

  // 响应拦截器
  const responseInterceptor = (response: any) => {
    // 检查登录失效
    if (response && response.errorMsg === "登录失效") {
      console.warn("检测到登录失效，清除认证信息并跳转到登录页");
      
      // 在客户端环境下处理登录失效
      if (process.client) {
        try {
          // 清除认证相关的cookie
          const authToken = useCookie("authorized-token");
          const tokenName = useCookie("token-name");
          authToken.value = null;
          tokenName.value = null;
          
          // 清除localStorage中的用户信息
          if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('user-info');
            localStorage.removeItem('login-time');
            localStorage.removeItem('token-info');
          }
          
          // 跳转到登录页
          navigateTo('/auth/login');
        } catch (error) {
          console.error("处理登录失效时出错:", error);
        }
      }
      
      // 抛出错误以阻止后续处理
      throw new Error("登录失效");
    }
    
    // 去除转义，直接返回响应数据
    if (response && typeof response === "object") {
      return response;
    }
    console.log(response, "response");
    return JSON.parse(response);
  };

  // 错误处理
  const errorHandler = (error: ApiError) => {
    console.error("API请求错误:", error);
    
    // 检查是否是网络错误中的登录失效
    if (error.response?.data && error.response.data.errorCode === "-1") {
      console.warn("从错误中检测到登录失效");
      // 触发和响应拦截器相同的处理逻辑
      if (process.client) {
        try {
          const authToken = useCookie("authorized-token");
          const tokenName = useCookie("token-name");
          authToken.value = null;
          tokenName.value = null;
          
          if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('user-info');
            localStorage.removeItem('login-time');
            localStorage.removeItem('token-info');
          }
          
          navigateTo('/auth/login');
        } catch (clearError) {
          console.error("清除认证信息失败:", clearError);
        }
      }
    }
    
    // 统一错误处理
    if (error.response?.status === 401) {
      console.warn("检测到401未授权错误");
      // 可能也需要处理登录失效
    }
    
    throw error;
  };

  // 基础请求方法
  const request = async <T = any>(
    url: string,
    options: RequestConfig = {}
  ): Promise<T> => {
    console.log(url, "url");
    console.log(options, "options");
    try {
      const config = requestInterceptor({ ...finalConfig, ...options });
      console.log(config, "final config");
      const response = await $fetch<ApiResponse<T>>(url, config);
      console.log(response, "response");
      return responseInterceptor(response);
    } catch (error) {
      return errorHandler(error as ApiError);
    }
  };

  return {
    get: <T = any>(url: string, params?: Record<string, any>) =>
      request<T>(url, { method: "GET", params }),
    post: <T = any>(url: string, data?: any) =>
      request<T>(url, { method: "POST", body: data }),
    put: <T = any>(url: string, data?: any) =>
      request<T>(url, { method: "PUT", body: data }),
    delete: <T = any>(url: string) => request<T>(url, { method: "DELETE" }),
  };
};

// 导出一个创建API实例的函数，而不是直接导出实例
export const useApi = () => createRequest();
