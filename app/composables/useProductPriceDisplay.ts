import type { Ref } from 'vue'
import { formatMoneyFen } from '~/utils/currencyFormat'

interface ProductPriceRefs {
  salePriceCents: Ref<number>
  marketPriceCents: Ref<number>
  memberPriceCents: Ref<number>
}

/**
 * 商品价格展示（对齐小程序 SpGoodsPrice）
 *
 * - 无会员价优惠：销售价 + 划线市场价
 * - 有会员价（member_price < price）：会员价 + 销售价，不展示市场价
 */
export function useProductPriceDisplay({
  salePriceCents,
  marketPriceCents,
  memberPriceCents,
}: ProductPriceRefs) {
  const hasMemberPrice = computed(() => {
    return (
      memberPriceCents.value > 0 && memberPriceCents.value < salePriceCents.value
    )
  })

  const showMarketPrice = computed(() => {
    return (
      !hasMemberPrice.value &&
      marketPriceCents.value > 0 &&
      salePriceCents.value < marketPriceCents.value
    )
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
    finalPriceCents,
    formatPriceYuan,
    formatDisplayFromFen,
  }
}
