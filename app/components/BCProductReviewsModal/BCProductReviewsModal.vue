<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4"
        @click.self="close"
      >
        <div
          class="flex h-[min(92vh,720px)] w-full max-w-[880px] flex-col overflow-hidden bg-white shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] md:h-[min(80vh,720px)]"
          @click.stop
        >
          <div class="flex shrink-0 items-center justify-between border-b border-[#e5e5e5] px-6 py-5">
            <h2 class="text-[20px] font-medium leading-5 text-[#191a1d]">
              {{ $t('464b6330.e2a91c') }}
              <span v-if="total > 0" class="ml-2 text-base font-normal text-[#4a5565]">
                ({{ total }})
              </span>
            </h2>
            <button
              type="button"
              class="flex size-6 items-center justify-center text-[#191a1d] transition-opacity hover:opacity-70"
              :aria-label="$t('3e6ed17a.b15d91')"
              @click="close"
            >
              <UIcon name="i-heroicons-x-mark" class="size-6" />
            </button>
          </div>

          <div
            ref="scrollContainerRef"
            class="min-h-0 flex-1 overflow-y-auto px-6"
          >
            <div v-if="loading && !reviews.length" class="py-10 text-center text-sm text-[#4a5565]">
              {{ $t('464b6330.26b5bd') }}
            </div>

            <div v-else-if="reviews.length" class="flex flex-col">
              <BCProductReviewItem
                v-for="review in reviews"
                :key="review.id"
                :review="review"
                :item-id="itemId"
                show-meta
              />

              <div
                v-if="hasMore"
                class="flex items-center justify-center py-5"
              >
                <button
                  type="button"
                  class="flex items-center gap-1 border border-[#e5e5e5] px-8 py-2.5 text-sm leading-5 text-[#4a5565] transition-colors hover:border-[#191a1d] hover:text-[#191a1d] disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="loading"
                  @click="handleLoadMore"
                >
                  <span>{{ loading ? $t('464b6330.26b5bd') : $t('464b6330.7e3a91') }}</span>
                  <UIcon
                    v-if="!loading"
                    name="i-heroicons-chevron-down"
                    class="size-4"
                  />
                </button>
              </div>
            </div>

            <div v-else class="py-10 text-center text-sm text-[#4a5565]">
              {{ $t('464b6330.f8e3b1') }}
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import BCProductReviewItem from '~/components/BCProductReviewItem/BCProductReviewItem.vue'
import { useProductReviews } from '~/composables/useProductReviews'

interface Props {
  modelValue: boolean
  itemId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const MODAL_PAGE_SIZE = '10'

const scrollContainerRef = ref<HTMLElement | null>(null)

const { reviews, total, loading, hasMore, loadReviews, loadMoreReviews } = useProductReviews(
  () => props.itemId
)

watch(
  () => props.modelValue,
  async (open) => {
    if (!import.meta.client) {
      return
    }

    document.body.style.overflow = open ? 'hidden' : ''

    if (!open || !props.itemId) {
      return
    }

    await loadReviews('1', MODAL_PAGE_SIZE)
    await nextTick()
    if (scrollContainerRef.value) {
      scrollContainerRef.value.scrollTop = 0
    }
  }
)

onUnmounted(() => {
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
})

function close() {
  emit('update:modelValue', false)
}

function handleLoadMore() {
  loadMoreReviews(MODAL_PAGE_SIZE)
}
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
