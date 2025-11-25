import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'child_process'
import { getCurrentPlatform } from '../utils/platform'
import { ReleaseChannel, ReleaseChannelValue } from './types'

import type { PlatformValue } from './types'

/**
 * 从Windows注册表中查找Edge浏览器路径
 */
const findEdgeFromRegistry = (): string[] => {
  if (os.platform() !== 'win32') return []

  const keys = [
    'HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Windows\\CurrentVersion\\App Paths\\msedge.exe',
    'HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\App Paths\\msedge.exe',
  ]

  const results = new Set<string>()
  for (const key of keys) {
    try {
      const stdout = execFileSync(
        'reg',
        ['query', key, '/ve'],
        { windowsHide: true, timeout: 600, encoding: 'utf-8' }
      )
      const match = stdout?.toString().match(/REG_SZ\s+(.*)$/m)
      if (match && match[1]) {
        results.add(match[1].trim())
      }
    } catch {
      // 忽略错误
    }
  }

  return Array.from(results)
}

/**
 * 从环境变量PATH中查找Edge浏览器
 */
const findEdgeFromPath = (): string[] => {
  try {
    const envPath = process.env.PATH || ''
    const pathDirs = envPath.split(path.delimiter).filter(Boolean)
    const platform = os.platform()
    const executableNames = platform === 'win32' ? ['msedge.exe'] : ['msedge']
    const candidates = pathDirs.flatMap(dir => executableNames.map(browserName => path.join(dir, browserName)))
    const results = new Set<string>()

    for (const browserPath of candidates) {
      if (results.has(browserPath)) continue

      try {
        if (fs.existsSync(browserPath)) {
          fs.accessSync(browserPath, fs.constants.X_OK)
          results.add(browserPath)
        }
      } catch {
        // 忽略不可执行的文件
      }
    }

    return Array.from(results)
  } catch {
    return []
  }
}

/**
 * 检查路径是否可执行
 */
const isExecutable = (browserPath: string): boolean => {
  if (!fs.existsSync(browserPath)) return false
  try {
    fs.accessSync(browserPath, fs.constants.X_OK)
    return true
  } catch {
    return false
  }
}

/**
 * 获取Edge浏览器的所有可能安装路径（包括注册表、常用路径、系统默认浏览器）
 * @param platform 平台类型
 * @return 所有可能的Edge浏览器安装路径数组
 */
export const findEdgeAll = (platform: PlatformValue = getCurrentPlatform()): string[] => {
  const results = new Set<string>()

  // 1. 检查所有频道的默认路径
  for (const channel of Object.values(ReleaseChannel)) {
    const candidate = findEdge(platform, channel)
    if (candidate && isExecutable(candidate)) {
      results.add(candidate.replace(/\\/g, '/'))
    }
  }

  // 2. Windows额外路径（x86版本）
  if (platform === 'win32' || platform === 'win64') {
    const x86Path = path.join(process.env['PROGRAMFILES(X86)'] || '', 'Microsoft/Edge/Application/msedge.exe')
    if (isExecutable(x86Path)) {
      results.add(x86Path.replace(/\\/g, '/'))
    }
  }

  // 3. 从注册表查找（仅Windows）
  if (os.platform() === 'win32') {
    const registryPaths = findEdgeFromRegistry()
    for (const browserPath of registryPaths) {
      if (isExecutable(browserPath)) {
        results.add(browserPath.replace(/\\/g, '/'))
      }
    }
  }

  // 4. 从PATH环境变量查找
  const envPaths = findEdgeFromPath()
  for (const browserPath of envPaths) {
    if (isExecutable(browserPath)) {
      results.add(browserPath.replace(/\\/g, '/'))
    }
  }

  return Array.from(results)
}

/**
 * 获取Edge浏览器的单个安装路径
 * @param platform 平台类型
 * @param channel 发布渠道
 */
export const findEdge = (platform: PlatformValue = getCurrentPlatform(), channel: ReleaseChannelValue = ReleaseChannel.STABLE): string => {
  switch (platform) {
    case 'win32':
    case 'win64':
      switch (channel) {
        case ReleaseChannel.STABLE:
          return path.join(process.env['PROGRAMFILES'] || '', 'Microsoft/Edge/Application/msedge.exe')
        case ReleaseChannel.BETA:
          return path.join(process.env['PROGRAMFILES'] || '', 'Microsoft/Edge Beta/Application/msedge.exe')
        case ReleaseChannel.DEV:
          return path.join(process.env['PROGRAMFILES'] || '', 'Microsoft/Edge Dev/Application/msedge.exe')
        case ReleaseChannel.CANARY:
          return path.join(process.env['PROGRAMFILES(X86)'] || '', 'Microsoft/Edge SxS/Application/msedge.exe')
      }
      break
    case 'darwin':
    case 'darwin_arm':
      switch (channel) {
        case ReleaseChannel.STABLE:
          return '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'
        case ReleaseChannel.BETA:
          return '/Applications/Microsoft Edge Beta.app/Contents/MacOS/Microsoft Edge Beta'
        case ReleaseChannel.DEV:
          return '/Applications/Microsoft Edge Dev.app/Contents/MacOS/Microsoft Edge Dev'
        case ReleaseChannel.CANARY:
          return '/Applications/Microsoft Edge Canary.app/Contents/MacOS/Microsoft Edge Canary'
      }
      break
    case 'linux':
    case 'linux_arm':
      switch (channel) {
        case ReleaseChannel.STABLE:
          return '/opt/microsoft/msedge/msedge'
        case ReleaseChannel.BETA:
          return '/opt/microsoft/msedge-beta/msedge'
        case ReleaseChannel.DEV:
          return '/opt/microsoft/msedge-dev/msedge'
        case ReleaseChannel.CANARY:
          return '/opt/microsoft/msedge-canary/msedge'
      }
      break
  }
  return ''
}
