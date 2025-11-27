import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: '@snapka/browser-finder',
    root: './',
    include: ['test/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/node_modules/**', '**/test/**', '**/*.d.ts', '**/dist/**'],
    },
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
    environment: 'node',
    // 防止测试时拉起浏览器
    globals: true,
  },
})
