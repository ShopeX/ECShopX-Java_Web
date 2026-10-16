<template>
  <ECDrawer
    v-if="isDesktop"
    v-model="panelVisible"
    panel-class="max-w-[560px]"
    @close="handleClose"
  >
    <div class="flex h-full flex-col bg-white">
      <div class="flex items-center justify-between px-[32px] py-[32px]">
        <h2 class="text-[20px] font-medium leading-5 text-[#191a1d]">
          {{ t('0747dfee.45eb0c') }}
        </h2>
        <button
          type="button"
          class="flex h-[24px] w-[24px] items-center justify-center text-[#191a1d] transition-opacity hover:opacity-70"
          data-testid="btn-close-aftersales"
          @click="handleClose"
        >
          <svg
            viewBox="0 0 24 24"
            class="h-[24px] w-[24px]"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto px-[32px] pb-[32px]">
        <AftersalesFormContent
          :items="items"
          :selected-item-id="selectedItemId"
          :quantities="itemQuantities"
          :refund-reason="refundReason"
          :refund-amount-text="refundAmountText"
          :refund-points-text="refundPointsText"
          :description="description"
          :image-previews="imagePreviews"
          :reason-options="props.reasonOptions"
          @select-item="selectItem"
          @update-quantity="updateItemQuantity"
          @update:refund-reason="refundReason = $event"
          @update:description="description = $event"
          @trigger-upload="triggerUpload"
          @remove-image="removeImage"
        />
      </div>

      <div class="px-[32px] pb-[32px]">
        <button
          type="button"
          class="w-full bg-[#0f0f10] py-[16px] text-[14px] font-medium leading-5 text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          data-testid="btn-submit-aftersales"
          :disabled="submitting || !selectedItem"
          @click="handleSubmit"
        >
          {{ submitting ? t('ee3264ed.abe2c5') : t('0747dfee.3f0f2a') }}
        </button>
      </div>
    </div>
  </ECDrawer>

  <ECBottomSheet
    v-else
    v-model="panelVisible"
    panel-class="max-h-[calc(100vh-96px)] overflow-hidden"
    @close="handleClose"
  >
    <div class="flex max-h-[calc(100vh-96px)] flex-col bg-white">
      <div class="flex items-center justify-between px-[16px] py-[32px]">
        <h2 class="text-[20px] font-medium leading-5 text-[#191a1d]">
          {{ t('0747dfee.45eb0c') }}
        </h2>
        <button
          type="button"
          class="flex h-[24px] w-[24px] items-center justify-center text-[#191a1d] transition-opacity hover:opacity-70"
          data-testid="btn-close-aftersales"
          @click="handleClose"
        >
          <svg
            viewBox="0 0 24 24"
            class="h-[24px] w-[24px]"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto px-[16px] pb-[32px]">
        <AftersalesFormContent
          :items="items"
          :selected-item-id="selectedItemId"
          :quantities="itemQuantities"
          :refund-reason="refundReason"
          :refund-amount-text="refundAmountText"
          :refund-points-text="refundPointsText"
          :description="description"
          :image-previews="imagePreviews"
          :reason-options="props.reasonOptions"
          @select-item="selectItem"
          @update-quantity="updateItemQuantity"
          @update:refund-reason="refundReason = $event"
          @update:description="description = $event"
          @trigger-upload="triggerUpload"
          @remove-image="removeImage"
        />
      </div>

      <div class="border-t border-[#e5e7eb] px-[16px] py-[32px]">
        <button
          type="button"
          class="w-full bg-[#0f0f10] py-[16px] text-[14px] font-medium leading-5 text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          data-testid="btn-submit-aftersales"
          :disabled="submitting || !selectedItem"
          @click="handleSubmit"
        >
          {{ submitting ? t('ee3264ed.abe2c5') : t('0747dfee.3f0f2a') }}
        </button>
      </div>
    </div>
  </ECBottomSheet>

  <input
    ref="fileInputRef"
    type="file"
    accept="image/png,image/jpg,image/jpeg,image/gif"
    multiple
    class="hidden"
    @change="handleFileChange"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import ECDrawer from '~/components/ECDrawer/ECDrawer.vue'
import ECBottomSheet from '~/components/ECBottomSheet/ECBottomSheet.vue'
import { aftersalesApiClient } from '~/infrastructure/http/clients/AftersalesApiClient'
import type { AftersalesReasonOption } from '~/composables/useAftersalesReasonOptions'
import AftersalesFormContent, { type AftersalesPanelItem } from './AftersalesFormContent.vue'

interface PreviewImageItem {
  file: File
  preview: string
  uploadedUrl: string
  uploading: boolean
}

interface Props {
  visible: boolean
  orderId: string
  items: AftersalesPanelItem[]
  reasonOptions: AftersalesReasonOption[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  submitted: []
}>()

const { t } = useI18n()
const toast = useToastMessage()
const panelVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => {
    if (!value) emit('close')
  },
})

const isDesktop = ref(false)
const selectedItemId = ref('')
const itemQuantities = ref<Record<string, number>>({})
const refundReason = ref('')
const description = ref('')
const uploadedImages = ref<PreviewImageItem[]>([])
const submitting = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
let mediaQuery: MediaQueryList | null = null

const imagePreviews = computed(() => uploadedImages.value.map((item) => item.preview))
const selectedItem = computed(
  () =>
    props.items.find((item) => item.itemId === selectedItemId.value && item.leftAftersalesNum > 0) ??
    props.items.find((item) => item.leftAftersalesNum > 0)
)
const selectedQuantity = computed(() => {
  if (!selectedItem.value) return 1
  return itemQuantities.value[selectedItem.value.itemId] ?? 1
})
const refundAmountText = computed(() => {
  const amount = (selectedItem.value?.price ?? 0) * selectedQuantity.value
  return formatAmount(amount)
})
const refundPointsText = computed(() => '0')

const syncViewport = () => {
  isDesktop.value = mediaQuery?.matches ?? false
}

function formatAmount(amount: number) {
  return Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function resetQuantities() {
  itemQuantities.value = props.items.reduce<Record<string, number>>((result, item) => {
    result[item.itemId] = 1
    return result
  }, {})
}

function resetForm() {
  selectedItemId.value = props.items.find((item) => item.leftAftersalesNum > 0)?.itemId ?? ''
  refundReason.value = ''
  description.value = ''
  uploadedImages.value.forEach((item) => URL.revokeObjectURL(item.preview))
  uploadedImages.value = []
  resetQuantities()
}

function handleClose() {
  emit('close')
}

function selectItem(itemId: string) {
  const item = props.items.find((entry) => entry.itemId === itemId)
  if (!item || item.leftAftersalesNum <= 0) return
  selectedItemId.value = itemId
}

function updateItemQuantity(payload: { itemId: string; quantity: number }) {
  const item = props.items.find((entry) => entry.itemId === payload.itemId)
  if (!item) return
  const maxQuantity = Math.min(Math.max(item.leftAftersalesNum, 0), item.quantity)
  if (maxQuantity <= 0) return
  const nextQuantity = Math.min(Math.max(payload.quantity, 1), maxQuantity)
  itemQuantities.value = {
    ...itemQuantities.value,
    [payload.itemId]: nextQuantity,
  }
}

function triggerUpload() {
  fileInputRef.value?.click()
}

function extractUploadedImageUrl(response: any) {
  const payload = response?.data ?? response ?? []
  if (Array.isArray(payload)) {
    return String(payload[0]?.image_url || payload[0]?.url || '')
  }
  if (payload && typeof payload === 'object') {
    return String(payload.image_url || payload.url || '')
  }
  return ''
}

async function uploadImage(file: File, preview: string) {
  const imageItem: PreviewImageItem = {
    file,
    preview,
    uploadedUrl: '',
    uploading: true,
  }
  uploadedImages.value.push(imageItem)

  try {
    const response = await aftersalesApiClient.uploadLocalImage({
      file,
      filetype: 'image',
      group: 'aftersales',
      newfilename: file.name,
    })
    imageItem.uploadedUrl = extractUploadedImageUrl(response)
    if (!imageItem.uploadedUrl) {
      throw new Error('UPLOAD_IMAGE_URL_EMPTY')
    }
  } catch (error) {
    URL.revokeObjectURL(preview)
    uploadedImages.value = uploadedImages.value.filter((item) => item !== imageItem)
    throw error
  } finally {
    imageItem.uploading = false
  }
}

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  const availableSlots = 3 - uploadedImages.value.length

  for (const file of files.slice(0, availableSlots)) {
    if (!file.type.startsWith('image/')) return
    const preview = URL.createObjectURL(file)

    try {
      await uploadImage(file, preview)
    } catch (error: any) {
      toast.show(error?.message || t('9233eff9.bd87f5'))
    }
  }

  input.value = ''
}

function removeImage(index: number) {
  const target = uploadedImages.value[index]
  if (!target) return
  URL.revokeObjectURL(target.preview)
  uploadedImages.value.splice(index, 1)
}

async function handleSubmit() {
  if (!selectedItem.value) return
  if (!refundReason.value) {
    toast.show(t('0747dfee.b42a2f'))
    return
  }
  if (uploadedImages.value.some((item) => item.uploading)) {
    toast.show(t('de8076e6.26b5bd'))
    return
  }

  submitting.value = true
  try {
    await aftersalesApiClient.submitAftersales({
      order_id: props.orderId,
      reason: refundReason.value,
      aftersales_type: 'REFUND_GOODS',
      description: description.value,
      evidence_pic: uploadedImages.value
        .map((item) => item.uploadedUrl)
        .filter(Boolean)
        .join(','),
      freight: 0,
      return_type: 'logistics',
      detail: [
        {
          id: selectedItem.value.detailId,
          num: selectedQuantity.value,
        },
      ],
    })
    toast.show(t('0747dfee.06dc88'))
    emit('submitted')
    emit('close')
    resetForm()
  } catch (error: any) {
    toast.show(error?.message || error?.data?.message || t('9233eff9.bd87f5'))
  } finally {
    submitting.value = false
  }
}

watch(
  () => props.visible,
  (nextVisible) => {
    if (nextVisible) {
      resetForm()
    }
  },
  { immediate: true }
)

watch(
  () => props.items,
  () => {
    if (props.visible) {
      resetForm()
    }
  },
  { deep: true }
)

onMounted(() => {
  if (!import.meta.client) return
  mediaQuery = window.matchMedia('(min-width: 1024px)')
  syncViewport()
  mediaQuery.addEventListener('change', syncViewport)
})

onUnmounted(() => {
  uploadedImages.value.forEach((item) => URL.revokeObjectURL(item.preview))
  mediaQuery?.removeEventListener('change', syncViewport)
})
</script>
