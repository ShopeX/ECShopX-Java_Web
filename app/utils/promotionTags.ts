/**
 * 营销标签映射（对齐 vshop SpGoodsItem / limited-buy / cart promotions）
 */

export type MarketingTagVariant = 'solid' | 'outline'

export interface IMarketingTag {
  /** 活动类型：tag_type / marketing_type */
  type: string
  /** 后端已给文案时优先使用 */
  text?: string
  /** 无文案时的 i18n 兜底 key */
  textKey?: string
  /** i18n 参数 */
  textParams?: Record<string, string | number>
  variant: MarketingTagVariant
  id?: string
}

/** PROMOTION_TAG 兜底文案（对齐 vshop consts PROMOTION_TAG / SpGoodsItem PROMOTION_TAG_KEY） */
export const PROMOTION_TAG_I18N_KEYS: Record<string, string> = {
  single_group: '237e57a8.95360f',
  full_minus: '237e57a8.89d77d',
  full_discount: '237e57a8.51f3c5',
  full_gift: '237e57a8.22f046',
  normal: '237e57a8.fea087',
  limited_time_sale: '237e57a8.62d0cc',
  plus_price_buy: '237e57a8.c133a3',
  member_preference: '237e57a8.c676d0',
}

export const LIMITED_BUY_I18N_KEYS = {
  /** 限购{limit}件 */
  limitPcs: '237e57a8.5c377a',
  /** 每{day}天，限购{limit}件 */
  limitDays: '237e57a8.4b8367',
} as const

/** 实心：拼团、秒杀；其余描边 */
const SOLID_TAG_TYPES = new Set(['single_group', 'normal'])

export function resolveMarketingTagVariant(type: string): MarketingTagVariant {
  return SOLID_TAG_TYPES.has(type) ? 'solid' : 'outline'
}

function asArray(value: unknown): any[] {
  return Array.isArray(value) ? value : []
}

/**
 * 详情页 activity_type / ACTIVITY_LIST 别名 → PROMOTION_TAG 类型
 * 注意：商品默认 activity_type=normal 不代表秒杀，不可直接映射
 */
const ACTIVITY_TYPE_TO_TAG_TYPE: Record<string, string> = {
  group: 'single_group',
  single_group: 'single_group',
  seckill: 'normal',
  limited_time_sale: 'limited_time_sale',
}

export function resolveActivityTagType(source: any): string | null {
  if (!source || typeof source !== 'object') {
    return null
  }

  const activityInfo = source.activity_info || source.activityInfo || {}
  const candidates = [
    activityInfo.seckill_type,
    activityInfo.tag_type,
    activityInfo.marketing_type,
    source.activity_type,
    source.activityType,
  ]

  for (const candidate of candidates) {
    const raw = candidate != null ? String(candidate).trim() : ''
    if (!raw) continue
    // 商品默认类型 normal 不是秒杀活动，需 seckill_type 等明确字段才映射
    if (raw === 'normal' && candidate !== activityInfo.seckill_type) {
      continue
    }
    if (ACTIVITY_TYPE_TO_TAG_TYPE[raw]) {
      return ACTIVITY_TYPE_TO_TAG_TYPE[raw]
    }
    if (PROMOTION_TAG_I18N_KEYS[raw]) {
      return raw
    }
  }

  return null
}

/**
 * 从商品/购物车/订单行解析活动数组
 * 优先 promotions（购物车），其次 promotion_activity（列表/详情），兼容 promotion
 * 注意：详情里 activity_info 常为对象（秒杀信息），不能当活动数组优先消费
 */
export function resolvePromotionActivities(source: any): any[] {
  if (!source || typeof source !== 'object') {
    return []
  }

  if (Array.isArray(source)) {
    return source
  }

  const promotions = asArray(source.promotions)
  if (promotions.length > 0) {
    return promotions
  }

  // 仅当 activity_info 为数组时按购物车路径解析（对象留给 collectActivityTypeTags）
  const activityInfo = asArray(source.activity_info)
  if (activityInfo.length > 0) {
    return activityInfo.map((item) => ({
      ...item,
      promotion_tag: item.promotion_tag || item.info || item.tag_name,
      tag_type: item.tag_type || item.marketing_type || item.type,
      marketing_type: item.marketing_type || item.tag_type || item.type,
    }))
  }

  const promotionActivity = asArray(source.promotion_activity)
  if (promotionActivity.length > 0) {
    return promotionActivity
  }

  return asArray(source.promotion)
}

function pushUniqueTag(tags: IMarketingTag[], tag: IMarketingTag | null) {
  if (!tag) return
  const fingerprint = `${tag.type}|${tag.text || ''}|${tag.textKey || ''}|${JSON.stringify(tag.textParams || {})}`
  if (tags.some((item) => `${item.type}|${item.text || ''}|${item.textKey || ''}|${JSON.stringify(item.textParams || {})}` === fingerprint)) {
    return
  }
  tags.push(tag)
}

/** 合并多来源营销标签（推荐列表 + 详情等），按 type/text 去重 */
export function mergeMarketingTags(
  ...tagLists: Array<readonly IMarketingTag[] | IMarketingTag[] | null | undefined>
): IMarketingTag[] {
  const tags: IMarketingTag[] = []

  tagLists.forEach((list) => {
    if (!Array.isArray(list)) return
    list.forEach((tag) => pushUniqueTag(tags, tag))
  })

  return tags
}

/**
 * 对齐 vshop formatLimitedBuyRuleText
 */
export function formatLimitedBuyRuleTag(rule: any): IMarketingTag | null {
  if (!rule || rule.limit == null || rule.limit === '') {
    return null
  }

  const limit = rule.limit
  if (Number(rule.day) === 0) {
    return {
      type: 'limited_buy',
      textKey: LIMITED_BUY_I18N_KEYS.limitPcs,
      textParams: { limit },
      variant: 'outline',
    }
  }

  return {
    type: 'limited_buy',
    textKey: LIMITED_BUY_I18N_KEYS.limitDays,
    textParams: { day: rule.day, limit },
    variant: 'outline',
  }
}

/**
 * 对齐 vshop collectLimitedBuyTagTexts
 */
export function collectLimitedBuyTags(info: any = {}): IMarketingTag[] {
  const tags: IMarketingTag[] = []

  const pushText = (text: unknown, type = 'limited_buy') => {
    const value = text != null ? String(text).trim() : ''
    if (!value) return
    pushUniqueTag(tags, {
      type,
      text: value,
      variant: 'outline',
    })
  }

  if (info.activityType === 'limited_buy' || info.activity_type === 'limited_buy') {
    const activityInfo = info.activityInfo || info.activity_info || {}
    pushUniqueTag(tags, formatLimitedBuyRuleTag(activityInfo.rule))
    pushText(activityInfo.activity_tag)
    pushText(activityInfo.promotion_tag)
  }

  // 结算：vshop 从 items_promotion 注入 cusActivity（限购）
  const cusActivity = asArray(info.cusActivity || info.items_promotion)
  cusActivity.forEach((el) => {
    if (el?.activity_type !== 'limited_buy' && el?.tag_type !== 'limited_buy') return
    pushText(el.activity_tag || el.promotion_tag || el.tag_name)
    pushUniqueTag(tags, formatLimitedBuyRuleTag(el.rule || el.activity_rule || el))
  })

  const promotions = resolvePromotionActivities(info)
  promotions.forEach((item) => {
    const type = item?.tag_type || item?.marketing_type
    if (type !== 'limited_buy') return
    pushText(item.promotion_tag || item.tag_name)
    pushUniqueTag(tags, formatLimitedBuyRuleTag(item.rule || item.activity_rule))
  })

  return tags
}

function mapActivityItem(item: any): IMarketingTag | null {
  if (!item || typeof item !== 'object') {
    return null
  }

  // 购物车扁平结构：仅有 promotion_tag；结算 discount_info 用 info
  const type = String(item.tag_type || item.marketing_type || item.type || 'promotion')
  if (type === 'limited_buy') {
    return null
  }

  const text = String(item.promotion_tag || item.tag_name || item.info || '').trim()
  const textKey = !text ? PROMOTION_TAG_I18N_KEYS[type] : undefined

  if (!text && !textKey) {
    return null
  }

  return {
    type,
    text: text || undefined,
    textKey,
    variant: resolveMarketingTagVariant(type),
    id: String(item.promotion_id || item.marketing_id || item.item_id || ''),
  }
}

function shouldShowSpecificCrowd(source: any, activities: any[]): boolean {
  const specificCrowd = source?.specific_crowd
  if (!specificCrowd?.id && !specificCrowd?.promotion_tag) {
    return false
  }

  const activityInfo = source.activity_info || source.activityInfo || {}
  if (activityInfo.seckill_type === 'limited_time_sale') {
    return false
  }

  const activityType = resolveActivityTagType(source)
  if (activityType === 'limited_time_sale' || activityType === 'normal') {
    return false
  }

  return !activities.some((item) => {
    const type = item?.tag_type || item?.marketing_type
    return type === 'limited_time_sale' || type === 'normal'
  })
}

/**
 * 详情常见：promotion_activity 为空，仅有 activity_type / activity_info.seckill_type
 * 对齐 vshop ACTIVITY_LIST 展示限时特惠/秒杀/拼团文字标签
 */
export function collectActivityTypeTags(source: any = {}): IMarketingTag[] {
  const tags: IMarketingTag[] = []
  const activityInfo = source.activity_info || source.activityInfo || {}
  const type = resolveActivityTagType(source)
  if (!type) {
    return tags
  }

  const explicitText = String(
    activityInfo.promotion_tag || activityInfo.activity_tag || activityInfo.info || ''
  ).trim()

  pushUniqueTag(tags, {
    type,
    text: explicitText || undefined,
    textKey: explicitText ? undefined : PROMOTION_TAG_I18N_KEYS[type],
    variant: resolveMarketingTagVariant(type),
    id: String(activityInfo.seckill_id || activityInfo.marketing_id || ''),
  })

  return tags
}

/**
 * 结算页 SpGoodsCell：discount_info[].info（排除优惠券/会员价）
 */
export function collectDiscountInfoTags(source: any = {}): IMarketingTag[] {
  const tags: IMarketingTag[] = []
  const list = asArray(source.discount_info)

  list.forEach((sp) => {
    const type = String(sp?.type || sp?.tag_type || sp?.marketing_type || 'promotion')
    if (type === 'coupon_discount' || type === 'member_price') {
      return
    }
    const text = String(sp?.info || sp?.promotion_tag || sp?.tag_name || '').trim()
    if (!text) {
      return
    }
    pushUniqueTag(tags, {
      type,
      text,
      variant: resolveMarketingTagVariant(type),
      id: String(sp?.marketing_id || sp?.promotion_id || ''),
    })
  })

  return tags
}

/**
 * 将 vshop 同源活动字段映射为 IMarketingTag[]
 *
 * 文案优先级对齐 SpGoodsItem：
 * promotion_tag || tag_name || PROMOTION_TAG[type]
 *
 * 结算页额外对齐 SpGoodsCell：
 * discount_info[].info + items_promotion 限购
 */
export function mapPromotionTags(raw: any): IMarketingTag[] {
  const source = raw && typeof raw === 'object' ? raw : {}
  const isBareArray = Array.isArray(raw)
  const activities = isBareArray ? raw : resolvePromotionActivities(source)
  const tags: IMarketingTag[] = []

  if (!isBareArray) {
    collectLimitedBuyTags(source).forEach((tag) => pushUniqueTag(tags, tag))
    collectDiscountInfoTags(source).forEach((tag) => pushUniqueTag(tags, tag))
  }

  activities
    .filter((item) => {
      const type = item?.tag_type || item?.marketing_type || item?.type
      return type !== 'limited_buy'
    })
    .forEach((item) => pushUniqueTag(tags, mapActivityItem(item)))

  // 详情秒杀/限时特惠等：无 promotion_activity 时用 activity_type 兜底
  if (!isBareArray) {
    const existingTypes = new Set(tags.map((tag) => tag.type))
    collectActivityTypeTags(source).forEach((tag) => {
      if (!existingTypes.has(tag.type)) {
        pushUniqueTag(tags, tag)
      }
    })
  }

  if (!isBareArray && shouldShowSpecificCrowd(source, activities)) {
    const crowdTag = String(source.specific_crowd?.promotion_tag || '').trim()
    if (crowdTag) {
      pushUniqueTag(tags, {
        type: 'specific_crowd',
        text: crowdTag,
        variant: 'outline',
      })
    }
  }

  // 兼容订单行仅有扁平 promotion_tag
  if (!isBareArray && tags.length === 0) {
    const flatTag = String(source.promotion_tag || '').trim()
    if (flatTag) {
      pushUniqueTag(tags, {
        type: String(source.tag_type || source.marketing_type || 'promotion'),
        text: flatTag,
        variant: resolveMarketingTagVariant(
          String(source.tag_type || source.marketing_type || '')
        ),
      })
    }
  }

  return tags
}

/**
 * 解析展示文案（组件内使用）
 */
export function resolveMarketingTagText(
  tag: IMarketingTag,
  t: (key: string, params?: Record<string, string | number>) => string
): string {
  if (tag.text) {
    return tag.text
  }
  if (tag.textKey) {
    return t(tag.textKey, tag.textParams || {})
  }
  return ''
}
