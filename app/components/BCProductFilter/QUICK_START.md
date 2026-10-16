# ProductFilter 快速入门指南

## 🚀 5 分钟快速开始

### 步骤 1: 导入组件

```vue
<script setup lang="ts">
import type { IProductFilterValue, IFilterGroup } from '~/components/business/product/ProductFilter'
import { ESortOption } from '~/components/business/product/ProductFilter'
</script>
```

> 💡 **提示**: Nuxt 会自动导入 `ProductFilter` 组件，无需手动 import

### 步骤 2: 定义筛选数据

```typescript
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

// 控制筛选面板显示
const showPanel = ref(false)

// 筛选组配置
const filterGroups = ref<IFilterGroup[]>([
  {
    key: 'category', // 对应 filterValue 中的字段
    label: '分类',
    multiple: false, // 单选模式
    options: [
      { id: '1', label: '男士箱包', value: '1' },
      { id: '2', label: '男士成衣', value: '2' },
    ],
  },
  {
    key: 'colors',
    label: '颜色',
    multiple: true, // 多选模式 (默认)
    options: [
      { id: '1', label: '黑色', value: 'black' },
      { id: '2', label: '白色', value: 'white' },
    ],
  },
])
```

### 步骤 3: 使用组件

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
function handleFilterChange() {
  console.log('当前筛选值:', filterValue.value)
  // 在这里重新加载商品数据
}
</script>
```

## 📋 完整示例

```vue
<template>
  <div>
    <!-- 商品筛选 -->
    <ProductFilter
      v-model="filterValue"
      :filter-groups="filterGroups"
      :show-filter-panel="showPanel"
      @update:show-filter-panel="showPanel = $event"
      @change="loadProducts"
    />

    <!-- 商品列表 -->
    <div class="container mx-auto px-32 py-8">
      <div class="grid grid-cols-4 gap-6">
        <div v-for="product in products" :key="product.id">
          <!-- 商品卡片 -->
        </div>
      </div>
    </div>
  </div>
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

// 控制筛选面板
const showPanel = ref(false)

// 商品数据
const products = ref([])

// 筛选组配置
const filterGroups = ref<IFilterGroup[]>([
  {
    key: 'category',
    label: '分类',
    multiple: false,
    options: [
      { id: '1', label: '男士箱包', value: '1' },
      { id: '2', label: '男士成衣', value: '2' },
      { id: '3', label: '男鞋', value: '3' },
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
    ],
  },
  {
    key: 'priceRange',
    label: '价格区间',
    multiple: false,
    options: [
      { id: '1', label: '¥500及以下', value: '0-500' },
      { id: '2', label: '¥500-¥1000', value: '500-1000' },
      { id: '3', label: '¥1000以上', value: '1000-' },
    ],
  },
])

// 加载商品数据
async function loadProducts() {
  // 构建查询参数
  const params = {
    category: filterValue.value.category,
    colors: filterValue.value.colors?.join(','),
    priceRange: filterValue.value.priceRange,
    sort: filterValue.value.sort,
  }

  // 调用 API
  const { data } = await useFetch('/api/products', { query: params })
  products.value = data.value?.items || []
}

// 初始化加载
onMounted(() => {
  loadProducts()
})
</script>
```

## 🎯 常见场景

### 1. 从 URL 恢复筛选状态

```typescript
const route = useRoute()

// 从 URL 初始化筛选值
const filterValue = ref<IProductFilterValue>({
  category: route.query.category as string | undefined,
  colors: route.query.colors ? (route.query.colors as string).split(',') : [],
  sort: (route.query.sort as ESortOption) || ESortOption.DEFAULT,
})

// 监听筛选变化，同步到 URL
watch(
  filterValue,
  (newValue) => {
    navigateTo({
      query: {
        category: newValue.category,
        colors: newValue.colors?.join(','),
        sort: newValue.sort,
      },
    })
  },
  { deep: true }
)
```

### 2. 防抖处理

```typescript
import { useDebounceFn } from '@vueuse/core'

const debouncedLoad = useDebounceFn(() => {
  loadProducts()
}, 300)

function handleFilterChange() {
  debouncedLoad()
}
```

### 3. 动态加载筛选选项

```typescript
const { data: filterGroups } = await useAsyncData('filters', async () => {
  const response = await $fetch('/api/products/filters')
  return response.filterGroups
})
```

## 📝 配置说明

### 筛选组配置

```typescript
interface IFilterGroup {
  key: string // 必须对应 IProductFilterValue 中的字段
  label: string // 显示标签
  options: IFilterOption[] // 选项列表
  multiple?: boolean // 是否多选，默认 true
}
```

### 筛选选项配置

```typescript
interface IFilterOption {
  id: string | number // 唯一标识
  label: string // 显示文本
  value: string | number // 实际值
}
```

### 排序选项

```typescript
enum ESortOption {
  DEFAULT = 'default', // 默认排序
  PRICE_ASC = 'price_asc', // 价格升序
  PRICE_DESC = 'price_desc', // 价格降序
  SALES = 'sales', // 销量排序
  NEW = 'new', // 上新排序
}
```

## ⚠️ 注意事项

1. **筛选组的 `key` 必须与 `IProductFilterValue` 中的字段名对应**

   ```typescript
   // ❌ 错误
   { key: 'colour', ... }  // IProductFilterValue 中没有 colour 字段

   // ✅ 正确
   { key: 'colors', ... }  // IProductFilterValue 中有 colors 字段
   ```

2. **单选和多选的数据类型不同**

   ```typescript
   // 单选: string | number | undefined
   category: '1'

   // 多选: (string | number)[]
   colors: ['black', 'white']
   ```

3. **筛选面板需要手动控制显示**

   ```vue
   <ProductFilter :show-filter-panel="showPanel" @update:show-filter-panel="showPanel = $event" />
   ```

## 🔗 相关文档

- [完整文档](./README.md) - 详细的 API 文档和高级用法
- [使用示例](./example.vue) - 完整的可运行示例
- [类型定义](./types.ts) - TypeScript 类型定义

## 💡 提示

- 使用 `@change` 事件来触发数据加载
- 建议使用防抖来避免频繁请求
- 可以将筛选参数同步到 URL，支持分享和 SEO
- 筛选组配置可以动态从 API 加载

## 🐛 常见问题

### Q: 为什么筛选面板不显示？

A: 需要将 `showFilterPanel` 设置为 `true`，并监听 `update:showFilterPanel` 事件：

```vue
<ProductFilter :show-filter-panel="showPanel" @update:show-filter-panel="showPanel = $event" />
```

### Q: 如何添加新的筛选维度？

A: 分两步：

1. 在 `IProductFilterValue` 中添加字段
2. 在 `filterGroups` 中添加对应的筛选组

```typescript
// 1. 扩展类型
interface IProductFilterValue {
  // ... 其他字段
  brand?: string | number  // 新增品牌字段
}

// 2. 添加筛选组
filterGroups.value.push({
  key: 'brand',
  label: '品牌',
  multiple: false,
  options: [...]
})
```

### Q: 如何自定义排序选项？

A: 修改组件内的 `sortOptions` 数组，或在 `ESortOption` 枚举中添加新选项。

---

**开始使用吧！** 如有问题，请查看[完整文档](./README.md)。
