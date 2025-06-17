<template>
  <section class="mt-32 mx-auto">
    <h2
      class="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground"
    >
      展示<span class="text-primary">用户评价</span>
    </h2>
    <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="testimonial in testimonials"
        :key="testimonial.author.handle"
        class="rounded-2xl p-8 bg-white border dark:bg-zinc-900"
      >
        <blockquote class="text-foreground mb-6">
          <p class="text-base text-left">{{ `"${testimonial.body}"` }}</p>
        </blockquote>
        <div class="flex items-left">
          <img
            class="h-12 w-12 rounded-full mr-4"
            :src="testimonial.author.imageUrl"
            :alt="testimonial.author.name"
          />
          <div>
            <div class="font-semibold text-foreground text-left">
              {{ testimonial.author.name }}
            </div>
            <div class="text-muted-foreground">
              {{ `@${testimonial.author.handle}` }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const testimonials = [
  {
    body: "NuxtBase真是太棒了！它让我能够快速构建和部署AI应用，节省了大量的开发时间。强烈推荐给所有Vue开发者！",
    author: {
      name: "张明",
      handle: "zhangming",
      imageUrl: "https://randomuser.me/api/portraits/men/1.jpg",
    },
  },
  {
    body: "作为一个Vue新手，NuxtBase让我轻松上手AI应用开发。它的文档清晰，代码结构合理，是学习全栈开发的绝佳工具。",
    author: {
      name: "李华",
      handle: "lihua",
      imageUrl: "https://randomuser.me/api/portraits/women/2.jpg",
    },
  },
  {
    body: "NuxtBase的支付集成功能太赞了！它帮我省去了很多麻烦，让我可以专注于核心业务逻辑的开发。",
    author: {
      name: "王强",
      handle: "wangqiang",
      imageUrl: "https://randomuser.me/api/portraits/men/3.jpg",
    },
  },
  {
    body: "我用NuxtBase只花了一天时间就上线了自己的AI应用，这简直是不可思议！它真的很好地提高了开发效率。",
    author: {
      name: "陈静",
      handle: "chenjing",
      imageUrl: "https://randomuser.me/api/portraits/women/4.jpg",
    },
  },
  {
    body: "NuxtBase的AI集成非常出色，支持多种大模型，让我的应用功能更加强大。这个框架绝对值得信赖！",
    author: {
      name: "刘伟",
      handle: "liuwei",
      imageUrl: "https://randomuser.me/api/portraits/men/5.jpg",
    },
  },
  {
    body: "作为一个独立开发者，NuxtBase让我能够快速将想法转化为现实。它的全栈特性真的很实用！",
    author: {
      name: "赵琳",
      handle: "zhaolin",
      imageUrl: "https://randomuser.me/api/portraits/women/6.jpg",
    },
  },
  {
    body: "NuxtBase的文档和社区支持非常棒，遇到问题总能很快得到解答。这大大加快了我的开发进度。",
    author: {
      name: "孙宇",
      handle: "sunyu",
      imageUrl: "https://randomuser.me/api/portraits/men/7.jpg",
    },
  },
  {
    body: "我很喜欢NuxtBase的模块化设计，让我能够根据需求灵活组合功能。这个框架真的很贴合实际开发需求。",
    author: {
      name: "杨芳",
      handle: "yangfang",
      imageUrl: "https://randomuser.me/api/portraits/women/8.jpg",
    },
  },
  {
    body: "NuxtBase让我第一次尝试AI应用开发就获得了成功。它降低了入门门槛，真的很适合初学者。",
    author: {
      name: "周鹏",
      handle: "zhoupeng",
      imageUrl: "https://randomuser.me/api/portraits/men/9.jpg",
    },
  },
];
</script>
