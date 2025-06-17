<template>
  <section class="mt-32 w-full">
    <h2
      class="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground dark:text-foreground"
    >
      用户<span class="text-primary dark:text-primary">常见问题</span>
    </h2>
    <div class="mx-auto max-w-4xl w-full">
      <Accordion type="single" collapsible class="w-full">
        <AccordionItem
          v-for="faq in faqs"
          :key="faq.question"
          :value="faq.question"
          class="w-full"
        >
          <AccordionTrigger
            class="text-lg font-semibold text-foreground dark:text-foreground"
          >
            {{ faq.question }}
          </AccordionTrigger>
          <AccordionContent>
            <p
              class="text-muted-foreground dark:text-muted-foreground text-left"
              v-html="faq.answer"
            ></p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  </section>
</template>

<script setup>
const faqs = [
  {
    question: "NuxtBase是什么？",
    answer:
      "NuxtBase是一个基于Nuxt和Supabase的全栈应用开发框架，旨在帮助Vue开发者快速构建和部署AI应用。",
  },
  {
    question: "使用NuxtBase需要什么技能？",
    answer:
      "使用NuxtBase主要需要Vue和JavaScript的基础知识。如果你熟悉Nuxt和Supabase，那将更容易上手。",
  },
  {
    question: "如何开始使用NuxtBase？",
    answer:
      "你可以访问我们的官方文档，按照快速开始指南进行安装和配置。我们提供了详细的步骤说明和示例代码。",
  },
];
</script>
