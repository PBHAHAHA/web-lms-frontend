<template>
  <div>
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
</template>

<script setup>
import EditorRenderer from "~/components/editor/editor-renderer.vue";
import { getChapterContent } from "~/lib/api/modules/courses";

const route = useRoute();
const { isMember, isLoggedIn, checkMemberStatus } = useAuth();

const id = route.params.id;
// 从URL查询参数获取课程ID，如果没有则默认为1
const courseId = computed(() => route.query.courseId || 1);

const content = ref("");
const loading = ref(true);

// 获取章节内容
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

// 检查当前章节权限
const checkChapterPermission = async () => {
  // 这里我们可以从布局中获取章节数据，或者单独检查权限
  // 暂时简化权限检查逻辑
  const chapterIndex = parseInt(id) - 1; // 假设章节ID是连续的数字
  
  console.log('当前章节索引:', chapterIndex, '是否会员:', isMember.value);
  
  // 如果是第三章及之后的章节（索引 >= 2），且用户不是会员
  if (chapterIndex >= 2 && !isMember.value) {
    console.log('无权限访问该章节，重定向到课程目录');
    // 重定向到课程目录页面
    await navigateTo(`/courses/catelog/${courseId.value}`);
    return false;
  }
  
  return true;
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

// 监听路由变化，重新检查权限和加载内容
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
