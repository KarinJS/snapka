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

  describe('findChromiumCore', () => {
    it('should return combined results from all chromium-based browsers', async () => {
      const chromeResult = [{ type: 'chrome', version: '100', dir: '/path1', executablePath: '/path1/chrome' }]
      const chromiumResult = [{ type: 'chromium', version: '99', dir: '/path2', executablePath: '/path2/chromium' }]
      const headlessResult = [{ type: 'chrome-headless-shell', version: '98', dir: '/path3', executablePath: '/path3/headless_shell' }]
      const edgeResult = [{ type: 'edge', version: '97', dir: '/path4', executablePath: '/path4/edge' }]
      const braveResult = [{ type: 'brave', version: '96', dir: '/path5', executablePath: '/path5/brave' }]

      mockPuppeteerBrowserFinder.findChrome.mockResolvedValue(chromeResult[0])
      mockSystemBrowserFinder.findChromeSync.mockReturnValue([])
      mockPuppeteerBrowserFinder.findChromium.mockResolvedValue(chromiumResult[0])
      mockPlaywrightBrowserFinder.findChromium.mockResolvedValue(null)
      mockPuppeteerBrowserFinder.findChromeHeadlessShell.mockResolvedValue(headlessResult[0])
      mockPlaywrightBrowserFinder.findChromeHeadlessShell.mockResolvedValue(null)
      mockSystemBrowserFinder.findEdgeSync.mockReturnValue(edgeResult)
      mockSystemBrowserFinder.findBraveSync.mockReturnValue(braveResult)

      const result = await finder.findChromiumCore()

      expect(result).toEqual([...chromeResult, ...chromiumResult, ...headlessResult, ...edgeResult, ...braveResult])
    })
  })

  describe('findChromeSync', () => {
    it('should return combined results from puppeteer and system finders', () => {
      const puppeteerResult = { type: 'chrome', version: '100', dir: '/path1', executablePath: '/path1/chrome' }
      const systemResult = [{ type: 'chrome', version: '99', dir: '/path2', executablePath: '/path2/chrome' }]

      mockPuppeteerBrowserFinder.findChromeSync.mockReturnValue(puppeteerResult)
      mockSystemBrowserFinder.findChromeSync.mockReturnValue(systemResult)

      const result = finder.findChromeSync()

      expect(result).toEqual([puppeteerResult, ...systemResult])
    })
  })

  describe('findChromium', () => {
    it('should return combined results from puppeteer and playwright', async () => {
      const puppeteerResult = { type: 'chromium', version: '100', dir: '/path1', executablePath: '/path1/chromium' }
      const playwrightResult = { type: 'chromium', version: '99', dir: '/path2', executablePath: '/path2/chromium' }

      mockPuppeteerBrowserFinder.findChromium.mockResolvedValue(puppeteerResult)
      mockPlaywrightBrowserFinder.findChromium.mockResolvedValue(playwrightResult)

      const result = await finder.findChromium()

      expect(result).toEqual([puppeteerResult, playwrightResult])
    })

    it('should filter out null results', async () => {
      mockPuppeteerBrowserFinder.findChromium.mockResolvedValue(null)
      mockPlaywrightBrowserFinder.findChromium.mockResolvedValue(null)

      const result = await finder.findChromium()

      expect(result).toEqual([])
    })
  })

  describe('findChromiumSync', () => {
    it('should return combined results from puppeteer and playwright', () => {
      const puppeteerResult = { type: 'chromium', version: '100', dir: '/path1', executablePath: '/path1/chromium' }
      const playwrightResult = { type: 'chromium', version: '99', dir: '/path2', executablePath: '/path2/chromium' }

      mockPuppeteerBrowserFinder.findChromiumSync.mockReturnValue(puppeteerResult)
      mockPlaywrightBrowserFinder.findChromiumSync.mockReturnValue(playwrightResult)

      const result = finder.findChromiumSync()

      expect(result).toEqual([puppeteerResult, playwrightResult])
    })
  })

  describe('findChromeHeadlessShell', () => {
    it('should return combined results from puppeteer and playwright', async () => {
      const puppeteerResult = { type: 'chrome-headless-shell', version: '100', dir: '/path1', executablePath: '/path1/headless_shell' }
      const playwrightResult = { type: 'chrome-headless-shell', version: '99', dir: '/path2', executablePath: '/path2/headless_shell' }

      mockPuppeteerBrowserFinder.findChromeHeadlessShell.mockResolvedValue(puppeteerResult)
      mockPlaywrightBrowserFinder.findChromeHeadlessShell.mockResolvedValue(playwrightResult)

      const result = await finder.findChromeHeadlessShell()

      expect(result).toEqual([puppeteerResult, playwrightResult])
    })
  })

  describe('findChromeHeadlessShellSync', () => {
    it('should return combined results from puppeteer and playwright', () => {
      const puppeteerResult = { type: 'chrome-headless-shell', version: '100', dir: '/path1', executablePath: '/path1/headless_shell' }
      const playwrightResult = { type: 'chrome-headless-shell', version: '99', dir: '/path2', executablePath: '/path2/headless_shell' }

      mockPuppeteerBrowserFinder.findChromeHeadlessShellSync.mockReturnValue(puppeteerResult)
      mockPlaywrightBrowserFinder.findChromeHeadlessShellSync.mockReturnValue(playwrightResult)

      const result = finder.findChromeHeadlessShellSync()

      expect(result).toEqual([puppeteerResult, playwrightResult])
    })
  })

  describe('findFirefox', () => {
    it('should return combined results from puppeteer and playwright', async () => {
      const puppeteerResult = { type: 'firefox', version: '100', dir: '/path1', executablePath: '/path1/firefox' }
      const playwrightResult = { type: 'firefox', version: '99', dir: '/path2', executablePath: '/path2/firefox' }

      mockPuppeteerBrowserFinder.findFirefox.mockResolvedValue(puppeteerResult)
      mockPlaywrightBrowserFinder.findFirefox.mockResolvedValue(playwrightResult)

      const result = await finder.findFirefox()

      expect(result).toEqual([puppeteerResult, playwrightResult])
    })
  })

  describe('findFirefoxSync', () => {
    it('should return combined results from puppeteer and playwright', () => {
      const puppeteerResult = { type: 'firefox', version: '100', dir: '/path1', executablePath: '/path1/firefox' }
      const playwrightResult = { type: 'firefox', version: '99', dir: '/path2', executablePath: '/path2/firefox' }

      mockPuppeteerBrowserFinder.findFirefoxSync.mockReturnValue(puppeteerResult)
      mockPlaywrightBrowserFinder.findFirefoxSync.mockReturnValue(playwrightResult)

      const result = finder.findFirefoxSync()

      expect(result).toEqual([puppeteerResult, playwrightResult])
    })
  })

  describe('findWebkit', () => {
    it('should return webkit result in array when found', async () => {
      const webkitResult = { type: 'webkit', version: '100', dir: '/path1', executablePath: '/path1/webkit' }

      mockPlaywrightBrowserFinder.findWebkit.mockResolvedValue(webkitResult)

      const result = await finder.findWebkit()

      expect(result).toEqual([webkitResult])
    })

    it('should return empty array when webkit not found', async () => {
      mockPlaywrightBrowserFinder.findWebkit.mockResolvedValue(null)

      const result = await finder.findWebkit()

      expect(result).toEqual([])
    })
  })

  describe('findWebkitSync', () => {
    it('should return webkit result in array when found', () => {
      const webkitResult = { type: 'webkit', version: '100', dir: '/path1', executablePath: '/path1/webkit' }

      mockPlaywrightBrowserFinder.findWebkitSync.mockReturnValue(webkitResult)

      const result = finder.findWebkitSync()

      expect(result).toEqual([webkitResult])
    })

    it('should return empty array when webkit not found', () => {
      mockPlaywrightBrowserFinder.findWebkitSync.mockReturnValue(null)

      const result = finder.findWebkitSync()

      expect(result).toEqual([])
    })
  })

  describe('findEdge', () => {
    it('should return edge results from system finder', async () => {
      const edgeResult = [{ type: 'edge', version: '100', dir: '/path1', executablePath: '/path1/edge' }]

      mockSystemBrowserFinder.findEdgeSync.mockReturnValue(edgeResult)

      const result = await finder.findEdge()

      expect(result).toEqual(edgeResult)
    })
  })

  describe('findEdgeSync', () => {
    it('should return edge results from system finder', () => {
      const edgeResult = [{ type: 'edge', version: '100', dir: '/path1', executablePath: '/path1/edge' }]

      mockSystemBrowserFinder.findEdgeSync.mockReturnValue(edgeResult)

      const result = finder.findEdgeSync()

      expect(result).toEqual(edgeResult)
    })
  })

  describe('findBrave', () => {
    it('should return brave results from system finder', async () => {
      const braveResult = [{ type: 'brave', version: '100', dir: '/path1', executablePath: '/path1/brave' }]

      mockSystemBrowserFinder.findBraveSync.mockReturnValue(braveResult)

      const result = await finder.findBrave()

      expect(result).toEqual(braveResult)
    })
  })

  describe('findBraveSync', () => {
    it('should return brave results from system finder', () => {
      const braveResult = [{ type: 'brave', version: '100', dir: '/path1', executablePath: '/path1/brave' }]

      mockSystemBrowserFinder.findBraveSync.mockReturnValue(braveResult)

      const result = finder.findBraveSync()

      expect(result).toEqual(braveResult)
    })
  })

  describe('findFirstChromeSync', () => {
    it('should return puppeteer result when available', () => {
      const puppeteerResult = { type: 'chrome', version: '100', dir: '/path1', executablePath: '/path1/chrome' }

      mockPuppeteerBrowserFinder.findChromeSync.mockReturnValue(puppeteerResult)
      mockSystemBrowserFinder.findChromeSync.mockReturnValue([])

      const result = finder.findFirstChromeSync()

      expect(result).toBe(puppeteerResult)
    })

    it('should return system result when puppeteer result is not available', () => {
      const systemResult = { type: 'chrome', version: '99', dir: '/path2', executablePath: '/path2/chrome' }

      mockPuppeteerBrowserFinder.findChromeSync.mockReturnValue(null)
      mockSystemBrowserFinder.findChromeSync.mockReturnValue([systemResult])

      const result = finder.findFirstChromeSync()

      expect(result).toBe(systemResult)
    })
  })

  describe('findFirstChromium', () => {
    it('should return puppeteer result when available', async () => {
      const puppeteerResult = { type: 'chromium', version: '100', dir: '/path1', executablePath: '/path1/chromium' }

      mockPuppeteerBrowserFinder.findChromium.mockResolvedValue(puppeteerResult)
      mockPlaywrightBrowserFinder.findChromium.mockResolvedValue(null)

      const result = await finder.findFirstChromium()

      expect(result).toBe(puppeteerResult)
    })

    it('should return playwright result when puppeteer result is not available', async () => {
      const playwrightResult = { type: 'chromium', version: '99', dir: '/path2', executablePath: '/path2/chromium' }

      mockPuppeteerBrowserFinder.findChromium.mockResolvedValue(null)
      mockPlaywrightBrowserFinder.findChromium.mockResolvedValue(playwrightResult)

      const result = await finder.findFirstChromium()

      expect(result).toBe(playwrightResult)
    })
  })

  describe('findFirstChromiumSync', () => {
    it('should return puppeteer result when available', () => {
      const puppeteerResult = { type: 'chromium', version: '100', dir: '/path1', executablePath: '/path1/chromium' }

      mockPuppeteerBrowserFinder.findChromiumSync.mockReturnValue(puppeteerResult)
      mockPlaywrightBrowserFinder.findChromiumSync.mockReturnValue(null)

      const result = finder.findFirstChromiumSync()

      expect(result).toBe(puppeteerResult)
    })

    it('should return playwright result when puppeteer result is not available', () => {
      const playwrightResult = { type: 'chromium', version: '99', dir: '/path2', executablePath: '/path2/chromium' }

      mockPuppeteerBrowserFinder.findChromiumSync.mockReturnValue(null)
      mockPlaywrightBrowserFinder.findChromiumSync.mockReturnValue(playwrightResult)

      const result = finder.findFirstChromiumSync()

      expect(result).toBe(playwrightResult)
    })
  })

  describe('findFirstFirefox', () => {
    it('should return puppeteer result when available', async () => {
      const puppeteerResult = { type: 'firefox', version: '100', dir: '/path1', executablePath: '/path1/firefox' }

      mockPuppeteerBrowserFinder.findFirefox.mockResolvedValue(puppeteerResult)
      mockPlaywrightBrowserFinder.findFirefox.mockResolvedValue(null)

      const result = await finder.findFirstFirefox()

      expect(result).toBe(puppeteerResult)
    })

    it('should return playwright result when puppeteer result is not available', async () => {
      const playwrightResult = { type: 'firefox', version: '99', dir: '/path2', executablePath: '/path2/firefox' }

      mockPuppeteerBrowserFinder.findFirefox.mockResolvedValue(null)
      mockPlaywrightBrowserFinder.findFirefox.mockResolvedValue(playwrightResult)

      const result = await finder.findFirstFirefox()

      expect(result).toBe(playwrightResult)
    })
  })

  describe('findFirstFirefoxSync', () => {
    it('should return puppeteer result when available', () => {
      const puppeteerResult = { type: 'firefox', version: '100', dir: '/path1', executablePath: '/path1/firefox' }

      mockPuppeteerBrowserFinder.findFirefoxSync.mockReturnValue(puppeteerResult)
      mockPlaywrightBrowserFinder.findFirefoxSync.mockReturnValue(null)

      const result = finder.findFirstFirefoxSync()

      expect(result).toBe(puppeteerResult)
    })

    it('should return playwright result when puppeteer result is not available', () => {
      const playwrightResult = { type: 'firefox', version: '99', dir: '/path2', executablePath: '/path2/firefox' }

      mockPuppeteerBrowserFinder.findFirefoxSync.mockReturnValue(null)
      mockPlaywrightBrowserFinder.findFirefoxSync.mockReturnValue(playwrightResult)

      const result = finder.findFirstFirefoxSync()

      expect(result).toBe(playwrightResult)
    })
  })

  describe('findFirstChromeHeadlessShell', () => {
    it('should return puppeteer result when available', async () => {
      const puppeteerResult = { type: 'chrome-headless-shell', version: '100', dir: '/path1', executablePath: '/path1/headless_shell' }

      mockPuppeteerBrowserFinder.findChromeHeadlessShell.mockResolvedValue(puppeteerResult)
      mockPlaywrightBrowserFinder.findChromeHeadlessShell.mockResolvedValue(null)

      const result = await finder.findFirstChromeHeadlessShell()

      expect(result).toBe(puppeteerResult)
    })

    it('should return playwright result when puppeteer result is not available', async () => {
      const playwrightResult = { type: 'chrome-headless-shell', version: '99', dir: '/path2', executablePath: '/path2/headless_shell' }

      mockPuppeteerBrowserFinder.findChromeHeadlessShell.mockResolvedValue(null)
      mockPlaywrightBrowserFinder.findChromeHeadlessShell.mockResolvedValue(playwrightResult)

      const result = await finder.findFirstChromeHeadlessShell()

      expect(result).toBe(playwrightResult)
    })
  })

  describe('findFirstChromeHeadlessShellSync', () => {
    it('should return puppeteer result when available', () => {
      const puppeteerResult = { type: 'chrome-headless-shell', version: '100', dir: '/path1', executablePath: '/path1/headless_shell' }

      mockPuppeteerBrowserFinder.findChromeHeadlessShellSync.mockReturnValue(puppeteerResult)
      mockPlaywrightBrowserFinder.findChromeHeadlessShellSync.mockReturnValue(null)

      const result = finder.findFirstChromeHeadlessShellSync()

      expect(result).toBe(puppeteerResult)
    })

    it('should return playwright result when puppeteer result is not available', () => {
      const playwrightResult = { type: 'chrome-headless-shell', version: '99', dir: '/path2', executablePath: '/path2/headless_shell' }

      mockPuppeteerBrowserFinder.findChromeHeadlessShellSync.mockReturnValue(null)
      mockPlaywrightBrowserFinder.findChromeHeadlessShellSync.mockReturnValue(playwrightResult)

      const result = finder.findFirstChromeHeadlessShellSync()

      expect(result).toBe(playwrightResult)
    })
  })

  describe('findFirstChromiumCore', () => {
    it('should return chrome when available', async () => {
      const chromeResult = { type: 'chrome', version: '100', dir: '/path1', executablePath: '/path1/chrome' }

      mockPuppeteerBrowserFinder.findChrome.mockResolvedValue(chromeResult)
      mockSystemBrowserFinder.findChromeSync.mockReturnValue([])

      const result = await finder.findFirstChromiumCore()

      expect(result).toBe(chromeResult)
    })

    it('should return chromium when chrome not available', async () => {
      const chromiumResult = { type: 'chromium', version: '99', dir: '/path2', executablePath: '/path2/chromium' }

      mockPuppeteerBrowserFinder.findChrome.mockResolvedValue(null)
      mockSystemBrowserFinder.findChromeSync.mockReturnValue([])
      mockPuppeteerBrowserFinder.findChromium.mockResolvedValue(chromiumResult)

      const result = await finder.findFirstChromiumCore()

      expect(result).toBe(chromiumResult)
    })

    it('should return headless shell when chrome and chromium not available', async () => {
      const headlessResult = { type: 'chrome-headless-shell', version: '98', dir: '/path3', executablePath: '/path3/headless_shell' }

      mockPuppeteerBrowserFinder.findChrome.mockResolvedValue(null)
      mockSystemBrowserFinder.findChromeSync.mockReturnValue([])
      mockPuppeteerBrowserFinder.findChromium.mockResolvedValue(null)
      mockPlaywrightBrowserFinder.findChromium.mockResolvedValue(null)
      mockPuppeteerBrowserFinder.findChromeHeadlessShell.mockResolvedValue(headlessResult)

      const result = await finder.findFirstChromiumCore()

      expect(result).toBe(headlessResult)
    })

    it('should return edge when chrome, chromium, and headless shell not available', async () => {
      const edgeResult = { type: 'edge', version: '97', dir: '/path4', executablePath: '/path4/edge' }

      mockPuppeteerBrowserFinder.findChrome.mockResolvedValue(null)
      mockSystemBrowserFinder.findChromeSync.mockReturnValue([])
      mockPuppeteerBrowserFinder.findChromium.mockResolvedValue(null)
      mockPlaywrightBrowserFinder.findChromium.mockResolvedValue(null)
      mockPuppeteerBrowserFinder.findChromeHeadlessShell.mockResolvedValue(null)
      mockPlaywrightBrowserFinder.findChromeHeadlessShell.mockResolvedValue(null)
      mockSystemBrowserFinder.findEdgeSync.mockReturnValue([edgeResult])

      const result = await finder.findFirstChromiumCore()

      expect(result).toBe(edgeResult)
    })

    it('should return brave when all other browsers not available', async () => {
      const braveResult = { type: 'brave', version: '96', dir: '/path5', executablePath: '/path5/brave' }

      mockPuppeteerBrowserFinder.findChrome.mockResolvedValue(null)
      mockSystemBrowserFinder.findChromeSync.mockReturnValue([])
      mockPuppeteerBrowserFinder.findChromium.mockResolvedValue(null)
      mockPlaywrightBrowserFinder.findChromium.mockResolvedValue(null)
      mockPuppeteerBrowserFinder.findChromeHeadlessShell.mockResolvedValue(null)
      mockPlaywrightBrowserFinder.findChromeHeadlessShell.mockResolvedValue(null)
      mockSystemBrowserFinder.findEdgeSync.mockReturnValue([])
      mockSystemBrowserFinder.findBraveSync.mockReturnValue([braveResult])

      const result = await finder.findFirstChromiumCore()

      expect(result).toBe(braveResult)
    })
  })

  describe('findFirstChromiumCoreSync', () => {
    it('should return chrome when available', () => {
      const chromeResult = { type: 'chrome', version: '100', dir: '/path1', executablePath: '/path1/chrome' }

      mockPuppeteerBrowserFinder.findChromeSync.mockReturnValue(chromeResult)

      const result = finder.findFirstChromiumCoreSync()

      expect(result).toBe(chromeResult)
    })

    it('should return chromium when chrome not available', () => {
      const chromiumResult = { type: 'chromium', version: '99', dir: '/path2', executablePath: '/path2/chromium' }

      mockPuppeteerBrowserFinder.findChromeSync.mockReturnValue(null)
      mockSystemBrowserFinder.findChromeSync.mockReturnValue([])
      mockPuppeteerBrowserFinder.findChromiumSync.mockReturnValue(chromiumResult)

      const result = finder.findFirstChromiumCoreSync()

      expect(result).toBe(chromiumResult)
    })

    it('should return headless shell when chrome and chromium not available', () => {
      const headlessResult = { type: 'chrome-headless-shell', version: '98', dir: '/path3', executablePath: '/path3/headless_shell' }

      mockPuppeteerBrowserFinder.findChromeSync.mockReturnValue(null)
      mockSystemBrowserFinder.findChromeSync.mockReturnValue([])
      mockPuppeteerBrowserFinder.findChromiumSync.mockReturnValue(null)
      mockPlaywrightBrowserFinder.findChromiumSync.mockReturnValue(null)
      mockPuppeteerBrowserFinder.findChromeHeadlessShellSync.mockReturnValue(headlessResult)

      const result = finder.findFirstChromiumCoreSync()

      expect(result).toBe(headlessResult)
    })

    it('should return edge when chrome, chromium, and headless shell not available', () => {
      const edgeResult = { type: 'edge', version: '97', dir: '/path4', executablePath: '/path4/edge' }

      mockPuppeteerBrowserFinder.findChromeSync.mockReturnValue(null)
      mockSystemBrowserFinder.findChromeSync.mockReturnValue([])
      mockPuppeteerBrowserFinder.findChromiumSync.mockReturnValue(null)
      mockPlaywrightBrowserFinder.findChromiumSync.mockReturnValue(null)
      mockPuppeteerBrowserFinder.findChromeHeadlessShellSync.mockReturnValue(null)
      mockPlaywrightBrowserFinder.findChromeHeadlessShellSync.mockReturnValue(null)
      mockSystemBrowserFinder.findEdgeSync.mockReturnValue([edgeResult])

      const result = finder.findFirstChromiumCoreSync()

      expect(result).toBe(edgeResult)
    })

    it('should return brave when all other browsers not available', () => {
      const braveResult = { type: 'brave', version: '96', dir: '/path5', executablePath: '/path5/brave' }

      mockPuppeteerBrowserFinder.findChromeSync.mockReturnValue(null)
      mockSystemBrowserFinder.findChromeSync.mockReturnValue([])
      mockPuppeteerBrowserFinder.findChromiumSync.mockReturnValue(null)
      mockPlaywrightBrowserFinder.findChromiumSync.mockReturnValue(null)
      mockPuppeteerBrowserFinder.findChromeHeadlessShellSync.mockReturnValue(null)
      mockPlaywrightBrowserFinder.findChromeHeadlessShellSync.mockReturnValue(null)
      mockSystemBrowserFinder.findEdgeSync.mockReturnValue([])
      mockSystemBrowserFinder.findBraveSync.mockReturnValue([braveResult])

      const result = finder.findFirstChromiumCoreSync()

      expect(result).toBe(braveResult)
    })
  })

  describe('browserFinder instance', () => {
    it('should be an instance of BrowserFinder', () => {
      expect(browserFinder).toBeInstanceOf(BrowserFinder)
    })
  })
})
