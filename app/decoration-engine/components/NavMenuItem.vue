<script setup lang="ts">
import type { WebMenuItem } from './webMenuTypes'
import { isExternalWebMenuLink, resolveWebMenuItemLink } from '~/composables/useWebMenu'

const props = defineProps<{ item: WebMenuItem }>()

/** 站内相对路径（/xxx）用 NuxtLink；http(s) 外链用 <a target="_blank"> */
function isExternal(item: WebMenuItem) {
  return item.link_type === 'url' && isExternalWebMenuLink(resolveWebMenuItemLink(item))
}
</script>

<template>
  <a
    v-if="isExternal(item)"
    :href="resolveWebMenuItemLink(item)"
    target="_blank"
    rel="noopener noreferrer"
    class="text-inherit hover:opacity-80"
    >{{ item.name }}</a
  >
  <NuxtLink
    v-else-if="item.link_type !== 'none'"
    :to="resolveWebMenuItemLink(item)"
    class="text-inherit hover:opacity-80"
  >
    {{ item.name }}
  </NuxtLink>
  <span v-else class="cursor-default">{{ item.name }}</span>
</template>
