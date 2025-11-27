import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { PuppeteerBrowserFinder } from '../src/puppeteer/index'
import { Browser, computeExecutablePath } from '@snapka/browsers'

// Mock dependencies
vi.mock('node:fs', () => ({
  __esModule: true,
  default: {
    existsSync: vi.fn(),
    readdirSync: vi.fn(),
    accessSync: vi.fn(),
    promises: {
      readdir: vi.fn(),
      access: vi.fn(),
    },
  },
}))
vi.mock('node:path')
vi.mock('node:os')
vi.mock('@snapka/browsers')

const mockFs = fs as any
const mockPath = path as any
const mockOs = os as any
const mockComputeExecutablePath = computeExecutablePath as any

describe('PuppeteerBrowserFinder', () => {
  let finder: PuppeteerBrowserFinder

  beforeEach(() => {
    // Use resetAllMocks to ensure mocks are clean for each test
    vi.resetAllMocks()
    finder = new PuppeteerBrowserFinder()
    // Default mocks for path and os
    mockOs.homedir.mockReturnValue('/home/user')
    mockPath.join.mockImplementation((...args: string[]) => args.join('/'))
  })

  describe('constructor', () => {
    it('should initialize with correct directory structure', () => {
      // Specific setup for this test
      mockOs.homedir.mockReturnValue('/home/user')
      mockPath.join.mockReturnValue('/home/user/.cache/puppeteer')

      // The constructor call is what we're testing
      // eslint-disable-next-line no-new
      new PuppeteerBrowserFinder()
      expect(mockPath.join).toHaveBeenCalledWith('/home/user', '.cache', 'puppeteer')
    })
  })

  describe('findSync', () => {
    it('should find browsers from Puppeteer cache', () => {
      mockFs.existsSync.mockImplementation((p: string) => {
        if (p.includes('/chrome') || p.includes('/chromium') || p.includes('/firefox')) return true
        if (p.includes('chrome.exe')) return true
        return false
      })

      mockFs.readdirSync.mockImplementation((dirPath: string) => {
        if (dirPath.endsWith('/chrome')) {
          return [
            { name: 'win64-114.0.5735.198', isDirectory: () => true },
            { name: 'mac-114.0.5735.198', isDirectory: () => true },
          ]
        }
        if (dirPath.endsWith('/chromium')) {
          return [{ name: 'linux-115.0.5790.0', isDirectory: () => true }]
        }
        // Return empty for firefox and other browsers to test that path
        return []
      })

      mockComputeExecutablePath.mockReturnValue('/path/to/browser/chrome.exe')

      const result = finder.findSync()

      expect(result).toHaveLength(3)
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: Browser.CHROME, version: '114.0.5735.198' }),
          expect.objectContaining({ type: Browser.CHROME, version: '114.0.5735.198' }),
          expect.objectContaining({ type: Browser.CHROMIUM, version: '115.0.5790.0' }),
        ])
      )
    })

    it('should handle non-existent cache directories', () => {
      mockFs.existsSync.mockReturnValue(false)
      const result = finder.findSync()
      expect(result).toEqual([])
    })

    it('should handle errors when reading directories', () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockImplementation(() => {
        throw new Error('Permission denied')
      })

      const result = finder.findSync()
      expect(result).toEqual([])
    })

    it('should filter out non-existent executable paths', () => {
      // Only the base directory exists, not the executable
      mockFs.existsSync.mockImplementation((p: string) => !p.includes('chrome.exe'))

      mockFs.readdirSync.mockReturnValue([
        { name: 'win64-114.0.5735.198', isDirectory: () => true },
      ])
      mockComputeExecutablePath.mockReturnValue('/path/to/browser/chrome.exe')

      const result = finder.findSync()
      expect(result).toEqual([])
    })

    it('should handle files that are not directories', () => {
      mockFs.existsSync.mockImplementation((p: string) => {
        return p.endsWith('/chrome') || p.includes('chrome.exe')
      })

      mockFs.readdirSync.mockImplementation((dirPath: string) => {
        if (dirPath.endsWith('/chrome')) {
          return [
            { name: 'file.txt', isDirectory: () => false },
            { name: 'win64-114.0.5735.198', isDirectory: () => true },
          ]
        }
        return []
      })
      mockComputeExecutablePath.mockReturnValue('/path/to/browser/chrome.exe')

      const result = finder.findSync()

      expect(result).toHaveLength(1)
      expect(result[0].version).toBe('114.0.5735.198')
    })

    it('should handle malformed directory names', () => {
      mockFs.existsSync.mockImplementation((p: string) => {
        return p.endsWith('/chrome') || p.includes('chrome.exe')
      })

      mockFs.readdirSync.mockImplementation((dirPath: string) => {
        if (dirPath.endsWith('/chrome')) {
          return [
            { name: 'invalid', isDirectory: () => true },
            { name: 'win64-114.0.5735.198', isDirectory: () => true },
          ]
        }
        return []
      })
      mockComputeExecutablePath.mockReturnValue('/path/to/browser/chrome.exe')

      const result = finder.findSync()

      expect(result).toHaveLength(1)
      expect(result[0].version).toBe('114.0.5735.198')
    })
  })

  describe('find', () => {
    it('should find browsers asynchronously', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.promises.readdir.mockImplementation(async (dirPath: string) => {
        if (dirPath.endsWith('/chrome')) {
          return [{ name: 'win64-114.0.5735.198', isDirectory: () => true }]
        }
        return []
      })
      mockComputeExecutablePath.mockReturnValue('/path/to/browser/chrome.exe')
      mockFs.promises.access.mockResolvedValue(undefined)

      const result = await finder.find()

      const chromeResults = result.filter(r => r.type === Browser.CHROME)
      expect(chromeResults).toHaveLength(1)
      expect(chromeResults[0].version).toBe('114.0.5735.198')
    })

    it('should handle errors in async operations', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.promises.readdir.mockRejectedValue(new Error('Permission denied'))

      const result = await finder.find()
      expect(result).toEqual([])
    })

    it('should handle non-accessible files in async operations', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.promises.readdir.mockResolvedValue([
        { name: 'win64-114.0.5735.198', isDirectory: () => true },
      ])
      mockComputeExecutablePath.mockReturnValue('/path/to/browser/chrome.exe')
      mockFs.promises.access.mockRejectedValue(new Error('Permission denied'))

      const result = await finder.find()
      expect(result).toEqual([])
    })
  })

  describe('individual browser find methods', () => {
    it('should find Chrome browser', async () => {
      const mockChrome = {
        type: Browser.CHROME,
        dir: '/path/to/chrome',
        version: '114.0.5735.198',
        executablePath: '/path/to/chrome/chrome.exe',
      }
      const getExecutablePathsSpy = vi.spyOn(finder as any, 'getExecutablePaths').mockResolvedValue([mockChrome])

      const result = await finder.findChrome()

      expect(getExecutablePathsSpy).toHaveBeenCalledWith(Browser.CHROME)
      expect(result).toEqual(mockChrome)
    })

    it('should find Chromium browser', async () => {
      const mockChromium = {
        type: Browser.CHROMIUM,
        dir: '/path/to/chromium',
        version: '115.0.5790.0',
        executablePath: '/path/to/chromium/chrome.exe',
      }
      const getExecutablePathsSpy = vi.spyOn(finder as any, 'getExecutablePaths').mockResolvedValue([mockChromium])

      const result = await finder.findChromium()

      expect(getExecutablePathsSpy).toHaveBeenCalledWith(Browser.CHROMIUM)
      expect(result).toEqual(mockChromium)
    })

    it('should return undefined when no browsers found', async () => {
      vi.spyOn(finder as any, 'getExecutablePaths').mockResolvedValue([])
      const result = await finder.findChrome()
      expect(result).toBeUndefined()
    })

    it('should find Chrome browser synchronously', () => {
      const mockChrome = {
        type: Browser.CHROME,
        dir: '/path/to/chrome',
        version: '114.0.5735.198',
        executablePath: '/path/to/chrome/chrome.exe',
      }
      const getExecutablePathsSyncSpy = vi.spyOn(finder as any, 'getExecutablePathsSync').mockReturnValue([mockChrome])

      const result = finder.findChromeSync()

      expect(getExecutablePathsSyncSpy).toHaveBeenCalledWith(Browser.CHROME)
      expect(result).toEqual(mockChrome)
    })

    it('should find Firefox browser synchronously', () => {
      const mockFirefox = {
        type: Browser.FIREFOX,
        dir: '/path/to/firefox',
        version: '100.0',
        executablePath: '/path/to/firefox/firefox',
      }
      const getExecutablePathsSyncSpy = vi.spyOn(finder as any, 'getExecutablePathsSync').mockReturnValue([mockFirefox])

      const result = finder.findFirefoxSync()

      expect(getExecutablePathsSyncSpy).toHaveBeenCalledWith(Browser.FIREFOX)
      expect(result).toEqual(mockFirefox)
    })

    it('should find Chromium browser synchronously', () => {
      const mockChromium = {
        type: Browser.CHROMIUM,
        dir: '/path/to/chromium',
        version: '115.0.5790.0',
        executablePath: '/path/to/chromium/chrome',
      }
      const getExecutablePathsSyncSpy = vi.spyOn(finder as any, 'getExecutablePathsSync').mockReturnValue([mockChromium])

      const result = finder.findChromiumSync()

      expect(getExecutablePathsSyncSpy).toHaveBeenCalledWith(Browser.CHROMIUM)
      expect(result).toEqual(mockChromium)
    })

    it('should find Chrome Headless Shell browser synchronously', () => {
      const mockHeadlessShell = {
        type: Browser.CHROMEHEADLESSSHELL,
        dir: '/path/to/headless',
        version: '115.0.5790.0',
        executablePath: '/path/to/headless/headless_shell',
      }
      const getExecutablePathsSyncSpy = vi.spyOn(finder as any, 'getExecutablePathsSync').mockReturnValue([mockHeadlessShell])

      const result = finder.findChromeHeadlessShellSync()

      expect(getExecutablePathsSyncSpy).toHaveBeenCalledWith(Browser.CHROMEHEADLESSSHELL)
      expect(result).toEqual(mockHeadlessShell)
    })

    it('should find Chrome Headless Shell browser asynchronously', async () => {
      const mockHeadlessShell = {
        type: Browser.CHROMEHEADLESSSHELL,
        dir: '/path/to/headless',
        version: '115.0.5790.0',
        executablePath: '/path/to/headless/headless_shell',
      }
      const getExecutablePathsSpy = vi.spyOn(finder as any, 'getExecutablePaths').mockResolvedValue([mockHeadlessShell])

      const result = await finder.findChromeHeadlessShell()

      expect(getExecutablePathsSpy).toHaveBeenCalledWith(Browser.CHROMEHEADLESSSHELL)
      expect(result).toEqual(mockHeadlessShell)
    })

    it('should find Firefox browser asynchronously', async () => {
      const mockFirefox = {
        type: Browser.FIREFOX,
        dir: '/path/to/firefox',
        version: '100.0',
        executablePath: '/path/to/firefox/firefox',
      }
      const getExecutablePathsSpy = vi.spyOn(finder as any, 'getExecutablePaths').mockResolvedValue([mockFirefox])

      const result = await finder.findFirefox()

      expect(getExecutablePathsSpy).toHaveBeenCalledWith(Browser.FIREFOX)
      expect(result).toEqual(mockFirefox)
    })

    it('should find ChromeDriver asynchronously', async () => {
      const mockChromeDriver = {
        type: Browser.CHROMEDRIVER,
        dir: '/path/to/chromedriver',
        version: '114.0.5735.90',
        executablePath: '/path/to/chromedriver/chromedriver',
      }
      const getExecutablePathsSpy = vi.spyOn(finder as any, 'getExecutablePaths').mockResolvedValue([mockChromeDriver])

      const result = await finder.findChromeDriver()

      expect(getExecutablePathsSpy).toHaveBeenCalledWith(Browser.CHROMEDRIVER)
      expect(result).toEqual(mockChromeDriver)
    })

    it('should find ChromeDriver synchronously', () => {
      const mockChromeDriver = {
        type: Browser.CHROMEDRIVER,
        dir: '/path/to/chromedriver',
        version: '114.0.5735.90',
        executablePath: '/path/to/chromedriver/chromedriver',
      }
      const getExecutablePathsSyncSpy = vi.spyOn(finder as any, 'getExecutablePathsSync').mockReturnValue([mockChromeDriver])

      const result = finder.findChromeDriverSync()

      expect(getExecutablePathsSyncSpy).toHaveBeenCalledWith(Browser.CHROMEDRIVER)
      expect(result).toEqual(mockChromeDriver)
    })

    it('should return undefined when no matching browser found in sync method', () => {
      const mockChrome = {
        type: Browser.CHROME,
        dir: '/path/to/chrome',
        version: '114.0.5735.198',
        executablePath: '/path/to/chrome/chrome.exe',
      }
      vi.spyOn(finder as any, 'getExecutablePathsSync').mockReturnValue([mockChrome])

      const result = finder.findFirefoxSync()

      expect(result).toBeUndefined()
    })
  })
})
