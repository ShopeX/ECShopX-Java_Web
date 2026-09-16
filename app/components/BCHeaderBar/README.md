# HeaderBar 组件

电商平台头部导航栏组件集合，包含多种样式的头部组件，适用于不同页面场景。

## 组件列表

### HeaderBarDefault.vue - 默认完整头部

完整的电商头部组件，包含所有功能。

**功能特性：**

- 顶部信息栏（黑色背景）
  - 左侧：网站首页、地区信息、登录/用户信息
  - 右侧：购物车、订单、个人中心、企业采购、商家服务、网站导航、手机版、无障碍
- 主导航栏（白色背景）
  - Logo
  - 搜索框（带热门搜索）
  - 购物车（带数量角标）
  - 移动端响应式菜单
- 移动端适配
  - 汉堡菜单
  - 抽屉式侧边栏
  - 可展开的搜索框

**适用场景：**

- 首页
- 商品列表页
- 商品详情页
- 购物车页面
- 用户中心
- 其他需要完整功能的页面

**使用示例：**

```vue
<template>
  <HeaderBarDefault />
</template>
```

或在 layout 中:

```vue
<template>
  <div class="min-h-screen bg-gray-50">
    <HeaderBarDefault />
    <main class="container mx-auto px-4 py-8">
      <slot />
    </main>
  </div>
</template>
```

---

### HeaderBarSimple.vue - 简化版头部

简化版头部组件，仅包含 Logo 和基本导航。

**功能特性：**

- Logo
- 返回首页链接
- 帮助中心链接
- 干净简洁的设计

**适用场景：**

- 登录页
- 注册页
- 忘记密码页
- 其他不需要复杂功能的独立页面

**使用示例：**

```vue
<template>
  <HeaderBarSimple />
</template>
```

或在 auth layout 中:

```vue
<template>
  <div class="min-h-screen bg-gray-50">
    <HeaderBarSimple />
    <main class="container mx-auto px-4 py-8">
      <slot />
    </main>
  </div>
</template>
```

---

## 技术规范

### 组件命名规则

- 文件名：PascalCase（如 `HeaderBarDefault.vue`, `HeaderBarSimple.vue`）
- 组件使用：`<HeaderBarDefault />`, `<HeaderBarSimple />`
- 由于 `pathPrefix: false`，Nuxt 仅使用文件名作为组件名
- 因此文件名必须足够明确，避免与其他组件冲突

### 样式规范

- 必须使用 Tailwind CSS 类名
- 禁止使用 `<style>` 标签写自定义 CSS（除非是组件特定动画）
- 使用 `sp-` 前缀的主题类（定义在 `sp-theme.css`）

### 响应式断点

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### 深色模式

- 使用 Tailwind 的 `dark:` 前缀
- 遵循 Nuxt UI 的主题系统

---

## 扩展新样式

如果需要添加新的头部样式，请遵循以下步骤：

1. **创建新组件文件**

   ```bash
   touch app/components/business/headerBar/HeaderBarNewStyle.vue
   ```

2. **遵循命名规范**
   - 文件名：`HeaderBarNewStyle.vue`（PascalCase，包含 HeaderBar 前缀）
   - 组件会自动注册为：`HeaderBarNewStyle`
   - 必须包含 `HeaderBar` 前缀以避免命名冲突

3. **实现组件**
   - 使用 `<script setup>` 语法
   - 使用 TypeScript
   - 遵循项目样式规范

4. **更新文档**
   - 在本 README 中添加新组件说明
   - 包含功能特性、适用场景、使用示例

5. **示例结构**

   ```vue
   <template>
     <header class="sp-header-bar-new-style w-full">
       <!-- 头部内容 -->
     </header>
   </template>

   <script setup lang="ts">
   /**
    * NewStyle Header Bar 组件
    * 用途说明...
    */
   </script>
   ```

---

## 相关文件

- **主题配置**: `app.config.ts`
- **主题样式**: `app/assets/css/sp-theme.css`
- **布局文件**: `app/layouts/`
- **用户 Store**: `app/stores/user.ts`
- **购物车**: `app/composables/useCart.ts`

---

## 注意事项

1. **SSR 兼容性**
   - 使用 `onMounted` + `import.meta.client` 进行客户端特定逻辑
   - 动态导入 Store 和 Composables

2. **性能优化**
   - 避免不必要的响应式数据
   - 合理使用 `computed` 和 `watch`
   - 移动端菜单使用懒加载

3. **无障碍性**
   - 使用语义化 HTML
   - 添加 `aria-label` 属性
   - 支持键盘导航

4. **移动端适配**
   - 使用响应式断点
   - 提供移动端专用 UI
   - 优化触摸交互

---

## 更新日志

- **2025-01-09**: 初始版本，包含 Default 和 Simple 两种样式
