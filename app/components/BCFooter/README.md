# Footer 页脚组件

页面底部的页脚组件，包含导航链接和品牌信息。

## 功能特性

- ✅ 响应式布局
- ✅ 品牌 Logo 展示
- ✅ 导航链接（服务条款、联系我们）
- ✅ 悬浮效果
- ✅ 符合 Figma 设计规范

## 使用方式

### 基础使用

```vue
<template>
  <div>
    <!-- 页面内容 -->
    <main>
      <!-- ... -->
    </main>

    <!-- 页脚 -->
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Footer from '~/components/business/footer/Footer.vue'
</script>
```

### 在布局中使用

```vue
<!-- layouts/default.vue -->
<template>
  <div class="min-h-screen flex flex-col">
    <HeaderBar />

    <main class="flex-1">
      <slot />
    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import HeaderBar from '~/components/business/headerBar/HeaderBar.vue'
import Footer from '~/components/business/footer/Footer.vue'
</script>
```

## 设计规范

### 布局

- 背景色：`#141414`（黑色）
- 左右内边距：`128px`（px-32）/ `320px`（lg:px-80）
- 上下内边距：`36px`（py-9）
- 高度：`119px`（包含内边距）

### 文字样式

**服务条款**

- 字号：`13.3px`
- 颜色：`rgba(255, 255, 255, 0.55)`
- 字重：Regular (400)
- 悬浮时：白色

**联系我们**

- 字号：`14px`
- 行高：`20px`
- 颜色：`#f3f4f6`
- 字重：Regular (400)
- 悬浮时：白色

### Logo

- 宽度：`120px`
- 高度：`30px`
- 显示方式：`object-contain`

## 链接说明

| 链接文本 | 路由路径   | 说明         |
| -------- | ---------- | ------------ |
| 服务条款 | `/terms`   | 服务条款页面 |
| 联系我们 | `/contact` | 联系我们页面 |

## 响应式设计

组件采用响应式设计，在不同屏幕尺寸下自适应：

- **桌面端**（lg 及以上）：左右内边距 `320px`
- **平板/移动端**：左右内边距 `128px`

## 自定义 Logo

如需更换品牌 Logo，请替换以下文件：

```
/public/images/logo/logo.png
```

确保：

- Logo 为透明背景的 PNG 格式
- 推荐尺寸比例适合 120x30 的容器
- 文件大小控制在 50KB 以内

## 扩展说明

### 添加更多链接

如需添加更多页脚链接，可以修改组件结构：

```vue
<template>
  <footer class="bg-[#141414] w-full">
    <div class="flex items-start justify-between px-32 lg:px-80 py-9">
      <!-- 左侧区域 -->
      <div class="flex flex-col items-center justify-center gap-6">
        <div class="flex gap-4">
          <NuxtLink to="/terms" class="...">服务条款</NuxtLink>
          <NuxtLink to="/privacy" class="...">隐私政策</NuxtLink>
        </div>
        <!-- Logo -->
      </div>

      <!-- 右侧区域 -->
      <div class="flex flex-col items-center justify-center gap-6">
        <div class="flex gap-4">
          <NuxtLink to="/contact" class="...">联系我们</NuxtLink>
          <NuxtLink to="/about" class="...">关于我们</NuxtLink>
        </div>
        <!-- Logo -->
      </div>
    </div>
  </footer>
</template>
```

### 添加社交媒体图标

```vue
<template>
  <footer class="bg-[#141414] w-full">
    <div class="...">
      <!-- ... -->

      <!-- 社交媒体图标 -->
      <div class="flex items-center justify-center gap-4 mt-6">
        <a href="#" aria-label="微信">
          <UIcon
            name="i-heroicons-chat-bubble-left-right"
            class="w-5 h-5 text-white/55 hover:text-white"
          />
        </a>
        <a href="#" aria-label="微博">
          <UIcon name="i-heroicons-megaphone" class="w-5 h-5 text-white/55 hover:text-white" />
        </a>
      </div>
    </div>
  </footer>
</template>
```

## Figma 设计稿

- 节点 ID：[2511-10708](https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/ECshopex-demo-PC%E7%AB%AF?node-id=2511-10708)
