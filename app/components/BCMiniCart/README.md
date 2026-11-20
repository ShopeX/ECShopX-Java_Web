# Cart 模块

购物车相关业务组件

## 组件列表

### CartList.vue

购物车列表容器组件

**功能**：

- 显示购物车商品列表
- 全选/取消全选
- 空状态提示
- 表头显示

**Props**：

- `items` - 购物车商品列表
- `isAllSelected` - 是否全选
- `loading` - 加载状态

**Events**：

- `toggle-all` - 全选/取消全选
- `toggle-selection` - 切换单个商品选中
- `quantity-change` - 商品数量变化
- `remove` - 删除商品
- `favorite` - 收藏商品

### CartItem.vue

购物车商品项组件（响应式设计）

**功能**：

- 显示商品信息（图片、名称、规格、款号）
- 价格显示
- 数量调整
- 删除操作
- 选中/取消选中

**Props**：

- `item` - 商品数据
- `loading` - 加载状态

**Events**：

- `toggle-selection` - 切换选中状态
- `quantity-change` - 数量变化
- `remove` - 删除

### CartFooter.vue

购物车底部操作栏组件

**功能**：

- 显示已选商品数量
- 显示总价
- 批量删除
- 结算按钮

**Props**：

- `selectedCount` - 已选商品数量
- `totalPrice` - 总价
- `loading` - 加载状态

**Events**：

- `batch-remove` - 批量删除
- `checkout` - 结算

## 使用示例

```vue
<template>
  <div>
    <CartList
      :items="cartItems"
      :is-all-selected="isAllSelected"
      :loading="loading"
      @toggle-all="handleToggleAll"
      @toggle-selection="handleToggleSelection"
      @quantity-change="handleQuantityChange"
      @remove="handleRemove"
      @favorite="handleFavorite"
    />

    <CartFooter
      :selected-count="selectedCount"
      :total-price="totalPrice"
      :loading="loading"
      @batch-remove="handleBatchRemove"
      @checkout="handleCheckout"
    />
  </div>
</template>

<script setup>
import { CartList, CartFooter } from '~/components/business/cart'
// 或使用 Nuxt 自动导入
</script>
```
