import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const pageSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/activity-booking.vue'),
  'utf8'
)
const accountMenuSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/components/AccountMenu.vue'),
  'utf8'
)
const h5FilterSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/components/AccountH5FilterBar.vue'),
  'utf8'
)
const nuxtConfigSource = readFileSync(
  path.resolve(process.cwd(), 'nuxt.config.ts'),
  'utf8'
)

describe('activity booking standalone page', () => {
  it('removes account sidebar entry and renders without AccountMenu', () => {
    expect(pageSource).toContain('data-testid="activity-booking-standalone"')
    expect(pageSource).not.toContain('AccountMenu')
    expect(pageSource).not.toContain('AccountH5FilterBar')
    expect(accountMenuSource).not.toContain("key: 'activityBooking'")
    expect(h5FilterSource).not.toContain("key: 'activityBooking'")
  })

  it('loads ActivityEventCard from components instead of pages', () => {
    expect(pageSource).toContain(
      "import ActivityEventCard from '~/components/ActivityEventCard/ActivityEventCard.vue'"
    )
    expect(nuxtConfigSource).toContain("'!**/components/**'")
  })

  it('shows 4 cards per row on PC and 1 per row on H5', () => {
    expect(pageSource).toMatch(/grid-cols-4[\s\S]*data-testid="activity-booking-list-pc"/)
    expect(pageSource).toMatch(/grid-cols-1[\s\S]*data-testid="activity-booking-list-h5"/)
  })

  it('allows browsing without login, requires auth only when applying', () => {
    const loadListFn = pageSource.match(
      /async function loadList\(\) \{[\s\S]*?\n\}/
    )?.[0]
    expect(loadListFn).toBeTruthy()
    expect(loadListFn).toContain('fetchActivityList')
    expect(loadListFn).not.toContain('requireAuth')
    expect(pageSource).toMatch(/async function handleApply[\s\S]*?requireAuth/)
  })
})
