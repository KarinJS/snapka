// 简化版：统计初始化耗时、每个文件耗时，重复 5 次，输出 JSON（TypeScript 版本）

import { browserFinder } from '@snapka/browser-finder'
import puppeteer from '@snapka/puppeteer-core'
import { performance } from 'perf_hooks'
import fs from 'fs'
import path from 'path'

const list = [
  'D:/Github/snapka/packages/test/emoji-static.html',
  'D:/Github/snapka/packages/test/image-static.html',
  'D:/Github/snapka/packages/test/remote-css.html',
  'D:/Github/snapka/packages/test/static-basic.html',
  'D:/Github/snapka/packages/test/static-js-demo.html',
]

const ITERATIONS = 5

function toFileUrl (p: string) {
  return `file:///${p.replace(/\\/g, '/')}`
}

async function main () {
  const chromeBrowser = await browserFinder.findChromiumCore()
  if (chromeBrowser.length === 0) throw new Error('未找到 Chrome 浏览器')

  const report: any = {
    generatedAt: new Date().toISOString(),
    iterations: [] as any[],
  }

  // 初始化浏览器
  const initStart = performance.now()
  const browser = await puppeteer.launch({
    executablePath: chromeBrowser[0].executablePath,
    // headless: false,
  })
  const initEnd = performance.now()

  report.browserInitMs = Math.round(initEnd - initStart)

  for (let i = 1; i <= ITERATIONS; i++) {
    const iterStart = performance.now()
    const pages: any[] = []

    for (const filePath of list) {
      const pageStart = performance.now()
      const page = await browser.newPage()

      try {
        await page.goto(toFileUrl(filePath))
        const name = path.basename(filePath).replace(/\.[^.]+$/, '')
        const screenshotPath = `puppeteer/${name}.iter${i}.png`

        await page.screenshot({ path: screenshotPath, fullPage: true })

        const pageEnd = performance.now()
        pages.push({
          file: filePath,
          durationMs: Math.round(pageEnd - pageStart),
          screenshot: screenshotPath,
          status: 'success',
        })
      } catch (e: any) {
        const pageEnd = performance.now()
        pages.push({
          file: filePath,
          durationMs: Math.round(pageEnd - pageStart),
          status: 'error',
          message: e.message,
        })
      }

      await page.close()
    }

    const iterEnd = performance.now()

    report.iterations.push({
      iteration: i,
      totalMs: Math.round(iterEnd - iterStart),
      pages,
    })
  }

  fs.writeFileSync('puppeteer-report.json', JSON.stringify(report, null, 2), 'utf-8')
  console.log('已生成 puppeteer-report.json')

  await browser.close()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
