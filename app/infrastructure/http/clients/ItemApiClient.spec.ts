import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ItemApiClient } from './ItemApiClient'

const httpMock = vi.fn()

vi.stubGlobal('useNuxtApp', () => ({
  $api: httpMock,
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

  it('sends main_category for management category', async () => {
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

  it('forwards sale category_id without main_category', async () => {
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
