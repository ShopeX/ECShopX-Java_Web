import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const checkoutPageSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/checkout/index.vue'),
  'utf8'
)

test('checkout preflights payment methods and replaces current tab for single doumen_intl payment', () => {
  assert.match(
    checkoutPageSource,
    /import \{ paymentApiClient \} from '~\/infrastructure\/http\/clients'/
  )
  assert.match(checkoutPageSource, /function normalizePaymentMethodCode\(value: unknown\)/)
  assert.match(
    checkoutPageSource,
    /function isDoumenIntlPaymentMethod\(method: \{ code\?: string; id\?: string; pay_type_code\?: string \}\)/
  )
  assert.match(checkoutPageSource, /async function loadCheckoutPaymentMethods\(\)/)
  assert.match(
    checkoutPageSource,
    /await paymentApiClient\.getPaymentMethodList\(\{ platform: getPaymentPlatform\(\) \}\)/
  )
  assert.match(
    checkoutPageSource,
    /async function redirectToDoumenPayment\(orderId: string, payType: string\)/
  )
  assert.match(
    checkoutPageSource,
    /await paymentApiClient\.getOrderPaymentInfo\(\{[\s\S]*order_id: orderId,[\s\S]*pay_type: payType,[\s\S]*pay_channel: payType/
  )
  assert.match(
    checkoutPageSource,
    /async function redirectToDoumenPayment\(orderId: string, payType: string\) \{[\s\S]*try \{[\s\S]*catch \{[\s\S]*return false/
  )
  assert.match(checkoutPageSource, /window\.location\.replace\(payUrl\)/)
  assert.match(checkoutPageSource, /const paymentMethods = await loadCheckoutPaymentMethods\(\)/)
  assert.match(
    checkoutPageSource,
    /const onlyPaymentMethod = paymentMethods\.length === 1 \? paymentMethods\[0\] : null/
  )
  assert.match(
    checkoutPageSource,
    /const shouldRedirectToDoumen = !!onlyPaymentMethod && isDoumenIntlPaymentMethod\(onlyPaymentMethod\)/
  )
  assert.match(
    checkoutPageSource,
    /const payType = shouldRedirectToDoumen[\s\S]*\?[\s\S]*onlyPaymentMethod\.pay_type_code \?\?[\s\S]*onlyPaymentMethod\.code \?\?[\s\S]*onlyPaymentMethod\.id \?\?[\s\S]*'doumen_intl'[\s\S]*: 'wxpaypc'/
  )
  assert.match(checkoutPageSource, /const result = await createOrder\(payType\)/)
  assert.match(checkoutPageSource, /await redirectToDoumenPayment\(result\.orderId, payType\)/)
})

test('checkout uses replace when leaving checkout after order creation', () => {
  assert.doesNotMatch(
    checkoutPageSource,
    /router\.push\(`\/payment\?orderId=\$\{result\.orderId\}`\)/
  )
  assert.match(
    checkoutPageSource,
    /router\.replace\(localePath\(\{ path: '\/payment', query: \{ orderId: result\.orderId \} \}\)\)/
  )
})
