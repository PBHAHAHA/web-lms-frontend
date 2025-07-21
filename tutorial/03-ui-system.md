# 第三章：TailwindCSS 与 UI 组件系统

"设计是一种沟通方式，而不仅仅是装饰。"

当我第一次接触 TailwindCSS 时，说实话，我是拒绝的。满屏幕的 class 名称让我觉得这简直是在开历史倒车，回到了内联样式的时代。但当我真正开始使用它构建项目时，我才发现这种"原子化 CSS"的魅力所在。

在传统的 CSS 开发中，我们经常会遇到这样的困扰：写了一堆样式，但不知道哪些是真正被使用的；想要修改一个组件的样式，却担心影响到其他地方；团队协作时，每个人都有自己的命名习惯，导致样式文件越来越臃肿。

TailwindCSS 的出现，就像是给前端样式开发带来了一场革命。它不仅解决了上述问题，还让我们能够更快速、更一致地构建美观的用户界面。

## 🎯 本章目标

- 深入理解 TailwindCSS 的设计哲学和优势
- 掌握 shadcn/ui 组件库的使用方法
- 学会构建可复用的 UI 组件系统
- 了解现代设计系统的最佳实践

## 🎨 TailwindCSS 深度解析

### 为什么选择 TailwindCSS？

让我们先来看一个对比例子：

**传统 CSS 方式：**
```css
/* styles.css */
.card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.card-content {
  color: #6b7280;
  line-height: 1.5;
}
```

```html
<div class="card">
  <h3 class="card-title">课程标题</h3>
  <p class="card-content">课程描述内容...</p>
</div>
```

**TailwindCSS 方式：**
```html
<div class="bg-white rounded-lg shadow-md p-6 mb-4">
  <h3 class="text-xl font-semibold text-gray-800 mb-2">课程标题</h3>
  <p class="text-gray-600 leading-relaxed">课程描述内容...</p>
</div>
```

乍一看，TailwindCSS 的方式似乎更冗长，但它带来的好处是：

1. **可预测性**：每个 class 都有明确的作用，不会有意外的样式覆盖
2. **可维护性**：样式和结构在同一个地方，修改更直观
3. **一致性**：设计系统内置，确保整个应用的视觉一致性
4. **性能**：只包含实际使用的样式，构建后的 CSS 文件更小

### TailwindCSS 配置

在我们的项目中，TailwindCSS 的配置非常简洁：

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  css: ['~/assets/css/tailwind.css'],
  vite: {
    plugins: [tailwindcss()]
  }
})
```

让我们来看看 TailwindCSS 的样式文件：

```css
/* assets/css/tailwind.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 自定义基础样式 */
@layer base {
  html {
    font-family: 'Inter', sans-serif;
  }
  
  body {
    @apply bg-background text-foreground;
  }
}

/* 自定义组件样式 */
@layer components {
  .btn-primary {
    @apply bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-colors;
  }
  
  .card {
    @apply bg-card text-card-foreground rounded-lg border shadow-sm;
  }
}

/* 自定义工具类 */
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

## 🧩 shadcn/ui 组件系统

shadcn/ui 是一个基于 Radix UI 和 TailwindCSS 构建的组件库，它的特点是：

- **可复制粘贴**：不是传统的 npm 包，而是可以直接复制到项目中的组件
- **高度可定制**：基于 TailwindCSS，可以轻松修改样式
- **无障碍友好**：基于 Radix UI，天然支持键盘导航和屏幕阅读器
- **类型安全**：完全使用 TypeScript 编写

### 安装和配置

我们已经在 Nuxt 配置中添加了 shadcn-nuxt 模块：

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['shadcn-nuxt'],
  shadcn: {
    prefix: '',
    componentDir: './components/ui'
  }
})
```

### 添加组件

使用 shadcn-nuxt 添加组件非常简单：

```bash
# 添加按钮组件
npx shadcn-vue@latest add button

# 添加卡片组件
npx shadcn-vue@latest add card

# 添加对话框组件
npx shadcn-vue@latest add dialog

# 一次性添加多个组件
npx shadcn-vue@latest add button card dialog input label
```

这些命令会在 `components/ui` 目录下创建对应的组件文件。

## 🏗️ 构建组件系统

### 基础按钮组件

让我们来看看 shadcn/ui 的按钮组件是如何实现的：

```vue
<!-- components/ui/button/Button.vue -->
<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    :class="cn(buttonVariants({ variant, size }), props.class)"
    v-bind="$attrs"
  >
    <slot />
  </Primitive>
</template>

<script setup lang="ts">
import { Primitive } from 'reka-ui'
import { type ButtonVariants, buttonVariants } from './index'
import { cn } from '@/lib/utils'

interface ButtonProps {
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
  as?: string
  asChild?: boolean
  class?: string
}

const props = withDefaults(defineProps<ButtonProps>(), {
  as: 'button',
  variant: 'default',
  size: 'default'
})
</script>
```

```typescript
// components/ui/button/index.ts
import { cva, type VariantProps } from 'class-variance-authority'

export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline'
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
```

这个实现展示了现代组件设计的几个重要概念：

1. **变体系统**：使用 `class-variance-authority` 来管理不同的样式变体
2. **组合性**：基于 Primitive 组件，可以渲染为不同的 HTML 元素
3. **类型安全**：完整的 TypeScript 支持
4. **可扩展性**：可以轻松添加新的变体和尺寸

### 课程卡片组件

基于 shadcn/ui 的基础组件，我们可以构建业务组件：

```vue
<!-- components/courses/CourseCard.vue -->
<template>
  <Card class="overflow-hidden hover:shadow-lg transition-shadow duration-300">
    <div class="aspect-video relative overflow-hidden">
      <img 
        :src="course.thumbnail" 
        :alt="course.title"
        class="w-full h-full object-cover"
      />
      <Badge 
        v-if="course.level" 
        :variant="getLevelVariant(course.level)"
        class="absolute top-2 right-2"
      >
        {{ course.level }}
      </Badge>
    </div>
    
    <CardHeader>
      <div class="flex items-start justify-between gap-2">
        <CardTitle class="line-clamp-2">{{ course.title }}</CardTitle>
        <div class="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock class="w-4 h-4" />
          {{ course.duration }}
        </div>
      </div>
      <CardDescription class="line-clamp-3">
        {{ course.description }}
      </CardDescription>
    </CardHeader>
    
    <CardContent>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Avatar class="w-6 h-6">
            <AvatarImage :src="course.instructor.avatar" />
            <AvatarFallback>{{ course.instructor.name[0] }}</AvatarFallback>
          </Avatar>
          <span class="text-sm text-muted-foreground">
            {{ course.instructor.name }}
          </span>
        </div>
        
        <div class="flex items-center gap-1">
          <Star class="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span class="text-sm font-medium">{{ course.rating }}</span>
          <span class="text-sm text-muted-foreground">
            ({{ course.reviewCount }})
          </span>
        </div>
      </div>
    </CardContent>
    
    <CardFooter class="pt-0">
      <div class="flex items-center justify-between w-full">
        <div class="flex flex-wrap gap-1">
          <Badge 
            v-for="tag in course.tags.slice(0, 2)" 
            :key="tag"
            variant="secondary"
            class="text-xs"
          >
            {{ tag }}
          </Badge>
          <Badge 
            v-if="course.tags.length > 2"
            variant="outline"
            class="text-xs"
          >
            +{{ course.tags.length - 2 }}
          </Badge>
        </div>
        
        <div class="flex items-center gap-2">
          <span class="text-lg font-bold text-primary">
            ¥{{ course.price }}
          </span>
          <Button size="sm" @click="$emit('enroll', course.id)">
            立即学习
          </Button>
        </div>
      </div>
    </CardFooter>
  </Card>
</template>

<script setup lang="ts">
import { Clock, Star } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Course {
  id: string
  title: string
  description: string
  thumbnail: string
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: string
  price: number
  rating: number
  reviewCount: number
  tags: string[]
  instructor: {
    name: string
    avatar: string
  }
}

interface Props {
  course: Course
}

defineProps<Props>()
defineEmits<{
  enroll: [courseId: string]
}>()

function getLevelVariant(level: Course['level']) {
  const variants = {
    beginner: 'default',
    intermediate: 'secondary',
    advanced: 'destructive'
  }
  return variants[level] || 'default'
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
```

### 响应式导航组件

```vue
<!-- components/common/Navigation.vue -->
<template>
  <nav class="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="container flex h-16 items-center">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center space-x-2">
        <img src="/logo.png" alt="WaliCode" class="h-8 w-8" />
        <span class="font-bold text-xl">WaliCode</span>
      </NuxtLink>
      
      <!-- Desktop Navigation -->
      <div class="hidden md:flex md:items-center md:space-x-6 ml-8">
        <NuxtLink 
          v-for="item in navigationItems" 
          :key="item.href"
          :to="item.href"
          class="text-sm font-medium transition-colors hover:text-primary"
          :class="{ 'text-primary': $route.path === item.href }"
        >
          {{ item.label }}
        </NuxtLink>
      </div>
      
      <!-- Right Side -->
      <div class="ml-auto flex items-center space-x-4">
        <!-- Search -->
        <div class="hidden md:block">
          <div class="relative">
            <Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索课程..."
              class="pl-8 w-64"
              v-model="searchQuery"
              @keyup.enter="handleSearch"
            />
          </div>
        </div>
        
        <!-- Theme Toggle -->
        <Button variant="ghost" size="icon" @click="toggleTheme">
          <Sun class="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon class="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
        
        <!-- User Menu -->
        <DropdownMenu v-if="user">
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" class="relative h-8 w-8 rounded-full">
              <Avatar class="h-8 w-8">
                <AvatarImage :src="user.avatar" :alt="user.name" />
                <AvatarFallback>{{ user.name[0] }}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-56" align="end">
            <DropdownMenuLabel class="font-normal">
              <div class="flex flex-col space-y-1">
                <p class="text-sm font-medium leading-none">{{ user.name }}</p>
                <p class="text-xs leading-none text-muted-foreground">{{ user.email }}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="navigateTo('/profile')">
              <User class="mr-2 h-4 w-4" />
              个人资料
            </DropdownMenuItem>
            <DropdownMenuItem @click="navigateTo('/courses')">
              <BookOpen class="mr-2 h-4 w-4" />
              我的课程
            </DropdownMenuItem>
            <DropdownMenuItem @click="navigateTo('/settings')">
              <Settings class="mr-2 h-4 w-4" />
              设置
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="logout">
              <LogOut class="mr-2 h-4 w-4" />
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <!-- Login Button -->
        <div v-else class="flex items-center space-x-2">
          <Button variant="ghost" @click="navigateTo('/auth/login')">
            登录
          </Button>
          <Button @click="navigateTo('/auth/register')">
            注册
          </Button>
        </div>
        
        <!-- Mobile Menu -->
        <Sheet>
          <SheetTrigger as-child>
            <Button variant="ghost" size="icon" class="md:hidden">
              <Menu class="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" class="w-80">
            <SheetHeader>
              <SheetTitle>导航菜单</SheetTitle>
            </SheetHeader>
            <div class="grid gap-4 py-4">
              <div class="relative">
                <Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索课程..."
                  class="pl-8"
                  v-model="searchQuery"
                  @keyup.enter="handleSearch"
                />
              </div>
              <div class="grid gap-2">
                <NuxtLink 
                  v-for="item in navigationItems" 
                  :key="item.href"
                  :to="item.href"
                  class="block px-2 py-1 text-lg font-medium"
                >
                  {{ item.label }}
                </NuxtLink>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { Search, Sun, Moon, User, BookOpen, Settings, LogOut, Menu } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const searchQuery = ref('')
const user = ref(null) // 这里应该从认证状态获取

const navigationItems = [
  { label: '首页', href: '/' },
  { label: '课程', href: '/courses' },
  { label: '学习计划', href: '/plan' },
  { label: '关于', href: '/about' }
]

function handleSearch() {
  if (searchQuery.value.trim()) {
    navigateTo(`/search?q=${encodeURIComponent(searchQuery.value)}`)
  }
}

function toggleTheme() {
  // 主题切换逻辑
}

function logout() {
  // 退出登录逻辑
}
</script>
```

## 🎨 设计系统最佳实践

### 1. 颜色系统

```css
/* assets/css/tailwind.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 84% 4.9%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 94.1%;
  }
}
```

### 2. 间距系统

```typescript
// 使用一致的间距比例
const spacing = {
  xs: '0.5rem',    // 8px
  sm: '0.75rem',   // 12px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
}
```

### 3. 字体系统

```css
@layer base {
  .text-xs { font-size: 0.75rem; line-height: 1rem; }
  .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
  .text-base { font-size: 1rem; line-height: 1.5rem; }
  .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
  .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
  .text-2xl { font-size: 1.5rem; line-height: 2rem; }
  .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
  .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
}
```

## 🧪 实践练习

1. **创建一个课程列表组件**
   - 使用 Grid 布局展示课程卡片
   - 实现响应式设计（移动端单列，桌面端多列）
   - 添加加载状态和空状态

2. **实现主题切换功能**
   - 使用 CSS 变量实现明暗主题
   - 添加平滑的过渡动画
   - 保存用户的主题偏好

3. **构建一个表单组件**
   - 使用 shadcn/ui 的表单组件
   - 实现表单验证
   - 添加错误状态和成功状态

## 💭 思考题

1. **原子化 CSS 的优缺点是什么？**
   - 在什么场景下适合使用？
   - 如何平衡开发效率和代码可读性？

2. **如何设计一个可扩展的组件系统？**
   - 组件的粒度应该如何控制？
   - 如何处理组件之间的依赖关系？

3. **设计系统的价值在哪里？**
   - 对开发效率的影响
   - 对用户体验的影响
   - 对团队协作的影响

## 🎉 小结

通过这一章的学习，我们深入了解了现代 UI 开发的核心理念和实践方法。TailwindCSS 和 shadcn/ui 的组合为我们提供了一个强大而灵活的工具集，让我们能够快速构建美观、一致、可维护的用户界面。

我们学到了：
- ✅ TailwindCSS 的设计哲学和使用方法
- ✅ shadcn/ui 组件库的集成和定制
- ✅ 现代组件系统的设计原则
- ✅ 响应式设计的最佳实践
- ✅ 设计系统的构建方法

一个好的 UI 系统就像是建筑的钢筋骨架，它为整个应用提供了坚实的视觉基础。在下一章中，我们将基于这个 UI 系统，开始构建应用的页面结构和路由系统。

---

**下一章预告：** 《页面路由与布局设计》- 我们将学习 Nuxt.js 的文件系统路由，如何设计灵活的布局系统，以及如何实现页面间的平滑导航和状态管理。