import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const pageSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/registrations/index.vue'),
  'utf8'
)
const cardSource = readFileSync(
  path.resolve(process.cwd(), 'app/pages/account/components/RegistrationRecordCard.vue'),
  'utf8'
)

describe('registration records layout', () => {
  it('uses two columns on PC and keeps H5 as a single column', () => {
    expect(pageSource).toContain('data-testid="registration-records-pc-grid"')
    expect(pageSource).toContain('grid w-full grid-cols-2 gap-4')
    expect(pageSource).not.toMatch(
      /md:flex[\s\S]*max-w-\[530px\] flex-col gap-4[\s\S]*RegistrationRecordCard/
    )
    expect(pageSource).toMatch(
      /md:hidden[\s\S]*mt-4 flex flex-col gap-4[\s\S]*RegistrationRecordCard/
    )
  })

  it('stretches cards in a row and pins actions to the bottom', () => {
    expect(cardSource).toContain('flex h-full w-full flex-col')
    expect(cardSource).toContain('mt-auto flex items-center justify-between gap-3 pt-2')
  })
})
