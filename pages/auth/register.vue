<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h1 class="register-title">注册</h1>
        <p class="register-subtitle">创建您的账户，开始学习之旅</p>
      </div>
      
      <!-- 错误提示 -->
      <div v-if="error" class="error-message">
        <CircleX class="w-5 h-5" />        
        <span>{{ error }}</span>
      </div>
      
      <!-- 成功提示 -->
      <div v-if="success" class="success-message">
        <Icon name="heroicons:check-circle" class="w-5 h-5" />
        <span>{{ success }}</span>
      </div>
      
      <form @submit.prevent="handleRegister" class="register-form">
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
        
        <div class="form-group">
          <label for="confirmPassword" class="form-label">确认密码</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            class="form-input"
            :class="{ 'form-input-error': errors.confirmPassword }"
            placeholder="请再次输入您的密码"
            required
          />
          <span v-if="errors.confirmPassword" class="field-error">{{ errors.confirmPassword }}</span>
        </div>
        
        <button
          type="submit"
          class="register-button"
          :disabled="loading"
        >
          <Icon v-if="loading" name="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
          <span v-if="loading">注册中...</span>
          <span v-else>注册</span>
        </button>
      </form>
      
      <div class="register-footer">
        <p class="login-text">
          已有账户？
          <NuxtLink to="/auth/login" class="login-link">
            立即登录
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import { CircleX } from 'lucide-vue-next'

const { register } = useAuth()

definePageMeta({
  title: '注册',
  layout: 'auth' as any
})

// 页面元数据
useHead({
  title: '注册 - Nuxt LMS',
  meta: [
    {
      name: 'description',
      content: '注册您的账户，开始学习之旅',
    },
  ],
})

// 表单数据
const form = reactive({
  username: '',
  code: '123456',
  password: '',
})

const confirmPassword = ref('')

// 状态管理
const loading = ref(false)
const error = ref('')
const success = ref('')
const errors = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

// 清除错误信息
const clearErrors = () => {
  error.value = ''
  errors.username = ''
  errors.password = ''
  errors.confirmPassword = ''
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
  } else if (form.username.length > 20) {
    errors.username = '用户名不能超过20个字符'
    isValid = false
  }
  
  // 密码验证
  if (!form.password) {
    errors.password = '请输入密码'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = '密码至少需要6个字符'
    isValid = false
  } else if (form.password.length > 50) {
    errors.password = '密码不能超过50个字符'
    isValid = false
  }
  
  // 确认密码验证
  if (!confirmPassword.value) {
    errors.confirmPassword = '请确认密码'
    isValid = false
  } else if (confirmPassword.value !== form.password) {
    errors.confirmPassword = '两次输入的密码不一致'
    isValid = false
  }
  
  return isValid
}

// 处理注册
const handleRegister = async () => {
  if (!validateForm()) return
  
  loading.value = true
  clearErrors()
  
  try {
    console.log(form, "注册数据")
    const response = await register(form)
    
    if (response.errorCode == 0) {
      success.value = '注册成功！正在跳转到登录页面...'
      
      // 延迟跳转到登录页面
      setTimeout(() => {
        navigateTo('/auth/login')
      }, 2000)
    } else {
      error.value = response.errorMsg || '注册失败，请重试'
    }
    
    console.log('注册成功:', response)
    
  } catch (err: any) {
    console.error('注册失败:', err)
    
    // 处理不同类型的错误
    if (err.response?.status === 422) {
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
        error.value = err.response.data?.message || '注册失败，请检查输入信息'
      }
    } else if (err.response?.status === 409) {
      error.value = '用户名已存在，请选择其他用户名'
    } else if (err.response?.status === 400) {
      error.value = '邀请码无效或已过期'
    } else {
      error.value = err.message || '注册失败，请稍后重试'
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
  // 如果确认密码已填写，重新验证确认密码
  if (confirmPassword.value && errors.confirmPassword) {
    if (confirmPassword.value === form.password) {
      errors.confirmPassword = ''
    }
  }
})

watch(() => confirmPassword.value, () => {
  if (errors.confirmPassword) errors.confirmPassword = ''
  if (error.value) error.value = ''
})
</script>

<style scoped>
.register-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1rem;
}

.register-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 400px;
}

.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.register-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.register-subtitle {
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

.register-form {
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

.register-button {
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

.register-button:hover:not(:disabled) {
  background: #2563eb;
}

.register-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.register-footer {
  margin-top: 2rem;
  text-align: center;
}

.login-text {
  color: #6b7280;
  font-size: 0.875rem;
}

.login-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.login-link:hover {
  color: #2563eb;
}
</style>
