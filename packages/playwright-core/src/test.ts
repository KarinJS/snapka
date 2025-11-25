import { webkit } from 'playwright-core'

const browser = await webkit.launch()

const context = await browser.newContext()

const page = await context.newPage()
await page.goto('https://example.com')
await page.screenshot({ path: 'test.png', fullPage: true })

await page.close()
await browser.close()
