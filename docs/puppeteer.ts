/**
 * puppeteer 的截图参数
 */
/**
 * @public
 */
export declare interface ScreenshotOptions {
  /**
   * 是否优化速度。
   * @defaultValue `false`
   */
  optimizeForSpeed?: boolean

  /**
   * 截图类型。
   * @defaultValue `'png'`
   */
  type?: 'png' | 'jpeg' | 'webp'

  /**
   * 图片质量，范围 0-100。对 `png` 类型无效。
   */
  quality?: number

  /**
   * 是否从表面而不是视图上截取屏幕截图。
   *
   * @defaultValue `true`
   */
  fromSurface?: boolean

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
     */
    scale?: number
  }

  /**
   * 图片的编码方式。
   *
   * @defaultValue `'binary'`
   */
  encoding?: 'base64' | 'binary'

  /**
   * 是否允许截图超出可视区域（viewport）。
   *
   * @defaultValue `false`（无 clip 时），否则 `true`
   */
  captureBeyondViewport?: boolean
}
