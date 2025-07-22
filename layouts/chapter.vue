<template>
  <div>
    <ChapterNav 
      :visible="visible" 
      :chapters="chapters" 
      :currentChapterId="currentChapterId" 
    />
    
    <div 
      class="transition-all duration-300"
      :class="{ 'ml-72': visible }"
    >
      <div class="container mx-auto mt-20 px-4">
        <!-- 目录切换按钮 -->
        <button
          class="fixed top-4 left-4 z-30 p-2 rounded-md hover:bg-gray-100 transition-all duration-300"
          :class="{ 'left-76': visible }"
          @click.stop="toggleNav"
        >
          <LucideMenu class="size-5" />
        </button>
        
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import ChapterNav from "~/components/common/ChapterNav.vue";
import { LucideMenu } from "lucide-vue-next";
import { getCourseChapters } from "~/lib/api/modules/courses";

const route = useRoute();
const { isMember, isLoggedIn, checkMemberStatus } = useAuth();

// 响应式状态
const visible = ref(true);
const chapters = ref([]);
const loading = ref(false);

// 从路由获取信息
const currentChapterId = computed(() => route.params.id);
const courseId = computed(() => route.query.courseId || 1);

// 切换导航显示
const toggleNav = () => {
  visible.value = !visible.value;
};

// 获取课程章节数据
const getCourseChaptersData = async () => {
  if (loading.value) return; // 防止重复请求
  
  try {
    loading.value = true;
    const res = await getCourseChapters({ id: courseId.value });
    console.log(res, "布局中获取章节数据");
    if (res.errorCode === "0" && res.data?.chapters) {
      chapters.value = res.data.chapters || [];
    }
  } catch (error) {
    console.error("获取章节列表失败:", error);
    // 使用模拟数据
    chapters.value = [
      { id: 1, chaptersTitle: "1. 从0开始搭建项目" },
      { id: 2, chaptersTitle: "2. 基础项目技术" },
      { id: 3, chaptersTitle: "3. 实现课程的增删改查" },
    ];
  } finally {
    loading.value = false;
  }
};

// 监听课程ID变化，重新获取章节数据
watch(courseId, async (newCourseId, oldCourseId) => {
  if (newCourseId && newCourseId !== oldCourseId) {
    await getCourseChaptersData();
  }
}, { immediate: true });

// 初始化时检查用户状态
onMounted(async () => {
  if (isLoggedIn.value) {
    await checkMemberStatus();
  }
});
</script>

<style scoped>
.left-76 {
  left: 19rem; /* 304px - 导航宽度(288px) + 原始left(16px) */
}
</style>