<template>
  <div class="mt-18">
    <CoursesList :courseList="courseList" />
  </div>
</template>

<script setup lang="ts">
import CoursesList from '~/components/courses/courses-list.vue';
import { getCourseList } from '~/lib/api/modules/courses';
import { useAuth } from '~/composables/useAuth';

const { isLoggedIn, userInfo, getLoginUser } = useAuth();

console.log(isLoggedIn.value, "isLoggedIn");
console.log(userInfo.value, "userInfo");

const courseList = ref([]);

onMounted(async () => {
  const res = await getCourseList({ pageNo: 1, pageSize: 10 });
  // console.log(res, "res");
  // getLoginUser()
  if(res.errorCode == 0){
    console.log(res.data, "res.data");
    courseList.value = res.data.records;
  }
});
</script>