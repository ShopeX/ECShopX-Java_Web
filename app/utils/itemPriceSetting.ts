/**
 * 通用设置「商品价格展示」配置（对齐 /wxapp/setting/itemPrice）
 */

export interface IItemPagePriceSetting {
  /** 是否展示原价（划线市场价） */
  market_price: boolean
  /** 是否展示会员等级价 */
  member_price: boolean
  /** 是否展示付费会员价 */
  svip_price: boolean
}

export interface ISceneMarketPriceSetting {
  market_price: boolean
}

export interface IItemPriceSetting {
  item_page: IItemPagePriceSetting
  cart_page: ISceneMarketPriceSetting
  order_page: ISceneMarketPriceSetting
}

/** 与后端 SettingService::getItemPriceSetting 无缓存时的默认一致 */
export const DEFAULT_ITEM_PRICE_SETTING: IItemPriceSetting = {
  cart_page: { market_price: true },
  order_page: { market_price: true },
  item_page: {
    market_price: true,
    member_price: false,
    svip_price: false,
  },
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') return value
  if (value === 'true' || value === 1 || value === '1') return true
  if (value === 'false' || value === 0 || value === '0') return false
  return fallback
}

export function normalizeItemPriceSetting(raw: unknown): IItemPriceSetting {
  const source =
    raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const itemPage =
    source.item_page && typeof source.item_page === 'object'
      ? (source.item_page as Record<string, unknown>)
      : {}
  const cartPage =
    source.cart_page && typeof source.cart_page === 'object'
      ? (source.cart_page as Record<string, unknown>)
      : {}
  const orderPage =
    source.order_page && typeof source.order_page === 'object'
      ? (source.order_page as Record<string, unknown>)
      : {}

  return {
    cart_page: {
      market_price: asBoolean(
        cartPage.market_price,
        DEFAULT_ITEM_PRICE_SETTING.cart_page.market_price
      ),
    },
    order_page: {
      market_price: asBoolean(
        orderPage.market_price,
        DEFAULT_ITEM_PRICE_SETTING.order_page.market_price
      ),
    },
    item_page: {
      market_price: asBoolean(
        itemPage.market_price,
        DEFAULT_ITEM_PRICE_SETTING.item_page.market_price
      ),
      member_price: asBoolean(
        itemPage.member_price,
        DEFAULT_ITEM_PRICE_SETTING.item_page.member_price
      ),
      svip_price: asBoolean(
        itemPage.svip_price,
        DEFAULT_ITEM_PRICE_SETTING.item_page.svip_price
      ),
    },
  }
}

/**
 * 列表/商详是否展示划线市场价（原价）
 * 需同时满足价差条件与通用设置 item_page.market_price
 */
export function shouldShowMarketPrice(params: {
  salePriceCents: number
  marketPriceCents: number
  hasMemberPrice: boolean
  allowMarketPrice: boolean
}): boolean {
  const { salePriceCents, marketPriceCents, hasMemberPrice, allowMarketPrice } = params
  return (
    allowMarketPrice &&
    !hasMemberPrice &&
    marketPriceCents > 0 &&
    salePriceCents < marketPriceCents
  )
}

/**
 * 有会员价时是否展示「非会员价 / 销售价」对比行
 * 同样受 market_price（原价展示）开关约束：关闭时只展示会员成交价
 */
export function shouldShowNonMemberPrice(params: {
  hasMemberPrice: boolean
  allowMarketPrice: boolean
  salePriceCents: number
}): boolean {
  const { hasMemberPrice, allowMarketPrice, salePriceCents } = params
  return allowMarketPrice && hasMemberPrice && salePriceCents > 0
}
