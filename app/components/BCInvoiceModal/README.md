# InvoiceModal 发票组件

基于 Modal UI 组件封装的发票信息填写组件，用于结算页面等场景。

## 功能特性

- ✅ 支持个人和企业两种发票类型
- ✅ 表单验证（发票抬头、税号、内容、邮箱）
- ✅ 企业类型自动显示纳税人识别号字段
- ✅ 符合 Figma 设计规范
- ✅ 完整的错误提示

## 使用方式

### 基础用法

```vue
<template>
  <div>
    <button @click="showInvoiceModal = true">填写发票信息</button>

    <InvoiceModal v-model="showInvoiceModal" @success="handleInvoiceSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { InvoiceModal, type IInvoiceFormData } from '~/components/business/invoice'

const showInvoiceModal = ref(false)

function handleInvoiceSuccess(data: IInvoiceFormData) {
  console.log('发票信息:', data)
  // 处理发票数据
}
</script>
```

### 编辑模式（传入初始数据）

```vue
<template>
  <InvoiceModal
    v-model="showInvoiceModal"
    :initial-data="invoiceData"
    @success="handleInvoiceSuccess"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { InvoiceModal, type IInvoiceFormData } from '~/components/business/invoice'

const showInvoiceModal = ref(false)
const invoiceData = ref<IInvoiceFormData>({
  type: 'enterprise',
  title: '示例公司',
  taxNumber: '91110000MA01234567',
  content: 'goods',
  email: 'example@example.com',
})

function handleInvoiceSuccess(data: IInvoiceFormData) {
  invoiceData.value = data
}
</script>
```

## Props

| 属性名      | 类型               | 默认值      | 说明                 |
| ----------- | ------------------ | ----------- | -------------------- |
| modelValue  | `boolean`          | `false`     | 是否显示弹窗         |
| initialData | `IInvoiceFormData` | `undefined` | 初始数据（编辑模式） |

## Events

| 事件名            | 参数                       | 说明             |
| ----------------- | -------------------------- | ---------------- |
| update:modelValue | `(value: boolean)`         | 弹窗显示状态变化 |
| success           | `(data: IInvoiceFormData)` | 保存成功时触发   |
| close             | -                          | 关闭弹窗时触发   |

## 类型定义

```typescript
interface IInvoiceFormData {
  /** 发票类型：individual-个人，enterprise-企业 */
  type: 'individual' | 'enterprise'
  /** 发票抬头（个人姓名或企业名称） */
  title: string
  /** 纳税人识别号（企业必填） */
  taxNumber: string
  /** 发票内容 */
  content: string
  /** 接收邮箱 */
  email: string
}
```

## 表单验证规则

- **发票抬头**：必填，不能为空
- **纳税人识别号**：企业类型必填，需符合18位统一社会信用代码格式
- **发票内容**：必填，需从选项中选择
- **接收邮箱**：必填，需符合邮箱格式

## 发票内容选项

- `goods` - 商品明细
- `service` - 服务费
- `goods_service` - 商品及服务
- `other` - 其他
