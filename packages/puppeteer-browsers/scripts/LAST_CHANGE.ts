export enum BrowserPlatform {
  LINUX = 'linux',
  LINUX_ARM = 'linux_arm',
  MAC = 'mac',
  MAC_ARM = 'mac_arm',
  WIN32 = 'win32',
  WIN64 = 'win64',
}

function folder (platform: BrowserPlatform): string {
  switch (platform) {
    case BrowserPlatform.LINUX_ARM:
    case BrowserPlatform.LINUX:
      return 'Linux_x64'
    case BrowserPlatform.MAC_ARM:
      return 'Mac_Arm'
    case BrowserPlatform.MAC:
      return 'Mac'
    case BrowserPlatform.WIN32:
      return 'Win'
    case BrowserPlatform.WIN64:
      return 'Win_x64'
  }
}

const baseUrl = 'https://storage.googleapis.com/chromium-browser-snapshots/<platform>/LAST_CHANGE'

let text = `
switch (platform) {
  case BrowserPlatform.LINUX_ARM:
  case BrowserPlatform.LINUX:
    return '<linux>'
  case BrowserPlatform.MAC_ARM:
    return '<mac_arm>'
  case BrowserPlatform.MAC:
    return '<mac>'
  case BrowserPlatform.WIN32:
    return '<win32>'
  case BrowserPlatform.WIN64:
    return '<win64>'
}
`

async function main () {
  for (const platform of [
    BrowserPlatform.LINUX,
    BrowserPlatform.LINUX_ARM,
    BrowserPlatform.MAC,
    BrowserPlatform.MAC_ARM,
    BrowserPlatform.WIN32,
    BrowserPlatform.WIN64,
  ]) {
    const url = baseUrl.replace('<platform>', folder(platform))
    const result = await fetch(url).then(res => res.text())
    text = text.replace(new RegExp(`<${platform}>`, 'g'), result)
  }

  console.log(text)
}

main()
