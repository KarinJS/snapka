/**
 * 截图参数。
 * @description 对于没有特别说明的参数, puppeteer和playwright均支持。
 */
export interface ScreenshotOptions {
  /**
   * 截图类型。
   * @defaultValue `'png'`
   * @description 在 playwright 中不支持 webp ，如果传入将会重置为 png。
   */
  type?: 'png' | 'jpeg' | 'webp'
  /**
   * 选择一个元素进行截图。
   *
   * 如果设置了该选项，截图将只包含该元素的内容。
   * @description 在设置fullPage为true时此参数无效。
   * @default '#container'
   */
  selector?: string
  /**
   * 图片质量，范围 0-100。对 `png` 类型无效。
   */
  quality?: number

  /**
   * 是否截图完整页面。
   *
   * @defaultValue `false`
   */
  fullPage?: boolean

  /**
   * 隐藏默认的白色背景，使截图支持透明背景。
   *
   * @defaultValue `false`
   */
  omitBackground?: boolean

  /**
   * 保存截图的文件路径。
   * 截图类型将根据文件扩展名推断。
   * 如果提供相对路径，将基于当前工作目录解析。
   * 如果未提供路径，图片不会保存到磁盘。
   */
  path?: string

  /**
   * 指定需要裁剪的区域。
   */
  clip?: {
    /**
     * 元素的左上角横坐标（像素）。
     */
    x: number
    /**
     * 元素的左上角纵坐标（像素）。
     */
    y: number

    /**
     * 元素的宽度（像素）。
     */
    width: number

    /**
     * 元素的高度（像素）。
     */
    height: number
    /**
     * 缩放比例。
     * @defaultValue `1`
     * @description puppeteer 独有参数。
     */
    scale?: number
  }

  /**
   * 是否允许截图超出可视区域（viewport）。
   *
   * @defaultValue `false`（无 clip 时），否则 `true`
   * @description 仅 puppeteer 支持该参数。
   */
  captureBeyondViewport?: boolean
  /**
   * 是否从表面而不是视图上截取屏幕截图。
   *
   * @defaultValue `true`
   * @description 仅 puppeteer 支持该参数。
   */
  fromSurface?: boolean
  /**
   * 是否优化速度。
   * @defaultValue `false`
   * @description 仅 puppeteer 支持该参数。
   */
  optimizeForSpeed?: boolean
  /**
   * 重试次数
   * @description snapka 独有参数
   * @defaultValue `1`
   */
  retry?: number
  /**
   * playwright 专属参数
   */
  playwright?: {
    /**
     * 设置为 `"disabled"` 时，会停止 CSS 动画、CSS 过渡和 Web 动画。动画根据其持续时间有不同处理方式：
     * - 有限动画会快进到完成，因此会触发 `transitionend` 事件。
     * - 无限动画会被取消回初始状态，然后在截图后重新播放。
     *
     * 默认值为 `"allow"`，即保持动画不变。
     */
    animations?: 'disabled' | 'allow'

    /**
     * 设置为 `"hide"` 时，截图会隐藏文本光标。设置为 `"initial"` 时，文本光标行为保持不变。
     * 默认值为 `"hide"`。
     */
    caret?: 'hide' | 'initial'

    /**
     * 指定遮罩元素的覆盖框颜色，使用 [CSS 颜色格式](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value)。默认颜色为粉色 `#FF00FF`。
     */
    maskColor?: string

    /**
     * 设置为 `"css"` 时，每个页面的 CSS 像素对应截图中的一个像素，对于高 DPI 设备，截图体积较小。
     * 使用 `"device"` 时，每个设备像素对应截图中的一个像素，因此高 DPI 设备截图会更大。
     *
     * 默认值为 `"device"`。
     */
    scale?: 'css' | 'device'

    /**
     * 截图时应用的样式表文本。可用于隐藏动态元素、设置元素不可见或修改其属性，以便生成可复现的截图。
     * 样式会穿透 Shadow DOM 并应用到内嵌框架。
     */
    style?: string

    /**
     * 最大等待时间（毫秒）。默认值为 `0`，表示无超时。
     * 默认值可通过配置中的 `actionTimeout` 修改，或使用
     * [browserContext.setDefaultTimeout(timeout)](https://playwright.dev/docs/api/class-browsercontext#browser-context-set-default-timeout)
     * 或 [page.setDefaultTimeout(timeout)](https://playwright.dev/docs/api/class-page#page-set-default-timeout) 方法设置。
     */
    timeout?: number
  }
}

/**
 * 截图参数
 */
export interface SnapkaScreenshotOptions<T extends 'base64' | 'binary'> extends ScreenshotOptions {
  /**
   * goto的页面地址
   * - file://
   * - http(s)?://
   */
  file: string
  /**
   * 重试次数
   * @defaultValue `1`
   */
  retry?: number
  /**
   * 保存截图的文件路径
   */
  path?: string
  /** 自定义HTTP 标头 */
  headers?: Record<string, string>
  /**
   * 图片的编码方式。
   *
   * @defaultValue `'binary'`
   * @description playwright 拓展支持 `'base64'` 编码。
   */
  encoding?: T
  /** 页面goto时的参数 */
  pageGotoParams?: {
    /**
     * 导航的URL地址超时时间，单位毫秒
     * @defaultValue 30000
     */
    timeout?: number
    /**
     * 指定页面“完成加载”的标准，也就是 Puppeteer、 Playwright 认为操作成功的条件。
     * @defaultValue 'load'
     *
     * - 'load': 页面及资源加载完成
     * - 'domcontentloaded': DOM 已经解析完成，但图片等资源可能还没加载
     * - 'networkidle': 网络空闲 500ms，官方不推荐用于测试
     * - 'commit': 网络响应已收到，文档开始加载（最早状态）
     * - 'networkidle0': 网络请求为 0 且维持至少 500ms（页面完全静止）
     * - 'networkidle2': 网络请求不超过 2 个且维持至少 500ms（页面基本静止）
     *
     * @description
     * - 在puppeteer中，`networkidle`和`commit` 会被转成 `networkidle0` 和 `domcontentloaded` 使用
     * - 在playwright中，`networkidle0`和`networkidle2` 会被转成 `networkidle` 使用
     */
    waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' | 'networkidle0' | 'networkidle2'
  }
  /** 等待指定元素加载完成 */
  waitForSelector?: string | string[]
  /** 等待特定函数完成 */
  waitForFunction?: string | string[]
  /** 等待特定请求完成 */
  waitForRequest?: string | string[]
  /** 等待特定响应完成 */
  waitForResponse?: string | string[]
}

/**
 * 分片截图参数
 */
export interface SnapkaScreenshotViewportOptions<T extends 'base64' | 'binary'> extends Omit<SnapkaScreenshotOptions<T>, 'fullPage'> {
  /**
   * 分页后每个页的高度
   * @default 0
   * @description 为0时表示自动计算每页高度
   */
  viewportHeight?: number
}

interface Options {
  /**
   * 是否启用寻找浏览器功能
   * @description 启用后会使用 @snapka/browser-finder 进行查找系统浏览器、puppeteer、playwright下载的浏览器
   * @default true
   */
  findBrowser?: boolean
  /**
   * 操作慢动作延迟 单位毫秒
   */
  slowMo?: number
  /**
   * 最多同时打开多少个页面
   * @default 10
   */
  maxOpenPages?: number
  /**
   * 页面管理模式
   * @default 'reuse'
   * @description
   * - 'reuse': 页面复用模式，截图结束后将页面放回池中以供下次使用（推荐）
   * - 'disposable': 一次性模式，每次截图都创建新页面，结束后立即销毁
   */
  pageMode?: 'reuse' | 'disposable'
  /**
   * 页面池空闲超时时间（毫秒）
   * @default 60000
   * @description 页面在池中空闲超过此时间后将被自动销毁，设置为 0 则永不超时
   */
  pageIdleTimeout?: number
  /**
   * 调试模式
   * @default false
   * @description 仅windows可使用 窗口页不会自动关闭
   */
  debug?: boolean
  /**
   * 默认视窗大小
   * @defaultValue '\{width: 800, height: 600\}'
   */
  defaultViewport?: { width: number, height: number }
}

/**
 * 初始化浏览器接口标准定义
 * @description 可自行拓展此接口以得到更好的支持
 */
export interface LaunchOptions extends Options {
  /**
   * 浏览器可执行文件路径
   * @description 指定浏览器可执行文件路径以使用自定义浏览器
   */
  executablePath?: string
  /**
   * 无头模式配置
   * @default 'shell'
   * @description 最新版的chrome支持以下所有选项
   * - 'new': 使用 Puppeteer 新的无头模式
   * - 'shell': 使用传统的无头模式 仅支持`chrome-headless-shell`
   * - 'false': 以有头模式启动浏览器
   */
  headless?: 'new' | 'shell' | 'false'
  /**
    * 传递给浏览器的额外命令行参数
    */
  args?: string[]
  /**
   * 浏览器下载配置
   * 对于下载功能，请使用 @snapka/browser-finder 进行下载管理
   */
  download?: {
    /**
     * 是否启用下载功能
     * @default true
     */
    enable?: boolean
    /**
     * 下载目录
     * @default `${os.homedir()}/.cache/puppeteer`
     */
    dir?: string
    /**
     * 下载的浏览器版本
     * @default stable
     * @description 支持渠道名称和特定版本号:
     * - `latest` - 最新的 Canary 版本
     * - `stable` - 稳定版
     * - `beta` - 测试版
     * - `dev` - 开发版
     * - `canary` - Canary 版
     * - `<版本号>` - 特定版本，如 `120` 或 `120.0.6099.109`
     * - 版本号请参考: https://github.com/GoogleChromeLabs/chrome-for-testing
     */
    version?: string
    /**
     * 下载的浏览器类型
     * 在windows下默认值为`chromium` 其他平台默认值为`chrome-headless-shell`
     * @default 'chrome-headless-shell'
     */
    browser?: 'chrome' | 'chromium' | 'chrome-headless-shell'
    /**
     * 自定义下载源
     *
     * @description 建议不设置此字段，内部实现使用竞速进行探针测试自定义使用更快的源进行下载
     *
     * @description 官方源
     * - chrome-for-testing: `https://storage.googleapis.com/chrome-for-testing-public`
     * - chromium-browser-snapshots: `https://storage.googleapis.com/chromium-browser-snapshots`
     *
     * @description 阿里云
     * - chrome-for-testing: `https://registry.npmmirror.com/-/binary/chrome-for-testing`
     * - chromium-browser-snapshots: `https://registry.npmmirror.com/-/binary/chromium-browser-snapshots`
     */
    baseUrl?: string
  }
}

export interface ConnectOptions extends Options {
  /**
   * 浏览器ws连接地址
   * @description 用于连接已启动的浏览器实例
   */
  baseUrl: string
  /**
   * 自定义请求头
   * @description 用于连接浏览器时传递自定义请求头
   */
  headers?: Record<string, string>
}
