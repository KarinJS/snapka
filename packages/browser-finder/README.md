# 浏览器查找器

统一的浏览器查找工具，支持从 Puppeteer、Playwright 和系统中查找已安装的浏览器。

> **注意**：Puppeteer 中命名为 `chrome-headless-shell`
> Playwright 中命名为 `chromium-headless-shell`
> 为了方便使用，本库统一命名为 `chrome-headless-shell`（遵循 Chrome 官方命名）。

## 快速开始

```ts
import { browserFinder } from '@snapka/browser-finder'

// 查找所有浏览器
const browsers = await browserFinder.find()

// 查找第一个 Chrome 浏览器
const chrome = await browserFinder.findFirstChrome()

// 查找第一个基于 Chromium 内核的浏览器
const chromiumCore = await browserFinder.findFirstChromiumCore()
```

## 数据结构

所有查找方法返回 `BrowserInfo` 对象或其数组：

```ts
interface BrowserInfo {
  /** 浏览器类型 */
  type: 'chrome' | 'chromium' | 'chrome-headless-shell' | 'firefox' | 'webkit' | 'edge' | 'brave' | 'chromedriver'
  
  /** 浏览器目录路径 */
  dir: string
  
  /** 浏览器版本号（从路径提取，可能不完整） */
  version: string
  
  /** 浏览器可执行文件路径 */
  executablePath: string
}
```

## 查找器实例

### BrowserFinder（统一查找器）

推荐使用的主查找器，聚合了所有来源的浏览器。

```ts
import { browserFinder } from '@snapka/browser-finder'
```

#### 基础查找方法

| 方法 | 异步 | 同步 | 说明 |
|------|------|------|------|
| `find()` | ✅ | `findSync()` | 查找所有浏览器 |
| `findChrome()` | ✅ | `findChromeSync()` | 查找所有 Chrome |
| `findChromium()` | ✅ | `findChromiumSync()` | 查找所有 Chromium |
| `findChromeHeadlessShell()` | ✅ | `findChromeHeadlessShellSync()` | 查找所有 Chrome Headless Shell |
| `findFirefox()` | ✅ | `findFirefoxSync()` | 查找所有 Firefox |
| `findWebkit()` | ✅ | `findWebkitSync()` | 查找所有 WebKit |
| `findEdge()` | ✅ | `findEdgeSync()` | 查找所有 Edge |
| `findBrave()` | ✅ | `findBraveSync()` | 查找所有 Brave |

#### 扩展查找方法

##### 查找所有 Chromium 内核浏览器

```ts
// 包括 chrome、chromium、chrome-headless-shell、edge、brave
const browsers = await browserFinder.findChromiumCore()
const browsersSync = browserFinder.findChromiumCoreSync()
```

##### 查找第一个符合条件的浏览器

优先级从高到低，找到第一个即返回：

| 方法 | 查找顺序/优先级 |
|------|----------------|
| `findFirstChrome()` / `findFirstChromeSync()` | Puppeteer → 系统 Chrome |
| `findFirstChromium()` / `findFirstChromiumSync()` | Puppeteer → Playwright |
| `findFirstFirefox()` / `findFirstFirefoxSync()` | Puppeteer → Playwright |
| `findFirstChromeHeadlessShell()` / `findFirstChromeHeadlessShellSync()` | Puppeteer → Playwright |
| `findFirstChromiumCore()` / `findFirstChromiumCoreSync()` | Chrome → Chromium → Headless Shell → Edge → Brave |

```ts
// 查找第一个可用的 Chromium 内核浏览器
const browser = await browserFinder.findFirstChromiumCore()
if (browser) {
  console.log(`找到 ${browser.type}: ${browser.executablePath}`)
}
```

### 子查找器

如需单独使用某个来源的查找器：

```ts
import { browserFinder } from '@snapka/browser-finder'

// Puppeteer 缓存查找器
const browsers = await browserFinder.puppeteer.find()

// Playwright 缓存查找器  
const browsers = await browserFinder.playwright.find()

// 系统浏览器查找器
const browsers = await browserFinder.system.find()
```

#### Puppeteer 查找器

查找 `~/.cache/puppeteer` 目录下的浏览器。

**支持的浏览器类型**：

- `chrome`
- `chromium`
- `chrome-headless-shell`
- `firefox`
- `chromedriver`

**通用方法**：

- `find()` / `findSync()` - 查找所有浏览器
- `findChrome()` / `findChromeSync()` - 查找 Chrome（返回单个）
- `findChromium()` / `findChromiumSync()` - 查找 Chromium（返回单个）
- `findChromeHeadlessShell()` / `findChromeHeadlessShellSync()` - 查找 Chrome Headless Shell（返回单个）
- `findFirefox()` / `findFirefoxSync()` - 查找 Firefox（返回单个）
- `findChromeDriver()` / `findChromeDriverSync()` - 查找 ChromeDriver（返回单个）

#### Playwright 查找器

查找 Playwright 缓存目录下的浏览器。

**支持的浏览器类型**：

- `chromium`
- `chrome-headless-shell`（内部为 `chromium-headless-shell`）
- `firefox`
- `webkit`

**通用方法**：

- `find()` / `findSync()` - 查找所有浏览器
- `findChromium()` / `findChromiumSync()` - 查找 Chromium（返回单个）
- `findChromeHeadlessShell()` / `findChromeHeadlessShellSync()` - 查找 Chrome Headless Shell（返回单个）
- `findFirefox()` / `findFirefoxSync()` - 查找 Firefox（返回单个）
- `findWebkit()` / `findWebkitSync()` - 查找 WebKit（返回单个）

#### System 查找器

查找系统安装的浏览器（使用 `@snapka/browsers` 内部机制）。

**支持的浏览器类型**：

- `chrome`（全部发布通道：stable、beta、dev、canary）
- `edge`
- `brave`

**通用方法**：

- `brave`

**通用方法**：

- `find()` / `findSync()` - 查找所有系统浏览器
- `findChrome()` / `findChromeSync()` - 查找所有 Chrome
- `findEdge()` / `findEdgeSync()` - 查找所有 Edge
- `findBrave()` / `findBraveSync()` - 查找所有 Brave

## 使用示例

### 查找所有浏览器

```ts
const allBrowsers = await browserFinder.find()
console.log(`找到 ${allBrowsers.length} 个浏览器`)

allBrowsers.forEach(browser => {
  console.log(`${browser.type} ${browser.version}: ${browser.executablePath}`)
})
```

### 查找特定浏览器

```ts
// 查找所有 Chrome
const chromes = await browserFinder.findChrome()

// 查找第一个可用的 Chrome
const chrome = await browserFinder.findFirstChrome()

// 仅从 Puppeteer 查找
const puppeteerChrome = await browserFinder.puppeteer.findChrome()

// 仅从系统查找所有 Chrome（包括 stable、beta、dev、canary）
const systemChromes = browserFinder.system.findChromeSync()
```

### 同步查找

```ts
// 适用于配置文件或同步初始化场景
const browsers = browserFinder.findSync()
const chrome = browserFinder.findFirstChromeSync()
const chromiumCore = browserFinder.findFirstChromiumCoreSync()
```

## 注意事项

1. **版本号提取**：`version` 字段从路径中提取，可能不完整或不准确。如需精确版本，建议执行 `${executablePath} --version` 获取。

2. **系统浏览器版本**：System 查找器中 Edge 和 Brave 的 `version` 字段默认返回 `'0.0.0.0'`，需要时通过 getter 动态获取。

3. **查找优先级**：`BrowserFinder` 的查找顺序为 Puppeteer → Playwright → System，`findFirst` 系列方法遵循此优先级。

4. **Chromium 内核**：`findChromiumCore()` 包含所有基于 Chromium 的浏览器：chrome、chromium、chrome-headless-shell、edge、brave。
