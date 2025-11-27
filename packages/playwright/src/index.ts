import { PlaywrightCore } from './core'
import { PlaywrightLaunch } from './launch'
import playwright, { Browser } from '@snapka/playwright-core'

import type { PlaywrightLaunchOptions, PlaywrightConnectOptions } from './launch'

const browsers: Browser[] = []

export const snapka = {
  /**
   * 已启动的浏览器实例列表
   */
  browsers,
  /**
   * 启动一个新的浏览器实例
   * @param options - 启动选项
   * @returns PlaywrightCore 实例
   */
  launch: async (options: PlaywrightLaunchOptions = {}) => {
    const launcher = new PlaywrightLaunch()
    const executablePath = await launcher.getPath(options)
    if (!executablePath) {
      throw new Error('无法获取浏览器可执行文件路径，请检查配置项或手动指定 executablePath')
    }

    options.executablePath = executablePath
    const headless = options.headless === 'shell' || options.headless === 'new'
    const browser = await playwright.chromium.launch({
      ...options,
      headless,
    })
    browsers.push(browser)

    // 创建重启函数
    const restartFn = async () => {
      const newBrowser = await playwright.chromium.launch({
        ...options,
        headless,
      })
      // 替换 browsers 数组中的旧实例
      const index = browsers.indexOf(browser)
      if (index > -1) {
        browsers[index] = newBrowser
      } else {
        browsers.push(newBrowser)
      }
      return newBrowser
    }

    return new PlaywrightCore(options, browser, restartFn)
  },
  /**
   * 连接到一个已启动的浏览器实例
   * @param options - 连接选项
   * @returns PlaywrightCore 实例
   */
  connect: async (options: PlaywrightConnectOptions) => {
    const browserURL = options.baseUrl
    const browser = await playwright.chromium.connect(browserURL, {
      headers: options.headers,
      timeout: options.timeout,
    })
    browsers.push(browser)

    // 创建重启函数（重新连接）
    const restartFn = async () => {
      const newBrowser = await playwright.chromium.connect(browserURL, {
        headers: options.headers,
        timeout: options.timeout,
      })
      // 替换 browsers 数组中的旧实例
      const index = browsers.indexOf(browser)
      if (index > -1) {
        browsers[index] = newBrowser
      } else {
        browsers.push(newBrowser)
      }
      return newBrowser
    }

    return new PlaywrightCore(options, browser, restartFn)
  },
}
