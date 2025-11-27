import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      enabled: true,
      reportsDirectory: 'coverage',
      reporter: ['text', 'json', 'html'],
      include: ['test/**/*.ts'],
      exclude: ['test/**/*.d.ts'],
    },
    environment: 'node',
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
