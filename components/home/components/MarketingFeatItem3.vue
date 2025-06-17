<template>
  <div
    class="grid items-center gap-8 rounded-2xl border border-border bg-card/50 p-8 lg:grid-cols-2 lg:gap-16 dark:bg-card/5 hover:bg-card/80 dark:hover:bg-card/10 transition-colors"
  >
    <div
      class="overflow-hidden rounded-xl bg-primary/5 dark:bg-primary/950/50 p-12 transition-colors"
    >
      <img
        src="https://static-main.aiyeshi.cn/nuxtbase/images/common/feat-light.svg"
        alt=""
        class="dark:invert"
      />
    </div>

    <div class="text-left">
      <h3 class="font-bold text-2xl lg:text-3xl text-foreground">功能点3</h3>
      <p class="mt-6 text-lg leading-8 text-muted-foreground">
        你的产品提供了强大的功能点3，你需要在这里给用户介绍这个功能点
      </p>
      <div class="mt-6 grid grid-cols-2 gap-4">
        <div class="p-4 rounded-lg hover:bg-accent transition-colors">
          <Zap class="w-6 h-6 text-primary dark:text-primary" />
          <h4 class="font-bold text-lg mt-2 text-foreground">特点1</h4>
          <p class="text-lg leading-8 text-muted-foreground">
            这是一个实用的特点
          </p>
        </div>
        <div class="p-4 rounded-lg hover:bg-accent transition-colors">
          <CloudUpload class="w-6 h-6 text-primary dark:text-primary" />
          <h4 class="font-bold text-lg mt-2 text-foreground">特点2</h4>
          <p class="text-lg leading-8 text-muted-foreground">
            这是一个实用的特点
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Zap, CloudUpload } from "lucide-vue-next";
</script>
