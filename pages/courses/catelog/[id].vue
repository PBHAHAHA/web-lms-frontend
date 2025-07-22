<template>
  <div class="container max-w-4xl! mx-auto mt-20 px-4">
    <!-- 课程信息卡片 -->
    <div class="bg-white dark:bg-zinc-900 shadow p-4 md:p-8 mb-8">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="w-full md:w-48 md:h-32 relative bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
          <img 
            :src="courseInfo?.img || ''" 
            :alt="courseInfo?.title || '课程封面'" 
            class="w-full h-full object-cover transition-opacity duration-300"
            :class="{ 'opacity-0': imageError }"
            @error="handleImageError"
            @load="handleImageLoad"
          />
          <!-- 占位图 -->
          <div 
            v-if="imageError" 
            class="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400"
          >
            <svg class="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <span class="text-xs text-center">课程封面</span>
          </div>
        </div>
        <div class="flex-1">
          <h2 class="text-xl md:text-2xl font-bold mb-2">
            {{ courseInfo?.title || '' }}
          </h2>
          <p class="text-sm text-muted-foreground leading-relaxed">
            {{ courseInfo?.described || '' }}
          </p>
          <!-- 课程标签 -->
          <div v-if="courseInfo?.tag?.length" class="flex gap-2 mt-3">
            <span 
              v-for="tag in courseInfo.tag" 
              :key="tag"
              class="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs rounded"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 目录 -->
    <div class="bg-white dark:bg-zinc-900 shadow p-4 md:p-8 mb-8">
      <div class="flex items-center mb-4">
        <h2 class="text-xl md:text-2xl font-bold">课程目录</h2>
        <span class="text-sm text-muted-foreground ml-2">
          (共 {{ chapters?.length || 0 }} 个章节)
        </span>
      </div>
      <div class="flex flex-col gap-2">
        <div
          v-for="(chapter, index) in chapters"
          :key="chapter.id"
          class="group relative flex items-center px-3 py-3 md:py-2 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer rounded"
          @click="handleChapterClick(chapter, index)"
        >
          <div class="flex items-center justify-between text-muted-foreground group-hover:text-primary transition-colors flex-1 text-sm md:text-base truncate">
            <span class="truncate pr-2">{{ chapter.chaptersTitle }}</span>
            <!-- 如果用户是会员，不显示任何标签 -->
            <template v-if="!isMember">
              <Badge v-if="index < 2" variant="outline" class="ml-2">
                试学
              </Badge>
              <Badge v-else variant="secondary" class="ml-2">
                付费
              </Badge>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 支付弹窗组件 -->
    <PaymentModal 
      v-model:open="showPaymentModal"
      @payment="handlePayment"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import LockIcon from "~/components/courses/lockicon.vue";
import PaymentModal from "~/components/courses/PaymentModal.vue";
import { getCourseChapters } from "~/lib/api/modules/courses";
import { useAuth } from "~/composables/useAuth";

const courseId = useRoute().params.id;
const { isLoggedIn, isMember, checkMemberStatus } = useAuth();

const courseInfo = ref(null);
const chapters = ref([]);
const showPaymentModal = ref(false);
const imageError = ref(false);

// 处理图片加载失败
const handleImageError = () => {
  imageError.value = true;
};

// 处理图片加载成功
const handleImageLoad = () => {
  imageError.value = false;
};

// 设置页面标题
const pageTitle = computed(() => courseInfo.value?.title || '在线课程');
useHead({
  title: pageTitle,
  meta: [{ name: "description", content: courseInfo.value?.described || courseId }],
});

const getCourseChaptersData = async () => {
  try {
    const res = await getCourseChapters({ id: courseId });
    console.log(res, "课程数据");
    
    if (res.errorCode === "0" && res.data) {
      // 设置课程基本信息
      courseInfo.value = {
        id: res.data.id,
        title: res.data.title?.trim(),
        described: res.data.described?.trim(),
        tag: res.data.tag || [],
        img: res.data.img
      };
      
      // 重置图片错误状态
      imageError.value = false;
      
      // 设置章节列表
      chapters.value = res.data.chapters || [];
      
      console.log('课程信息:', courseInfo.value);
      console.log('章节列表:', chapters.value);
    }
  } catch (error) {
    console.error("获取课程数据失败:", error);
    // 使用默认数据
    courseInfo.value = {
      title: "全栈开发实战：从零到一构建现代Web应用",
      described: "本课程将带你从基础开始，逐步掌握现代Web开发的核心技术栈",
      tag: ["全栈开发"],
      img: "/images/javamain.png"
    };
    chapters.value = [];
  }
};

// 处理章节点击
const handleChapterClick = async (chapter, index) => {
  // 前两章免费试学，任何人都可以访问
  if (index < 2) {
    navigateTo(`/courses/chapter/${chapter.id}?courseId=${courseId}`);
    return;
  }

  // 第三章及之后需要会员权限
  if (isLoggedIn.value && isMember.value) {
    // 已登录且是会员，直接跳转
    navigateTo(`/courses/chapter/${chapter.id}?courseId=${courseId}`);
  } else {
    // 未登录或非会员，显示支付弹窗
    showPaymentModal.value = true;
  }
};

// 处理会员支付
const handlePayment = async (paymentInfo) => {
  console.log('会员支付处理:', paymentInfo);
  
  if (paymentInfo.success) {
    // 支付成功后的逻辑
    console.log('订单ID:', paymentInfo.orderId);
    
    // 等待一段时间后检查会员状态（给后端处理时间）
    setTimeout(async () => {
      try {
        const isMemberNow = await checkMemberStatus();
        if (isMemberNow) {
          alert('会员开通成功！现在可以访问所有课程内容了。');
        } else {
          console.log('会员状态尚未更新，可能需要等待一段时间');
        }
      } catch (error) {
        console.error('检查会员状态失败:', error);
      }
    }, 2000); // 等待2秒后检查
    
    // 关闭支付弹窗
    showPaymentModal.value = false;
  } else {
    // 支付失败的处理
    console.error('支付失败:', paymentInfo);
  }
};

onMounted(async () => {
  await getCourseChaptersData();
  
  // 如果用户已登录，检查会员状态
  if (isLoggedIn.value) {
    await checkMemberStatus();
  }
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
