<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-semibold text-foreground mb-2">个人中心</h1>
        <p class="text-muted-foreground">管理您的个人信息和账户设置</p>
      </div>

      <div class="grid gap-6 md:grid-cols-2">
        <!-- 基本信息卡片 -->
        <div class="bg-background border border-border rounded-lg p-6 shadow-sm">
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
              <span class="font-medium text-foreground">{{ userInfo?.username || '未知用户' }}</span>
            </div>
            
            <div class="flex items-center justify-between py-3 border-b border-border">
              <span class="text-muted-foreground">用户ID</span>
              <span class="font-medium text-foreground">{{ userInfo?.id || '未知' }}</span>
            </div>
            
            <div class="flex items-center justify-between py-3">
              <span class="text-muted-foreground">注册时间</span>
              <span class="font-medium text-foreground">{{ formatDate(userInfo?.createdAt) || '未知' }}</span>
            </div>
          </div>
        </div>

        <!-- 账户状态卡片 -->
        <div class="bg-background border border-border rounded-lg p-6 shadow-sm">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
              <LucideShield class="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 class="text-xl font-semibold text-foreground">账户状态</h2>
              <p class="text-sm text-muted-foreground">您的会员和付费状态</p>
            </div>
          </div>

          <div class="space-y-4">
            <div class="flex items-center justify-between py-3 border-b border-border">
              <span class="text-muted-foreground">会员状态</span>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                    :class="userInfo?.paidAt ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'">
                {{ userInfo?.paidAt ? '付费会员' : '免费用户' }}
              </span>
            </div>
            
            <div class="flex items-center justify-between py-3 border-b border-border">
              <span class="text-muted-foreground">付费时间</span>
              <span class="font-medium text-foreground">{{ formatDate(userInfo?.paidAt) || '未付费' }}</span>
            </div>
            
            <div class="flex items-center justify-between py-3">
              <span class="text-muted-foreground">账户安全</span>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                <LucideCheck class="w-3 h-3 mr-1" />
                正常
              </span>
            </div>
          </div>
        </div>


      </div>
    </div>
  </div>
</template>

<script setup>
import { 
  LucideUser, 
  LucideShield, 
  LucideCheck
} from 'lucide-vue-next';
import { useAuth } from '~/composables/useAuth';

const { userInfo } = useAuth();

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

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return '无效日期';
  }
};


</script>