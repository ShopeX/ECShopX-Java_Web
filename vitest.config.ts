import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const appRoot = fileURLToPath(new URL('./app', import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '#imports': new URL('./vitest.nuxt-imports.mock.ts', import.meta.url).pathname,
      '~': appRoot,
      '@': appRoot,
    },
  },
  test: {
    include: ['app/**/*.spec.ts', 'app/**/*.source.test.js'],
  },
})
