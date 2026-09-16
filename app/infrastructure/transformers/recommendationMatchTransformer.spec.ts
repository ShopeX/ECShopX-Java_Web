import { describe, expect, it } from 'vitest'
import { RecommendationMatchTransformer } from './recommendationMatchTransformer'

describe('RecommendationMatchTransformer', () => {
  it('maps match response items to recommendation cards', () => {
    const result = RecommendationMatchTransformer.toRecommendationList({
      data: {
        items: [
          {
            item_id: 101,
            item_name: '推荐商品 A',
            price: 19900,
            pics: 'https://example.com/a.jpg',
          },
        ],
      },
    })

    expect(result).toEqual([
      {
        id: '101',
        name: '推荐商品 A',
        price: 199,
        image: 'https://example.com/a.jpg',
        marketingTags: [],
      },
    ])
  })

  it('maps unwrapped http response items to recommendation cards', () => {
    const result = RecommendationMatchTransformer.toRecommendationList({
      items: [
        {
          item_id: 6930,
          item_name: '官方认证 普通滑雪护目镜',
          price: 580000,
          pics: 'https://example.com/goggles.jpg',
          matched_main_item_id: 7663,
          distributor_id: 0,
        },
      ],
    })

    expect(result).toEqual([
      {
        id: '6930',
        name: '官方认证 普通滑雪护目镜',
        price: 5800,
        matchedMainItemId: '7663',
        distributorId: 0,
        image: 'https://example.com/goggles.jpg',
        marketingTags: [],
      },
    ])
  })
})
