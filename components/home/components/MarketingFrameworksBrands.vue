<template>
  <div class="mt-20">
    <div class="flex justify-center w-full">
      <div class="flex gap-10 relative max-w-3xl">
        <div
          v-for="brand in brandList"
          :key="brand.name"
          class="flex flex-col items-center justify-center rounded-lg mb-4 cursor-pointer group"
          @click="onClick(brand.src)"
        >
          <img
            :class="[
              'w-10 group-hover:scale-110 transition-transform',
              { 'grayscale contrast-50': gray },
              { 'group-hover:grayscale-0 group-hover:contrast-100': gray },
            ]"
            :src="brand.imageSrc"
          />
          <div
            :class="[
              'mt-4 text-xs',
              { 'text-gray-400 group-hover:text-gray-800': gray },
              { 'text-gray-800': !gray },
            ]"
          >
            {{ brand.name }}
          </div>
        </div>
      </div>
    </div>
    <div class="mx-auto max-w-2xl text-center">
      <p class="mt-4 text-xs leading-8 text-gray-400 px-6">
        <!-- 兼容国内所有兼容OpenAI接口的大模型厂商，1分钟接入AI能力! -->
         <!-- 使用DeekSeek最新大模型，快速高效的完成您的小说创作 -->
      </p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  gray: {
    type: Boolean,
    default: false,
  },
});

const brandList = [
  // {
  //   imageSrc: "https://static-main.aiyeshi.cn/images/Tongyi-Qianwen.png",
  //   name: "通义千问",
  //   src: "https://tongyi.aliyun.com/?userCode=okjhlpr5",
  // },
  // {
  //   imageSrc: "https://static-main.aiyeshi.cn/images/zhipuqinyan.png",
  //   name: "智谱清言",
  //   src: "https://open.bigmodel.cn/",
  // },
  // {
  //   imageSrc: "https://static-main.aiyeshi.cn/images/kimi-icon.png",
  //   name: "Kimi",
  //   src: "https://moonshot.cn",
  // },
  {
    imageSrc: "/images/Nuxt.png",
    name: "Nuxt",
    src: "https://nuxt.com/",
  },
  {
    imageSrc: "/images/java.png",
    name: "Java",
    src: "https://www.java.com/",
  },
  {
    imageSrc: "/images/nodejs.png",
    name: "Node.js",
    src: "https://nodejs.org/",
  },
  {
    imageSrc: "/images/Vue.png",
    name: "Vue",
    src: "https://vuejs.org/",
  },
  
  
  // {
  //   imageSrc: "https://static-main.aiyeshi.cn/images/tengxunhunyuan.png",
  //   name: "腾讯混元",
  //   src: "https://hunyuan.tencent.com/",
  // },
  // {
  //   imageSrc: "https://static-main.aiyeshi.cn/images/wenxiyiyan.png",
  //   name: "文心一言",
  //   src: "https://cloud.baidu.com/wenxin.html",
  // },
];

function onClick(src) {
  window.open(src, "_blank");
}
</script>
