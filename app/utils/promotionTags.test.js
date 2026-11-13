import assert from 'node:assert/strict'
import test from 'node:test'
import {
  mapPromotionTags,
  mergeMarketingTags,
  resolveMarketingTagVariant,
  PROMOTION_TAG_I18N_KEYS,
  LIMITED_BUY_I18N_KEYS,
} from './promotionTags.ts'

test('mapPromotionTags prefers promotion_tag then tag_name then i18n key', () => {
  const tags = mapPromotionTags({
    promotion_activity: [
      { tag_type: 'single_group', promotion_tag: '今日拼团' },
      { marketing_type: 'full_minus', tag_name: '满100减20' },
      { tag_type: 'normal' },
    ],
  })

  assert.equal(tags.length, 3)
  assert.equal(tags[0].text, '今日拼团')
  assert.equal(tags[0].variant, 'solid')
  assert.equal(tags[1].text, '满100减20')
  assert.equal(tags[1].variant, 'outline')
  assert.equal(tags[2].textKey, PROMOTION_TAG_I18N_KEYS.normal)
  assert.equal(tags[2].variant, 'solid')
})

test('mapPromotionTags filters limited_buy from activities and collects limited buy tags', () => {
  const tags = mapPromotionTags({
    promotion_activity: [
      { tag_type: 'limited_buy', promotion_tag: '限购标签' },
      { tag_type: 'limited_time_sale', promotion_tag: '限时特惠' },
    ],
  })

  assert.deepEqual(
    tags.map((tag) => tag.text),
    ['限购标签', '限时特惠']
  )
  assert.equal(tags[0].type, 'limited_buy')
  assert.equal(tags[1].type, 'limited_time_sale')
})

test('mapPromotionTags prefers cart promotions / activity_info over promotion_activity', () => {
  const fromPromotions = mapPromotionTags({
    promotions: [{ promotion_tag: '购物车满减' }],
    promotion_activity: [{ tag_type: 'full_minus', promotion_tag: '列表满减' }],
  })
  assert.equal(fromPromotions.length, 1)
  assert.equal(fromPromotions[0].text, '购物车满减')

  const fromActivityInfo = mapPromotionTags({
    activity_info: [{ info: '活动说明标签' }],
  })
  assert.equal(fromActivityInfo.length, 1)
  assert.equal(fromActivityInfo[0].text, '活动说明标签')
})

test('mapPromotionTags supports bare activity arrays', () => {
  const tags = mapPromotionTags([{ tag_type: 'plus_price_buy', promotion_tag: '加价购' }])
  assert.equal(tags.length, 1)
  assert.equal(tags[0].text, '加价购')
  assert.equal(tags[0].variant, 'outline')
})

test('mapPromotionTags formats limited buy rule and appends specific_crowd when allowed', () => {
  const tags = mapPromotionTags({
    activity_type: 'limited_buy',
    activity_info: { rule: { day: 0, limit: 2 } },
    promotion_activity: [{ tag_type: 'full_gift', promotion_tag: '满赠' }],
    specific_crowd: { id: 'crowd-1', promotion_tag: '定向折扣' },
  })

  assert.equal(tags[0].textKey, LIMITED_BUY_I18N_KEYS.limitPcs)
  assert.deepEqual(tags[0].textParams, { limit: 2 })
  assert.ok(tags.some((tag) => tag.text === '满赠'))
  assert.ok(tags.some((tag) => tag.text === '定向折扣'))
})

test('mapPromotionTags hides specific_crowd when limited_time_sale exists', () => {
  const tags = mapPromotionTags({
    promotion_activity: [{ tag_type: 'limited_time_sale', promotion_tag: '限时' }],
    specific_crowd: { id: 'crowd-1', promotion_tag: '定向折扣' },
  })

  assert.equal(tags.length, 1)
  assert.equal(tags[0].text, '限时')
})

test('resolveMarketingTagVariant marks single_group and normal as solid', () => {
  assert.equal(resolveMarketingTagVariant('single_group'), 'solid')
  assert.equal(resolveMarketingTagVariant('normal'), 'solid')
  assert.equal(resolveMarketingTagVariant('full_minus'), 'outline')
  assert.equal(resolveMarketingTagVariant('limited_time_sale'), 'outline')
})

test('mapPromotionTags falls back to flat promotion_tag on order lines', () => {
  const tags = mapPromotionTags({
    promotion_tag: '订单行标签',
    tag_type: 'full_discount',
  })
  assert.equal(tags.length, 1)
  assert.equal(tags[0].text, '订单行标签')
  assert.equal(tags[0].variant, 'outline')
})

test('mapPromotionTags synthesizes detail activity_type when promotion_activity is empty', () => {
  const tags = mapPromotionTags({
    activity_type: 'limited_time_sale',
    activity_info: { seckill_type: 'limited_time_sale', activity_name: '滑雪服限时优惠' },
  })
  assert.equal(tags.length, 1)
  assert.equal(tags[0].type, 'limited_time_sale')
  assert.equal(tags[0].textKey, PROMOTION_TAG_I18N_KEYS.limited_time_sale)
  assert.equal(tags[0].variant, 'outline')
})

test('mapPromotionTags does not treat default activity_type=normal as flash sale', () => {
  const tags = mapPromotionTags({
    activity_type: 'normal',
    promotion_activity: [{ marketing_type: 'full_minus', promotion_tag: '满减' }],
  })
  assert.equal(tags.length, 1)
  assert.equal(tags[0].text, '满减')
})

test('mapPromotionTags reads checkout discount_info like SpGoodsCell', () => {
  const tags = mapPromotionTags({
    discount_info: [
      { type: 'full_minus', info: '满减' },
      { type: 'coupon_discount', info: '优惠券' },
      { type: 'member_price', info: '会员价' },
      { type: 'plus_price_buy', info: '加价购' },
    ],
  })
  assert.deepEqual(
    tags.map((tag) => tag.text),
    ['满减', '加价购']
  )
})

test('mapPromotionTags reads checkout items_promotion limited_buy', () => {
  const tags = mapPromotionTags({
    cusActivity: [{ activity_type: 'limited_buy', day: 0, limit: 3, activity_tag: '限购活动' }],
  })
  assert.ok(tags.some((tag) => tag.text === '限购活动'))
  assert.ok(tags.some((tag) => tag.textKey === LIMITED_BUY_I18N_KEYS.limitPcs))
})

test('mergeMarketingTags deduplicates and preserves order from first source', () => {
  const fromRecommend = [
    { type: 'full_minus', text: '满100减20', variant: 'outline' },
    { type: 'normal', textKey: PROMOTION_TAG_I18N_KEYS.normal, variant: 'solid' },
  ]
  const fromDetail = mapPromotionTags({
    promotion_activity: [{ tag_type: 'full_minus', promotion_tag: '满100减20' }],
  })

  const merged = mergeMarketingTags(fromRecommend, fromDetail)

  assert.equal(merged.length, 2)
  assert.equal(merged[0].text, '满100减20')
  assert.equal(merged[1].textKey, PROMOTION_TAG_I18N_KEYS.normal)
})
