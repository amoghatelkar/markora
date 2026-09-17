import { GITHUB_REPO, RELEASES_PAGE, type DownloadOption, type OSType } from './config'

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
  { label: string; description: string; match: (name: string) => boolean }
> = {
  mac: {
    label: 'macOS',
    description: 'Apple Silicon & Intel · .dmg',
    match: (name) => /\.dmg$/i.test(name),
  },
  windows: {
    label: 'Windows',
    description: 'Windows 10+ · .exe installer',
    match: (name) => /\.(exe|msi)$/i.test(name),
  },
  linux: {
    label: 'Linux',
    description: 'AppImage · x64',
    match: (name) => /\.appimage$/i.test(name),
  },
  unknown: {
    label: 'Download',
    description: '',
    match: () => false,
  },
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
    const downloads: DownloadOption[] = []

    for (const id of ['mac', 'windows', 'linux'] as OSType[]) {
      const asset = release.assets.find((a) => PLATFORM_META[id].match(a.name))
      if (asset) downloads.push(assetToOption(id, asset))
    }

    if (downloads.length === 0) return null

    const version = release.tag_name.replace(/^v/, '')
    return {
      downloads,
      version,
      releasesPage: release.html_url || RELEASES_PAGE,
    }
  } catch {
    return null
  }
}
