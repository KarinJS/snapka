import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      enabled: true,
      reportsDirectory: 'coverage',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts'],
    },
    environment: 'jsdom',
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
