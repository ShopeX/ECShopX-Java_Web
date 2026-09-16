<template>
  <div
    class="flex w-full flex-col gap-[16px] border border-solid border-[#e5e7eb] p-[17px]"
    data-testid="address-card"
  >
    <!-- 顶部信息行：默认标签 + 姓名 + 手机 -->
    <div class="flex items-center">
      <div class="flex min-w-0 items-center gap-[8px]">
        <span
          v-if="isDefault"
          class="inline-flex items-center justify-center bg-[#0f0f10] px-[4px] text-[10px] font-normal leading-[16px] text-white shrink-0 whitespace-nowrap"
        >
          {{ t('ee3264ed.18c634') }}
        </span>
        <p class="truncate text-[16px] font-medium leading-[20px] text-[#191a1d] whitespace-nowrap">
          {{ address.name }}{{ address.gender ? ` ${address.gender}` : '' }}
        </p>
        <p class="min-w-0 truncate text-[16px] font-medium leading-[20px] text-[#191a1d] whitespace-nowrap">
          {{ address.phone }}
        </p>
      </div>
    </div>

    <!-- 地址信息 -->
    <div>
      <p class="text-[14px] font-normal leading-[20px] text-[#4a5565]">
        {{ address.fullAddress }}
      </p>
    </div>

    <!-- 底部操作行：默认状态 + 删除/编辑 -->
    <div class="flex items-center justify-between">
      <button
        v-if="!isDefault"
        type="button"
        class="flex items-center gap-[4px] text-[14px] font-normal leading-[20px] text-[#4a5565] hover:text-[#191a1d] transition-colors"
        @click="handleSetDefault"
      >
        <svg
          viewBox="0 0 16 16"
          class="size-[16px] shrink-0"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="8" cy="8" r="7" fill="#D1D5DB" />
          <path d="M5 8.25L7 10.25L11 6.25" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        {{ t('41c7a0f8.1af3ec') }}
      </button>
      <div v-else class="flex items-center gap-[4px] text-[14px] font-normal leading-[20px] text-[#4a5565]">
        <svg
          viewBox="0 0 16 16"
          class="size-[16px] shrink-0"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="8" cy="8" r="7" fill="#191a1d" />
          <path d="M5 8.25L7 10.25L11 6.25" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span>{{ t('a3f584d1.57e5b1') }}</span>
      </div>

      <div class="flex items-center gap-[32px]">
        <button
          type="button"
          class="flex items-center gap-[4px] text-[14px] font-normal text-[#4a5565] hover:text-[#191a1d] transition-colors"
          @click="handleDelete"
        >
          <UIcon name="i-heroicons-trash" class="size-[16px]" />
          <span>{{ t('41c7a0f8.2f4aad') }}</span>
        </button>
        <button
          type="button"
          class="flex items-center gap-[4px] text-[14px] font-normal text-[#4a5565] hover:text-[#191a1d] transition-colors"
          data-testid="address-edit-btn"
          @click="handleEdit"
        >
          <UIcon name="i-heroicons-pencil-square" class="size-[16px]" />
          <span>{{ t('ee3264ed.95b351') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Address {
  id: string | number
  name: string
  gender?: string
  phone: string
  fullAddress: string
}

interface Props {
  address: Address
  isDefault?: boolean
}

defineOptions({
  name: 'AddressCard',
})

const props = withDefaults(defineProps<Props>(), {
  isDefault: false,
})
const { t } = useI18n()

const emit = defineEmits<{
  edit: [addressId: string | number]
  delete: [addressId: string | number]
  'set-default': [addressId: string | number]
}>()

function handleEdit() {
  emit('edit', props.address.id)
}

function handleDelete() {
  emit('delete', props.address.id)
}

function handleSetDefault() {
  emit('set-default', props.address.id)
}
</script>
