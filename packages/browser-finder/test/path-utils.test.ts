import { describe, it, expect } from 'vitest'
import { normalizePath } from '../src/utils/path-utils'

describe('Path Utilities', () => {
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

    it('should handle paths with multiple consecutive backslashes', () => {
      const path = 'C:\\\\Program Files\\\\Chrome\\\\chrome.exe'

      const result = normalizePath(path)

      expect(result).toBe('C:/Program Files/Chrome/chrome.exe')
    })

    it('should handle network paths', () => {
      const path = '\\\\server\\share\\file.exe'

      const result = normalizePath(path)

      expect(result).toBe('//server/share/file.exe')
    })

    it('should handle absolute paths on different platforms', () => {
      // Windows absolute path
      expect(normalizePath('C:\\Windows\\System32')).toBe('C:/Windows/System32')
      
      // Linux absolute path
      expect(normalizePath('/etc/init.d')).toBe('/etc/init.d')
      
      // macOS absolute path
      expect(normalizePath('/Applications')).toBe('/Applications')
    })

    it('should handle relative paths', () => {
      // Relative path with backslashes
      expect(normalizePath('./folder\\subfolder\\file.txt')).toBe('./folder/subfolder/file.txt')
      
      // Relative path with forward slashes
      expect(normalizePath('./folder/subfolder/file.txt')).toBe('./folder/subfolder/file.txt')
      
      // Relative path with parent directory references
      expect(normalizePath('../parent\\child\\file.txt')).toBe('../parent/child/file.txt')
    })
  })
})
