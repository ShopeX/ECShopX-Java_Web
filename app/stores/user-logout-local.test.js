import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const cwd = process.cwd()
const read = (relativePath) => readFileSync(path.resolve(cwd, relativePath), 'utf8')

test('logout only clears local auth state without calling logout api', () => {
  const storeSource = read('app/stores/user.ts')
  const apiClientSource = read('app/infrastructure/http/clients/AuthApiClient.ts')

  assert.match(storeSource, /import \{ useCartStore \} from '~\/stores\/cart'/)
  assert.match(storeSource, /async logout\(\)[\s\S]*this\.setToken\(null, null\)[\s\S]*return \{ success: true \}/)
  assert.match(storeSource, /const cartStore = useCartStore\(\)/)
  assert.match(storeSource, /cartStore\.resetLocalCart\(\)/)
  assert.doesNotMatch(storeSource, /authApiClient\.logout\(/)
  assert.doesNotMatch(apiClientSource, /\/wxapp\/auth\/logout/)
})
