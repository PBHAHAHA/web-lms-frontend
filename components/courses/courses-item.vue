<template>
  <div class="aspect-video bg-muted relative">
    <template v-if="course.img && !imageError">
      <img
        :src="course.img"
        :alt="course.title"
        class="w-full h-full object-cover"
        @error="handleImageError"
      />
      <div
        class="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 text-xs"
      >
        热门
      </div>
    </template>
    <div
      v-else
      class="w-full h-full flex flex-col items-center justify-center bg-black text-white"
    >
      <h3 class="text-lg font-semibold text-center px-4">{{ course.title || '课程标题' }}</h3>
      <div
        v-if="course.hot"
        class="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 text-xs rounded"
      >
        热门
      </div>
    </div>
  </div>
  <div class="p-4">
    <template v-if="course.title">
      <h3 class="text-lg font-semibold mb-2">{{ course.title }}</h3>
    </template>
    <Skeleton v-else class="h-6 w-3/4 mb-2" />

    <template v-if="course.described">
      <p class="h-15 text-muted-foreground text-sm mb-4 line-clamp-3">{{ course.described }}</p>
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
      <Badge
        v-for="tag in course.tag"
        v-if="course.tag"
        variant="primary"
        class="text-xs bg-primary border-none text-primary-foreground"
      >
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
import { ref } from "vue";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const props = defineProps({
  course: {
    type: Object,
    required: true,
  },
});

const imageError = ref(false);

const handleImageError = () => {
  imageError.value = true;
};
</script>
