<template>
  <div class="mt-20 max-w-3xl mx-auto p-6">
    <div v-if="tab === 'ai'">
      <ul>
        <li v-for="item in aiTemplates" :key="item.version" class="mb-6">
          <div class="flex items-center gap-2 mb-1">
            <span class="font-semibold text-base">{{ item.version }}</span>
            <span v-if="item.date" class="text-xs text-gray-400">{{ item.date }}</span>
          </div>
          <div class="text-sm text-gray-500 whitespace-pre-line" v-html="item.desc"></div>
        </li>
      </ul>
    </div>
    <div v-else>
      <div class="text-center text-gray-400 py-12">暂无AI-Dify模板</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
definePageMeta({
  layout: "default",
  static: true,
});

useHead({
  title: "版本说明",
});
const tab = ref('ai');

const aiTemplates = [
  {
    version: '第一阶段：基础课程体系建设',
    date: '2025-01-15 - 2025-03-15',
    desc: '• 完成前端基础课程录制（HTML、CSS、JavaScript）\n• 建立课程管理系统\n• 用户注册登录功能开发\n• 课程播放器功能实现'
  },
  {
    version: '第二阶段：进阶课程开发',
    date: '2025-03-16 - 2025-05-15',
    desc: '• Vue.js 3 实战课程制作\n• React 基础到进阶课程\n• Node.js 后端开发课程\n• 数据库设计与操作课程'
  },
  {
    version: '第三阶段：全栈项目实战',
    date: '2025-05-16 - 2025-07-15',
    desc: '• 全栈电商项目实战课程\n• 微信小程序开发课程\n• 移动端开发课程\n• 项目部署与运维课程'
  },
  {
    version: '第四阶段：高级技术专题',
    date: '2025-07-16 - 2025-09-15',
    desc: '• 微服务架构设计课程\n• 云原生技术栈课程\n• 性能优化专题课程\n• 安全防护与测试课程'
  },
  {
    version: '第五阶段：AI与新技术',
    date: '2025-09-16 - 2025-11-15',
    desc: '• AI 辅助开发工具使用\n• 机器学习基础课程\n• 区块链技术入门\n• 新兴技术趋势分析'
  },
  {
    version: '第六阶段：职业发展与认证',
    date: '2025-11-16 - 2025-12-31',
    desc: '• 技术面试指导课程\n• 职业规划与发展建议\n• 行业认证考试准备\n• 毕业项目展示与评估'
  }
];
</script>
