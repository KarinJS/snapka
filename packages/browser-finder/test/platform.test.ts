import { describe, it, expect, vi, beforeEach } from 'vitest'
import os from 'node:os'
import { getCurrentPlatform } from '../src/utils/platform'

// Mock dependencies
vi.mock('node:os')

const mockOs = os as any

describe('Platform Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getCurrentPlatform', () => {
    it('should return win64 for Windows x64', () => {
      mockOs.platform.mockReturnValue('win32')
      mockOs.arch.mockReturnValue('x64')

      const result = getCurrentPlatform()

      expect(result).toBe('win64')
    })

    it('should return win32 for Windows x86', () => {
      mockOs.platform.mockReturnValue('win32')
      mockOs.arch.mockReturnValue('x32')

      const result = getCurrentPlatform()

      expect(result).toBe('win32')
    })

    it('should return darwin for macOS', () => {
      mockOs.platform.mockReturnValue('darwin')
      mockOs.arch.mockReturnValue('x64')

      const result = getCurrentPlatform()

      expect(result).toBe('darwin')
    })

    it('should return arm64 for macOS ARM', () => {
      mockOs.platform.mockReturnValue('darwin')
      mockOs.arch.mockReturnValue('arm64')

      const result = getCurrentPlatform()

      expect(result).toBe('arm64')
    })

    it('should return linux for Linux x64', () => {
      mockOs.platform.mockReturnValue('linux')
      mockOs.arch.mockReturnValue('x64')

      const result = getCurrentPlatform()

      expect(result).toBe('linux')
    })

    it('should return linux for Linux x86', () => {
      mockOs.platform.mockReturnValue('linux')
      mockOs.arch.mockReturnValue('x32')

      const result = getCurrentPlatform()

      expect(result).toBe('linux')
    })

    it('should return linux for Linux ARM', () => {
      mockOs.platform.mockReturnValue('linux')
      mockOs.arch.mockReturnValue('arm64')

      const result = getCurrentPlatform()

      expect(result).toBe('linux')
    })

    it('should return the original platform for unknown platforms', () => {
      mockOs.platform.mockReturnValue('unknown-platform')
      mockOs.arch.mockReturnValue('unknown-arch')

      const result = getCurrentPlatform()

      expect(result).toBe('unknown-platform')
    })

    it('should handle all possible arch values for Windows', () => {
      mockOs.platform.mockReturnValue('win32')
      
      // Test with different arch values
      mockOs.arch.mockReturnValue('x64')
      expect(getCurrentPlatform()).toBe('win64')
      
      mockOs.arch.mockReturnValue('x32')
      expect(getCurrentPlatform()).toBe('win32')
      
      mockOs.arch.mockReturnValue('arm64')
      expect(getCurrentPlatform()).toBe('win64')
      
      mockOs.arch.mockReturnValue('unknown-arm')
      expect(getCurrentPlatform()).toBe('win32')
    })

    it('should handle all possible arch values for macOS', () => {
      mockOs.platform.mockReturnValue('darwin')
      
      // Test with different arch values
      mockOs.arch.mockReturnValue('x64')
      expect(getCurrentPlatform()).toBe('darwin')
      
      mockOs.arch.mockReturnValue('arm64')
      expect(getCurrentPlatform()).toBe('arm64')
      
      mockOs.arch.mockReturnValue('unknown-arch')
      expect(getCurrentPlatform()).toBe('darwin')
    })

    it('should handle all possible arch values for Linux', () => {
      mockOs.platform.mockReturnValue('linux')
      
      // Test with different arch values
      mockOs.arch.mockReturnValue('x64')
      expect(getCurrentPlatform()).toBe('linux')
      
      mockOs.arch.mockReturnValue('x32')
      expect(getCurrentPlatform()).toBe('linux')
      
      mockOs.arch.mockReturnValue('arm64')
      expect(getCurrentPlatform()).toBe('linux')
      
      mockOs.arch.mockReturnValue('unknown-arch')
      expect(getCurrentPlatform()).toBe('linux')
    })
  })
})
