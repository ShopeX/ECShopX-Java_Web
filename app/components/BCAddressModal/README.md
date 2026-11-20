# AddressModal 地址表单组件

地址添加/编辑弹窗组件，基于 Modal UI 组件封装，用于用户添加或编辑收货地址。

## 功能特性

- ✅ 基于 Modal UI 组件封装
- ✅ 支持添加和编辑两种模式
- ✅ 表单验证（姓名、手机号码必填）
- ✅ 省市区三级联动选择
- ✅ 手机区号选择
- ✅ 设置默认地址
- ✅ 响应式设计
- ✅ 加载状态

## 使用示例

### 基础使用（添加地址）

```vue
<template>
  <div>
    <!-- 触发按钮 -->
    <button @click="showAddressModal = true">添加地址</button>

    <!-- 地址弹窗 -->
    <AddressModal
      v-model="showAddressModal"
      @success="handleAddressSuccess"
      @close="showAddressModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { AddressModal, type IAddressFormData } from '~/components/business/address'

const showAddressModal = ref(false)

function handleAddressSuccess(data: IAddressFormData) {
  console.log('地址保存成功:', data)
  showAddressModal.value = false
  // 刷新地址列表
}
</script>
```

### 编辑地址

```vue
<template>
  <div>
    <!-- 触发按钮 -->
    <button @click="handleEditAddress">编辑地址</button>

    <!-- 地址弹窗 -->
    <AddressModal
      v-model="showAddressModal"
      :address-id="currentAddressId"
      :initial-data="currentAddress"
      @success="handleAddressSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { AddressModal, type IAddressFormData } from '~/components/business/address'

const showAddressModal = ref(false)
const currentAddressId = ref<string>()
const currentAddress = ref<IAddressFormData>()

function handleEditAddress() {
  currentAddressId.value = '123'
  currentAddress.value = {
    name: '张三',
    phone: '13800138000',
    countryCode: '+86',
    province: '110000',
    city: '110100',
    district: '110105',
    detail: '朝阳区某街道某号',
    isDefault: true,
  }
  showAddressModal.value = true
}

function handleAddressSuccess(data: IAddressFormData) {
  console.log('地址更新成功:', data)
  showAddressModal.value = false
}
</script>
```

## Props

| 属性        | 类型               | 默认值  | 说明                         |
| ----------- | ------------------ | ------- | ---------------------------- |
| modelValue  | `boolean`          | `false` | 是否显示弹窗（用于 v-model） |
| addressId   | `string`           | -       | 地址 ID（编辑模式时传入）    |
| initialData | `IAddressFormData` | -       | 初始数据（编辑模式时传入）   |

## Events

| 事件名            | 参数                       | 说明           |
| ----------------- | -------------------------- | -------------- |
| update:modelValue | `(value: boolean)`         | 更新显示状态   |
| success           | `(data: IAddressFormData)` | 保存成功时触发 |
| close             | -                          | 关闭弹窗时触发 |

## 类型定义

```typescript
interface IAddressFormData {
  name: string // 收货人姓名
  phone: string // 手机号码
  countryCode: string // 区号
  province: string // 省份代码
  city: string // 城市代码
  district: string // 区县代码
  detail: string // 详细地址
  isDefault: boolean // 是否默认地址
}
```

## 表单验证规则

- **收货人姓名**：必填
- **手机号码**：必填，格式验证（11位手机号）
- **省市区**：必选
- **详细地址**：必填

## 省市区数据

当前使用简化的省市区数据（`regionData.ts`），包含：

- 北京市
- 上海市
- 广东省（广州、深圳）
- 浙江省（杭州、宁波）
- 江苏省（南京、苏州）

**生产环境建议**：

1. 从后端 API 动态获取完整的省市区数据
2. 或使用完整的中国省市区 JSON 数据库

## 与 Checkout 页面集成

在结算页面中使用：

```vue
<template>
  <div class="checkout-page">
    <!-- 地址选择区域 -->
    <button @click="showAddressModal = true">+ 添加新地址</button>

    <!-- 地址弹窗 -->
    <AddressModal v-model="showAddressModal" @success="handleAddressAdded" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { AddressModal, type IAddressFormData } from '~/components/business/address'
import { useCheckout } from '~/composables/useCheckout'

const showAddressModal = ref(false)
const { loadAddresses } = useCheckout()

async function handleAddressAdded(data: IAddressFormData) {
  console.log('新地址已添加:', data)
  showAddressModal.value = false
  // 刷新地址列表
  await loadAddresses()
}
</script>
```

## 组件结构

```
address/
├── index.ts          # 导出文件
├── README.md         # 文档
├── AddressModal.vue  # 地址表单弹窗组件
└── regionData.ts     # 省市区数据
```

## 设计规范

### 尺寸

- 弹窗宽度：598px
- 输入框高度：40px
- 文本域高度：80px（3行）

### 颜色

- 背景色：`#ffffff`
- 输入框背景：`#f3f4f6`
- 主要文字：`#191a1d`
- 次要文字：`#4a5565`
- 错误提示：`#d0112f`
- 按钮背景：`#191a1d`

### 字体

- 标签：12px / 16px line-height
- 输入框：14px / 20px line-height
- 按钮：14px / 20px line-height / medium weight

## TODO

- [ ] 集成后端 API（创建、更新地址）
- [ ] 完善省市区数据（使用完整数据或 API）
- [ ] 添加更多表单验证规则
- [ ] 支持国际地址格式
- [ ] 添加地址智能填充功能
