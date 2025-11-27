# Snapka API 标准规范

## 📋 概述

本文档定义了 Snapka 系列库的标准 API 规范。所有 Snapka 实现（如 `@snapka/playwright`、`@snapka/puppeteer` 等）都应遵循此规范，以确保 API 的一致性和可互换性。

## 🎯 设计原则

1. **一致性**: 所有实现必须提供相同的核心 API
2. **可扩展性**: 允许特定实现添加专有功能
3. **类型安全**: 使用 TypeScript 提供完整的类型定义
4. **向后兼容**: API 变更应保持向后兼容
5. **类型完整性**: 即使某些参数在特定实现中无法实际使用，也必须在类型定义中保留，以确保 API 的一致性

## 📦 导出规范

### 主导出对象

每个实现必须导出一个名为 `snapka` 的对象：

```typescript
export const snapka = {
  browsers: Browser[],
  launch: (options?: LaunchOptions) => Promise<Core>,
  connect: (options: ConnectOptions) => Promise<Core>
}
```

#### snapka.browsers

- **类型**: `Browser[]`
- **必需**: ✅ 是
- **描述**: 存储所有已启动的浏览器实例
- **用途**: 用于跟踪和管理浏览器实例

#### snapka.launch(options?)

- **签名**: `(options?: LaunchOptions) => Promise<Core>`
- **必需**: ✅ 是
- **描述**: 启动一个新的浏览器实例
- **参数**:
  - `options`: 可选的启动配置，必须继承自 `SnapkaLaunchOptions`
- **返回**: 返回核心控制类实例
- **行为**:
  1. 解析浏览器可执行路径（查找或下载）
  2. 启动浏览器
  3. 将浏览器实例添加到 `browsers` 数组
  4. 创建并返回核心控制类实例

#### snapka.connect(options)

- **签名**: `(options: ConnectOptions) => Promise<Core>`
- **必需**: ✅ 是
- **描述**: 连接到已启动的浏览器实例
- **参数**:
  - `options`: 必需的连接配置，必须继承自 `SnapkaConnectOptions`
- **返回**: 返回核心控制类实例
- **行为**:
  1. 连接到指定的浏览器 WebSocket 端点
  2. 将浏览器实例添加到 `browsers` 数组
  3. 创建并返回核心控制类实例

---

## 🔧 配置选项标准

### SnapkaLaunchOptions（启动选项基类）

所有实现的启动选项必须继承此接口：

```typescript
interface SnapkaLaunchOptions {
  // ===== 必需字段 =====
  
  // ===== 可选字段 =====
  
  /** 浏览器可执行文件路径 */
  executablePath?: string
  
  /** 是否启用浏览器查找功能 */
  findBrowser?: boolean
  
  /** 是否开启调试模式 */
  debug?: boolean
  
  /** 浏览器下载配置 */
  download?: {
    /** 是否允许下载 */
    enable?: boolean
    /** 下载缓存目录 */
    dir?: string
    /** 浏览器版本 */
    version?: string
    /** 浏览器类型 */
    browser?: 'chrome' | 'chromium' | 'chrome-headless-shell'
    /** 自定义下载源 */
    baseUrl?: string
  }
  
  /** 无头模式 */
  headless?: boolean | 'new' | 'shell'
  
  /** 默认视口大小 */
  defaultViewport?: { width: number; height: number } | null
  
  /** 最大同时打开的页面数 */
  maxOpenPages?: number
  
  /** 页面管理模式 */
  pageMode?: 'reuse' | 'disposable'
  
  /** 页面空闲超时时间（毫秒） */
  pageIdleTimeout?: number
}
```

**字段说明**:

- **executablePath**: 自定义浏览器路径，优先级最高
- **findBrowser**: 是否自动查找系统浏览器（默认: `true`）
- **debug**: 调试模式，在支持的平台优先使用有界面浏览器
- **download**: 浏览器下载配置
  - `enable`: 是否允许自动下载（默认: `true`）
  - `dir`: 缓存目录路径
  - `version`: 浏览器版本标签（默认: `'stable'`）
  - `browser`: 浏览器类型
  - `baseUrl`: 自定义下载镜像源
- **headless**: 无头模式配置
  - `true`: 标准无头模式
  - `'new'` / `'shell'`: 使用 Headless Shell
  - `false`: 有界面模式
- **defaultViewport**: 默认视口大小
- **maxOpenPages**: 并发页面数限制（默认: `10`）
- **pageMode**: 页面管理策略
  - `'reuse'`: 复用模式（默认，推荐）
  - `'disposable'`: 一次性模式
- **pageIdleTimeout**: 空闲页面超时时间（默认: `60000`）

### SnapkaConnectOptions（连接选项基类）

所有实现的连接选项必须继承此接口：

```typescript
interface SnapkaConnectOptions {
  // ===== 必需字段 =====
  
  /** 浏览器 WebSocket 连接地址 */
  baseUrl?: string
  
  // ===== 可选字段 =====
  
  /** 默认视口大小 */
  defaultViewport?: { width: number; height: number } | null
  
  /** 最大同时打开的页面数 */
  maxOpenPages?: number
  
  /** 页面管理模式 */
  pageMode?: 'reuse' | 'disposable'
  
  /** 页面空闲超时时间（毫秒） */
  pageIdleTimeout?: number
}
```

### 扩展选项规范

实现可以扩展基础选项，但必须遵循以下规则：

```typescript
// ✅ 正确：继承并扩展
interface PlaywrightLaunchOptions extends SnapkaLaunchOptions {
  // Playwright 特有选项
  channel?: string
  chromiumSandbox?: boolean
  // ...
}

// ❌ 错误：不继承基础接口
interface PlaywrightLaunchOptions {
  executablePath?: string
  // ...
}
```

### ⚠️ 类型完整性原则

**重要规则：所有实现必须在类型定义中包含标准中定义的所有参数，即使某些参数在该实现中无法实际使用。**

#### 为什么需要这个原则？

1. **API 一致性**: 确保用户在不同实现间切换时，类型定义保持一致
2. **IDE 支持**: 提供统一的代码补全和类型检查体验
3. **文档完整性**: 避免用户困惑某个参数是否可用
4. **未来兼容性**: 为将来可能的实现留出空间

#### 实施规则

```typescript
// ✅ 正确：即使 Playwright 不支持 clip 参数，也要在类型中保留
interface PlaywrightScreenshotOptions<T> extends SnapkaScreenshotOptions<T> {
  // 标准参数都已通过继承包含
  // 即使 clip 在 Playwright 中无法使用，也不应该 Omit
  
  // Playwright 特有的额外选项
  playwright?: {
    animations?: 'disabled' | 'allow'
    caret?: 'hide' | 'initial'
  }
}

// ❌ 错误：不应该排除标准参数
interface PlaywrightScreenshotOptions<T>
  extends Omit<SnapkaScreenshotOptions<T>, 'clip'> {
  // 这样做会破坏类型一致性
}
```

#### 处理不支持的参数

当实现无法支持某个标准参数时，应该：

1. **类型定义中保留**: 不要从类型中移除该参数
2. **运行时处理**: 在代码中静默忽略或记录警告
3. **文档说明**: 在文档中明确说明哪些参数不被支持

**示例**：

```typescript
// 类型定义 - 保留所有标准参数
interface PlaywrightScreenshotOptions<T> extends SnapkaScreenshotOptions<T> {
  // 所有标准参数都可用（包括 clip）
}

// 实现代码 - 处理不支持的参数
class PlaywrightCore {
  async screenshot<T>(options: PlaywrightScreenshotOptions<T>) {
    // 如果用户传入了 clip 参数，记录警告
    if (options.clip) {
      console.warn('Playwright 实现不支持 clip 参数，该参数将被忽略')
    }
    
    // 继续执行截图逻辑
    // ...
  }
}
```

#### 文档要求

在实现的文档中，应明确说明不支持的参数：

```markdown
## 参数支持情况

以下标准参数在 Playwright 实现中不被支持：

- `clip`: Playwright 使用不同的方式实现裁剪功能
  - 替代方案: 使用 `selector` 参数选择特定元素

虽然这些参数在类型定义中存在，但运行时会被忽略。
```

---

## 🎨 核心控制类标准

### Core 类接口规范

每个实现必须提供一个核心控制类（如 `PlaywrightCore`、`PuppeteerCore`），该类必须实现以下接口：

```typescript
interface SnapkaCore {
  // ===== 必需属性 =====
  
  /** 引擎名称 */
  readonly engine: string
  
  // ===== 必需方法 =====
  
  /** 获取浏览器可执行路径 */
  executablePath(): string | null
  
  /** 重启浏览器实例 */
  restart(): Promise<void>
  
  /** 关闭浏览器并清理资源 */
  close(): Promise<void>
  
  /** 执行页面截图 */
  screenshot<T extends 'base64' | 'binary' = 'binary'>(
    options: SnapkaScreenshotOptions<T>
  ): Promise<ScreenshotResult<T>>
  
  /** 执行视口分片截图 */
  screenshotViewport<T extends 'base64' | 'binary' = 'binary'>(
    options: SnapkaScreenshotViewportOptions<T>
  ): Promise<ScreenshotViewportResult<T>>
}
```

#### 返回类型定义

```typescript
interface ScreenshotResult<T extends 'base64' | 'binary'> {
  /** 执行截图的函数 */
  run: () => Promise<T extends 'base64' ? string : Uint8Array>
  /** 页面实例（底层库类型） */
  page: any
  /** 浏览器实例（底层库类型） */
  browser: any
}

interface ScreenshotViewportResult<T extends 'base64' | 'binary'> {
  /** 执行分片截图的函数 */
  run: () => Promise<T extends 'base64' ? string[] : Uint8Array[]>
  /** 页面实例（底层库类型） */
  page: any
  /** 浏览器实例（底层库类型） */
  browser: any
}
```

### 属性规范

#### engine

- **类型**: `string`
- **必需**: ✅ 是
- **访问器**: getter
- **描述**: 返回底层引擎名称
- **示例**: `'playwright'`、`'puppeteer'`、`'selenium'`

### 方法规范

#### executablePath()

- **签名**: `() => string | null`
- **必需**: ✅ 是
- **返回**: 浏览器可执行文件路径，连接模式下返回 `null`
- **行为**: 返回当前使用的浏览器二进制文件路径

#### restart()

- **签名**: `() => Promise<void>`
- **必需**: ✅ 是
- **返回**: `Promise<void>`
- **行为**:
  1. 停止空闲检查定时器
  2. 关闭所有页面/上下文
  3. 关闭当前浏览器
  4. 使用相同配置重新启动/连接浏览器
  5. 恢复空闲检查定时器

#### close()

- **签名**: `() => Promise<void>`
- **必需**: ✅ 是
- **返回**: `Promise<void>`
- **行为**:
  1. 停止空闲检查定时器
  2. 关闭所有页面/上下文
  3. 关闭浏览器实例
  4. 清理所有资源

#### screenshot(options)

- **签名**: `<T extends 'base64' | 'binary'>(options: SnapkaScreenshotOptions<T>) => Promise<ScreenshotResult<T>>`
- **必需**: ✅ 是
- **参数**: 截图配置选项
- **返回**: 包含 `run` 函数、`page` 和 `browser` 的对象
- **行为**:
  1. 从池中获取或创建新页面
  2. 导航到指定 URL
  3. 等待配置的条件
  4. 返回包含截图执行函数的对象
  5. 执行 `run()` 后自动释放页面资源

#### screenshotViewport(options)

- **签名**: `<T extends 'base64' | 'binary'>(options: SnapkaScreenshotViewportOptions<T>) => Promise<ScreenshotViewportResult<T>>`
- **必需**: ✅ 是
- **参数**: 分片截图配置选项
- **返回**: 包含 `run` 函数、`page` 和 `browser` 的对象
- **行为**:
  1. 从池中获取或创建新页面
  2. 导航到指定 URL
  3. 等待配置的条件
  4. 返回包含分片截图执行函数的对象
  5. 执行 `run()` 后自动释放页面资源

---

## 📸 截图选项标准

### SnapkaScreenshotOptions

```typescript
interface SnapkaScreenshotOptions<T extends 'base64' | 'binary' = 'binary'> {
  // ===== 必需字段 =====
  
  /** 要截图的页面 URL */
  file: string
  
  // ===== 可选字段 =====
  
  /** 图片格式 */
  type?: 'png' | 'jpeg' | 'webp'
  
  /** 编码方式 */
  encoding?: T
  
  /** 是否截取完整页面 */
  fullPage?: boolean
  
  /** 元素选择器 */
  selector?: string
  
  /** 图片质量（1-100，仅对 jpeg/webp 有效） */
  quality?: number
  
  /** 是否省略背景 */
  omitBackground?: boolean
  
  /** 保存路径 */
  path?: string
  
  /** 页面跳转参数 */
  pageGotoParams?: {
    /** 超时时间（毫秒） */
    timeout?: number
    /** 等待条件 */
    waitUntil?: string
  }
  
  /** 等待元素选择器 */
  waitForSelector?: string | string[]
  
  /** 等待函数 */
  waitForFunction?: string | string[]
  
  /** 等待请求 */
  waitForRequest?: string | string[]
  
  /** 等待响应 */
  waitForResponse?: string | string[]
  
  /** HTTP 请求头 */
  headers?: Record<string, string>
  
  /** 重试次数 */
  retry?: number
}
```

**字段说明**:

- **file**: ✅ 必需，页面 URL
- **type**: 图片格式，默认 `'png'`
- **encoding**: 编码方式，默认 `'binary'`
- **fullPage**: 是否截取完整页面，默认 `false`
- **selector**: CSS 选择器，指定截图元素
- **quality**: 图片质量，仅对 `jpeg`/`webp` 有效
- **omitBackground**: 是否省略背景，默认 `false`
- **path**: 保存文件路径
- **pageGotoParams**: 页面导航参数
- **waitForSelector**: 等待元素加载
- **waitForFunction**: 等待 JavaScript 函数返回 true
- **waitForRequest**: 等待特定请求
- **waitForResponse**: 等待特定响应
- **headers**: 自定义 HTTP 请求头
- **retry**: 重试次数，默认 `1`

### SnapkaScreenshotViewportOptions

```typescript
interface SnapkaScreenshotViewportOptions<T extends 'base64' | 'binary' = 'binary'> 
  extends SnapkaScreenshotOptions<T> {
  // ===== 必需字段 =====
  
  /** 元素选择器（此模式下必需） */
  selector: string
  
  // ===== 可选字段 =====
  
  /** 视口高度（每个分片的高度） */
  viewportHeight?: number
}
```

### 扩展截图选项

实现可以添加特定引擎的选项，但应作为独立字段：

```typescript
// ✅ 正确：使用独立的命名空间字段
interface PlaywrightScreenshotOptions<T> extends SnapkaScreenshotOptions<T> {
  /** Playwright 特定选项 */
  playwright?: {
    animations?: 'disabled' | 'allow'
    caret?: 'hide' | 'initial'
    // ...
  }
}

// ✅ 也可以直接扩展（明确标注）
interface PuppeteerScreenshotOptions<T> extends SnapkaScreenshotOptions<T> {
  /** 裁剪区域（Puppeteer 专有） */
  clip?: {
    x: number
    y: number
    width: number
    height: number
  }
}
```

---

## 🔄 行为规范

### 浏览器路径解析

所有实现必须按以下优先级解析浏览器路径：

1. **自定义路径**: `options.executablePath`
2. **系统查找**: 如果 `options.findBrowser !== false`
3. **自动下载**: 如果 `options.download.enable !== false`

**伪代码**:

```typescript
async function getPath(options: LaunchOptions): Promise<string | null> {
  // 1. 验证自定义路径
  if (options.executablePath) {
    if (!exists(options.executablePath)) {
      throw new Error('executablePath 指定的路径不存在')
    }
    return options.executablePath
  }
  
  // 2. 查找系统浏览器
  if (options.findBrowser !== false) {
    const foundPath = await findBrowser(options.debug)
    if (foundPath) return foundPath
  }
  
  // 3. 下载浏览器
  if (options.download?.enable !== false) {
    return await downloadBrowser(options.download)
  }
  
  return null
}
```

### 页面池管理

所有实现必须实现页面池机制：

**规则**:

1. **复用模式** (`pageMode: 'reuse'`):
   - 页面使用完毕后返回池中
   - 池满时关闭超出的页面
   - 空闲超时后自动清理

2. **一次性模式** (`pageMode: 'disposable'`):
   - 每次使用完立即销毁页面
   - 不使用页面池

3. **并发控制**:
   - 使用 `maxOpenPages` 限制并发数
   - 超出限制的请求需排队等待

4. **空闲检查**:
   - 仅在复用模式且 `pageIdleTimeout > 0` 时启动
   - 定期（建议 30 秒）清理超时的空闲页面

### 重试机制

所有实现必须支持重试机制：

**规则**:

1. 根据 `options.retry` 参数重试
2. 使用指数退避策略延迟重试
3. 记录每次重试的错误信息
4. 达到最大重试次数后抛出错误

**伪代码**:

```typescript
async function retryExecute<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  operation: string
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
        console.warn(`${operation}失败 (第 ${attempt}/${maxRetries} 次): ${error.message}`)
        await sleep(delay)
      } else {
        throw new Error(`${operation}在 ${maxRetries} 次尝试后失败: ${error.message}`)
      }
    }
  }
}
```

### 等待条件处理

所有实现必须支持以下等待条件：

1. **waitForSelector**: 等待元素出现
2. **waitForFunction**: 等待 JavaScript 函数返回 true
3. **waitForRequest**: 等待特定网络请求
4. **waitForResponse**: 等待特定网络响应

**规则**:

- 支持字符串或字符串数组
- 使用 `Promise.allSettled()` 并行等待所有条件
- 超时不应抛出错误，仅记录警告
- 元素不存在时跳过等待

---

## 🧪 测试规范

### 必需测试用例

所有实现必须包含以下测试：

1. **基础功能测试**
   - 启动浏览器
   - 连接浏览器
   - 关闭浏览器
   - 重启浏览器

2. **截图功能测试**
   - PNG 格式截图
   - JPEG 格式截图
   - WebP 格式截图（如支持）
   - Base64 编码
   - Binary 编码
   - 完整页面截图
   - 元素截图
   - 分片截图

3. **配置选项测试**
   - 自定义浏览器路径
   - 查找系统浏览器
   - 下载浏览器
   - 页面池复用
   - 一次性模式

4. **等待条件测试**
   - 等待元素
   - 等待函数
   - 等待请求
   - 等待响应

5. **错误处理测试**
   - 无效 URL
   - 超时错误
   - 元素不存在
   - 重试机制

### 测试示例结构

```typescript
describe('Snapka Implementation', () => {
  describe('launch()', () => {
    it('should launch browser successfully', async () => {
      const core = await snapka.launch()
      expect(core).toBeDefined()
      expect(core.engine).toBe('your-engine')
      await core.close()
    })
  })
  
  describe('screenshot()', () => {
    it('should take PNG screenshot', async () => {
      const core = await snapka.launch()
      const { run } = await core.screenshot({
        file: 'https://example.com',
        type: 'png'
      })
      const screenshot = await run()
      expect(screenshot).toBeInstanceOf(Uint8Array)
      await core.close()
    })
  })
})
```

---

## 📝 文档规范

### 必需文档

每个实现必须提供以下文档：

1. **README.md**: 项目简介和快速开始
2. **API.md**: 完整 API 文档
3. **CHANGELOG.md**: 版本更新日志

### 文档结构

参考模板：

```markdown
# @snapka/your-implementation

## 安装
## 快速开始
## API 参考
  - snapka 对象
  - LaunchOptions
  - ConnectOptions
  - Core 类
  - 截图选项
## 使用示例
## 高级配置
## 常见问题
## 与其他实现的差异
```

---

## 🚀 创建新实现指南

### 步骤 1: 创建项目结构

```
@snapka/your-implementation/
├── src/
│   ├── index.ts          # 主入口，导出 snapka 对象
│   ├── core.ts           # 核心控制类
│   ├── launch.ts         # 启动器类
│   └── util.ts           # 工具函数
├── test/
│   └── index.test.ts     # 测试文件
├── package.json
├── tsconfig.json
└── README.md
```

### 步骤 2: 实现核心接口

```typescript
// src/index.ts
import type { LaunchOptions, ConnectOptions } from './launch'

const browsers: Browser[] = []

export const snapka = {
  browsers,
  
  async launch(options: LaunchOptions = {}) {
    // 1. 获取浏览器路径
    // 2. 启动浏览器
    // 3. 添加到 browsers 数组
    // 4. 创建并返回 Core 实例
  },
  
  async connect(options: ConnectOptions) {
    // 1. 连接到浏览器
    // 2. 添加到 browsers 数组
    // 3. 创建并返回 Core 实例
  }
}
```

```typescript
// src/core.ts
export class YourCore implements SnapkaCore {
  get engine() { return 'your-engine' }
  
  executablePath() { /* ... */ }
  async restart() { /* ... */ }
  async close() { /* ... */ }
  async screenshot(options) { /* ... */ }
  async screenshotViewport(options) { /* ... */ }
}
```

### 步骤 3: 继承标准选项

```typescript
// src/launch.ts
import type { SnapkaLaunchOptions, SnapkaConnectOptions } from '@snapka/types'

export interface LaunchOptions extends SnapkaLaunchOptions {
  // 添加特定引擎的选项
}

export interface ConnectOptions extends SnapkaConnectOptions {
  // 添加特定引擎的选项
}
```

### 步骤 4: 编写测试

参考 [测试规范](#测试规范) 编写完整的测试用例。

### 步骤 5: 编写文档

参考 [文档规范](#文档规范) 编写完整的文档。

---

## ✅ 合规性检查清单

在发布新实现前，请确保：

### API 合规性

- [ ] 导出 `snapka` 对象
- [ ] 实现 `snapka.browsers`
- [ ] 实现 `snapka.launch()`
- [ ] 实现 `snapka.connect()`
- [ ] 核心类继承 `SnapkaCore` 接口
- [ ] 选项继承 `SnapkaLaunchOptions` 和 `SnapkaConnectOptions`

### 功能合规性

- [ ] 支持浏览器路径解析（自定义、查找、下载）
- [ ] 实现页面池管理
- [ ] 支持并发控制
- [ ] 实现重试机制
- [ ] 支持所有等待条件
- [ ] 支持 PNG、JPEG 格式
- [ ] 支持 Base64 和 Binary 编码

### 测试合规性

- [ ] 基础功能测试覆盖率 > 80%
- [ ] 截图功能测试覆盖率 > 80%
- [ ] 包含错误处理测试
- [ ] 所有测试通过

### 文档合规性

- [ ] 提供 README.md
- [ ] 提供 API 文档
- [ ] 提供使用示例
- [ ] 提供 CHANGELOG.md
- [ ] **参数支持说明**: 在文档中明确列出不支持的标准参数及其替代方案

---

## 🔗 相关资源

- [@snapka/types](../packages/snapka-types/src/index.ts) - 标准类型定义
- [@snapka/playwright](./playwright.md) - Playwright 实现参考
- [@snapka/puppeteer](./puppeteer.md) - Puppeteer 实现参考

---

## 📞 支持

如有关于标准规范的疑问：

- 提交 Issue: [GitHub Issues](https://github.com/your-repo/snapka/issues)
- 讨论区: [GitHub Discussions](https://github.com/your-repo/snapka/discussions)

---

## 📜 版本历史

### v1.0.0 (当前版本)

- 初始标准规范发布
- 定义核心 API 接口
- 定义配置选项标准
- 定义行为规范

---

<p align="center">
  <strong>遵循标准，创造更好的 Snapka 生态</strong>
</p>
