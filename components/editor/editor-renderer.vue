<template>
  <ClientOnly>
    <div class="container">
      <EditorContent :editor="editor" />
    </div>
  </ClientOnly>
</template>

<script setup>
import { Editor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { lowlight } from 'lowlight';

// 导入常用语言
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import css from 'highlight.js/lib/languages/css';
import html from 'highlight.js/lib/languages/xml';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import sql from 'highlight.js/lib/languages/sql';
import php from 'highlight.js/lib/languages/php';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';

// 注册语言 - 使用新的 API
lowlight.registerLanguage('javascript', javascript);
lowlight.registerLanguage('typescript', typescript);
lowlight.registerLanguage('python', python);
lowlight.registerLanguage('java', java);
lowlight.registerLanguage('css', css);
lowlight.registerLanguage('html', html);
lowlight.registerLanguage('xml', html);
lowlight.registerLanguage('json', json);
lowlight.registerLanguage('bash', bash);
lowlight.registerLanguage('shell', bash);
lowlight.registerLanguage('sql', sql);
lowlight.registerLanguage('php', php);
lowlight.registerLanguage('cpp', cpp);
lowlight.registerLanguage('c++', cpp);
lowlight.registerLanguage('csharp', csharp);
lowlight.registerLanguage('c#', csharp);

const props = defineProps({
  content: {
    type: [String, Object],
    required: true,
  },
});

const editor = ref(null);

// 解析内容为JSON格式
const parseContent = (content) => {
  if (!content) return null;
  
  // 如果已经是对象，直接返回
  if (typeof content === 'object') {
    return content;
  }
  
  // 如果是字符串，尝试解析为JSON
  try {
    console.log(content, "contenxxxxxxxt");
    return JSON.parse(content);
  } catch (error) {
    console.error('解析JSON内容失败:', error);
    // 如果解析失败，当作HTML处理
    return content;
  }
};

// 监听内容变化
watch(() => props.content, (newContent) => {
  if (editor.value && newContent) {
    const parsedContent = parseContent(newContent);
    console.log('设置新内容:', parsedContent);
    
    if (typeof parsedContent === 'object') {
      // JSON格式内容
      editor.value.commands.setContent(parsedContent, false);
    } else {
      // HTML字符串内容
      editor.value.commands.setContent(parsedContent, false);
    }
  }
});

onMounted(() => {
  const initialContent = parseContent(props.content);
  console.log('初始化编辑器内容:', initialContent);
  
  editor.value = new Editor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // 禁用默认的代码块
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'javascript',
      }),
    ],
    content: initialContent || null,
    editable: false,
  });
});

// 清理编辑器实例
onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy();
  }
});
</script>

<style>
/* 基础编辑器样式 */
.tiptap {
  :first-child {
    margin-top: 0;
  }

  /* 列表样式 */
  ul,
  ol {
    padding: 0 1.2rem;
    margin: 1.5rem 1rem 1.5rem 0.5rem;

    li p {
      margin-top: 0.3em;
      margin-bottom: 0.3em;
    }
  }

  /* 标题样式 */
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    line-height: 1.2;
    margin-top: 2.8rem;
    text-wrap: pretty;
    font-weight: 600;
  }

  h1,
  h2 {
    margin-top: 4rem;
    margin-bottom: 1.8rem;
  }

  h1 {
    font-size: 1.8rem;
    color: var(--primary);
  }

  h2 {
    font-size: 1.5rem;
    color: var(--primary-dark);
  }

  h3 {
    font-size: 1.3rem;
    margin-bottom: 1rem;
  }

  h4,
  h5,
  h6 {
    font-size: 1.1rem;
    margin-bottom: 0.8rem;
  }

  p {
    margin-bottom: 1.2rem;
    line-height: 1.6;
  }

  /* 内联代码样式 */
  code {
    background-color: #f0e6ff;
    border-radius: 0.4rem;
    color: #4a2b8a;
    font-size: 0.9rem;
    padding: 0.25em 0.4em;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  }

  /* 代码块样式 */
  pre {
    background: #0d1117;
    border-radius: 0.6rem;
    color: #f8f8f2;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    margin: 2rem 0;
    padding: 1rem 1.2rem;
    overflow-x: auto;
    position: relative;
    border: 1px solid #30363d;

    code {
      background: none;
      color: #e6edf3;
      font-size: 0.85rem;
      padding: 0;
      border-radius: 0;
    }

    /* 语言标签 */
    &[data-language]::before {
      content: attr(data-language);
      position: absolute;
      top: 0.5rem;
      right: 0.8rem;
      background: rgba(255, 255, 255, 0.1);
      color: #8b949e;
      padding: 0.2rem 0.5rem;
      border-radius: 0.3rem;
      font-size: 0.75rem;
      text-transform: uppercase;
      font-weight: 500;
    }
  }

  /* 代码高亮样式 - GitHub Dark 主题 */
  .hljs {
    background: transparent !important;
    color: #e6edf3 !important;
    padding: 0 !important;
  }

  /* 关键字 */
  .hljs-keyword,
  .hljs-selector-tag,
  .hljs-literal,
  .hljs-section {
    color: #ff7b72;
    font-weight: bold;
  }

  /* 函数关键字 */
  .hljs-function .hljs-keyword {
    color: #d2a8ff;
  }

  /* 字符串 */
  .hljs-string,
  .hljs-attr {
    color: #a5d6ff;
  }

  /* 数字 */
  .hljs-number,
  .hljs-literal {
    color: #79c0ff;
  }

  /* 注释 */
  .hljs-comment,
  .hljs-quote {
    color: #8b949e;
    font-style: italic;
  }

  /* 变量名 */
  .hljs-variable,
  .hljs-template-variable {
    color: #ffa657;
  }

  /* 类型 */
  .hljs-type,
  .hljs-class .hljs-title {
    color: #ffa657;
  }

  /* 函数名 */
  .hljs-function .hljs-title,
  .hljs-title.function_ {
    color: #d2a8ff;
  }

  /* 属性 */
  .hljs-property,
  .hljs-attribute {
    color: #79c0ff;
  }

  /* 标签 */
  .hljs-tag {
    color: #7ee787;
  }

  /* 标签名 */
  .hljs-name {
    color: #7ee787;
  }

  /* 正则表达式 */
  .hljs-regexp {
    color: #7ee787;
  }

  /* 链接 */
  .hljs-link {
    color: #a5d6ff;
    text-decoration: underline;
  }

  /* 符号 */
  .hljs-symbol,
  .hljs-bullet {
    color: #79c0ff;
  }

  /* 内置函数 */
  .hljs-built_in,
  .hljs-builtin-name {
    color: #ffa657;
  }

  /* 元数据 */
  .hljs-meta {
    color: #8b949e;
  }

  /* 删除 */
  .hljs-deletion {
    background-color: #490202;
    color: #ffdcd7;
  }

  /* 添加 */
  .hljs-addition {
    background-color: #0f5132;
    color: #aff5b4;
  }

  /* 强调 */
  .hljs-emphasis {
    font-style: italic;
  }

  /* 加粗 */
  .hljs-strong {
    font-weight: bold;
  }

  blockquote {
    border-left: 4px solid #8a63d2;
    margin: 2rem 0;
    padding: 0.8rem 1.2rem;
    background-color: #f9f5ff;
    border-radius: 0 0.4rem 0.4rem 0;
    font-style: italic;
  }

  hr {
    border: none;
    border-top: 2px solid #e6e6e6;
    margin: 2.5rem 0;
  }

  a {
    color: #6d28d9;
    text-decoration: underline;
    text-underline-offset: 2px;

    &:hover {
      color: #5b21b6;
    }
  }

  strong {
    font-weight: 600;
    color: #4c1d95;
  }

  em {
    font-style: italic;
  }
}
</style>
