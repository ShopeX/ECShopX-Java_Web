import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '#imports': new URL('./vitest.nuxt-imports.mock.ts', import.meta.url).pathname,
    },
  },
  test: {
    include: ['app/**/*.spec.ts', 'app/**/*.source.test.js'],
  },
})
