import path from 'node:path'

const EXECUTABLE_PATHS = {
  chromium: {
    '<unknown>': undefined,
    'linux-x64': ['chrome-linux64', 'chrome'],
    'linux-arm64': ['chrome-linux', 'chrome'],  // non-cft build
    'mac-x64': ['chrome-mac-x64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'],
    'mac-arm64': ['chrome-mac-arm64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'],
    'win-x64': ['chrome-win64', 'chrome.exe'],
  },
  'chromium-headless-shell': {
    '<unknown>': undefined,
    'linux-x64': ['chrome-headless-shell-linux64', 'chrome-headless-shell'],
    'linux-arm64': ['chrome-linux', 'headless_shell'],  // non-cft build
    'mac-x64': ['chrome-headless-shell-mac-x64', 'chrome-headless-shell'],
    'mac-arm64': ['chrome-headless-shell-mac-arm64', 'chrome-headless-shell'],
    'win-x64': ['chrome-headless-shell-win64', 'chrome-headless-shell.exe'],
  },
  'chromium-tip-of-tree': {
    '<unknown>': undefined,
    'linux-x64': ['chrome-linux64', 'chrome'],
    'linux-arm64': ['chrome-linux', 'chrome'],  // non-cft build
    'mac-x64': ['chrome-mac-x64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'],
    'mac-arm64': ['chrome-mac-arm64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'],
    'win-x64': ['chrome-win64', 'chrome.exe'],
  },
  'chromium-tip-of-tree-headless-shell': {
    '<unknown>': undefined,
    'linux-x64': ['chrome-headless-shell-linux64', 'chrome-headless-shell'],
    'linux-arm64': ['chrome-linux', 'headless_shell'],  // non-cft build
    'mac-x64': ['chrome-headless-shell-mac-x64', 'chrome-headless-shell'],
    'mac-arm64': ['chrome-headless-shell-mac-arm64', 'chrome-headless-shell'],
    'win-x64': ['chrome-headless-shell-win64', 'chrome-headless-shell.exe'],
  },
  firefox: {
    '<unknown>': undefined,
    'linux-x64': ['firefox', 'firefox'],
    'linux-arm64': ['firefox', 'firefox'],
    'mac-x64': ['firefox', 'Nightly.app', 'Contents', 'MacOS', 'firefox'],
    'mac-arm64': ['firefox', 'Nightly.app', 'Contents', 'MacOS', 'firefox'],
    'win-x64': ['firefox', 'firefox.exe'],
  },
  webkit: {
    '<unknown>': undefined,
    'linux-x64': ['pw_run.sh'],
    'linux-arm64': ['pw_run.sh'],
    'mac-x64': ['pw_run.sh'],
    'mac-arm64': ['pw_run.sh'],
    'win-x64': ['Playwright.exe'],
  },
}

export const findExecutablePath = (dir: string, name: keyof typeof EXECUTABLE_PATHS) => {
  const shortPlatform = (() => {
    const platform = process.platform
    const arch = process.arch
    if (platform === 'linux' && arch === 'x64') return 'linux-x64'
    if (platform === 'linux' && arch === 'arm64') return 'linux-arm64'
    if (platform === 'darwin' && arch === 'x64') return 'mac-x64'
    if (platform === 'darwin' && arch === 'arm64') return 'mac-arm64'
    if (platform === 'win32' && arch === 'x64') return 'win-x64'
    return '<unknown>'
  })()

  const tokens = EXECUTABLE_PATHS[name][shortPlatform]
  return tokens ? path.join(dir, ...tokens) : undefined
}
