# 账户页面级组件

## AccountMenu 组件

个人中心侧边栏菜单组件，用于账户相关页面的导航。

### 功能特性

- ✅ 支持菜单项高亮显示当前激活状态
- ✅ 支持 v-model 双向绑定当前菜单
- ✅ 支持路由跳转
- ✅ 支持退出登录功能
- ✅ 响应式设计，符合 Figma 设计稿

### Props

| 属性       | 类型     | 默认值      | 说明             |
| ---------- | -------- | ----------- | ---------------- |
| modelValue | `string` | `'profile'` | 当前激活的菜单项 |

### Events

| 事件名            | 参数              | 说明               |
| ----------------- | ----------------- | ------------------ |
| update:modelValue | `(value: string)` | 菜单切换时触发     |
| logout            | -                 | 点击退出登录时触发 |

### 菜单项

| 菜单键    | 显示名称 | 路由                |
| --------- | -------- | ------------------- |
| profile   | 个人中心 | `/account`          |
| orders    | 我的订单 | `/member/orders`    |
| coupons   | 优惠券   | `/member/coupons`   |
| favorites | 我的收藏 | `/member/favorites` |
| address   | 收货地址 | `/account/address`  |
| reviews   | 我的评价 | `/member/reviews`   |

### 使用示例

```vue
<template>
  <div class="flex gap-8">
    <!-- 左侧菜单 -->
    <div class="w-64 shrink-0">
      <AccountMenu v-model="activeMenu" @logout="handleLogout" />
    </div>

    <!-- 右侧内容 -->
    <div class="flex-1">
      <!-- 页面内容 -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AccountMenu from './components/AccountMenu.vue'

const activeMenu = ref('profile')

function handleLogout() {
  console.log('用户退出登录')
}
</script>
```

### 设计规范

- 宽度：固定 256px (w-64)
- 背景色：白色 (#ffffff)
- 标题字体：24px / Medium / #191a1d
- 菜单项字体：16px / Medium / #364153
- 激活背景色：#f3f4f6
- 内边距：32px (p-8)

### Figma 设计稿

- 组件节点：[2511-10661](https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/ECshopex-demo-PC%E7%AB%AF?node-id=2511-10661)
- 页面节点：[2511-10659](https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/ECshopex-demo-PC%E7%AB%AF?node-id=2511-10659)

## 使用说明

这是一个**页面级组件**，专门服务于账户相关页面。使用时需要手动导入：

```typescript
import AccountMenu from './components/AccountMenu.vue'
```

## 相关页面

- `index.vue` - 个人中心页面（积分展示）
- `address.vue` - 收货地址页面
