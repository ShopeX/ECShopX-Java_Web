import type {
  IAftersalesDetailModel,
  IAftersalesListModel,
  IAftersalesOrderModel,
  IAftersalesProgressStep,
  IApiAftersalesRecord,
  IAftersalesListResponse,
  AftersalesTabKey,
} from '~/types/api/aftersales'
import { OrderTransformer } from './orderTransformer'

const STATUS_TEXT_MAP: Record<Exclude<AftersalesTabKey, 'all'>, string> = {
  pending: '36dbcb31.047109',
  processing: '36dbcb31.5d459d',
  processed: '36dbcb31.5ad605',
  rejected: '36dbcb31.dbf36d',
  closed: '36dbcb31.9c5850',
}

export class AftersalesTransformer {
  private static normalizeFenAmount(value: unknown): number {
    const parsed = Number(value ?? 0)
    if (!Number.isFinite(parsed)) return 0
    return parsed / 100
  }

  private static normalizeRefundAmount(value: unknown): number {
    if (value === null || value === undefined || value === '') return 0
    if (typeof value === 'string') {
      return Number(value) || 0
    }

    return Number(value || 0) || 0
  }

  private static normalizeStatusBucket(rawStatus: string): Exclude<AftersalesTabKey, 'all'> {
    const normalized = rawStatus.trim().toLowerCase()
    const statusCodeMap: Record<string, Exclude<AftersalesTabKey, 'all'>> = {
      '0': 'pending',
      '1': 'processing',
      '2': 'processed',
      '3': 'rejected',
      '4': 'closed',
    }

    if (statusCodeMap[normalized]) {
      return statusCodeMap[normalized]
    }

    if (
      normalized.includes('reject') ||
      normalized.includes('refuse') ||
      normalized.includes('驳回')
    ) {
      return 'rejected'
    }

    if (
      normalized.includes('close') ||
      normalized.includes('cancel') ||
      normalized.includes('closed') ||
      normalized.includes('关闭')
    ) {
      return 'closed'
    }

    if (
      normalized.includes('success') ||
      normalized.includes('finish') ||
      normalized.includes('done') ||
      normalized.includes('complete') ||
      normalized.includes('refund') ||
      normalized.includes('processed') ||
      normalized.includes('已处理')
    ) {
      return 'processed'
    }

    if (
      normalized.includes('process') ||
      normalized.includes('agree') ||
      normalized.includes('sendback') ||
      normalized.includes('shipping') ||
      normalized.includes('received') ||
      normalized.includes('处理中')
    ) {
      return 'processing'
    }

    return 'pending'
  }

  private static formatTimestamp(value: unknown): string {
    const parsed = Number(value ?? 0)
    if (!Number.isFinite(parsed) || parsed <= 0) return ''

    const date = new Date(parsed * 1000)
    const pad = (input: number) => String(input).padStart(2, '0')

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  }

  private static buildReceiverAddress(orderInfo: any, record: IApiAftersalesRecord): string {
    const orderAddress = [
      orderInfo.receiver_state,
      orderInfo.receiver_city,
      orderInfo.receiver_district,
      orderInfo.receiver_address,
    ]
      .filter(Boolean)
      .join(' ')

    if (orderAddress) return orderAddress

    return String(record.aftersales_address?.aftersales_address || '')
  }

  private static normalizeEvidencePics(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === 'string' && item.length > 0)
    }

    if (typeof value === 'string' && value.trim()) {
      try {
        const parsed = JSON.parse(value)
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (item): item is string => typeof item === 'string' && item.length > 0
          )
        }
      } catch {
        return [value]
      }
    }

    return []
  }

  private static deriveProgressSteps(record: IApiAftersalesRecord): IAftersalesProgressStep[] {
    const labels = ['36dbcb31.0830b4', '36dbcb31.f6324c', '36dbcb31.265b00']
    const progress = Number(record.progress ?? 0)
    const activeCount = Math.min(labels.length, Math.max(1, progress + 1))

    return labels.map((label, index) => ({
      key: `step-${index + 1}`,
      label,
      active: index < activeCount,
    }))
  }

  private static resolveDetailItems(record: IApiAftersalesRecord) {
    const source = record.detail || []

    return source.map((item: any) => {
      const orderItem = item.orderItem || item
      const mappedItem = OrderTransformer.toOrderItemModel({
        ...orderItem,
        id: item.detail_id || orderItem.id,
        item_id: item.item_id || orderItem.item_id,
        item_name: item.item_name || orderItem.item_name,
        item_pic: item.item_pic || orderItem.pic || orderItem.item_pic,
        num: item.num ?? orderItem.num,
      })

      return {
        ...mappedItem,
        detailId: String(item.detail_id || mappedItem.detailId),
      }
    })
  }

  private static resolveItems(record: IApiAftersalesRecord) {
    const source =
      record.detail ||
      record.item_infos ||
      record.items ||
      record.order_items ||
      record.goods_list ||
      (record.item_id || record.item_name ? [record] : [])

    return (source || []).map((item: any) => {
      const orderItem = OrderTransformer.toOrderItemModel(item)
      if (orderItem.price > 0) {
        return {
          ...orderItem,
          detailId: String(item.detail_id || orderItem.detailId),
        }
      }

      const refundAmount = AftersalesTransformer.normalizeRefundAmount(
        item.refund_fee ?? item.refund_money ?? record.refund_fee ?? record.refund_amount
      )
      const quantity = Number(orderItem.quantity || 0)
      const price = quantity > 0 ? refundAmount / quantity : refundAmount

      return {
        ...orderItem,
        detailId: String(item.detail_id || orderItem.detailId),
        price,
        subtotal: price * quantity,
      }
    })
  }

  static toAftersalesOrderModel(record: IApiAftersalesRecord): IAftersalesOrderModel {
    const items = AftersalesTransformer.resolveItems(record)
    const rawStatus = String(
      record.aftersales_status ??
        record.status ??
        record.aftersales_status_name ??
        record.status_name ??
        ''
    )
    const statusBucket = AftersalesTransformer.normalizeStatusBucket(rawStatus)

    return {
      aftersalesId: String(record.aftersales_id || record.id || record.aftersales_bn || ''),
      orderId: String(record.order_id || record.tid || ''),
      status: statusBucket,
      statusText:
        record.aftersales_status_name || record.status_name || STATUS_TEXT_MAP[statusBucket],
      storeName: String(
        record.store_name ||
          record.shop_name ||
          record.distributor_name ||
          record.distributor_info?.store_name ||
          record.distributor_info?.name ||
          ''
      ),
      refundAmount: AftersalesTransformer.normalizeRefundAmount(
        record.refund_amount ??
          record.refund_fee ??
          record.refund_money ??
          record.amount ??
          record.total_amount
      ),
      items,
      itemCount: items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    }
  }

  static toAftersalesDetailModel(record: IApiAftersalesRecord): IAftersalesDetailModel {
    const orderInfo = record.app_info?.order_info || record.order_info || {}
    const refundInfo = record.refund_info || {}
    const items = AftersalesTransformer.resolveDetailItems(record)
    const statusBucket = AftersalesTransformer.normalizeStatusBucket(
      String(record.aftersales_status ?? '')
    )

    return {
      aftersalesId: String(record.aftersales_bn || record.aftersales_id || record.id || ''),
      orderId: String(record.order_id || orderInfo.order_id || ''),
      status: statusBucket,
      statusText: String(record.app_info?.status_msg || STATUS_TEXT_MAP[statusBucket] || ''),
      progressText: String(record.app_info?.progress_msg || ''),
      actionButtons: Array.isArray(record.app_info?.buttons) ? record.app_info.buttons : [],
      progressSteps: AftersalesTransformer.deriveProgressSteps(record),
      storeName: String(
        record.distributor_info?.store_name ||
          record.distributor_info?.name ||
          record.store_name ||
          record.shop_name ||
          record.distributor_name ||
          ''
      ),
      items,
      itemCount: items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
      refundAmount: AftersalesTransformer.normalizeRefundAmount(
        refundInfo.refund_fee ?? record.refund_fee ?? record.refund_amount
      ),
      receiverName: String(orderInfo.receiver_name || record.contact || ''),
      receiverMobile: String(orderInfo.receiver_mobile || record.mobile || ''),
      receiverAddress: AftersalesTransformer.buildReceiverAddress(orderInfo, record),
      reason: String(record.reason || ''),
      description: String(record.description || ''),
      evidencePics: AftersalesTransformer.normalizeEvidencePics(record.evidence_pic),
      paymentMethod: String(orderInfo.app_pay_type_desc || orderInfo.pay_type || ''),
      payTime: AftersalesTransformer.formatTimestamp(
        orderInfo.delivery_time || orderInfo.update_time
      ),
      orderTime: AftersalesTransformer.formatTimestamp(orderInfo.create_time || record.create_time),
      goodsAmount: AftersalesTransformer.normalizeFenAmount(orderInfo.item_fee),
      freightAmount: AftersalesTransformer.normalizeFenAmount(orderInfo.freight_fee),
      discountAmount: AftersalesTransformer.normalizeFenAmount(orderInfo.discount_fee),
      pointDeductionAmount: AftersalesTransformer.normalizeFenAmount(orderInfo.point_fee),
      paidAmount: AftersalesTransformer.normalizeFenAmount(orderInfo.total_fee),
    }
  }

  static toAftersalesListModel(response: IAftersalesListResponse): IAftersalesListModel {
    const payload = response?.data ?? response ?? {}
    const list = Array.isArray(payload.list) ? payload.list : []

    return {
      orders: list.map((record) => AftersalesTransformer.toAftersalesOrderModel(record)),
      total: Number(payload.total_count || response?.total_count || 0),
    }
  }
}
