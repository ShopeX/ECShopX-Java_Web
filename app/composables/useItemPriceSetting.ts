import { commonApiClient } from '~/infrastructure/http/clients'
import {
  DEFAULT_ITEM_PRICE_SETTING,
  normalizeItemPriceSetting,
  type IItemPriceSetting,
} from '~/utils/itemPriceSetting'

/**
 * 商品价格展示开关（对齐小程序 sys.priceSetting / GET /wxapp/setting/itemPrice）
 */
export async function useItemPriceSetting() {
  const settingCache = useCookie<IItemPriceSetting>('item-price-setting-cache', {
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
  })

  const cached = settingCache.value
    ? normalizeItemPriceSetting(settingCache.value)
    : DEFAULT_ITEM_PRICE_SETTING

  const setting = useState<IItemPriceSetting>('item-price-setting', () => cached)

  const { data, pending, error, refresh } = await useAsyncData(
    'item-price-setting',
    async () => {
      try {
        return await commonApiClient.getItemPriceSetting()
      } catch {
        return setting.value?.item_page
          ? setting.value
          : DEFAULT_ITEM_PRICE_SETTING
      }
    },
    {
      default: () => setting.value,
    }
  )

  watch(
    data,
    (val) => {
      if (!val) return
      const normalized = normalizeItemPriceSetting(val)
      setting.value = normalized
      settingCache.value = normalized
    },
    { immediate: true }
  )

  const allowItemMarketPrice = computed(() => setting.value.item_page.market_price)
  const allowCartMarketPrice = computed(() => setting.value.cart_page.market_price)
  const allowOrderMarketPrice = computed(() => setting.value.order_page.market_price)

  return {
    setting,
    allowItemMarketPrice,
    allowCartMarketPrice,
    allowOrderMarketPrice,
    pending,
    error,
    refresh,
  }
}

/** 同步读取已缓存的价格展示开关（供非 async 的价格 composable 使用） */
export function useItemPriceSettingState() {
  const setting = useState<IItemPriceSetting>(
    'item-price-setting',
    () => DEFAULT_ITEM_PRICE_SETTING
  )

  return {
    setting,
    allowItemMarketPrice: computed(() => setting.value.item_page.market_price),
    allowCartMarketPrice: computed(() => setting.value.cart_page.market_price),
    allowOrderMarketPrice: computed(() => setting.value.order_page.market_price),
  }
}
