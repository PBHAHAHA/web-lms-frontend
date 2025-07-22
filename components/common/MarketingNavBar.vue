<template>
  <nav
    id="marketing-header"
    class="fixed left-0 top-0 z-50 w-full transition-[height] duration-200 rounded-b-lg bg-background/70 shadow-sm backdrop-blur-lg"
    data-test="navigation"
  >
    <div class="container relative z-50">
      <div class="flex items-center justify-stretch gap-6 transition-all duration-200 py-4">
        <div class="flex flex-1 justify-start">
          <!-- <NuxtLink to="/" class="block hover:no-underline active:no-underline"> -->
            <Logo />
          <!-- </NuxtLink> -->
        </div>

        <div class="hidden flex-1 items-center justify-center lg:flex">
          <NuxtLink
            to="/"
            class="block shrink-0 px-3 py-2 text-sm text-foreground hover:text-foreground/90"
          >
            首页
          </NuxtLink>
          <NuxtLink
            to="/courses"
            class="block shrink-0 px-3 py-2 text-sm text-foreground hover:text-foreground/90"
          >
            课程
          </NuxtLink>
          <NuxtLink
            to="/plan"
            class="block shrink-0 px-3 py-2 text-sm text-foreground hover:text-foreground/90"
          >
            课程计划
          </NuxtLink>
        </div>

        <div class="flex flex-1 items-center justify-end gap-2">
          <ClientOnly>
            <!-- <ColorModeToggle /> -->
          </ClientOnly>
          <ClientOnly>
            <Sheet>
              <SheetTrigger asChild>
                <Button class="lg:hidden" size="icon" variant="outline">
                  <LucideMenu class="size-4 text-foreground" />
                </Button>
              </SheetTrigger>
              <SheetContent class="w-[250px]" side="right">
                <div class="flex flex-col items-stretch justify-center mt-8">
                  <NuxtLink
                    to="/"
                    class="block w-full px-3 py-2 text-sm text-foreground hover:bg-muted hover:text-foreground/90 rounded-md"
                  >
                    首页
                  </NuxtLink>
                  <NuxtLink
                    to="/courses"
                    class="block w-full px-3 py-2 text-sm text-foreground hover:bg-muted hover:text-foreground/90 rounded-md"
                  >
                    课程
                  </NuxtLink>
                  <NuxtLink
                    to="/plan"
                    class="block w-full px-3 py-2 text-sm text-foreground hover:bg-muted hover:text-foreground/90 rounded-md"
                  >
                    课程计划
                  </NuxtLink>
                  
                  <!-- 移动端登录/用户信息 -->
                  <div class="border-t mt-4 pt-4">
                    <NuxtLink
                      v-if="!isLoggedIn"
                      to="/auth/login"
                      class="block w-full px-3 py-2 text-sm text-foreground hover:bg-muted hover:text-foreground/90 rounded-md"
                    >
                      登录
                    </NuxtLink>
                    <NuxtLink
                      v-if="!isLoggedIn"
                      to="/auth/register"
                      class="block w-full px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground/90 rounded-md"
                    >
                      注册
                    </NuxtLink>
                    
                    <!-- 已登录用户信息 -->
                    <div v-if="isLoggedIn" class="space-y-2">
                      <div class="px-3 py-2 text-sm text-foreground border-b">
                        <div class="flex items-center gap-2">
                          <div class="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground">
                            {{ getUserInitial(userInfo?.username) }}
                          </div>
                          <span class="font-medium">{{ userInfo?.username || '用户' }}</span>
                        </div>
                      </div>
                      <NuxtLink
                        to="/profile"
                        class="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted hover:text-foreground/90 rounded-md"
                      >
                        <LucideUser class="w-4 h-4" />
                        个人中心
                      </NuxtLink>
                      <NuxtLink
                        to="/my-courses"
                        class="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted hover:text-foreground/90 rounded-md"
                      >
                        <LucideBook class="w-4 h-4" />
                        我的课程
                      </NuxtLink>
                      <NuxtLink
                        to="/settings"
                        class="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted hover:text-foreground/90 rounded-md"
                      >
                        <LucideSettings class="w-4 h-4" />
                        设置
                      </NuxtLink>
                      <button
                        @click="handleLogout"
                        class="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md text-left"
                      >
                        <LucideLogOut class="w-4 h-4" />
                        退出登录
                      </button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </ClientOnly>
          
          <ClientOnly>
            <!-- 桌面端登录/用户信息 -->
            <div class="hidden lg:flex items-center gap-2">
              <!-- 未登录时显示登录和注册按钮 -->
              <template v-if="!isLoggedIn">
                <NuxtLink
                  to="/auth/register"
                  class="text-foreground hover:text-foreground/80"
                >
                  <Button variant="ghost" size="sm">
                    注册
                  </Button>
                </NuxtLink>
                <NuxtLink
                  to="/auth/login"
                  class="text-primary-foreground"
                >
                  <Button size="sm" class="px-6">
                    登录
                  </Button>
                </NuxtLink>
              </template>
              
              <!-- 已登录时显示用户菜单 -->
              <UserMenu v-if="isLoggedIn" />
            </div>
          </ClientOnly>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import Logo from './Logo.vue';
import UserMenu from './UserMenu.vue';
import { LucideMenu, LucideUser, LucideBook, LucideSettings, LucideLogOut } from 'lucide-vue-next';
import { useAuth } from '~/composables/useAuth';

const { isLoggedIn, userInfo, logout, initAuth } = useAuth();

// 组件挂载时初始化认证状态
onMounted(() => {
  initAuth();
});

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


