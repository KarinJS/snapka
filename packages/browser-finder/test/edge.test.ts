import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { findEdge, findEdgeAll, findEdgeFromRegistry, findEdgeFromPath } from '../src/browsers/edge'
import { ReleaseChannel } from '../src/browsers/types'
import { execFileSync } from 'child_process'
import fs from 'node:fs'
import os from 'node:os'

vi.mock('child_process')
vi.mock('node:fs')
vi.mock('node:os')

describe('Edge Browser Finder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('findEdgeFromRegistry', () => {
    const originalPlatform = process.platform

    afterEach(() => {
      Object.defineProperty(process, 'platform', {
        value: originalPlatform,
        writable: true,
        configurable: true,
      })
    })

    it('should return empty array on non-Windows platforms', () => {
      vi.mocked(os.platform).mockReturnValue('linux')

      const result = findEdgeFromRegistry()

      expect(result).toEqual([])
    })

    it('should find Edge from registry on Windows', () => {
      vi.mocked(os.platform).mockReturnValue('win32')
      vi.mocked(execFileSync).mockReturnValue('    (Default)    REG_SZ    C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe\n' as any)

      const result = findEdgeFromRegistry()

      expect(result.length).toBeGreaterThan(0)
      expect(result[0]).toContain('msedge.exe')
    })

    it('should handle registry query errors gracefully', () => {
      vi.mocked(os.platform).mockReturnValue('win32')
      vi.mocked(execFileSync).mockImplementation(() => {
        throw new Error('Registry key not found')
      })

      const result = findEdgeFromRegistry()

      expect(result).toEqual([])
    })

    it('should deduplicate registry results', () => {
      vi.mocked(os.platform).mockReturnValue('win32')
      const edgePath = 'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
      vi.mocked(execFileSync).mockReturnValue(`    (Default)    REG_SZ    ${edgePath}\n` as any)

      const result = findEdgeFromRegistry()

      const uniquePaths = new Set(result)
      expect(result.length).toBe(uniquePaths.size)
    })

    it('should handle empty registry output', () => {
      vi.mocked(os.platform).mockReturnValue('win32')
      vi.mocked(execFileSync).mockReturnValue('No value found\n' as any)

      const result = findEdgeFromRegistry()

      expect(result).toEqual([])
    })
  })

  describe('findEdgeFromPath', () => {
    const originalEnv = process.env

    beforeEach(() => {
      process.env = { ...originalEnv }
    })

    afterEach(() => {
      process.env = originalEnv
    })

    it('should find Edge from PATH environment variable', () => {
      process.env.PATH = '/usr/bin:/usr/local/bin'
      vi.mocked(os.platform).mockReturnValue('linux')
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.accessSync).mockReturnValue(undefined)

      const result = findEdgeFromPath()

      expect(Array.isArray(result)).toBe(true)
    })

    it('should handle Windows PATH with msedge.exe', () => {
      process.env.PATH = 'C:\\Program Files\\Microsoft\\Edge\\Application;C:\\Windows\\System32'
      vi.mocked(os.platform).mockReturnValue('win32')
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.accessSync).mockReturnValue(undefined)

      const result = findEdgeFromPath()

      expect(Array.isArray(result)).toBe(true)
    })

    it('should skip non-executable files', () => {
      process.env.PATH = '/usr/bin'
      vi.mocked(os.platform).mockReturnValue('linux')
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.accessSync).mockImplementation(() => {
        throw new Error('Not executable')
      })

      const result = findEdgeFromPath()

      expect(result).toEqual([])
    })

    it('should handle empty PATH', () => {
      process.env.PATH = ''

      const result = findEdgeFromPath()

      expect(result).toEqual([])
    })

    it('should handle exceptions gracefully', () => {
      process.env.PATH = '/usr/bin'
      vi.mocked(os.platform).mockImplementation(() => {
        throw new Error('Platform error')
      })

      const result = findEdgeFromPath()

      expect(result).toEqual([])
    })

    it('should deduplicate results', () => {
      process.env.PATH = '/usr/bin:/usr/bin'
      vi.mocked(os.platform).mockReturnValue('linux')
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.accessSync).mockReturnValue(undefined)

      const result = findEdgeFromPath()

      const uniquePaths = new Set(result)
      expect(result.length).toBe(uniquePaths.size)
    })
  })
  describe('findEdge', () => {
    it('should return correct path structure for Windows stable channel', () => {
      const result = findEdge('win64', ReleaseChannel.STABLE)

      expect(result).toBeTruthy()
      expect(result).toContain('Microsoft')
      expect(result).toContain('Edge')
      expect(result).toContain('msedge.exe')
    })

    it('should return correct path for macOS stable channel', () => {
      const result = findEdge('darwin', ReleaseChannel.STABLE)

      expect(result).toBe('/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge')
    })

    it('should return correct path for Linux stable channel', () => {
      const result = findEdge('linux', ReleaseChannel.STABLE)

      expect(result).toBe('/opt/microsoft/msedge/msedge')
    })

    it('should return different paths for different channels on Windows', () => {
      const stable = findEdge('win64', ReleaseChannel.STABLE)
      const beta = findEdge('win64', ReleaseChannel.BETA)
      const dev = findEdge('win64', ReleaseChannel.DEV)
      const canary = findEdge('win64', ReleaseChannel.CANARY)

      expect(stable).not.toBe(beta)
      expect(beta).not.toBe(dev)
      expect(dev).not.toBe(canary)

      expect(beta).toContain('Beta')
      expect(dev).toContain('Dev')
      expect(canary).toContain('SxS')
    })

    it('should return empty string for unsupported platform', () => {
      const result = findEdge('unknown' as any, ReleaseChannel.STABLE)

      expect(result).toBe('')
    })

    it('should handle all release channels for macOS', () => {
      const stable = findEdge('darwin', ReleaseChannel.STABLE)
      const beta = findEdge('darwin', ReleaseChannel.BETA)
      const dev = findEdge('darwin', ReleaseChannel.DEV)
      const canary = findEdge('darwin', ReleaseChannel.CANARY)

      expect(stable).toContain('Microsoft Edge.app')
      expect(beta).toContain('Microsoft Edge Beta.app')
      expect(dev).toContain('Microsoft Edge Dev.app')
      expect(canary).toContain('Microsoft Edge Canary.app')
    })
  })

  describe('findEdgeAll', () => {
    it('should return an array', () => {
      const result = findEdgeAll()

      expect(Array.isArray(result)).toBe(true)
    })

    it('should return paths with forward slashes', () => {
      const result = findEdgeAll('win64')

      // Even if no browsers are installed, the function should work
      expect(Array.isArray(result)).toBe(true)

      // If any paths are returned, they should use forward slashes
      result.forEach(browserPath => {
        expect(browserPath).not.toContain('\\')
      })
    })

    it('should not return duplicate paths', () => {
      const result = findEdgeAll()
      const uniquePaths = new Set(result)

      expect(result.length).toBe(uniquePaths.size)
    })

    it('should accept platform parameter', () => {
      const win64Result = findEdgeAll('win64')
      const darwinResult = findEdgeAll('darwin')
      const linuxResult = findEdgeAll('linux')

      expect(Array.isArray(win64Result)).toBe(true)
      expect(Array.isArray(darwinResult)).toBe(true)
      expect(Array.isArray(linuxResult)).toBe(true)
    })
  })

  describe('findEdge with all channels', () => {
    it('should handle all channels for Linux ARM', () => {
      const stable = findEdge('linux_arm', ReleaseChannel.STABLE)
      const beta = findEdge('linux_arm', ReleaseChannel.BETA)
      const dev = findEdge('linux_arm', ReleaseChannel.DEV)
      const canary = findEdge('linux_arm', ReleaseChannel.CANARY)

      expect(stable).toContain('msedge')
      expect(beta).toContain('msedge-beta')
      expect(dev).toContain('msedge-dev')
      expect(canary).toContain('msedge-canary')
    })

    it('should handle all channels for Darwin ARM', () => {
      const stable = findEdge('darwin_arm', ReleaseChannel.STABLE)
      const beta = findEdge('darwin_arm', ReleaseChannel.BETA)
      const dev = findEdge('darwin_arm', ReleaseChannel.DEV)
      const canary = findEdge('darwin_arm', ReleaseChannel.CANARY)

      expect(stable).toContain('Microsoft Edge.app')
      expect(beta).toContain('Microsoft Edge Beta.app')
      expect(dev).toContain('Microsoft Edge Dev.app')
      expect(canary).toContain('Microsoft Edge Canary.app')
    })

    it('should handle all channels for Win32', () => {
      const stable = findEdge('win32', ReleaseChannel.STABLE)
      const beta = findEdge('win32', ReleaseChannel.BETA)
      const dev = findEdge('win32', ReleaseChannel.DEV)
      const canary = findEdge('win32', ReleaseChannel.CANARY)

      expect(stable).toContain('msedge.exe')
      expect(beta).toContain('Beta')
      expect(dev).toContain('Dev')
      expect(canary).toContain('SxS')
    })
  })
})
