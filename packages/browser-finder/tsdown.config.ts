import { defineConfig, removeDebugPlugin } from 'tsdown-config'

export default defineConfig({
  chunks: (id, pkg, name) => {
    if (id.includes('node_modules')) {
      return `chunks/${pkg}/${name}`
    }
    return null
  },
  plugins: [
    removeDebugPlugin(),
  ],
})
