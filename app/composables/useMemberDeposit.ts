/**
 * 会员储值可用性：仅暴露异步加载逻辑。
 * 纯函数请从 ~/utils/memberDeposit 引入，避免与 Nuxt utils 自动导入重名。
 */
import {
  depositApiClient,
  type IDepositInfoItem,
  type IGetDepositInfoResponse,
} from '~/infrastructure/http/clients/DepositApiClient'
import {
  asDepositRecord,
  resolveDepositEnabled,
} from '~/utils/memberDeposit'

export function unwrapDepositInfo(
  response: IGetDepositInfoResponse | null | undefined
): IDepositInfoItem {
  const root = asDepositRecord(response)
  const nested = asDepositRecord(root.data)
  return { ...root, ...nested }
}

/**
 * 拉取储值是否开放：以 deposit/info 内开关字段为准；
 * info 失败视为未开放。不再请求 Admin 的 deposit/settings。
 */
export async function loadDepositAvailability(): Promise<{
  enabled: boolean
  info: IDepositInfoItem | null
}> {
  try {
    const response = await depositApiClient.getDepositInfo()
    const info = unwrapDepositInfo(response)
    const infoEnabled = resolveDepositEnabled(info)
    return { enabled: infoEnabled ?? true, info }
  } catch {
    return { enabled: false, info: null }
  }
}
