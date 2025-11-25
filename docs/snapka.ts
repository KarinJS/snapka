/**
 * 截图参数。
 * @description 对于没有特别说明的参数, puppeteer和playwright均支持。
 */
export interface SnapkaScreenshotOptions {
  /**
   * 截图类型。
   * @defaultValue `'png'`
   * @description 在 playwright 中不支持 webp ，如果传入将会重置为 png。
   */
  type?: 'png' | 'jpeg' | 'webp'

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
   * 图片的编码方式。
   *
   * @defaultValue `'binary'`
   * @description playwright 拓展支持 `'base64'` 编码。
   */
  encoding?: 'base64' | 'binary'

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
