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
        
        <!-- 内容区域 - 添加淡入淡出过渡 -->
        <div class="relative">
          <Transition
            name="fade"
            mode="out-in"
          >
            <div v-if="loading" key="loading" class="flex justify-center py-8">
              <div class="text-muted-foreground">加载中...</div>
            </div>
            <EditorRenderer 
              v-else-if="content" 
              key="content"
              :content="content" 
              class="fade-enter-active"
            />
            <div v-else key="empty" class="text-center py-8 text-muted-foreground">
              暂无内容
            </div>
          </Transition>
        </div>
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
const { isMember, isLoggedIn, checkMemberStatus } = useAuth();

const id = route.params.id;
const courseId = 1; // 假设课程ID

const chapters = ref([]);
const visible = ref(true);
const content = ref("");
const loading = ref(true);
const currentChapterIndex = ref(-1);

// 方法
const toggleNav = () => {
  visible.value = !visible.value;
};

// 检查当前章节权限
const checkChapterPermission = async () => {
  // 只有在章节列表为空时才获取
  if (chapters.value.length === 0) {
    await getCourseChaptersData();
  }
  
  // 找到当前章节的索引
  const chapterIndex = chapters.value.findIndex(chapter => chapter.id == id);
  currentChapterIndex.value = chapterIndex;
  
  console.log('当前章节索引:', chapterIndex, '是否会员:', isMember.value);
  
  // 如果是第三章及之后的章节（索引 >= 2），且用户不是会员
  if (chapterIndex >= 2 && !isMember.value) {
    console.log('无权限访问该章节，重定向到课程目录');
    // 重定向到课程目录页面
    await navigateTo(`/courses/catelog/${courseId}`);
    return false;
  }
  
  return true;
};

const getCourseChaptersData = async () => {
  try {
    const res = await getCourseChapters({ id: courseId });
    console.log(res, "章节数据");
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
  }
};

const getChapterContentFunc = async (showLoading = true) => {
  try {
    if (showLoading) {
      loading.value = true;
    }
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
    if (showLoading) {
      loading.value = false;
    }
  }
};

definePageMeta({
  layout: "chapter",
});

onMounted(async () => {
  // 如果用户已登录，先检查会员状态
  if (isLoggedIn.value) {
    await checkMemberStatus();
  }
  
  // 检查章节权限
  const hasPermission = await checkChapterPermission();
  
  // 只有有权限时才加载内容
  if (hasPermission) {
    await getChapterContentFunc(true);
  }
});

// 监听路由变化，重新检查权限
watch(() => route.params.id, async (newId, oldId) => {
  if (newId && newId !== oldId) {
    // 路由切换时不显示loading，避免闪烁
    const hasPermission = await checkChapterPermission();
    if (hasPermission) {
      // 平滑切换内容，不显示loading状态
      await getChapterContentFunc(false);
    }
  }
});
</script>

<style scoped>
.left-76 {
  left: 19rem; /* 304px - 导航宽度(288px) + 原始left(16px) */
}

/* 淡入淡出过渡效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
