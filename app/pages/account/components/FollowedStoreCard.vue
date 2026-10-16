<template>
  <div class="w-full border border-[#e5e7eb] bg-white" data-testid="follow-store-card">
    <div class="hidden w-full items-stretch lg:flex">
      <div class="flex w-[284px] shrink-0 flex-col items-center border-r border-[#e5e7eb] px-4">
        <div class="flex w-full flex-col items-center gap-6 px-4 py-6">
          <div class="flex flex-col items-center gap-4">
            <div
              class="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-[#e5e7eb] bg-white"
            >
              <img
                v-if="store.logo"
                :src="store.logo"
                :alt="store.storeName"
                class="h-full w-full object-cover"
              />
              <div v-else class="h-6 w-6 rounded-full bg-[#f3f4f6]" />
            </div>
            <div class="flex flex-col items-center gap-2 text-center">
              <h3 class="text-[14px] font-medium leading-5 text-[#191a1d]">
                {{ store.storeName }}
              </h3>
              <p class="text-[12px] leading-4 text-[#99a1af]">
                {{ store.slogan }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <button
              type="button"
              class="flex items-center justify-center gap-1 border border-[#e5e7eb] px-[17px] py-[9px] text-[#191a1d]"
              data-testid="follow-store-enter-button"
              @click="handleEnterStore"
            >
              <UIcon name="i-heroicons-building-storefront" class="h-4 w-4" />
              <span class="text-[12px] font-medium leading-4">{{ t('38b40b9e.8f822c') }}</span>
            </button>
            <button
              type="button"
              class="flex items-center justify-center gap-1 border border-[#e5e7eb] px-[17px] py-[9px] text-[#191a1d]"
              data-testid="follow-store-contact-button"
              @click="emit('contact', store)"
            >
              <UIcon name="i-heroicons-phone" class="h-4 w-4" />
              <span class="text-[12px] font-medium leading-4">{{ t('38b40b9e.b66060') }}</span>
            </button>
          </div>
        </div>
      </div>

      <div class="flex min-w-0 flex-[1_0_0] items-center justify-between gap-4 px-4">
        <button
          v-for="item in store.items"
          :key="item.id"
          type="button"
          class="flex min-w-0 flex-col items-center overflow-hidden"
          data-testid="follow-store-item"
          @click="handleOpenItem(item.itemId)"
        >
          <div class="relative h-[120px] w-[120px] overflow-hidden bg-[#f6f6f6]">
            <img
              v-if="item.image"
              :src="item.image"
              :alt="item.title"
              class="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div class="flex w-full flex-col items-center gap-2 bg-white p-3 text-center">
            <p class="line-clamp-2 text-[12px] leading-4 text-[#191a1d]">{{ item.title }}</p>
            <p class="text-[14px] leading-[14px] text-[#191a1d]">{{ item.priceText }}</p>
          </div>
        </button>
      </div>
    </div>

    <div class="flex flex-col gap-4 p-4 lg:hidden">
      <div class="flex items-start gap-3">
        <div
          class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#e5e7eb] bg-white"
        >
          <img
            v-if="store.logo"
            :src="store.logo"
            :alt="store.storeName"
            class="h-full w-full object-cover"
          />
          <div v-else class="h-6 w-6 rounded-full bg-[#f3f4f6]" />
        </div>
        <div class="min-w-0 flex-1">
          <h3 class="text-[14px] font-medium leading-5 text-[#191a1d]">{{ store.storeName }}</h3>
          <p class="mt-1 text-[12px] leading-4 text-[#99a1af]">{{ store.slogan }}</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          class="flex flex-1 items-center justify-center gap-1 border border-[#e5e7eb] px-4 py-2 text-[#191a1d]"
          data-testid="follow-store-enter-button"
          @click="handleEnterStore"
        >
          <UIcon name="i-heroicons-building-storefront" class="h-4 w-4" />
          <span class="text-[12px] font-medium leading-4">{{ t('38b40b9e.8f822c') }}</span>
        </button>
        <button
          type="button"
          class="flex flex-1 items-center justify-center gap-1 border border-[#e5e7eb] px-4 py-2 text-[#191a1d]"
          data-testid="follow-store-contact-button"
          @click="emit('contact', store)"
        >
          <UIcon name="i-heroicons-phone" class="h-4 w-4" />
          <span class="text-[12px] font-medium leading-4">{{ t('38b40b9e.b66060') }}</span>
        </button>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <button
          v-for="item in store.items"
          :key="item.id"
          type="button"
          class="flex min-w-0 flex-col items-center overflow-hidden"
          data-testid="follow-store-item"
          @click="handleOpenItem(item.itemId)"
        >
          <div class="relative aspect-square w-full overflow-hidden bg-[#f6f6f6]">
            <img
              v-if="item.image"
              :src="item.image"
              :alt="item.title"
              class="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div class="flex w-full flex-col items-center gap-2 bg-white px-2 py-3 text-center">
            <p class="line-clamp-2 text-[12px] leading-4 text-[#191a1d]">{{ item.title }}</p>
            <p class="text-[14px] leading-[14px] text-[#191a1d]">{{ item.priceText }}</p>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IFollowedStoreCard } from '~/infrastructure/transformers/collectDistributionTransformer'

defineOptions({
  name: 'FollowedStoreCard',
})

const props = defineProps<{
  store: IFollowedStoreCard
}>()

const emit = defineEmits<{
  contact: [store: IFollowedStoreCard]
}>()

const router = useRouter()
const localePath = useLocalePath()
const { t } = useI18n()

function handleEnterStore() {
  router.push(localePath(`/shop/${props.store.distributorId}`))
}

function handleOpenItem(itemId: string) {
  if (!itemId) return
  router.push(localePath(`/products/${itemId}`))
}
</script>
