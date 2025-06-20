<template>
  <nav 
    class="fixed top-0 left-0 h-full bg-white border-r border-gray-200 p-8 overflow-y-auto z-10 transition-all duration-300 ease-in-out"
    :class="visible ? 'w-72' : 'w-0'"
    :style="{ 
      minWidth: visible ? '288px' : '0px',
      opacity: visible ? '1' : '0',
      visibility: visible ? 'visible' : 'hidden'
    }"
  >
    <div v-show="visible">
      <h3 class="text-lg font-bold mb-4">课程目录</h3>
      <div class="space-y-2">
        <!-- 这里可以放置章节列表 -->
         <div v-for="chapter in chapters" :key="chapter.id">  
          <NuxtLink :to="`/courses/chapter/${chapter.id}`" class="block px-3 py-2 text-sm text-foreground hover:bg-muted hover:text-foreground/90 rounded-md"> 
            {{ chapter.title }}
          </NuxtLink>
         </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
const route = useRoute();
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});
const chapters = ref([
  { id: 1, title: '1. 基础环境安装和项目初始化' },
  { id: 2, title: '2. 项目结构和配置' },
  { id: 3, title: '3. 项目配置和优化' },
  { id: 4, title: '4. 项目配置和优化' },
  { id: 5, title: '5. 项目配置和优化' },
  { id: 6, title: '6. 项目配置和优化' },
  { id: 7, title: '7. 项目配置和优化' },
  { id: 8, title: '8. 项目配置和优化' },
  { id: 9, title: '9. 项目配置和优化' },
  { id: 10, title: '10. 项目配置和优化' },
  { id: 11, title: '11. 项目配置和优化' },
  { id: 12, title: '12. 项目配置和优化' },
  { id: 13, title: '13. 项目配置和优化' },
  { id: 14, title: '14. 项目配置和优化' },
  { id: 15, title: '15. 项目配置和优化' },
  { id: 16, title: '16. 项目配置和优化' },
]);
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

/* 自定义滚动条样式 */
::-webkit-scrollbar {
  width: 2px !important;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Firefox 滚动条样式 */
* {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}


</style>
