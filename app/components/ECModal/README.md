# Modal 弹窗组件

通用的弹窗组件，支持组件式和函数式两种使用方式。

## 功能特性

- ✅ 支持组件式调用和函数式调用
- ✅ 支持自定义标题、内容、按钮
- ✅ 支持确认/取消回调
- ✅ 支持插槽自定义内容
- ✅ 支持遮罩层点击关闭
- ✅ 优雅的进入/退出动画
- ✅ 符合 Figma 设计规范

## 类型定义

```typescript
interface IModalOptions {
  title?: string // 弹窗标题
  content?: string // 弹窗内容
  width?: string | number // 宽度
  showClose?: boolean // 是否显示关闭按钮
  maskClosable?: boolean // 是否可以点击遮罩关闭
  confirmButton?: IModalButton | false // 确认按钮配置
  cancelButton?: IModalButton | false // 取消按钮配置
  onConfirm?: () => void | Promise<void> // 确认回调
  onCancel?: () => void | Promise<void> // 取消回调
  onClose?: () => void // 关闭回调
}

interface IModalButton {
  text: string // 按钮文本
  type?: 'primary' | 'default' // 按钮类型
  onClick?: () => void | Promise<void> // 点击回调
  loading?: boolean // 是否加载中
}
```

## 使用方式

### 1. 组件式使用

```vue
<template>
  <div>
    <button @click="showModal = true">打开弹窗</button>

    <Modal
      v-model="showModal"
      title="退出登录"
      content="您是否确定退出？"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Modal from '~/components/ui/modal/Modal.vue'

const showModal = ref(false)

function handleConfirm() {
  console.log('确认')
  showModal.value = false
}

function handleCancel() {
  console.log('取消')
}
</script>
```

### 2. 函数式使用 - 确认对话框

```typescript
import { useModal } from '~/composables/useModal'

const { confirm } = useModal()

// 简单用法
confirm('您是否确定删除？')

// 完整配置
confirm({
  title: '退出登录',
  content: '您是否确定退出？',
  onConfirm: async () => {
    await logout()
    console.log('已退出')
  },
  onCancel: () => {
    console.log('取消退出')
  },
})
```

### 3. 函数式使用 - 警告对话框（只有确定按钮）

```typescript
import { useModal } from '~/composables/useModal'

const { alert } = useModal()

// 简单用法
alert('操作成功！')

// 完整配置
alert({
  title: '提示',
  content: '您的操作已完成',
  onConfirm: () => {
    console.log('知道了')
  },
})
```

### 4. 自定义按钮

```typescript
const { confirm } = useModal()

confirm({
  title: '删除确认',
  content: '删除后无法恢复，确定要删除吗？',
  confirmButton: {
    text: '确定删除',
    onClick: async () => {
      await deleteItem()
    },
  },
  cancelButton: {
    text: '我再想想',
  },
})
```

### 5. 使用插槽自定义内容

```vue
<template>
  <Modal v-model="showModal" title="自定义内容">
    <div class="space-y-4">
      <p>这是自定义的内容区域</p>
      <input type="text" class="border px-4 py-2" placeholder="输入内容" />
    </div>
  </Modal>
</template>
```

### 6. 控制弹窗实例

```typescript
const { confirm } = useModal()

const instance = confirm({
  title: '提示',
  content: '这是一个可控制的弹窗',
})

// 手动关闭
setTimeout(() => {
  instance.hide()
}, 2000)

// 更新配置
instance.update({
  title: '新标题',
  content: '内容已更新',
})

// 销毁弹窗
instance.destroy()
```

## Props

| 属性         | 类型               | 默认值    | 说明                    |
| ------------ | ------------------ | --------- | ----------------------- |
| modelValue   | `boolean`          | `false`   | 是否显示弹窗（v-model） |
| title        | `string`           | `'提示'`  | 弹窗标题                |
| content      | `string`           | `''`      | 弹窗内容                |
| width        | `string \| number` | `'480px'` | 弹窗宽度                |
| showClose    | `boolean`          | `true`    | 是否显示关闭按钮        |
| maskClosable | `boolean`          | `true`    | 是否可以点击遮罩关闭    |
| confirmText  | `string`           | `'确定'`  | 确认按钮文本            |
| cancelText   | `string`           | `'取消'`  | 取消按钮文本            |
| showConfirm  | `boolean`          | `true`    | 是否显示确认按钮        |
| showCancel   | `boolean`          | `true`    | 是否显示取消按钮        |
| showFooter   | `boolean`          | `true`    | 是否显示底部按钮区域    |

## Events

| 事件名            | 参数               | 说明                     |
| ----------------- | ------------------ | ------------------------ |
| update:modelValue | `(value: boolean)` | v-model 更新事件         |
| confirm           | -                  | 点击确认按钮时触发       |
| cancel            | -                  | 点击取消按钮时触发       |
| close             | -                  | 点击关闭按钮或遮罩时触发 |

## Slots

| 插槽名  | 说明         |
| ------- | ------------ |
| default | 弹窗内容区域 |

## 实例方法

| 方法名  | 参数                                | 说明     |
| ------- | ----------------------------------- | -------- |
| show    | -                                   | 显示弹窗 |
| hide    | -                                   | 隐藏弹窗 |
| update  | `(options: Partial<IModalOptions>)` | 更新配置 |
| destroy | -                                   | 销毁弹窗 |

## 实际应用示例

### 退出登录确认

```typescript
import { useModal } from '~/composables/useModal'
import { useAuth } from '~/composables/useAuth'

const { confirm } = useModal()
const { logout } = useAuth()

function handleLogout() {
  confirm({
    title: '退出登录',
    content: '您是否确定退出？',
    onConfirm: async () => {
      await logout()
      router.push('/account/login')
    },
  })
}
```

### 删除确认

```typescript
const { confirm } = useModal()

function handleDelete(id: string) {
  confirm({
    title: '删除确认',
    content: '删除后无法恢复，确定要删除吗？',
    confirmButton: {
      text: '确定删除',
      onClick: async () => {
        await deleteItem(id)
        // 刷新列表
        await fetchList()
      },
    },
  })
}
```

## 设计规范

- 宽度：默认 480px
- 内边距：32px
- 按钮间距：16px
- 标题字体：20px / Medium / #191a1d
- 内容字体：16px / Regular / #4a5565
- 按钮字体：14px / Medium
- 确认按钮：黑底白字 (#0f0f10)
- 取消按钮：白底黑边

## Figma 设计稿

- 节点：[2512-17618](https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/ECshopex-demo-PC%E7%AB%AF?node-id=2512-17618)
