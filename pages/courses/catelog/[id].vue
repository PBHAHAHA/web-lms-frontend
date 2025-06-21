<template>
  <div class="container max-w-4xl! mx-auto mt-20 px-4">
    <div class="bg-white dark:bg-zinc-900 shadow p-4 md:p-8 mb-8">
      <div class="flex flex-col md:flex-row gap-4">
        <img 
          src="/images/javamain.png" 
          alt="课程封面" 
          class="w-full md:w-48 md:h-32 object-cover" 
        />
        <div class="flex-1">
          <h2 class="text-xl md:text-2xl font-bold mb-2">
            全栈开发实战：从零到一构建现代Web应用
          </h2>
          <p class="text-sm text-muted-foreground leading-relaxed">
            本课程将带你从基础开始，逐步掌握现代Web开发的核心技术栈，包括前端框架、后端API、数据库设计等，通过实际项目练习，让你具备独立开发完整Web应用的能力。
          </p>
        </div>
      </div>
    </div>

    <!-- 目录 -->
    <div class="bg-white dark:bg-zinc-900 shadow p-4 md:p-8 mb-8">
      <div class="flex items-center mb-4">
        <h2 class="text-xl md:text-2xl font-bold">课程目录</h2>
        <!-- <p class=" text-sm text-primary ml-2">(点击下方章节，即可跳转至对应章节)</p> -->
      </div>
      <div class="flex flex-col gap-2">
        <div
          v-for="it in catalog"
          :key="it.id"
          class="group relative flex items-center px-3 py-3 md:py-2 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer rounded"
        >
          <div
            v-if="it.lock"
            class="text-muted-foreground group-hover:text-primary transition-colors flex-1 flex items-center justify-between text-sm md:text-base"
          >
            <span class="truncate pr-2">{{ it.chaptersTitle }}</span>
            <LockIcon class="flex-shrink-0" />
          </div>
          <NuxtLink
            v-else
            :to="`/courses/chapter/${it.id}`"
            class="flex items-center justify-between text-muted-foreground group-hover:text-primary transition-colors flex-1 text-sm md:text-base truncate"
          >
            <span class="truncate pr-2">{{ it.chaptersTitle }}</span>
            <Badge variant="outline" class="ml-2">
              试学
            </Badge> 
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import LockIcon from "~/components/courses/lockicon.vue";
import { getCourseChapters } from "~/lib/api/modules/courses";
// import { LockClosedIcon } from "lucide-vue-next";
const courseId = useRoute().params.id;

const catalog = ref([]);

// 设置页面标题
useHead({
  title: `在线课程`,
  meta: [{ name: "description", content: courseId }],
});

const getCourseChaptersData = async () => {
  const res = await getCourseChapters({ id: courseId });
  console.log(res, "res");
  if(res.errorCode == 0){
    catalog.value = res.data;
  }
};

onMounted(() => {
  getCourseChaptersData();
});

</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.prose {
  max-width: none;
}

.prose h3 {
  @reference text-lg font-semibold mt-6 mb-3;
  color: #000;
}

.prose ul {
  @reference list-disc list-inside space-y-1 text-sm text-muted-foreground;
}

.prose p {
  @reference text-sm text-muted-foreground mb-4;
}
</style>
