<template>
  <Wrapper>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </Wrapper>
</template>

<script setup>
// 全局认证状态管理
const { initAuth } = useAuth();

// 应用初始化
onMounted(async () => {
  try {
    await initAuth();
  } catch (error) {
    console.error("认证初始化失败:", error);
  }
});
</script>
