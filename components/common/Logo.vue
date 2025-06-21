<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    withLabel?: boolean;
  }>(),
  {
    withLabel: true,
  }
);
</script>

<template>
  <NuxtLink to="/" class="cursor-pointer flex items-center">
    <img src="/images/logo.png" alt="logo" class="w-6 h-8" />
    <h1 class="text-lg ml-2 font-bold text-foreground">WaliCode</h1>
  </NuxtLink>
</template>
