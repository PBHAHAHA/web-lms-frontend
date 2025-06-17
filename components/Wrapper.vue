<template>
    <div
      class="relative min-h-screen max-w-full overflow-x-hidden gradient-background-wrapper"
    >
      <div
        class="fixed top-0 left-0 w-full h-screen bg-gradient-to-b from-card from-0% to-background to-[50vh]"
      ></div>
      <div
        class="fixed top-0 left-1/2 z-10 ml-[-500px] h-[500px] w-[1000px] rounded-full bg-gradient-to-r from-primary via-background to-highlight opacity-30 blur-[120px]"
      ></div>
      <div class="relative z-20">
        <slot />
      </div>
    </div>
  </template>
  
  <style scoped>
  .gradient-background-wrapper {
    scrollbar-width: none;
    overflow-y: hidden;
    &::-webkit-scrollbar {
      display: none;
    }
  }
  </style>