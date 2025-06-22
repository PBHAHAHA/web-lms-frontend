<template>
    <div class="auth-bg bg-[url('/images/auth-bg.jpg')] h-full flex items-center justify-center">
      <div class="w-full h-full md:h-auto md:m-[420px]">
        <slot />
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  
  </script>

  <style scoped>
  .auth-bg {
    background-image: url('/images/auth-bg.jpg');
    background-size: cover;
    background-position: center;
  }
  </style>