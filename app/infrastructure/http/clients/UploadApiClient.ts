/**
 * 图片上传客户端
 *
 * 对齐 vshop `src/utils/upload.js`：
 * 1) GET /wxapp/espier/image_upload_token
 * 2) 按 driver（oss / local / qiniu / aws / cosv5）直传
 *
 * 当前 demo 为 OSS 时，禁止直接调 uploadlocal（会落到 OssUploadTokenService::uploadeImage 报错）。
 */

export interface IUploadImageParams {
  file: File | Blob
  /** 存储类型：image / videos（非 MIME） */
  filetype?: 'image' | 'videos' | string
  group?: string
  newfilename?: string
}

export interface IUploadImageResult {
  url: string
  filetype: string
}

type UploadDriver = 'oss' | 'local' | 'qiniu' | 'aws' | 'cosv5' | string

interface IUploadTokenResponse {
  driver?: UploadDriver
  token?: Record<string, any>
  [key: string]: any
}

function normalizeUploadFiletype(filetype?: string): string {
  if (!filetype) return 'image'
  if (filetype === 'videos' || filetype.startsWith('video/')) return 'videos'
  return 'image'
}

function resolveFilename(file: File | Blob, newfilename?: string): string {
  return (
    newfilename ||
    (file instanceof File ? file.name : '') ||
    'upload.jpg'
  )
}

function joinUrl(host: string, path: string): string {
  const h = String(host || '').replace(/\/+$/, '')
  const p = String(path || '').replace(/^\/+/, '')
  if (!h) return path
  if (!p) return h
  return `${h}/${p}`
}

export class UploadApiClient {
  private $api: any

  private get http() {
    if (!this.$api) {
      const nuxtApp = useNuxtApp()
      this.$api = nuxtApp.$api
    }
    return this.$api
  }

  /**
   * GET /wxapp/espier/image_upload_token
   */
  async getUploadToken(filetype: string = 'image'): Promise<IUploadTokenResponse> {
    return this.http('/wxapp/espier/image_upload_token', {
      method: 'GET',
      query: { filetype },
    })
  }

  /**
   * 按后端 driver 上传文件，返回可访问 URL
   */
  async uploadImage(params: IUploadImageParams): Promise<IUploadImageResult> {
    const filetype = normalizeUploadFiletype(params.filetype)
    const filename = resolveFilename(params.file, params.newfilename)
    const tokenRes = await this.getUploadToken(filetype)
    const driver = String(tokenRes?.driver || 'local').toLowerCase()
    const tokenPayload = {
      ...(tokenRes?.token || tokenRes || {}),
      filetype,
    }

    switch (driver) {
      case 'oss':
        return this.uploadToOss(params.file, filename, tokenPayload)
      case 'qiniu':
        return this.uploadToQiniu(params.file, filename, tokenPayload)
      case 'aws':
        return this.uploadToAws(params.file, filename, tokenPayload)
      case 'local':
      default:
        return this.uploadToLocal(params.file, filename, {
          ...tokenPayload,
          group: params.group,
        })
    }
  }

  /** 阿里云 OSS 表单直传（对齐 vshop aliUpload web） */
  private async uploadToOss(
    file: File | Blob,
    filename: string,
    token: Record<string, any>
  ): Promise<IUploadImageResult> {
    const { accessid, dir, host, policy, signature, filetype } = token
    if (!host || !dir || !accessid || !policy || !signature) {
      throw new Error('OSS_UPLOAD_TOKEN_INVALID')
    }

    const formData = new FormData()
    formData.append('key', dir)
    formData.append('policy', policy)
    formData.append('OSSAccessKeyId', accessid)
    formData.append('success_action_status', '200')
    formData.append('signature', signature)
    formData.append('name', filename)
    formData.append('file', file, filename)

    const res = await fetch(host, { method: 'POST', body: formData })
    if (!res.ok) {
      throw new Error(`OSS_UPLOAD_FAILED:${res.status}`)
    }

    return {
      url: joinUrl(host, dir),
      filetype: filetype || 'image',
    }
  }

  /** 七牛直传 */
  private async uploadToQiniu(
    file: File | Blob,
    filename: string,
    token: Record<string, any>
  ): Promise<IUploadImageResult> {
    const { token: qiniuToken, key, domain, host, filetype } = token
    if (!qiniuToken || !key || !host) {
      throw new Error('QINIU_UPLOAD_TOKEN_INVALID')
    }

    const formData = new FormData()
    formData.append('token', qiniuToken)
    formData.append('key', key)
    formData.append('file', file, filename)

    const res = await fetch(host, { method: 'POST', body: formData })
    if (!res.ok) {
      throw new Error(`QINIU_UPLOAD_FAILED:${res.status}`)
    }
    const data = await res.json().catch(() => ({}))
    const uploadedKey = data?.key || key

    return {
      url: joinUrl(domain || host, uploadedKey),
      filetype: filetype || 'image',
    }
  }

  /** AWS S3 表单直传（对齐 vshop awsUpload） */
  private async uploadToAws(
    file: File | Blob,
    filename: string,
    token: Record<string, any>
  ): Promise<IUploadImageResult> {
    const formInputs = token.formInputs || {}
    const formAttributes = token.formAttributes || {}
    const action = formAttributes.action
    if (!action || !formInputs.key) {
      throw new Error('AWS_UPLOAD_TOKEN_INVALID')
    }

    const formData = new FormData()
    formData.append('key', formInputs.key)
    formData.append('X-Amz-Credential', formInputs.XAmzCredential || '')
    formData.append('X-Amz-Algorithm', formInputs.XAmzAlgorithm || '')
    formData.append('X-Amz-Date', formInputs.XAmzDate || '')
    formData.append('Policy', formInputs.Policy || '')
    formData.append('X-Amz-Signature', formInputs.XAmzSignature || '')
    formData.append('file', file, filename)

    const res = await fetch(action, { method: 'POST', body: formData })
    if (!res.ok && res.status !== 204) {
      throw new Error(`AWS_UPLOAD_FAILED:${res.status}`)
    }

    const location = res.headers.get('Location') || joinUrl(action, formInputs.key)
    return {
      url: location,
      filetype: token.filetype || 'image',
    }
  }

  /** 本地盘：仅当 driver=local 时调用 */
  private async uploadToLocal(
    file: File | Blob,
    filename: string,
    token: Record<string, any>
  ): Promise<IUploadImageResult> {
    const formData = new FormData()
    formData.append('images', file, filename)
    formData.append('name', filename)
    formData.append('filetype', token.filetype || 'image')
    formData.append('group', token.group || 'aftersales')
    formData.append('newfilename', filename)

    const response = await this.http('/wxapp/espier/uploadlocal', {
      method: 'POST',
      body: formData,
    })

    const payload = response?.data ?? response
    let imagePath = ''
    if (typeof payload === 'string') {
      imagePath = payload
    } else if (Array.isArray(payload)) {
      imagePath = String(payload[0]?.image_url || payload[0]?.url || '')
    } else if (payload && typeof payload === 'object') {
      imagePath = String(payload.image_url || payload.url || '')
    }

    if (!imagePath) {
      throw new Error('LOCAL_UPLOAD_URL_EMPTY')
    }

    const domain = String(token.domain || '').replace(/\/+$/, '')
    const url =
      /^https?:\/\//i.test(imagePath) || !domain
        ? imagePath
        : joinUrl(domain, imagePath)

    return {
      url,
      filetype: token.filetype || 'image',
    }
  }
}

export const uploadApiClient = new UploadApiClient()
