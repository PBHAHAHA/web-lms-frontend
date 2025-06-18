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
    <div class="flex flex-wrap gap-2 mb-4">
      <!-- <Badge v-if="course.level" variant="secondary" class="text-xs">
        {{ course.level }}
      </Badge>
      <Badge v-if="course.category" variant="outline" class="text-xs">
        {{ course.category }}
      </Badge>
      <Badge v-if="course.duration" variant="secondary" class="text-xs">
        {{ course.duration }}
      </Badge> -->
      <Badge v-if="course.tags" v-for="tag in course.tags" :key="tag" variant="outline" class="text-xs">
        {{ tag }}
      </Badge>
    </div>
    <div class="flex items-center justify-between">
      <div></div>
      <NuxtLink :to="`/courses/catelog/${course.id}`" class="inline-block">
        <!-- <Button size="sm">查看详情</Button> -->
        <Button size="sm">开始学习</Button>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

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
</script>