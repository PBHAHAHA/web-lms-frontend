# 第十章：性能优化与部署

"过早的优化是万恶之源，但适时的优化是成功之母。" —— 唐纳德·克努特（改编）

在软件开发的世界里，性能优化就像是一门艺术。它不仅仅是让代码跑得更快，更是在用户体验、开发效率和维护成本之间找到完美的平衡点。一个性能优异的应用能够在毫秒间响应用户的每一次交互，让用户感受到丝般顺滑的体验。

想象一下，当用户点击一个按钮时，页面瞬间响应；当他们滚动列表时，内容流畅地加载；当他们切换页面时，转场动画优雅而自然。这些看似简单的交互背后，隐藏着无数的技术细节和优化策略。

现代前端应用面临着前所未有的复杂性：单页应用的体积越来越大，用户对性能的期望越来越高，设备和网络环境千差万别。如何在这样的环境下构建出既功能丰富又性能卓越的应用，是每个前端开发者都必须面对的挑战。

Nuxt.js 作为一个成熟的全栈框架，为我们提供了丰富的性能优化工具：从自动代码分割到智能预加载，从服务端渲染到静态生成，从图片优化到缓存策略。掌握这些工具，就像是掌握了一把把锋利的剑，能够帮助我们在性能优化的战场上所向披靡。

今天，我们将踏上性能优化的最后一段旅程，从微观的代码优化到宏观的架构设计，从开发环境的调试到生产环境的部署，全面掌握构建高性能 Web 应用的核心技能。

## 🎯 本章目标

- 掌握前端性能优化的核心原理和最佳实践
- 实现代码分割、懒加载和预加载策略
- 优化图片、字体和静态资源的加载
- 配置高效的缓存策略和 CDN 部署
- 实现生产环境的监控和性能分析

## ⚡ 代码分割与懒加载

### 路由级代码分割

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // 启用实验性功能
  experimental: {
    payloadExtraction: false, // 禁用 payload 提取以减少包大小
  },

  // Vite 配置
  vite: {
    build: {
      // 代码分割配置
      rollupOptions: {
        output: {
          // 手动分包
          manualChunks: {
            // 将 Vue 相关库打包到一起
            vue: ['vue', '@vue/runtime-core', '@vue/runtime-dom'],
            // 将 UI 库单独打包
            ui: ['@headlessui/vue', '@heroicons/vue'],
            // 将工具库单独打包
            utils: ['lodash-es', 'date-fns', 'validator'],
            // 将编辑器相关库单独打包
            editor: ['@tiptap/core', '@tiptap/starter-kit', '@tiptap/extension-image'],
          },
          // 动态导入的文件命名
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId
            if (facadeModuleId) {
              // 页面组件
              if (facadeModuleId.includes('/pages/')) {
                return 'pages/[name]-[hash].js'
              }
              // 布局组件
              if (facadeModuleId.includes('/layouts/')) {
                return 'layouts/[name]-[hash].js'
              }
              // 组件
              if (facadeModuleId.includes('/components/')) {
                return 'components/[name]-[hash].js'
              }
            }
            return 'chunks/[name]-[hash].js'
          },
        },
      },
      // 压缩配置
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // 移除 console
          drop_debugger: true, // 移除 debugger
          pure_funcs: ['console.log'], // 移除特定函数调用
        },
        mangle: {
          safari10: true, // 兼容 Safari 10
        },
      },
    },
  },

  // 路由配置
  router: {
    options: {
      // 启用路由预加载
      linkActiveClass: 'router-link-active',
      linkExactActiveClass: 'router-link-exact-active',
    },
  },

  // 渲染配置
  ssr: true, // 启用 SSR
  
  // 预渲染配置
  nitro: {
    prerender: {
      // 预渲染路由
      routes: ['/sitemap.xml', '/robots.txt'],
      // 爬取链接
      crawlLinks: true,
    },
    // 压缩配置
    compressPublicAssets: true,
  },
})
```

### 组件级懒加载

```vue
<!-- components/LazyWrapper.vue -->
<template>
  <div ref="container" class="lazy-wrapper">
    <div v-if="!isVisible && showPlaceholder" class="placeholder">
      <slot name="placeholder">
        <div class="animate-pulse bg-gray-200 rounded h-32"></div>
      </slot>
    </div>
    
    <Suspense v-else-if="isVisible">
      <template #default>
        <component :is="lazyComponent" v-bind="$attrs" />
      </template>
      
      <template #fallback>
        <div class="loading-fallback">
          <slot name="loading">
            <div class="flex items-center justify-center h-32">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </slot>
        </div>
      </template>
    </Suspense>
  </div>
</template>

<script setup lang="ts">
interface Props {
  component: string | (() => Promise<any>)
  showPlaceholder?: boolean
  rootMargin?: string
  threshold?: number
}

const props = withDefaults(defineProps<Props>(), {
  showPlaceholder: true,
  rootMargin: '50px',
  threshold: 0.1,
})

const container = ref<HTMLElement>()
const isVisible = ref(false)

// 懒加载组件
const lazyComponent = computed(() => {
  if (typeof props.component === 'string') {
    return defineAsyncComponent(() => import(`~/components/${props.component}.vue`))
  }
  return defineAsyncComponent(props.component)
})

// Intersection Observer
const { stop } = useIntersectionObserver(
  container,
  ([{ isIntersecting }]) => {
    if (isIntersecting) {
      isVisible.value = true
      stop() // 停止观察
    }
  },
  {
    rootMargin: props.rootMargin,
    threshold: props.threshold,
  }
)

onUnmounted(() => {
  stop()
})
</script>
```

### 智能预加载策略

```typescript
// composables/usePreloader.ts
interface PreloadOptions {
  priority?: 'high' | 'low'
  crossOrigin?: 'anonymous' | 'use-credentials'
  as?: 'script' | 'style' | 'image' | 'font' | 'fetch'
  type?: string
}

interface PreloadItem {
  href: string
  options: PreloadOptions
  loaded: boolean
  loading: boolean
}

export class ResourcePreloader {
  private preloadedResources = new Map<string, PreloadItem>()
  private observer: IntersectionObserver | null = null

  constructor() {
    this.initIntersectionObserver()
  }

  // 初始化 Intersection Observer
  private initIntersectionObserver() {
    if (process.client) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const href = entry.target.getAttribute('data-preload-href')
              if (href) {
                this.preloadResource(href)
                this.observer?.unobserve(entry.target)
              }
            }
          })
        },
        {
          rootMargin: '100px',
          threshold: 0.1,
        }
      )
    }
  }

  // 预加载资源
  preloadResource(href: string, options: PreloadOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      // 检查是否已经预加载
      const existing = this.preloadedResources.get(href)
      if (existing?.loaded) {
        resolve()
        return
      }

      if (existing?.loading) {
        // 如果正在加载，等待完成
        const checkLoaded = () => {
          const item = this.preloadedResources.get(href)
          if (item?.loaded) {
            resolve()
          } else {
            setTimeout(checkLoaded, 10)
          }
        }
        checkLoaded()
        return
      }

      // 标记为正在加载
      this.preloadedResources.set(href, {
        href,
        options,
        loaded: false,
        loading: true,
      })

      // 创建预加载链接
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = href
      
      if (options.as) link.as = options.as
      if (options.type) link.type = options.type
      if (options.crossOrigin) link.crossOrigin = options.crossOrigin

      link.onload = () => {
        this.preloadedResources.set(href, {
          href,
          options,
          loaded: true,
          loading: false,
        })
        resolve()
      }

      link.onerror = () => {
        this.preloadedResources.delete(href)
        reject(new Error(`Failed to preload ${href}`))
      }

      document.head.appendChild(link)
    })
  }

  // 预加载图片
  preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = () => reject(new Error(`Failed to preload image ${src}`))
      img.src = src
    })
  }

  // 预加载字体
  preloadFont(href: string, format = 'woff2'): Promise<void> {
    return this.preloadResource(href, {
      as: 'font',
      type: `font/${format}`,
      crossOrigin: 'anonymous',
    })
  }

  // 预加载 JavaScript 模块
  preloadModule(href: string): Promise<void> {
    return this.preloadResource(href, {
      as: 'script',
      crossOrigin: 'anonymous',
    })
  }

  // 观察元素进行预加载
  observeElement(element: HTMLElement, href: string) {
    if (this.observer) {
      element.setAttribute('data-preload-href', href)
      this.observer.observe(element)
    }
  }

  // 批量预加载
  async preloadBatch(resources: Array<{ href: string; options?: PreloadOptions }>) {
    const promises = resources.map(({ href, options }) => 
      this.preloadResource(href, options).catch(() => {
        // 忽略单个资源的加载失败
        console.warn(`Failed to preload ${href}`)
      })
    )
    
    await Promise.allSettled(promises)
  }

  // 清理资源
  cleanup() {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
    this.preloadedResources.clear()
  }
}

// 创建全局预加载器实例
export const resourcePreloader = new ResourcePreloader()

// 预加载 composable
export function usePreloader() {
  const preloadRoute = async (to: string) => {
    try {
      // 预加载路由组件
      const route = useRouter().resolve(to)
      if (route.matched.length > 0) {
        const component = route.matched[0].components?.default
        if (component && typeof component === 'function') {
          await component()
        }
      }
    } catch (error) {
      console.warn(`Failed to preload route ${to}:`, error)
    }
  }

  const preloadImages = async (images: string[]) => {
    const promises = images.map(src => resourcePreloader.preloadImage(src))
    await Promise.allSettled(promises)
  }

  const preloadCriticalResources = async () => {
    // 预加载关键字体
    await resourcePreloader.preloadFont('/fonts/inter-var.woff2')
    
    // 预加载关键图片
    await preloadImages([
      '/images/hero-bg.webp',
      '/images/logo.svg',
    ])
    
    // 预加载关键路由
    await preloadRoute('/courses')
    await preloadRoute('/dashboard')
  }

  return {
    preloadRoute,
    preloadImages,
    preloadCriticalResources,
    preloader: resourcePreloader,
  }
}
```

## 🖼️ 资源优化

### 图片优化

```typescript
// composables/useImageOptimization.ts
interface ImageOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'avif' | 'jpeg' | 'png'
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
  position?: string
  blur?: number
  sharpen?: boolean
  grayscale?: boolean
}

interface ResponsiveImageOptions extends ImageOptions {
  sizes: Array<{
    width: number
    media?: string
  }>
  fallback?: string
}

export function useImageOptimization() {
  // 生成优化后的图片 URL
  const getOptimizedImageUrl = (src: string, options: ImageOptions = {}) => {
    const {
      width,
      height,
      quality = 80,
      format = 'webp',
      fit = 'cover',
      position,
      blur,
      sharpen,
      grayscale,
    } = options

    const params = new URLSearchParams()
    
    if (width) params.set('w', width.toString())
    if (height) params.set('h', height.toString())
    if (quality !== 80) params.set('q', quality.toString())
    if (format !== 'webp') params.set('f', format)
    if (fit !== 'cover') params.set('fit', fit)
    if (position) params.set('pos', position)
    if (blur) params.set('blur', blur.toString())
    if (sharpen) params.set('sharpen', 'true')
    if (grayscale) params.set('grayscale', 'true')

    const queryString = params.toString()
    return queryString ? `${src}?${queryString}` : src
  }

  // 生成响应式图片源集
  const generateSrcSet = (src: string, options: ResponsiveImageOptions) => {
    const { sizes, ...baseOptions } = options
    
    return sizes
      .map(({ width }) => {
        const url = getOptimizedImageUrl(src, { ...baseOptions, width })
        return `${url} ${width}w`
      })
      .join(', ')
  }

  // 生成 sizes 属性
  const generateSizes = (options: ResponsiveImageOptions) => {
    return options.sizes
      .map(({ width, media }) => {
        if (media) {
          return `${media} ${width}px`
        }
        return `${width}px`
      })
      .join(', ')
  }

  // 检测 WebP 支持
  const supportsWebP = ref(false)
  const supportsAVIF = ref(false)

  const detectImageFormats = async () => {
    if (process.client) {
      // 检测 WebP 支持
      const webpCanvas = document.createElement('canvas')
      webpCanvas.width = 1
      webpCanvas.height = 1
      supportsWebP.value = webpCanvas.toDataURL('image/webp').indexOf('data:image/webp') === 0

      // 检测 AVIF 支持
      try {
        const avifImage = new Image()
        avifImage.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A='
        
        await new Promise((resolve, reject) => {
          avifImage.onload = () => {
            supportsAVIF.value = true
            resolve(true)
          }
          avifImage.onerror = () => {
            supportsAVIF.value = false
            resolve(false)
          }
        })
      } catch {
        supportsAVIF.value = false
      }
    }
  }

  // 获取最佳图片格式
  const getBestFormat = (originalFormat?: string) => {
    if (supportsAVIF.value) return 'avif'
    if (supportsWebP.value) return 'webp'
    return originalFormat || 'jpeg'
  }

  // 懒加载图片
  const createLazyImage = (src: string, options: ImageOptions = {}) => {
    const img = ref<HTMLImageElement>()
    const isLoaded = ref(false)
    const isError = ref(false)

    const load = () => {
      if (!img.value) return

      const optimizedSrc = getOptimizedImageUrl(src, {
        ...options,
        format: getBestFormat(options.format),
      })

      const image = new Image()
      image.onload = () => {
        if (img.value) {
          img.value.src = optimizedSrc
          isLoaded.value = true
        }
      }
      image.onerror = () => {
        isError.value = true
      }
      image.src = optimizedSrc
    }

    return {
      img,
      isLoaded: readonly(isLoaded),
      isError: readonly(isError),
      load,
    }
  }

  // 初始化
  onMounted(() => {
    detectImageFormats()
  })

  return {
    getOptimizedImageUrl,
    generateSrcSet,
    generateSizes,
    getBestFormat,
    createLazyImage,
    supportsWebP: readonly(supportsWebP),
    supportsAVIF: readonly(supportsAVIF),
  }
}
```

### 字体优化

```typescript
// composables/useFontOptimization.ts
interface FontFace {
  family: string
  src: string[]
  weight?: string | number
  style?: string
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional'
  unicodeRange?: string
}

export function useFontOptimization() {
  const loadedFonts = new Set<string>()

  // 预加载字体
  const preloadFont = async (fontFace: FontFace) => {
    const fontKey = `${fontFace.family}-${fontFace.weight}-${fontFace.style}`
    
    if (loadedFonts.has(fontKey)) {
      return
    }

    try {
      // 使用 CSS Font Loading API
      if ('fonts' in document) {
        const font = new FontFace(
          fontFace.family,
          `url(${fontFace.src[0]})`,
          {
            weight: fontFace.weight?.toString() || 'normal',
            style: fontFace.style || 'normal',
            display: fontFace.display || 'swap',
            unicodeRange: fontFace.unicodeRange,
          }
        )

        await font.load()
        document.fonts.add(font)
        loadedFonts.add(fontKey)
      } else {
        // 降级方案：创建隐藏元素触发字体加载
        const testElement = document.createElement('div')
        testElement.style.fontFamily = fontFace.family
        testElement.style.fontSize = '1px'
        testElement.style.opacity = '0'
        testElement.style.position = 'absolute'
        testElement.style.top = '-9999px'
        testElement.textContent = 'Font loading test'
        
        document.body.appendChild(testElement)
        
        // 等待字体加载
        await new Promise(resolve => setTimeout(resolve, 100))
        
        document.body.removeChild(testElement)
        loadedFonts.add(fontKey)
      }
    } catch (error) {
      console.warn(`Failed to load font ${fontFace.family}:`, error)
    }
  }

  // 批量预加载字体
  const preloadFonts = async (fonts: FontFace[]) => {
    const promises = fonts.map(font => preloadFont(font))
    await Promise.allSettled(promises)
  }

  // 字体显示优化
  const optimizeFontDisplay = () => {
    if (process.client) {
      // 添加字体显示 CSS
      const style = document.createElement('style')
      style.textContent = `
        @font-face {
          font-family: 'Inter';
          font-style: normal;
          font-weight: 100 900;
          font-display: swap;
          src: url('/fonts/inter-var.woff2') format('woff2');
          unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
        }
        
        /* 字体加载期间的降级字体 */
        .font-loading {
          font-family: system-ui, -apple-system, sans-serif;
        }
        
        /* 字体加载完成后的样式 */
        .font-loaded {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
      `
      document.head.appendChild(style)
    }
  }

  // 监听字体加载状态
  const watchFontLoading = () => {
    if (process.client && 'fonts' in document) {
      document.fonts.ready.then(() => {
        document.documentElement.classList.add('fonts-loaded')
        document.documentElement.classList.remove('fonts-loading')
      })

      // 监听单个字体加载
      document.fonts.addEventListener('loadingdone', (event) => {
        console.log('Fonts loaded:', event)
      })

      document.fonts.addEventListener('loadingerror', (event) => {
        console.warn('Font loading error:', event)
      })
    }
  }

  // 字体子集化
  const createFontSubset = (text: string, fontFamily: string) => {
    // 获取文本中使用的字符
    const usedChars = new Set(text)
    const unicodeRanges: string[] = []

    usedChars.forEach(char => {
      const codePoint = char.codePointAt(0)
      if (codePoint) {
        unicodeRanges.push(`U+${codePoint.toString(16).toUpperCase()}`)
      }
    })

    return {
      fontFamily,
      unicodeRange: unicodeRanges.join(', '),
    }
  }

  return {
    preloadFont,
    preloadFonts,
    optimizeFontDisplay,
    watchFontLoading,
    createFontSubset,
    loadedFonts: readonly(loadedFonts),
  }
}
```

## 🚀 构建优化

### Webpack/Vite 优化配置

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // 构建优化
  build: {
    // 分析包大小
    analyze: process.env.ANALYZE === 'true',
  },

  vite: {
    build: {
      // 目标环境
      target: 'es2015',
      
      // 压缩配置
      minify: 'terser',
      terserOptions: {
        compress: {
          // 移除 console 和 debugger
          drop_console: process.env.NODE_ENV === 'production',
          drop_debugger: true,
          // 移除未使用的代码
          pure_funcs: ['console.log', 'console.info', 'console.debug'],
          // 移除注释
          comments: false,
        },
        mangle: {
          // 保留类名（用于调试）
          keep_classnames: process.env.NODE_ENV !== 'production',
          // Safari 10 兼容性
          safari10: true,
        },
        format: {
          // 移除注释
          comments: false,
        },
      },

      // 代码分割
      rollupOptions: {
        output: {
          // 手动分包策略
          manualChunks: (id) => {
            // 第三方库
            if (id.includes('node_modules')) {
              // Vue 生态
              if (id.includes('vue') || id.includes('@vue')) {
                return 'vue-vendor'
              }
              // UI 库
              if (id.includes('@headlessui') || id.includes('@heroicons')) {
                return 'ui-vendor'
              }
              // 工具库
              if (id.includes('lodash') || id.includes('date-fns') || id.includes('validator')) {
                return 'utils-vendor'
              }
              // 编辑器
              if (id.includes('@tiptap') || id.includes('prosemirror')) {
                return 'editor-vendor'
              }
              // 其他第三方库
              return 'vendor'
            }
            
            // 页面组件
            if (id.includes('/pages/')) {
              return 'pages'
            }
            
            // 组件
            if (id.includes('/components/')) {
              return 'components'
            }
          },
          
          // 文件命名
          chunkFileNames: (chunkInfo) => {
            const name = chunkInfo.name || 'chunk'
            return `js/${name}-[hash].js`
          },
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name || 'asset'
            const ext = name.split('.').pop()
            
            if (['css'].includes(ext!)) {
              return 'css/[name]-[hash].[ext]'
            }
            if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'avif'].includes(ext!)) {
              return 'images/[name]-[hash].[ext]'
            }
            if (['woff', 'woff2', 'ttf', 'eot'].includes(ext!)) {
              return 'fonts/[name]-[hash].[ext]'
            }
            
            return 'assets/[name]-[hash].[ext]'
          },
        },
      },

      // 资源内联阈值
      assetsInlineLimit: 4096, // 4KB 以下的资源内联

      // CSS 代码分割
      cssCodeSplit: true,

      // 源码映射
      sourcemap: process.env.NODE_ENV !== 'production',
    },

    // 开发服务器优化
    server: {
      // 预热常用文件
      warmup: {
        clientFiles: [
          './components/**/*.vue',
          './pages/**/*.vue',
          './layouts/**/*.vue',
        ],
      },
    },

    // 依赖优化
    optimizeDeps: {
      include: [
        'vue',
        '@vue/runtime-core',
        '@vue/runtime-dom',
        '@vueuse/core',
        'pinia',
      ],
      exclude: [
        // 排除大型库，让它们保持动态导入
        '@tiptap/core',
        '@tiptap/starter-kit',
      ],
    },

    // 插件配置
    plugins: [
      // 压缩插件
      process.env.NODE_ENV === 'production' && {
        name: 'compression',
        generateBundle(options, bundle) {
          // 这里可以添加自定义压缩逻辑
        },
      },
    ].filter(Boolean),
  },

  // CSS 优化
  css: {
    // PostCSS 配置
    postcss: {
      plugins: {
        // 自动添加浏览器前缀
        autoprefixer: {},
        // 压缩 CSS
        cssnano: process.env.NODE_ENV === 'production' ? {
          preset: ['default', {
            discardComments: { removeAll: true },
            normalizeWhitespace: true,
          }],
        } : false,
        // 移除未使用的 CSS
        '@fullhuman/postcss-purgecss': process.env.NODE_ENV === 'production' ? {
          content: [
            './components/**/*.{vue,js,ts}',
            './layouts/**/*.vue',
            './pages/**/*.vue',
            './plugins/**/*.{js,ts}',
            './app.vue',
          ],
          safelist: [
            // 保留动态类名
            /^nuxt-/,
            /^router-/,
            /^transition-/,
            // 保留第三方库的类名
            /^tiptap-/,
            /^ProseMirror/,
          ],
        } : false,
      },
    },
  },

  // 实验性功能
  experimental: {
    // 启用 Vite 的新功能
    viteNode: true,
    // 减少 payload 大小
    payloadExtraction: false,
    // 内联样式
    inlineSSRStyles: true,
  },
})
```

### 性能监控

```typescript
// plugins/performance.client.ts
interface PerformanceMetrics {
  // Core Web Vitals
  FCP?: number // First Contentful Paint
  LCP?: number // Largest Contentful Paint
  FID?: number // First Input Delay
  CLS?: number // Cumulative Layout Shift
  TTFB?: number // Time to First Byte
  
  // 自定义指标
  TTI?: number // Time to Interactive
  TBT?: number // Total Blocking Time
  SI?: number // Speed Index
  
  // 资源加载
  resourceLoadTime?: Record<string, number>
  
  // 用户交互
  userInteractions?: Array<{
    type: string
    timestamp: number
    duration?: number
  }>
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {}
  private observer: PerformanceObserver | null = null

  constructor() {
    this.initPerformanceObserver()
    this.measureCoreWebVitals()
    this.measureCustomMetrics()
  }

  // 初始化性能观察器
  private initPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processPerformanceEntry(entry)
        }
      })

      // 观察不同类型的性能条目
      try {
        this.observer.observe({ entryTypes: ['navigation', 'resource', 'paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] })
      } catch (error) {
        console.warn('Performance observer not supported:', error)
      }
    }
  }

  // 处理性能条目
  private processPerformanceEntry(entry: PerformanceEntry) {
    switch (entry.entryType) {
      case 'navigation':
        this.processNavigationEntry(entry as PerformanceNavigationTiming)
        break
      case 'resource':
        this.processResourceEntry(entry as PerformanceResourceTiming)
        break
      case 'paint':
        this.processPaintEntry(entry as PerformancePaintTiming)
        break
      case 'largest-contentful-paint':
        this.processLCPEntry(entry as any)
        break
      case 'first-input':
        this.processFIDEntry(entry as any)
        break
      case 'layout-shift':
        this.processCLSEntry(entry as any)
        break
    }
  }

  // 处理导航性能
  private processNavigationEntry(entry: PerformanceNavigationTiming) {
    this.metrics.TTFB = entry.responseStart - entry.requestStart
  }

  // 处理资源加载性能
  private processResourceEntry(entry: PerformanceResourceTiming) {
    if (!this.metrics.resourceLoadTime) {
      this.metrics.resourceLoadTime = {}
    }
    
    const resourceName = entry.name.split('/').pop() || entry.name
    this.metrics.resourceLoadTime[resourceName] = entry.duration
  }

  // 处理绘制性能
  private processPaintEntry(entry: PerformancePaintTiming) {
    if (entry.name === 'first-contentful-paint') {
      this.metrics.FCP = entry.startTime
    }
  }

  // 处理 LCP
  private processLCPEntry(entry: any) {
    this.metrics.LCP = entry.startTime
  }

  // 处理 FID
  private processFIDEntry(entry: any) {
    this.metrics.FID = entry.processingStart - entry.startTime
  }

  // 处理 CLS
  private processCLSEntry(entry: any) {
    if (!this.metrics.CLS) {
      this.metrics.CLS = 0
    }
    this.metrics.CLS += entry.value
  }

  // 测量 Core Web Vitals
  private measureCoreWebVitals() {
    // 使用 web-vitals 库的简化版本
    this.measureLCP()
    this.measureFID()
    this.measureCLS()
  }

  // 测量 LCP
  private measureLCP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        this.metrics.LCP = lastEntry.startTime
      })

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] })
      } catch (error) {
        console.warn('LCP measurement not supported')
      }
    }
  }

  // 测量 FID
  private measureFID() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          this.metrics.FID = entry.processingStart - entry.startTime
        })
      })

      try {
        observer.observe({ entryTypes: ['first-input'] })
      } catch (error) {
        console.warn('FID measurement not supported')
      }
    }
  }

  // 测量 CLS
  private measureCLS() {
    if ('PerformanceObserver' in window) {
      let clsValue = 0
      
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
            this.metrics.CLS = clsValue
          }
        })
      })

      try {
        observer.observe({ entryTypes: ['layout-shift'] })
      } catch (error) {
        console.warn('CLS measurement not supported')
      }
    }
  }

  // 测量自定义指标
  private measureCustomMetrics() {
    // TTI (Time to Interactive)
    this.measureTTI()
    
    // 用户交互监控
    this.monitorUserInteractions()
  }

  // 测量 TTI
  private measureTTI() {
    // 简化的 TTI 计算
    const checkTTI = () => {
      if (document.readyState === 'complete') {
        this.metrics.TTI = performance.now()
      } else {
        setTimeout(checkTTI, 100)
      }
    }
    
    if (document.readyState === 'complete') {
      this.metrics.TTI = performance.now()
    } else {
      document.addEventListener('readystatechange', checkTTI)
    }
  }

  // 监控用户交互
  private monitorUserInteractions() {
    if (!this.metrics.userInteractions) {
      this.metrics.userInteractions = []
    }

    const interactionTypes = ['click', 'keydown', 'scroll', 'touchstart']
    
    interactionTypes.forEach(type => {
      document.addEventListener(type, (event) => {
        this.metrics.userInteractions!.push({
          type,
          timestamp: performance.now(),
        })
      }, { passive: true })
    })
  }

  // 获取性能报告
  getPerformanceReport(): PerformanceMetrics {
    return { ...this.metrics }
  }

  // 发送性能数据
  async sendPerformanceData() {
    const report = this.getPerformanceReport()
    
    try {
      // 发送到分析服务
      await $fetch('/api/analytics/performance', {
        method: 'POST',
        body: {
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
          metrics: report,
        },
      })
    } catch (error) {
      console.warn('Failed to send performance data:', error)
    }
  }

  // 清理资源
  cleanup() {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
  }
}

// 创建性能监控实例
const performanceMonitor = new PerformanceMonitor()

// 页面卸载时发送数据
window.addEventListener('beforeunload', () => {
  performanceMonitor.sendPerformanceData()
})

// 页面隐藏时发送数据
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    performanceMonitor.sendPerformanceData()
  }
})

export default defineNuxtPlugin(() => {
  // 提供性能监控实例
  return {
    provide: {
      performanceMonitor,
    },
  }
})
```

## 🌐 部署优化

### Docker 部署配置

```dockerfile
# Dockerfile
# 多阶段构建
FROM node:18-alpine AS base

# 安装 pnpm
RUN npm install -g pnpm

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package.json pnpm-lock.yaml ./

# 依赖安装阶段
FROM base AS deps
RUN pnpm install --frozen-lockfile

# 构建阶段
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 构建应用
ENV NODE_ENV=production
RUN pnpm build

# 生产运行阶段
FROM node:18-alpine AS runner

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nuxtjs

# 设置工作目录
WORKDIR /app

# 复制构建产物
COPY --from=builder --chown=nuxtjs:nodejs /app/.output ./

# 切换到非 root 用户
USER nuxtjs

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# 启动应用
CMD ["node", "server/index.mjs"]
```

### Nginx 配置

```nginx
# nginx.conf
upstream nuxt_app {
    server app:3000;
    keepalive 32;
}

server {
    listen 80;
    server_name your-domain.com;
    
    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL 配置
    ssl_certificate /etc/ssl/certs/your-domain.crt;
    ssl_certificate_key /etc/ssl/private/your-domain.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 安全头
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Brotli 压缩
    brotli on;
    brotli_comp_level 6;
    brotli_types
        text/plain
        text/css
        application/json
        application/javascript
        text/xml
        application/xml
        application/xml+rss
        text/javascript;

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary "Accept-Encoding";
        
        # 预压缩文件
        location ~* \.(js|css)$ {
            gzip_static on;
            brotli_static on;
        }
    }

    # API 路由
    location /api/ {
        proxy_pass http://nuxt_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # 主应用
    location / {
        proxy_pass http://nuxt_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 缓存 HTML
        proxy_cache html_cache;
        proxy_cache_valid 200 5m;
        proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
        proxy_cache_lock on;
        
        # 超时设置
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}

# 缓存配置
proxy_cache_path /var/cache/nginx/html levels=1:2 keys_zone=html_cache:10m max_size=100m inactive=60m use_temp_path=off;
```

### CI/CD 配置

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: latest

      - name: Get pnpm store directory
        shell: bash
        run: |
          echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_ENV

      - name: Setup pnpm cache
        uses: actions/cache@v3
        with:
          path: ${{ env.STORE_PATH }}
          key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-store-

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run linting
        run: pnpm lint

      - name: Run type checking
        run: pnpm type-check

      - name: Run tests
        run: pnpm test

      - name: Build application
        run: pnpm build

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          platforms: linux/amd64,linux/arm64
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    environment:
      name: production
      url: https://your-domain.com

    steps:
      - name: Deploy to production
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            # 拉取最新镜像
            docker pull ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
            
            # 停止旧容器
            docker stop nuxt-app || true
            docker rm nuxt-app || true
            
            # 启动新容器
            docker run -d \
              --name nuxt-app \
              --restart unless-stopped \
              -p 3000:3000 \
              -e NODE_ENV=production \
              -e DATABASE_URL=${{ secrets.DATABASE_URL }} \
              -e JWT_SECRET=${{ secrets.JWT_SECRET }} \
              ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
            
            # 清理旧镜像
            docker image prune -f

      - name: Health check
        run: |
          sleep 30
          curl -f https://your-domain.com/health || exit 1
```

## 🧪 实践练习

1. **性能审计**
   - 使用 Lighthouse 进行性能测试
   - 分析 Core Web Vitals 指标
   - 制定性能优化计划

2. **缓存策略实现**
   - 配置多层缓存
   - 实现缓存失效机制
   - 监控缓存命中率

3. **部署流水线搭建**
   - 设置自动化测试
   - 配置蓝绿部署
   - 实现回滚机制

## 💭 思考题

1. **如何平衡性能和功能？**
   - 性能预算制定
   - 功能优先级评估
   - 渐进式增强策略

2. **如何处理不同网络环境？**
   - 自适应加载策略
   - 离线功能设计
   - 网络状态检测

3. **如何监控生产环境性能？**
   - 实时性能监控
   - 错误追踪系统
   - 用户体验分析

## 🎉 小结

通过这一章的学习，我们完成了从开发到部署的完整性能优化流程。从代码分割到资源优化，从构建配置到部署策略，我们掌握了构建高性能 Web 应用的全套技能。

我们学到了：
- ✅ 代码分割和懒加载的最佳实践
- ✅ 图片、字体等资源的优化策略
- ✅ 构建工具的高级配置和优化
- ✅ 性能监控和分析系统
- ✅ 生产环境的部署和运维

性能优化是一个持续的过程，需要我们在开发的每个阶段都保持性能意识。一个优秀的应用不仅要功能完善，更要在各种环境下都能提供流畅的用户体验。

## 🎓 教程总结

恭喜你完成了这个全面的 Nuxt.js 学习之旅！从项目初始化到生产部署，我们一起探索了现代前端开发的方方面面：

1. **项目基础** - 搭建了坚实的开发环境
2. **配置系统** - 掌握了 Nuxt.js 的核心配置
3. **UI 系统** - 构建了美观且可维护的界面
4. **路由布局** - 实现了灵活的页面结构
5. **用户认证** - 建立了安全的身份验证系统
6. **课程管理** - 开发了完整的业务功能
7. **富文本编辑** - 集成了强大的内容编辑器
8. **状态管理** - 构建了可扩展的数据流
9. **API 集成** - 实现了高效的数据交互
10. **性能优化** - 打造了生产级的应用性能

这个学习管理系统不仅是一个完整的项目，更是现代前端开发最佳实践的集合。希望这个教程能够帮助你在前端开发的道路上走得更远，创造出更多优秀的应用！

记住，技术在不断发展，保持学习的热情和好奇心，永远是成为优秀开发者的关键。加油！🚀