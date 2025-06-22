// API 响应基础接口
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
}

// 请求配置接口
export interface RequestConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  body?: any;
  retry?: number;
  retryDelay?: number;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  mode?: 'cors' | 'no-cors' | 'same-origin';
  credentials?: 'omit' | 'same-origin' | 'include';
}

// 错误类型
export interface ApiError extends Error {
  code?: number;
  config?: RequestConfig;
  response?: {
    data: any;
    status: number;
    headers: Record<string, string>;
  };
}
