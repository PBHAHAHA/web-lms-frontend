// 通用持久化存储工具
export const useStorage = () => {
  
  // 设置存储数据
  const setItem = <T>(key: string, value: T): void => {
    if (process.client) {
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch (error) {
        console.error(`存储数据失败 [${key}]:`, error)
      }
    }
  }
  
  // 获取存储数据
  const getItem = <T>(key: string, defaultValue: T | null = null): T | null => {
    if (process.client) {
      try {
        const item = localStorage.getItem(key)
        return item ? JSON.parse(item) : defaultValue
      } catch (error) {
        console.error(`获取存储数据失败 [${key}]:`, error)
        // 清除损坏的数据
        removeItem(key)
        return defaultValue
      }
    }
    return defaultValue
  }
  
  // 删除存储数据
  const removeItem = (key: string): void => {
    if (process.client) {
      try {
        localStorage.removeItem(key)
      } catch (error) {
        console.error(`删除存储数据失败 [${key}]:`, error)
      }
    }
  }
  
  // 清空所有存储数据
  const clear = (): void => {
    if (process.client) {
      try {
        localStorage.clear()
      } catch (error) {
        console.error('清空存储数据失败:', error)
      }
    }
  }
  
  // 检查是否存在某个 key
  const hasItem = (key: string): boolean => {
    if (process.client) {
      return localStorage.getItem(key) !== null
    }
    return false
  }
  
  // 获取所有 keys
  const getAllKeys = (): string[] => {
    if (process.client) {
      return Object.keys(localStorage)
    }
    return []
  }
  
  return {
    setItem,
    getItem,
    removeItem,
    clear,
    hasItem,
    getAllKeys
  }
} 