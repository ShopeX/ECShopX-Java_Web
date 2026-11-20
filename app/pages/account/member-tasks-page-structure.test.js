import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const cwd = process.cwd()
const pageSource = readFileSync(path.resolve(cwd, 'app/pages/account/member-tasks.vue'), 'utf8')
const indexSource = readFileSync(path.resolve(cwd, 'app/pages/account/index.vue'), 'utf8')
const rowSource = readFileSync(
  path.resolve(cwd, 'app/pages/account/components/MemberTaskRow.vue'),
  'utf8'
)
const historySource = readFileSync(
  path.resolve(cwd, 'app/pages/account/components/MemberTaskHistoryModal.vue'),
  'utf8'
)
const composableSource = readFileSync(
  path.resolve(cwd, 'app/composables/useMemberTasks.ts'),
  'utf8'
)
const clientSource = readFileSync(
  path.resolve(cwd, 'app/infrastructure/http/clients/MemberTaskApiClient.ts'),
  'utf8'
)
const authSource = readFileSync(path.resolve(cwd, 'app/middleware/auth.global.ts'), 'utf8')
const typesSource = readFileSync(path.resolve(cwd, 'app/types/memberTask.ts'), 'utf8')

test('account index exposes member-tasks entry next to sign-in', () => {
  assert.match(indexSource, /data-testid="account-member-tasks-entry"/)
  assert.match(indexSource, /data-testid="account-member-tasks-entry-h5"/)
  assert.match(indexSource, /goMemberTasks/)
  assert.match(indexSource, /\/account\/member-tasks/)
  assert.match(indexSource, /MemberTaskCenterIcon/)
})

test('member-tasks page uses account shell and history modal', () => {
  assert.match(pageSource, /data-testid="account-member-tasks-page"/)
  assert.match(pageSource, /AccountMenu/)
  assert.match(pageSource, /AccountH5FilterBar/)
  assert.match(pageSource, /MemberTaskListBody/)
  assert.match(pageSource, /MemberTaskHistoryModal/)
  assert.match(pageSource, /useMemberTasks/)
})

test('task row uses Apifox list fields without mapping layer', () => {
  assert.match(rowSource, /task\.name/)
  assert.match(rowSource, /parseMemberTaskRewards/)
  assert.match(rowSource, /rewardChips/)
  assert.match(rowSource, /SignInIcon/)
  assert.match(rowSource, /chip\.kind === 'coupon' \? 'coupon' : 'boxes'/)
  assert.match(rowSource, /task\.user_task_status/)
  assert.match(rowSource, /task\.begin_time_text/)
  // 列表展示 task_rule（任务说明）；不展示 type_label / frequency_text
  assert.match(rowSource, /task_rule/)
  assert.doesNotMatch(rowSource, /task\.type_label/)
  assert.doesNotMatch(rowSource, /task\.frequency_text/)
  assert.doesNotMatch(rowSource, /i-heroicons-gift/)
  assert.match(typesSource, /user_task_status/)
  assert.match(typesSource, /rewarded/)
  assert.match(composableSource, /pending_reward/)
  assert.match(composableSource, /rewarded/)
  assert.match(composableSource, /m10435\.goComplete/)
  assert.match(composableSource, /m10435\.pendingReward/)
  assert.match(composableSource, /m10435\.rewarded/)
  assert.doesNotMatch(composableSource, /normalizeTaskItem|buildMockTasks/)
})

test('history modal supports list pagination and close', () => {
  assert.match(historySource, /data-testid="member-task-history-modal"/)
  assert.match(historySource, /member-task-history-pagination/)
  assert.match(historySource, /page-change/)
})

test('goComplete routes align Admin type_detail enums', () => {
  assert.match(composableSource, /case 'sign_in'/)
  assert.match(composableSource, /\/account\/sign-in/)
  assert.match(composableSource, /case 'favorite'/)
  assert.match(composableSource, /\/account\/favorites/)
  assert.match(composableSource, /invite_register/)
  assert.match(composableSource, /case 'single_spend'/)
  assert.match(composableSource, /case 'total_spend'/)
  assert.match(composableSource, /case 'browse'/)
  assert.match(composableSource, /share_jump_page/)
  assert.match(composableSource, /resolveMemberTaskGoAction/)
  assert.match(composableSource, /buildMemberTaskShareUrl/)
  assert.match(composableSource, /userInfo\.value\?\.user_id/)
  assert.match(composableSource, /m10435\.noJumpPage/)
  assert.doesNotMatch(composableSource, /single_consume|accumulate_consume|browse_page/)
  assert.match(typesSource, /single_spend/)
  assert.match(typesSource, /total_spend/)
  assert.match(typesSource, /'browse'/)
  assert.match(typesSource, /share_cover/)
  assert.match(typesSource, /task_rule/)
  assert.match(rowSource, /single_spend/)
  assert.match(rowSource, /total_spend/)
  assert.match(rowSource, /case 'browse'/)
})

test('member task api client exposes list and participations endpoints', () => {
  assert.match(clientSource, /\/wxapp\/promotion\/member-tasks/)
  assert.match(clientSource, /getTaskList/)
  assert.match(clientSource, /getParticipations/)
  assert.match(clientSource, /\/participations/)
  assert.doesNotMatch(clientSource, /browseReport\s*\(/)
  assert.match(authSource, /\/account\/member-tasks/)
  assert.match(authSource, /\/account\/sign-in/)
  assert.match(authSource, /\/account\/balance/)
  assert.match(authSource, /\/account\/activity-booking/)
  assert.match(authSource, /\/registration/)
  assert.match(composableSource, /getParticipations/)
  assert.match(typesSource, /completion_id/)
  assert.match(typesSource, /completed_at_text/)
})
