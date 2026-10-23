# BCSearchDrawer 搜索抽屉组件

## 功能描述

商品搜索抽屉组件，支持：

- 关键词搜索
- 热门搜索标签
- 历史搜索记录（localStorage 存储）
- 响应式布局（PC 左侧抽屉 / H5 全屏）

## Props

| 属性          | 类型       | 默认值     | 说明                    |
| ------------- | ---------- | ---------- | ----------------------- |
| `modelValue`  | `boolean`  | -          | 控制抽屉开关（v-model） |
| `hotKeywords` | `string[]` | 默认热门词 | 热门搜索关键词列表      |

## Events

| 事件                | 参数      | 说明                             |
| ------------------- | --------- | -------------------------------- |
| `update:modelValue` | `boolean` | 抽屉状态变化                     |
| `search`            | `string`  | 执行搜索时触发，参数为搜索关键词 |

## 使用示例

```vue
<template>
  <BCSearchDrawer v-model="isSearchOpen" :hot-keywords="hotKeywords" @search="handleSearch" />
</template>

<script setup lang="ts">
const isSearchOpen = ref(false)
const hotKeywords = ref(['手袋', '新品', '香水'])

function handleSearch(keyword: string) {
  console.log('搜索关键词:', keyword)
  // 执行搜索逻辑...
}
</script>
```

## 响应式行为

| 断点          | 抽屉方向   | 热门/历史布局  |
| ------------- | ---------- | -------------- |
| `<768px` (H5) | 从底部滑出 | 横向 flex-wrap |
| `≥768px` (PC) | 从左侧滑出 | 两列并排       |

## 相关 Composable

### `useSearchHistory`

管理搜索历史记录：

```typescript
import { useSearchHistory } from '~/composables/useSearchHistory'

const { historyKeywords, addHistory, clearHistory } = useSearchHistory()

// 添加历史记录
addHistory('手袋')

// 清空历史记录
clearHistory()
```

## i18n Keys

| Key                      | 说明           |
| ------------------------ | -------------- |
| `search.placeholder`     | 输入框占位符   |
| `search.hotKeywords`     | 热门搜索标题   |
| `search.historyKeywords` | 历史搜索标题   |
| `search.clearHistory`    | 清空历史按钮   |
| `search.noHistory`       | 无历史记录提示 |

## 设计参考

- PC 端：[Figma node-id=2710-1912](https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/ECshopex-demo-PC%E7%AB%AF?node-id=2710-1912)
- H5 端：[Figma node-id=2864-25795](https://www.figma.com/design/clySPKbja8yL0BQnFke6oi/ECshopex-demo-PC%E7%AB%AF?node-id=2864-25795)
