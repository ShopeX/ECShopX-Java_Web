import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const pageSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/sign-in.vue'),
  'utf8'
)
const indexSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/index.vue'),
  'utf8'
)
const calendarSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/components/SignInWeekCalendar.vue'),
  'utf8'
)
const recordsSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/components/SignInRecordsModal.vue'),
  'utf8'
)
const rewardsSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/components/SignInRewardsModal.vue'),
  'utf8'
)
const composableSource = readFileSync(
  path.resolve(process.cwd(), 'app/composables/useMemberSignIn.ts'),
  'utf8'
)
const authSource = readFileSync(
  path.resolve(process.cwd(), 'app/middleware/auth.global.ts'),
  'utf8'
)

test('account index keeps sign-in entry commented for temporary hide', () => {
  assert.match(indexSource, /临时隐藏签到入口/)
  assert.match(indexSource, /data-testid="account-signin-entry"/)
  assert.match(indexSource, /data-testid="account-signin-entry-h5"/)
  assert.match(indexSource, /goSignIn/)
  assert.match(indexSource, /\/account\/sign-in/)
})

test('sign-in page uses account shell and core modules', () => {
  assert.match(pageSource, /data-testid="account-signin-page"/)
  assert.match(pageSource, /AccountMenu/)
  assert.match(pageSource, /AccountH5FilterBar/)
  assert.match(pageSource, /SignInWeekCalendar/)
  assert.match(pageSource, /SignInRecordsModal/)
  assert.match(pageSource, /SignInRewardsModal/)
  assert.match(pageSource, /useMemberSignIn/)
  assert.match(pageSource, /data-testid="signin-submit-btn"/)
  assert.match(pageSource, /:disabled="!canSign"/)
  assert.match(pageSource, /v-if="activity"/)
  assert.match(pageSource, /data-testid="signin-success-modal"/)
  assert.match(pageSource, /data-testid="signin-reminder"/)
  assert.match(pageSource, /data-testid="signin-reminder-h5"/)
  assert.match(pageSource, /setReminderEnabled/)
  assert.match(pageSource, /checkAuth\(\{ redirectToLogin: true \}\)/)
})

test('auth middleware protects sign-in route', () => {
  assert.match(authSource, /\/account\/sign-in/)
})

test('week calendar hides zero daily points and marks statuses', () => {
  assert.match(calendarSource, /dayCaption/)
  assert.match(calendarSource, /Number\(day\.daily_point\) > 0/)
  assert.match(calendarSource, /today_unsigned/)
  assert.match(calendarSource, /a8f9884\.missed/)
})

test('records and rewards modals expose month navigation and empty states', () => {
  assert.match(recordsSource, /data-testid="signin-records-modal"/)
  assert.match(recordsSource, /data-testid="signin-records-prev"/)
  assert.match(recordsSource, /getRecords/)
  assert.match(rewardsSource, /data-testid="signin-rewards-modal"/)
  assert.match(rewardsSource, /getRewards/)
})

test('composable provides mock week fallback and already-signed handling', () => {
  assert.match(composableSource, /buildMockWeekDays/)
  assert.match(composableSource, /Asia\/Shanghai/)
  assert.match(composableSource, /isAlreadySignedError/)
  assert.match(composableSource, /alreadySigned/)
  assert.match(composableSource, /usingMock/)
  assert.match(composableSource, /signed_today/)
  assert.match(composableSource, /mapCalendarDayStatus/)
})

test('api client uses Vshop member-signin paths', () => {
  const clientSource = readFileSync(
    path.resolve(process.cwd(), 'app/infrastructure/http/clients/MemberSignInApiClient.ts'),
    'utf8'
  )
  assert.match(clientSource, /const BASE = '\/wxapp\/promotion\/member-signin'/)
  assert.match(clientSource, /\$\{BASE\}\/calendar/)
  assert.match(clientSource, /\$\{BASE\}\/sign/)
  assert.match(clientSource, /\$\{BASE\}\/activity\/progress/)
  assert.match(clientSource, /\$\{BASE\}\/records/)
  assert.match(clientSource, /\$\{BASE\}\/rewards/)
  assert.match(clientSource, /\$\{BASE\}\/reminder/)
})

test('composable exposes reminder load and toggle', () => {
  assert.match(composableSource, /loadReminder/)
  assert.match(composableSource, /setReminderEnabled/)
  assert.match(composableSource, /reminderEnabled/)
  assert.match(composableSource, /Notification\.requestPermission/)
})
