import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs'
import { execFile } from 'child_process'
import {
  isExecutable,
  isDirectory,
  getVersion,
  getBrowserVersion,
  isExecutableSync,
  isDirectorySync,
} from '../src/utils/file'

vi.mock('fs')
vi.mock('child_process', () => ({
  execFile: vi.fn(),
}))
vi.mock('util', () => ({
  promisify: vi.fn((fn) => fn),
}))

describe('file utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('isExecutable', () => {
    it('should return true when file is executable', async () => {
      vi.mocked(fs.promises.access).mockResolvedValue(undefined)

      const result = await isExecutable('/path/to/executable')

      expect(result).toBe(true)
      expect(fs.promises.access).toHaveBeenCalledWith('/path/to/executable', fs.constants.X_OK)
    })

    it('should return false when file is not executable', async () => {
      vi.mocked(fs.promises.access).mockRejectedValue(new Error('Not executable'))

      const result = await isExecutable('/path/to/file')

      expect(result).toBe(false)
    })
  })

  describe('isExecutableSync', () => {
    it('should return true when file is executable', () => {
      vi.mocked(fs.accessSync).mockReturnValue(undefined)

      const result = isExecutableSync('/path/to/executable')

      expect(result).toBe(true)
      expect(fs.accessSync).toHaveBeenCalledWith('/path/to/executable', fs.constants.X_OK)
    })

    it('should return false when file is not executable', () => {
      vi.mocked(fs.accessSync).mockImplementation(() => {
        throw new Error('Not executable')
      })

      const result = isExecutableSync('/path/to/file')

      expect(result).toBe(false)
    })
  })

  describe('isDirectory', () => {
    it('should return true when path is a directory', async () => {
      const mockStat = { isDirectory: () => true }
      vi.mocked(fs.promises.stat).mockResolvedValue(mockStat as any)

      const result = await isDirectory('/path/to/dir')

      expect(result).toBe(true)
      expect(fs.promises.stat).toHaveBeenCalledWith('/path/to/dir')
    })

    it('should return false when path is not a directory', async () => {
      const mockStat = { isDirectory: () => false }
      vi.mocked(fs.promises.stat).mockResolvedValue(mockStat as any)

      const result = await isDirectory('/path/to/file')

      expect(result).toBe(false)
    })

    it('should return false when path does not exist', async () => {
      vi.mocked(fs.promises.stat).mockRejectedValue(new Error('Path not found'))

      const result = await isDirectory('/path/to/nonexistent')

      expect(result).toBe(false)
    })
  })

  describe('isDirectorySync', () => {
    it('should return true when path is a directory', () => {
      const mockStat = { isDirectory: () => true }
      vi.mocked(fs.statSync).mockReturnValue(mockStat as any)

      const result = isDirectorySync('/path/to/dir')

      expect(result).toBe(true)
      expect(fs.statSync).toHaveBeenCalledWith('/path/to/dir')
    })

    it('should return false when path is not a directory', () => {
      const mockStat = { isDirectory: () => false }
      vi.mocked(fs.statSync).mockReturnValue(mockStat as any)

      const result = isDirectorySync('/path/to/file')

      expect(result).toBe(false)
    })

    it('should return false when path does not exist', () => {
      vi.mocked(fs.statSync).mockImplementation(() => {
        throw new Error('Path not found')
      })

      const result = isDirectorySync('/path/to/nonexistent')

      expect(result).toBe(false)
    })
  })

  describe('getVersion', () => {
    it('should extract version from file path', () => {
      expect(getVersion('/path/to/chrome/1.2.3/chrome')).toBe('1.2.3')
      expect(getVersion('/path/to/firefox/99.0.1/firefox')).toBe('99.0.1')
      expect(getVersion('/path/to/browser/1.2.3.4/browser')).toBe('1.2.3.4')
    })

    it('should return the last version match', () => {
      expect(getVersion('/path/1.0.0/to/chrome/2.0.0/chrome')).toBe('2.0.0')
    })

    it('should handle version with dash', () => {
      expect(getVersion('/path/to/chrome/1.2-5/chrome')).toBe('1.2-5')
      expect(getVersion('/path/to/chrome/1.2.3-alpha/chrome')).toBe('1.2.3-alpha')
    })

    it('should return undefined when no version found', () => {
      expect(getVersion('/path/to/chrome')).toBeUndefined()
      expect(getVersion('/path/to/browser/stable')).toBeUndefined()
    })
  })

  describe('getBrowserVersion', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should return undefined when file is not readable', async () => {
      vi.mocked(fs.promises.access).mockRejectedValue(new Error('Not readable'))

      const result = await getBrowserVersion('/path/to/browser')

      expect(result).toBeUndefined()
    })

    describe('Windows platform', () => {
      const originalPlatform = process.platform

      beforeEach(() => {
        Object.defineProperty(process, 'platform', {
          value: 'win32',
          writable: true,
          configurable: true,
        })
      })

      afterEach(() => {
        Object.defineProperty(process, 'platform', {
          value: originalPlatform,
          writable: true,
          configurable: true,
        })
      })

      it('should get version from Windows file properties', async () => {
        vi.mocked(fs.promises.access).mockResolvedValue(undefined)
        vi.mocked(execFile).mockResolvedValue({ stdout: '100.0.4896.127\n', stderr: '' } as any)

        const result = await getBrowserVersion('C:\\Program Files\\Chrome\\chrome.exe')

        expect(result).toBe('100.0.4896.127')
      })

      it('should return undefined when PowerShell command fails', async () => {
        vi.mocked(fs.promises.access).mockResolvedValue(undefined)
        vi.mocked(execFile).mockRejectedValue(new Error('PowerShell error'))

        const result = await getBrowserVersion('C:\\Program Files\\Chrome\\chrome.exe')

        expect(result).toBeUndefined()
      })

      it('should return undefined when version info is empty', async () => {
        vi.mocked(fs.promises.access).mockResolvedValue(undefined)
        vi.mocked(execFile).mockResolvedValue({ stdout: '\n', stderr: '' } as any)

        const result = await getBrowserVersion('C:\\Program Files\\Chrome\\chrome.exe')

        expect(result).toBeUndefined()
      })
    })

    describe('macOS platform', () => {
      const originalPlatform = process.platform

      beforeEach(() => {
        Object.defineProperty(process, 'platform', {
          value: 'darwin',
          writable: true,
          configurable: true,
        })
      })

      afterEach(() => {
        Object.defineProperty(process, 'platform', {
          value: originalPlatform,
          writable: true,
          configurable: true,
        })
      })

      it('should get version from macOS Info.plist', async () => {
        vi.mocked(fs.promises.access).mockResolvedValue(undefined)
        vi.mocked(execFile).mockResolvedValue({ stdout: '100.0.4896.127\n', stderr: '' } as any)

        const result = await getBrowserVersion('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')

        expect(result).toBe('100.0.4896.127')
      })

      it('should return undefined when Info.plist is not readable', async () => {
        vi.mocked(fs.promises.access).mockImplementation((path: any) => {
          if (path.includes('Info.plist')) {
            return Promise.reject(new Error('Not found'))
          }
          return Promise.resolve(undefined)
        })

        const result = await getBrowserVersion('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')

        expect(result).toBeUndefined()
      })

      it('should return undefined when path is not in .app format', async () => {
        vi.mocked(fs.promises.access).mockResolvedValue(undefined)

        const result = await getBrowserVersion('/usr/bin/chrome')

        expect(result).toBeUndefined()
      })

      it('should return undefined when defaults command fails', async () => {
        vi.mocked(fs.promises.access).mockResolvedValue(undefined)
        vi.mocked(execFile).mockRejectedValue(new Error('defaults error'))

        const result = await getBrowserVersion('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')

        expect(result).toBeUndefined()
      })
    })

    describe('Linux platform', () => {
      const originalPlatform = process.platform

      beforeEach(() => {
        Object.defineProperty(process, 'platform', {
          value: 'linux',
          writable: true,
          configurable: true,
        })
      })

      afterEach(() => {
        Object.defineProperty(process, 'platform', {
          value: originalPlatform,
          writable: true,
          configurable: true,
        })
      })

      it('should extract version from directory name', async () => {
        vi.mocked(fs.promises.access).mockResolvedValue(undefined)
        vi.mocked(fs.promises.readlink).mockRejectedValue(new Error('Not a symlink'))

        const result = await getBrowserVersion('/opt/chrome/100.0.4896.127/chrome')

        expect(result).toBe('100.0.4896.127')
      })

      it('should extract version from symlink target', async () => {
        vi.mocked(fs.promises.access).mockResolvedValue(undefined)
        vi.mocked(fs.promises.readlink).mockResolvedValue('../chrome-100.0.4896.127/chrome')

        const result = await getBrowserVersion('/usr/bin/chrome')

        expect(result).toBe('100.0.4896.127')
      })

      it('should return undefined when no version found in path or symlink', async () => {
        vi.mocked(fs.promises.access).mockResolvedValue(undefined)
        vi.mocked(fs.promises.readlink).mockRejectedValue(new Error('Not a symlink'))

        const result = await getBrowserVersion('/usr/bin/chrome')

        expect(result).toBeUndefined()
      })

      it('should handle readlink errors gracefully', async () => {
        vi.mocked(fs.promises.access).mockResolvedValue(undefined)
        vi.mocked(fs.promises.readlink).mockRejectedValue(new Error('Permission denied'))

        const result = await getBrowserVersion('/opt/chrome/stable/chrome')

        expect(result).toBeUndefined()
      })
    })

    describe('Unsupported platform', () => {
      const originalPlatform = process.platform

      beforeEach(() => {
        Object.defineProperty(process, 'platform', {
          value: 'freebsd',
          writable: true,
          configurable: true,
        })
      })

      afterEach(() => {
        Object.defineProperty(process, 'platform', {
          value: originalPlatform,
          writable: true,
          configurable: true,
        })
      })

      it('should return undefined for unsupported platforms', async () => {
        vi.mocked(fs.promises.access).mockResolvedValue(undefined)

        const result = await getBrowserVersion('/path/to/browser')

        expect(result).toBeUndefined()
      })
    })

    it('should handle exceptions gracefully', async () => {
      const originalPlatform = process.platform

      vi.mocked(fs.promises.access).mockResolvedValue(undefined)

      try {
        Object.defineProperty(process, 'platform', {
          get () {
            throw new Error('Platform error')
          },
          configurable: true,
        })

        const result = await getBrowserVersion('/path/to/browser')

        expect(result).toBeUndefined()
      } finally {
        // 恢复原始的 platform
        Object.defineProperty(process, 'platform', {
          value: originalPlatform,
          writable: true,
          configurable: true,
        })
      }
    })
  })
})
