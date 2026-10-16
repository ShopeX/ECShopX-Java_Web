# ItemFilter 商品筛选组件

## 概述

`ItemFilter` 是一个综合性的商品筛选组件，提供分类、品牌、排序、价格区间等多维度筛选功能。

## 功能特性

### 主筛选区域

- **分类筛选**：横向布局，支持单选，点击已选分类可取消选择
- **品牌筛选**：横向布局，支持多选，带"更多"弹窗，显示选中状态（✓）

### 次筛选区域

- **排序选项**：默认排序、销量、价格等
- **价格区间**：支持自定义价格范围筛选
- **品牌下拉**：备用的品牌下拉选择器

## 使用方法

### 基本用法

```vue
<template>
  <ItemFilter
    v-model="filterParams"
    :categories="categories"
    :brands="brands"
    @change="handleFilterChange"
  />
</template>

<script setup lang="ts">
import type { ICategory } from '~/components/business/product/ItemFilter/ItemFilter.vue'
import type { IBrand } from '~/types/api/item'

// 定义筛选参数
const filterParams = ref({
  categoryId: undefined as string | number | undefined,
  brandId: '',
  sort: 'default',
  startPrice: undefined as number | undefined,
  endPrice: undefined as number | undefined,
})

// 分类列表
const categories = ref<ICategory[]>([
  { id: '1', name: '笔记本' },
  { id: '2', name: '游戏本' },
  { id: '3', name: '工作站' },
  // ...
])

// 品牌列表
const brands = ref<IBrand[]>([])

// 处理筛选变化
function handleFilterChange() {
  // 重新加载数据
  refresh()
}
</script>
```

## Props

| 属性       | 类型         | 必填 | 默认值 | 说明         |
| ---------- | ------------ | ---- | ------ | ------------ |
| modelValue | IFilterValue | 是   | -      | 筛选参数对象 |
| categories | ICategory[]  | 否   | []     | 分类列表     |
| brands     | IBrand[]     | 是   | -      | 品牌列表     |

### IFilterValue 接口

```typescript
interface IFilterValue {
  categoryId?: string | number
  brandId: string | number | (string | number)[]
  sort: string
  startPrice?: number
  endPrice?: number
}
```

### ICategory 接口

```typescript
interface ICategory {
  id: string | number
  name: string
}
```

## Events

| 事件名            | 参数         | 说明                                   |
| ----------------- | ------------ | -------------------------------------- |
| update:modelValue | IFilterValue | 筛选参数更新时触发                     |
| change            | -            | 筛选条件变化时触发（需要重新加载数据） |

## 子组件

### FilterCategorySection

- 分类筛选组件（横向布局）
- 支持单选
- 选中状态高亮显示

### FilterBrandSection

- 品牌筛选组件（横向布局）
- 支持多选
- 默认显示前 8 个品牌
- 提供"更多"弹窗显示所有品牌
- 选中品牌带 ✓ 标记

### FilterSortSection

- 排序选项组件
- 支持默认、销量、价格等排序方式

### FilterPriceRange

- 价格区间筛选组件
- 支持自定义起始和结束价格

### FilterBrandSelect

- 品牌下拉选择器（备用）
- 弹窗式多选

## 样式说明

- 使用 Tailwind CSS 进行样式设计
- 支持响应式布局
- 主筛选区域和次筛选区域用边框分隔
- 选中状态使用红色主题色（bg-red-50, text-red-600）
- 鼠标悬停时显示灰色背景（hover:bg-gray-50）

## 示例页面

参考 `app/pages/collections/[id].vue` 查看完整的使用示例。

## 注意事项

1. **URL 同步**：建议将筛选参数同步到 URL 查询参数，便于分享和 SEO
2. **防抖处理**：筛选条件变化时建议使用防抖（300ms）避免频繁请求
3. **SSR 支持**：确保筛选参数可以从 URL 恢复，支持服务端渲染
4. **动态标题**：建议根据筛选条件动态更新页面标题
5. **品牌数量**：`FilterBrandSection` 默认显示前 8 个品牌，可通过 `maxDisplay` prop 调整
