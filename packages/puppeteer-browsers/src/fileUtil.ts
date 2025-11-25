/**
 * @license
 * Copyright 2023 Google Inc.
 * SPDX-License-Identifier: Apache-2.0
 */

import { spawnSync } from 'node:child_process'
import { mkdir, readdir } from 'node:fs/promises'
import * as path from 'node:path'
import decompress from 'decompress'

/**
 * @internal
 */
export async function unpackArchive (
  archivePath: string,
  folderPath: string
): Promise<void> {
  if (!path.isAbsolute(folderPath)) {
    folderPath = path.resolve(process.cwd(), folderPath)
  }
  if (archivePath.endsWith('.zip') || archivePath.endsWith('.tar.bz2') || archivePath.endsWith('.tar.xz')) {
    await decompress(archivePath, folderPath)
  } else if (archivePath.endsWith('.dmg')) {
    await mkdir(folderPath)
    await installDMG(archivePath, folderPath)
  } else if (archivePath.endsWith('.exe')) {
    // Firefox on Windows.
    const result = spawnSync(archivePath, [`/ExtractDir=${folderPath}`], {
      env: {
        __compat_layer: 'RunAsInvoker',
      },
    })
    if (result.status !== 0) {
      throw new Error(
        `Failed to extract ${archivePath} to ${folderPath}: ${result.output}`
      )
    }
  } else {
    throw new Error(`Unsupported archive format: ${archivePath}`)
  }
}

/**
 * @internal
 */
async function installDMG (dmgPath: string, folderPath: string): Promise<void> {
  const { stdout } = spawnSync('hdiutil', [
    'attach',
    '-nobrowse',
    '-noautoopen',
    dmgPath,
  ])

  const volumes = stdout.toString('utf8').match(/\/Volumes\/(.*)/m)
  if (!volumes) {
    throw new Error(`Could not find volume path in ${stdout}`)
  }
  const mountPath = volumes[0]!

  try {
    const fileNames = await readdir(mountPath)
    const appName = fileNames.find(item => {
      return typeof item === 'string' && item.endsWith('.app')
    })
    if (!appName) {
      throw new Error(`Cannot find app in ${mountPath}`)
    }
    const mountedPath = path.join(mountPath!, appName)

    spawnSync('cp', ['-R', mountedPath, folderPath])
  } finally {
    spawnSync('hdiutil', ['detach', mountPath, '-quiet'])
  }
}
