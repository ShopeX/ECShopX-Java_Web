import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ItemApiClient } from './ItemApiClient'

const httpMock = vi.fn()

vi.stubGlobal('useNuxtApp', () => ({
  $api: httpMock,
}))

vi.stubGlobal('useRuntimeConfig', () => ({
  public: {
    businessMode: 'b2c',
  },
}))

describe('ItemApiClient.getItemList', () => {
  beforeEach(() => {
    httpMock.mockReset()
    httpMock.mockResolvedValue({})
  })

  const baseParams = {
    page: '1',
    pageSize: '20',
    item_type: 'normal',
    main_category: '6875',
    is_tdk: '1',
    type: '0',
  }

  it('sends category_id in b2c mode', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({
      public: {
        businessMode: 'b2c',
      },
    }))

    const client = new ItemApiClient()
    await client.getItemList(baseParams)

    expect(httpMock).toHaveBeenCalledTimes(1)
    expect(httpMock).toHaveBeenCalledWith('/wxapp/goods/items', {
      method: 'GET',
      query: expect.objectContaining({
        page: '1',
        pageSize: '20',
        item_type: 'normal',
        category_id: '6875',
        is_tdk: '1',
        type: '0',
      }),
      cache: 'default',
    })

    const query = httpMock.mock.calls[0]?.[1]?.query
    expect(query.main_category).toBeUndefined()
  })

  it('keeps main_category in bbc mode', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({
      public: {
        businessMode: 'bbc',
      },
    }))

    const client = new ItemApiClient()
    await client.getItemList(baseParams)

    expect(httpMock).toHaveBeenCalledTimes(1)
    expect(httpMock).toHaveBeenCalledWith('/wxapp/goods/items', {
      method: 'GET',
      query: expect.objectContaining({
        page: '1',
        pageSize: '20',
        item_type: 'normal',
        main_category: '6875',
        is_tdk: '1',
        type: '0',
      }),
      cache: 'default',
    })

    const query = httpMock.mock.calls[0]?.[1]?.query
    expect(query.category_id).toBeUndefined()
  })

  it('forwards sale category_id in bbc mode without main_category', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({
      public: {
        businessMode: 'bbc',
      },
    }))

    const client = new ItemApiClient()
    await client.getItemList({
      page: '1',
      pageSize: '20',
      item_type: 'normal',
      is_tdk: '1',
      type: '0',
      category_id: '6539',
    })

    const query = httpMock.mock.calls[0]?.[1]?.query
    expect(query.main_category).toBeUndefined()
    expect(query.category_id).toBe('6539')
  })
})

describe('ItemApiClient.matchRecommendations', () => {
  beforeEach(() => {
    httpMock.mockReset()
    httpMock.mockResolvedValue({ data: { items: [] } })
  })

  it('posts scene and main item ids to match endpoint', async () => {
    const client = new ItemApiClient()
    await client.matchRecommendations({
      scene: 'detail',
      distributor_id: 0,
      main_item_ids: [101, 202],
      exclude_item_ids: [303],
    })

    expect(httpMock).toHaveBeenCalledWith('/wxapp/goods/recommendations/match', {
      method: 'POST',
      body: {
        scene: 'detail',
        distributor_id: 0,
        main_item_ids: [101, 202],
        exclude_item_ids: [303],
      },
      useJson: true,
      skipErrorCodes: [400],
      cache: 'default',
    })
  })
})

describe('ItemApiClient.checkoutAddRecommendation', () => {
  beforeEach(() => {
    httpMock.mockReset()
    httpMock.mockResolvedValue({ items: [] })
  })

  it('posts checkout snapshot with recommendation ids', async () => {
    const client = new ItemApiClient()
    await client.checkoutAddRecommendation({
      order_type: 'normal',
      distributor_id: 1,
      items: [{ item_id: 101, num: 2 }],
      main_item_id: 101,
      recommend_item_id: 202,
      num: 1,
      cart_type: 'normal',
      receipt_type: 'logistics',
    })

    expect(httpMock).toHaveBeenCalledWith('/wxapp/goods/recommendations/checkout-add', {
      method: 'POST',
      body: {
        order_type: 'normal',
        distributor_id: 1,
        items: [{ item_id: 101, num: 2 }],
        main_item_id: 101,
        recommend_item_id: 202,
        num: 1,
        cart_type: 'normal',
        receipt_type: 'logistics',
      },
      useJson: true,
      skipErrorCodes: [400, 422],
      cache: 'default',
    })
  })
})
