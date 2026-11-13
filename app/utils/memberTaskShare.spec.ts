import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  captureMemberTaskShareFromQuery,
  clearMemberTaskShareParams,
  getMemberTaskShareParams,
} from './memberTaskShare'

function createLocalStorage() {
  const values = new Map<string, string>()
  return {
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    removeItem: (key: string) => values.delete(key),
    setItem: (key: string, value: string) => {
      values.set(key, value)
    },
  }
}

describe('memberTaskShare', () => {
  beforeEach(() => {
    vi.stubGlobal('window', { localStorage: createLocalStorage() })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('caches both ids only when the route has task id and sharer user id', () => {
    captureMemberTaskShareFromQuery({
      member_task_id: '8',
      member_task_sharer_user_id: '79',
    })

    expect(getMemberTaskShareParams()).toEqual({
      member_task_id: 8,
      member_task_sharer_user_id: 79,
    })
  })

  it('keeps the previous cache when either query param is missing', () => {
    captureMemberTaskShareFromQuery({
      member_task_id: '8',
      member_task_sharer_user_id: '79',
    })
    captureMemberTaskShareFromQuery({ member_task_id: '9' })
    captureMemberTaskShareFromQuery({ member_task_sharer_user_id: '80' })

    expect(getMemberTaskShareParams()).toEqual({
      member_task_id: 8,
      member_task_sharer_user_id: 79,
    })
  })

  it('replaces the cache when a newer link has both params', () => {
    captureMemberTaskShareFromQuery({
      member_task_id: '8',
      member_task_sharer_user_id: '79',
    })
    captureMemberTaskShareFromQuery({
      member_task_id: ['12'],
      member_task_sharer_user_id: '88',
    })

    expect(getMemberTaskShareParams()).toEqual({
      member_task_id: 12,
      member_task_sharer_user_id: 88,
    })
  })

  it('clears the cached share attribution', () => {
    captureMemberTaskShareFromQuery({
      member_task_id: '8',
      member_task_sharer_user_id: '79',
    })
    clearMemberTaskShareParams()

    expect(getMemberTaskShareParams()).toBeNull()
  })
})
