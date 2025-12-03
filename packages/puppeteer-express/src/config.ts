import { cosmiconfig } from 'cosmiconfig'
import type { PuppeteerLaunchOptions } from '@snapka/puppeteer'

/**
 * 服务器配置
 */
export interface ServerConfig {
  /** 服务器端口 */
  port?: number
  /** 主机地址 */
  host?: string
  /** 是否启用日志 */
  enableLogging?: boolean
}

/**
 * Puppeteer Express 完整配置
 */
export interface PuppeteerExpressConfig {
  /** 服务器配置 */
  server?: ServerConfig
  /** 浏览器启动配置 */
  browser?: PuppeteerLaunchOptions
}

/**
 * 默认配置
 */
const defaultConfig: PuppeteerExpressConfig = {
  server: {
    port: 3000,
    host: '0.0.0.0',
    enableLogging: true,
  },
  browser: {
    headless: 'shell',
    maxOpenPages: 10,
    pageMode: 'reuse',
    pageIdleTimeout: 60000,
  },
}

/**
 * 加载配置
 */
export async function loadConfig (): Promise<PuppeteerExpressConfig> {
  const explorer = cosmiconfig('puppeteer-express')

  try {
    const result = await explorer.search()

    if (result && result.config) {
      // 合并用户配置和默认配置
      return {
        server: { ...defaultConfig.server, ...result.config.server },
        browser: { ...defaultConfig.browser, ...result.config.browser },
      }
    }
  } catch (error) {
    console.warn('配置文件加载失败，使用默认配置:', (error as Error).message)
  }

  return defaultConfig
}
