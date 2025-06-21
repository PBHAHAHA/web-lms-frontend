<template>
  <div class="container py-12">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <CoursesCard v-for="course in courses">
        <CoursesItem :course="course" />
      </CoursesCard>
    </div>
    
    <div v-if="!courses.length" class="flex flex-col items-center justify-center py-12">
      <p class="text-muted-foreground mb-4">暂无课程</p>
      <Button @click="refreshCourses">刷新</Button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import CoursesCard from './courses-card.vue';
import CoursesItem from './courses-item.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps({
  courseList: {
    type: Array,
    default: () => []
  }
})

const courses = computed(() => props.courseList);
// 模拟课程数据
// const courses = ref([
//   {
//     id: 1,
//     title: "全栈开发入门",
//     description: "学习前端和后端开发的基础知识，包括HTML、CSS、JavaScript和Node.js",
//     price: 299,
//     image: "/images/javamain.png",
//     featured: true,
//     level: "初级",
//     category: "全栈开发",
//     duration: "10小时",
//     tags: ["HTML", "CSS", "JavaScript", "Node.js"]
//   },
//   {
//     id: 2,
//     title: "Vue.js 3 实战",
//     description: "深入学习Vue 3的新特性，包括Composition API、响应式系统等",
//     price: 399,
//     image: "/images/javamain.png",
//     featured: false,
//     level: "中级",
//     category: "前端开发",
//     duration: "10小时",
//     tags: ["Vue.js", "Composition API", "响应式系统"]
//   },
//   {
//     id: 3,
//     title: "Node.js与Express框架",
//     description: "使用Node.js和Express构建高性能的Web应用和API",
//     price: 349,
//     image: "/images/javamain.png",
//     featured: false,
//     level: "高级",
//     category: "后端开发",
//     duration: "10小时",
//     tags: ["Node.js", "Express", "API"]
//   },
//   {
//     id: 3,
//     title: "Node.js与Express框架",
//     description: "使用Node.js和Express构建高性能的Web应用和API",
//     price: 349,
//     image: "/images/javamain.png",
//     featured: false,
//     level: "高级",
//     category: "后端开发",
//     duration: "10小时",
//     tags: ["Node.js", "Express", "API"]
//   },  {
//     id: 3,
//     title: "Node.js与Express框架",
//     description: "使用Node.js和Express构建高性能的Web应用和API",
//     price: 349,
//     image: "/images/javamain.png",
//     featured: false,
//     level: "高级",
//     category: "后端开发",
//     duration: "10小时",
//     tags: ["Node.js", "Express", "API"]
//   }
// ]);

const viewCourse = (courseId) => {
  router.push(`/courses/${courseId}`);
};

const refreshCourses = () => {
  // 这里可以添加刷新课程列表的逻辑
  console.log('刷新课程列表');
};
</script>

<style scoped>
.aspect-video {
  aspect-ratio: 16 / 9;
}
</style>