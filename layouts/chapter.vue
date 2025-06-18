<template>
    <div class="container flex">
        <!-- <ChapterNav class="w-72"/> -->
        <div class="flex-1 ml-72">
            <slot />
        </div>
    </div>
  </template>
  
  <script setup>
  import ChapterNav from '~/components/common/ChapterNav.vue';
  const route = useRoute();
  </script>
  