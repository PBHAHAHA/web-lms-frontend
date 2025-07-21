# 第四章：页面路由与布局设计

"架构是凝固的音乐。"——歌德

如果说前面几章我们在搭建"地基"和"装修材料"，那么这一章我们就要开始设计"房间布局"了。在 Web 应用中，路由系统就像是房屋的走廊和门，它决定了用户如何在不同的页面间穿行；而布局系统则像是每个房间的基本结构，它定义了页面的整体框架。

还记得早期的 Web 开发吗？每个页面都是一个独立的 HTML 文件，页面间的跳转意味着整个页面的重新加载。而现在，我们有了单页应用（SPA），有了客户端路由，有了布局系统，用户可以在不同页面间无缝切换，就像在一个精心设计的建筑中漫步。

Nuxt.js 的文件系统路由更是将这种体验推向了极致——你只需要创建文件，路由就自动生成了。这种"约定优于配置"的理念，让开发者可以专注于业务逻辑，而不是繁琐的路由配置。

## 🎯 本章目标

- 深入理解 Nuxt.js 的文件系统路由
- 掌握动态路由和嵌套路由的使用
- 学会设计灵活的布局系统
- 了解页面导航和状态管理的最佳实践

## 🗺️ Nuxt.js 路由系统深度解析

### 文件系统路由的魅力

在传统的 Vue.js 应用中，我们需要手动配置路由：

```javascript
// 传统 Vue Router 配置
const routes = [
  { path: '/', component: Home },
  { path: '/courses', component: Courses },
  { path: '/courses/:id', component: CourseDetail },
  { path: '/auth/login', component: Login },
  { path: '/auth/register', component: Register }
]
```

而在 Nuxt.js 中，我们只需要创建对应的文件：

```
pages/
├── index.vue           # → /
├── courses/
│   ├── index.vue       # → /courses
│   └── [id].vue        # → /courses/:id
└── auth/
    ├── login.vue       # → /auth/login
    └── register.vue    # → /auth/register
```

这种方式的优势在于：
- **直观性**：文件结构直接反映了 URL 结构
- **可维护性**：添加新页面只需创建新文件
- **类型安全**：Nuxt 会自动生成路由类型定义

### 我们项目的路由结构

让我们来看看我们项目的实际路由结构：

```
pages/
├── index.vue                    # 首页
├── courses/
│   ├── index.vue               # 课程列表页
│   ├── catelog/
│   │   └── [id].vue            # 课程目录页
│   └── chapter/
│       └── [id].vue            # 章节详情页
├── plan/
│   └── index.vue               # 学习计划页
├── profile/
│   └── index.vue               # 个人资料页
└── auth/
    ├── login.vue               # 登录页
    └── register.vue            # 注册页
```

### 动态路由的实现

让我们来看看课程详情页是如何实现的：

```vue
<!-- pages/courses/[id].vue -->
<template>
  <div class="container mx-auto py-8">
    <div v-if="pending" class="flex justify-center">
      <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
    
    <div v-else-if="error" class="text-center">
      <h1 class="text-2xl font-bold text-destructive mb-4">课程未找到</h1>
      <p class="text-muted-foreground mb-4">{{ error.message }}</p>
      <Button @click="navigateTo('/courses')">返回课程列表</Button>
    </div>
    
    <div v-else-if="course" class="space-y-8">
      <!-- 课程头部信息 -->
      <div class="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-8">
        <div class="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <Badge :variant="getLevelVariant(course.level)" class="mb-4">
              {{ course.level }}
            </Badge>
            <h1 class="text-3xl font-bold mb-4">{{ course.title }}</h1>
            <p class="text-lg text-muted-foreground mb-6">{{ course.description }}</p>
            
            <div class="flex items-center gap-6 mb-6">
              <div class="flex items-center gap-2">
                <Clock class="w-5 h-5" />
                <span>{{ course.duration }}</span>
              </div>
              <div class="flex items-center gap-2">
                <Users class="w-5 h-5" />
                <span>{{ course.studentCount }} 学员</span>
              </div>
              <div class="flex items-center gap-2">
                <Star class="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span>{{ course.rating }} ({{ course.reviewCount }} 评价)</span>
              </div>
            </div>
            
            <div class="flex items-center gap-4">
              <span class="text-3xl font-bold text-primary">¥{{ course.price }}</span>
              <Button size="lg" @click="enrollCourse">
                立即报名
              </Button>
            </div>
          </div>
          
          <div class="relative">
            <img 
              :src="course.thumbnail" 
              :alt="course.title"
              class="w-full rounded-lg shadow-lg"
            />
            <Button 
              variant="secondary" 
              size="icon"
              class="absolute inset-0 m-auto w-16 h-16 rounded-full"
              @click="playPreview"
            >
              <Play class="w-8 h-8" />
            </Button>
          </div>
        </div>
      </div>
      
      <!-- 课程内容 -->
      <Tabs default-value="overview" class="w-full">
        <TabsList class="grid w-full grid-cols-4">
          <TabsTrigger value="overview">课程概述</TabsTrigger>
          <TabsTrigger value="curriculum">课程大纲</TabsTrigger>
          <TabsTrigger value="instructor">讲师介绍</TabsTrigger>
          <TabsTrigger value="reviews">学员评价</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" class="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>你将学到什么</CardTitle>
            </CardHeader>
            <CardContent>
              <ul class="space-y-2">
                <li v-for="objective in course.objectives" :key="objective" class="flex items-start gap-2">
                  <Check class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{{ objective }}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>课程要求</CardTitle>
            </CardHeader>
            <CardContent>
              <ul class="space-y-2">
                <li v-for="requirement in course.requirements" :key="requirement" class="flex items-start gap-2">
                  <AlertCircle class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>{{ requirement }}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="curriculum">
          <CourseCurriculum :chapters="course.chapters" />
        </TabsContent>
        
        <TabsContent value="instructor">
          <InstructorProfile :instructor="course.instructor" />
        </TabsContent>
        
        <TabsContent value="reviews">
          <CourseReviews :reviews="course.reviews" :rating="course.rating" />
        </TabsContent>
      </Tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Clock, Users, Star, Play, Check, AlertCircle } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// 获取路由参数
const route = useRoute()
const courseId = route.params.id as string

// 设置页面元数据
definePageMeta({
  title: '课程详情',
  description: '查看课程详细信息和报名'
})

// 获取课程数据
const { data: course, pending, error } = await useFetch(`/api/courses/${courseId}`)

// 如果课程存在，更新页面标题
if (course.value) {
  useHead({
    title: `${course.value.title} - WaliCode`,
    meta: [
      { name: 'description', content: course.value.description },
      { property: 'og:title', content: course.value.title },
      { property: 'og:description', content: course.value.description },
      { property: 'og:image', content: course.value.thumbnail }
    ]
  })
}

function getLevelVariant(level: string) {
  const variants = {
    beginner: 'default',
    intermediate: 'secondary',
    advanced: 'destructive'
  }
  return variants[level] || 'default'
}

function enrollCourse() {
  // 报名逻辑
  navigateTo(`/courses/${courseId}/enroll`)
}

function playPreview() {
  // 播放预览视频
}
</script>
```

### 嵌套路由的应用

对于复杂的页面结构，我们可以使用嵌套路由：

```
pages/
└── courses/
    ├── [id]/
    │   ├── index.vue       # /courses/:id
    │   ├── enroll.vue      # /courses/:id/enroll
    │   ├── learn.vue       # /courses/:id/learn
    │   └── certificate.vue # /courses/:id/certificate
    └── [id].vue            # 父级路由组件
```

父级路由组件：

```vue
<!-- pages/courses/[id].vue -->
<template>
  <div>
    <!-- 课程导航 -->
    <nav class="border-b">
      <div class="container mx-auto">
        <div class="flex space-x-8">
          <NuxtLink 
            :to="`/courses/${$route.params.id}`"
            class="py-4 border-b-2 border-transparent hover:border-primary"
            :class="{ 'border-primary': $route.name === 'courses-id' }"
          >
            课程详情
          </NuxtLink>
          <NuxtLink 
            :to="`/courses/${$route.params.id}/learn`"
            class="py-4 border-b-2 border-transparent hover:border-primary"
            :class="{ 'border-primary': $route.name === 'courses-id-learn' }"
          >
            开始学习
          </NuxtLink>
          <NuxtLink 
            :to="`/courses/${$route.params.id}/certificate`"
            class="py-4 border-b-2 border-transparent hover:border-primary"
            :class="{ 'border-primary': $route.name === 'courses-id-certificate' }"
          >
            证书
          </NuxtLink>
        </div>
      </div>
    </nav>
    
    <!-- 子路由内容 -->
    <NuxtPage />
  </div>
</template>
```

## 🏗️ 布局系统设计

### 布局的层次结构

Nuxt.js 的布局系统采用了层次化的设计：

```
app.vue (根布局)
├── layouts/default.vue (默认布局)
├── layouts/auth.vue (认证布局)
└── layouts/chapter.vue (章节学习布局)
```

### 根布局 - app.vue

```vue
<!-- app.vue -->
<template>
  <div id="app">
    <!-- 全局包装器 -->
    <Wrapper>
      <!-- 布局系统 -->
      <NuxtLayout>
        <!-- 页面内容 -->
        <NuxtPage />
      </NuxtLayout>
    </Wrapper>
    
    <!-- 全局组件 -->
    <Toaster />
    <LoadingIndicator />
  </div>
</template>

<script setup lang="ts">
// 全局样式
import '~/assets/css/tailwind.css'

// 全局状态初始化
const { initialize } = useAuth()
await initialize()

// 全局错误处理
useHead({
  titleTemplate: '%s - WaliCode',
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ]
})
</script>
```

### 默认布局

```vue
<!-- layouts/default.vue -->
<template>
  <div class="min-h-screen bg-background">
    <!-- 导航栏 -->
    <Navigation />
    
    <!-- 主要内容区域 -->
    <main class="flex-1">
      <slot />
    </main>
    
    <!-- 页脚 -->
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Navigation from '~/components/common/Navigation.vue'
import Footer from '~/components/common/Footer.vue'
</script>
```

### 认证布局

```vue
<!-- layouts/auth.vue -->
<template>
  <div class="min-h-screen grid lg:grid-cols-2">
    <!-- 左侧：表单区域 -->
    <div class="flex items-center justify-center py-12">
      <div class="mx-auto grid w-[350px] gap-6">
        <div class="grid gap-2 text-center">
          <NuxtLink to="/" class="flex items-center justify-center gap-2 mb-8">
            <img src="/logo.png" alt="WaliCode" class="h-8 w-8" />
            <span class="text-2xl font-bold">WaliCode</span>
          </NuxtLink>
        </div>
        
        <!-- 页面内容 -->
        <slot />
        
        <!-- 返回首页链接 -->
        <div class="text-center">
          <NuxtLink 
            to="/" 
            class="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            返回首页
          </NuxtLink>
        </div>
      </div>
    </div>
    
    <!-- 右侧：背景图片 -->
    <div class="hidden bg-muted lg:block">
      <img
        src="/images/auth-bg.jpg"
        alt="认证背景"
        class="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
      />
    </div>
  </div>
</template>
```

### 章节学习布局

```vue
<!-- layouts/chapter.vue -->
<template>
  <div class="h-screen flex flex-col">
    <!-- 顶部导航 -->
    <header class="border-b bg-background/95 backdrop-blur">
      <div class="container flex h-14 items-center">
        <div class="flex items-center gap-4">
          <Button variant="ghost" size="icon" @click="goBack">
            <ArrowLeft class="h-4 w-4" />
          </Button>
          <div>
            <h1 class="font-semibold">{{ courseTitle }}</h1>
            <p class="text-sm text-muted-foreground">{{ chapterTitle }}</p>
          </div>
        </div>
        
        <div class="ml-auto flex items-center gap-4">
          <!-- 进度条 -->
          <div class="hidden md:flex items-center gap-2">
            <span class="text-sm text-muted-foreground">进度</span>
            <Progress :value="progress" class="w-32" />
            <span class="text-sm font-medium">{{ Math.round(progress) }}%</span>
          </div>
          
          <!-- 章节导航 -->
          <ChapterNavigation />
        </div>
      </div>
    </header>
    
    <!-- 主要内容区域 -->
    <div class="flex-1 flex overflow-hidden">
      <!-- 侧边栏：章节列表 -->
      <aside class="w-80 border-r bg-muted/50 overflow-y-auto">
        <ChapterSidebar />
      </aside>
      
      <!-- 内容区域 -->
      <main class="flex-1 overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

const route = useRoute()
const courseTitle = ref('Vue.js 基础教程')
const chapterTitle = ref('组件基础')
const progress = ref(65)

function goBack() {
  navigateTo(`/courses/${route.params.courseId}`)
}
</script>
```

## 🧭 页面导航与状态管理

### 程序化导航

Nuxt.js 提供了多种导航方法：

```typescript
// 基本导航
await navigateTo('/courses')

// 带参数导航
await navigateTo(`/courses/${courseId}`)

// 外部链接
await navigateTo('https://example.com', { external: true })

// 替换当前历史记录
await navigateTo('/login', { replace: true })

// 在新窗口打开
await navigateTo('/courses', { open: { target: '_blank' } })
```

### 路由中间件

我们可以使用中间件来保护路由：

```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const { user } = useAuth()
  
  if (!user.value) {
    return navigateTo('/auth/login')
  }
})
```

在页面中使用中间件：

```vue
<!-- pages/profile/index.vue -->
<template>
  <div>
    <!-- 个人资料页面内容 -->
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})
</script>
```

### 页面过渡动画

```vue
<!-- app.vue -->
<template>
  <div>
    <NuxtLayout>
      <NuxtPage :transition="{
        name: 'page',
        mode: 'out-in'
      }" />
    </NuxtLayout>
  </div>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
```

### 面包屑导航

```vue
<!-- components/common/Breadcrumb.vue -->
<template>
  <nav class="flex" aria-label="Breadcrumb">
    <ol class="inline-flex items-center space-x-1 md:space-x-3">
      <li v-for="(item, index) in breadcrumbs" :key="item.path" class="inline-flex items-center">
        <div v-if="index > 0" class="flex items-center">
          <ChevronRight class="w-4 h-4 text-muted-foreground mx-1" />
        </div>
        
        <NuxtLink
          v-if="!item.current"
          :to="item.path"
          class="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary"
        >
          <component v-if="item.icon" :is="item.icon" class="w-4 h-4 mr-2" />
          {{ item.label }}
        </NuxtLink>
        
        <span
          v-else
          class="inline-flex items-center text-sm font-medium text-foreground"
        >
          <component v-if="item.icon" :is="item.icon" class="w-4 h-4 mr-2" />
          {{ item.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { ChevronRight, Home, BookOpen, User } from 'lucide-vue-next'

interface BreadcrumbItem {
  label: string
  path: string
  icon?: any
  current?: boolean
}

const route = useRoute()

const breadcrumbs = computed(() => {
  const items: BreadcrumbItem[] = [
    { label: '首页', path: '/', icon: Home }
  ]
  
  const pathSegments = route.path.split('/').filter(Boolean)
  let currentPath = ''
  
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const isLast = index === pathSegments.length - 1
    
    // 根据路径生成面包屑
    if (segment === 'courses') {
      items.push({
        label: '课程',
        path: currentPath,
        icon: BookOpen,
        current: isLast
      })
    } else if (segment === 'profile') {
      items.push({
        label: '个人资料',
        path: currentPath,
        icon: User,
        current: isLast
      })
    } else if (route.params.id && segment === route.params.id) {
      // 动态路由参数
      items.push({
        label: '详情',
        path: currentPath,
        current: isLast
      })
    }
  })
  
  return items
})
</script>
```

## 🎨 响应式布局设计

### 移动端优先的设计

```vue
<template>
  <div class="container mx-auto px-4">
    <!-- 移动端：垂直布局 -->
    <div class="block lg:hidden">
      <MobileCourseCard v-for="course in courses" :key="course.id" :course="course" />
    </div>
    
    <!-- 桌面端：网格布局 -->
    <div class="hidden lg:grid lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <CourseCard v-for="course in courses" :key="course.id" :course="course" />
    </div>
  </div>
</template>
```

### 自适应侧边栏

```vue
<template>
  <div class="flex">
    <!-- 桌面端侧边栏 -->
    <aside class="hidden lg:block w-64 border-r">
      <CourseSidebar />
    </aside>
    
    <!-- 移动端抽屉 -->
    <Sheet v-model:open="sidebarOpen">
      <SheetContent side="left" class="w-64 p-0">
        <CourseSidebar />
      </SheetContent>
    </Sheet>
    
    <!-- 主要内容 -->
    <main class="flex-1">
      <!-- 移动端菜单按钮 -->
      <Button
        variant="ghost"
        size="icon"
        class="lg:hidden mb-4"
        @click="sidebarOpen = true"
      >
        <Menu class="h-5 w-5" />
      </Button>
      
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { Menu } from 'lucide-vue-next'

const sidebarOpen = ref(false)
</script>
```

## 🧪 实践练习

1. **创建一个多级嵌套路由**
   - 实现课程 → 章节 → 小节的三级路由
   - 添加路由守卫和权限验证
   - 实现路由间的数据传递

2. **设计一个响应式布局**
   - 实现移动端和桌面端的不同布局
   - 添加侧边栏的展开/收起功能
   - 实现布局状态的持久化

3. **构建一个导航系统**
   - 实现面包屑导航
   - 添加页面过渡动画
   - 实现导航历史记录

## 💭 思考题

1. **文件系统路由的优缺点是什么？**
   - 在什么场景下适合使用？
   - 如何处理复杂的路由需求？

2. **如何设计一个可扩展的布局系统？**
   - 布局的粒度应该如何控制？
   - 如何处理不同设备的适配？

3. **页面状态管理的最佳实践是什么？**
   - 如何在路由切换时保持状态？
   - 如何处理页面间的数据共享？

## 🎉 小结

通过这一章的学习，我们深入了解了 Nuxt.js 的路由和布局系统。这些系统为我们的应用提供了清晰的结构和流畅的用户体验。

我们学到了：
- ✅ Nuxt.js 文件系统路由的工作原理
- ✅ 动态路由和嵌套路由的实现方法
- ✅ 灵活的布局系统设计
- ✅ 页面导航和状态管理的最佳实践
- ✅ 响应式布局的设计原则

一个好的路由和布局系统就像是城市的道路网络，它让用户能够轻松地在应用中导航，找到他们需要的内容。在下一章中，我们将基于这个结构，开始实现用户认证系统。

---

**下一章预告：** 《用户认证系统实现》- 我们将学习如何实现安全的用户认证，包括登录、注册、权限管理和会话保持，为我们的 LMS 系统添加用户体系。