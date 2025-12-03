import path from 'node:path'
import { snapka } from '@snapka/puppeteer'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const playwright = await snapka.launch()

for (let i = 0; i < 30; i++) {
  console.time(`puppeteer-baidu-${i}`)
  const { run } = await playwright.screenshot({
    file: 'https://baidu.com',
    path: path.join(__dirname, `screenshots/puppeteer-${i}.png`),
  })
  await run()
  console.timeEnd(`puppeteer-baidu-${i}`)
}

process.exit(0)
