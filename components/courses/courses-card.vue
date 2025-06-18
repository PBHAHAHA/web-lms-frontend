<template>
  <div class="border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
    <slot />
  </div>
</template>

<script setup>
import { ref } from "vue"
const courses = ref([])
</script>