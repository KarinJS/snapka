/**
 * 检查值是否为有效的数字
 * @param value 要检查的值
 * @returns 如果值是有效的数字则返回 true，否则返回 false
 */
export const isNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value)
}

/**
 * 数组工具
 * @description 将输入转换为字符串数组
 * @param opt 输入值
 * @returns 字符串数组
 */
export const getArray = (opt?: unknown) => {
  if (!opt) return []
  if (Array.isArray(opt)) {
    return opt.filter(val => typeof val === 'string')
  }

  return typeof opt === 'string' ? [opt] : []
}

/**
 * 四舍五入取整
 * @param value 要取整的数字
 * @returns 取整后的数字
 */
export const toInteger = (value: number | unknown, defaultValue: number): number => {
  return isNumber(value) ? Math.round(value) : Math.round(defaultValue)
}
