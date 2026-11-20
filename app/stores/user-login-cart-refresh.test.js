import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const read = (relativePath) => readFileSync(path.resolve(process.cwd(), relativePath), 'utf8')

test('completeLogin refreshes cart after loading the user profile', () => {
  const source = read('app/stores/user.ts')
  const start = source.indexOf('async completeLogin(')
  const end = source.indexOf('\n    },', start)
  const completeLogin = source.slice(start, end)

  assert.notEqual(start, -1)
  assert.notEqual(end, -1)
  assert.match(completeLogin, /await this\.fetchUserInfo\(\)/)
  assert.match(completeLogin, /const cartStore = useCartStore\(\)/)
  assert.match(completeLogin, /await cartStore\.loadCart\(\{ silent: true \}\)/)
})
