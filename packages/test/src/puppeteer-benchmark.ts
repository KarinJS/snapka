// Puppeteer 基准测试

import { findBrowser, BrowserType } from '@karinjs/browser-finder'
import puppeteer from '@karinjs/puppeteer-core'
import { performance } from 'perf_hooks'
import fs from 'fs'
import path from 'path'
import { htmlFiles, toFileUrl } from './file-list.js'

const ITERATIONS = 5

async function main () {
  const chromeBrowser = await findBrowser(BrowserType.CHROME)
  if (!chromeBrowser) throw new Error('未找到 Chrome 浏览器')

  const report: any = {
    generatedAt: new Date().toISOString(),
    iterations: [] as any[],
  }

  // 初始化浏览器
  const initStart = performance.now()
  const browser = await puppeteer.launch({
    executablePath: chromeBrowser.executablePath,
    // headless: false,
  })
  const initEnd = performance.now()

  report.browserInitMs = Math.round(initEnd - initStart)

  for (let i = 1; i <= ITERATIONS; i++) {
    const iterStart = performance.now()
    const pages: any[] = []

    for (const filePath of htmlFiles) {
      const pageStart = performance.now()
      const page = await browser.newPage()

      try {
        await page.goto(toFileUrl(filePath))
        const name = path.basename(filePath).replace(/\.[^.]+$/, '')
        const screenshotPath = path.resolve(__dirname, `../output/puppeteer/${name}.iter${i}.png`)

        // 确保输出目录存在
        const outputDir = path.dirname(screenshotPath)
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true })
        }

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

  const reportPath = path.resolve(__dirname, '../puppeteer-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8')
  console.log('已生成 puppeteer-report.json')

  await browser.close()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
