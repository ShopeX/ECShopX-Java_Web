# Select 组件快速开始

## 安装

组件已内置在项目中，无需额外安装。

## 基础用法

```vue
<template>
  <Select v-model="selected" :options="options" placeholder="请选择" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Select } from '~/components/ui/select'

const selected = ref('')
const options = [
  { value: '1', label: '选项 1' },
  { value: '2', label: '选项 2' },
  { value: '3', label: '选项 3' },
]
</script>
```

## 常见场景

### 1. 省市区选择

```vue
<div class="flex gap-4">
  <Select v-model="province" :options="provinces" placeholder="省份" />
  <Select v-model="city" :options="cities" :disabled="!province" placeholder="城市" />
  <Select v-model="district" :options="districts" :disabled="!city" placeholder="区县" />
</div>
```

### 2. 国家/区号选择

```vue
<Select v-model="countryCode" :options="countryCodeOptions" size="md" class="w-[180px]" />

<script setup>
const countryCodeOptions = [
  { value: '+86', label: '+86 中国大陆地区' },
  { value: '+852', label: '+852 香港' },
  { value: '+853', label: '+853 澳门' },
]
</script>
```

### 3. 带验证的表单选择器

```vue
<div class="flex flex-col gap-2">
  <Select 
    v-model="selected" 
    :options="options"
    :error="!selected"
    placeholder="请选择（必填）"
  />
  <p v-if="!selected" class="text-xs text-[#d0112f]">此字段为必填项</p>
</div>
```

## 快速替换现有 select

在项目中替换原生 select：

### 之前

```vue
<select
  v-model="value"
  class="w-[180px] h-10 px-4 bg-[#f3f4f6] border border-transparent text-xs text-[#191a1d] leading-4 focus:outline-none focus:border-[#191a1d] transition-colors appearance-none cursor-pointer"
  style="background-image: url('...'); ..."
>
  <option value="">请选择</option>
  <option value="1">选项 1</option>
  <option value="2">选项 2</option>
</select>
```

### 之后

```vue
<Select v-model="value" :options="options" placeholder="请选择" class="w-[180px]" />
```

## Props 速查

| Props       | 值                                  | 说明     |
| ----------- | ----------------------------------- | -------- |
| v-model     | `string \| number`                  | 双向绑定 |
| options     | `ISelectOption[]`                   | 选项数组 |
| placeholder | `string`                            | 占位符   |
| size        | `sm` \| `md` \| `lg`                | 尺寸     |
| variant     | `default` \| `outlined` \| `filled` | 样式     |
| disabled    | `boolean`                           | 禁用     |
| error       | `boolean`                           | 错误状态 |

## 更多示例

查看 `example.vue` 获取更多使用示例。
