<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto mt-18">
      <!-- 页面标题 -->
      <!-- <div class="mb-8">
        <h1 class="text-3xl font-semibold text-foreground mb-2">个人中心</h1>
        <p class="text-muted-foreground">管理您的个人信息和账户设置</p>
      </div> -->

      <!-- 用户概览卡片 -->
      <div class="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 mb-6">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 bg-primary flex items-center rounded-full justify-center">
            <LucideUser class="w-8 h-8 text-primary-foreground" />
          </div>
          <div class="flex-1">
            <h2 class="text-2xl font-bold text-foreground mb-1">
              {{ userInfo?.userName || '用户' }}
            </h2>
            <div class="flex items-center gap-3">
              <span class="text-muted-foreground">ID: {{ userInfo?.id || '未知' }}</span>
              <span class="inline-flex items-center px-3 py-1 text-sm font-medium" 
                    :class="isMember ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'">
                <LucideCrown v-if="isMember" class="w-4 h-4 mr-1" />
                {{ isMember ? '会员用户' : '游客' }}
              </span>
            </div>
          </div>
          <!-- <div class="text-right">
            <p class="text-sm text-muted-foreground">登录时长</p>
            <p class="text-lg font-semibold">{{ formatLoginDuration() }}</p>
          </div> -->
        </div>
      </div>

      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <!-- 基本信息卡片 -->
        <div class="bg-background p-6 shadow-sm">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <LucideUser class="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 class="text-xl font-semibold text-foreground">基本信息</h2>
              <p class="text-sm text-muted-foreground">您的个人基本信息</p>
            </div>
          </div>

          <div class="space-y-4">
            <div class="flex items-center justify-between py-3 border-b border-border">
              <span class="text-muted-foreground">用户名</span>
              <span class="font-medium text-foreground">{{ userInfo?.userName || '未知用户' }}</span>
            </div>
            
            <div class="flex items-center justify-between py-3 border-b border-border">
              <span class="text-muted-foreground">邮箱</span>
              <span class="font-medium text-foreground">{{ userInfo?.email || '未绑定' }}</span>
            </div>
            
            <div class="flex items-center justify-between py-3">
              <span class="text-muted-foreground">用户ID</span>
              <span class="font-medium text-foreground">{{ userInfo?.id || '未知' }}</span>
            </div>
          </div>
        </div>

        <!-- 会员状态卡片 -->
        <div class="bg-background p-6 shadow-sm">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-12 h-12 rounded-full flex items-center justify-center"
                 :class="isMember ? 'bg-green-500' : 'bg-gray-500'">
              <LucideCrown v-if="isMember" class="w-6 h-6 text-white" />
              <LucideShield v-else class="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 class="text-xl font-semibold text-foreground">会员状态</h2>
              <p class="text-sm text-muted-foreground">您的会员权益信息</p>
            </div>
          </div>

          <div class="space-y-4">
            <div class="flex items-center justify-between py-3 border-b border-border">
              <span class="text-muted-foreground">当前状态</span>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                    :class="isMember ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'">
                <LucideCrown v-if="isMember" class="w-3 h-3 mr-1" />
                {{ getMemberStatusText() }}
              </span>
            </div>
            
            <div class="flex items-center justify-between py-3 border-b border-border">
              <span class="text-muted-foreground">会员类型</span>
              <span class="font-medium text-foreground">{{ userInfo?.member || '不是会员' }}</span>
            </div>
            
            <div class="flex items-center justify-between py-3">
              <span class="text-muted-foreground">账户安全</span>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                <LucideCheck class="w-3 h-3 mr-1" />
                正常
              </span>
            </div>
          </div>
        </div>

        <!-- 学习统计卡片 -->
        <!-- <div class="bg-background border border-border rounded-lg p-6 shadow-sm">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <LucideBookOpen class="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 class="text-xl font-semibold text-foreground">学习统计</h2>
              <p class="text-sm text-muted-foreground">您的学习进度</p>
            </div>
          </div>

          <div class="space-y-4">
            <div class="flex items-center justify-between py-3 border-b border-border">
              <span class="text-muted-foreground">已学课程</span>
              <span class="font-medium text-foreground">5 门</span>
            </div>
            
            <div class="flex items-center justify-between py-3 border-b border-border">
              <span class="text-muted-foreground">学习时长</span>
              <span class="font-medium text-foreground">24 小时</span>
            </div>
            
            <div class="flex items-center justify-between py-3">
              <span class="text-muted-foreground">完成率</span>
              <span class="font-medium text-foreground">85%</span>
            </div>
          </div>
        </div> -->
      </div>

    </div>
  </div>
</template>

<script setup>
import { 
  LucideUser, 
  LucideShield, 
  LucideCheck,
  LucideCrown,
  LucideBookOpen,
  LucideSettings,
  LucideLogOut
} from 'lucide-vue-next';
import { useAuth } from '~/composables/useAuth';

const { userInfo, isMember, getLoginDuration, logout } = useAuth();

// 页面元数据
useHead({
  title: '个人中心 - WaliCode',
  meta: [
    {
      name: 'description',
      content: '管理您的个人信息和账户设置',
    },
  ],
});

// 格式化登录持续时间
const formatLoginDuration = () => {
  const duration = getLoginDuration();
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  } else {
    return `${minutes}分钟`;
  }
};

// 获取会员状态文本
const getMemberStatusText = () => {
  if (isMember.value) {
    return '会员用户';
  } else {
    return '游客';
  }
};

// 处理退出登录
const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    logout();
    navigateTo('/auth/login');
  }
};

// 页面加载时获取最新用户信息
onMounted(() => {
  // 这里可以调用 getLoginUser 确保信息是最新的
});
</script>