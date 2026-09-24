# TemplateEngine 模板引擎

## 概述

TemplateEngine 是一个支持 CMS 装修的模板引擎组件，可以从 API 动态加载模板配置，同时在 API 失败时自动回退到本地默认模板配置。

## 功能特性

### 1. **动态模板加载**

- 从 API 获取模板配置
- 支持 SSR（服务端渲染）
- 异步加载组件

### 2. **默认模板回退**

- API 请求失败时自动使用本地默认配置
- 根据业务模式（bbc/b2c）加载对应模板
- 确保页面基础功能始终可用

### 3. **业务模式支持**

- 支持 B2B 和 B2C 两种业务模式
- 通过环境变量配置
- 不同模式使用不同的默认模板

## 配置

### 环境变量

在项目根目录的 `.env` 文件中配置：

```bash
# 业务模式：bbc 或 b2c
NUXT_PUBLIC_BUSINESS_MODE=b2c
```

### 默认模板位置

默认模板存放在 `app/templateEngines/templates/` 目录下：

```
app/templateEngines/templates/
├── b2c/              # B2C 模式默认模板
│   ├── header.ts     # 头部模板
│   ├── footer.ts     # 底部模板
│   ├── index.ts      # 首页模板
│   └── cart.ts       # 购物车模板
└── bbc/              # BBC 模式默认模板
    ├── header.ts
    ├── footer.ts
    └── ...
```

## 使用方法

### 基本用法

```vue
<template>
  <TemplateEngine template="header">
    <template #header>
      <HeaderBar />
    </template>
  </TemplateEngine>
</template>
```

### 在 Layout 中使用

```vue
<!-- app/layouts/default.vue -->
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 头部 -->
    <TemplateEngine template="header">
      <template #header>
        <HeaderBar />
      </template>
    </TemplateEngine>

    <!-- 主内容 -->
    <main>
      <slot />
    </main>

    <!-- 底部 -->
    <TemplateEngine template="footer">
      <template #footer>
        <Footer />
      </template>
    </TemplateEngine>
  </div>
</template>
```

### 在页面中使用

```vue
<!-- app/pages/index.vue -->
<template>
  <div>
    <!-- 首页模板 -->
    <TemplateEngine template="index" />
  </div>
</template>
```

## 模板配置格式

默认模板配置使用以下格式：

```typescript
// app/templateEngines/templates/b2c/header.ts
export default {
  sections: {
    header: {
      type: 'header',
      title: '页面头部',
      settings: {
        layout: 'default',
        // 其他配置...
      },
    },
  },
  order: ['header'],
}
```

### 配置说明

- **sections**: 模板区块配置对象
  - **[key]**: 区块唯一标识
    - **type**: 区块类型（对应组件类型）
    - **title**: 区块标题
    - **settings**: 区块配置参数
- **order**: 区块渲染顺序数组

## 工作流程

### 正常流程（API 成功）

```
1. TemplateEngine 组件加载
2. 调用 API 获取模板配置
3. 渲染 API 返回的模板配置
4. 根据配置渲染对应的组件
```

### 回退流程（API 失败）

```
1. TemplateEngine 组件加载
2. 调用 API 获取模板配置
3. API 请求失败
4. 自动加载默认模板配置
   - 根据 NUXT_PUBLIC_BUSINESS_MODE 确定业务模式
   - 从 templates/{mode}/{name}.ts 加载默认配置
5. 使用默认配置渲染组件
```

## 添加新模板

### 1. 创建默认模板文件

在 `app/templateEngines/templates/b2c/` 目录下创建新文件：

```typescript
// app/templateEngines/templates/b2c/my-template.ts
export default {
  sections: {
    'my-section': {
      type: 'my-component',
      title: '我的组件',
      settings: {
        // 组件配置
      },
    },
  },
  order: ['my-section'],
}
```

### 2. 注册组件映射

在 `TemplateEngine.vue` 中添加组件映射：

```typescript
// 动态组件映射
const sectionComponents: Record<string, () => Promise<Component>> = {
  carousel: () => import('./sections/carousel.vue') as Promise<Component>,
  'featured-product': () => import('./sections/featured-product.vue') as Promise<Component>,
  'my-component': () => import('./sections/my-component.vue') as Promise<Component>, // 新增
}
```

### 3. 创建组件

在 `app/templateEngines/sections/` 目录下创建组件：

```vue
<!-- app/templateEngines/sections/my-component.vue -->
<template>
  <div>
    <h1>{{ title }}</h1>
    <!-- 组件内容 -->
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title?: string
  settings?: Record<string, any>
}>()
</script>
```

### 4. 使用新模板

```vue
<template>
  <TemplateEngine template="my-template" />
</template>
```

## 调试

### 查看模板加载日志

组件会在控制台输出详细的日志信息：

```javascript
[TemplateEngine] API request failed, loading default template
[TemplateEngine] Loaded default template: ../templates/b2c/header.ts
[TemplateEngine] Using default template due to API error
```

### 检查加载状态

- **pending**: 模板加载中
- **error**: API 请求失败（会自动加载默认模板）
- **template**: 最终使用的模板配置

## 注意事项

1. **默认模板必须存在**
   - 确保在 `templates/b2c/` 或 `templates/bbc/` 目录下有对应的默认模板文件
   - 如果默认模板也不存在，页面可能显示空白

2. **业务模式配置**
   - 确保在 `.env` 文件中正确配置 `NUXT_PUBLIC_BUSINESS_MODE`
   - 只支持 `bbc` 和 `b2c` 两种模式

3. **组件注册**
   - 使用的组件类型必须在 `sectionComponents` 中注册
   - 未注册的组件类型会被跳过

4. **SSR 兼容性**
   - 默认模板加载使用了 `import.meta.glob`，确保 SSR 环境下正常工作
   - API 调用支持 SSR，在服务端和客户端都会执行

## 示例

### 完整示例：首页模板

```vue
<!-- app/pages/index.vue -->
<template>
  <div>
    <TemplateEngine template="index" @loaded="handleTemplateLoaded" />
  </div>
</template>

<script setup lang="ts">
function handleTemplateLoaded(template: any) {
  console.log('Template loaded:', template)
}
</script>
```

### 默认配置示例

```typescript
// app/templateEngines/templates/b2c/index.ts
export default {
  sections: {
    'banner-carousel': {
      type: 'carousel',
      title: '首页轮播图',
      settings: {
        autoplay: true,
        interval: 3000,
      },
    },
    'featured-products': {
      type: 'featured-product',
      title: '推荐商品',
      items: [],
    },
  },
  order: ['banner-carousel', 'featured-products'],
}
```

## API 参考

### Props

| 属性     | 类型   | 必填 | 默认值 | 说明                                |
| -------- | ------ | ---- | ------ | ----------------------------------- |
| template | string | 是   | -      | 模板名称（如 'header', 'index' 等） |

### Events

| 事件名 | 参数                      | 说明               |
| ------ | ------------------------- | ------------------ |
| loaded | template: ITemplateConfig | 模板加载完成时触发 |

### Slots

| 插槽名       | 说明                                       |
| ------------ | ------------------------------------------ |
| [sectionKey] | 动态具名插槽，对应模板配置中的 section key |

## 相关文件

- `app/templateEngines/TemplateEngine.vue` - 主组件
- `app/templateEngines/utils/loadDefaultTemplate.ts` - 默认模板加载工具
- `app/templateEngines/templates/` - 默认模板配置目录
- `app/composables/useTemplate.ts` - 模板加载 Composable
- `nuxt.config.ts` - Nuxt 配置（包含 businessMode 配置）
