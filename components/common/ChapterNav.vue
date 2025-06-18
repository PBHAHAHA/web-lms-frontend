<template>
  <nav class="fixed left-0 top-0 w-72 h-screen bg-white border-r border-gray-200 p-8 overflow-y-auto z-10">
    <ul class="space-y-0">
      <li>
        <NuxtLink 
          to="/courses/chapter/1" 
          class="flex items-center py-3 px-6 text-gray-600 bg-primary-hover hover:text-white transition-all duration-200 border-l-3 border-transparent"
          active-class="bg-primary text-white border-l-primary-600"
        >
          <span class="flex items-center justify-center w-6 h-6 bg-gray-200 text-gray-600 rounded-full text-sm font-medium mr-3 flex-shrink-0">1</span>
          <span class="text-sm font-medium">课程介绍</span>
        </NuxtLink>
      </li>
      <li>
        <NuxtLink 
          to="/courses/chapter/2" 
          class="flex items-center py-3 px-6 text-gray-600 hover:bg-purple-50 hover:text-purple-700 transition-all duration-200 border-l-3 border-transparent"
          active-class="bg-purple-50 text-purple-600 border-l-purple-600"
        >
          <span class="flex items-center justify-center w-6 h-6 bg-gray-200 text-gray-600 rounded-full text-sm font-medium mr-3 flex-shrink-0">2</span>
          <span class="text-sm font-medium">基础概念</span>
        </NuxtLink>
      </li>
      <li>
        <NuxtLink 
          to="/courses/chapter/3" 
          class="flex items-center py-3 px-6 text-gray-600 hover:bg-purple-50 hover:text-purple-700 transition-all duration-200 border-l-3 border-transparent"
          active-class="bg-purple-50 text-purple-600 border-l-purple-600"
        >
          <span class="flex items-center justify-center w-6 h-6 bg-gray-200 text-gray-600 rounded-full text-sm font-medium mr-3 flex-shrink-0">3</span>
          <span class="text-sm font-medium">实践操作</span>
        </NuxtLink>
      </li>
      <li>
        <NuxtLink 
          to="/courses/chapter/4" 
          class="flex items-center py-3 px-6 text-gray-600 hover:bg-purple-50 hover:text-purple-700 transition-all duration-200 border-l-3 border-transparent"
          active-class="bg-purple-50 text-purple-600 border-l-purple-600"
        >
          <span class="flex items-center justify-center w-6 h-6 bg-gray-200 text-gray-600 rounded-full text-sm font-medium mr-3 flex-shrink-0">4</span>
          <span class="text-sm font-medium">高级技巧</span>
        </NuxtLink>
      </li>
      <li>
        <NuxtLink 
          to="/courses/chapter/5" 
          class="flex items-center py-3 px-6 text-gray-600 hover:bg-purple-50 hover:text-purple-700 transition-all duration-200 border-l-3 border-transparent"
          active-class="bg-purple-50 text-purple-600 border-l-purple-600"
        >
          <span class="flex items-center justify-center w-6 h-6 bg-gray-200 text-gray-600 rounded-full text-sm font-medium mr-3 flex-shrink-0">5</span>
          <span class="text-sm font-medium">项目实战</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<script setup>
const route = useRoute();
</script>

<style scoped>
/* 为活跃状态的章节编号添加特殊样式 */
.router-link-active .flex-shrink-0 {
  @reference bg-purple-600 text-white;
}

/* 响应式设计 */
@media (max-width: 768px) {
  nav {
    @reference w-full h-auto relative border-r-0 border-b border-gray-200;
  }
}
</style>
