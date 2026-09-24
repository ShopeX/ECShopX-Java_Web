# Checkbox 复选框组件

通用复选框组件，支持多种尺寸和样式变体。

## 功能特性

- ✅ 支持 v-model 双向绑定
- ✅ 支持受控模式（checked prop）
- ✅ 三种尺寸（sm、md、lg）
- ✅ 三种样式变体（default、primary、secondary）
- ✅ 禁用状态
- ✅ 自定义标签（支持插槽）
- ✅ 原生属性透传
- ✅ 无障碍访问支持

## 使用示例

### 基础使用

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

### 不同尺寸

```vue
<template>
  <div class="flex flex-col gap-4">
    <Checkbox v-model="checked1" size="sm" label="小尺寸 (sm)" />
    <Checkbox v-model="checked2" size="md" label="中尺寸 (md - 默认)" />
    <Checkbox v-model="checked3" size="lg" label="大尺寸 (lg)" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Checkbox } from '~/components/ui/checkbox'

const checked1 = ref(false)
const checked2 = ref(false)
const checked3 = ref(false)
</script>
```

### 不同变体

```vue
<template>
  <div class="flex flex-col gap-4">
    <Checkbox v-model="checked1" variant="default" label="默认样式 (default)" />
    <Checkbox v-model="checked2" variant="primary" label="主要样式 (primary)" />
    <Checkbox v-model="checked3" variant="secondary" label="次要样式 (secondary)" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Checkbox } from '~/components/ui/checkbox'

const checked1 = ref(false)
const checked2 = ref(false)
const checked3 = ref(false)
</script>
```

### 禁用状态

```vue
<template>
  <div class="flex flex-col gap-4">
    <Checkbox v-model="checked1" disabled label="禁用（未选中）" />
    <Checkbox v-model="checked2" disabled label="禁用（已选中）" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Checkbox } from '~/components/ui/checkbox'

const checked1 = ref(false)
const checked2 = ref(true)
</script>
```

### 使用插槽自定义标签

```vue
<template>
  <Checkbox v-model="checked">
    <span class="font-medium"
      >我已阅读并同意 <a href="#" class="text-blue-600 underline">用户协议</a></span
    >
  </Checkbox>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Checkbox } from '~/components/ui/checkbox'

const checked = ref(false)
</script>
```

### 受控模式

```vue
<template>
  <div>
    <Checkbox :checked="isChecked" @change="handleChange" label="受控模式" />
    <button @click="isChecked = !isChecked">切换状态</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Checkbox } from '~/components/ui/checkbox'

const isChecked = ref(false)

function handleChange(value: boolean) {
  console.log('Checkbox 状态变化:', value)
  isChecked.value = value
}
</script>
```

### 监听变化事件

```vue
<template>
  <Checkbox v-model="checked" label="监听变化" @change="handleChange" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Checkbox } from '~/components/ui/checkbox'

const checked = ref(false)

function handleChange(value: boolean) {
  console.log('新值:', value)
  // 执行其他逻辑
}
</script>
```

### 在表单中使用

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <div class="flex flex-col gap-4">
      <Checkbox v-model="form.agreeTerms" label="同意用户协议" />
      <Checkbox v-model="form.subscribeNewsletter" label="订阅邮件通知" />
      <Checkbox v-model="form.rememberMe" label="记住我" />

      <button
        type="submit"
        :disabled="!form.agreeTerms"
        class="bg-black text-white px-6 py-3 disabled:opacity-50"
      >
        提交
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { Checkbox } from '~/components/ui/checkbox'

const form = reactive({
  agreeTerms: false,
  subscribeNewsletter: false,
  rememberMe: false,
})

function handleSubmit() {
  console.log('表单提交:', form)
}
</script>
```

### 在 Checkout 页面中使用

```vue
<template>
  <div class="checkout-page">
    <!-- 使用积分 -->
    <Checkbox v-model="form.usePoint" label="使用积分抵扣" @change="handleUsePointChange" />

    <!-- 全额使用积分 -->
    <Checkbox v-if="form.usePoint" v-model="form.useFullPoint" label="全额使用积分" />

    <!-- 需要发票 -->
    <Checkbox v-model="form.needInvoice" label="需要发票" />

    <!-- 同意条款 -->
    <Checkbox v-model="agreeTerms" size="sm">
      我已阅读并同意
      <a href="#" class="text-blue-600 underline">购物条款</a> 和
      <a href="#" class="text-blue-600 underline">隐私政策</a>
    </Checkbox>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Checkbox } from '~/components/ui/checkbox'

const agreeTerms = ref(false)
const form = reactive({
  usePoint: false,
  useFullPoint: false,
  needInvoice: false,
})

function handleUsePointChange(value: boolean) {
  if (!value) {
    form.useFullPoint = false
  }
}
</script>
```

## Props

| 属性       | 类型                                    | 默认值      | 说明                 |
| ---------- | --------------------------------------- | ----------- | -------------------- |
| modelValue | `boolean`                               | `false`     | 绑定值（v-model）    |
| checked    | `boolean`                               | -           | 是否选中（受控模式） |
| disabled   | `boolean`                               | `false`     | 是否禁用             |
| size       | `'sm' \| 'md' \| 'lg'`                  | `'md'`      | 尺寸                 |
| variant    | `'default' \| 'primary' \| 'secondary'` | `'default'` | 样式变体             |
| label      | `string`                                | `''`        | 标签文本             |

## Events

| 事件名            | 参数               | 说明             |
| ----------------- | ------------------ | ---------------- |
| update:modelValue | `(value: boolean)` | v-model 更新事件 |
| change            | `(value: boolean)` | 值变化时触发     |

## Slots

| 插槽名  | 说明                                  |
| ------- | ------------------------------------- |
| default | 自定义标签内容，优先级高于 label prop |

## 样式说明

### 尺寸对照

- **sm**: 16px × 16px (w-4 h-4)
- **md**: 20px × 20px (w-5 h-5) - 默认
- **lg**: 24px × 24px (w-6 h-6)

### 变体对照

- **default**: 黑色边框 (#191a1d)，选中后黑色背景
- **primary**: 深黑边框 (#030213)，选中后深黑背景
- **secondary**: 灰色边框 (gray-300)，选中后灰色背景

### 颜色规范

- 未选中边框：`#191a1d` / `#030213` / `gray-300`
- 选中背景：`#191a1d` / `#030213` / `gray-600`
- 选中边框：与背景色相同
- 标签文字：`#4a5565`
- 禁用状态：opacity 50%
- Focus 状态：ring-2 with 20% opacity

## 与其他组件对比

### Checkbox vs FormCheckboxGroup

- **Checkbox**: 单个复选框组件，适用于独立的复选框场景
- **FormCheckboxGroup**: 多个复选框组成的组，适用于多选场景（如筛选器）

```vue
<!-- 单个复选框 -->
<Checkbox v-model="agreed" label="我同意" />

<!-- 复选框组 -->
<FormCheckboxGroup
  v-model="selected"
  :options="[
    { label: '选项 1', value: '1' },
    { label: '选项 2', value: '2' },
  ]"
/>
```

## 原生属性

组件支持所有原生 checkbox 的属性，如 `name`, `id`, `required` 等：

```vue
<Checkbox v-model="checked" name="agree" id="agree-checkbox" required label="必填项" />
```

## 组件结构

```
checkbox/
├── index.ts         # 导出文件
├── types.ts         # 类型定义
├── Checkbox.vue     # 组件主文件
├── README.md        # 文档
└── example.vue      # 使用示例
```

## 设计规范

根据项目现有 checkbox 使用情况统一设计：

- 使用圆角矩形（rounded）
- 选中时显示白色勾号图标
- 支持 focus 状态（ring）
- 禁用状态透明度 50%
- 标签文字灰色 (#4a5565)

## 无障碍访问

- ✅ 支持键盘导航（Space 切换）
- ✅ 支持 label 点击
- ✅ 支持 disabled 状态
- ✅ 支持 focus 视觉反馈
