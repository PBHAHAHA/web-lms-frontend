<template>
  <nav 
    class="fixed top-0 left-0 h-full bg-white border-r border-gray-200 py-4 overflow-y-auto z-10 transition-all duration-300 ease-in-out"
    :class="visible ? 'w-72' : 'w-0'"
    :style="{ 
      minWidth: visible ? '288px' : '0px',
      opacity: visible ? '1' : '0',
      visibility: visible ? 'visible' : 'hidden'
    }"
  >
        
    <div v-show="visible">
      <!-- LOGO组件 -->
      <div class="pb-4 px-4 border-b border-gray-200 mb-4">
        <Logo />
      </div>
      
      <h3 class="px-4 text-lg font-bold mb-4">课程目录</h3>
      <div class="space-y-2 px-4">
        <!-- 这里可以放置章节列表 -->
         <div v-for="chapter in chapters" :key="chapter.id">  
          <NuxtLink :to="`/courses/chapter/${chapter.id}`" class="block px-3 py-2 text-sm text-foreground hover:bg-muted hover:text-foreground/90 rounded-md"> 
            {{ chapter.chaptersTitle }}
          </NuxtLink>
         </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import Logo from '~/components/common/Logo.vue';
const route = useRoute();
const props = defineProps({
  visible: {
    type: Boolean,
    default: true
  },
  chapters: {
    type: Array,
    default: () => []
  }
});
const chapters = computed(() => {
  console.log(props.chapters, "props.chapters");
  return props.chapters;
});
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
