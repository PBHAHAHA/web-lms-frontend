<template>
  <section class="mt-10">
    <div class="flex justify-center">
      <span class="inline-flex space-x-6">
        <span
          class="rounded-full bg-primary/10 px-6 py-1 text-sm leading-6 text-primary ring-1 ring-inset ring-primary/10"
          >现在注册加入社区！可享受8折优惠 </span
        >
        <NuxtLink
          
          class="inline-flex items-center space-x-2 text-sm font-medium leading-6 text-muted-foreground"
        >
          <!-- <span>最新课程内容已更新</span> -->
        </NuxtLink>
      </span>
    </div>
    <h1
      class="mt-10 text-5xl font-semibold text-foreground text-center lg:text-6xl !leading-tight"
    >
      掌握全栈开发<br />从WaliCode开始<span
        class="gradient-text ml-1 text-primary"
        ></span
      >
    </h1>
    <p class="mt-6 text-base leading-8 text-muted-foreground text-center">
      一次加入，终身学习
    </p>
    <div class="mt-10 flex justify-center items-center gap-x-4">
      <Button class="text-sm px-8 py-6" @click="onStartClick">
        开始学习
      </Button>
      <Button
        variant="outline"
        class="text-sm px-8 py-6 border border-primary text-primary hover:bg-primary/10 hover:text-primary"
        @click="onServiceClick"
      >
        课程计划
      </Button>
      <!-- <Button
        variant="outline"
        class="text-sm px-8 py-6 text-foreground"
        @click="onReadDocClick"
      >
        查看文档
      </Button> -->
    </div>
    <MarketingFrameworksBrands :gray="true" />
  </section>
</template>

<script setup>
import { ChevronRight, ArrowRight } from "lucide-vue-next";

import MarketingFrameworksBrands from "./MarketingFrameworksBrands.vue";

const router = useRouter();
const onStartClick = () => {
  router.push("/auth/signin");
};

const onServiceClick = () => {
  router.push("/plan");
};
</script>
