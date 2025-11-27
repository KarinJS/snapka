import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { Browser, computeExecutablePath } from '@snapka/browsers'

import type { BrowserInfo } from '../types'

export class PuppeteerBrowserFinder {
  private dir = path.join(os.homedir(), '.cache', 'puppeteer')

  /**
   * 利用puppeteer内置的方法，获取已安装的浏览器可执行文件路径列表
   * @param browser 浏览器类型
   */
  private async getExecutablePaths (browser: Browser): Promise<BrowserInfo[]> {
    const baseDir = path.join(this.dir, browser)
    if (!fs.existsSync(baseDir)) return []

    /** 读取目录下的所有文件夹列表 */
    const files = await fs.promises.readdir(baseDir, { withFileTypes: true }).catch(() => [])
    const results: BrowserInfo[] = []
    await Promise.all(files.map(async (file) => {
      // 文件夹名称: win64-131.0.6778.87
      if (!file.isDirectory()) return

      const [, buildId] = file.name.split('-')
      if (!buildId) return

      const execPath = computeExecutablePath({
        browser,
        buildId,
        cacheDir: this.dir,
      })

      if (await fs.promises.access(execPath).then(() => true).catch(() => false)) {
        const dir = path.join(baseDir, file.name).replaceAll('\\', '/')
        const executablePath = execPath.replaceAll('\\', '/')
        results.push({ type: browser, version: buildId, dir, executablePath })
      }
    }))
    return results
  }

  /**
   * 利用puppeteer内置的方法，获取已安装的浏览器可执行文件路径列表(同步版)
   * @param browser 浏览器类型
   */
  private getExecutablePathsSync (browser: Browser): BrowserInfo[] {
    const baseDir = path.join(this.dir, browser)
    if (!fs.existsSync(baseDir)) return []

    /** 读取目录下的所有文件夹列表 */
    let files: fs.Dirent[]
    try {
      files = fs.readdirSync(baseDir, { withFileTypes: true })
    } catch (e) {
      return []
    }

    const results: BrowserInfo[] = []
    for (const file of files) {
      // 文件夹名称: win64-131.0.6778.87
      if (!file.isDirectory()) continue

      const [, buildId] = file.name.split('-')
      if (!buildId) continue
      const execPath = computeExecutablePath({
        browser,
        buildId,
        cacheDir: this.dir,
      })

      if (!fs.existsSync(execPath)) continue
      const dir = path.join(baseDir, file.name).replaceAll('\\', '/')
      const executablePath = execPath.replaceAll('\\', '/')
      results.push({ type: browser, version: buildId, dir, executablePath })
    }
    return results
  }

  /**
   * 查找所有已安装的浏览器(异步，仅返回二进制文件存在的)
   */
  async find (): Promise<BrowserInfo[]> {
    const targets = [
      Browser.CHROME,
      Browser.CHROMEHEADLESSSHELL,
      Browser.CHROMIUM,
      Browser.FIREFOX,
    ]

    const result = await Promise.all(targets.map((browser) => this.getExecutablePaths(browser)))
    return result.flat()
  }

  /**
   * 查找所有已安装的浏览器(同步，仅返回二进制文件存在的)
   */
  findSync (): BrowserInfo[] {
    const targets = [
      Browser.CHROME,
      Browser.CHROMEHEADLESSSHELL,
      Browser.CHROMIUM,
      Browser.FIREFOX,
    ]

    const result = targets.map((browser) => this.getExecutablePathsSync(browser))
    return result.flat()
  }

  /**
   * 查找Chrome浏览器
   */
  async findChrome (): Promise<BrowserInfo | undefined> {
    return this.getExecutablePaths(Browser.CHROME).then(list => list?.[0])
  }

  /**
   * 查找Chrome Headless Shell浏览器
   */
  async findChromeHeadlessShell (): Promise<BrowserInfo | undefined> {
    return this.getExecutablePaths(Browser.CHROMEHEADLESSSHELL).then(list => list?.[0])
  }

  /**
   * 查找Chromium浏览器
   */
  async findChromium (): Promise<BrowserInfo | undefined> {
    return this.getExecutablePaths(Browser.CHROMIUM).then(list => list?.[0])
  }

  /**
   * 查找Firefox浏览器
   */
  async findFirefox (): Promise<BrowserInfo | undefined> {
    return this.getExecutablePaths(Browser.FIREFOX).then(list => list?.[0])
  }

  /**
   * 查找ChromeDriver
   */
  async findChromeDriver (): Promise<BrowserInfo | undefined> {
    return this.getExecutablePaths(Browser.CHROMEDRIVER).then(list => list?.[0])
  }

  /**
   * 查找Chrome浏览器(同步方法)
   */
  findChromeSync (): BrowserInfo | undefined {
    return this.getExecutablePathsSync(Browser.CHROME).find(b => b.type === Browser.CHROME)
  }

  /**
   * 查找Chrome Headless Shell浏览器(同步方法)
   */
  findChromeHeadlessShellSync (): BrowserInfo | undefined {
    return this.getExecutablePathsSync(Browser.CHROMEHEADLESSSHELL).find(b => b.type === Browser.CHROMEHEADLESSSHELL)
  }

  /**
   * 查找Chromium浏览器(同步方法)
   */
  findChromiumSync (): BrowserInfo | undefined {
    return this.getExecutablePathsSync(Browser.CHROMIUM).find(b => b.type === Browser.CHROMIUM)
  }

  /**
   * 查找Firefox浏览器(同步方法)
   */
  findFirefoxSync (): BrowserInfo | undefined {
    return this.getExecutablePathsSync(Browser.FIREFOX).find(b => b.type === Browser.FIREFOX)
  }

  /**
   * 查找ChromeDriver(同步方法)
   */
  findChromeDriverSync (): BrowserInfo | undefined {
    return this.getExecutablePathsSync(Browser.CHROMEDRIVER).find(b => b.type === Browser.CHROMEDRIVER)
  }
}

/**
 * Puppeteer浏览器查找器实例
 */
export const puppeteerBrowserFinder = new PuppeteerBrowserFinder()
