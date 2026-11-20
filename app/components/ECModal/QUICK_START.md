# Modal 弹窗组件 - 快速开始

## 最简单的使用方式

### 1. 确认对话框（推荐）

```typescript
import { useModal } from '~/composables/useModal'

const { confirm } = useModal()

// 最简单的用法 - 只传文本
confirm('您确定要执行此操作吗？')

// 带标题
confirm({
  title: '删除确认',
  content: '删除后无法恢复，确定要删除吗？',
})

// 带回调
confirm({
  title: '退出登录',
  content: '您是否确定退出？',
  onConfirm: async () => {
    await logout()
    router.push('/login')
  },
})
```

### 2. 警告对话框（只有确定按钮）

```typescript
const { alert } = useModal()

// 最简单的用法
alert('操作成功！')

// 带标题
alert({
  title: '提示',
  content: '您的操作已完成',
})
```

## 常用场景示例

### 退出登录

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
function handleDelete(id: string) {
  confirm({
    title: '删除确认',
    content: '删除后无法恢复，确定要删除吗？',
    confirmButton: {
      text: '确定删除',
      onClick: async () => {
        await deleteItem(id)
        await fetchList() // 刷新列表
      },
    },
    cancelButton: {
      text: '我再想想',
    },
  })
}
```

### 表单提交确认

```typescript
function handleSubmit() {
  confirm({
    title: '提交确认',
    content: '确定要提交表单吗？提交后将无法修改。',
    onConfirm: async () => {
      await submitForm()
      alert('提交成功！')
    },
  })
}
```

## 进阶使用

### 组件式使用（需要自定义内容时）

```vue
<template>
  <div>
    <button @click="showModal = true">打开弹窗</button>

    <Modal v-model="showModal" title="自定义内容" @confirm="handleConfirm">
      <!-- 自定义内容 -->
      <div class="space-y-4">
        <input v-model="inputValue" type="text" class="border px-4 py-2" />
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Modal from '~/components/ui/modal/Modal.vue'

const showModal = ref(false)
const inputValue = ref('')

function handleConfirm() {
  console.log('输入值:', inputValue.value)
  showModal.value = false
}
</script>
```

### 控制弹窗实例

```typescript
const { confirm } = useModal()

// 获取弹窗实例
const instance = confirm({
  title: '加载中...',
  content: '请稍候',
  showCancel: false,
})

// 异步操作完成后关闭
setTimeout(() => {
  instance.hide()
}, 2000)
```

## 配置选项

```typescript
interface IModalOptions {
  title?: string // 标题，默认 '提示'
  content?: string // 内容
  width?: string | number // 宽度，默认 '480px'
  showClose?: boolean // 显示关闭按钮，默认 true
  maskClosable?: boolean // 点击遮罩关闭，默认 true
  confirmButton?: IModalButton | false // 确认按钮配置
  cancelButton?: IModalButton | false // 取消按钮配置
  onConfirm?: () => void | Promise<void> // 确认回调
  onCancel?: () => void | Promise<void> // 取消回调
  onClose?: () => void // 关闭回调
}
```

## 注意事项

1. **函数式调用推荐用于简单场景**：只需要确认/取消的对话框
2. **组件式调用推荐用于复杂场景**：需要自定义内容、表单输入等
3. **异步回调**：`onConfirm`、`onCancel` 支持异步函数，会自动处理加载状态
4. **多个弹窗**：可以同时打开多个弹窗，但建议避免这种情况

## 常见问题

### Q: 如何修改按钮文本？

```typescript
confirm({
  confirmButton: { text: '确定删除' },
  cancelButton: { text: '我再想想' },
})
```

### Q: 如何隐藏某个按钮？

```typescript
// 隐藏取消按钮（alert 的默认行为）
confirm({
  cancelButton: false,
})

// 隐藏确认按钮
confirm({
  confirmButton: false,
})
```

### Q: 如何禁止点击遮罩关闭？

```typescript
confirm({
  maskClosable: false,
})
```

### Q: 如何自定义宽度？

```typescript
confirm({
  width: '600px', // 或者 600（数字会自动转换为 px）
})
```

## 完整示例

查看 `example.vue` 文件获取完整的使用示例。
