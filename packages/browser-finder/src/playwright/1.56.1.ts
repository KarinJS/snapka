import path from 'node:path'

const EXECUTABLE_PATHS = {
  chromium: {
    linux: ['chrome-linux', 'chrome'],
    mac: ['chrome-mac', 'Chromium.app', 'Contents', 'MacOS', 'Chromium'],
    win: ['chrome-win', 'chrome.exe'],
  },
  'chromium-headless-shell': {
    linux: ['chrome-linux', 'headless_shell'],
    mac: ['chrome-mac', 'headless_shell'],
    win: ['chrome-win', 'headless_shell.exe'],
  },
  firefox: {
    linux: ['firefox', 'firefox'],
    mac: ['firefox', 'Nightly.app', 'Contents', 'MacOS', 'firefox'],
    win: ['firefox', 'firefox.exe'],
  },
  webkit: {
    linux: ['pw_run.sh'],
    mac: ['pw_run.sh'],
    win: ['Playwright.exe'],
  },
}
export const findExecutablePath = (dir: string, name: keyof typeof EXECUTABLE_PATHS) => {
  const shortPlatform = (() => {
    const platform = process.platform
    if (platform === 'linux') return 'linux'
    if (platform === 'darwin') return 'mac'
    if (platform === 'win32') return 'win'
  })()

  if (!shortPlatform) return shortPlatform
  const tokens = EXECUTABLE_PATHS[name][shortPlatform]
  return path.join(dir, ...tokens)
}
