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
                  <NuxtLink
                    to="/auth/signin"
                    class="block w-full px-3 py-2 text-sm text-foreground hover:bg-muted hover:text-foreground/90 rounded-md"
                  >
                    登录
                  </NuxtLink>
                </div>
              </SheetContent>
            </Sheet>
          </ClientOnly>
          <ClientOnly>
            <NuxtLink
              to="/auth/login"
              class="text-primary-foreground"
            >
              <Button class="hidden lg:flex px-6">
                登录
              </Button>
            </NuxtLink>
          </ClientOnly>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import Logo from './Logo.vue';
import { LucideMenu } from 'lucide-vue-next';
</script>


