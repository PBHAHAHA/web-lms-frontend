// API 测试工具
export const useApiTest = () => {
  
  // 检查当前的 token 信息
  const checkTokenInfo = () => {
    const authToken = useCookie("authorized-token")
    const tokenName = useCookie("token-name")
    const storage = useStorage()
    const tokenInfo = storage.getItem('token-info')
    
    console.log('=== Token 信息检查 ===')
    console.log('Cookie中的tokenName:', tokenName.value)
    console.log('Cookie中的tokenValue:', authToken.value)
    console.log('localStorage中的token信息:', tokenInfo)
    
    return {
      cookieTokenName: tokenName.value,
      cookieTokenValue: authToken.value,
      localStorageTokenInfo: tokenInfo
    }
  }
  
  // 测试 API 请求头
  const testApiHeaders = async (testUrl: string = '/test') => {
    const { useApi } = await import('~/lib/api')
    const api = useApi()
    
    console.log('=== 测试 API 请求头 ===')
    console.log('发送测试请求到:', testUrl)
    
    try {
      // 这里会触发请求拦截器，可以在控制台看到请求头信息
      const response = await api.get(testUrl)
      console.log('测试请求成功:', response)
      return response
    } catch (error) {
      console.log('测试请求失败（这是正常的，主要是为了查看请求头）:', error)
      return null
    }
  }
  
  // 模拟登录并测试
  const simulateLoginAndTest = () => {
    // 模拟设置 token 信息
    const authToken = useCookie("authorized-token")
    const tokenName = useCookie("token-name")
    
    authToken.value = "test-token-value-123"
    tokenName.value = "token"
    
    console.log('=== 模拟登录完成 ===')
    console.log('设置tokenName:', tokenName.value)
    console.log('设置tokenValue:', authToken.value)
    
    // 测试请求头
    setTimeout(() => {
      testApiHeaders('/test-with-token')
    }, 100)
  }
  
  // 清除 token 并测试
  const clearTokenAndTest = () => {
    const authToken = useCookie("authorized-token")
    const tokenName = useCookie("token-name")
    
    authToken.value = null
    tokenName.value = null
    
    console.log('=== Token 已清除 ===')
    
    // 测试请求头
    setTimeout(() => {
      testApiHeaders('/test-without-token')
    }, 100)
  }
  
  return {
    checkTokenInfo,
    testApiHeaders,
    simulateLoginAndTest,
    clearTokenAndTest
  }
} 