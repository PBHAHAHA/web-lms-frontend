import { useApi } from '../index'

export const getCourseList = (params: any) => {
  return useApi().post("/course/coursePage", params);
};

// 获取课程章节
export const getCourseChapters = (params: any) => {
  return useApi().get("/course/courseChapters", params);
};

// 获取章节内容
export const getChapterContent = (params: any) => {
  return useApi().get("/course/getChapterContent", params);
};