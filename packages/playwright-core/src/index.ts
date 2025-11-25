import fs from 'node:fs'
import { installBrowsersForNpmInstall, registry } from './server/registry/index'
// import { registry } from 'playwright-core/lib/server/registry/index'

export * from 'playwright-core'

// 1. 首先解析要安装依赖的浏览器
// const executables = registry.resolveBrowsers(['chromium', 'firefox'], {})

// 2. 安装依赖
// await registry.installDeps(executables, true) // false 表示实际执行安装，true 表示 dry-run（仅打印不执行）

// const executable = registry.findExecutable('chromium')
// if (executable) {
//   const execPath = executable.executablePath('javascript')
//   console.log('🚀 ~ execPath:', execPath)
// }

// 获取已安装的浏览器列表
const browsers = await registry.listInstalledBrowsers()
console.log('🚀 ~ browsers:', browsers)

async function main () {
  console.log('=== 获取已安装的浏览器信息 ===\n')

  // 方法1: 使用 listInstalledBrowsers 获取安装信息
  const installedBrowsers = await registry.listInstalledBrowsers()

  console.log('已安装的浏览器目录:')
  for (const browser of installedBrowsers) {
    console.log(`\n浏览器名称: ${browser.browserName}`)
    console.log(`浏览器版本: ${browser.browserVersion}`)
    console.log(`安装目录: ${browser.browserPath}`)
    console.log(`引用目录: ${browser.referenceDir}`)
  }

  console.log('\n\n=== 获取浏览器可执行文件的绝对路径 ===\n')

  // 方法2: 使用 findExecutable 获取可执行文件路径
  const browserNames = ['chromium', 'firefox', 'webkit', 'chromium-headless-shell']

  for (const browserName of browserNames) {
    const executable = registry.findExecutable(browserName)

    if (executable) {
      // executablePath() 如果找不到会返回 undefined
      const execPath = executable.executablePath('javascript')

      if (execPath) {
        console.log(`\n${browserName}:`)
        console.log(`  类型: ${executable.type}`)
        console.log(`  安装类型: ${executable.installType}`)
        console.log(`  安装目录: ${executable.directory || 'N/A'}`)
        console.log(`  可执行文件路径: ${execPath}`)

        const exists = fs.existsSync(execPath)
        console.log(`  文件存在: ${exists ? '是' : '否'}`)
      } else {
        console.log(`\n${browserName}: 未安装`)
      }
    }
  }

  console.log('\n\n=== 获取所有可用的 executables ===\n')

  const allExecutables = registry.executables()
  console.log(`总共有 ${allExecutables.length} 个可执行对象\n`)

  // 只显示浏览器类型的
  const browsers = allExecutables.filter(e => e.type === 'browser')
  console.log('浏览器列表:')
  for (const exe of browsers) {
    const path = exe.executablePath('javascript')
    console.log(`  - ${exe.name}: ${path || '未安装'}`)
  }

  console.log('\n\n=== 使用 executablePathOrDie (会抛出错误如果未安装) ===\n')

  try {
    const chromiumExe = registry.findExecutable('chromium')
    if (chromiumExe) {
      // 这个方法会在浏览器未安装时抛出错误，并提供安装提示
      const path = chromiumExe.executablePathOrDie('javascript')
      console.log(`Chromium 可执行文件: ${path}`)
    }
  } catch (error) {
    console.log('错误:', error.message)
  }
}

// main()
