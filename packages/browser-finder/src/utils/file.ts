import * as fs from 'fs'
import { execFile } from 'child_process'
import * as path from 'path'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

/**
 * 检查文件是否存在且可执行
 */
export async function isExecutable (filePath: string): Promise<boolean> {
  try {
    await fs.promises.access(filePath, fs.constants.X_OK)
    return true
  } catch {
    return false
  }
}

/**
 * 检查路径是否为文件夹
 */
export async function isDirectory (dirPath: string): Promise<boolean> {
  try {
    const stat = await fs.promises.stat(dirPath)
    return stat.isDirectory()
  } catch {
    return false
  }
}

/**
 * 从文件属性中获取版本信息(Windows)
 */
async function getVersionFromFileProperties (executablePath: string): Promise<string | undefined> {
  try {
    // 使用PowerShell获取文件版本信息，限制较小超时时间保证整体响应速度
    const { stdout } = await execFileAsync(
      'powershell',
      ['-NoProfile', '-Command', `(Get-Item '${executablePath.replace(/'/g, "''")}').VersionInfo.ProductVersion`],
      { timeout: 800, windowsHide: true }
    )
    const versionInfo = stdout?.toString().trim()
    return versionInfo || undefined
  } catch {
    return undefined
  }
}

/**
 * 从Linux系统中获取浏览器版本(不执行浏览器)
 */
async function getVersionFromLinux (executablePath: string): Promise<string | undefined> {
  try {
    const dirName = path.dirname(executablePath)

    const versionMatch = dirName.match(/(\d+\.\d+\.\d+(\.\d+)?)/)
    if (versionMatch) {
      return versionMatch[1]
    }

    try {
      const linkTarget = await fs.promises.readlink(executablePath)
      if (linkTarget) {
        const linkVersionMatch = linkTarget.match(/(\d+\.\d+\.\d+(\.\d+)?)/)
        if (linkVersionMatch) {
          return linkVersionMatch[1]
        }
      }
    } catch {
      // 不是符号链接或无法读取
    }

    return undefined
  } catch {
    return undefined
  }
}

/**
 * 从macOS系统中获取浏览器版本(不执行浏览器)
 */
async function getVersionFromMacOS (executablePath: string): Promise<string | undefined> {
  try {
    const appPath = executablePath.match(/(.+?)\.app/)
    if (appPath && appPath[1]) {
      const infoPlistPath = `${appPath[1]}.app/Contents/Info.plist`
      try {
        await fs.promises.access(infoPlistPath, fs.constants.R_OK)
        const { stdout } = await execFileAsync(
          'defaults',
          ['read', infoPlistPath, 'CFBundleShortVersionString'],
          { timeout: 800 }
        )
        const versionInfo = stdout?.toString().trim()
        if (versionInfo) {
          return versionInfo
        }
      } catch {
        // 忽略错误，返回undefined
      }
    }
    return undefined
  } catch {
    return undefined
  }
}

/**
 * 从文件名推断浏览器版本(不需要执行浏览器)
 */
export function getVersion (filePath: string): string | undefined {
  // This regex is designed to find version-like strings in a path.
  // It looks for patterns like 1.2.3, 1.2.3.4, 1.2-5, 1.2.3-alpha, etc.
  const versionRegex = /\d+\.\d+(?:[\.\-][\w\d\.]+)*(?:-[\w\d\.]*)?/g
  const matches = filePath.match(versionRegex)
  if (matches && matches.length > 0) {
    // Return the last match, as it's the most likely to be the correct version number
    return matches[matches.length - 1]
  }
  return undefined
}

export async function getBrowserVersion (executablePath: string): Promise<string | undefined> {
  try {
    await fs.promises.access(executablePath, fs.constants.R_OK)
  } catch {
    return undefined
  }

  try {
    switch (process.platform) {
      case 'win32':
        return await getVersionFromFileProperties(executablePath)
      case 'darwin':
        return await getVersionFromMacOS(executablePath)
      case 'linux':
        return await getVersionFromLinux(executablePath)
      default:
        return undefined
    }
  } catch {
    return undefined
  }
}

/**
 * 检查文件是否存在且可执行(同步版本)
 */
export function isExecutableSync (filePath: string): boolean {
  try {
    fs.accessSync(filePath, fs.constants.X_OK)
    return true
  } catch {
    return false
  }
}

/**
 * 检查路径是否为文件夹(同步版本)
 */
export function isDirectorySync (dirPath: string): boolean {
  try {
    const stat = fs.statSync(dirPath)
    return stat.isDirectory()
  } catch {
    return false
  }
}
