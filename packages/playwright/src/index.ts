import { } from '@snapka/browser-finder'
import playwright from '@snapka/playwright-core'

const browser = await playwright.chromium.launch()
const context = await browser.newContext()
const page = await context.newPage()
await page.goto('https://example.com')
const screenshot = await page.screenshot()
console.log('Screenshot taken, size:', screenshot.length)
await browser.close()
