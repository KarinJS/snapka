import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'tsdown-config'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  dts: {
    resolve: true,
    resolver: 'tsc',
    build: true,
  },
  chunks: (id, pkg, name) => {
    if (id.includes('node_modules')) {
      if (id.includes('chromium-bidi')) return `chromium-bidi/${name}`
      if (id.includes('browsers')) return `playwright-browsers/${name}`
      if (id.includes('android')) return `playwright-android/${name}`
      if (id.includes('playwright-core')) return `playwright-core/${name}`
      return pkg
    }
    return null
  },
  hooks: {
    'build:done': async () => {
      const distDir = path.resolve(__dirname, 'dist')

      const getDtsFiles = (dir: string): string[] =>
        fs.readdirSync(dir, { withFileTypes: true }).flatMap(item => {
          const fullPath = path.join(dir, item.name)
          return item.isDirectory() ? getDtsFiles(fullPath) : item.name.endsWith('.d.ts') ? [fullPath] : []
        })

      getDtsFiles(distDir).forEach(file => {
        const content = fs.readFileSync(file, 'utf-8')
        const updated = content.replace(/^(.*from\s+["']electron["'].*)$/gm, '// $1')
        if (updated !== content) {
          fs.writeFileSync(file, updated, 'utf-8')
          console.log(`已注释 electron 导入: ${path.relative(distDir, file)}`)
        }
      })
    },
  },
})
