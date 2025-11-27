# @snapka/puppeteer API 文档

## 简介

`@snapka/puppeteer` 是基于 Puppeteer 的网页截图库，提供了简单易用的 API 来启动浏览器、连接浏览器以及执行网页截图。

## 安装

```bash
npm install @snapka/puppeteer
```

## 快速开始

```typescript
import { snapka } from '@snapka/puppeteer'

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

- [`options`](packages/puppeteer/src/launch.ts:9) - [`PuppeteerLaunchOptions`](#puppeteerlaunchoptions) 可选的启动选项

**返回:**

- `Promise<PuppeteerCore>` - [`PuppeteerCore`](#puppeteercore) 实例

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

- [`options`](packages/puppeteer/src/launch.ts:13) - [`PuppeteerConnectOptions`](#puppeteerconnectoptions) 连接选项

**返回:**

- `Promise<PuppeteerCore>` - [`PuppeteerCore`](#puppeteercore) 实例

**示例:**

```typescript
const core = await snapka.connect({
  baseUrl: 'ws://localhost:9222',
  browserURL: 'ws://localhost:9222'
})
```

---

## 类型定义

### PuppeteerLaunchOptions

浏览器启动选项配置，继承自 Puppeteer 的 LaunchOptions 和 Snapka 的通用选项。

```typescript
interface PuppeteerLaunchOptions {
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
  
  // Puppeteer 特定选项
  args?: string[]
  dumpio?: boolean
  env?: Record<string, string | undefined>
  handleSIGINT?: boolean
  handleSIGTERM?: boolean
  handleSIGHUP?: boolean
  ignoreHTTPSErrors?: boolean
  pipe?: boolean
  product?: 'chrome' | 'firefox'
  slowMo?: number
  timeout?: number
  waitForInitialPage?: boolean
  
  // Snapka 通用选项
  headless?: boolean | 'new' | 'shell'
  defaultViewport?: { width: number; height: number } | null
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
  - `dir`: 浏览器缓存目录（默认: `~/.cache/puppeteer`）
  - `version`: 浏览器版本（默认: 'stable'）
  - `browser`: 浏览器类型
  - `baseUrl`: 自定义下载源
- **headless**: 无头模式
  - `true`: 标准无头模式
  - `'new'` / `'shell'`: 使用 Chrome Headless Shell
  - `false`: 有界面模式
- **defaultViewport**: 默认视口大小（设为 null 禁用）
- **maxOpenPages**: 最大同时打开的页面数（默认: 10）
- **pageMode**: 页面管理模式
  - `'reuse'`: 复用模式，页面会被放回池中（默认，推荐）
  - `'disposable'`: 一次性模式，每次截图后销毁页面
- **pageIdleTimeout**: 页面空闲超时时间（毫秒，默认: 60000）
- **args**: Chrome/Chromium 启动参数
- **ignoreHTTPSErrors**: 是否忽略 HTTPS 错误
- **slowMo**: 放慢操作速度（毫秒）
- **timeout**: 等待浏览器启动的最大时间

### PuppeteerConnectOptions

浏览器连接选项配置，继承自 Puppeteer 的 ConnectOptions 和 Snapka 的通用选项。

```typescript
interface PuppeteerConnectOptions {
  // 浏览器 WebSocket 连接地址（两个字段任选其一）
  baseUrl?: string
  browserURL?: string
  
  // 浏览器 WebSocket 端点
  browserWSEndpoint?: string
  
  // 连接选项
  ignoreHTTPSErrors?: boolean
  defaultViewport?: { width: number; height: number } | null
  slowMo?: number
  targetFilter?: (target: any) => boolean
  protocol?: 'cdp' | 'webDriverBiDi'
  
  // Snapka 通用选项
  maxOpenPages?: number
  pageMode?: 'reuse' | 'disposable'
  pageIdleTimeout?: number
}
```

---

## PuppeteerCore 类

浏览器核心控制类，提供截图和浏览器管理功能。

### 属性

#### core.engine

- **类型**: `string`
- **描述**: 获取当前使用的浏览器引擎类型
- **返回**: `'puppeteer'`

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
  quality?: number  // 0-100，仅对 jpeg/webp 有效
  omitBackground?: boolean  // 是否省略背景（默认: false）
  
  // 输出路径
  path?: string  // 保存截图的文件路径
  
  // 截图裁剪区域
  clip?: {
    x: number
    y: number
    width: number
    height: number
  }
  
  // 页面跳转参数
  pageGotoParams?: {
    timeout?: number  // 页面加载超时时间（毫秒，默认: 30000）
    waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2'
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
}
```

**Puppeteer 特有选项:**

- **clip**: 裁剪区域，精确控制截图范围
- **waitUntil**: 支持 `networkidle0` 和 `networkidle2`
  - `networkidle0`: 网络空闲（至少 500ms 内没有超过 0 个网络连接）
  - `networkidle2`: 网络空闲（至少 500ms 内没有超过 2 个网络连接）

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
import { snapka } from '@snapka/puppeteer'

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

// WebP 格式截图
const { run: runWebp } = await core.screenshot({
  file: 'https://example.com',
  type: 'webp',
  quality: 85
})
const webpBuffer = await runWebp()

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

### 裁剪截图

```typescript
const { run } = await core.screenshot({
  file: 'https://example.com',
  clip: {
    x: 0,
    y: 0,
    width: 800,
    height: 600
  },
  type: 'png'
})
const screenshot = await run()
```

### 等待条件

```typescript
// 等待元素
const { run } = await core.screenshot({
  file: 'https://example.com',
  waitForSelector: '.loaded',
  type: 'png'
})

// 等待函数
const { run: run2 } = await core.screenshot({
  file: 'https://example.com',
  waitForFunction: '() => document.readyState === "complete"',
  type: 'png'
})

// 等待网络空闲
const { run: run3 } = await core.screenshot({
  file: 'https://example.com',
  pageGotoParams: {
    waitUntil: 'networkidle0'
  },
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

// Base64 编码的分片截图
const { run: runBase64 } = await core.screenshotViewport({
  file: 'https://example.com',
  selector: 'body',
  viewportHeight: 1000,
  encoding: 'base64',
  type: 'png'
})
const base64Screenshots = await runBase64() // Array<string>
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

### 启动参数

```typescript
const core = await snapka.launch({
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--disable-gpu'
  ]
})
```

### 忽略 HTTPS 错误

```typescript
const core = await snapka.launch({
  ignoreHTTPSErrors: true
})
```

### 调试模式

```typescript
// Windows 平台开启调试模式（使用有界面浏览器）
const core = await snapka.launch({
  debug: true,
  headless: false,
  dumpio: true,  // 显示浏览器进程的 stdout 和 stderr
  slowMo: 250    // 放慢操作 250ms
})
```

### 自定义视口

```typescript
const core = await snapka.launch({
  defaultViewport: {
    width: 1920,
    height: 1080
  }
})

// 禁用默认视口
const core = await snapka.launch({
  defaultViewport: null
})
```

---

## 与 Playwright 的区别

### 主要差异

1. **waitUntil 选项**
   - Puppeteer: 支持 `networkidle0` 和 `networkidle2`
   - Playwright: 支持 `commit` 和 `networkidle`

2. **截图裁剪**
   - Puppeteer: 支持 `clip` 参数直接裁剪
   - Playwright: 通过其他方式实现裁剪

3. **WebP 格式**
   - Puppeteer: 原生支持 WebP
   - Playwright: WebP 会转为 PNG

4. **默认视口**
   - Puppeteer: 可设置为 `null` 禁用
   - Playwright: 必须提供视口大小

5. **上下文管理**
   - Puppeteer: 使用页面池管理
   - Playwright: 使用浏览器上下文池管理

### 选择建议

- **使用 Puppeteer** 当你需要：
  - WebP 格式支持
  - 更精细的网络空闲控制（networkidle0/2）
  - 裁剪功能
  
- **使用 Playwright** 当你需要：
  - 更现代的 API
  - 跨浏览器支持
  - 更好的等待机制

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
  } else if (error.message.includes('Navigation timeout')) {
    console.error('页面加载超时')
  } else {
    console.error('未知错误:', error)
  }
}
```

---

## 性能优化建议

1. **使用页面复用模式**

```typescript
const core = await snapka.launch({
  pageMode: 'reuse',
  maxOpenPages: 20
})
```

2. **合理设置超时时间**

```typescript
const { run } = await core.screenshot({
  file: 'https://example.com',
  pageGotoParams: {
    timeout: 15000,  // 根据实际情况调整
    waitUntil: 'networkidle2'
  }
})
```

3. **控制并发数**

```typescript
const core = await snapka.launch({
  maxOpenPages: 10  // 根据服务器资源调整
})
```

4. **定期清理空闲页面**

```typescript
const core = await snapka.launch({
  pageIdleTimeout: 60000  // 1分钟后清理空闲页面
})
```

---

## 注意事项

1. **内存管理**: 使用 `pageMode: 'reuse'` 可以提高性能，但要注意设置合理的 `pageIdleTimeout`
2. **并发控制**: `maxOpenPages` 控制最大并发数，避免资源耗尽
3. **超时设置**: 根据实际网络情况调整 `pageGotoParams.timeout`
4. **图片格式**: PNG 不支持 `quality` 参数
5. **重试机制**: 对于不稳定的网络环境，建议设置 `retry` 参数
6. **资源清理**: 使用完毕后及时调用 [`close()`](#coreclose) 方法释放资源
7. **网络空闲**: `networkidle0` 更严格，`networkidle2` 更宽松，根据实际需求选择

---

## 相关链接

- [Puppeteer 官方文档](https://pptr.dev/)
- [@snapka/playwright 文档](./playwright.md)
- [GitHub 仓库](https://github.com/your-repo/snapka)

---

## 许可证

MIT
