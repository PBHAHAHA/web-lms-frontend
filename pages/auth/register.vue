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
          <label for="email" class="form-label">邮箱地址</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="form-input"
            :class="{ 'form-input-error': errors.email }"
            placeholder="请输入您的邮箱地址"
            required
          />
          <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
        </div>
        
        <div class="form-group">
          <label for="verificationCode" class="form-label">验证码</label>
          <div class="verification-input-group">
            <input
              id="verificationCode"
              v-model="form.verificationCode"
              type="text"
              class="form-input verification-input"
              :class="{ 'form-input-error': errors.verificationCode }"
              placeholder="请输入验证码"
              maxlength="6"
              required
            />
            <button
              type="button"
              class="verification-button"
              :disabled="!canSendCode || sendingCode"
              @click="sendVerificationCode"
            >
              <span v-if="sendingCode">发送中...</span>
              <span v-else-if="countdown > 0">{{ countdown }}s后重发</span>
              <span v-else>{{ codeSent ? '重新发送' : '发送验证码' }}</span>
            </button>
          </div>
          <span v-if="errors.verificationCode" class="field-error">{{ errors.verificationCode }}</span>
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
          class="register-button bg-primary"
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
import { useAuthApi } from '~/lib/api/modules/auth'
import { CircleX } from 'lucide-vue-next'

const { register } = useAuth()
const authApi = useAuthApi()

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
  email: '',
  verificationCode: '',
  password: '',
})

const confirmPassword = ref('')

// 状态管理
const loading = ref(false)
const error = ref('')
const success = ref('')
const errors = reactive({
  username: '',
  email: '',
  verificationCode: '',
  password: '',
  confirmPassword: ''
})

// 验证码相关状态
const sendingCode = ref(false)
const codeSent = ref(false)
const countdown = ref(0)

// 计算属性：是否可以发送验证码
const canSendCode = computed(() => {
  return form.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && countdown.value === 0
})

// 清除错误信息
const clearErrors = () => {
  error.value = ''
  errors.username = ''
  errors.email = ''
  errors.verificationCode = ''
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
  
  // 邮箱验证
  if (!form.email) {
    errors.email = '请输入邮箱地址'
    isValid = false
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) {
      errors.email = '请输入有效的邮箱地址'
      isValid = false
    }
  }
  
  // 验证码验证
  if (!form.verificationCode) {
    errors.verificationCode = '请输入验证码'
    isValid = false
  } else if (form.verificationCode.length !== 6) {
    errors.verificationCode = '验证码应为6位数字'
    isValid = false
  } else if (!/^\d{6}$/.test(form.verificationCode)) {
    errors.verificationCode = '验证码只能包含数字'
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
    // 构造注册数据，将verificationCode映射到API期望的字段
    const registerData = {
      username: form.username,
      email: form.email,
      password: form.password,
      code: form.verificationCode
    }
    
    console.log(registerData, "注册数据")
    const response = await register(registerData)
    
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
        if (validationErrors.email) {
          errors.email = validationErrors.email[0]
        }
        if (validationErrors.verificationCode) {
          errors.verificationCode = validationErrors.verificationCode[0]
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

// 发送验证码
const sendVerificationCode = async () => {
  if (!canSendCode.value) return
  
  sendingCode.value = true
  
  try {
    console.log('发送验证码到:', form.email)
    const response = await authApi.sendEmailVerification({ email: form.email })
    
    if (response.errorCode == 0) {
      codeSent.value = true
      countdown.value = 60
      
      // 开始倒计时
      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
      
      success.value = '验证码已发送到您的邮箱，请查收'
      setTimeout(() => {
        success.value = ''
      }, 3000)
    } else {
      error.value = response.errorMsg || '发送验证码失败，请稍后重试'
    }
    
  } catch (err: any) {
    console.error('发送验证码失败:', err)
    
    // 处理不同类型的错误
    if (err.response?.status === 400) {
      error.value = '邮箱地址无效'
    } else if (err.response?.status === 429) {
      error.value = '发送过于频繁，请稍后再试'
    } else if (err.response?.data?.errorMsg) {
      error.value = err.response.data.errorMsg
    } else {
      error.value = '发送验证码失败，请稍后重试'
    }
  } finally {
    sendingCode.value = false
  }
}

// 监听表单变化，清除对应字段的错误
watch(() => form.username, () => {
  if (errors.username) errors.username = ''
  if (error.value) error.value = ''
})

watch(() => form.email, () => {
  if (errors.email) errors.email = ''
  if (error.value) error.value = ''
})

watch(() => form.verificationCode, () => {
  if (errors.verificationCode) errors.verificationCode = ''
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
  padding: 0.5rem;
}

.register-card {
  background: white;
  /* border-radius: 12px; */
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  width: 100%;
  max-width: 400px;
}

.register-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.register-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.register-subtitle {
  color: #6b7280;
  font-size: 0.8rem;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.8rem;
}

.success-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #16a34a;
  padding: 0.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.8rem;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-label {
  font-weight: 500;
  color: #374151;
  font-size: 0.8rem;
}

.form-input {
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  /* border-radius: 8px; */
  font-size: 0.9rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #f48400;
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
  font-size: 0.7rem;
  margin-top: 0.125rem;
}

.register-button {
  /* background: #3b82f6; */
  color: white;
  border: none;
  /* border-radius: 8px; */
  padding: 0.625rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.register-button:hover:not(:disabled) {
  background: #f48400;
}

.register-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.register-footer {
  margin-top: 1.5rem;
  text-align: center;
}

.login-text {
  color: #6b7280;
  font-size: 0.8rem;
}

.login-link {
  color: #f48400;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.login-link:hover {
  color: #f48400;
}

.verification-input-group {
  display: flex;
  gap: 0.5rem;
}

.verification-input {
  flex: 1;
}

.verification-button {
  background: #f48400;
  color: white;
  border: none;
  /* border-radius: 8px; */
  padding: 0.625rem 0.875rem;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
  min-width: 90px;
}

.verification-button:hover:not(:disabled) {
  background: #f48400;
}

.verification-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}
</style>
