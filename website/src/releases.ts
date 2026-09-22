import { APP_VERSION, GITHUB_REPO, RELEASES_PAGE, type DownloadOption, type OSType } from './config'
import buildData from './release-data.json'

interface GitHubAsset {
  name: string
  browser_download_url: string
}

interface GitHubRelease {
  tag_name: string
  html_url: string
  assets: GitHubAsset[]
}

const PLATFORM_META: Record<
  OSType,
  { label: string; description: string }
> = {
  mac: {
    label: 'macOS',
    description: 'Apple Silicon & Intel · .dmg',
  },
  windows: {
    label: 'Windows',
    description: 'Windows 10+ · .exe installer',
  },
  linux: {
    label: 'Linux',
    description: 'AppImage · x64',
  },
  unknown: {
    label: 'Download',
    description: '',
  },
}

function pickWindowsAsset(assets: GitHubAsset[]): GitHubAsset | undefined {
  const setup = assets.find((a) => /setup/i.test(a.name) && /\.exe$/i.test(a.name))
  if (setup) return setup
  return assets.find(
    (a) =>
      /\.exe$/i.test(a.name) &&
      !/^elevate\.exe$/i.test(a.name) &&
      !/^markora\.exe$/i.test(a.name)
  )
}

function pickMacAsset(assets: GitHubAsset[]): GitHubAsset | undefined {
  return assets.find((a) => /\.dmg$/i.test(a.name))
}

function pickLinuxAsset(assets: GitHubAsset[]): GitHubAsset | undefined {
  return assets.find((a) => /\.appimage$/i.test(a.name))
}

function pickAsset(id: OSType, assets: GitHubAsset[]): GitHubAsset | undefined {
  switch (id) {
    case 'mac':
      return pickMacAsset(assets)
    case 'windows':
      return pickWindowsAsset(assets)
    case 'linux':
      return pickLinuxAsset(assets)
    default:
      return undefined
  }
}

function assetToOption(id: OSType, asset: GitHubAsset): DownloadOption {
  const meta = PLATFORM_META[id]
  return {
    id,
    label: meta.label,
    description: meta.description,
    fileName: asset.name,
    url: asset.browser_download_url,
  }
}

function fromAssets(
  assets: GitHubAsset[],
  version: string,
  releasesPage: string
): { downloads: DownloadOption[]; version: string; releasesPage: string } | null {
  const downloads: DownloadOption[] = []

  for (const id of ['mac', 'windows', 'linux'] as OSType[]) {
    const asset = pickAsset(id, assets)
    if (asset) downloads.push(assetToOption(id, asset))
  }

  if (downloads.length === 0) return null

  return { downloads, version, releasesPage }
}

export function getBuildTimeDownloads(): {
  downloads: DownloadOption[]
  version: string
  releasesPage: string
} | null {
  const release = buildData.release
  if (!release) return null

  const downloads: DownloadOption[] = []
  for (const id of ['mac', 'windows', 'linux'] as OSType[]) {
    const asset = release.assets[id]
    if (asset) downloads.push(assetToOption(id, asset))
  }

  if (downloads.length === 0) return null

  return {
    downloads,
    version: APP_VERSION,
    releasesPage: release.pageUrl,
  }
}

export async function fetchLatestDownloads(): Promise<{
  downloads: DownloadOption[]
  version: string
  releasesPage: string
} | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
      { headers: { Accept: 'application/vnd.github+json' } }
    )

    if (res.status === 404) return null
    if (!res.ok) return null

    const release = (await res.json()) as GitHubRelease
    const version = release.tag_name.replace(/^v/, '')

    return fromAssets(release.assets, version, release.html_url || RELEASES_PAGE)
  } catch {
    return null
  }
}

export async function resolveDownloads(): Promise<{
  downloads: DownloadOption[]
  version: string
  releasesPage: string
} | null> {
  const baked = getBuildTimeDownloads()
  if (baked) return baked
  return fetchLatestDownloads()
}
