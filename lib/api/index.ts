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
    // 统一错误处理
    if (error.response?.status === 401) {
      // 处理未授权
      //   navigateTo('/login')
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
