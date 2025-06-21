import type { ApiResponse, RequestConfig, ApiError } from "./types";

// 创建请求实例
export const createRequest = (config: RequestConfig = {}) => {
  // 在函数内部获取API基础地址
  const getApiBaseUrl = (): string => {
    const runtimeConfig = useRuntimeConfig();
    return (
      (runtimeConfig.public.apiBaseUrl as string) || "http://localhost:3333"
    );
  };

  // 默认配置
  const defaultConfig: RequestConfig = {
    baseURL: getApiBaseUrl() ,
    timeout: 10000,
    retry: 3,
    retryDelay: 1000,
  };

  const finalConfig = { ...defaultConfig, ...config };

  // 请求拦截器
  const requestInterceptor = (config: RequestConfig) => {
    console.log(config, "config");
    // 在这里可以添加token等认证信息
    const token = useCookie("auth-token");
    console.log(token.value, "token");
    if (token.value) {
      config.headers = {
        ...config.headers,
        Authorization: `${token.value}`,
        "Content-Type": "application/json",
      };
    } else {
      config.headers = {
        ...config.headers,
        "Content-Type": "application/json",
      };
    }
    return config;
  };

  // 响应拦截器
  const responseInterceptor = (response: any) => {
    // console.log(JSON.parse(response), "response");
    // response = JSON.parse(response);
    // // 根据实际响应结构判断成功状态
    // if (response.errorCode != "0") {
    //   throw new Error(response.errorMsg || "请求失败");
    // }
    // 去除转义，直接返回响应数据
    if (response && typeof response === 'object') {
      return response;
    }
    console.log((response), "response");
    return JSON.parse(response);
  };

  // 错误处理
  const errorHandler = (error: ApiError) => {
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
    //   console.log(config, "config");
      const response = await $fetch<ApiResponse<T>>(url, config);
    //   console.log(response, "response");
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
