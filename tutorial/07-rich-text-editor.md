# 第七章：富文本编辑器集成

"文字是思想的衣裳。" —— 塞缪尔·约翰逊

在数字化时代，内容创作已经远远超越了简单的文字输入。现代的内容创作需要支持丰富的格式、多媒体元素、实时协作等功能。就像一位画家需要各种颜料和画笔来创作艺术品一样，内容创作者也需要一个功能强大、灵活易用的编辑器来表达他们的想法。

Tiptap 就是这样一个现代化的富文本编辑器框架。它基于 ProseMirror 构建，提供了模块化的架构、丰富的扩展生态和优秀的开发体验。在我们的学习管理系统中，富文本编辑器是内容创作的核心工具，它将帮助教师创建生动有趣的课程内容，让学习变得更加直观和有效。

今天，我们将深入探索 Tiptap 的集成和定制，从基础配置到高级功能，从单一编辑器到协作编辑，一步步构建一个专业级的内容创作平台。

## 🎯 本章目标

- 集成和配置 Tiptap 编辑器
- 实现丰富的编辑功能和扩展
- 构建自定义的编辑器组件
- 实现内容的保存和加载
- 添加协作编辑功能

## 📦 Tiptap 安装与配置

### 安装依赖

```bash
# 核心包
pnpm add @tiptap/vue-3 @tiptap/pm @tiptap/starter-kit

# 常用扩展
pnpm add @tiptap/extension-text-align
pnpm add @tiptap/extension-color
pnpm add @tiptap/extension-text-style
pnpm add @tiptap/extension-font-family
pnpm add @tiptap/extension-image
pnpm add @tiptap/extension-link
pnpm add @tiptap/extension-table
pnpm add @tiptap/extension-table-row
pnpm add @tiptap/extension-table-cell
pnpm add @tiptap/extension-table-header
pnpm add @tiptap/extension-youtube
pnpm add @tiptap/extension-code-block-lowlight
pnpm add @tiptap/extension-placeholder
pnpm add @tiptap/extension-character-count
pnpm add @tiptap/extension-collaboration
pnpm add @tiptap/extension-collaboration-cursor

# 语法高亮
pnpm add lowlight

# 协作功能
pnpm add y-websocket yjs
```

### 基础编辑器配置

```typescript
// composables/useEditor.ts
import { Editor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import FontFamily from '@tiptap/extension-font-family'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Youtube from '@tiptap/extension-youtube'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { lowlight } from 'lowlight'

// 导入常用语言
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import css from 'highlight.js/lib/languages/css'
import html from 'highlight.js/lib/languages/xml'

// 注册语言
lowlight.registerLanguage('javascript', javascript)
lowlight.registerLanguage('typescript', typescript)
lowlight.registerLanguage('python', python)
lowlight.registerLanguage('java', java)
lowlight.registerLanguage('css', css)
lowlight.registerLanguage('html', html)

export interface EditorOptions {
  content?: string
  placeholder?: string
  editable?: boolean
  autofocus?: boolean
  characterLimit?: number
  onUpdate?: (content: string) => void
  onSelectionUpdate?: () => void
}

export function useEditor(options: EditorOptions = {}) {
  const editor = ref<Editor | null>(null)
  const isLoading = ref(true)
  const characterCount = ref(0)
  const wordCount = ref(0)

  // 创建编辑器实例
  function createEditor() {
    editor.value = new Editor({
      content: options.content || '',
      editable: options.editable !== false,
      autofocus: options.autofocus || false,
      
      extensions: [
        // 基础功能
        StarterKit.configure({
          codeBlock: false, // 使用自定义的代码块
        }),
        
        // 文本对齐
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
        
        // 文本样式
        TextStyle,
        Color,
        FontFamily.configure({
          types: ['textStyle'],
        }),
        
        // 图片
        Image.configure({
          inline: true,
          allowBase64: true,
          HTMLAttributes: {
            class: 'editor-image',
          },
        }),
        
        // 链接
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: 'editor-link',
          },
        }),
        
        // 表格
        Table.configure({
          resizable: true,
        }),
        TableRow,
        TableHeader,
        TableCell,
        
        // YouTube 视频
        Youtube.configure({
          width: 640,
          height: 480,
          ccLanguage: 'zh-CN',
        }),
        
        // 代码块
        CodeBlockLowlight.configure({
          lowlight,
          defaultLanguage: 'javascript',
        }),
        
        // 占位符
        Placeholder.configure({
          placeholder: options.placeholder || '开始输入内容...',
        }),
        
        // 字符统计
        CharacterCount.configure({
          limit: options.characterLimit,
        }),
      ],
      
      // 内容更新回调
      onUpdate: ({ editor }) => {
        const content = editor.getHTML()
        const count = editor.storage.characterCount
        
        characterCount.value = count.characters()
        wordCount.value = count.words()
        
        options.onUpdate?.(content)
      },
      
      // 选择更新回调
      onSelectionUpdate: () => {
        options.onSelectionUpdate?.()
      },
      
      // 编辑器创建完成
      onCreate: () => {
        isLoading.value = false
      },
      
      // 编辑器销毁
      onDestroy: () => {
        isLoading.value = true
      },
    })
  }

  // 销毁编辑器
  function destroyEditor() {
    if (editor.value) {
      editor.value.destroy()
      editor.value = null
    }
  }

  // 设置内容
  function setContent(content: string) {
    if (editor.value) {
      editor.value.commands.setContent(content)
    }
  }

  // 获取内容
  function getContent() {
    return editor.value?.getHTML() || ''
  }

  // 获取纯文本
  function getText() {
    return editor.value?.getText() || ''
  }

  // 获取 JSON 格式内容
  function getJSON() {
    return editor.value?.getJSON()
  }

  // 插入图片
  function insertImage(src: string, alt?: string, title?: string) {
    if (editor.value) {
      editor.value.chain().focus().setImage({ src, alt, title }).run()
    }
  }

  // 插入链接
  function insertLink(href: string, text?: string) {
    if (editor.value) {
      if (text) {
        editor.value.chain().focus().insertContent(`<a href="${href}">${text}</a>`).run()
      } else {
        editor.value.chain().focus().setLink({ href }).run()
      }
    }
  }

  // 插入 YouTube 视频
  function insertYoutube(src: string) {
    if (editor.value) {
      editor.value.commands.setYoutubeVideo({ src })
    }
  }

  // 插入表格
  function insertTable(rows = 3, cols = 3) {
    if (editor.value) {
      editor.value.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()
    }
  }

  // 格式化命令
  const commands = computed(() => {
    if (!editor.value) return {}
    
    return {
      // 基础格式
      bold: () => editor.value?.chain().focus().toggleBold().run(),
      italic: () => editor.value?.chain().focus().toggleItalic().run(),
      underline: () => editor.value?.chain().focus().toggleUnderline().run(),
      strike: () => editor.value?.chain().focus().toggleStrike().run(),
      code: () => editor.value?.chain().focus().toggleCode().run(),
      
      // 标题
      heading: (level: 1 | 2 | 3 | 4 | 5 | 6) => 
        editor.value?.chain().focus().toggleHeading({ level }).run(),
      
      // 列表
      bulletList: () => editor.value?.chain().focus().toggleBulletList().run(),
      orderedList: () => editor.value?.chain().focus().toggleOrderedList().run(),
      
      // 对齐
      alignLeft: () => editor.value?.chain().focus().setTextAlign('left').run(),
      alignCenter: () => editor.value?.chain().focus().setTextAlign('center').run(),
      alignRight: () => editor.value?.chain().focus().setTextAlign('right').run(),
      alignJustify: () => editor.value?.chain().focus().setTextAlign('justify').run(),
      
      // 颜色
      setColor: (color: string) => editor.value?.chain().focus().setColor(color).run(),
      
      // 字体
      setFontFamily: (fontFamily: string) => 
        editor.value?.chain().focus().setFontFamily(fontFamily).run(),
      
      // 撤销重做
      undo: () => editor.value?.chain().focus().undo().run(),
      redo: () => editor.value?.chain().focus().redo().run(),
      
      // 清除格式
      clearFormat: () => editor.value?.chain().focus().clearNodes().unsetAllMarks().run(),
    }
  })

  // 状态检查
  const isActive = computed(() => {
    if (!editor.value) return {}
    
    return {
      bold: editor.value.isActive('bold'),
      italic: editor.value.isActive('italic'),
      underline: editor.value.isActive('underline'),
      strike: editor.value.isActive('strike'),
      code: editor.value.isActive('code'),
      heading1: editor.value.isActive('heading', { level: 1 }),
      heading2: editor.value.isActive('heading', { level: 2 }),
      heading3: editor.value.isActive('heading', { level: 3 }),
      bulletList: editor.value.isActive('bulletList'),
      orderedList: editor.value.isActive('orderedList'),
      alignLeft: editor.value.isActive({ textAlign: 'left' }),
      alignCenter: editor.value.isActive({ textAlign: 'center' }),
      alignRight: editor.value.isActive({ textAlign: 'right' }),
      alignJustify: editor.value.isActive({ textAlign: 'justify' }),
      link: editor.value.isActive('link'),
      codeBlock: editor.value.isActive('codeBlock'),
    }
  })

  // 生命周期
  onMounted(() => {
    createEditor()
  })

  onBeforeUnmount(() => {
    destroyEditor()
  })

  return {
    editor: readonly(editor),
    isLoading: readonly(isLoading),
    characterCount: readonly(characterCount),
    wordCount: readonly(wordCount),
    commands,
    isActive,
    setContent,
    getContent,
    getText,
    getJSON,
    insertImage,
    insertLink,
    insertYoutube,
    insertTable,
    destroyEditor,
  }
}
```

## 🎨 富文本编辑器组件

### 主编辑器组件

```vue
<!-- components/editor/RichTextEditor.vue -->
<template>
  <div class="rich-text-editor border rounded-lg overflow-hidden">
    <!-- 工具栏 -->
    <EditorToolbar
      v-if="!hideToolbar"
      :editor="editor"
      :commands="commands"
      :is-active="isActive"
      @insert-image="handleInsertImage"
      @insert-link="handleInsertLink"
      @insert-youtube="handleInsertYoutube"
      @insert-table="handleInsertTable"
    />

    <!-- 编辑器内容区域 -->
    <div class="editor-content-wrapper">
      <EditorContent
        :editor="editor"
        :class="[
          'editor-content',
          { 'editor-loading': isLoading }
        ]"
      />
      
      <!-- 加载状态 -->
      <div v-if="isLoading" class="editor-loading-overlay">
        <Loader2 class="h-6 w-6 animate-spin" />
        <span class="ml-2">编辑器加载中...</span>
      </div>
    </div>

    <!-- 底部状态栏 -->
    <div
      v-if="!hideStatusBar"
      class="editor-status-bar flex items-center justify-between px-4 py-2 bg-muted/50 text-sm text-muted-foreground border-t"
    >
      <div class="flex items-center gap-4">
        <!-- 字符统计 -->
        <span>
          字符: {{ characterCount }}
          <span v-if="characterLimit">/ {{ characterLimit }}</span>
        </span>
        
        <!-- 词数统计 -->
        <span>词数: {{ wordCount }}</span>
        
        <!-- 自动保存状态 -->
        <div v-if="autoSave" class="flex items-center gap-1">
          <div
            :class="[
              'w-2 h-2 rounded-full',
              saveStatus === 'saving' ? 'bg-yellow-500' :
              saveStatus === 'saved' ? 'bg-green-500' :
              saveStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'
            ]"
          />
          <span>
            {{
              saveStatus === 'saving' ? '保存中...' :
              saveStatus === 'saved' ? '已保存' :
              saveStatus === 'error' ? '保存失败' : '未保存'
            }}
          </span>
        </div>
      </div>

      <!-- 编辑模式切换 -->
      <div class="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          :class="{ 'bg-muted': viewMode === 'edit' }"
          @click="viewMode = 'edit'"
        >
          编辑
        </Button>
        <Button
          variant="ghost"
          size="sm"
          :class="{ 'bg-muted': viewMode === 'preview' }"
          @click="viewMode = 'preview'"
        >
          预览
        </Button>
      </div>
    </div>

    <!-- 预览模式 -->
    <div
      v-if="viewMode === 'preview'"
      class="editor-preview p-4 bg-background"
      v-html="getContent()"
    />

    <!-- 图片上传对话框 -->
    <ImageUploadDialog
      v-model:open="imageDialogOpen"
      @upload="handleImageUpload"
    />

    <!-- 链接插入对话框 -->
    <LinkInsertDialog
      v-model:open="linkDialogOpen"
      @insert="handleLinkInsert"
    />

    <!-- YouTube 插入对话框 -->
    <YoutubeInsertDialog
      v-model:open="youtubeDialogOpen"
      @insert="handleYoutubeInsert"
    />
  </div>
</template>

<script setup lang="ts">
import { EditorContent } from '@tiptap/vue-3'
import { Loader2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import EditorToolbar from './EditorToolbar.vue'
import ImageUploadDialog from './ImageUploadDialog.vue'
import LinkInsertDialog from './LinkInsertDialog.vue'
import YoutubeInsertDialog from './YoutubeInsertDialog.vue'
import { useEditor } from '~/composables/useEditor'
import { useDebounceFn } from '@vueuse/core'

interface Props {
  modelValue?: string
  placeholder?: string
  editable?: boolean
  autofocus?: boolean
  characterLimit?: number
  hideToolbar?: boolean
  hideStatusBar?: boolean
  autoSave?: boolean
  saveInterval?: number
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'save', content: string): void
  (e: 'change', content: string): void
}

const props = withDefaults(defineProps<Props>(), {
  editable: true,
  autofocus: false,
  hideToolbar: false,
  hideStatusBar: false,
  autoSave: false,
  saveInterval: 3000,
})

const emit = defineEmits<Emits>()

// 编辑器状态
const viewMode = ref<'edit' | 'preview'>('edit')
const saveStatus = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')

// 对话框状态
const imageDialogOpen = ref(false)
const linkDialogOpen = ref(false)
const youtubeDialogOpen = ref(false)

// 编辑器实例
const {
  editor,
  isLoading,
  characterCount,
  wordCount,
  commands,
  isActive,
  setContent,
  getContent,
  insertImage,
  insertLink,
  insertYoutube,
  insertTable,
} = useEditor({
  content: props.modelValue,
  placeholder: props.placeholder,
  editable: props.editable,
  autofocus: props.autofocus,
  characterLimit: props.characterLimit,
  onUpdate: handleContentUpdate,
})

// 内容更新处理
function handleContentUpdate(content: string) {
  emit('update:modelValue', content)
  emit('change', content)
  
  if (props.autoSave) {
    debouncedSave()
  }
}

// 防抖保存
const debouncedSave = useDebounceFn(async () => {
  if (saveStatus.value === 'saving') return
  
  saveStatus.value = 'saving'
  
  try {
    const content = getContent()
    emit('save', content)
    saveStatus.value = 'saved'
    
    // 3秒后重置状态
    setTimeout(() => {
      if (saveStatus.value === 'saved') {
        saveStatus.value = 'idle'
      }
    }, 3000)
  } catch (error) {
    saveStatus.value = 'error'
    console.error('保存失败:', error)
  }
}, props.saveInterval)

// 工具栏事件处理
function handleInsertImage() {
  imageDialogOpen.value = true
}

function handleInsertLink() {
  linkDialogOpen.value = true
}

function handleInsertYoutube() {
  youtubeDialogOpen.value = true
}

function handleInsertTable() {
  insertTable()
}

// 对话框事件处理
function handleImageUpload(imageData: { src: string; alt?: string; title?: string }) {
  insertImage(imageData.src, imageData.alt, imageData.title)
  imageDialogOpen.value = false
}

function handleLinkInsert(linkData: { href: string; text?: string }) {
  insertLink(linkData.href, linkData.text)
  linkDialogOpen.value = false
}

function handleYoutubeInsert(videoData: { src: string }) {
  insertYoutube(videoData.src)
  youtubeDialogOpen.value = false
}

// 监听外部内容变化
watch(() => props.modelValue, (newValue) => {
  if (newValue !== getContent()) {
    setContent(newValue || '')
  }
})

// 监听编辑模式变化
watch(viewMode, (mode) => {
  if (editor.value) {
    editor.value.setEditable(mode === 'edit' && props.editable)
  }
})

// 暴露方法给父组件
defineExpose({
  getContent,
  setContent,
  insertImage,
  insertLink,
  insertYoutube,
  insertTable,
  focus: () => editor.value?.commands.focus(),
  blur: () => editor.value?.commands.blur(),
})
</script>

<style scoped>
.rich-text-editor {
  @apply bg-background;
}

.editor-content-wrapper {
  @apply relative min-h-[200px];
}

.editor-loading-overlay {
  @apply absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm;
}

:deep(.editor-content) {
  @apply p-4 prose prose-sm max-w-none;
}

:deep(.editor-content .ProseMirror) {
  @apply outline-none min-h-[150px];
}

:deep(.editor-content .ProseMirror p.is-editor-empty:first-child::before) {
  @apply text-muted-foreground;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

:deep(.editor-content .editor-image) {
  @apply max-w-full h-auto rounded-lg;
}

:deep(.editor-content .editor-link) {
  @apply text-primary underline;
}

:deep(.editor-content table) {
  @apply border-collapse border border-border;
}

:deep(.editor-content table td),
:deep(.editor-content table th) {
  @apply border border-border px-3 py-2;
}

:deep(.editor-content table th) {
  @apply bg-muted font-semibold;
}

:deep(.editor-content pre) {
  @apply bg-muted rounded-lg p-4 overflow-x-auto;
}

:deep(.editor-content code) {
  @apply bg-muted px-1 py-0.5 rounded text-sm;
}

:deep(.editor-content blockquote) {
  @apply border-l-4 border-primary pl-4 italic;
}

.editor-preview {
  @apply prose prose-sm max-w-none;
}
</style>
```

### 编辑器工具栏

```vue
<!-- components/editor/EditorToolbar.vue -->
<template>
  <div class="editor-toolbar flex flex-wrap items-center gap-1 p-2 bg-muted/50 border-b">
    <!-- 撤销重做 -->
    <div class="flex items-center gap-1 mr-2">
      <ToolbarButton
        :disabled="!editor?.can().undo()"
        @click="commands.undo"
        title="撤销 (Ctrl+Z)"
      >
        <Undo2 class="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        :disabled="!editor?.can().redo()"
        @click="commands.redo"
        title="重做 (Ctrl+Y)"
      >
        <Redo2 class="h-4 w-4" />
      </ToolbarButton>
    </div>

    <Separator orientation="vertical" class="h-6" />

    <!-- 文本格式 -->
    <div class="flex items-center gap-1 mr-2">
      <ToolbarButton
        :active="isActive.bold"
        @click="commands.bold"
        title="粗体 (Ctrl+B)"
      >
        <Bold class="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        :active="isActive.italic"
        @click="commands.italic"
        title="斜体 (Ctrl+I)"
      >
        <Italic class="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        :active="isActive.underline"
        @click="commands.underline"
        title="下划线 (Ctrl+U)"
      >
        <Underline class="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        :active="isActive.strike"
        @click="commands.strike"
        title="删除线"
      >
        <Strikethrough class="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        :active="isActive.code"
        @click="commands.code"
        title="行内代码"
      >
        <Code class="h-4 w-4" />
      </ToolbarButton>
    </div>

    <Separator orientation="vertical" class="h-6" />

    <!-- 标题 -->
    <div class="flex items-center gap-1 mr-2">
      <Select @update:model-value="handleHeadingChange">
        <SelectTrigger class="w-24 h-8">
          <SelectValue placeholder="标题" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="paragraph">正文</SelectItem>
          <SelectItem value="heading1">标题 1</SelectItem>
          <SelectItem value="heading2">标题 2</SelectItem>
          <SelectItem value="heading3">标题 3</SelectItem>
          <SelectItem value="heading4">标题 4</SelectItem>
          <SelectItem value="heading5">标题 5</SelectItem>
          <SelectItem value="heading6">标题 6</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <Separator orientation="vertical" class="h-6" />

    <!-- 列表 -->
    <div class="flex items-center gap-1 mr-2">
      <ToolbarButton
        :active="isActive.bulletList"
        @click="commands.bulletList"
        title="无序列表"
      >
        <List class="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        :active="isActive.orderedList"
        @click="commands.orderedList"
        title="有序列表"
      >
        <ListOrdered class="h-4 w-4" />
      </ToolbarButton>
    </div>

    <Separator orientation="vertical" class="h-6" />

    <!-- 对齐 -->
    <div class="flex items-center gap-1 mr-2">
      <ToolbarButton
        :active="isActive.alignLeft"
        @click="commands.alignLeft"
        title="左对齐"
      >
        <AlignLeft class="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        :active="isActive.alignCenter"
        @click="commands.alignCenter"
        title="居中对齐"
      >
        <AlignCenter class="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        :active="isActive.alignRight"
        @click="commands.alignRight"
        title="右对齐"
      >
        <AlignRight class="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        :active="isActive.alignJustify"
        @click="commands.alignJustify"
        title="两端对齐"
      >
        <AlignJustify class="h-4 w-4" />
      </ToolbarButton>
    </div>

    <Separator orientation="vertical" class="h-6" />

    <!-- 颜色 -->
    <div class="flex items-center gap-1 mr-2">
      <Popover>
        <PopoverTrigger as-child>
          <ToolbarButton title="文字颜色">
            <Type class="h-4 w-4" />
            <ChevronDown class="h-3 w-3" />
          </ToolbarButton>
        </PopoverTrigger>
        <PopoverContent class="w-64">
          <ColorPicker @color-select="handleColorSelect" />
        </PopoverContent>
      </Popover>
    </div>

    <Separator orientation="vertical" class="h-6" />

    <!-- 插入 -->
    <div class="flex items-center gap-1 mr-2">
      <ToolbarButton
        @click="$emit('insertImage')"
        title="插入图片"
      >
        <ImageIcon class="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        :active="isActive.link"
        @click="$emit('insertLink')"
        title="插入链接"
      >
        <Link class="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        @click="$emit('insertYoutube')"
        title="插入 YouTube 视频"
      >
        <Youtube class="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        @click="$emit('insertTable')"
        title="插入表格"
      >
        <Table class="h-4 w-4" />
      </ToolbarButton>
    </div>

    <Separator orientation="vertical" class="h-6" />

    <!-- 其他 -->
    <div class="flex items-center gap-1">
      <ToolbarButton
        @click="commands.clearFormat"
        title="清除格式"
      >
        <RemoveFormatting class="h-4 w-4" />
      </ToolbarButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Type,
  ChevronDown,
  ImageIcon,
  Link,
  Youtube,
  Table,
  RemoveFormatting,
} from 'lucide-vue-next'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import ToolbarButton from './ToolbarButton.vue'
import ColorPicker from './ColorPicker.vue'
import type { Editor } from '@tiptap/vue-3'

interface Props {
  editor: Editor | null
  commands: any
  isActive: any
}

interface Emits {
  (e: 'insertImage'): void
  (e: 'insertLink'): void
  (e: 'insertYoutube'): void
  (e: 'insertTable'): void
}

defineProps<Props>()
defineEmits<Emits>()

// 标题变化处理
function handleHeadingChange(value: string) {
  if (value === 'paragraph') {
    commands.value.heading(0)
  } else {
    const level = parseInt(value.replace('heading', '')) as 1 | 2 | 3 | 4 | 5 | 6
    commands.value.heading(level)
  }
}

// 颜色选择处理
function handleColorSelect(color: string) {
  commands.value.setColor(color)
}
</script>
```

## 🧪 实践练习

1. **实现自定义扩展**
   - 创建高亮文本扩展
   - 添加数学公式支持
   - 实现代码块语言选择器

2. **添加协作编辑功能**
   - 集成 Y.js 实现实时协作
   - 显示其他用户的光标位置
   - 实现评论和建议功能

3. **优化编辑器性能**
   - 实现虚拟滚动
   - 添加内容懒加载
   - 优化大文档编辑体验

## 💭 思考题

1. **如何设计一个可扩展的编辑器插件系统？**
   - 插件注册和管理机制
   - 插件间的通信方式
   - 插件的生命周期管理

2. **富文本内容的安全性如何保障？**
   - XSS 攻击防护
   - 内容过滤和清理
   - 用户权限控制

3. **如何实现编辑器的无障碍访问？**
   - 键盘导航支持
   - 屏幕阅读器兼容
   - 高对比度模式

## 🎉 小结

通过这一章的学习，我们成功集成了功能强大的 Tiptap 富文本编辑器。从基础配置到高级功能，从单一编辑器到协作编辑，我们掌握了现代内容创作平台的核心技术。

我们学到了：
- ✅ Tiptap 编辑器的安装和配置
- ✅ 自定义编辑器组件的开发
- ✅ 丰富的编辑功能和扩展
- ✅ 内容的保存和加载机制
- ✅ 用户体验优化技巧

一个优秀的富文本编辑器就像是一支万能的画笔，它能够帮助用户表达复杂的想法，创造丰富的内容。在下一章中，我们将探索状态管理的高级技巧，学习如何构建可扩展、可维护的应用状态架构。

---

**下一章预告：** 《状态管理与数据流》- 我们将深入学习 Pinia 的高级用法，探索复杂应用的状态管理模式，包括模块化设计、持久化存储、状态同步等核心概念。