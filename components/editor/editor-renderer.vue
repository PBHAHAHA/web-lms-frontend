<template>
  <div class="container">
    <EditorContent :editor="editor" />
  </div>
</template>

<script setup>
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'

const props = defineProps({
  content: {
    type: String,
    required: true
  }
})

const editor = ref(null)

onMounted(() => {
  console.log(props.content)
  editor.value = new Editor({
    extensions: [StarterKit],
    content: props.content,
    editable: false
  })
})
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

  /* 代码和预格式化文本样式 */
  code {
    background-color: #f0e6ff;
    border-radius: 0.4rem;
    color: #4a2b8a;
    font-size: 0.9rem;
    padding: 0.25em 0.4em;
    /* font-family: 'JetBrainsMono', monospace; */
  }

  pre {
    background: #101f16;
    border-radius: 0.6rem;
    color: #f8f8f2;
    /* font-family: 'JetBrainsMono', monospace; */
    margin: 2rem 0;
    padding: 1rem 1.2rem;
    overflow-x: auto;

    code {
      background: none;
      color: inherit;
      font-size: 0.85rem;
      padding: 0;
    }
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