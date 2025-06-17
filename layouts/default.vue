<template>
    <div>
      <MarketingNavBar />
      <main class="min-h-screen">
        <slot />
      </main>
      <!-- <MarketingFooter v-if="!route.path.startsWith('/docs')" /> -->
    </div>
  </template>
  
  <script setup>
  import MarketingNavBar from '~/components/common/MarketingNavBar.vue';
//   import MarketingFooter from '~/components/MarketingFooter.vue';
  const route = useRoute();
  </script>
  