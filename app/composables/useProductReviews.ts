import { ref } from 'vue'
import { rateApiClient } from '~/infrastructure/http/clients/RateApiClient'
import type { IRateListItem, IRateListResponse } from '~/types/api/rate'
import { logger } from '~/utils/log'

export interface ProductReviewItem {
  id: string
  userName: string
  avatar: string
  content: string
  photos: string[]
  star: number
  rateType: 'good' | 'neutral' | 'bad'
  itemSpecDesc: string
  createdTime: string
  replyCount: number
}

function parseRatePhotos(item: IRateListItem): string[] {
  const ratePic = item.rate_pic
  if (typeof ratePic === 'string' && ratePic.trim()) {
    return ratePic.split(',').map((photo) => photo.trim()).filter(Boolean)
  }
  return []
}

function parseReplyCount(item: IRateListItem): number {
  const replyCount = Number(item.reply?.total_count ?? 0)
  if (Number.isFinite(replyCount) && replyCount > 0) {
    return replyCount
  }

  const isReply = item.is_reply
  if (isReply === true || isReply === 1 || isReply === '1' || isReply === 'true') {
    return 1
  }

  return 0
}

function mapStarToRateType(star: number): ProductReviewItem['rateType'] {
  if (!Number.isFinite(star)) return 'good'
  if (star <= 2) return 'bad'
  if (star === 3) return 'neutral'
  return 'good'
}

function toProductReviewItem(item: IRateListItem, index: number): ProductReviewItem {
  const star = Number(item.star ?? 0)
  return {
    id: String(item.rate_id ?? `review-${index}`),
    userName: String(item.username ?? ''),
    avatar: String(item.avatar ?? ''),
    content: String(item.content ?? ''),
    photos: parseRatePhotos(item),
    star: Number.isFinite(star) ? star : 0,
    rateType: mapStarToRateType(star),
    itemSpecDesc: String(item.item_spec_desc ?? ''),
    createdTime: String(item.created ?? ''),
    replyCount: parseReplyCount(item),
  }
}

function normalizeReviewList(response: IRateListResponse | { data?: IRateListResponse }): ProductReviewItem[] {
  const payload = (response as IRateListResponse).list
    ? (response as IRateListResponse)
    : (response as { data?: IRateListResponse }).data

  const list = Array.isArray(payload?.list) ? payload.list : []

  return list
    .map((item, index) => toProductReviewItem(item, index))
    .filter((item) => item.content || item.photos.length > 0)
}

function normalizeReviewTotal(
  response: IRateListResponse | { data?: IRateListResponse },
  listLength: number
): number {
  const payload = (response as IRateListResponse).total_count != null
    ? (response as IRateListResponse)
    : (response as { data?: IRateListResponse }).data

  const parsed = Number(payload?.total_count)
  if (Number.isFinite(parsed) && parsed >= 0) {
    return parsed
  }

  return listLength
}

interface LoadReviewsOptions {
  append?: boolean
}

export function useProductReviews(itemId: MaybeRefOrGetter<string>) {
  const reviews = ref<ProductReviewItem[]>([])
  const total = ref(0)
  const loading = ref(false)
  const loaded = ref(false)

  const resolvedItemId = computed(() => toValue(itemId))

  const hasMore = computed(() => reviews.value.length < total.value)

  const loadReviews = async (
    page = '1',
    pageSize = '10',
    options: LoadReviewsOptions = {}
  ) => {
    const currentItemId = resolvedItemId.value
    if (!currentItemId || import.meta.server) {
      return
    }

    loading.value = true
    try {
      const response = await rateApiClient.getRateList({
        item_id: currentItemId,
        page,
        pageSize,
      })
      const list = normalizeReviewList(response)
      const nextTotal = normalizeReviewTotal(response, list.length)

      if (options.append) {
        const existingIds = new Set(reviews.value.map((item) => item.id))
        reviews.value = [
          ...reviews.value,
          ...list.filter((item) => !existingIds.has(item.id)),
        ]
      } else {
        reviews.value = list
      }

      total.value = nextTotal
      loaded.value = true
    } catch (error) {
      logger.warn('[product-detail] load reviews failed', error)
      if (!options.append) {
        reviews.value = []
        total.value = 0
      }
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  const loadMoreReviews = async (pageSize = '10') => {
    if (loading.value || !hasMore.value) {
      return
    }

    const nextPage = String(Math.ceil(reviews.value.length / Number(pageSize)) + 1)
    await loadReviews(nextPage, pageSize, { append: true })
  }

  return {
    reviews,
    total,
    loading,
    loaded,
    hasMore,
    loadReviews,
    loadMoreReviews,
  }
}
