import fs from 'node:fs'
import { snapka } from '@snapka/puppeteer'

const core = await snapka.launch()

const time = Date.now()
const { run, page, browser } = await core.screenshot({ file: 'https://baidu.com' })
// page 和 browser 也可以直接使用 提供更多的控制能力
const uint8Array = await run()
console.log('Screenshot taken in', Date.now() - time, 'ms')
console.log(page.url())
console.log(browser.version())

fs.writeFileSync('baidu.png', uint8Array)
await core.close()
