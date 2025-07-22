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
        <!-- 章节列表 -->
         <div v-for="(chapter, index) in chapters" :key="chapter.id" class="relative">  
          <!-- 会员用户或前两章：可以点击 -->
          <div 
            v-if="isMember || index < 2"
            @click="handleChapterClick(chapter, index)"
            class="flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer transition-colors"
            :class="{
              'bg-primary text-primary-foreground': isCurrentChapter(chapter.id),
              'text-foreground hover:bg-muted hover:text-foreground/90': !isCurrentChapter(chapter.id)
            }"
          > 
            <span>{{ chapter.chaptersTitle }}</span>
            <Badge 
              v-if="!isMember && index < 2" 
              :variant="isCurrentChapter(chapter.id) ? 'secondary' : 'outline'" 
              class="text-xs"
            >
              试学
            </Badge>
          </div>
          
          <!-- 非会员用户且第三章之后：显示锁定状态 -->
          <div 
            v-else
            @click="handleLockedChapterClick(chapter)"
            class="flex items-center justify-between px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 rounded-md cursor-pointer transition-colors"
          >
            <span class="flex items-center gap-2">
              <LucideLock class="w-4 h-4" />
              {{ chapter.chaptersTitle }}
            </span>
            <Badge variant="secondary" class="text-xs">
              会员
            </Badge>
          </div>
         </div>
      </div>
    </div>

    <!-- 支付弹窗 -->
    <PaymentModal 
      v-model:open="showPaymentModal"
      @payment="handlePayment"
    />
  </nav>
</template>

<script setup>
import Logo from '~/components/common/Logo.vue';
import PaymentModal from '~/components/courses/PaymentModal.vue';
import { LucideLock } from 'lucide-vue-next';
import { useAuth } from '~/composables/useAuth';

const route = useRoute();
const { isMember, checkMemberStatus } = useAuth();

// 从路由查询参数获取课程ID
const courseId = computed(() => route.query.courseId);

const props = defineProps({
  visible: {
    type: Boolean,
    default: true
  },
  chapters: {
    type: Array,
    default: () => []
  },
  // 添加当前章节ID属性
  currentChapterId: {
    type: [String, Number],
    default: null
  }
});

const showPaymentModal = ref(false);
const selectedChapter = ref(null);

const chapters = computed(() => {
  console.log(props.chapters, "props.chapters");
  return props.chapters;
});

// 处理章节点击（避免页面刷新）
const handleChapterClick = async (chapter, index) => {
  // 检查权限
  if (!isMember.value && index >= 2) {
    handleLockedChapterClick(chapter);
    return;
  }
  
  // 使用路由导航，避免页面刷新
  await navigateTo(`/courses/chapter/${chapter.id}?courseId=${courseId.value}`);
};

// 检查是否为当前章节
const isCurrentChapter = (chapterId) => {
  return String(chapterId) === String(props.currentChapterId);
};

// 处理锁定章节点击
const handleLockedChapterClick = (chapter) => {
  selectedChapter.value = chapter;
  showPaymentModal.value = true;
};

// 处理会员支付
const handlePayment = async (paymentInfo) => {
  console.log('会员支付处理:', paymentInfo);
  
  if (paymentInfo.success) {
    // 等待一段时间后检查会员状态
    setTimeout(async () => {
      try {
        const isMemberNow = await checkMemberStatus();
        if (isMemberNow) {
          alert('会员开通成功！现在可以访问所有课程内容了。');
          showPaymentModal.value = false;
          
          // 如果用户想要访问的章节现在可以访问了，自动跳转
          if (selectedChapter.value) {
            navigateTo(`/courses/chapter/${selectedChapter.value.id}?courseId=${courseId.value}`);
          }
        } else {
          console.log('会员状态尚未更新，可能需要等待一段时间');
        }
      } catch (error) {
        console.error('检查会员状态失败:', error);
      }
    }, 2000);
  } else {
    console.error('支付失败:', paymentInfo);
  }
};
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
