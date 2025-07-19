<template>
  <div class="min-h-screen mt-16">
    <div class="container mx-auto px-4 py-8">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">课程计划</h1>
        <p class="text-gray-600">管理和跟踪所有课程的开发进度</p>
      </div>

      <!-- 状态统计 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        <div class="bg-white shadow-sm p-6 border-l-4 border-green-500">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <CheckCircleIcon class="h-8 w-8 text-green-500" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">开发中</p>
              <p class="text-2xl font-semibold text-gray-900">{{ developingCount }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white shadow-sm p-6 border-l-4 border-yellow-500">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <ClockIcon class="h-8 w-8 text-yellow-500" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">待计划</p>
              <p class="text-2xl font-semibold text-gray-900">{{ plannedCount }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 筛选器 -->
      <div class="mb-6">
        <div class="flex flex-wrap gap-2">
          <button
            @click="selectedStatus = 'all'"
            :class="[
              'px-4 py-2 text-sm font-medium transition-colors',
              selectedStatus === 'all' 
                ? 'bg-primary text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            ]"
          >
            全部课程
          </button>
          <button
            @click="selectedStatus = 'developing'"
            :class="[
              'px-4 py-2 text-sm font-medium transition-colors',
              selectedStatus === 'developing' 
                ? 'bg-green-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            ]"
          >
            开发中
          </button>
          <button
            @click="selectedStatus = 'planned'"
            :class="[
              'px-4 py-2 text-sm font-medium transition-colors',
              selectedStatus === 'planned' 
                ? 'bg-yellow-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            ]"
          >
            待计划
          </button>
        </div>
      </div>

      <!-- 课程卡片网格 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="course in filteredCourses"
          :key="course.id"
          class="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
        >
          <!-- 课程封面 -->
          <div class="h-48 bg-gradient-to-br from-blue-400 to-purple-500 relative">
            <div class="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
              <h3 class="text-white text-xl font-bold text-center px-4">{{ course.title }}</h3>
            </div>
            <!-- 状态标签 -->
            <div class="absolute top-4 right-4">
              <span
                :class="[
                  'px-3 py-1 text-xs font-medium',
                  course.status === 'developing' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                ]"
              >
                {{ course.status === 'developing' ? '开发中' : '待计划' }}
              </span>
            </div>
          </div>

          <!-- 课程信息 -->
          <div class="p-6">
            <div class="mb-4">
              <p class="text-gray-600 text-sm mb-2">{{ course.description }}</p>
              <div class="flex items-center text-sm text-gray-500">
                <CalendarIcon class="h-4 w-4 mr-1" />
                <span>预计时长: {{ course.duration }}</span>
              </div>
            </div>

            <!-- 进度条 (仅开发中的课程显示) -->
            <div v-if="course.status === 'developing'" class="mb-4">
              <div class="flex justify-between text-sm text-gray-600 mb-1">
                <span>开发进度</span>
                <span>{{ course.progress }}%</span>
              </div>
              <div class="w-full bg-gray-200 h-2">
                <div
                  class="bg-green-500 h-2 transition-all duration-300"
                  :style="{ width: `${course.progress}%` }"
                ></div>
              </div>
            </div>

            <!-- 标签 -->
            <div class="flex flex-wrap gap-2 mb-4">
              <span
                v-for="tag in course.tags"
                :key="tag"
                class="px-2 py-1 bg-gray-100 text-gray-700 text-xs"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 添加新课程按钮 -->
      <div class="fixed bottom-8 right-8">
        <button class="bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors">
          <PlusIcon class="h-6 w-6" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  BookOpenIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  CalendarIcon, 
  MoreVerticalIcon, 
  PlusIcon 
} from 'lucide-vue-next'

// 页面元数据
useHead({
  title: '课程计划 - 课程管理系统',
  meta: [
    { name: 'description', content: '所有课程的开发进度和计划' }
  ]
})

// 响应式数据
const selectedStatus = ref('all')

// 模拟课程数据
const courses = ref([
  {
    id: 1,
    title: 'Vue.js 基础入门',
    description: '从零开始学习Vue.js框架，掌握现代前端开发技能',
    status: 'developing',
    progress: 75,
    duration: '8小时',
    tags: ['前端', 'Vue.js', '初级']
  },
  {
    id: 2,
    title: 'Nuxt.js 全栈开发图形编辑器',
    description: '使用Nuxt.js构建现代化的全栈Web应用程序',
    status: 'developing',
    progress: 45,
    duration: '12小时',
    tags: ['全栈', 'Nuxt.js', '中级']
  },
  {
    id: 3,
    title: 'TypeScript 进阶',
    description: '深入学习TypeScript高级特性和最佳实践',
    status: 'planned',
    progress: 0,
    duration: '10小时',
    tags: ['TypeScript', '进阶', '类型系统']
  },
  {
    id: 4,
    title: 'GSAP 动画教程',
    description: '使用GSAP动画库实现动画效果',
    status: 'planned',
    progress: 0,
    duration: '3小时',
    tags: ['后端', 'Node.js', '中级']
  },
  {
    id: 6,
    title: '微前端架构实践',
    description: '学习微前端架构设计和实现方案',
    status: 'planned',
    progress: 0,
    duration: '20小时',
    tags: ['架构', '微前端', '高级']
  }
])

// 计算属性
const developingCount = computed(() => 
  courses.value.filter(course => course.status === 'developing').length
)

const plannedCount = computed(() => 
  courses.value.filter(course => course.status === 'planned').length
)

const filteredCourses = computed(() => {
  if (selectedStatus.value === 'all') {
    return courses.value
  }
  return courses.value.filter(course => course.status === selectedStatus.value)
})
</script>

<style scoped>
.container {
  max-width: 1200px;
}
</style>