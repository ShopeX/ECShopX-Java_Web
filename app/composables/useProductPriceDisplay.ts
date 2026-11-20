import type { Ref } from 'vue'
import { formatMoneyFen } from '~/utils/currencyFormat'
import { useItemPriceSettingState } from '~/composables/useItemPriceSetting'
import {
  shouldShowMarketPrice,
  shouldShowNonMemberPrice,
} from '~/utils/itemPriceSetting'

interface ProductPriceRefs {
  salePriceCents: Ref<number>
  marketPriceCents: Ref<number>
  memberPriceCents: Ref<number>
}

/**
 * 商品价格展示（对齐小程序 SpGoodsPrice）
 *
 * - 无会员价优惠：销售价 + 划线市场价（受通用设置 item_page.market_price 约束）
 * - 有会员价（member_price < price）：会员价 +「非会员价/销售价」（后者同受 market_price 约束）
 */
export function useProductPriceDisplay({
  salePriceCents,
  marketPriceCents,
  memberPriceCents,
}: ProductPriceRefs) {
  const { allowItemMarketPrice } = useItemPriceSettingState()

  const hasMemberPrice = computed(() => {
    return (
      memberPriceCents.value > 0 && memberPriceCents.value < salePriceCents.value
    )
  })

  const showMarketPrice = computed(() => {
    return shouldShowMarketPrice({
      salePriceCents: salePriceCents.value,
      marketPriceCents: marketPriceCents.value,
      hasMemberPrice: hasMemberPrice.value,
      allowMarketPrice: allowItemMarketPrice.value,
    })
  })

  /** 会员价下方的「非会员价」对比行；原价开关关闭时不展示 */
  const showNonMemberPrice = computed(() => {
    return shouldShowNonMemberPrice({
      hasMemberPrice: hasMemberPrice.value,
      allowMarketPrice: allowItemMarketPrice.value,
      salePriceCents: salePriceCents.value,
    })
  })

  const finalPriceCents = computed(() => {
    if (hasMemberPrice.value) {
      return memberPriceCents.value
    }
    return salePriceCents.value
  })

  const formatPriceYuan = (priceCents: number) => {
    return (priceCents / 100).toLocaleString('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const formatDisplayFromFen = (priceCents: number) => formatMoneyFen(priceCents)

  return {
    hasMemberPrice,
    showMarketPrice,
    showNonMemberPrice,
    finalPriceCents,
    formatPriceYuan,
    formatDisplayFromFen,
  }
}
