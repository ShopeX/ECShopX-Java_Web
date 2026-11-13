<template>
  <div class="flex w-full flex-col gap-2 md:max-w-[672px]">
    <div
      class="max-h-[280px] overflow-y-auto border border-[#e5e5e5] px-2 py-2"
    >
      <UTree
        v-if="treeItems.length"
        v-model="treeValue"
        :items="treeItems"
        :get-key="categoryTreeItemKey"
        multiple
        propagate-select
        bubble-select
        :as="{ link: 'div' }"
        color="neutral"
        size="sm"
        class="w-full"
        @select="onItemSelect"
        @update:model-value="onTreeValueChange"
      >
        <template #item-leading="{ selected, indeterminate, handleSelect }">
          <UCheckbox
            :model-value="indeterminate ? 'indeterminate' : selected"
            tabindex="-1"
            @change="handleSelect"
            @click.stop
          />
        </template>
      </UTree>
      <p v-else class="px-1 py-3 text-[12px] text-[#8f99aa]">
        {{ emptyText }}
      </p>
    </div>

    <p v-if="selectedLabel" class="text-[12px] leading-4 text-[#4a5565]">
      {{ selectedPrefix }}{{ selectedLabel }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { TreeItemSelectEvent } from 'reka-ui'
import type { IMerchantCategoryNode, IMerchantMainCategorySelection } from '~/types/api/merchant'
import type { MerchantCategoryTreeItem } from '~/utils/merchantMainCategory'
import {
  categoryTreeItemKey,
  selectionFromTreeItems,
  toMerchantCategoryTreeItems,
  treeItemsFromSelection,
} from '~/utils/merchantMainCategory'

/** 点文字/行不切换勾选，仅复选框 @change → handleSelect 生效 */
function onItemSelect(e: TreeItemSelectEvent<MerchantCategoryTreeItem>) {
  if (e.detail.originalEvent.type === 'click') {
    e.preventDefault()
  }
}

const props = defineProps<{
  tree: IMerchantCategoryNode[]
  selection: IMerchantMainCategorySelection[]
  selectedLabel?: string
  emptyText?: string
  selectedPrefix?: string
}>()

const emit = defineEmits<{
  'update:selection': [value: IMerchantMainCategorySelection[]]
}>()

const treeItems = computed(() => toMerchantCategoryTreeItems(props.tree))

const treeValue = ref<MerchantCategoryTreeItem[]>([])
const syncingFromProps = ref(false)
const lastEmittedSignature = ref('')

function selectionSignature(selection: IMerchantMainCategorySelection[]) {
  return selection
    .map((item) => `${item.category_id}:${item.level}`)
    .sort()
    .join('|')
}

function syncTreeValueFromSelection() {
  const next = treeItemsFromSelection(props.selection, treeItems.value)
  const nextKeys = next
    .map((item) => categoryTreeItemKey(item))
    .sort()
    .join('|')
  const currentKeys = treeValue.value
    .map((item) => categoryTreeItemKey(item))
    .sort()
    .join('|')
  if (nextKeys === currentKeys) return

  syncingFromProps.value = true
  treeValue.value = next
  nextTick(() => {
    syncingFromProps.value = false
  })
}

function onTreeValueChange(value: MerchantCategoryTreeItem[] | MerchantCategoryTreeItem | undefined) {
  if (syncingFromProps.value) return
  const list = Array.isArray(value) ? value : value ? [value] : []
  treeValue.value = list
  const nextSelection = selectionFromTreeItems(list)
  lastEmittedSignature.value = selectionSignature(nextSelection)
  emit('update:selection', nextSelection)
}

watch(
  () => [props.tree, selectionSignature(props.selection)] as const,
  () => {
    // 避免自己 emit 后又用「仅三级」的 selection 把二级勾选冲掉
    if (selectionSignature(props.selection) === lastEmittedSignature.value) {
      const ensured = treeItemsFromSelection(props.selection, treeItems.value)
      const ensuredKeys = ensured
        .map((item) => categoryTreeItemKey(item))
        .sort()
        .join('|')
      const currentKeys = treeValue.value
        .map((item) => categoryTreeItemKey(item))
        .sort()
        .join('|')
      if (ensuredKeys === currentKeys) return
    }
    syncTreeValueFromSelection()
  },
  { immediate: true }
)
</script>
