<template>
  <div class="flex flex-col gap-[32px] w-full">
    <div class="flex items-center gap-[10px] w-full">
      <svg
        class="h-5 w-5 shrink-0 text-[#191a1d]"
        viewBox="0 0 20 19"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M19.9995 6.88428C19.9983 6.4752 19.9323 6.06898 19.804 5.6811L19.7873 5.59126L18.0671 1.37718C17.9084 0.966999 17.6298 0.615667 17.2687 0.370135C16.9076 0.124602 16.4812 -0.00343601 16.0463 0.00312995H4.09294C3.65601 -0.0212692 3.22264 0.0947131 2.85461 0.334538C2.48659 0.574363 2.2027 0.925786 2.04344 1.33869L0.208829 5.61282L0.192581 5.69757C0.0655586 6.08567 0.000583713 6.49186 0.000114432 6.90074C0.00250163 7.43765 0.114873 7.96821 0.330117 8.45885C0.545361 8.94948 0.858791 9.38951 1.25057 9.75109L1.25515 17.1552C1.27117 18.1801 2.09596 19 3.10463 19L3.13038 18.9998H3.13164L16.8764 18.9917H16.8939C17.9055 18.9917 18.7328 18.1707 18.7514 17.1439V9.73382C19.5305 9.01103 19.9953 7.98417 19.9995 6.88428ZM1.37907 6.09646L1.40448 6.01902L1.40997 5.99039L3.18977 1.84354L3.19915 1.82175L3.20773 1.79961C3.33074 1.4807 3.64026 1.26636 3.97782 1.26636L4.02405 1.26763L4.0585 1.2696H16.0463L16.0692 1.26949L16.0784 1.26937C16.4454 1.26937 16.7693 1.49311 16.9118 1.86117L18.5831 5.95538L18.5917 6.0021L18.6184 6.08348C18.7036 6.33993 18.7479 6.6085 18.7495 6.87907C18.7455 7.85492 18.2127 8.74151 17.3724 9.18573C16.9785 9.38715 16.5434 9.49232 16.1022 9.49281L16.0663 9.49258H16.0104C15.6199 9.49258 15.2339 9.40779 14.8784 9.24394C14.5229 9.08009 14.2062 8.84097 13.9497 8.5427L13.0035 7.44257L12.0616 8.54629C11.5469 9.14956 10.8003 9.49757 9.99874 9.50127C9.60854 9.50099 9.22292 9.41601 8.86787 9.25203C8.51282 9.08806 8.19657 8.84891 7.94043 8.5507L6.99709 7.45289L6.05422 8.55116C5.58286 9.09992 4.91835 9.44016 4.20267 9.49919L3.94304 9.50487L3.88457 9.50545C3.46256 9.50545 3.03964 9.40494 2.66867 9.21842C1.79788 8.77362 1.25423 7.88344 1.25023 6.90202C1.25045 6.62825 1.29395 6.35629 1.37907 6.09646ZM17.5016 17.1203C17.4953 17.4538 17.2227 17.7252 16.8756 17.7251L3.1044 17.7334C2.77897 17.7334 2.51007 17.4652 2.50504 17.1544L2.50149 11.4058H2.50217V10.5205C2.97159 10.6962 3.46938 10.7811 3.9697 10.7708V10.7753H3.97908C4.55128 10.7753 5.11681 10.6509 5.6375 10.4105C6.1582 10.1702 6.62194 9.81951 6.99744 9.38211C7.37084 9.8167 7.83182 10.1652 8.34932 10.4042C8.86683 10.6432 9.42887 10.767 9.9976 10.7675H10.0189C10.5863 10.7649 11.1465 10.6392 11.662 10.3989C12.1774 10.1586 12.6361 9.80931 13.0071 9.37445C13.384 9.81266 13.8499 10.1632 14.3729 10.4021C14.8959 10.641 15.4637 10.7626 16.0374 10.7586H16.0506C16.5453 10.7649 17.037 10.6796 17.5015 10.507V12.4825H17.5013L17.5016 17.1203Z"
          fill="currentColor"
        />
      </svg>
      <span class="text-[14px] font-medium leading-5 text-[#191a1d]">
        {{ storeName || t('d8cfaa2d.0d4934') }}
      </span>
    </div>

    <div class="flex flex-col w-full">
      <div
        v-for="item in items"
        :key="item.detailId || item.itemId"
        class="flex items-start gap-[16px] lg:gap-[32px] border-b border-[#e5e7eb] pb-[32px] mb-[32px] last:mb-0"
      >
        <img
          :src="item.itemImage"
          :alt="item.itemName"
          class="h-[96px] w-[96px] shrink-0 bg-[#f3f4f6] object-cover"
        />

        <div class="flex min-w-0 flex-1 items-start gap-[16px] lg:gap-[32px]">
          <div class="flex min-w-0 flex-[1_0_0] flex-col gap-[4px]">
            <BCProductMarketingTags :tags="item.marketingTags" placement="inline" />
            <p class="text-[14px] font-medium leading-5 text-[#191a1d]">
              {{ item.itemName }}
            </p>
            <div class="flex flex-col gap-[2px]">
              <p v-if="item.skuNo" class="text-[12px] leading-4 text-[#364153]">
                {{ t('d8cfaa2d.e54891') }}: {{ item.skuNo }}
              </p>
              <p v-if="item.style" class="text-[12px] leading-4 text-[#364153]">
                {{ t('d8cfaa2d.568510') }}: {{ item.style }}
              </p>
              <p v-if="item.size" class="text-[12px] leading-4 text-[#364153]">
                {{ t('d8cfaa2d.c8339f') }}: {{ item.size }}
              </p>
              <p
                v-if="!item.skuNo && !item.style && !item.size && item.specName"
                class="text-[12px] leading-4 text-[#364153]"
              >
                {{ item.specName }}
              </p>
            </div>
          </div>

          <div
            class="flex shrink-0 flex-col items-end gap-[4px] min-w-[66px] lg:min-w-0 lg:flex-row lg:items-start lg:justify-end lg:gap-[32px]"
          >
            <div class="flex flex-col items-end justify-center py-px lg:order-2">
              <span class="text-[14px] leading-5 text-[#191a1d] whitespace-nowrap">
                ¥ {{ formatAmount(item.price) }}
              </span>
            </div>
            <div class="flex flex-col items-end justify-center py-px lg:order-1">
              <span class="text-[14px] leading-5 text-[#191a1d] whitespace-nowrap">
                {{ t('d8cfaa2d.0bf60b') }}:{{ item.quantity }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="hidden lg:flex items-center justify-between pb-[32px]">
      <div class="flex items-center gap-[32px] text-[14px] leading-5 text-[#364153]">
        <span>{{ t('d8cfaa2d.0bf60b') }}: {{ itemCount }}</span>
        <span>
          {{ t('d8cfaa2d.98194d') }}:
          <span class="font-medium text-[16px] text-[#191a1d]"
            >¥ {{ formatAmount(refundAmount) }}</span
          >
        </span>
      </div>
      <div v-if="resolvedButtons.length" class="flex items-center gap-[16px]">
        <button
          v-for="button in resolvedButtons"
          :key="button.type"
          type="button"
          class="h-[50px] border border-[#0f0f10] px-[32px] text-[14px] font-medium leading-4 text-[#0f0f10] transition hover:opacity-80"
          :class="button.primary ? 'bg-[#0f0f10] text-white' : 'bg-white'"
          @click="$emit('action', button)"
        >
          {{ button.name }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BCProductMarketingTags from '~/components/BCProductMarketingTags/BCProductMarketingTags.vue'

interface ItemModel {
  detailId?: string
  itemId: string
  itemName: string
  itemImage: string
  specName: string
  skuNo: string
  style: string
  size: string
  quantity: number
  price: number
}

interface ActionButton {
  type: string
  name: string
  primary?: boolean
}

interface Props {
  storeName: string
  items: ItemModel[]
  itemCount: number
  refundAmount: number
  actionButtons?: ActionButton[]
}

const { t } = useI18n()

const props = defineProps<Props>()

defineEmits<{
  (e: 'action', button: ActionButton): void
}>()

const resolvedButtons = computed(() => {
  if (!props.actionButtons || props.actionButtons.length === 0) return []
  return props.actionButtons.map((button, index) => ({
    ...button,
    primary:
      typeof button.primary !== 'undefined'
        ? button.primary
        : index === props.actionButtons!.length - 1,
  }))
})

function formatAmount(amount: number) {
  return Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
</script>
