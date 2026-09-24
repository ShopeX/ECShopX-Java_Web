# TemplateEngine 快速开始

## 🚀 5 分钟上手

### 1️⃣ 配置环境变量

在项目根目录创建 `.env` 文件（如果不存在）：

```bash
# 业务模式：b2c 或 b2b
NUXT_PUBLIC_BUSINESS_MODE=b2c
```

### 2️⃣ 在 Layout 中使用

```vue
<!-- app/layouts/default.vue -->
<template>
  <div>
    <TemplateEngine template="header">
      <template #header>
        <HeaderBar />
      </template>
    </TemplateEngine>

    <slot />
  </div>
</template>
```

### 3️⃣ 创建默认模板

如果还没有对应的默认模板，创建 `app/templateEngines/templates/b2c/header.ts`：

```typescript
export default {
  sections: {
    header: {
      type: 'header',
      title: '页面头部',
      settings: {
        layout: 'default',
      },
    },
  },
  order: ['header'],
}
```

### 4️⃣ 测试

```bash
# 启动项目
pnpm dev

# 访问页面
# - API 成功：显示 CMS 配置的样式
# - API 失败：自动显示默认模板（HeaderBar）
```

## 📋 工作原理

```
API 请求成功 → 使用 CMS 配置 ✅
        ↓ 失败
自动加载默认模板 → 页面正常显示 ✅
```

## 🎯 核心特性

- ✅ **API 优先**：优先使用 CMS 配置
- ✅ **自动降级**：API 失败时自动使用默认模板
- ✅ **业务模式**：支持 B2B/B2C 不同配置
- ✅ **零配置**：开箱即用，无需额外设置

## 📚 更多文档

- [完整文档](./README.md)
- [实现原理](../../docs/templateengine-fallback-implementation.md)

## ❓ 常见问题

### Q: 如何查看当前使用的是 API 配置还是默认模板？

A: 打开浏览器控制台，查看日志：

```javascript
// 使用 API 配置时：
// (无特殊日志)

// 使用默认模板时：
[TemplateEngine] API request failed, loading default template
[TemplateEngine] Loaded default template: ../templates/b2c/header.ts
[TemplateEngine] Using default template due to API error
```

### Q: 如何切换业务模式？

A: 修改 `.env` 文件中的 `NUXT_PUBLIC_BUSINESS_MODE`：

```bash
# B2C 模式
NUXT_PUBLIC_BUSINESS_MODE=b2c

# B2B 模式
NUXT_PUBLIC_BUSINESS_MODE=bbc
```

然后重启项目。

### Q: 页面显示空白怎么办？

A: 检查以下几点：

1. 确认默认模板文件存在：`app/templateEngines/templates/b2c/[模板名].ts`
2. 检查控制台是否有错误日志
3. 确认插槽名称与 `order` 数组中的 key 一致

### Q: 如何添加新的模板区域？

A: 参考 [完整文档 - 添加新模板](./README.md#添加新模板)
