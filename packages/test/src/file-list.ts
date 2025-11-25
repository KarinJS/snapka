// 测试文件列表
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const htmlFiles = [
  path.resolve(__dirname, '../html/emoji-static.html'),
  path.resolve(__dirname, '../html/image-static.html'),
  path.resolve(__dirname, '../html/remote-css.html'),
  path.resolve(__dirname, '../html/static-basic.html'),
  path.resolve(__dirname, '../html/static-js-demo.html'),
]

export function toFileUrl (p: string) {
  return `file:///${p.replace(/\\/g, '/')}`
}
