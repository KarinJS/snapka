import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'node:fs'
import { execSync } from 'node:child_process'
import { SystemBrowserFinder, systemBrowserFinder } from '../src/browsers/index'
import { findEdgeAll } from '../src/browsers/edge'
import { findBraveAll } from '../src/browsers/brave'
import { computeSystemExecutablePath, Browser, ChromeReleaseChannel } from '@snapka/browsers'

// Mock dependencies
vi.mock('node:fs')
vi.mock('node:child_process')
vi.mock('../src/browsers/edge')
vi.mock('../src/browsers/brave')
vi.mock('@snapka/browsers')

const mockFs = fs as any
const mockExecSync = execSync as any
const mockFindEdgeAll = findEdgeAll as any
const mockFindBraveAll = findBraveAll as any
const mockComputeSystemExecutablePath = computeSystemExecutablePath as any

describe('SystemBrowserFinder', () => {
  let finder: SystemBrowserFinder

  beforeEach(() => {
    vi.clearAllMocks()
    finder = new SystemBrowserFinder()
  })

  describe('find', () => {
    it('should call findSync internally', async () => {
      const mockResult = [{ type: 'chrome', version: '100', dir: '/path', executablePath: '/path/chrome' }]
      
      // Mock findSync to return our mock result
      vi.spyOn(finder, 'findSync').mockReturnValue(mockResult)

      const result = await finder.find()

      expect(finder.findSync).toHaveBeenCalled()
      expect(result).toEqual(mockResult)
    })
  })

  describe('findSync', () => {
    it('should return combined results from all browsers', () => {
      const mockChromeResults = [{ type: 'chrome', version: '100', dir: '/path1', executablePath: '/path1/chrome' }]
      const mockEdgeResults = [{ type: 'edge', version: '99', dir: '/path2', executablePath: '/path2/edge' }]
      const mockBraveResults = [{ type: 'brave', version: '98', dir: '/path3', executablePath: '/path3/brave' }]

      // Mock private method puppeteer()
      vi.spyOn(finder as any, 'puppeteer').mockReturnValue(mockChromeResults)
      mockFindEdgeAll.mockReturnValue(['/path2/edge'])
      mockFindBraveAll.mockReturnValue(['/path3/brave'])
      mockFs.existsSync.mockReturnValue(true)
      mockFs.accessSync.mockImplementation(() => {})

      const result = finder.findSync()

      expect(result).toEqual([...mockChromeResults, ...mockEdgeResults, ...mockBraveResults])
    })
  })

  describe('findChromeSync', () => {
    it('should return results from puppeteer method', () => {
      const mockResults = [{ type: 'chrome', version: '100', dir: '/path1', executablePath: '/path1/chrome' }]

      vi.spyOn(finder as any, 'puppeteer').mockReturnValue(mockResults)

      const result = finder.findChromeSync()

      expect(result).toEqual(mockResults)
    })
  })

  describe('puppeteer private method', () => {
    it('should find Chrome browsers from all release channels', () => {
      const mockPaths = {
        [ChromeReleaseChannel.STABLE]: '/stable/chrome',
        [ChromeReleaseChannel.BETA]: '/beta/chrome',
        [ChromeReleaseChannel.DEV]: '/dev/chrome',
        [ChromeReleaseChannel.CANARY]: '/canary/chrome',
      }

      mockComputeSystemExecutablePath.mockImplementation(({ channel }) => mockPaths[channel])
      mockFs.existsSync.mockReturnValue(true)
      mockExecSync.mockReturnValue('Google Chrome 100.0.4896.127')

      const result = (finder as any).puppeteer()

      expect(result).toHaveLength(4)
      expect(result[0]).toEqual({
        type: 'chrome',
        executablePath: '/stable/chrome',
        dir: '/stable',
        version: '100.0.4896.127',
      })
      expect(mockComputeSystemExecutablePath).toHaveBeenCalledWith({ browser: Browser.CHROME, channel: ChromeReleaseChannel.STABLE })
    })

    it('should filter out non-existent paths', () => {
      const mockPaths = {
        [ChromeReleaseChannel.STABLE]: '/stable/chrome',
        [ChromeReleaseChannel.BETA]: '/beta/chrome',
      }

      mockComputeSystemExecutablePath.mockImplementation(({ channel }) => mockPaths[channel])
      mockFs.existsSync.mockImplementation((path: string) => path === '/stable/chrome')

      const result = (finder as any).puppeteer()

      expect(result).toHaveLength(1)
      expect(result[0].executablePath).toBe('/stable/chrome')
    })

    it('should handle version extraction failures gracefully', () => {
      const mockPath = '/stable/chrome'

      mockComputeSystemExecutablePath.mockReturnValue(mockPath)
      mockFs.existsSync.mockReturnValue(true)
      mockExecSync.mockReturnValue('Invalid version string')

      const result = (finder as any).puppeteer()

      expect(result[0].version).toBe('')
    })
  })

  describe('findEdgeSync', () => {
    it('should return formatted results from findEdgeAll', () => {
      const mockPaths = ['/path1/edge', '/path2/edge']
      
      mockFindEdgeAll.mockReturnValue(mockPaths)
      mockFs.existsSync.mockReturnValue(true)
      mockFs.accessSync.mockImplementation(() => {})

      const result = finder.findEdgeSync()

      expect(result).toEqual([
        {
          type: 'edge',
          executablePath: '/path1/edge',
          dir: '/path1',
          version: '0.0.0.0',
        },
        {
          type: 'edge',
          executablePath: '/path2/edge',
          dir: '/path2',
          version: '0.0.0.0',
        },
      ])
    })

    it('should handle empty results from findEdgeAll', () => {
      mockFindEdgeAll.mockReturnValue([])

      const result = finder.findEdgeSync()

      expect(result).toEqual([])
    })
  })

  describe('findBraveSync', () => {
    it('should return formatted results from findBraveAll', () => {
      const mockPaths = ['/path1/brave', '/path2/brave']
      
      mockFindBraveAll.mockReturnValue(mockPaths)
      mockFs.existsSync.mockReturnValue(true)
      mockFs.accessSync.mockImplementation(() => {})

      const result = finder.findBraveSync()

      expect(result).toEqual([
        {
          type: 'brave',
          executablePath: '/path1/brave',
          dir: '/path1',
          version: '0.0.0.0',
        },
        {
          type: 'brave',
          executablePath: '/path2/brave',
          dir: '/path2',
          version: '0.0.0.0',
        },
      ])
    })
  })

  describe('systemBrowserFinder instance', () => {
    it('should be an instance of SystemBrowserFinder', () => {
      expect(systemBrowserFinder).toBeInstanceOf(SystemBrowserFinder)
    })
  })
})
