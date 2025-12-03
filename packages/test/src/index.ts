import { snapka } from '@snapka/playwright'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const playwright = await snapka.launch()

for (let i = 0; i < 30; i++) {
  console.time(`screenshot-baidu-${i}`)
  const { run } = await playwright.screenshot({
    file: 'https://baidu.com',
    path: path.join(__dirname, `screenshots/playwright-${i}.png`),
  })
  await run()
  console.timeEnd(`screenshot-baidu-${i}`)
}

process.exit(0)
