<template>
  <article class="flex flex-col gap-3 border-b border-[#e5e5e5] py-5 last:border-b-0">
    <div class="flex items-center gap-2">
      <img
        v-if="review.avatar"
        :src="review.avatar"
        :alt="review.userName || $t('464b6330.d9c4a6')"
        class="size-9 shrink-0 rounded-full object-cover"
      />
      <div
        v-else
        class="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#e5e5e5]"
      >
        <UIcon name="i-heroicons-user" class="size-5 text-[#4a5565]" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-sm leading-5 text-[#364153]">
          {{ review.userName || $t('464b6330.d9c4a6') }}
        </p>
        <div
          v-if="showMeta"
          class="mt-1 flex flex-wrap items-center gap-2 text-xs leading-4 text-[#8f99aa]"
        >
          <div v-if="review.star > 0" class="flex items-center gap-0.5">
            <UIcon
              v-for="starIndex in 5"
              :key="`${review.id}-star-${starIndex}`"
              name="i-heroicons-star-solid"
              class="size-3.5"
              :class="starIndex <= review.star ? 'text-[#fdc700]' : 'text-[#e5e7eb]'"
            />
          </div>
          <span v-if="formattedDate">{{ formattedDate }}</span>
          <span v-if="review.itemSpecDesc" class="truncate">{{ review.itemSpecDesc }}</span>
        </div>
      </div>
    </div>

    <div class="flex items-start justify-between gap-4">
      <p class="min-w-0 flex-1 text-sm leading-5 text-[#364153]">
        {{ review.content }}
      </p>
      <button
        v-if="review.replyCount > 0"
        type="button"
        class="flex shrink-0 items-center gap-1 whitespace-nowrap text-sm leading-5 text-[#4a5565] transition-colors hover:text-[#191a1d]"
        @click="toggleReplies"
      >
        <span>{{ $t('464b6330.b8e4f1') }} {{ review.replyCount }}</span>
        <UIcon
          name="i-heroicons-chevron-down"
          class="size-4 transition-transform"
          :class="expanded ? 'rotate-180' : ''"
        />
      </button>
    </div>

    <div v-if="review.photos.length" class="flex flex-wrap gap-3">
      <div
        v-for="(photo, photoIndex) in review.photos"
        :key="`${review.id}-${photoIndex}`"
        class="size-20 overflow-hidden"
      >
        <img
          :src="photo"
          :alt="$t('2d7e67bc.b5735e', { index: photoIndex + 1 })"
          class="size-full object-cover"
        />
      </div>
    </div>

    <div v-if="expanded" class="rounded bg-[#f7f7f7] px-4 py-3">
      <div v-if="repliesLoading" class="text-sm leading-5 text-[#8f99aa]">
        {{ $t('464b6330.26b5bd') }}
      </div>
      <div v-else-if="replies.length" class="flex flex-col gap-3">
        <p v-for="reply in replies" :key="reply.id" class="text-sm leading-5 text-[#666666]">
          <span class="text-[#8f99aa]">{{ formatReplyLabel(reply) }}</span>
          <span>{{ reply.content }}</span>
        </p>
      </div>
      <div v-else class="text-sm leading-5 text-[#8f99aa]">
        {{ $t('464b6330.f3a8c2') }}
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { ProductReviewItem } from '~/composables/useProductReviews'
import type { ProductReviewReplyItem } from '~/composables/useProductReviewReplies'
import { useProductReviewReplies } from '~/composables/useProductReviewReplies'

interface Props {
  review: ProductReviewItem
  itemId?: string
  showMeta?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  itemId: '',
  showMeta: false,
})

const { t } = useI18n()

const {
  replies,
  loading: repliesLoading,
  expanded,
  toggleReplies,
} = useProductReviewReplies(props.review.id, props.itemId || undefined)

const formattedDate = computed(() => {
  const timestamp = Number(props.review.createdTime)
  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return ''
  }

  const date = new Date(timestamp * 1000)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}-${day}`
})

function formatReplyLabel(reply: ProductReviewReplyItem): string {
  if (reply.isSeller) {
    return `${t('464b6330.a6d2e8')}：`
  }

  const name = reply.userName || t('464b6330.d9c4a6')
  return `${name}：`
}
</script>
