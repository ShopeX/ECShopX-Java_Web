# MiniCart 迷你购物车组件

迷你购物车侧边栏组件，用于快速查看和管理购物车商品。

## 功能特性

- ✅ 从右往左弹出的侧边栏
- ✅ 显示购物车商品列表
- ✅ 商品选中/取消选中
- ✅ 全选/取消全选
- ✅ 数量调整
- ✅ 显示优惠和总计
- ✅ 前往结算
- ✅ 查看购物袋（跳转到购物车页面）
- ✅ 复用购物车页面的业务逻辑
- ✅ 响应式设计

## 使用示例

### 基础使用

```vue
<template>
  <div>
    <!-- 触发按钮 -->
    <button @click="showMiniCart = true">打开购物车</button>

    <!-- Mini 购物车（使用侧边栏容器） -->
    <USlideover v-model="showMiniCart" side="right">
      <MiniCart v-model="showMiniCart" @close="showMiniCart = false" />
    </USlideover>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { MiniCart } from '~/components/business/cart'

const showMiniCart = ref(false)
</script>
```

### 在布局中使用

参考 `app/layouts/default.vue` 的实现：

```vue
<template>
  <div>
    <!-- 头部导航栏 -->
    <HeaderBar @open-mini-cart="handleOpenMiniCart" />

    <!-- Mini 购物车侧边栏 -->
    <USlideover v-model:open="showMiniCart" side="right">
      <template #content>
        <MiniCart v-model="showMiniCart" @close="showMiniCart = false" />
      </template>
    </USlideover>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { MiniCart } from '~/components/business/cart'

const showMiniCart = ref(false)

const handleOpenMiniCart = () => {
  showMiniCart.value = true
}
</script>
```

## Props

| 属性       | 类型      | 默认值  | 说明                         |
| ---------- | --------- | ------- | ---------------------------- |
| modelValue | `boolean` | `false` | 是否显示组件（用于 v-model） |

## Events

| 事件名            | 参数               | 说明           |
| ----------------- | ------------------ | -------------- |
| update:modelValue | `(value: boolean)` | 更新显示状态   |
| close             | -                  | 关闭组件时触发 |

## 组件结构

```
cart/
├── index.ts           # 导出文件
├── MiniCart.md        # 文档
├── MiniCart.vue       # Mini 购物车主组件
├── MiniCartItem.vue   # Mini 购物车商品项组件
├── CartItem.vue       # 购物车商品项组件（用于购物车页面）
└── OrderSummary.vue   # 订单汇总组件（用于购物车页面）
```

## 设计规范

### 尺寸

- 宽度：560px（由 USlideover 控制）
- 内边距：32px
- 商品列表最大高度：calc(100vh - 400px)

### 颜色

- 背景色：`#ffffff`
- 主文字：`#191a1d`
- 次要文字：`#4a5565`
- 优惠价：`#d0112f`
- 主题色：`#0f0f10`
- 边框：`#e5e7eb`

### 字体

- 标题：Noto Sans SC Medium 20px
- 商品名称：Noto Sans SC Medium 16px
- 正文：Noto Sans SC Regular 14px
- 价格：Inter Medium 16px

## 业务逻辑复用

MiniCart 组件复用了 `useCart` composable 中的业务逻辑：

- `loadCart()` - 加载购物车数据
- `toggleItemSelection()` - 切换商品选中状态
- `toggleAllSelection()` - 全选/取消全选
- `updateQuantity()` - 更新商品数量
- `cartUI` - 购物车 UI 数据（包括商品列表、总计、优惠等）

这确保了 MiniCart 和购物车页面的行为一致性。

## 交互说明

1. **打开方式**：点击 HeaderBar 中的购物车图标，从右往左滑出
2. **关闭方式**：
   - 点击右上角的关闭按钮
   - 点击遮罩层
   - 点击"查看购物袋"按钮（跳转到购物车页面）
   - 点击"前往结算"按钮（跳转到结算页面）
3. **商品操作**：
   - 点击商品图片左上角的复选框可选中/取消选中商品
   - 使用 +/- 按钮调整商品数量
4. **全选操作**：点击底部的"全选"复选框可全选/取消全选所有商品
5. **结算操作**：
   - 点击"前往结算"按钮跳转到结算页面（需要选中商品）
   - 点击"查看购物袋"按钮跳转到购物车页面

## 状态管理

- **加载状态**：首次打开时显示 Loading 组件
- **空状态**：购物车为空时显示空状态提示
- **数据状态**：实时同步购物车数据，包括商品数量、价格、优惠等

## 注意事项

1. 组件需要配合 `USlideover` 组件使用，用于实现侧边栏效果
2. 组件依赖 `useCart` composable，确保已正确配置购物车相关的 API
3. 组件会在首次打开时自动加载购物车数据
4. 所有购物车操作都会实时同步到服务器
5. 组件使用了 Figma 设计中的样式和布局，保持与设计稿的一致性

## 相关组件

- `CategoryNav` - 分类导航组件（从左往左弹出）
- `CartItem` - 购物车商品项组件（用于购物车页面）
- `OrderSummary` - 订单汇总组件（用于购物车页面）
- `HeaderBar` - 头部导航栏组件（触发 MiniCart）

## 参考设计

Figma 设计稿：https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/ECshopex-demo-PC端?node-id=1801-532
