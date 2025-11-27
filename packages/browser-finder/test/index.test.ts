import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserFinder, browserFinder } from '../src/index'
import { systemBrowserFinder } from '../src/browsers/index'
import { puppeteerBrowserFinder } from '../src/puppeteer/index'
import { playwrightBrowserFinder } from '../src/playwright/index'

// Mock dependencies
vi.mock('../src/browsers/index', () => ({
  systemBrowserFinder: {
    find: vi.fn(),
    findSync: vi.fn(),
    findChrome: vi.fn(),
    findChromeSync: vi.fn(),
    findEdgeSync: vi.fn(),
    findBraveSync: vi.fn(),
  },
}))

vi.mock('../src/puppeteer/index', () => ({
  puppeteerBrowserFinder: {
    find: vi.fn(),
    findSync: vi.fn(),
    findChrome: vi.fn(),
    findChromeSync: vi.fn(),
    findChromium: vi.fn(),
    findChromiumSync: vi.fn(),
    findChromeHeadlessShell: vi.fn(),
    findChromeHeadlessShellSync: vi.fn(),
    findFirefox: vi.fn(),
    findFirefoxSync: vi.fn(),
  },
}))

vi.mock('../src/playwright/index', () => ({
  playwrightBrowserFinder: {
    find: vi.fn(),
    findSync: vi.fn(),
    findChromium: vi.fn(),
    findChromiumSync: vi.fn(),
    findChromeHeadlessShell: vi.fn(),
    findChromeHeadlessShellSync: vi.fn(),
    findFirefox: vi.fn(),
    findFirefoxSync: vi.fn(),
    findWebkit: vi.fn(),
    findWebkitSync: vi.fn(),
  },
}))

describe('BrowserFinder', () => {
  let finder: BrowserFinder
  const mockSystemBrowserFinder = systemBrowserFinder as any
  const mockPuppeteerBrowserFinder = puppeteerBrowserFinder as any
  const mockPlaywrightBrowserFinder = playwrightBrowserFinder as any

  beforeEach(() => {
    vi.clearAllMocks()
    finder = new BrowserFinder()
  })

  describe('constructor', () => {
    it('should initialize with correct properties', () => {
      expect(finder.puppeteer).toBe(puppeteerBrowserFinder)
      expect(finder.playwright).toBe(playwrightBrowserFinder)
      expect(finder.system).toBe(systemBrowserFinder)
    })
  })

  describe('find', () => {
    it('should return combined results from all finders', async () => {
      const puppeteerResult = [{ type: 'chrome', version: '100', dir: '/path1', executablePath: '/path1/chrome' }]
      const playwrightResult = [{ type: 'firefox', version: '99', dir: '/path2', executablePath: '/path2/firefox' }]
      const systemResult = [{ type: 'edge', version: '98', dir: '/path3', executablePath: '/path3/edge' }]

      mockPuppeteerBrowserFinder.find.mockResolvedValue(puppeteerResult)
      mockPlaywrightBrowserFinder.find.mockResolvedValue(playwrightResult)
      mockSystemBrowserFinder.find.mockResolvedValue(systemResult)

      const result = await finder.find()

      expect(result).toEqual([...puppeteerResult, ...playwrightResult, ...systemResult])
      expect(mockPuppeteerBrowserFinder.find).toHaveBeenCalled()
      expect(mockPlaywrightBrowserFinder.find).toHaveBeenCalled()
      expect(mockSystemBrowserFinder.find).toHaveBeenCalled()
    })

    it('should handle empty results', async () => {
      mockPuppeteerBrowserFinder.find.mockResolvedValue([])
      mockPlaywrightBrowserFinder.find.mockResolvedValue([])
      mockSystemBrowserFinder.find.mockResolvedValue([])

      const result = await finder.find()

      expect(result).toEqual([])
    })
  })

  describe('findSync', () => {
    it('should return combined results from all finders', () => {
      const puppeteerResult = [{ type: 'chrome', version: '100', dir: '/path1', executablePath: '/path1/chrome' }]
      const playwrightResult = [{ type: 'firefox', version: '99', dir: '/path2', executablePath: '/path2/firefox' }]
      const systemResult = [{ type: 'edge', version: '98', dir: '/path3', executablePath: '/path3/edge' }]

      mockPuppeteerBrowserFinder.findSync.mockReturnValue(puppeteerResult)
      mockPlaywrightBrowserFinder.findSync.mockReturnValue(playwrightResult)
      mockSystemBrowserFinder.findSync.mockReturnValue(systemResult)

      const result = finder.findSync()

      expect(result).toEqual([...puppeteerResult, ...playwrightResult, ...systemResult])
    })
  })

  describe('findChrome', () => {
    it('should return combined results from puppeteer and system finders', async () => {
      const puppeteerResult = { type: 'chrome', version: '100', dir: '/path1', executablePath: '/path1/chrome' }
      const systemResult = [{ type: 'chrome', version: '99', dir: '/path2', executablePath: '/path2/chrome' }]

      mockPuppeteerBrowserFinder.findChrome.mockResolvedValue(puppeteerResult)
      mockSystemBrowserFinder.findChromeSync.mockReturnValue(systemResult)

      const result = await finder.findChrome()

      expect(result).toEqual([puppeteerResult, ...systemResult])
    })

    it('should filter out null/undefined results', async () => {
      mockPuppeteerBrowserFinder.findChrome.mockResolvedValue(null)
      mockSystemBrowserFinder.findChromeSync.mockReturnValue([undefined as any, { type: 'chrome', version: '99', dir: '/path2', executablePath: '/path2/chrome' }])

      const result = await finder.findChrome()

      expect(result).toEqual([{ type: 'chrome', version: '99', dir: '/path2', executablePath: '/path2/chrome' }])
    })
  })

  describe('findFirstChrome', () => {
    it('should return puppeteer result when available', async () => {
      const puppeteerResult = { type: 'chrome', version: '100', dir: '/path1', executablePath: '/path1/chrome' }

      mockPuppeteerBrowserFinder.findChrome.mockResolvedValue(puppeteerResult)
      mockSystemBrowserFinder.findChromeSync.mockReturnValue([])

      const result = await finder.findFirstChrome()

      expect(result).toBe(puppeteerResult)
    })

    it('should return system result when puppeteer result is not available', async () => {
      const systemResult = { type: 'chrome', version: '99', dir: '/path2', executablePath: '/path2/chrome' }

      mockPuppeteerBrowserFinder.findChrome.mockResolvedValue(null)
      mockSystemBrowserFinder.findChromeSync.mockReturnValue([systemResult])

      const result = await finder.findFirstChrome()

      expect(result).toBe(systemResult)
    })

    it('should return undefined when no results are available', async () => {
      mockPuppeteerBrowserFinder.findChrome.mockResolvedValue(null)
      mockSystemBrowserFinder.findChromeSync.mockReturnValue([])

      const result = await finder.findFirstChrome()

      expect(result).toBeUndefined()
    })
  })

  describe('findChromiumCoreSync', () => {
    it('should return combined results from all chromium-based browsers', () => {
      const chromeResult = [{ type: 'chrome', version: '100', dir: '/path1', executablePath: '/path1/chrome' }]
      const chromiumResult = [{ type: 'chromium', version: '99', dir: '/path2', executablePath: '/path2/chromium' }]
      const headlessResult = [{ type: 'chrome-headless-shell', version: '98', dir: '/path3', executablePath: '/path3/headless_shell' }]
      const edgeResult = [{ type: 'edge', version: '97', dir: '/path4', executablePath: '/path4/edge' }]
      const braveResult = [{ type: 'brave', version: '96', dir: '/path5', executablePath: '/path5/brave' }]

      mockPuppeteerBrowserFinder.findChromeSync.mockReturnValue(chromeResult[0])
      mockSystemBrowserFinder.findChromeSync.mockReturnValue([])
      mockPuppeteerBrowserFinder.findChromiumSync.mockReturnValue(chromiumResult[0])
      mockPlaywrightBrowserFinder.findChromiumSync.mockReturnValue([])
      mockPuppeteerBrowserFinder.findChromeHeadlessShellSync.mockReturnValue(headlessResult[0])
      mockPlaywrightBrowserFinder.findChromeHeadlessShellSync.mockReturnValue([])
      mockSystemBrowserFinder.findEdgeSync.mockReturnValue(edgeResult)
      mockSystemBrowserFinder.findBraveSync.mockReturnValue(braveResult)

      const result = finder.findChromiumCoreSync()

      expect(result).toEqual([...chromeResult, ...chromiumResult, ...headlessResult, ...edgeResult, ...braveResult])
    })
  })

  describe('browserFinder instance', () => {
    it('should be an instance of BrowserFinder', () => {
      expect(browserFinder).toBeInstanceOf(BrowserFinder)
    })
  })
})
