<template>
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1 class="login-title">登录</h1>
          <p class="login-subtitle">欢迎回来，请登录您的账户</p>
        </div>
        
        <!-- 错误提示 -->
        <div v-if="error" class="error-message">
          <Icon name="heroicons:exclamation-triangle" class="w-5 h-5" />
          <span>{{ error }}</span>
        </div>
        
        <!-- 成功提示 -->
        <div v-if="success" class="success-message">
          <Icon name="heroicons:check-circle" class="w-5 h-5" />
          <span>{{ success }}</span>
        </div>
        
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="username" class="form-label">用户名</label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              class="form-input"
              :class="{ 'form-input-error': errors.username }"
              placeholder="请输入您的用户名"
              required
            />
            <span v-if="errors.username" class="field-error">{{ errors.username }}</span>
          </div>
          
          <div class="form-group">
            <label for="password" class="form-label">密码</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              class="form-input"
              :class="{ 'form-input-error': errors.password }"
              placeholder="请输入您的密码"
              required
            />
            <span v-if="errors.password" class="field-error">{{ errors.password }}</span>
          </div>
          
          <div class="form-options">
            <label class="checkbox-label">
              <input v-model="form.remember" type="checkbox" class="checkbox" />
              记住我
            </label>
            <NuxtLink to="/auth/forgot-password" class="forgot-link">
              忘记密码？
            </NuxtLink>
          </div>
          
          <button
            type="submit"
            class="login-button"
            :disabled="loading"
          >
            <Icon v-if="loading" name="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
            <span v-if="loading">登录中...</span>
            <span v-else>登录</span>
          </button>
        </form>
        
        <div class="login-footer">
          <p class="register-text">
            还没有账户？
            <NuxtLink to="/auth/register" class="register-link">
              立即注册
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { useAuth } from '~/composables/useAuth'
  import type { LoginParams } from '~/lib/api/modules/auth'
  const { login } = useAuth()
  definePageMeta({
    title: '登录',
    layout: 'auth' as any
  })
  
  // 页面元数据
  useHead({
    title: '登录 - Nuxt LMS',
    meta: [
      {
        name: 'description',
        content: '登录您的账户，开始学习之旅',
      },
    ],
  })
  
  const route = useRoute()
  
  // 表单数据
  const form = reactive<LoginParams>({
    username: '',
    password: '',
  })
  
  // 状态管理
  const loading = ref(false)
  const error = ref('')
  const success = ref('')
  const errors = reactive({
    username: '',
    password: ''
  })
  
  // 清除错误信息
  const clearErrors = () => {
    error.value = ''
    errors.username = ''
    errors.password = ''
  }
  
  // 表单验证
  const validateForm = () => {
    clearErrors()
    let isValid = true
    
    // 用户名验证
    if (!form.username) {
      errors.username = '请输入用户名'
      isValid = false
    } else if (form.username.length < 3) {
      errors.username = '用户名至少需要3个字符'
      isValid = false
    }
    
    // 密码验证
    if (!form.password) {
      errors.password = '请输入密码'
      isValid = false
    } else if (form.password.length < 6) {
      errors.password = '密码至少需要6个字符'
      isValid = false
    }
    
    return isValid
  }
  
  // 处理登录
  const handleLogin = async () => {
    if (!validateForm()) return
    
    loading.value = true
    clearErrors()
    
    try {
      console.log(form, "登录数据3")
      const response = await login(form)
      if(response.errorCode == 0){
        success.value = '登录成功！正在跳转...'
      }else{
        error.value = response.errorMsg
      }

      console.log('登录成功:', response)
      
      // 保存用户信息和token到cookie
      const userCookie = useCookie('user', {
        maxAge: 60 * 60 * 24 * 7, // 7天
        secure: true,
        sameSite: 'strict'
      })
      const tokenCookie = useCookie('auth-token', {
        maxAge: 60 * 60 * 24 * 7, // 7天
        secure: true,
        sameSite: 'strict'
      })
      
      userCookie.value = JSON.stringify(response.user)
      tokenCookie.value = response.token
      
      success.value = '登录成功！正在跳转...'
      
      // 获取重定向地址
      const redirect = (route.query.redirect as string) || '/'
      
      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        navigateTo(redirect)
      }, 1000)
      
    } catch (err: any) {
      console.error('登录失败:', err)
      
      // 处理不同类型的错误
      if (err.response?.status === 401) {
        error.value = '用户名或密码错误'
      } else if (err.response?.status === 422) {
        // 处理表单验证错误
        const validationErrors = err.response.data?.errors
        if (validationErrors) {
          if (validationErrors.username) {
            errors.username = validationErrors.username[0]
          }
          if (validationErrors.password) {
            errors.password = validationErrors.password[0]
          }
        } else {
          error.value = err.response.data?.message || '登录失败，请检查输入信息'
        }
      } else if (err.response?.status === 429) {
        error.value = '登录尝试过于频繁，请稍后再试'
      } else if (err.response?.status === 403) {
        error.value = '账户已被禁用，请联系管理员'
      } else {
        error.value = err.message || '登录失败，请稍后重试'
      }
    } finally {
      loading.value = false
    }
  }
  
  // 监听表单变化，清除对应字段的错误
  watch(() => form.username, () => {
    if (errors.username) errors.username = ''
    if (error.value) error.value = ''
  })
  
  watch(() => form.password, () => {
    if (errors.password) errors.password = ''
    if (error.value) error.value = ''
  })
  </script>
  
  <style scoped>
  .login-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 1rem;
  }
  
  .login-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    padding: 2rem;
    width: 100%;
    max-width: 400px;
  }
  
  .login-header {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .login-title {
    font-size: 2rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 0.5rem;
  }
  
  .login-subtitle {
    color: #6b7280;
    font-size: 0.875rem;
  }
  
  .error-message {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #dc2626;
    padding: 0.75rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    font-size: 0.875rem;
  }
  
  .success-message {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    color: #16a34a;
    padding: 0.75rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    font-size: 0.875rem;
  }
  
  .login-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .form-label {
    font-weight: 500;
    color: #374151;
    font-size: 0.875rem;
  }
  
  .form-input {
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  
  .form-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  .form-input-error {
    border-color: #dc2626;
  }
  
  .form-input-error:focus {
    border-color: #dc2626;
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
  }
  
  .field-error {
    color: #dc2626;
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }
  
  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #374151;
    cursor: pointer;
  }
  
  .checkbox {
    width: 1rem;
    height: 1rem;
  }
  
  .forgot-link {
    color: #3b82f6;
    text-decoration: none;
    font-size: 0.875rem;
    transition: color 0.2s;
  }
  
  .forgot-link:hover {
    color: #2563eb;
  }
  
  .login-button {
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.75rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .login-button:hover:not(:disabled) {
    background: #2563eb;
  }
  
  .login-button:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
  
  .login-footer {
    margin-top: 2rem;
    text-align: center;
  }
  
  .register-text {
    color: #6b7280;
    font-size: 0.875rem;
  }
  
  .register-link {
    color: #3b82f6;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }
  
  .register-link:hover {
    color: #2563eb;
  }
  </style>
  