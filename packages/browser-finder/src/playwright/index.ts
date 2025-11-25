/**
 * 当前时间: 2025年11月25日
 * 根据playwright的1.56.1版本+仓库最新源码实现
 */

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { normalizePath } from '../utils/path-utils'
import { findExecutablePath } from './1.56.1'
import { findExecutablePath as nextFindExecutablePath } from './next'

import type { BrowserInfo } from '../types'

/**
 * 浏览器类型
 */
type BrowserType = 'chromium' | 'chromium-headless-shell' | 'firefox' | 'webkit'

/**
 * Playwright 浏览器查找器
 * 所有的目录构成的都遵循: ms-playwright/{{browserType}}-{{version}} 结构
 */
export class PlaywrightBrowserFinder {
  /** 浏览器基础目录 */
  private browserBaseDir: string

  constructor () {
    if (process.platform === 'linux') {
      this.browserBaseDir = process.env.XDG_CACHE_HOME || path.join(os.homedir(), '.cache')
    } else if (process.platform === 'darwin') {
      this.browserBaseDir = path.join(os.homedir(), 'Library', 'Caches')
    } else if (process.platform === 'win32') {
      this.browserBaseDir = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local')
    } else {
      throw new Error('Unsupported platform: ' + process.platform)
    }

    this.browserBaseDir = path.join(this.browserBaseDir, 'ms-playwright')
  }

  /**
   * 扫描指定浏览器类型的所有版本
   * @param browserType 浏览器类型
   */
  private async getBrowserInfos (browserType: BrowserType): Promise<BrowserInfo[]> {
    if (!fs.existsSync(this.browserBaseDir)) return []

    const results: BrowserInfo[] = []
    const files = await fs.promises.readdir(this.browserBaseDir, { withFileTypes: true })

    await Promise.all(files.map(async (file) => {
      if (!file.isDirectory()) return

      // 目录名称格式: {{browserType}}-{{version}}
      const match = file.name.match(/^(chromium-headless-shell|chromium|firefox|webkit)-(.+)$/)
      if (!match) return

      const type = match[1] as BrowserType
      if (type !== browserType) return

      const version = match[2]
      if (!version) return

      const dir = normalizePath(path.join(this.browserBaseDir, file.name))

      // 优先使用 next 版本的查找方法
      const next = nextFindExecutablePath(dir, type)
      if (next && fs.existsSync(next)) {
        // 将 chromium-headless-shell 映射为 chrome-headless-shell
        const mappedType = type === 'chromium-headless-shell' ? 'chrome-headless-shell' : type
        results.push({
          type: mappedType,
          version,
          dir,
          executablePath: normalizePath(next),
        })
        return
      }

      // 回退到 1.56.1 版本的查找方法
      const fallback = findExecutablePath(dir, type)
      if (fallback && fs.existsSync(fallback)) {
        // 将 chromium-headless-shell 映射为 chrome-headless-shell
        const mappedType = type === 'chromium-headless-shell' ? 'chrome-headless-shell' : type
        results.push({
          type: mappedType,
          version,
          dir,
          executablePath: normalizePath(fallback),
        })
      }
    }))

    return results
  }

  /**
   * 扫描指定浏览器类型的所有版本(同步版本)
   * @param browserType 浏览器类型
   */
  private getBrowserInfosSync (browserType: BrowserType): BrowserInfo[] {
    if (!fs.existsSync(this.browserBaseDir)) return []

    const results: BrowserInfo[] = []
    const files = fs.readdirSync(this.browserBaseDir, { withFileTypes: true })

    for (const file of files) {
      if (!file.isDirectory()) continue

      // 目录名称格式: {{browserType}}-{{version}}
      const match = file.name.match(/^(chromium-headless-shell|chromium|firefox|webkit)-(.+)$/)
      if (!match) continue

      const type = match[1] as BrowserType
      if (type !== browserType) continue

      const version = match[2]
      if (!version) continue

      const dir = normalizePath(path.join(this.browserBaseDir, file.name))

      // 优先使用 next 版本的查找方法
      const next = nextFindExecutablePath(dir, type)
      if (next && fs.existsSync(next)) {
        // 将 chromium-headless-shell 映射为 chrome-headless-shell
        const mappedType = type === 'chromium-headless-shell' ? 'chrome-headless-shell' : type
        results.push({
          type: mappedType as any,
          version,
          dir,
          executablePath: normalizePath(next),
        })
        continue
      }

      // 回退到 1.56.1 版本的查找方法
      const fallback = findExecutablePath(dir, type)
      if (fallback && fs.existsSync(fallback)) {
        // 将 chromium-headless-shell 映射为 chrome-headless-shell
        const mappedType = type === 'chromium-headless-shell' ? 'chrome-headless-shell' : type
        results.push({
          type: mappedType as any,
          version,
          dir,
          executablePath: normalizePath(fallback),
        })
      }
    }

    return results
  }

  /**
   * 查找所有已安装的浏览器(异步，仅返回二进制文件存在的)
   */
  async find (): Promise<BrowserInfo[]> {
    const targets: BrowserType[] = ['chromium', 'chromium-headless-shell', 'firefox', 'webkit']
    const result = await Promise.all(targets.map((type) => this.getBrowserInfos(type)))
    return result.flat()
  }

  /**
   * 查找所有已安装的浏览器(同步，仅返回二进制文件存在的)
   */
  findSync (): BrowserInfo[] {
    const targets: BrowserType[] = ['chromium', 'chromium-headless-shell', 'firefox', 'webkit']
    const result = targets.map((type) => this.getBrowserInfosSync(type))
    return result.flat()
  }

  /**
   * 查找Chromium浏览器
   */
  async findChromium (): Promise<BrowserInfo | undefined> {
    return this.getBrowserInfos('chromium').then(list => list?.[0])
  }

  /**
   * 查找Chrome Headless Shell浏览器
   */
  async findChromeHeadlessShell (): Promise<BrowserInfo | undefined> {
    return this.getBrowserInfos('chromium-headless-shell').then(list => list?.[0])
  }

  /**
   * 查找Firefox浏览器
   */
  async findFirefox (): Promise<BrowserInfo | undefined> {
    return this.getBrowserInfos('firefox').then(list => list?.[0])
  }

  /**
   * 查找WebKit浏览器
   */
  async findWebkit (): Promise<BrowserInfo | undefined> {
    return this.getBrowserInfos('webkit').then(list => list?.[0])
  }

  /**
   * 查找Chromium浏览器(同步方法)
   */
  findChromiumSync (): BrowserInfo | undefined {
    return this.getBrowserInfosSync('chromium')?.[0]
  }

  /**
   * 查找Chrome Headless Shell浏览器(同步方法)
   */
  findChromeHeadlessShellSync (): BrowserInfo | undefined {
    return this.getBrowserInfosSync('chromium-headless-shell')?.[0]
  }

  /**
   * 查找Firefox浏览器(同步方法)
   */
  findFirefoxSync (): BrowserInfo | undefined {
    return this.getBrowserInfosSync('firefox')?.[0]
  }

  /**
   * 查找WebKit浏览器(同步方法)
   */
  findWebkitSync (): BrowserInfo | undefined {
    return this.getBrowserInfosSync('webkit')?.[0]
  }
}

/**
 * Playwright浏览器查找器实例
 */
export const playwrightBrowserFinder = new PlaywrightBrowserFinder()
