# Checkbox 组件快速开始

## 安装

组件已内置在项目中，无需额外安装。

## 基础用法

```vue
<template>
  <Checkbox v-model="checked" label="我同意用户协议" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Checkbox } from '~/components/ui/checkbox'

const checked = ref(false)
</script>
```

## 常见场景

### 1. 协议同意复选框

```vue
<Checkbox v-model="agreeTerms">
  我已阅读并同意 <a href="#">用户协议</a> 和 <a href="#">隐私政策</a>
</Checkbox>
```

### 2. 表单选项

```vue
<div class="flex flex-col gap-3">
  <Checkbox v-model="form.rememberMe" label="记住我" />
  <Checkbox v-model="form.newsletter" label="订阅邮件通知" />
</div>
```

### 3. 设置默认值

```vue
<Checkbox v-model="isDefault" label="设置为默认地址" />
```

### 4. 带禁用状态

```vue
<Checkbox v-model="checked" disabled label="此选项已禁用" />
```

## 快速替换现有 checkbox

在项目中替换原生 checkbox：

### 之前

```vue
<label class="flex items-center gap-2 cursor-pointer">
  <input
    type="checkbox"
    v-model="checked"
    class="w-5 h-5 border border-[#191a1d] rounded checked:bg-[#191a1d] checked:border-[#191a1d]"
  />
  <span class="text-sm text-[#4a5565]">标签文本</span>
</label>
```

### 之后

```vue
<Checkbox v-model="checked" label="标签文本" />
```

## Props 速查

| Props    | 值                                    | 说明     |
| -------- | ------------------------------------- | -------- |
| v-model  | `boolean`                             | 双向绑定 |
| label    | `string`                              | 标签文本 |
| size     | `sm` \| `md` \| `lg`                  | 尺寸     |
| variant  | `default` \| `primary` \| `secondary` | 样式     |
| disabled | `boolean`                             | 禁用     |

## 更多示例

查看 `example.vue` 获取更多使用示例。
