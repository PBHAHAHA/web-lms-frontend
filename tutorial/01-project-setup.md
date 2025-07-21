# 第一章：项目初始化与环境搭建

还记得第一次接触前端开发时，老师说的那句话吗？"前端开发很简单，用记事本就能写！"然而，当我们真正踏入现代前端开发的世界时，才发现事情远没有那么简单。

今天，如果我们要构建一个现代化的在线学习管理系统，需要考虑的不仅仅是 HTML、CSS、JavaScript 三件套，还有工程化、模块化、组件化、类型安全、构建优化等等一系列复杂的概念。

但别担心，这种复杂性背后隐藏的是更强大的开发能力和更好的用户体验。让我们一步步来揭开现代前端开发的神秘面纱。

## 🎯 本章目标

- 理解现代前端项目的基本结构
- 掌握 Nuxt.js 3 项目的创建和配置
- 了解包管理工具的选择和使用
- 建立良好的开发环境

## 🛠️ 环境准备

在开始之前，确保你的开发环境已经准备就绪：

### Node.js 环境

```bash
# 检查 Node.js 版本（推荐 18.x 或更高）
node --version

# 检查 npm 版本
npm --version
```

如果还没有安装 Node.js，建议使用 [nvm](https://github.com/nvm-sh/nvm) 来管理 Node.js 版本：

```bash
# 安装最新的 LTS 版本
nvm install --lts
nvm use --lts
```

### 包管理器选择

现代前端开发中，我们有多种包管理器可以选择：

- **npm**: Node.js 自带，最广泛使用
- **yarn**: Facebook 开发，速度较快
- **pnpm**: 磁盘空间效率高，速度快

本项目我们选择 **pnpm**，因为它在依赖管理和磁盘空间利用上有显著优势：

```bash
# 全局安装 pnpm
npm install -g pnpm

# 验证安装
pnpm --version
```

## 🚀 创建项目

### 方式一：使用 Nuxt CLI（推荐）

```bash
# 创建新的 Nuxt 3 项目
npx nuxi@latest init web-lms-frontend

# 进入项目目录
cd web-lms-frontend

# 安装依赖
pnpm install
```

### 方式二：手动创建

如果你想更深入地理解项目结构，也可以手动创建：

```bash
# 创建项目目录
mkdir web-lms-frontend
cd web-lms-frontend

# 初始化 package.json
pnpm init
```

然后手动安装 Nuxt.js：

```bash
pnpm add nuxt@latest
```

## 📁 项目结构解析

创建完成后，让我们来看看项目的基本结构：

```
web-lms-frontend/
├── .nuxt/                 # Nuxt 自动生成的文件（不要手动修改）
├── .output/               # 构建输出目录
├── assets/                # 静态资源（CSS、图片等）
├── components/            # Vue 组件
├── composables/           # 组合式函数
├── layouts/               # 布局组件
├── middleware/            # 中间件
├── pages/                 # 页面组件（自动路由）
├── plugins/               # 插件
├── public/                # 公共静态文件
├── server/                # 服务端代码
├── utils/                 # 工具函数
├── app.vue               # 根组件
├── nuxt.config.ts        # Nuxt 配置文件
├── package.json          # 项目依赖配置
└── tsconfig.json         # TypeScript 配置
```

### 关键文件说明

**app.vue** - 应用的根组件：
```vue
<template>
  <div>
    <NuxtWelcome />
  </div>
</template>
```

**nuxt.config.ts** - Nuxt 的核心配置文件：
```typescript
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true }
})
```

**package.json** - 项目的依赖和脚本配置：
```json
{
  "name": "nuxt-app",
  "private": true,
  "scripts": {
    "build": "nuxt build",
    "dev": "nuxt dev",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare"
  },
  "devDependencies": {
    "@nuxt/devtools": "latest",
    "nuxt": "^3.8.0"
  }
}
```

## 🏃‍♂️ 启动开发服务器

现在让我们启动开发服务器，看看我们的项目：

```bash
# 启动开发服务器
pnpm dev
```

如果一切顺利，你会看到类似这样的输出：

```
Nuxt 3.8.0 with Nitro 2.7.2
  > Local:    http://localhost:3000/
  > Network:  http://192.168.1.100:3000/

ℹ Vite client warmed up in 1234ms
✔ Nuxt DevTools is enabled (v1.0.0)
```

打开浏览器访问 `http://localhost:3000`，你应该能看到 Nuxt 的欢迎页面。

## 🔧 基础配置优化

### TypeScript 支持

Nuxt 3 默认支持 TypeScript，但我们可以进一步优化配置：

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },
  typescript: {
    strict: true,
    typeCheck: true
  }
})
```

### 开发工具配置

为了提升开发体验，我们可以配置一些有用的开发工具：

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: [
    '@nuxtjs/eslint-module',
    '@nuxtjs/tailwindcss'
  ]
})
```

## 💭 思考与实践

1. **为什么选择 Nuxt.js 而不是纯 Vue.js？**
   - 想想 SSR（服务端渲染）的优势
   - 考虑 SEO 和首屏加载速度的重要性
   - 思考开发效率和约定优于配置的理念

2. **包管理器的选择对项目有什么影响？**
   - 尝试比较 npm、yarn、pnpm 的安装速度
   - 观察不同包管理器生成的 lock 文件差异

3. **项目结构的设计原则是什么？**
   - 为什么要按功能而不是按文件类型组织代码？
   - 如何平衡灵活性和约定性？

## 🎉 小结

恭喜你！你已经成功创建了第一个 Nuxt.js 项目。虽然现在看起来只是一个简单的欢迎页面，但这已经是一个功能完整的现代前端应用的基础。

在这个过程中，我们：
- ✅ 搭建了完整的开发环境
- ✅ 理解了现代前端项目的基本结构
- ✅ 学会了使用包管理器管理依赖
- ✅ 启动了第一个开发服务器

下一章，我们将深入探讨 Nuxt.js 的配置系统，学习如何根据项目需求进行定制化配置。

---

**下一章预告：** 《Nuxt.js 配置深度解析》- 我们将学习如何配置路由、中间件、插件等高级功能，让你的应用更加强大和灵活。