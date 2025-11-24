// src/playwright/index.ts
import fs from 'fs'
import os from 'os'
import path3 from 'path'

// src/playwright/1.56.1.ts
import path from 'path'

// src/playwright/next.ts
import path2 from 'path'
const EXECUTABLE_PATHS = {
  chromium: {
    linux: ['chrome-linux', 'chrome'],
    mac: ['chrome-mac', 'Chromium.app', 'Contents', 'MacOS', 'Chromium'],
    win: ['chrome-win', 'chrome.exe'],
  },
  'chromium-headless-shell': {
    linux: ['chrome-linux', 'headless_shell'],
    mac: ['chrome-mac', 'headless_shell'],
    win: ['chrome-win', 'headless_shell.exe'],
  },
  firefox: {
    linux: ['firefox', 'firefox'],
    mac: ['firefox', 'Nightly.app', 'Contents', 'MacOS', 'firefox'],
    win: ['firefox', 'firefox.exe'],
  },
  webkit: {
    linux: ['pw_run.sh'],
    mac: ['pw_run.sh'],
    win: ['Playwright.exe'],
  },
}
const findExecutablePath = (dir, name) => {
  const shortPlatform = (() => {
    const platform = process.platform
    if (platform === 'linux') return 'linux'
    if (platform === 'darwin') return 'mac'
    if (platform === 'win32') return 'win'
  })()
  if (!shortPlatform) return shortPlatform
  const tokens = EXECUTABLE_PATHS[name][shortPlatform]
  return path.join(dir, ...tokens)
}
const EXECUTABLE_PATHS2 = {
  chromium: {
    '<unknown>': void 0,
    'linux-x64': ['chrome-linux64', 'chrome'],
    'linux-arm64': ['chrome-linux', 'chrome'],
    // non-cft build
    'mac-x64': ['chrome-mac-x64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'],
    'mac-arm64': ['chrome-mac-arm64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'],
    'win-x64': ['chrome-win64', 'chrome.exe'],
  },
  'chromium-headless-shell': {
    '<unknown>': void 0,
    'linux-x64': ['chrome-headless-shell-linux64', 'chrome-headless-shell'],
    'linux-arm64': ['chrome-linux', 'headless_shell'],
    // non-cft build
    'mac-x64': ['chrome-headless-shell-mac-x64', 'chrome-headless-shell'],
    'mac-arm64': ['chrome-headless-shell-mac-arm64', 'chrome-headless-shell'],
    'win-x64': ['chrome-headless-shell-win64', 'chrome-headless-shell.exe'],
  },
  'chromium-tip-of-tree': {
    '<unknown>': void 0,
    'linux-x64': ['chrome-linux64', 'chrome'],
    'linux-arm64': ['chrome-linux', 'chrome'],
    // non-cft build
    'mac-x64': ['chrome-mac-x64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'],
    'mac-arm64': ['chrome-mac-arm64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'],
    'win-x64': ['chrome-win64', 'chrome.exe'],
  },
  'chromium-tip-of-tree-headless-shell': {
    '<unknown>': void 0,
    'linux-x64': ['chrome-headless-shell-linux64', 'chrome-headless-shell'],
    'linux-arm64': ['chrome-linux', 'headless_shell'],
    // non-cft build
    'mac-x64': ['chrome-headless-shell-mac-x64', 'chrome-headless-shell'],
    'mac-arm64': ['chrome-headless-shell-mac-arm64', 'chrome-headless-shell'],
    'win-x64': ['chrome-headless-shell-win64', 'chrome-headless-shell.exe'],
  },
  firefox: {
    '<unknown>': void 0,
    'linux-x64': ['firefox', 'firefox'],
    'linux-arm64': ['firefox', 'firefox'],
    'mac-x64': ['firefox', 'Nightly.app', 'Contents', 'MacOS', 'firefox'],
    'mac-arm64': ['firefox', 'Nightly.app', 'Contents', 'MacOS', 'firefox'],
    'win-x64': ['firefox', 'firefox.exe'],
  },
  webkit: {
    '<unknown>': void 0,
    'linux-x64': ['pw_run.sh'],
    'linux-arm64': ['pw_run.sh'],
    'mac-x64': ['pw_run.sh'],
    'mac-arm64': ['pw_run.sh'],
    'win-x64': ['Playwright.exe'],
  },
}
const findExecutablePath2 = (dir, name) => {
  const shortPlatform = (() => {
    const platform = process.platform
    const arch = process.arch
    if (platform === 'linux' && arch === 'x64') return 'linux-x64'
    if (platform === 'linux' && arch === 'arm64') return 'linux-arm64'
    if (platform === 'darwin' && arch === 'x64') return 'mac-x64'
    if (platform === 'darwin' && arch === 'arm64') return 'mac-arm64'
    if (platform === 'win32' && arch === 'x64') return 'win-x64'
    return '<unknown>'
  })()
  const tokens = EXECUTABLE_PATHS2[name][shortPlatform]
  return tokens ? path2.join(dir, ...tokens) : void 0
}

// src/playwright/index.ts
var PlaywrightBrowserType = /* @__PURE__ */ ((PlaywrightBrowserType2) => {
  PlaywrightBrowserType2['Chromium'] = 'chromium'
  PlaywrightBrowserType2['ChromiumHeadlessShell'] = 'chromium-headless-shell'
  PlaywrightBrowserType2['Firefox'] = 'firefox'
  PlaywrightBrowserType2['WebKit'] = 'webkit'
  return PlaywrightBrowserType2
})(PlaywrightBrowserType || {})
const PlaywrightBrowserFinder = class {
  /** 浏览器基础目录 */
  browserBaseDir
  constructor () {
    if (process.platform === 'linux') {
      this.browserBaseDir = process.env.XDG_CACHE_HOME || path3.join(os.homedir(), '.cache')
    } else if (process.platform === 'darwin') {
      this.browserBaseDir = path3.join(os.homedir(), 'Library', 'Caches')
    } else if (process.platform === 'win32') {
      this.browserBaseDir = process.env.LOCALAPPDATA || path3.join(os.homedir(), 'AppData', 'Local')
    } else {
      throw new Error('Unsupported platform: ' + process.platform)
    }
    this.browserBaseDir = path3.join(this.browserBaseDir, 'ms-playwright')
  }

  /**
   * 收集并过滤
   * @param browsers 浏览器结果数组
   * @param file 文件目录项
   */
  dirent (browsers, file) {
    if (!file.isDirectory()) return
    const match = file.name.match(/^(chromium-headless-shell|chromium|firefox|webkit)-(.+)$/)
    if (!match) return
    const browserType = match[1]
    const version = match[2]
    if (!Number(version)) return
    browsers.push({
      browserType,
      version,
      dir: () => {
        return path3.join(this.browserBaseDir, file.name).replaceAll('\\', '/')
      },
      executablePath: () => {
        const dir = path3.join(this.browserBaseDir, file.name)
        const next = findExecutablePath2(dir, browserType)
        if (next && fs.existsSync(next)) {
          return next.replaceAll('\\', '/')
        }
        const find = findExecutablePath(dir, browserType)
        if (find && fs.existsSync(find)) {
          return find.replaceAll('\\', '/')
        }
      },
    })
  }

  /**
   * 查找所有已安装的浏览器
   */
  async findInstalledBrowsers () {
    if (!fs.existsSync(this.browserBaseDir)) return []
    const browsers = []
    const files = await fs.promises.readdir(this.browserBaseDir, { withFileTypes: true })
    await Promise.all(files.map((file) => this.dirent(browsers, file)))
    return browsers
  }

  /**
   * 查找所有已安装的浏览器 同步
   */
  findInstalledBrowsersSync () {
    if (!fs.existsSync(this.browserBaseDir)) return []
    const browsers = []
    const files = fs.readdirSync(this.browserBaseDir, { withFileTypes: true })
    for (const file of files) {
      this.dirent(browsers, file)
    }
    return browsers
  }

  /**
   * 查找chromium浏览器
   */
  async findChromium () {
    const browsers = await this.findInstalledBrowsers()
    return browsers.find((b) => b.browserType === 'chromium' /* Chromium */)
  }

  /**
   * 查找chromium-headless-shell浏览器
   */
  async findChromiumHeadlessShell () {
    const browsers = await this.findInstalledBrowsers()
    return browsers.find((b) => b.browserType === 'chromium-headless-shell' /* ChromiumHeadlessShell */)
  }

  /**
   * 查找firefox浏览器
   */
  async findFirefox () {
    const browsers = await this.findInstalledBrowsers()
    return browsers.find((b) => b.browserType === 'firefox' /* Firefox */)
  }

  /**
   * 查找webkit浏览器
   */
  async findWebKit () {
    const browsers = await this.findInstalledBrowsers()
    return browsers.find((b) => b.browserType === 'webkit' /* WebKit */)
  }

  /**
   * 查找chromium浏览器（同步方法）
   */
  findChromiumSync () {
    const browsers = this.findInstalledBrowsersSync()
    return browsers.find((b) => b.browserType === 'chromium' /* Chromium */)
  }

  /**
   * 查找chromium-headless-shell浏览器（同步方法）
   */
  findChromiumHeadlessShellSync () {
    const browsers = this.findInstalledBrowsersSync()
    return browsers.find((b) => b.browserType === 'chromium-headless-shell' /* ChromiumHeadlessShell */)
  }

  /**
   * 查找firefox浏览器（同步方法）
   */
  findFirefoxSync () {
    const browsers = this.findInstalledBrowsersSync()
    return browsers.find((b) => b.browserType === 'firefox' /* Firefox */)
  }

  /**
   * 查找webkit浏览器（同步方法）
   */
  findWebKitSync () {
    const browsers = this.findInstalledBrowsersSync()
    return browsers.find((b) => b.browserType === 'webkit' /* WebKit */)
  }
}
const playwrightBrowserFinder = new PlaywrightBrowserFinder()
export {
  PlaywrightBrowserFinder,
  PlaywrightBrowserType,
  playwrightBrowserFinder,
}

console.log(
  playwrightBrowserFinder.findInstalledBrowsersSync().filter((val) => {
    const data = val.executablePath()
    data && console.log(data)
    return data
  })
)
