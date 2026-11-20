import { describe, expect, it } from 'vitest'
import { buildMemberTaskShareUrl, resolveMemberTaskGoAction } from './memberTaskJump'

const localePath = (path: string) => `/zh-CN${path}`

describe('resolveMemberTaskGoAction', () => {
  it('navigates goods, categories, activity and custom page', () => {
    expect(
      resolveMemberTaskGoAction({ linkPage: 'goods', id: '1001' }, localePath)
    ).toEqual({ type: 'navigate', href: '/zh-CN/products/1001' })
    expect(
      resolveMemberTaskGoAction(
        '{"linkPage":"sale_category","id":"12"}',
        localePath
      )
    ).toEqual({
      type: 'navigate',
      href: '/zh-CN/collections/12?link_type=sale_category',
    })
    expect(
      resolveMemberTaskGoAction({ linkPage: 'category', id: '34' }, localePath)
    ).toEqual({
      type: 'navigate',
      href: '/zh-CN/collections/34?link_type=category',
    })
    expect(
      resolveMemberTaskGoAction({ linkPage: 'regactivity', id: '56' }, localePath)
    ).toEqual({ type: 'navigate', href: '/zh-CN/registration/56' })
    expect(
      resolveMemberTaskGoAction({ linkPage: 'custom_page', id: '9' }, localePath)
    ).toEqual({ type: 'navigate', href: '/zh-CN/custom/9' })
  })

  it('navigates sign-in and registration list pages', () => {
    expect(
      resolveMemberTaskGoAction({ linkPage: 'link', id: 'membersSign' }, localePath)
    ).toEqual({ type: 'navigate', href: '/zh-CN/account/sign-in' })
    expect(
      resolveMemberTaskGoAction({ linkPage: 'link', id: 'memberSign' }, localePath)
    ).toEqual({ type: 'navigate', href: '/zh-CN/account/sign-in' })
    expect(
      resolveMemberTaskGoAction({ linkPage: 'link', id: 'registActivity' }, localePath)
    ).toEqual({ type: 'navigate', href: '/zh-CN/account/activity-booking' })
  })

  it('navigates recharge to the balance page and copies mini-program paths', () => {
    expect(
      resolveMemberTaskGoAction('{"linkPage":"link","id":"recharge"}', localePath)
    ).toEqual({ type: 'navigate', href: '/zh-CN/account/balance' })
    expect(resolveMemberTaskGoAction({ linkPage: 'recharge' }, localePath)).toEqual({
      type: 'navigate',
      href: '/zh-CN/account/balance',
    })
    expect(resolveMemberTaskGoAction('/pages/item/espier-detail?id=1', localePath)).toEqual({
      type: 'copy',
      text: '/pages/item/espier-detail?id=1',
    })
  })

  it('builds a share url with domain, path, task id and sharer user id', () => {
    expect(
      buildMemberTaskShareUrl({
        origin: 'https://shop.example.com',
        path: '/zh-CN/products/1001',
        taskId: 12,
        userId: 88,
      })
    ).toBe(
      'https://shop.example.com/zh-CN/products/1001?member_task_id=12&member_task_sharer_user_id=88'
    )
    expect(
      buildMemberTaskShareUrl({
        origin: 'https://shop.example.com/',
        path: 'https://shop.example.com/zh-CN/collections/12?link_type=sale_category',
        taskId: '9',
        userId: '3',
      })
    ).toBe(
      'https://shop.example.com/zh-CN/collections/12?link_type=sale_category&member_task_id=9&member_task_sharer_user_id=3'
    )
    expect(
      buildMemberTaskShareUrl({
        origin: 'https://shop.example.com',
        path: '',
        taskId: 1,
        userId: 2,
      })
    ).toBeNull()
    expect(
      buildMemberTaskShareUrl({
        origin: 'https://shop.example.com',
        path: '/products/1',
        taskId: 1,
        userId: '',
      })
    ).toBeNull()
  })

  it('navigates an already-web path and returns null for empty config', () => {
    expect(resolveMemberTaskGoAction('/products/8', localePath)).toEqual({
      type: 'navigate',
      href: '/zh-CN/products/8',
    })
    expect(resolveMemberTaskGoAction('  ', localePath)).toBeNull()
    expect(resolveMemberTaskGoAction(null, localePath)).toBeNull()
  })
})