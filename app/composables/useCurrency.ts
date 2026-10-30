import { commonApiClient } from '~/infrastructure/http/clients'
import type { ICurrencySetting, IFrontendCommonSetting } from '~/types/api/common'
import {
  formatMoneyFen,
  formatMoneyYuan,
  getCurrencySymbol,
  applyCurrencyFromSetting,
  resolveCurrencySymbolFromSetting,
} from '~/utils/currencyFormat'

function applyCurrencySetting(setting?: IFrontendCommonSetting | null): ICurrencySetting | null {
  applyCurrencyFromSetting(setting)
  return setting?.currency || null
}

export async function useCurrency() {
  const currencyCache = useCookie<IFrontendCommonSetting>('frontend-currency-cache', {
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
  })
  const setting = useState<IFrontendCommonSetting>(
    'frontend-currency-setting',
    () => currencyCache.value || {}
  )

  if (setting.value && Object.keys(setting.value).length > 0) {
    applyCurrencySetting(setting.value)
  }

  const { data, pending, error, refresh } = await useAsyncData(
    'frontend-currency-setting',
    async () => {
      return (await commonApiClient.getFrontendSetting()) || {}
    },
    {
      default: () => setting.value,
    }
  )

  watch(
    data,
    (val) => {
      if (val) {
        setting.value = val
        currencyCache.value = val
        applyCurrencySetting(val)
      }
    },
    { immediate: true }
  )

  const currencySymbol = computed(() => resolveCurrencySymbolFromSetting(setting.value.currency))
  const currencyCode = computed(() => setting.value.currency?.currency || 'CNY')

  const formatFromYuan = (amount: number) => formatMoneyYuan(amount)
  const formatFromFen = (fen: number) => formatMoneyFen(fen)

  return {
    setting,
    currencySymbol,
    currencyCode,
    formatFromYuan,
    formatFromFen,
    getCurrencySymbol,
    pending,
    error,
    refresh,
  }
}
