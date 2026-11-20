<script setup lang="ts">
import { computed } from 'vue'
import type { WebMenuPayload } from './webMenuTypes'

const props = defineProps<{
  menuId: string | number
}>()

const { data: menu, status, error } = await useWebMenu(props.menuId)

const topItems = computed(() => {
  const m = menu.value as WebMenuPayload | null | undefined
  return m?.items ?? []
})
</script>

<template>
  <nav
    v-if="status === 'success' && menu && !error"
    class="nav-menu-root border-b border-gray-100 bg-white"
  >
    <ul class="nav-menu flex flex-wrap items-center gap-1 px-4 py-2 text-sm text-gray-800">
      <li v-for="item in topItems" :key="item.id" class="nav-item group relative">
        <NavMenuItem :item="item" />

        <ul
          v-if="item.children && item.children.length"
          class="nav-submenu invisible absolute left-0 top-full z-50 min-w-[160px] rounded border border-gray-100 bg-white py-1 shadow-md opacity-0 transition group-hover:visible group-hover:opacity-100"
        >
          <li v-for="child in item.children" :key="child.id" class="px-3 py-1.5 hover:bg-gray-50">
            <NavMenuItem :item="child" />
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>
