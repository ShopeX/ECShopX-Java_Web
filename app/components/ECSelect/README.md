# Select 下拉选择组件

通用下拉选择组件，支持多种尺寸和样式变体。

## 功能特性

- ✅ 支持 v-model 双向绑定
- ✅ 三种尺寸（sm、md、lg）
- ✅ 三种样式变体（default、outlined、filled）
- ✅ 禁用状态
- ✅ 错误状态
- ✅ 占位符支持
- ✅ 完全自定义样式（非原生 select）
- ✅ 键盘导航支持（方向键、Enter、Escape）
- ✅ 点击外部自动关闭
- ✅ 原生属性透传
- ✅ 无障碍访问支持
- ✅ 自定义下拉箭头图标（SVG）
- ✅ 平滑过渡动画

## 使用示例

### 基础使用

```vue
<template>
  <Select v-model="selected" :options="options" placeholder="请选择" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Select, type ISelectOption } from '~/components/ui/select'

const selected = ref('')

const options: ISelectOption[] = [
  { value: '1', label: '选项 1' },
  { value: '2', label: '选项 2' },
  { value: '3', label: '选项 3' },
]
</script>
```

### 不同尺寸

```vue
<template>
  <div class="flex flex-col gap-4">
    <Select v-model="value1" :options="options" size="sm" placeholder="小尺寸 (sm)" />
    <Select v-model="value2" :options="options" size="md" placeholder="中尺寸 (md - 默认)" />
    <Select v-model="value3" :options="options" size="lg" placeholder="大尺寸 (lg)" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Select } from '~/components/ui/select'

const value1 = ref('')
const value2 = ref('')
const value3 = ref('')

const options = [
  { value: '1', label: '选项 1' },
  { value: '2', label: '选项 2' },
  { value: '3', label: '选项 3' },
]
</script>
```

### 不同变体

```vue
<template>
  <div class="flex flex-col gap-4">
    <Select
      v-model="value1"
      :options="options"
      variant="default"
      placeholder="默认样式 (default)"
    />
    <Select
      v-model="value2"
      :options="options"
      variant="outlined"
      placeholder="边框样式 (outlined)"
    />
    <Select v-model="value3" :options="options" variant="filled" placeholder="填充样式 (filled)" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Select } from '~/components/ui/select'

const value1 = ref('')
const value2 = ref('')
const value3 = ref('')

const options = [
  { value: '1', label: '选项 1' },
  { value: '2', label: '选项 2' },
]
</script>
```

### 禁用状态

```vue
<template>
  <div class="flex flex-col gap-4">
    <!-- 整个选择器禁用 -->
    <Select v-model="value1" :options="options" disabled placeholder="禁用的选择器" />

    <!-- 单个选项禁用 -->
    <Select v-model="value2" :options="optionsWithDisabled" placeholder="部分选项禁用" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Select } from '~/components/ui/select'

const value1 = ref('')
const value2 = ref('')

const options = [
  { value: '1', label: '选项 1' },
  { value: '2', label: '选项 2' },
]

const optionsWithDisabled = [
  { value: '1', label: '选项 1' },
  { value: '2', label: '选项 2（禁用）', disabled: true },
  { value: '3', label: '选项 3' },
]
</script>
```

### 错误状态

```vue
<template>
  <div class="flex flex-col gap-2">
    <Select v-model="selected" :options="options" :error="!selected" placeholder="请选择" />
    <p v-if="!selected" class="text-xs text-[#d0112f]">此字段为必填项</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Select } from '~/components/ui/select'

const selected = ref('')

const options = [
  { value: '1', label: '选项 1' },
  { value: '2', label: '选项 2' },
]
</script>
```

### 使用插槽自定义选项

~~此功能已移除，组件现在完全基于 `options` prop。~~

**改用以下方式：**

```vue
<template>
  <Select v-model="selected" :options="countryOptions" placeholder="请选择国家" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Select } from '~/components/ui/select'

const selected = ref('')
const countryOptions = [
  { value: 'cn', label: '🇨🇳 中国' },
  { value: 'us', label: '🇺🇸 美国' },
  { value: 'jp', label: '🇯🇵 日本' },
  { value: 'uk', label: '🇬🇧 英国' },
]
</script>
```

### 监听变化事件

```vue
<template>
  <Select
    v-model="selected"
    :options="options"
    placeholder="选择一个选项"
    @change="handleChange"
    @focus="handleFocus"
    @blur="handleBlur"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Select } from '~/components/ui/select'

const selected = ref('')

const options = [
  { value: '1', label: '选项 1' },
  { value: '2', label: '选项 2' },
]

function handleChange(value: string | number) {
  console.log('选择变化:', value)
}

function handleFocus() {
  console.log('聚焦')
}

function handleBlur() {
  console.log('失焦')
}
</script>
```

### 在表单中使用

```vue
<template>
  <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
    <div class="flex flex-col gap-2">
      <label class="text-sm font-medium">国家/地区</label>
      <Select
        v-model="form.country"
        :options="countries"
        :error="submitted && !form.country"
        placeholder="请选择国家"
      />
      <p v-if="submitted && !form.country" class="text-xs text-[#d0112f]">请选择国家</p>
    </div>

    <div class="flex flex-col gap-2">
      <label class="text-sm font-medium">城市</label>
      <Select
        v-model="form.city"
        :options="cities"
        :disabled="!form.country"
        placeholder="请选择城市"
      />
    </div>

    <button
      type="submit"
      class="bg-[#191a1d] text-white px-6 py-3 hover:bg-[#191a1d]/90 transition-colors"
    >
      提交
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Select } from '~/components/ui/select'

const submitted = ref(false)

const form = reactive({
  country: '',
  city: '',
})

const countries = [
  { value: 'cn', label: '中国' },
  { value: 'us', label: '美国' },
  { value: 'jp', label: '日本' },
]

const cities = computed(() => {
  if (form.country === 'cn') {
    return [
      { value: 'beijing', label: '北京' },
      { value: 'shanghai', label: '上海' },
      { value: 'guangzhou', label: '广州' },
    ]
  }
  return []
})

function handleSubmit() {
  submitted.value = true
  if (form.country && form.city) {
    console.log('表单提交:', form)
  }
}
</script>
```

### 在 AddressModal 中使用

```vue
<template>
  <div class="flex gap-4">
    <!-- 省 -->
    <div class="flex-1 flex flex-col gap-2">
      <label class="text-xs text-[#4a5565] leading-4">省</label>
      <Select
        v-model="formData.province"
        :options="provinces"
        placeholder="省份/直辖市"
        size="md"
        @change="handleProvinceChange"
      />
    </div>

    <!-- 市 -->
    <div class="flex-1 flex flex-col gap-2">
      <label class="text-xs text-[#4a5565] leading-4">市</label>
      <Select
        v-model="formData.city"
        :options="cities"
        :disabled="!formData.province"
        placeholder="市"
        size="md"
        @change="handleCityChange"
      />
    </div>

    <!-- 区 -->
    <div class="flex-1 flex flex-col gap-2">
      <label class="text-xs text-[#4a5565] leading-4">区</label>
      <Select
        v-model="formData.district"
        :options="districts"
        :disabled="!formData.city"
        placeholder="县/区"
        size="md"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { Select } from '~/components/ui/select'
import { regionData } from './regionData'

const formData = reactive({
  province: '',
  city: '',
  district: '',
})

const provinces = computed(() => {
  return regionData.map((item) => ({
    value: item.code,
    label: item.name,
  }))
})

const cities = computed(() => {
  if (!formData.province) return []
  const province = regionData.find((item) => item.code === formData.province)
  return (
    province?.children?.map((item) => ({
      value: item.code,
      label: item.name,
    })) || []
  )
})

const districts = computed(() => {
  if (!formData.city) return []
  const province = regionData.find((item) => item.code === formData.province)
  const city = province?.children?.find((item) => item.code === formData.city)
  return (
    city?.children?.map((item) => ({
      value: item.code,
      label: item.name,
    })) || []
  )
})

function handleProvinceChange() {
  formData.city = ''
  formData.district = ''
}

function handleCityChange() {
  formData.district = ''
}
</script>
```

## Props

| 属性        | 类型                                  | 默认值      | 说明              |
| ----------- | ------------------------------------- | ----------- | ----------------- |
| modelValue  | `string \| number`                    | `''`        | 绑定值（v-model） |
| options     | `ISelectOption[]`                     | `[]`        | 选项列表          |
| placeholder | `string`                              | `'请选择'`  | 占位符            |
| disabled    | `boolean`                             | `false`     | 是否禁用          |
| size        | `'sm' \| 'md' \| 'lg'`                | `'md'`      | 尺寸              |
| variant     | `'default' \| 'outlined' \| 'filled'` | `'default'` | 样式变体          |
| error       | `boolean`                             | `false`     | 是否显示错误状态  |

## Events

| 事件名            | 参数                                               | 说明                                                      |
| ----------------- | -------------------------------------------------- | --------------------------------------------------------- |
| update:modelValue | `(value: string \| number)`                        | v-model 更新事件                                          |
| change            | `(value: string \| number, option: ISelectOption)` | 值变化时触发，返回 value 和完整的选项对象                 |
| select            | `(option: ISelectOption)`                          | 选择选项时触发，返回完整的选项对象（包含 value 和 label） |
| blur              | -                                                  | 失焦时触发                                                |
| focus             | -                                                  | 聚焦时触发                                                |

## Slots

~~此组件不再支持插槽。~~

请使用 `options` prop 传递选项数据。

## 类型定义

```typescript
interface ISelectOption {
  value: string | number
  label: string
  disabled?: boolean
}
```

## 样式说明

### 尺寸对照

- **sm**: 32px 高度，12px 字体
- **md**: 40px 高度，12px 字体（默认）
- **lg**: 48px 高度，14px 字体

### 变体对照

- **default**: 灰色背景 (#f3f4f6)，无边框，focus 时显示黑色边框
- **outlined**: 白色背景，灰色边框，focus 时黑色边框 + ring
- **filled**: 灰色背景，无边框，focus 时白色背景 + 黑色边框

### 颜色规范

- 背景色（default）：`#f3f4f6`
- 背景色（outlined）：`#ffffff`
- 背景色（filled）：`gray-100`
- 文字颜色：`#191a1d`
- 边框颜色（focus）：`#191a1d`
- 错误边框：`#d0112f`
- 禁用状态：opacity 50%
- 下拉箭头颜色：`#4a5565`

## 下拉箭头

组件使用内联 SVG 图标作为下拉箭头：

- 位置：右侧
- 尺寸：16px × 16px
- 颜色：`#4a5565`
- 样式：圆角线条
- 动画：打开时旋转 180 度

## 与原生 select 的区别

本组件**不使用原生 `<select>` 元素**，而是完全自定义实现，优势：

- ✅ 完全自定义样式
- ✅ 更好的视觉效果和动画
- ✅ 跨浏览器样式一致
- ✅ 更灵活的交互控制
- ✅ 支持键盘导航
- ✅ 平滑过渡动画

## 与 FormSelect 对比

### Select (新组件)

- 通用 UI 组件，可独立使用
- 支持多种尺寸和变体
- 更灵活的样式定制
- 符合项目设计规范

### FormSelect (表单组件)

- 专门用于 Form 组件中
- 与表单验证集成
- 较少的自定义选项

建议在非表单场景使用 `Select`，在 Form Schema 中使用 `FormSelect`。

## 原生属性

组件支持所有原生 select 的属性，如 `name`, `id`, `required`, `multiple` 等：

```vue
<Select v-model="selected" :options="options" name="country" id="country-select" required />
```

## 无障碍访问

- ✅ 支持键盘导航
  - Tab - 聚焦选择器
  - Enter/Space - 打开/选择
  - Arrow Up/Down - 上下移动选项
  - Escape - 关闭下拉面板
- ✅ 支持 disabled 状态
- ✅ 支持 focus 视觉反馈
- ✅ 点击外部自动关闭

## 浏览器兼容性

- ✅ Chrome / Edge（最新版）
- ✅ Firefox（最新版）
- ✅ Safari（最新版）
- ✅ 移动端浏览器

注意：组件完全自定义实现，所有浏览器显示效果一致。

## 组件结构

```
select/
├── index.ts         # 导出文件
├── types.ts         # 类型定义
├── Select.vue       # 组件主文件
├── README.md        # 文档
├── QUICK_START.md   # 快速开始
└── example.vue      # 使用示例
```

## 设计规范

根据 Figma 设计稿和项目现有风格：

- 使用浅灰色背景 (#f3f4f6)
- focus 时显示黑色边框
- 自定义下拉箭头图标（SVG）
- 完全自定义下拉面板
- 平滑过渡动画（200ms）
- 悬停时浅灰色背景
- 选中项加粗显示
