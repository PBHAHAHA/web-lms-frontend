<template>
    <div class="auth-bg  flex items-center justify-center">
        <div class="w-full h-full">
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