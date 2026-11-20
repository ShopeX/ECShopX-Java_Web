<template>
  <!-- 遮罩层 -->
  <Teleport to="body">
    <Transition name="review-modal">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex flex-col items-end justify-end lg:items-end lg:justify-start"
        :class="{ 'bg-[rgba(0,0,0,0.6)]': true }"
        data-testid="order-review-modal"
        @click.self="handleClose"
      >
        <!-- PC：右侧抽屉 | H5：底部 Sheet -->
        <div class="flex flex-col bg-white w-full lg:w-[560px] lg:h-full" @click.stop>
          <!-- 内容区（可滚动） -->
          <div class="flex-1 overflow-y-auto px-[16px] py-[32px] lg:p-[32px]">
            <!-- 头部 -->
            <div class="flex items-center justify-between py-[16px]">
              <h2
                data-testid="review-modal-title"
                class="text-[20px] font-medium leading-5 text-[#191a1d]"
              >
                {{ t('2d7e67bc.a67031') }}
              </h2>
              <button
                data-testid="btn-close-review"
                type="button"
                class="size-[24px] flex items-center justify-center text-[#191a1d] hover:opacity-70 transition-opacity"
                @click="handleClose"
              >
                <svg
                  viewBox="0 0 24 24"
                  class="size-[24px]"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- 区块列表 -->
            <div class="flex flex-col gap-[32px] pt-[32px]">
              <!-- 商品信息 -->
              <div class="flex gap-[16px] items-start">
                <div class="relative shrink-0 size-[96px] bg-[#f9fafb]">
                  <img
                    v-if="item.itemImage"
                    :src="item.itemImage"
                    :alt="item.itemName"
                    class="size-[96px] object-cover"
                    data-testid="review-item-image"
                  />
                  <div v-else class="size-[96px] bg-[#f9fafb]" data-testid="review-item-image" />
                </div>
                <div class="flex-1 min-w-0 flex flex-col gap-[4px]">
                  <BCProductMarketingTags :tags="item.marketingTags" placement="inline" />
                  <p
                    data-testid="review-item-name"
                    class="text-[14px] font-medium leading-5 text-[#101828]"
                  >
                    {{ item.itemName }}
                  </p>
                  <div data-testid="review-item-spec" class="flex flex-col gap-[2px]">
                    <p v-if="item.skuNo" class="text-[12px] leading-4 text-[#364153]">
                      {{ t('2d7e67bc.e54891') }}: {{ item.skuNo }}
                    </p>
                    <p v-if="item.style" class="text-[12px] leading-4 text-[#364153]">
                      {{ t('2d7e67bc.568510') }}: {{ item.style }}
                    </p>
                    <p v-if="item.size" class="text-[12px] leading-4 text-[#364153]">
                      {{ t('2d7e67bc.c8339f') }}: {{ item.size }}
                    </p>
                    <p
                      v-if="!item.skuNo && !item.style && !item.size && item.specName"
                      class="text-[12px] leading-4 text-[#364153]"
                    >
                      {{ item.specName }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- 商品评分 -->
              <div class="flex flex-col gap-[16px]">
                <p class="text-[14px] font-medium leading-5 text-[#101828]">
                  {{ t('2d7e67bc.3e24bd') }}
                </p>
                <ReviewStarRating v-model="starValue" />
              </div>

              <!-- 评价内容 -->
              <div class="flex flex-col gap-[8px]">
                <p class="text-[14px] font-medium leading-5 text-[#101828]">
                  {{ t('2d7e67bc.bc0d27') }}
                </p>
                <textarea
                  v-model="content"
                  data-testid="review-content"
                  :placeholder="t('2d7e67bc.39f511')"
                  :maxlength="500"
                  class="w-full h-[120px] bg-[#f3f3f5] px-[12px] py-[8px] text-[14px] leading-5 text-[#191a1d] placeholder-[#99a1af] resize-none border-0 outline-none focus:ring-0"
                />
                <div class="flex justify-end">
                  <span
                    data-testid="review-content-count"
                    class="text-[12px] leading-4 text-[#6a7282]"
                  >
                    {{ content.length }}/500
                  </span>
                </div>
              </div>

              <!-- 上传图片（选填） -->
              <div class="flex flex-col gap-[8px]">
                <p class="text-[14px] font-medium leading-5 text-[#191a1d]">
                  {{ t('2d7e67bc.5f1244') }}
                </p>
                <div class="flex flex-wrap gap-[8px] items-center">
                  <!-- 已上传缩略图 -->
                  <div
                    v-for="(img, index) in uploadedImages"
                    :key="index"
                    class="relative size-[80px] shrink-0"
                  >
                    <img
                      :src="img.preview"
                      :alt="t('2d7e67bc.b5735e', { index: index + 1 })"
                      class="size-[80px] object-cover border border-[#e5e7eb]"
                      :data-testid="`uploaded-image-${index}`"
                    />
                    <button
                      type="button"
                      class="absolute top-0 right-0 size-[20px] bg-[rgba(0,0,0,0.5)] text-white flex items-center justify-center"
                      :data-testid="`delete-image-${index}`"
                      @click="removeImage(index)"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        class="size-[12px]"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        aria-hidden="true"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <!-- 上传按钮（未达上限时显示） -->
                  <button
                    v-if="uploadedImages.length < 5"
                    type="button"
                    data-testid="btn-upload-image"
                    class="size-[80px] border border-[#d1d5dc] rounded-[4px] flex flex-col items-center justify-center text-[#99a1af] hover:border-[#9ca3af] transition-colors shrink-0"
                    @click="triggerFileInput"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      class="size-[20px]"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                      />
                    </svg>
                  </button>
                </div>
                <input
                  ref="fileInputRef"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  data-testid="review-image-input"
                  @change="handleFileChange"
                />
                <p class="text-[12px] leading-4 text-[#6a7282]">
                  {{ t('2d7e67bc.e41884') }}
                </p>
              </div>
            </div>
          </div>

          <!-- PC：提交按钮在内容区底部，H5：独立固定底栏 -->
          <!-- H5 底栏 -->
          <div class="lg:hidden border-t border-[#e5e7eb] px-[16px] py-[32px] shrink-0">
            <button
              data-testid="btn-submit-review"
              type="button"
              class="w-full bg-[#0f0f10] py-[16px] text-[14px] font-medium text-white hover:opacity-90 transition-opacity"
              :disabled="submitting"
              @click="handleSubmit"
            >
              {{ submitting ? t('ee3264ed.abe2c5') : t('2d7e67bc.16f3ba') }}
            </button>
          </div>

          <!-- PC 底部按钮 -->
          <div class="hidden lg:block px-[32px] pb-[32px] shrink-0">
            <button
              data-testid="btn-submit-review"
              type="button"
              class="w-full bg-[#0f0f10] py-[16px] text-[14px] font-medium text-white hover:opacity-90 transition-opacity"
              :disabled="submitting"
              @click="handleSubmit"
            >
              {{ submitting ? t('ee3264ed.abe2c5') : t('2d7e67bc.16f3ba') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { rateApiClient } from '~/infrastructure/http/clients/RateApiClient'
import ReviewStarRating from './ReviewStarRating.vue'
import BCProductMarketingTags from '~/components/BCProductMarketingTags/BCProductMarketingTags.vue'
import type { IMarketingTag } from '~/utils/promotionTags'

interface ReviewItem {
  itemId: string
  itemName: string
  itemImage: string
  skuNo?: string
  style?: string
  size?: string
  specName?: string
  marketingTags?: IMarketingTag[]
}

interface Props {
  visible: boolean
  orderId: string
  item: ReviewItem
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  submitted: []
}>()

const { t } = useI18n()
const toast = useToastMessage()

const starValue = ref(5)
const content = ref('')
const uploadedImages = ref<{ file: File; preview: string }[]>([])
const submitting = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

function handleClose() {
  emit('close')
}

function triggerFileInput() {
  fileInputRef.value?.click()
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (uploadedImages.value.length >= 5) return

  const preview = URL.createObjectURL(file)
  uploadedImages.value.push({ file, preview })

  // reset input so same file can be selected again
  input.value = ''
}

function removeImage(index: number) {
  const img = uploadedImages.value[index]
  if (img) URL.revokeObjectURL(img.preview)
  uploadedImages.value.splice(index, 1)
}

async function handleSubmit() {
  if (!content.value.trim()) {
    toast.show(t('2d7e67bc.e7c1fc'))
    return
  }

  submitting.value = true
  try {
    await rateApiClient.submitRate({
      order_id: props.orderId,
      rates: [
        {
          item_id: props.item.itemId,
          content: content.value,
          star: String(starValue.value),
          // pics: 当前阶段不包含图片 URL（需图片上传接口支持后启用）
        },
      ],
    })
    emit('submitted')
    emit('close')
  } catch {
    toast.show(t('2d7e67bc.ca2e80'))
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.review-modal-enter-active,
.review-modal-leave-active {
  transition: opacity 0.2s ease;
}
.review-modal-enter-from,
.review-modal-leave-to {
  opacity: 0;
}
</style>
