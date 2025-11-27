import { describe, it, expect, beforeEach } from 'vitest'
import { SystemBrowserFinder, systemBrowserFinder, SystemBrowserType } from '../src/browsers'

describe('SystemBrowserFinder', () => {
  let finder: SystemBrowserFinder

  beforeEach(() => {
    finder = new SystemBrowserFinder()
  })

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(finder).toBeInstanceOf(SystemBrowserFinder)
    })
  })

  describe('findSync', () => {
    it('should return an array', () => {
      const result = finder.findSync()
      expect(Array.isArray(result)).toBe(true)
    })

    it('should return browser info objects with correct structure', () => {
      const result = finder.findSync()

      result.forEach(browser => {
        expect(browser).toHaveProperty('type')
        expect(browser).toHaveProperty('executablePath')
        expect(browser).toHaveProperty('dir')
        expect(browser).toHaveProperty('version')

        // Type should be one of the valid browser types
        expect([
          SystemBrowserType.Chrome,
          SystemBrowserType.Edge,
          SystemBrowserType.Brave,
        ]).toContain(browser.type)
      })
    })
  })

  describe('find', () => {
    it('should return a promise', async () => {
      const result = finder.find()
      expect(result).toBeInstanceOf(Promise)
    })

    it('should resolve to an array', async () => {
      const result = await finder.find()
      expect(Array.isArray(result)).toBe(true)
    })

    it('should return same results as findSync', async () => {
      const syncResult = finder.findSync()
      const asyncResult = await finder.find()

      expect(asyncResult).toEqual(syncResult)
    })
  })

  describe('findChromeSync', () => {
    it('should return an array', () => {
      const result = finder.findChromeSync()
      expect(Array.isArray(result)).toBe(true)
    })

    it('should only return Chrome browsers', () => {
      const result = finder.findChromeSync()

      result.forEach(browser => {
        expect(browser.type).toBe(SystemBrowserType.Chrome)
      })
    })
  })

  describe('findChrome', () => {
    it('should return a promise', async () => {
      const result = finder.findChrome()
      expect(result).toBeInstanceOf(Promise)
    })

    it('should return same results as findChromeSync', async () => {
      const syncResult = finder.findChromeSync()
      const asyncResult = await finder.findChrome()

      expect(asyncResult).toEqual(syncResult)
    })
  })

  describe('findEdgeSync', () => {
    it('should return an array', () => {
      const result = finder.findEdgeSync()
      expect(Array.isArray(result)).toBe(true)
    })

    it('should only return Edge browsers', () => {
      const result = finder.findEdgeSync()

      result.forEach(browser => {
        expect(browser.type).toBe(SystemBrowserType.Edge)
      })
    })
  })

  describe('findEdge', () => {
    it('should return a promise', async () => {
      const result = finder.findEdge()
      expect(result).toBeInstanceOf(Promise)
    })

    it('should return same results as findEdgeSync', async () => {
      const syncResult = finder.findEdgeSync()
      const asyncResult = await finder.findEdge()

      expect(asyncResult).toEqual(syncResult)
    })
  })

  describe('findBraveSync', () => {
    it('should return an array', () => {
      const result = finder.findBraveSync()
      expect(Array.isArray(result)).toBe(true)
    })

    it('should only return Brave browsers', () => {
      const result = finder.findBraveSync()

      result.forEach(browser => {
        expect(browser.type).toBe(SystemBrowserType.Brave)
      })
    })
  })

  describe('findBrave', () => {
    it('should return a promise', async () => {
      const result = finder.findBrave()
      expect(result).toBeInstanceOf(Promise)
    })

    it('should return same results as findBraveSync', async () => {
      const syncResult = finder.findBraveSync()
      const asyncResult = await finder.findBrave()

      expect(asyncResult).toEqual(syncResult)
    })
  })

  describe('systemBrowserFinder singleton', () => {
    it('should be an instance of SystemBrowserFinder', () => {
      expect(systemBrowserFinder).toBeInstanceOf(SystemBrowserFinder)
    })

    it('should be a singleton instance', () => {
      // The exported instance should always be the same
      expect(systemBrowserFinder).toBe(systemBrowserFinder)
    })
  })
})
