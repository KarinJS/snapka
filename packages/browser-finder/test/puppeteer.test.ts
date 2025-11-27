import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { PuppeteerBrowserFinder } from '../src/puppeteer/index'
import { Browser, computeExecutablePath } from '@snapka/browsers'

// Mock dependencies
vi.mock('node:fs')
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
    vi.clearAllMocks()
    finder = new PuppeteerBrowserFinder()
  })

  describe('constructor', () => {
    it('should initialize with correct directory structure', () => {
      mockOs.homedir.mockReturnValue('/home/user')
      mockPath.join.mockReturnValue('/home/user/.cache/puppeteer')

      const newFinder = new PuppeteerBrowserFinder()

      expect(mockPath.join).toHaveBeenCalledWith('/home/user', '.cache', 'puppeteer')
    })
  })

  describe('findSync', () => {
    it('should find browsers from Puppeteer cache', () => {
      mockOs.homedir.mockReturnValue('/home/user')
      mockPath.join.mockImplementation((...args) => args.join('/'))

      // Mock directory structure
      mockFs.existsSync.mockImplementation((dirPath: string) => {
        return dirPath.includes('.cache/puppeteer')
      })

      // Mock readdirSync with file types
      mockFs.readdirSync.mockImplementation((dirPath: string) => {
        if (dirPath.includes('/chrome')) {
          return [
            { name: 'win64-114.0.5735.198', isDirectory: () => true },
            { name: 'mac-114.0.5735.198', isDirectory: () => true },
          ]
        }
        if (dirPath.includes('/chromium')) {
          return [
            { name: 'linux-115.0.5790.0', isDirectory: () => true },
          ]
        }
        return []
      })

      // Mock computeExecutablePath
      mockComputeExecutablePath.mockReturnValue('/path/to/browser/chrome.exe')

      // Mock file existence check
      mockFs.existsSync.mockImplementation((execPath: string) => {
        return execPath.includes('chrome.exe')
      })

      const result = finder.findSync()

      expect(result).toHaveLength(3)
      expect(result[0].type).toBe(Browser.CHROME)
      expect(result[0].version).toBe('114.0.5735.198')
      expect(result[1].type).toBe(Browser.CHROME)
      expect(result[1].version).toBe('114.0.5735.198')
      expect(result[2].type).toBe(Browser.CHROMIUM)
      expect(result[2].version).toBe('115.0.5790.0')
    })

    it('should handle non-existent cache directories', () => {
      mockOs.homedir.mockReturnValue('/home/user')
      mockPath.join.mockImplementation((...args) => args.join('/'))
      mockFs.existsSync.mockReturnValue(false)

      const result = finder.findSync()

      expect(result).toEqual([])
    })

    it('should handle errors when reading directories', () => {
      mockOs.homedir.mockReturnValue('/home/user')
      mockPath.join.mockImplementation((...args) => args.join('/'))
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockImplementation(() => {
        throw new Error('Permission denied')
      })

      const result = finder.findSync()

      expect(result).toEqual([])
    })

    it('should filter out non-existent executable paths', () => {
      mockOs.homedir.mockReturnValue('/home/user')
      mockPath.join.mockImplementation((...args) => args.join('/'))
      mockFs.existsSync.mockImplementation((path: string) => {
        // Return true for directories, false for executable files
        return !path.includes('chrome.exe')
      })

      // Mock readdirSync with file types
      mockFs.readdirSync.mockReturnValue([
        { name: 'win64-114.0.5735.198', isDirectory: () => true },
      ])

      // Mock computeExecutablePath
      mockComputeExecutablePath.mockReturnValue('/path/to/browser/chrome.exe')

      const result = finder.findSync()

      expect(result).toEqual([])
    })

    it('should handle files that are not directories', () => {
      mockOs.homedir.mockReturnValue('/home/user')
      mockPath.join.mockImplementation((...args) => args.join('/'))
      mockFs.existsSync.mockReturnValue(true)

      // Mock readdirSync with non-directory files
      mockFs.readdirSync.mockReturnValue([
        { name: 'file.txt', isDirectory: () => false },
        { name: 'win64-114.0.5735.198', isDirectory: () => true },
      ])

      // Mock computeExecutablePath
      mockComputeExecutablePath.mockReturnValue('/path/to/browser/chrome.exe')
      mockFs.existsSync.mockImplementation((path: string) => path.includes('chrome.exe'))

      const result = finder.findSync()

      expect(result).toHaveLength(1)
      expect(result[0].version).toBe('114.0.5735.198')
    })

    it('should handle malformed directory names', () => {
      mockOs.homedir.mockReturnValue('/home/user')
      mockPath.join.mockImplementation((...args) => args.join('/'))
      mockFs.existsSync.mockReturnValue(true)

      // Mock readdirSync with malformed directory names
      mockFs.readdirSync.mockReturnValue([
        { name: 'invalid-name', isDirectory: () => true },  // No version
        { name: 'win64-114.0.5735.198', isDirectory: () => true },
      ])

      // Mock computeExecutablePath
      mockComputeExecutablePath.mockReturnValue('/path/to/browser/chrome.exe')
      mockFs.existsSync.mockImplementation((path: string) => path.includes('chrome.exe'))

      const result = finder.findSync()

      expect(result).toHaveLength(1)  // Only the valid directory should be processed
      expect(result[0].version).toBe('114.0.5735.198')
    })
  })

  describe('find', () => {
    it('should find browsers asynchronously', async () => {
      mockOs.homedir.mockReturnValue('/home/user')
      mockPath.join.mockImplementation((...args) => args.join('/'))

      // Mock async directory operations
      mockFs.existsSync.mockReturnValue(true)
      mockFs.promises.readdir.mockResolvedValue([
        { name: 'win64-114.0.5735.198', isDirectory: () => true },
      ])

      // Mock computeExecutablePath
      mockComputeExecutablePath.mockReturnValue('/path/to/browser/chrome.exe')

      // Mock async file access check
      mockFs.promises.access.mockResolvedValue(undefined)

      const result = await finder.find()

      expect(result).toHaveLength(1)
      expect(result[0].type).toBe(Browser.CHROME)
      expect(result[0].version).toBe('114.0.5735.198')
    })

    it('should handle errors in async operations', async () => {
      mockOs.homedir.mockReturnValue('/home/user')
      mockPath.join.mockImplementation((...args) => args.join('/'))
      mockFs.existsSync.mockReturnValue(true)

      // Mock readdir to throw an error
      mockFs.promises.readdir.mockRejectedValue(new Error('Permission denied'))

      const result = await finder.find()

      expect(result).toEqual([])
    })

    it('should handle non-accessible files in async operations', async () => {
      mockOs.homedir.mockReturnValue('/home/user')
      mockPath.join.mockImplementation((...args) => args.join('/'))
      mockFs.existsSync.mockReturnValue(true)
      mockFs.promises.readdir.mockResolvedValue([
        { name: 'win64-114.0.5735.198', isDirectory: () => true },
      ])

      // Mock computeExecutablePath
      mockComputeExecutablePath.mockReturnValue('/path/to/browser/chrome.exe')

      // Mock access to throw an error (file not accessible)
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

      // Mock the private method
      const getExecutablePathsSpy = vi.spyOn(finder as any, 'getExecutablePaths')
        .mockResolvedValue([mockChrome])

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

      // Mock the private method
      const getExecutablePathsSpy = vi.spyOn(finder as any, 'getExecutablePaths')
        .mockResolvedValue([mockChromium])

      const result = await finder.findChromium()

      expect(getExecutablePathsSpy).toHaveBeenCalledWith(Browser.CHROMIUM)
      expect(result).toEqual(mockChromium)
    })

    it('should return undefined when no browsers found', async () => {
      // Mock the private method to return empty array
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

      // Mock the private method
      const getExecutablePathsSyncSpy = vi.spyOn(finder as any, 'getExecutablePathsSync')
        .mockReturnValue([mockChrome])

      const result = finder.findChromeSync()

      expect(getExecutablePathsSyncSpy).toHaveBeenCalledWith(Browser.CHROME)
      expect(result).toEqual(mockChrome)
    })
  })
})
