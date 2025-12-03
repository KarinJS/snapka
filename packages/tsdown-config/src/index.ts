import path from 'node:path'
import { defineConfig, type UserConfig } from 'tsdown/config'

const config = (options?: UserConfig & {
  chunks?: (id: string, pkg: string | null, name: string) => string | null
}) => {
  const opt: UserConfig = {
    entry: ['./src/index.ts'],
    outExtensions: (context) => {
      if (context.format === 'es') {
        return {
          js: '.mjs',
          dts: '.d.ts',
        }
      }

      return { js: '.js', dts: '.d.ts' }
    },
    dts: true,
    format: ['esm'],
    shims: true,
    target: 'node18',
    platform: 'node',
    sourcemap: false,
    outDir: 'dist',
    clean: true,
    treeshake: true,
    outputOptions (outputOptions) {
      outputOptions.advancedChunks = {
        groups: [
          {
            // 按包名分组
            name (id) {
              if (id.includes('node_modules')) {
                const pkg = getPackageName(id)
                /** 文件名称 不包含后缀 */
                const name = path.basename(id, path.extname(id))
                if (id.includes('chromium-bidi')) return `chromium-bidi/${name}`
                if (id.includes('browsers')) return `playwright-browsers/${name}`
                if (id.includes('android')) return `playwright-android/${name}`
                if (id.includes('playwright-core')) return `playwright-core/${name}`
                return pkg
              }
              return null
            },

            // 匹配 node_modules 下所有模块
            test: /node_modules[\\/]/,
          },
        ],
      }

      return outputOptions
    },
    ...options,
  }

  if (options?.chunks && typeof options.chunks === 'function') {
    opt.outputOptions = (outputOptions) => {
      outputOptions.advancedChunks = {
        groups: [
          {
            name (id) {
              /** 文件包名 */
              const pkg = getPackageName(id)
              /** 文件名称 不包含后缀 */
              const name = path.basename(id, path.extname(id))
              return options!.chunks!(id, pkg, name) || null
            },
            test: /node_modules[\\/]/,
          },
        ],
      }
    }
  }

  return defineConfig(opt)
}

/**
 * 通过文件路径获取包名
 * @param filePath - 文件路径
 * @returns 包名或 null
 */
export const getPackageName = (filePath: string): string | null => {
  // 格式化为绝对路径
  const absPath = path.resolve(filePath).replace(/\\/g, '/')

  const idx = absPath.lastIndexOf('node_modules/')
  if (idx === -1) return null

  const suffix = absPath.slice(idx + 13)
  const parts = suffix.split('/').filter(Boolean)

  if (parts.length === 0) return null

  // 组织包 (@scope/package)
  if (parts[0].startsWith('@')) {
    return parts.length > 1 ? `${parts[0]}/${parts[1]}` : null
  }

  // 普通包
  return parts[0]
}

export {
  config as defineConfig,
  config as default,
}
