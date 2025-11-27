import type { BrowserInfo } from './types'
import { systemBrowserFinder } from './browsers'
import { puppeteerBrowserFinder } from './puppeteer'
import { playwrightBrowserFinder } from './playwright'

export type { BrowserInfo }

export type BrowserSource = 'puppeteer' | 'playwright' | 'system'

export type BrowserName =
  | 'chrome'
  | 'chromium'
  | 'chromium-headless-shell'
  | 'chrome-headless-shell'
  | 'chromedriver'
  | 'firefox'
  | 'webkit'
  | 'edge'
  | 'brave'

/**
 * 统一的浏览器查找器，按顺序依次使用 puppeteer、playwright、系统浏览器结果。
 * 聚合后的返回值只关注可执行路径与版本，不包含发布通道等信息。
 */
export class BrowserFinder {
  /** Puppeteer 缓存查找器实例 */
  puppeteer: typeof puppeteerBrowserFinder
  /** Playwright 缓存查找器实例 */
  playwright: typeof playwrightBrowserFinder
  /** 系统浏览器查找器实例 */
  system: typeof systemBrowserFinder

  constructor () {
    this.puppeteer = puppeteerBrowserFinder
    this.playwright = playwrightBrowserFinder
    this.system = systemBrowserFinder
  }

  /**
   * 查找所有浏览器(异步)
   */
  async find (): Promise<BrowserInfo[]> {
    return Promise.all([
      this.puppeteer.find(),
      this.playwright.find(),
      this.system.find(),
    ]).then(results => results.flat())
  }

  /**
   * 查找所有浏览器(同步)
   */
  findSync (): BrowserInfo[] {
    return [
      ...this.puppeteer.findSync(),
      ...this.playwright.findSync(),
      ...this.system.findSync(),
    ]
  }

  /**
   * 查找所有 Chrome 浏览器(异步)
   */
  async findChrome (): Promise<BrowserInfo[]> {
    return Promise.all([
      this.puppeteer.findChrome(),
      this.system.findChrome(),
    ]).then(results => results.flat().filter(Boolean) as BrowserInfo[])
  }

  /**
   * 查找所有 Chrome 浏览器(同步)
   */
  findChromeSync (): BrowserInfo[] {
    return [
      this.puppeteer.findChromeSync(),
      ...this.system.findChromeSync(),
    ].filter(Boolean) as BrowserInfo[]
  }

  /**
   * 查找所有 Chromium 浏览器(异步)
   */
  async findChromium (): Promise<BrowserInfo[]> {
    return Promise.all([
      this.puppeteer.findChromium(),
      this.playwright.findChromium(),
    ]).then(results => results.filter(Boolean) as BrowserInfo[])
  }

  /**
   * 查找所有 Chromium 浏览器(同步)
   */
  findChromiumSync (): BrowserInfo[] {
    return [
      this.puppeteer.findChromiumSync(),
      this.playwright.findChromiumSync(),
    ].filter(Boolean) as BrowserInfo[]
  }

  /**
   * 查找所有 Chrome Headless Shell 浏览器(异步)
   */
  async findChromeHeadlessShell (): Promise<BrowserInfo[]> {
    return Promise.all([
      this.puppeteer.findChromeHeadlessShell(),
      this.playwright.findChromeHeadlessShell(),
    ]).then(results => results.filter(Boolean) as BrowserInfo[])
  }

  /**
   * 查找所有 Chrome Headless Shell 浏览器(同步)
   */
  findChromeHeadlessShellSync (): BrowserInfo[] {
    return [
      this.puppeteer.findChromeHeadlessShellSync(),
      this.playwright.findChromeHeadlessShellSync(),
    ].filter(Boolean) as BrowserInfo[]
  }

  /**
   * 查找所有 Firefox 浏览器(异步)
   */
  async findFirefox (): Promise<BrowserInfo[]> {
    return Promise.all([
      this.puppeteer.findFirefox(),
      this.playwright.findFirefox(),
    ]).then(results => results.filter(Boolean) as BrowserInfo[])
  }

  /**
   * 查找所有 Firefox 浏览器(同步)
   */
  findFirefoxSync (): BrowserInfo[] {
    return [
      this.puppeteer.findFirefoxSync(),
      this.playwright.findFirefoxSync(),
    ].filter(Boolean) as BrowserInfo[]
  }

  /**
   * 查找所有 WebKit 浏览器(异步)
   */
  async findWebkit (): Promise<BrowserInfo[]> {
    return this.playwright.findWebkit().then(result => result ? [result] : [])
  }

  /**
   * 查找所有 WebKit 浏览器(同步)
   */
  findWebkitSync (): BrowserInfo[] {
    const result = this.playwright.findWebkitSync()
    return result ? [result] : []
  }

  /**
   * 查找所有 Edge 浏览器(异步)
   */
  async findEdge (): Promise<BrowserInfo[]> {
    return this.system.findEdgeSync()
  }

  /**
   * 查找所有 Edge 浏览器(同步)
   */
  findEdgeSync (): BrowserInfo[] {
    return this.system.findEdgeSync()
  }

  /**
   * 查找所有 Brave 浏览器(异步)
   */
  async findBrave (): Promise<BrowserInfo[]> {
    return this.system.findBraveSync()
  }

  /**
   * 查找所有 Brave 浏览器(同步)
   */
  findBraveSync (): BrowserInfo[] {
    return this.system.findBraveSync()
  }

  /**
   * 查找所有基于 Chromium 内核的浏览器(异步)
   * @description 包括 chrome、chromium、chrome-headless-shell、edge、brave
   */
  async findChromiumCore (): Promise<BrowserInfo[]> {
    return Promise.all([
      this.findChrome(),
      this.findChromium(),
      this.findChromeHeadlessShell(),
      this.findEdge(),
      this.findBrave(),
    ]).then(results => results.flat())
  }

  /**
   * 查找所有基于 Chromium 内核的浏览器(同步)
   * @description 包括 chrome、chromium、chrome-headless-shell、edge、brave
   */
  findChromiumCoreSync (): BrowserInfo[] {
    return [
      ...this.findChromeSync(),
      ...this.findChromiumSync(),
      ...this.findChromeHeadlessShellSync(),
      ...this.findEdgeSync(),
      ...this.findBraveSync(),
    ]
  }

  /**
   * 查找第一个 Chrome 浏览器(异步)
   */
  async findFirstChrome (): Promise<BrowserInfo | undefined> {
    const result = await this.puppeteer.findChrome()
    if (result) return result
    return this.system.findChromeSync()[0]
  }

  /**
   * 查找第一个 Chrome 浏览器(同步)
   */
  findFirstChromeSync (): BrowserInfo | undefined {
    return this.puppeteer.findChromeSync() || this.system.findChromeSync()[0]
  }

  /**
   * 查找第一个 Chromium 浏览器(异步)
   */
  async findFirstChromium (): Promise<BrowserInfo | undefined> {
    const result = await this.puppeteer.findChromium()
    if (result) return result
    return this.playwright.findChromium()
  }

  /**
   * 查找第一个 Chromium 浏览器(同步)
   */
  findFirstChromiumSync (): BrowserInfo | undefined {
    return this.puppeteer.findChromiumSync() || this.playwright.findChromiumSync()
  }

  /**
   * 查找第一个 Firefox 浏览器(异步)
   */
  async findFirstFirefox (): Promise<BrowserInfo | undefined> {
    const result = await this.puppeteer.findFirefox()
    if (result) return result
    return this.playwright.findFirefox()
  }

  /**
   * 查找第一个 Firefox 浏览器(同步)
   */
  findFirstFirefoxSync (): BrowserInfo | undefined {
    return this.puppeteer.findFirefoxSync() || this.playwright.findFirefoxSync()
  }

  /**
   * 查找第一个 Chrome Headless Shell 浏览器(异步)
   */
  async findFirstChromeHeadlessShell (): Promise<BrowserInfo | undefined> {
    const result = await this.puppeteer.findChromeHeadlessShell()
    if (result) return result
    return this.playwright.findChromeHeadlessShell()
  }

  /**
   * 查找第一个 Chrome Headless Shell 浏览器(同步)
   */
  findFirstChromeHeadlessShellSync (): BrowserInfo | undefined {
    return this.puppeteer.findChromeHeadlessShellSync() || this.playwright.findChromeHeadlessShellSync()
  }

  /**
   * 查找第一个基于 Chromium 内核的浏览器(异步)
   * @description 按优先级查找：chrome > chromium > chrome-headless-shell > edge > brave
   */
  async findFirstChromiumCore (): Promise<BrowserInfo | undefined> {
    const chrome = await this.findFirstChrome()
    if (chrome) return chrome

    const chromium = await this.findFirstChromium()
    if (chromium) return chromium

    const headless = await this.findFirstChromeHeadlessShell()
    if (headless) return headless

    const edge = this.system.findEdgeSync()[0]
    if (edge) return edge

    return this.system.findBraveSync()[0]
  }

  /**
   * 查找第一个基于 Chromium 内核的浏览器(同步)
   * @description 按优先级查找：chrome > chromium > chrome-headless-shell > edge > brave
   */
  findFirstChromiumCoreSync (): BrowserInfo | undefined {
    const chrome = this.findFirstChromeSync()
    if (chrome) return chrome

    const chromium = this.findFirstChromiumSync()
    if (chromium) return chromium

    const headless = this.findFirstChromeHeadlessShellSync()
    if (headless) return headless

    const edge = this.system.findEdgeSync()[0]
    if (edge) return edge

    return this.system.findBraveSync()[0]
  }
}

export const browserFinder = new BrowserFinder()
