<template>
  <!-- <ClientOnly> -->
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
                  <NuxtLink
                    v-if="!isLoggedIn"
                    to="/auth/login"
                    class="block w-full px-3 py-2 text-sm text-foreground hover:bg-muted hover:text-foreground/90 rounded-md"
                  >
                    登录
                  </NuxtLink>
                  <div v-if="isLoggedIn" class="px-3 py-2 text-sm text-foreground">
                    欢迎，{{ username }}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </ClientOnly>
          <ClientOnly>
            <!-- 未登录时显示登录按钮 -->
            <NuxtLink
              v-if="!isLoggedIn"
              to="/auth/login"
              class="text-primary-foreground"
            >
              <Button class="hidden lg:flex px-6">
                登录
              </Button>
            </NuxtLink>
            
            <!-- 已登录时显示用户名 -->
            <div v-if="isLoggedIn" class="hidden lg:flex items-center gap-2">
              <span class="text-sm text-foreground">欢迎，{{ username }}</span>
            </div>
          </ClientOnly>
        </div>
      </div>
    </div>
  </nav>
<!-- </ClientOnly> -->
</template>

<script setup>
import Logo from './Logo.vue';
import { LucideMenu } from 'lucide-vue-next';
import { useAuth } from '~/composables/useAuth';

const { isLoggedIn, getLoginUser } = useAuth();

// 用户名状态
const username = ref('');

// 获取用户信息
const fetchUserInfo = async () => {
  // if (isLoggedIn.value) {
    try {
      const response = await getLoginUser();
      if (response && response.username) {
        username.value = response.username;
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  // }
};

onMounted(async () => {
  await fetchUserInfo();
});

// 监听登录状态变化
watch(isLoggedIn, async (newValue) => {
  if (newValue) {
    await fetchUserInfo();
  } else {
    username.value = '';
  }
});
</script>


