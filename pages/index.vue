<template>
    <div class="container py-24">
    <div class="flex flex-col items-center justify-center gap-4 text-center">
      <MarketingHero />
      <!-- <MarketingFeatures /> -->
      <!-- <MarketingTestimonials /> -->
      <!-- <MarketingFAQs /> -->
    </div>
  </div>
</template>

<script setup>
import MarketingHero from '~/components/home/components/MarketingHero.vue';

// 51.la 统计示例
const { trackEvent, trackAction } = use51LaAnalytics()

// 设置页面元信息
useSeoMeta({
  title: 'Web LMS - 在线学习管理系统',
  description: '现代化的在线学习管理系统，提供优质的学习体验'
})

// 页面加载时追踪事件
onMounted(() => {
  // 追踪首页访问事件
  trackEvent('page_visit', {
    page: 'home',
    timestamp: new Date().toISOString()
  })
  
  // 追踪用户行为
  trackAction('view', 'homepage', 'landing')
})
</script>