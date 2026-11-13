import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const cwd = process.cwd()
const pageSource = readFileSync(path.resolve(cwd, 'app/pages/merchant/index.vue'), 'utf8')
const stepNavSource = readFileSync(
  path.resolve(cwd, 'app/pages/merchant/components/MerchantStepNav.vue'),
  'utf8'
)
const clientSource = readFileSync(
  path.resolve(cwd, 'app/infrastructure/http/clients/MerchantSettlementApiClient.ts'),
  'utf8'
)
const composableSource = readFileSync(
  path.resolve(cwd, 'app/composables/useMerchantSettlement.ts'),
  'utf8'
)
const authMiddlewareSource = readFileSync(
  path.resolve(cwd, 'app/middleware/auth.global.ts'),
  'utf8'
)

test('submitted applications show audit result instead of editable wizard', () => {
  const auditPanelSource = readFileSync(
    path.resolve(cwd, 'app/pages/merchant/components/MerchantSettlementAuditPanel.vue'),
    'utf8'
  )
  assert.match(pageSource, /MerchantSettlementAuditPanel/)
  assert.match(pageSource, /auditPanelVisible/)
  assert.match(auditPanelSource, /i-icon-park-outline:hourglass-full/)
  assert.match(auditPanelSource, /i-icon-park-outline:check-one/)
  assert.match(auditPanelSource, /i-icon-park-outline:close-one/)
  assert.match(auditPanelSource, /auditCopyLogin/)
  assert.match(auditPanelSource, /auditMemoHeading/)
  assert.match(pageSource, /copyAuditLoginInfo/)
  assert.match(pageSource, /resetAuditLoginPassword/)
  assert.match(clientSource, /\/wxapp\/merchant\/password\/reset/)
  assert.match(pageSource, /startReapply/)
  assert.match(composableSource, /shouldShowMerchantAuditView/)
  assert.match(composableSource, /settlementStep\.value\s*=\s*4/)
  assert.match(composableSource, /readMerchantReapplyMode/)
})

test('merchant page uses three-step wizard with preview on step 3', () => {
  assert.match(pageSource, /uiStep === 3/)
  assert.match(pageSource, /merchantSettlement\.step3/)
  assert.match(pageSource, /MerchantPreviewField/)
  assert.match(stepNavSource, /mobileSteps/)
})

test('merchant page has no separate login/captcha UI', () => {
  assert.doesNotMatch(pageSource, /merchantSettlement\.loginTitle/)
  assert.doesNotMatch(pageSource, /isMerchantLoggedIn/)
  assert.doesNotMatch(pageSource, /sendLoginCode/)
  assert.doesNotMatch(composableSource, /merchant_login/)
  assert.doesNotMatch(composableSource, /merchantSettlementApiClient\.login/)
  assert.doesNotMatch(clientSource, /\/wxapp\/merchant\/login/)
  assert.equal(existsSync(path.resolve(cwd, 'app/utils/merchantAuth.ts')), false)
})

test('merchant form keeps license, legal, contact and settlement sections', () => {
  assert.match(pageSource, /merchantSettlement\.sectionLicense/)
  assert.match(pageSource, /merchantSettlement\.sectionLegal/)
  assert.match(pageSource, /merchantSettlement\.sectionContact/)
  assert.match(pageSource, /merchantSettlement\.sectionBank/)
  assert.match(pageSource, /form\.legal_name/)
  assert.doesNotMatch(pageSource, /legal_mobile/)
  assert.doesNotMatch(composableSource, /legal_mobile/)
  assert.match(pageSource, /form\.contact_name/)
  assert.match(pageSource, /form\.bank_account/)
})

test('review page images can be opened larger', () => {
  const previewImageSource = readFileSync(
    path.resolve(cwd, 'app/pages/merchant/components/MerchantPreviewImage.vue'),
    'utf8'
  )
  assert.match(pageSource, /MerchantPreviewImage/)
  assert.match(pageSource, /form\.license_url/)
  assert.match(pageSource, /form\.legal_certid_front_url/)
  assert.match(pageSource, /form\.bank_card_front_url/)
  assert.match(previewImageSource, /merchantSettlement\.viewImage/)
  assert.match(previewImageSource, /max-h-\[90vh\]/)
})

test('merchant page asks for confirmation before submitting', () => {
  assert.match(pageSource, /merchantSettlement\.confirmBody/)
  assert.match(composableSource, /requestSubmit/)
  assert.match(composableSource, /confirmVisible\.value = true/)
})

test('merchant client uses mall member auth for settlement apply paths', () => {
  assert.match(clientSource, /\/wxapp\/merchant\/basesetting/)
  assert.match(clientSource, /\/wxapp\/goods\/category/)
  assert.match(clientSource, /is_main_category:\s*true/)
  assert.match(clientSource, /main_category_selection/)
  assert.match(clientSource, /\/wxapp\/merchant\/settlementapply\/\$\{step\}/)
  assert.match(clientSource, /license_registered_address/)
  assert.match(clientSource, /license_legal_representative/)
  assert.match(clientSource, /bank_acct_type/)
  assert.match(clientSource, /card_id_mask/)
  assert.match(clientSource, /bank_mobile/)
  assert.match(clientSource, /submit:\s*true/)
  assert.doesNotMatch(clientSource, /regions_id/)
  assert.doesNotMatch(clientSource, /legal_mobile/)
  assert.doesNotMatch(clientSource, /getMerchantSessionToken/)
  assert.doesNotMatch(clientSource, /setMerchantSessionToken/)
  assert.doesNotMatch(clientSource, /merchant_settlement_token/)
})

test('merchant certificate upload uses mall espier upload endpoints', () => {
  const uploadClientSource = readFileSync(
    path.resolve(cwd, 'app/infrastructure/http/clients/UploadApiClient.ts'),
    'utf8'
  )
  const imageUploadSource = readFileSync(
    path.resolve(cwd, 'app/pages/merchant/components/MerchantImageUpload.vue'),
    'utf8'
  )
  assert.match(uploadClientSource, /\/wxapp\/espier\/image_upload_token/)
  assert.match(uploadClientSource, /\/wxapp\/espier\/uploadlocal/)
  assert.doesNotMatch(uploadClientSource, /\/wxapp\/merchant\/espier\//)
  assert.doesNotMatch(imageUploadSource, /authMode/)
  assert.match(imageUploadSource, /uploadApiClient\.uploadImage/)
})

test('merchant page uses UTree for level 2/3 management categories', () => {
  assert.match(pageSource, /MerchantCategoryCascader/)
  assert.match(pageSource, /setMainCategorySelection/)
  assert.match(pageSource, /update:selection/)
  assert.match(composableSource, /main_category_selection/)
  assert.match(composableSource, /setMainCategorySelection/)
  assert.match(clientSource, /getMerchantCategoryTree/)
})

test('merchant category tree uses Nuxt UI UTree with propagate select', () => {
  const cascaderSource = readFileSync(
    path.resolve(cwd, 'app/pages/merchant/components/MerchantCategoryCascader.vue'),
    'utf8'
  )
  assert.match(cascaderSource, /UTree/)
  assert.doesNotMatch(cascaderSource, /default-expanded/)
  assert.match(cascaderSource, /propagate-select/)
  assert.match(cascaderSource, /bubble-select/)
  assert.match(cascaderSource, /selectionFromTreeItems/)
})

test('each wizard step is saved before moving on', () => {
  const goNextSource = composableSource.slice(
    composableSource.indexOf('async function goNext'),
    composableSource.indexOf('function goBack')
  )
  const submitSource = composableSource.slice(
    composableSource.indexOf('async function submitApplication')
  )
  assert.match(goNextSource, /saveSettlementStep\(\s*1/)
  assert.match(goNextSource, /saveSettlementStep\(\s*2/)
  assert.doesNotMatch(goNextSource, /saveSettlementStep\(\s*3/)
  assert.match(submitSource, /saveSettlementStep\(\s*3/)
  assert.doesNotMatch(submitSource, /saveSettlementStep\(\s*1/)
  assert.doesNotMatch(submitSource, /saveSettlementStep\(\s*2/)
})

test('merchant route requires site member login via auth middleware', () => {
  assert.match(authMiddlewareSource, /['"]\/merchant['"]/)
  assert.match(authMiddlewareSource, /localePath\(['"]\/account\/login['"]\)/)
  assert.match(authMiddlewareSource, /redirect:\s*to\.fullPath/)
})
