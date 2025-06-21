// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  css: ['~/assets/css/tailwind.css'],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  modules: ['shadcn-nuxt'],
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: './components/ui'
  },
  // 运行时配置
  runtimeConfig: {
    // 私有配置（仅在服务端可用）
    // jwtSecret: process.env.NUXT_JWT_SECRET,
    
    // 公共配置（客户端和服务端都可用）
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3333',
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'WaliCode',
      appVersion: process.env.NUXT_PUBLIC_APP_VERSION || '1.0.0',
    }
  },
})