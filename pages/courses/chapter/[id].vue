<template>
  <div>
    <ChapterNav :visible="visible" :chapters="chapters" />
    
    <div 
      class="transition-all duration-300"
      :class="{ 'ml-72': visible }"
    >
      <div 
        class="container mx-auto mt-20 px-4"
      >
        <!-- 目录切换按钮 -->
        <button
          class="fixed top-4 left-4 z-30 p-2 rounded-md hover:bg-gray-100 transition-all duration-300"
          :class="{ 'left-76': visible }"
          @click.stop="toggleNav"
        >
          <LucideMenu class="size-5" />
        </button>
        <div v-if="loading" class="flex justify-center py-8">
          <div class="text-muted-foreground">加载中...</div>
        </div>
        <EditorRenderer v-else-if="content" :content="content" />
        <div v-else class="text-center py-8 text-muted-foreground">暂无内容</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import ChapterNav from "~/components/common/ChapterNav.vue";
import { LucideMenu } from "lucide-vue-next";
import EditorRenderer from "~/components/editor/editor-renderer.vue";
import {
  getChapterContent,
  getCourseChapters,
} from "~/lib/api/modules/courses";

const route = useRoute();
const router = useRouter();
const id = route.params.id;
const courseId = 1; // 假设课程ID

const chapters = ref([]);
const visible = ref(true);
const content = ref("");
const loading = ref(true);

// 方法
const toggleNav = () => {
  visible.value = !visible.value;
};


const getCourseChaptersData = async () => {
  try {
    const res = await getCourseChapters({ id: courseId });
    console.log(res, "chapters res");
    if (res.errorCode == 0) {
      chapters.value = res.data || [];
    }
  } catch (error) {
    console.error("获取章节列表失败:", error);
    // 使用模拟数据
    chapters.value = [
      { id: 1, title: "课程介绍与环境搭建" },
      { id: 2, title: "前端基础：Vue 3 + TypeScript" },
      { id: 3, title: "后端开发：Node.js + Express" },
      { id: 4, title: "数据库设计与操作" },
      { id: 5, title: "项目实战与部署" },
    ];
  }
};

const getChapterContentFunc = async () => {
  try {
    loading.value = true;
    const res = await getChapterContent({ id });
    console.log(res, "res");
    if (
      res &&
      (res.errorCode === 0 || res.errorCode === "0" || res.success === true)
    ) {
      content.value = JSON.parse(res.data) || "";
      console.log("设置内容成功:", content.value);
    } else {
      console.error("API返回错误:", res);
      content.value = "";
    }
  } catch (error) {
    console.error("获取章节内容失败:", error);
    content.value = "";
  } finally {
    loading.value = false;
  }
};

definePageMeta({
  layout: "chapter",
});

onMounted(() => {
  getCourseChaptersData();
  getChapterContentFunc();
});
</script>

<style scoped>
.left-76 {
  left: 19rem; /* 304px - 导航宽度(288px) + 原始left(16px) */
}
</style>
