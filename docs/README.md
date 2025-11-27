# Snapka 文档中心

欢迎使用 Snapka - 强大的网页截图库集合！

## 📚 文档导航

### 核心库

- **[@snapka/playwright](./playwright.md)** - 基于 Playwright 的截图库
  - 现代化的浏览器自动化工具
  - 跨浏览器支持
  - 更好的等待机制和稳定性
  
- **[@snapka/puppeteer](./puppeteer.md)** - 基于 Puppeteer 的截图库
  - 成熟稳定的浏览器自动化工具
  - 原生支持 WebP 格式
  - 精细的网络空闲控制

### 开发者文档

- **[API 标准规范](./api-standard.md)** - Snapka API 标准定义
  - 统一的 API 接口规范
  - 实现指南和最佳实践
  - 社区贡献者必读

## 🚀 快速开始

### 使用 Playwright

```bash
npm install @snapka/playwright
```

```typescript
import { snapka } from '@snapka/playwright'

const core = await snapka.launch()
const { run } = await core.screenshot({
  file: 'https://example.com',
  type: 'png'
})
const screenshot = await run()
await core.close()
```

### 使用 Puppeteer

```bash
npm install @snapka/puppeteer
```

```typescript
import { snapka } from '@snapka/puppeteer'

const core = await snapka.launch()
const { run } = await core.screenshot({
  file: 'https://example.com',
  type: 'png'
})
const screenshot = await run()
await core.close()
```

## 🎯 核心特性

### 自动浏览器管理

- ✅ 自动查找系统中已安装的浏览器
- ✅ 智能下载缺失的浏览器
- ✅ 支持自定义浏览器路径
- ✅ 多浏览器类型支持（Chrome、Chromium、Edge、Brave 等）

### 高性能截图

- ✅ 页面池复用机制，提升性能
- ✅ 并发控制，避免资源耗尽
- ✅ 自动重试机制
- ✅ 空闲页面自动清理

### 灵活的截图选项

- ✅ 完整页面截图
- ✅ 元素截图
- ✅ 视口分片截图
- ✅ 多种图片格式（PNG、JPEG、WebP）
- ✅ Base64 和 Binary 编码

### 强大的等待机制

- ✅ 等待元素加载 (waitForSelector)
- ✅ 等待函数执行 (waitForFunction)
- ✅ 等待网络请求 (waitForRequest)
- ✅ 等待网络响应 (waitForResponse)
- ✅ 等待页面加载完成 (waitUntil)

## 📊 功能对比

| 功能 | @snapka/playwright | @snapka/puppeteer |
|------|-------------------|-------------------|
| 基础截图 | ✅ | ✅ |
| 完整页面截图 | ✅ | ✅ |
| 元素截图 | ✅ | ✅ |
| 分片截图 | ✅ | ✅ |
| PNG 格式 | ✅ | ✅ |
| JPEG 格式 | ✅ | ✅ |
| WebP 格式 | ⚠️ 转为 PNG | ✅ 原生支持 |
| Base64 编码 | ✅ | ✅ |
| 裁剪截图 | ⚠️ 间接支持 | ✅ clip 参数 |
| 页面池管理 | ✅ 上下文池 | ✅ 页面池 |
| 自动查找浏览器 | ✅ | ✅ |
| 自动下载浏览器 | ✅ | ✅ |
| 重试机制 | ✅ | ✅ |
| networkidle0/2 | ❌ | ✅ |
| commit 等待 | ✅ | ❌ |

## 🔧 使用场景

### 选择 @snapka/playwright

适合以下场景：

- ✅ 需要跨浏览器支持
- ✅ 追求最新的浏览器自动化功能
- ✅ 需要更稳定的等待机制
- ✅ 对性能要求较高的场景

### 选择 @snapka/puppeteer

适合以下场景：

- ✅ 需要 WebP 格式支持
- ✅ 需要精细的网络空闲控制
- ✅ 需要裁剪功能
- ✅ 已有 Puppeteer 使用经验

## 📖 详细文档

### API 文档

- [API 标准规范](./api-standard.md) - **推荐社区开发者先阅读**
- [Playwright API 完整文档](./playwright.md)
- [Puppeteer API 完整文档](./puppeteer.md)

### 类型定义

#### PlaywrightLaunchOptions

详见 [Playwright 文档 - PlaywrightLaunchOptions](./playwright.md#playwrightlaunchoptions)

#### PuppeteerLaunchOptions

详见 [Puppeteer 文档 - PuppeteerLaunchOptions](./puppeteer.md#puppeteerlaunchoptions)

#### ScreenshotOptions

截图配置选项，两个库通用：

```typescript
interface ScreenshotOptions {
  file: string                    // 页面 URL
  type?: 'png' | 'jpeg' | 'webp' // 图片格式
  encoding?: 'base64' | 'binary' // 编码方式
  fullPage?: boolean             // 完整页面
  selector?: string              // 元素选择器
  quality?: number               // 图片质量
  // ... 更多选项
}
```

## 💡 常见问题

### 1. 如何自动查找浏览器？

默认启用，无需配置：

```typescript
const core = await snapka.launch()
// 自动查找系统中的浏览器
```

### 2. 如何禁用自动下载？

```typescript
const core = await snapka.launch({
  download: {
    enable: false
  }
})
```

### 3. 如何提升截图性能？

```typescript
const core = await snapka.launch({
  pageMode: 'reuse',        // 使用复用模式
  maxOpenPages: 20,         // 增加并发数
  pageIdleTimeout: 120000   // 延长空闲超时
})
```

### 4. 如何处理 HTTPS 错误？

**Playwright:**

```typescript
const core = await snapka.launch({
  ignoreDefaultArgs: ['--ignore-certificate-errors']
})
```

**Puppeteer:**

```typescript
const core = await snapka.launch({
  ignoreHTTPSErrors: true
})
```

### 5. 如何设置代理？

**Playwright:**

```typescript
const core = await snapka.launch({
  proxy: {
    server: 'http://proxy.example.com:8080',
    username: 'user',
    password: 'pass'
  }
})
```

**Puppeteer:**

```typescript
const core = await snapka.launch({
  args: [
    '--proxy-server=http://proxy.example.com:8080'
  ]
})
```

### 6. 如何等待动态内容加载？

```typescript
const { run } = await core.screenshot({
  file: 'https://example.com',
  waitForSelector: '.dynamic-content',
  waitForFunction: '() => window.dataLoaded === true',
  pageGotoParams: {
    waitUntil: 'networkidle'  // Playwright
    // waitUntil: 'networkidle0'  // Puppeteer
  }
})
```

## 🛠️ 高级用法示例

### 批量截图

```typescript
const urls = [
  'https://example1.com',
  'https://example2.com',
  'https://example3.com'
]

const core = await snapka.launch({
  maxOpenPages: 10
})

const screenshots = await Promise.all(
  urls.map(async (url) => {
    const { run } = await core.screenshot({
      file: url,
      type: 'png'
    })
    return run()
  })
)

await core.close()
```

### 长页面分片截图

```typescript
const { run } = await core.screenshotViewport({
  file: 'https://example.com/long-page',
  selector: 'body',
  viewportHeight: 1000,
  type: 'png',
  encoding: 'base64'
})

const screenshots = await run()
// screenshots 是一个数组，每个元素是一个分片的 base64 字符串
```

### 带认证的截图

```typescript
const { run } = await core.screenshot({
  file: 'https://api.example.com/protected',
  headers: {
    'Authorization': 'Bearer your-token-here',
    'X-Custom-Header': 'custom-value'
  },
  type: 'png'
})

const screenshot = await run()
```

### 重试失败的截图

```typescript
const { run } = await core.screenshot({
  file: 'https://unstable-site.com',
  retry: 5,  // 最多重试 5 次
  pageGotoParams: {
    timeout: 60000  // 60 秒超时
  }
})

try {
  const screenshot = await run()
} catch (error) {
  console.error('截图失败，已重试 5 次:', error)
}
```

## 🔗 相关资源

- [API 标准规范](./api-standard.md) - 创建新实现的标准指南
- [Playwright 官方文档](https://playwright.dev/)
- [Puppeteer 官方文档](https://pptr.dev/)
- [GitHub 仓库](https://github.com/your-repo/snapka)
- [问题反馈](https://github.com/your-repo/snapka/issues)

## 👥 社区贡献

想要为 Snapka 生态贡献新的浏览器引擎支持？

1. 📖 阅读 [API 标准规范](./api-standard.md)
2. 🔧 按照标准实现核心接口
3. ✅ 确保通过合规性检查
4. 📝 提交 Pull Request

我们欢迎基于以下引擎的实现：

- Selenium WebDriver
- WebDriverIO
- Cypress（如果可行）
- 其他浏览器自动化工具

## 📝 更新日志

查看每个包的更新日志：

- [@snapka/playwright CHANGELOG](../packages/playwright/CHANGELOG.md)
- [@snapka/puppeteer CHANGELOG](../packages/puppeteer/CHANGELOG.md)

## 🤝 贡献指南

欢迎贡献代码！请查看 [CONTRIBUTING.md](../CONTRIBUTING.md) 了解详情。

## 📄 许可证

MIT License - 详见 [LICENSE](../LICENSE)

---

<p align="center">
  Made with ❤️ by Snapka Team
</p>
