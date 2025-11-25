/**
 * 路径工具函数
 */

/**
 * 规范化路径，将反斜杠转换为正斜杠
 * @param path 待规范化的路径
 * @returns 规范化后的路径
 */
export function normalizePath (path: string): string {
  return path.replaceAll('\\', '/')
}
