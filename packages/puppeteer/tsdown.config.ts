import { defineConfig } from 'tsdown-config'

export default defineConfig({
  entry: [
    './src/index.ts',
    './src/puppeteer-core.ts',
    './src/snapka-browser-finder.ts',
  ],
  dts: true,
})
