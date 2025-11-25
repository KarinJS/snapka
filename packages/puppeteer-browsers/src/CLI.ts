/**
 * @license
 * Copyright 2023 Google Inc.
 * SPDX-License-Identifier: Apache-2.0
 */

import { stdin as input, stdout as output } from 'node:process'
import * as readline from 'node:readline'

import type * as Yargs from 'yargs'

import {
  Browser,
  resolveBuildId,
  BrowserPlatform,
  type ChromeReleaseChannel,
} from './browser-data/browser-data.js'
import { Cache } from './Cache.js'
import { detectBrowserPlatform } from './detectPlatform.js'
import { install } from './install.js'
import {
  computeExecutablePath,
  computeSystemExecutablePath,
  launch,
} from './launch.js'

interface InstallBrowser {
  name: Browser
  buildId: string
}
interface InstallArgs {
  browser?: InstallBrowser
  path?: string
  platform?: BrowserPlatform
  baseUrl?: string
  installDeps?: boolean
}

function isValidBrowser (browser: unknown): browser is Browser {
  return Object.values(Browser).includes(browser as Browser)
}

function isValidPlatform (platform: unknown): platform is BrowserPlatform {
  return Object.values(BrowserPlatform).includes(platform as BrowserPlatform)
}

// If moved update release-please config
// x-release-please-start-version
const packageVersion = '2.10.13'
// x-release-please-end

/**
 * @public
 */
export class CLI {
  #cachePath: string
  #rl?: readline.Interface
  #scriptName: string
  #version: string
  #allowCachePathOverride: boolean
  #pinnedBrowsers?: Partial<
    Record<
      Browser,
      {
        buildId: string
        skipDownload: boolean
      }
    >
  >

  #prefixCommand?: { cmd: string; description: string }

  constructor (
    opts?:
      | string
      | {
        cachePath?: string
        scriptName?: string
        version?: string
        prefixCommand?: { cmd: string; description: string }
        allowCachePathOverride?: boolean
        pinnedBrowsers?: Partial<
          Record<
            Browser,
            {
              buildId: string
              skipDownload: boolean
            }
          >
        >
      },
    rl?: readline.Interface
  ) {
    if (!opts) {
      opts = {}
    }
    if (typeof opts === 'string') {
      opts = {
        cachePath: opts,
      }
    }
    this.#cachePath = opts.cachePath ?? process.cwd()
    this.#rl = rl
    this.#scriptName = opts.scriptName ?? '@snapka/browsers'
    this.#version = opts.version ?? packageVersion
    this.#allowCachePathOverride = opts.allowCachePathOverride ?? true
    this.#pinnedBrowsers = opts.pinnedBrowsers
    this.#prefixCommand = opts.prefixCommand
  }

  #defineBrowserParameter<T> (
    yargs: Yargs.Argv<T>,
    required: true,
  ): Yargs.Argv<T & { browser: InstallBrowser }>
  #defineBrowserParameter<T> (
    yargs: Yargs.Argv<T>,
    required: boolean,
  ): Yargs.Argv<T & { browser: InstallBrowser | undefined }>
  #defineBrowserParameter<T> (yargs: Yargs.Argv<T>, required: boolean) {
    return yargs.positional('browser', {
      description:
        '要安装的浏览器 <browser>[@<buildId|latest>]。`latest` 会尝试获取最新可用的构建，`buildId` 是浏览器特定的标识符（如版本号或修订号）。',
      type: 'string',
      coerce: (opt): InstallBrowser => {
        const browser: InstallBrowser = {
          name: this.#parseBrowser(opt),
          buildId: this.#parseBuildId(opt),
        }

        if (!isValidBrowser(browser.name)) {
          throw new Error(`不支持的浏览器 '${browser.name}'`)
        }

        return browser
      },
      demandOption: required,
    })
  }

  #definePlatformParameter<T> (yargs: Yargs.Argv<T>) {
    return yargs.option('platform', {
      type: 'string',
      desc: '二进制需要兼容的平台。',
      choices: Object.values(BrowserPlatform),
      default: detectBrowserPlatform(),
      coerce: platform => {
        if (!isValidPlatform(platform)) {
          throw new Error(`不支持的平台 '${platform}'`)
        }

        return platform
      },
      defaultDescription: '自动检测',
    })
  }

  #definePathParameter<T> (yargs: Yargs.Argv<T>, required = false) {
    if (!this.#allowCachePathOverride) {
      return yargs as Yargs.Argv<T & { path: undefined }>
    }

    return yargs.option('path', {
      type: 'string',
      desc: '浏览器下载和安装的根目录。如果提供相对路径，将基于当前工作目录解析。安装目录结构与 Puppeteer 的缓存结构兼容。',
      defaultDescription: '当前工作目录',
      ...(required ? {} : { default: process.cwd() }),
      demandOption: required,
    })
  }

  async run (argv: string[]): Promise<void> {
    const { default: yargs } = await import('yargs')
    const { hideBin } = await import('yargs/helpers')
    const yargsInstance = yargs(hideBin(argv))
    let target = yargsInstance
      .scriptName(this.#scriptName)
      .version(this.#version)
    if (this.#prefixCommand) {
      target = target.command(
        this.#prefixCommand.cmd,
        this.#prefixCommand.description,
        yargs => {
          return this.#build(yargs)
        }
      )
    } else {
      target = this.#build(target)
    }
    await target
      .demandCommand(1)
      .help()
      .wrap(Math.min(120, yargsInstance.terminalWidth()))
      .parseAsync()
  }

  #build (yargs: Yargs.Argv<unknown>) {
    const latestOrPinned = this.#pinnedBrowsers ? 'pinned' : 'latest'
    // If there are pinned browsers allow the positional arg to be optional
    const browserArgType = this.#pinnedBrowsers ? '[browser]' : '<browser>'
    return yargs
      .command(
        `install ${browserArgType}`,
        '下载并安装指定的浏览器。成功后输出实际安装的 buildId 以及浏览器可执行文件的绝对路径（格式：<browser>@<buildID> <path>）。',
        yargs => {
          if (this.#pinnedBrowsers) {
            yargs.example('$0 install', '安装所有已固定的浏览器版本')
          }
          yargs
            .example(
              '$0 install chrome',
              `安装 Chrome 浏览器的${latestOrPinned === 'latest' ? '最新' : '固定'}可用构建。`
            )
            .example(
              '$0 install chrome@latest',
              '安装 Chrome 浏览器的最新可用构建。'
            )
            .example(
              '$0 install chrome@stable',
              '安装 Chrome 稳定通道的最新可用构建。'
            )
            .example(
              '$0 install chrome@beta',
              '安装 Chrome 测试通道的最新可用构建。'
            )
            .example(
              '$0 install chrome@dev',
              '安装 Chrome 开发通道的最新可用构建。'
            )
            .example(
              '$0 install chrome@canary',
              '安装 Chrome Canary 浏览器的最新可用构建。'
            )
            .example(
              '$0 install chrome@115',
              '安装 Chrome 115 的最新可用构建。'
            )
            .example(
              '$0 install chromedriver@canary',
              '安装 ChromeDriver Canary 的最新可用构建。'
            )
            .example(
              '$0 install chromedriver@115',
              '安装 ChromeDriver 115 的最新可用构建。'
            )
            .example(
              '$0 install chromedriver@115.0.5790',
              '安装 ChromeDriver 115.0.5790.X 的最新可用补丁构建。'
            )
            .example(
              '$0 install chrome-headless-shell',
              '安装最新可用的 chrome-headless-shell 构建。'
            )
            .example(
              '$0 install chrome-headless-shell@beta',
              '安装对应测试通道的 chrome-headless-shell 最新可用构建。'
            )
            .example(
              '$0 install chrome-headless-shell@118',
              '安装 chrome-headless-shell 118 的最新可用构建。'
            )
            .example(
              '$0 install chromium@1083080',
              '安装 Chromium 浏览器修订版 1083080。'
            )
            .example(
              '$0 install firefox',
              '安装 Firefox 浏览器最新的 nightly 构建。'
            )
            .example(
              '$0 install firefox@stable',
              '安装 Firefox 浏览器最新的稳定版构建。'
            )
            .example(
              '$0 install firefox@beta',
              '安装 Firefox 浏览器最新的测试版构建。'
            )
            .example(
              '$0 install firefox@devedition',
              '安装 Firefox 浏览器最新的开发者版构建。'
            )
            .example(
              '$0 install firefox@esr',
              '安装 Firefox 浏览器最新的 ESR 构建。'
            )
            .example(
              '$0 install firefox@nightly',
              '安装 Firefox 浏览器最新的 nightly 构建。'
            )
            .example(
              '$0 install firefox@stable_111.0.1',
              '安装指定版本的 Firefox 浏览器。'
            )
            .example(
              '$0 install firefox --platform mac',
              '安装 Firefox 浏览器最新的 Mac（Intel）构建。'
            )
          if (this.#allowCachePathOverride) {
            yargs.example(
              '$0 install firefox --path /tmp/my-browser-cache',
              '安装到指定的缓存目录。'
            )
          }

          const yargsWithBrowserParam = this.#defineBrowserParameter(
            yargs,
            !this.#pinnedBrowsers
          )
          const yargsWithPlatformParam = this.#definePlatformParameter(
            yargsWithBrowserParam
          )
          return this.#definePathParameter(yargsWithPlatformParam, false)
            .option('base-url', {
              type: 'string',
              desc: '用于下载的基础 URL',
            })
            .option('install-deps', {
              type: 'boolean',
              desc: '是否尝试安装系统依赖（仅支持 Linux，且需要 root 权限）。',
              default: false,
            })
        },
        async args => {
          if (this.#pinnedBrowsers && !args.browser) {
            // Use allSettled to avoid scenarios that
            // a browser may fail early and leave the other
            // installation in a faulty state
            const result = await Promise.allSettled(
              Object.entries(this.#pinnedBrowsers).map(
                async ([browser, options]) => {
                  if (options.skipDownload) {
                    return
                  }
                  await this.#install({
                    ...args,
                    browser: {
                      name: browser as Browser,
                      buildId: options.buildId,
                    },
                  })
                }
              )
            )

            for (const install of result) {
              if (install.status === 'rejected') {
                throw install.reason
              }
            }
          } else {
            await this.#install(args)
          }
        }
      )
      .command(
        'launch <browser>',
        '启动指定的浏览器',
        yargs => {
          yargs
            .example(
              '$0 launch chrome@115.0.5790.170',
              '启动 Chrome 115.0.5790.170'
            )
            .example(
              '$0 launch firefox@112.0a1',
              '启动版本号为 112.0a1 的 Firefox 浏览器。'
            )
            .example(
              '$0 launch chrome@115.0.5790.170 --detached',
              '启动浏览器但让子进程以分离模式运行。'
            )
            .example(
              '$0 launch chrome@canary --system',
              '尝试查找系统已安装的 Chrome Canary 并启动。'
            )
            .example(
              '$0 launch chrome@115.0.5790.170 -- --version',
              '启动 Chrome 115.0.5790.170 并向二进制传递自定义参数。'
            )

          const yargsWithExtraAgs = yargs.parserConfiguration({
            'populate--': true,
            // Yargs does not have the correct overload for this.
          }) as Yargs.Argv<{ '--'?: Array<string | number> }>
          const yargsWithBrowserParam = this.#defineBrowserParameter(
            yargsWithExtraAgs,
            true
          )
          const yargsWithPlatformParam = this.#definePlatformParameter(
            yargsWithBrowserParam
          )
          return this.#definePathParameter(yargsWithPlatformParam)
            .option('detached', {
              type: 'boolean',
              desc: '让子进程以分离模式运行。',
              default: false,
            })
            .option('system', {
              type: 'boolean',
              desc: '优先查找系统已安装的浏览器，而不是缓存目录。',
              default: false,
            })
            .option('dumpio', {
              type: 'boolean',
              desc: '将浏览器进程的 stdout 和 stderr 转发到当前输出。',
              default: false,
            })
        },
        async args => {
          const extraArgs = args['--']?.filter(arg => {
            return typeof arg === 'string'
          })

          args.browser.buildId = this.#resolvePinnedBrowserIfNeeded(
            args.browser.buildId,
            args.browser.name
          )

          const executablePath = args.system
            ? computeSystemExecutablePath({
              browser: args.browser.name,
              // TODO: throw an error if not a ChromeReleaseChannel is provided.
              channel: args.browser.buildId as ChromeReleaseChannel,
              platform: args.platform,
            })
            : computeExecutablePath({
              browser: args.browser.name,
              buildId: args.browser.buildId,
              cacheDir: args.path ?? this.#cachePath,
              platform: args.platform,
            })
          launch({
            args: extraArgs,
            executablePath,
            dumpio: args.dumpio,
            detached: args.detached,
          })
        }
      )
      .command(
        'clear',
        this.#allowCachePathOverride
          ? '从指定的缓存目录中移除所有已安装的浏览器'
          : `从 ${this.#cachePath} 中移除所有已安装的浏览器`,
        yargs => {
          return this.#definePathParameter(yargs, true)
        },
        async args => {
          const cacheDir = args.path ?? this.#cachePath
          const rl = this.#rl ?? readline.createInterface({ input, output })
          rl.question(
            `确定要永久且递归地删除 ${cacheDir} 的内容吗？(yes/No)：`,
            answer => {
              rl.close()
              if (!['y', 'yes'].includes(answer.toLowerCase().trim())) {
                console.log('已取消。')
                return
              }
              const cache = new Cache(cacheDir)
              cache.clear()
              console.log(`已清理 ${cacheDir}。`)
            }
          )
        }
      )
      .command(
        'list',
        '列出缓存目录中已安装的所有浏览器',
        yargs => {
          yargs.example(
            '$0 list',
            '列出缓存目录中已安装的所有浏览器'
          )
          if (this.#allowCachePathOverride) {
            yargs.example(
              '$0 list --path /tmp/my-browser-cache',
              '列出指定缓存目录中已安装的浏览器'
            )
          }

          return this.#definePathParameter(yargs)
        },
        async args => {
          const cacheDir = args.path ?? this.#cachePath
          const cache = new Cache(cacheDir)
          const browsers = cache.getInstalledBrowsers()

          for (const browser of browsers) {
            console.log(
              `${browser.browser}@${browser.buildId} (${browser.platform}) ${browser.executablePath}`
            )
          }
        }
      )
      .demandCommand(1)
      .help()
  }

  #parseBrowser (version: string): Browser {
    return version.split('@').shift() as Browser
  }

  #parseBuildId (version: string): string {
    const parts = version.split('@')
    return parts.length === 2
      ? parts[1]!
      : this.#pinnedBrowsers
        ? 'pinned'
        : 'latest'
  }

  #resolvePinnedBrowserIfNeeded (buildId: string, browserName: Browser): string {
    if (buildId === 'pinned') {
      const options = this.#pinnedBrowsers?.[browserName]
      if (!options || !options.buildId) {
        throw new Error(`未找到 ${browserName} 的固定版本`)
      }
      return options.buildId
    }
    return buildId
  }

  async #install (args: InstallArgs) {
    if (!args.browser) {
      throw new Error('未提供浏览器参数')
    }
    if (!args.platform) {
      throw new Error('无法解析当前平台')
    }
    args.browser.buildId = this.#resolvePinnedBrowserIfNeeded(
      args.browser.buildId,
      args.browser.name
    )
    const originalBuildId = args.browser.buildId
    args.browser.buildId = await resolveBuildId(
      args.browser.name,
      args.platform,
      args.browser.buildId
    )
    await install({
      browser: args.browser.name,
      buildId: args.browser.buildId,
      platform: args.platform,
      cacheDir: args.path ?? this.#cachePath,
      downloadProgressCallback: 'default',
      baseUrl: args.baseUrl,
      buildIdAlias:
        originalBuildId !== args.browser.buildId ? originalBuildId : undefined,
      installDeps: args.installDeps,
    })
    console.log(
      `${args.browser.name}@${args.browser.buildId} ${computeExecutablePath({
        browser: args.browser.name,
        buildId: args.browser.buildId,
        cacheDir: args.path ?? this.#cachePath,
        platform: args.platform,
      })}`
    )
  }
}
