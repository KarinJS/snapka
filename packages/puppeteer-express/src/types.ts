import type { SnapkaScreenshotOptions, SnapkaScreenshotViewportOptions } from '@snapka/types'

/**
 * API 响应状态码
 */
export enum StatusCode {
  /** 成功 */
  SUCCESS = 200,
  /** 参数错误 */
  BAD_REQUEST = 400,
  /** 服务器内部错误 */
  INTERNAL_ERROR = 500,
}

/**
 * 标准 API 响应格式
 */
export interface ApiResponse<T = any> {
  /** 状态码 */
  status: StatusCode
  /** 响应消息 */
  message: string
  /** 响应数据 */
  data?: T
  /** 错误详情 */
  error?: string
}

/**
 * 截图响应数据
 */
export interface ScreenshotData {
  /** base64编码的图片数据 */
  image: string
  /** 图片类型 */
  type: 'png' | 'jpeg' | 'webp'
}

/**
 * 分片截图响应数据
 */
export interface ScreenshotViewportData {
  /** base64编码的图片数据数组 */
  images: string[]
  /** 图片类型 */
  type: 'png' | 'jpeg' | 'webp'
  /** 分片数量 */
  count: number
}

/**
 * POST 请求体 - 普通截图
 */
export interface ScreenshotPostBody extends Omit<SnapkaScreenshotOptions<'base64'>, 'encoding'> {
  /** 是否返回流，默认false返回JSON */
  stream?: boolean
}

/**
 * POST 请求体 - 分片截图
 */
export interface ScreenshotViewportPostBody extends Omit<SnapkaScreenshotViewportOptions<'base64'>, 'encoding'> {
  /** 分片截图不支持stream模式，始终返回JSON */
  stream?: never
}

/**
 * GET 请求查询参数 - 普通截图
 */
export interface ScreenshotGetQuery {
  /** 页面URL */
  file: string
  /** 截图类型 */
  type?: 'png' | 'jpeg' | 'webp'
  /** 图片质量 0-100 */
  quality?: string
  /** 是否全页截图 */
  fullPage?: string
  /** 选择器 */
  selector?: string
  /** 是否返回流 */
  stream?: string
  /** 其他可选参数... */
  [key: string]: string | undefined
}

/**
 * GET 请求查询参数 - 分片截图
 */
export interface ScreenshotViewportGetQuery extends ScreenshotGetQuery {
  /** 视口高度 */
  viewportHeight?: string
}
