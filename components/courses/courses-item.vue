<template>
  <div class="aspect-video bg-muted relative">
    <template v-if="course.image && !imageError">
      <img :src="course.image" :alt="course.title" class="w-full h-full object-cover" @error="handleImageError" />
      <div v-if="course.featured"
        class="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 text-xs">热门</div>
    </template>
    <div v-else class="w-full h-full flex flex-col items-center justify-center bg-gray-100">
      <div class="text-4xl text-gray-300 mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
      </div>
      <p class="text-gray-300 text-sm"></p>
      <div v-if="course.featured"
        class="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 text-xs rounded">热门</div>
    </div>
  </div>
  <div class="p-4">
    <template v-if="course.title">
      <h3 class="text-lg font-semibold mb-2">{{ course.title }}</h3>
    </template>
    <Skeleton v-else class="h-6 w-3/4 mb-2" />
    
    <template v-if="course.description">
      <p class="text-muted-foreground text-sm mb-4">{{ course.description }}</p>
    </template>
    <Skeleton v-else class="h-4 w-full mb-4" />
    
    <div class="flex items-center justify-between">
      <template v-if="course.price !== undefined">
        <span class="text-primary font-medium">¥{{ course.price }}</span>
      </template>
      <Skeleton v-else class="h-5 w-16" />
      
      <Button size="sm" @click="viewCourse(course.id)">查看详情</Button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Skeleton } from '@/components/ui/skeleton';

const props = defineProps({
  course: {
    type: Object,
    required: true
  }
});

const imageError = ref(false);

const handleImageError = () => {
  imageError.value = true;
};

const viewCourse = (courseId) => {
  // 这里需要实现查看课程详情的逻辑
};
</script>