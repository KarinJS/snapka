/**
 * 浏览器发布渠道
 */
export const ReleaseChannel = {
  STABLE: 'stable',
  BETA: 'beta',
  DEV: 'dev',
  CANARY: 'canary',
} as const

/**
 * 浏览器发布渠道类型
 */
export type ReleaseChannelValue = typeof ReleaseChannel[keyof typeof ReleaseChannel]

/**
 * 平台类型
 */
export const Platform = {
  WIN32: 'win32',
  WIN64: 'win64',
  MAC: 'darwin',
  MAC_ARM: 'darwin_arm',
  LINUX: 'linux',
  LINUX_ARM: 'linux_arm',
} as const

/**
 * 平台类型
 */
export type PlatformValue = typeof Platform[keyof typeof Platform]
