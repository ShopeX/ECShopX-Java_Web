# ProductFilter 商品筛选组件

## 概述

`ProductFilter` 是一个全功能商品筛选组件，提供排序和多维度筛选功能。该组件采用网格布局展示筛选选项，适合需要展示多个筛选维度的场景。

## 功能特性

### 核心功能

1. **排序功能**
   - 支持多种排序方式（默认、价格、销量、上新等）
   - 下拉菜单选择排序方式
   - 实时响应排序变化

2. **筛选面板**
   - 多列网格布局展示筛选选项
   - 支持单选和多选模式
   - "全部"选项快速清除筛选
   - 复选框样式的选项选择

3. **动态配置**
   - 筛选维度完全可配置
   - 支持自定义筛选组和选项
   - 灵活的单选/多选控制

## 使用方法

### 基本用法

```vue
<template>
  <ProductFilter
    v-model="filterValue"
    :filter-groups="filterGroups"
    :show-filter-panel="showPanel"
    @update:show-filter-panel="showPanel = $event"
    @change="handleFilterChange"
  />
</template>

<script setup lang="ts">
import type { IProductFilterValue, IFilterGroup } from '~/components/business/product/ProductFilter'
import { ESortOption } from '~/components/business/product/ProductFilter'

// 筛选值
const filterValue = ref<IProductFilterValue>({
  category: undefined,
  series: [],
  colors: [],
  materials: [],
  sizes: [],
  priceRange: undefined,
  sort: ESortOption.DEFAULT,
})

// 是否显示筛选面板
const showPanel = ref(false)

// 筛选组配置
const filterGroups = ref<IFilterGroup[]>([
  {
    key: 'category',
    label: '分类',
    multiple: false, // 单选
    options: [
      { id: '1', label: '男士箱包', value: '1' },
      { id: '2', label: '男士成衣', value: '2' },
      { id: '3', label: '男鞋', value: '3' },
      { id: '4', label: '钱包与小皮件', value: '4' },
      { id: '5', label: '旅行箱包', value: '5' },
      { id: '6', label: '礼品', value: '6' },
      { id: '7', label: '银饰珠宝', value: '7' },
    ],
  },
  {
    key: 'series',
    label: '系列',
    multiple: true, // 多选
    options: [
      { id: '1', label: '经典系列', value: '1' },
      { id: '2', label: '时尚系列', value: '2' },
      { id: '3', label: '运动系列', value: '3' },
    ],
  },
  {
    key: 'colors',
    label: '颜色',
    multiple: true,
    options: [
      { id: '1', label: '黑色', value: 'black' },
      { id: '2', label: '白色', value: 'white' },
      { id: '3', label: '灰色', value: 'gray' },
      { id: '4', label: '棕色', value: 'brown' },
    ],
  },
  {
    key: 'materials',
    label: '材质',
    multiple: true,
    options: [
      { id: '1', label: '皮革', value: 'leather' },
      { id: '2', label: '帆布', value: 'canvas' },
      { id: '3', label: '尼龙', value: 'nylon' },
    ],
  },
  {
    key: 'sizes',
    label: '尺寸',
    multiple: true,
    options: [
      { id: '1', label: '小号', value: 'S' },
      { id: '2', label: '中号', value: 'M' },
      { id: '3', label: '大号', value: 'L' },
    ],
  },
  {
    key: 'priceRange',
    label: '价格区间',
    multiple: false, // 单选
    options: [
      { id: '1', label: '¥500及以下', value: '0-500' },
      { id: '2', label: '¥500-¥1000', value: '500-1000' },
      { id: '3', label: '¥1000-¥3000', value: '1000-3000' },
      { id: '4', label: '¥3000-¥5000', value: '3000-5000' },
      { id: '5', label: '¥5000-¥10000', value: '5000-10000' },
      { id: '6', label: '¥10000以上', value: '10000-' },
    ],
  },
])

// 处理筛选变化
function handleFilterChange() {
  console.log('筛选值变化:', filterValue.value)
  // 重新加载数据
  loadProducts()
}
</script>
```

## Props

| 属性            | 类型                | 必填 | 默认值 | 说明             |
| --------------- | ------------------- | ---- | ------ | ---------------- |
| modelValue      | IProductFilterValue | 是   | -      | 筛选值对象       |
| filterGroups    | IFilterGroup[]      | 是   | -      | 筛选组配置列表   |
| showFilterPanel | boolean             | 否   | false  | 是否显示筛选面板 |

### 类型定义

#### IProductFilterValue

```typescript
interface IProductFilterValue {
  /** 分类 - 单选 */
  category?: string | number
  /** 系列 - 多选 */
  series?: (string | number)[]
  /** 颜色 - 多选 */
  colors?: (string | number)[]
  /** 材质 - 多选 */
  materials?: (string | number)[]
  /** 尺寸 - 多选 */
  sizes?: (string | number)[]
  /** 价格区间 - 单选 */
  priceRange?: string | number
  /** 排序方式 */
  sort?: ESortOption
}
```

#### IFilterGroup

```typescript
interface IFilterGroup {
  key: string // 筛选组键名，对应 IProductFilterValue 中的属性
  label: string // 筛选组标签
  options: IFilterOption[] // 筛选选项列表
  multiple?: boolean // 是否支持多选，默认为 true
}
```

#### IFilterOption

```typescript
interface IFilterOption {
  id: string | number // 选项 ID
  label: string // 选项标签
  value: string | number // 选项值
}
```

#### ESortOption

```typescript
enum ESortOption {
  DEFAULT = 'default', // 默认排序
  PRICE_ASC = 'price_asc', // 价格升序
  PRICE_DESC = 'price_desc', // 价格降序
  SALES = 'sales', // 销量排序
  NEW = 'new', // 上新排序
}
```

## Events

| 事件名                 | 参数                | 说明                                   |
| ---------------------- | ------------------- | -------------------------------------- |
| update:modelValue      | IProductFilterValue | 筛选值更新时触发                       |
| update:showFilterPanel | boolean             | 筛选面板显示状态变化时触发             |
| change                 | -                   | 筛选条件变化时触发（用于重新加载数据） |

## 样式说明

### 设计规范

- **字体**：使用 Noto Sans SC 字体
- **颜色**：
  - 主文本：`#191a1d`
  - 次要文本：`#99a1af`
  - 选中状态：黑色背景，白色复选框
  - 未选中状态：白色背景，黑色边框
- **间距**：
  - 外边距：`px-32 py-16`（128px 左右，64px 上下）
  - 内部间距：`gap-8`（32px）
  - 选项间距：`gap-4`（16px）
- **交互**：
  - 悬停效果
  - 点击反馈
  - 平滑过渡

### Tailwind CSS 类名

组件完全使用 Tailwind CSS 进行样式设计，遵循项目规范，不包含自定义 CSS。

## 高级用法

### 动态加载筛选选项

```vue
<script setup lang="ts">
import { useAsyncData } from '#app'

// 从 API 加载筛选选项
const { data: filterGroups } = await useAsyncData('filter-groups', async () => {
  const response = await $fetch('/api/products/filters')
  return response.filterGroups
})
</script>
```

### 与 URL 查询参数同步

```vue
<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 从 URL 初始化筛选值
const filterValue = ref<IProductFilterValue>({
  category: route.query.category as string | undefined,
  series: route.query.series ? (route.query.series as string).split(',') : [],
  colors: route.query.colors ? (route.query.colors as string).split(',') : [],
  // ... 其他属性
  sort: (route.query.sort as ESortOption) || ESortOption.DEFAULT,
})

// 监听筛选值变化，同步到 URL
watch(
  filterValue,
  (newValue) => {
    router.push({
      query: {
        ...route.query,
        category: newValue.category || undefined,
        series: newValue.series?.join(',') || undefined,
        colors: newValue.colors?.join(',') || undefined,
        // ... 其他属性
        sort: newValue.sort,
      },
    })
  },
  { deep: true }
)
</script>
```

### 防抖处理

```vue
<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

// 防抖加载数据
const debouncedLoadProducts = useDebounceFn(() => {
  loadProducts()
}, 300)

function handleFilterChange() {
  debouncedLoadProducts()
}
</script>
```

## 注意事项

1. **性能优化**：
   - 使用 `v-if` 而不是 `v-show` 控制筛选面板显示
   - 大量选项时考虑虚拟滚动
   - 防抖处理筛选变化事件

2. **无障碍性**：
   - 使用语义化的 HTML 标签
   - 添加适当的 ARIA 属性
   - 支持键盘导航

3. **响应式设计**：
   - 当前组件适合桌面端（PC）
   - 移动端需要调整布局和间距
   - 考虑使用抽屉式筛选面板

4. **SSR 支持**：
   - 确保筛选值可以从 URL 恢复
   - 避免在服务端执行浏览器 API
   - 使用 `onMounted` 进行客户端初始化

## 示例页面

参考 `app/pages/products/index.vue` 或 `app/pages/collections/[id].vue` 查看完整的使用示例。

## 相关组件

- `ItemFilter`: 另一种筛选组件布局
- `SpFilter`: 简化版筛选组件
- `FilterBrandSection`: 品牌筛选子组件
- `FilterPriceRange`: 价格区间筛选子组件
