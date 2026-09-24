import { rateApiClient } from '~/infrastructure/http/clients/RateApiClient'
import type { IReplyRateListItem, IReplyRateListResponse } from '~/types/api/rate'
import { logger } from '~/utils/log'

export interface ProductReviewReplyItem {
  id: string
  userName: string
  content: string
  role: string
  isSeller: boolean
}

function normalizeReplyList(response: IReplyRateListResponse | { data?: IReplyRateListResponse }): ProductReviewReplyItem[] {
  const payload = (response as IReplyRateListResponse).list
    ? (response as IReplyRateListResponse)
    : (response as { data?: IReplyRateListResponse }).data

  const list = Array.isArray(payload?.list) ? payload.list : []

  return list.map((item, index) => toProductReviewReplyItem(item, index))
}

function toProductReviewReplyItem(item: IReplyRateListItem, index: number): ProductReviewReplyItem {
  const role = String(item.role ?? '')
  return {
    id: String(item.reply_id ?? `reply-${index}`),
    userName: String(item.username ?? ''),
    content: String(item.content ?? ''),
    role,
    isSeller: role === 'seller',
  }
}

export function useProductReviewReplies(rateId: string, itemId?: string) {
  const replies = ref<ProductReviewReplyItem[]>([])
  const loading = ref(false)
  const loaded = ref(false)
  const expanded = ref(false)

  const loadReplies = async () => {
    if (!rateId || loaded.value || loading.value) {
      return
    }

    loading.value = true
    try {
      const response = await rateApiClient.getReplyRateList({
        rate_id: rateId,
        item_id: itemId,
        page: '1',
        pageSize: '100',
      })
      replies.value = normalizeReplyList(response)
      loaded.value = true
    } catch (error) {
      logger.warn('[product-review] load replies failed', error)
      replies.value = []
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  const toggleReplies = async () => {
    expanded.value = !expanded.value
    if (expanded.value && !loaded.value) {
      await loadReplies()
    }
  }

  return {
    replies,
    loading,
    loaded,
    expanded,
    toggleReplies,
    loadReplies,
  }
}
