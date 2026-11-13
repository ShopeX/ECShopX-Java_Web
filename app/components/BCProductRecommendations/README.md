# ProductRecommendations 组件

商品推荐组件，支持"猜你喜欢"和"最近浏览"两个 Tab 切换。

## 功能特性

- ✅ Tab 切换（猜你喜欢/最近浏览）
- ✅ 横向展示最多 5 个商品
- ✅ 响应式布局
- ✅ 自动格式化价格
- ✅ 点击商品跳转到详情页

## 使用方法

```vue
<template>
  <ProductRecommendations
    :recommended-products="recommendedProducts"
    :recent-products="recentProducts"
  />
</template>

<script setup lang="ts">
import type { ProductRecommendation } from '~/components/business/product/ProductRecommendations'

const recommendedProducts = ref<ProductRecommendation[]>([
  {
    id: '1',
    name: '明基大包套耳机',
    price: 1999.0,
    image: 'https://example.com/image1.jpg',
  },
  // ... 更多商品
])

const recentProducts = ref<ProductRecommendation[]>([
  {
    id: '6',
    name: '商品名称',
    price: 999.0,
    image: 'https://example.com/image6.jpg',
  },
  // ... 更多商品
])
</script>
```

## Props

| 属性名              | 类型                      | 默认值 | 说明             |
| ------------------- | ------------------------- | ------ | ---------------- |
| recommendedProducts | `ProductRecommendation[]` | `[]`   | 推荐商品列表     |
| recentProducts      | `ProductRecommendation[]` | `[]`   | 最近浏览商品列表 |

## ProductRecommendation 类型

```typescript
interface ProductRecommendation {
  id: string // 商品 ID
  name: string // 商品名称
  price: number // 商品价格
  image: string // 商品图片 URL
}
```

## 设计规范

- 标题字体：24px，行高 48px
- 商品名称：14px，行高 20px，font-medium
- 价格：14px，行高 14px
- 商品信息区背景色：`#f6f6f6`
- 选中 Tab 文字颜色：`#191a1d`
- 未选中 Tab 文字颜色：`#4a5565`
- 选中 Tab 下划线：`#191a1d`

## 注意事项

1. 商品列表最多显示 5 个商品，超出部分会被自动截取
2. 默认显示"猜你喜欢" Tab
3. 图片使用 `loading="lazy"` 懒加载优化性能
4. 价格自动格式化为千分位，保留两位小数

## 示例场景

- 商品详情页底部推荐
- 购物车页面相关推荐
- 首页个性化推荐区域
