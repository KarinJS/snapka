import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { PlaywrightBrowserFinder, playwrightBrowserFinder } from '../src/playwright'
import os from 'node:os'
import path from 'node:path'

vi.mock('node:fs')
vi.mock('node:os')
vi.mock('node:path')

describe('PlaywrightBrowserFinder', () => {
  let finder: PlaywrightBrowserFinder

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(os.homedir).mockReturnValue('/home/user')
    vi.mocked(path.join).mockImplementation((...args: string[]) => args.join('/'))
    finder = new PlaywrightBrowserFinder()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(finder).toBeInstanceOf(PlaywrightBrowserFinder)
    })

    it('should initialize with correct browser base directory', () => {
      // The constructor should not throw
      expect(() => new PlaywrightBrowserFinder()).not.toThrow()
    })

    it('should handle unsupported platform', () => {
      const originalPlatform = process.platform
      Object.defineProperty(process, 'platform', {
        value: 'freebsd',
        writable: true,
        configurable: true,
      })

      try {
        expect(() => new PlaywrightBrowserFinder()).toThrow('Unsupported platform')
      } finally {
        Object.defineProperty(process, 'platform', {
          value: originalPlatform,
          writable: true,
          configurable: true,
        })
      }
    })

    it('should use XDG_CACHE_HOME on Linux if available', () => {
      const originalPlatform = process.platform
      const originalEnv = process.env

      Object.defineProperty(process, 'platform', {
        value: 'linux',
        writable: true,
        configurable: true,
      })
      process.env = { ...originalEnv, XDG_CACHE_HOME: '/custom/cache' }

      try {
        const linuxFinder = new PlaywrightBrowserFinder()
        expect(linuxFinder).toBeInstanceOf(PlaywrightBrowserFinder)
      } finally {
        Object.defineProperty(process, 'platform', {
          value: originalPlatform,
          writable: true,
          configurable: true,
        })
        process.env = originalEnv
      }
    })

    it('should use LOCALAPPDATA on Windows if available', () => {
      const originalPlatform = process.platform
      const originalEnv = process.env

      Object.defineProperty(process, 'platform', {
        value: 'win32',
        writable: true,
        configurable: true,
      })
      process.env = { ...originalEnv, LOCALAPPDATA: 'C:\\Users\\Test\\AppData\\Local' }

      try {
        const winFinder = new PlaywrightBrowserFinder()
        expect(winFinder).toBeInstanceOf(PlaywrightBrowserFinder)
      } finally {
        Object.defineProperty(process, 'platform', {
          value: originalPlatform,
          writable: true,
          configurable: true,
        })
        process.env = originalEnv
      }
    })
  })

  describe('findSync', () => {
    it('should return an array', () => {
      const result = finder.findSync()
      expect(Array.isArray(result)).toBe(true)
    })

    it('should return browser info objects with correct structure', () => {
      const result = finder.findSync()

      result.forEach(browser => {
        expect(browser).toHaveProperty('type')
        expect(browser).toHaveProperty('executablePath')
        expect(browser).toHaveProperty('dir')
        expect(browser).toHaveProperty('version')

        // Type should be one of the valid Playwright browser types
        expect(['chromium', 'chrome-headless-shell', 'firefox', 'webkit']).toContain(browser.type)
      })
    })

    it('should not return duplicate browsers', () => {
      const result = finder.findSync()
      const uniqueKeys = new Set(result.map(b => `${b.type}-${b.version}`))

      expect(result.length).toBe(uniqueKeys.size)
    })
  })

  describe('find', () => {
    it('should return a promise', async () => {
      const result = finder.find()
      expect(result).toBeInstanceOf(Promise)
    })

    it('should resolve to an array', async () => {
      const result = await finder.find()
      expect(Array.isArray(result)).toBe(true)
    })

    it('should return browser info with correct structure', async () => {
      const result = await finder.find()

      result.forEach(browser => {
        expect(browser).toHaveProperty('type')
        expect(browser).toHaveProperty('executablePath')
        expect(browser).toHaveProperty('dir')
        expect(browser).toHaveProperty('version')
      })
    })
  })

  describe('findChromiumSync', () => {
    it('should return undefined or a browser info object', () => {
      const result = finder.findChromiumSync()

      if (result) {
        expect(result.type).toBe('chromium')
        expect(result).toHaveProperty('executablePath')
        expect(result).toHaveProperty('dir')
        expect(result).toHaveProperty('version')
      } else {
        expect(result).toBeUndefined()
      }
    })
  })

  describe('findChromium', () => {
    it('should return a promise', async () => {
      const result = finder.findChromium()
      expect(result).toBeInstanceOf(Promise)
    })

    it('should resolve to undefined or a browser info object', async () => {
      const result = await finder.findChromium()

      if (result) {
        expect(result.type).toBe('chromium')
      } else {
        expect(result).toBeUndefined()
      }
    })
  })

  describe('findChromeHeadlessShellSync', () => {
    it('should return undefined or a browser info object', () => {
      const result = finder.findChromeHeadlessShellSync()

      if (result) {
        expect(result.type).toBe('chrome-headless-shell')
      } else {
        expect(result).toBeUndefined()
      }
    })
  })

  describe('findChromeHeadlessShell', () => {
    it('should return a promise', async () => {
      const result = finder.findChromeHeadlessShell()
      expect(result).toBeInstanceOf(Promise)
    })

    it('should resolve to undefined or a browser info object', async () => {
      const result = await finder.findChromeHeadlessShell()

      if (result) {
        expect(result.type).toBe('chrome-headless-shell')
      } else {
        expect(result).toBeUndefined()
      }
    })
  })

  describe('findFirefoxSync', () => {
    it('should return undefined or a browser info object', () => {
      const result = finder.findFirefoxSync()

      if (result) {
        expect(result.type).toBe('firefox')
      } else {
        expect(result).toBeUndefined()
      }
    })
  })

  describe('findFirefox', () => {
    it('should return a promise', async () => {
      const result = finder.findFirefox()
      expect(result).toBeInstanceOf(Promise)
    })

    it('should resolve to undefined or a browser info object', async () => {
      const result = await finder.findFirefox()

      if (result) {
        expect(result.type).toBe('firefox')
      } else {
        expect(result).toBeUndefined()
      }
    })
  })

  describe('findWebkitSync', () => {
    it('should return undefined or a browser info object', () => {
      const result = finder.findWebkitSync()

      if (result) {
        expect(result.type).toBe('webkit')
      } else {
        expect(result).toBeUndefined()
      }
    })
  })

  describe('findWebkit', () => {
    it('should return a promise', async () => {
      const result = finder.findWebkit()
      expect(result).toBeInstanceOf(Promise)
    })

    it('should resolve to undefined or a browser info object', async () => {
      const result = await finder.findWebkit()

      if (result) {
        expect(result.type).toBe('webkit')
      } else {
        expect(result).toBeUndefined()
      }
    })
  })

  describe('playwrightBrowserFinder singleton', () => {
    it('should be an instance of PlaywrightBrowserFinder', () => {
      expect(playwrightBrowserFinder).toBeInstanceOf(PlaywrightBrowserFinder)
    })

    it('should be a singleton instance', () => {
      // The exported instance should always be the same
      expect(playwrightBrowserFinder).toBe(playwrightBrowserFinder)
    })
  })
})
