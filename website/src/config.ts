/** Keep in sync with root package.json version and GitHub release tags. */
export const APP_VERSION = '0.1.8'

export const GITHUB_REPO = 'amoghatelkar/markora'

export const RELEASES_PAGE = `https://github.com/${GITHUB_REPO}/releases`

export type OSType = 'mac' | 'windows' | 'linux' | 'unknown'

export interface DownloadOption {
  id: OSType
  label: string
  description: string
  fileName: string
  url: string
}

export function getDownloadOptions(version = APP_VERSION): DownloadOption[] {
  const tag = `v${version}`
  const base = `https://github.com/${GITHUB_REPO}/releases/download/${tag}`

  return [
    {
      id: 'mac',
      label: 'macOS',
      description: 'Apple Silicon & Intel · .dmg',
      fileName: `Markora-${version}.dmg`,
      url: `${base}/Markora-${version}.dmg`,
    },
    {
      id: 'windows',
      label: 'Windows',
      description: 'Windows 10+ · .exe installer',
      fileName: `Markora-Setup-${version}.exe`,
      url: `${base}/Markora-Setup-${version}.exe`,
    },
    {
      id: 'linux',
      label: 'Linux',
      description: 'AppImage · x64',
      fileName: `Markora-${version}.AppImage`,
      url: `${base}/Markora-${version}.AppImage`,
    },
  ]
}

export function detectOS(): OSType {
  const ua = navigator.userAgent.toLowerCase()
  const platform = navigator.platform?.toLowerCase() ?? ''

  if (platform.includes('mac') || ua.includes('mac')) return 'mac'
  if (platform.includes('win') || ua.includes('windows')) return 'windows'
  if (platform.includes('linux') || ua.includes('linux')) return 'linux'
  return 'unknown'
}
