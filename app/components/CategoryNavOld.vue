<template>
  <div class="w-[200px] bg-white">
    <ul class="py-4">
      <li v-for="category in categories" :key="category.id" class="group relative">
        <div
          class="flex items-center justify-between px-6 h-[30px] cursor-pointer hover:bg-gray-50"
        >
          <span class="text-secondary text-sm">{{ category.name }}</span>
          <img src="/icons/arrow-right.svg" alt="箭头" class="w-[6px] h-[10px] opacity-60" />
        </div>
        <!-- 子菜单 -->
        <div
          class="absolute left-full top-0 w-[200px] bg-white shadow-lg hidden group-hover:block z-10"
        >
          <ul class="py-2">
            <li v-for="subCategory in category.children" :key="subCategory.id">
              <NuxtLink
                :to="`/category/${subCategory.id}`"
                class="block px-4 py-2 text-sm text-secondary hover:bg-gray-50"
              >
                {{ subCategory.name }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Category {
  id: number
  name: string
  children?: Category[]
}

// 模拟分类数据
const categories = ref<Category[]>([
  {
    id: 1,
    name: '手机',
    children: [
      { id: 11, name: '华为手机' },
      { id: 12, name: 'iPhone' },
      { id: 13, name: '小米手机' },
    ],
  },
  {
    id: 2,
    name: '穿戴',
    children: [
      { id: 21, name: '智能手表' },
      { id: 22, name: '智能手环' },
    ],
  },
  {
    id: 3,
    name: '梵想',
    children: [
      { id: 31, name: '梵想手机' },
      { id: 32, name: '梵想配件' },
    ],
  },
  {
    id: 4,
    name: '调料',
    children: [
      { id: 41, name: '十三香' },
      { id: 42, name: '麻辣鲜' },
    ],
  },
  {
    id: 5,
    name: '电力电子',
    children: [
      { id: 51, name: '充电器' },
      { id: 52, name: '数据线' },
    ],
  },
  {
    id: 6,
    name: '耳机音响',
    children: [
      { id: 61, name: '无线耳机' },
      { id: 62, name: '有线耳机' },
    ],
  },
  {
    id: 7,
    name: '智慧屏',
    children: [
      { id: 71, name: '智能电视' },
      { id: 72, name: '智能投影' },
    ],
  },
  {
    id: 8,
    name: '智能居家',
    children: [
      { id: 81, name: '智能灯具' },
      { id: 82, name: '智能开关' },
    ],
  },
  {
    id: 9,
    name: '出行车品',
    children: [
      { id: 91, name: '车载充电器' },
      { id: 92, name: '车载支架' },
    ],
  },
  {
    id: 10,
    name: '数码配件',
    children: [
      { id: 101, name: '手机壳' },
      { id: 102, name: '贴膜' },
    ],
  },
])
</script>
