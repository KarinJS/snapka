/**
 * 查找浏览器返回结果
 */
export interface BrowserInfo {
  /**
   * 浏览器类型
   * - `webkit` 为 `playwright` 安装的 WebKit 浏览器
   * - `edge` `brave` 为系统安装的 Edge 和 Brave 浏览器
   * - `chromedriver` 为 ChromeDriver 驱动程序
   */
  type: 'chrome' | 'chromium' | 'chrome-headless-shell' | 'firefox' | 'webkit' | 'edge' | 'brave' | 'chromedriver'
  /**
   * 浏览器目录路径
   */
  dir: string
  /**
   * 浏览器版本号
   * @description 仅返回每个查找器内部的版本号，从路径中提取，可能不完整或不准确
   */
  version: string
  /**
   * 浏览器可执行文件路径
   */
  executablePath: string
}
