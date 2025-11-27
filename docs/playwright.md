# @snapka/playwright API 文档

## 简介

`@snapka/playwright` 是基于 Playwright 的网页截图库，提供了简单易用的 API 来启动浏览器、连接浏览器以及执行网页截图。

## 安装

```bash
npm install @snapka/playwright
```

## 快速开始

```typescript
import { snapka } from '@snapka/playwright'

// 启动浏览器并截图
const core = await snapka.launch()
const { run } = await core.screenshot({
  file: 'https://example.com',
  type: 'png',
  encoding: 'binary'
})
const screenshot = await run()

// 关闭浏览器
await core.close()
```

---

## API 参考

### snapka 对象

主要导出对象，提供浏览器管理功能。

#### snapka.browsers

- **类型**: `Browser[]`
- **描述**: 已启动的浏览器实例列表

#### snapka.launch(options?)

启动一个新的浏览器实例。

**参数:**

- [`options`](packages/playwright/src/launch.ts:8) - [`PlaywrightLaunchOptions`](#playwrightlaunchoptions) 可选的启动选项

**返回:**

- `Promise<PlaywrightCore>` - [`PlaywrightCore`](#playwrightcore) 实例

**示例:**

```typescript
const core = await snapka.launch({
  headless: true,
  defaultViewport: { width: 1920, height: 1080 }
})
```

#### snapka.connect(options)

连接到一个已启动的浏览器实例。

**参数:**

- [`options`](packages/playwright/src/launch.ts:54) - [`PlaywrightConnectOptions`](#playwrightconnectoptions) 连接选项

**返回:**

- `Promise<PlaywrightCore>` - [`PlaywrightCore`](#playwrightcore) 实例

**示例:**

```typescript
const core = await snapka.connect({
  baseUrl: 'ws://localhost:9222'
})
```

---

## 类型定义

### PlaywrightLaunchOptions

浏览器启动选项配置。

```typescript
interface PlaywrightLaunchOptions {
  // 浏览器可执行文件路径
  executablePath?: string
  
  // 是否启用寻找浏览器功能（默认: true）
  findBrowser?: boolean
  
  // 调试模式
  debug?: boolean
  
  // 浏览器下载配置
  download?: {
    enable?: boolean
    dir?: string
    version?: string
    browser?: 'chrome' | 'chromium' | 'chrome-headless-shell'
    baseUrl?: string
  }
  
  // Playwright 特定选项
  channel?: string
  chromiumSandbox?: boolean
  devtools?: boolean
  downloadsPath?: string
  env?: Record<string, string | undefined>
  firefoxUserPrefs?: Record<string, string | number | boolean>
  handleSIGHUP?: boolean
  handleSIGINT?: boolean
  handleSIGTERM?: boolean
  ignoreDefaultArgs?: boolean | string[]
  proxy?: {
    server: string
    bypass?: string
    username?: string
    password?: string
  }
  timeout?: number
  tracesDir?: string
  
  // Snapka 通用选项
  headless?: boolean | 'new' | 'shell'
  defaultViewport?: { width: number; height: number }
  maxOpenPages?: number
  pageMode?: 'reuse' | 'disposable'
  pageIdleTimeout?: number
}
```

**字段说明:**

- **executablePath**: 自定义浏览器可执行文件路径
- **findBrowser**: 是否自动查找系统中的浏览器（默认启用）
- **debug**: 开启调试模式，在 Windows 平台优先使用有界面的浏览器
- **download**: 浏览器下载配置
  - `enable`: 是否允许下载浏览器（默认: true）
  - `dir`: 浏览器缓存目录
  - `version`: 浏览器版本（默认: 'stable'）
  - `browser`: 浏览器类型
  - `baseUrl`: 自定义下载源
- **headless**: 无头模式
  - `true`: 标准无头模式
  - `'new'` / `'shell'`: 使用 Chrome Headless Shell
  - `false`: 有界面模式
- **defaultViewport**: 默认视口大小
- **maxOpenPages**: 最大同时打开的页面数（默认: 10）
- **pageMode**: 页面管理模式
  - `'reuse'`: 复用模式，页面会被放回池中（默认，推荐）
  - `'disposable'`: 一次性模式，每次截图后销毁页面
- **pageIdleTimeout**: 页面空闲超时时间（毫秒，默认: 60000）

### PlaywrightConnectOptions

浏览器连接选项配置。

```typescript
interface PlaywrightConnectOptions {
  // 浏览器 WebSocket 连接地址
  baseUrl: string
  
  // 自定义请求头
  headers?: Record<string, string>
  
  // 连接超时时间（毫秒）
  timeout?: number
  
  // Snapka 通用选项
  defaultViewport?: { width: number; height: number }
  maxOpenPages?: number
  pageMode?: 'reuse' | 'disposable'
  pageIdleTimeout?: number
}
```

---

## PlaywrightCore 类

浏览器核心控制类，提供截图和浏览器管理功能。

### 属性

#### core.engine

- **类型**: `string`
- **描述**: 获取当前使用的浏览器引擎类型
- **返回**: `'playwright'`

### 方法

#### core.executablePath()

获取当前浏览器二进制路径。

**返回:**

- `string | null` - 浏览器可执行文件路径，连接模式下返回 null

**示例:**

```typescript
const path = core.executablePath()
console.log('浏览器路径:', path)
```

#### core.restart()

重启浏览器实例。

**返回:**

- `Promise<void>`

**示例:**

```typescript
await core.restart()
```

#### core.close()

关闭浏览器实例并清理所有资源。

**返回:**

- `Promise<void>`

**示例:**

```typescript
await core.close()
```

#### core.screenshot(options)

执行页面截图。

**参数:**

- [`options`](#screenshotoptions) - 截图配置选项

**返回:**

- `Promise<{ run: () => Promise<T>, page: Page, browser: Browser }>` - 包含截图执行函数、页面实例和浏览器实例的对象

**示例:**

```typescript
// 截取完整页面
const { run } = await core.screenshot({
  file: 'https://example.com',
  type: 'png',
  encoding: 'base64',
  fullPage: true
})
const base64Image = await run()

// 截取指定元素
const { run } = await core.screenshot({
  file: 'https://example.com',
  selector: '#content',
  type: 'jpeg',
  quality: 80
})
const buffer = await run()
```

#### core.screenshotViewport(options)

执行分片截图（视口截图）。

**参数:**

- [`options`](#screenshotviewportoptions) - 分片截图配置选项

**返回:**

- `Promise<{ run: () => Promise<T[]>, page: Page, browser: Browser }>` - 包含截图执行函数、页面实例和浏览器实例的对象

**示例:**

```typescript
const { run } = await core.screenshotViewport({
  file: 'https://example.com',
  selector: '#long-content',
  viewportHeight: 1000,
  type: 'png'
})
const screenshots = await run() // 返回多个截图
```

---

## 截图选项

### ScreenshotOptions

```typescript
interface ScreenshotOptions<T extends 'base64' | 'binary' = 'binary'> {
  // 必需参数
  file: string  // 要截图的页面 URL
  
  // 图片格式
  type?: 'png' | 'jpeg' | 'webp'  // 默认: 'png'
  encoding?: T  // 默认: 'binary'
  
  // 截图范围
  fullPage?: boolean  // 是否截取完整页面（默认: false）
  selector?: string   // CSS 选择器，指定要截图的元素
  
  // 图片质量
  quality?: number  // 1-100，仅对 jpeg/webp 有效
  omitBackground?: boolean  // 是否省略背景（默认: false）
  
  // 输出路径
  path?: string  // 保存截图的文件路径
  
  // 页面跳转参数
  pageGotoParams?: {
    timeout?: number  // 页面加载超时时间（毫秒，默认: 30000）
    waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit'
  }
  
  // 等待条件
  waitForSelector?: string | string[]  // 等待元素加载
  waitForFunction?: string | string[]  // 等待函数返回 true
  waitForRequest?: string | string[]   // 等待特定请求
  waitForResponse?: string | string[]  // 等待特定响应
  
  // HTTP 请求头
  headers?: Record<string, string>
  
  // 重试次数
  retry?: number  // 默认: 1
  
  // Playwright 特定选项
  playwright?: Record<string, any>
}
```

### ScreenshotViewportOptions

分片截图选项，继承自 [`ScreenshotOptions`](#screenshotoptions)。

```typescript
interface ScreenshotViewportOptions<T extends 'base64' | 'binary' = 'binary'> 
  extends ScreenshotOptions<T> {
  // 视口高度（每个分片的高度，默认: 2000）
  viewportHeight?: number
  
  // selector 在此模式下是必需的
  selector: string
}
```

---

## 使用示例

### 基础截图

```typescript
import { snapka } from '@snapka/playwright'

const core = await snapka.launch()

// PNG 格式截图
const { run } = await core.screenshot({
  file: 'https://example.com',
  type: 'png'
})
const pngBuffer = await run()

// JPEG 格式截图
const { run: runJpeg } = await core.screenshot({
  file: 'https://example.com',
  type: 'jpeg',
  quality: 90
})
const jpegBuffer = await runJpeg()

await core.close()
```

### 完整页面截图

```typescript
const { run } = await core.screenshot({
  file: 'https://example.com',
  fullPage: true,
  type: 'png'
})
const screenshot = await run()
```

### 元素截图

```typescript
const { run } = await core.screenshot({
  file: 'https://example.com',
  selector: '#header',
  type: 'png'
})
const screenshot = await run()
```

### Base64 编码

```typescript
const { run } = await core.screenshot({
  file: 'https://example.com',
  encoding: 'base64',
  type: 'png'
})
const base64String = await run()
```

### 等待条件

```typescript
const { run } = await core.screenshot({
  file: 'https://example.com',
  waitForSelector: '.loaded',
  waitForFunction: '() => document.readyState === "complete"',
  type: 'png'
})
const screenshot = await run()
```

### 分片截图

```typescript
const { run } = await core.screenshotViewport({
  file: 'https://example.com',
  selector: 'body',
  viewportHeight: 1000,
  type: 'png'
})
const screenshots = await run() // Array<Uint8Array>
```

### 自定义请求头

```typescript
const { run } = await core.screenshot({
  file: 'https://api.example.com/page',
  headers: {
    'Authorization': 'Bearer token123',
    'User-Agent': 'Custom UA'
  },
  type: 'png'
})
const screenshot = await run()
```

### 重试机制

```typescript
const { run } = await core.screenshot({
  file: 'https://example.com',
  retry: 3,  // 最多重试 3 次
  type: 'png'
})
const screenshot = await run()
```

### 保存到文件

```typescript
const { run } = await core.screenshot({
  file: 'https://example.com',
  path: './output/screenshot.png',
  type: 'png'
})
await run()
```

---

## 高级配置

### 浏览器查找与下载

```typescript
// 禁用自动查找，直接下载
const core = await snapka.launch({
  findBrowser: false,
  download: {
    enable: true,
    version: 'stable',
    browser: 'chrome'
  }
})

// 自定义下载源
const core = await snapka.launch({
  download: {
    enable: true,
    browser: 'chromium',
    baseUrl: 'https://custom-mirror.com'
  }
})

// 指定缓存目录
const core = await snapka.launch({
  download: {
    enable: true,
    dir: '/custom/cache/dir'
  }
})
```

### 页面池管理

```typescript
// 复用模式（推荐）
const core = await snapka.launch({
  pageMode: 'reuse',
  maxOpenPages: 20,
  pageIdleTimeout: 120000  // 2分钟
})

// 一次性模式
const core = await snapka.launch({
  pageMode: 'disposable',
  maxOpenPages: 10
})
```

### 代理设置

```typescript
const core = await snapka.launch({
  proxy: {
    server: 'http://proxy.example.com:8080',
    username: 'user',
    password: 'pass'
  }
})
```

### 调试模式

```typescript
// Windows 平台开启调试模式（使用有界面浏览器）
const core = await snapka.launch({
  debug: true,
  headless: false,
  devtools: true
})
```

---

## 错误处理

```typescript
try {
  const core = await snapka.launch()
  
  const { run } = await core.screenshot({
    file: 'https://example.com',
    type: 'png'
  })
  
  const screenshot = await run()
} catch (error) {
  if (error.message.includes('无法获取浏览器可执行文件路径')) {
    console.error('浏览器未找到，请检查配置')
  } else if (error.message.includes('截图在')) {
    console.error('截图失败:', error.message)
  } else {
    console.error('未知错误:', error)
  }
}
```

---

## 注意事项

1. **内存管理**: 使用 `pageMode: 'reuse'` 可以提高性能，但要注意设置合理的 `pageIdleTimeout`
2. **并发控制**: `maxOpenPages` 控制最大并发数，避免资源耗尽
3. **超时设置**: 根据实际网络情况调整 `pageGotoParams.timeout`
4. **图片格式**: PNG 不支持 `quality` 参数，WebP 在 Playwright 中会自动转为 PNG
5. **重试机制**: 对于不稳定的网络环境，建议设置 `retry` 参数
6. **资源清理**: 使用完毕后及时调用 [`close()`](#coreclose) 方法释放资源

---

## 相关链接

- [Playwright 官方文档](https://playwright.dev/)
- [@snapka/puppeteer 文档](./puppeteer.md)
- [GitHub 仓库](https://github.com/your-repo/snapka)

---

## 许可证

MIT
