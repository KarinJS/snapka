# Screenshot 参数对比：Puppeteer vs Playwright

## puppeteer

<details>
  <summary>点击展开/收起</summary>

```ts
/**
 * puppeteer 的截图参数
 */
/**
 * @public
 */
declare interface ScreenshotOptions {
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

```

</details>

## playwright

<details>
  <summary>点击展开/收起</summary>

```ts
interface PageScreenshotOptions {
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
  mask?: Array<Locator>

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

```

</details>

## ✅ **一、两者 *相同参数* 对比表（puppeteer vs playwright）**

只列 **两者都存在的参数**，并显示差异点（如类型不同、默认值不同）。

| 参数                 | puppeteer 类型                | playwright 类型     | 注释（两者含义是否一致）                          |
| ------------------ | --------------------------- | ----------------- | ------------------------------------- |
| **type**           | `'png' \| 'jpeg' \| 'webp'` | `'png' \| 'jpeg'` | puppeteer 支持 webp，playwright 不支持 webp |
| **quality**        | `number`                    | `number`          | 两者都仅对 jpeg 有效（对 png 无效）               |
| **fullPage**       | `boolean`                   | `boolean`         | 含义一致：是否截图整个页面                         |
| **omitBackground** | `boolean`                   | `boolean`         | 含义一致：透明背景（都对 jpeg 不适用）                |
| **path**           | `string`                    | `string`          | 含义一致：保存文件路径                           |
| **clip.x**         | `number`                    | `number`          | 裁剪区域 X                                |
| **clip.y**         | `number`                    | `number`          | 裁剪区域 Y                                |
| **clip.width**     | `number`                    | `number`          | 裁剪区域宽度                                |
| **clip.height**    | `number`                    | `number`          | 裁剪区域高度                                |

👉 **相同点总结：**
两者共有 **10 个参数**：
`type, quality, fullPage, omitBackground, path, clip.x, clip.y, clip.width, clip.height`

---

## 🟦 **Puppeteer 独有参数**

| 参数                    | 类型                     | 注释               |
| --------------------- | ---------------------- | ---------------- |
| optimizeForSpeed      | boolean                | 优化截图速度           |
| fromSurface           | boolean                | 是否从 surface 截图   |
| clip.scale            | number                 | 裁剪区域缩放比例         |
| encoding              | `'base64' \| 'binary'` | 输出编码方式           |
| captureBeyondViewport | boolean                | 允许超出 viewport 截图 |

---

## 🟩 **Playwright 独有参数**

| 参数         | 类型                      | 注释      |
| ---------- | ----------------------- | ------- |
| animations | `'disabled' \| 'allow'` | 是否禁用动画  |
| caret      | `'hide' \| 'initial'`   | 文本光标行为  |
| mask       | `Array<Locator>`        | 遮罩元素    |
| maskColor  | `string`                | 遮罩颜色    |
| scale      | `'css' \| 'device'`     | 像素缩放方式  |
| style      | `string`                | 注入样式表   |
| timeout    | `number`                | 截图超时    |
| type（差异）   | 少一个 webp                | 见上方差异说明 |

---

# 🎯 **三、快速差异总结**

| 对比项          | Puppeteer                 | Playwright        |
| ------------ | ------------------------- | ----------------- |
| 图像类型         | png, jpeg, webp           | png, jpeg         |
| 视口外截图        | ✔ captureBeyondViewport   | ❌ 无对应             |
| 编码方式         | ✔ encoding(base64/binary) | ❌ 自动处理            |
| 动画控制         | ❌ 无                       | ✔ animations      |
| 文本光标隐藏       | ❌ 无                       | ✔ caret           |
| 遮罩元素         | ❌ 无                       | ✔ mask, maskColor |
| 注入样式         | ❌ 无                       | ✔ style           |
| clip 的 scale | ✔ 有                       | ❌ 无               |
| 截图超时         | ❌ 无                       | ✔ timeout         |

---

## snapka
