# Toast 组件

简洁优雅的提示组件，用于显示临时消息提示。

## 特点

- 🚀 **动态创建** - 通过 API 调用动态创建，无需在模板中预先放置
- 🎨 **简洁设计** - 深色半透明背景，白色文字，视觉优雅
- 🎯 **居中显示** - 提示信息居中展示，用户体验更好
- ⚡ **自动消失** - 可配置自动关闭时长
- 🔧 **灵活配置** - 支持多种尺寸和自定义时长
- 📱 **响应式** - 适配不同屏幕尺寸
- ♻️ **自动管理** - 组件实例自动创建、复用和销毁

## 基础用法

### 使用 Composable API（唯一方式）

```vue
<script setup lang="ts">
const toast = useToastMessage()

function handleClick() {
  toast.show('请选择尺码')
}
</script>
```

> **注意**：
>
> 1. 使用 `useToastMessage` 而不是 `useToast`，因为 Nuxt UI 已经有一个同名的 composable
> 2. Toast 组件会在首次调用时自动创建，无需在模板中预先放置
> 3. 组件实例会自动管理和复用

## API

### Props

| 属性     | 类型                 | 默认值 | 说明                               |
| -------- | -------------------- | ------ | ---------------------------------- |
| message  | string               | ''     | 提示消息                           |
| duration | number               | 2000   | 显示时长（毫秒），0 表示不自动关闭 |
| size     | 'sm' \| 'md' \| 'lg' | 'md'   | 尺寸大小                           |

### 方法

#### show(options)

显示提示消息

```typescript
// 简单用法
toast.show('提示消息')

// 完整配置
toast.show({
  message: '提示消息',
  duration: 3000,
  size: 'lg',
})
```

**参数：**

- `options`: `string | ToastOptions` - 消息内容或完整配置对象

#### hide()

手动隐藏提示

```typescript
toast.hide()
```

## 使用示例

### 基础提示

```typescript
toast.show('操作成功')
```

### 自定义时长

```typescript
toast.show({
  message: '这是一条较长的提示消息',
  duration: 3000,
})
```

### 不同尺寸

```typescript
// 小尺寸
toast.show({
  message: '提示',
  size: 'sm',
})

// 大尺寸
toast.show({
  message: '这是一条很长的提示消息，需要更大的空间来显示',
  size: 'lg',
})
```

### 多行文本

```typescript
toast.show({
  message: '第一行文本\n第二行文本\n第三行文本',
})
```

### 手动控制

```typescript
// 显示不会自动关闭的提示
const toastRef = ref<ToastInstance>()

toastRef.value?.show({
  message: '需要手动关闭',
  duration: 0,
})

// 稍后手动关闭
setTimeout(() => {
  toastRef.value?.hide()
}, 5000)
```

## 样式自定义

组件使用 Tailwind CSS 类，可以通过修改组件源码来自定义样式：

```vue
<!-- 修改背景颜色和透明度 -->
<div class="bg-gray-800 bg-opacity-90"></div>
```

## 注意事项

1. **动态创建** - Toast 组件通过 `render()` 函数动态创建，无需在模板中预先放置
2. **自动管理** - 组件实例在首次调用时自动创建，并会被复用
3. **Teleport 渲染** - 组件使用 Teleport 渲染到 body，确保在任何位置都能正确显示
4. **定时器清理** - 组件自动处理定时器清理，避免内存泄漏
5. **SSR 兼容** - 只在客户端环境创建和渲染，服务端返回空实现
6. **不阻塞交互** - 使用 `pointer-events-none` 确保遮罩层不阻止页面交互

## TypeScript 支持

```typescript
import type { ToastOptions, ToastInstance } from '~/components/ui/toast'

const toast = useToastMessage()
const options: ToastOptions = {
  message: '提示消息',
  duration: 2000,
  size: 'md',
}
```
