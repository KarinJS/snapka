import { snapka } from '@snapka/puppeteer'
import type { PuppeteerCore, PuppeteerLaunchOptions } from '@snapka/puppeteer'

/**
 * 浏览器单例管理器
 */
class BrowserManager {
  private instance: PuppeteerCore | null = null
  private config: PuppeteerLaunchOptions = {}
  private isInitializing = false
  private initPromise: Promise<PuppeteerCore> | null = null

  /**
   * 初始化浏览器实例
   */
  async initialize (config: PuppeteerLaunchOptions = {}): Promise<PuppeteerCore> {
    // 如果已经在初始化，等待初始化完成
    if (this.isInitializing && this.initPromise) {
      return this.initPromise
    }

    // 如果已经初始化，直接返回
    if (this.instance) {
      return this.instance
    }

    // 开始初始化
    this.isInitializing = true
    this.config = config

    this.initPromise = (async () => {
      try {
        console.log('[Browser] 正在启动 Puppeteer 浏览器...')
        this.instance = await snapka.launch(this.config)
        console.log('[Browser] Puppeteer 浏览器启动成功')
        return this.instance
      } catch (error) {
        console.error('[Browser] 浏览器启动失败:', error)
        throw error
      } finally {
        this.isInitializing = false
        this.initPromise = null
      }
    })()

    return this.initPromise
  }

  /**
   * 获取浏览器实例
   */
  getInstance (): PuppeteerCore {
    if (!this.instance) {
      throw new Error('浏览器未初始化，请先调用 initialize()')
    }
    return this.instance
  }

  /**
   * 检查浏览器是否已初始化
   */
  isInitialized (): boolean {
    return this.instance !== null
  }

  /**
   * 重启浏览器
   */
  async restart (): Promise<PuppeteerCore> {
    console.log('[Browser] 正在重启浏览器...')
    if (this.instance) {
      await this.instance.restart()
      console.log('[Browser] 浏览器重启成功')
    } else {
      return this.initialize(this.config)
    }
    return this.instance!
  }

  /**
   * 关闭浏览器
   */
  async close (): Promise<void> {
    if (this.instance) {
      console.log('[Browser] 正在关闭浏览器...')
      await this.instance.close()
      this.instance = null
      console.log('[Browser] 浏览器已关闭')
    }
  }
}

// 导出单例实例
export const browserManager = new BrowserManager()
