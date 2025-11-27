import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { PlaywrightBrowserFinder } from '../src/playwright/index'
import { getCurrentPlatform } from '../src/utils/platform'
import { isExecutable, normalizePath } from '../src/utils/file'

// Mock dependencies
vi.mock('node:fs')
vi.mock('node:path')
vi.mock('node:os')
vi.mock('../utils/platform')
vi.mock('../utils/file')

const mockFs = fs as any
const mockPath = path as any
const mockOs = os as any
const mockGetCurrentPlatform = getCurrentPlatform as any
const mockIsExecutable = isExecutable as any
const mockNormalizePath = normalizePath as any

describe('PlaywrightBrowserFinder', () => {
  let finder: PlaywrightBrowserFinder

  beforeEach(() => {
    vi.clearAllMocks()
    finder = new PlaywrightBrowserFinder()
    
    // Mock normalizePath to return the input for simplicity
    mockNormalizePath.mockImplementation((p: string) => p)
  })

  describe('constructor', () => {
    it('should initialize with empty browsers array', () => {
      expect(finder.browsers).toEqual([])
    })
  })

  describe('findSync', () => {
    it('should find browsers from common Playwright locations on Windows', () => {
      mockGetCurrentPlatform.mockReturnValue('win64')
      mockPath.join.mockImplementation((...args) => args.join('/'))
      mockOs.homedir.mockReturnValue('C:/Users/user')
      
      // Mock Playwright browsers directory
      mockFs.existsSync.mockImplementation((dirPath: string) => {
        return dirPath.includes('ms-playwright')
      })
      mockFs.readdirSync.mockImplementation((dirPath: string) => {
        if (dirPath.includes('ms-playwright')) {
          return ['chromium-1145', 'firefox-1375', 'webkit-1944']
        }
        return []
      })
      mockIsExecutable.mockReturnValue(true)

      const result = finder.findSync()

      expect(result).toEqual([
        {
          type: 'chromium',
          dir: 'C:/Users/user/AppData/Local/ms-playwright/chromium-1145',
          version: '1145',
          executablePath: 'C:/Users/user/AppData/Local/ms-playwright/chromium-1145/chrome-win/chrome.exe'
        },
        {
          type: 'firefox',
          dir: 'C:/Users/user/AppData/Local/ms-playwright/firefox-1375',
          version: '1375',
          executablePath: 'C:/Users/user/AppData/Local/ms-playwright/firefox-1375/firefox/firefox.exe'
        },
        {
          type: 'webkit',
          dir: 'C:/Users/user/AppData/Local/ms-playwright/webkit-1944',
          version: '1944',
          executablePath: 'C:/Users/user/AppData/Local/ms-playwright/webkit-1944/WTF/Release/WebKitWebProcess.exe'
        }
      ])
    })

    it('should find browsers from common Playwright locations on macOS', () => {
      mockGetCurrentPlatform.mockReturnValue('darwin')
      mockPath.join.mockImplementation((...args) => args.join('/'))
      mockOs.homedir.mockReturnValue('/Users/user')
      
      // Mock Playwright browsers directory
      mockFs.existsSync.mockImplementation((dirPath: string) => {
        return dirPath.includes('ms-playwright')
      })
      mockFs.readdirSync.mockImplementation((dirPath: string) => {
        if (dirPath.includes('ms-playwright')) {
          return ['chromium-1145']
        }
        return []
      })
      mockIsExecutable.mockReturnValue(true)

      const result = finder.findSync()

      expect(result).toEqual([
        {
          type: 'chromium',
          dir: '/Users/user/Library/Caches/ms-playwright/chromium-1145',
          version: '1145',
          executablePath: '/Users/user/Library/Caches/ms-playwright/chromium-1145/Chromium.app/Contents/MacOS/Chromium'
        }
      ])
    })

    it('should find browsers from common Playwright locations on Linux', () => {
      mockGetCurrentPlatform.mockReturnValue('linux')
      mockPath.join.mockImplementation((...args) => args.join('/'))
      mockOs.homedir.mockReturnValue('/home/user')
      
      // Mock Playwright browsers directory
      mockFs.existsSync.mockImplementation((dirPath: string) => {
        return dirPath.includes('ms-playwright')
      })
      mockFs.readdirSync.mockImplementation((dirPath: string) => {
        if (dirPath.includes('ms-playwright')) {
          return ['chromium-1145']
        }
        return []
      })
      mockIsExecutable.mockReturnValue(true)

      const result = finder.findSync()

      expect(result).toEqual([
        {
          type: 'chromium',
          dir: '/home/user/.cache/ms-playwright/chromium-1145',
          version: '1145',
          executablePath: '/home/user/.cache/ms-playwright/chromium-1145/chrome-linux/chrome'
        }
      ])
    })

    it('should handle non-existent Playwright directories', () => {
      mockGetCurrentPlatform.mockReturnValue('win64')
      mockPath.join.mockImplementation((...args) => args.join('/'))
      mockOs.homedir.mockReturnValue('C:/Users/user')
      mockFs.existsSync.mockReturnValue(false)

      const result = finder.findSync()

      expect(result).toEqual([])
    })

    it('should handle errors when reading directories', () => {
      mockGetCurrentPlatform.mockReturnValue('win64')
      mockPath.join.mockImplementation((...args) => args.join('/'))
      mockOs.homedir.mockReturnValue('C:/Users/user')
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockImplementation(() => {
        throw new Error('Permission denied')
      })

      const result = finder.findSync()

      expect(result).toEqual([])
    })

    it('should filter out non-executable browser paths', () => {
      mockGetCurrentPlatform.mockReturnValue('win64')
      mockPath.join.mockImplementation((...args) => args.join('/'))
      mockOs.homedir.mockReturnValue('C:/Users/user')
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue(['chromium-1145'])
      mockIsExecutable.mockReturnValue(false)

      const result = finder.findSync()

      expect(result).toEqual([])
    })

    it('should handle all supported browser types', () => {
      mockGetCurrentPlatform.mockReturnValue('win64')
      mockPath.join.mockImplementation((...args) => args.join('/'))
      mockOs.homedir.mockReturnValue('C:/Users/user')
      
      // Mock Playwright browsers directory
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue(['chromium-1145', 'firefox-1375', 'webkit-1944'])
      mockIsExecutable.mockReturnValue(true)

      const result = finder.findSync()

      expect(result).toHaveLength(3)
      expect(result[0]?.type).toBe('chromium')
      expect(result[1]?.type).toBe('firefox')
      expect(result[2]?.type).toBe('webkit')
    })

    it('should extract version from directory names', () => {
      mockGetCurrentPlatform.mockReturnValue('win64')
      mockPath.join.mockImplementation((...args) => args.join('/'))
      mockOs.homedir.mockReturnValue('C:/Users/user')
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue(['chromium-1145', 'firefox-1375'])
      mockIsExecutable.mockReturnValue(true)

      const result = finder.findSync()

      expect(result[0]?.version).toBe('1145')
      expect(result[1]?.version).toBe('1375')
    })

    it('should handle malformed directory names gracefully', () => {
      mockGetCurrentPlatform.mockReturnValue('win64')
      mockPath.join.mockImplementation((...args) => args.join('/'))
      mockOs.homedir.mockReturnValue('C:/Users/user')
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue(['chromium-', '-1145', 'invalid-name'])
      mockIsExecutable.mockReturnValue(true)

      const result = finder.findSync()

      // Should still process the directories even with malformed names
      expect(result).toHaveLength(3)
      expect(result[0]?.type).toBe('chromium')
      expect(result[0]?.version).toBe('')
      expect(result[1]?.type).toBe('chromium')
      expect(result[1]?.version).toBe('1145')
      expect(result[2]?.type).toBe('chromium')
      expect(result[2]?.version).toBe('invalid-name')
    })

    it('should use correct executable paths for different platforms', () => {
      // Test Windows
      mockGetCurrentPlatform.mockReturnValue('win64')
      mockPath.join.mockImplementation((...args) => args.join('/'))
      mockOs.homedir.mockReturnValue('C:/Users/user')
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue(['chromium-1145', 'firefox-1375', 'webkit-1944'])
      mockIsExecutable.mockReturnValue(true)

      let result = finder.findSync()
      expect(result[0]?.executablePath).toContain('chrome-win/chrome.exe')
      expect(result[1]?.executablePath).toContain('firefox/firefox.exe')
      expect(result[2]?.executablePath).toContain('WTF/Release/WebKitWebProcess.exe')

      // Test macOS
      mockGetCurrentPlatform.mockReturnValue('darwin')
      mockPath.join.mockImplementation((...args) => args.join('/'))
      mockOs.homedir.mockReturnValue('/Users/user')

      result = finder.findSync()
      expect(result[0]?.executablePath).toContain('Chromium.app/Contents/MacOS/Chromium')
      expect(result[1]?.executablePath).toContain('Contents/MacOS/firefox')
      expect(result[2]?.executablePath).toContain('WebKit.framework/Versions/A/XPCServices/com.apple.WebKit.WebContent.xpc/Contents/MacOS/com.apple.WebKit.WebContent')

      // Test Linux
      mockGetCurrentPlatform.mockReturnValue('linux')
      mockPath.join.mockImplementation((...args) => args.join('/'))
      mockOs.homedir.mockReturnValue('/home/user')

      result = finder.findSync()
      expect(result[0]?.executablePath).toContain('chrome-linux/chrome')
      expect(result[1]?.executablePath).toContain('firefox/firefox')
      expect(result[2]?.executablePath).toContain('bin/WebKitWebProcess')
    })

    it('should handle arm64 architecture on macOS', () => {
      mockGetCurrentPlatform.mockReturnValue('arm64')
      mockPath.join.mockImplementation((...args) => args.join('/'))
      mockOs.homedir.mockReturnValue('/Users/user')
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue(['chromium-1145'])
      mockIsExecutable.mockReturnValue(true)

      const result = finder.findSync()

      // On arm64, it should use the correct path for M-series Macs
      expect(result[0]?.executablePath).toContain('Chromium.app/Contents/MacOS/Chromium')
    })
  })

  describe('find', () => {
    it('should return the same result as findSync', async () => {
      // Mock findSync to return a known result
      const mockResult = [{
        type: 'chromium',
        dir: '/path/to/chromium',
        version: '1145',
        executablePath: '/path/to/chromium/chrome.exe'
      }]
      
      const findSyncSpy = vi.spyOn(finder, 'findSync').mockReturnValue(mockResult)

      const result = await finder.find()

      expect(findSyncSpy).toHaveBeenCalled()
      expect(result).toEqual(mockResult)
    })

    it('should handle promises correctly', async () => {
      const mockResult = [{
        type: 'chromium',
        dir: '/path/to/chromium',
        version: '1145',
        executablePath: '/path/to/chromium/chrome.exe'
      }]
      
      vi.spyOn(finder, 'findSync').mockReturnValue(mockResult)

      const promise = finder.find()
      
      // Verify it's a promise
      expect(promise).toBeInstanceOf(Promise)
      
      // Verify it resolves correctly
      const result = await promise
      expect(result).toEqual(mockResult)
    })
  })
})
