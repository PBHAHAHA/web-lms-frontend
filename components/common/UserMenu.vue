<template>
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" class="flex items-center gap-2 px-3">
        <div class="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground">
          {{ getUserInitial(userInfo?.userName) }}
        </div>
        <span class="text-sm text-foreground">{{ userInfo?.userName || '用户' }}</span>
        <LucideChevronDown class="w-4 h-4 text-foreground/60" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-48">
      <DropdownMenuLabel>
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-sm text-primary-foreground">
            {{ getUserInitial(userInfo?.userName) }}
          </div>
          <div class="flex flex-col">
            <span class="font-medium">{{ userInfo?.userName || '用户' }}</span>
            <!-- <span class="text-xs text-muted-foreground">在线学习</span> -->
          </div>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <NuxtLink to="/profile" class="flex items-center gap-2">
          <LucideUser class="w-4 h-4" />
          个人中心
        </NuxtLink>
      </DropdownMenuItem>
      <!-- <DropdownMenuItem asChild>
        <NuxtLink to="/my-courses" class="flex items-center gap-2">
          <LucideBook class="w-4 h-4" />
          我的课程
        </NuxtLink>
      </DropdownMenuItem> -->
      <!-- <DropdownMenuItem asChild>
        <NuxtLink to="/settings" class="flex items-center gap-2">
          <LucideSettings class="w-4 h-4" />
          设置
        </NuxtLink>
      </DropdownMenuItem> -->
      <DropdownMenuSeparator />
      <DropdownMenuItem 
        @click="handleLogout"
        class="text-red-600 focus:text-red-600 focus:bg-red-50"
      >
        <div class="flex items-center gap-2">
          <LucideLogOut class="w-4 h-4" />
          退出登录
        </div>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup>
import { LucideChevronDown, LucideUser, LucideBook, LucideSettings, LucideLogOut } from 'lucide-vue-next';
// import { useAuth } from '~/composables/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { useAuth } from '~/composables/useAuth';

const { userInfo, logout } = useAuth();

// 获取用户名首字母
const getUserInitial = (username) => {
  if (!username) return 'U';
  return username.charAt(0).toUpperCase();
};

// 处理登出
const handleLogout = async () => {
  try {
    // 调用登出方法 (现在是异步的)
    await logout();
    
    // 注意：logout函数已经会自动跳转到登录页，这里不需要再跳转
  } catch (error) {
    console.error('登出失败:', error);
  }
};
</script> 