# Toast 组件快速开始

## 🚀 一分钟上手

### 1. 基础使用

在任何 Vue 组件中，直接使用 `useToastMessage` composable：

```vue
<template>
  <button @click="handleClick">显示提示</button>
</template>

<script setup lang="ts">
const toast = useToastMessage()

function handleClick() {
  toast.show('请选择尺码')
}
</script>
```

> **注意**：使用 `useToastMessage` 而不是 `useToast`，因为 Nuxt UI 已经有一个 `useToast`，为避免冲突所以使用不同的名字。

就这么简单！无需导入组件，无需配置，开箱即用。

### 2. 完整配置

```typescript
toast.show({
  message: '提示消息',
  duration: 3000, // 显示时长（毫秒）
  size: 'lg', // 'sm' | 'md' | 'lg'
})
```

### 3. 手动关闭

```typescript
// 显示不自动关闭的提示
toast.show({
  message: '需要手动关闭',
  duration: 0,
})

// 稍后手动关闭
toast.hide()
```

## 📦 已包含功能

- ✅ **动态创建**，无需在模板中预先放置组件
- ✅ **自动管理**，组件实例自动创建和复用
- ✅ 深色半透明背景，优雅设计
- ✅ 居中显示，用户体验好
- ✅ 自动消失，可配置时长
- ✅ 支持多行文本
- ✅ SSR 兼容

## 💡 常见场景

```typescript
const toast = useToastMessage()

// 场景1：选择提示
toast.show('请选择尺码')

// 场景2：登录提示
toast.show('请先登录')

// 场景3：成功提示
toast.show('加入购物车成功')

// 场景4：错误提示
toast.show('该商品已售罄')

// 场景5：多行提示
toast.show('提示内容第一行\n提示内容第二行')
```

## 🎨 设计说明

根据产品截图设计的简洁 Toast 组件：

- 深灰色背景（`bg-gray-800` + 90% 透明度）
- 白色文字
- 大圆角（`rounded-2xl`）
- 居中显示
- 淡入淡出动画

## 📝 完整文档

查看 [README.md](./README.md) 了解更多高级用法和API文档。

查看 [EXAMPLE.vue](./EXAMPLE.vue) 查看所有使用示例。
