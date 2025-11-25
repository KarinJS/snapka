import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs'
import { getCurrentPlatform } from '../utils/platform'

import type { PlatformValue } from './types'

/**
 * 从环境变量PATH中查找Brave浏览器
 */
const findBraveFromPath = (): string[] => {
  try {
    const envPath = process.env.PATH || ''
    const pathDirs = envPath.split(path.delimiter).filter(Boolean)
    const platform = os.platform()
    const executableNames = platform === 'win32' ? ['brave.exe'] : ['brave-browser', 'brave']
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
 * 获取Brave浏览器的所有可能安装路径（包括常用路径、PATH环境变量）
 * @param platform 平台类型
 * @return 所有可能的Brave浏览器安装路径数组
 */
export const findBraveAll = (platform: PlatformValue = getCurrentPlatform()): string[] => {
  const results = new Set<string>()

  // 1. 检查默认路径
  const candidate = findBrave(platform)
  if (candidate && isExecutable(candidate)) {
    results.add(candidate.replace(/\\/g, '/'))
  }

  // 2. Windows额外路径
  if (platform === 'win32' || platform === 'win64') {
    const extraPaths = [
      path.join(process.env['PROGRAMFILES(X86)'] || '', 'BraveSoftware/Brave-Browser/Application/brave.exe'),
      path.join(process.env['LOCALAPPDATA'] || '', 'BraveSoftware/Brave-Browser/Application/brave.exe'),
    ]
    for (const extraPath of extraPaths) {
      if (isExecutable(extraPath)) {
        results.add(extraPath.replace(/\\/g, '/'))
      }
    }
  }

  // 3. Linux额外路径
  if (platform === 'linux' || platform === 'linux_arm') {
    const linuxPath = '/usr/bin/brave'
    if (isExecutable(linuxPath)) {
      results.add(linuxPath)
    }
  }

  // 4. 从PATH环境变量查找
  const envPaths = findBraveFromPath()
  for (const browserPath of envPaths) {
    if (isExecutable(browserPath)) {
      results.add(browserPath.replace(/\\/g, '/'))
    }
  }

  return Array.from(results)
}

/**
 * 获取Brave浏览器的单个安装路径
 * @param platform 平台类型
 */
export const findBrave = (platform: PlatformValue = getCurrentPlatform()): string => {
  switch (platform) {
    case 'win32':
    case 'win64':
      return path.join(process.env['PROGRAMFILES'] || '', 'BraveSoftware/Brave-Browser/Application/brave.exe')
    case 'darwin':
    case 'darwin_arm':
      return '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'
    case 'linux':
    case 'linux_arm':
      return '/usr/bin/brave-browser'
  }
  return ''
}
