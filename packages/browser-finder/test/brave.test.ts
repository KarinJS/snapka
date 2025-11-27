import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { findBrave, findBraveAll } from '../src/browsers/brave'
import { getCurrentPlatform } from '../src/utils/platform'

// Mock dependencies
vi.mock('node:fs')
vi.mock('node:os')
vi.mock('../src/utils/platform')

const mockFs = fs as any
const mockOs = os as any
const mockGetCurrentPlatform = getCurrentPlatform as any

describe('Brave Browser Finder', () => {
  let originalEnv: NodeJS.ProcessEnv

  beforeEach(() => {
    vi.clearAllMocks()
    // Save original environment
    originalEnv = { ...process.env }
    // Reset process.env for each test
    delete process.env.PATH
    delete process.env.PROGRAMFILES
    delete process.env['PROGRAMFILES(X86)']
    delete process.env.LOCALAPPDATA
  })

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv
  })

  describe('findBrave', () => {
    it('should return correct path for Windows win32', () => {
      process.env.PROGRAMFILES = 'C:\\Program Files'

      const result = findBrave('win32')

      expect(result).toContain('BraveSoftware')
      expect(result).toContain('brave.exe')
      expect(result).toContain('C:')
    })

    it('should return correct path for Windows win64', () => {
      process.env.PROGRAMFILES = 'C:\\Program Files'

      const result = findBrave('win64')

      expect(result).toContain('BraveSoftware')
      expect(result).toContain('brave.exe')
      expect(result).toContain('C:')
    })

    it('should return correct path for macOS darwin', () => {
      const result = findBrave('darwin')

      expect(result).toBe('/Applications/Brave Browser.app/Contents/MacOS/Brave Browser')
    })

    it('should return correct path for macOS darwin_arm', () => {
      const result = findBrave('darwin_arm')

      expect(result).toBe('/Applications/Brave Browser.app/Contents/MacOS/Brave Browser')
    })

    it('should return correct path for Linux', () => {
      const result = findBrave('linux')

      expect(result).toBe('/usr/bin/brave-browser')
    })

    it('should return correct path for Linux ARM', () => {
      const result = findBrave('linux_arm')

      expect(result).toBe('/usr/bin/brave-browser')
    })

    it('should return empty string for unknown platform', () => {
      const result = findBrave('unknown-platform' as any)

      expect(result).toBe('')
    })

    it('should use PROGRAMFILES environment variable on Windows', () => {
      process.env.PROGRAMFILES = 'D:\\Custom Programs'

      const result = findBrave('win64')

      expect(result).toContain('D:')
      expect(result).toContain('Custom Programs')
      expect(result).toContain('BraveSoftware')
    })
  })

  describe('findBraveAll', () => {
    it('should return empty array when no browsers are found', () => {
      mockGetCurrentPlatform.mockReturnValue('linux')
      mockOs.platform.mockReturnValue('linux')
      mockFs.existsSync.mockReturnValue(false)
      process.env.PATH = ''

      const result = findBraveAll()

      expect(result).toEqual([])
    })

    it('should find Brave from default path on Linux', () => {
      mockGetCurrentPlatform.mockReturnValue('linux')
      mockOs.platform.mockReturnValue('linux')
      mockFs.existsSync.mockReturnValue(true)
      mockFs.accessSync.mockImplementation(() => { })
      process.env.PATH = ''

      const result = findBraveAll('linux')

      expect(result).toContain('/usr/bin/brave-browser')
    })

    it('should find Brave from default path on Windows', () => {
      process.env.PROGRAMFILES = 'C:\\Program Files'
      mockGetCurrentPlatform.mockReturnValue('win64')
      mockOs.platform.mockReturnValue('win32')
      mockFs.existsSync.mockReturnValue(true)
      mockFs.accessSync.mockImplementation(() => { })
      process.env.PATH = ''

      const result = findBraveAll('win64')

      expect(result.length).toBeGreaterThan(0)
      expect(result[0]).toContain('BraveSoftware')
    })

    it('should normalize Windows paths to use forward slashes', () => {
      process.env.PROGRAMFILES = 'C:\\Program Files'
      mockGetCurrentPlatform.mockReturnValue('win64')
      mockOs.platform.mockReturnValue('win32')
      mockFs.existsSync.mockReturnValue(true)
      mockFs.accessSync.mockImplementation(() => { })
      process.env.PATH = ''

      const result = findBraveAll('win64')

      // All results should use forward slashes
      result.forEach(p => {
        expect(p).not.toContain('\\')
        // Check that path contains drive letter format like C:/ or has forward slashes
        expect(p.includes('/') || p.includes('BraveSoftware')).toBe(true)
      })
    })

    it('should check Windows extra paths (x86 and LocalAppData)', () => {
      process.env.PROGRAMFILES = 'C:\\Program Files'
      process.env['PROGRAMFILES(X86)'] = 'C:\\Program Files (x86)'
      process.env.LOCALAPPDATA = 'C:\\Users\\User\\AppData\\Local'
      mockGetCurrentPlatform.mockReturnValue('win64')
      mockOs.platform.mockReturnValue('win32')
      mockFs.existsSync.mockReturnValue(true)
      mockFs.accessSync.mockImplementation(() => { })
      process.env.PATH = ''

      const result = findBraveAll('win64')

      expect(result.length).toBeGreaterThan(0)
    })

    it('should check Linux extra path /usr/bin/brave', () => {
      mockGetCurrentPlatform.mockReturnValue('linux')
      mockOs.platform.mockReturnValue('linux')
      mockFs.existsSync.mockReturnValue(true)
      mockFs.accessSync.mockImplementation(() => { })
      process.env.PATH = ''

      const result = findBraveAll('linux')

      expect(result).toContain('/usr/bin/brave-browser')
      expect(result).toContain('/usr/bin/brave')
    })

    it('should find Brave from PATH environment variable on Linux', () => {
      mockGetCurrentPlatform.mockReturnValue('linux')
      mockOs.platform.mockReturnValue('linux')
      mockFs.existsSync.mockReturnValue(true)
      mockFs.accessSync.mockImplementation(() => { })
      process.env.PATH = '/usr/bin:/custom/path'

      const result = findBraveAll('linux')

      // Should find browsers from default paths at least
      expect(result.length).toBeGreaterThan(0)
    })

    it('should find Brave from PATH environment variable on Windows', () => {
      process.env.PROGRAMFILES = 'C:\\Program Files'
      mockGetCurrentPlatform.mockReturnValue('win64')
      mockOs.platform.mockReturnValue('win32')
      mockFs.existsSync.mockImplementation((p: string) =>
        p.includes('BraveSoftware') || p.includes('Custom\\brave.exe')
      )
      mockFs.accessSync.mockImplementation(() => { })
      process.env.PATH = 'C:\\Custom'

      const result = findBraveAll('win64')

      expect(result.length).toBeGreaterThan(0)
    })

    it('should filter out non-executable files', () => {
      mockGetCurrentPlatform.mockReturnValue('linux')
      mockOs.platform.mockReturnValue('linux')
      mockFs.existsSync.mockReturnValue(true)
      mockFs.accessSync.mockImplementation(() => {
        throw new Error('Permission denied')
      })
      process.env.PATH = ''

      const result = findBraveAll('linux')

      expect(result).toEqual([])
    })

    it('should deduplicate paths', () => {
      mockGetCurrentPlatform.mockReturnValue('linux')
      mockOs.platform.mockReturnValue('linux')
      mockFs.existsSync.mockReturnValue(true)
      mockFs.accessSync.mockImplementation(() => { })
      process.env.PATH = '/usr/bin:/usr/bin'

      const result = findBraveAll('linux')

      // Should only have unique paths
      const uniquePaths = new Set(result)
      expect(result.length).toBe(uniquePaths.size)
    })

    it('should handle errors in PATH processing gracefully', () => {
      mockGetCurrentPlatform.mockReturnValue('linux')
      mockOs.platform.mockReturnValue('linux')
      mockFs.existsSync.mockReturnValue(false)
      mockFs.accessSync.mockImplementation(() => {
        throw new Error('Permission denied')
      })
      process.env.PATH = '/usr/bin'

      const result = findBraveAll('linux')

      // Should not throw, return empty array when files don't exist
      expect(Array.isArray(result)).toBe(true)
    })

    it('should use current platform when no platform parameter is provided', () => {
      mockGetCurrentPlatform.mockReturnValue('darwin')
      mockOs.platform.mockReturnValue('darwin')
      mockFs.existsSync.mockReturnValue(true)
      mockFs.accessSync.mockImplementation(() => { })
      process.env.PATH = ''

      const result = findBraveAll()

      expect(mockGetCurrentPlatform).toHaveBeenCalled()
      expect(result).toBeDefined()
    })
  })
})
