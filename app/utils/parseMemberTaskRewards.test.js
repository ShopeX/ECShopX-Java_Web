import assert from 'node:assert/strict'
import test from 'node:test'
import { parseMemberTaskRewards } from './parseMemberTaskRewards.js'

test('splits point + coupon composite summary', () => {
  assert.deepEqual(parseMemberTaskRewards('100积分+优惠券'), [
    { kind: 'point', label: '100积分' },
    { kind: 'coupon', label: '优惠券' },
  ])
})

test('keeps 积分+N as a single point chip', () => {
  assert.deepEqual(parseMemberTaskRewards('积分+20'), [{ kind: 'point', label: '积分+20' }])
})

test('splits comma-separated rewards', () => {
  assert.deepEqual(parseMemberTaskRewards('积分+50，3元优惠券'), [
    { kind: 'point', label: '积分+50' },
    { kind: 'coupon', label: '3元优惠券' },
  ])
})

test('classifies coupon-only summary', () => {
  assert.deepEqual(parseMemberTaskRewards('优惠券'), [{ kind: 'coupon', label: '优惠券' }])
})

test('returns empty for blank summary', () => {
  assert.deepEqual(parseMemberTaskRewards(null), [])
  assert.deepEqual(parseMemberTaskRewards('  '), [])
})
