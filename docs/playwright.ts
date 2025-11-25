export interface PageScreenshotOptions {
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
   * 指定截图结果的裁剪区域。
   */
  clip?: {
    /**
     * 裁剪区域左上角的 x 坐标
     */
    x: number

    /**
     * 裁剪区域左上角的 y 坐标
     */
    y: number

    /**
     * 裁剪区域的宽度
     */
    width: number

    /**
     * 裁剪区域的高度
     */
    height: number
  }

  /**
   * 如果为 true，则截图整个可滚动页面，而不仅是当前可视区域。默认值为 `false`。
   */
  fullPage?: boolean

  /**
   * 指定截图时需要遮罩的定位器。被遮罩的元素会被一个粉色方框 `#FF00FF`（可通过 [`maskColor`](https://playwright.dev/docs/api/class-page#page-screenshot-option-mask-color) 自定义）覆盖，完全覆盖其边界框。
   * 遮罩也会应用于不可见元素，可参见 [仅匹配可见元素](https://playwright.dev/docs/locators#matching-only-visible-elements) 来禁用此行为。
   */
  mask?: Array<unknown>

  /**
   * 指定遮罩元素的覆盖框颜色，使用 [CSS 颜色格式](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value)。默认颜色为粉色 `#FF00FF`。
   */
  maskColor?: string

  /**
   * 隐藏默认白色背景，允许截图带透明背景。对 `jpeg` 图片不适用。
   * 默认值为 `false`。
   */
  omitBackground?: boolean

  /**
   * 保存截图的文件路径。截图类型会根据文件扩展名自动推断。
   * 如果 [`path`](https://playwright.dev/docs/api/class-page#page-screenshot-option-path) 是相对路径，则相对于当前工作目录解析。
   * 如果未提供路径，则图片不会保存到磁盘。
   */
  path?: string

  /**
   * 图片质量，范围 0-100。对 `png` 图片不适用。
   */
  quality?: number

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

  /**
   * 指定截图类型，默认值为 `png`。
   */
  type?: 'png' | 'jpeg'
}
