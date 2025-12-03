import { defineConfig } from 'tsdown-config'

export default defineConfig({
  dts: {
    resolve: true,
    resolver: 'tsc',
    build: true,
  },
})
