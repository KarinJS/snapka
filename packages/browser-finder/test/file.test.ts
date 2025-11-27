import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'node:fs'
import { isExecutable, isDirectory, getVersion, normalizePath } from '../src/utils/file'

// Mock dependencies
vi.mock('node:fs')

const mockFs = fs as any

describe('File Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('isExecutable', () => {
    it('should return true for executable files', () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.accessSync.mockImplementation(() => {})

      const result = isExecutable('/path/to/executable')

      expect(result).toBe(true)
    })

    it('should return false for non-existent files', () => {
      mockFs.existsSync.mockReturnValue(false)

      const result = isExecutable('/path/to/nonexistent')

      expect(result).toBe(false)
    })

    it('should return false for non-executable files', () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.accessSync.mockImplementation(() => {
        throw new Error('Permission denied')
      })

      const result = isExecutable('/path/to/nonexecutable')

      expect(result).toBe(false)
    })

    it('should handle all exceptions gracefully', () => {
      mockFs.existsSync.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const result = isExecutable('/path/to/file')

      expect(result).toBe(false)
    })
  })

  describe('isDirectory', () => {
    it('should return true for directories', () => {
      mockFs.statSync.mockImplementation(() => ({
        isDirectory: () => true
      }))

      const result = isDirectory('/path/to/directory')

      expect(result).toBe(true)
    })

    it('should return false for files', () => {
      mockFs.statSync.mockImplementation(() => ({
        isDirectory: () => false
      }))

      const result = isDirectory('/path/to/file')

      expect(result).toBe(false)
    })

    it('should return false for non-existent paths', () => {
      mockFs.statSync.mockImplementation(() => {
        throw new Error('ENOENT')
      })

      const result = isDirectory('/path/to/nonexistent')

      expect(result).toBe(false)
    })

    it('should handle all exceptions gracefully', () => {
      mockFs.statSync.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const result = isDirectory('/path/to/file')

      expect(result).toBe(false)
    })
  })

  describe('getVersion', () => {
    it('should extract version from a path', () => {
      const path = '/path/to/chrome/114.0.5735.198/chrome.exe'

      const result = getVersion(path)

      expect(result).toBe('114.0.5735.198')
    })

    it('should return undefined for paths without version numbers', () => {
      const path = '/path/to/chrome/chrome.exe'

      const result = getVersion(path)

      expect(result).toBeUndefined()
    })

    it('should return undefined for empty paths', () => {
      const result = getVersion('')

      expect(result).toBeUndefined()
    })

    it('should handle version patterns with hyphens', () => {
      const path = '/path/to/firefox/114.0-1/firefox.exe'

      const result = getVersion(path)

      expect(result).toBe('114.0-1')
    })

    it('should handle semantic version patterns with pre-release identifiers', () => {
      const path = '/path/to/chrome/114.0.5735.198-alpha/firefox.exe'

      const result = getVersion(path)

      expect(result).toBe('114.0.5735.198-alpha')
    })

    it('should extract the last version pattern in the path', () => {
      const path = '/path/to/chrome/114.0.5735.198/chrome/115.0.5790.0/chrome.exe'

      const result = getVersion(path)

      expect(result).toBe('115.0.5790.0')
    })
  })

  describe('normalizePath', () => {
    it('should convert backslashes to forward slashes', () => {
      const path = 'C:\\Program Files\\Chrome\\chrome.exe'

      const result = normalizePath(path)

      expect(result).toBe('C:/Program Files/Chrome/chrome.exe')
    })

    it('should handle paths with already forward slashes', () => {
      const path = '/usr/bin/chrome'

      const result = normalizePath(path)

      expect(result).toBe('/usr/bin/chrome')
    })

    it('should handle mixed slash paths', () => {
      const path = 'C:\\Program Files\\Chrome/chrome.exe'

      const result = normalizePath(path)

      expect(result).toBe('C:/Program Files/Chrome/chrome.exe')
    })

    it('should handle empty paths', () => {
      const result = normalizePath('')

      expect(result).toBe('')
    })
  })
})
