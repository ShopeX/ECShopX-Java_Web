# CategoryNav 导航分类组件

导航分类侧边栏组件，用于展示网站的主要分类导航。

## 功能特性

- ✅ 分类列表展示
- ✅ 搜索功能
- ✅ 关闭按钮
- ✅ 客户服务信息
- ✅ 配送地区选择
- ✅ 响应式设计

## 使用示例

### 基础使用

```vue
<template>
  <div>
    <!-- 触发按钮 -->
    <button @click="showCategoryNav = true">打开分类导航</button>

    <!-- 分类导航（使用侧边栏容器） -->
    <USlideover v-model="showCategoryNav" side="left">
      <CategoryNav
        v-model="showCategoryNav"
        @close="showCategoryNav = false"
        @search="handleSearch"
        @changeRegion="handleChangeRegion"
      />
    </USlideover>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CategoryNav } from '~/components/business/CategoryNav'

const showCategoryNav = ref(false)

function handleSearch(keyword: string) {
  console.log('搜索关键词:', keyword)
}

function handleChangeRegion() {
  console.log('更改配送地区')
}
</script>
```

### 自定义分类数据

组件内部使用默认的分类数据，如需自定义，可以通过修改组件内的 `categories` 数据。

## Props

| 属性       | 类型      | 默认值  | 说明                         |
| ---------- | --------- | ------- | ---------------------------- |
| modelValue | `boolean` | `false` | 是否显示组件（用于 v-model） |

## Events

| 事件名            | 参数                | 说明               |
| ----------------- | ------------------- | ------------------ |
| update:modelValue | `(value: boolean)`  | 更新显示状态       |
| close             | -                   | 关闭组件时触发     |
| search            | `(keyword: string)` | 搜索时触发         |
| changeRegion      | -                   | 点击配送地区时触发 |

## 组件结构

```
CategoryNav/
├── index.ts          # 导出文件
├── README.md         # 文档
└── CategoryNav.vue   # 组件主文件
```

## 设计规范

### 尺寸

- 宽度：496px（建议放在侧边栏容器中）
- 内容区域高度：810px
- 内边距：32px

### 颜色

- 背景色：`#ffffff`
- 分类文字：`#191a1d`
- 搜索占位符：`#99a1af`
- 边框：`#e5e7eb`

### 字体

- 分类标题：16px / Medium
- 搜索框：14px / Regular
- 底部信息：14px / Regular

### 间距

- 分类项间距：32px
- 底部信息间距：16px

## 分类数据结构

```typescript
interface Category {
  id: string | number
  name: string
  link: string
}
```

## 默认分类列表

- 全新系列 (`/collections/new`)
- 手袋 (`/collections/bags`)
- 女士 (`/collections/women`)
- 男士 (`/collections/men`)
- 童装 (`/collections/kids`)
- 旅行 (`/collections/travel`)
- 珠宝与腕表 (`/collections/jewelry-watches`)
- 香水与彩妆 (`/collections/fragrance-makeup`)
- 家居生活 (`/collections/home-living`)

## 注意事项

1. 建议配合 `USlideover` 或其他侧边栏组件使用
2. 组件使用 `UIcon`，需要确保 Nuxt UI 已正确配置
3. 搜索功能需要在父组件中实现具体逻辑
4. 配送地区选择需要在父组件中实现弹窗或跳转
5. 分类链接需要根据实际路由调整

## 样式特性

- 自定义滚动条样式
- 悬浮效果（70% 透明度）
- 阴影效果
- 过渡动画

## 扩展建议

1. **多级分类**
   - 支持二级、三级分类展开
   - 添加展开/收起动画

2. **搜索增强**
   - 搜索历史记录
   - 热门搜索推荐
   - 搜索结果预览

3. **个性化**
   - 根据用户偏好排序分类
   - 显示最近浏览的分类
   - 收藏夹功能

4. **多语言支持**
   - 国际化配置
   - 动态切换语言
