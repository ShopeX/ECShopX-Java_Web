/**
 * 售后 HTTP 客户端
 *
 * 职责：
 * - 封装售后申请相关的 HTTP 请求
 * - 只负责网络通信，不做数据转换
 * - 返回原始 API 响应
 */

import { uploadApiClient } from './UploadApiClient'

export interface ICreateAftersalesDetailItem {
  id: string
  num: number
}

export interface ICreateAftersalesParams {
  order_id: string
  reason: string
  aftersales_type: 'ONLY_REFUND' | 'REFUND_GOODS' | 'EXCHANGING_GOODS'
  description?: string
  evidence_pic?: string
  freight?: number | string
  return_type?: 'logistics' | 'ziti' | 'merchant'
  detail: ICreateAftersalesDetailItem[]
}

export interface IAftersalesListParams {
  page?: number
  pageSize?: number
  order_type?: string
  aftersales_type?: string
  aftersales_status?: string
  order_id?: string
}

export interface IAftersalesDetailParams {
  aftersales_bn: string
  item_id: string
}

export interface IUploadLocalImageParams {
  /** 真实 File，按 disk driver 分流上传（对齐 vshop） */
  file: File | Blob
  /** 存储类型：image / videos（非 MIME，如 image/jpeg） */
  filetype?: 'image' | 'videos' | string
  group?: string
  /** 原始文件名 */
  newfilename?: string
}

export class AftersalesApiClient {
  private $api: any

  private get http() {
    if (!this.$api) {
      const nuxtApp = useNuxtApp()
      this.$api = nuxtApp.$api
    }
    return this.$api
  }

  /**
   * 获取售后单列表
   * GET /wxapp/aftersales
   */
  async getAftersalesList(params: IAftersalesListParams = {}): Promise<any> {
    return this.http('/wxapp/aftersales', {
      method: 'GET',
      query: {
        page: params.page,
        pageSize: params.pageSize,
        order_type: params.order_type || 'normal',
        aftersales_type: params.aftersales_type,
        aftersales_status: params.aftersales_status,
        order_id: params.order_id,
      },
    })
  }

  /**
   * 获取售后原因列表
   * GET /wxapp/aftersales/reason/list
   */
  async getAftersalesReasonList(): Promise<any> {
    return this.http('/wxapp/aftersales/reason/list', {
      method: 'GET',
    })
  }

  /**
   * 获取售后单详情
   * GET /wxapp/aftersales/info
   */
  async getAftersalesDetail(params: IAftersalesDetailParams): Promise<any> {
    return this.http('/wxapp/aftersales/info', {
      method: 'GET',
      query: {
        aftersales_bn: params.aftersales_bn,
        item_id: params.item_id,
      },
    })
  }

  /**
   * 上传图片（按 image_upload_token.driver 分流，对齐 vshop upload.js）
   * OSS 环境禁止直调 uploadlocal
   * 返回形态兼容 extractUploadedImageUrl：{ data: { image_url } }
   */
  async uploadLocalImage(params: IUploadLocalImageParams): Promise<any> {
    const result = await uploadApiClient.uploadImage({
      file: params.file,
      filetype: params.filetype,
      group: params.group,
      newfilename: params.newfilename,
    })
    return {
      data: {
        image_url: result.url,
        url: result.url,
      },
    }
  }

  /**
   * 提交售后申请
   * POST /wxapp/aftersales
   */
  async submitAftersales(params: ICreateAftersalesParams): Promise<any> {
    const body: Record<string, string | number> = {
      order_id: params.order_id,
      aftersales_type: params.aftersales_type,
      reason: params.reason,
      description: params.description ?? '',
      evidence_pic: params.evidence_pic ?? '',
      freight: params.freight ?? 0,
      return_type: params.return_type ?? 'logistics',
    }

    params.detail.forEach((item, index) => {
      body[`detail[${index}][id]`] = item.id
      body[`detail[${index}][num]`] = item.num
    })

    return this.http('/wxapp/aftersales', {
      method: 'POST',
      body,
    })
  }

  /**
   * 撤销售后申请
   * POST /wxapp/aftersales/close
   */
  async cancelAftersales(aftersalesBn: string, itemId?: string): Promise<any> {
    return this.http('/wxapp/aftersales/close', {
      method: 'POST',
      query: {
        aftersales_bn: aftersalesBn,
      },
    })
  }
}

export const aftersalesApiClient = new AftersalesApiClient()
